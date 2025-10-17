CREATE TABLE IF NOT EXISTS product_aux_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  aux_name TEXT NOT NULL,
  aux_code TEXT NOT NULL,
  usage_per_unit REAL NOT NULL,
  unit TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 