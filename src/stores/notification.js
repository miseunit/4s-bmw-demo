import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useVehicleStore } from './vehicle';
import { useCrmStore } from './crm';
import { usePaymentStore } from './payment';
import { useDocumentStore } from './document';

/**
 * 全局通知中心
 * 从各业务 Store 聚合待办数据生成通知
 */
export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]);
    let _idCounter = 0;

    /** 未读数 */
    const unreadCount = computed(() =>
        notifications.value.filter(n => !n.read).length
    );

    /** 所有通知（按时间倒序） */
    const allNotifications = computed(() =>
        [...notifications.value].sort((a, b) =>
            new Date(b.createTime) - new Date(a.createTime)
        )
    );

    /**
     * 从各业务 Store 聚合待办数据，生成通知
     * 保留已读状态，合并新增/移除已不存在的通知
     */
    const generateNotifications = () => {
        const vehicleStore = useVehicleStore();
        const crmStore = useCrmStore();
        const paymentStore = usePaymentStore();
        const documentStore = useDocumentStore();

        const newItems = [];

        // 调价待审批
        if (vehicleStore.pendingPriceAdjust) {
            newItems.push({
                type: 'approval',
                title: '调价待审批',
                content: `${vehicleStore.pendingPriceAdjust} 条调价申请等待审批`,
                route: '/price-adjust',
            });
        }

        // 车辆滞销预警
        if (vehicleStore.longUnsoldVehicles > 0) {
            newItems.push({
                type: 'warning',
                title: '车辆滞销预警',
                content: `${vehicleStore.longUnsoldVehicles} 台车辆库存超过 30 天未售出`,
                route: '/inventory',
            });
        }

        // 回款逾期
        if (paymentStore.overduePayments?.length > 0) {
            newItems.push({
                type: 'overdue',
                title: '回款逾期提醒',
                content: `${paymentStore.overduePayments.length} 笔收款已逾期，逾期金额 ¥${paymentStore.totalOverdueAmount.toLocaleString()}`,
                route: '/payment',
            });
        }

        // 证照到期
        if (documentStore.upcomingExpiries?.length > 0) {
            newItems.push({
                type: 'expiry',
                title: '证照到期提醒',
                content: `${documentStore.upcomingExpiries.length} 份证照将在 30 天内到期`,
                route: '/document',
            });
        }

        // 客户跟进提醒
        if (crmStore.pendingFollowCustomers?.length > 0) {
            newItems.push({
                type: 'follow',
                title: '客户跟进提醒',
                content: `${crmStore.pendingFollowCustomers.length} 位客户需要在 7 天内跟进`,
                route: '/customer',
            });
        }

        // 合并策略：用 type 作为 key，保留已读状态
        const readMap = {};
        notifications.value.forEach(n => {
            if (n.read) readMap[n.type] = true;
        });

        const now = new Date().toISOString();
        notifications.value = newItems.map(item => ({
            id: ++_idCounter,
            ...item,
            read: readMap[item.type] || false,
            createTime: now,
        }));
    };

    /** 标记单条已读 */
    const markRead = (id) => {
        const item = notifications.value.find(n => n.id === id);
        if (item) item.read = true;
    };

    /** 全部标记已读 */
    const markAllRead = () => {
        notifications.value.forEach(n => { n.read = true; });
    };

    /** 清除已读通知 */
    const clearRead = () => {
        notifications.value = notifications.value.filter(n => !n.read);
    };

    return {
        notifications,
        unreadCount,
        allNotifications,
        generateNotifications,
        markRead,
        markAllRead,
        clearRead,
    };
});
