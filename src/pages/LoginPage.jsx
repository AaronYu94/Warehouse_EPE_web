import API_BASE_URL from "../config";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';

const loginStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: '#f5f5f5'
};

const loginFormStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  width: '400px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '16px'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '16px'
};

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 简单的用户验证（实际应用中应该连接后端）
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      login({
        username: credentials.username,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'export']
      });
      navigate('/');
    } else if (credentials.username === 'operator' && credentials.password === 'op123') {
      login({
        username: credentials.username,
        role: 'operator',
        permissions: ['read', 'write']
      });
      navigate('/');
    } else if (credentials.username === 'viewer' && credentials.password === 'view123') {
      login({
        username: credentials.username,
        role: 'viewer',
        permissions: ['read']
      });
      navigate('/');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div style={loginStyle}>
      <div style={loginFormStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {t('login.title')}
        </h2>
        
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder={t('login.username')}
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            style={inputStyle}
            required
          />
          
          <input
            type="password"
            placeholder={t('login.password')}
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            style={inputStyle}
            required
          />
          
          {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
            {error}
          </div>}
          
          <button type="submit" style={buttonStyle}>
            {t('login.submit')}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
          <h4>测试账户：</h4>
          <p>管理员：admin / admin123</p>
          <p>操作员：operator / op123</p>
          <p>查看者：viewer / view123</p>
        </div>
      </div>
    </div>
  );
} 