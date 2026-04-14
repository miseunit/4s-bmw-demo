<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div style="display:flex;align-items:center;margin-bottom:20px;">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <div class="page-title" style="margin-left:12px;">新车采购入库</div>
    </div>

    <!-- 步骤条 -->
    <el-steps :active="newStep" simple finish-status="success" style="margin-bottom:24px;">
      <el-step title="车辆与采购信息" />
      <el-step title="物流验车与提交" />
    </el-steps>

    <!-- Step 0: 车辆与采购信息（合并原 Step 0 + Step 1） -->
    <div v-show="newStep === 0">
      <el-form :model="newForm" :rules="step0Rules" ref="step0FormRef" label-width="120px" class="page-form">

        <!-- 车型选择 -->
        <div class="form-section">
          <div class="section-title">🚗 车型选择</div>
          <el-form-item label="车系" prop="seriesName">
            <el-select v-model="newForm.seriesId" placeholder="请选择车系" filterable style="width:100%;" @change="onSeriesChange">
              <el-option v-for="s in store.carSeries" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="车型" prop="modelName">
            <el-select v-model="newForm.modelId" placeholder="请先选择车系" filterable style="width:100%;" :disabled="!newForm.seriesId" @change="onModelChange">
              <el-option v-for="m in filteredModels" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="指导价" v-if="newForm.guidePrice">
            <span class="money" style="font-size:16px;color:#0066B1;">¥{{ newForm.guidePrice?.toLocaleString() }}</span>
          </el-form-item>
          <el-form-item label="供应商" prop="supplier">
            <el-select v-model="newForm.supplierId" placeholder="请选择供应商" filterable style="width:100%;" @change="onSupplierChange">
              <el-option v-for="s in suppliers" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="供应商联系人">
            <el-input v-model="newForm.supplierContact" placeholder="请输入供应商联系人" />
          </el-form-item>
        </div>
        <el-divider />

        <!-- 车辆基本信息 -->
        <div class="form-section">
          <div class="section-title">📋 车辆基本信息</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="VIN码" prop="vin" label-width="100px">
                <el-input v-model="newForm.vin" placeholder="17位VIN码" maxlength="17" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发动机号" prop="engineNumber" label-width="100px">
                <el-input v-model="newForm.engineNumber" placeholder="请输入发动机号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="车架号后6位" label-width="100px">
                <el-input v-model="newForm.chassisLast6" placeholder="请输入车架号后6位" maxlength="6" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车辆批次号" label-width="100px">
                <el-input v-model="newForm.vehicleBatch" placeholder="请输入车辆批次号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="颜色" prop="color" label-width="100px">
                <el-select v-model="newForm.color" placeholder="请选择" style="width:100%;">
                  <el-option v-for="c in colorOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内饰颜色" label-width="100px">
                <el-select v-model="newForm.interiorColor" placeholder="请选择" style="width:100%;">
                  <el-option v-for="c in interiorColorOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 车辆配置 -->
        <div class="form-section">
          <div class="section-title">⚙️ 车辆配置</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="年款" label-width="80px">
                <el-select v-model="newForm.modelYear" placeholder="请选择" style="width:100%;">
                  <el-option v-for="y in modelYearOptions" :key="y" :label="y" :value="y" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="车身形式" label-width="80px">
                <el-select v-model="newForm.bodyType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="b in bodyTypeOptions" :key="b" :label="b" :value="b" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="座位数" label-width="80px">
                <el-select v-model="newForm.seatCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in seatCountOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="车门数" label-width="80px">
                <el-select v-model="newForm.doorCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="d in doorCountOptions" :key="d" :label="d" :value="d" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排放标准" label-width="80px">
                <el-select v-model="newForm.emissionStandard" placeholder="请选择" style="width:100%;">
                  <el-option v-for="e in emissionStandardOptions" :key="e" :label="e" :value="e" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="燃油类型" label-width="80px">
                <el-select v-model="newForm.fuelType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="f in fuelTypeOptions" :key="f" :label="f" :value="f" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="变速箱" label-width="80px">
                <el-select v-model="newForm.transmission" placeholder="请选择" style="width:100%;">
                  <el-option v-for="t in transmissionOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="驱动方式" label-width="80px">
                <el-select v-model="newForm.driveMode" placeholder="请选择" style="width:100%;">
                  <el-option v-for="d in driveModeOptions" :key="d" :label="d" :value="d" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="生产日期" label-width="80px">
                <el-date-picker v-model="newForm.productionDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="选装配置">
            <el-checkbox-group v-model="newForm.carOptions">
              <el-checkbox v-for="opt in carOptionsList" :key="opt" :label="opt">{{ opt }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <el-divider />

        <!-- 合格证与产地 -->
        <div class="form-section">
          <div class="section-title">📄 合格证与产地</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="合格证编号" prop="certificateNo" label-width="100px">
                <el-input v-model="newForm.certificateNo" placeholder="请输入合格证编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产地" prop="originPlace" label-width="100px">
                <el-select v-model="newForm.originPlace" placeholder="请选择" style="width:100%;">
                  <el-option v-for="o in originPlaceOptions" :key="o" :label="o" :value="o" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="钥匙数量" prop="keyCount" label-width="100px">
                <el-select v-model="newForm.keyCount" placeholder="请选择" style="width:100%;">
                  <el-option v-for="k in keyCountOptions" :key="k" :label="k + '把'" :value="k" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="轮胎品牌" label-width="100px">
                <el-input v-model="newForm.tireBrand" placeholder="如：米其林、固特异" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="电池型号" label-width="100px">
                <el-input v-model="newForm.batteryModel" placeholder="请输入电池型号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="质保里程数(万km)" label-width="120px">
                <el-input-number v-model="newForm.warrantyMileage" :min="0" :step="1" :precision="1" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 采购信息 -->
        <div class="form-section">
          <div class="section-title">💰 采购信息</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="采购类型" prop="purchaseType" label-width="100px">
                <el-select v-model="newForm.purchaseType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="t in purchaseTypeOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="采购单价" prop="purchasePrice" label-width="100px">
                <el-input-number v-model="newForm.purchasePrice" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="采购数量" prop="quantity" label-width="100px">
                <el-input-number v-model="newForm.quantity" :min="1" :max="10" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="采购总价">
            <span class="money" style="font-size:18px;color:#cf1322;font-weight:600;">¥{{ (newForm.purchasePrice * newForm.quantity).toLocaleString() }}</span>
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="到车日期" prop="purchaseDate" label-width="100px">
                <el-date-picker v-model="newForm.purchaseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款方式" prop="paymentMethod" label-width="100px">
                <el-select v-model="newForm.paymentMethod" placeholder="请选择" style="width:100%;">
                  <el-option v-for="m in paymentMethodOptions" :key="m" :label="m" :value="m" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款期限" label-width="100px">
                <el-date-picker v-model="newForm.paymentDeadline" type="date" placeholder="选择付款期限" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="采购合同号" prop="contractNo" label-width="100px">
                <el-input v-model="newForm.contractNo" placeholder="请输入采购合同号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同签订日期" label-width="110px">
                <el-date-picker v-model="newForm.contractSignDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同金额" label-width="100px">
                <el-input-number v-model="newForm.contractAmount" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="销售顾问" label-width="100px">
                <el-input v-model="newForm.salesConsultant" placeholder="请输入销售顾问" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="提成比例%" label-width="100px">
                <el-input-number v-model="newForm.commissionRate" :min="0" :max="10" :step="0.1" :precision="1" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="采购经办人" label-width="100px">
                <el-input v-model="newForm.supplierContact" placeholder="请输入经办人" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 费用明细 -->
        <div class="form-section">
          <div class="section-title">📊 费用明细</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="裸车价">
                <el-input-number v-model="newForm.nakedPrice" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="装具/精品费">
                <el-input-number v-model="newForm.accessoriesFee" :min="0" :step="100" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="购置税预估">
                <el-input-number v-model="newForm.purchaseTax" :min="0" :step="100" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="保险费预估">
                <el-input-number v-model="newForm.insuranceFee" :min="0" :step="100" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="上牌费">
                <el-input-number v-model="newForm.registrationFee" :min="0" :step="100" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="其他费用">
                <el-input-number v-model="newForm.otherFees" :min="0" :step="100" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="预计总成本">
            <span class="money" style="font-size:16px;color:#ff4d4f;font-weight:600;">
              ¥{{ ((newForm.nakedPrice || 0) + (newForm.accessoriesFee || 0) + (newForm.purchaseTax || 0) + (newForm.insuranceFee || 0) + (newForm.registrationFee || 0) + (newForm.otherFees || 0)).toLocaleString() }}
            </span>
          </el-form-item>
        </div>
        <el-divider />

        <!-- 财务结算 -->
        <div class="form-section">
          <div class="section-title">💳 财务结算</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="指导价">
                <span class="money" style="font-size:14px;color:#0066B1;">¥{{ newForm.guidePrice?.toLocaleString() }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="市场优惠">
                <el-input-number v-model="newForm.marketDiscount" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="实际成交价" prop="actualPrice">
                <el-input-number v-model="newForm.actualPrice" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预计利润">
                <span class="money" style="font-size:14px;color:#52c41a;font-weight:600;">
                  ¥{{ ((newForm.actualPrice || 0) - (newForm.purchasePrice || 0)).toLocaleString() }}
                </span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="客户定金">
                <el-input-number v-model="newForm.depositAmount" :min="0" :step="1000" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="定金日期">
                <el-date-picker v-model="newForm.depositDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款账户" prop="paymentAccount">
                <el-input v-model="newForm.paymentAccount" placeholder="付款账户名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="发票类型" prop="invoiceType">
                <el-select v-model="newForm.invoiceType" placeholder="请选择" style="width:100%;">
                  <el-option v-for="t in invoiceTypeOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="发票号码" prop="invoiceNo">
                <el-input v-model="newForm.invoiceNo" placeholder="请输入发票号码" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="收款账户">
                <el-input v-model="newForm.receiveAccount" placeholder="收款账户名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="发票抬头" prop="invoiceTitle">
                <el-input v-model="newForm.invoiceTitle" placeholder="请输入发票抬头" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="税号">
                <el-input v-model="newForm.taxNo" placeholder="请输入纳税人识别号" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 贷款信息 -->
        <div class="form-section">
          <div class="section-title">🏦 贷款信息</div>
          <el-form-item label="是否贷款">
            <el-switch v-model="newForm.hasLoan" active-text="是" inactive-text="否" />
          </el-form-item>
          <template v-if="newForm.hasLoan">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="首付金额">
                  <el-input-number v-model="newForm.loanDownPayment" :min="0" :step="1000" style="width:100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="首付比例%">
                  <el-input-number v-model="newForm.loanRatio" :min="10" :max="80" :step="5" style="width:100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="贷款期限(月)">
                  <el-input-number v-model="newForm.loanTerm" :min="12" :max="60" :step="12" style="width:100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="贷款银行">
                  <el-select v-model="newForm.loanBank" placeholder="请选择" style="width:100%;">
                    <el-option v-for="b in bankOptions" :key="b" :label="b" :value="b" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="月供金额">
                  <span class="money" style="font-size:16px;">¥{{ newForm.monthlyPayment?.toLocaleString() || '-' }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </div>
      </el-form>
    </div>

    <!-- Step 1: 物流验车与提交（原 Step 2） -->
    <div v-show="newStep === 1">
      <el-form :model="newForm" :rules="step1Rules" ref="step1FormRef" label-width="130px" class="page-form">

        <!-- 物流与收货信息 -->
        <div class="form-section">
          <div class="section-title">🚚 物流与收货信息</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="运输方式">
                <el-select v-model="newForm.transportMethod" placeholder="请选择" style="width:100%;">
                  <el-option v-for="t in transportMethodOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="发货日期">
                <el-date-picker v-model="newForm.shipDate" type="date" placeholder="选择发货日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="物流公司">
                <el-input v-model="newForm.logisticsCompany" placeholder="请输入物流公司名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="运单号">
                <el-input v-model="newForm.trackingNo" placeholder="请输入运单号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="GPS定位编号">
                <el-input v-model="newForm.gpsNo" placeholder="GPS编号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="库区" prop="warehouseArea">
                <el-select v-model="newForm.warehouseArea" placeholder="请选择" style="width:100%;">
                  <el-option v-for="a in warehouseAreaOptions" :key="a" :label="a" :value="a" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="送货地址">
            <el-input v-model="newForm.deliveryAddress" placeholder="请输入详细送货地址" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="收货人">
                <el-input v-model="newForm.receiverName" placeholder="请输入收货人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="收货电话">
                <el-input v-model="newForm.receiverPhone" placeholder="请输入收货电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="存放位置">
                <el-select v-model="newForm.location" placeholder="请选择" style="width:100%;">
                  <el-option v-for="l in locationOptions" :key="l" :label="l" :value="l" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="库管员" prop="warehouseKeeper">
                <el-input v-model="newForm.warehouseKeeper" placeholder="请输入库管员姓名" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 验车信息 -->
        <div class="form-section">
          <div class="section-title">🔍 验车信息</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="验车人" prop="inspector">
                <el-input v-model="newForm.inspector" placeholder="请输入验车人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="验车日期">
                <el-date-picker v-model="newForm.inspectDate" type="date" placeholder="选择验车日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="验车结果" prop="inspectResult">
                <el-select v-model="newForm.inspectResult" placeholder="请选择" style="width:100%;">
                  <el-option v-for="r in inspectResultOptions" :key="r" :label="r" :value="r" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="PDI检测" prop="pdiStatus">
                <el-select v-model="newForm.pdiStatus" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in pdiStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="清洗状态">
                <el-select v-model="newForm.cleanStatus" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in cleanStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="整备状态">
                <el-select v-model="newForm.prepStatus" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in prepStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="整备完成日期">
                <el-date-picker v-model="newForm.prepFinishDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-divider />

        <!-- 客户信息（预售） -->
        <div class="form-section">
          <div class="section-title">👤 客户信息（预售）</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="客户姓名">
                <el-input v-model="newForm.customerName" placeholder="请输入客户姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户电话">
                <el-input v-model="newForm.customerPhone" placeholder="请输入客户电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="销售订单号">
                <el-input v-model="newForm.salesOrderNo" placeholder="请输入销售订单号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="客户身份证">
            <el-input v-model="newForm.customerIdCard" placeholder="请输入客户身份证号" maxlength="18" />
          </el-form-item>
        </div>
        <el-divider />

        <!-- 其他信息 -->
        <div class="form-section">
          <div class="section-title">📝 其他信息</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="合格证状态" prop="certificateStatus">
                <el-select v-model="newForm.certificateStatus" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in certificateStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保险状态">
                <el-select v-model="newForm.insuranceStatus" placeholder="请选择" style="width:100%;">
                  <el-option v-for="s in insuranceStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="质保到期日">
                <el-date-picker v-model="newForm.warrantyExpiry" type="date" placeholder="选择质保到期日" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车牌号">
                <el-input v-model="newForm.plateNumber" placeholder="选填" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="随车物品">
            <el-checkbox-group v-model="newForm.vehicleItems">
              <el-checkbox v-for="item in vehicleItemOptions" :key="item" :label="item">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="newForm.remark" type="textarea" :rows="2" />
          </el-form-item>
        </div>
      </el-form>

      <!-- 确认信息展示 -->
      <div style="margin-top:20px;padding-top:16px;border-top:2px solid #eee;">
        <div class="section-title">✅ 采购信息确认</div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="车系/车型" :span="2">{{ newForm.seriesName }} / {{ newForm.modelName }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ newForm.supplier }}</el-descriptions-item>
          <el-descriptions-item label="VIN码" :span="2">{{ newForm.vin }}</el-descriptions-item>
          <el-descriptions-item label="发动机号">{{ newForm.engineNumber }}</el-descriptions-item>
          <el-descriptions-item label="颜色">{{ newForm.color }}</el-descriptions-item>
          <el-descriptions-item label="内饰">{{ newForm.interiorColor }}</el-descriptions-item>
          <el-descriptions-item label="年款/配置">{{ newForm.modelYear }} / {{ newForm.bodyType }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin:8px 0;"></div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="采购单价"><span class="money">¥{{ newForm.purchasePrice?.toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="数量">{{ newForm.quantity }}</el-descriptions-item>
          <el-descriptions-item label="采购总价"><span class="money" style="color:#cf1322;font-weight:600;">¥{{ (newForm.purchasePrice * newForm.quantity).toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="实际成交价"><span class="money" style="color:#0066B1;">¥{{ newForm.actualPrice?.toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="预计利润"><span class="money" style="color:#52c41a;">¥{{ ((newForm.actualPrice || 0) - (newForm.purchasePrice || 0)).toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="定金"><span class="money">¥{{ newForm.depositAmount?.toLocaleString() || '-' }}</span></el-descriptions-item>
        </el-descriptions>
        <div style="margin:8px 0;"></div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="合同号" :span="2">{{ newForm.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="到车日期">{{ newForm.purchaseDate }}</el-descriptions-item>
          <el-descriptions-item label="付款方式" :span="2">{{ newForm.paymentMethod }}</el-descriptions-item>
          <el-descriptions-item label="发票类型">{{ newForm.invoiceType }}</el-descriptions-item>
          <el-descriptions-item label="存放位置" :span="2">{{ newForm.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="验车结果">{{ newForm.inspectResult || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 附件上传 -->
      <div style="margin-top:16px;">
        <div class="section-title">📎 附件上传（模拟）</div>
        <el-upload action="#" :auto-upload="false" :limit="3">
          <el-button type="default">上传合格证/发票照片</el-button>
          <template #tip><div class="el-upload__tip">仅模拟展示，不会实际上传</div></template>
        </el-upload>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:center;gap:12px;">
      <el-button v-if="newStep > 0" @click="newStep--">上一步</el-button>
      <el-button v-if="newStep === 0" type="primary" @click="nextStep">下一步</el-button>
      <el-button v-if="newStep === 1" type="primary" @click="submit">{{ editingNewId ? '更新' : '提交' }}</el-button>
      <el-button @click="goBack">取消</el-button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useVehicleStore } from '../stores/vehicle'
import { useDocumentStore } from '../stores/document'
import { colorOptions, interiorColorOptions, locationOptions, suppliers } from '../mock/data'

const router = useRouter()
const store = useVehicleStore()
const documentStore = useDocumentStore()

// ===== 表单初始化 =====
const initNewForm = () => ({
    // 基础字段
    seriesName: '', seriesId: null, modelId: null, modelName: '', guidePrice: null, config: '', supplier: '', supplierId: null,
    // 车辆基本信息
    vin: '', plateNumber: '', engineNumber: '', chassisLast6: '',
    color: '', interiorColor: '', productionDate: '', vehicleBatch: '',
    // 车辆配置
    modelYear: '', bodyType: '', seatCount: '', doorCount: '',
    emissionStandard: '', fuelType: '', transmission: '', driveMode: '',
    carOptions: [],
    // 合格证与产地
    certificateNo: '', originPlace: '', importLicenseNo: '', customsNo: '',
    keyCount: null, tireBrand: '', batteryModel: '', warrantyMileage: null,
    // 采购与财务信息
    purchasePrice: null, quantity: 1, purchaseDate: '',
    paymentMethod: '', paymentDeadline: '', contractNo: '', supplierContact: '',
    purchaseType: '', contractSignDate: '', contractAmount: null,
    // 费用明细
    nakedPrice: null, accessoriesFee: null, purchaseTax: null, insuranceFee: null,
    registrationFee: null, otherFees: null, totalCost: null,
    marketDiscount: null, actualPrice: null, depositAmount: null, depositDate: '',
    profit: null, salesConsultant: '', commissionRate: null,
    // 发票信息
    invoiceType: '', invoiceNo: '', invoiceTitle: '', taxNo: '',
    paymentAccount: '', receiveAccount: '',
    // 贷款信息
    hasLoan: false, loanDownPayment: null, loanRatio: null, loanTerm: null, monthlyPayment: null, loanBank: '',
    // 物流、验车、客户信息
    transportMethod: '', logisticsCompany: '', trackingNo: '', shipDate: '',
    deliveryAddress: '', receiverName: '', receiverPhone: '', location: '',
    warehouseArea: '', warehouseKeeper: '',
    inspector: '', inspectDate: '', inspectResult: '', pdiStatus: '', cleanStatus: '', prepStatus: '',
    prepFinishDate: '', gpsNo: '',
    customerName: '', customerPhone: '', customerIdCard: '', salesOrderNo: '',
    certificateStatus: '', insuranceStatus: '', warrantyExpiry: '', vehicleItems: [], remark: ''
})

const newForm = ref(initNewForm())
const newStep = ref(0)
const editingNewId = ref(null)
const step0FormRef = ref(null)
const step1FormRef = ref(null)

// ===== 选项数据 =====
const paymentMethodOptions = ['转账', '现金', '承兑汇票']
const invoiceTypeOptions = ['增值税专用发票', '增值税普通发票']
const transportMethodOptions = ['厂家直送', '第三方物流', '自提']
const certificateStatusOptions = ['已到', '未到', '办理中']
const insuranceStatusOptions = ['已投保', '未投保']
const vehicleItemOptions = ['钥匙', '保修手册', '备胎', '工具包', '脚垫', '行车记录仪']
const modelYearOptions = ['2023', '2024', '2025', '2026']
const bodyTypeOptions = ['三厢轿车', 'SUV', 'MPV', '两厢轿车', '跑车', '皮卡', '跨界车']
const seatCountOptions = ['2座', '4座', '5座', '6座', '7座', '9座']
const doorCountOptions = ['2门', '3门', '4门', '5门']
const emissionStandardOptions = ['国VI', '国VI B', '国V', '欧VI', '零排放']
const fuelTypeOptions = ['汽油', '柴油', '纯电', '插电混动', '油电混动', '氢燃料']
const transmissionOptions = ['手动', '自动', '双离合', 'CVT无级变速', 'E-CVT', '序列式']
const driveModeOptions = ['前驱', '后驱', '四驱', '全时四驱', '分时四驱']
const carOptionsList = ['天窗', '真皮座椅', '座椅加热', '座椅通风', 'HUD抬头显示', '全景影像', '自适应巡航', '自动泊车', ' Bose音响', 'Harman Kardon音响']
const pdiStatusOptions = ['未检测', '检测中', '已通过', '有问题']
const cleanStatusOptions = ['未清洗', '清洗中', '已清洗']
const prepStatusOptions = ['未整备', '整备中', '已整备']
const inspectResultOptions = ['合格', '轻微瑕疵', '需维修']
const bankOptions = ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行', '平安银行', '其他']
const originPlaceOptions = ['国产', '德国进口', '美国进口', '日本进口', '韩国进口', '英国进口', '其他进口']
const purchaseTypeOptions = ['常规采购', '特价车', '促销活动', '批量采购', '厂家直发']
const warehouseAreaOptions = ['A区-展车位', 'B区-新车库', 'C区-在途区', 'D区-整备区', 'E区-外场地']
const keyCountOptions = [1, 2, 3]

// ===== 验证规则 =====
// Step 0: 合并原 Step 0 + Step 1 的验证规则
const step0Rules = {
    // 原车型选择+基本信息
    seriesName: [{ required: true, message: '请选择车系', trigger: 'change' }],
    modelName: [{ required: true, message: '请选择车型', trigger: 'change' }],
    supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    vin: [{ required: true, message: '请输入VIN码', trigger: 'blur' }],
    engineNumber: [{ required: true, message: '请输入发动机号', trigger: 'blur' }],
    color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
    certificateNo: [{ required: true, message: '请输入合格证编号', trigger: 'blur' }],
    originPlace: [{ required: true, message: '请选择产地', trigger: 'change' }],
    keyCount: [{ required: true, type: 'number', message: '请选择钥匙数量', trigger: 'change' }],
    // 原采购与财务信息
    purchaseType: [{ required: true, message: '请选择采购类型', trigger: 'change' }],
    purchasePrice: [{ required: true, message: '请输入采购单价', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    purchaseDate: [{ required: true, message: '请选择到车日期', trigger: 'change' }],
    paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
    contractNo: [{ required: true, message: '请输入采购合同号', trigger: 'blur' }],
    actualPrice: [{ required: true, message: '请输入实际成交价', trigger: 'blur' }],
    invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
    invoiceNo: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
    invoiceTitle: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
    paymentAccount: [{ required: true, message: '请输入付款账户', trigger: 'blur' }]
}

// Step 1: 物流验车验证规则（原 Step 2）
const step1Rules = {
    warehouseArea: [{ required: true, message: '请选择库区', trigger: 'change' }],
    warehouseKeeper: [{ required: true, message: '请输入库管员', trigger: 'blur' }],
    inspector: [{ required: true, message: '请输入验车人', trigger: 'blur' }],
    inspectResult: [{ required: true, message: '请选择验车结果', trigger: 'change' }],
    pdiStatus: [{ required: true, message: '请选择PDI状态', trigger: 'change' }],
    certificateStatus: [{ required: true, message: '请选择合格证状态', trigger: 'change' }]
}

// ===== 下拉选择逻辑 =====
const filteredModels = computed(() => {
    if (!newForm.value.seriesId) return []
    return store.carModels.filter(m => m.seriesId === newForm.value.seriesId)
})

/** 选择车系后联动车型 */
function onSeriesChange(seriesId) {
    const series = store.carSeries.find(s => s.id === seriesId)
    newForm.value.seriesName = series?.name || ''
    // 清空车型
    newForm.value.modelId = null
    newForm.value.modelName = ''
    newForm.value.guidePrice = null
    newForm.value.config = ''
}

/** 选择车型后填充指导价和配置 */
function onModelChange(modelId) {
    const model = store.carModels.find(m => m.id === modelId)
    if (model) {
        newForm.value.modelName = model.name
        newForm.value.guidePrice = model.guidePrice
        newForm.value.config = model.config
    }
}

/** 选择供应商 */
function onSupplierChange(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId)
    newForm.value.supplier = supplier?.name || ''
}

// ===== 步骤控制 =====
async function nextStep() {
    try {
        await step0FormRef.value?.validate()
        newStep.value = 1
    } catch (e) {
        ElMessage.warning('请完成必填项')
    }
}

// ===== 提交 =====
function submit() {
    const f = newForm.value
    if (editingNewId.value) {
        // 编辑模式：更新采购记录
        const idx = store.purchaseRecords.findIndex(r => r.id === editingNewId.value)
        if (idx !== -1) {
            store.purchaseRecords[idx] = {
                ...store.purchaseRecords[idx],
                seriesName: f.seriesName,
                modelName: f.modelName,
                vin: f.vin,
                supplier: f.supplier,
                purchasePrice: f.purchasePrice,
                quantity: f.quantity,
                totalPrice: f.purchasePrice * f.quantity,
                purchaseDate: f.purchaseDate
            }
        }
        // 同时更新对应车辆信息
        const vehicle = store.vehicles.find(v => v.vin === f.vin)
        if (vehicle) {
            store.updateVehicle(vehicle.id, {
                modelName: f.modelName, seriesName: f.seriesName, color: f.color, interiorColor: f.interiorColor,
                purchasePrice: f.purchasePrice, location: f.location, remark: f.remark,
                modelYear: f.modelYear, bodyType: f.bodyType, seatCount: f.seatCount, doorCount: f.doorCount,
                emissionStandard: f.emissionStandard, fuelType: f.fuelType, transmission: f.transmission, driveMode: f.driveMode,
                carOptions: f.carOptions, certificateNo: f.certificateNo, originPlace: f.originPlace,
                importLicenseNo: f.importLicenseNo, customsNo: f.customsNo, keyCount: f.keyCount,
                tireBrand: f.tireBrand, batteryModel: f.batteryModel, warrantyMileage: f.warrantyMileage,
                engineNumber: f.engineNumber, chassisLast6: f.chassisLast6, productionDate: f.productionDate, vehicleBatch: f.vehicleBatch,
                paymentMethod: f.paymentMethod, paymentDeadline: f.paymentDeadline, contractNo: f.contractNo,
                supplierContact: f.supplierContact, purchaseType: f.purchaseType, contractSignDate: f.contractSignDate,
                contractAmount: f.contractAmount, marketDiscount: f.marketDiscount, actualPrice: f.actualPrice,
                depositAmount: f.depositAmount, depositDate: f.depositDate, profit: f.profit,
                salesConsultant: f.salesConsultant, commissionRate: f.commissionRate,
                nakedPrice: f.nakedPrice, accessoriesFee: f.accessoriesFee, purchaseTax: f.purchaseTax,
                insuranceFee: f.insuranceFee, registrationFee: f.registrationFee, otherFees: f.otherFees, totalCost: f.totalCost,
                hasLoan: f.hasLoan, loanDownPayment: f.loanDownPayment, loanRatio: f.loanRatio,
                loanTerm: f.loanTerm, monthlyPayment: f.monthlyPayment, loanBank: f.loanBank,
                invoiceType: f.invoiceType, invoiceNo: f.invoiceNo, invoiceTitle: f.invoiceTitle,
                taxNo: f.taxNo, paymentAccount: f.paymentAccount, receiveAccount: f.receiveAccount,
                transportMethod: f.transportMethod, logisticsCompany: f.logisticsCompany, trackingNo: f.trackingNo,
                shipDate: f.shipDate, deliveryAddress: f.deliveryAddress, receiverName: f.receiverName, receiverPhone: f.receiverPhone,
                warehouseArea: f.warehouseArea, warehouseKeeper: f.warehouseKeeper, inspector: f.inspector,
                inspectDate: f.inspectDate, inspectResult: f.inspectResult, pdiStatus: f.pdiStatus,
                cleanStatus: f.cleanStatus, prepStatus: f.prepStatus, prepFinishDate: f.prepFinishDate, gpsNo: f.gpsNo,
                customerName: f.customerName, customerPhone: f.customerPhone, customerIdCard: f.customerIdCard, salesOrderNo: f.salesOrderNo,
                certificateStatus: f.certificateStatus, insuranceStatus: f.insuranceStatus, warrantyExpiry: f.warrantyExpiry, vehicleItems: f.vehicleItems
            })
        }
        store.addLog({ type: 'purchase', typeName: '修改', operator: '张伟', target: f.vin, detail: `修改新车采购单 - ${f.modelName}` })
        ElMessage.success('采购单更新成功！')
    } else {
        // 新增模式
        const newVehicles = []
        for (let i = 0; i < f.quantity; i++) {
            const vin = f.quantity > 1 ? f.vin + String(i).padStart(2, '0') : f.vin
            const vehicle = {
                vin, plateNumber: f.plateNumber, modelId: f.modelId, modelName: f.modelName,
                seriesName: f.seriesName, color: f.color, interiorColor: f.interiorColor,
                year: 2025, config: f.config, source: 'new', mileage: 0, condition: '',
                purchasePrice: f.purchasePrice, currentPrice: f.actualPrice || f.guidePrice,
                guidePrice: f.guidePrice, supplier: f.supplier, status: 'in_stock',
                purchaseDate: f.purchaseDate, location: f.location, remark: f.remark,
                modelYear: f.modelYear, bodyType: f.bodyType, seatCount: f.seatCount, doorCount: f.doorCount,
                emissionStandard: f.emissionStandard, fuelType: f.fuelType, transmission: f.transmission, driveMode: f.driveMode,
                carOptions: f.carOptions, certificateNo: f.certificateNo, originPlace: f.originPlace,
                importLicenseNo: f.importLicenseNo, customsNo: f.customsNo, keyCount: f.keyCount,
                tireBrand: f.tireBrand, batteryModel: f.batteryModel, warrantyMileage: f.warrantyMileage,
                engineNumber: f.engineNumber, chassisLast6: f.chassisLast6, productionDate: f.productionDate, vehicleBatch: f.vehicleBatch,
                paymentMethod: f.paymentMethod, paymentDeadline: f.paymentDeadline, contractNo: f.contractNo,
                supplierContact: f.supplierContact, purchaseType: f.purchaseType, contractSignDate: f.contractSignDate,
                contractAmount: f.contractAmount, marketDiscount: f.marketDiscount, actualPrice: f.actualPrice,
                depositAmount: f.depositAmount, depositDate: f.depositDate, profit: f.profit,
                salesConsultant: f.salesConsultant, commissionRate: f.commissionRate,
                nakedPrice: f.nakedPrice, accessoriesFee: f.accessoriesFee, purchaseTax: f.purchaseTax,
                insuranceFee: f.insuranceFee, registrationFee: f.registrationFee, otherFees: f.otherFees, totalCost: f.totalCost,
                hasLoan: f.hasLoan, loanDownPayment: f.loanDownPayment, loanRatio: f.loanRatio,
                loanTerm: f.loanTerm, monthlyPayment: f.monthlyPayment, loanBank: f.loanBank,
                invoiceType: f.invoiceType, invoiceNo: f.invoiceNo, invoiceTitle: f.invoiceTitle,
                taxNo: f.taxNo, paymentAccount: f.paymentAccount, receiveAccount: f.receiveAccount,
                transportMethod: f.transportMethod, logisticsCompany: f.logisticsCompany, trackingNo: f.trackingNo,
                shipDate: f.shipDate, deliveryAddress: f.deliveryAddress, receiverName: f.receiverName, receiverPhone: f.receiverPhone,
                warehouseArea: f.warehouseArea, warehouseKeeper: f.warehouseKeeper, inspector: f.inspector,
                inspectDate: f.inspectDate, inspectResult: f.inspectResult, pdiStatus: f.pdiStatus,
                cleanStatus: f.cleanStatus, prepStatus: f.prepStatus, prepFinishDate: f.prepFinishDate, gpsNo: f.gpsNo,
                customerName: f.customerName, customerPhone: f.customerPhone, customerIdCard: f.customerIdCard, salesOrderNo: f.salesOrderNo,
                certificateStatus: f.certificateStatus, insuranceStatus: f.insuranceStatus, warrantyExpiry: f.warrantyExpiry, vehicleItems: f.vehicleItems
            }
            const vehicleId = store.addVehicle(vehicle)
            newVehicles.push({ ...vehicle, id: vehicleId })
        }
        const purchaseRecord = {
            type: 'new', seriesName: f.seriesName, modelName: f.modelName, vin: f.vin,
            supplier: f.supplier, purchasePrice: f.purchasePrice, quantity: f.quantity,
            totalPrice: f.purchasePrice * f.quantity, purchaseDate: f.purchaseDate,
            status: 'completed', operator: '张伟'
        }
        store.addPurchaseRecord(purchaseRecord)
        store.addLog({ type: 'purchase', typeName: '入库', operator: '张伟', target: f.vin, detail: `新车采购入库 - ${f.modelName}，采购价${f.purchasePrice}元` })

        // 自动创建合格证记录
        newVehicles.forEach(vehicle => {
            documentStore.createCertificateFromPurchase(purchaseRecord, vehicle)
        })

        ElMessage.success('采购单提交成功！')
    }
    goBack()
}

// ===== 页面导航 =====
function goBack() {
    store.clearNewPurchaseDraft()
    router.push({ name: 'Purchase' })
}

// ===== 初始化 =====
onMounted(() => {
    const draft = store.newPurchaseDraft
    if (!draft) {
        router.replace({ name: 'Purchase' })
        return
    }
    if (draft.mode === 'edit') {
        editingNewId.value = draft.editId
        newForm.value = draft.formData
        newStep.value = 1
    } else {
        newForm.value = initNewForm()
        newStep.value = 0
    }
})
</script>

<style scoped>
.form-section {
    padding: 0 4px;
}
.section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #0066B1;
    padding-bottom: 8px;
    border-bottom: 2px solid #0066B1;
}
.page-form {
    max-width: 1200px;
}
.money {
    font-family: 'DIN Alternate', 'Helvetica Neue', monospace;
}
</style>
