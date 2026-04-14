<template>
  <div class="page-container">
    <div class="page-title">试驾管理</div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="stat in testDriveStats" :key="stat.label">
        <div class="stat-card-mini" :style="{ borderTop: `3px solid ${stat.color}` }">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <!-- 试驾预约 -->
      <el-tab-pane label="试驾预约" name="appointment">
        <div class="filter-bar">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px" />
          <el-select v-model="filterStatus" placeholder="状态" clearable style="width:120px">
            <el-option label="待进行" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="filterConsultant" placeholder="试驾顾问" clearable style="width:120px">
            <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
          </el-select>
        </div>

        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <el-button type="primary" @click="openAppointmentDialog">
            <el-icon><Plus /></el-icon> 新建预约
          </el-button>
        </div>

        <el-table :data="filteredAppointments" stripe border>
          <el-table-column prop="id" label="预约号" width="80" />
          <el-table-column prop="customerName" label="客户姓名" width="100" />
          <el-table-column prop="customerPhone" label="联系电话" width="130" />
          <el-table-column prop="modelName" label="试驾车型" min-width="180" show-overflow-tooltip />
          <el-table-column prop="appointmentDate" label="预约日期" width="110" align="center" />
          <el-table-column prop="appointmentTime" label="预约时间" width="80" align="center" />
          <el-table-column prop="consultant" label="试驾顾问" width="100" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTypeMap[row.status]" size="small">{{ statusLabelMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="plateNumber" label="试驾车牌" width="110" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="success" link size="small" @click="openFeedbackDialog(row)" v-if="row.status === 'pending'">完成反馈</el-button>
              <el-button type="primary" link size="small" @click="viewFeedback(row)" v-else>查看</el-button>
              <el-button type="danger" link size="small" @click="cancelAppointment(row.id)" v-if="row.status === 'pending'">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 试驾车辆 -->
      <el-tab-pane label="试驾车辆" name="vehicle">
        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <el-button type="primary" @click="openVehicleDialog">
            <el-icon><Plus /></el-icon> 添加试驾车
          </el-button>
        </div>
        <el-table :data="testDriveStore.testDriveVehicles" stripe border>
          <el-table-column prop="plateNumber" label="车牌号" width="120" />
          <el-table-column prop="modelName" label="车型" min-width="180" />
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="location" label="位置" width="100" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'available' ? 'success' : 'warning'" size="small">
                {{ row.status === 'available' ? '空闲' : '使用中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 试驾反馈 -->
      <el-tab-pane label="试驾反馈" name="feedback">
        <el-table :data="feedbackRecords" stripe border>
          <el-table-column prop="customerName" label="客户姓名" width="100" />
          <el-table-column prop="modelName" label="车型" min-width="180" />
          <el-table-column prop="testDate" label="试驾日期" width="110" align="center" />
          <el-table-column label="意向度" width="120" align="center">
            <template #default="{ row }">
              <el-rate v-model="row.intention" disabled show-score />
            </template>
          </el-table-column>
          <el-table-column prop="impressions" label="客户印象" min-width="200" show-overflow-tooltip />
          <el-table-column prop="concerns" label="关注点" min-width="150" show-overflow-tooltip />
          <el-table-column label="转化状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.converted ? 'success' : 'info'" size="small">
                {{ row.converted ? '已成交' : '跟进中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新建预约弹窗 -->
    <el-dialog v-model="appointmentDialogVisible" title="新建试驾预约" width="600px" destroy-on-close>
      <el-form :model="appointmentForm" :rules="appointmentRules" ref="appointmentFormRef" label-width="110px">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="appointmentForm.customerName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="customerPhone">
          <el-input v-model="appointmentForm.customerPhone" maxlength="11" />
        </el-form-item>
        <el-form-item label="试驾车型" prop="modelName">
          <el-select v-model="appointmentForm.modelName" style="width:100%">
            <el-option v-for="m in carModels" :key="m.id" :label="m.name" :value="m.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期" prop="appointmentDate">
          <el-date-picker v-model="appointmentForm.appointmentDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-select v-model="appointmentForm.appointmentTime" style="width:100%">
            <el-option label="09:00" value="09:00" />
            <el-option label="10:00" value="10:00" />
            <el-option label="11:00" value="11:00" />
            <el-option label="14:00" value="14:00" />
            <el-option label="15:00" value="15:00" />
            <el-option label="16:00" value="16:00" />
          </el-select>
        </el-form-item>
        <el-form-item label="试驾顾问">
          <el-select v-model="appointmentForm.consultant" style="width:100%">
            <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="试驾车辆">
          <el-select v-model="appointmentForm.vehicleId" style="width:100%">
            <el-option v-for="v in testDriveStore.availableVehicles" :key="v.id"
              :label="`${v.plateNumber} - ${v.modelName}`" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="appointmentForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAppointment">提交</el-button>
        <el-button @click="appointmentDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 试驾反馈弹窗 -->
    <el-dialog v-model="feedbackDialogVisible" title="试驾反馈" width="700px" destroy-on-close>
      <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackFormRef" label-width="110px">
        <el-form-item label="试驾日期" prop="testDate">
          <el-date-picker v-model="feedbackForm.testDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="试驾里程">
          <el-input-number v-model="feedbackForm.mileage" :min="0" :step="1" style="width:200px" />
          <span style="margin-left:8px">公里</span>
        </el-form-item>
        <el-form-item label="客户意向度" prop="intention">
          <el-rate v-model="feedbackForm.intention" show-score />
        </el-form-item>
        <el-form-item label="客户印象" prop="impressions">
          <el-input v-model="feedbackForm.impressions" type="textarea" :rows="3" placeholder="客户对车辆的评价和印象" />
        </el-form-item>
        <el-form-item label="关注点/疑虑">
          <el-input v-model="feedbackForm.concerns" type="textarea" :rows="2" placeholder="客户关注的问题或疑虑点" />
        </el-form-item>
        <el-form-item label="跟进建议">
          <el-input v-model="feedbackForm.suggestions" type="textarea" :rows="2" placeholder="下一步跟进建议" />
        </el-form-item>
        <el-form-item label="是否转化">
          <el-radio-group v-model="feedbackForm.converted">
            <el-radio :value="false">跟进中</el-radio>
            <el-radio :value="true">已成交</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
        <el-button @click="feedbackDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 添加试驾车辆弹窗 -->
    <el-dialog v-model="vehicleDialogVisible" title="添加试驾车辆" width="600px" destroy-on-close>
      <el-form :model="vehicleForm" :rules="vehicleRules" ref="vehicleFormRef" label-width="110px">
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="vehicleForm.plateNumber" />
        </el-form-item>
        <el-form-item label="车型" prop="modelName">
          <el-select v-model="vehicleForm.modelName" style="width:100%">
            <el-option v-for="m in carModels" :key="m.id" :label="m.name" :value="m.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIN码" prop="vin">
          <el-input v-model="vehicleForm.vin" maxlength="17" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="vehicleForm.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitVehicle">提交</el-button>
        <el-button @click="vehicleDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTestDriveStore } from '../stores/testDrive'
import { useVehicleStore } from '../stores/vehicle'
import { salesPersons } from '../mock/data'

const testDriveStore = useTestDriveStore()
const vehicleStore = useVehicleStore()

const activeTab = ref('appointment')
const dateRange = ref(null)
const filterStatus = ref('')
const filterConsultant = ref('')

const statusTypeMap = { pending: 'warning', completed: 'success', cancelled: 'info' }
const statusLabelMap = { pending: '待进行', completed: '已完成', cancelled: '已取消' }

const testDriveStats = computed(() => [
  { label: '今日预约', value: testDriveStore.todayAppointments.length, color: '#0066B1' },
  { label: '总预约数', value: testDriveStore.appointments.length, color: '#389e0d' },
  { label: '已完成', value: testDriveStore.conversionStats.completed, color: '#d48806' },
  { label: '转化率', value: testDriveStore.conversionStats.rate + '%', color: '#cf1322' }
])

const carModels = computed(() => vehicleStore.carModels)

const filteredAppointments = computed(() => {
  return testDriveStore.appointments.filter(a => {
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (filterConsultant.value && a.consultant !== filterConsultant.value) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      if (a.appointmentDate < start || a.appointmentDate > end) return false
    }
    return true
  })
})

const feedbackRecords = computed(() => testDriveStore.feedbackRecords)

// 预约弹窗
const appointmentDialogVisible = ref(false)
const appointmentFormRef = ref(null)
const appointmentForm = ref({ customerName: '', customerPhone: '', modelName: '', appointmentDate: '', appointmentTime: '', consultant: '', vehicleId: null, remark: '' })
const appointmentRules = { customerName: [{ required: true, message: '必填', trigger: 'blur' }], customerPhone: [{ required: true, message: '必填', trigger: 'blur' }], modelName: [{ required: true, message: '必填', trigger: 'change' }], appointmentDate: [{ required: true, message: '必填', trigger: 'change' }], appointmentTime: [{ required: true, message: '必填', trigger: 'change' }] }

function openAppointmentDialog() {
  appointmentForm.value = { customerName: '', customerPhone: '', modelName: '', appointmentDate: '', appointmentTime: '', consultant: '', vehicleId: null, remark: '' }
  appointmentDialogVisible.value = true
}

function submitAppointment() {
  appointmentFormRef.value?.validate((valid) => {
    if (!valid) return
    const vehicle = testDriveStore.testDriveVehicles.find(v => v.id === appointmentForm.value.vehicleId)
    testDriveStore.addAppointment({
      ...appointmentForm.value,
      plateNumber: vehicle?.plateNumber || ''
    })
    ElMessage.success('预约创建成功')
    appointmentDialogVisible.value = false
  })
}

function cancelAppointment(id) {
  ElMessageBox.confirm('确定取消该预约吗？', '提示', { type: 'warning' }).then(() => {
    testDriveStore.updateAppointment(id, { status: 'cancelled' })
    ElMessage.success('已取消')
  }).catch(() => {})
}

// 反馈弹窗
const feedbackDialogVisible = ref(false)
const feedbackFormRef = ref(null)
const currentAppointment = ref(null)
const feedbackForm = ref({ testDate: '', mileage: 5, intention: 3, impressions: '', concerns: '', suggestions: '', converted: false })
const feedbackRules = { testDate: [{ required: true, message: '必填', trigger: 'change' }], impressions: [{ required: true, message: '必填', trigger: 'blur' }] }

function openFeedbackDialog(row) {
  currentAppointment.value = row
  feedbackForm.value = { testDate: new Date().toISOString().slice(0, 10), mileage: 5, intention: 3, impressions: '', concerns: '', suggestions: '', converted: false }
  feedbackDialogVisible.value = true
}

function submitFeedback() {
  feedbackFormRef.value?.validate((valid) => {
    if (!valid) return
    testDriveStore.addFeedback({
      ...feedbackForm.value,
      appointmentId: currentAppointment.value.id,
      customerName: currentAppointment.value.customerName,
      modelName: currentAppointment.value.modelName
    })
    ElMessage.success('反馈已提交')
    feedbackDialogVisible.value = false
  })
}

function viewFeedback(row) {
  const feedback = feedbackRecords.value.find(f => f.appointmentId === row.id)
  if (feedback) {
    ElMessage.info(`试驾反馈：${feedback.impressions}`)
  } else {
    ElMessage.info('暂无反馈记录')
  }
}

// 试驾车辆弹窗
const vehicleDialogVisible = ref(false)
const vehicleFormRef = ref(null)
const vehicleForm = ref({ plateNumber: '', modelName: '', vin: '', location: '展厅' })
const vehicleRules = { plateNumber: [{ required: true, message: '必填', trigger: 'blur' }], modelName: [{ required: true, message: '必填', trigger: 'change' }], vin: [{ required: true, message: '必填', trigger: 'blur' }] }

function openVehicleDialog() {
  vehicleForm.value = { plateNumber: '', modelName: '', vin: '', location: '展厅' }
  vehicleDialogVisible.value = true
}

function submitVehicle() {
  vehicleFormRef.value?.validate((valid) => {
    if (!valid) return
    testDriveStore.addTestDriveVehicle({
      ...vehicleForm.value,
      status: 'available'
    })
    ElMessage.success('试驾车辆添加成功')
    vehicleDialogVisible.value = false
  })
}
</script>

<style scoped>
.stat-card-mini {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}
</style>
