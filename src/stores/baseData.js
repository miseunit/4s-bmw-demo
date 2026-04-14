import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBaseDataStore = defineStore('baseData', () => {
    // ========== 车辆品牌 ==========
    const vehicleBrands = ref([
        { id: 1, name: 'BMW', nameEn: 'BMW', logo: '', country: '德国', status: 'active' },
        { id: 2, name: '奔驰', nameEn: 'Mercedes-Benz', logo: '', country: '德国', status: 'active' },
        { id: 3, name: '奥迪', nameEn: 'Audi', logo: '', country: '德国', status: 'active' },
        { id: 4, name: '特斯拉', nameEn: 'Tesla', logo: '', country: '美国', status: 'active' }
    ])

    // ========== 车身类型 ==========
    const bodyTypes = ref([
        { id: 1, name: '轿车', nameEn: 'Sedan', status: 'active' },
        { id: 2, name: 'SUV', nameEn: 'SUV', status: 'active' },
        { id: 3, name: 'MPV', nameEn: 'MPV', status: 'active' },
        { id: 4, name: '跑车', nameEn: 'Sports Car', status: 'active' },
        { id: 5, name: '皮卡', nameEn: 'Pickup', status: 'active' }
    ])

    // ========== 车辆级别 ==========
    const vehicleLevels = ref([
        { id: 1, name: '微型车', nameEn: 'Mini', status: 'active' },
        { id: 2, name: '小型车', nameEn: 'Compact', status: 'active' },
        { id: 3, name: '紧凑型', nameEn: 'Subcompact', status: 'active' },
        { id: 4, name: '中型', nameEn: 'Mid-size', status: 'active' },
        { id: 5, name: '中大型', nameEn: 'Full-size', status: 'active' },
        { id: 6, name: '豪华型', nameEn: 'Luxury', status: 'active' },
        { id: 7, name: '全尺寸', nameEn: 'Large', status: 'active' }
    ])

    // ========== 发动机类型 ==========
    const engineTypes = ref([
        { id: 1, name: '纯电', nameEn: 'Electric', status: 'active' },
        { id: 2, name: '插电混动', nameEn: 'PHEV', status: 'active' },
        { id: 3, name: '增程式', nameEn: 'REEV', status: 'active' },
        { id: 4, name: '油电混动', nameEn: 'HEV', status: 'active' },
        { id: 5, name: '汽油', nameEn: 'Gasoline', status: 'active' },
        { id: 6, name: '柴油', nameEn: 'Diesel', status: 'active' }
    ])

    // ========== 变速箱类型 ==========
    const gearboxTypes = ref([
        { id: 1, name: '手动挡', nameEn: 'MT', status: 'active' },
        { id: 2, name: '自动挡', nameEn: 'AT', status: 'active' },
        { id: 3, name: '双离合', nameEn: 'DCT', status: 'active' },
        { id: 4, name: 'CVT', nameEn: 'CVT', status: 'active' },
        { id: 5, name: 'E-CVT', nameEn: 'E-CVT', status: 'active' },
        { id: 6, name: '单速', nameEn: 'Single-speed', status: 'active' }
    ])

    // ========== 驱动方式 ==========
    const driveModes = ref([
        { id: 1, name: '前驱', nameEn: 'FWD', status: 'active' },
        { id: 2, name: '后驱', nameEn: 'RWD', status: 'active' },
        { id: 3, name: '四驱', nameEn: 'AWD', status: 'active' }
    ])

    // ========== 配件分类 ==========
    const partCategories = ref([
        { id: 1, name: '外观改装', nameEn: 'Exterior', icon: '', status: 'active' },
        { id: 2, name: '内饰改装', nameEn: 'Interior', icon: '', status: 'active' },
        { id: 3, name: '性能改装', nameEn: 'Performance', icon: '', status: 'active' },
        { id: 4, name: '电子电器', nameEn: 'Electronics', icon: '', status: 'active' },
        { id: 5, name: '养护用品', nameEn: 'Maintenance', icon: '', status: 'active' },
        { id: 6, name: '轮胎轮毂', nameEn: 'Wheels', icon: '', status: 'active' }
    ])

    // ========== 配件品牌 ==========
    const partBrands = ref([
        { id: 1, name: 'AC Schnitzer', nameEn: 'AC Schnitzer', country: '德国', logo: '', status: 'active' },
        { id: 2, name: 'AMG', nameEn: 'AMG', country: '德国', logo: '', status: 'active' },
        { id: 3, name: 'BRABUS', nameEn: 'BRABUS', country: '德国', logo: '', status: 'active' },
        { id: 4, name: '哈曼卡顿', nameEn: 'Harman Kardon', country: '美国', logo: '', status: 'active' },
        { id: 5, name: 'Bowers & Wilkins', nameEn: 'B&W', country: '英国', logo: '', status: 'active' }
    ])

    // ========== 配件列表 ==========
    const parts = ref([
        {
            id: 1,
            categoryId: 1,
            brandId: 1,
            name: '碳纤维前唇',
            partNo: 'AC-001',
            price: 5800,
            unit: '套',
            stock: 3,
            status: 'active'
        },
        {
            id: 2,
            categoryId: 2,
            brandId: 4,
            name: '哈曼卡顿音响系统',
            partNo: 'HK-H60',
            price: 28000,
            unit: '套',
            stock: 1,
            status: 'active'
        }
    ])

    // ========== 计算属性 ==========
    const activeVehicleBrands = computed(() => vehicleBrands.value.filter(b => b.status === 'active'))
    const activePartCategories = computed(() => partCategories.value.filter(c => c.status === 'active'))
    const activePartBrands = computed(() => partBrands.value.filter(b => b.status === 'active'))
    const activeParts = computed(() => parts.value.filter(p => p.status === 'active'))

    // ========== CRUD 操作 ==========
    // 车辆品牌
    function addVehicleBrand(brand) {
        const id = Math.max(...vehicleBrands.value.map(b => b.id), 0) + 1
        vehicleBrands.value.unshift({ ...brand, id, status: 'active' })
        return id
    }

    function updateVehicleBrand(id, updates) {
        const idx = vehicleBrands.value.findIndex(b => b.id === id)
        if (idx !== -1) {
            vehicleBrands.value[idx] = { ...vehicleBrands.value[idx], ...updates }
        }
    }

    function deleteVehicleBrand(id) {
        const idx = vehicleBrands.value.findIndex(b => b.id === id)
        if (idx !== -1) {
            vehicleBrands.value.splice(idx, 1)
        }
    }

    // 配件分类
    function addPartCategory(category) {
        const id = Math.max(...partCategories.value.map(c => c.id), 0) + 1
        partCategories.value.unshift({ ...category, id, status: 'active' })
        return id
    }

    function updatePartCategory(id, updates) {
        const idx = partCategories.value.findIndex(c => c.id === id)
        if (idx !== -1) {
            partCategories.value[idx] = { ...partCategories.value[idx], ...updates }
        }
    }

    function deletePartCategory(id) {
        const idx = partCategories.value.findIndex(c => c.id === id)
        if (idx !== -1) {
            partCategories.value.splice(idx, 1)
        }
    }

    // 配件品牌
    function addPartBrand(brand) {
        const id = Math.max(...partBrands.value.map(b => b.id), 0) + 1
        partBrands.value.unshift({ ...brand, id, status: 'active' })
        return id
    }

    function updatePartBrand(id, updates) {
        const idx = partBrands.value.findIndex(b => b.id === id)
        if (idx !== -1) {
            partBrands.value[idx] = { ...partBrands.value[idx], ...updates }
        }
    }

    function deletePartBrand(id) {
        const idx = partBrands.value.findIndex(b => b.id === id)
        if (idx !== -1) {
            partBrands.value.splice(idx, 1)
        }
    }

    // 配件
    function addPart(part) {
        const id = Math.max(...parts.value.map(p => p.id), 0) + 1
        parts.value.unshift({ ...part, id, status: 'active' })
        return id
    }

    function updatePart(id, updates) {
        const idx = parts.value.findIndex(p => p.id === id)
        if (idx !== -1) {
            parts.value[idx] = { ...parts.value[idx], ...updates }
        }
    }

    function deletePart(id) {
        const idx = parts.value.findIndex(p => p.id === id)
        if (idx !== -1) {
            parts.value.splice(idx, 1)
        }
    }

    return {
        vehicleBrands, bodyTypes, vehicleLevels, engineTypes, gearboxTypes, driveModes,
        partCategories, partBrands, parts,
        activeVehicleBrands, activePartCategories, activePartBrands, activeParts,
        addVehicleBrand, updateVehicleBrand, deleteVehicleBrand,
        addPartCategory, updatePartCategory, deletePartCategory,
        addPartBrand, updatePartBrand, deletePartBrand,
        addPart, updatePart, deletePart
    }
}, {
    persist: {
        key: 'basedata-store',
        storage: localStorage,
        paths: [
            'vehicleBrands', 'bodyTypes', 'vehicleLevels', 'engineTypes', 'gearboxTypes', 'driveModes',
            'partCategories', 'partBrands', 'parts'
        ]
    }
})
