// src/services/db.service.js
import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js'; // ✅ Import directly at the top

class DatabaseService {
  // Get auth token
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  setAuthToken() {
    const token = this.getAuthToken();
    if (token) {
      // This sets the auth token for the existing supabase client
      supabase.auth.setAuth(token);
    }
    return token;
  }

  // Get authenticated client - SIMPLIFIED
  getClient() {
    const token = this.getAuthToken();
    
    if (!token) {
      console.warn('⚠️ No auth token found, using default client');
      return supabase;
    }
    

    console.log('🔐 Creating authenticated client with token');
    
    // Create new client with token
    return createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.REACT_APP_SUPABASE_ANON_KEY
          }
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );
  }

  // ========== CART METHODS ==========
  
  async getCart(userId) {
    try {
      console.log('Getting cart for user:', userId);
      this.setAuthToken(); // Set the token before making requests
      
      // Get cart
      let { data: cart, error } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Create cart if doesn't exist
      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: userId })
          .select('id')
          .single();
          
        if (createError) throw createError;
        cart = newCart;
      }

      // Get cart items
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products(*)
        `)
        .eq('cart_id', cart.id);

      if (itemsError) throw itemsError;

      return { id: cart.id, items: items || [] };
    } catch (error) {
      console.error('getCart error:', error);
      return { id: null, items: [] };
    }
  }

  async addToCart(userId, productId, quantity = 1) {
    try {
      console.log('Adding to cart:', { userId, productId, quantity });
      const client = this.getClient();
      
      // Get cart
      let { data: cart } = await client
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      // Create cart if needed
      if (!cart) {
        const { data: newCart } = await client
          .from('carts')
          .insert({ user_id: userId })
          .select('id')
          .single();
        cart = newCart;
      }

      // Check if item exists
      const { data: existing } = await client
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Update
        await client
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        // Insert
        await client
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity
          });
      }

      return true;
    } catch (error) {
      console.error('addToCart error:', error);
      throw error;
    }
  }

  async removeFromCart(cartItemId) {
    try {
      const client = this.getClient();
      await client
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
      return true;
    } catch (error) {
      console.error('removeFromCart error:', error);
      throw error;
    }
  }

  async updateQuantity(cartItemId, quantity) {
    try {
      const client = this.getClient();
      await client
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);
      return true;
    } catch (error) {
      console.error('updateQuantity error:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const client = this.getClient();
      const { data: cart } = await client
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (cart) {
        await client
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);
      }
      return true;
    } catch (error) {
      console.error('clearCart error:', error);
      throw error;
    }
  }

  // ========== WISHLIST METHODS ==========
  
  async getWishlist(userId) {
    try {
      console.log('Getting wishlist for user:', userId);
      const client = this.getClient();
      
      // Get wishlist
      let { data: wishlist, error } = await client
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Create if doesn't exist
      if (!wishlist) {
        const { data: newWishlist, error: createError } = await client
          .from('wishlists')
          .insert({ user_id: userId })
          .select('id')
          .single();
          
        if (createError) throw createError;
        wishlist = newWishlist;
      }

      // Get items
      const { data: items, error: itemsError } = await client
        .from('wishlist_items')
        .select(`
          id,
          product:products(*)
        `)
        .eq('wishlist_id', wishlist.id);

      if (itemsError) throw itemsError;

      return { id: wishlist.id, items: items || [] };
    } catch (error) {
      console.error('getWishlist error:', error);
      return { id: null, items: [] };
    }
  }

  async toggleWishlist(userId, productId) {
    try {
      console.log('Toggling wishlist:', { userId, productId });
      const client = this.getClient();
      
      // Get wishlist
      let { data: wishlist } = await client
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wishlist) {
        const { data: newWishlist } = await client
          .from('wishlists')
          .insert({ user_id: userId })
          .select('id')
          .single();
        wishlist = newWishlist;
      }

      // Check if exists
      const { data: existing } = await client
        .from('wishlist_items')
        .select('id')
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Remove
        await client
          .from('wishlist_items')
          .delete()
          .eq('id', existing.id);
        return { action: 'removed' };
      } else {
        // Add
        await client
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlist.id,
            product_id: productId
          });
        return { action: 'added' };
      }
    } catch (error) {
      console.error('toggleWishlist error:', error);
      throw error;
    }
  }

  async clearWishlist(userId) {
    try {
      const client = this.getClient();
      const { data: wishlist } = await client
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (wishlist) {
        await client
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlist.id);
      }
      return true;
    } catch (error) {
      console.error('clearWishlist error:', error);
      throw error;
    }
  }

  // ========== ORDER METHODS ==========
  
  async getUserOrders(userId) {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getUserOrders error:', error);
      return [];
    }
  }

  async createOrder(userId, orderData) {
    try {
      console.log('Creating order for user:', userId);
      const client = this.getClient();
      
      const { data, error } = await client
        .from('orders')
        .insert([{
          user_id: userId,
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'pending',
          payment_status: 'unpaid',
          total_amount: orderData.total_amount || 0,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async checkout(userId, orderData) {
    try {
      console.log('Processing checkout for user:', userId);
      
      // Create the order
      const order = await this.createOrder(userId, orderData);
      
      // Get cart items to create order items
      const cart = await this.getCart(userId);
      
      if (cart.items && cart.items.length > 0) {
        const client = this.getClient();
        
        // Create order items for each cart item
        for (const item of cart.items) {
          await client
            .from('order_items')
            .insert({
              order_id: order.id,
              product_id: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            });
        }
        
        // Clear the cart
        await this.clearCart(userId);
      }
      
      return { success: true, order };
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }
}

export default new DatabaseService();