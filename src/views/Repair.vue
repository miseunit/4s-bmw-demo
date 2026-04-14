<template>
  <div class="page-container">
    <div class="page-title">维修管理</div>
    <div class="filter-bar">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px;" />
      <el-select v-model="filterStatus" placeholder="维修状态" clearable style="width:130px;">
        <el-option v-for="s in repairStatusOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-select v-model="filterType" placeholder="维修类型" clearable style="width:120px;">
        <el-option v-for="t in repairTypes" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select v-model="filterTechnician" placeholder="主修人员" clearable style="width:120px;">
        <el-option v-for="t in repairTechnicians" :key="t.id" :label="t.name" :value="t.name" />
      </el-select>
    </div>
    <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
      <el-button type="primary" @click="openRepair"><el-icon><Plus /></el-icon> 新建维修工单</el-button>
    </div>
    <el-table :data="filteredRecords" stripe border>
      <el-table-column prop="orderNo" label="工单号" width="110" />
      <el-table-column prop="vin" label="VIN码" width="180" show-overflow-tooltip />
      <el-table-column prop="modelName" label="车型" min-width="160" show-overflow-tooltip />
      <el-table-column prop="ownerName" label="车主" width="90" />
      <el-table-column prop="repairType" label="维修类型" width="100" align="center" />
      <el-table-column label="维修状态" width="100" align="center">
        <template #default="{row}">
          <el-tag :type="statusTagType(row.repairStatus)" size="small">{{ statusLabel(row.repairStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mainTechnician" label="主修人员" width="90" />
      <el-table-column label="预计费用" width="120" align="right">
        <template #default="{row}"><span class="money">¥{{ (row.estimatedLaborFee + row.estimatedPartFee)?.toLocaleString() || '-' }}</span></template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{row}">
          <el-button type="primary" size="small" @click="editRecord(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建维修工单弹窗 6步 -->
    <el-dialog v-model="dialogVisible" title="新建维修工单" width="860px" destroy-on-close :close-on-click-modal="false" top="3vh">
      <el-steps :active="step" simple finish-status="success" style="margin-bottom:20px;">
        <el-step title="维修信息登记" />
        <el-step title="维修评估" />
        <el-step title="故障维修" />
        <el-step title="零件调用" />
        <el-step title="维修状态" />
        <el-step title="费用结算" />
      </el-steps>

      <div class="step-content">
        <!-- ====== Step 1: 维修信息登记 ====== -->
        <div v-show="step===0">
          <el-form :model="form" :rules="step1Rules" ref="form1Ref" label-width="120px" class="dialog-form">
            <el-divider content-position="left">来修信息</el-divider>
            <el-form-item label="来修方式" prop="arrivalMethod">
              <el-select v-model="form.arrivalMethod" style="width:100%;" placeholder="请选择来修方式">
                <el-option v-for="m in arrivalMethods" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
            <el-form-item label="来修日期" prop="arrivalDate">
              <el-date-picker v-model="form.arrivalDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择来修日期时间" style="width:100%;" />
            </el-form-item>
            <el-form-item label="预计取车日期" prop="expectedPickupDate">
              <el-date-picker v-model="form.expectedPickupDate" type="date" value-format="YYYY-MM-DD" placeholder="选择预计取车日期" style="width:100%;" />
            </el-form-item>
            <el-divider content-position="left">车辆信息</el-divider>
            <el-form-item label="VIN码" prop="vin">
              <el-autocomplete v-model="form.vin" :fetch-suggestions="queryVin" placeholder="输入VIN码搜索" style="width:100%;" @select="onVinSelect" clearable />
            </el-form-item>
            <div v-if="selectedVehicle" style="margin:-12px 0 16px 120px;">
              <el-descriptions :column="2" border size="small" style="max-width:560px;">
                <el-descriptions-item label="车型">{{ selectedVehicle.modelName }}</el-descriptions-item>
                <el-descriptions-item label="车系">{{ selectedVehicle.seriesName }}</el-descriptions-item>
                <el-descriptions-item label="车牌号">{{ selectedVehicle.plateNumber || '无' }}</el-descriptions-item>
                <el-descriptions-item label="颜色">{{ selectedVehicle.color }}</el-descriptions-item>
              </el-descriptions>
            </div>
            <el-form-item label="车牌号"><el-input v-model="form.plateNumber" placeholder="自动填充或手动输入" /></el-form-item>
            <el-form-item label="车型"><el-input v-model="form.modelName" placeholder="自动填充或手动输入" /></el-form-item>
            <el-divider content-position="left">车主信息</el-divider>
            <el-form-item label="车主姓名" prop="ownerName"><el-input v-model="form.ownerName" placeholder="请输入车主姓名" /></el-form-item>
            <el-form-item label="车主电话" prop="ownerPhone"><el-input v-model="form.ownerPhone" maxlength="11" placeholder="请输入车主电话" /></el-form-item>
            <el-form-item label="车主身份证号" prop="ownerIdCard"><el-input v-model="form.ownerIdCard" maxlength="18" placeholder="请输入身份证号" /></el-form-item>
            <el-form-item label="车主地址"><el-input v-model="form.ownerAddress" placeholder="请输入车主地址" /></el-form-item>
            <el-form-item label="联系人"><el-input v-model="form.contactPerson" placeholder="如非车主本人送修，填写联系人" /></el-form-item>
            <el-form-item label="联系人电话"><el-input v-model="form.contactPhone" maxlength="11" placeholder="联系人电话" /></el-form-item>
            <el-divider content-position="left">车辆状况</el-divider>
            <el-form-item label="行驶里程" prop="mileage">
              <el-input-number v-model="form.mileage" :min="0" :step="1000" style="width:100%;" controls-position="right" />
              <span style="margin-left:8px;color:#999;">km</span>
            </el-form-item>
            <el-form-item label="燃油余量" prop="fuelLevel">
              <el-slider v-model="form.fuelLevel" :marks="{ 0: '空', 25: '1/4', 50: '1/2', 75: '3/4', 100: '满' }" :format-tooltip="(val) => val + '%'" style="width:calc(100% - 80px);" />
            </el-form-item>
            <el-divider content-position="left">其他信息</el-divider>
            <el-form-item label="接待人员" prop="receptionist">
              <el-select v-model="form.receptionist" style="width:100%;" placeholder="请选择接待人员">
                <el-option v-for="r in repairReceptionists" :key="r.id" :label="r.name" :value="r.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户描述故障">
              <el-input v-model="form.customerFaultDesc" type="textarea" :rows="3" placeholder="请输入客户描述的故障现象" />
            </el-form-item>
            <el-form-item label="随车物品">
              <el-checkbox-group v-model="form.accompanyItems">
                <el-checkbox v-for="item in accompanyItems" :key="item" :value="item" :label="item" />
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- ====== Step 2: 维修评估 ====== -->
        <div v-show="step===1">
          <el-form :model="form" :rules="step2Rules" ref="form2Ref" label-width="120px" class="dialog-form">
            <el-divider content-position="left">故障诊断</el-divider>
            <el-form-item label="故障类型" prop="faultTypes">
              <el-checkbox-group v-model="form.faultTypes">
                <el-checkbox v-for="ft in faultTypes" :key="ft" :value="ft" :label="ft" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="故障等级" prop="faultLevel">
              <div style="display:flex;align-items:center;gap:12px;">
                <el-rate v-model="form.faultLevel" :colors="['#F7BA2A', '#FF9900', '#FF0000']" show-text :texts="['轻微', '一般', '中等', '严重', '紧急']" />
              </div>
            </el-form-item>
            <el-form-item label="故障描述" prop="faultDesc">
              <el-input v-model="form.faultDesc" type="textarea" :rows="3" placeholder="详细描述故障现象及表现" />
            </el-form-item>
            <el-form-item label="初步诊断结果">
              <el-input v-model="form.preliminaryDiagnosis" type="textarea" :rows="2" placeholder="技术人员初步诊断结果" />
            </el-form-item>
            <el-divider content-position="left">维修方案</el-divider>
            <el-form-item label="是否需拆检" prop="needDisassemble">
              <el-radio-group v-model="form.needDisassemble">
                <el-radio value="yes">是</el-radio>
                <el-radio value="no">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.needDisassemble==='yes'" label="拆检项目">
              <el-input v-model="form.disassembleItems" placeholder="请列出需拆检的项目" />
            </el-form-item>
            <el-form-item label="维修类型" prop="repairType">
              <el-radio-group v-model="form.repairType">
                <el-radio-button v-for="rt in repairTypes" :key="rt" :value="rt">{{ rt }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="维修方案描述" prop="repairPlanDesc">
              <el-input v-model="form.repairPlanDesc" type="textarea" :rows="3" placeholder="详细描述维修方案与工序" />
            </el-form-item>
            <el-divider content-position="left">费用预估</el-divider>
            <el-form-item label="预计工时数" prop="estimatedHours">
              <el-input-number v-model="form.estimatedHours" :min="0" :step="0.5" :precision="1" style="width:200px;" controls-position="right" />
              <span style="margin-left:8px;color:#999;">小时</span>
            </el-form-item>
            <el-form-item label="预计工时费">
              <el-input-number v-model="form.estimatedLaborFee" :min="0" :step="50" style="width:200px;" controls-position="right" />
              <span style="margin-left:8px;color:#999;">元（参考单价：¥200/小时）</span>
            </el-form-item>
            <el-form-item label="预计配件费" prop="estimatedPartFee">
              <el-input-number v-model="form.estimatedPartFee" :min="0" :step="100" style="width:200px;" controls-position="right" />
            </el-form-item>
            <el-alert :title="`预计总费用：¥${estimatedTotalFee.toLocaleString()}`" type="info" :closable="false" show-icon style="margin-bottom:16px;" />
            <el-form-item label="是否需转件">
              <el-switch v-model="form.needTransferPart" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="form.needTransferPart" label="转件说明">
              <el-input v-model="form.transferPartDesc" type="textarea" :rows="2" placeholder="说明需调转的配件及原因" />
            </el-form-item>
            <el-divider content-position="left">评估信息</el-divider>
            <el-form-item label="评估人员" prop="evaluator">
              <el-select v-model="form.evaluator" style="width:100%;" placeholder="请选择评估人员">
                <el-option v-for="t in repairTechnicians.filter(t=>t.level==='高级技师')" :key="t.id" :label="`${t.name}（${t.level}）`" :value="t.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="评估日期" prop="evaluateDate">
              <el-date-picker v-model="form.evaluateDate" type="date" value-format="YYYY-MM-DD" placeholder="选择评估日期" style="width:100%;" />
            </el-form-item>
          </el-form>
        </div>

        <!-- ====== Step 3: 故障维修 ====== -->
        <div v-show="step===2">
          <el-form :model="form" :rules="step3Rules" ref="form3Ref" label-width="120px" class="dialog-form">
            <el-divider content-position="left">维修人员</el-divider>
            <el-form-item label="主修人员" prop="mainTechnician">
              <el-select v-model="form.mainTechnician" style="width:100%;" placeholder="请选择主修人员">
                <el-option v-for="t in repairTechnicians.filter(t=>t.status==='在岗')" :key="t.id" :label="`${t.name}（${t.level}·${t.specialty}）`" :value="t.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="辅修人员">
              <el-select v-model="form.assistantTechnicians" multiple style="width:100%;" placeholder="可多选辅修人员">
                <el-option v-for="t in repairTechnicians.filter(t=>t.status==='在岗')" :key="t.id" :label="`${t.name}（${t.level}）`" :value="t.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="维修工位号" prop="stationId">
              <el-select v-model="form.stationId" style="width:100%;" placeholder="请选择工位">
                <el-option v-for="s in repairStations" :key="s.id" :label="`${s.name}（${s.type}）`" :value="s.name" />
              </el-select>
            </el-form-item>
            <el-divider content-position="left">维修时间</el-divider>
            <el-form-item label="开始维修时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择开始时间" style="width:100%;" />
            </el-form-item>
            <el-form-item label="完成维修时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择完成时间" style="width:100%;" />
            </el-form-item>
            <el-divider content-position="left">维修详情</el-divider>
            <el-form-item label="实际工时数" prop="actualHours">
              <el-input-number v-model="form.actualHours" :min="0" :step="0.5" :precision="1" style="width:200px;" controls-position="right" />
              <span style="margin-left:8px;color:#999;">小时</span>
            </el-form-item>
            <el-form-item label="实际工时费" prop="actualLaborFee">
              <el-input-number v-model="form.actualLaborFee" :min="0" :step="50" style="width:200px;" controls-position="right" />
            </el-form-item>
            <el-form-item label="实际故障原因" prop="actualFaultCause">
              <el-input v-model="form.actualFaultCause" type="textarea" :rows="3" placeholder="详细说明实际故障原因" />
            </el-form-item>
            <el-form-item label="实际维修内容" prop="actualRepairContent">
              <el-input v-model="form.actualRepairContent" type="textarea" :rows="3" placeholder="详细说明实际维修操作内容" />
            </el-form-item>
            <el-form-item label="维修中发现问题">
              <el-input v-model="form.foundIssues" type="textarea" :rows="2" placeholder="维修过程中发现的其他问题（选填）" />
            </el-form-item>
            <el-form-item label="是否追加维修">
              <el-switch v-model="form.needAdditionalRepair" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-card v-if="form.needAdditionalRepair" shadow="never" style="margin-bottom:16px;border:1px dashed #d48806;background:#fffbe6;">
              <div style="font-weight:600;color:#d48806;margin-bottom:12px;">追加维修信息</div>
              <el-form-item label="追加维修项目">
                <el-input v-model="form.additionalRepairItems" placeholder="请描述追加维修的项目" />
              </el-form-item>
              <el-form-item label="追加维修费用">
                <el-input-number v-model="form.additionalRepairFee" :min="0" :step="100" style="width:200px;" controls-position="right" />
              </el-form-item>
            </el-card>
            <el-form-item label="试车结果">
              <el-radio-group v-model="form.testDriveResult">
                <el-radio v-for="r in testDriveResults" :key="r.value" :value="r.value">
                  <el-tag :type="r.type" size="small">{{ r.label }}</el-tag>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- ====== Step 4: 零件调用 ====== -->
        <div v-show="step===3">
          <el-alert title="请添加维修所需配件，至少添加一条配件记录" type="info" :closable="false" show-icon style="margin-bottom:16px;" />
          <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;">配件清单（{{ form.parts.length }} 项）</span>
            <el-button type="primary" size="small" @click="addPartRow"><el-icon><Plus /></el-icon> 添加配件</el-button>
          </div>
          <el-table :data="form.parts" border size="small" max-height="420" style="width:100%;">
            <el-table-column label="序号" width="50" align="center">
              <template #default="{$index}">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column label="零件名称" width="140">
              <template #default="{row}">
                <el-input v-model="row.name" size="small" placeholder="名称" />
              </template>
            </el-table-column>
            <el-table-column label="零件分类" width="170">
              <template #default="{row}">
                <el-tree-select v-model="row.category" :data="partCategoryTree" :props="{ value: 'value', label: 'label', children: 'children' }" check-strictly size="small" placeholder="选择分类" style="width:100%;" />
              </template>
            </el-table-column>
            <el-table-column label="品牌" width="130">
              <template #default="{row}">
                <el-select v-model="row.brand" size="small" placeholder="品牌" clearable style="width:100%;">
                  <el-option v-for="b in partBrands" :key="b" :label="b" :value="b" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="规格/型号" width="110">
              <template #default="{row}">
                <el-input v-model="row.spec" size="small" placeholder="规格" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80" align="center">
              <template #default="{row}">
                <el-select v-model="row.unit" size="small" placeholder="单位" style="width:100%;">
                  <el-option v-for="u in partUnitOptions" :key="u" :label="u" :value="u" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80" align="center">
              <template #default="{row}">
                <el-input-number v-model="row.quantity" size="small" :min="1" :step="1" controls-position="right" style="width:100%;" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100" align="right">
              <template #default="{row}">
                <el-input-number v-model="row.unitPrice" size="small" :min="0" :step="10" controls-position="right" style="width:100%;" />
              </template>
            </el-table-column>
            <el-table-column label="小计" width="90" align="right">
              <template #default="{row}">
                <span class="money">¥{{ (row.quantity * row.unitPrice || 0).toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="80" align="center">
              <template #default="{row}">
                <el-radio-group v-model="row.isStock" size="small">
                  <el-radio value="yes" style="margin-right:4px;">是</el-radio>
                  <el-radio value="no">否</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column v-if="hasNonStockPart" label="供应商" width="160">
              <template #default="{row}">
                <el-select v-if="row.isStock==='no'" v-model="row.supplier" size="small" placeholder="供应商" clearable style="width:100%;">
                  <el-option v-for="s in suppliers" :key="s.id" :label="s.name" :value="s.name" />
                </el-select>
                <span v-else style="color:#ccc;">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default="{$index}">
                <el-button type="danger" size="small" link @click="removePartRow($index)"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top:12px;text-align:right;font-size:16px;font-weight:600;color:#0066B1;">
            零件费用合计：<span class="money" style="font-size:18px;">¥{{ partsTotalFee.toLocaleString() }}</span>
          </div>
        </div>

        <!-- ====== Step 5: 维修状态 ====== -->
        <div v-show="step===4">
          <el-form :model="form" :rules="step5Rules" ref="form5Ref" label-width="120px" class="dialog-form">
            <el-divider content-position="left">当前状态</el-divider>
            <el-form-item label="维修状态" prop="repairStatus">
              <el-select v-model="form.repairStatus" style="width:100%;" placeholder="请选择维修状态">
                <el-option v-for="s in repairStatusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
            </el-form-item>
            <el-divider content-position="left">质检信息</el-divider>
            <el-form-item label="质检人员" prop="inspector">
              <el-select v-model="form.inspector" style="width:100%;" placeholder="请选择质检人员">
                <el-option v-for="i in repairInspectors" :key="i.id" :label="`${i.name}（${i.level}）`" :value="i.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="质检日期">
              <el-date-picker v-model="form.inspectDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择质检时间" style="width:100%;" />
            </el-form-item>
            <el-form-item label="质检结果" prop="qualityResult">
              <el-radio-group v-model="form.qualityResult">
                <el-radio v-for="q in qualityResults" :key="q.value" :value="q.value">{{ q.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="质检备注">
              <el-input v-model="form.inspectRemark" type="textarea" :rows="2" placeholder="质检备注信息" />
            </el-form-item>
            <el-form-item label="是否返工">
              <el-switch v-model="form.isRework" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-alert v-if="form.isRework" title="该工单已标记为返工，请填写返工详细信息" type="error" :closable="false" show-icon style="margin-bottom:16px;" />
            <el-card v-if="form.isRework" shadow="never" style="margin-bottom:16px;border:1px solid #f56c6c;background:#fef0f0;">
              <div style="font-weight:600;color:#f56c6c;margin-bottom:12px;">返工信息</div>
              <el-form-item label="返工原因">
                <el-input v-model="form.reworkReason" type="textarea" :rows="2" placeholder="请说明返工原因" />
              </el-form-item>
              <el-form-item label="返工负责人">
                <el-select v-model="form.reworkPerson" style="width:100%;" placeholder="请选择返工负责人">
                  <el-option v-for="t in repairTechnicians.filter(t=>t.status==='在岗')" :key="t.id" :label="`${t.name}（${t.level}）`" :value="t.name" />
                </el-select>
              </el-form-item>
              <el-form-item label="返工完成时间">
                <el-date-picker v-model="form.reworkEndDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择返工完成时间" style="width:100%;" />
              </el-form-item>
            </el-card>
          </el-form>
        </div>

        <!-- ====== Step 6: 费用结算 ====== -->
        <div v-show="step===5">
          <el-form :model="form" :rules="step6Rules" ref="form6Ref" label-width="120px" class="dialog-form">
            <el-divider content-position="left">费用明细</el-divider>
            <el-form-item label="工时费小计" prop="laborFee">
              <el-input-number v-model="form.laborFee" :min="0" :step="50" style="width:220px;" controls-position="right" />
            </el-form-item>
            <el-form-item label="配件费小计" prop="partFee">
              <el-input-number v-model="form.partFee" :min="0" :step="100" style="width:220px;" controls-position="right" />
            </el-form-item>
            <el-form-item label="附加费用" prop="additionalFee">
              <el-input-number v-model="form.additionalFee" :min="0" :step="50" style="width:220px;" controls-position="right" />
              <div style="color:#999;font-size:12px;margin-top:4px;">如拖车费、检测费、洗车费等</div>
            </el-form-item>
            <el-form-item label="优惠金额">
              <el-input-number v-model="form.discountAmount" :min="0" :step="100" style="width:220px;" controls-position="right" />
            </el-form-item>
            <el-descriptions :column="1" border size="small" style="max-width:400px;margin-bottom:16px;">
              <el-descriptions-item label="费用合计">
                <span class="money" style="font-size:15px;">¥{{ subtotalFee.toLocaleString() }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="优惠金额">
                <span style="color:#52c41a;">-¥{{ (form.discountAmount || 0).toLocaleString() }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="应收总额">
                <span class="money" style="font-size:20px;color:#cf1322;font-weight:700;">¥{{ totalFee.toLocaleString() }}</span>
              </el-descriptions-item>
            </el-descriptions>
            <el-alert v-if="totalFee > estimatedTotalFee && estimatedTotalFee > 0" title="实际费用超出预估费用，请注意与客户沟通确认！" type="warning" :closable="false" show-icon style="margin-bottom:16px;" />
            <el-divider content-position="left">结算信息</el-divider>
            <el-form-item label="结算方式" prop="settlementMethod">
              <el-radio-group v-model="form.settlementMethod">
                <el-radio-button v-for="m in settlementMethods" :key="m" :value="m">{{ m }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="已付金额">
              <el-input-number v-model="form.paidAmount" :min="0" :step="100" style="width:220px;" controls-position="right" />
            </el-form-item>
            <el-form-item label="取车日期" prop="pickupDate">
              <el-date-picker v-model="form.pickupDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择取车日期时间" style="width:100%;" />
            </el-form-item>
            <el-form-item label="整体备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他需要备注的信息" />
            </el-form-item>
            <el-divider content-position="left">工单汇总</el-divider>
            <el-collapse>
              <el-collapse-item title="查看完整工单信息">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="工单类型">{{ form.repairType }}</el-descriptions-item>
                  <el-descriptions-item label="来修方式">{{ form.arrivalMethod }}</el-descriptions-item>
                  <el-descriptions-item label="VIN码">{{ form.vin }}</el-descriptions-item>
                  <el-descriptions-item label="车型">{{ form.modelName }}</el-descriptions-item>
                  <el-descriptions-item label="车主">{{ form.ownerName }}</el-descriptions-item>
                  <el-descriptions-item label="车主电话">{{ form.ownerPhone }}</el-descriptions-item>
                  <el-descriptions-item label="故障类型">{{ form.faultTypes?.join('、') }}</el-descriptions-item>
                  <el-descriptions-item label="故障等级">{{ form.faultLevel }}星</el-descriptions-item>
                  <el-descriptions-item label="主修人员">{{ form.mainTechnician }}</el-descriptions-item>
                  <el-descriptions-item label="工位号">{{ form.stationId }}</el-descriptions-item>
                  <el-descriptions-item label="实际工时">{{ form.actualHours }}小时</el-descriptions-item>
                  <el-descriptions-item label="配件数量">{{ form.parts.length }}项</el-descriptions-item>
                  <el-descriptions-item label="质检结果">{{ form.qualityResult === 'pass' ? '合格' : form.qualityResult === 'fail' ? '不合格' : '需返工' }}</el-descriptions-item>
                  <el-descriptions-item label="结算方式">{{ form.settlementMethod }}</el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button v-if="step>0" @click="step--">上一步</el-button>
        <el-button v-if="step<5" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="step===5" type="primary" @click="submitRepair">{{ editingId ? '更新' : '提交' }}</el-button>
        <el-button @click="dialogVisible=false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRepairStore } from '../stores/repair'
import { useVehicleStore } from '../stores/vehicle'
import {
  repairTechnicians, repairReceptionists, repairStations, repairInspectors,
  arrivalMethods, faultTypes, repairTypes, repairStatusOptions, settlementMethods,
  partUnitOptions, partCategoryTree, partBrands, accompanyItems, testDriveResults, qualityResults,
  suppliers,
} from '../mock/data'

const store = useRepairStore()
const vehicleStore = useVehicleStore()

const dateRange = ref(null)
const filterStatus = ref('')
const filterType = ref('')
const filterTechnician = ref('')

const filteredRecords = computed(() => {
  let list = [...store.repairRecords]
  if (dateRange.value?.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter(r => r.createTime >= start && r.createTime <= end + ' 23:59:59')
  }
  if (filterStatus.value) list = list.filter(r => r.repairStatus === filterStatus.value)
  if (filterType.value) list = list.filter(r => r.repairType === filterType.value)
  if (filterTechnician.value) list = list.filter(r => r.mainTechnician === filterTechnician.value)
  return list
})

function statusLabel(val) { return repairStatusOptions.find(s => s.value === val)?.label || val }
function statusTagType(val) {
  const map = { pending: 'info', repairing: 'primary', wait_inspect: 'warning', inspecting: '', inspect_pass: 'success', rework: 'danger', wait_settle: 'warning', settled: 'success', completed: 'success' }
  return map[val] || 'info'
}

// ===== 表单相关 =====
const dialogVisible = ref(false)
const step = ref(0)
const editingId = ref(null)
const selectedVehicle = ref(null)
const form1Ref = ref(null)
const form2Ref = ref(null)
const form3Ref = ref(null)
const form5Ref = ref(null)
const form6Ref = ref(null)

const emptyPart = () => ({ code: '', name: '', category: '', brand: '', spec: '', unit: '个', quantity: 1, unitPrice: 0, isStock: 'yes', supplier: '' })

const initForm = () => ({
  arrivalMethod: '', arrivalDate: '', expectedPickupDate: '',
  vin: '', plateNumber: '', modelName: '',
  ownerName: '', ownerPhone: '', ownerIdCard: '', ownerAddress: '', contactPerson: '', contactPhone: '',
  mileage: 0, fuelLevel: 50,
  receptionist: '', customerFaultDesc: '', accompanyItems: [],
  faultTypes: [], faultLevel: 0, faultDesc: '', preliminaryDiagnosis: '',
  needDisassemble: 'no', disassembleItems: '',
  repairType: '', repairPlanDesc: '',
  estimatedHours: 0, estimatedLaborFee: 0, estimatedPartFee: 0,
  needTransferPart: false, transferPartDesc: '',
  evaluator: '', evaluateDate: '',
  mainTechnician: '', assistantTechnicians: [], stationId: '',
  startTime: '', endTime: '',
  actualHours: 0, actualLaborFee: 0,
  actualFaultCause: '', actualRepairContent: '', foundIssues: '',
  needAdditionalRepair: false, additionalRepairItems: '', additionalRepairFee: 0,
  testDriveResult: '',
  parts: [emptyPart()],
  repairStatus: 'repairing', inspector: '', inspectDate: '', qualityResult: '', inspectRemark: '',
  isRework: false, reworkReason: '', reworkPerson: '', reworkEndDate: '',
  laborFee: 0, partFee: 0, additionalFee: 0, discountAmount: 0,
  settlementMethod: '', paidAmount: 0, pickupDate: '',
  remark: '',
})
const form = ref(initForm())

// ===== 验证规则 =====
const step1Rules = {
  arrivalMethod: [{ required: true, message: '请选择来修方式', trigger: 'change' }],
  arrivalDate: [{ required: true, message: '请选择来修日期', trigger: 'change' }],
  expectedPickupDate: [{ required: true, message: '请选择预计取车日期', trigger: 'change' }],
  vin: [{ required: true, message: '请输入VIN码', trigger: 'blur' }],
  ownerName: [{ required: true, message: '请输入车主姓名', trigger: 'blur' }],
  ownerPhone: [{ required: true, message: '请输入车主电话', trigger: 'blur' }],
  ownerIdCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  mileage: [{ required: true, message: '请输入行驶里程', trigger: 'blur' }],
  fuelLevel: [{ required: true, message: '请选择燃油余量', trigger: 'change' }],
  receptionist: [{ required: true, message: '请选择接待人员', trigger: 'change' }],
}
const step2Rules = {
  faultTypes: [{ type: 'array', required: true, message: '请选择故障类型', trigger: 'change' }],
  faultLevel: [{ required: true, message: '请评定故障等级', trigger: 'change' }],
  faultDesc: [{ required: true, message: '请描述故障', trigger: 'blur' }],
  needDisassemble: [{ required: true, message: '请选择', trigger: 'change' }],
  repairType: [{ required: true, message: '请选择维修类型', trigger: 'change' }],
  repairPlanDesc: [{ required: true, message: '请描述维修方案', trigger: 'blur' }],
  estimatedHours: [{ required: true, message: '请输入预计工时', trigger: 'blur' }],
  estimatedPartFee: [{ required: true, message: '请输入预计配件费', trigger: 'blur' }],
  evaluator: [{ required: true, message: '请选择评估人员', trigger: 'change' }],
  evaluateDate: [{ required: true, message: '请选择评估日期', trigger: 'change' }],
}
const step3Rules = {
  mainTechnician: [{ required: true, message: '请选择主修人员', trigger: 'change' }],
  stationId: [{ required: true, message: '请选择工位', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择完成时间', trigger: 'change' }],
  actualHours: [{ required: true, message: '请输入实际工时', trigger: 'blur' }],
  actualLaborFee: [{ required: true, message: '请输入实际工时费', trigger: 'blur' }],
  actualFaultCause: [{ required: true, message: '请说明实际故障原因', trigger: 'blur' }],
  actualRepairContent: [{ required: true, message: '请说明实际维修内容', trigger: 'blur' }],
}
const step5Rules = {
  repairStatus: [{ required: true, message: '请选择维修状态', trigger: 'change' }],
  inspector: [{ required: true, message: '请选择质检人员', trigger: 'change' }],
  qualityResult: [{ required: true, message: '请选择质检结果', trigger: 'change' }],
}
const step6Rules = {
  laborFee: [{ required: true, message: '请输入工时费', trigger: 'blur' }],
  partFee: [{ required: true, message: '请输入配件费', trigger: 'blur' }],
  additionalFee: [{ required: true, message: '请输入附加费用', trigger: 'blur' }],
  settlementMethod: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
  pickupDate: [{ required: true, message: '请选择取车日期', trigger: 'change' }],
}

// ===== 计算属性 =====
const estimatedTotalFee = computed(() => (form.value.estimatedLaborFee || 0) + (form.value.estimatedPartFee || 0))
const hasNonStockPart = computed(() => form.value.parts.some(p => p.isStock === 'no'))
const partsTotalFee = computed(() => form.value.parts.reduce((sum, p) => sum + (p.quantity || 0) * (p.unitPrice || 0), 0))
const subtotalFee = computed(() => (form.value.laborFee || 0) + (form.value.partFee || 0) + (form.value.additionalFee || 0))
const totalFee = computed(() => subtotalFee.value - (form.value.discountAmount || 0))

// ===== VIN搜索 =====
function queryVin(query, cb) {
  const results = query
    ? vehicleStore.vehicles.filter(v => v.vin.toLowerCase().includes(query.toLowerCase())).map(v => ({ value: v.vin, vehicle: v }))
    : []
  cb(results)
}
function onVinSelect(item) {
  if (!item.vehicle) return
  selectedVehicle.value = item.vehicle
  form.value.plateNumber = item.vehicle.plateNumber || ''
  form.value.modelName = item.vehicle.modelName || ''
}

// ===== 零件操作 =====
function addPartRow() { form.value.parts.push(emptyPart()) }
function removePartRow(idx) { form.value.parts.splice(idx, 1) }

// ===== 步骤导航 =====
async function nextStep() {
  if (step.value === 0) {
    try { await form1Ref.value?.validate(); step.value = 1 } catch(e) {}
  } else if (step.value === 1) {
    try { await form2Ref.value?.validate(); step.value = 2 } catch(e) {}
  } else if (step.value === 2) {
    try { await form3Ref.value?.validate(); step.value = 3 } catch(e) {}
  } else if (step.value === 3) {
    if (form.value.parts.length === 0) { ElMessage.warning('请至少添加一条配件记录'); return }
    const hasEmpty = form.value.parts.some(p => !p.name)
    if (hasEmpty) { ElMessage.warning('请填写所有配件的名称'); return }
    step.value = 4
  } else if (step.value === 4) {
    try { await form5Ref.value?.validate(); step.value = 5 } catch(e) {}
  }
}

// ===== 提交 =====
function submitRepair() {
  form6Ref.value?.validate((valid) => {
    if (!valid) return
    const f = form.value
    const data = {
      vin: f.vin, plateNumber: f.plateNumber, modelName: f.modelName,
      ownerName: f.ownerName, ownerPhone: f.ownerPhone, ownerIdCard: f.ownerIdCard,
      ownerAddress: f.ownerAddress, contactPerson: f.contactPerson, contactPhone: f.contactPhone,
      arrivalMethod: f.arrivalMethod, arrivalDate: f.arrivalDate, expectedPickupDate: f.expectedPickupDate,
      mileage: f.mileage, fuelLevel: f.fuelLevel,
      receptionist: f.receptionist, customerFaultDesc: f.customerFaultDesc, accompanyItems: f.accompanyItems,
      faultTypes: f.faultTypes, faultLevel: f.faultLevel, faultDesc: f.faultDesc,
      preliminaryDiagnosis: f.preliminaryDiagnosis,
      needDisassemble: f.needDisassemble, disassembleItems: f.disassembleItems,
      repairType: f.repairType, repairPlanDesc: f.repairPlanDesc,
      estimatedHours: f.estimatedHours, estimatedLaborFee: f.estimatedLaborFee, estimatedPartFee: f.estimatedPartFee,
      needTransferPart: f.needTransferPart, transferPartDesc: f.transferPartDesc,
      evaluator: f.evaluator, evaluateDate: f.evaluateDate,
      mainTechnician: f.mainTechnician, assistantTechnicians: f.assistantTechnicians, stationId: f.stationId,
      startTime: f.startTime, endTime: f.endTime,
      actualHours: f.actualHours, actualLaborFee: f.actualLaborFee,
      actualFaultCause: f.actualFaultCause, actualRepairContent: f.actualRepairContent,
      foundIssues: f.foundIssues,
      needAdditionalRepair: f.needAdditionalRepair, additionalRepairItems: f.additionalRepairItems, additionalRepairFee: f.additionalRepairFee,
      testDriveResult: f.testDriveResult,
      parts: f.parts,
      repairStatus: f.repairStatus, inspector: f.inspector, inspectDate: f.inspectDate,
      qualityResult: f.qualityResult, inspectRemark: f.inspectRemark,
      isRework: f.isRework, reworkReason: f.reworkReason, reworkPerson: f.reworkPerson, reworkEndDate: f.reworkEndDate,
      laborFee: f.laborFee, partFee: f.partFee, additionalFee: f.additionalFee,
      discountAmount: f.discountAmount, totalFee: totalFee.value,
      settlementMethod: f.settlementMethod, paidAmount: f.paidAmount, pickupDate: f.pickupDate,
      remark: f.remark,
    }

    if (editingId.value) {
      store.updateRepairRecord(editingId.value, data)
      ElMessage.success('维修工单更新成功！')
    } else {
      store.addRepairRecord(data)
      ElMessage.success('维修工单提交成功！')
    }
    dialogVisible.value = false
  })
}

// ===== 打开/编辑/删除 =====
function openRepair() {
  form.value = initForm()
  selectedVehicle.value = null
  step.value = 0
  editingId.value = null
  dialogVisible.value = true
}

function editRecord(row) {
  editingId.value = row.id
  selectedVehicle.value = vehicleStore.vehicles.find(v => v.vin === row.vin) || null
  form.value = {
    arrivalMethod: row.arrivalMethod || '', arrivalDate: row.arrivalDate || '', expectedPickupDate: row.expectedPickupDate || '',
    vin: row.vin || '', plateNumber: row.plateNumber || '', modelName: row.modelName || '',
    ownerName: row.ownerName || '', ownerPhone: row.ownerPhone || '', ownerIdCard: row.ownerIdCard || '',
    ownerAddress: row.ownerAddress || '', contactPerson: row.contactPerson || '', contactPhone: row.contactPhone || '',
    mileage: row.mileage || 0, fuelLevel: row.fuelLevel ?? 50,
    receptionist: row.receptionist || '', customerFaultDesc: row.customerFaultDesc || '', accompanyItems: row.accompanyItems || [],
    faultTypes: row.faultTypes || [], faultLevel: row.faultLevel || 0, faultDesc: row.faultDesc || '',
    preliminaryDiagnosis: row.preliminaryDiagnosis || '',
    needDisassemble: row.needDisassemble || 'no', disassembleItems: row.disassembleItems || '',
    repairType: row.repairType || '', repairPlanDesc: row.repairPlanDesc || '',
    estimatedHours: row.estimatedHours || 0, estimatedLaborFee: row.estimatedLaborFee || 0, estimatedPartFee: row.estimatedPartFee || 0,
    needTransferPart: row.needTransferPart || false, transferPartDesc: row.transferPartDesc || '',
    evaluator: row.evaluator || '', evaluateDate: row.evaluateDate || '',
    mainTechnician: row.mainTechnician || '', assistantTechnicians: row.assistantTechnicians || [], stationId: row.stationId || '',
    startTime: row.startTime || '', endTime: row.endTime || '',
    actualHours: row.actualHours || 0, actualLaborFee: row.actualLaborFee || 0,
    actualFaultCause: row.actualFaultCause || '', actualRepairContent: row.actualRepairContent || '',
    foundIssues: row.foundIssues || '',
    needAdditionalRepair: row.needAdditionalRepair || false, additionalRepairItems: row.additionalRepairItems || '', additionalRepairFee: row.additionalRepairFee || 0,
    testDriveResult: row.testDriveResult || '',
    parts: row.parts?.length ? [...row.parts] : [emptyPart()],
    repairStatus: row.repairStatus || 'repairing', inspector: row.inspector || '', inspectDate: row.inspectDate || '',
    qualityResult: row.qualityResult || '', inspectRemark: row.inspectRemark || '',
    isRework: row.isRework || false, reworkReason: row.reworkReason || '', reworkPerson: row.reworkPerson || '', reworkEndDate: row.reworkEndDate || '',
    laborFee: row.laborFee || 0, partFee: row.partFee || 0, additionalFee: row.additionalFee || 0,
    discountAmount: row.discountAmount || 0,
    settlementMethod: row.settlementMethod || '', paidAmount: row.paidAmount || 0, pickupDate: row.pickupDate || '',
    remark: row.remark || '',
  }
  step.value = 0
  dialogVisible.value = true
}

function deleteRecord(id) {
  ElMessageBox.confirm('确定删除该维修工单吗？删除后不可恢复！', '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(() => {
    store.deleteRepairRecord(id)
    ElMessage.success('删除成功！')
  }).catch(() => {})
}
</script>

<style scoped>
.step-content {
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 4px;
}
.step-content::-webkit-scrollbar {
  width: 6px;
}
.step-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.dialog-form {
  max-width: 720px;
}
</style>