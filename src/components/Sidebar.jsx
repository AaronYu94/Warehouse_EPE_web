import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import {
  Home,
  Package,
  Box,
  Database,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  Truck,
  BarChart3,
  Activity,
  DollarSign,
  Settings,
  Trash2,
  User,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useI18n();

  const nav = t('nav');

  const buttonStyle = ({active}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    marginBottom: '4px',
    borderRadius: '6px',
    textDecoration: 'none',
    color: active ? 'white' : '#333',
    backgroundColor: active ? '#007bff' : 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: active ? '600' : '500',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  });

  const linkStyle = ({isActive}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    marginBottom: '4px',
    borderRadius: '6px',
    textDecoration: 'none',
    color: isActive ? 'white' : '#333',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  });

  const sidebarStyle = {
    width: '280px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e9ecef',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto'
  };

  const icons = [
    Home,           // 仪表盘
    Package,        // 原料入库
    Box,            // 辅料入库
    Database,       // 成品入库
    ArrowUpRight,   // 原料出库
    TrendingUp,     // 成品出库
    BarChart3,      // 库存台账
    Activity,       // 品类数据参考
    Settings,       // 资产管理
    DollarSign,     // 财务管理
    Trash2          // 数据管理 - 删除图标
  ];

  const paths = [
    '/',                // 仪表盘
    '/inbound',         // 原料入库
    '/aux-inbound',     // 辅料入库
    '/product-inbound', // 成品入库
    '/raw-outbound',    // 原料出库
    '/product-outbound',// 成品出库
    '/inventory',       // 库存台账
    '/reference-data',  // 品类数据参考
    '/asset-management',// 资产管理
    '/finance',         // 财务管理
    '/data-management' // 数据管理
  ];
  
  // 显示所有功能
  const displayNav = nav;

  return (
    <aside style={sidebarStyle}>
      {/* 用户信息 */}
      {user && (
        <div style={{marginBottom: 16, padding: '12px', background: '#f0f0f0', borderRadius: '4px'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
            <User size={16} style={{marginRight: 8}} />
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>{user.username}</span>
          </div>
          <div style={{fontSize: '12px', color: '#666'}}>{t('common.role')}: {user.role}</div>
        </div>
      )}


      {/* 菜单导航 */}
      <nav style={{flex:1}}>
        {/* 仪表盘 */}
        <NavLink 
          to="/" 
          end
          style={({isActive}) => {
            console.log('仪表盘 isActive:', isActive);
            return {
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              marginBottom: '8px',
              backgroundColor: isActive ? '#007bff' : '#f8f9fa',
              color: isActive ? 'white' : '#333',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              border: isActive ? 'none' : '2px solid #e9ecef',
              boxShadow: isActive ? '0 2px 4px rgba(0,123,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            };
          }}
        >
          <Home size={18} style={{marginRight: '12px', flexShrink: 0}} />
          <span style={{flex: 1}}>{t('dashboard.title')}</span>
        </NavLink>
        
        {/* 分隔线 */}
        <div style={{
          height: '1px',
          backgroundColor: '#e9ecef',
          margin: '16px 0',
          opacity: 0.6
        }} />
        
        {/* 其他功能菜单 */}
        {displayNav.map((label,i)=> {
          const Icon = icons[i+1] || icons[icons.length-1]; // 如果图标不存在，使用最后一个图标
          const path = paths[i+1];
          return (
            <NavLink key={i} to={path} end style={({isActive})=>{
              console.log(`${label} (${path}) isActive:`, isActive);
              return {
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? 'white' : '#333',
                backgroundColor: isActive ? '#007bff' : 'transparent',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
                textAlign: 'left'
              };
            }}>
              <Icon size={16} style={{marginRight: '12px', flexShrink: 0}} />
              <span style={{flex: 1}}>{label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* 登出按钮 */}
      {user && (
        <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0'}}>
          <button
            onClick={logout}
            style={{
              ...buttonStyle({active: false}),
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f44336',
              color: 'white'
            }}
          >
            <LogOut size={16} style={{marginRight: 8}} />
            {t('common.logout')}
          </button>
        </div>
      )}
    </aside>
  );
}
