-- 辅料出库表
CREATE TABLE aux_outbound (
  id                    SERIAL PRIMARY KEY,
  date                  DATE       NOT NULL,      -- 出库日期
  aux_code              VARCHAR(50) NOT NULL,     -- 辅料编码
  aux_name              VARCHAR(200)NOT NULL,     -- 辅料名称
  container             VARCHAR(50) NOT NULL,     -- 柜号
  quantity              NUMERIC(12,3) NOT NULL,   -- 数量
  destination           VARCHAR(200),              -- 目的地/客户
  quality_report_path   VARCHAR(500),             -- 质检表格PDF文件路径
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
); 