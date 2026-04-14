<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-area">
        <img src="https://www.bmw.com.cn/etc.clientlibs/ds2-webcomponents/clientlibs/clientlib/resources/img/BMW_White_Logo.svg" alt="BMW" class="logo-img" v-if="!isCollapse" />
        <!-- <img src="https://youjia.cdn.bcebos.com/youjia_logo/2020-4/1587871592416/ec5175890e6d.png" alt="BMW" class="logo-img" v-if="!isCollapse" /> -->
        <span v-if="!isCollapse" class="logo-text">BMW 车辆管理系统</span>
        <span v-else class="logo-text-mini">B</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="side-menu"
        background-color="#001E50"
        text-color="#ffffffb3"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>首页看板</template>
        </el-menu-item>

        <!-- 库存管理 -->
        <el-sub-menu index="inventory-group">
          <template #title>
            <el-icon><Van /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory">
            <el-icon><List /></el-icon>
            <template #title>车辆库存台账</template>
          </el-menu-item>
          <el-menu-item index="/car-model">
            <el-icon><Goods /></el-icon>
            <template #title>车型库管理</template>
          </el-menu-item>
          <el-menu-item index="/purchase">
            <el-icon><ShoppingCart /></el-icon>
            <template #title>买入入库</template>
          </el-menu-item>
          <el-menu-item index="/sale">
            <el-icon><Sell /></el-icon>
            <template #title>卖出出库</template>
          </el-menu-item>
          <el-menu-item index="/price-adjust">
            <el-icon><PriceTag /></el-icon>
            <template #title>调价管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 客户管理 -->
        <el-sub-menu index="customer-group">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customer">
            <el-icon><Avatar /></el-icon>
            <template #title>客户管理</template>
          </el-menu-item>
          <el-menu-item index="/test-drive">
            <el-icon><Key /></el-icon>
            <template #title>试驾管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 财务管理 -->
        <el-sub-menu index="finance-group">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/payment">
            <el-icon><Wallet /></el-icon>
            <template #title>收款管理</template>
          </el-menu-item>
          <el-menu-item index="/profit">
            <el-icon><TrendCharts /></el-icon>
            <template #title>利润统计</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 运营管理 -->
        <el-sub-menu index="operation-group">
          <template #title>
            <el-icon><SetUp /></el-icon>
            <span>运营管理</span>
          </template>
          <el-menu-item index="/document">
            <el-icon><Files /></el-icon>
            <template #title>证照管理</template>
          </el-menu-item>
          <el-menu-item index="/repair">
            <el-icon><Tools /></el-icon>
            <template #title>维修管理</template>
          </el-menu-item>
          <el-menu-item index="/operation-log">
            <el-icon><Document /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统设置 -->
        <el-sub-menu index="settings-group">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/base-data">
            <el-icon><Collection /></el-icon>
            <template #title>基础信息管理</template>
          </el-menu-item>
          <el-sub-menu index="base-data-sub">
            <template #title>
              <span>基础信息管理</span>
            </template>
            <el-menu-item index="/base-data/vehicle-brand">
              <template #title>车辆品牌管理</template>
            </el-menu-item>
            <el-menu-item index="/base-data/supplier">
              <template #title>供应商管理</template>
            </el-menu-item>
            <el-menu-item index="/base-data/part-category">
              <template #title>配件分类管理</template>
            </el-menu-item>
            <el-menu-item index="/base-data/part-brand">
              <template #title>配件品牌管理</template>
            </el-menu-item>
            <el-menu-item index="/base-data/part-inventory">
              <template #title>配件库存管理</template>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="current-time">{{ currentTime }}</span>
          <NotificationBell />
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" style="background-color: #0066B1;">{{ userStore.userInfo.name?.charAt(0) || 'U' }}</el-avatar>
              <span class="user-name">{{ userStore.userInfo.name }}（{{ userStore.userInfo.role }}）</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessageBox } from 'element-plus'
import NotificationBell from '../components/NotificationBell.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

/** 退出登录 */
const handleLogout = async () => {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' });
    userStore.logout();
    router.push('/login');
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.layout-aside {
  background-color: #001E50;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo-area {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #ffffff1a;
  overflow: hidden;
  white-space: nowrap;
}
.logo-img {
  height: 32px;
  object-fit: contain;
}
.logo-text {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
}
.logo-text-mini {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.side-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
/* 自定义滚动条 */
.side-menu::-webkit-scrollbar {
  width: 4px;
}
.side-menu::-webkit-scrollbar-thumb {
  background-color: #ffffff4d;
  border-radius: 2px;
}
.side-menu::-webkit-scrollbar-track {
  background: transparent;
}
.side-menu .el-menu-item.is-active {
  background-color: #0066B1 !important;
}
.side-menu .el-menu-item:hover {
  background-color: #003380 !important;
}
.side-menu .el-sub-menu__title:hover {
  background-color: #003380 !important;
}
.layout-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #333;
}
.collapse-btn:hover {
  color: #0066B1;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.current-time {
  color: #999;
  font-size: 13px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.user-name {
  font-size: 14px;
  color: #333;
}
.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>