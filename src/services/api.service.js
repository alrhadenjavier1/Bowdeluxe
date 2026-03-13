// src/services/api.service.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== AUTH ==========
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email, name) {
    const response = await this.api.post('/auth/register', { email, name });
    return response.data;
  }

  async verifyCode(email, code, password, name) {
    const response = await this.api.post('/auth/verify', { email, code, password, name });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // ========== PRODUCTS ==========
  async getProducts(params = {}) {
    const response = await this.api.get('/admin/products', { params });
    return response.data;
  }

  async getProduct(id) {
    const response = await this.api.get(`/admin/products/${id}`);
    return response.data;
  }

  // ========== CART ==========
  async getCart() {
    const response = await this.api.get('/cart');
    return response.data;
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.api.post('/cart/add', { productId, quantity });
    return response.data;
  }

  async removeFromCart(itemId) {
    const response = await this.api.delete(`/cart/item/${itemId}`);
    return response.data;
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.api.put(`/cart/item/${itemId}`, { quantity });
    return response.data;
  }

  async clearCart() {
    const response = await this.api.delete('/cart/clear');
    return response.data;
  }

  // ========== WISHLIST ==========
  async getWishlist() {
    const response = await this.api.get('/wishlist');
    return response.data;
  }

  async toggleWishlist(productId) {
    const response = await this.api.post('/wishlist/toggle', { productId });
    return response.data;
  }

  async removeFromWishlist(itemId) {
    const response = await this.api.delete(`/wishlist/item/${itemId}`);
    return response.data;
  }

  async clearWishlist() {
    const response = await this.api.delete('/wishlist/clear');
    return response.data;
  }

  // ========== ORDERS ==========
  async getUserOrders() {
    const response = await this.api.get('/orders');
    return response.data;
  }

  async getOrderById(orderId) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async createOrder(orderData) {
    const response = await this.api.post('/orders/create', orderData);
    return response.data;
  }

  // ========== ORDERS ==========
async getUserOrders() {
  const response = await this.api.get('/orders');
  return response.data;
}

async getOrderById(orderId) {
  const response = await this.api.get(`/orders/${orderId}`);
  return response.data;
}

async createOrder(orderData) {
  const response = await this.api.post('/orders/create', orderData);
  return response.data;
}

// ========== CONTENT MANAGEMENT ==========
async getHomepageContent() {
  const response = await this.api.get('/content/homepage');
  return response.data;
}


// ✅ Add this new method
async checkout(shipping_address, payment_method = 'Cash on Delivery') {
  const response = await this.api.post('/orders/checkout', {
    shipping_address,
    payment_method
  });
  return response.data;
}

  // ========== ADMIN (if needed) ==========
  // ... existing admin methods ...
}

export default new ApiService();