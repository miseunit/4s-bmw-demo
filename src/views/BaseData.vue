<template>
  <div class="page-container">
    <div class="page-title">基础信息管理</div>

    <el-row :gutter="16" class="mb-16">
      <el-col :span="6" v-for="module in modules" :key="module.id">
        <div class="module-card" @click="goToModule(module.path)">
          <div class="module-icon" :style="{ backgroundColor: module.color }">
            <el-icon :size="32"><component :is="module.icon" /></el-icon>
          </div>
          <div class="module-info">
            <div class="module-title">{{ module.title }}</div>
            <div class="module-desc">{{ module.desc }}</div>
            <div class="module-count">{{ module.count }} 项</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="quick-access">
      <div class="section-title">快捷操作</div>
      <el-space wrap>
        <el-button type="primary" @click="openQuickAdd('brand')">
          <el-icon><Plus /></el-icon> 新增品牌
        </el-button>
        <el-button type="success" @click="openQuickAdd('supplier')">
          <el-icon><Plus /></el-icon> 新增供应商
        </el-button>
        <el-button type="warning" @click="openQuickAdd('part')">
          <el-icon><Plus /></el-icon> 新增配件
        </el-button>
      </el-space>
    </div>

    <div class="data-overview">
      <div class="section-title">数据概览</div>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="overview-card">
            <div class="overview-title">整车数据</div>
            <div class="overview-list">
              <div class="overview-item">
                <span class="item-label">车辆品牌：</span>
                <span class="item-value">{{ baseDataStore.activeVehicleBrands.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">车身类型：</span>
                <span class="item-value">{{ baseDataStore.bodyTypes.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">车辆级别：</span>
                <span class="item-value">{{ baseDataStore.vehicleLevels.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">驱动方式：</span>
                <span class="item-value">{{ baseDataStore.driveModes.length }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="overview-card">
            <div class="overview-title">配件数据</div>
            <div class="overview-list">
              <div class="overview-item">
                <span class="item-label">配件分类：</span>
                <span class="item-value">{{ baseDataStore.activePartCategories.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">配件品牌：</span>
                <span class="item-value">{{ baseDataStore.activePartBrands.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">配件数量：</span>
                <span class="item-value">{{ baseDataStore.activeParts.length }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="overview-card">
            <div class="overview-title">其他配置</div>
            <div class="overview-list">
              <div class="overview-item">
                <span class="item-label">发动机类型：</span>
                <span class="item-value">{{ baseDataStore.engineTypes.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">变速箱类型：</span>
                <span class="item-value">{{ baseDataStore.gearboxTypes.length }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">供应商：</span>
                <span class="item-value">{{ suppliers.length }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷添加弹窗 -->
    <el-dialog v-model="quickAddVisible" :title="quickAddTitle" width="600px" destroy-on-close>
      <el-form :model="quickAddForm" :rules="quickAddRules" ref="quickAddFormRef" label-width="100px">
        <!-- 品牌 -->
        <template v-if="quickAddType === 'brand'">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="quickAddForm.name" />
          </el-form-item>
          <el-form-item label="英文名称" prop="nameEn">
            <el-input v-model="quickAddForm.nameEn" />
          </el-form-item>
          <el-form-item label="国家" prop="country">
            <el-input v-model="quickAddForm.country" />
          </el-form-item>
        </template>
        <!-- 供应商 -->
        <template v-if="quickAddType === 'supplier'">
          <el-form-item label="供应商名称" prop="name">
            <el-input v-model="quickAddForm.name" />
          </el-form-item>
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="quickAddForm.contact" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="quickAddForm.phone" />
          </el-form-item>
        </template>
        <!-- 配件 -->
        <template v-if="quickAddType === 'part'">
          <el-form-item label="配件名称" prop="name">
            <el-input v-model="quickAddForm.name" />
          </el-form-item>
          <el-form-item label="配件编号" prop="partNo">
            <el-input v-model="quickAddForm.partNo" />
          </el-form-item>
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="quickAddForm.categoryId" style="width:100%">
              <el-option v-for="c in baseDataStore.partCategories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌" prop="brandId">
            <el-select v-model="quickAddForm.brandId" style="width:100%">
              <el-option v-for="b in baseDataStore.partBrands" :key="b.id" :label="b.name" :value="b.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="单价" prop="price">
            <el-input-number v-model="quickAddForm.price" :min="0" :step="100" style="width:100%" />
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="quickAddForm.stock" :min="0" style="width:100%" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitQuickAdd">提交</el-button>
        <el-button @click="quickAddVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBaseDataStore } from '../stores/baseData'
import { suppliers } from '../mock/data'

const router = useRouter()
const baseDataStore = useBaseDataStore()

const modules = computed(() => [
  {
    id: 1,
    title: '车辆品牌管理',
    desc: '管理车辆品牌信息',
    icon: 'Van',
    color: '#0066B1',
    path: '/base-data/vehicle-brand',
    count: baseDataStore.activeVehicleBrands.length
  },
  {
    id: 2,
    title: '整车信息管理',
    desc: '管理车型、配置等基础信息',
    icon: 'List',
    color: '#389e0d',
    path: '/car-model',
    count: '已有'
  },
  {
    id: 3,
    title: '供应商管理',
    desc: '管理供应商基础信息',
    icon: 'OfficeBuilding',
    color: '#d48806',
    path: '/base-data/supplier',
    count: suppliers.length
  },
  {
    id: 4,
    title: '配件分类管理',
    desc: '管理配件分类信息',
    icon: 'FolderOpened',
    color: '#cf1322',
    path: '/base-data/part-category',
    count: baseDataStore.activePartCategories.length
  },
  {
    id: 5,
    title: '配件品牌管理',
    desc: '管理配件品牌信息',
    icon: 'Goods',
    color: '#722ed1',
    path: '/base-data/part-brand',
    count: baseDataStore.activePartBrands.length
  },
  {
    id: 6,
    title: '配件库存管理',
    desc: '管理配件库存信息',
    icon: 'Box',
    color: '#eb2f96',
    path: '/base-data/part-inventory',
    count: baseDataStore.activeParts.length
  }
])

function goToModule(path) {
  router.push(path)
}

// 快捷添加
const quickAddVisible = ref(false)
const quickAddType = ref('')
const quickAddTitle = ref('')
const quickAddFormRef = ref(null)

const quickAddForm = ref({
  name: '',
  nameEn: '',
  country: '',
  contact: '',
  phone: '',
  partNo: '',
  categoryId: null,
  brandId: null,
  price: 0,
  stock: 0
})

const quickAddRules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  contact: [{ required: true, message: '必填', trigger: 'blur' }],
  phone: [{ required: true, message: '必填', trigger: 'blur' }],
  partNo: [{ required: true, message: '必填', trigger: 'blur' }],
  categoryId: [{ required: true, message: '必填', trigger: 'change' }],
  brandId: [{ required: true, message: '必填', trigger: 'change' }],
  price: [{ required: true, message: '必填', trigger: 'blur' }],
  stock: [{ required: true, message: '必填', trigger: 'blur' }]
}

function openQuickAdd(type) {
  quickAddType.value = type
  quickAddForm.value = {
    name: '',
    nameEn: '',
    country: '',
    contact: '',
    phone: '',
    partNo: '',
    categoryId: null,
    brandId: null,
    price: 0,
    stock: 0
  }

  const titles = {
    brand: '新增品牌',
    supplier: '新增供应商',
    part: '新增配件'
  }
  quickAddTitle.value = titles[type]
  quickAddVisible.value = true
}

function submitQuickAdd() {
  quickAddFormRef.value?.validate((valid) => {
    if (!valid) return

    if (quickAddType.value === 'brand') {
      baseDataStore.addVehicleBrand({
        name: quickAddForm.value.name,
        nameEn: quickAddForm.value.nameEn,
        country: quickAddForm.value.country
      })
    } else if (quickAddType.value === 'supplier') {
      ElMessage.info('供应商管理功能开发中')
    } else if (quickAddType.value === 'part') {
      baseDataStore.addPart({
        name: quickAddForm.value.name,
        partNo: quickAddForm.value.partNo,
        categoryId: quickAddForm.value.categoryId,
        brandId: quickAddForm.value.brandId,
        price: quickAddForm.value.price,
        stock: quickAddForm.value.stock
      })
    }

    ElMessage.success('添加成功')
    quickAddVisible.value = false
  })
}
</script>

<style scoped>
.module-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: #0066B1;
}

.module-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.module-count {
  font-size: 13px;
  color: #0066B1;
  font-weight: 500;
}

.quick-access {
  margin-top: 32px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
}

.data-overview {
  margin-top: 32px;
}

.overview-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.overview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.item-label {
  color: #86909c;
}

.item-value {
  font-weight: 600;
  color: #1d2129;
}
</style>
