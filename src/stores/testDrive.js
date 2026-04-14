import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTestDriveStore = defineStore('testDrive', () => {
    // 试驾预约记录
    const appointments = ref([
        {
            id: 1,
            customerName: '王先生',
            customerPhone: '136****9999',
            modelName: '330Li M运动曜夜套装',
            appointmentDate: new Date().toISOString().slice(0, 10),
            appointmentTime: '14:00',
            consultant: '张伟',
            vehicleId: 1,
            plateNumber: '京A·T001',
            status: 'pending',
            remark: '第二次试驾，意向度较高',
            createTime: new Date().toISOString()
        }
    ])

    // 试驾车辆（绑定特定车辆用于试驾）
    const testDriveVehicles = ref([
        {
            id: 1,
            vin: 'WBAJB0C05LBW99999',
            modelName: '330Li M运动曜夜套装',
            plateNumber: '京A·T001',
            status: 'available',
            location: '展厅'
        }
    ])

    // 试驾反馈记录
    const feedbackRecords = ref([
        {
            id: 1,
            appointmentId: 2,
            customerName: '赵女士',
            modelName: 'X3 30Li 领先型 M运动套装',
            testDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
            mileage: 8,
            intention: 4,
            impressions: '车辆空间大，视野好，操控性能出色，对M运动套件很满意',
            concerns: '价格稍超预算，对燃油经济性有顾虑',
            suggestions: '推荐金融方案，强调保值率和品牌口碑',
            converted: false,
            createTime: new Date(Date.now() - 86400000 * 2).toISOString()
        }
    ])

    // 计算属性
    const todayAppointments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return appointments.value.filter(a => a.appointmentDate === today && a.status !== 'cancelled')
    })

    const upcomingAppointments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return appointments.value.filter(a => a.appointmentDate >= today && a.status !== 'cancelled')
    })

    const availableVehicles = computed(() =>
        testDriveVehicles.value.filter(v => v.status === 'available')
    )

    // 转化统计
    const conversionStats = computed(() => {
        const total = appointments.value.length
        const completed = appointments.value.filter(a => a.status === 'completed').length
        const converted = appointments.value.filter(a => a.convertedToSale === true).length
        return {
            total,
            completed,
            converted,
            rate: completed > 0 ? Math.round(converted / completed * 100) : 0
        }
    })

    // CRUD操作
    function addAppointment(appointment) {
        const id = Math.max(...appointments.value.map(a => a.id), 0) + 1
        appointments.value.unshift({
            ...appointment,
            id,
            status: 'pending',
            createTime: new Date().toISOString()
        })
        return id
    }

    function updateAppointment(id, updates) {
        const idx = appointments.value.findIndex(a => a.id === id)
        if (idx !== -1) {
            appointments.value[idx] = { ...appointments.value[idx], ...updates }
        }
    }

    function addFeedback(feedback) {
        const id = Math.max(...feedbackRecords.value.map(f => f.id), 0) + 1
        feedbackRecords.value.unshift({
            ...feedback,
            id,
            createTime: new Date().toISOString()
        })

        // 更新预约状态为已完成
        if (feedback.appointmentId) {
            updateAppointment(feedback.appointmentId, { status: 'completed' })
        }
    }

    // 添加试驾车辆
    function addTestDriveVehicle(vehicle) {
        const id = Math.max(...testDriveVehicles.value.map(v => v.id), 0) + 1
        testDriveVehicles.value.unshift({ ...vehicle, id })
    }

    // 更新试驾车辆状态
    function updateTestDriveVehicleStatus(id, status) {
        const idx = testDriveVehicles.value.findIndex(v => v.id === id)
        if (idx !== -1) {
            testDriveVehicles.value[idx].status = status
        }
    }

    return {
        appointments, testDriveVehicles, feedbackRecords,
        todayAppointments, upcomingAppointments, availableVehicles, conversionStats,
        addAppointment, updateAppointment, addFeedback, addTestDriveVehicle, updateTestDriveVehicleStatus
    }
}, {
    persist: {
        key: 'testdrive-store',
        storage: localStorage,
        paths: ['appointments', 'testDriveVehicles', 'feedbackRecords']
    }
})
