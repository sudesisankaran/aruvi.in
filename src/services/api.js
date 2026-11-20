import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aruvi_auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 or 403, and on an admin route, can trigger revocation
    if (error.response?.status === 401) {
      // Token might be invalid
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
