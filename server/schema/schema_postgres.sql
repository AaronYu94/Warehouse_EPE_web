-- PostgreSQL 数据库架构
-- 适用于云端部署的仓库管理系统

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 原料入库表
CREATE TABLE IF NOT EXISTS inbound_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  declaration_no VARCHAR(100),
  container VARCHAR(50) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  quality_report_path VARCHAR(500),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 原料出库表
CREATE TABLE IF NOT EXISTS outbound_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  container VARCHAR(50) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  customer VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 辅料入库表
CREATE TABLE IF NOT EXISTS aux_inbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  container VARCHAR(50) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  supplier VARCHAR(200),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 辅料出库表
CREATE TABLE IF NOT EXISTS aux_outbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  container VARCHAR(50) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  purpose VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 成品入库表
CREATE TABLE IF NOT EXISTS product_inbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  batch_no VARCHAR(100),
  quantity DECIMAL(12,3) NOT NULL,
  quality_grade VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 成品出库表
CREATE TABLE IF NOT EXISTS product_outbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  batch_no VARCHAR(100),
  quantity DECIMAL(12,3) NOT NULL,
  customer VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 产品配方表
CREATE TABLE IF NOT EXISTS product_recipe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(200) NOT NULL,
  raw_material_name VARCHAR(200) NOT NULL,
  quantity_per_unit DECIMAL(12,3) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 财务记录表
CREATE TABLE IF NOT EXISTS finance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'income', 'expense', 'cost'
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 资产管理表
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  current_value DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'active',
  location VARCHAR(200),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_inbound_raw_date ON inbound_raw(date);
CREATE INDEX IF NOT EXISTS idx_inbound_raw_material ON inbound_raw(material_name);
CREATE INDEX IF NOT EXISTS idx_outbound_raw_date ON outbound_raw(date);
CREATE INDEX IF NOT EXISTS idx_outbound_raw_material ON outbound_raw(material_name);
CREATE INDEX IF NOT EXISTS idx_aux_inbound_date ON aux_inbound(date);
CREATE INDEX IF NOT EXISTS idx_aux_outbound_date ON aux_outbound(date);
CREATE INDEX IF NOT EXISTS idx_product_inbound_date ON product_inbound(date);
CREATE INDEX IF NOT EXISTS idx_product_outbound_date ON product_outbound(date);
CREATE INDEX IF NOT EXISTS idx_finance_records_date ON finance_records(date);
CREATE INDEX IF NOT EXISTS idx_finance_records_type ON finance_records(type);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inbound_raw_updated_at BEFORE UPDATE ON inbound_raw FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outbound_raw_updated_at BEFORE UPDATE ON outbound_raw FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aux_inbound_updated_at BEFORE UPDATE ON aux_inbound FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aux_outbound_updated_at BEFORE UPDATE ON aux_outbound FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_inbound_updated_at BEFORE UPDATE ON product_inbound FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_outbound_updated_at BEFORE UPDATE ON product_outbound FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_recipe_updated_at BEFORE UPDATE ON product_recipe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_records_updated_at BEFORE UPDATE ON finance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
