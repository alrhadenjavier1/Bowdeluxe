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

// Apply authentication to all order routes
router.use(authenticateToken);

// GET /api/orders - Get user's orders
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    console.log('Fetching orders for user:', userId);

    // Get user's orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Get order items for each order
    const ordersWithItems = await Promise.all((orders || []).map(async (order) => {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      return {
        ...order,
        order_items: items || []
      };
    }));

    res.json({
      success: true,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/:orderId - Get specific order
router.get('/:orderId', async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    res.json({
      success: true,
      order: {
        ...order,
        order_items: items || []
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders/create - Create new order
router.post('/create', async (req, res) => {
  try {
    const userId = req.userId;
    const { items, shipping_address, payment_method, total_amount } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    if (!shipping_address) {
      return res.status(400).json({ success: false, error: 'Shipping address required' });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'unpaid',
        total_amount,
        shipping_address,
        payment_method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear the cart after successful order
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
    }

    res.json({
      success: true,
      order: {
        ...order,
        order_items: orderItems
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
    

// POST /api/orders/checkout - Complete checkout process
router.post('/checkout', async (req, res) => {
  try {
    const userId = req.userId;
    const { shipping_address, payment_method } = req.body;

    console.log('🔍 Checkout - User ID:', userId);
    console.log('🔍 Checkout - Shipping Address:', shipping_address);
    console.log('🔍 Checkout - Payment Method:', payment_method);

    // Validate required fields
    if (!shipping_address) {
      console.log('❌ Checkout - Missing shipping address');
      return res.status(400).json({ success: false, error: 'Shipping address required' });
    }

    // Get user's cart
    console.log('🔍 Fetching cart for user:', userId);
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cartError) {
      console.log('❌ Cart error:', cartError);
      return res.status(400).json({ success: false, error: 'Cart not found' });
    }
    console.log('✅ Cart found:', cart.id);

    // Get cart items with product details
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products(*)
      `)
      .eq('cart_id', cart.id);

    if (itemsError) {
      console.log('❌ Items error:', itemsError);
      throw itemsError;
    }

    console.log(`✅ Found ${cartItems?.length || 0} items in cart`);

    if (!cartItems || cartItems.length === 0) {
      console.log('❌ Cart is empty');
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Calculate total
    const total_amount = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    console.log('💰 Total amount:', total_amount);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log('📦 Order number:', orderNumber);

    // Create order
    console.log('📝 Creating order in database...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'unpaid',
        total_amount,
        shipping_address,  // ✅ JSONB column - works perfectly
        payment_method: payment_method || 'Cash on Delivery',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.log('❌ Order creation error:', orderError);
      throw orderError;
    }
    console.log('✅ Order created:', order.id);

    // Create order items - ✅ FIXED to match schema exactly
    console.log('📝 Creating order items...');
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,        // ✅ Required field
      product_price: item.product.price,      // ✅ Required field (exactly as in schema)
      quantity: item.quantity                  // ✅ Required field
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.log('❌ Order items error:', orderItemsError);
      console.log('❌ Error details:', orderItemsError);
      throw orderItemsError;
    }
    console.log(`✅ Created ${orderItems.length} order items`);

    // Clear the cart
    console.log('🧹 Clearing cart...');
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);
    console.log('✅ Cart cleared');

    res.json({
      success: true,
      order: {
        ...order,
        order_items: orderItems
      }
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.details || 'Check server logs for more information'
    });
  }
});

module.exports = router;