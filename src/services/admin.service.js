// src/services/admin.service.js
import axios from 'axios';

class AdminService {
  constructor() {
    // Set up axios instance with base URL
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
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
  }

  // ========== PRODUCT MANAGEMENT ==========
  
  async getProducts(params = {}) {
    try {
      const response = await this.api.get('/admin/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        products: [] 
      };
    }
  }

  async createProduct(productData) {
    try {
      const response = await this.api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await this.api.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async deleteProduct(id) {
    try {
      const response = await this.api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async bulkDeleteProducts(ids) {
    try {
      const response = await this.api.post('/admin/products/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async duplicateProduct(id) {
    try {
      const response = await this.api.post(`/admin/products/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating product:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async toggleProductStatus(id, field) {
    try {
      const response = await this.api.patch(`/admin/products/${id}/toggle`, { field });
      return response.data;
    } catch (error) {
      console.error('Error toggling product status:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== ORDER MANAGEMENT ==========
  
  async getOrders(filters = {}) {
    try {
      const response = await this.api.get('/admin/orders', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        orders: [] 
      };
    }
  }

  async getOrderById(id) {
    try {
      const response = await this.api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.api.patch(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const response = await this.api.patch(`/admin/orders/${orderId}/payment`, { 
        payment_status: paymentStatus 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async addTrackingNumber(orderId, trackingNumber) {
    try {
      const response = await this.api.patch(`/admin/orders/${orderId}/tracking`, { 
        tracking_number: trackingNumber 
      });
      return response.data;
    } catch (error) {
      console.error('Error adding tracking number:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async getOrderStats() {
    try {
      const response = await this.api.get('/admin/orders/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        stats: {
          total_orders: 0,
          total_revenue: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        }
      };
    }
  }

  async exportOrders(filters = {}) {
    try {
      const response = await this.api.get('/admin/orders/export/csv', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== USER MANAGEMENT ==========
  
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        users: [] 
      };
    }
  }

  async getUserById(id) {
    try {
      const response = await this.api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async toggleUserStatus(userId, isActive) {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/status`, { 
        is_active: isActive 
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async createUser(userData) {
    try {
      const response = await this.api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== CATEGORY MANAGEMENT ==========
  
  async getCategories() {
    try {
      const response = await this.api.get('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        categories: [] 
      };
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await this.api.post('/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await this.api.put(`/admin/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async deleteCategory(id) {
    try {
      const response = await this.api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== CONTENT MANAGEMENT ==========
  
  async getHomepageContent() {
    try {
      const response = await this.api.get('/admin/content/homepage');
      return response.data;
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateHomepageContent(content) {
    try {
      const response = await this.api.put('/admin/content/homepage', { content });
      return response.data;
    } catch (error) {
      console.error('Error updating homepage content:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateHeroSection(content) {
    try {
      const response = await this.api.put('/admin/content/hero', { content });
      return response.data;
    } catch (error) {
      console.error('Error updating hero section:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateCategoriesSection(categories) {
    try {
      const response = await this.api.put('/admin/content/categories', { categories });
      return response.data;
    } catch (error) {
      console.error('Error updating categories section:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateBenefitsSection(benefits) {
    try {
      const response = await this.api.put('/admin/content/benefits', { benefits });
      return response.data;
    } catch (error) {
      console.error('Error updating benefits section:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateFeaturedProducts(productIds) {
    try {
      const response = await this.api.put('/admin/content/featured', { productIds });
      return response.data;
    } catch (error) {
      console.error('Error updating featured products:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== IMAGE UPLOAD ==========
  
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await this.api.post('/admin/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async uploadMultipleImages(files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await this.api.post('/admin/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async deleteImage(publicId) {
    try {
      const response = await this.api.delete('/admin/upload/image', { 
        data: { public_id: publicId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ========== DASHBOARD STATISTICS ==========
  
  async getDashboardStats() {
    try {
      // Use the API endpoint instead of direct Supabase calls
      const response = await this.api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return fallback data structure
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        data: {
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          totalRevenue: 0,
          recentOrders: [],
          monthlySales: []
        }
      };
    }
  }

  // ========== HELPER METHODS ==========
  
  extractPublicIdFromUrl(url) {
    try {
      const matches = url.match(/\/upload\/v\d+\/(.+)\./);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }

  getOptimizedImageUrl(url, width = 500, height = 500, crop = 'fill') {
    if (!url || !url.includes('cloudinary')) return url;
    
    const publicId = this.extractPublicIdFromUrl(url);
    if (!publicId) return url;

    return url;
  }

  // ========== CONTENT MANAGEMENT ==========

async getHomepageContent() {
  try {
    const response = await this.api.get('/admin/content/homepage');
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async updateHomepageContent(content) {
  try {
    const response = await this.api.put('/admin/content/homepage', { content });
    return response.data;
  } catch (error) {
    console.error('Error updating homepage content:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async updateHeroSection(content) {
  try {
    const response = await this.api.put('/admin/content/hero', { content });
    return response.data;
  } catch (error) {
    console.error('Error updating hero section:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async updateCategoriesSection(categories) {
  try {
    const response = await this.api.put('/admin/content/categories', { categories });
    return response.data;
  } catch (error) {
    console.error('Error updating categories section:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async updateBenefitsSection(benefits) {
  try {
    const response = await this.api.put('/admin/content/benefits', { benefits });
    return response.data;
  } catch (error) {
    console.error('Error updating benefits section:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async updateFeaturedProducts(productIds) {
  try {
    const response = await this.api.put('/admin/content/featured', { productIds });
    return response.data;
  } catch (error) {
    console.error('Error updating featured products:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}
}



export default new AdminService();