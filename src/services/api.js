// src/services/api.js
import { supabase } from '../config/supabase';

class API {
  async getProducts(params = {}) {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.category) {
        query = query.eq('category', params.category);
      }
      if (params.bestSeller) {
        query = query.eq('is_best_seller', true);
      }
      if (params.newArrival) {
        query = query.eq('is_new_arrival', true);
      }

      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      query = query.range(start, end).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductsByCategory(category, params = {}) {
    return this.getProducts({ ...params, category });
  }

  async searchProducts(query) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

export default new API();