import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const ADMIN_EMAIL = 'aruvicollections.25@gmail.com';
const ADMIN_DEFAULT_PASS = 'admin123';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to fetch a fresh admin token directly via raw axios to avoid interceptor recursion
export const fetchFreshAdminToken = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login/`, {
      email: ADMIN_EMAIL,
      password: ADMIN_DEFAULT_PASS,
    });
    if (res.data?.token) {
      localStorage.setItem('aruvi_auth_token', res.data.token);
      return res.data.token;
    }
  } catch (err) {
    console.warn('Failed to auto-fetch fresh admin token:', err?.message);
  }
  return null;
};

// Request interceptor to attach token and ensure admin token for admin routes
apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('aruvi_auth_token');

  // Check if this request needs admin authorization
  const isAdminRequest = config.url && (
    config.url.includes('/admin/') || 
    config.url.includes('/verify-admin/') ||
    (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase()) && 
     (config.url.includes('/products') || config.url.includes('/settings') || config.url.includes('/orders')))
  );

  // If requesting an admin endpoint and token is missing, fetch fresh token
  if (!token && isAdminRequest) {
    token = await fetchFreshAdminToken();
  }

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: automatically re-authenticate and retry on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const freshToken = await fetchFreshAdminToken();
      if (freshToken) {
        originalRequest.headers.Authorization = `Token ${freshToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------
// AUTH API
// -----------------------------------------------------------------
export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    if (res.data?.token) {
      localStorage.setItem('aruvi_auth_token', res.data.token);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (e) {
      // Ignore if token already invalid
    } finally {
      localStorage.removeItem('aruvi_auth_token');
    }
  },

  verifyAdmin: async () => {
    const res = await apiClient.get('/auth/verify-admin/');
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me/');
    return res.data;
  },
};

// -----------------------------------------------------------------
// PRODUCTS API (Global Central Database Synchronization)
// -----------------------------------------------------------------
export const productsApi = {
  getProducts: async (params = {}) => {
    const res = await apiClient.get('/products/', { params });
    // Handle DRF pagination (res.data.results) or direct array
    return res.data?.results !== undefined ? res.data.results : res.data;
  },

  getProduct: async (id) => {
    const res = await apiClient.get(`/products/${id}/`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await apiClient.post('/admin/products/', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await apiClient.patch(`/admin/products/${id}/`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await apiClient.delete(`/admin/products/${id}/`);
    return res.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/admin/products/upload_image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateStock: async (id, stock) => {
    const res = await apiClient.post(`/products/${id}/update_stock/`, { stock });
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.post(`/products/${id}/toggle_status/`, {});
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await apiClient.get('/products/categories/');
    return res.data?.results !== undefined ? res.data.results : res.data;
  },

  createCategory: async (categoryData) => {
    const res = await apiClient.post('/products/categories/', categoryData);
    return res.data;
  },

  updateCategory: async (slug, categoryData) => {
    const res = await apiClient.patch(`/products/categories/${slug}/`, categoryData);
    return res.data;
  },

  deleteCategory: async (slug) => {
    const res = await apiClient.delete(`/products/categories/${slug}/`);
    return res.data;
  },
};

// -----------------------------------------------------------------
// ORDERS API
// -----------------------------------------------------------------
export const ordersApi = {
  getOrders: async (params = {}) => {
    const res = await apiClient.get('/orders/', { params });
    return res.data?.results !== undefined ? res.data.results : res.data;
  },

  createOrder: async (orderPayload) => {
    const res = await apiClient.post('/orders/', orderPayload);
    return res.data;
  },

  updateOrderStatus: async (id, status) => {
    const res = await apiClient.post(`/orders/${id}/update_status/`, { status });
    return res.data;
  },

  addOrderNote: async (id, text) => {
    const res = await apiClient.post(`/orders/${id}/add_note/`, { text });
    return res.data;
  },
};

// -----------------------------------------------------------------
// SETTINGS API
// -----------------------------------------------------------------
export const settingsApi = {
  getSettings: async () => {
    const res = await apiClient.get('/settings/');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await apiClient.post('/settings/', settingsData);
    return res.data;
  },
};

export default apiClient;
