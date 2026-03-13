const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    // Verify JWT (you'll need to import jwt at the top)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Apply authentication to all cart routes
router.use(authenticateToken);

// GET /api/cart - Get user's cart
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching cart for user:', userId);

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) throw cartError;

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

    // Get cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products(*)
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    // Format items to include cart_item_id for easy reference
    const formattedItems = (items || []).map(item => ({
      id: item.product.id,
      cart_item_id: item.id,
      quantity: item.quantity,
      ...item.product
    }));

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items: formattedItems
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    console.log('Adding to cart:', { userId, productId, quantity });

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) throw cartError;

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (createError) throw createError;
      cart = newCart;
    }

    // Check if item already exists
    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity
        });

      if (insertError) throw insertError;
    }

    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cart/item/:itemId - Update quantity
router.put('/item/:itemId', async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }

    // Verify the item belongs to the user
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select('cart_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Verify cart belongs to user
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('user_id')
      .eq('id', item.cart_id)
      .single();

    if (cartError || !cart || cart.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Update quantity
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Quantity updated' });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cart/item/:itemId - Remove item from cart
router.delete('/item/:itemId', async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    // Verify the item belongs to the user
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select('cart_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Verify cart belongs to user
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('user_id')
      .eq('id', item.cart_id)
      .single();

    if (cartError || !cart || cart.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cartError) {
      // No cart exists, that's fine
      return res.json({ success: true, message: 'Cart cleared' });
    }

    // Delete all items
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;