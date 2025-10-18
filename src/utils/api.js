import API_BASE_URL from '../config';

// 获取认证令牌
const getToken = () => {
  return localStorage.getItem('token');
};

// 创建带认证头的请求
const createAuthenticatedRequest = (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

// API请求工具
export const api = {
  // GET请求
  get: async (endpoint) => {
    const response = await createAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
    });
    
    if (response.status === 401) {
      // 令牌无效，清除本地存储并重定向到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    return response;
  },

  // POST请求
  post: async (endpoint, data) => {
    const response = await createAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    return response;
  },

  // PUT请求
  put: async (endpoint, data) => {
    const response = await createAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    return response;
  },

  // DELETE请求
  delete: async (endpoint) => {
    const response = await createAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    return response;
  },

  // 文件上传请求
  upload: async (endpoint, formData) => {
    const token = getToken();
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    return response;
  }
};

export default api;
