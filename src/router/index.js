import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { title: '登录', public: true },
    },
    {
        path: '/',
        component: () => import('../layout/MainLayout.vue'),
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '首页看板' } },
            { path: 'inventory', name: 'Inventory', component: () => import('../views/Inventory.vue'), meta: { title: '车辆库存台账' } },
            { path: 'purchase', name: 'Purchase', component: () => import('../views/Purchase.vue'), meta: { title: '买入入库' } },
            { path: 'purchase/new', name: 'PurchaseNew', component: () => import('../views/PurchaseNew.vue'), meta: { title: '新车采购入库' } },
            { path: 'sale', name: 'Sale', component: () => import('../views/Sale.vue'), meta: { title: '卖出出库' } },
            { path: 'price-adjust', name: 'PriceAdjust', component: () => import('../views/PriceAdjust.vue'), meta: { title: '调价管理' } },
            { path: 'car-model', name: 'CarModel', component: () => import('../views/CarModel.vue'), meta: { title: '车型库管理' } },
            { path: 'profit', name: 'Profit', component: () => import('../views/Profit.vue'), meta: { title: '利润统计' } },
            { path: 'operation-log', name: 'OperationLog', component: () => import('../views/OperationLog.vue'), meta: { title: '操作日志' } },
            { path: 'customer', name: 'Customer', component: () => import('../views/Customer.vue'), meta: { title: '客户管理' } },
            { path: 'test-drive', name: 'TestDrive', component: () => import('../views/TestDrive.vue'), meta: { title: '试驾管理' } },
            { path: 'payment', name: 'Payment', component: () => import('../views/Payment.vue'), meta: { title: '收款管理' } },
            { path: 'document', name: 'Document', component: () => import('../views/Document.vue'), meta: { title: '证照管理' } },
            { path: 'base-data', name: 'BaseData', component: () => import('../views/BaseData.vue'), meta: { title: '基础信息管理' } },
            { path: 'base-data/vehicle-brand', name: 'VehicleBrand', component: () => import('../views/baseData/VehicleBrand.vue'), meta: { title: '车辆品牌管理' } },
            { path: 'base-data/supplier', name: 'Supplier', component: () => import('../views/baseData/Supplier.vue'), meta: { title: '供应商管理' } },
            { path: 'base-data/part-category', name: 'PartCategory', component: () => import('../views/baseData/PartCategory.vue'), meta: { title: '配件分类管理' } },
            { path: 'base-data/part-brand', name: 'PartBrand', component: () => import('../views/baseData/PartBrand.vue'), meta: { title: '配件品牌管理' } },
            { path: 'base-data/part-inventory', name: 'PartInventory', component: () => import('../views/baseData/PartInventory.vue'), meta: { title: '配件库存管理' } },
            { path: 'repair', name: 'Repair', component: () => import('../views/Repair.vue'), meta: { title: '维修管理' } },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 全局导航守卫：未登录跳转到登录页
router.beforeEach((to) => {
    const userStore = useUserStore();
    if (!to.meta.public && !userStore.isLoggedIn) {
        return { name: 'Login', query: { redirect: to.fullPath } };
    }
});

export default router;
