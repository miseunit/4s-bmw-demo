import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCrmStore = defineStore('crm', () => {
    // 客户档案
    const customers = ref([
        {
            id: 1,
            name: '张先生',
            phone: '138****1234',
            idCard: '110101199001011234',
            address: '北京市朝阳区',
            category: 'potential',
            tags: ['意向客户', '待跟进'],
            source: '到店',
            salesPerson: '张伟',
            purchaseHistory: [],
            nextFollowDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
            lastFollowDate: new Date().toISOString().slice(0, 10),
            remark: '对330Li感兴趣，预算40万左右',
            createTime: new Date().toISOString()
        },
        {
            id: 2,
            name: '李女士',
            phone: '139****5678',
            idCard: '110101198502025678',
            address: '上海市浦东新区',
            category: 'dealed',
            tags: ['成交客户', 'VIP'],
            source: '老客户介绍',
            salesPerson: '王芳',
            purchaseHistory: [
                {
                    saleId: 1,
                    vin: 'WBAJB0C05LBW12345',
                    modelName: '330Li M运动曜夜套装',
                    saleDate: '2024-12-15',
                    salePrice: 345000
                }
            ],
            nextFollowDate: '',
            lastFollowDate: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
            remark: '已购330Li，满意度很高，推荐朋友来',
            createTime: new Date(Date.now() - 86400000 * 30).toISOString()
        }
    ])

    // 客户跟进记录
    const followRecords = ref([
        {
            id: 1,
            customerId: 1,
            customerName: '张先生',
            followDate: new Date().toISOString().slice(0, 10),
            method: '到店',
            content: '客户到店看车，试驾了330Li，对车辆操控性能很满意，但对价格还有所顾虑',
            intention: 4,
            nextFollowDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
            nextPlan: '3天后回访，告知优惠活动信息',
            salesPerson: '张伟',
            createTime: new Date().toISOString()
        }
    ])

    // 客户标签选项
    const tagOptions = ref(['高价值', 'VIP', '流失客户', '待跟进', '意向客户', '老客户'])

    // 客户分类选项
    const categoryOptions = ref([
        { value: 'potential', label: '潜在客户' },
        { value: 'dealed', label: '成交客户' },
        { value: 'old', label: '老客户' }
    ])

    // 计算属性 - 按分类统计
    const potentialCustomers = computed(() =>
        customers.value.filter(c => c.category === 'potential')
    )
    const dealedCustomers = computed(() =>
        customers.value.filter(c => c.category === 'dealed')
    )
    const oldCustomers = computed(() =>
        customers.value.filter(c => c.category === 'old')
    )

    // 待跟进客户（下次跟进时间在7天内）
    const pendingFollowCustomers = computed(() => {
        const sevenDaysLater = new Date()
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
        return customers.value.filter(c => {
            if (!c.nextFollowDate) return false
            return new Date(c.nextFollowDate) <= sevenDaysLater
        })
    })

    // 超期未跟进客户（下次跟进时间已过期）
    const overdueFollowCustomers = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return customers.value.filter(c => {
            if (!c.nextFollowDate) return false
            return c.nextFollowDate < today
        })
    })

    // 标签颜色映射
    const tagColorMap = {
        '高价值': 'warning',
        'VIP': 'danger',
        '流失客户': 'info',
        '待跟进': undefined,
        '意向客户': 'success',
        '老客户': undefined,
    }

    // 根据手机号查找客户（用于销售单创建时自动关联）
    const getCustomerByPhone = (phone) => {
        return customers.value.find(c => c.phone === phone)
    }

    // 根据客户ID获取购车历史
    const getPurchaseHistoryByCustomerId = (customerId) => {
        const customer = customers.value.find(c => c.id === customerId)
        return customer?.purchaseHistory || []
    }

    // CRUD操作
    function addCustomer(customer) {
        const id = Math.max(...customers.value.map(c => c.id), 0) + 1
        customers.value.unshift({
            ...customer,
            id,
            createTime: new Date().toISOString(),
            purchaseHistory: []
        })
        return id
    }

    function updateCustomer(id, updates) {
        const idx = customers.value.findIndex(c => c.id === id)
        if (idx !== -1) {
            customers.value[idx] = { ...customers.value[idx], ...updates }
        }
    }

    function deleteCustomer(id) {
        const idx = customers.value.findIndex(c => c.id === id)
        if (idx !== -1) {
            customers.value.splice(idx, 1)
        }
    }

    function addFollowRecord(record) {
        const id = Math.max(...followRecords.value.map(r => r.id), 0) + 1
        followRecords.value.unshift({
            ...record,
            id,
            createTime: new Date().toISOString()
        })

        // 更新客户的下次跟进时间
        if (record.customerId && record.nextFollowDate) {
            updateCustomer(record.customerId, {
                nextFollowDate: record.nextFollowDate,
                lastFollowDate: record.followDate
            })
        }
    }

    // 从销售记录创建客户档案
    function createCustomerFromSale(saleRecord) {
        const existing = getCustomerByPhone(saleRecord.buyerPhone)
        if (existing) {
            // 更新现有客户的购车历史
            const history = existing.purchaseHistory || []
            history.push({
                saleId: saleRecord.id,
                vin: saleRecord.vin,
                modelName: saleRecord.modelName,
                saleDate: saleRecord.deliveryDate,
                salePrice: saleRecord.salePrice
            })
            updateCustomer(existing.id, {
                purchaseHistory: history,
                category: 'dealed' // 更新为成交客户
            })
            return existing.id
        } else {
            // 创建新客户
            return addCustomer({
                name: saleRecord.buyerName,
                phone: saleRecord.buyerPhone,
                idCard: saleRecord.buyerIdCard,
                address: '',
                category: 'dealed',
                tags: ['成交客户'],
                source: '销售录入',
                salesPerson: saleRecord.salesPerson,
                purchaseHistory: [{
                    saleId: saleRecord.id,
                    vin: saleRecord.vin,
                    modelName: saleRecord.modelName,
                    saleDate: saleRecord.deliveryDate,
                    salePrice: saleRecord.salePrice
                }],
                nextFollowDate: '',
                remark: ''
            })
        }
    }

    return {
        customers, followRecords, tagOptions, categoryOptions,
        potentialCustomers, dealedCustomers, oldCustomers, pendingFollowCustomers,
        overdueFollowCustomers, tagColorMap,
        getCustomerByPhone, getPurchaseHistoryByCustomerId,
        addCustomer, updateCustomer, deleteCustomer, addFollowRecord,
        createCustomerFromSale
    }
}, {
    persist: {
        key: 'crm-store',
        storage: localStorage,
        paths: ['customers', 'followRecords']
    }
})
