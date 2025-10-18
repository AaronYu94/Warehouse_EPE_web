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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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
    
    // 验证密码（支持明文密码和加密密码）
    const isValidPassword = user.password === password || 
                           await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
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

// 成品入库API
app.get('/api/product-inbound', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM product_inbound ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
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

// 成品出库API
app.get('/api/product-outbound', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM product_outbound ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
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
    // 获取各种统计数据
    const [
      rawMaterialsResult,
      auxMaterialsResult,
      productsResult,
      recentInboundResult,
      recentOutboundResult,
      lowStockResult
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count, COUNT(DISTINCT material_name) as types FROM inbound_raw'),
      db.query('SELECT COUNT(*) as count, COUNT(DISTINCT material_name) as types FROM aux_inbound'),
      db.query('SELECT COUNT(*) as count, COUNT(DISTINCT product_name) as types FROM product_inbound'),
      db.query('SELECT * FROM inbound_raw ORDER BY date DESC LIMIT 5'),
      db.query('SELECT * FROM outbound_raw ORDER BY date DESC LIMIT 5'),
      db.query(`
        SELECT material_name, container, 
               SUM(quantity) as total_in, 
               COALESCE(SUM(out_qty), 0) as total_out,
               (SUM(quantity) - COALESCE(SUM(out_qty), 0)) as remaining_quantity
        FROM (
          SELECT material_name, container, quantity, 0 as out_qty FROM inbound_raw
          UNION ALL
          SELECT material_name, container, 0 as quantity, quantity as out_qty FROM outbound_raw
        ) combined
        GROUP BY material_name, container
        HAVING (SUM(quantity) - COALESCE(SUM(out_qty), 0)) < 100
        ORDER BY remaining_quantity ASC
        LIMIT 10
      `)
    ]);

    res.json({
      total_raw_materials: parseInt(rawMaterialsResult.rows[0].count),
      total_raw_types: parseInt(rawMaterialsResult.rows[0].types),
      total_aux_materials: parseInt(auxMaterialsResult.rows[0].count),
      total_aux_types: parseInt(auxMaterialsResult.rows[0].types),
      total_products: parseInt(productsResult.rows[0].count),
      total_products_types: parseInt(productsResult.rows[0].types),
      recent_inbound_records: recentInboundResult.rows,
      recent_outbound_records: recentOutboundResult.rows,
      low_stock_items: lowStockResult.rows.map(item => ({
        materialName: item.material_name,
        container: item.container,
        remainingQuantity: item.remaining_quantity
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
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
      
      // 直接调用迁移函数
      const { migrateToRailway } = require('./railway-migrate');
      console.log('📦 迁移函数已加载');
      
      await migrateToRailway();
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
