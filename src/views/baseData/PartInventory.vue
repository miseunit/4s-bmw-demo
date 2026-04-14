<template>
  <div class="page-container">
    <div class="page-title">配件库存管理</div>

    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="配件名称/编号" clearable style="width:200px" />
      <el-select v-model="filterCategory" placeholder="分类" clearable style="width:150px">
        <el-option v-for="c in baseDataStore.partCategories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="filterBrand" placeholder="品牌" clearable style="width:150px">
        <el-option v-for="b in baseDataStore.partBrands" :key="b.id" :label="b.name" :value="b.id" />
      </el-select>
      <el-select v-model="filterStock" placeholder="库存状态" clearable style="width:120px">
        <el-option label="有库存" value="in_stock" />
        <el-option label="无库存" value="out_of_stock" />
      </el-select>
    </div>

    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 新增配件
      </el-button>
    </div>

    <el-table :data="filteredParts" stripe border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="partNo" label="配件编号" width="150" />
      <el-table-column prop="name" label="配件名称" min-width="180" />
      <el-table-column label="分类" width="120" align="center">
        <template #default="{ row }">
          {{ getCategoryName(row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="品牌" width="120" align="center">
        <template #default="{ row }">
          {{ getBrandName(row.brandId) }}
        </template>
      </el-table-column>
      <el-table-column label="单价" width="120" align="right">
        <template #default="{ row }">
          <span class="money">¥{{ row.price.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" align="center" />
      <el-table-column label="库存状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.stock > 0 ? 'success' : 'danger'" size="small">
            {{ row.stock > 0 ? '有库存' : '无库存' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editPart(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deletePart(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑配件' : '新增配件'" width="700px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="配件名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="配件编号" prop="partNo">
          <el-input v-model="form.partNo" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="c in baseDataStore.partCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="form.brandId" style="width:100%">
            <el-option v-for="b in baseDataStore.partBrands" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="100" style="width:100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" style="width:100%">
            <el-option label="个" value="个" />
            <el-option label="套" value="套" />
            <el-option label="对" value="对" />
            <el-option label="件" value="件" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBaseDataStore } from '../../stores/baseData'

const baseDataStore = useBaseDataStore()

const searchText = ref('')
const filterCategory = ref('')
const filterBrand = ref('')
const filterStock = ref('')

const filteredParts = computed(() => {
  return baseDataStore.parts.filter(p => {
    if (searchText.value && !p.name.includes(searchText.value) && !p.partNo.includes(searchText.value)) return false
    if (filterCategory.value && p.categoryId !== filterCategory.value) return false
    if (filterBrand.value && p.brandId !== filterBrand.value) return false
    if (filterStock.value === 'in_stock' && p.stock <= 0) return false
    if (filterStock.value === 'out_of_stock' && p.stock > 0) return false
    return true
  })
})

function getCategoryName(categoryId) {
  const category = baseDataStore.partCategories.find(c => c.id === categoryId)
  return category?.name || '-'
}

function getBrandName(brandId) {
  const brand = baseDataStore.partBrands.find(b => b.id === brandId)
  return brand?.name || '-'
}

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = ref({
  name: '',
  partNo: '',
  categoryId: null,
  brandId: null,
  price: 0,
  unit: '个',
  stock: 0,
  remark: ''
})

const rules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  partNo: [{ required: true, message: '必填', trigger: 'blur' }],
  categoryId: [{ required: true, message: '必填', trigger: 'change' }],
  brandId: [{ required: true, message: '必填', trigger: 'change' }],
  price: [{ required: true, message: '必填', trigger: 'blur' }],
  stock: [{ required: true, message: '必填', trigger: 'blur' }]
}

function openDialog() {
  form.value = { name: '', partNo: '', categoryId: null, brandId: null, price: 0, unit: '个', stock: 0, remark: '' }
  editingId.value = null
  dialogVisible.value = true
}

function editPart(row) {
  form.value = { ...row }
  editingId.value = row.id
  dialogVisible.value = true
}

function submit() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (editingId.value) {
      baseDataStore.updatePart(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      baseDataStore.addPart(form.value)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
  })
}

function deletePart(id) {
  ElMessageBox.confirm('确定删除该配件吗？', '提示', { type: 'warning' }).then(() => {
    baseDataStore.deletePart(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>
