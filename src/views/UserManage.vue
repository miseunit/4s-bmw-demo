<template>
    <div class="page-container">
        <div class="page-title">用户管理</div>

        <!-- 操作栏 -->
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
            <div>
                <el-button @click="handleExport">
                    <el-icon><Download /></el-icon> 导出数据
                </el-button>
                <el-button @click="triggerImport">
                    <el-icon><Upload /></el-icon> 导入数据
                </el-button>
                <input ref="fileInputRef" type="file" accept=".json" style="display: none" @change="handleImport" />
            </div>
            <el-button type="primary" @click="openDialog()">
                <el-icon><Plus /></el-icon> 新增用户
            </el-button>
        </div>

        <!-- 用户列表 -->
        <el-table :data="userStore.users" stripe border v-loading="userStore.loading">
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column label="角色" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="ROLE_TAG_TYPE[row.role] || 'info'" size="small">{{ row.role }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="row.username === 'admin'">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="editingUser ? '编辑用户' : '新增用户'"
            width="500px"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="80px"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="!!editingUser" />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!editingUser">
                    <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="重置密码" v-else>
                    <el-input v-model="formData.password" type="password" placeholder="留空则不修改" show-password />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
                        <el-option v-for="r in ROLES" :key="r" :label="r" :value="r" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                        <el-option label="启用" value="启用" />
                        <el-option label="禁用" value="禁用" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, ROLES, ROLE_TAG_TYPE } from '../stores/user'

const userStore = useUserStore()

// 弹窗
const dialogVisible = ref(false)
const editingUser = ref(null)
const formRef = ref(null)
const formData = ref(getEmptyForm())

// 文件导入
const fileInputRef = ref(null)

/** 创建空表单 */
function getEmptyForm() {
    return { username: '', password: '', name: '', role: '', status: '启用' }
}

// 表单校验规则
const formRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度 3-20 个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 4, message: '密码至少 4 个字符', trigger: 'blur' },
    ],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

/** 格式化日期 */
function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    })
}

/** 打开弹窗 */
function openDialog(user = null) {
    editingUser.value = user
    if (user) {
        formData.value = { username: user.username, password: '', name: user.name, role: user.role, status: user.status }
    } else {
        formData.value = getEmptyForm()
    }
    dialogVisible.value = true
}

/** 提交表单 */
async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    try {
        if (editingUser.value) {
            const updates = { name: formData.value.name, role: formData.value.role, status: formData.value.status }
            // 编辑时密码非空才更新
            if (formData.value.password) {
                updates.password = formData.value.password
            }
            await userStore.updateUser(editingUser.value.id, updates)
            ElMessage.success('更新成功')
        } else {
            await userStore.addUser(formData.value)
            ElMessage.success('新增成功')
        }
        dialogVisible.value = false
    } catch (err) {
        ElMessage.error('操作失败: ' + (err.message || '用户名可能已存在'))
    }
}

/** 删除用户 */
async function handleDelete(user) {
    if (user.username === 'admin') return
    await ElMessageBox.confirm(
        `确定要删除用户「${user.name}」吗？`,
        '删除确认',
        { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    try {
        await userStore.deleteUser(user.id)
        ElMessage.success('删除成功')
    } catch (err) {
        ElMessage.error('删除失败: ' + err.message)
    }
}

/** 导出数据 */
function handleExport() {
    if (userStore.users.length === 0) {
        ElMessage.warning('暂无数据可导出')
        return
    }
    const json = JSON.stringify(userStore.users, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    a.download = `用户数据_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(`已导出 ${userStore.users.length} 条数据`)
}

/** 触发文件选择 */
function triggerImport() {
    fileInputRef.value?.click()
}

/** 导入数据 */
async function handleImport(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!Array.isArray(data)) {
            ElMessage.error('文件格式不正确')
            return
        }

        await ElMessageBox.confirm(
            `检测到 ${data.length} 条用户数据，导入后将覆盖当前所有数据，是否继续？`,
            '导入确认',
            { type: 'warning', confirmButtonText: '确定导入', cancelButtonText: '取消' }
        )

        await userStore.importUsers(data)
        ElMessage.success(`成功导入 ${data.length} 条数据`)
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('导入失败: ' + (err.message || '未知错误'))
        }
    } finally {
        event.target.value = ''
    }
}

onMounted(() => {
    userStore.loadUsers()
})
</script>
