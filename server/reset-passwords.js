#!/usr/bin/env node

/**
 * 重置用户密码脚本
 * 将用户密码重置为新的安全密码
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

const pgPool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetPasswords() {
  try {
    console.log('🔐 开始重置用户密码...');
    
    // 新的安全密码
    const newPasswords = {
      admin: 'Admin@2024!Secure',
      operator: 'Operator@2024!Safe',
      viewer: 'Viewer@2024!Read'
    };
    
    for (const [username, password] of Object.entries(newPasswords)) {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await pgPool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE username = $2',
        [hashedPassword, username]
      );
      
      console.log(`✅ 用户 ${username} 密码已重置`);
    }
    
    console.log('🎉 所有用户密码重置完成！');
    console.log('📋 新的登录信息：');
    console.log('管理员: admin / Admin@2024!Secure');
    console.log('操作员: operator / Operator@2024!Safe');
    console.log('查看者: viewer / Viewer@2024!Read');
    
  } catch (error) {
    console.error('❌ 密码重置失败:', error);
  } finally {
    await pgPool.end();
  }
}

if (require.main === module) {
  resetPasswords().catch(console.error);
}

module.exports = { resetPasswords };
