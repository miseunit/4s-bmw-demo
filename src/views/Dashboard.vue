<template>
    <div>
        <!-- 数字卡片 -->
        <el-row :gutter="16" class="mb-16">
            <el-col :span="6" v-for="card in statCards" :key="card.title">
                <div class="stat-card" :style="{ borderTop: `3px solid ${card.color}` }">
                    <div class="stat-card-body">
                        <div class="stat-info">
                            <div class="stat-title">{{ card.title }}</div>
                            <div class="stat-value money" :style="{ color: card.color }">{{ card.value }}</div>
                        </div>
                        <div class="stat-icon" :style="{ backgroundColor: card.color + '15', color: card.color }">
                            <el-icon :size="28"><component :is="card.icon" /></el-icon>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="16" class="mb-16">
            <el-col :span="14">
                <div class="page-container chart-card">
                    <div class="page-title">销量与利润趋势</div>
                    <div ref="trendChartRef" class="chart-container"></div>
                </div>
            </el-col>
            <el-col :span="10">
                <div class="page-container chart-card">
                    <div class="page-title">库存状态分布</div>
                    <div ref="statusChartRef" class="chart-container"></div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="16">
            <!-- 待办提醒 -->
            <el-col :span="8">
                <div class="page-container">
                    <div class="page-title">待办提醒</div>
                    <div class="todo-list">
                        <div class="todo-item" v-for="item in todoItems" :key="item.text">
                            <el-badge :value="item.count" :type="item.type" />
                            <span class="todo-text">{{ item.text }}</span>
                            <el-button type="primary" link size="small" @click="handleTodo(item)">处理</el-button>
                        </div>
                    </div>
                </div>
            </el-col>

            <!-- 最近操作 -->
            <el-col :span="16">
                <div class="page-container">
                    <div class="page-title">最近操作记录</div>
                    <el-table :data="recentLogs" size="small" stripe>
                        <el-table-column prop="operateTime" label="时间" width="170" />
                        <el-table-column prop="typeName" label="类型" width="80">
                            <template #default="{ row }">
                                <el-tag :type="logTypeMap[row.type]" size="small">{{ row.typeName }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="operator" label="操作人" width="80" />
                        <el-table-column prop="detail" label="详情" show-overflow-tooltip />
                    </el-table>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { useVehicleStore } from '../stores/vehicle'
import { useCrmStore } from '../stores/crm'
import { usePaymentStore } from '../stores/payment'
import { useTestDriveStore } from '../stores/testDrive'
import { useDocumentStore } from '../stores/document'

const router = useRouter()
const store = useVehicleStore()
const crmStore = useCrmStore()
const paymentStore = usePaymentStore()
const testDriveStore = useTestDriveStore()
const documentStore = useDocumentStore()

const trendChartRef = ref(null)
const statusChartRef = ref(null)
let trendChart = null
let statusChart = null

const statCards = computed(() => [
    { title: '在库车辆', value: store.inStockCount + ' 台', color: '#0066B1', icon: 'Van' },
    { title: '本月买入', value: store.currentMonthPurchases + ' 台', color: '#389e0d', icon: 'ShoppingCart' },
    { title: '本月卖出', value: store.currentMonthSales + ' 台', color: '#d48806', icon: 'Sell' },
    { title: '本月利润', value: '¥' + store.currentMonthProfit.toLocaleString(), color: '#cf1322', icon: 'Money' },
])

const todoItems = computed(() => [
    { text: '待审批调价申请', count: store.pendingPriceAdjust, type: 'warning', route: '/price-adjust' },
    { text: '超30天未售车辆', count: store.longUnsoldVehicles, type: 'danger', route: '/inventory' },
    { text: '今日待交付车辆', count: 0, type: 'info', route: '/sale' },
    { text: '待跟进客户', count: crmStore.pendingFollowCustomers.length, type: 'warning', route: '/customer' },
    { text: '今日试驾预约', count: testDriveStore.todayAppointments.length, type: 'info', route: '/test-drive' },
    { text: '逾期收款', count: paymentStore.overduePayments.length, type: 'danger', route: '/payment' },
    { text: '证照即将到期', count: documentStore.upcomingExpiries.length, type: 'warning', route: '/document' },
])

function handleTodo(item) {
    if (item.route) router.push(item.route)
}

const recentLogs = computed(() => store.operationLogs.slice(0, 10))
const logTypeMap = { purchase: 'success', sale: 'warning', price_adjust: 'danger', edit: 'info' }

/**
 * 计算近 6 个月销量与利润数据
 */
function getTrendData() {
    const months = []
    const salesData = []
    const profitData = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = `${d.getMonth() + 1}月`
        months.push(label)

        const monthSales = store.saleRecords.filter(r => {
            const rd = new Date(r.deliveryDate)
            return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
        })
        salesData.push(monthSales.length)

        const monthProfit = monthSales.reduce((sum, r) => {
            const totalFee = (r.tax || 0) + (r.insurance || 0) + (r.licenseFee || 0) + (r.decoration || 0) + (r.otherFee || 0)
            return sum + (r.salePrice - r.purchasePrice + totalFee)
        }, 0)
        profitData.push(Math.round(monthProfit / 10000)) // 转为万元
    }

    return { months, salesData, profitData }
}

/**
 * 计算库存状态分布
 */
function getStatusData() {
    const vehicles = store.vehicles
    const statusMap = {
        in_stock: '在库',
        sold: '已售',
        reserved: '预留',
    }
    const colorMap = {
        in_stock: '#0066B1',
        sold: '#389e0d',
        reserved: '#d48806',
    }

    const data = Object.keys(statusMap).map(key => ({
        name: statusMap[key],
        value: vehicles.filter(v => v.status === key).length,
        itemStyle: { color: colorMap[key] },
    }))

    return data
}

/** 初始化图表 */
function initCharts() {
    if (!trendChartRef.value || !statusChartRef.value) return

    // 销量与利润趋势折线图
    trendChart = echarts.init(trendChartRef.value)
    const trend = getTrendData()
    trendChart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
        },
        legend: {
            data: ['销量（台）', '利润（万元）'],
            bottom: 0,
        },
        grid: { top: 16, right: 50, bottom: 36, left: 50 },
        xAxis: {
            type: 'category',
            data: trend.months,
            axisLine: { lineStyle: { color: '#e8e8e8' } },
            axisLabel: { color: '#86909c' },
        },
        yAxis: [
            {
                type: 'value',
                name: '台',
                axisLine: { show: false },
                axisLabel: { color: '#86909c' },
                splitLine: { lineStyle: { color: '#f0f0f0' } },
            },
            {
                type: 'value',
                name: '万元',
                axisLine: { show: false },
                axisLabel: { color: '#86909c' },
                splitLine: { show: false },
            },
        ],
        series: [
            {
                name: '销量（台）',
                type: 'bar',
                data: trend.salesData,
                barWidth: 24,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#0066B1' },
                        { offset: 1, color: '#003380' },
                    ]),
                    borderRadius: [4, 4, 0, 0],
                },
            },
            {
                name: '利润（万元）',
                type: 'line',
                yAxisIndex: 1,
                data: trend.profitData,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { color: '#d48806', width: 2 },
                itemStyle: { color: '#d48806' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(212, 136, 6, 0.15)' },
                        { offset: 1, color: 'rgba(212, 136, 6, 0.01)' },
                    ]),
                },
            },
        ],
    })

    // 库存状态分布饼图
    statusChart = echarts.init(statusChartRef.value)
    const status = getStatusData()
    statusChart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} 台 ({d}%)',
        },
        legend: {
            orient: 'vertical',
            right: 16,
            top: 'center',
        },
        series: [
            {
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold' },
                },
                data: status,
            },
        ],
    })

    // 点击饼图扇区跳转到库存页
    statusChart.on('click', (params) => {
        const statusValueMap = { '在库': 'in_stock', '已售': 'sold', '预留': 'reserved' }
        const statusValue = statusValueMap[params.name]
        if (statusValue) {
            router.push({ path: '/inventory', query: { status: statusValue } })
        }
    })
}

/** 窗口大小变化时重绘图表 */
function handleResize() {
    trendChart?.resize()
    statusChart?.resize()
}

onMounted(async () => {
    await nextTick()
    initCharts()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    trendChart?.dispose()
    statusChart?.dispose()
})
</script>

<style scoped>
.stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
}
.stat-card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.stat-title {
    font-size: 14px;
    color: #86909c;
    margin-bottom: 8px;
}
.stat-value {
    font-size: 28px;
    font-weight: 700;
}
.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chart-card {
    min-height: 340px;
}
.chart-container {
    height: 260px;
}
.todo-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}
.todo-item:last-child { border-bottom: none; }
.todo-text {
    flex: 1;
    font-size: 14px;
    color: #1d2129;
}
</style>
