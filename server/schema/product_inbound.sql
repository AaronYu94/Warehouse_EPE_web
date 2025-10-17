-- 成品入库表
CREATE TABLE product_inbound (
  id                    SERIAL PRIMARY KEY,
  date                  DATE       NOT NULL,      -- 入库日期
  product_code          VARCHAR(50) NOT NULL,     -- 产品编码
  product_name          VARCHAR(200)NOT NULL,     -- 产品名称
  container             VARCHAR(50) NOT NULL,     -- 柜号
  quantity              NUMERIC(12,3) NOT NULL,   -- 数量
  production_batch      VARCHAR(100),             -- 生产批次
  quality_check         VARCHAR(50) DEFAULT 'PASS', -- 质检状态：PASS/FAIL
  inspector             VARCHAR(100),             -- 质检员
  quality_report_path   VARCHAR(500),            -- 质检表格PDF文件路径
  notes                 TEXT,                    -- 备注
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (product_code) REFERENCES products (code)
); 