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
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Apply authentication to all wishlist routes
router.use(authenticateToken);

// GET /api/wishlist - Get user's wishlist
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching wishlist for user:', userId);

    // Get or create wishlist
    let { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (wishlistError) throw wishlistError;

    // Create wishlist if doesn't exist
    if (!wishlist) {
      const { data: newWishlist, error: createError } = await supabase
        .from('wishlists')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (createError) throw createError;
      wishlist = newWishlist;
    }

    // Get wishlist items with product details
    const { data: items, error: itemsError } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product:products(*)
      `)
      .eq('wishlist_id', wishlist.id);

    if (itemsError) throw itemsError;

    // Extract products from items
    const products = (items || []).map(item => ({
      ...item.product,
      wishlist_item_id: item.id
    }));

    res.json({
      success: true,
      wishlist: {
        id: wishlist.id,
        items: products
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wishlist/toggle - Toggle item in wishlist
router.post('/toggle', async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    console.log('Toggling wishlist:', { userId, productId });

    // Get or create wishlist
    let { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (wishlistError) throw wishlistError;

    if (!wishlist) {
      const { data: newWishlist, error: createError } = await supabase
        .from('wishlists')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (createError) throw createError;
      wishlist = newWishlist;
    }

    // Check if item exists
    const { data: existing, error: existingError } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlist.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;

      res.json({ success: true, action: 'removed' });
    } else {
      // Add to wishlist
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert({
          wishlist_id: wishlist.id,
          product_id: productId
        });

      if (insertError) throw insertError;

      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/wishlist/item/:itemId - Remove specific item
router.delete('/item/:itemId', async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    // Get the wishlist item to verify ownership
    const { data: item, error: itemError } = await supabase
      .from('wishlist_items')
      .select('wishlist_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Verify wishlist belongs to user
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', item.wishlist_id)
      .single();

    if (wishlistError || !wishlist || wishlist.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's wishlist
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (wishlistError) {
      // No wishlist exists, that's fine
      return res.json({ success: true, message: 'Wishlist cleared' });
    }

    // Delete all items
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;