// src/hooks/useAdminProducts.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast.success('Product created successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Product updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return { success: false, cancelled: true };
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
      return { success: false, error: error.message };
    }
  };

  const bulkDeleteProducts = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} products?`)) {
      return { success: false, cancelled: true };
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      toast.success(`${ids.length} products deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast.error(error.message || 'Failed to delete products');
      return { success: false, error: error.message };
    }
  };

  const duplicateProduct = async (product) => {
    try {
      const { id, created_at, updated_at, ...productData } = product;
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          name: `${productData.name} (Copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast.success('Product duplicated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error(error.message || 'Failed to duplicate product');
      return { success: false, error: error.message };
    }
  };

  const toggleProductStatus = async (id, field) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');

      const { data, error } = await supabase
        .from('products')
        .update({ 
          [field]: !product[field],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast.success(`Product ${field} updated`);
      return { success: true, data };
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(error.message || 'Failed to update product');
      return { success: false, error: error.message };
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    duplicateProduct,
    toggleProductStatus,
    refresh: fetchProducts
  };
};