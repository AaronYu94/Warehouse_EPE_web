const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

async function fixDatabase() {
  try {
    console.log('🔧 开始修复数据库表结构...');
    
    // 1. 启用UUID扩展
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID扩展已启用');
    
    // 2. 删除可能存在的错误表
    const tablesToDrop = [
      'inbound_aux', 'outbound_aux', 'inventory_ledger', 
      'profit_report', 'monthly_inventory', 'operation_logs', 'capital_records'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`🗑️  已删除表: ${table}`);
      } catch (error) {
        console.log(`⚠️  表 ${table} 不存在或无法删除:`, error.message);
      }
    }
    
    // 3. 读取并执行正确的schema
    const schemaPath = path.join(__dirname, 'schema', 'schema_postgres.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSQL);
    console.log('✅ 数据库表结构已修复');
    
    // 4. 检查表是否存在
    const requiredTables = [
      'users', 'materials', 'products', 'product_recipe_mappings',
      'inbound_raw', 'outbound_raw', 'aux_inbound', 'aux_outbound',
      'product_inbound', 'product_outbound', 'assets'
    ];
    
    console.log('\n🔍 检查表是否存在:');
    for (const table of requiredTables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: 存在 (${result.rows[0].count} 条记录)`);
      } catch (error) {
        console.log(`❌ ${table}: 不存在 - ${error.message}`);
      }
    }
    
    console.log('\n🎉 数据库修复完成！');
    
  } catch (error) {
    console.error('❌ 数据库修复失败:', error);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  fixDatabase().then(() => {
    console.log('数据库修复脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('数据库修复脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { fixDatabase };
