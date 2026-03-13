// src/hooks/useCart.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api.service';
import toast from 'react-hot-toast';

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart function
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Logged in user - use API
        const response = await api.getCart();
        setItems(response.cart?.items || []);
      } else {
        // Guest user - use localStorage
        const saved = localStorage.getItem('guestCart');
        setItems(saved ? JSON.parse(saved) : []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItem = useCallback(async (product, quantity = 1) => {
    try {
      if (user) {
        // Logged in user
        await api.addToCart(product.id, quantity);
        await loadCart(); // Refresh cart
      } else {
        // Guest user
        const newItems = [...items];
        const existingIndex = newItems.findIndex(i => i.id === product.id);
        
        if (existingIndex >= 0) {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: (newItems[existingIndex].quantity || 1) + quantity
          };
        } else {
          newItems.push({ ...product, quantity });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(newItems));
        setItems(newItems);
      }
      
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
  }, [user, items, loadCart]);

  const removeItem = useCallback(async (productId) => {
    try {
      if (user) {
        // Find the cart item ID
        const item = items.find(i => i.id === productId);
        if (item?.cart_item_id) {
          await api.removeFromCart(item.cart_item_id);
          await loadCart(); // Refresh cart
        }
      } else {
        const newItems = items.filter(i => i.id !== productId);
        localStorage.setItem('guestCart', JSON.stringify(newItems));
        setItems(newItems);
      }
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.response?.data?.error || 'Failed to remove item');
    }
  }, [user, items, loadCart]);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (user) {
        const item = items.find(i => i.id === productId);
        if (item?.cart_item_id) {
          await api.updateCartItem(item.cart_item_id, newQuantity);
          await loadCart(); // Refresh cart
        }
      } else {
        const newItems = items.map(i => 
          i.id === productId ? { ...i, quantity: newQuantity } : i
        );
        localStorage.setItem('guestCart', JSON.stringify(newItems));
        setItems(newItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.error || 'Failed to update quantity');
    }
  }, [user, items, loadCart]);

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await api.clearCart();
        setItems([]);
      } else {
        localStorage.removeItem('guestCart');
        setItems([]);
      }
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(error.response?.data?.error || 'Failed to clear cart');
    }
  }, [user]);

  // ✅ ADD THIS NEW FUNCTION - Checkout
  const checkout = useCallback(async (orderData) => {
    if (!user) {
      toast.error('Please login to checkout');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await api.checkout(
        orderData.shipping_address,
        orderData.payment_method
      );
      
      if (response.success) {
        // Clear local cart state
        setItems([]);
        toast.success('Order placed successfully!');
        return { success: true, order: response.order };
      } else {
        toast.error(response.error || 'Failed to place order');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to place order' 
      };
    }
  }, [user]);

  const mergeGuestCart = useCallback(async () => {
    if (!user) return;

    const guestCart = localStorage.getItem('guestCart');
    if (guestCart) {
      try {
        const guestItems = JSON.parse(guestCart);
        
        // Add each guest item to the user's cart
        for (const item of guestItems) {
          await api.addToCart(item.id, item.quantity || 1);
        }
        
        localStorage.removeItem('guestCart');
        await loadCart();
        toast.success('Cart merged successfully');
      } catch (error) {
        console.error('Error merging cart:', error);
      }
    }
  }, [user, loadCart]);

  // Calculate total price
  const total = items.reduce((sum, item) => 
    sum + (item.price * (item.quantity || 1)), 0
  );

  // Calculate item count
  const count = items.reduce((sum, item) => 
    sum + (item.quantity || 1), 0
  );

  return {
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    mergeGuestCart,
    checkout, // ✅ Now checkout is included
    total,
    count,
    refresh: loadCart
  };
};