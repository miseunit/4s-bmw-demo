<template>
  <div class="page-container">
    <div class="page-title">买入入库</div>
    <el-tabs v-model="activeTab">
      <!-- 新车采购 -->
      <el-tab-pane label="新车采购" name="new">
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;">
          <el-input v-model="newSearch" placeholder="搜索采购单" clearable style="width:250px;" />
          <el-button type="primary" @click="openNewPurchase"><el-icon><Plus /></el-icon> 新建采购单</el-button>
        </div>
        <el-table :data="filteredNewRecords" stripe border>
          <el-table-column prop="id" label="单号" width="70" />
          <el-table-column prop="seriesName" label="车系" width="80" />
          <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="supplier" label="供应商" min-width="180" show-overflow-tooltip />
          <el-table-column label="采购单价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.purchasePrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column prop="purchaseDate" label="采购日期" width="110" align="center" />
          <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag type="success" size="small">已完成</el-tag></template></el-table-column>
          <el-table-column prop="operator" label="操作人" width="80" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{row}">
              <el-button type="primary" size="small" @click="editNewRecord(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteNewRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 二手车收购 -->
      <el-tab-pane label="二手车收购" name="used">
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;">
          <el-input v-model="usedSearch" placeholder="搜索收购单" clearable style="width:250px;" />
          <el-button type="primary" @click="openUsedPurchase"><el-icon><Plus /></el-icon> 新建收购单</el-button>
        </div>
        <el-table :data="filteredUsedRecords" stripe border>
          <el-table-column prop="id" label="单号" width="70" />
          <el-table-column prop="seriesName" label="车系" width="80" />
          <el-table-column prop="modelName" label="车型" min-width="180" show-overflow-tooltip />
          <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
          <el-table-column prop="supplier" label="卖家" min-width="120" />
          <el-table-column label="收购价" width="120" align="right"><template #default="{row}"><span class="money">¥{{row.purchasePrice.toLocaleString()}}</span></template></el-table-column>
          <el-table-column prop="purchaseDate" label="收购日期" width="110" align="center" />
          <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag type="success" size="small">已完成</el-tag></template></el-table-column>
          <el-table-column prop="operator" label="操作人" width="80" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{row}">
              <el-button type="primary" size="small" @click="editUsedRecord(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteUsedRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- ==================== 二手车收购弹窗（5步） ==================== -->
    <el-dialog v-model="usedDialogVisible" title="二手车收购入库" width="900px" destroy-on-close :close-on-click-modal="false">
      <el-steps :active="usedStep" simple finish-status="success" style="margin-bottom:24px;">
        <el-step title="选择车型" />
        <el-step title="车辆信息" />
        <el-step title="车况评估" />
        <el-step title="收购信息" />
        <el-step title="入库确认" />
      </el-steps>

      <!-- Step 1: 选择车型 -->
      <div v-show="usedStep === 0">
        <el-form label-width="100px" class="dialog-form">
          <el-form-item label="车系" required>
            <el-input v-model="usedForm.seriesName" readonly placeholder="请选择车系">
              <template #append><el-button @click="openSelectSeries">选择</el-button></template>
            </el-input>
          </el-form-item>
          <el-form-item label="车型" required>
            <el-input v-model="usedForm.modelName" readonly placeholder="请选择车型">
              <template #append><el-button @click="openSelectModel">选择</el-button></template>
            </el-input>
          </el-form-item>
          <el-form-item label="指导价" v-if="usedForm.guidePrice">
            <span class="money" style="font-size:16px;color:#0066B1;">¥{{ usedForm.guidePrice?.toLocaleString() }}</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 车辆详细信息 -->
      <div v-show="usedStep === 1">
        <el-form :model="usedForm" :rules="usedStep1Rules" ref="usedFormRef" label-width="120px" class="dialog-form">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px;color:#0066B1;">📋 基本信息</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="VIN码" prop="vin" label-width="100px">
                <el-input v-model="usedForm.vin" placeholder="17位VIN码" maxlength="17" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发动机号" prop="engineNumber" label-width="100px">
                <el-input v-model="usedForm.engineNumber" placeholder="请输入发动机号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="车牌号" prop="plateNumber" label-width="100px">
                <el-input v-model="usedForm.plateNumber" placeholder="如：京A·12345" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="颜色" prop="color" label-width="80px">
                <el-select v-model="usedForm.color" placeholder="请选择" style="width:100%;">
                  <el-option v-for="c in colorOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="内饰颜色" label-width="80px">
                <el-select v-model="usedForm.interiorColor" placeholder="请选择" style="width:100%;">
                  <el-option v-for="c in interiorColorOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="注册日期" prop="registerDate" label-width="100px">
                <el-date-picker v-model="usedForm.registerDate" type="date" placeholder="首次上牌" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="里程数(万km)" label-width="110px">
                <el-input-number v-model="usedForm.mileage" :min="0" :precision="1" :step="0.1" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="过户次数" label-width="100px">
                <el-input-number v-model="usedForm.transferCount" :min="0" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="年检到期" label-width="100px">
                <el-date-picker v-model="usedForm.inspectionExpiry" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="保险到期" label-width="100px">
                <el-date-picker v-model="usedForm.insuranceExpiry" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合格证编号" label-width="100px">
                <el-input v-model="usedForm.certificateNo" placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>

          <div style="font-size:14px;font-weight:600;margin:16px 0 12px;color:#0066B1;">⚙️ 车辆配置</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="年款" label-width="80px">
                <el-select v-model="usedForm.modelYear" placeholder="请选择" style="width:100%;">
                  <el-option v-for="y in modelYearOptions" :key="y" :label="y" :value="y" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="车身形式" label-width="80px">
                <el-select v-model="usedForm.bodyType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="b in bodyTypeOptions" :key="b" :label="b" :value="b" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="座位数" label-width="80px">
                <el-select v-model="usedForm.seatCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in seatCountOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="排放标准" prop="emissionStandard" label-width="80px">
                <el-select v-model="usedForm.emissionStandard" placeholder="请选择" style="width:100%;">
                  <el-option v-for="e in emissionStandardOptions" :key="e" :label="e" :value="e" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="燃油类型" prop="fuelType" label-width="80px">
                <el-select v-model="usedForm.fuelType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="f in fuelTypeOptions" :key="f" :label="f" :value="f" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="变速箱" label-width="80px">
                <el-select v-model="usedForm.transmission" placeholder="请选择" style="width:100%;">
                  <el-option v-for="t in transmissionOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="钥匙数量" prop="keyCount" label-width="80px">
                <el-select v-model="usedForm.keyCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="k in keyCountOptions" :key="k" :label="k + '把'" :value="k" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="轮胎品牌" label-width="100px">
                <el-input v-model="usedForm.tireBrand" placeholder="如：米其林" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="驱动方式" label-width="100px">
                <el-select v-model="usedForm.driveMode" placeholder="请选择" style="width:100%;">
                  <el-option v-for="d in driveModeOptions" :key="d" :label="d" :value="d" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="车门数" label-width="100px">
                <el-select v-model="usedForm.doorCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="d in doorCountOptions" :key="d" :label="d" :value="d" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="选装配置">
            <el-checkbox-group v-model="usedForm.carOptions">
              <el-checkbox v-for="opt in carOptionsList" :key="opt" :label="opt">{{ opt }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 车况评估 -->
      <div v-show="usedStep === 2">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="🔍 外观检查" name="exterior">
            <el-table :data="exteriorItems" size="small" border>
              <el-table-column prop="name" label="检查项" width="120" />
              <el-table-column label="状况" min-width="200">
                <template #default="{ row }">
                  <el-select v-model="row.value" size="small" style="width:100%;">
                    <el-option v-for="o in conditionOptions" :key="o" :label="o" :value="o" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
            <el-form label-width="120px" class="dialog-form" size="small" style="margin-top:12px;">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="漆面厚度">
                    <el-select v-model="usedForm.paintThickness" style="width:100%;">
                      <el-option v-for="p in paintThicknessOptions" :key="p" :label="p" :value="p" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="挡风玻璃">
                    <el-select v-model="usedForm.windshieldCondition" style="width:100%;">
                      <el-option v-for="w in windshieldOptions" :key="w" :label="w" :value="w" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
          <el-collapse-item title="💺 内饰检查" name="interior">
            <el-table :data="interiorItems" size="small" border>
              <el-table-column prop="name" label="检查项" width="120" />
              <el-table-column label="状况" min-width="200">
                <template #default="{ row }">
                  <el-select v-model="row.value" size="small" style="width:100%;">
                    <el-option v-for="o in interiorCondOptions" :key="o" :label="o" :value="o" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item title="🔧 发动机/底盘" name="engine">
            <el-table :data="engineItems" size="small" border>
              <el-table-column prop="name" label="检查项" width="120" />
              <el-table-column label="状况" min-width="200">
                <template #default="{ row }">
                  <el-select v-model="row.value" size="small" style="width:100%;">
                    <el-option v-for="o in engineCondOptions" :key="o" :label="o" :value="o" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
            <el-form label-width="120px" class="dialog-form" size="small" style="margin-top:12px;">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="渗油状况">
                    <el-select v-model="usedForm.oilLeakStatus" style="width:100%;">
                      <el-option v-for="l in leakStatusOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="防冻液状况">
                    <el-select v-model="usedForm.coolantStatus" style="width:100%;">
                      <el-option v-for="l in conditionLevelOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="刹车片状况">
                    <el-select v-model="usedForm.brakePadCondition" style="width:100%;">
                      <el-option v-for="l in conditionLevelOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="电瓶状况">
                    <el-select v-model="usedForm.batteryCondition" style="width:100%;">
                      <el-option v-for="l in conditionLevelOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="轮胎状况">
                    <el-select v-model="usedForm.tireCondition" style="width:100%;">
                      <el-option v-for="l in conditionLevelOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
          <el-collapse-item title="📝 综合评估" name="overall">
            <el-form label-width="100px" class="dialog-form" size="small">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="事故史"><el-select v-model="usedForm.accidentHistory" style="width:100%;"><el-option v-for="o in ['无','轻微追尾','侧面碰撞','重大事故']" :key="o" :label="o" :value="o" /></el-select></el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="水泡史"><el-select v-model="usedForm.floodHistory" style="width:100%;"><el-option v-for="o in ['无','涉水','水泡']" :key="o" :label="o" :value="o" /></el-select></el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="火烧史"><el-select v-model="usedForm.fireHistory" style="width:100%;"><el-option v-for="o in ['无','轻微','严重']" :key="o" :label="o" :value="o" /></el-select></el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="综合评分">
                <el-rate v-model="usedForm.score" :max="5" show-score score-template="{value} 星" />
              </el-form-item>
              <el-form-item label="评估备注"><el-input v-model="usedForm.conditionRemark" type="textarea" :rows="2" /></el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- Step 4: 收购信息 -->
      <div v-show="usedStep === 3">
        <el-form :model="usedForm" :rules="usedStep3Rules" ref="usedForm3Ref" label-width="130px" class="dialog-form">
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="👤 卖家信息" name="seller">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="卖家姓名" prop="sellerName" label-width="100px">
                    <el-input v-model="usedForm.sellerName" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="卖家电话" prop="sellerPhone" label-width="100px">
                    <el-input v-model="usedForm.sellerPhone" maxlength="11" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="车辆来源" prop="sellerSource" label-width="100px">
                    <el-select v-model="usedForm.sellerSource" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in sellerSourceOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="卖家身份证" prop="sellerIdCard" label-width="100px">
                    <el-input v-model="usedForm.sellerIdCard" maxlength="18" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="卖家地址" label-width="100px">
                    <el-input v-model="usedForm.sellerAddress" placeholder="请输入卖家地址" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="💰 价格信息" name="price">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="评估价" prop="evaluatePrice" label-width="100px">
                    <el-input-number v-model="usedForm.evaluatePrice" :min="0" :step="1000" style="width:100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="收购价" prop="purchasePrice" label-width="100px">
                    <el-input-number v-model="usedForm.purchasePrice" :min="0" :step="1000" style="width:100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="预计售价" label-width="100px">
                    <el-input-number v-model="usedForm.expectedSalePrice" :min="0" :step="1000" style="width:100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="预计利润" label-width="100px">
                    <span class="money" style="font-size:14px;color:#52c41a;font-weight:600;">
                      ¥{{ ((usedForm.expectedSalePrice || 0) - (usedForm.purchasePrice || 0)).toLocaleString() }}
                    </span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="利润率%" label-width="100px">
                    <el-input-number v-model="usedForm.profitMargin" :min="0" :max="100" :step="1" :precision="1" style="width:100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="💳 收购付款" name="payment">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="收购日期" prop="purchaseDate" label-width="100px">
                    <el-date-picker v-model="usedForm.purchaseDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="付款方式" prop="payMethod" label-width="100px">
                    <el-select v-model="usedForm.payMethod" style="width:100%;">
                      <el-option label="转账" value="transfer" /><el-option label="现金" value="cash" /><el-option label="承兑汇票" value="acceptance" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="付款金额" label-width="100px">
                    <el-input-number v-model="usedForm.payAmount" :min="0" :step="1000" style="width:100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="收购合同号" prop="contractNo" label-width="110px">
                    <el-input v-model="usedForm.contractNo" placeholder="请输入收购合同号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备注" label-width="100px">
                    <el-input v-model="usedForm.remark" type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="📄 发票信息" name="invoice">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="发票类型" prop="invoiceType" label-width="100px">
                    <el-select v-model="usedForm.invoiceType" placeholder="请选择" style="width:100%;">
                      <el-option v-for="t in invoiceTypeOptions" :key="t" :label="t" :value="t" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="发票号码" label-width="100px">
                    <el-input v-model="usedForm.invoiceNo" placeholder="请输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="发票抬头" label-width="100px">
                    <el-input v-model="usedForm.invoiceTitle" placeholder="请输入" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>

      <!-- Step 5: 入库确认 -->
      <div v-show="usedStep === 4">
        <el-form :model="usedForm" :rules="usedStep4Rules" ref="usedForm4Ref" label-width="120px" class="dialog-form">
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="🚚 物流与入库" name="logistics">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="运输方式">
                    <el-select v-model="usedForm.transportMethod" placeholder="请选择" style="width:100%;">
                      <el-option v-for="t in transportMethodOptions" :key="t" :label="t" :value="t" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="库区" prop="warehouseArea">
                    <el-select v-model="usedForm.warehouseArea" placeholder="请选择" style="width:100%;">
                      <el-option v-for="a in warehouseAreaOptions" :key="a" :label="a" :value="a" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="存放位置">
                    <el-select v-model="usedForm.location" placeholder="请选择" style="width:100%;">
                      <el-option v-for="l in locationOptions" :key="l" :label="l" :value="l" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="送货地址">
                <el-input v-model="usedForm.deliveryAddress" placeholder="请输入详细地址" />
              </el-form-item>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="收货人">
                    <el-input v-model="usedForm.receiverName" placeholder="请输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="收货电话">
                    <el-input v-model="usedForm.receiverPhone" placeholder="请输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="库管员" prop="warehouseKeeper">
                    <el-input v-model="usedForm.warehouseKeeper" placeholder="请输入库管员" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="🔍 入库检测" name="inspect">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="验车人" prop="inspector">
                    <el-input v-model="usedForm.inspector" placeholder="请输入验车人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="验车日期">
                    <el-date-picker v-model="usedForm.inspectDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="验车结果" prop="inspectResult">
                    <el-select v-model="usedForm.inspectResult" placeholder="请选择" style="width:100%;">
                      <el-option v-for="r in inspectResultOptions" :key="r" :label="r" :value="r" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="6">
                  <el-form-item label="PDI检测" prop="pdiStatus">
                    <el-select v-model="usedForm.pdiStatus" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in pdiStatusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="清洗状态">
                    <el-select v-model="usedForm.cleanStatus" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in cleanStatusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="整备状态">
                    <el-select v-model="usedForm.prepStatus" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in prepStatusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="整备完成日">
                    <el-date-picker v-model="usedForm.prepFinishDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item title="📝 其他信息" name="other">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="合格证状态" prop="certificateStatus">
                    <el-select v-model="usedForm.certificateStatus" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in certificateStatusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="保险状态">
                    <el-select v-model="usedForm.insuranceStatus" placeholder="请选择" style="width:100%;">
                      <el-option v-for="s in insuranceStatusOptions" :key="s" :label="s" :value="s" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="质保到期日">
                    <el-date-picker v-model="usedForm.warrantyExpiry" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="随车物品">
                <el-checkbox-group v-model="usedForm.vehicleItems">
                  <el-checkbox v-for="item in vehicleItemOptions" :key="item" :label="item">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>

          <!-- 确认信息展示 -->
          <div style="margin-top:20px;padding-top:16px;border-top:2px solid #eee;">
            <div style="font-size:15px;font-weight:600;margin-bottom:12px;color:#0066B1;">✅ 收购信息确认</div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="车型" :span="2">{{ usedForm.seriesName }} {{ usedForm.modelName }}</el-descriptions-item>
              <el-descriptions-item label="卖家">{{ usedForm.sellerName }}</el-descriptions-item>
              <el-descriptions-item label="VIN码">{{ usedForm.vin }}</el-descriptions-item>
              <el-descriptions-item label="车牌号">{{ usedForm.plateNumber }}</el-descriptions-item>
              <el-descriptions-item label="里程数">{{ usedForm.mileage }}万km</el-descriptions-item>
              <el-descriptions-item label="评估价"><span class="money">¥{{ usedForm.evaluatePrice?.toLocaleString() }}</span></el-descriptions-item>
              <el-descriptions-item label="收购价"><span class="money" style="color:#cf1322;font-weight:600;">¥{{ usedForm.purchasePrice?.toLocaleString() }}</span></el-descriptions-item>
              <el-descriptions-item label="预计售价"><span class="money" style="color:#0066B1;">¥{{ usedForm.expectedSalePrice?.toLocaleString() }}</span></el-descriptions-item>
              <el-descriptions-item label="综合评分">{{ usedForm.score }} 星</el-descriptions-item>
              <el-descriptions-item label="事故史">{{ usedForm.accidentHistory }}</el-descriptions-item>
              <el-descriptions-item label="过户次数">{{ usedForm.transferCount }} 次</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="usedStep > 0" @click="usedStep--">上一步</el-button>
        <el-button v-if="usedStep < 4" type="primary" @click="nextUsedStep">下一步</el-button>
        <el-button v-if="usedStep === 4" type="primary" @click="submitUsedPurchase">{{ editingUsedId ? '更新' : '提交' }}</el-button>
        <el-button @click="usedDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 选择车系弹窗 ==================== -->
    <el-dialog v-model="seriesDialogVisible" title="选择车系" width="600px" append-to-body>
      <el-input v-model="seriesSearch" placeholder="搜索车系" clearable style="margin-bottom:12px;" />
      <el-table :data="filteredSeries" highlight-current-row @row-dblclick="selectSeries" max-height="400">
        <el-table-column prop="name" label="车系名称" />
        <el-table-column prop="inStock" label="在库数" width="80" align="center" />
        <el-table-column prop="inTransit" label="在途数" width="80" align="center" />
      </el-table>
    </el-dialog>

    <!-- ==================== 选择车型弹窗 ==================== -->
    <el-dialog v-model="modelDialogVisible" title="选择车型" width="750px" append-to-body>
      <el-input v-model="modelSearch" placeholder="搜索车型" clearable style="margin-bottom:12px;" />
      <el-table :data="filteredModels" highlight-current-row @row-dblclick="selectModel" max-height="400">
        <el-table-column prop="name" label="车型名称" min-width="180" />
        <el-table-column prop="year" label="年款" width="80" align="center" />
        <el-table-column label="指导价" width="130" align="right"><template #default="{row}"><span class="money">¥{{row.guidePrice.toLocaleString()}}</span></template></el-table-column>
        <el-table-column prop="config" label="配置" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-dialog>

    <!-- ==================== 选择供应商弹窗 ==================== -->
    <el-dialog v-model="supplierDialogVisible" title="选择供应商" width="600px" append-to-body :z-index="3000">
      <el-table :data="suppliers" highlight-current-row @row-dblclick="selectSupplier" max-height="400">
        <el-table-column prop="name" label="供应商名称" min-width="200" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="count" label="历史采购" width="100" align="center"><template #default="{row}">{{row.count}}次</template></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { useDocumentStore } from '../stores/document'
import { colorOptions, interiorColorOptions, locationOptions, suppliers } from '../mock/data'

const router = useRouter()

// 新增选项数据
const invoiceTypeOptions = ['增值税专用发票', '增值税普通发票']
const transportMethodOptions = ['厂家直送', '第三方物流', '自提']
const certificateStatusOptions = ['已到', '未到', '办理中']
const insuranceStatusOptions = ['已投保', '未投保']
const vehicleItemOptions = ['钥匙', '保修手册', '备胎', '工具包', '脚垫', '行车记录仪']

// 新增：车辆配置选项
const modelYearOptions = ['2023', '2024', '2025', '2026']
const bodyTypeOptions = ['三厢轿车', 'SUV', 'MPV', '两厢轿车', '跑车', '皮卡', '跨界车']
const seatCountOptions = ['2座', '4座', '5座', '6座', '7座', '9座']
const doorCountOptions = ['2门', '3门', '4门', '5门']
const emissionStandardOptions = ['国VI', '国VI B', '国V', '欧VI', '零排放']
const fuelTypeOptions = ['汽油', '柴油', '纯电', '插电混动', '油电混动', '氢燃料']
const transmissionOptions = ['手动', '自动', '双离合', 'CVT无级变速', 'E-CVT', '序列式']
const driveModeOptions = ['前驱', '后驱', '四驱', '全时四驱', '分时四驱']
const carOptionsList = ['天窗', '真皮座椅', '座椅加热', '座椅通风', 'HUD抬头显示', '全景影像', '自适应巡航', '自动泊车', ' Bose音响', 'Harman Kardon音响']

// 新增：其他选项
const pdiStatusOptions = ['未检测', '检测中', '已通过', '有问题']
const cleanStatusOptions = ['未清洗', '清洗中', '已清洗']
const prepStatusOptions = ['未整备', '整备中', '已整备']
const inspectResultOptions = ['合格', '轻微瑕疵', '需维修']

// 新增选项
const originPlaceOptions = ['国产', '德国进口', '美国进口', '日本进口', '韩国进口', '英国进口', '其他进口']
const warehouseAreaOptions = ['A区-展车位', 'B区-新车库', 'C区-在途区', 'D区-整备区', 'E区-外场地']
const keyCountOptions = [1, 2, 3]
const spareTireOptions = ['全尺寸备胎', '非全尺寸备胎', '补胎液', '无备胎']

// 二手车专属选项
const sellerSourceOptions = ['个人置换', '个人出售', '二手车商', '拍卖', '4S店调拨', '厂家认证']
const windshieldOptions = ['无裂痕', '轻微裂纹', '有修复', '需更换']
const leakStatusOptions = ['无渗漏', '轻微渗油', '明显漏油', '严重漏油']
const conditionLevelOptions = ['良好', '正常磨损', '需更换']
const paintThicknessOptions = ['80-120μm(正常)', '120-200μm(做漆)', '200μm以上(钣金)']

const store = useVehicleStore()
const documentStore = useDocumentStore()
const activeTab = ref('new')
const newSearch = ref('')
const usedSearch = ref('')

const filteredNewRecords = computed(() => {
  const list = store.purchaseRecords.filter(r => r.type === 'new')
  if (!newSearch.value) return list
  const s = newSearch.value.toLowerCase()
  return list.filter(r => r.vin.toLowerCase().includes(s) || r.modelName.includes(s) || r.supplier.includes(s))
})
const filteredUsedRecords = computed(() => {
  const list = store.purchaseRecords.filter(r => r.type === 'used')
  if (!usedSearch.value) return list
  const s = usedSearch.value.toLowerCase()
  return list.filter(r => r.vin.toLowerCase().includes(s) || r.modelName.includes(s) || r.supplier.includes(s))
})

// ===== 新车采购（跳转独立页面） =====
function openNewPurchase() {
    store.setNewPurchaseDraft({ mode: 'create', editId: null })
    router.push({ name: 'PurchaseNew' })
}

function editNewRecord(row) {
    // 从车辆信息中获取完整数据
    const vehicle = store.vehicles.find(v => v.vin === row.vin)
    const formData = {
        seriesName: row.seriesName, seriesId: null, modelId: vehicle?.modelId || null,
        modelName: row.modelName, guidePrice: vehicle?.guidePrice || null, config: vehicle?.config || '',
        supplier: row.supplier, supplierId: null, vin: row.vin,
        plateNumber: vehicle?.plateNumber || '', color: vehicle?.color || '', interiorColor: vehicle?.interiorColor || '',
        purchasePrice: row.purchasePrice, quantity: row.quantity, purchaseDate: row.purchaseDate,
        location: vehicle?.location || '', remark: vehicle?.remark || '',
        modelYear: vehicle?.modelYear || '', bodyType: vehicle?.bodyType || '', seatCount: vehicle?.seatCount || '',
        doorCount: vehicle?.doorCount || '', emissionStandard: vehicle?.emissionStandard || '',
        fuelType: vehicle?.fuelType || '', transmission: vehicle?.transmission || '', driveMode: vehicle?.driveMode || '',
        carOptions: vehicle?.carOptions || [],
        certificateNo: vehicle?.certificateNo || '', originPlace: vehicle?.originPlace || '',
        importLicenseNo: vehicle?.importLicenseNo || '', customsNo: vehicle?.customsNo || '',
        keyCount: vehicle?.keyCount || null, tireBrand: vehicle?.tireBrand || '',
        batteryModel: vehicle?.batteryModel || '', warrantyMileage: vehicle?.warrantyMileage || null,
        engineNumber: vehicle?.engineNumber || '', chassisLast6: vehicle?.chassisLast6 || '',
        productionDate: vehicle?.productionDate || '', vehicleBatch: vehicle?.vehicleBatch || '',
        paymentMethod: vehicle?.paymentMethod || '', paymentDeadline: vehicle?.paymentDeadline || '',
        contractNo: vehicle?.contractNo || '', supplierContact: vehicle?.supplierContact || '',
        purchaseType: vehicle?.purchaseType || '', contractSignDate: vehicle?.contractSignDate || '',
        contractAmount: vehicle?.contractAmount || null, marketDiscount: vehicle?.marketDiscount || null,
        actualPrice: vehicle?.actualPrice || null, depositAmount: vehicle?.depositAmount || null,
        depositDate: vehicle?.depositDate || '', profit: vehicle?.profit || null,
        salesConsultant: vehicle?.salesConsultant || '', commissionRate: vehicle?.commissionRate || null,
        nakedPrice: vehicle?.nakedPrice || null, accessoriesFee: vehicle?.accessoriesFee || null,
        purchaseTax: vehicle?.purchaseTax || null, insuranceFee: vehicle?.insuranceFee || null,
        registrationFee: vehicle?.registrationFee || null, otherFees: vehicle?.otherFees || null,
        totalCost: vehicle?.totalCost || null, hasLoan: vehicle?.hasLoan || false,
        loanDownPayment: vehicle?.loanDownPayment || null, loanRatio: vehicle?.loanRatio || null,
        loanTerm: vehicle?.loanTerm || null, monthlyPayment: vehicle?.monthlyPayment || null,
        loanBank: vehicle?.loanBank || '',
        invoiceType: vehicle?.invoiceType || '', invoiceNo: vehicle?.invoiceNo || '',
        invoiceTitle: vehicle?.invoiceTitle || '', taxNo: vehicle?.taxNo || '',
        paymentAccount: vehicle?.paymentAccount || '', receiveAccount: vehicle?.receiveAccount || '',
        transportMethod: vehicle?.transportMethod || '', logisticsCompany: vehicle?.logisticsCompany || '',
        trackingNo: vehicle?.trackingNo || '', shipDate: vehicle?.shipDate || '',
        deliveryAddress: vehicle?.deliveryAddress || '', receiverName: vehicle?.receiverName || '',
        receiverPhone: vehicle?.receiverPhone || '', warehouseArea: vehicle?.warehouseArea || '',
        warehouseKeeper: vehicle?.warehouseKeeper || '', inspector: vehicle?.inspector || '',
        inspectDate: vehicle?.inspectDate || '', inspectResult: vehicle?.inspectResult || '',
        pdiStatus: vehicle?.pdiStatus || '', cleanStatus: vehicle?.cleanStatus || '',
        prepStatus: vehicle?.prepStatus || '', prepFinishDate: vehicle?.prepFinishDate || '',
        gpsNo: vehicle?.gpsNo || '', customerName: vehicle?.customerName || '',
        customerPhone: vehicle?.customerPhone || '', customerIdCard: vehicle?.customerIdCard || '',
        salesOrderNo: vehicle?.salesOrderNo || '', certificateStatus: vehicle?.certificateStatus || '',
        insuranceStatus: vehicle?.insuranceStatus || '', warrantyExpiry: vehicle?.warrantyExpiry || '',
        vehicleItems: vehicle?.vehicleItems || []
    }
    store.setNewPurchaseDraft({ mode: 'edit', editId: row.id, formData })
    router.push({ name: 'PurchaseNew' })
}

function deleteNewRecord(id) {
  ElMessageBox.confirm('确定删除该采购单吗？删除后不可恢复！', '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(() => {
    const record = store.purchaseRecords.find(r => r.id === id)
    if (!record) return

    // 删除采购记录
    const idx = store.purchaseRecords.findIndex(r => r.id === id)
    if (idx !== -1) {
      store.purchaseRecords.splice(idx, 1)
    }

    // 删除关联的车辆
    const vehicleIdx = store.vehicles.findIndex(v => v.vin === record.vin)
    if (vehicleIdx !== -1) {
      const vin = store.vehicles[vehicleIdx].vin
      store.vehicles.splice(vehicleIdx, 1)

      // 记录日志
      store.addLog({ type: 'purchase', typeName: '删除', operator: '张伟', target: vin, detail: `删除新车采购单 - ${record.modelName}` })
    }

    ElMessage.success('删除成功！')
  }).catch(() => {})
}

// ===== 二手车收购 =====
const usedDialogVisible = ref(false)
const usedStep = ref(0)
const usedFormRef = ref(null)
const usedForm3Ref = ref(null)
const usedForm4Ref = ref(null)
const editingUsedId = ref(null)
const activeCollapse = ref(['exterior', 'interior', 'engine', 'overall'])

const conditionOptions = ['无瑕疵', '轻微划痕', '修复过', '更换过']
const interiorCondOptions = ['无磨损', '轻微磨损', '破损', '更换']
const engineCondOptions = ['正常/一次启动/稳定/无', '轻微/多次启动/轻微抖动/冷车异响', '需关注/无法启动/明显抖动/持续异响']

const exteriorItems = ref([{ name: '前保险杠', value: '无瑕疵' }, { name: '后保险杠', value: '无瑕疵' }, { name: '左前翼子板', value: '无瑕疵' }, { name: '右前翼子板', value: '无瑕疵' }, { name: '车门（四门）', value: '无瑕疵' }, { name: '引擎盖', value: '无瑕疵' }, { name: '车顶', value: '无瑕疵' }, { name: '挡风玻璃', value: '原厂' }, { name: '轮胎', value: '全新' }, { name: '车漆', value: '原厂漆' }])
const interiorItems = ref([{ name: '座椅', value: '无磨损' }, { name: '方向盘', value: '正常' }, { name: '中控台', value: '无异响' }, { name: '天窗', value: '正常' }, { name: '空调', value: '制冷正常' }, { name: '电子设备', value: '全部正常' }])
const engineItems = ref([{ name: '启动', value: '一次启动' }, { name: '怠速', value: '稳定' }, { name: '异响', value: '无' }, { name: '漏油', value: '无' }, { name: '变速箱', value: '换挡平顺' }, { name: '底盘', value: '正常' }, { name: '刹车', value: '灵敏' }])

const initUsedForm = () => ({
  // 基础
  seriesName: '', seriesId: null, modelId: null, modelName: '', guidePrice: null, config: '',
  // Step 1: 车辆详细信息
  vin: '', plateNumber: '', color: '', interiorColor: '',
  registerDate: '', mileage: 0, transferCount: 0,
  inspectionExpiry: '', insuranceExpiry: '', location: '',
  engineNumber: '', chassisLast6: '', certificateNo: '',
  productionDate: '', modelYear: '', bodyType: '',
  seatCount: '', doorCount: '', emissionStandard: '',
  fuelType: '', transmission: '', driveMode: '',
  carOptions: [], keyCount: null, tireBrand: '',
  // Step 2: 车况评估
  accidentHistory: '无', floodHistory: '无', fireHistory: '无',
  score: 4, conditionRemark: '',
  paintThickness: '', windshieldCondition: '',
  oilLeakStatus: '', coolantStatus: '',
  batteryCondition: '', brakePadCondition: '', tireCondition: '',
  // Step 3: 收购信息
  sellerName: '', sellerPhone: '', sellerIdCard: '',
  sellerAddress: '', sellerSource: '',
  evaluatePrice: null, purchasePrice: null,
  expectedSalePrice: null, profitMargin: null,
  purchaseDate: '', payMethod: 'transfer', payAmount: null,
  contractNo: '', invoiceType: '', invoiceNo: '',
  invoiceTitle: '', taxNo: '',
  // Step 4: 物流与入库
  transportMethod: '', deliveryAddress: '',
  receiverName: '', receiverPhone: '',
  warehouseArea: '', warehouseKeeper: '',
  inspector: '', inspectDate: '', inspectResult: '',
  pdiStatus: '', cleanStatus: '', prepStatus: '', prepFinishDate: '',
  // 其他
  certificateStatus: '', insuranceStatus: '',
  warrantyExpiry: '', warrantyMileage: null,
  vehicleItems: [], remark: ''
})
const usedForm = ref(initUsedForm())
const usedStep1Rules = {
  vin: [{ required: true, message: '请输入VIN码', trigger: 'blur' }],
  plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
  registerDate: [{ required: true, message: '请选择注册日期', trigger: 'change' }],
  mileage: [{ required: true, message: '请输入里程', trigger: 'blur' }],
  transferCount: [{ required: true, message: '请输入过户次数', trigger: 'blur' }],
  engineNumber: [{ required: true, message: '请输入发动机号', trigger: 'blur' }],
  emissionStandard: [{ required: true, message: '请选择排放标准', trigger: 'change' }],
  fuelType: [{ required: true, message: '请选择燃油类型', trigger: 'change' }],
  keyCount: [{ required: true, type: 'number', message: '请选择钥匙数量', trigger: 'change' }]
}
const usedStep3Rules = {
  sellerName: [{ required: true, message: '请输入卖家姓名', trigger: 'blur' }],
  sellerPhone: [{ required: true, message: '请输入卖家电话', trigger: 'blur' }],
  sellerIdCard: [{ required: true, message: '请输入卖家身份证', trigger: 'blur' }],
  evaluatePrice: [{ required: true, message: '请输入评估价', trigger: 'blur' }],
  purchasePrice: [{ required: true, message: '请输入收购价', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择收购日期', trigger: 'change' }],
  payMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  contractNo: [{ required: true, message: '请输入收购合同号', trigger: 'blur' }],
  invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  sellerSource: [{ required: true, message: '请选择车辆来源', trigger: 'change' }]
}
const usedStep4Rules = {
  warehouseArea: [{ required: true, message: '请选择库区', trigger: 'change' }],
  warehouseKeeper: [{ required: true, message: '请输入库管员', trigger: 'blur' }],
  inspector: [{ required: true, message: '请输入验车人', trigger: 'blur' }],
  inspectResult: [{ required: true, message: '请选择验车结果', trigger: 'change' }],
  pdiStatus: [{ required: true, message: '请选择PDI状态', trigger: 'change' }],
  certificateStatus: [{ required: true, message: '请选择合格证状态', trigger: 'change' }]
}

function openUsedPurchase() { usedForm.value = initUsedForm(); usedStep.value = 0; editingUsedId.value = null; usedDialogVisible.value = true }
async function nextUsedStep() {
  if (usedStep.value === 0) {
    if (!usedForm.value.seriesName || !usedForm.value.modelName) { ElMessage.warning('请先完成车型选择'); return }
    usedStep.value = 1
  } else if (usedStep.value === 1) {
    try { await usedFormRef.value?.validate(); usedStep.value = 2 } catch(e) { ElMessage.warning('请完成必填项') }
  } else if (usedStep.value === 2) {
    usedStep.value = 3
  } else if (usedStep.value === 3) {
    try { await usedForm3Ref.value?.validate(); usedStep.value = 4 } catch(e) { ElMessage.warning('请完成必填项') }
  }
}
function submitUsedPurchase() {
  usedForm4Ref.value?.validate((valid) => {
    if (!valid) return
    const f = usedForm.value
    // 构建完整的车辆数据
    const usedVehicleData = {
      modelName: f.modelName, seriesName: f.seriesName, color: f.color, interiorColor: f.interiorColor,
      mileage: f.mileage, purchasePrice: f.purchasePrice, currentPrice: f.expectedSalePrice || f.evaluatePrice, location: f.location, remark: f.remark,
      engineNumber: f.engineNumber, chassisLast6: f.chassisLast6, certificateNo: f.certificateNo,
      productionDate: f.productionDate, modelYear: f.modelYear, bodyType: f.bodyType,
      seatCount: f.seatCount, doorCount: f.doorCount, emissionStandard: f.emissionStandard,
      fuelType: f.fuelType, transmission: f.transmission, driveMode: f.driveMode,
      carOptions: f.carOptions, keyCount: f.keyCount, tireBrand: f.tireBrand,
      registerDate: f.registerDate, transferCount: f.transferCount,
      inspectionExpiry: f.inspectionExpiry, insuranceExpiry: f.insuranceExpiry,
      warehouseArea: f.warehouseArea, warehouseKeeper: f.warehouseKeeper,
      inspector: f.inspector, inspectDate: f.inspectDate, inspectResult: f.inspectResult,
      pdiStatus: f.pdiStatus, cleanStatus: f.cleanStatus, prepStatus: f.prepStatus, prepFinishDate: f.prepFinishDate,
      certificateStatus: f.certificateStatus, insuranceStatus: f.insuranceStatus,
      warrantyExpiry: f.warrantyExpiry, warrantyMileage: f.warrantyMileage, vehicleItems: f.vehicleItems
    }
    if (editingUsedId.value) {
      const idx = store.purchaseRecords.findIndex(r => r.id === editingUsedId.value)
      if (idx !== -1) {
        store.purchaseRecords[idx] = { ...store.purchaseRecords[idx], seriesName: f.seriesName, modelName: f.modelName, vin: f.vin, supplier: `${f.sellerSource}-${f.sellerName}`, purchasePrice: f.purchasePrice, purchaseDate: f.purchaseDate }
      }
      const vehicle = store.vehicles.find(v => v.vin === f.vin)
      if (vehicle) {
        store.updateVehicle(vehicle.id, usedVehicleData)
      }
      store.addLog({ type: 'purchase', typeName: '修改', operator: '张伟', target: f.vin, detail: `修改二手车收购单 - ${f.modelName}` })
      ElMessage.success('收购单更新成功！')
    } else {
      const condition = `综合评分${f.score}星，事故史:${f.accidentHistory}，水泡史:${f.floodHistory}，火烧史:${f.fireHistory}。${f.conditionRemark}`
      const vehicle = { vin: f.vin, plateNumber: f.plateNumber, modelId: f.modelId, modelName: f.modelName, seriesName: f.seriesName, year: 2024, config: f.config, source: 'used', condition, guidePrice: f.guidePrice, supplier: `${f.sellerSource}-${f.sellerName}`, status: 'in_stock', purchaseDate: f.purchaseDate, ...usedVehicleData }
      const vehicleId = store.addVehicle(vehicle)
      const purchaseRecord = { type: 'used', seriesName: f.seriesName, modelName: f.modelName, vin: f.vin, supplier: `${f.sellerSource}-${f.sellerName}`, purchasePrice: f.purchasePrice, quantity: 1, totalPrice: f.purchasePrice, purchaseDate: f.purchaseDate, status: 'completed', operator: '张伟' }
      store.addPurchaseRecord(purchaseRecord)
      store.addLog({ type: 'purchase', typeName: '入库', operator: '张伟', target: f.vin, detail: `二手车收购入库 - ${f.modelName}，收购价${f.purchasePrice}元` })
      documentStore.createCertificateFromPurchase(purchaseRecord, { ...vehicle, id: vehicleId })
      ElMessage.success('收购单提交成功！')
    }
    usedDialogVisible.value = false
  })
}

function editUsedRecord(row) {
  editingUsedId.value = row.id
  const vehicle = store.vehicles.find(v => v.vin === row.vin)
  const sellerInfo = row.supplier?.replace(/^[^-]+-/, '') || ''

  usedForm.value = {
    seriesName: row.seriesName, seriesId: null,
    modelId: vehicle?.modelId || null, modelName: row.modelName,
    guidePrice: vehicle?.guidePrice || null, config: vehicle?.config || '',
    vin: row.vin, plateNumber: vehicle?.plateNumber || '',
    color: vehicle?.color || '', interiorColor: vehicle?.interiorColor || '',
    registerDate: vehicle?.registerDate || '', mileage: vehicle?.mileage || 0,
    transferCount: vehicle?.transferCount || 0,
    inspectionExpiry: vehicle?.inspectionExpiry || '', insuranceExpiry: vehicle?.insuranceExpiry || '',
    location: vehicle?.location || '',
    engineNumber: vehicle?.engineNumber || '', chassisLast6: vehicle?.chassisLast6 || '',
    certificateNo: vehicle?.certificateNo || '', productionDate: vehicle?.productionDate || '',
    modelYear: vehicle?.modelYear || '', bodyType: vehicle?.bodyType || '',
    seatCount: vehicle?.seatCount || '', doorCount: vehicle?.doorCount || '',
    emissionStandard: vehicle?.emissionStandard || '', fuelType: vehicle?.fuelType || '',
    transmission: vehicle?.transmission || '', driveMode: vehicle?.driveMode || '',
    carOptions: vehicle?.carOptions || [], keyCount: vehicle?.keyCount || null,
    tireBrand: vehicle?.tireBrand || '',
    accidentHistory: '无', floodHistory: '无', fireHistory: '无',
    score: 4, conditionRemark: '',
    paintThickness: vehicle?.paintThickness || '', windshieldCondition: vehicle?.windshieldCondition || '',
    oilLeakStatus: vehicle?.oilLeakStatus || '', coolantStatus: vehicle?.coolantStatus || '',
    batteryCondition: vehicle?.batteryCondition || '', brakePadCondition: vehicle?.brakePadCondition || '',
    tireCondition: vehicle?.tireCondition || '',
    sellerName: sellerInfo, sellerPhone: '', sellerIdCard: '',
    sellerAddress: vehicle?.sellerAddress || '', sellerSource: vehicle?.sellerSource || '',
    evaluatePrice: vehicle?.currentPrice || row.purchasePrice, purchasePrice: row.purchasePrice,
    expectedSalePrice: vehicle?.expectedSalePrice || null, profitMargin: vehicle?.profitMargin || null,
    purchaseDate: row.purchaseDate, payMethod: 'transfer', payAmount: null,
    contractNo: vehicle?.contractNo || '', invoiceType: vehicle?.invoiceType || '',
    invoiceNo: vehicle?.invoiceNo || '', invoiceTitle: vehicle?.invoiceTitle || '', taxNo: vehicle?.taxNo || '',
    transportMethod: vehicle?.transportMethod || '', deliveryAddress: vehicle?.deliveryAddress || '',
    receiverName: vehicle?.receiverName || '', receiverPhone: vehicle?.receiverPhone || '',
    warehouseArea: vehicle?.warehouseArea || '', warehouseKeeper: vehicle?.warehouseKeeper || '',
    inspector: vehicle?.inspector || '', inspectDate: vehicle?.inspectDate || '',
    inspectResult: vehicle?.inspectResult || '', pdiStatus: vehicle?.pdiStatus || '',
    cleanStatus: vehicle?.cleanStatus || '', prepStatus: vehicle?.prepStatus || '',
    prepFinishDate: vehicle?.prepFinishDate || '',
    certificateStatus: vehicle?.certificateStatus || '', insuranceStatus: vehicle?.insuranceStatus || '',
    warrantyExpiry: vehicle?.warrantyExpiry || '', warrantyMileage: vehicle?.warrantyMileage || null,
    vehicleItems: vehicle?.vehicleItems || [], remark: vehicle?.remark || ''
  }
  usedStep.value = 4
  usedDialogVisible.value = true
}

function deleteUsedRecord(id) {
  ElMessageBox.confirm('确定删除该收购单吗？删除后不可恢复！', '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(() => {
    const record = store.purchaseRecords.find(r => r.id === id)
    if (!record) return

    // 删除采购记录
    const idx = store.purchaseRecords.findIndex(r => r.id === id)
    if (idx !== -1) {
      store.purchaseRecords.splice(idx, 1)
    }

    // 删除关联的车辆
    const vehicleIdx = store.vehicles.findIndex(v => v.vin === record.vin)
    if (vehicleIdx !== -1) {
      const vin = store.vehicles[vehicleIdx].vin
      store.vehicles.splice(vehicleIdx, 1)

      // 记录日志
      store.addLog({ type: 'purchase', typeName: '删除', operator: '张伟', target: vin, detail: `删除二手车收购单 - ${record.modelName}` })
    }

    ElMessage.success('删除成功！')
  }).catch(() => {})
}

// ===== 选择弹窗（二手车用） =====
const seriesDialogVisible = ref(false)
const modelDialogVisible = ref(false)
const supplierDialogVisible = ref(false)
const seriesSearch = ref('')
const modelSearch = ref('')

const filteredSeries = computed(() => {
  if (!seriesSearch.value) return store.carSeries
  return store.carSeries.filter(s => s.name.includes(seriesSearch.value))
})
const filteredModels = computed(() => {
  let list = store.carModels
  if (usedForm.value.seriesId) list = list.filter(m => m.seriesId === usedForm.value.seriesId)
  if (modelSearch.value) list = list.filter(m => m.name.includes(modelSearch.value))
  return list
})

function openSelectSeries() { seriesSearch.value = ''; seriesDialogVisible.value = true }
function openSelectModel() {
  if (!usedForm.value.seriesId) { ElMessage.warning('请先选择车系'); return }
  modelSearch.value = ''; modelDialogVisible.value = true
}
function selectSeries(row) {
  usedForm.value.seriesName = row.name; usedForm.value.seriesId = row.id; usedForm.value.modelName = ''; usedForm.value.modelId = null
  seriesDialogVisible.value = false
}
function selectModel(row) {
  usedForm.value.modelName = row.name; usedForm.value.modelId = row.id; usedForm.value.guidePrice = row.guidePrice; usedForm.value.config = row.config
  modelDialogVisible.value = false
}
function selectSupplier(row) {
  usedForm.value.supplier = row.name; usedForm.value.supplierId = row.id
  supplierDialogVisible.value = false
}
</script>