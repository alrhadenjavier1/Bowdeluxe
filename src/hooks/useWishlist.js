// src/hooks/useWishlist.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api.service';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist function
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Logged in user - use API
        const response = await api.getWishlist();
        setItems(response.wishlist?.items || []);
      } else {
        // Guest user - use localStorage
        const saved = localStorage.getItem('guestWishlist');
        setItems(saved ? JSON.parse(saved) : []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ user is the dependency

  // Load wishlist when user changes
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]); // ✅ Now using loadWishlist as dependency

  const toggleItem = useCallback(async (product) => {
    try {
      if (user) {
        // Logged in user
        const response = await api.toggleWishlist(product.id);
        
        if (response.action === 'added') {
          setItems(prev => [...prev, product]);
          toast.success(`Added ${product.name} to wishlist`);
        } else {
          setItems(prev => prev.filter(i => i.id !== product.id));
          toast.success(`Removed ${product.name} from wishlist`);
        }
        
        return response;
      } else {
        // Guest user
        const exists = items.some(i => i.id === product.id);
        let newItems;
        
        if (exists) {
          newItems = items.filter(i => i.id !== product.id);
          toast.success(`Removed ${product.name} from wishlist`);
        } else {
          newItems = [...items, product];
          toast.success(`Added ${product.name} to wishlist`);
        }
        
        localStorage.setItem('guestWishlist', JSON.stringify(newItems));
        setItems(newItems);
        return { action: exists ? 'removed' : 'added' };
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
      return { action: 'error' };
    }
  }, [user, items]); // ✅ Added all dependencies

  const removeItem = useCallback(async (productId, productName) => {
    try {
      if (user) {
        // Find the wishlist item ID
        const item = items.find(i => i.id === productId);
        if (item?.wishlist_item_id) {
          await api.removeFromWishlist(item.wishlist_item_id);
          await loadWishlist();
        }
      } else {
        const newItems = items.filter(i => i.id !== productId);
        localStorage.setItem('guestWishlist', JSON.stringify(newItems));
        setItems(newItems);
      }
      toast.success(`${productName || 'Item'} removed from wishlist`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.response?.data?.error || 'Failed to remove item');
    }
  }, [user, items, loadWishlist]); // ✅ Added all dependencies

  const clearWishlist = useCallback(async () => {
    try {
      if (user) {
        await api.clearWishlist();
        setItems([]);
      } else {
        localStorage.removeItem('guestWishlist');
        setItems([]);
      }
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error(error.response?.data?.error || 'Failed to clear wishlist');
    }
  }, [user]); // ✅ user is the dependency

  const mergeGuestWishlist = useCallback(async () => {
    if (!user) return;

    const guestWishlist = localStorage.getItem('guestWishlist');
    if (guestWishlist) {
      try {
        const guestItems = JSON.parse(guestWishlist);
        
        for (const product of guestItems) {
          await api.toggleWishlist(product.id);
        }
        
        localStorage.removeItem('guestWishlist');
        await loadWishlist();
        toast.success('Wishlist merged successfully');
      } catch (error) {
        console.error('Error merging wishlist:', error);
      }
    }
  }, [user, loadWishlist]); // ✅ Added all dependencies

  const isInWishlist = useCallback((productId) => {
    return items.some(i => i.id === productId);
  }, [items]); // ✅ items is the dependency

  return {
    items,        // ✅ This is now always an array
    loading,
    toggleItem,
    removeItem,
    clearWishlist,
    mergeGuestWishlist,
    isInWishlist,
    count: items.length,  // ✅ This will never be undefined
    refresh: loadWishlist
  };
};