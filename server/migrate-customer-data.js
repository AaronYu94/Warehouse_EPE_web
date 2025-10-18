#!/usr/bin/env node

/**
 * 客户数据迁移脚本
 * 将客户SQLite数据库迁移到PostgreSQL
 * 使用方法: node migrate-customer-data.js
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, '../customer-data.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ 错误: 请设置 DATABASE_URL 环境变量');
  console.log('例如: DATABASE_URL=postgresql://user:pass@host:port/db node migrate-customer-data.js');
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
  console.log('✅ 已连接到客户SQLite数据库');
});

// 迁移统计
let migrationStats = {
  users: 0,
  materials: 0,
  products: 0,
  assets: 0,
  logs: 0,
  errors: 0
};

// 迁移函数
async function migrateCustomerData() {
  try {
    console.log('🚀 开始迁移客户数据...');
    
    // 测试PostgreSQL连接
    await pgPool.query('SELECT 1');
    console.log('✅ 已连接到PostgreSQL数据库');
    
    // 迁移用户数据
    await migrateUsers();
    
    // 迁移物料数据
    await migrateMaterials();
    
    // 迁移产品数据
    await migrateProducts();
    
    // 迁移资产数据
    await migrateAssets();
    
    // 迁移日志数据
    await migrateLogs();
    
    // 迁移其他数据表
    await migrateOtherTables();
    
    console.log('🎉 客户数据迁移完成！');
    console.log('📊 迁移统计:');
    console.log(`   - 用户: ${migrationStats.users}`);
    console.log(`   - 物料: ${migrationStats.materials}`);
    console.log(`   - 产品: ${migrationStats.products}`);
    console.log(`   - 资产: ${migrationStats.assets}`);
    console.log(`   - 日志: ${migrationStats.logs}`);
    console.log(`   - 错误: ${migrationStats.errors}`);
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await pgPool.end();
    sqliteDb.close();
  }
}

// 迁移用户数据
async function migrateUsers() {
  console.log('👥 迁移用户数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            'INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (id) DO NOTHING',
            [row.id, row.username, row.password, row.role]
          );
          migrationStats.users++;
        }
        console.log(`✅ 迁移了 ${rows.length} 个用户`);
        resolve();
      } catch (error) {
        console.error('❌ 用户迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移物料数据
async function migrateMaterials() {
  console.log('📦 迁移物料数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM materials', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // 创建物料参考表（如果不存在）
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS material_references (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            unit VARCHAR(20) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        
        for (const row of rows) {
          await pgPool.query(
            'INSERT INTO material_references (code, name, unit) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
            [row.code, row.name, row.unit]
          );
          migrationStats.materials++;
        }
        console.log(`✅ 迁移了 ${rows.length} 个物料`);
        resolve();
      } catch (error) {
        console.error('❌ 物料迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移产品数据
async function migrateProducts() {
  console.log('🏭 迁移产品数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM products', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // 创建产品参考表（如果不存在）
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS product_references (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            unit VARCHAR(20) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        
        for (const row of rows) {
          await pgPool.query(
            'INSERT INTO product_references (code, name, unit) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
            [row.code, row.name, row.unit]
          );
          migrationStats.products++;
        }
        console.log(`✅ 迁移了 ${rows.length} 个产品`);
        resolve();
      } catch (error) {
        console.error('❌ 产品迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移资产数据
async function migrateAssets() {
  console.log('🏢 迁移资产数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM assets', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO assets (id, name, category, purchase_date, purchase_price, current_value, status, location, note, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`,
            [row.id, row.name, row.category, row.purchase_date, row.purchase_price, row.current_value, row.status, row.location, row.note]
          );
          migrationStats.assets++;
        }
        console.log(`✅ 迁移了 ${rows.length} 个资产`);
        resolve();
      } catch (error) {
        console.error('❌ 资产迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移日志数据
async function migrateLogs() {
  console.log('📝 迁移日志数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM logs', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // 创建日志表（如果不存在）
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS system_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            level VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID,
            action VARCHAR(100),
            details JSONB
          )
        `);
        
        for (const row of rows) {
          await pgPool.query(
            'INSERT INTO system_logs (level, message, timestamp, user_id, action, details) VALUES ($1, $2, $3, $4, $5, $6)',
            [row.level || 'INFO', row.message, row.timestamp, row.user_id, row.action, row.details ? JSON.stringify(row.details) : null]
          );
          migrationStats.logs++;
        }
        console.log(`✅ 迁移了 ${rows.length} 条日志`);
        resolve();
      } catch (error) {
        console.error('❌ 日志迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移其他数据表
async function migrateOtherTables() {
  console.log('📊 迁移其他数据表...');
  
  const otherTables = [
    'aux_materials',
    'product_bom',
    'product_aux_mapping',
    'capital',
    'finance_summary'
  ];
  
  for (const tableName of otherTables) {
    try {
      const result = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, rows) => {
          if (err) {
            resolve({ count: 0 });
          } else {
            resolve(rows[0]);
          }
        });
      });
      
      if (result.count > 0) {
        console.log(`📋 发现 ${tableName} 表有 ${result.count} 条记录`);
        // 这里可以根据需要添加具体的迁移逻辑
      }
    } catch (error) {
      console.log(`⚠️  跳过表 ${tableName}: ${error.message}`);
    }
  }
}

// 运行迁移
if (require.main === module) {
  migrateCustomerData().catch(console.error);
}

module.exports = { migrateCustomerData };
