-- 财务原料入库成本表
CREATE TABLE IF NOT EXISTS finance_raw_inbound (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_inbound_id INTEGER NOT NULL,
  material_name TEXT NOT NULL,
  container TEXT NOT NULL,
  quantity REAL NOT NULL,
  cif_price REAL NOT NULL, -- CIF价格
  customs_fee REAL NOT NULL, -- 清关费
  total_cost REAL NOT NULL, -- 总成本
  unit_cost REAL NOT NULL, -- 单位成本
  import_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (raw_inbound_id) REFERENCES raw_inout(id) ON DELETE CASCADE
);

-- 财务辅料入库成本表
CREATE TABLE IF NOT EXISTS finance_aux_inbound (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aux_inbound_id INTEGER NOT NULL,
  aux_name TEXT NOT NULL,
  aux_code TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL, -- 单位价格
  total_cost REAL NOT NULL, -- 总成本
  import_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aux_inbound_id) REFERENCES aux_inout(id) ON DELETE CASCADE
);

-- 财务成品出库销售表
CREATE TABLE IF NOT EXISTS finance_product_outbound (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_outbound_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  quantity REAL NOT NULL,
  cif_price REAL NOT NULL, -- 销售CIF价格
  discount_rate REAL DEFAULT 1.0, -- 折率
  shipping_fee REAL NOT NULL, -- 海运费
  customs_fee REAL NOT NULL, -- 清关费（包括原文件制作费）
  total_revenue REAL NOT NULL, -- 总收入
  unit_revenue REAL NOT NULL, -- 单位收入
  outbound_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_outbound_id) REFERENCES product_outbound(id) ON DELETE CASCADE
);

-- 财务汇总表
CREATE TABLE IF NOT EXISTS finance_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  total_raw_cost REAL NOT NULL, -- 原料总成本
  total_aux_cost REAL NOT NULL, -- 辅料总成本
  total_product_revenue REAL NOT NULL, -- 成品总收入
  gross_profit REAL NOT NULL, -- 毛利润
  profit_margin REAL NOT NULL, -- 利润率
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 