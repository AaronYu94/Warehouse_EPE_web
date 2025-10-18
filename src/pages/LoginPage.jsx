import API_BASE_URL from "../config";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle, Warehouse } from 'lucide-react';
import { theme, cardStyle, primaryButtonStyle, inputStyle } from '../styles';

const loginStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: '#f8f9fa',
  padding: '20px',
  fontFamily: 'Arial, sans-serif'
};

const loginFormStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '40px',
  textAlign: 'center'
};

const inputContainerStyle = {
  position: 'relative',
  marginBottom: '20px'
};

const loginInputStyle = {
  ...inputStyle,
  padding: '12px 16px 12px 40px',
  fontSize: '16px',
  border: `1px solid ${theme.colors.gray[300]}`,
  borderRadius: '8px',
  transition: 'border-color 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box'
};

const inputFocusStyle = {
  ...loginInputStyle,
  borderColor: theme.colors.primary,
  boxShadow: `0 0 0 2px ${theme.colors.primary}20`
};

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: theme.colors.gray[500],
  zIndex: 1
};

const togglePasswordStyle = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: theme.colors.gray[500],
  cursor: 'pointer',
  zIndex: 1
};

const loginButtonStyle = {
  ...primaryButtonStyle,
  width: '100%',
  padding: '14px 20px',
  fontSize: '16px',
  fontWeight: '600',
  marginTop: '24px',
  borderRadius: '8px'
};

const errorStyle = {
  color: theme.colors.danger,
  fontSize: '14px',
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};


const passwordStrengthStyle = {
  marginTop: '8px',
  fontSize: '12px'
};

const strengthBarStyle = {
  height: '4px',
  borderRadius: '2px',
  marginTop: '4px',
  transition: 'all 0.3s ease'
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // 密码强度检查
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ['很弱', '弱', '一般', '强', '很强'];
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
    
    return {
      strength: strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '#dc3545'
    };
  };

  const passwordStrength = getPasswordStrength(credentials.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // 基本验证
    if (!credentials.username.trim()) {
      setError('请输入用户名');
      setIsLoading(false);
      return;
    }
    
    if (!credentials.password.trim()) {
      setError('请输入密码');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || '用户名或密码错误');
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={loginStyle}>
      <div style={loginFormStyle}>
        {/* 标题和图标 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #0056b3 100%)`,
            borderRadius: '20px',
            marginBottom: '20px',
            boxShadow: `0 8px 25px ${theme.colors.primary}40`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 背景装饰 */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '30px',
              height: '30px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              left: '-5px',
              width: '20px',
              height: '20px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%'
            }} />
            <Warehouse size={40} color="white" style={{ zIndex: 1 }} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '36px', 
            fontWeight: '800',
            color: theme.colors.dark,
            letterSpacing: '-0.5px',
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #0056b3 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            WareEPE
          </h1>
        </div>
        
        <form onSubmit={handleLogin}>
          {/* 用户名输入 */}
          <div style={inputContainerStyle}>
            <User size={20} style={iconStyle} />
            <input
              type="text"
              placeholder={t('login.username')}
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              style={focusedField === 'username' ? inputFocusStyle : loginInputStyle}
              required
            />
          </div>
          
          {/* 密码输入 */}
          <div style={inputContainerStyle}>
            <Lock size={20} style={iconStyle} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('login.password')}
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              style={focusedField === 'password' ? inputFocusStyle : loginInputStyle}
              required
            />
            <div onClick={togglePasswordVisibility} style={togglePasswordStyle}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            
            {/* 密码强度指示器 */}
            {credentials.password && (
              <div style={passwordStrengthStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: passwordStrength.color, fontWeight: '500' }}>
                    密码强度: {passwordStrength.label}
                  </span>
                  <span style={{ color: '#6c757d', fontSize: '11px' }}>
                    {credentials.password.length}/8+ 字符
                  </span>
                </div>
                <div style={{ 
                  ...strengthBarStyle, 
                  background: '#e9ecef',
                  width: '100%'
                }}>
                  <div style={{
                    ...strengthBarStyle,
                    background: passwordStrength.color,
                    width: `${(passwordStrength.strength / 5) * 100}%`
                  }} />
                </div>
              </div>
            )}
          </div>
          
          {/* 错误信息 */}
          {error && (
            <div style={errorStyle}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
          
          {/* 登录按钮 */}
          <button 
            type="submit" 
            style={loginButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
} 