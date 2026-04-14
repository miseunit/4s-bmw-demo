<template>
  <div class="page-container">
    <div class="page-title">利润统计</div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:260px;" />
      <el-select v-model="filterSeries" placeholder="车系" clearable style="width:120px;">
        <el-option v-for="s in store.carSeries" :key="s.id" :label="s.name" :value="s.name" />
      </el-select>
      <el-select v-model="filterSalesPerson" placeholder="销售顾问" clearable style="width:120px;">
        <el-option v-for="p in salesPersons" :key="p.id" :label="p.name" :value="p.name" />
      </el-select>
    </div>

    <!-- 汇总卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="card in summaryCards" :key="card.title">
        <div class="stat-card" :style="{ borderTop: `3px solid ${card.color}` }">
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-value money" :style="{ color: card.color }">{{ card.value }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab">
      <!-- 利润明细 -->
      <el-tab-pane label="利润明细" name="detail">
        <el-table :data="filteredRecords" stripe border size="small">
          <el-table-column prop="vin" label="VIN码" width="170" show-overflow-tooltip />
          <el-table-column prop="modelName" label="车型" min-width="160" show-overflow-tooltip />
          <el-table-column label="来源" width="70" align="center">
            <template #default="{ row }"><el-tag :type="row.source==='new'?'primary':'warning'" size="small">{{ row.source==='new'?'新车':'二手' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="采购价" width="110" align="right"><template #default="{row}"><span class="money">¥{{row.purchasePrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="成交价" width="110" align="right"><template #default="{row}"><span class="money">¥{{row.salePrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="附加费用" width="110" align="right"><template #default="{row}"><span class="money">¥{{calcTotalFee(row).toLocaleString()}}</span></template></el-table-column>
          <el-table-column label="单车利润" width="120" align="right"><template #default="{row}"><span class="money" :class="calcProfit(row)>=0?'price-up':'price-down'">¥{{calcProfit(row).toLocaleString()}}</span></template></el-table-column>
          <el-table-column prop="salesPerson" label="销售顾问" width="80" />
          <el-table-column prop="deliveryDate" label="成交日期" width="110" align="center" />
        </el-table>
      </el-tab-pane>

      <!-- 车型汇总 -->
      <el-tab-pane label="车型汇总" name="summary">
        <el-row :gutter="16">
          <el-col :span="14">
            <!-- 各车型利润排名柱状图 -->
            <div style="font-weight:600;margin-bottom:12px;">各车型利润排名</div>
            <div ref="barChartRef" style="height:360px;background:#fff;border-radius:8px;padding:16px;"></div>
          </el-col>
          <el-col :span="10">
            <!-- 汇总表格 -->
            <div style="font-weight:600;margin-bottom:12px;">车型销售汇总</div>
            <el-table :data="modelSummary" stripe border size="small">
              <el-table-column prop="modelName" label="车型名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="count" label="销售台数" width="80" align="center" />
              <el-table-column label="总利润" width="120" align="right"><template #default="{row}"><span class="money" style="color:#cf1322;font-weight:600;">¥{{row.totalProfit.toLocaleString()}}</span></template></el-table-column>
              <el-table-column label="平均单车利润" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.avgProfit.toLocaleString()}}</span></template></el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { useVehicleStore } from '../stores/vehicle'
import { salesPersons } from '../mock/data'

const store = useVehicleStore()
const activeTab = ref('detail')
const barChartRef = ref(null)
let barChart = null

// 筛选
const dateRange = ref(null)
const filterSeries = ref('')
const filterSalesPerson = ref('')

const filteredRecords = computed(() => {
  let list = [...store.saleRecords]
  if (filterSeries.value) list = list.filter(r => {
    const v = store.vehicles.find(v => v.id === r.vehicleId)
    return v && v.seriesName === filterSeries.value
  })
  if (filterSalesPerson.value) list = list.filter(r => r.salesPerson === filterSalesPerson.value)
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter(r => r.deliveryDate >= start && r.deliveryDate <= end)
  }
  return list
})

// 利润计算
function calcTotalFee(row) {
  return (row.tax || 0) + (row.insurance || 0) + (row.licenseFee || 0) + (row.decoration || 0) + (row.otherFee || 0)
}
function calcProfit(row) {
  return row.salePrice - row.purchasePrice + calcTotalFee(row)
}

// 汇总卡片
const totalSales = computed(() => filteredRecords.value.reduce((s, r) => s + r.salePrice, 0))
const totalProfit = computed(() => filteredRecords.value.reduce((s, r) => s + calcProfit(r), 0))
const avgProfitPerCar = computed(() => filteredRecords.value.length ? Math.round(totalProfit.value / filteredRecords.value.length) : 0)
const profitRate = computed(() => totalSales.value ? (totalProfit.value / totalSales.value * 100).toFixed(1) : '0')

const summaryCards = computed(() => [
  { title: '总销售额', value: '¥' + totalSales.value.toLocaleString(), color: '#0066B1' },
  { title: '总利润', value: '¥' + totalProfit.value.toLocaleString(), color: '#cf1322' },
  { title: '单车均利', value: '¥' + avgProfitPerCar.value.toLocaleString(), color: '#d48806' },
  { title: '利润率', value: profitRate.value + '%', color: '#389e0d' },
])

// 车型汇总数据
const modelSummary = computed(() => {
  const map = {}
  filteredRecords.value.forEach(r => {
    if (!map[r.modelName]) map[r.modelName] = { modelName: r.modelName, count: 0, totalProfit: 0 }
    map[r.modelName].count++
    map[r.modelName].totalProfit += calcProfit(r)
  })
  return Object.values(map).map(m => ({ ...m, avgProfit: Math.round(m.totalProfit / m.count) })).sort((a, b) => b.totalProfit - a.totalProfit)
})

// 渲染柱状图
function renderBarChart() {
  if (!barChartRef.value) return
  if (!barChart) barChart = echarts.init(barChartRef.value)
  const data = modelSummary.value
  barChart.setOption({
    tooltip: { trigger: 'axis', formatter: p => `${p[0].name}<br/>利润: ¥${p[0].value.toLocaleString()}` },
    grid: { left: 140, right: 30, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { formatter: v => v >= 10000 ? (v / 10000) + '万' : v } },
    yAxis: { type: 'category', data: data.map(d => d.modelName).reverse(), axisLabel: { fontSize: 12 } },
    series: [{
      type: 'bar', data: data.map(d => d.totalProfit).reverse(),
      itemStyle: { color: '#0066B1', borderRadius: [0, 4, 4, 0] },
      barWidth: '50%',
      label: { show: true, position: 'right', formatter: p => '¥' + p.value.toLocaleString(), fontSize: 11 }
    }]
  })
}

// Tab 切换时渲染图表
watch(activeTab, (val) => {
  if (val === 'summary') nextTick(() => renderBarChart())
})

onMounted(() => {
  // 窗口 resize 自适应
  window.addEventListener('resize', () => barChart?.resize())
})
</script>

<style scoped>
.stat-card { background: #fff; border-radius: 8px; padding: 16px; }
.stat-title { font-size: 13px; color: #86909c; margin-bottom: 6px; }
.stat-value { font-size: 24px; font-weight: 700; }
</style>
