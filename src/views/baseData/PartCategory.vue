<template>
  <div class="page-container">
    <div class="page-title">配件分类管理</div>

    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 新增分类
      </el-button>
    </div>

    <el-table :data="baseDataStore.partCategories" stripe border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="分类名称" width="150" />
      <el-table-column prop="nameEn" label="英文名称" width="180" />
      <el-table-column label="图标" width="80" align="center">
        <template #default="{ row }">
          <el-icon v-if="row.icon" :size="24">
            <component :is="row.icon" />
          </el-icon>
          <span v-else style="color:#ccc">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editCategory(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteCategory(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="如：外观改装" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="如：Exterior" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="form.icon" placeholder="选择图标" style="width:100%">
            <el-option label="图片" value="Picture" />
            <el-option label="设置" value="Setting" />
            <el-option label="工具" value="Tools" />
            <el-option label="星标" value="Star" />
          </el-select>
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBaseDataStore } from '../../stores/baseData'

const baseDataStore = useBaseDataStore()

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = ref({
  name: '',
  nameEn: '',
  icon: ''
})

const rules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  nameEn: [{ required: true, message: '必填', trigger: 'blur' }]
}

function openDialog() {
  form.value = { name: '', nameEn: '', icon: '' }
  editingId.value = null
  dialogVisible.value = true
}

function editCategory(row) {
  form.value = { ...row }
  editingId.value = row.id
  dialogVisible.value = true
}

function submit() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (editingId.value) {
      baseDataStore.updatePartCategory(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      baseDataStore.addPartCategory(form.value)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
  })
}

function deleteCategory(id) {
  ElMessageBox.confirm('确定删除该分类吗？', '提示', { type: 'warning' }).then(() => {
    baseDataStore.deletePartCategory(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>
