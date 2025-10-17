-- 1. 原料入库表
CREATE TABLE inbound_raw (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 入库日期
  code          VARCHAR(50) NOT NULL,     -- 物料编码
  name          VARCHAR(200)NOT NULL,     -- 物料名称
  container     VARCHAR(50) NOT NULL,     -- 柜号
  qty           NUMERIC(12,3) NOT NULL,   -- 数量
  note          TEXT,                     -- 备注
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 辅料入库表
CREATE TABLE inbound_aux (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 入库日期
  code          VARCHAR(50) NOT NULL,     -- 辅料编码
  name          VARCHAR(200)NOT NULL,     -- 辅料名称
  container     VARCHAR(50) NOT NULL,     -- 柜号
  qty           NUMERIC(12,3) NOT NULL,   -- 数量
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

-- 4. 辅料出库表
CREATE TABLE outbound_aux (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 出库日期
  container     VARCHAR(50) NOT NULL,     -- 柜号
  code          VARCHAR(50) NOT NULL,     -- 辅料编码
  name          VARCHAR(200)NOT NULL,     -- 辅料名称
  qty           NUMERIC(12,3) NOT NULL,   -- 数量
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 库存流水表（台账）
CREATE TABLE inventory_ledger (
  id            SERIAL PRIMARY KEY,
  date          DATE       NOT NULL,      -- 事务日期
  item_code     VARCHAR(50) NOT NULL,     -- 物料/辅料编码
  transaction_type VARCHAR(10) NOT NULL  -- 事务类型：IN/OUT
    CHECK (transaction_type IN ('IN','OUT')),
  qty           NUMERIC(12,3) NOT NULL,   -- 变动数量
  reference     VARCHAR(100),              -- 参考（柜号/订单号等）
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 财务利润表
CREATE TABLE profit_report (
  id            SERIAL PRIMARY KEY,
  container     VARCHAR(50) NOT NULL,     -- 柜号
  product       VARCHAR(200)NOT NULL,     -- 产品名称
  cost_price    NUMERIC(12,4) NOT NULL,   -- 单位成本价
  qty           NUMERIC(12,3) NOT NULL,   -- 数量
  amount        NUMERIC(14,2) NOT NULL,   -- 金额 = cost_price * qty
  tax_amount    NUMERIC(14,2) NOT NULL,   -- 税费
  total_cost    NUMERIC(14,2) NOT NULL,   -- 总费用 = amount + tax_amount
  profit        NUMERIC(14,2) NOT NULL,   -- 利润
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 月度库存统计表
CREATE TABLE monthly_inventory (
  id              SERIAL PRIMARY KEY,
  item_name       VARCHAR(200)NOT NULL,   -- 物料/辅料/产品名称
  period          DATE       NOT NULL,     -- 月度标识（通常填当月第一天）
  beginning_qty   NUMERIC(12,3) NOT NULL,  -- 期初库存
  inbound_qty     NUMERIC(12,3) NOT NULL,  -- 本期入库
  outbound_qty    NUMERIC(12,3) NOT NULL,  -- 本期出库
  ending_qty      NUMERIC(12,3) NOT NULL,  -- 期末库存
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 操作日志表
CREATE TABLE operation_logs (
  id            SERIAL PRIMARY KEY,
  log_time      TIMESTAMPTZ NOT NULL,     -- 操作时间
  user_name     VARCHAR(100)NOT NULL,     -- 操作用户
  module        VARCHAR(100)NOT NULL,     -- 模块名称
  action        VARCHAR(200)NOT NULL      -- 操作描述
);

-- 9. 资本记录表
CREATE TABLE capital_records (
  id              SERIAL PRIMARY KEY,
  category        VARCHAR(100)NOT NULL,   -- 资产类别
  asset_code      VARCHAR(50) NOT NULL,   -- 资产编号
  asset_name      VARCHAR(200)NOT NULL,   -- 资产名称
  value_amount    NUMERIC(14,2) NOT NULL,  -- 资产价值
  purchase_date   DATE       NOT NULL,     -- 购置日期
  note            TEXT,                   -- 备注
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
