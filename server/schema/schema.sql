-- 1. 原料入库表
CREATE TABLE inbound_raw (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 进口日期（DDMMYY）
  name          VARCHAR(200)NOT NULL,     -- 产品名称（String）
  container     VARCHAR(50) NOT NULL,     -- 入库柜号（String）
  qty           NUMERIC(12,3) NOT NULL,   -- 数量（string now, but it has to be integers）
  note          TEXT,                     -- 备注(String)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- 3. 原料出库表
CREATE TABLE outbound_raw (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 出库日期
  container     VARCHAR(50) NOT NULL,     -- 柜号
  name          VARCHAR(200)NOT NULL,     -- 物料名称
  qty           NUMERIC(12,3) NOT NULL,   -- 数量
  customer      VARCHAR(200),              -- 客户
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

