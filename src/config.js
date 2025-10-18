// API配置
// 根据环境自动选择API地址
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://warehouse-backend-production.up.railway.app'  // 生产环境API地址
  : 'http://localhost:4000';  // 开发环境API地址

export default API_BASE_URL; 