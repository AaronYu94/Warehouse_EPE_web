#!/usr/bin/env node

/**
 * Railway数据迁移脚本
 * 将客户SQLite数据迁移到Railway PostgreSQL数据库
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, 'customer-data.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  console.log('请确保在Railway中设置了DATABASE_URL环境变量');
  process.exit(1);
}

console.log('🚀 开始Railway数据迁移...');
console.log('📊 数据源:', SQLITE_DB_PATH);
console.log('🎯 目标:', POSTGRES_URL.replace(/\/\/.*@/, '//***@')); // 隐藏密码

// 检查SQLite文件是否存在
if (!fs.existsSync(SQLITE_DB_PATH)) {
  console.error('❌ 错误: SQLite文件不存在:', SQLITE_DB_PATH);
  console.log('📁 当前目录内容:');
  try {
    const files = fs.readdirSync(path.join(__dirname, '..'));
    console.log(files);
  } catch (err) {
    console.log('无法读取目录:', err.message);
  }
  console.log('⚠️ 跳过SQLite数据迁移，直接创建默认数据');
}

// 连接PostgreSQL
const pgPool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 连接SQLite
const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);

// 迁移统计
let migrationStats = {
  users: 0,
  materials: 0,
  products: 0,
  productMappings: 0,
  errors: 0
};

// 主迁移函数
async function migrateToRailway() {
  try {
    console.log('🔗 连接数据库...');
    
    // 测试PostgreSQL连接
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL连接成功');
    
    // 检查SQLite文件是否存在
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.log('⚠️ SQLite文件不存在，创建默认数据...');
      await createDefaultData();
      return;
    }
    
    // 测试SQLite连接
    try {
      await new Promise((resolve, reject) => {
        sqliteDb.get('SELECT 1', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✅ SQLite连接成功');
    } catch (sqliteError) {
      console.log('⚠️ SQLite连接失败，创建默认数据...');
      console.log('SQLite错误:', sqliteError.message);
      await createDefaultData();
      return;
    }
    
    // 检查SQLite数据库是否有必要的表
    try {
      await new Promise((resolve, reject) => {
        sqliteDb.get('SELECT name FROM sqlite_master WHERE type="table" AND name="users"', (err, row) => {
          if (err) reject(err);
          else if (!row) {
            reject(new Error('users表不存在'));
          } else {
            resolve();
          }
        });
      });
      console.log('✅ SQLite数据库表结构正常');
    } catch (tableError) {
      console.log('⚠️ SQLite数据库表结构不完整，创建默认数据...');
      console.log('表结构错误:', tableError.message);
      await createDefaultData();
      return;
    }
    
    // 开始迁移
    console.log('\n📦 开始数据迁移...');
    
    // 1. 迁移用户数据
    await migrateUsers();
    
    // 2. 迁移物料数据
    await migrateMaterials();
    
    // 3. 迁移产品数据
    await migrateProducts();
    
    // 4. 迁移产品配方数据
    await migrateProductMappings();
    
    // 5. 创建安全密码
    await createSecurePasswords();
    
    console.log('\n🎉 Railway数据迁移完成！');
    console.log('📊 迁移统计:');
    console.log(`   ✅ 用户: ${migrationStats.users}`);
    console.log(`   ✅ 物料: ${migrationStats.materials}`);
    console.log(`   ✅ 产品: ${migrationStats.products}`);
    console.log(`   ✅ 配方: ${migrationStats.productMappings}`);
    console.log(`   ❌ 错误: ${migrationStats.errors}`);
    
    console.log('\n🔐 新的安全密码:');
    console.log('   管理员: admin / Admin@2024!Secure');
    console.log('   操作员: operator / Operator@2024!Safe');
    console.log('   查看者: viewer / Viewer@2024!Read');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    migrationStats.errors++;
  } finally {
    await pgPool.end();
    sqliteDb.close();
    console.log('\n🔚 数据库连接已关闭');
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
          // 使用UUID作为新ID
          await pgPool.query(
            `INSERT INTO users (id, username, password, role, created_at, updated_at) 
             VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW()) 
             ON CONFLICT (username) DO UPDATE SET 
             password = EXCLUDED.password, 
             role = EXCLUDED.role,
             updated_at = NOW()`,
            [row.username, row.password, row.role]
          );
          migrationStats.users++;
        }
        console.log(`   ✅ 迁移了 ${rows.length} 个用户`);
        resolve();
      } catch (error) {
        console.error('   ❌ 用户迁移失败:', error);
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
        // 创建物料参考表
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
        console.log(`   ✅ 迁移了 ${rows.length} 个物料`);
        resolve();
      } catch (error) {
        console.error('   ❌ 物料迁移失败:', error);
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
        // 创建产品参考表
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
        console.log(`   ✅ 迁移了 ${rows.length} 个产品`);
        resolve();
      } catch (error) {
        console.error('   ❌ 产品迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 迁移产品配方数据
async function migrateProductMappings() {
  console.log('🔗 迁移产品配方数据...');
  
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM product_aux_mapping', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // 创建产品配方表
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS product_recipe_mappings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_name VARCHAR(200) NOT NULL,
            product_code VARCHAR(50) NOT NULL,
            material_name VARCHAR(200) NOT NULL,
            material_code VARCHAR(50) NOT NULL,
            quantity DECIMAL(10,3) DEFAULT 0,
            unit VARCHAR(20) NOT NULL,
            material_type VARCHAR(20) DEFAULT 'raw',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        
        for (const row of rows) {
          await pgPool.query(
            `INSERT INTO product_recipe_mappings 
             (product_name, product_code, material_name, material_code, quantity, unit, material_type) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              row.product_name, 
              row.product_code, 
              row.material_name, 
              row.material_code, 
              row.quantity || 0, 
              row.unit, 
              row.material_type || 'raw'
            ]
          );
          migrationStats.productMappings++;
        }
        console.log(`   ✅ 迁移了 ${rows.length} 个产品配方`);
        resolve();
      } catch (error) {
        console.error('   ❌ 产品配方迁移失败:', error);
        migrationStats.errors++;
        reject(error);
      }
    });
  });
}

// 创建安全密码
async function createSecurePasswords() {
  console.log('🔐 创建安全密码...');
  
  const bcrypt = require('bcryptjs');
  
  const securePasswords = {
    admin: 'Admin@2024!Secure',
    operator: 'Operator@2024!Safe',
    viewer: 'Viewer@2024!Read'
  };
  
  for (const [username, password] of Object.entries(securePasswords)) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await pgPool.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, username]
      );
      
      console.log(`   ✅ 用户 ${username} 密码已更新为安全密码`);
    } catch (error) {
      console.error(`   ❌ 更新用户 ${username} 密码失败:`, error);
      migrationStats.errors++;
    }
  }
}

// 创建默认数据
async function createDefaultData() {
  console.log('📦 创建默认数据...');
  
  try {
    // 启用UUID扩展
    await pgPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // 创建用户表
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'operator',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // 创建物料表
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        min_stock_level NUMERIC(12,3) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // 创建产品表
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // 创建默认用户
    const bcrypt = require('bcryptjs');
    const defaultUsers = [
      { username: 'admin', password: await bcrypt.hash('Admin@2024!Secure', 12), role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('Operator@2024!Safe', 12), role: 'operator' },
      { username: 'viewer', password: await bcrypt.hash('Viewer@2024!Read', 12), role: 'viewer' }
    ];
    
    for (const user of defaultUsers) {
      await pgPool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
        [user.username, user.password, user.role]
      );
      console.log(`✅ 用户 ${user.username} 已创建`);
    }
    
    console.log('✅ 默认数据创建完成');
    
  } catch (error) {
    console.error('❌ 创建默认数据失败:', error);
    throw error;
  }
}

// 运行迁移
if (require.main === module) {
  migrateToRailway().catch(console.error);
}

module.exports = { migrateToRailway };
