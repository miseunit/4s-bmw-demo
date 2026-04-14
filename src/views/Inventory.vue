<template>
  <div class="page-container">
    <div class="page-title">车辆库存台账</div>

    <!-- 搜索+筛选 -->
    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="VIN码/车牌号" clearable style="width: 200px" @clear="handleSearch" @keyup.enter="handleSearch">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filterSeries" placeholder="车系" clearable style="width: 120px" @change="handleSearch">
        <el-option v-for="s in store.carSeries" :key="s.id" :label="s.name" :value="s.name" />
      </el-select>
      <el-select v-model="filterColor" placeholder="颜色" clearable style="width: 120px" @change="handleSearch">
        <el-option v-for="c in colorOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
        <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-select v-model="filterSource" placeholder="来源" clearable style="width: 120px" @change="handleSearch">
        <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <div style="display:flex;align-items:center;gap:4px;">
        <span style="font-size:13px;color:#999;white-space:nowrap;">价格</span>
        <el-input-number v-model="priceMin" :min="0" :step="10000" controls-position="right" placeholder="最低价" style="width:120px;" size="default" />
        <span style="color:#999;">-</span>
        <el-input-number v-model="priceMax" :min="0" :step="10000" controls-position="right" placeholder="最高价" style="width:120px;" size="default" />
      </div>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="入库开始" end-placeholder="入库结束" value-format="YYYY-MM-DD" style="width:260px;" @change="handleSearch" />
      <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <el-button type="warning" :disabled="selectedRows.length === 0" @click="goBatchPriceAdjust">
          <el-icon><SetUp /></el-icon> 批量调价 ({{ selectedRows.length }})
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出Excel
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="filteredVehicles" stripe border @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
      <el-table-column prop="modelName" label="车型" min-width="200" show-overflow-tooltip />
      <el-table-column prop="color" label="颜色" width="100" />
      <el-table-column label="来源" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.source === 'new' ? 'primary' : 'warning'" size="small">{{ row.source === 'new' ? '新车' : '二手车' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="采购价" width="120" align="right">
        <template #default="{ row }"><span class="money">¥{{ row.purchasePrice.toLocaleString() }}</span></template>
      </el-table-column>
      <el-table-column label="当前售价" width="120" align="right">
        <template #default="{ row }"><span class="money" style="color:#0066B1;font-weight:600;">¥{{ row.currentPrice.toLocaleString() }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :class="'status-tag-' + row.status" size="small" effect="plain">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="purchaseDate" label="入库日期" width="110" align="center" />
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
          <el-button type="warning" link size="small" @click="goPriceAdjust(row)" v-if="row.status === 'in_stock'">调价</el-button>
          <el-button type="success" link size="small" @click="goSale(row)" v-if="row.status === 'in_stock'">卖出</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 车辆详情弹窗 -->
    <el-dialog v-model="detailVisible" title="车辆详情" width="700px" destroy-on-close>
      <el-tabs>
        <el-tab-pane label="车辆信息">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="VIN码">{{ detailVehicle.vin }}</el-descriptions-item>
            <el-descriptions-item label="车牌号">{{ detailVehicle.plateNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="车型">{{ detailVehicle.modelName }}</el-descriptions-item>
            <el-descriptions-item label="车系">{{ detailVehicle.seriesName }}</el-descriptions-item>
            <el-descriptions-item label="颜色">{{ detailVehicle.color }}</el-descriptions-item>
            <el-descriptions-item label="内饰颜色">{{ detailVehicle.interiorColor }}</el-descriptions-item>
            <el-descriptions-item label="年款">{{ detailVehicle.year }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ detailVehicle.source === 'new' ? '新车' : '二手车' }}</el-descriptions-item>
            <el-descriptions-item label="里程数" v-if="detailVehicle.source === 'used'">{{ detailVehicle.mileage }} 万公里</el-descriptions-item>
            <el-descriptions-item label="车况描述" v-if="detailVehicle.source === 'used'">{{ detailVehicle.condition || '-' }}</el-descriptions-item>
            <el-descriptions-item label="配置" :span="2">{{ detailVehicle.config }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="价格信息">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="指导价"><span class="money">¥{{ detailVehicle.guidePrice?.toLocaleString() }}</span></el-descriptions-item>
            <el-descriptions-item label="采购价"><span class="money">¥{{ detailVehicle.purchasePrice?.toLocaleString() }}</span></el-descriptions-item>
            <el-descriptions-item label="当前售价"><span class="money" style="color:#0066B1;font-weight:600;">¥{{ detailVehicle.currentPrice?.toLocaleString() }}</span></el-descriptions-item>
          </el-descriptions>
          <div class="mt-16" v-if="vehiclePriceHistory.length">
            <div style="font-size:14px;font-weight:600;margin-bottom:8px;">调价历史</div>
            <el-table :data="vehiclePriceHistory" size="small" border stripe>
              <el-table-column label="原价" align="right"><template #default="{ row }"><span class="money">¥{{ row.oldPrice.toLocaleString() }}</span></template></el-table-column>
              <el-table-column label="新价" align="right"><template #default="{ row }"><span class="money" :class="row.newPrice > row.oldPrice ? 'price-up' : 'price-down'">¥{{ row.newPrice.toLocaleString() }}</span></template></el-table-column>
              <el-table-column prop="reason" label="原因" width="100" />
              <el-table-column prop="reasonDetail" label="说明" show-overflow-tooltip />
              <el-table-column prop="operator" label="操作人" width="80" />
              <el-table-column prop="operateTime" label="时间" width="160" />
            </el-table>
          </div>
          <el-empty v-else description="暂无调价记录" :image-size="60" />
        </el-tab-pane>
        <el-tab-pane label="交易信息">
          <template v-if="vehicleSale">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="买家姓名">{{ vehicleSale.buyerName }}</el-descriptions-item>
              <el-descriptions-item label="买家电话">{{ vehicleSale.buyerPhone }}</el-descriptions-item>
              <el-descriptions-item label="成交价"><span class="money">¥{{ vehicleSale.salePrice.toLocaleString() }}</span></el-descriptions-item>
              <el-descriptions-item label="付款方式">{{ vehicleSale.paymentMethod === 'full' ? '全款' : '按揭' }}</el-descriptions-item>
              <el-descriptions-item label="交付日期">{{ vehicleSale.deliveryDate }}</el-descriptions-item>
              <el-descriptions-item label="销售顾问">{{ vehicleSale.salesPerson }}</el-descriptions-item>
            </el-descriptions>
          </template>
          <el-empty v-else description="暂无交易记录" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { colorOptions, statusOptions, sourceOptions } from '../mock/data'

const router = useRouter()
const store = useVehicleStore()

const searchText = ref('')
const filterSeries = ref('')
const filterColor = ref('')
const filterStatus = ref('')
const filterSource = ref('')
const priceMin = ref(null)
const priceMax = ref(null)
const dateRange = ref(null)
const selectedRows = ref([])

const detailVisible = ref(false)
const detailVehicle = ref({})

const statusMap = { in_stock: '在库', sold: '已售', reserved: '预留' }

const filteredVehicles = computed(() => {
  return store.vehicles.filter(v => {
    if (searchText.value && !v.vin.toLowerCase().includes(searchText.value.toLowerCase()) && !v.plateNumber.includes(searchText.value)) return false
    if (filterSeries.value && v.seriesName !== filterSeries.value) return false
    if (filterColor.value && v.color !== filterColor.value) return false
    if (filterStatus.value && v.status !== filterStatus.value) return false
    if (filterSource.value && v.source !== filterSource.value) return false
    if (priceMin.value !== null && v.currentPrice < priceMin.value) return false
    if (priceMax.value !== null && v.currentPrice > priceMax.value) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      if (v.purchaseDate < start || v.purchaseDate > end) return false
    }
    return true
  })
})

const vehiclePriceHistory = computed(() => {
  if (!detailVehicle.value.id) return []
  return store.getPriceHistoryByVehicleId(detailVehicle.value.id)
})

const vehicleSale = computed(() => {
  if (!detailVehicle.value.id) return null
  return store.saleRecords.find(s => s.vehicleId === detailVehicle.value.id)
})

function handleSearch() {}
function resetFilter() {
  searchText.value = ''
  filterSeries.value = ''
  filterColor.value = ''
  filterStatus.value = ''
  filterSource.value = ''
  priceMin.value = null
  priceMax.value = null
  dateRange.value = null
}
function handleSelectionChange(rows) { selectedRows.value = rows }

function goBatchPriceAdjust() {
  router.push({ path: '/price-adjust', query: { batch: '1' } })
}

function handleExport() {
  // 模拟导出 Excel：生成 CSV 并下载
  const headers = ['VIN码', '车型', '车系', '颜色', '来源', '采购价', '当前售价', '状态', '入库日期']
  const rows = filteredVehicles.value.map(v => [
    v.vin, v.modelName, v.seriesName, v.color,
    v.source === 'new' ? '新车' : '二手车',
    v.purchasePrice, v.currentPrice,
    { in_stock: '在库', sold: '已售', reserved: '预留' }[v.status],
    v.purchaseDate
  ])
  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `车辆库存台账_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('导出成功')
}

function showDetail(row) {
  detailVehicle.value = row
  detailVisible.value = true
}

function goPriceAdjust(row) {
  router.push({ path: '/price-adjust', query: { vin: row.vin } })
}
function goSale(row) {
  router.push({ path: '/sale', query: { vin: row.vin } })
}
</script>