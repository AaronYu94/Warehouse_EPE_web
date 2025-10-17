-- 成品出库表
CREATE TABLE product_outbound (
  id                    SERIAL PRIMARY KEY,
  date                  DATE       NOT NULL,      -- 出库日期
  product_code          VARCHAR(50) NOT NULL,     -- 产品编码
  product_name          VARCHAR(200)NOT NULL,     -- 产品名称
  container             VARCHAR(50) NOT NULL,     -- 柜号
  quantity              NUMERIC(12,3) NOT NULL,   -- 数量
  destination           VARCHAR(200),              -- 目的地/客户
  customs_fee           NUMERIC(12,2) DEFAULT 0,  -- 报关费
  logistics_fee         NUMERIC(12,2) DEFAULT 0,  -- 物流费
  export_license_no     VARCHAR(100),             -- 出口许可证号
  destination_country   VARCHAR(100),             -- 目的地国家
  hs_code               VARCHAR(50),              -- HS编码
  fob_value             NUMERIC(14,2),            -- FOB价值
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 修改原料出库表，移除出口相关字段
ALTER TABLE raw_inout DROP COLUMN IF EXISTS customs_fee;
ALTER TABLE raw_inout DROP COLUMN IF EXISTS logistics_fee;
ALTER TABLE raw_inout DROP COLUMN IF EXISTS export_license_no;
ALTER TABLE raw_inout DROP COLUMN IF EXISTS destination_country;
ALTER TABLE raw_inout DROP COLUMN IF EXISTS hs_code;
ALTER TABLE raw_inout DROP COLUMN IF EXISTS fob_value; 