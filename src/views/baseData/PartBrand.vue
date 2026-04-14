<template>
  <div class="page-container">
    <div class="page-title">配件品牌管理</div>

    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 新增品牌
      </el-button>
    </div>

    <el-table :data="baseDataStore.partBrands" stripe border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="品牌名称" width="180" />
      <el-table-column prop="nameEn" label="英文名称" min-width="180" />
      <el-table-column prop="country" label="国家" width="120" />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editBrand(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteBrand(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑品牌' : '新增品牌'" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="如：AC Schnitzer" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="如：AC Schnitzer" />
        </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-input v-model="form.country" placeholder="如：德国" />
        </el-form-item>
        <el-form-item label="品牌Logo">
          <el-upload action="#" :auto-upload="false" :show-file-list="false">
            <el-button type="default">上传Logo</el-button>
          </el-upload>
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
  country: '',
  logo: ''
})

const rules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  nameEn: [{ required: true, message: '必填', trigger: 'blur' }],
  country: [{ required: true, message: '必填', trigger: 'blur' }]
}

function openDialog() {
  form.value = { name: '', nameEn: '', country: '', logo: '' }
  editingId.value = null
  dialogVisible.value = true
}

function editBrand(row) {
  form.value = { ...row }
  editingId.value = row.id
  dialogVisible.value = true
}

function submit() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (editingId.value) {
      baseDataStore.updatePartBrand(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      baseDataStore.addPartBrand(form.value)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
  })
}

function deleteBrand(id) {
  ElMessageBox.confirm('确定删除该品牌吗？', '提示', { type: 'warning' }).then(() => {
    baseDataStore.deletePartBrand(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>
