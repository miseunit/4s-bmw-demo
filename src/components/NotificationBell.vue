<template>
    <el-popover placement="bottom-end" :width="380" trigger="click" @show="handleShow">
        <template #reference>
            <el-badge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0" :max="99">
                <el-icon class="bell-icon" :size="20"><Bell /></el-icon>
            </el-badge>
        </template>

        <div class="notification-panel">
            <div class="notification-header">
                <span class="notification-title">通知中心</span>
                <el-button v-if="notificationStore.unreadCount > 0" type="primary" link size="small" @click="notificationStore.markAllRead()">
                    全部已读
                </el-button>
            </div>

            <div class="notification-list" v-if="notificationStore.allNotifications.length > 0">
                <div
                    v-for="item in notificationStore.allNotifications"
                    :key="item.id"
                    class="notification-item"
                    :class="{ unread: !item.read }"
                    @click="handleClick(item)"
                >
                    <div class="notification-icon" :class="'type-' + item.type">
                        <el-icon :size="16">
                            <Warning v-if="item.type === 'warning'" />
                            <Clock v-else-if="item.type === 'overdue'" />
                            <Document v-else-if="item.type === 'expiry'" />
                            <User v-else-if="item.type === 'follow'" />
                            <Edit v-else />
                        </el-icon>
                    </div>
                    <div class="notification-body">
                        <div class="notification-item-title">{{ item.title }}</div>
                        <div class="notification-item-content">{{ item.content }}</div>
                    </div>
                    <div class="notification-dot" v-if="!item.read"></div>
                </div>
            </div>

            <div v-else class="notification-empty">
                <el-empty description="暂无通知" :image-size="60" />
            </div>

            <div class="notification-footer" v-if="notificationStore.allNotifications.some(n => n.read)">
                <el-button type="info" link size="small" @click="notificationStore.clearRead()">
                    清除已读
                </el-button>
            </div>
        </div>
    </el-popover>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();

// 组件挂载时生成通知
onMounted(() => {
    notificationStore.generateNotifications();
});

/** 面板展开时刷新通知数据 */
const handleShow = () => {
    notificationStore.generateNotifications();
};

/** 点击通知跳转 */
const handleClick = (item) => {
    notificationStore.markRead(item.id);
    if (item.route) {
        router.push(item.route);
    }
};
</script>

<style scoped>
.bell-icon {
    cursor: pointer;
    color: #666;
    transition: color 0.2s;
}
.bell-icon:hover {
    color: #0066B1;
}

.notification-panel {
    margin: -12px;
}
.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
}
.notification-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
}

.notification-list {
    max-height: 360px;
    overflow-y: auto;
}
.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.15s;
    border-bottom: 1px solid #fafafa;
}
.notification-item:hover {
    background-color: #f5f7fa;
}
.notification-item.unread {
    background-color: #f0f7ff;
}
.notification-item.unread:hover {
    background-color: #e6f2ff;
}

.notification-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.type-approval { background-color: #fff7e6; color: #d48806; }
.type-warning { background-color: #fff1f0; color: #cf1322; }
.type-overdue { background-color: #fff1f0; color: #cf1322; }
.type-expiry { background-color: #e6f7ff; color: #096dd9; }
.type-follow { background-color: #f6ffed; color: #389e0d; }

.notification-body {
    flex: 1;
    min-width: 0;
}
.notification-item-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 2px;
}
.notification-item-content {
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
}

.notification-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0066B1;
    margin-top: 6px;
}

.notification-empty {
    padding: 20px 0;
}
.notification-footer {
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
}
</style>
