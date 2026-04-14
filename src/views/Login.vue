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
            <div class="login-footer">
                <span>演示账号：任意用户名 / 密码均可登录</span>
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

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

/** 处理登录 */
const handleLogin = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    // 模拟网络延迟
    setTimeout(() => {
        userStore.login(form);
        ElMessage.success('登录成功');
        router.push('/dashboard');
        loading.value = false;
    }, 600);
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
.login-footer {
    text-align: center;
    font-size: 12px;
    color: #bbb;
}
</style>
