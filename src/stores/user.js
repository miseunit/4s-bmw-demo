import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { initDB, getAll, add, update, remove as dbRemove } from '../utils/indexedDB';

const STORE_NAME = 'users';

// 角色列表
export const ROLES = ['管理员', '销售', '财务', '售后'];

// 角色标签颜色
export const ROLE_TAG_TYPE = {
    '管理员': 'danger',
    '销售': 'primary',
    '财务': 'warning',
    '售后': 'success',
};

// 路由权限映射：每个路由允许访问的角色（undefined 表示全部角色可访问）
export const ROUTE_PERMISSIONS = {
    '/dashboard': undefined,
    '/inventory': ['管理员', '销售'],
    '/purchase': ['管理员', '销售'],
    '/purchase/new': ['管理员', '销售'],
    '/sale': ['管理员', '销售'],
    '/price-adjust': ['管理员'],
    '/car-model': ['管理员', '销售'],
    '/customer': ['管理员', '销售'],
    '/test-drive': ['管理员', '销售'],
    '/payment': ['管理员', '财务'],
    '/profit': ['管理员', '财务'],
    '/document': ['管理员'],
    '/repair': ['管理员', '售后'],
    '/operation-log': ['管理员'],
    '/base-data': ['管理员'],
    '/base-data/vehicle-brand': ['管理员'],
    '/base-data/supplier': ['管理员'],
    '/base-data/part-category': ['管理员'],
    '/base-data/part-brand': ['管理员'],
    '/base-data/part-inventory': ['管理员'],
    '/employee': ['管理员'],
    '/user-manage': ['管理员'],
};

// 预置用户
const DEFAULT_USERS = [
    { id: 'user-001', username: 'admin', password: '123456', name: '系统管理员', role: '管理员', status: '启用', createdAt: '2024-01-01T08:00:00.000Z' },
    { id: 'user-002', username: 'sale01', password: '123456', name: '张伟', role: '销售', status: '启用', createdAt: '2024-01-01T08:00:00.000Z' },
    { id: 'user-003', username: 'sale02', password: '123456', name: '李娜', role: '销售', status: '启用', createdAt: '2024-01-01T08:00:00.000Z' },
    { id: 'user-004', username: 'finance01', password: '123456', name: '孙丽', role: '财务', status: '启用', createdAt: '2024-01-01T08:00:00.000Z' },
    { id: 'user-005', username: 'service01', password: '123456', name: '陈刚', role: '售后', status: '启用', createdAt: '2024-01-01T08:00:00.000Z' },
];

/** 初始化用户数据库 */
async function initUserDB() {
    await initDB(STORE_NAME, {
        keyPath: 'id',
        indexes: [
            { name: 'username', keyPath: 'username', options: { unique: true } },
            { name: 'role', keyPath: 'role' },
        ]
    });
    const existing = await getAll(STORE_NAME);
    if (existing.length === 0) {
        for (const user of DEFAULT_USERS) {
            await add(STORE_NAME, user);
        }
    }
}

/**
 * 用户认证与权限管理
 * 用户数据存储在 IndexedDB，登录时验证账号密码
 */
export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '');
    const currentUser = ref(null);
    const users = ref([]);
    const loading = ref(false);

    /** 是否已登录 */
    const isLoggedIn = computed(() => !!token.value);

    /** 当前用户角色 */
    const currentRole = computed(() => currentUser.value?.role || '');

    /** 是否是管理员 */
    const isAdmin = computed(() => currentRole.value === '管理员');

    /**
     * 登录验证
     * @param {object} form - { username, password }
     * @returns {Promise<boolean>}
     */
    const login = async (form) => {
        const allUsers = await getAll(STORE_NAME);
        const user = allUsers.find(
            u => u.username === form.username && u.password === form.password
        );
        if (!user) return false;
        if (user.status === '禁用') return 'disabled';

        token.value = 'token-' + Date.now();
        localStorage.setItem('token', token.value);
        currentUser.value = { ...user };
        return true;
    };

    /** 退出登录 */
    const logout = () => {
        token.value = '';
        localStorage.removeItem('token');
        currentUser.value = null;
    };

    /** 加载所有用户列表（管理页面用） */
    const loadUsers = async () => {
        loading.value = true;
        try {
            await initUserDB();
            users.value = await getAll(STORE_NAME);
        } finally {
            loading.value = false;
        }
    };

    /** 新增用户 */
    const addUser = async (userData) => {
        const newUser = {
            ...userData,
            id: 'user-' + crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        await add(STORE_NAME, newUser);
        users.value.push(newUser);
        return newUser;
    };

    /** 更新用户 */
    const updateUser = async (id, updates) => {
        const idx = users.value.findIndex(u => u.id === id);
        if (idx === -1) return;
        const updated = { ...users.value[idx], ...updates };
        await update(STORE_NAME, updated);
        users.value[idx] = updated;
        // 如果修改的是当前登录用户，同步更新
        if (currentUser.value?.id === id) {
            currentUser.value = { ...currentUser.value, ...updates };
        }
    };

    /** 删除用户 */
    const deleteUser = async (id) => {
        await dbRemove(STORE_NAME, id);
        users.value = users.value.filter(u => u.id !== id);
    };

    /** 导入用户数据（覆盖） */
    const importUsers = async (data) => {
        const { clear } = await import('../utils/indexedDB');
        await clear(STORE_NAME);
        for (const item of data) {
            await add(STORE_NAME, item);
        }
        users.value = await getAll(STORE_NAME);
    };

    /** 判断当前用户是否有权访问指定路由 */
    const hasPermission = (path) => {
        if (isAdmin.value) return true;
        // 匹配精确路径或前缀
        const matchPath = Object.keys(ROUTE_PERMISSIONS).find(p => path === p || path.startsWith(p + '/'));
        const allowedRoles = ROUTE_PERMISSIONS[matchPath];
        // undefined 表示全部角色可访问
        if (allowedRoles === undefined) return true;
        return allowedRoles.includes(currentRole.value);
    };

    /** 应用启动时初始化 */
    const init = async () => {
        await initUserDB();
    };

    return {
        token, currentUser, users, loading,
        isLoggedIn, currentRole, isAdmin,
        login, logout,
        loadUsers, addUser, updateUser, deleteUser, importUsers,
        hasPermission, init,
    };
}, {
    persist: {
        pick: ['token', 'currentUser'],
    },
});
