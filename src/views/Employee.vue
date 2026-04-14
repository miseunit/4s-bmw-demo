<template>
    <div class="page-container">
        <div class="page-title">员工管理</div>

        <!-- 统计卡片 -->
        <el-row :gutter="16" class="mb-16">
            <el-col :span="6">
                <div class="stat-card-mini" style="border-top: 3px solid #409EFF">
                    <div class="stat-value">{{ employeeStore.totalCount }}</div>
                    <div class="stat-label">员工总数</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card-mini" style="border-top: 3px solid #67C23A">
                    <div class="stat-value">{{ employeeStore.activeCount }}</div>
                    <div class="stat-label">在职人数</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card-mini" style="border-top: 3px solid #F56C6C">
                    <div class="stat-value">{{ employeeStore.resignedCount }}</div>
                    <div class="stat-label">离职人数</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="stat-card-mini" style="border-top: 3px solid #E6A23C">
                    <div class="stat-value">{{ departmentList.length }}</div>
                    <div class="stat-label">部门数量</div>
                </div>
            </el-col>
        </el-row>

        <!-- 筛选栏 -->
        <div class="filter-bar">
            <el-input v-model="searchText" placeholder="姓名/手机号" clearable style="width: 180px" />
            <el-select v-model="filterDepartment" placeholder="部门" clearable style="width: 130px">
                <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
            </el-select>
            <el-select v-model="filterPosition" placeholder="职位" clearable style="width: 130px">
                <el-option v-for="p in POSITIONS" :key="p" :label="p" :value="p" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="在职状态" clearable style="width: 120px">
                <el-option v-for="s in STATUS_OPTIONS" :key="s" :label="s" :value="s" />
            </el-select>
        </div>

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
                <el-icon><Plus /></el-icon> 新增员工
            </el-button>
        </div>

        <!-- 员工列表 -->
        <el-table :data="paginatedEmployees" stripe border v-loading="employeeStore.loading">
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="70" align="center" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="department" label="部门" width="100" />
            <el-table-column prop="position" label="职位" width="100" />
            <el-table-column label="薪资" width="120" align="right">
                <template #default="{ row }">
                    ¥{{ row.salary?.toLocaleString() || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="hireDate" label="入职日期" width="120" align="center" />
            <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.status === '在职' ? 'success' : 'danger'" size="small">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="margin-top: 16px; display: flex; justify-content: flex-end">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="filteredEmployees.length"
                layout="total, sizes, prev, pager, next"
                background
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="editingEmployee ? '编辑员工' : '新增员工'"
            width="600px"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="80px"
            >
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                            <el-input v-model="formData.name" placeholder="请输入姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="formData.gender" placeholder="请选择" style="width: 100%">
                                <el-option label="男" value="男" />
                                <el-option label="女" value="女" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="formData.email" placeholder="请输入邮箱" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="部门" prop="department">
                            <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%">
                                <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="职位" prop="position">
                            <el-select v-model="formData.position" placeholder="请选择职位" style="width: 100%">
                                <el-option v-for="p in POSITIONS" :key="p" :label="p" :value="p" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="入职日期" prop="hireDate">
                            <el-date-picker
                                v-model="formData.hireDate"
                                type="date"
                                placeholder="选择日期"
                                value-format="YYYY-MM-DD"
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="薪资" prop="salary">
                            <el-input-number v-model="formData.salary" :min="0" :step="1000" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                                <el-option v-for="s in STATUS_OPTIONS" :key="s" :label="s" :value="s" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEmployeeStore, DEPARTMENTS, POSITIONS, STATUS_OPTIONS } from '../stores/employee'

const employeeStore = useEmployeeStore()

// 搜索与筛选
const searchText = ref('')
const filterDepartment = ref('')
const filterPosition = ref('')
const filterStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗
const dialogVisible = ref(false)
const editingEmployee = ref(null)
const formRef = ref(null)
const formData = ref(getEmptyForm())

/** 创建空表单 */
function getEmptyForm() {
    return {
        name: '',
        gender: '男',
        phone: '',
        email: '',
        department: '',
        position: '',
        status: '在职',
        hireDate: '',
        salary: 0,
        remark: '',
    }
}

// 表单校验规则
const formRules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
    ],
    department: [{ required: true, message: '请选择部门', trigger: 'change' }],
    position: [{ required: true, message: '请选择职位', trigger: 'change' }],
    hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    email: [
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
    ],
}

// 部门列表
const departmentList = computed(() => {
    return [...new Set(employeeStore.employees.map(e => e.department))]
})

// 筛选后的员工列表
const filteredEmployees = computed(() => {
    return employeeStore.employees.filter(emp => {
        const matchSearch = !searchText.value ||
            emp.name.includes(searchText.value) ||
            emp.phone.includes(searchText.value)
        const matchDept = !filterDepartment.value || emp.department === filterDepartment.value
        const matchPos = !filterPosition.value || emp.position === filterPosition.value
        const matchStatus = !filterStatus.value || emp.status === filterStatus.value
        return matchSearch && matchDept && matchPos && matchStatus
    })
})

// 分页后的员工列表
const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredEmployees.value.slice(start, start + pageSize.value)
})

/** 打开新增/编辑弹窗 */
function openDialog(employee = null) {
    editingEmployee.value = employee
    if (employee) {
        formData.value = { ...employee }
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
        if (editingEmployee.value) {
            await employeeStore.updateEmployee(editingEmployee.value.id, formData.value)
            ElMessage.success('更新成功')
        } else {
            await employeeStore.addEmployee(formData.value)
            ElMessage.success('新增成功')
        }
        dialogVisible.value = false
    } catch (err) {
        ElMessage.error('操作失败: ' + err.message)
    }
}

/** 删除员工 */
async function handleDelete(employee) {
    await ElMessageBox.confirm(
        `确定要删除员工「${employee.name}」吗？此操作不可撤销。`,
        '删除确认',
        { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    try {
        await employeeStore.deleteEmployee(employee.id)
        ElMessage.success('删除成功')
    } catch (err) {
        ElMessage.error('删除失败: ' + err.message)
    }
}

/** 导出数据为 JSON 文件 */
function handleExport() {
    if (employeeStore.employees.length === 0) {
        ElMessage.warning('暂无数据可导出')
        return
    }
    const json = JSON.stringify(employeeStore.employees, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    a.download = `员工数据_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(`已导出 ${employeeStore.employees.length} 条数据`)
}

// 隐藏的文件输入引用
const fileInputRef = ref(null)

/** 触发文件选择 */
function triggerImport() {
    fileInputRef.value?.click()
}

/** 导入 JSON 文件 */
async function handleImport(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!Array.isArray(data)) {
            ElMessage.error('文件格式不正确，请选择有效的 JSON 文件')
            return
        }

        await ElMessageBox.confirm(
            `检测到 ${data.length} 条员工数据，导入后将覆盖当前所有数据，是否继续？`,
            '导入确认',
            { type: 'warning', confirmButtonText: '确定导入', cancelButtonText: '取消' }
        )

        // 清空旧数据并写入新数据
        await employeeStore.importEmployees(data)
        ElMessage.success(`成功导入 ${data.length} 条数据`)
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('导入失败: ' + (err.message || '未知错误'))
        }
    } finally {
        // 重置 input，允许重复选择同一文件
        event.target.value = ''
    }
}

onMounted(() => {
    employeeStore.loadEmployees()
})
</script>
