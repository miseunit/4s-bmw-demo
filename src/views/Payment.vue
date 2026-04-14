<template>
  <div class="page-container">
    <div class="page-title">收款管理</div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="stat in paymentStats" :key="stat.label">
        <div class="stat-card-mini" :style="{ borderTop: `3px solid ${stat.color}` }">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <!-- 待收款列表 -->
      <el-tab-pane label="待收款列表" name="pending">
        <div class="filter-bar">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px" />
          <el-select v-model="filterStatus" placeholder="状态" clearable style="width:120px">
            <el-option label="未逾期" value="normal" />
            <el-option label="已逾期" value="overdue" />
          </el-select>
        </div>

        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <el-button type="primary" @click="openPaymentDialog">
            <el-icon><Plus /></el-icon> 新增收款
          </el-button>
        </div>

        <el-table :data="filteredPlans" stripe border>
          <el-table-column prop="id" label="计划号" width="80" />
          <el-table-column prop="buyerName" label="客户" width="100" />
          <el-table-column prop="buyerPhone" label="电话" width="130" />
          <el-table-column prop="planName" label="款项类型" width="100" />
          <el-table-column label="应收金额" width="130" align="right">
            <template #default="{ row }"><span class="money">¥{{ row.amount.toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column label="已收金额" width="130" align="right">
            <template #default="{ row }"><span class="money">¥{{ (row.paidAmount || 0).toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column label="未收金额" width="130" align="right">
            <template #default="{ row }">
              <span class="money" :style="{ color: getUnpaidAmount(row) > 0 ? '#cf1322' : '' }">
                ¥{{ getUnpaidAmount(row).toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="dueDate" label="应收日期" width="110" align="center">
            <template #default="{ row }">
              <span :class="isOverdue(row.dueDate) && !row.paid ? 'text-danger' : ''">{{ row.dueDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.paid ? 'success' : (isOverdue(row.dueDate) ? 'danger' : 'warning')" size="small">
                {{ row.paid ? '已收清' : (isOverdue(row.dueDate) ? '已逾期' : '待收款') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openPaymentDialog(row)" v-if="!row.paid">收款</el-button>
              <el-button type="info" link size="small" @click="viewHistory(row)">记录</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 收款记录 -->
      <el-tab-pane label="收款记录" name="records">
        <div class="filter-bar">
          <el-date-picker v-model="recordDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px" />
          <el-select v-model="filterMethod" placeholder="收款方式" clearable style="width:120px">
            <el-option label="现金" value="cash" />
            <el-option label="转账" value="transfer" />
            <el-option label="刷卡" value="card" />
            <el-option label="支票" value="check" />
          </el-select>
        </div>

        <el-table :data="filteredRecords" stripe border>
          <el-table-column prop="id" label="记录号" width="80" />
          <el-table-column prop="paymentDate" label="收款日期" width="110" align="center" />
          <el-table-column prop="buyerName" label="客户" width="100" />
          <el-table-column prop="planName" label="款项类型" width="100" />
          <el-table-column label="收款金额" width="130" align="right">
            <template #default="{ row }"><span class="money">¥{{ row.amount.toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column label="收款方式" width="90" align="center">
            <template #default="{ row }">{{ methodMap[row.paymentMethod] }}</template>
          </el-table-column>
          <el-table-column prop="voucher" label="凭证号" width="150" show-overflow-tooltip />
          <el-table-column prop="operator" label="经办人" width="100" />
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>

      <!-- 欠款跟踪 -->
      <el-tab-pane label="欠款跟踪" name="overdue">
        <el-table :data="overduePayments" stripe border>
          <el-table-column prop="buyerName" label="客户" width="100" />
          <el-table-column prop="buyerPhone" label="电话" width="130" />
          <el-table-column prop="planName" label="款项类型" width="100" />
          <el-table-column label="欠款金额" width="130" align="right">
            <template #default="{ row }"><span class="money text-danger">¥{{ getUnpaidAmount(row).toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column prop="dueDate" label="应收日期" width="110" align="center" />
          <el-table-column label="逾期天数" width="100" align="center">
            <template #default="{ row }">{{ getOverdueDays(row.dueDate) }} 天</template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openCollectionDialog(row)">催收记录</el-button>
              <el-button type="success" link size="small" @click="openPaymentDialog(row)">收款</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 收款报表 -->
      <el-tab-pane label="收款报表" name="report">
        <div style="margin-bottom:16px;">
          <el-date-picker v-model="reportDateRange" type="monthrange" range-separator="至" value-format="YYYY-MM" style="width:260px" />
          <el-button type="primary" @click="generateReport">查询</el-button>
        </div>

        <el-row :gutter="16">
          <el-col :span="12">
            <div class="report-card">
              <div class="report-title">收款方式分布</div>
              <div style="height:300px;display:flex;align-items:center;justify-content:center;color:#999;">
                收款方式分布图（开发中）
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="report-card">
              <div class="report-title">月度收款趋势</div>
              <div style="height:300px;display:flex;align-items:center;justify-content:center;color:#999;">
                月度收款趋势图（开发中）
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 收款弹窗 -->
    <el-dialog v-model="paymentDialogVisible" title="收款登记" width="600px" destroy-on-close>
      <el-form :model="paymentForm" :rules="paymentRules" ref="paymentFormRef" label-width="110px">
        <el-form-item label="收款计划" prop="planId">
          <el-select v-model="paymentForm.planId" style="width:100%" @change="onPlanChange">
            <el-option v-for="p in pendingPayments" :key="p.id"
              :label="`${p.planName} - ${p.buyerName} - ¥${getUnpaidAmount(p).toLocaleString()}`"
              :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="应收金额">
          <span class="money">¥{{ currentPlan?.amount?.toLocaleString() || 0 }}</span>
        </el-form-item>
        <el-form-item label="已收金额">
          <span class="money">¥{{ (currentPlan?.paidAmount || 0).toLocaleString() }}</span>
        </el-form-item>
        <el-form-item label="未收金额">
          <span class="money text-danger">¥{{ getUnpaidAmount(currentPlan).toLocaleString() }}</span>
        </el-form-item>
        <el-form-item label="本次收款" prop="amount">
          <el-input-number v-model="paymentForm.amount" :min="0" :max="getUnpaidAmount(currentPlan)" :step="1000" style="width:100%" />
        </el-form-item>
        <el-form-item label="收款日期" prop="paymentDate">
          <el-date-picker v-model="paymentForm.paymentDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-select v-model="paymentForm.paymentMethod" style="width:100%">
            <el-option label="现金" value="cash" />
            <el-option label="转账" value="transfer" />
            <el-option label="刷卡" value="card" />
            <el-option label="支票" value="check" />
          </el-select>
        </el-form-item>
        <el-form-item label="凭证号">
          <el-input v-model="paymentForm.voucher" placeholder="银行流水号/支票号等" />
        </el-form-item>
        <el-form-item label="经办人">
          <el-input v-model="paymentForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="paymentForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitPayment">提交</el-button>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 催收记录弹窗 -->
    <el-dialog v-model="collectionDialogVisible" title="催收记录" width="700px" destroy-on-close>
      <div style="margin-bottom:16px;">
        <el-button type="primary" size="small" @click="addNewCollection">
          <el-icon><Plus /></el-icon> 新增催收记录
        </el-button>
      </div>
      <el-empty v-if="planCollectionRecords.length === 0" description="暂无催收记录" />
      <el-timeline v-else>
        <el-timeline-item v-for="record in planCollectionRecords" :key="record.id"
          :timestamp="record.contactDate" placement="top">
          <el-card>
            <div><strong>联系方式：</strong>{{ record.method }}</div>
            <div><strong>沟通情况：</strong>{{ record.content }}</div>
            <div><strong>客户回复：</strong>{{ record.customerResponse }}</div>
            <div><strong>下次联系：</strong>{{ record.nextContactDate || '未安排' }}</div>
            <div style="margin-top:8px;color:#999;font-size:12px;">记录人：{{ record.operator }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { usePaymentStore } from '../stores/payment'
import { storeToRefs } from 'pinia'

const paymentStore = usePaymentStore()
const { pendingPayments, overduePayments, paymentRecords, collectionRecords } = storeToRefs(paymentStore)

const activeTab = ref('pending')
const dateRange = ref(null)
const filterStatus = ref('')
const recordDateRange = ref(null)
const filterMethod = ref('')
const reportDateRange = ref(null)

const methodMap = { cash: '现金', transfer: '转账', card: '刷卡', check: '支票' }

const paymentStats = computed(() => [
  { label: '待收款笔数', value: pendingPayments.value.length, color: '#0066B1' },
  { label: '逾期笔数', value: overduePayments.value.length, color: '#cf1322' },
  { label: '逾期金额', value: '¥' + paymentStore.totalOverdueAmount.toLocaleString(), color: '#d48806' },
  { label: '今日收款', value: '¥' + paymentStore.todayPaymentAmount.toLocaleString(), color: '#389e0d' }
])

const filteredPlans = computed(() => {
  return paymentStore.paymentPlans.filter(p => {
    if (filterStatus.value === 'overdue' && !isOverdue(p.dueDate)) return false
    if (filterStatus.value === 'normal' && isOverdue(p.dueDate)) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      if (p.dueDate < start || p.dueDate > end) return false
    }
    return true
  })
})

const filteredRecords = computed(() => {
  return paymentRecords.value.filter(r => {
    if (filterMethod.value && r.paymentMethod !== filterMethod.value) return false
    if (recordDateRange.value && recordDateRange.value.length === 2) {
      const [start, end] = recordDateRange.value
      if (r.paymentDate < start || r.paymentDate > end) return false
    }
    return true
  })
})

function getUnpaidAmount(plan) {
  if (!plan) return 0
  return plan.amount - (plan.paidAmount || 0)
}

function isOverdue(date) {
  if (!date) return false
  return new Date(date) < new Date()
}

function getOverdueDays(date) {
  const diff = new Date() - new Date(date)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// 收款弹窗
const paymentDialogVisible = ref(false)
const paymentFormRef = ref(null)
const paymentForm = ref({ planId: null, amount: null, paymentDate: '', paymentMethod: 'transfer', voucher: '', operator: '', remark: '' })
const paymentRules = { planId: [{ required: true, message: '必填', trigger: 'change' }], amount: [{ required: true, message: '必填', trigger: 'blur' }], paymentDate: [{ required: true, message: '必填', trigger: 'change' }], paymentMethod: [{ required: true, message: '必填', trigger: 'change' }] }

const currentPlan = computed(() => {
  if (!paymentForm.value.planId) return null
  return paymentStore.paymentPlans.find(p => p.id === paymentForm.value.planId)
})

function openPaymentDialog(plan = null) {
  if (plan) {
    paymentForm.value = {
      planId: plan.id,
      amount: getUnpaidAmount(plan),
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'transfer',
      voucher: '',
      operator: '',
      remark: ''
    }
  } else {
    paymentForm.value = { planId: null, amount: null, paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'transfer', voucher: '', operator: '', remark: '' }
  }
  paymentDialogVisible.value = true
}

function onPlanChange() {
  if (currentPlan.value) {
    paymentForm.value.amount = getUnpaidAmount(currentPlan.value)
  }
}

function submitPayment() {
  paymentFormRef.value?.validate((valid) => {
    if (!valid) return
    const plan = currentPlan.value
    paymentStore.addPaymentRecord({
      ...paymentForm.value,
      buyerName: plan.buyerName,
      planName: plan.planName
    })
    ElMessage.success('收款登记成功')
    paymentDialogVisible.value = false
  })
}

// 催收记录
const collectionDialogVisible = ref(false)
const currentPlanForCollection = ref(null)

const planCollectionRecords = computed(() => {
  if (!currentPlanForCollection.value) return []
  return collectionRecords.value.filter(r => r.planId === currentPlanForCollection.value.id)
})

function openCollectionDialog(plan) {
  currentPlanForCollection.value = plan
  collectionDialogVisible.value = true
}

function addNewCollection() {
  ElMessage.info('催收记录添加功能开发中')
}

function viewHistory(plan) {
  openCollectionDialog(plan)
}

function generateReport() {
  ElMessage.info('报表生成功能开发中')
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

.report-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d2129;
}
</style>
