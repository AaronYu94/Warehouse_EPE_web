const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
let dbPath;
if (process.env.NODE_ENV === 'development') {
  dbPath = path.join(__dirname, 'warehouse.db');
} else {
  // 在打包后的应用中，需要将数据库文件复制到可写位置
  const sourceDbPath = path.join(__dirname, '../dist/warehouse.db');
  const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
  const appDataPath = path.join(userDataPath, 'Warehouse Management System');
  
  // 确保应用数据目录存在
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  
  dbPath = path.join(appDataPath, 'warehouse.db');
  
  // 如果目标数据库文件不存在，从源文件复制
  if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
    try {
      fs.copyFileSync(sourceDbPath, dbPath);
      console.log('Database copied to:', dbPath);
    } catch (err) {
      console.error('Failed to copy database:', err);
    }
  }
}

console.log('Database path:', dbPath);
console.log('Current directory:', __dirname);

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    console.error('Database path:', dbPath);
  } else {
    console.log('Connected to SQLite database.');
    // 初始化数据库表
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 创建用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator'
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      // 插入默认用户
      const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'operator', password: 'operator123', role: 'operator' },
        { username: 'viewer', password: 'viewer123', role: 'viewer' }
      ];
      
      defaultUsers.forEach(user => {
        db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
          [user.username, user.password, user.role]);
      });
    }
  });

  // 创建操作日志表
  db.run(`CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    details TEXT,
    "user" TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating operation_logs table:', err.message);
    }
  });

  // 创建其他表（如果不存在）
  const tables = [
    `CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS aux_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS product_bom (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      material_code TEXT NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (product_code) REFERENCES products (code),
      FOREIGN KEY (material_code) REFERENCES materials (code)
    )`,
    `CREATE TABLE IF NOT EXISTS raw_inout (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      material_name TEXT NOT NULL,
      declaration_no TEXT,
      container TEXT NOT NULL,
      quantity REAL NOT NULL,
      quality_report_path TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS aux_inout (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      aux_code TEXT NOT NULL,
      aux_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      quality_report_path TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS product_inbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      inbound_date TEXT NOT NULL,
      production_date TEXT,
      expiry_date TEXT,
      operator TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS raw_out (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      container TEXT NOT NULL,
      outbound_date TEXT NOT NULL,
      purpose TEXT,
      operator TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS aux_outbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      aux_code TEXT NOT NULL,
      aux_name TEXT NOT NULL,
      container TEXT NOT NULL,
      quantity REAL NOT NULL,
      destination TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS product_outbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity REAL NOT NULL,
      outbound_date TEXT NOT NULL,
      destination TEXT,
      operator TEXT,
      notes TEXT,
      aux_usage TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS product_aux_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      product_code TEXT NOT NULL,
      material_name TEXT NOT NULL,
      material_code TEXT NOT NULL,
      usage_per_unit REAL NOT NULL,
      unit TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS capital (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      current_qty REAL NOT NULL,
      actual_qty REAL,
      difference REAL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      details TEXT,
      user TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_name TEXT NOT NULL,
      asset_code TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('factory', 'machine', 'vehicle', 'equipment', 'other')),
      description TEXT,
      purchase_date TEXT,
      purchase_price REAL,
      current_value REAL,
      location TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance', 'retired')),
      responsible_person TEXT,
      department TEXT,
      supplier TEXT,
      warranty_expiry TEXT,
      maintenance_cycle INTEGER,
      last_maintenance_date TEXT,
      next_maintenance_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS asset_maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      maintenance_date TEXT NOT NULL,
      maintenance_type TEXT NOT NULL CHECK(maintenance_type IN ('routine', 'repair', 'inspection', 'upgrade')),
      description TEXT,
      cost REAL,
      technician TEXT,
      next_maintenance_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS asset_depreciation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      depreciation_date TEXT NOT NULL,
      depreciation_amount REAL NOT NULL,
      remaining_value REAL NOT NULL,
      depreciation_rate REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS finance_raw_inbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_inbound_id INTEGER NOT NULL,
      material_name TEXT NOT NULL,
      container TEXT NOT NULL,
      quantity REAL NOT NULL,
      cif_price REAL NOT NULL,
      customs_fee REAL NOT NULL,
      total_cost REAL NOT NULL,
      unit_cost REAL NOT NULL,
      import_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (raw_inbound_id) REFERENCES raw_inout(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS finance_aux_inbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aux_inbound_id INTEGER NOT NULL,
      aux_name TEXT NOT NULL,
      aux_code TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_cost REAL NOT NULL,
      import_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aux_inbound_id) REFERENCES aux_inout(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS finance_product_outbound (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_outbound_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity REAL NOT NULL,
      cif_price REAL NOT NULL,
      discount_rate REAL DEFAULT 1.0,
      shipping_fee REAL NOT NULL,
      customs_fee REAL NOT NULL,
      total_revenue REAL NOT NULL,
      unit_revenue REAL NOT NULL,
      outbound_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_outbound_id) REFERENCES product_outbound(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS finance_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      total_raw_cost REAL NOT NULL,
      total_aux_cost REAL NOT NULL,
      total_product_revenue REAL NOT NULL,
      gross_profit REAL NOT NULL,
      profit_margin REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

  ];

  tables.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`Error creating table ${index}:`, err.message);
      }
    });
  });
}

// 初始化基础数据
function initBaseData() {
  console.log('开始初始化基础数据...');
  
  // 检查是否已经有数据
  db.get("SELECT COUNT(*) as count FROM materials", (err, row) => {
    if (err) {
      console.error('Error checking materials count:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('数据库为空，开始初始化数据...');
      initMaterialsData();
      initProductsData();
      initProductAuxMappingData();
    } else {
      console.log('数据库已有数据，跳过初始化');
    }
  });
}

// 初始化物料数据
function initMaterialsData() {
  const materials = [
    // 原料
    { code: 'LAHN2', name: '巴旦木仁原料', unit: '公斤' },
    { code: 'LAHP1', name: '榛子原料', unit: '公斤' },
    { code: 'LAMAC1', name: '夏威夷果原料', unit: '公斤' },
    { code: 'LAHN1', name: '巴旦木原料', unit: '公斤' },
    { code: 'LADG1', name: '鹰嘴豆原料', unit: '公斤' },
    
    // 辅料
    { code: 'MUOI', name: '盐', unit: '公斤' },
    { code: 'TUINHOM', name: '铝箔袋', unit: '个' },
    { code: 'THUNGGIAY', name: '纸箱', unit: '个' },
    { code: 'LABJB', name: '千斤包', unit: '个' },
    { code: 'LASDS', name: '甜蜜素', unit: '公斤' },
    { code: 'LASDC', name: '糖精钠', unit: '公斤' },
    { code: 'LACFK', name: '安赛蜜', unit: '公斤' },
    { code: 'LASCL', name: '三氯蔗糖', unit: '公斤' },
    { code: 'LAVNL', name: '香兰素', unit: '公斤' },
    { code: 'LADTL', name: '糖', unit: '公斤' },
    { code: 'LARNC', name: '坚果香精 0612', unit: '公斤' },
    { code: 'LAPMF', name: '牧场鲜奶粉末香精 444-1', unit: '公斤' },
    { code: 'LAMFV', name: '奶味香精 0265', unit: '公斤' },
    { code: 'LANFV', name: '坚果香精 0612', unit: '公斤' },
    { code: 'LACAN', name: '复合抗氧化剂', unit: '公斤' },
    { code: 'LAPAP', name: '坚果炒货起酥渗透剂 0313', unit: '公斤' },
    { code: 'BOTNGOT', name: '味精', unit: '公斤' },
    { code: 'H2O2', name: '双氧水', unit: '公斤' },
    { code: 'PALET', name: '托板', unit: '个' }
  ];

  materials.forEach(material => {
    db.run('INSERT OR IGNORE INTO materials (code, name, unit) VALUES (?, ?, ?)', 
      [material.code, material.name, material.unit]);
  });
  console.log('✅ 物料数据初始化完成');
}

// 初始化产品数据
function initProductsData() {
  const products = [
    { code: 'LAFX-ALK', name: '烘干巴旦木仁', unit: '公斤' },
    { code: 'LAFX-HZN', name: '烘烤榛子', unit: '公斤' },
    { code: 'LAFX-IMC', name: '烘烤加盐夏威夷果', unit: '公斤' },
    { code: 'LAFX-IAL', name: '烘烤加盐巴旦木', unit: '公斤' },
    { code: 'LAFX-IMC1', name: '烘烤加盐夏威夷果（B类）', unit: '公斤' },
    { code: 'LAFX-IAL1', name: '烘烤加盐巴旦木（B类）', unit: '公斤' },
    { code: 'LAFX-DG', name: '盐炒鹰嘴豆', unit: '公斤' },
    { code: 'LAFX-IMCS', name: '烘烤加盐夏威夷果仁', unit: '公斤' }
  ];

  products.forEach(product => {
    db.run('INSERT OR IGNORE INTO products (code, name, unit) VALUES (?, ?, ?)', 
      [product.code, product.name, product.unit]);
  });
  console.log('✅ 产品数据初始化完成');
}

// 初始化产品-物料对照表数据
function initProductAuxMappingData() {
  const mappingData = [
    // 烘干巴旦木仁 (LAFX-ALK)
    { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '巴旦木仁原料', material_code: 'LAHN2', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
    { product_name: '烘干巴旦木仁', product_code: 'LAFX-ALK', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    
    // 烘烤榛子，有壳 (LAFX-HZN)
    { product_name: '烘烤榛子，有壳', product_code: 'LAFX-HZN', material_name: '榛子原料', material_code: 'LAHP1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤榛子，有壳', product_code: 'LAFX-HZN', material_name: 'Jumbo 袋', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
    
    // 烘烤加盐夏威夷果 (LAFX-IMC)
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '甜蜜素', material_code: 'LASDS', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '糖精钠', material_code: 'LASDC', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '安赛蜜', material_code: 'LACFK', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '三氯蔗糖', material_code: 'LASCL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '香兰素', material_code: 'LAVNL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '坚果香精 0612', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '牧场鲜奶粉末香精 444-1', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '奶味香精 0265', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果', product_code: 'LAFX-IMC', material_name: '铝箔袋', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
    
    // 烘烤加盐巴旦木 (LAFX-IAL)
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '巴旦木原料', material_code: 'LAHN1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '坚果香精 0612', material_code: 'LANFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '复合抗氧化剂', material_code: 'LACAN', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '木瓜蛋白酶粉 0313', material_code: 'LAPAP', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '牧场鲜奶粉末香精 444-1', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '奶味香精 0265', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '味精', material_code: 'BOTNGOT', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木', product_code: 'LAFX-IAL', material_name: '双氧水', material_code: 'H2O2', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    
    // 烘烤加盐夏威夷果仁 (LAFX-IMCS)
    { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果仁', product_code: 'LAFX-IMCS', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
    
    // 盐炒鹰嘴豆 (LAFX-DG)
    { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-DG', material_name: '鹰嘴豆原料', material_code: 'LADG1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-DG', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-DG', material_name: '铝箔袋（真空包装袋）', material_code: 'TUINHOM', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-DG', material_name: '纸箱', material_code: 'THUNGGIAY', usage_per_unit: 0.05, unit: '个', type: 'aux' },
    { product_name: '盐炒鹰嘴豆', product_code: 'LAFX-DG', material_name: '托板', material_code: 'PALET', usage_per_unit: 0.01, unit: '个', type: 'aux' },
    
    // 烘烤加盐巴旦木，B类 (LAFX-IAL1)
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '巴旦木原料', material_code: 'LAHN1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '坚果香精 0612', material_code: 'LANFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '复合抗氧化剂', material_code: 'LACAN', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '坚果香料包', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '木瓜蛋白酶粉 0313', material_code: 'LAPAP', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '牧场鲜奶粉末香精', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '奶味香精', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '盐', material_code: 'MUOI', usage_per_unit: 0.02, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '味精', material_code: 'BOTNGOT', usage_per_unit: 0.005, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐巴旦木，B类', product_code: 'LAFX-IAL1', material_name: '双氧水', material_code: 'H2O2', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    
    // 烘烤加盐夏威夷果，B类 (LAFX-IMC1)
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '夏威夷果原料', material_code: 'LAMAC1', usage_per_unit: 1, unit: 'kg', type: 'raw' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '甜蜜素', material_code: 'LASDS', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '糖精钠', material_code: 'LASDC', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '安赛蜜', material_code: 'LACFK', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '三氯蔗糖', material_code: 'LASCL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '香兰素', material_code: 'LAVNL', usage_per_unit: 0.001, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '糖', material_code: 'LADTL', usage_per_unit: 0.05, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '坚果香精', material_code: 'LARNC', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '牧场鲜奶粉末香精', material_code: 'LAPMF', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '奶味香精', material_code: 'LAMFV', usage_per_unit: 0.01, unit: 'kg', type: 'aux' },
    { product_name: '烘烤加盐夏威夷果，B类', product_code: 'LAFX-IMC1', material_name: '千斤包', material_code: 'LABJB', usage_per_unit: 1, unit: '个', type: 'aux' }
  ];

  mappingData.forEach(data => {
    db.run('INSERT OR IGNORE INTO product_aux_mapping (product_name, product_code, material_name, material_code, usage_per_unit, unit, type) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [data.product_name, data.product_code, data.material_name, data.material_code, data.usage_per_unit, data.unit, data.type]);
  });
  console.log('✅ 产品-物料对照表数据初始化完成');
}

// 数据库操作函数
const dbOperations = {
  // 用户相关
  getUserByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // 操作日志相关
  insertLog: (operation, tableName, recordId, details, user) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO operation_logs (operation, table_name, record_id, details, "user") VALUES (?, ?, ?, ?, ?)`;
      db.run(sql, [operation, tableName, recordId, details, user], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  getAllLogs: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM operation_logs ORDER BY timestamp DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // 材料相关
  getAllMaterials: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM materials ORDER BY code', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertMaterial: (code, name, unit) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO materials (code, name, unit) VALUES (?, ?, ?)', [code, name, unit], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 辅料相关
  getAllAuxMaterials: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM aux_materials ORDER BY code', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertAuxMaterial: (code, name, unit) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO aux_materials (code, name, unit) VALUES (?, ?, ?)', [code, name, unit], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 产品相关
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products ORDER BY code', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertProduct: (code, name, unit) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO products (code, name, unit) VALUES (?, ?, ?)', [code, name, unit], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 产品配方相关
  getAllProductBom: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_bom ORDER BY product_code', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertProductBom: (productCode, materialCode, quantity) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO product_bom (product_code, material_code, quantity) VALUES (?, ?, ?)', 
        [productCode, materialCode, quantity], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 原料入库相关
  getAllRawInout: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM raw_inout ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertRawInout: (date, materialName, declarationNo, container, quantity, qualityReportPath) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO raw_inout (date, material_name, declaration_no, container, quantity, quality_report_path) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [date, materialName, declarationNo, container, quantity, qualityReportPath], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteRawInoutById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM raw_inout WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 辅料入库相关
  getAllAuxInout: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM aux_inout ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertAuxInout: (date, auxCode, auxName, quantity, unit, qualityReportPath) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO aux_inout (date, aux_code, aux_name, quantity, unit, quality_report_path) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [date, auxCode, auxName, quantity, unit, qualityReportPath], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteAuxInoutById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM aux_inout WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 原料出库相关
  getAllRawOut: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM raw_out ORDER BY outbound_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertRawOut: (materialName, quantity, container, outboundDate, purpose, operator, notes) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO raw_out (material_name, quantity, container, outbound_date, purpose, operator, notes) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [materialName, quantity, container, outboundDate, purpose, operator, notes], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteRawOutById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM raw_out WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 辅料出库相关
  getAllAuxOutbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM aux_outbound ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertAuxOutbound: (date, auxCode, auxName, container, quantity, destination) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO aux_outbound (date, aux_code, aux_name, container, quantity, destination) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [date, auxCode, auxName, container, quantity, destination], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteAuxOutboundById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM aux_outbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 产品出库相关
  getAllProductOutbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_outbound ORDER BY outbound_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertProductOutbound: (productName, batchNumber, quantity, outboundDate, destination, operator, notes, auxUsage) => {
    return new Promise((resolve, reject) => {
      // 开始事务
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 插入成品出库记录
        const sql = `INSERT INTO product_outbound (product_name, batch_number, quantity, outbound_date, destination, operator, notes, aux_usage) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [productName, batchNumber, quantity, outboundDate, destination, operator, notes, auxUsage], function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          const productOutboundId = this.lastID;
          
          // 如果有辅料用量数据，创建辅料出库记录
          if (auxUsage && auxUsage !== '[]') {
            try {
              const auxUsageArray = JSON.parse(auxUsage);
              
              auxUsageArray.forEach((item, index) => {
                if (item.type === 'aux' && item.totalUsage > 0) {
                  const auxOutboundSql = `INSERT INTO aux_outbound (date, aux_code, aux_name, container, quantity, destination) 
                                         VALUES (?, ?, ?, ?, ?, ?)`;
                  db.run(auxOutboundSql, [
                    outboundDate,
                    item.materialCode,
                    item.materialName,
                    `Product-${productOutboundId}`, // 使用产品出库ID作为容器标识
                    item.totalUsage,
                    `Used for ${productName} batch ${batchNumber}` // 记录用途
                  ], function(err) {
                    if (err) {
                      console.error('Error creating aux outbound record:', err);
                    }
                  });
                }
              });
            } catch (parseError) {
              console.error('Error parsing aux usage data:', parseError);
            }
          }
          
          // 提交事务
          db.run('COMMIT', function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve(productOutboundId);
            }
          });
        });
      });
    });
  },

  deleteProductOutboundById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM product_outbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 成品入库相关
  getAllProductInbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_inbound ORDER BY inbound_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertProductInbound: (productName, batchNumber, quantity, inboundDate, productionDate, expiryDate, operator, notes) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO product_inbound (product_name, batch_number, quantity, inbound_date, production_date, expiry_date, operator, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [productName, batchNumber, quantity, inboundDate, productionDate, expiryDate, operator, notes], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteProductInboundById: (id) => {
    return new Promise((resolve, reject) => {
      console.log('Attempting to delete product_inbound with ID:', id);
      console.log('Database path:', dbPath);
      
      // 先检查数据库连接
      db.get('SELECT 1', (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        
        // 检查记录是否存在
        db.get('SELECT id FROM product_inbound WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Select error:', err);
            reject(err);
            return;
          }
          
          if (!row) {
            console.log('Record not found');
            reject(new Error('Record not found'));
            return;
          }
          
          console.log('Record found, attempting delete');
          
          // 执行删除
          db.run('DELETE FROM product_inbound WHERE id = ?', [id], function(err) {
            if (err) {
              console.error('Delete error:', err);
              reject(err);
            } else {
              console.log('Delete successful, changes:', this.changes);
              resolve(this.changes);
            }
          });
        });
      });
    });
  },

  // 资金相关
  getAllCapital: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM capital ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertCapital: (date, description, price, type) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO capital (date, description, price, type) VALUES (?, ?, ?, ?)', 
        [date, description, price, type], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  deleteCapitalById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM capital WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 库存相关
  getAllStock: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM stock ORDER BY code', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertStock: (code, name, unit, currentQty, actualQty, difference, note) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO stock (code, name, unit, current_qty, actual_qty, difference, note) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [code, name, unit, currentQty, actualQty, difference, note], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateStock: (id, actualQty, difference, note) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE stock SET actual_qty = ?, difference = ?, note = ? WHERE id = ?', 
        [actualQty, difference, note, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 成品辅料对照表相关
  getAllProductAuxMapping: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_aux_mapping ORDER BY product_name, material_name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getProductAuxMappingByProduct: (productName) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_aux_mapping WHERE product_name = ? ORDER BY type, material_name', [productName], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertProductAuxMapping: (productName, productCode, materialName, materialCode, usagePerUnit, unit, type) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO product_aux_mapping (product_name, product_code, material_name, material_code, usage_per_unit, unit, type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [productName, productCode, materialName, materialCode, usagePerUnit, unit, type], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 资产管理相关
  getAllAssets: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM assets ORDER BY category, asset_name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getAssetsByCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM assets WHERE category = ? ORDER BY asset_name', [category], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getAssetById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM assets WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  insertAsset: (assetName, assetCode, category, description, purchaseDate, purchasePrice, currentValue, location, status, responsiblePerson, department, supplier, warrantyExpiry, maintenanceCycle, lastMaintenanceDate, nextMaintenanceDate, notes) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO assets (asset_name, asset_code, category, description, purchase_date, purchase_price, current_value, location, status, responsible_person, department, supplier, warranty_expiry, maintenance_cycle, last_maintenance_date, next_maintenance_date, notes) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [assetName, assetCode, category, description, purchaseDate, purchasePrice, currentValue, location, status, responsiblePerson, department, supplier, warrantyExpiry, maintenanceCycle, lastMaintenanceDate, nextMaintenanceDate, notes], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateAsset: (id, assetName, assetCode, category, description, purchaseDate, purchasePrice, currentValue, location, status, responsiblePerson, department, supplier, warrantyExpiry, maintenanceCycle, lastMaintenanceDate, nextMaintenanceDate, notes) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE assets SET asset_name = ?, asset_code = ?, category = ?, description = ?, purchase_date = ?, purchase_price = ?, current_value = ?, location = ?, status = ?, responsible_person = ?, department = ?, supplier = ?, warranty_expiry = ?, maintenance_cycle = ?, last_maintenance_date = ?, next_maintenance_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(sql, [assetName, assetCode, category, description, purchaseDate, purchasePrice, currentValue, location, status, responsiblePerson, department, supplier, warrantyExpiry, maintenanceCycle, lastMaintenanceDate, nextMaintenanceDate, notes, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAssetById: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM assets WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 资产维护记录相关
  getAssetMaintenance: (assetId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM asset_maintenance WHERE asset_id = ? ORDER BY maintenance_date DESC', [assetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertAssetMaintenance: (assetId, maintenanceDate, maintenanceType, description, cost, technician, nextMaintenanceDate) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO asset_maintenance (asset_id, maintenance_date, maintenance_type, description, cost, technician, next_maintenance_date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [assetId, maintenanceDate, maintenanceType, description, cost, technician, nextMaintenanceDate], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 资产折旧记录相关
  getAssetDepreciation: (assetId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM asset_depreciation WHERE asset_id = ? ORDER BY depreciation_date DESC', [assetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertAssetDepreciation: (assetId, depreciationDate, depreciationAmount, remainingValue, depreciationRate) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO asset_depreciation (asset_id, depreciation_date, depreciation_amount, remaining_value, depreciation_rate) 
                   VALUES (?, ?, ?, ?, ?)`;
      db.run(sql, [assetId, depreciationDate, depreciationAmount, remainingValue, depreciationRate], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 财务原料入库成本相关
  getAllFinanceRawInbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_raw_inbound ORDER BY import_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getFinanceRawInboundByDateRange: (startDate, endDate) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_raw_inbound WHERE import_date BETWEEN ? AND ? ORDER BY import_date DESC', 
        [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertFinanceRawInbound: (rawInboundId, materialName, container, quantity, cifPrice, customsFee, totalCost, unitCost, importDate) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO finance_raw_inbound (raw_inbound_id, material_name, container, quantity, cif_price, customs_fee, total_cost, unit_cost, import_date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [rawInboundId, materialName, container, quantity, cifPrice, customsFee, totalCost, unitCost, importDate], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateFinanceRawInbound: (id, cifPrice, customsFee, totalCost, unitCost) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE finance_raw_inbound SET cif_price = ?, customs_fee = ?, total_cost = ?, unit_cost = ? WHERE id = ?`;
      db.run(sql, [cifPrice, customsFee, totalCost, unitCost, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 财务辅料入库成本相关
  getAllFinanceAuxInbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_aux_inbound ORDER BY import_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getFinanceAuxInboundByDateRange: (startDate, endDate) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_aux_inbound WHERE import_date BETWEEN ? AND ? ORDER BY import_date DESC', 
        [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertFinanceAuxInbound: (auxInboundId, auxName, auxCode, quantity, unitPrice, totalCost, importDate) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO finance_aux_inbound (aux_inbound_id, aux_name, aux_code, quantity, unit_price, total_cost, import_date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [auxInboundId, auxName, auxCode, quantity, unitPrice, totalCost, importDate], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateFinanceAuxInbound: (id, unitPrice, totalCost) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE finance_aux_inbound SET unit_price = ?, total_cost = ? WHERE id = ?`;
      db.run(sql, [unitPrice, totalCost, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 财务成品出库销售相关
  getAllFinanceProductOutbound: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_product_outbound ORDER BY outbound_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getFinanceProductOutboundByDateRange: (startDate, endDate) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_product_outbound WHERE outbound_date BETWEEN ? AND ? ORDER BY outbound_date DESC', 
        [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertFinanceProductOutbound: (productOutboundId, productName, batchNumber, quantity, cifPrice, discountRate, shippingFee, customsFee, totalRevenue, unitRevenue, outboundDate) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO finance_product_outbound (product_outbound_id, product_name, batch_number, quantity, cif_price, discount_rate, shipping_fee, customs_fee, total_revenue, unit_revenue, outbound_date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [productOutboundId, productName, batchNumber, quantity, cifPrice, discountRate, shippingFee, customsFee, totalRevenue, unitRevenue, outboundDate], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  updateFinanceProductOutbound: (id, cifPrice, discountRate, shippingFee, customsFee, totalRevenue, unitRevenue) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE finance_product_outbound SET cif_price = ?, discount_rate = ?, shipping_fee = ?, customs_fee = ?, total_revenue = ?, unit_revenue = ? WHERE id = ?`;
      db.run(sql, [cifPrice, discountRate, shippingFee, customsFee, totalRevenue, unitRevenue, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // 财务汇总相关
  getAllFinanceSummary: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM finance_summary ORDER BY period_start DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  insertFinanceSummary: (periodStart, periodEnd, totalRawCost, totalAuxCost, totalProductRevenue, grossProfit, profitMargin) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO finance_summary (period_start, period_end, total_raw_cost, total_aux_cost, total_product_revenue, gross_profit, profit_margin) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [periodStart, periodEnd, totalRawCost, totalAuxCost, totalProductRevenue, grossProfit, profitMargin], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // 删除函数
  deleteRawInbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM raw_inout WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAuxInbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM aux_inout WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteProductInbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM product_inbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteRawOutbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM raw_outbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAuxOutbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM aux_outbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteProductOutbound: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM product_outbound WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAsset: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM assets WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
};

module.exports = dbOperations; 