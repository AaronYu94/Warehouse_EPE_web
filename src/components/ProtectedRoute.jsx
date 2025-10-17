import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 如果没有指定权限要求，直接返回内容
  if (!requiredPermission) {
    return children;
  }

  // 检查权限
  if (!hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        权限不足，无法访问此页面
      </div>
    );
  }

  return children;
}; 