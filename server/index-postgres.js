const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('./db-postgres');
const { 
  generateToken, 
  verifyToken, 
  requireRole, 
  checkPermission, 
  refreshToken,
  PERMISSIONS 
} = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:1234', 
      'https://warehouse-epe-web.vercel.app',
      'https://warehouse-epe-web.vercel.app/',
      'https://warehouse-epe-web-git-main-aaron-yus-projects.vercel.app',
      'https://warehouse-epe-web-git-main-aaron-yus-projects.vercel.app/',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // 允许所有Vercel域名
    const isVercelDomain = origin && origin.includes('.vercel.app');
    
    if (!origin || allowedOrigins.includes(origin) || isVercelDomain) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 创建uploads目录
let uploadsDir;
if (process.env.NODE_ENV === 'development') {
  uploadsDir = path.join(__dirname, 'uploads');
} else {
  // 在生产环境中使用临时目录
  uploadsDir = path.join(process.cwd(), 'uploads');
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const container = req.body.container || 'unknown';
    const timestamp = Date.now();
    cb(null, `${container}_${timestamp}.pdf`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传PDF文件'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
});

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 调试端点 - 检查JWT配置
app.get('/api/debug/jwt', (req, res) => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'warehouse-epe-production-secret-key-2024-secure';
  
  res.json({
    jwt_secret_set: !!process.env.JWT_SECRET,
    jwt_secret_length: JWT_SECRET.length,
    jwt_secret_preview: JWT_SECRET.substring(0, 10) + '...',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 测试端点 - 验证token
app.get('/api/test-token', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token验证成功',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// 数据库表检查端点
app.get('/api/debug/tables', async (req, res) => {
  try {
    const tables = [
      'users', 'materials', 'products', 'product_recipe_mappings',
      'inbound_raw', 'outbound_raw', 'inbound_aux', 'outbound_aux',
      'product_inbound', 'product_outbound', 'assets'
    ];
    
    const results = {};
    
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = { exists: true, count: result.rows[0].count };
      } catch (error) {
        results[table] = { exists: false, error: error.message };
      }
    }
    
    res.json({
      success: true,
      tables: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 简单测试端点 - 直接返回空数组
app.get('/api/test-simple', (req, res) => {
  res.json({ 
    success: true, 
    message: '简单测试成功',
    data: [],
    timestamp: new Date().toISOString()
  });
});

// 用户认证相关API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }
    
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
    
    const user = result.rows[0];
    console.log('🔐 登录尝试 - 用户:', user.username, '角色:', user.role);
    
    // 验证密码（支持明文密码和加密密码）
    const isValidPassword = user.password === password || 
                           await bcrypt.compare(password, user.password);
    
    console.log('🔐 密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ 密码验证失败');
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
    
    // 生成JWT令牌
    const token = generateToken(user);
    console.log('🔐 生成的Token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔐 JWT_SECRET状态:', process.env.JWT_SECRET ? '已设置' : '使用默认值');
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 刷新令牌
app.post('/api/refresh-token', refreshToken);

// 获取当前用户信息
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: PERMISSIONS[user.role] || []
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 登出（客户端处理，这里只是记录日志）
app.post('/api/logout', verifyToken, (req, res) => {
  console.log(`User ${req.user.username} logged out`);
  res.json({ success: true, message: '登出成功' });
});

// 原料入库API
app.get('/api/raw-inout', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM inbound_raw ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw inbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/raw-inout', verifyToken, checkPermission('data.create'), upload.single('qualityReport'), async (req, res) => {
  try {
    const { date, material_name, declaration_no, container, quantity, note } = req.body;
    const qualityReportPath = req.file ? req.file.filename : null;
    
    const result = await db.query(
      `INSERT INTO inbound_raw (date, material_name, declaration_no, container, quantity, quality_report_path, note) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [date, material_name, declaration_no, container, quantity, qualityReportPath, note]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating raw inbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 原料出库API
app.get('/api/raw-out', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM outbound_raw ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/raw-out', verifyToken, checkPermission('data.create'), async (req, res) => {
  try {
    const { date, container, material_name, quantity, customer } = req.body;
    
    const result = await db.query(
      `INSERT INTO outbound_raw (date, container, material_name, quantity, customer) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, container, material_name, quantity, customer]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating raw outbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 辅料入库API
app.get('/api/aux-inout', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM aux_inbound ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching aux inbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/aux-inout', async (req, res) => {
  try {
    const { date, material_name, container, quantity, supplier, note } = req.body;
    
    const result = await db.query(
      `INSERT INTO aux_inbound (date, material_name, container, quantity, supplier, note) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [date, material_name, container, quantity, supplier, note]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating aux inbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 辅料出库API
app.get('/api/aux-outbound', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM aux_outbound ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching aux outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/aux-outbound', async (req, res) => {
  try {
    const { date, container, material_name, quantity, purpose } = req.body;
    
    const result = await db.query(
      `INSERT INTO aux_outbound (date, container, material_name, quantity, purpose) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, container, material_name, quantity, purpose]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating aux outbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 成品入库API - 临时简化版本
app.get('/api/product-inbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    // 临时返回空数组，避免数据库查询错误
    res.json([]);
  } catch (error) {
    console.error('Error fetching product inbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/product-inbound', async (req, res) => {
  try {
    const { date, product_name, batch_no, quantity, quality_grade, note } = req.body;
    
    const result = await db.query(
      `INSERT INTO product_inbound (date, product_name, batch_no, quantity, quality_grade, note) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [date, product_name, batch_no, quantity, quality_grade, note]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating product inbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 成品出库API - 临时简化版本
app.get('/api/product-outbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    // 临时返回空数组，避免数据库查询错误
    res.json([]);
  } catch (error) {
    console.error('Error fetching product outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/product-outbound', async (req, res) => {
  try {
    const { date, product_name, batch_no, quantity, customer } = req.body;
    
    const result = await db.query(
      `INSERT INTO product_outbound (date, product_name, batch_no, quantity, customer) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, product_name, batch_no, quantity, customer]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating product outbound record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// 仪表盘数据API
app.get('/api/dashboard', async (req, res) => {
  try {
    // 获取基础数据统计
    const [
      materialsResult,
      productsResult,
      usersResult,
      productMappingsResult
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM materials'),
      db.query('SELECT COUNT(*) as count FROM products'),
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM product_recipe_mappings')
    ]);

    // 获取业务数据统计（可能为空）
    let inboundCount = 0, outboundCount = 0;
    try {
      const inboundResult = await db.query('SELECT COUNT(*) as count FROM inbound_raw');
      const outboundResult = await db.query('SELECT COUNT(*) as count FROM outbound_raw');
      inboundCount = parseInt(inboundResult.rows[0].count);
      outboundCount = parseInt(outboundResult.rows[0].count);
    } catch (err) {
      console.log('业务数据表为空，使用默认值');
    }

    res.json({
      total_materials: parseInt(materialsResult.rows[0].count),
      total_products: parseInt(productsResult.rows[0].count),
      total_users: parseInt(usersResult.rows[0].count),
      total_product_mappings: parseInt(productMappingsResult.rows[0].count),
      total_inbound_records: inboundCount,
      total_outbound_records: outboundCount,
      recent_inbound_records: [],
      recent_outbound_records: [],
      low_stock_items: [],
      system_status: 'ready',
      message: '系统已就绪，可以开始添加业务数据'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 参考数据API
app.get('/api/reference-data', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const [materials, products, productMappings] = await Promise.all([
      db.query('SELECT * FROM materials ORDER BY code'),
      db.query('SELECT * FROM products ORDER BY code'),
      db.query('SELECT * FROM product_recipe_mappings ORDER BY product_name, material_name')
    ]);

    res.json({
      materials: materials.rows,
      products: products.rows,
      productMappings: productMappings.rows
    });
  } catch (error) {
    console.error('Error fetching reference data:', error);
    res.status(500).json({ error: 'Failed to fetch reference data' });
  }
});

// 资产管理API - 临时简化版本
app.get('/api/assets', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    // 临时返回空数组，避免数据库查询错误
    res.json([]);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/assets/:category', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const { category } = req.params;
    const result = await db.query('SELECT * FROM assets WHERE category = $1 ORDER BY name', [category]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets by category:', error);
    res.status(500).json({ error: 'Failed to fetch assets by category' });
  }
});

// 物料管理API
app.get('/api/materials', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM materials ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// 产品管理API
app.get('/api/products', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 产品配方API
app.get('/api/product-mappings', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product_recipe_mappings ORDER BY product_name, material_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product mappings:', error);
    res.status(500).json({ error: 'Failed to fetch product mappings' });
  }
});

// 原料入库API
app.get('/api/raw-inout', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inbound_raw ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw inbound records:', error);
    res.status(500).json({ error: 'Failed to fetch raw inbound records' });
  }
});

// 原料出库API
app.get('/api/raw-out', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM outbound_raw ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch raw outbound records' });
  }
});

// 原料出库API (别名)
app.get('/api/raw-outbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM outbound_raw ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching raw outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch raw outbound records' });
  }
});

// 辅料入库API - 临时简化版本
app.get('/api/aux-inout', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    console.log('🔍 查询辅料入库数据...');
    // 临时返回空数组，避免数据库查询错误
    res.json([]);
    console.log('✅ 辅料入库查询成功，返回空数组');
  } catch (error) {
    console.error('❌ 辅料入库查询失败:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch aux inbound records',
      details: error.message
    });
  }
});

// 辅料出库API - 临时简化版本
app.get('/api/aux-outbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    // 临时返回空数组，避免数据库查询错误
    res.json([]);
  } catch (error) {
    console.error('Error fetching aux outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch aux outbound records' });
  }
});

// 产品入库API
app.get('/api/product-inbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product_inbound ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product inbound records:', error);
    res.status(500).json({ error: 'Failed to fetch product inbound records' });
  }
});

// 产品出库API
app.get('/api/product-outbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product_outbound ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product outbound records:', error);
    res.status(500).json({ error: 'Failed to fetch product outbound records' });
  }
});

// 产品辅助物料API
app.get('/api/product-aux-inbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product_recipe_mappings ORDER BY product_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product aux mappings:', error);
    res.status(500).json({ error: 'Failed to fetch product aux mappings' });
  }
});

// 财务管理API
app.get('/api/finance/raw-inbound', verifyToken, checkPermission('data.view'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inbound_raw ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching finance data:', error);
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
async function startServer() {
  try {
    // 修复数据库表结构
    console.log('🔧 开始修复数据库表结构...');
    const { fixDatabase } = require('./fix-database');
    await fixDatabase();
    
    // 初始化数据库
    await initDatabase();
    
    // 强制运行数据迁移 - 简化版本
    console.log('🚀🚀🚀 开始强制数据迁移 🚀🚀🚀');
    console.log('环境变量检查:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL存在:', !!process.env.DATABASE_URL);
    console.log('- DATABASE_URL值:', process.env.DATABASE_URL ? '已设置' : '未设置');
    
    // 直接运行迁移，不检查条件
    try {
      console.log('📦 开始执行数据迁移...');
      
          // 直接调用完整迁移函数
          const { completeMigrate } = require('./complete-migrate');
          console.log('📦 完整迁移函数已加载');
          
          await completeMigrate();
      console.log('✅✅✅ 数据迁移成功完成 ✅✅✅');
      
    } catch (migrationError) {
      console.error('❌❌❌ 数据迁移失败 ❌❌❌');
      console.error('错误类型:', migrationError.name);
      console.error('错误消息:', migrationError.message);
      console.error('错误堆栈:', migrationError.stack);
      console.error('完整错误对象:', migrationError);
    }
    
    // 添加一个简单的测试
    console.log('🧪 测试日志输出 - 如果你看到这条消息，说明代码已更新');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

startServer();
