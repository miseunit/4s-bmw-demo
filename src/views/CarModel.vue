<template>
  <div class="page-container">
    <div class="page-title">车型库管理</div>
    <div style="display:flex;gap:16px;height:calc(100vh - 180px);">
      <!-- 左侧树形菜单 -->
      <div style="width:240px;flex-shrink:0;background:#fff;border-radius:8px;padding:16px;overflow-y:auto;border:1px solid #f0f0f0;">
        <el-input v-model="treeSearch" placeholder="搜索车系/车型" clearable size="small" style="margin-bottom:12px;" />
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          :filter-node-method="filterTreeNode"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="handleTreeClick"
        >
          <template #default="{ node, data }">
            <span style="font-size:13px;">
              <el-icon v-if="data.type==='brand'" style="margin-right:4px;color:#0066B1;"><OfficeBuilding /></el-icon>
              <el-icon v-else-if="data.type==='series'" style="margin-right:4px;color:#d48806;"><Van /></el-icon>
              <el-icon v-else style="margin-right:4px;color:#389e0d;"><Document /></el-icon>
              {{ node.label }}
              <span v-if="data.count" style="color:#999;font-size:11px;margin-left:4px;">({{ data.count }})</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧详情区 -->
      <div style="flex:1;overflow-y:auto;">
        <!-- 未选中状态 -->
        <div v-if="!selectedSeries && !selectedModel" style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">
          <el-empty description="请在左侧选择车系或车型查看详情" />
        </div>

        <!-- 选中车系 - 显示车型列表 -->
        <div v-else-if="selectedSeries && !selectedModel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <span style="font-size:18px;font-weight:600;">{{ selectedSeries }}</span>
              <el-tag size="small" style="margin-left:8px;">{{ filteredSeriesModels.length }} 个车型</el-tag>
            </div>
            <el-button type="primary" size="small" @click="openAdd"><el-icon><Plus /></el-icon> 新增车型</el-button>
          </div>
          <el-table :data="filteredSeriesModels" stripe border>
            <el-table-column prop="name" label="车型名称" min-width="200" />
            <el-table-column prop="year" label="年款" width="70" align="center" />
            <el-table-column prop="bodyType" label="车身" width="70" align="center" />
            <el-table-column prop="level" label="级别" width="80" align="center" />
            <el-table-column prop="engine" label="动力" width="130" />
            <el-table-column prop="gearbox" label="变速箱" width="70" align="center" />
            <el-table-column prop="driveMode" label="驱动" width="70" align="center" />
            <el-table-column label="指导价" width="120" align="right">
              <template #default="{ row }"><span class="money">¥{{ row.guidePrice.toLocaleString() }}</span></template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
                <el-popconfirm title="确定删除该车型？" @confirm="handleDelete(row)">
                  <template #reference><el-button type="danger" link size="small">删除</el-button></template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 选中车型 - 显示详情 -->
        <div v-else-if="selectedModel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <span style="font-size:18px;font-weight:600;">{{ selectedModel.name }}</span>
            <div>
              <el-button type="primary" size="small" @click="openEdit(selectedModel)"><el-icon><Edit /></el-icon> 编辑</el-button>
              <el-button size="small" @click="selectedModel=null">返回列表</el-button>
            </div>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="品牌">BMW</el-descriptions-item>
            <el-descriptions-item label="所属车系">{{ selectedModel.seriesName }}</el-descriptions-item>
            <el-descriptions-item label="车型名称">{{ selectedModel.name }}</el-descriptions-item>
            <el-descriptions-item label="年款">{{ selectedModel.year }}</el-descriptions-item>
            <el-descriptions-item label="车身类型">{{ selectedModel.bodyType }}</el-descriptions-item>
            <el-descriptions-item label="级别">{{ selectedModel.level || '-' }}</el-descriptions-item>
            <el-descriptions-item label="指导价"><span class="money" style="color:#0066B1;font-weight:600;">¥{{ selectedModel.guidePrice.toLocaleString() }}</span></el-descriptions-item>
            <el-descriptions-item label="可选颜色">
              <el-tag v-for="c in (selectedModel.colors || [])" :key="c" size="small" style="margin-right:4px;">{{ c }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div style="margin-top:16px;">
            <el-descriptions title="配置信息" :column="2" border>
              <el-descriptions-item label="发动机">{{ selectedModel.engine }}</el-descriptions-item>
              <el-descriptions-item label="变速箱">{{ selectedModel.gearbox }}</el-descriptions-item>
              <el-descriptions-item label="驱动方式">{{ selectedModel.driveMode }}</el-descriptions-item>
              <el-descriptions-item label="座位数">{{ selectedModel.seats || '-' }}</el-descriptions-item>
              <el-descriptions-item label="配置亮点" :span="2">{{ selectedModel.config }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑车型' : '新增车型'" width="750px" destroy-on-close>
      <el-tabs v-model="dialogTab">
        <!-- Tab1: 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="dialog-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="品牌" prop="brand">
                  <el-select v-model="form.brand" disabled style="width:100%;"><el-option label="BMW" value="BMW" /></el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属车系" prop="seriesName">
                  <el-select v-model="form.seriesName" style="width:100%;" @change="onSeriesChange">
                    <el-option v-for="s in store.carSeries" :key="s.id" :label="s.name" :value="s.name" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车型名称" prop="name">
                  <el-input v-model="form.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年款" prop="year">
                  <el-select v-model="form.year" style="width:100%;">
                    <el-option v-for="y in yearOptions" :key="y" :label="y" :value="Number(y)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车身类型" prop="bodyType">
                  <el-select v-model="form.bodyType" style="width:100%;">
                    <el-option v-for="b in bodyTypeOptions" :key="b" :label="b" :value="b" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="指导价" prop="guidePrice">
                  <el-input-number v-model="form.guidePrice" :min="0" :step="1000" style="width:100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="级别">
                  <el-select v-model="form.level" style="width:100%;" clearable>
                    <el-option v-for="l in levelOptions" :key="l" :label="l" :value="l" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- Tab2: 配置信息 -->
        <el-tab-pane label="配置信息" name="config">
          <el-form :model="form" label-width="100px" class="dialog-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="发动机">
                  <el-input v-model="form.engine" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="变速箱">
                  <el-select v-model="form.gearbox" style="width:100%;">
                    <el-option v-for="g in gearboxOptions" :key="g" :label="g" :value="g" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="驱动方式">
                  <el-select v-model="form.driveMode" style="width:100%;">
                    <el-option v-for="d in driveModeOptions" :key="d" :label="d" :value="d" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="座位数">
                  <el-select v-model="form.seats" style="width:100%;">
                    <el-option v-for="s in seatOptions" :key="s" :label="s" :value="Number(s)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="颜色选项">
                  <el-checkbox-group v-model="form.colors">
                    <el-checkbox v-for="c in carModelColorOptions" :key="c" :label="c" :value="c" />
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="配置亮点">
                  <el-input v-model="form.config" type="textarea" :rows="3" placeholder="如：全景天窗、HUD、哈曼卡顿等" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选填写备注信息" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { bodyTypeOptions, levelOptions, gearboxOptions, driveModeOptions, seatOptions, yearOptions, carModelColorOptions } from '../mock/data'

const store = useVehicleStore()
const treeRef = ref(null)
const treeSearch = ref('')
const selectedSeries = ref(null)
const selectedModel = ref(null)

// 构建树形数据：品牌 → 车系 → 车型
const treeData = computed(() => {
  const seriesMap = {}
  store.carSeries.forEach(s => { seriesMap[s.id] = { id: `series_${s.id}`, label: s.name, type: 'series', children: [] } })
  store.carModels.forEach(m => {
    const sKey = `series_${m.seriesId}`
    if (seriesMap[sKey]) {
      seriesMap[sKey].children.push({ id: `model_${m.id}`, label: m.name, type: 'model', modelId: m.id })
    }
  })
  // 统计每个车系下的车型数量
  Object.values(seriesMap).forEach(s => { s.count = s.children.length })
  return [{ id: 'brand_bmw', label: 'BMW', type: 'brand', children: Object.values(seriesMap) }]
})

// 过滤树节点
watch(treeSearch, (val) => { treeRef.value?.filter(val) })
function filterTreeNode(value, data) {
  if (!value) return true
  return data.label.includes(value)
}

// 点击树节点
function handleTreeClick(data) {
  if (data.type === 'brand') {
    selectedSeries.value = null
    selectedModel.value = null
  } else if (data.type === 'series') {
    selectedSeries.value = data.label
    selectedModel.value = null
  } else if (data.type === 'model') {
    const model = store.carModels.find(m => m.id === data.modelId)
    if (model) {
      selectedSeries.value = model.seriesName
      selectedModel.value = model
    }
  }
}

// 当前车系下的车型列表
const filteredSeriesModels = computed(() => {
  if (!selectedSeries.value) return []
  return store.carModels.filter(m => m.seriesName === selectedSeries.value)
})

// ===== 弹窗 =====
const dialogVisible = ref(false)
const dialogTab = ref('basic')
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const initForm = () => ({
  brand: 'BMW', seriesId: null, seriesName: '', name: '', year: 2025, bodyType: '', level: '',
  engine: '', gearbox: '', driveMode: '', seats: 5, guidePrice: null,
  colors: [], config: '', remark: ''
})
const form = ref(initForm())
const rules = {
  seriesName: [{ required: true, message: '必填', trigger: 'change' }],
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  year: [{ required: true, message: '必填', trigger: 'change' }],
  bodyType: [{ required: true, message: '必填', trigger: 'change' }],
  guidePrice: [{ required: true, message: '必填', trigger: 'blur' }],
}

function onSeriesChange(v) {
  const s = store.carSeries.find(s => s.name === v)
  if (s) form.value.seriesId = s.id
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  form.value = initForm()
  // 如果当前选中了车系，自动填充
  if (selectedSeries.value) {
    const s = store.carSeries.find(s => s.name === selectedSeries.value)
    if (s) {
      form.value.seriesName = s.name
      form.value.seriesId = s.id
    }
  }
  dialogTab.value = 'basic'
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    ...row,
    colors: row.colors ? [...row.colors] : [],
    remark: row.remark || ''
  }
  dialogTab.value = 'basic'
  dialogVisible.value = true
}

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    if (isEdit.value) {
      store.updateCarModel(editId.value, form.value)
      ElMessage.success('修改成功')
      // 刷新右侧详情
      const updated = store.carModels.find(m => m.id === editId.value)
      if (updated && selectedModel.value && selectedModel.value.id === editId.value) {
        selectedModel.value = updated
      }
    } else {
      store.addCarModel(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  })
}

function handleDelete(row) {
  store.deleteCarModel(row.id)
  if (selectedModel.value && selectedModel.value.id === row.id) {
    selectedModel.value = null
  }
  ElMessage.success('删除成功')
}
</script>
