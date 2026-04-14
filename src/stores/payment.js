import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePaymentStore = defineStore('payment', () => {
    // 收款计划
    const paymentPlans = ref([
        // 测试数据 - 一些待收款计划
        {
            id: 1,
            saleId: null,
            buyerName: '张先生',
            buyerPhone: '138****1234',
            planType: 'full',
            planName: '全款',
            amount: 352000,
            dueDate: new Date().toISOString().slice(0, 10),
            paid: false,
            paidAmount: 0
        },
        {
            id: 2,
            saleId: null,
            buyerName: '李女士',
            buyerPhone: '139****5678',
            planType: 'down',
            planName: '首付',
            amount: 150000,
            dueDate: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10), // 5天前
            paid: false,
            paidAmount: 0
        }
    ])

    // 实际收款记录
    const paymentRecords = ref([])

    // 欠款跟踪
    const overdueRecords = ref([])

    // 催收记录
    const collectionRecords = ref([])

    // 计算属性
    const pendingPayments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return paymentPlans.value.filter(p => !p.paid && p.dueDate <= today)
    })

    const overduePayments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return paymentPlans.value.filter(p => !p.paid && p.dueDate < today)
    })

    const totalOverdueAmount = computed(() => {
        return overduePayments.value.reduce((sum, p) => sum + (p.amount - (p.paidAmount || 0)), 0)
    })

    // 今日收款统计
    const todayPayments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return paymentRecords.value.filter(r => r.paymentDate === today)
    })

    const todayPaymentAmount = computed(() => {
        return todayPayments.value.reduce((sum, r) => sum + r.amount, 0)
    })

    // 从销售单创建收款计划
    function createPaymentPlanFromSale(saleRecord) {
        const plans = []
        const { id, buyerName, buyerPhone, salePrice, paymentMethod, downPayment, deliveryDate, tax, insurance, licenseFee, decoration, otherFee } = saleRecord

        // 计算应收总额
        const totalFee = (tax || 0) + (insurance || 0) + (licenseFee || 0) + (decoration || 0) + (otherFee || 0)
        const totalAmount = salePrice + totalFee

        if (paymentMethod === 'full') {
            // 全款：一次性收款
            plans.push({
                saleId: id,
                buyerName,
                buyerPhone,
                planType: 'full',
                planName: '全款',
                amount: totalAmount,
                dueDate: deliveryDate,
                paid: false,
                paidAmount: 0
            })
        } else {
            // 按揭：首付 + 贷款（贷款部分由金融公司直接放款，这里只记录首付和费用）
            plans.push({
                saleId: id,
                buyerName,
                buyerPhone,
                planType: 'down',
                planName: '首付',
                amount: downPayment + totalFee,
                dueDate: deliveryDate,
                paid: false,
                paidAmount: 0
            })
        }

        plans.forEach(plan => addPaymentPlan(plan))
        return plans
    }

    function addPaymentPlan(plan) {
        const id = Math.max(...paymentPlans.value.map(p => p.id), 0) + 1
        paymentPlans.value.unshift({ ...plan, id })
    }

    function addPaymentRecord(record) {
        const id = Math.max(...paymentRecords.value.map(r => r.id), 0) + 1
        paymentRecords.value.unshift({ ...record, id })

        // 更新收款计划状态
        const plan = paymentPlans.value.find(p => p.id === record.planId)
        if (plan) {
            const newPaidAmount = (plan.paidAmount || 0) + record.amount
            const fullyPaid = newPaidAmount >= plan.amount
            updatePaymentPlan(plan.id, {
                paidAmount: newPaidAmount,
                paid: fullyPaid
            })
        }
    }

    function updatePaymentPlan(id, updates) {
        const idx = paymentPlans.value.findIndex(p => p.id === id)
        if (idx !== -1) {
            paymentPlans.value[idx] = { ...paymentPlans.value[idx], ...updates }
        }
    }

    function addCollectionRecord(record) {
        const id = Math.max(...collectionRecords.value.map(r => r.id), 0) + 1
        collectionRecords.value.unshift({
            ...record,
            id,
            createTime: new Date().toISOString()
        })
    }

    return {
        paymentPlans, paymentRecords, overdueRecords, collectionRecords,
        pendingPayments, overduePayments, totalOverdueAmount, todayPayments, todayPaymentAmount,
        createPaymentPlanFromSale, addPaymentPlan, addPaymentRecord, updatePaymentPlan, addCollectionRecord
    }
}, {
    persist: {
        key: 'payment-store',
        storage: localStorage,
        paths: ['paymentPlans', 'paymentRecords', 'overdueRecords', 'collectionRecords']
    }
})
