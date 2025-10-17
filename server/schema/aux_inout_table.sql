-- 辅料出入库表
CREATE TABLE aux_inout (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,           -- 日期
  code            VARCHAR(50) NOT NULL,    -- 辅料编码
  container       VARCHAR(50) NOT NULL,    -- 柜号
  quantity        NUMERIC(12,3) NOT NULL,  -- 数量
  declaration_no  VARCHAR(100),            -- 申报单号
  destination     VARCHAR(200),            -- 去向/客户
  type            VARCHAR(10) NOT NULL,    -- 类型：in/out
  quality_report_path VARCHAR(500),        -- 质检表格PDF文件路径
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (code) REFERENCES material_dict(code)
); 