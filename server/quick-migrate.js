#!/usr/bin/env node

/**
 * 快速客户数据迁移脚本
 * 专门处理客户数据库中的物料和产品数据
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, '../customer-data.db');
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/warehouse_db';

console.log('🚀 开始快速迁移客户数据...');

// 连接PostgreSQL
const pgPool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 连接SQLite
const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);

async function quickMigrate() {
  try {
    // 测试连接
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL连接成功');
    
    // 创建物料参考表
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS material_references (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // 创建产品参考表
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS product_references (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // 迁移物料数据
    const materials = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM materials', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📦 发现 ${materials.length} 个物料`);
    for (const material of materials) {
      await pgPool.query(
        'INSERT INTO material_references (code, name, unit) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
        [material.code, material.name, material.unit]
      );
    }
    console.log('✅ 物料数据迁移完成');
    
    // 迁移产品数据
    const products = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`🏭 发现 ${products.length} 个产品`);
    for (const product of products) {
      await pgPool.query(
        'INSERT INTO product_references (code, name, unit) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
        [product.code, product.name, product.unit]
      );
    }
    console.log('✅ 产品数据迁移完成');
    
    // 迁移用户数据
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`👥 发现 ${users.length} 个用户`);
    for (const user of users) {
      await pgPool.query(
        'INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (id) DO NOTHING',
        [user.id, user.username, user.password, user.role]
      );
    }
    console.log('✅ 用户数据迁移完成');
    
    console.log('🎉 快速迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await pgPool.end();
    sqliteDb.close();
  }
}

// 运行迁移
quickMigrate();
