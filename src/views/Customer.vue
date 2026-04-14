<template>
  <div class="page-container">
    <div class="page-title">客户管理</div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="stat in customerStats" :key="stat.label">
        <div class="stat-card-mini" :style="{ borderTop: `3px solid ${stat.color}` }">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="姓名/手机号" clearable style="width: 180px" />
      <el-select v-model="filterCategory" placeholder="客户分类" clearable style="width: 130px">
        <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="filterTag" placeholder="客户标签" clearable style="width: 130px">
        <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select v-model="filterSalesPerson" placeholder="销售顾问" clearable style="width: 120px">
        <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
      </el-select>
    </div>

    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openCustomerDialog">
        <el-icon><Plus /></el-icon> 新建客户档案
      </el-button>
    </div>

    <!-- 客户列表 -->
    <el-table :data="filteredCustomers" stripe border :row-class-name="getRowClassName">
      <el-table-column prop="name" label="客户姓名" width="100" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column label="客户分类" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="categoryTypeMap[row.category]" size="small">
            {{ categoryLabelMap[row.category] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" size="small" :type="crmStore.tagColorMap[tag]" style="margin-right:4px;">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="客户来源" width="100" />
      <el-table-column prop="salesPerson" label="销售顾问" width="100" />
      <el-table-column label="购车次数" width="90" align="center">
        <template #default="{ row }">{{ row.purchaseHistory?.length || 0 }} 次</template>
      </el-table-column>
      <el-table-column prop="lastFollowDate" label="最后跟进" width="110" align="center" />
      <el-table-column prop="nextFollowDate" label="下次跟进" width="110" align="center">
        <template #default="{ row }">
          <span :class="isOverdue(row.nextFollowDate) ? 'text-danger' : ''">
            {{ row.nextFollowDate || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          <el-button type="success" link size="small" @click="openFollowDialog(row)">跟进</el-button>
          <el-button type="warning" link size="small" @click="editCustomer(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteCustomer(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 客户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="客户详情" width="900px" destroy-on-close>
      <el-tabs v-if="selectedCustomer">
        <el-tab-pane label="基本信息">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="客户姓名">{{ selectedCustomer.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ selectedCustomer.phone }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ selectedCustomer.idCard }}</el-descriptions-item>
            <el-descriptions-item label="客户地址">{{ selectedCustomer.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="客户分类">
              <el-tag :type="categoryTypeMap[selectedCustomer.category]" size="small">
                {{ categoryLabelMap[selectedCustomer.category] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户来源">{{ selectedCustomer.source }}</el-descriptions-item>
            <el-descriptions-item label="销售顾问">{{ selectedCustomer.salesPerson }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(selectedCustomer.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag v-for="tag in selectedCustomer.tags" :key="tag" :type="crmStore.tagColorMap[tag]" style="margin-right:4px;">
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ selectedCustomer.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="购车历史">
          <el-table :data="selectedCustomer.purchaseHistory" size="small" stripe border>
            <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
            <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
            <el-table-column label="成交价" width="120" align="right">
              <template #default="{ row }"><span class="money">¥{{ row.salePrice.toLocaleString() }}</span></template>
            </el-table-column>
            <el-table-column prop="saleDate" label="购车日期" width="110" align="center" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="跟进记录">
          <div style="margin-bottom:12px;">
            <el-button type="primary" size="small" @click="openFollowDialog(selectedCustomer)">
              <el-icon><Plus /></el-icon> 新增跟进
            </el-button>
          </div>
          <el-timeline>
            <el-timeline-item v-for="record in customerFollowRecords" :key="record.id"
              :timestamp="record.followDate" placement="top">
              <el-card>
                <div><strong>跟进方式：</strong>{{ record.method }}</div>
                <div><strong>跟进内容：</strong>{{ record.content }}</div>
                <div v-if="record.nextFollowDate"><strong>下次跟进：</strong>{{ record.nextFollowDate }}</div>
                <div><strong>意向度：</strong>
                  <el-rate v-model="record.intention" disabled show-score />
                </div>
                <div style="margin-top:8px;color:#999;font-size:12px;">记录人：{{ record.salesPerson }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新建/编辑客户弹窗 -->
    <el-dialog v-model="customerDialogVisible" :title="editingCustomer ? '编辑客户' : '新建客户'" width="600px" destroy-on-close>
      <el-form :model="customerForm" :rules="customerRules" ref="customerFormRef" label-width="100px">
        <el-form-item label="客户姓名" prop="name">
          <el-input v-model="customerForm.name" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="customerForm.phone" maxlength="11" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="customerForm.idCard" maxlength="18" />
        </el-form-item>
        <el-form-item label="客户地址">
          <el-input v-model="customerForm.address" />
        </el-form-item>
        <el-form-item label="客户分类" prop="category">
          <el-select v-model="customerForm.category" style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户标签">
          <el-checkbox-group v-model="customerForm.tags">
            <el-checkbox v-for="t in tagOptions" :key="t" :label="t">{{ t }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="客户来源">
          <el-select v-model="customerForm.source" style="width:100%">
            <el-option label="网络咨询" value="网络" />
            <el-option label="电话咨询" value="电话" />
            <el-option label="到店咨询" value="到店" />
            <el-option label="老客户介绍" value="介绍" />
            <el-option label="销售录入" value="销售" />
          </el-select>
        </el-form-item>
        <el-form-item label="销售顾问">
          <el-select v-model="customerForm.salesPerson" style="width:100%">
            <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次跟进">
          <el-date-picker v-model="customerForm.nextFollowDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="customerForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitCustomer">确定</el-button>
        <el-button @click="customerDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 跟进记录弹窗 -->
    <el-dialog v-model="followDialogVisible" title="客户跟进" width="600px" destroy-on-close>
      <!-- 上次跟进摘要 -->
      <el-alert
        v-if="lastFollowRecord"
        :title="`上次跟进（${lastFollowRecord.followDate} · ${lastFollowRecord.method}）`"
        :description="lastFollowRecord.content"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom:16px;"
      />
      <el-form :model="followForm" :rules="followRules" ref="followFormRef" label-width="100px">
        <el-form-item label="跟进日期" prop="followDate">
          <el-date-picker v-model="followForm.followDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="跟进方式" prop="method">
          <el-select v-model="followForm.method" style="width:100%">
            <el-option label="电话" value="电话" />
            <el-option label="微信" value="微信" />
            <el-option label="到店" value="到店" />
            <el-option label="上门拜访" value="上门" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input v-model="followForm.content" type="textarea" :rows="4" placeholder="记录客户沟通情况、需求变化等" />
        </el-form-item>
        <el-form-item label="意向度">
          <el-rate v-model="followForm.intention" show-score />
        </el-form-item>
        <el-form-item label="下次跟进">
          <el-date-picker v-model="followForm.nextFollowDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="跟进计划">
          <el-input v-model="followForm.nextPlan" type="textarea" :rows="2" placeholder="下次跟进的重点事项" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitFollow">确定</el-button>
        <el-button @click="followDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCrmStore } from '../stores/crm'
import { storeToRefs } from 'pinia'
import { salesPersons } from '../mock/data'

const crmStore = useCrmStore()
const { customers, followRecords, categoryOptions, tagOptions } = storeToRefs(crmStore)

/** 上次跟进记录（用于弹窗中显示摘要） */
const lastFollowRecord = computed(() => {
    if (!selectedCustomer.value) return null
    const records = followRecords.value
        .filter(r => r.customerId === selectedCustomer.value.id)
    return records.length > 0 ? records[0] : null
})

/** 超期跟进行样式 */
const getRowClassName = ({ row }) => {
    if (row.nextFollowDate && new Date(row.nextFollowDate) < new Date()) {
        return 'overdue-row'
    }
    return ''
}

const searchText = ref('')
const filterCategory = ref('')
const filterTag = ref('')
const filterSalesPerson = ref('')

const categoryTypeMap = { potential: 'info', dealed: 'success', old: 'warning' }
const categoryLabelMap = { potential: '潜在客户', dealed: '成交客户', old: '老客户' }

const customerStats = computed(() => [
  { label: '总客户数', value: customers.value.length, color: '#0066B1' },
  { label: '潜在客户', value: crmStore.potentialCustomers.length, color: '#389e0d' },
  { label: '成交客户', value: crmStore.dealedCustomers.length, color: '#d48806' },
  { label: '待跟进', value: crmStore.pendingFollowCustomers.length, color: '#cf1322' }
])

const filteredCustomers = computed(() => {
  return customers.value.filter(c => {
    if (searchText.value && !c.name.includes(searchText.value) && !c.phone.includes(searchText.value)) return false
    if (filterCategory.value && c.category !== filterCategory.value) return false
    if (filterTag.value && !c.tags.includes(filterTag.value)) return false
    if (filterSalesPerson.value && c.salesPerson !== filterSalesPerson.value) return false
    return true
  })
})

// 详情弹窗
const detailVisible = ref(false)
const selectedCustomer = ref(null)

const customerFollowRecords = computed(() => {
  if (!selectedCustomer.value) return []
  return followRecords.value.filter(r => r.customerId === selectedCustomer.value.id)
})

function viewDetail(row) {
  selectedCustomer.value = row
  detailVisible.value = true
}

function isOverdue(date) {
  if (!date) return false
  return new Date(date) < new Date()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 客户编辑
const customerDialogVisible = ref(false)
const editingCustomer = ref(null)
const customerFormRef = ref(null)

const initCustomerForm = () => ({ name: '', phone: '', idCard: '', address: '', category: 'potential', tags: [], source: '到店', salesPerson: '张伟', nextFollowDate: '', remark: '' })
const customerForm = ref(initCustomerForm())
const customerRules = { name: [{ required: true, message: '必填', trigger: 'blur' }], phone: [{ required: true, message: '必填', trigger: 'blur' }], category: [{ required: true, message: '必填', trigger: 'change' }] }

function openCustomerDialog() {
  customerForm.value = initCustomerForm()
  editingCustomer.value = null
  customerDialogVisible.value = true
}

function editCustomer(row) {
  customerForm.value = { ...row }
  editingCustomer.value = row.id
  customerDialogVisible.value = true
}

function submitCustomer() {
  customerFormRef.value?.validate((valid) => {
    if (!valid) return
    if (editingCustomer.value) {
      crmStore.updateCustomer(editingCustomer.value, customerForm.value)
      ElMessage.success('更新成功')
    } else {
      crmStore.addCustomer(customerForm.value)
      ElMessage.success('创建成功')
    }
    customerDialogVisible.value = false
  })
}

function deleteCustomer(id) {
  ElMessageBox.confirm('确定删除该客户吗？', '提示', { type: 'warning' }).then(() => {
    crmStore.deleteCustomer(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 跟进记录
const followDialogVisible = ref(false)
const followFormRef = ref(null)
const followForm = ref({ followDate: '', method: '电话', content: '', intention: 3, nextFollowDate: '', nextPlan: '' })
const followRules = { followDate: [{ required: true, message: '必填', trigger: 'change' }], method: [{ required: true, message: '必填', trigger: 'change' }], content: [{ required: true, message: '必填', trigger: 'blur' }] }

function openFollowDialog(row) {
  selectedCustomer.value = row
  followForm.value = { followDate: new Date().toISOString().slice(0, 10), method: '电话', content: '', intention: 3, nextFollowDate: '', nextPlan: '' }
  followDialogVisible.value = true
}

function submitFollow() {
  followFormRef.value?.validate((valid) => {
    if (!valid) return
    crmStore.addFollowRecord({ ...followForm.value, customerId: selectedCustomer.value.id, customerName: selectedCustomer.value.name, salesPerson: '张伟' })
    ElMessage.success('跟进记录已添加')
    followDialogVisible.value = false
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

.text-danger {
  color: #cf1322;
}

.overdue-row td {
  background-color: #fff1f0 !important;
}
</style>
