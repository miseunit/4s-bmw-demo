<template>
    <div class="login-wrapper">
        <div class="login-bg"></div>
        <div class="login-card">
            <div class="login-header">
                <img src="https://www.bmw.com.cn/etc.clientlibs/ds2-webcomponents/clientlibs/clientlib/resources/img/BMW_White_Logo.svg" alt="BMW" class="login-logo" />
                <h1 class="login-title">BMW 车辆管理系统</h1>
                <p class="login-subtitle">4S 经销商综合管理平台</p>
            </div>
            <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @keyup.enter="handleLogin">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password />
                </el-form-item>
                <el-form-item>
                    <div class="login-options">
                        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
                        登 录
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 快速登录 -->
            <div class="quick-login">
                <div class="quick-login-title">快速登录（演示账号）</div>
                <div class="quick-login-buttons">
                    <el-button
                        v-for="account in demoAccounts"
                        :key="account.username"
                        :type="account.type"
                        size="small"
                        @click="quickLogin(account)"
                    >
                        {{ account.label }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
    username: '',
    password: '',
});

// 预置演示账号
const demoAccounts = [
    { username: 'admin', password: '123456', label: '管理员', type: 'danger' },
    { username: 'sale01', password: '123456', label: '销售-张伟', type: 'primary' },
    { username: 'sale02', password: '123456', label: '销售-李娜', type: 'primary' },
    { username: 'finance01', password: '123456', label: '财务-孙丽', type: 'warning' },
    { username: 'service01', password: '123456', label: '售后-陈刚', type: 'success' },
];

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

/** 快速登录 */
const quickLogin = async (account) => {
    form.username = account.username;
    form.password = account.password;
    await handleLogin();
};

/** 处理登录 */
const handleLogin = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        const result = await userStore.login({
            username: form.username.trim(),
            password: form.password.trim(),
        });
        if (result === true) {
            ElMessage.success('登录成功');
            const redirect = router.currentRoute.value.query.redirect || '/dashboard';
            router.push(redirect);
        } else if (result === 'disabled') {
            ElMessage.error('该账号已被禁用，请联系管理员');
        } else {
            ElMessage.error('用户名或密码错误');
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-wrapper {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.login-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #001E50 0%, #003380 40%, #0066B1 100%);
    z-index: 0;
}
/* 背景装饰 */
.login-bg::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
}
.login-bg::after {
    content: '';
    position: absolute;
    bottom: -15%;
    left: -5%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
}
.login-card {
    position: relative;
    z-index: 1;
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.login-header {
    text-align: center;
    margin-bottom: 32px;
}
.login-logo {
    height: 40px;
    margin-bottom: 16px;
}
.login-title {
    font-size: 22px;
    font-weight: 600;
    color: #001E50;
    margin-bottom: 4px;
}
.login-subtitle {
    font-size: 13px;
    color: #999;
}
.login-form {
    margin-bottom: 16px;
}
.login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    letter-spacing: 4px;
    background-color: #001E50;
    border-color: #001E50;
}
.login-btn:hover {
    background-color: #003380;
    border-color: #003380;
}

/* 快速登录 */
.quick-login {
    border-top: 1px solid #eee;
    padding-top: 16px;
}
.quick-login-title {
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
    text-align: center;
}
.quick-login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.quick-login-buttons .el-button {
    flex: 1;
    min-width: calc(50% - 4px);
}
</style>
