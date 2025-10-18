#!/usr/bin/env node

/**
 * SQLite到PostgreSQL数据迁移脚本
 * 使用方法: node migrate-to-postgres.js
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, 'warehouse.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ 错误: 请设置 DATABASE_URL 环境变量');
  console.log('例如: DATABASE_URL=postgresql://user:pass@host:port/db node migrate-to-postgres.js');
  process.exit(1);
}

// 连接PostgreSQL
const pgPool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 连接SQLite
const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
  if (err) {
    console.error('❌ SQLite连接失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 已连接到SQLite数据库');
});

// 迁移函数
async function migrateData() {
  try {
    console.log('🚀 开始数据迁移...');
    
    // 测试PostgreSQL连接
    await pgPool.query('SELECT 1');
    console.log('✅ 已连接到PostgreSQL数据库');
    
    // 迁移用户数据
    await migrateUsers();
    
    // 迁移原料入库数据
    await migrateRawInbound();
    
    // 迁移原料出库数据
    await migrateRawOutbound();
    
    // 迁移辅料数据
    await migrateAuxData();
    
    // 迁移成品数据
    await migrateProductData();
    
    // 迁移财务数据
    await migrateFinanceData();
    
    console.log('🎉 数据迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await pgPool.end();
    sqliteDb.close();
  }
}

// 迁移用户数据
async function migrateUsers() {
  console.log('📝 迁移用户数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            'INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
            [row.id, row.username, row.password, row.role, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 个用户`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 迁移原料入库数据
async function migrateRawInbound() {
  console.log('📦 迁移原料入库数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM inbound_raw', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO inbound_raw (id, date, material_name, declaration_no, container, quantity, quality_report_path, note, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.date, row.material_name, row.declaration_no, row.container, row.quantity, row.quality_report_path, row.note, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 条原料入库记录`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 迁移原料出库数据
async function migrateRawOutbound() {
  console.log('📤 迁移原料出库数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM outbound_raw', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO outbound_raw (id, date, container, material_name, quantity, customer, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.date, row.container, row.material_name, row.quantity, row.customer, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 条原料出库记录`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 迁移辅料数据
async function migrateAuxData() {
  console.log('🔧 迁移辅料数据...');
  
  // 辅料入库
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM aux_inbound', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO aux_inbound (id, date, material_name, container, quantity, supplier, note, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.date, row.material_name, row.container, row.quantity, row.supplier, row.note, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 条辅料入库记录`);
        
        // 辅料出库
        sqliteDb.all('SELECT * FROM aux_outbound', async (err, outboundRows) => {
          if (err) {
            reject(err);
            return;
          }
          
          try {
            for (const row of outboundRows) {
              await pgPool.query(
                `INSERT INTO aux_outbound (id, date, container, material_name, quantity, purpose, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
                [row.id, row.date, row.container, row.material_name, row.quantity, row.purpose, row.created_at, row.updated_at]
              );
            }
            console.log(`✅ 迁移了 ${outboundRows.length} 条辅料出库记录`);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 迁移成品数据
async function migrateProductData() {
  console.log('🏭 迁移成品数据...');
  
  // 成品入库
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM product_inbound', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO product_inbound (id, date, product_name, batch_no, quantity, quality_grade, note, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.date, row.product_name, row.batch_no, row.quantity, row.quality_grade, row.note, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 条成品入库记录`);
        
        // 成品出库
        sqliteDb.all('SELECT * FROM product_outbound', async (err, outboundRows) => {
          if (err) {
            reject(err);
            return;
          }
          
          try {
            for (const row of outboundRows) {
              await pgPool.query(
                `INSERT INTO product_outbound (id, date, product_name, batch_no, quantity, customer, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
                [row.id, row.date, row.product_name, row.batch_no, row.quantity, row.customer, row.created_at, row.updated_at]
              );
            }
            console.log(`✅ 迁移了 ${outboundRows.length} 条成品出库记录`);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 迁移财务数据
async function migrateFinanceData() {
  console.log('💰 迁移财务数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM finance_records', async (err, rows) => {
      if (err) {
        // 如果表不存在，跳过
        console.log('⚠️  财务数据表不存在，跳过');
        resolve();
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO finance_records (id, date, type, category, amount, description, reference_id, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.date, row.type, row.category, row.amount, row.description, row.reference_id, row.created_at, row.updated_at]
          );
        }
        console.log(`✅ 迁移了 ${rows.length} 条财务记录`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 运行迁移
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };
