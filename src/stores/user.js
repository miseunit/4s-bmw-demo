import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 用户认证状态管理
 * 当前为 Mock 模式，登录不做真实鉴权，仅模拟用户信息
 */
export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '');
    const userInfo = ref({
        name: '张伟',
        role: '销售顾问',
        avatar: '',
    });

    /** 是否已登录 */
    const isLoggedIn = computed(() => !!token.value);

    /**
     * 模拟登录
     * @param {object} form - 登录表单 { username, password }
     */
    const login = (form) => {
        // Mock 模式：任意账号密码均可登录
        token.value = 'mock-token-' + Date.now();
        localStorage.setItem('token', token.value);

        // 根据用户名模拟不同角色
        const roles = ['销售顾问', '销售经理', '店长', '财务'];
        const roleIndex = form.username.length % roles.length;
        userInfo.value = {
            name: form.username || '张伟',
            role: roles[roleIndex],
            avatar: '',
        };
    };

    /** 退出登录 */
    const logout = () => {
        token.value = '';
        localStorage.removeItem('token');
        userInfo.value = { name: '', role: '', avatar: '' };
    };

    return { token, userInfo, isLoggedIn, login, logout };
}, {
    persist: {
        pick: ['token', 'userInfo'],
    },
});
