// 完整的国际化翻译文件
export const translations = {
  zh: {
    // 导航菜单
    nav: ["原料入库","辅料入库","成品入库","原料出库","成品出库","库存台账","品类数据参考","资产管理","财务管理","数据管理"],
    language: "语言",
    login: {
      title: "仓库管理系统",
      username: "用户名",
      password: "密码",
      submit: "登录",
      error: "用户名或密码错误"
    },
    
    // 通用
    common: {
      loading: "加载中...",
      submit: "提交",
      cancel: "取消",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      search: "搜索",
      filter: "筛选",
      export: "导出",
      import: "导入",
      confirm: "确认",
      back: "返回",
      close: "关闭",
      yes: "是",
      no: "否",
      success: "成功",
      error: "错误",
      warning: "警告",
      info: "信息",
      role: "角色",
      logout: "登出"
    },

    // 仪表盘
    dashboard: {
      title: "仓库管理系统仪表盘",
      subtitle: "实时监控库存状态和业务活动",
      overview: "概览",
      quickActions: "快速操作",
      recentActivity: "最近活动",
      statistics: "统计信息",
      // 统计卡片
      rawMaterialStock: "原料库存",
      auxiliaryMaterialStock: "辅料库存",
      finishedProductStock: "成品库存",
      lowStockWarning: "低库存预警",
      types: "种类型",
      products: "种产品",
      needReplenishment: "需要补货",
      // 最近记录
      recentInboundRecords: "最近入库记录",
      recentOutboundRecords: "最近出库记录",
      noInboundRecords: "暂无入库记录",
      noOutboundRecords: "暂无出库记录",
      // 快速操作
      quickOperations: "快速操作",
      rawMaterialInbound: "原料入库",
      auxiliaryMaterialInbound: "辅料入库",
      finishedProductInbound: "成品入库",
      rawMaterialOutbound: "原料出库",
      finishedProductOutbound: "成品出库",
      // 低库存预警
      lowStockAlerts: "低库存预警",
      noLowStockAlerts: "暂无低库存预警",
      remaining: "剩余",
      containerNumber: "柜号",
      quantity: "数量"
    },

    // 入库页面
    inbound: {
      title: "原料入库",
      auxTitle: "辅料入库",
      productTitle: "成品入库",
      // 页面标题和描述
      pageTitle: "原料入库管理",
      pageSubtitle: "管理原料入库记录，跟踪库存变动",
      // 操作按钮
      addInbound: "新增入库",
      newInbound: "新增入库",
      // 搜索
      searchPlaceholder: "搜索原料名称、柜号或申报单号...",
      // 表单字段
      importDate: "进口日期",
      materialName: "原料名称",
      declarationNo: "申报单号",
      containerNo: "入库柜号",
      quantity: "入库数量(kg)",
      qualityReport: "质检报告",
      // 表单标签
      importDateLabel: "进口日期 *",
      materialNameLabel: "原料名称 *",
      declarationNoLabel: "申报单号 *",
      containerNoLabel: "入库柜号 *",
      quantityLabel: "入库数量 (kg) *",
      qualityReportLabel: "质检报告 (PDF)",
      // 选择提示
      selectMaterial: "请选择原料",
      enterDeclarationNo: "请输入申报单号",
      enterContainerNo: "请输入入库柜号",
      enterQuantity: "请输入数量",
      // 文件上传
      uploadPDFFile: "点击上传PDF文件",
      clickToUploadPDF: "点击上传PDF文件",
      selectPDFFile: "请选择PDF文件",
      // 按钮
      cancel: "取消",
      saveInbound: "保存入库",
      saving: "保存中...",
      // 表格标题
      importDateHeader: "进口日期",
      materialNameHeader: "原料名称",
      declarationNoHeader: "申报单号",
      containerNoHeader: "入库柜号",
      quantityHeader: "入库数量(kg)",
      qualityReportHeader: "质检报告",
      // 状态消息
      loading: "加载中...",
      noRecords: "暂无入库记录",
      download: "下载",
      noFile: "无",
      // 原料选项
      almondKernel: "巴旦木仁原料 (LAHN2)",
      almond: "巴旦木原料 (LAHN1)",
      hazelnut: "榛子原料 (LAHP1)",
      macadamia: "夏威夷果原料 (LAMAC1)",
      chickpea: "鹰嘴豆原料 (LADG1)",
      // 其他
      date: "日期",
      productName: "产品名称",
      materialCode: "物料编码",
      containerNumber: "入库柜号",
      quantity: "入库数量",
      declarationNo: "申报单号",
      customsFee: "报关费($)",
      logisticsFee: "物流费($)",
      clearanceFee: "清关费($)",
      selectProduct: "选择产品",
      selectMaterialCode: "选择原料编码",
      selectAuxCode: "选择辅料编码",
      selectProductCode: "选择产品编码",
      productionBatch: "生产批次",
      qualityCheck: "质检状态",
      inspector: "质检员",
      uploadQualityReport: "上传质检表格",
      downloadQualityReport: "下载质检表格",
      deleteQualityReport: "删除质检表格",
      notes: "备注",
      grade: "分级",
      selectGrade: "选择分级",
      grade18_20: "18-20mm",
      grade16_18: "16-18mm", 
      grade14_16: "14-16mm",
      grade12_14: "12-14mm",
      grade9_17: "9-17mm(style)",
      grade8_14: "8-14mm(style)",
      latestRecords: "最新原料入库记录",
      latestAuxRecords: "最新辅料入库记录",
      latestProductRecords: "最新成品入库记录",
      submitSuccess: "提交成功！",
      submitFailed: "提交失败",
      networkError: "网络错误"
    },

    // 辅料入库页面
    auxInbound: {
      // 页面标题和描述
      pageTitle: "辅料入库管理",
      pageSubtitle: "管理辅料入库记录，跟踪库存变动",
      // 操作按钮
      addInbound: "新增入库",
      newInbound: "新增辅料入库记录",
      // 搜索
      searchPlaceholder: "搜索辅料名称或编码...",
      // 表单字段
      date: "入库日期",
      auxCode: "辅料编码",
      auxName: "辅料名称",
      quantity: "入库数量",
      unit: "单位",
      qualityReport: "质检报告",
      // 表单标签
      dateLabel: "入库日期 *",
      auxCodeLabel: "辅料编码 *",
      auxNameLabel: "辅料名称 *",
      quantityLabel: "入库数量 *",
      unitLabel: "单位 *",
      qualityReportLabel: "质检报告 (PDF)",
      // 选择提示
      selectAux: "请选择辅料",
      enterAuxCode: "请输入辅料编码",
      enterQuantity: "请输入数量",
      selectUnit: "请选择单位",
      // 文件上传
      clickToUploadPDF: "点击上传PDF文件",
      selectPDFFile: "请选择PDF文件",
      // 按钮
      cancel: "取消",
      saveInbound: "保存入库",
      // 状态消息
      submitFailed: "提交失败",
      networkError: "网络错误",
      // 表格标题
      dateHeader: "入库日期",
      auxCodeHeader: "辅料编码",
      auxNameHeader: "辅料名称",
      quantityHeader: "入库数量",
      unitHeader: "单位",
      qualityReportHeader: "质检报告",
      // 状态消息
      loading: "加载中...",
      noRecords: "暂无入库记录",
      download: "下载",
      noFile: "无",
      // 辅料选项
      aluminumFoilBag: "铝箔袋（真空包装袋） (TUINHOM)",
      cardboardBox: "纸箱 (THUNGGIAY)",
      salt: "盐 (MUOI)",
      jumboBag: "Jumbo 袋 (LABJB)",
      thousandJinBag: "千斤包 (LABJB)",
      saccharin: "甜蜜素 (LASDS)",
      sodiumSaccharin: "糖精钠 (LASDC)",
      acesulfame: "安赛蜜 (LACFK)",
      sucralose: "三氯蔗糖 (LASCL)",
      vanillin: "香兰素 (LAVNL)",
      sugar: "糖 (LADTL)",
      nutFlavor0612: "坚果香精 0612 (LARNC)",
      nutFlavor: "坚果香精 (LARNC)",
      nutFlavorPack: "坚果香料包 (LARNC)",
      dairyPowderFlavor444: "牧场鲜奶粉末香精 444-1 (LAPMF)",
      dairyPowderFlavor: "牧场鲜奶粉末香精 (LAPMF)",
      dairyFlavor0265: "奶味香精 0265 (LAMFV)",
      dairyFlavor: "奶味香精 (LAMFV)",
      antioxidant: "复合抗氧化剂 (LACAN)",
      papainPowder: "木瓜蛋白酶粉 0313 (LAPAP)",
      monosodiumGlutamate: "味精 (BOTNGOT)",
      hydrogenPeroxide: "双氧水 (H2O2)",
      pallet: "托板 (PALET)",
      // 单位选项
      kg: "千克 (kg)",
      g: "克 (g)",
      piece: "个",
      box: "箱",
      pack: "包",
      bag: "袋",
      bottle: "瓶",
      can: "罐"
    },

    // 成品入库页面
    productInbound: {
      // 页面标题和描述
      pageTitle: "成品入库管理",
      pageSubtitle: "管理成品入库记录，按批次号追踪库存",
      // 操作按钮
      addInbound: "新增入库",
      newInbound: "新增成品入库记录",
      // 搜索
      searchPlaceholder: "搜索产品名称或批次号...",
      // 表单字段
      productName: "产品名称",
      batchNumber: "批次号",
      quantity: "入库数量",
      inboundDate: "入库日期",
      productionDate: "生产日期",
      expiryDate: "保质期/有效期",
      operator: "操作人",
      notes: "备注",
      // 表单标签
      productNameLabel: "产品名称 *",
      batchNumberLabel: "批次号 *",
      quantityLabel: "入库数量 *",
      inboundDateLabel: "入库日期 *",
      productionDateLabel: "生产日期",
      expiryDateLabel: "保质期/有效期",
      operatorLabel: "操作人",
      notesLabel: "备注",
      // 选择提示
      selectProduct: "请选择产品",
      enterBatchNumber: "请输入批次号",
      enterQuantity: "请输入数量",
      enterOperator: "入库登记人员姓名或工号",
      enterNotes: "其他备注信息",
      // 按钮
      cancel: "取消",
      saveInbound: "保存入库",
      // 表格标题
      productNameHeader: "产品名称",
      batchNumberHeader: "批次号",
      quantityHeader: "入库数量",
      inboundDateHeader: "入库日期",
      productionDateHeader: "生产日期",
      expiryDateHeader: "保质期",
      operatorHeader: "操作人",
      notesHeader: "备注",
      // 状态消息
      loading: "加载中...",
      noRecords: "暂无入库记录",
      submitFailed: "提交失败",
      networkError: "网络错误",
      // 产品选项
      driedAlmondKernel: "烘干巴旦木仁 (LAFX-ALK)",
      roastedHazelnut: "烘烤榛子，有壳 (LAFX-HZN)",
      roastedSaltedMacadamia: "烘烤加盐夏威夷果 (LAFX-IMC)",
      roastedSaltedAlmond: "烘烤加盐巴旦木 (LAFX-IAL)",
      roastedSaltedMacadamiaKernel: "烘烤加盐夏威夷果仁 (LAFX-IMCS)",
      saltedChickpea: "盐炒鹰嘴豆 (LAFX-IGP)",
      roastedSaltedAlmondB: "烘烤加盐巴旦木，B类 (LAFX-IAL1)",
      roastedSaltedMacadamiaB: "烘烤加盐夏威夷果，B类 (LAFX-IMC1)"
    },

    // 出库页面
    outbound: {
      title: "出库管理",
      rawOutbound: "原料出库",
      auxOutbound: "辅料出库",
      productOutbound: "成品出库",
      description: "管理原料出库记录，追踪原料消耗情况",
      addOutbound: "新增出库",
      searchPlaceholder: "搜索原料名称或柜号...",
      // 原材料出库页面专用字段
      newOutboundRecord: "新增原料出库记录",
      materialNameLabel: "原料名称 *",
      quantityLabel: "出库数量 *",
      containerLabel: "柜号 *",
      outboundDateLabel: "出库日期 *",
      purposeLabel: "用途/去向",
      operatorLabel: "操作人",
      notesLabel: "备注",
      selectMaterial: "请选择原料",
      enterQuantity: "请输入数量(kg)",
      enterContainer: "请输入柜号",
      enterPurpose: "用于哪个生产批次或生产线",
      enterOperator: "出库登记人员",
      enterNotes: "其他说明信息",
      cancel: "取消",
      saveOutbound: "保存出库",
      // 表格标题
      materialNameHeader: "原料名称",
      quantityHeader: "出库数量(kg)",
      containerHeader: "柜号",
      outboundDateHeader: "出库日期",
      purposeHeader: "用途/去向",
      operatorHeader: "操作人",
      notesHeader: "备注",
      // 状态消息
      loading: "加载中...",
      noRecords: "暂无出库记录",
      outboundFailed: "出库失败",
      // 原料选项
      almondKernelMaterial: "巴旦木仁原料 (LAHN2)",
      almondMaterial: "巴旦木原料 (LAHN1)",
      hazelnutMaterial: "榛子原料 (LAHP1)",
      macadamiaMaterial: "夏威夷果原料 (LAMAC1)",
      chickpeaMaterial: "鹰嘴豆原料 (LADG1)",
      
      // 成品出库页面专用字段
      productOutboundTitle: "成品出库管理",
      productOutboundDescription: "管理成品出库记录，自动计算辅料消耗",
      addProductOutbound: "新增出库",
      newProductOutboundRecord: "新增成品出库记录",
      searchProductPlaceholder: "搜索产品名称或批次号...",
      // 表单字段
      productNameLabel: "产品名称 *",
      batchNumberManagement: "批次号管理",
      addBatchNumber: "+ 添加批次号",
      batchNumber: "批次号",
      quantity: "数量",
      outboundDate: "出库日期",
      destination: "去向/客户",
      operator: "操作人",
      notes: "备注",
      grade: "分级",
      selectGrade: "请选择分级",
      // 选择提示
      selectProduct: "请选择产品",
      enterBatchNumber: "请输入批次号",
      enterQuantity: "请输入数量",
      enterDestination: "请输入去向或客户名称",
      enterOperator: "出库登记人员",
      enterNotes: "其他说明信息",
      // 按钮
      cancel: "取消",
      saveOutbound: "保存出库",
      // 表格标题
      productNameHeader: "产品名称",
      batchNumberHeader: "批次号",
      outboundQuantityHeader: "出库数量",
      outboundDateHeader: "出库日期",
      destinationHeader: "去向/客户",
      operatorHeader: "操作人",
      notesHeader: "备注",
      // 状态消息
      loading: "加载中...",
      noRecords: "暂无出库记录",
      outboundFailed: "出库失败",
      // 产品选项
      driedAlmondKernel: "烘干巴旦木仁 (LAFX-ALK)",
      roastedHazelnut: "烘烤榛子，有壳 (LAFX-HZN)",
      roastedSaltedMacadamia: "烘烤加盐夏威夷果 (LAFX-IMC)",
      roastedSaltedAlmond: "烘烤加盐巴旦木 (LAFX-IAL)",
      roastedSaltedMacadamiaKernel: "烘烤加盐夏威夷果仁 (LAFX-IMCS)",
      saltedChickpea: "盐炒鹰嘴豆 (LAFX-IGP)",
      roastedSaltedAlmondB: "烘烤加盐巴旦木，B类 (LAFX-IAL1)",
      roastedSaltedMacadamiaB: "烘烤加盐夏威夷果，B类 (LAFX-IMC1)",
      date: "日期",
      materialCode: "物料编码",
      containerNumber: "出库柜号",
      declarationNo: "申报单号",
      customsFee: "报关费($)",
      logisticsFee: "物流费($)",
      clearanceFee: "清关费($)",
      selectProduct: "选择产品",
      selectMaterialCode: "选择原料编码",
      selectAuxCode: "选择辅料编码",
      selectProductCode: "选择产品编码",
      productionBatch: "生产批次",
      qualityCheck: "质检状态",
      inspector: "质检员",
      qualityReport: "质检表格",
      uploadQualityReport: "上传质检表格",
      downloadQualityReport: "下载质检表格",
      deleteQualityReport: "删除质检表格",
      notes: "备注",
      grade: "分级",
      selectGrade: "选择分级",
      grade18_20: "18-20mm",
      grade16_18: "16-18mm", 
      grade14_16: "14-16mm",
      grade12_14: "12-14mm",
      grade9_17: "9-17mm(style)",
      grade8_14: "8-14mm(style)",
      latestRecords: "最新原料出库记录",
      latestAuxRecords: "最新辅料出库记录",
      latestProductRecords: "最新成品出库记录",
      submitSuccess: "提交成功！",
      submitFailed: "提交失败",
      networkError: "网络错误"
    },

    // 库存页面
    inventory: {
      title: "库存管理",
      materialInventory: "原料库存",
      auxiliaryInventory: "辅料库存",
      productInventory: "成品库存",
      lowStockWarning: "低库存预警",
      totalMaterials: "原料总数",
      totalAuxiliary: "辅料总数",
      totalProducts: "成品总数",
      stockLevel: "库存水平",
      reorderPoint: "再订货点",
      lastUpdated: "最后更新",
      
      // 库存台账页面专用字段
      inventoryLedger: "库存台账",
      inventoryDescription: "实时库存统计，按柜号管理原料余量",
      refreshData: "刷新数据",
      // 汇总卡片
      rawMaterialTypes: "原料种类",
      cabinetsUsed: "使用柜号",
      totalInventory: "总库存量(kg)",
      // 原料汇总
      materialSummary: "原料汇总",
      // 详细库存台账
      detailedInventoryLedger: "详细库存台账",
      // 表格标题
      materialNameHeader: "物料名称",
      typeHeader: "类型",
      totalInventoryHeader: "总库存量",
      cabinetsUsedHeader: "使用柜号数",
      cabinetListHeader: "柜号列表",
      cabinetCodeBatchHeader: "柜号/编码/批次",
      declarationNoHeader: "申报单号",
      inboundQuantityHeader: "入库数量",
      outboundQuantityHeader: "出库数量",
      remainingQuantityHeader: "剩余数量",
      // 类型标签
      rawMaterial: "原料",
      auxiliaryMaterial: "辅料",
      finishedProduct: "成品",
      // 状态消息
      loading: "加载中...",
      noInventoryData: "暂无库存数据",
      // 单位
      unit: "kg"
    },

    // 资产管理
    assetManagement: {
      title: "资产管理",
      description: "管理工厂、机器、车辆、设备和其他资产",
      addAsset: "新增资产",
      assetList: "资产列表",
      assetDetails: "资产详情",
      assetType: "资产类型",
      purchaseDate: "购买日期",
      purchasePrice: "购买价格",
      currentValue: "当前价值",
      depreciation: "折旧",
      location: "位置",
      status: "状态",
      supplier: "供应商",
      note: "备注",
      addRecord: "添加记录",
      editRecord: "编辑记录",
      deleteRecord: "删除记录",
      // 筛选和搜索
      categoryFilter: "分类筛选",
      allCategories: "全部",
      searchPlaceholder: "搜索资产名称、编码或描述...",
      // 表格标题
      assetNameHeader: "资产名称",
      assetCodeHeader: "资产编码",
      categoryHeader: "分类",
      statusHeader: "状态",
      locationHeader: "位置",
      responsiblePersonHeader: "负责人",
      currentValueHeader: "当前价值",
      operationsHeader: "操作",
      // 状态选项
      statusOptions: {
        active: "正常使用",
        inactive: "停用",
        maintenance: "维护中",
        retired: "已报废"
      },
      // 表单字段
      assetName: "资产名称",
      assetCode: "资产编码",
      category: "分类",
      description: "描述",
      purchaseDate: "购买日期",
      purchasePrice: "购买价格",
      currentValue: "当前价值",
      responsiblePerson: "负责人",
      department: "部门",
      supplier: "供应商",
      warrantyExpiry: "保修到期",
      maintenanceCycle: "维护周期",
      lastMaintenanceDate: "上次维护日期",
      nextMaintenanceDate: "下次维护日期",
      notes: "备注",
      // 按钮
      view: "查看",
      edit: "编辑",
      delete: "删除",
      save: "保存",
      cancel: "取消",
      // 消息
      noAssets: "暂无资产数据",
      basicInfo: "基本信息",
      financialInfo: "财务信息",
      maintenanceRecords: "维护记录",
      depreciationRecords: "折旧记录",
      noMaintenanceRecords: "暂无维护记录",
      noDepreciationRecords: "暂无折旧记录",
      categories: {
        factory: "工厂",
        machine: "机器",
        vehicle: "车辆",
        equipment: "设备",
        other: "其他"
      }
    },

    // 数据查看
    dataView: {
      title: "数据查看",
      materialDict: "物料字典",
      products: "产品",
      productBOM: "产品配方",
      rawInout: "原料出入库",
      auxInout: "辅料出入库",
      capital: "资本记录",
      logs: "操作日志",
      deleteConfirm: "确认删除",
      deleteSuccess: "删除成功",
      deleteFailed: "删除失败",
      totalRecords: "共 {count} 条记录"
    },


    // 数据管理
    dataManagement: {
      title: "数据管理",
      dangerousOperation: "危险操作",
      description: "此页面用于删除错误输入的数据。删除操作不可逆，请谨慎操作！",
      // 标签页
      rawInboundData: "原料入库数据",
      auxInboundData: "辅料入库数据",
      productInboundData: "成品入库数据",
      rawOutboundData: "原料出库数据",
      productOutboundData: "成品出库数据",
      assetData: "资产数据",
      financialData: "财务数据",
      // 表格
      operation: "操作",
      noData: "暂无数据",
      // 删除确认
      confirmDelete: "确认删除",
      deleteWarning: "您即将删除以下数据：",
      enterCode: "请输入暗号 \"IMSURE\" 确认删除：",
      codePlaceholder: "输入暗号...",
      cancel: "取消",
      confirmDeleteButton: "确认删除",
      // 状态消息
      loading: "加载中...",
      deleteSuccess: "删除成功！",
      deleteFailed: "删除失败！",
      codeError: "暗号错误！请输入正确的暗号：IMSURE",
      // 获取数据失败
      getDataFailed: "获取数据失败"
    },

    // 财务管理
    financeManagement: {
      title: "财务管理",
      description: "管理原料入库成本、辅料入库成本、成品出库销售和财务汇总",
      // 时间筛选
      timeRange: "时间范围",
      to: "至",
      // 标签页
      rawInboundCost: "原料入库成本",
      auxInboundCost: "辅料入库成本",
      productOutboundSales: "成品出库销售",
      financialSummary: "财务汇总",
      // 原料入库成本
      rawInboundCostEntry: "原料入库成本录入",
      rawInboundRecords: "原料入库记录",
      // 辅料入库成本
      auxInboundCostEntry: "辅料入库成本录入",
      auxInboundRecords: "辅料入库记录",
      // 成品出库销售
      productOutboundSalesEntry: "成品出库销售录入",
      productOutboundRecords: "成品出库记录",
      // 财务汇总
      financialSummaryEntry: "财务汇总录入",
      financialSummaryRecords: "财务汇总记录",
      // 价格输入字段
      cifPrice: "CIF价格 ($)",
      customsClearanceFee: "清关费($)",
      totalCost: "总成本($)",
      unitCost: "单位成本($/kg)",
      unitPrice: "单价($)",
      discountRate: "折扣率(%)",
      shippingFee: "运费($)",
      totalRevenue: "总收入($)",
      unitRevenue: "单位收入($/kg)",
      // 按钮
      calculateFinancialResults: "计算财务结果",
      save: "保存",
      edit: "编辑",
      delete: "删除",
      // 状态消息
      loading: "加载中...",
      noData: "暂无数据",
      saveSuccess: "保存成功",
      saveFailed: "保存失败",
      // 财务结果
      financialResults: "财务结果",
      totalRawCost: "原料总成本",
      totalAuxCost: "辅料总成本",
      totalProductRevenue: "成品总收入",
      grossProfit: "毛利润",
      profitMargin: "利润率",
      savedReports: "已保存的报告"
    },

    // 数据分析
    analytics: {
      title: "数据分析",
      analysisPeriod: "分析时间范围",
      months: "个月",
      inventoryTurnover: "库存周转率分析",
      monthlyTrend: "月度趋势",
      stockWarning: "库存预警",
      hotMaterials: "热门物料",
      statistics: "统计摘要",
      materialCount: "物料总数",
      recordCount: "出入库记录",
      lowTurnoverCount: "低周转物料",
      avgTurnoverRate: "平均周转率",
      turnoverRate: "周转率",
      inboundQty: "入库数量",
      outboundQty: "出库数量",
      avgInventory: "平均库存"
    },

    // 预测分析
    prediction: {
      title: "预测分析",
      analysisParams: "分析参数",
      selectMaterial: "选择物料",
      predictionPeriods: "预测期数",
      leadTime: "采购提前期（月）",
      demandPrediction: "需求预测",
      predictionSlope: "预测斜率",
      predictionIntercept: "预测截距",
      futurePredictions: "未来预测",
      period: "预测期",
      predictedDemand: "预测需求量",
      inventoryManagement: "库存管理建议",
      currentStock: "当前库存",
      safetyStock: "安全库存",
      reorderPoint: "再订货点",
      avgMonthlyDemand: "平均月需求",
      purchaseAdvice: "采购建议",
      needPurchase: "需要采购",
      preparePurchase: "准备采购",
      sufficientStock: "库存充足",
      purchaseQuantity: "建议采购量",
      historicalData: "历史需求数据",
      month: "月份",
      demand: "需求量",
      selectMaterialForAnalysis: "请选择一个物料进行分析"
    },

    // 参考数据页面
    referenceData: {
      title: "参考数据",
      description: "查看所有产品和材料的参考信息",
      searchPlaceholder: "搜索产品名称或编码...",
      filterAll: "全部",
      filterMaterials: "材料",
      
      // 品类数据参考页面专用字段
      categoryDataReference: "品类数据参考",
      categoryDataDescription: "查看所有产品、原料和辅料的完整信息",
      totalSummary: "总计: {products} 产品, {rawMaterials} 原料, {auxMaterials} 辅料",
      // 搜索和筛选
      searchProductPlaceholder: "搜索产品名称、编码或材料...",
      allTypes: "全部类型",
      productsOnly: "仅产品",
      rawOnly: "仅原料",
      auxOnly: "仅辅料",
      // 标签页
      productRecipes: "产品配方",
      rawMaterialTypes: "原料类型",
      auxiliaryMaterialTypes: "辅料类型",
      // 产品配方详情
      productRecipeDetails: "产品配方详情",
      productCode: "产品代码",
      // 原料和辅料
      rawMaterials: "原料",
      auxiliaryMaterials: "辅料",
      noRawMaterials: "无原料",
      noAuxiliaryMaterials: "无辅料",
      materialCode: "编码",
      // 原料类型列表
      rawMaterialTypeList: "原料类型列表",
      // 辅料类型列表
      auxiliaryMaterialTypeList: "辅料类型列表",
      // 使用产品
      usedProducts: "使用产品",
      // 状态消息
      loading: "加载中...",
      error: "错误"
    },

    // 表单验证
    validation: {
      required: "此字段为必填项",
      invalidFormat: "格式无效",
      minValue: "最小值不能小于",
      maxValue: "最大值不能大于",
      positiveNumber: "请输入正数"
    },

    // 错误消息
    errors: {
      networkError: "网络错误",
      serverError: "服务器错误",
      dataLoadFailed: "数据加载失败",
      operationFailed: "操作失败",
      invalidInput: "输入无效",
      permissionDenied: "权限不足",
      unknown: "未知错误"
    }
  }
};