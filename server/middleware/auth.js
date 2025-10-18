const jwt = require('jsonwebtoken');
const { db } = require('../db-postgres');

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'warehouse-epe-production-secret-key-2024-secure';

// 生成JWT令牌
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// 验证JWT令牌
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('🔐 验证Token - Authorization Header:', authHeader);
  
  const token = authHeader?.split(' ')[1]; // Bearer <token>
  console.log('🔐 提取的Token:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.log('❌ 没有提供Token');
    return res.status(401).json({ 
      success: false, 
      message: '访问被拒绝，请先登录' 
    });
  }

  try {
    console.log('🔐 JWT_SECRET:', JWT_SECRET ? '已设置' : '未设置');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token验证成功:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token验证失败:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: '无效的访问令牌' 
    });
  }
}

// 角色权限检查中间件
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: '请先登录' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: '权限不足，无法执行此操作' 
      });
    }

    next();
  };
}

// 权限定义
const PERMISSIONS = {
  admin: [
    'users.manage',
    'data.view',
    'data.create',
    'data.update',
    'data.delete',
    'reports.view',
    'reports.export',
    'system.settings'
  ],
  operator: [
    'data.view',
    'data.create',
    'data.update',
    'reports.view'
  ],
  viewer: [
    'data.view',
    'reports.view'
  ]
};

// 检查用户权限
function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: '请先登录' 
      });
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: '权限不足，无法执行此操作' 
      });
    }

    next();
  };
}

// 刷新令牌
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: '刷新令牌不能为空' 
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // 验证用户是否仍然存在
    const result = await db.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    const user = result.rows[0];
    const newToken = generateToken(user);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: '无效的刷新令牌' 
    });
  }
}

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  checkPermission,
  refreshToken,
  PERMISSIONS
};
