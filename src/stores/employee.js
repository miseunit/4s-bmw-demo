import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { initDB, getAll, add, update, remove, clear } from '../utils/indexedDB'

const STORE_NAME = 'employees'

// 部门选项
export const DEPARTMENTS = ['销售部', '售后部', '财务部', '行政部', '市场部', '人事部']

// 职位选项
export const POSITIONS = ['销售顾问', '销售经理', '店长', '财务', '技师', '行政专员', '市场专员', '人事专员']

// 在职状态
export const STATUS_OPTIONS = ['在职', '离职']

/** 预置初始员工数据 */
const INITIAL_EMPLOYEES = [
    { id: 'emp-001', name: '张伟', gender: '男', phone: '13800138001', email: 'zhangwei@bmw.com', department: '销售部', position: '店长', status: '在职', hireDate: '2020-03-15', salary: 25000, remark: '负责全店运营管理', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-002', name: '李娜', gender: '女', phone: '13800138002', email: 'lina@bmw.com', department: '销售部', position: '销售经理', status: '在职', hireDate: '2021-06-01', salary: 18000, remark: '负责销售团队管理', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-003', name: '王磊', gender: '男', phone: '13800138003', email: 'wanglei@bmw.com', department: '销售部', position: '销售顾问', status: '在职', hireDate: '2022-01-10', salary: 8000, remark: '', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-004', name: '赵敏', gender: '女', phone: '13800138004', email: 'zhaomin@bmw.com', department: '销售部', position: '销售顾问', status: '在职', hireDate: '2022-05-20', salary: 7500, remark: '', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-005', name: '陈刚', gender: '男', phone: '13800138005', email: 'chengang@bmw.com', department: '售后部', position: '技师', status: '在职', hireDate: '2021-03-01', salary: 12000, remark: 'BMW 认证技师', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-006', name: '刘洋', gender: '男', phone: '13800138006', email: 'liuyang@bmw.com', department: '售后部', position: '技师', status: '在职', hireDate: '2022-08-15', salary: 10000, remark: '机电维修专长', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-007', name: '孙丽', gender: '女', phone: '13800138007', email: 'sunli@bmw.com', department: '财务部', position: '财务', status: '在职', hireDate: '2020-09-01', salary: 15000, remark: '', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-008', name: '周婷', gender: '女', phone: '13800138008', email: 'zhouting@bmw.com', department: '行政部', position: '行政专员', status: '在职', hireDate: '2023-02-14', salary: 6000, remark: '', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'emp-009', name: '吴强', gender: '男', phone: '13800138009', email: 'wuqiang@bmw.com', department: '销售部', position: '销售顾问', status: '离职', hireDate: '2021-11-01', salary: 7000, remark: '2024年3月离职', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-03-15T08:00:00.000Z' },
    { id: 'emp-010', name: '郑凯', gender: '男', phone: '13800138010', email: 'zhengkai@bmw.com', department: '市场部', position: '市场专员', status: '在职', hireDate: '2023-07-01', salary: 9000, remark: '负责线上营销', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
]

/** 初始化 IndexedDB 并加载员工数据 */
async function initEmployeeDB() {
    await initDB(STORE_NAME, {
        keyPath: 'id',
        indexes: [
            { name: 'department', keyPath: 'department' },
            { name: 'position', keyPath: 'position' },
            { name: 'status', keyPath: 'status' },
            { name: 'name', keyPath: 'name' },
        ]
    })
    // 检查是否已有数据，无则插入初始数据
    const existing = await getAll(STORE_NAME)
    if (existing.length === 0) {
        for (const emp of INITIAL_EMPLOYEES) {
            await add(STORE_NAME, emp)
        }
    }
}

export const useEmployeeStore = defineStore('employee', () => {
    const employees = ref([])
    const loading = ref(false)

    // 计算属性
    const activeEmployees = computed(() => employees.value.filter(e => e.status === '在职'))
    const activeCount = computed(() => activeEmployees.value.length)
    const totalCount = computed(() => employees.value.length)
    const resignedCount = computed(() => employees.value.filter(e => e.status === '离职').length)
    const departmentCount = computed(() => {
        const map = {}
        employees.value.filter(e => e.status === '在职').forEach(e => {
            map[e.department] = (map[e.department] || 0) + 1
        })
        return map
    })

    /** 从 IndexedDB 加载员工数据 */
    async function loadEmployees() {
        loading.value = true
        try {
            await initEmployeeDB()
            employees.value = await getAll(STORE_NAME)
        } finally {
            loading.value = false
        }
    }

    /** 新增员工 */
    async function addEmployee(employee) {
        const now = new Date().toISOString()
        const newEmp = {
            ...employee,
            id: 'emp-' + crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        }
        await add(STORE_NAME, newEmp)
        employees.value.unshift(newEmp)
        return newEmp
    }

    /** 更新员工 */
    async function updateEmployee(id, updates) {
        const idx = employees.value.findIndex(e => e.id === id)
        if (idx === -1) return
        const updated = {
            ...employees.value[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
        }
        await update(STORE_NAME, updated)
        employees.value[idx] = updated
    }

    /** 删除员工 */
    async function deleteEmployee(id) {
        await remove(STORE_NAME, id)
        employees.value = employees.value.filter(e => e.id !== id)
    }

    /** 导入员工数据（覆盖写入） */
    async function importEmployees(data) {
        await clear(STORE_NAME)
        for (const emp of data) {
            await add(STORE_NAME, emp)
        }
        employees.value = await getAll(STORE_NAME)
    }

    return {
        employees,
        loading,
        activeEmployees,
        activeCount,
        totalCount,
        resignedCount,
        departmentCount,
        loadEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        importEmployees,
    }
})
