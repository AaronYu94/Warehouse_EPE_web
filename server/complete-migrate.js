#!/usr/bin/env node

/**
 * 完整数据迁移脚本
 * 迁移所有可能的业务数据到PostgreSQL
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, 'customer-data.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

console.log('🚀 开始完整数据迁移...');
console.log('📊 数据源:', SQLITE_DB_PATH);
console.log('🎯 目标:', POSTGRES_URL.replace(/\/\/.*@/, '//***@'));

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
  rawInout: 0,
  auxInout: 0,
  productInbound: 0,
  productOutbound: 0,
  rawOut: 0,
  auxOutbound: 0,
  stock: 0,
  assets: 0,
  errors: 0
};

// 主迁移函数
async function completeMigrate() {
  try {
    console.log('🔗 连接数据库...');
    
    // 测试PostgreSQL连接
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL连接成功');
    
    // 测试SQLite连接
    await new Promise((resolve, reject) => {
      sqliteDb.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ SQLite连接成功');
    
    // 启用UUID扩展
    await pgPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    console.log('\n📦 开始完整数据迁移...');
    
    // 1. 迁移用户数据
    await migrateUsers();
    
    // 2. 迁移物料数据
    await migrateMaterials();
    
    // 3. 迁移产品数据
    await migrateProducts();
    
    // 4. 迁移产品配方数据
    await migrateProductMappings();
    
    // 5. 迁移原料入库数据
    await migrateRawInout();
    
    // 6. 迁移辅料入库数据
    await migrateAuxInout();
    
    // 7. 迁移产品入库数据
    await migrateProductInbound();
    
    // 8. 迁移产品出库数据
    await migrateProductOutbound();
    
    // 9. 迁移原料出库数据
    await migrateRawOut();
    
    // 10. 迁移辅料出库数据
    await migrateAuxOutbound();
    
    // 11. 迁移库存数据
    await migrateStock();
    
    // 12. 迁移资产数据
    await migrateAssets();
    
    console.log('\n✅ 完整数据迁移完成');
    console.log('📊 迁移统计:', migrationStats);
    
  } catch (error) {
    console.error('❌ 数据迁移过程中发生错误:', error);
    migrationStats.errors++;
  } finally {
    sqliteDb.close();
    await pgPool.end();
    console.log('🔚 数据库连接已关闭');
  }
}

// 迁移用户数据
async function migrateUsers() {
  console.log('👥 迁移用户数据...');
  const users = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await pgPool.query(
        'INSERT INTO users (username, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, updated_at = EXCLUDED.updated_at',
        [user.username, hashedPassword, user.role, user.created_at, user.updated_at]
      );
      migrationStats.users++;
    } catch (error) {
      console.error(`❌ 迁移用户 ${user.username} 失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.users} 个用户`);
}

// 迁移物料数据
async function migrateMaterials() {
  console.log('📦 迁移物料数据...');
  const materials = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM materials', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const material of materials) {
    try {
      await pgPool.query(
        'INSERT INTO materials (code, name, unit, min_stock_level, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, unit = EXCLUDED.unit, min_stock_level = EXCLUDED.min_stock_level, updated_at = EXCLUDED.updated_at',
        [material.code, material.name, material.unit, material.min_stock_level || 0, material.created_at, material.updated_at]
      );
      migrationStats.materials++;
    } catch (error) {
      console.error(`❌ 迁移物料 ${material.code} 失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.materials} 个物料`);
}

// 迁移产品数据
async function migrateProducts() {
  console.log('🏭 迁移产品数据...');
  const products = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM products', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const product of products) {
    try {
      await pgPool.query(
        'INSERT INTO products (code, name, unit, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, unit = EXCLUDED.unit, updated_at = EXCLUDED.updated_at',
        [product.code, product.name, product.unit, product.created_at, product.updated_at]
      );
      migrationStats.products++;
    } catch (error) {
      console.error(`❌ 迁移产品 ${product.code} 失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.products} 个产品`);
}

// 迁移产品配方数据
async function migrateProductMappings() {
  console.log('🔗 迁移产品配方数据...');
  const mappings = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM product_aux_mapping', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const mapping of mappings) {
    try {
      await pgPool.query(
        'INSERT INTO product_recipe_mappings (product_name, product_code, material_name, material_code, quantity, unit, material_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (product_code, material_code) DO UPDATE SET quantity = EXCLUDED.quantity, unit = EXCLUDED.unit, updated_at = EXCLUDED.updated_at',
        [mapping.product_name, mapping.product_code, mapping.material_name, mapping.material_code, mapping.quantity || 0, mapping.unit, mapping.material_type || 'raw', mapping.created_at, mapping.updated_at]
      );
      migrationStats.productMappings++;
    } catch (error) {
      console.error(`❌ 迁移产品配方失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.productMappings} 个产品配方`);
}

// 迁移原料入库数据
async function migrateRawInout() {
  console.log('📥 迁移原料入库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM raw_inout', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO inbound_raw (date, material_name, declaration_no, container, quantity, quality_report_path, note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [record.date, record.material_name, record.declaration_no, record.container, record.quantity, record.quality_report_path, record.note, record.created_at, record.updated_at]
      );
      migrationStats.rawInout++;
    } catch (error) {
      console.error(`❌ 迁移原料入库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.rawInout} 条原料入库记录`);
}

// 迁移辅料入库数据
async function migrateAuxInout() {
  console.log('📥 迁移辅料入库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM aux_inout', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO aux_inbound (date, material_name, container, quantity, supplier, note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [record.date, record.material_name, record.container, record.quantity, record.supplier, record.note, record.created_at, record.updated_at]
      );
      migrationStats.auxInout++;
    } catch (error) {
      console.error(`❌ 迁移辅料入库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.auxInout} 条辅料入库记录`);
}

// 迁移产品入库数据
async function migrateProductInbound() {
  console.log('📥 迁移产品入库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM product_inbound', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO product_inbound (date, product_code, product_name, container, quantity, production_batch, quality_check, inspector, quality_report_path, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [record.date, record.product_code, record.product_name, record.container, record.quantity, record.production_batch, record.quality_check, record.inspector, record.quality_report_path, record.notes, record.created_at, record.updated_at]
      );
      migrationStats.productInbound++;
    } catch (error) {
      console.error(`❌ 迁移产品入库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.productInbound} 条产品入库记录`);
}

// 迁移产品出库数据
async function migrateProductOutbound() {
  console.log('📤 迁移产品出库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM product_outbound', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO product_outbound (date, product_code, product_name, container, quantity, customer, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [record.date, record.product_code, record.product_name, record.container, record.quantity, record.customer, record.notes, record.created_at, record.updated_at]
      );
      migrationStats.productOutbound++;
    } catch (error) {
      console.error(`❌ 迁移产品出库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.productOutbound} 条产品出库记录`);
}

// 迁移原料出库数据
async function migrateRawOut() {
  console.log('📤 迁移原料出库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM raw_out', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO outbound_raw (date, container, material_name, quantity, customer, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [record.date, record.container, record.material_name, record.quantity, record.customer, record.created_at, record.updated_at]
      );
      migrationStats.rawOut++;
    } catch (error) {
      console.error(`❌ 迁移原料出库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.rawOut} 条原料出库记录`);
}

// 迁移辅料出库数据
async function migrateAuxOutbound() {
  console.log('📤 迁移辅料出库数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM aux_outbound', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO aux_outbound (date, material_name, container, quantity, customer, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [record.date, record.material_name, record.container, record.quantity, record.customer, record.notes, record.created_at, record.updated_at]
      );
      migrationStats.auxOutbound++;
    } catch (error) {
      console.error(`❌ 迁移辅料出库记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.auxOutbound} 条辅料出库记录`);
}

// 迁移库存数据
async function migrateStock() {
  console.log('📊 迁移库存数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM stock', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO stock (code, name, unit, current_qty, actual_qty, difference, note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [record.code, record.name, record.unit, record.current_qty, record.actual_qty, record.difference, record.note, record.created_at, record.updated_at]
      );
      migrationStats.stock++;
    } catch (error) {
      console.error(`❌ 迁移库存记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.stock} 条库存记录`);
}

// 迁移资产数据
async function migrateAssets() {
  console.log('🏢 迁移资产数据...');
  const records = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM assets', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const record of records) {
    try {
      await pgPool.query(
        'INSERT INTO assets (name, category, purchase_date, purchase_price, current_value, status, location, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [record.name, record.category, record.purchase_date, record.purchase_price, record.current_value, record.status, record.location, record.notes, record.created_at, record.updated_at]
      );
      migrationStats.assets++;
    } catch (error) {
      console.error(`❌ 迁移资产记录失败:`, error.message);
      migrationStats.errors++;
    }
  }
  console.log(`   ✅ 迁移了 ${migrationStats.assets} 条资产记录`);
}

// 运行迁移
if (require.main === module) {
  completeMigrate().catch(console.error);
}

module.exports = { completeMigrate };
