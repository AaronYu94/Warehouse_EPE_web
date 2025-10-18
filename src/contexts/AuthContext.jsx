import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    // 检查本地存储中的用户信息和令牌
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      // 先设置用户信息，避免延迟
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setPermissions(userData.permissions || []);
      
      // 异步验证令牌
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // 设置超时，避免长时间等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

      const response = await fetch(API_BASE_URL + '/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 更新用户信息
          setUser(data.user);
          setPermissions(data.user.permissions || []);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // 令牌无效，清除本地存储
          logout();
        }
      } else {
        // 令牌无效，清除本地存储
        logout();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Token validation timeout, using cached user data');
        // 超时情况下使用缓存的用户数据
      } else {
        console.error('Token validation error:', error);
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(API_BASE_URL + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('🔐 登录成功 - 用户:', data.user);
        console.log('🔐 登录成功 - Token:', data.token ? `${data.token.substring(0, 20)}...` : 'null');
        
        setUser(data.user);
        setPermissions(data.user.permissions || []);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        console.log('🔐 Token已存储到localStorage');
        return { success: true };
      } else {
        console.log('❌ 登录失败:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // 通知服务器用户登出
        await fetch(API_BASE_URL + '/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setPermissions([]);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // 管理员拥有所有权限
    return permissions.includes(permission);
  };

  const canView = () => hasPermission('data.view');
  const canCreate = () => hasPermission('data.create');
  const canUpdate = () => hasPermission('data.update');
  const canDelete = () => hasPermission('data.delete');
  const canManageUsers = () => hasPermission('users.manage');
  const canViewReports = () => hasPermission('reports.view');
  const canExportReports = () => hasPermission('reports.export');
  const canManageSettings = () => hasPermission('system.settings');

  const value = {
    user,
    permissions,
    login,
    logout,
    loading,
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canManageUsers,
    canViewReports,
    canExportReports,
    canManageSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 