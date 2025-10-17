-- 资本记录表
CREATE TABLE capital (
  id              SERIAL PRIMARY KEY,
  category        VARCHAR(100) NOT NULL,   -- 资产类别
  name            VARCHAR(200) NOT NULL,   -- 资产名称
  purchase_date   DATE NOT NULL,           -- 购买日期
  price           NUMERIC(14,2) NOT NULL,  -- 价格
  quantity        INTEGER NOT NULL,        -- 数量
  supplier        VARCHAR(200),            -- 供应商
  note            TEXT,                    -- 备注
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 操作日志表
CREATE TABLE logs (
  id            SERIAL PRIMARY KEY,
  user          VARCHAR(100) NOT NULL,     -- 操作用户
  action        VARCHAR(100) NOT NULL,     -- 操作类型
  target        VARCHAR(100) NOT NULL,     -- 操作对象
  detail        TEXT,                      -- 详细描述
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 产品表
CREATE TABLE products (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50) UNIQUE NOT NULL,  -- 产品编码
  name          VARCHAR(200) NOT NULL,        -- 产品名称
  description   TEXT,                         -- 产品描述
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 产品配方表
CREATE TABLE product_bom (
  id            SERIAL PRIMARY KEY,
  product_code  VARCHAR(50) NOT NULL,     -- 产品编码
  material_code VARCHAR(50) NOT NULL,     -- 物料编码
  material_type VARCHAR(20) NOT NULL,     -- 物料类型 (raw/aux)
  quantity      NUMERIC(12,3) NOT NULL,   -- 用量
  unit          VARCHAR(20) NOT NULL,     -- 单位
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (product_code) REFERENCES products(code),
  FOREIGN KEY (material_code) REFERENCES material_dict(code)
); 