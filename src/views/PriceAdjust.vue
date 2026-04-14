<template>
  <div class="page-container">
    <div class="page-title">调价管理</div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="调价申请" name="apply">
        <div style="margin-bottom:16px;display:flex;gap:12px;">
          <el-button type="primary" @click="openSingle"><el-icon><Edit /></el-icon> 单车调价</el-button>
          <el-button type="warning" @click="openBatch"><el-icon><SetUp /></el-icon> 批量调价</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="调价历史" name="history">
        <div class="filter-bar">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:260px;" />
          <el-select v-model="filterModel" placeholder="车型" clearable style="width:150px;">
            <el-option v-for="m in store.carModels" :key="m.id" :label="m.name" :value="m.name" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="状态" clearable style="width:120px;">
            <el-option label="待审批" value="pending" /><el-option label="已通过" value="approved" /><el-option label="已驳回" value="rejected" />
          </el-select>
        </div>
        <el-table :data="filteredPriceHistory" stripe border>
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
          <el-table-column label="原价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.oldPrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="新价" width="120" align="right"><template #default="{row}"><span class="money" :class="row.newPrice>row.oldPrice?'price-up':'price-down'">¥{{row.newPrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="调价幅度" width="120" align="center"><template #default="{row}"><span :class="row.newPrice>row.oldPrice?'price-up':'price-down'">{{row.newPrice>row.oldPrice?'+':''}}¥{{(row.newPrice-row.oldPrice).toLocaleString()}}</span></template></el-table-column>
          <el-table-column prop="reason" label="原因" width="100" />
          <el-table-column prop="operator" label="申请人" width="80" />
          <el-table-column prop="approver" label="审批人" width="80" />
          <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag :class="'status-tag-'+row.status" size="small" effect="plain">{{statusMap[row.status]}}</el-tag></template></el-table-column>
          <el-table-column prop="operateTime" label="时间" width="160" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 单车调价 3步 -->
    <el-dialog v-model="singleVisible" title="单车调价" width="750px" destroy-on-close :close-on-click-modal="false">
      <el-steps :active="singleStep" simple finish-status="success" style="margin-bottom:24px;">
        <el-step title="选择车辆" /><el-step title="填写调价信息" /><el-step title="审批确认" />
      </el-steps>
      <div v-show="singleStep===0">
        <el-button type="primary" @click="selectVehicleVisible=true" style="margin-bottom:12px;">选择车辆</el-button>
        <div v-if="selectedVehicle" style="border:2px solid #0066B1;border-radius:8px;padding:4px;">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="车型">{{selectedVehicle.modelName}}</el-descriptions-item>
            <el-descriptions-item label="VIN码">{{selectedVehicle.vin}}</el-descriptions-item>
            <el-descriptions-item label="指导价"><span class="money">¥{{selectedVehicle.guidePrice.toLocaleString()}}</span></el-descriptions-item>
            <el-descriptions-item label="采购价"><span class="money">¥{{selectedVehicle.purchasePrice.toLocaleString()}}</span></el-descriptions-item>
            <el-descriptions-item label="当前售价"><span class="money" style="color:#0066B1;font-weight:600;">¥{{selectedVehicle.currentPrice.toLocaleString()}}</span></el-descriptions-item>
            <el-descriptions-item label="上次调价">-</el-descriptions-item>
          </el-descriptions>
        </div>
        <el-empty v-else description="请选择车辆" :image-size="60" />
      </div>
      <div v-show="singleStep===1">
        <el-form :model="singleForm" :rules="singleRules" ref="singleFormRef" label-width="110px" class="dialog-form">
          <el-form-item label="调整后价格" prop="newPrice"><el-input-number v-model="singleForm.newPrice" :min="0" :step="1000" style="width:100%;" /></el-form-item>
          <el-form-item label="调价方向"><el-tag :type="priceDirection>0?'danger':'success'" size="large">{{priceDirection>0?'涨价':'降价'}}</el-tag></el-form-item>
          <el-form-item label="调价幅度"><span :class="priceDirection>0?'price-up':'price-down'" style="font-size:16px;">{{priceDirection>0?'+':''}}¥{{priceDirection.toLocaleString()}}（{{pricePercent}}%）</span></el-form-item>
          <el-form-item label="调价原因" prop="reason"><el-select v-model="singleForm.reason" placeholder="请选择" style="width:100%;"><el-option v-for="r in priceReasonOptions" :key="r" :label="r" :value="r" /></el-select></el-form-item>
          <el-form-item label="调价说明" prop="reasonDetail" v-if="singleForm.reason"><el-input v-model="singleForm.reasonDetail" type="textarea" :rows="2" placeholder="至少10个字" /></el-form-item>
        </el-form>
      </div>
      <div v-show="singleStep===2">
        <el-form label-width="110px" class="dialog-form">
          <el-form-item label="审批人"><el-select v-model="singleForm.approver" style="width:100%;"><el-option v-for="a in approvers" :key="a.id" :label="`${a.name}（${a.role}）`" :value="a.name" /></el-select></el-form-item>
          <el-form-item label="紧急程度"><el-radio-group v-model="singleForm.urgency"><el-radio value="normal">普通</el-radio><el-radio value="urgent">加急</el-radio></el-radio-group></el-form-item>
        </el-form>
        <div style="margin-top:16px;">
          <div style="font-weight:600;margin-bottom:8px;">价格对比</div>
          <el-row :gutter="16">
            <el-col :span="6"><div style="text-align:center;padding:12px;background:#f5f7fa;border-radius:6px;"><div style="color:#999;font-size:12px;">指导价</div><div class="money" style="font-size:16px;">¥{{selectedVehicle?.guidePrice?.toLocaleString()}}</div></div></el-col>
            <el-col :span="6"><div style="text-align:center;padding:12px;background:#f5f7fa;border-radius:6px;"><div style="color:#999;font-size:12px;">采购价</div><div class="money" style="font-size:16px;">¥{{selectedVehicle?.purchasePrice?.toLocaleString()}}</div></div></el-col>
            <el-col :span="6"><div style="text-align:center;padding:12px;background:#fff1f0;border-radius:6px;"><div style="color:#999;font-size:12px;">原售价</div><div class="money" style="font-size:16px;">¥{{selectedVehicle?.currentPrice?.toLocaleString()}}</div></div></el-col>
            <el-col :span="6"><div style="text-align:center;padding:12px;background:#e8f7e8;border-radius:6px;"><div style="color:#999;font-size:12px;">新售价</div><div class="money" style="font-size:16px;color:#389e0d;">¥{{singleForm.newPrice?.toLocaleString()}}</div></div></el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <el-button v-if="singleStep>0" @click="singleStep--">上一步</el-button>
        <el-button v-if="singleStep<2" type="primary" @click="nextSingle">下一步</el-button>
        <el-button v-if="singleStep===2" type="primary" @click="submitSingle">提交审批</el-button>
        <el-button @click="singleVisible=false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 批量调价 3步 -->
    <el-dialog v-model="batchVisible" title="批量调价" width="800px" destroy-on-close :close-on-click-modal="false">
      <el-steps :active="batchStep" simple finish-status="success" style="margin-bottom:24px;">
        <el-step title="选择车辆范围" /><el-step title="设置调价规则" /><el-step title="预览确认" />
      </el-steps>
      <div v-show="batchStep===0">
        <div class="filter-bar">
          <el-select v-model="batchFilter.series" placeholder="车系" clearable style="width:120px;" @change="queryBatch"><el-option v-for="s in store.carSeries" :key="s.id" :label="s.name" :value="s.name" /></el-select>
          <el-select v-model="batchFilter.color" placeholder="颜色" clearable style="width:120px;" @change="queryBatch"><el-option v-for="c in colorOptions" :key="c" :label="c" :value="c" /></el-select>
          <el-button type="primary" @click="queryBatch">查询匹配</el-button>
        </div>
        <el-table :data="batchVehicles" @selection-change="batchSelected=$event" stripe border max-height="300">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="modelName" label="车型" min-width="180" />
          <el-table-column label="当前售价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.currentPrice.toLocaleString()}}</span></template></el-table-column>
        </el-table>
        <div style="margin-top:8px;color:#999;">已选择 {{batchSelected.length}} 台车辆</div>
      </div>
      <div v-show="batchStep===1">
        <el-form :model="batchForm" :rules="batchRules" ref="batchFormRef" label-width="130px" class="dialog-form">
          <el-form-item label="调价方式" prop="mode"><el-radio-group v-model="batchForm.mode"><el-radio value="fixed">统一调至指定价</el-radio><el-radio value="amount">统一调整金额</el-radio><el-radio value="percent">统一调整比例</el-radio></el-radio-group></el-form-item>
          <el-form-item label="调价数值" prop="value">
            <el-input-number v-model="batchForm.value" :step="1000" style="width:200px;" />
            <span v-if="batchForm.mode==='percent'" style="margin-left:8px;">%</span>
            <span v-else style="margin-left:8px;color:#999;">元</span>
          </el-form-item>
          <el-form-item label="调价原因" prop="reason"><el-select v-model="batchForm.reason" style="width:100%;"><el-option v-for="r in priceReasonOptions" :key="r" :label="r" :value="r" /></el-select></el-form-item>
          <el-form-item label="调价说明"><el-input v-model="batchForm.reasonDetail" type="textarea" :rows="2" /></el-form-item>
        </el-form>
      </div>
      <div v-show="batchStep===2">
        <div style="margin-bottom:12px;">受影响车辆：<strong>{{previewList.length}}</strong> 台，平均调价 <strong class="money">{{avgAdjust}}</strong> 元</div>
        <el-table :data="previewList" stripe border max-height="350">
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="modelName" label="车型" min-width="180" />
          <el-table-column label="原售价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.oldPrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="新售价" width="120" align="right"><template #default="{row}"><span class="money" :class="row.newPrice>row.oldPrice?'price-up':'price-down'">¥{{row.newPrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="调整金额" width="120" align="center"><template #default="{row}"><span :class="row.newPrice>row.oldPrice?'price-up':'price-down'">{{row.newPrice>row.oldPrice?'+':''}}¥{{(row.newPrice-row.oldPrice).toLocaleString()}}</span></template></el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button v-if="batchStep>0" @click="batchStep--">上一步</el-button>
        <el-button v-if="batchStep<2" type="primary" @click="nextBatch">下一步</el-button>
        <el-button v-if="batchStep===2" @click="batchStep=1">返回修改</el-button>
        <el-button v-if="batchStep===2" type="primary" @click="submitBatch">确认提交</el-button>
        <el-button @click="batchVisible=false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 选择车辆弹窗 -->
    <el-dialog v-model="selectVehicleVisible" title="选择库存车辆" width="750px" append-to-body>
      <el-input v-model="vSearch" placeholder="搜索" clearable style="margin-bottom:12px;" />
      <el-table :data="stockForSelect" highlight-current-row @row-dblclick="pickVehicle" max-height="400">
        <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
        <el-table-column prop="modelName" label="车型" min-width="180" />
        <el-table-column label="当前售价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.currentPrice.toLocaleString()}}</span></template></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { colorOptions, priceReasonOptions, approvers } from '../mock/data'

const route = useRoute()
const store = useVehicleStore()
const activeTab = ref('apply')
const dateRange = ref(null)
const filterStatus = ref('')
const filterModel = ref('')
const statusMap = { pending: '待审批', approved: '已通过', rejected: '已驳回' }

// 调价历史筛选
const filteredPriceHistory = computed(() => {
  let list = store.priceHistory
  if (filterStatus.value) list = list.filter(p => p.status === filterStatus.value)
  if (filterModel.value) list = list.filter(p => p.modelName === filterModel.value)
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter(p => p.operateTime.slice(0, 10) >= start && p.operateTime.slice(0, 10) <= end)
  }
  return list
})

// 单车调价
const singleVisible = ref(false)
const singleStep = ref(0)
const selectVehicleVisible = ref(false)
const vSearch = ref('')
const selectedVehicle = ref(null)
const singleFormRef = ref(null)
const singleForm = ref({ newPrice: null, reason: '', reasonDetail: '', approver: '', urgency: 'normal' })
const singleRules = { newPrice: [{ required: true, message: '必填', trigger: 'blur' }], reason: [{ required: true, message: '必填', trigger: 'change' }] }

const priceDirection = computed(() => selectedVehicle.value ? (singleForm.value.newPrice || 0) - selectedVehicle.value.currentPrice : 0)
const pricePercent = computed(() => selectedVehicle.value && selectedVehicle.value.currentPrice ? Math.abs(Math.round(priceDirection.value / selectedVehicle.value.currentPrice * 10000) / 100) : 0)

const stockForSelect = computed(() => {
  let list = store.inStockVehicles
  if (vSearch.value) { const s = vSearch.value.toLowerCase(); list = list.filter(v => v.vin.toLowerCase().includes(s) || v.modelName.includes(s)) }
  return list
})

function openSingle() { selectedVehicle.value = null; singleForm.value = { newPrice: null, reason: '', reasonDetail: '', approver: '', urgency: 'normal' }; singleStep.value = 0; singleVisible.value = true; if (route.query.vin) { const v = store.getVehicleByVin(route.query.vin); if (v) { selectedVehicle.value = v; singleForm.value.newPrice = v.currentPrice } } }
function pickVehicle(row) { selectedVehicle.value = row; singleForm.value.newPrice = row.currentPrice; selectVehicleVisible.value = false }
async function nextSingle() { if (singleStep.value === 0) { if (!selectedVehicle.value) { ElMessage.warning('请选择车辆'); return }; singleStep.value = 1 } else if (singleStep.value === 1) { try { await singleFormRef.value?.validate(); singleStep.value = 2 } catch(e) {} } }
function submitSingle() {
  const f = singleForm.value; const v = selectedVehicle.value
  store.addPriceRecord({ vehicleId: v.id, vin: v.vin, modelName: v.modelName, oldPrice: v.currentPrice, newPrice: f.newPrice, reason: f.reason, reasonDetail: f.reasonDetail, operator: '张伟', approver: f.approver, status: 'pending' })
  store.addLog({ type: 'price_adjust', typeName: '调价', operator: '张伟', target: v.vin, detail: `调价申请（待审批）- ${v.modelName}，${v.currentPrice}→${f.newPrice}元` })
  ElMessage.success('调价申请已提交！'); singleVisible.value = false
}

// 批量调价
const batchVisible = ref(false)
const batchStep = ref(0)
const batchFilter = ref({ series: '', color: '' })
const batchSelected = ref([])
const batchFormRef = ref(null)
const batchForm = ref({ mode: 'amount', value: null, reason: '', reasonDetail: '' })
const batchRules = { mode: [{ required: true }], value: [{ required: true, message: '必填', trigger: 'blur' }], reason: [{ required: true, message: '必填', trigger: 'change' }] }

const batchVehicles = computed(() => {
  let list = store.inStockVehicles
  if (batchFilter.value.series) list = list.filter(v => v.seriesName === batchFilter.value.series)
  if (batchFilter.value.color) list = list.filter(v => v.color === batchFilter.value.color)
  return list
})
function queryBatch() {}

const previewList = computed(() => batchSelected.value.map(v => {
  const old = v.currentPrice; let np = old
  if (batchForm.value.mode === 'fixed') np = batchForm.value.value
  else if (batchForm.value.mode === 'amount') np = old + batchForm.value.value
  else if (batchForm.value.mode === 'percent') np = Math.round(old * (1 + batchForm.value.value / 100))
  return { ...v, oldPrice: old, newPrice: np }
}))
const avgAdjust = computed(() => { if (!previewList.value.length) return 0; const total = previewList.value.reduce((s, r) => s + (r.newPrice - r.oldPrice), 0); return Math.round(total / previewList.value.length) })

function openBatch() {
  batchFilter.value = { series: '', color: '' }
  batchSelected.value = []
  batchForm.value = { mode: 'amount', value: null, reason: '', reasonDetail: '' }
  batchStep.value = 0
  batchVisible.value = true
  // 如果从库存台账跳转过来带 batch 参数
  if (route.query.batch === '1') {
    activeTab.value = 'apply'
  }
}
async function nextBatch() { if (batchStep.value === 0) { if (!batchSelected.value.length) { ElMessage.warning('请选择车辆'); return }; batchStep.value = 1 } else if (batchStep.value === 1) { try { await batchFormRef.value?.validate(); batchStep.value = 2 } catch(e) {} } }
function submitBatch() { previewList.value.forEach(r => { store.addPriceRecord({ vehicleId: r.id, vin: r.vin, modelName: r.modelName, oldPrice: r.oldPrice, newPrice: r.newPrice, reason: batchForm.value.reason, reasonDetail: batchForm.value.reasonDetail, operator: '张伟', approver: '李经理', status: 'pending' }) }); ElMessage.success(`批量调价${previewList.value.length}台已提交！`); batchVisible.value = false }
</script>