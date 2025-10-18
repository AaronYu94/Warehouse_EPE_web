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

// 创建连接池
const pool = new Pool(dbConfig);

// 测试数据库连接
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 初始化数据库表
async function initDatabase() {
  try {
    // 读取SQL文件
    const schemaPath = path.join(__dirname, 'schema', 'schema_postgres.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // 执行SQL
    await pool.query(schemaSQL);
    console.log('Database tables initialized successfully');
    
    // 插入默认用户
    await insertDefaultUsers();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// 插入默认用户
async function insertDefaultUsers() {
  const bcrypt = require('bcryptjs');
  
  // 使用更安全的默认密码
  const defaultUsers = [
    { 
      username: 'admin', 
      password: await bcrypt.hash('Admin@2024!Secure', 12), 
      role: 'admin' 
    },
    { 
      username: 'operator', 
      password: await bcrypt.hash('Operator@2024!Safe', 12), 
      role: 'operator' 
    },
    { 
      username: 'viewer', 
      password: await bcrypt.hash('Viewer@2024!Read', 12), 
      role: 'viewer' 
    }
  ];

  for (const user of defaultUsers) {
    try {
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
        [user.username, user.password, user.role]
      );
      console.log(`✅ 用户 ${user.username} 已创建（使用安全密码）`);
    } catch (error) {
      console.log('User already exists or error:', user.username);
    }
  }
  
  console.log('\n🔐 默认安全密码:');
  console.log('管理员: admin / Admin@2024!Secure');
  console.log('操作员: operator / Operator@2024!Safe');
  console.log('查看者: viewer / Viewer@2024!Read');
  console.log('\n⚠️  生产环境部署前请立即修改这些密码！');
}

// 数据库查询方法
const db = {
  // 查询单条记录
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // 获取客户端
  async getClient() {
    return await pool.connect();
  },

  // 关闭连接池
  async close() {
    await pool.end();
  }
};

// 如果直接运行此文件，初始化数据库
if (require.main === module) {
  initDatabase().then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  }).catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { db, initDatabase };
