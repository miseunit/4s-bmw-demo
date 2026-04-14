import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRepairStore = defineStore('repair', {
  state: () => ({
    repairRecords: [],
    nextId: 1,
  }),
  actions: {
    addRepairRecord(data) {
      const id = this.nextId++
      const now = new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
      const record = {
        id,
        orderNo: `WX${String(id).padStart(5, '0')}`,
        createTime: now,
        ...data,
      }
      this.repairRecords.unshift(record)
      return id
    },
    updateRepairRecord(id, data) {
      const idx = this.repairRecords.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.repairRecords[idx] = { ...this.repairRecords[idx], ...data }
      }
    },
    deleteRepairRecord(id) {
      const idx = this.repairRecords.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.repairRecords.splice(idx, 1)
      }
    },
  },
  persist: true,
})