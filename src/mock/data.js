// ==================== 车系数据 ====================
export const carSeries = [
  { id: 1, name: '3系', inStock: 8, inTransit: 3 },
  { id: 2, name: '5系', inStock: 5, inTransit: 2 },
  { id: 3, name: 'X3', inStock: 6, inTransit: 4 },
  { id: 4, name: 'X5', inStock: 3, inTransit: 1 },
  { id: 5, name: '7系', inStock: 2, inTransit: 0 },
  { id: 6, name: 'X1', inStock: 10, inTransit: 2 },
  { id: 7, name: 'i3', inStock: 4, inTransit: 1 },
  { id: 8, name: 'iX3', inStock: 3, inTransit: 0 },
]

// ==================== 车型数据 ====================
export const carModels = [
  { id: 1, brand: 'BMW', seriesId: 1, seriesName: '3系', name: '325Li 运动套装', year: 2025, bodyType: '轿车', guidePrice: 299900, level: '中型', engine: '2.0T 低功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '蓝色', '灰色'], config: '全景天窗、真皮座椅、12.3寸仪表盘、iDrive 8.0系统、自动空调' },
  { id: 2, brand: 'BMW', seriesId: 1, seriesName: '3系', name: '325Li M运动套装', year: 2025, bodyType: '轿车', guidePrice: 313900, level: '中型', engine: '2.0T 低功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '蓝色', '红色'], config: 'M运动套件、全景天窗、真皮座椅、12.3寸仪表盘、iDrive 8.0、哈曼卡顿音响' },
  { id: 3, brand: 'BMW', seriesId: 1, seriesName: '3系', name: '330Li M运动曜夜套装', year: 2025, bodyType: '轿车', guidePrice: 359900, level: '中型', engine: '2.0T 高功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '蓝色', '灰色', '绿色'], config: 'M运动曜夜套件、全景天窗、Merino真皮、HUD、哈曼卡顿、激光大灯' },
  { id: 4, brand: 'BMW', seriesId: 2, seriesName: '5系', name: '525Li 豪华套装', year: 2025, bodyType: '轿车', guidePrice: 438900, level: '中大型', engine: '2.0T 低功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '银色', '灰色'], config: '全景天窗、真皮座椅、12.3寸双联屏、iDrive 8.5、自动空调、后排娱乐' },
  { id: 5, brand: 'BMW', seriesId: 2, seriesName: '5系', name: '530Li 领先型 M运动套装', year: 2025, bodyType: '轿车', guidePrice: 485900, level: '中大型', engine: '2.0T 高功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '蓝色', '绿色'], config: 'M运动套件、全景天窗、Merino真皮、HUD、哈曼卡顿、B&W音响、后排舒适座椅' },
  { id: 6, brand: 'BMW', seriesId: 3, seriesName: 'X3', name: 'X3 25Li', year: 2025, bodyType: 'SUV', guidePrice: 399900, level: '中型', engine: '2.0T 低功率', gearbox: '8AT', driveMode: '四驱', seats: 5, colors: ['白色', '黑色', '灰色', '蓝色'], config: '全景天窗、真皮座椅、12.3寸仪表盘、iDrive 8.0、自动空调、电动尾门' },
  { id: 7, brand: 'BMW', seriesId: 3, seriesName: 'X3', name: 'X3 30Li 领先型 M运动套装', year: 2025, bodyType: 'SUV', guidePrice: 449900, level: '中型', engine: '2.0T 高功率', gearbox: '8AT', driveMode: '四驱', seats: 5, colors: ['白色', '黑色', '蓝色', '绿色'], config: 'M运动套件、全景天窗、Merino真皮、HUD、哈曼卡顿、自适应悬架' },
  { id: 8, brand: 'BMW', seriesId: 4, seriesName: 'X5', name: 'X5 30Li', year: 2025, bodyType: 'SUV', guidePrice: 605000, level: '中大型', engine: '2.0T 高功率', gearbox: '8AT', driveMode: '四驱', seats: 5, colors: ['白色', '黑色', '灰色', '蓝色', '绿色'], config: '全景天窗、真皮座椅、12.3寸双联屏、iDrive 8.5、四区空调、空气悬架、激光大灯' },
  { id: 9, brand: 'BMW', seriesId: 4, seriesName: 'X5', name: 'X5 40Li M运动套装', year: 2025, bodyType: 'SUV', guidePrice: 705000, level: '中大型', engine: '3.0T', gearbox: '8AT', driveMode: '四驱', seats: 5, colors: ['白色', '黑色', '蓝色', '绿色'], config: 'M运动套件、全景天窗、Merino真皮、HUD、B&W音响、空气悬架、激光大灯、自适应巡航' },
  { id: 10, brand: 'BMW', seriesId: 5, seriesName: '7系', name: '735Li 豪华套装', year: 2025, bodyType: '轿车', guidePrice: 829900, level: '豪华型', engine: '2.0T 高功率', gearbox: '8AT', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '银色', '灰色'], config: '全景天窗、Merino真皮、12.3+14.9寸双联屏、iDrive 8.5、四区空调、后排31寸巨幕、B&W音响' },
  { id: 11, brand: 'BMW', seriesId: 6, seriesName: 'X1', name: 'X1 sDrive25Li', year: 2025, bodyType: 'SUV', guidePrice: 279900, level: '紧凑型', engine: '2.0T 低功率', gearbox: '7DCT', driveMode: '前驱', seats: 5, colors: ['白色', '黑色', '灰色', '蓝色'], config: '全景天窗、仿皮座椅、10.7寸中控屏、iDrive 8.0、自动空调、电动尾门' },
  { id: 12, brand: 'BMW', seriesId: 7, seriesName: 'i3', name: 'i3 eDrive35 L', year: 2025, bodyType: '轿车', guidePrice: 353900, level: '中型', engine: '纯电 后驱', gearbox: '单速', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '蓝色', '绿色'], config: '全景天窗、真皮座椅、12.3寸双联屏、iDrive 8.0、自动空调、536km续航' },
  { id: 13, brand: 'BMW', seriesId: 8, seriesName: 'iX3', name: 'iX3 领先型', year: 2025, bodyType: 'SUV', guidePrice: 399900, level: '中型', engine: '纯电 后驱', gearbox: '单速', driveMode: '后驱', seats: 5, colors: ['白色', '黑色', '灰色', '蓝色'], config: '全景天窗、真皮座椅、12.3寸双联屏、iDrive 8.0、自动空调、535km续航、电动尾门' },
]

// ==================== 供应商数据 ====================
export const suppliers = [
  { id: 1, name: '华晨宝马汽车有限公司', contact: '李明', phone: '024-88661234', count: 156, address: '辽宁省沈阳市大东区', type: '汽车厂商' },
  { id: 2, name: '宝马（中国）汽车贸易有限公司', contact: '王芳', phone: '010-84568900', count: 89, address: '北京市朝阳区望京街道', type: '汽车厂商' },
  { id: 3, name: '沈阳大东区配送中心', contact: '张刚', phone: '024-88335678', count: 45, address: '辽宁省沈阳市大东区', type: '配送中心' },
  { id: 4, name: '北京波士通达汽车销售有限公司', contact: '赵伟', phone: '010-67781234', count: 67, address: '北京市朝阳区', type: '汽车经销商' },
  { id: 5, name: '上海永达汽车销售服务有限公司', contact: '刘洋', phone: '021-68881234', count: 92, address: '上海市浦东新区', type: '汽车经销商' },
  { id: 6, name: '广东合力汽车贸易有限公司', contact: '陈强', phone: '020-86661234', count: 54, address: '广东省广州市天河区', type: '汽车经销商' },
  { id: 7, name: '深圳佳鸿汽车贸易有限公司', contact: '周敏', phone: '0755-82223456', count: 38, address: '广东省深圳市南山区', type: '汽车经销商' },
  { id: 8, name: '成都通安汽车销售服务有限公司', contact: '吴杰', phone: '028-85556789', count: 71, address: '四川省成都市高新区', type: '汽车经销商' },
  { id: 9, name: '武汉康顺汽车贸易有限公司', contact: '郑丽', phone: '027-84445678', count: 63, address: '湖北省武汉市江汉区', type: '汽车经销商' },
  { id: 10, name: '杭州宝荣汽车销售服务有限公司', contact: '黄涛', phone: '0571-86677890', count: 45, address: '浙江省杭州市西湖区', type: '汽车经销商' },
  { id: 11, name: '南京协众汽车贸易有限公司', contact: '林峰', phone: '025-87789012', count: 57, address: '江苏省南京市鼓楼区', type: '汽车经销商' },
  { id: 12, name: '宝马金融有限公司', contact: '孙强', phone: '400-888-8888', count: 120, address: '北京市朝阳区', type: '金融服务' },
  { id: 13, name: '中国银行汽车金融中心', contact: '杨萍', phone: '400-819-5577', count: 89, address: '北京市东城区', type: '金融服务' },
  { id: 14, name: '工商银行汽车分期中心', contact: '赵敏', phone: '400-820-5566', count: 76, address: '北京市西城区', type: '金融服务' },
  { id: 15, name: '招商银行信用卡中心', contact: '钱峰', phone: '400-820-5555', count: 64, address: '深圳市福田区', type: '金融服务' },
  { id: 16, name: '华晨宝马汽车有限公司上海分公司', contact: '王刚', phone: '021-677856789', count: 42, address: '上海市嘉定区', type: '汽车厂商' },
  { id: 17, name: '华晨宝马汽车有限公司广东分公司', contact: '李强', phone: '020-87789012', count: 38, address: '广东省广州市番禺区', type: '汽车厂商' },
  { id: 18, name: '华晨宝马汽车有限公司四川分公司', contact: '周杰', phone: '028-86678901', count: 51, address: '四川省成都市龙泉驿区', type: '汽车厂商' },
  { id: 19, name: 'AC Schnitzer中国总代理', contact: '张伟', phone: '021-688890123', count: 12, address: '上海市浦东新区', type: '改装品牌' },
  { id: 20, name: '哈曼卡顿中国总部', contact: '刘洋', phone: '400-819-5577', count: 23, address: '上海市浦东新区', type: '音响品牌' },
  { id: 21, name: 'Bowers & Wilkins中国', contact: '陈强', phone: '400-820-5555', count: 18, address: '北京市朝阳区', type: '音响品牌' },
  { id: 22, name: 'BRABUS中国旗舰店', contact: '王芳', phone: '021-677856788', count: 9, address: '上海市浦东新区', type: '改装品牌' },
  { id: 23, name: '米其林轮胎授权经销商', contact: '赵敏', phone: '400-111-1111', count: 156, address: '北京市朝阳区', type: '轮胎品牌' },
  { id: 24, name: '马牌轮胎中国总部', contact: '孙强', phone: '400-810-1010', count: 142, address: '上海市浦东新区', type: '轮胎品牌' },
  { id: 25, name: '壳牌润滑油中国有限公司', contact: '李伟', phone: '400-888-8888', count: 89, address: '北京市朝阳区', type: '油品品牌' },
  { id: 26, name: '嘉实多润滑油有限公司', contact: '周杰', phone: '400-819-5577', count: 67, address: '广东省广州市', type: '油品品牌' },
  { id: 27, name: '3M中国汽车用品有限公司', contact: '吴峰', phone: '400-820-5555', count: 134, address: '上海市闵行区', type: '用品品牌' },
  { id: 28, name: '强强钣喷连锁机构', contact: '郑丽', phone: '400-888-9999', count: 78, address: '广东省广州市', type: '维修服务' },
  { id: 29, name: '途虎养车网线下服务中心', contact: '钱峰', phone: '400-111-3333', count: 92, address: '上海市浦东新区', type: '维修服务' },
  { id: 30, name: '中升奔驰汽车销售服务有限公司', contact: '杨萍', phone: '010-87789012', count: 67, address: '北京市朝阳区', type: '汽车经销商' },
]

// ==================== 车辆数据 ====================
export const vehicles = [
  { id: 1, vin: 'WBAJB0C05LBW12345', plateNumber: '', modelId: 3, modelName: '330Li M运动曜夜套装', seriesName: '3系', color: '矿石白', interiorColor: '黑色', year: 2025, config: 'M运动曜夜套件、全景天窗、Merino真皮、HUD、哈曼卡顿、激光大灯', source: 'new', mileage: 0, condition: '', purchasePrice: 315000, currentPrice: 352000, guidePrice: 359900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-03-15', location: 'A区', remark: '' },
  { id: 2, vin: 'WBAJB0C05LBW23456', plateNumber: '', modelId: 5, modelName: '530Li 领先型 M运动套装', seriesName: '5系', color: '碳黑', interiorColor: '棕色', year: 2025, config: 'M运动套件、全景天窗、Merino真皮、HUD、哈曼卡顿、B&W音响', source: 'new', mileage: 0, condition: '', purchasePrice: 425000, currentPrice: 478000, guidePrice: 485900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-03-10', location: 'A区', remark: '' },
  { id: 3, vin: 'WBAJB0C05LBW34567', plateNumber: '', modelId: 7, modelName: 'X3 30Li 领先型 M运动套装', seriesName: 'X3', color: '量子蓝', interiorColor: '黑色', year: 2025, config: 'M运动套件、全景天窗、Merino真皮、HUD、哈曼卡顿', source: 'new', mileage: 0, condition: '', purchasePrice: 392000, currentPrice: 440000, guidePrice: 449900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-03-08', location: 'B区', remark: '' },
  { id: 4, vin: 'WBAJB0C05LBW45678', plateNumber: '京A·88888', modelId: 9, modelName: 'X5 40Li M运动套装', seriesName: 'X5', color: '宝石青', interiorColor: '棕色', year: 2024, config: 'M运动套件、全景天窗、Merino真皮、HUD、B&W音响、空气悬架', source: 'used', mileage: 1.2, condition: '车况优秀，无事故无泡水', purchasePrice: 520000, currentPrice: 598000, guidePrice: 705000, supplier: '个人-刘先生', status: 'in_stock', purchaseDate: '2025-03-01', location: 'A区', remark: '原车主升级7系' },
  { id: 5, vin: 'WBAJB0C05LBW56789', plateNumber: '', modelId: 1, modelName: '325Li 运动套装', seriesName: '3系', color: '圣雷莫绿', interiorColor: '黑色', year: 2025, config: '全景天窗、真皮座椅、12.3寸仪表盘、iDrive 8.0', source: 'new', mileage: 0, condition: '', purchasePrice: 258000, currentPrice: 288000, guidePrice: 299900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-02-28', location: 'C区', remark: '' },
  { id: 6, vin: 'WBAJB0C05LBW67890', plateNumber: '', modelId: 2, modelName: '325Li M运动套装', seriesName: '3系', color: '波尔蒂芒蓝', interiorColor: '黑色', year: 2025, config: 'M运动套件、全景天窗、真皮座椅、哈曼卡顿', source: 'new', mileage: 0, condition: '', purchasePrice: 270000, currentPrice: 303000, guidePrice: 313900, supplier: '华晨宝马汽车有限公司', status: 'sold', purchaseDate: '2025-02-20', location: '', remark: '已售出' },
  { id: 7, vin: 'WBAJB0C05LBW78901', plateNumber: '', modelId: 8, modelName: 'X5 30Li', seriesName: 'X5', color: '矿石白', interiorColor: '黑色', year: 2025, config: '全景天窗、真皮座椅、12.3寸双联屏、空气悬架', source: 'new', mileage: 0, condition: '', purchasePrice: 528000, currentPrice: 585000, guidePrice: 605000, supplier: '宝马（中国）汽车贸易有限公司', status: 'in_stock', purchaseDate: '2025-02-15', location: 'A区', remark: '' },
  { id: 8, vin: 'WBAJB0C05LBW89012', plateNumber: '京B·66666', modelId: 6, modelName: 'X3 25Li', seriesName: 'X3', color: '雪松灰', interiorColor: '棕色', year: 2024, config: '全景天窗、真皮座椅、电动尾门', source: 'used', mileage: 2.5, condition: '车况良好，前保险杠补漆', purchasePrice: 310000, currentPrice: 368000, guidePrice: 399900, supplier: '个人-陈女士', status: 'in_stock', purchaseDate: '2025-02-10', location: 'B区', remark: '女士一手车' },
  { id: 9, vin: 'WBAJB0C05LBW90123', plateNumber: '', modelId: 10, modelName: '735Li 豪华套装', seriesName: '7系', color: '岩石白', interiorColor: '棕色', year: 2025, config: '全景天窗、Merino真皮、后排31寸巨幕、B&W音响', source: 'new', mileage: 0, condition: '', purchasePrice: 720000, currentPrice: 810000, guidePrice: 829900, supplier: '宝马（中国）汽车贸易有限公司', status: 'in_stock', purchaseDate: '2025-01-28', location: 'A区', remark: '展厅车' },
  { id: 10, vin: 'WBAJB0C05LBW01234', plateNumber: '', modelId: 11, modelName: 'X1 sDrive25Li', seriesName: 'X1', color: '闪耀铜', interiorColor: '黑色', year: 2025, config: '全景天窗、仿皮座椅、电动尾门', source: 'new', mileage: 0, condition: '', purchasePrice: 235000, currentPrice: 262000, guidePrice: 279900, supplier: '华晨宝马汽车有限公司', status: 'reserved', purchaseDate: '2025-01-20', location: 'C区', remark: '客户已预定' },
  { id: 11, vin: 'WBAJB0C05LBW11111', plateNumber: '', modelId: 12, modelName: 'i3 eDrive35 L', seriesName: 'i3', color: '太空银', interiorColor: '黑色', year: 2025, config: '全景天窗、真皮座椅、12.3寸双联屏、536km续航', source: 'new', mileage: 0, condition: '', purchasePrice: 305000, currentPrice: 338000, guidePrice: 353900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-03-12', location: 'B区', remark: '' },
  { id: 12, vin: 'WBAJB0C05LBW22222', plateNumber: '京C·12345', modelId: 3, modelName: '330Li M运动曜夜套装', seriesName: '3系', color: '碧玺灰', interiorColor: '红色', year: 2024, config: 'M运动曜夜套件、全景天窗、Merino真皮、HUD', source: 'used', mileage: 0.8, condition: '准新车，车况完美', purchasePrice: 290000, currentPrice: 332000, guidePrice: 359900, supplier: '个人-赵先生', status: 'in_stock', purchaseDate: '2025-03-05', location: 'A区', remark: '准新车' },
  { id: 13, vin: 'WBAJB0C05LBW33333', plateNumber: '', modelId: 4, modelName: '525Li 豪华套装', seriesName: '5系', color: '矿石白', interiorColor: '黑色', year: 2025, config: '全景天窗、真皮座椅、12.3寸双联屏、后排娱乐', source: 'new', mileage: 0, condition: '', purchasePrice: 378000, currentPrice: 425000, guidePrice: 438900, supplier: '华晨宝马汽车有限公司', status: 'sold', purchaseDate: '2025-01-15', location: '', remark: '已售出' },
  { id: 14, vin: 'WBAJB0C05LBW44444', plateNumber: '', modelId: 13, modelName: 'iX3 领先型', seriesName: 'iX3', color: '量子蓝', interiorColor: '黑色', year: 2025, config: '全景天窗、真皮座椅、12.3寸双联屏、535km续航', source: 'new', mileage: 0, condition: '', purchasePrice: 348000, currentPrice: 385000, guidePrice: 399900, supplier: '华晨宝马汽车有限公司', status: 'in_stock', purchaseDate: '2025-03-18', location: 'B区', remark: '' },
  { id: 15, vin: 'WBAJB0C05LBW55555', plateNumber: '京D·77777', modelId: 9, modelName: 'X5 40Li M运动套装', seriesName: 'X5', color: '神秘灰', interiorColor: '棕色', year: 2024, config: 'M运动套件、全景天窗、Merino真皮、B&W音响', source: 'used', mileage: 1.8, condition: '车况优秀，全车原漆', purchasePrice: 560000, currentPrice: 628000, guidePrice: 705000, supplier: '个人-孙先生', status: 'in_stock', purchaseDate: '2025-02-22', location: 'A区', remark: '全车原漆' },
]

// ==================== 调价记录 ====================
export const priceHistory = [
  { id: 1, vehicleId: 1, vin: 'WBAJB0C05LBW12345', modelName: '330Li M运动曜夜套装', oldPrice: 358000, newPrice: 352000, reason: '市场竞争', reasonDetail: '同区域竞品降价促销', operator: '张伟', approver: '李经理', status: 'approved', operateTime: '2025-03-20 14:30:00' },
  { id: 2, vehicleId: 5, vin: 'WBAJB0C05LBW56789', modelName: '325Li 运动套装', oldPrice: 295000, newPrice: 288000, reason: '库存压力', reasonDetail: '3系库存超过30天', operator: '张伟', approver: '李经理', status: 'approved', operateTime: '2025-03-18 10:00:00' },
  { id: 3, vehicleId: 8, vin: 'WBAJB0C05LBW89012', modelName: 'X3 25Li', oldPrice: 375000, newPrice: 368000, reason: '车况调整', reasonDetail: '前保险杠补漆，适当降价', operator: '王强', approver: '李经理', status: 'approved', operateTime: '2025-03-15 16:20:00' },
  { id: 4, vehicleId: 4, vin: 'WBAJB0C05LBW45678', modelName: 'X5 40Li M运动套装', oldPrice: 605000, newPrice: 598000, reason: '促销活动', reasonDetail: '春季购车节活动', operator: '张伟', approver: '王总', status: 'pending', operateTime: '2025-03-22 09:15:00' },
]

// ==================== 销售记录 ====================
export const saleRecords = [
  { id: 1, vehicleId: 6, vin: 'WBAJB0C05LBW67890', modelName: '325Li M运动套装', color: '波尔蒂芒蓝', source: 'new', purchasePrice: 270000, salePrice: 305000, paymentMethod: 'loan', downPayment: 91500, loanAmount: 213500, loanTerm: 36, monthlyPayment: 6480, financeCompany: 'BMW金融', buyerName: '周杰', buyerPhone: '138****1234', buyerIdCard: '110***********1234', deliveryDate: '2026-04-05', tax: 27000, insurance: 12000, licenseFee: 1000, decoration: 5000, otherFee: 0, salesPerson: '张伟', remark: '' },
  { id: 2, vehicleId: 13, vin: 'WBAJB0C05LBW33333', modelName: '525Li 豪华套装', color: '矿石白', source: 'new', purchasePrice: 378000, salePrice: 432000, paymentMethod: 'full', downPayment: 0, loanAmount: 0, loanTerm: 0, monthlyPayment: 0, financeCompany: '', buyerName: '林涛', buyerPhone: '139****5678', buyerIdCard: '310***********5678', deliveryDate: '2026-04-01', tax: 38200, insurance: 15000, licenseFee: 1000, decoration: 8000, otherFee: 0, salesPerson: '王强', remark: '全款购车' },
  { id: 3, vehicleId: 101, vin: 'WBAJB0C05LXX00001', modelName: '325Li 运动套装', color: '矿石白', source: 'new', purchasePrice: 258000, salePrice: 286000, paymentMethod: 'loan', downPayment: 85800, loanAmount: 200200, loanTerm: 36, monthlyPayment: 6080, financeCompany: 'BMW金融', buyerName: '赵敏', buyerPhone: '136****2345', buyerIdCard: '110***********2345', deliveryDate: '2026-04-08', tax: 25300, insurance: 11000, licenseFee: 1000, decoration: 3000, otherFee: 0, salesPerson: '张伟', remark: '' },
  { id: 4, vehicleId: 102, vin: 'WBAJB0C05LXX00002', modelName: 'X3 30Li 领先型 M运动套装', color: '量子蓝', source: 'new', purchasePrice: 392000, salePrice: 435000, paymentMethod: 'full', downPayment: 0, loanAmount: 0, loanTerm: 0, monthlyPayment: 0, financeCompany: '', buyerName: '陈明远', buyerPhone: '135****6789', buyerIdCard: '320***********6789', deliveryDate: '2026-03-28', tax: 38500, insurance: 14000, licenseFee: 1000, decoration: 6000, otherFee: 500, salesPerson: '刘洋', remark: '' },
  { id: 5, vehicleId: 103, vin: 'WBAJB0C05LXX00003', modelName: 'X1 sDrive25Li', color: '闪耀铜', source: 'new', purchasePrice: 235000, salePrice: 265000, paymentMethod: 'loan', downPayment: 79500, loanAmount: 185500, loanTerm: 24, monthlyPayment: 8100, financeCompany: '招商银行', buyerName: '王丽华', buyerPhone: '137****3456', buyerIdCard: '440***********3456', deliveryDate: '2026-03-20', tax: 23400, insurance: 9500, licenseFee: 1000, decoration: 2000, otherFee: 0, salesPerson: '陈静', remark: '' },
  { id: 6, vehicleId: 104, vin: 'WBAJB0C05LXX00004', modelName: 'i3 eDrive35 L', color: '太空银', source: 'new', purchasePrice: 305000, salePrice: 338000, paymentMethod: 'full', downPayment: 0, loanAmount: 0, loanTerm: 0, monthlyPayment: 0, financeCompany: '', buyerName: '张鹏飞', buyerPhone: '138****7890', buyerIdCard: '510***********7890', deliveryDate: '2026-03-15', tax: 29900, insurance: 10000, licenseFee: 1000, decoration: 4000, otherFee: 0, salesPerson: '张伟', remark: '新能源车' },
  { id: 7, vehicleId: 105, vin: 'WBAJB0C05LXX00005', modelName: '530Li 领先型 M运动套装', color: '碳黑', source: 'new', purchasePrice: 425000, salePrice: 478000, paymentMethod: 'loan', downPayment: 143400, loanAmount: 334600, loanTerm: 48, monthlyPayment: 8020, financeCompany: 'BMW金融', buyerName: '刘思琪', buyerPhone: '139****0123', buyerIdCard: '330***********0123', deliveryDate: '2026-04-10', tax: 42300, insurance: 16000, licenseFee: 1000, decoration: 10000, otherFee: 0, salesPerson: '王强', remark: '' },
  { id: 8, vehicleId: 106, vin: 'WBAJB0C05LXX00006', modelName: 'X5 30Li', color: '矿石白', source: 'new', purchasePrice: 528000, salePrice: 580000, paymentMethod: 'full', downPayment: 0, loanAmount: 0, loanTerm: 0, monthlyPayment: 0, financeCompany: '', buyerName: '孙伟东', buyerPhone: '186****4567', buyerIdCard: '110***********4567', deliveryDate: '2026-03-10', tax: 51300, insurance: 18000, licenseFee: 1000, decoration: 12000, otherFee: 800, salesPerson: '刘洋', remark: '' },
]

// ==================== 采购单记录 ====================
export const purchaseRecords = [
  { id: 1, type: 'new', seriesName: '3系', modelName: '330Li M运动曜夜套装', vin: 'WBAJB0C05LBW12345', supplier: '华晨宝马汽车有限公司', purchasePrice: 315000, quantity: 1, totalPrice: 315000, purchaseDate: '2025-03-15', status: 'completed', operator: '张伟' },
  { id: 2, type: 'new', seriesName: '5系', modelName: '530Li 领先型 M运动套装', vin: 'WBAJB0C05LBW23456', supplier: '华晨宝马汽车有限公司', purchasePrice: 425000, quantity: 1, totalPrice: 425000, purchaseDate: '2025-03-10', status: 'completed', operator: '张伟' },
  { id: 3, type: 'used', seriesName: 'X5', modelName: 'X5 40Li M运动套装', vin: 'WBAJB0C05LBW45678', supplier: '个人-刘先生', purchasePrice: 520000, quantity: 1, totalPrice: 520000, purchaseDate: '2025-03-01', status: 'completed', operator: '王强' },
  { id: 4, type: 'new', seriesName: 'i3', modelName: 'i3 eDrive35 L', vin: 'WBAJB0C05LBW11111', supplier: '华晨宝马汽车有限公司', purchasePrice: 305000, quantity: 1, totalPrice: 305000, purchaseDate: '2025-03-12', status: 'completed', operator: '张伟' },
  { id: 5, type: 'used', seriesName: '3系', modelName: '330Li M运动曜夜套装', vin: 'WBAJB0C05LBW22222', supplier: '个人-赵先生', purchasePrice: 290000, quantity: 1, totalPrice: 290000, purchaseDate: '2025-03-05', status: 'completed', operator: '张伟' },
]

// ==================== 操作日志 ====================
export const operationLogs = [
  { id: 1, type: 'purchase', typeName: '入库', operator: '张伟', target: 'WBAJB0C05LBW12345', detail: '新车采购入库 - 330Li M运动曜夜套装，采购价315000元', operateTime: '2025-03-15 09:30:00' },
  { id: 2, type: 'purchase', typeName: '入库', operator: '张伟', target: 'WBAJB0C05LBW23456', detail: '新车采购入库 - 530Li 领先型 M运动套装，采购价425000元', operateTime: '2025-03-10 14:20:00' },
  { id: 3, type: 'purchase', typeName: '入库', operator: '王强', target: 'WBAJB0C05LBW45678', detail: '二手车收购入库 - X5 40Li M运动套装，收购价520000元', operateTime: '2025-03-01 11:00:00' },
  { id: 4, type: 'sale', typeName: '出库', operator: '张伟', target: 'WBAJB0C05LBW67890', detail: '车辆售出 - 325Li M运动套装，成交价305000元，按揭36期', operateTime: '2025-03-05 16:45:00' },
  { id: 5, type: 'sale', typeName: '出库', operator: '王强', target: 'WBAJB0C05LBW33333', detail: '车辆售出 - 525Li 豪华套装，成交价432000元，全款', operateTime: '2025-02-01 10:30:00' },
  { id: 6, type: 'price_adjust', typeName: '调价', operator: '张伟', target: 'WBAJB0C05LBW12345', detail: '调价申请 - 330Li M运动曜夜套装，358000→352000元', operateTime: '2025-03-20 14:30:00' },
  { id: 7, type: 'price_adjust', typeName: '调价', operator: '张伟', target: 'WBAJB0C05LBW56789', detail: '调价申请 - 325Li 运动套装，295000→288000元', operateTime: '2025-03-18 10:00:00' },
  { id: 8, type: 'purchase', typeName: '入库', operator: '张伟', target: 'WBAJB0C05LBW11111', detail: '新车采购入库 - i3 eDrive35 L，采购价305000元', operateTime: '2025-03-12 15:10:00' },
  { id: 9, type: 'purchase', typeName: '入库', operator: '张伟', target: 'WBAJB0C05LBW22222', detail: '二手车收购入库 - 330Li M运动曜夜套装，收购价290000元', operateTime: '2025-03-05 09:50:00' },
  { id: 10, type: 'price_adjust', typeName: '调价', operator: '王强', target: 'WBAJB0C05LBW89012', detail: '调价申请 - X3 25Li，375000→368000元', operateTime: '2025-03-15 16:20:00' },
  { id: 11, type: 'price_adjust', typeName: '调价', operator: '张伟', target: 'WBAJB0C05LBW45678', detail: '调价申请（待审批）- X5 40Li M运动套装，605000→598000元', operateTime: '2025-03-22 09:15:00' },
  { id: 12, type: 'edit', typeName: '编辑', operator: '张伟', target: 'WBAJB0C05LBW01234', detail: '修改车辆状态为"预留"', operateTime: '2025-03-19 11:00:00' },
]

// ==================== 销售顾问列表 ====================
export const salesPersons = [
  { id: 1, name: '张伟' },
  { id: 2, name: '王强' },
  { id: 3, name: '刘洋' },
  { id: 4, name: '陈静' },
]

// ==================== 审批人列表 ====================
export const approvers = [
  { id: 1, name: '李经理', role: '销售经理' },
  { id: 2, name: '王总', role: '店总' },
]

// ==================== 选项常量 ====================
export const colorOptions = ['矿石白', '碳黑', '量子蓝', '碧玺灰', '圣雷莫绿', '宝石青', '岩石白', '波尔蒂芒蓝', '雪松灰', '闪耀铜', '太空银', '神秘灰']
export const interiorColorOptions = ['黑色', '棕色', '米色', '红色']
export const locationOptions = ['A区', 'B区', 'C区', '露天']
export const statusOptions = [
  { label: '在库', value: 'in_stock' },
  { label: '已售', value: 'sold' },
  { label: '预留', value: 'reserved' },
]
export const sourceOptions = [
  { label: '新车', value: 'new' },
  { label: '二手车', value: 'used' },
]
export const paymentOptions = [
  { label: '全款', value: 'full' },
  { label: '按揭', value: 'loan' },
]
export const priceReasonOptions = ['市场竞争', '库存压力', '车况调整', '促销活动', '月底冲量', '其他']
export const financeOptions = ['BMW金融', '招商银行', '工商银行', '建设银行', '其他']
export const deliveryOptions = ['到店自提', '送车上门']
export const bodyTypeOptions = ['轿车', 'SUV', '轿跑', 'MPV']
export const levelOptions = ['紧凑型', '中型', '中大型', '豪华型']
export const carModelColorOptions = ['白', '黑', '灰', '红', '蓝', '银', '绿']
export const gearboxOptions = ['8AT', '7DCT', '单速']
export const driveModeOptions = ['后驱', '四驱', '前驱']
export const seatOptions = ['4', '5', '7']
export const yearOptions = ['2024', '2025', '2026']

// ==================== 维修相关数据 ====================
export const repairTechnicians = [
  { id: 1, name: '赵大勇', level: '高级技师', specialty: '发动机', status: '在岗' },
  { id: 2, name: '孙立国', level: '高级技师', specialty: '变速箱', status: '在岗' },
  { id: 3, name: '周明华', level: '中级技师', specialty: '底盘', status: '在岗' },
  { id: 4, name: '吴志强', level: '中级技师', specialty: '电气', status: '在岗' },
  { id: 5, name: '郑伟民', level: '初级技师', specialty: '空调', status: '在岗' },
  { id: 6, name: '钱海涛', level: '中级技师', specialty: '钣金喷漆', status: '在岗' },
  { id: 7, name: '冯晓东', level: '高级技师', specialty: '发动机', status: '休假' },
  { id: 8, name: '陈建平', level: '初级技师', specialty: '内饰', status: '在岗' },
]

export const repairReceptionists = [
  { id: 1, name: '张伟' },
  { id: 2, name: '王强' },
  { id: 3, name: '刘洋' },
  { id: 4, name: '陈静' },
]

export const repairStations = [
  { id: 1, name: 'A01', type: '综合工位' },
  { id: 2, name: 'A02', type: '综合工位' },
  { id: 3, name: 'A03', type: '综合工位' },
  { id: 4, name: 'B01', type: '钣金工位' },
  { id: 5, name: 'B02', type: '喷漆工位' },
  { id: 6, name: 'C01', type: '电气工位' },
  { id: 7, name: 'C02', type: '诊断工位' },
  { id: 8, name: 'D01', type: '保养工位' },
]

export const repairInspectors = [
  { id: 1, name: '李国栋', level: '高级质检员' },
  { id: 2, name: '马建辉', level: '中级质检员' },
  { id: 3, name: '黄志明', level: '中级质检员' },
]

export const arrivalMethods = ['自驾送修', '拖车送修', '道路救援', '保险送修']

export const faultTypes = ['发动机', '变速箱', '底盘', '电气', '空调', '车身', '内饰', '制动', '转向', '其他']

export const repairTypes = ['保养', '小修', '中修', '大修', '事故修复', '钣金喷漆']

export const repairStatusOptions = [
  { label: '待接单', value: 'pending' },
  { label: '维修中', value: 'repairing' },
  { label: '待质检', value: 'wait_inspect' },
  { label: '质检中', value: 'inspecting' },
  { label: '质检通过', value: 'inspect_pass' },
  { label: '需返工', value: 'rework' },
  { label: '待结算', value: 'wait_settle' },
  { label: '已结算', value: 'settled' },
  { label: '已取车', value: 'completed' },
]

export const settlementMethods = ['现金', '刷卡', '微信支付', '支付宝', '挂账']

export const partUnitOptions = ['个', '只', '套', '根', '条', '块', '瓶', '升', '片', '米', '卷', '组']

export const partCategoryTree = [
  {
    value: 'engine',
    label: '发动机系统',
    children: [
      { value: 'engine_filter', label: '滤清器' },
      { value: 'engine_belt', label: '皮带' },
      { value: 'engine_seal', label: '密封件' },
      { value: 'engine_sensor', label: '传感器' },
      { value: 'engine_spark', label: '火花塞' },
      { value: 'engine_pump', label: '泵类' },
      { value: 'engine_other', label: '其他发动机件' },
    ],
  },
  {
    value: 'chassis',
    label: '底盘系统',
    children: [
      { value: 'chassis_brake', label: '制动部件' },
      { value: 'chassis_suspension', label: '悬挂部件' },
      { value: 'chassis_steering', label: '转向部件' },
      { value: 'chassis_bearing', label: '轴承' },
    ],
  },
  {
    value: 'electrical',
    label: '电气系统',
    children: [
      { value: 'elec_battery', label: '电池' },
      { value: 'elec_light', label: '灯具' },
      { value: 'elec_switch', label: '开关' },
      { value: 'elec_fuse', label: '保险丝/继电器' },
      { value: 'elec_wire', label: '线束' },
    ],
  },
  {
    value: 'body',
    label: '车身外观',
    children: [
      { value: 'body_bumper', label: '保险杠' },
      { value: 'body_panel', label: '钣金件' },
      { value: 'body_glass', label: '玻璃' },
      { value: 'body_mirror', label: '后视镜' },
      { value: 'body_trim', label: '装饰条' },
    ],
  },
  {
    value: 'interior',
    label: '内饰系统',
    children: [
      { value: 'int_seat', label: '座椅部件' },
      { value: 'int_dashboard', label: '仪表台部件' },
      { value: 'int_trim', label: '内饰板' },
    ],
  },
  {
    value: 'ac',
    label: '空调系统',
    children: [
      { value: 'ac_compressor', label: '压缩机' },
      { value: 'ac_condenser', label: '冷凝器' },
      { value: 'ac_evaporator', label: '蒸发器' },
      { value: 'ac_pipe', label: '管路' },
    ],
  },
  {
    value: 'fluid',
    label: '油液耗材',
    children: [
      { value: 'fluid_oil', label: '机油' },
      { value: 'fluid_coolant', label: '冷却液' },
      { value: 'fluid_brake', label: '制动液' },
      { value: 'fluid_atf', label: '变速箱油' },
      { value: 'fluid_freon', label: '冷媒' },
    ],
  },
]

export const partBrands = [
  'BMW原厂', '马勒(MAHLE)', '曼牌(MANN)', '博世(BOSCH)', '海拉(HELLA)',
  '采埃孚(ZF)', '舍弗勒(SCHAEFFLER)', 'NGK', '电装(DENSO)', '盖茨(GATES)',
  '3M', '其他品牌',
]

export const accompanyItems = ['钥匙', '行驶证', '保单', '工具包', '备胎', '三角牌', '灭火器', '其他']

export const testDriveResults = [
  { label: '通过', value: 'pass', type: 'success' },
  { label: '未通过', value: 'fail', type: 'danger' },
  { label: '需复检', value: 'recheck', type: 'warning' },
]

export const qualityResults = [
  { label: '合格', value: 'pass' },
  { label: '不合格', value: 'fail' },
  { label: '需返工', value: 'rework' },
]
