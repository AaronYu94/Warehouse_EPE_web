#!/usr/bin/env node

/**
 * 数据库更新脚本
 * 用于更新客户数据库文件并重新迁移数据
 */

const fs = require('fs');
const path = require('path');
const { completeMigrate } = require('./complete-migrate');

// 配置
const SQLITE_DB_PATH = path.join(__dirname, 'customer-data.db');
const BACKUP_PATH = path.join(__dirname, 'customer-data-backup.db');

async function updateDatabase() {
  try {
    console.log('🔄 开始数据库更新流程...');
    
    // 1. 备份现有数据库
    if (fs.existsSync(SQLITE_DB_PATH)) {
      console.log('📦 备份现有数据库...');
      fs.copyFileSync(SQLITE_DB_PATH, BACKUP_PATH);
      console.log('✅ 数据库已备份到:', BACKUP_PATH);
    }
    
    // 2. 检查新数据库文件是否存在
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.log('❌ 错误: 未找到 customer-data.db 文件');
      console.log('请将新的数据库文件放在 server/ 目录下，命名为 customer-data.db');
      return;
    }
    
    // 3. 显示数据库信息
    console.log('📊 新数据库文件信息:');
    const stats = fs.statSync(SQLITE_DB_PATH);
    console.log('- 文件大小:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('- 修改时间:', stats.mtime.toISOString());
    
    // 4. 执行数据迁移
    console.log('🚀 开始数据迁移...');
    await completeMigrate();
    
    console.log('✅ 数据库更新完成！');
    
  } catch (error) {
    console.error('❌ 数据库更新失败:', error);
    
    // 恢复备份
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 恢复数据库备份...');
      fs.copyFileSync(BACKUP_PATH, SQLITE_DB_PATH);
      console.log('✅ 数据库已恢复');
    }
  }
}

// 运行更新
if (require.main === module) {
  updateDatabase().catch(console.error);
}

module.exports = { updateDatabase };
