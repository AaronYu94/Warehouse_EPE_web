/**
 * 安全API端点配置
 * 为所有API端点添加认证和权限控制
 */

const { verifyToken, checkPermission } = require('./middleware/auth');

// API端点权限配置
const API_PERMISSIONS = {
  // 数据查看权限
  'GET:/api/raw-inout': 'data.view',
  'GET:/api/raw-out': 'data.view',
  'GET:/api/aux-inout': 'data.view',
  'GET:/api/aux-outbound': 'data.view',
  'GET:/api/product-inbound': 'data.view',
  'GET:/api/product-outbound': 'data.view',
  'GET:/api/dashboard': 'data.view',
  
  // 数据创建权限
  'POST:/api/raw-inout': 'data.create',
  'POST:/api/raw-out': 'data.create',
  'POST:/api/aux-inout': 'data.create',
  'POST:/api/aux-outbound': 'data.create',
  'POST:/api/product-inbound': 'data.create',
  'POST:/api/product-outbound': 'data.create',
  
  // 数据更新权限
  'PUT:/api/raw-inout': 'data.update',
  'PUT:/api/raw-out': 'data.update',
  'PUT:/api/aux-inout': 'data.update',
  'PUT:/api/aux-outbound': 'data.update',
  'PUT:/api/product-inbound': 'data.update',
  'PUT:/api/product-outbound': 'data.update',
  
  // 数据删除权限
  'DELETE:/api/raw-inout': 'data.delete',
  'DELETE:/api/raw-out': 'data.delete',
  'DELETE:/api/aux-inout': 'data.delete',
  'DELETE:/api/aux-outbound': 'data.delete',
  'DELETE:/api/product-inbound': 'data.delete',
  'DELETE:/api/product-outbound': 'data.delete',
  
  // 报告权限
  'GET:/api/reports': 'reports.view',
  'POST:/api/export': 'reports.export',
  
  // 用户管理权限
  'GET:/api/users': 'users.manage',
  'POST:/api/users': 'users.manage',
  'PUT:/api/users': 'users.manage',
  'DELETE:/api/users': 'users.manage',
  
  // 系统设置权限
  'GET:/api/settings': 'system.settings',
  'PUT:/api/settings': 'system.settings'
};

// 应用安全中间件到Express应用
function applySecurityMiddleware(app) {
  // 为所有API端点应用认证和权限控制
  Object.keys(API_PERMISSIONS).forEach(endpoint => {
    const [method, path] = endpoint.split(':');
    const permission = API_PERMISSIONS[endpoint];
    
    // 获取现有的路由处理器
    const routes = app._router.stack
      .filter(layer => layer.route)
      .map(layer => layer.route);
    
    // 找到匹配的路由并添加中间件
    routes.forEach(route => {
      if (route.path === path) {
        const handlers = route.stack;
        const methodHandler = handlers.find(h => h.method === method.toLowerCase());
        
        if (methodHandler) {
          // 在现有处理器前插入认证中间件
          const originalHandler = methodHandler.handle;
          methodHandler.handle = [
            verifyToken,
            checkPermission(permission),
            originalHandler
          ];
        }
      }
    });
  });
}

// 手动应用安全中间件的辅助函数
function secureEndpoint(app, method, path, permission) {
  const middleware = [verifyToken];
  
  if (permission) {
    middleware.push(checkPermission(permission));
  }
  
  return middleware;
}

module.exports = {
  API_PERMISSIONS,
  applySecurityMiddleware,
  secureEndpoint
};
