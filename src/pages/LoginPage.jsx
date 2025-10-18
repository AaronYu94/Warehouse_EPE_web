import API_BASE_URL from "../config";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle } from 'lucide-react';

const loginStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px'
};

const loginFormStyle = {
  background: 'white',
  padding: '48px',
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '420px',
  position: 'relative'
};

const inputContainerStyle = {
  position: 'relative',
  marginBottom: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '16px 20px 16px 50px',
  border: '2px solid #e1e5e9',
  borderRadius: '12px',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  outline: 'none',
  boxSizing: 'border-box'
};

const inputFocusStyle = {
  ...inputStyle,
  borderColor: '#667eea',
  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6c757d',
  zIndex: 1
};

const togglePasswordStyle = {
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6c757d',
  cursor: 'pointer',
  zIndex: 1
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '24px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const buttonHoverStyle = {
  ...buttonStyle,
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
};

const errorStyle = {
  color: '#dc3545',
  fontSize: '14px',
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const securityNoticeStyle = {
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
  fontSize: '14px',
  color: '#856404'
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            marginBottom: '16px'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {t('login.title')}
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '16px' 
          }}>
            安全登录到仓库管理系统
          </p>
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
              style={focusedField === 'username' ? inputFocusStyle : inputStyle}
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
              style={focusedField === 'password' ? inputFocusStyle : inputStyle}
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
            style={buttonStyle}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                Object.assign(e.target.style, buttonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, buttonStyle);
            }}
          >
            {isLoading ? '登录中...' : t('login.submit')}
          </button>
        </form>
        
        {/* 安全提示 */}
        <div style={securityNoticeStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Shield size={16} style={{ marginRight: '8px' }} />
            <strong>安全提示</strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px' }}>
            为了您的账户安全，请使用强密码并定期更换。建议密码包含大小写字母、数字和特殊字符。
          </p>
        </div>
        
        {/* 默认账户信息 */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>
            🔐 默认账户（请及时修改密码）
          </h4>
          <div style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.6' }}>
            <div><strong>管理员:</strong> admin / <span style={{color: '#28a745', fontFamily: 'monospace'}}>Admin@2024!Secure</span></div>
            <div><strong>操作员:</strong> operator / <span style={{color: '#28a745', fontFamily: 'monospace'}}>Operator@2024!Safe</span></div>
            <div><strong>查看者:</strong> viewer / <span style={{color: '#28a745', fontFamily: 'monospace'}}>Viewer@2024!Read</span></div>
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#dc3545',
            fontWeight: '500'
          }}>
            ⚠️ 生产环境部署前必须修改这些默认密码！
          </div>
        </div>
      </div>
    </div>
  );
} 