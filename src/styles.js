// 统一的颜色主题
export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    gray: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

export const sidebarStyle = {
  width: 240,
  borderRight: '1px solid #e0e0e0',
  padding: 16,
  background: '#fafafa',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
  fontFamily: 'Arial, sans-serif'
};

export const mainStyle = { 
  flex: 1, 
  padding: 24, 
  paddingBottom: 60, // Add space for footer
  background: '#fff', 
  fontFamily: 'Arial, sans-serif' 
};

export const buttonStyle = code => ({
  margin: '4px 8px 4px 0',
  padding: '6px 12px',
  border: '1px solid #aaa',
  borderRadius: 4,
  background: code.active ? theme.colors.primary : theme.colors.white,
  color: code.active ? theme.colors.white : theme.colors.dark,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
});

export const linkStyle = isActive => ({
  textDecoration: 'none',
  color: isActive ? theme.colors.primary : theme.colors.dark,
  fontWeight: isActive ? 'bold' : 'normal',
  display: 'block',
  padding: '4px 0'
});

export const tableStyle = { 
  width: '100%', 
  borderCollapse: 'collapse', 
  marginTop: 16 
};

export const cellStyle = { 
  border: '1px solid #ccc', 
  padding: 8, 
  textAlign: 'left' 
};

// 页面标题样式
export const pageTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing.lg,
  color: theme.colors.primary,
  fontSize: '24px',
  fontWeight: 'bold'
};

// 页面描述样式
export const pageDescriptionStyle = {
  color: theme.colors.gray[600],
  fontSize: '14px',
  marginBottom: theme.spacing.lg,
  lineHeight: '1.5'
};

// 卡片样式
export const cardStyle = {
  background: theme.colors.white,
  borderRadius: theme.borderRadius.md,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: `1px solid ${theme.colors.gray[200]}`
};

// 标签页样式
export const tabStyle = (isActive) => ({
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  marginRight: theme.spacing.sm,
  borderRadius: theme.borderRadius.sm,
  border: 'none',
  background: isActive ? theme.colors.primary : theme.colors.gray[100],
  color: isActive ? theme.colors.white : theme.colors.dark,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: isActive ? 'bold' : 'normal',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs
});

// 按钮样式
export const primaryButtonStyle = {
  background: theme.colors.primary,
  color: theme.colors.white,
  border: 'none',
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.sm,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs
};

export const secondaryButtonStyle = {
  background: theme.colors.gray[100],
  color: theme.colors.dark,
  border: `1px solid ${theme.colors.gray[300]}`,
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.sm,
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs
};

export const dangerButtonStyle = {
  background: theme.colors.danger,
  color: theme.colors.white,
  border: 'none',
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.sm,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs
};

// 输入框样式
export const inputStyle = {
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  border: `1px solid ${theme.colors.gray[300]}`,
  borderRadius: theme.borderRadius.sm,
  fontSize: '14px',
  width: '100%',
  transition: 'border-color 0.2s ease'
};

// 选择框样式
export const selectStyle = {
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  border: `1px solid ${theme.colors.gray[300]}`,
  borderRadius: theme.borderRadius.sm,
  fontSize: '14px',
  width: '100%',
  background: theme.colors.white,
  cursor: 'pointer'
};

// 状态标签样式
export const statusTagStyle = (status) => {
  const statusColors = {
    active: theme.colors.success,
    inactive: theme.colors.gray[600],
    maintenance: theme.colors.warning,
    retired: theme.colors.danger
  };
  
  return {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    fontWeight: 'bold',
    color: theme.colors.white,
    background: statusColors[status] || theme.colors.gray[600]
  };
};

// 分类标签样式
export const categoryTagStyle = (category) => {
  const categoryColors = {
    factory: theme.colors.primary,
    machine: theme.colors.success,
    vehicle: theme.colors.warning,
    equipment: theme.colors.danger,
    other: theme.colors.gray[600]
  };
  
  return {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    fontWeight: 'bold',
    color: theme.colors.white,
    background: categoryColors[category] || theme.colors.gray[600]
  };
};

// 添加旋转动画
export const spinAnimation = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// 将动画添加到全局样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}
  