import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vehicles as mockVehicles, priceHistory as mockPriceHistory, saleRecords as mockSaleRecords, purchaseRecords as mockPurchaseRecords, operationLogs as mockLogs, carModels as mockCarModels, carSeries as mockCarSeries } from '../mock/data'

export const useVehicleStore = defineStore('vehicle', () => {
  const vehicles = ref([...mockVehicles])
  const priceHistory = ref([...mockPriceHistory])
  const saleRecords = ref([...mockSaleRecords])
  const purchaseRecords = ref([...mockPurchaseRecords])
  const operationLogs = ref([...mockLogs])
  const carModels = ref([...mockCarModels])
  const carSeries = ref([...mockCarSeries])

  // 新车采购草稿（不持久化）
  const newPurchaseDraft = ref(null)
  function setNewPurchaseDraft(draft) {
    newPurchaseDraft.value = draft
  }
  function clearNewPurchaseDraft() {
    newPurchaseDraft.value = null
  }

  // 计算属性
  const inStockVehicles = computed(() => vehicles.value.filter(v => v.status === 'in_stock'))
  const soldVehicles = computed(() => vehicles.value.filter(v => v.status === 'sold'))

  const inStockCount = computed(() => inStockVehicles.value.length)

  const currentMonthPurchases = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return purchaseRecords.value.filter(r => {
      const d = new Date(r.purchaseDate)
      return d.getMonth() === month && d.getFullYear() === year
    }).length
  })

  const currentMonthSales = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return saleRecords.value.filter(r => {
      const d = new Date(r.deliveryDate)
      return d.getMonth() === month && d.getFullYear() === year
    }).length
  })

  const currentMonthProfit = computed(() => {
    return saleRecords.value.reduce((sum, r) => {
      const totalFee = (r.tax || 0) + (r.insurance || 0) + (r.licenseFee || 0) + (r.decoration || 0) + (r.otherFee || 0)
      return sum + (r.salePrice - r.purchasePrice + totalFee)
    }, 0)
  })

  const pendingPriceAdjust = computed(() => priceHistory.value.filter(p => p.status === 'pending').length)

  const longUnsoldVehicles = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return inStockVehicles.value.filter(v => new Date(v.purchaseDate) < thirtyDaysAgo).length
  })

  // 操作方法
  function addVehicle(vehicle) {
    const id = Math.max(...vehicles.value.map(v => v.id), 0) + 1
    vehicles.value.unshift({ ...vehicle, id })
    return id
  }

  function updateVehicle(id, updates) {
    const idx = vehicles.value.findIndex(v => v.id === id)
    if (idx !== -1) {
      vehicles.value[idx] = { ...vehicles.value[idx], ...updates }
    }
  }

  function addPriceRecord(record) {
    const id = Math.max(...priceHistory.value.map(r => r.id), 0) + 1
    priceHistory.value.unshift({ ...record, id })
    // 更新车辆当前价格
    updateVehicle(record.vehicleId, { currentPrice: record.newPrice })
  }

  function addSaleRecord(record) {
    const id = Math.max(...saleRecords.value.map(r => r.id), 0) + 1
    saleRecords.value.unshift({ ...record, id })
    updateVehicle(record.vehicleId, { status: 'sold' })
    return id
  }

  function addPurchaseRecord(record) {
    const id = Math.max(...purchaseRecords.value.map(r => r.id), 0) + 1
    purchaseRecords.value.unshift({ ...record, id })
  }

  function addLog(log) {
    const id = Math.max(...operationLogs.value.map(l => l.id), 0) + 1
    operationLogs.value.unshift({ ...log, id, operateTime: new Date().toLocaleString('zh-CN') })
  }

  function addCarModel(model) {
    const id = Math.max(...carModels.value.map(m => m.id), 0) + 1
    carModels.value.push({ ...model, id })
  }

  function updateCarModel(id, updates) {
    const idx = carModels.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      carModels.value[idx] = { ...carModels.value[idx], ...updates }
    }
  }

  function deleteCarModel(id) {
    const idx = carModels.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      carModels.value.splice(idx, 1)
    }
  }

  function updatePriceRecordStatus(id, status) {
    const idx = priceHistory.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      priceHistory.value[idx] = { ...priceHistory.value[idx], status }
    }
  }

  // 重置所有数据到初始模拟数据
  function resetAllData() {
    vehicles.value = [...mockVehicles]
    priceHistory.value = [...mockPriceHistory]
    saleRecords.value = [...mockSaleRecords]
    purchaseRecords.value = [...mockPurchaseRecords]
    operationLogs.value = [...mockLogs]
    carModels.value = [...mockCarModels]
    carSeries.value = [...mockCarSeries]
  }

  function getVehicleByVin(vin) {
    return vehicles.value.find(v => v.vin === vin)
  }

  function getPriceHistoryByVehicleId(vehicleId) {
    return priceHistory.value.filter(p => p.vehicleId === vehicleId)
  }

  return {
    vehicles, priceHistory, saleRecords, purchaseRecords, operationLogs, carModels, carSeries,
    inStockVehicles, soldVehicles, inStockCount, currentMonthPurchases, currentMonthSales,
    currentMonthProfit, pendingPriceAdjust, longUnsoldVehicles,
    addVehicle, updateVehicle, addPriceRecord, addSaleRecord, addPurchaseRecord, addLog,
    addCarModel, updateCarModel, deleteCarModel, getVehicleByVin, getPriceHistoryByVehicleId, updatePriceRecordStatus, resetAllData,
    newPurchaseDraft, setNewPurchaseDraft, clearNewPurchaseDraft
  }
}, {
  // 数据持久化配置
  persist: {
    key: 'vehicle-store',
    storage: localStorage,
    // 持久化所有状态
    paths: [
      'vehicles',
      'priceHistory',
      'saleRecords',
      'purchaseRecords',
      'operationLogs',
      'carModels',
      'carSeries'
    ]
  }
})