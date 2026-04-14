<template>
  <div class="page-container">
    <div class="page-title">操作日志</div>
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="操作类型" clearable style="width:120px;" @change="handleSearch">
        <el-option label="入库" value="purchase" /><el-option label="出库" value="sale" /><el-option label="调价" value="price_adjust" /><el-option label="编辑" value="edit" />
      </el-select>
      <el-input v-model="filterOperator" placeholder="操作人" clearable style="width:120px;" @keyup.enter="handleSearch" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:260px;" @change="handleSearch" />
      <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
      <el-button @click="resetFilter">重置</el-button>
    </div>
    <el-table :data="pagedLogs" stripe border>
      <el-table-column prop="operateTime" label="时间" width="170" />
      <el-table-column prop="typeName" label="操作类型" width="90" align="center">
        <template #default="{ row }"><el-tag :type="typeMap[row.type]" size="small">{{ row.typeName }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="80" />
      <el-table-column prop="target" label="操作对象" width="180" show-overflow-tooltip />
      <el-table-column prop="detail" label="操作详情" min-width="300" show-overflow-tooltip />
    </el-table>
    <div style="margin-top:16px;display:flex;justify-content:flex-end;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredLogs.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useVehicleStore } from '../stores/vehicle'
const store = useVehicleStore()
const filterType = ref('')
const filterOperator = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const typeMap = { purchase: 'success', sale: 'warning', price_adjust: 'danger', edit: 'info' }

const filteredLogs = computed(() => {
  return store.operationLogs.filter(l => {
    if (filterType.value && l.type !== filterType.value) return false
    if (filterOperator.value && !l.operator.includes(filterOperator.value)) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      const logDate = l.operateTime.slice(0, 10)
      if (logDate < start || logDate > end) return false
    }
    return true
  })
})

const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLogs.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
}
function resetFilter() {
  filterType.value = ''
  filterOperator.value = ''
  dateRange.value = null
  currentPage.value = 1
}
</script>
