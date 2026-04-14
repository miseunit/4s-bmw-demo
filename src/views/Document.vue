<template>
  <div class="page-container">
    <div class="page-title">证照管理</div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="stat in documentStats" :key="stat.label">
        <div class="stat-card-mini" :style="{ borderTop: `3px solid ${stat.color}` }">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <!-- 合格证管理 -->
      <el-tab-pane label="合格证管理" name="certificate">
        <div class="filter-bar">
          <el-input v-model="certSearch" placeholder="VIN码/车型" clearable style="width:200px" />
          <el-select v-model="certStatusFilter" placeholder="状态" clearable style="width:120px">
            <el-option label="在库" value="in_stock" />
            <el-option label="已出库" value="out" />
            <el-option label="借出" value="borrowed" />
          </el-select>
        </div>

        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <el-button type="primary" @click="openCertDialog">
            <el-icon><Plus /></el-icon> 新增合格证
          </el-button>
        </div>

        <el-table :data="filteredCertificates" stripe border>
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
          <el-table-column prop="certificateNo" label="合格证号" width="200" show-overflow-tooltip />
          <el-table-column prop="receiveDate" label="入库日期" width="110" align="center" />
          <el-table-column prop="location" label="存放位置" width="100" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="certStatusTypeMap[row.status]" size="small">{{ certStatusLabelMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="editCert(row)">编辑</el-button>
              <el-button type="success" link size="small" @click="unlockCert(row)" v-if="row.status === 'in_stock'">解锁出库</el-button>
              <el-button type="warning" link size="small" @click="borrowCert(row)" v-if="row.status === 'in_stock'">借阅</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 发票管理 -->
      <el-tab-pane label="发票管理" name="invoice">
        <div class="filter-bar">
          <el-date-picker v-model="invoiceDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px" />
          <el-select v-model="invoiceStatusFilter" placeholder="状态" clearable style="width:120px">
            <el-option label="正常" value="issued" />
            <el-option label="已作废" value="cancelled" />
            <el-option label="已红冲" value="reversed" />
          </el-select>
        </div>

        <el-table :data="filteredInvoices" stripe border>
          <el-table-column prop="id" label="发票号" width="150" />
          <el-table-column prop="buyerName" label="购买方" width="100" />
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column label="金额" width="130" align="right">
            <template #default="{ row }"><span class="money">¥{{ row.amount.toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column prop="invoiceType" label="发票类型" width="180" />
          <el-table-column prop="issueDate" label="开票日期" width="110" align="center" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="invoiceStatusTypeMap[row.status]" size="small">{{ invoiceStatusLabelMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link size="small" @click="cancelInvoice(row)" v-if="row.status === 'issued'">作废</el-button>
              <el-button type="warning" link size="small" @click="reverseInvoice(row)" v-if="row.status === 'issued'">红冲</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 到期提醒 -->
      <el-tab-pane label="到期提醒" name="expiry">
        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <el-button type="primary" @click="openExpiryDialog">
            <el-icon><Plus /></el-icon> 新增提醒
          </el-button>
        </div>

        <el-table :data="expiryAlerts" stripe border>
          <el-table-column prop="documentType" label="证照类型" width="150" />
          <el-table-column prop="vin" label="关联车辆" width="180" show-overflow-tooltip />
          <el-table-column prop="documentNo" label="证照号码" width="180" show-overflow-tooltip />
          <el-table-column prop="expiryDate" label="到期日期" width="110" align="center">
            <template #default="{ row }">
              <span :class="isExpiringSoon(row.expiryDate) ? 'text-danger' : ''">{{ row.expiryDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="剩余天数" width="100" align="center">
            <template #default="{ row }">{{ getDaysRemaining(row.expiryDate) }} 天</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="editExpiry(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="deleteExpiry(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 借阅记录 -->
      <el-tab-pane label="借阅记录" name="borrowing">
        <el-table :data="borrowingRecords" stripe border>
          <el-table-column prop="documentType" label="证照类型" width="150" />
          <el-table-column prop="documentNo" label="证照号码" width="180" show-overflow-tooltip />
          <el-table-column prop="borrower" label="借阅人" width="100" />
          <el-table-column prop="borrowDate" label="借阅日期" width="110" align="center" />
          <el-table-column prop="returnDate" label="归还日期" width="110" align="center" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'borrowed' ? 'warning' : 'success'" size="small">
                {{ row.status === 'borrowed' ? '借出中' : '已归还' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="success" link size="small" @click="returnDocument(row.id)" v-if="row.status === 'borrowed'">归还</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 合格证弹窗 -->
    <el-dialog v-model="certDialogVisible" title="合格证信息" width="600px" destroy-on-close>
      <el-form :model="certForm" :rules="certRules" ref="certFormRef" label-width="110px">
        <el-form-item label="关联车辆" prop="vin">
          <el-select v-model="certForm.vin" style="width:100%" @change="onVehicleChange">
            <el-option v-for="v in vehicles" :key="v.vin" :label="`${v.vin} - ${v.modelName}`" :value="v.vin" />
          </el-select>
        </el-form-item>
        <el-form-item label="车型">
          <span>{{ certForm.modelName }}</span>
        </el-form-item>
        <el-form-item label="合格证号" prop="certificateNo">
          <el-input v-model="certForm.certificateNo" />
        </el-form-item>
        <el-form-item label="入库日期" prop="receiveDate">
          <el-date-picker v-model="certForm.receiveDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-select v-model="certForm.location" style="width:100%">
            <el-option label="财务室" value="财务室" />
            <el-option label="档案室" value="档案室" />
            <el-option label="保险柜" value="保险柜" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="certForm.status" style="width:100%">
            <el-option label="在库" value="in_stock" />
            <el-option label="已出库" value="out" />
            <el-option label="借出" value="borrowed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitCert">提交</el-button>
        <el-button @click="certDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 借阅弹窗 -->
    <el-dialog v-model="borrowDialogVisible" title="证照借阅" width="500px" destroy-on-close>
      <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="110px">
        <el-form-item label="借阅人" prop="borrower">
          <el-input v-model="borrowForm.borrower" />
        </el-form-item>
        <el-form-item label="借阅部门">
          <el-input v-model="borrowForm.department" />
        </el-form-item>
        <el-form-item label="预计归还">
          <el-date-picker v-model="borrowForm.expectedReturn" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="借阅原因">
          <el-input v-model="borrowForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitBorrow">确认借阅</el-button>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 到期提醒弹窗 -->
    <el-dialog v-model="expiryDialogVisible" title="到期提醒" width="600px" destroy-on-close>
      <el-form :model="expiryForm" :rules="expiryRules" ref="expiryFormRef" label-width="110px">
        <el-form-item label="证照类型" prop="documentType">
          <el-select v-model="expiryForm.documentType" style="width:100%">
            <el-option label="临时牌照" value="临牌" />
            <el-option label="交强险" value="交强险" />
            <el-option label="商业险" value="商业险" />
            <el-option label="年检" value="年检" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联车辆">
          <el-select v-model="expiryForm.vin" style="width:100%">
            <el-option v-for="v in vehicles" :key="v.vin" :label="`${v.vin} - ${v.modelName}`" :value="v.vin" />
          </el-select>
        </el-form-item>
        <el-form-item label="证照号码">
          <el-input v-model="expiryForm.documentNo" />
        </el-form-item>
        <el-form-item label="到期日期" prop="expiryDate">
          <el-date-picker v-model="expiryForm.expiryDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="expiryForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitExpiry">提交</el-button>
        <el-button @click="expiryDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDocumentStore } from '../stores/document'
import { useVehicleStore } from '../stores/vehicle'

const documentStore = useDocumentStore()
const vehicleStore = useVehicleStore()

const activeTab = ref('certificate')
const certSearch = ref('')
const certStatusFilter = ref('')
const invoiceDateRange = ref(null)
const invoiceStatusFilter = ref('')

const certStatusTypeMap = { in_stock: 'success', out: 'info', borrowed: 'warning' }
const certStatusLabelMap = { in_stock: '在库', out: '已出库', borrowed: '借出' }
const invoiceStatusTypeMap = { issued: 'success', cancelled: 'danger', reversed: 'warning' }
const invoiceStatusLabelMap = { issued: '正常', cancelled: '已作废', reversed: '已红冲' }

const vehicles = computed(() => vehicleStore.vehicles)

const documentStats = computed(() => [
  { label: '合格证在库', value: documentStore.certificates.filter(c => c.status === 'in_stock').length, color: '#0066B1' },
  { label: '即将到期', value: documentStore.upcomingExpiries.length, color: '#d48806' },
  { label: '已过期', value: documentStore.expiredDocuments.length, color: '#cf1322' },
  { label: '借出中', value: documentStore.borrowedDocuments.length, color: '#389e0d' }
])

const filteredCertificates = computed(() => {
  return documentStore.certificates.filter(c => {
    if (certSearch.value && !c.vin.includes(certSearch.value) && !c.modelName.includes(certSearch.value)) return false
    if (certStatusFilter.value && c.status !== certStatusFilter.value) return false
    return true
  })
})

const filteredInvoices = computed(() => {
  return documentStore.invoices.filter(i => {
    if (invoiceStatusFilter.value && i.status !== invoiceStatusFilter.value) return false
    if (invoiceDateRange.value && invoiceDateRange.value.length === 2) {
      const [start, end] = invoiceDateRange.value
      if (i.issueDate < start || i.issueDate > end) return false
    }
    return true
  })
})

const expiryAlerts = computed(() => documentStore.expiryAlerts)
const borrowingRecords = computed(() => documentStore.borrowingRecords)

function isExpiringSoon(date) {
  if (!date) return false
  const days = getDaysRemaining(date)
  return days <= 30 && days >= 0
}

function getDaysRemaining(date) {
  if (!date) return 0
  const diff = new Date(date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 合格证操作
const certDialogVisible = ref(false)
const certFormRef = ref(null)
const editingCert = ref(null)
const certForm = ref({ vin: '', modelName: '', certificateNo: '', receiveDate: '', location: '财务室', status: 'in_stock' })
const certRules = { vin: [{ required: true, message: '必填', trigger: 'change' }], certificateNo: [{ required: true, message: '必填', trigger: 'blur' }], receiveDate: [{ required: true, message: '必填', trigger: 'change' }] }

function openCertDialog() {
  certForm.value = { vin: '', modelName: '', certificateNo: '', receiveDate: '', location: '财务室', status: 'in_stock' }
  editingCert.value = null
  certDialogVisible.value = true
}

function onVehicleChange() {
  const vehicle = vehicles.value.find(v => v.vin === certForm.value.vin)
  if (vehicle) {
    certForm.value.modelName = vehicle.modelName
  }
}

function submitCert() {
  certFormRef.value?.validate((valid) => {
    if (!valid) return
    if (editingCert.value) {
      documentStore.updateCertificate(editingCert.value, certForm.value)
      ElMessage.success('更新成功')
    } else {
      documentStore.addCertificate(certForm.value)
      ElMessage.success('添加成功')
    }
    certDialogVisible.value = false
  })
}

function editCert(row) {
  certForm.value = { ...row }
  editingCert.value = row.id
  certDialogVisible.value = true
}

function unlockCert(row) {
  ElMessageBox.confirm('确定解锁该合格证吗？解锁后可出库', '提示', { type: 'warning' }).then(() => {
    documentStore.updateCertificate(row.id, { status: 'out' })
    ElMessage.success('已解锁')
  }).catch(() => {})
}

// 借阅操作
const borrowDialogVisible = ref(false)
const borrowFormRef = ref(null)
const currentBorrowCert = ref(null)
const borrowForm = ref({ borrower: '', department: '', expectedReturn: '', reason: '' })
const borrowRules = { borrower: [{ required: true, message: '必填', trigger: 'blur' }] }

function borrowCert(row) {
  currentBorrowCert.value = row
  borrowForm.value = { borrower: '', department: '', expectedReturn: '', reason: '' }
  borrowDialogVisible.value = true
}

function submitBorrow() {
  borrowFormRef.value?.validate((valid) => {
    if (!valid) return
    documentStore.addBorrowingRecord({
      documentType: '合格证',
      documentNo: currentBorrowCert.value.certificateNo,
      ...borrowForm.value
    })
    documentStore.updateCertificate(currentBorrowCert.value.id, { status: 'borrowed' })
    ElMessage.success('借阅成功')
    borrowDialogVisible.value = false
  })
}

// 发票操作
function cancelInvoice(row) {
  ElMessageBox.prompt('请输入作废原因', '作废发票', { inputPattern: /.+/, inputErrorMessage: '必填' }).then(({ value }) => {
    documentStore.updateInvoice(row.id, { status: 'cancelled', cancelReason: value })
    ElMessage.success('已作废')
  }).catch(() => {})
}

function reverseInvoice(row) {
  ElMessageBox.prompt('请输入红冲原因', '红冲发票', { inputPattern: /.+/, inputErrorMessage: '必填' }).then(({ value }) => {
    documentStore.updateInvoice(row.id, { status: 'reversed', cancelReason: value })
    ElMessage.success('已红冲')
  }).catch(() => {})
}

// 到期提醒
const expiryDialogVisible = ref(false)
const expiryFormRef = ref(null)
const editingExpiry = ref(null)
const expiryForm = ref({ documentType: '', vin: '', documentNo: '', expiryDate: '', remark: '' })
const expiryRules = { documentType: [{ required: true, message: '必填', trigger: 'change' }], expiryDate: [{ required: true, message: '必填', trigger: 'change' }] }

function openExpiryDialog() {
  expiryForm.value = { documentType: '', vin: '', documentNo: '', expiryDate: '', remark: '' }
  editingExpiry.value = null
  expiryDialogVisible.value = true
}

function submitExpiry() {
  expiryFormRef.value?.validate((valid) => {
    if (!valid) return
    documentStore.addExpiryAlert(expiryForm.value)
    ElMessage.success('添加成功')
    expiryDialogVisible.value = false
  })
}

function editExpiry(row) {
  expiryForm.value = { ...row }
  editingExpiry.value = row.id
  expiryDialogVisible.value = true
}

function deleteExpiry(id) {
  ElMessageBox.confirm('确定删除该提醒吗？', '提示', { type: 'warning' }).then(() => {
    const idx = documentStore.expiryAlerts.findIndex(a => a.id === id)
    if (idx !== -1) {
      documentStore.expiryAlerts.splice(idx, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 借阅归还
function returnDocument(id) {
  documentStore.returnDocument(id)
  ElMessage.success('归还成功')
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

.text-danger {
  color: #cf1322;
}
</style>
