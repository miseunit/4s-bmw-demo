<template>
  <div class="page-container">
    <div class="page-title">供应商管理</div>

    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="供应商名称/联系人" clearable style="width:200px" />
    </div>

    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 新增供应商
      </el-button>
    </div>

    <el-table :data="filteredSuppliers" stripe border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="供应商名称" min-width="200" />
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="count" label="合作次数" width="100" align="center" />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editSupplier(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteSupplier(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑供应商' : '新增供应商'" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" />
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
import { suppliers } from '../../mock/data'

const searchText = ref('')

const filteredSuppliers = computed(() => {
  if (!searchText.value) return suppliers
  const s = searchText.value.toLowerCase()
  return suppliers.filter(s =>
    s.name.toLowerCase().includes(s) ||
    s.contact?.toLowerCase().includes(s)
  )
})

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = ref({
  name: '',
  contact: '',
  phone: '',
  address: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  contact: [{ required: true, message: '必填', trigger: 'blur' }],
  phone: [{ required: true, message: '必填', trigger: 'blur' }]
}

function openDialog() {
  form.value = { name: '', contact: '', phone: '', address: '', remark: '' }
  editingId.value = null
  dialogVisible.value = true
}

function editSupplier(row) {
  form.value = { ...row, address: row.address || '', remark: row.remark || '' }
  editingId.value = row.id
  dialogVisible.value = true
}

function submit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    ElMessage.success(editingId.value ? '更新成功' : '添加成功')
    dialogVisible.value = false
  })
}

function deleteSupplier(id) {
  ElMessageBox.confirm('确定删除该供应商吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>
