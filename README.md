# 4S-BMW-Demo

BMW 4S 店综合管理系统，基于 Vue 3 + Element Plus 构建的车辆进销存、客户关系、财务与运营一体化管理平台。

> 当前项目使用 Mock 数据驱动，无需后端服务即可完整体验所有功能。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | ^3.5 |
| 构建 | Vite | ^8.0 |
| UI 组件库 | Element Plus | ^2.13 |
| 状态管理 | Pinia + pinia-plugin-persistedstate | ^3.0 |
| 路由 | Vue Router | ^4.6 |
| 图表 | ECharts | ^6.0 |

## 功能模块

### 登录认证

- **登录页** — BMW 品牌风格登录界面，Mock 模式下任意账号密码均可登录
- **路由守卫** — 未登录自动跳转登录页，登录后回跳原页面
- **退出登录** — 顶栏下拉菜单退出，清除登录态

### 库存管理

- **车辆台账** — 车辆库存总览，支持按品牌、车型、状态筛选，支持批量调价和导出
- **采购入库** — 新车采购与二手车收购，记录供应商、VIN、车辆详情
- **销售出库** — 四步流程向导（车辆信息 → 客户信息 → 付款方式 → 交付确认），支持全款/贷款
- **调价管理** — 单车与批量调价，审批流程与调价历史追溯
- **车型库管理** — 车型信息维护

### 客户管理

- **客户档案** — 客户资料维护，支持标签分类与销售顾问分配
- **试驾管理** — 试驾预约与排程，关联客户与可用车辆

### 财务管理

- **收付款管理** — 销售收款与采购付款流水
- **利润统计** — 单车利润计算、按车型汇总分析，ECharts 可视化图表

### 运营支撑

- **证照管理** — 车辆证照与合格证生命周期管理
- **维修管理** — 维修工单与配件消耗跟踪
- **基础信息** — 车辆品牌、供应商、配件分类、配件品牌、配件库存
- **操作日志** — 系统操作记录与审计

### 数据看板

- **Dashboard** — 实时统计卡片（库存量、销售额、利润）、待办提醒、最近操作日志

## 项目结构

```
src/
├── assets/              # 静态资源
├── components/          # 公共组件
├── layout/              # 布局组件
│   └── MainLayout.vue   # 主布局（侧边栏 + 顶栏）
├── mock/                # Mock 数据
│   └── data.js          # 模拟数据（车型、供应商、车辆、销售等）
├── router/              # 路由配置与导航守卫
│   └── index.js
├── stores/              # Pinia 状态管理
│   ├── user.js          # 用户认证状态
│   ├── baseData.js      # 基础数据
│   ├── crm.js           # 客户管理
│   ├── document.js      # 证照管理
│   ├── payment.js       # 收付款
│   ├── repair.js        # 维修管理
│   ├── testDrive.js     # 试驾管理
│   └── vehicle.js       # 车辆库存
├── views/               # 页面组件
│   ├── Login.vue        # 登录页
│   ├── Dashboard.vue    # 首页看板
│   ├── Inventory.vue    # 车辆台账
│   ├── Purchase.vue     # 采购入库
│   ├── Sale.vue         # 销售出库
│   ├── PriceAdjust.vue  # 调价管理
│   ├── Customer.vue     # 客户管理
│   ├── TestDrive.vue    # 试驾管理
│   ├── Payment.vue      # 收付款
│   ├── Profit.vue       # 利润统计
│   ├── Document.vue     # 证照管理
│   ├── Repair.vue       # 维修管理
│   ├── BaseData.vue     # 基础信息入口
│   ├── baseData/        # 基础信息子页面
│   ├── CarModel.vue     # 车型管理
│   └── OperationLog.vue # 操作日志
├── App.vue
├── main.js              # 应用入口
└── style.css            # 全局样式
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd 4s-bmw-demo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 登录

启动后自动跳转登录页，Mock 模式下任意用户名和密码均可登录。

## 代码规范

- 使用 **4 个空格**缩进，不使用制表符
- 行尾使用**分号**
- 注释使用**中文**
- 函数名使用**驼峰命名**，常量使用**大写字母加下划线**
- 函数必须编写文档注释，复杂逻辑添加行内注释

## 扩展指南

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.js` 中注册路由
3. 如需独立数据，在 `src/stores/` 下创建 Store 模块
4. 在 `src/layout/MainLayout.vue` 的菜单配置中添加入口

### 对接真实后端

1. 登录认证 — 替换 `src/stores/user.js` 中的 `login` 方法为真实 API 调用
2. 业务数据 — 逐个替换各 Store 中的数据源为 API 调用，页面组件无需改动
3. Mock 数据集中在 `src/mock/data.js`，可整体移除

### 预留扩展方向

- **权限系统** — 路由守卫已就绪，可集成角色鉴权控制菜单可见性
- **多门店** — 数据结构支持门店维度扩展
- **消息通知** — 可接入 WebSocket 实现实时推送
- **打印与报表** — 利润统计等页面已具备数据基础，可扩展打印模板

## 许可证

[MIT](./LICENSE)
