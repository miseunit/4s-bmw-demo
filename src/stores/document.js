import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDocumentStore = defineStore('document', () => {
    // 合格证管理
    const certificates = ref([
        {
            id: 1,
            vehicleId: 1,
            vin: 'WBAJB0C05LBW12345',
            modelName: '330Li M运动曜夜套装',
            certificateNo: 'CERT20250101001',
            receiveDate: '2025-03-15',
            status: 'in_stock',
            location: '财务室',
            expiryDate: ''
        },
        {
            id: 2,
            vehicleId: 2,
            vin: 'WBAJB0C05LBW23456',
            modelName: '530Li 领先型 M运动套装',
            certificateNo: 'CERT20250101002',
            receiveDate: '2025-03-10',
            status: 'in_stock',
            location: '财务室',
            expiryDate: ''
        }
    ])

    // 发票管理
    const invoices = ref([
        {
            id: 1,
            saleId: 1,
            vin: 'WBAJB0C05LBW67890',
            buyerName: '陈先生',
            buyerTaxNo: '',
            amount: 303000,
            invoiceType: '机动车销售统一发票',
            issueDate: '2025-02-20',
            status: 'issued',
            cancelReason: ''
        }
    ])

    // 证照到期提醒
    const expiryAlerts = ref([
        {
            id: 1,
            documentType: '临时牌照',
            vin: '京C·12345',
            documentNo: '临牌2025001',
            expiryDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
            remark: '需要及时办理正式牌照'
        },
        {
            id: 2,
            documentType: '交强险',
            vin: '京B·66666',
            documentNo: 'INS20250315001',
            expiryDate: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10),
            remark: '即将到期，需要续保'
        }
    ])

    // 证照借阅记录
    const borrowingRecords = ref([
        {
            id: 1,
            documentType: '合格证',
            documentNo: 'CERT20250101001',
            borrower: '李四',
            department: '销售部',
            borrowDate: '2025-03-20',
            returnDate: '2025-03-20',
            status: 'returned',
            remark: '用于车辆上牌'
        }
    ])

    // 计算属性 - 到期提醒
    const upcomingExpiries = computed(() => {
        const thirtyDaysLater = new Date()
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
        return expiryAlerts.value.filter(a => {
            if (!a.expiryDate) return false
            return new Date(a.expiryDate) <= thirtyDaysLater
        })
    })

    const expiredDocuments = computed(() => {
        const today = new Date().toISOString().slice(0, 10)
        return expiryAlerts.value.filter(a => a.expiryDate < today)
    })

    // 借阅中的证照
    const borrowedDocuments = computed(() => {
        return borrowingRecords.value.filter(r => r.status === 'borrowed')
    })

    // 从采购单创建合格证记录
    function createCertificateFromPurchase(purchaseRecord, vehicle) {
        addCertificate({
            vehicleId: vehicle.id,
            vin: vehicle.vin,
            modelName: vehicle.modelName,
            certificateNo: '',
            receiveDate: purchaseRecord.purchaseDate,
            status: 'in_stock',
            location: '财务室',
            expiryDate: ''
        })
    }

    // 从销售单创建发票记录
    function createInvoiceFromSale(saleRecord) {
        const totalAmount = saleRecord.salePrice + (saleRecord.tax || 0) + (saleRecord.insurance || 0) + (saleRecord.licenseFee || 0) + (saleRecord.decoration || 0) + (saleRecord.otherFee || 0)
        addInvoice({
            saleId: saleRecord.id,
            vin: saleRecord.vin,
            buyerName: saleRecord.buyerName,
            buyerTaxNo: '',
            amount: totalAmount,
            invoiceType: '机动车销售统一发票',
            issueDate: saleRecord.deliveryDate,
            status: 'issued',
            cancelReason: ''
        })
    }

    function addCertificate(cert) {
        const id = Math.max(...certificates.value.map(c => c.id), 0) + 1
        certificates.value.unshift({ ...cert, id })
    }

    function updateCertificate(id, updates) {
        const idx = certificates.value.findIndex(c => c.id === id)
        if (idx !== -1) {
            certificates.value[idx] = { ...certificates.value[idx], ...updates }
        }
    }

    function addInvoice(invoice) {
        const id = Math.max(...invoices.value.map(i => i.id), 0) + 1
        invoices.value.unshift({ ...invoice, id })
    }

    function updateInvoice(id, updates) {
        const idx = invoices.value.findIndex(i => i.id === id)
        if (idx !== -1) {
            invoices.value[idx] = { ...invoices.value[idx], ...updates }
        }
    }

    function addBorrowingRecord(record) {
        const id = Math.max(...borrowingRecords.value.map(r => r.id), 0) + 1
        borrowingRecords.value.unshift({
            ...record,
            id,
            status: 'borrowed',
            borrowDate: new Date().toISOString().slice(0, 10),
            returnDate: ''
        })
    }

    function returnDocument(id) {
        const idx = borrowingRecords.value.findIndex(r => r.id === id)
        if (idx !== -1) {
            borrowingRecords.value[idx] = {
                ...borrowingRecords.value[idx],
                status: 'returned',
                returnDate: new Date().toISOString().slice(0, 10)
            }
        }
    }

    function addExpiryAlert(alert) {
        const id = Math.max(...expiryAlerts.value.map(a => a.id), 0) + 1
        expiryAlerts.value.unshift({ ...alert, id })
    }

    return {
        certificates, invoices, expiryAlerts, borrowingRecords,
        upcomingExpiries, expiredDocuments, borrowedDocuments,
        createCertificateFromPurchase, createInvoiceFromSale,
        addCertificate, updateCertificate, addInvoice, updateInvoice,
        addBorrowingRecord, returnDocument, addExpiryAlert
    }
}, {
    persist: {
        key: 'document-store',
        storage: localStorage,
        paths: ['certificates', 'invoices', 'expiryAlerts', 'borrowingRecords']
    }
})
