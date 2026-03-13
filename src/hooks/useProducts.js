// src/hooks/useProducts.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Store current params in ref to access in callbacks
  const currentParams = useRef(initialParams);
  
  // Update currentParams when initialParams changes
  useEffect(() => {
    currentParams.current = initialParams;
  }, [initialParams]);

  const fetchProducts = useCallback(async (params = {}, reset = false) => {
    // Merge with current params
    const mergedParams = { ...currentParams.current, ...params };
    
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const limit = mergedParams.limit || 8;
      const start = (currentPage - 1) * limit;
      const end = start + limit - 1;
      
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (mergedParams.category) {
        query = query.eq('category', mergedParams.category);
      }
      if (mergedParams.bestSeller) {
        query = query.eq('is_best_seller', true);
      }
      if (mergedParams.newArrival) {
        query = query.eq('is_new_arrival', true);
      }

      // Apply sorting
      const sortField = mergedParams.sort || 'created_at';
      const sortOrder = mergedParams.sortOrder || 'desc';
      
      // Handle special sort cases
      switch(mergedParams.sort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;
      
      if (reset) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }
      
      const totalPagesCount = Math.ceil((count || 0) / limit);
      setTotalPages(totalPagesCount);
      setHasMore(currentPage < totalPagesCount);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page]); // Remove initialParams from dependencies

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(currentParams.current, true);
  }, [initialParams.category, initialParams.sort]); // ✅ Re-fetch when category or sort changes

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(currentParams.current, true);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};