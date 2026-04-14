<template>
  <div class="page-container">
    <div class="page-title">卖出出库</div>
    <div class="filter-bar">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px;" />
      <el-select v-model="filterSalesPerson" placeholder="销售顾问" clearable style="width:120px;">
        <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
      </el-select>
      <el-select v-model="filterPayment" placeholder="付款方式" clearable style="width:120px;">
        <el-option v-for="p in paymentOptions" :key="p.value" :label="p.label" :value="p.value" />
      </el-select>
    </div>
    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openSale"><el-icon><Plus /></el-icon> 新建销售单</el-button>
    </div>
    <el-table :data="filteredSales" stripe border>
      <el-table-column prop="id" label="单号" width="60" />
      <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
      <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
      <el-table-column prop="color" label="颜色" width="90" />
      <el-table-column label="成交价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.salePrice.toLocaleString()}}</span></template></el-table-column>
      <el-table-column label="付款方式" width="90" align="center"><template #default="{row}"><el-tag :type="row.paymentMethod==='full'?'success':'warning'" size="small">{{row.paymentMethod==='full'?'全款':'按揭'}}</el-tag></template></el-table-column>
      <el-table-column prop="buyerName" label="买家" width="90" />
      <el-table-column prop="deliveryDate" label="交付日期" width="110" align="center" />
      <el-table-column prop="salesPerson" label="销售顾问" width="90" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{row}">
          <el-button type="primary" size="small" @click="editRecord(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建销售单弹窗 4步 -->
    <el-dialog v-model="saleDialogVisible" title="新建销售单" width="800px" destroy-on-close :close-on-click-modal="false">
      <el-steps :active="step" simple finish-status="success" style="margin-bottom:24px;">
        <el-step title="选择车辆" />
        <el-step title="买家信息" />
        <el-step title="交易信息" />
        <el-step title="交付信息" />
      </el-steps>

      <!-- Step 1 -->
      <div v-show="step===0">
        <el-button type="primary" @click="vehicleSelectVisible=true" style="margin-bottom:12px;"><el-icon><Search /></el-icon> 选择车辆</el-button>
        <div v-if="selectedVehicle" class="vehicle-card">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="车型">{{ selectedVehicle.modelName }}</el-descriptions-item>
            <el-descriptions-item label="车系">{{ selectedVehicle.seriesName }}</el-descriptions-item>
            <el-descriptions-item label="VIN码">{{ selectedVehicle.vin }}</el-descriptions-item>
            <el-descriptions-item label="颜色">{{ selectedVehicle.color }}</el-descriptions-item>
            <el-descriptions-item label="当前售价"><span class="money" style="color:#0066B1;font-weight:600;">¥{{selectedVehicle.currentPrice.toLocaleString()}}</span></el-descriptions-item>
            <el-descriptions-item label="入库日期">{{ selectedVehicle.purchaseDate }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ selectedVehicle.source==='new'?'新车':'二手车' }}</el-descriptions-item>
            <el-descriptions-item label="采购价"><span class="money">¥{{selectedVehicle.purchasePrice.toLocaleString()}}</span></el-descriptions-item>
          </el-descriptions>
        </div>
        <el-empty v-else description="请点击上方按钮选择要售出的车辆" :image-size="80" />
      </div>

      <!-- Step 2 -->
      <div v-show="step===1">
        <el-form :model="form" :rules="step2Rules" ref="form2Ref" label-width="110px" class="dialog-form">
          <el-form-item label="买家姓名" prop="buyerName"><el-input v-model="form.buyerName" /></el-form-item>
          <el-form-item label="买家电话" prop="buyerPhone"><el-input v-model="form.buyerPhone" maxlength="11" /></el-form-item>
          <el-form-item label="买家身份证" prop="buyerIdCard"><el-input v-model="form.buyerIdCard" maxlength="18" /></el-form-item>
          <el-form-item label="买家地址"><el-input v-model="form.buyerAddress" /></el-form-item>
          <el-form-item label="代办人姓名"><el-input v-model="form.agentName" /></el-form-item>
          <el-form-item label="代办人电话"><el-input v-model="form.agentPhone" maxlength="11" /></el-form-item>
        </el-form>
      </div>

      <!-- Step 3 -->
      <div v-show="step===2">
        <el-form :model="form" :rules="step3Rules" ref="form3Ref" label-width="110px" class="dialog-form">
          <el-form-item label="成交价" prop="salePrice"><el-input-number v-model="form.salePrice" :min="0" :step="1000" style="width:100%;" /></el-form-item>
          <el-form-item label="指导价"><span class="money">¥{{selectedVehicle?.guidePrice?.toLocaleString()}}</span></el-form-item>
          <el-form-item label="优惠金额"><el-input-number v-model="discountAmount" :min="0" :step="1000" style="width:100%;" /></el-form-item>
          <el-form-item label="付款方式" prop="paymentMethod"><el-radio-group v-model="form.paymentMethod"><el-radio value="full">全款</el-radio><el-radio value="loan">按揭</el-radio></el-radio-group></el-form-item>
          <el-form-item label="定金"><el-input-number v-model="form.downPayment" :min="0" :step="1000" style="width:100%;" /></el-form-item>
          <el-form-item label="销售顾问" prop="salesPerson"><el-select v-model="form.salesPerson" style="width:100%;"><el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" /></el-select></el-form-item>
        </el-form>
        <!-- 按揭详情 -->
        <el-card v-if="form.paymentMethod==='loan'" shadow="never" style="margin-top:8px;border:1px dashed #d48806;background:#fffbe6;">
          <div style="font-weight:600;color:#d48806;margin-bottom:12px;">按揭详情</div>
          <el-form :model="form" label-width="110px" class="dialog-form" size="default">
            <el-form-item label="首付比例"><el-select v-model="form.loanDownRatio" style="width:100%;" @change="calcLoan"><el-option v-for="r in [30,40,50,60,70]" :key="r" :label="r+'%'" :value="r" /></el-select></el-form-item>
            <el-form-item label="首付金额"><span class="money" style="font-size:15px;">¥{{ calcDownPayment?.toLocaleString() }}</span></el-form-item>
            <el-form-item label="贷款金额"><span class="money" style="font-size:15px;">¥{{ calcLoanAmount?.toLocaleString() }}</span></el-form-item>
            <el-form-item label="贷款期限"><el-select v-model="form.loanTerm" style="width:100%;" @change="calcLoan"><el-option v-for="t in [12,24,36,48,60]" :key="t" :label="t+'期'" :value="t" /></el-select></el-form-item>
            <el-form-item label="月供（模拟）"><span class="money" style="font-size:18px;color:#cf1322;font-weight:600;">¥{{ calcMonthlyPayment?.toLocaleString() }}</span></el-form-item>
            <el-form-item label="金融公司"><el-select v-model="form.financeCompany" style="width:100%;"><el-option v-for="f in financeOptions" :key="f" :label="f" :value="f" /></el-select></el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Step 4 -->
      <div v-show="step===3">
        <el-form :model="form" :rules="step4Rules" ref="form4Ref" label-width="110px" class="dialog-form">
          <el-form-item label="交付日期" prop="deliveryDate"><el-date-picker v-model="form.deliveryDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" /></el-form-item>
          <el-form-item label="交付方式" prop="deliveryMethod"><el-select v-model="form.deliveryMethod" style="width:100%;"><el-option v-for="d in deliveryOptions" :key="d" :label="d" :value="d" /></el-select></el-form-item>
          <el-divider content-position="left">附加费用</el-divider>
          <el-form-item label="购置税"><el-input-number v-model="form.tax" :min="0" :step="1000" style="width:100%;" /></el-form-item>
          <el-form-item label="保险"><el-input-number v-model="form.insurance" :min="0" :step="500" style="width:100%;" /></el-form-item>
          <el-form-item label="上牌费"><el-input-number v-model="form.licenseFee" :min="0" :step="100" style="width:100%;" /></el-form-item>
          <el-form-item label="精品装饰"><el-input-number v-model="form.decoration" :min="0" :step="500" style="width:100%;" /></el-form-item>
          <el-form-item label="其他费用"><el-input-number v-model="form.otherFee" :min="0" :step="100" style="width:100%;" /></el-form-item>
          <el-form-item label="费用合计"><span class="money" style="font-size:16px;color:#d48806;">¥{{ totalFee.toLocaleString() }}</span></el-form-item>
          <el-form-item label="应收总额"><span class="money" style="font-size:20px;color:#cf1322;font-weight:700;">¥{{ (form.salePrice + totalFee).toLocaleString() }}</span></el-form-item>
          <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
        </el-form>
        <el-collapse style="margin-top:12px;">
          <el-collapse-item title="查看完整订单信息">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="车型">{{ selectedVehicle?.modelName }}</el-descriptions-item>
              <el-descriptions-item label="VIN码">{{ selectedVehicle?.vin }}</el-descriptions-item>
              <el-descriptions-item label="买家">{{ form.buyerName }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ form.buyerPhone }}</el-descriptions-item>
              <el-descriptions-item label="成交价"><span class="money">¥{{form.salePrice?.toLocaleString()}}</span></el-descriptions-item>
              <el-descriptions-item label="付款方式">{{ form.paymentMethod==='full'?'全款':'按揭' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <el-button v-if="step>0" @click="step--">上一步</el-button>
        <el-button v-if="step<3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="step===3" type="primary" @click="submitSale">{{ editingId ? '更新' : '提交' }}</el-button>
        <el-button @click="saleDialogVisible=false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 选择车辆弹窗 -->
    <el-dialog v-model="vehicleSelectVisible" title="选择库存车辆" width="800px" append-to-body>
      <div style="margin-bottom:12px;">
        <el-input v-model="vehicleSearch" placeholder="搜索VIN码/车型" clearable style="width:250px;" />
      </div>
      <el-table :data="stockVehicles" highlight-current-row @row-dblclick="confirmVehicle" max-height="400">
        <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
        <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
        <el-table-column prop="color" label="颜色" width="90" />
        <el-table-column prop="seriesName" label="车系" width="80" />
        <el-table-column label="当前售价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.currentPrice.toLocaleString()}}</span></template></el-table-column>
        <el-table-column prop="purchaseDate" label="入库日期" width="110" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { useCrmStore } from '../stores/crm'
import { usePaymentStore } from '../stores/payment'
import { useDocumentStore } from '../stores/document'
import { salesPersons, paymentOptions, financeOptions, deliveryOptions } from '../mock/data'

const route = useRoute()
const store = useVehicleStore()
const crmStore = useCrmStore()
const paymentStore = usePaymentStore()
const documentStore = useDocumentStore()

const dateRange = ref(null)
const filterSalesPerson = ref('')
const filterPayment = ref('')
const vehicleSearch = ref('')

const filteredSales = computed(() => {
  let list = [...store.saleRecords]
  if (filterSalesPerson.value) list = list.filter(r => r.salesPerson === filterSalesPerson.value)
  if (filterPayment.value) list = list.filter(r => r.paymentMethod === filterPayment.value)
  return list
})

const stockVehicles = computed(() => {
  let list = store.inStockVehicles
  if (vehicleSearch.value) {
    const s = vehicleSearch.value.toLowerCase()
    list = list.filter(v => v.vin.toLowerCase().includes(s) || v.modelName.includes(s))
  }
  return list
})

// ===== 新建销售单 =====
const saleDialogVisible = ref(false)
const vehicleSelectVisible = ref(false)
const step = ref(0)
const selectedVehicle = ref(null)
const editingId = ref(null)
const form2Ref = ref(null)
const form3Ref = ref(null)
const form4Ref = ref(null)

const initForm = () => ({ buyerName: '', buyerPhone: '', buyerIdCard: '', buyerAddress: '', agentName: '', agentPhone: '', salePrice: null, paymentMethod: 'full', downPayment: 0, salesPerson: '张伟', loanDownRatio: 30, loanTerm: 36, financeCompany: 'BMW金融', deliveryDate: '', deliveryMethod: '到店自提', tax: 0, insurance: 0, licenseFee: 0, decoration: 0, otherFee: 0, remark: '' })
const form = ref(initForm())

const step2Rules = { buyerName: [{ required: true, message: '必填', trigger: 'blur' }], buyerPhone: [{ required: true, message: '必填', trigger: 'blur' }], buyerIdCard: [{ required: true, message: '必填', trigger: 'blur' }] }
const step3Rules = { salePrice: [{ required: true, message: '必填', trigger: 'blur' }], paymentMethod: [{ required: true, message: '必填', trigger: 'change' }], salesPerson: [{ required: true, message: '必填', trigger: 'change' }] }
const step4Rules = { deliveryDate: [{ required: true, message: '必填', trigger: 'change' }], deliveryMethod: [{ required: true, message: '必填', trigger: 'change' }] }

const discountAmount = computed({ get: () => selectedVehicle.value ? (selectedVehicle.value.guidePrice - (form.value.salePrice || 0)) : 0, set: () => {} })

const calcDownPayment = computed(() => form.value.salePrice ? Math.round(form.value.salePrice * form.value.loanDownRatio / 100) : 0)
const calcLoanAmount = computed(() => form.value.salePrice ? form.value.salePrice - calcDownPayment.value : 0)
const calcMonthlyPayment = computed(() => {
  const p = calcLoanAmount.value
  const m = form.value.loanTerm
  if (!p || !m) return 0
  const rate = 0.004 // 模拟月利率
  return Math.round(p * rate * Math.pow(1 + rate, m) / (Math.pow(1 + rate, m) - 1))
})
const totalFee = computed(() => (form.value.tax || 0) + (form.value.insurance || 0) + (form.value.licenseFee || 0) + (form.value.decoration || 0) + (form.value.otherFee || 0))

function calcLoan() {}

function openSale() {
  form.value = initForm()
  selectedVehicle.value = null
  step.value = 0
  editingId.value = null
  saleDialogVisible.value = true
  // 如果从库存台账跳转过来，自动选中车辆
  if (route.query.vin) {
    const v = store.getVehicleByVin(route.query.vin)
    if (v && v.status === 'in_stock') { selectedVehicle.value = v; form.value.salePrice = v.currentPrice }
  }
}
function confirmVehicle(row) {
  selectedVehicle.value = row
  form.value.salePrice = row.currentPrice
  vehicleSelectVisible.value = false
}
async function nextStep() {
  if (step.value === 0) {
    if (!selectedVehicle.value) { ElMessage.warning('请先选择车辆'); return }
    step.value = 1
  } else if (step.value === 1) {
    try { await form2Ref.value?.validate(); step.value = 2 } catch(e) {}
  } else if (step.value === 2) {
    try { await form3Ref.value?.validate(); step.value = 3 } catch(e) {}
  }
}
function submitSale() {
  form4Ref.value?.validate((valid) => {
    if (!valid) return
    const f = form.value
    const v = selectedVehicle.value

    if (editingId.value) {
      // 编辑模式：更新销售记录
      const idx = store.saleRecords.findIndex(r => r.id === editingId.value)
      if (idx !== -1) {
        store.saleRecords[idx] = {
          ...store.saleRecords[idx],
          salePrice: f.salePrice,
          paymentMethod: f.paymentMethod,
          downPayment: f.paymentMethod === 'loan' ? calcDownPayment.value : f.salePrice,
          loanAmount: f.paymentMethod === 'loan' ? calcLoanAmount.value : 0,
          loanTerm: f.paymentMethod === 'loan' ? f.loanTerm : 0,
          monthlyPayment: f.paymentMethod === 'loan' ? calcMonthlyPayment.value : 0,
          financeCompany: f.paymentMethod === 'loan' ? f.financeCompany : '',
          buyerName: f.buyerName,
          buyerPhone: f.buyerPhone,
          buyerIdCard: f.buyerIdCard,
          deliveryDate: f.deliveryDate,
          tax: f.tax,
          insurance: f.insurance,
          licenseFee: f.licenseFee,
          decoration: f.decoration,
          otherFee: f.otherFee,
          salesPerson: f.salesPerson,
          remark: f.remark
        }
      }
      const payDesc = f.paymentMethod === 'full' ? '全款' : `按揭${f.loanTerm}期`
      store.addLog({ type: 'sale', typeName: '修改', operator: f.salesPerson, target: v.vin, detail: `修改销售单 - ${v.modelName}，成交价${f.salePrice}元，${payDesc}` })
      ElMessage.success('销售单更新成功！')
    } else {
      // 新增模式
      const saleId = store.addSaleRecord({
        vehicleId: v.id, vin: v.vin, modelName: v.modelName, color: v.color,
        purchasePrice: v.purchasePrice, salePrice: f.salePrice, paymentMethod: f.paymentMethod,
        downPayment: f.paymentMethod === 'loan' ? calcDownPayment.value : f.salePrice,
        loanAmount: f.paymentMethod === 'loan' ? calcLoanAmount.value : 0,
        loanTerm: f.paymentMethod === 'loan' ? f.loanTerm : 0,
        monthlyPayment: f.paymentMethod === 'loan' ? calcMonthlyPayment.value : 0,
        financeCompany: f.paymentMethod === 'loan' ? f.financeCompany : '',
        buyerName: f.buyerName, buyerPhone: f.buyerPhone, buyerIdCard: f.buyerIdCard,
        deliveryDate: f.deliveryDate, tax: f.tax, insurance: f.insurance,
        licenseFee: f.licenseFee, decoration: f.decoration, otherFee: f.otherFee,
        salesPerson: f.salesPerson, remark: f.remark
      })
      const payDesc = f.paymentMethod === 'full' ? '全款' : `按揭${f.loanTerm}期`
      store.addLog({ type: 'sale', typeName: '出库', operator: f.salesPerson, target: v.vin, detail: `车辆售出 - ${v.modelName}，成交价${f.salePrice}元，${payDesc}` })

      // 自动创建客户档案
      crmStore.createCustomerFromSale({
        id: saleId,
        buyerName: f.buyerName,
        buyerPhone: f.buyerPhone,
        buyerIdCard: f.buyerIdCard,
        buyerAddress: f.buyerAddress,
        vin: v.vin,
        modelName: v.modelName,
        salePrice: f.salePrice,
        deliveryDate: f.deliveryDate,
        salesPerson: f.salesPerson
      })

      // 自动创建收款计划
      const saleRecord = store.saleRecords.find(r => r.id === saleId)
      paymentStore.createPaymentPlanFromSale(saleRecord)

      // 自动创建发票记录
      documentStore.createInvoiceFromSale(saleRecord)

      ElMessage.success('销售单提交成功！')
    }
    saleDialogVisible.value = false
  })
}

function editRecord(row) {
  editingId.value = row.id
  // 从库存中找到对应的车辆（可能已售出，需要从所有车辆中查找）
  const vehicle = store.vehicles.find(v => v.vin === row.vin)
  selectedVehicle.value = vehicle || { modelName: row.modelName, vin: row.vin, color: row.color, guidePrice: row.salePrice, currentPrice: row.salePrice, purchasePrice: row.purchasePrice }

  form.value = {
    buyerName: row.buyerName || '',
    buyerPhone: row.buyerPhone || '',
    buyerIdCard: row.buyerIdCard || '',
    buyerAddress: '',
    agentName: '',
    agentPhone: '',
    salePrice: row.salePrice,
    paymentMethod: row.paymentMethod || 'full',
    downPayment: row.downPayment || 0,
    salesPerson: row.salesPerson || '张伟',
    loanDownRatio: row.loanAmount && row.salePrice ? Math.round(row.downPayment / row.salePrice * 100) : 30,
    loanTerm: row.loanTerm || 36,
    financeCompany: row.financeCompany || 'BMW金融',
    deliveryDate: row.deliveryDate || '',
    deliveryMethod: '到店自提',
    tax: row.tax || 0,
    insurance: row.insurance || 0,
    licenseFee: row.licenseFee || 0,
    decoration: row.decoration || 0,
    otherFee: row.otherFee || 0,
    remark: row.remark || ''
  }
  step.value = 3
  saleDialogVisible.value = true
}

function deleteRecord(id) {
  ElMessageBox.confirm('确定删除该销售单吗？删除后不可恢复！', '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(() => {
    const record = store.saleRecords.find(r => r.id === id)
    if (!record) return

    // 删除销售记录
    const idx = store.saleRecords.findIndex(r => r.id === id)
    if (idx !== -1) {
      store.saleRecords.splice(idx, 1)
    }

    // 将车辆状态恢复为在库
    const vehicle = store.vehicles.find(v => v.vin === record.vin)
    if (vehicle) {
      store.updateVehicle(vehicle.id, { status: 'in_stock' })
    }

    // 记录日志
    const payDesc = record.paymentMethod === 'full' ? '全款' : `按揭${record.loanTerm}期`
    store.addLog({ type: 'sale', typeName: '删除', operator: '张伟', target: record.vin, detail: `删除销售单 - ${record.modelName}，成交价${record.salePrice}元，${payDesc}` })

    ElMessage.success('删除成功！')
  }).catch(() => {})
}

function saveDraft() { ElMessage.success('草稿已保存（模拟）') }
</script>

<style scoped>
.vehicle-card {
  border: 2px solid #0066B1;
  border-radius: 8px;
  padding: 4px;
}
</style>