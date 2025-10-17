-- 资产管理表
CREATE TABLE IF NOT EXISTS assets (
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
  maintenance_cycle INTEGER, -- 维护周期（天）
  last_maintenance_date TEXT,
  next_maintenance_date TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 资产维护记录表
CREATE TABLE IF NOT EXISTS asset_maintenance (
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
);

-- 资产折旧记录表
CREATE TABLE IF NOT EXISTS asset_depreciation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  depreciation_date TEXT NOT NULL,
  depreciation_amount REAL NOT NULL,
  remaining_value REAL NOT NULL,
  depreciation_rate REAL, -- 年折旧率
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
); 