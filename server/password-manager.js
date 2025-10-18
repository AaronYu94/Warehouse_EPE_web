#!/usr/bin/env node

/**
 * 密码管理工具
 * 用于生成安全密码和更新用户密码
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// 密码生成器
class PasswordManager {
  constructor() {
    this.saltRounds = 12; // bcrypt盐轮数
  }

  // 生成安全密码
  generateSecurePassword(length = 12, options = {}) {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true
    } = options;

    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  // 生成多个密码选项
  generatePasswordOptions(count = 3, length = 12) {
    const options = [];
    for (let i = 0; i < count; i++) {
      options.push(this.generateSecurePassword(length));
    }
    return options;
  }

  // 加密密码
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // 验证密码
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // 检查密码强度
  checkPasswordStrength(password) {
    if (!password) return { score: 0, level: '无', suggestions: ['请输入密码'] };

    let score = 0;
    const suggestions = [];

    // 长度检查
    if (password.length >= 8) score += 1;
    else suggestions.push('密码长度至少8位');

    if (password.length >= 12) score += 1;

    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('包含小写字母');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('包含大写字母');

    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('包含数字');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else suggestions.push('包含特殊字符');

    // 常见密码检查
    const commonPasswords = [
      'password', '123456', 'admin', 'qwerty', 'abc123',
      'password123', 'admin123', '123456789', 'qwerty123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.max(0, score - 2);
      suggestions.push('避免使用常见密码');
    }

    // 重复字符检查
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      suggestions.push('避免重复字符');
    }

    const levels = ['很弱', '弱', '一般', '强', '很强'];
    const level = levels[Math.min(score, 4)];

    return {
      score: Math.max(0, Math.min(score, 5)),
      level,
      suggestions: suggestions.length > 0 ? suggestions : ['密码强度良好']
    };
  }

  // 生成用户友好的密码
  generateUserFriendlyPassword() {
    const adjectives = [
      'Strong', 'Secure', 'Safe', 'Smart', 'Quick', 'Fast', 'Bright', 'Clear'
    ];
    const nouns = [
      'Tiger', 'Eagle', 'Shark', 'Lion', 'Wolf', 'Bear', 'Fox', 'Hawk'
    ];
    const numbers = Math.floor(Math.random() * 9000) + 1000;
    const symbols = ['!', '@', '#', '$', '%', '&', '*'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective}${noun}${numbers}${symbol}`;
  }
}

// 默认安全密码
const DEFAULT_SECURE_PASSWORDS = {
  admin: 'Admin@2024!Secure',
  operator: 'Operator@2024!Safe',
  viewer: 'Viewer@2024!Read'
};

// 更新数据库中的用户密码
async function updateUserPasswords(db) {
  const passwordManager = new PasswordManager();
  
  console.log('🔐 更新用户密码为安全密码...');
  
  for (const [username, newPassword] of Object.entries(DEFAULT_SECURE_PASSWORDS)) {
    try {
      const hashedPassword = await passwordManager.hashPassword(newPassword);
      
      await db.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, username]
      );
      
      console.log(`✅ 用户 ${username} 密码已更新`);
      console.log(`   新密码: ${newPassword}`);
    } catch (error) {
      console.error(`❌ 更新用户 ${username} 密码失败:`, error);
    }
  }
  
  console.log('🎉 所有用户密码已更新为安全密码！');
}

// 生成密码报告
function generatePasswordReport() {
  const passwordManager = new PasswordManager();
  
  console.log('📊 密码安全报告');
  console.log('================');
  
  // 检查默认密码强度
  Object.entries(DEFAULT_SECURE_PASSWORDS).forEach(([user, password]) => {
    const strength = passwordManager.checkPasswordStrength(password);
    console.log(`\n👤 ${user}:`);
    console.log(`   密码: ${password}`);
    console.log(`   强度: ${strength.level} (${strength.score}/5)`);
    console.log(`   建议: ${strength.suggestions.join(', ')}`);
  });
  
  console.log('\n🔒 安全建议:');
  console.log('1. 定期更换密码（建议每3-6个月）');
  console.log('2. 不要在多个系统使用相同密码');
  console.log('3. 启用双因素认证（如果支持）');
  console.log('4. 监控异常登录活动');
}

// 如果直接运行此文件
if (require.main === module) {
  const passwordManager = new PasswordManager();
  
  console.log('🔐 密码管理工具');
  console.log('================\n');
  
  // 生成密码选项
  console.log('🎲 生成的密码选项:');
  const passwordOptions = passwordManager.generatePasswordOptions(5, 12);
  passwordOptions.forEach((password, index) => {
    const strength = passwordManager.checkPasswordStrength(password);
    console.log(`${index + 1}. ${password} (${strength.level})`);
  });
  
  console.log('\n👥 用户友好密码:');
  for (let i = 0; i < 3; i++) {
    const friendlyPassword = passwordManager.generateUserFriendlyPassword();
    const strength = passwordManager.checkPasswordStrength(friendlyPassword);
    console.log(`${i + 1}. ${friendlyPassword} (${strength.level})`);
  }
  
  console.log('\n📋 默认安全密码:');
  Object.entries(DEFAULT_SECURE_PASSWORDS).forEach(([user, password]) => {
    console.log(`${user}: ${password}`);
  });
  
  generatePasswordReport();
}

module.exports = { PasswordManager, updateUserPasswords, DEFAULT_SECURE_PASSWORDS };
