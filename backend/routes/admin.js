const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configure multer for Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bowdeluxe/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${timestamp}-${originalName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ========== IMAGE UPLOAD ENDPOINTS (Cloudinary) ==========

// Single image upload
router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    res.json({ 
      success: true, 
      url: req.file.path,
      public_id: req.file.filename,
      secure_url: req.file.path.replace('http://', 'https://')
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Multiple images upload
router.post('/upload/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No images provided' 
      });
    }

    const urls = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    res.json({ 
      success: true, 
      images: urls 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete image from Cloudinary
router.delete('/upload/image', async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'No public_id provided' 
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete image' 
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get optimized image URL
router.get('/image/optimized', (req, res) => {
  const { url, width, height, crop } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  const matches = url.match(/\/v\d+\/(.+?)\./);
  if (!matches) {
    return res.json({ success: true, url });
  }

  const publicId = matches[1];
  
  const optimizedUrl = cloudinary.url(publicId, {
    width: width ? parseInt(width) : 500,
    height: height ? parseInt(height) : 500,
    crop: crop || 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });

  res.json({ 
    success: true, 
    url: optimizedUrl 
  });
});

// ========== PRODUCT MANAGEMENT ==========

// Get all products (with optional filters)
router.get('/products', async (req, res) => {
  try {
    const { category, bestSeller, newArrival, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }
    if (bestSeller === 'true') {
      query = query.eq('is_best_seller', true);
    }
    if (newArrival === 'true') {
      query = query.eq('is_new_arrival', true);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      products: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, price, category' 
      });
    }

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

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk delete products
router.post('/products/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid product IDs' 
      });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) throw error;

    res.json({ success: true, message: `${ids.length} products deleted` });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Duplicate product
router.post('/products/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: original, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { id: _, created_at, updated_at, ...productData } = original;

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

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error duplicating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle product status
router.patch('/products/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body;

    if (!field || !['is_best_seller', 'is_new_arrival'].includes(field)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid field' 
      });
    }

    const { data: product } = await supabase
      .from('products')
      .select(field)
      .eq('id', id)
      .single();

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

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== CATEGORY MANAGEMENT ==========

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({ success: true, categories: data });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and slug are required' 
      });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description,
        image,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, category: data });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, category: data });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== HOMEPAGE CONTENT MANAGEMENT ==========

// Get homepage content
router.get('/content/homepage', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', 'homepage')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ 
      success: true, 
      content: data?.content || {
        hero: {
          title: 'Bowdeluxe',
          subtitle: 'Handcrafted elegance for the modern individual',
          buttonText: 'Explore Collection',
          backgroundImage: ''
        },
        categories: [],
        benefits: [],
        featuredProducts: []
      }
    });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update homepage content
router.put('/content/homepage', async (req, res) => {
  try {
    const { content } = req.body;

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section: 'homepage',
        content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, content: data.content });
  } catch (error) {
    console.error('Error updating homepage content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update hero section
router.put('/content/hero', async (req, res) => {
  try {
    const { content } = req.body;

    const { data: existing } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'homepage')
      .single();

    const updatedContent = {
      ...(existing?.content || {}),
      hero: content
    };

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section: 'homepage',
        content: updatedContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, content: data.content.hero });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update categories section
router.put('/content/categories', async (req, res) => {
  try {
    const { categories } = req.body;

    const { data: existing } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'homepage')
      .single();

    const updatedContent = {
      ...(existing?.content || {}),
      categories
    };

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section: 'homepage',
        content: updatedContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, categories: data.content.categories });
  } catch (error) {
    console.error('Error updating categories section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update benefits section
router.put('/content/benefits', async (req, res) => {
  try {
    const { benefits } = req.body;

    const { data: existing } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'homepage')
      .single();

    const updatedContent = {
      ...(existing?.content || {}),
      benefits
    };

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section: 'homepage',
        content: updatedContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, benefits: data.content.benefits });
  } catch (error) {
    console.error('Error updating benefits section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update featured products
router.put('/content/featured', async (req, res) => {
  try {
    const { productIds } = req.body;

    const { data: existing } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'homepage')
      .single();

    const updatedContent = {
      ...(existing?.content || {}),
      featuredProducts: productIds
    };

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section: 'homepage',
        content: updatedContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section' })
      .select()
      .single();

    if (error) throw error;

    if (productIds && productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      res.json({ success: true, featuredProducts: products });
    } else {
      res.json({ success: true, featuredProducts: [] });
    }
  } catch (error) {
    console.error('Error updating featured products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== USER MANAGEMENT ==========

// Get all users with their stats
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    const usersWithStats = await Promise.all(data.map(async (user) => {
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: totalSpent } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('payment_status', 'paid');

      return {
        ...user,
        order_count: orderCount || 0,
        total_spent: totalSpent || 0
      };
    }));

    res.json({
      success: true,
      users: usersWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single user with details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) throw userError;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    let wishlistItems = [];
    
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', id)
      .maybeSingle();

    if (wishlist) {
      const { data: items, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlist.id);

      if (items && items.length > 0) {
        wishlistItems = await Promise.all(items.map(async (item) => {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.product_id)
            .single();
          
          return {
            ...item,
            product: product || null
          };
        }));
      }
    }

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const lastOrder = orders?.[0] || null;

    const userResponse = { ...user };
    delete userResponse.password_hash;
    delete userResponse.salt;

    res.json({
      success: true,
      user: {
        ...userResponse,
        orders: orders || [],
        wishlist: wishlistItems || [],
        stats: {
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order: lastOrder,
          joined_date: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ORDER MANAGEMENT ==========

// Get all orders with filters
router.get('/orders', async (req, res) => {
  try {
    console.log('Fetching orders with params:', req.query);
    
    const { 
      status, 
      payment_status, 
      search, 
      date_from, 
      date_to,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (payment_status && payment_status !== 'all') {
      query = query.eq('payment_status', payment_status);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    const ordersWithProfiles = await Promise.all(orders.map(async (order) => {
      if (order.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', order.user_id)
          .single();
        
        return {
          ...order,
          profiles: profile || { full_name: 'Guest', email: null }
        };
      }
      return {
        ...order,
        profiles: { full_name: 'Guest', email: null }
      };
    }));

    let filteredOrders = ordersWithProfiles;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = ordersWithProfiles.filter(order => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.profiles?.full_name?.toLowerCase().includes(searchLower) ||
        order.profiles?.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      orders: filteredOrders,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single order with details
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    let profile = null;
    if (order.user_id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', order.user_id)
        .single();
      profile = userProfile;
    }

    const itemsWithProducts = await Promise.all(orderItems.map(async (item) => {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();
        
        return {
          ...item,
          product: product || null
        };
      }
      return {
        ...item,
        product: null
      };
    }));

    res.json({
      success: true,
      order: {
        ...order,
        profiles: profile,
        order_items: itemsWithProducts
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      order: data
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update payment status
router.patch('/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ['unpaid', 'paid', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        payment_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      order: data
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add tracking number
router.patch('/orders/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        tracking_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      order: data
    });
  } catch (error) {
    console.error('Error updating tracking number:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order statistics
router.get('/orders/stats/summary', async (req, res) => {
  try {
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('status, total_amount, payment_status, created_at');

    if (error) throw error;

    const totalOrders = allOrders?.length || 0;
    
    const paidOrders = allOrders?.filter(o => o.payment_status === 'paid') || [];
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    const pending = allOrders?.filter(o => o.status === 'pending').length || 0;
    const processing = allOrders?.filter(o => o.status === 'processing').length || 0;
    const shipped = allOrders?.filter(o => o.status === 'shipped').length || 0;
    const delivered = allOrders?.filter(o => o.status === 'delivered').length || 0;
    const cancelled = allOrders?.filter(o => o.status === 'cancelled').length || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = allOrders?.filter(o => 
      new Date(o.created_at) >= today
    ).length || 0;

    res.json({
      success: true,
      stats: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        pending: pending,
        processing: processing,
        shipped: shipped,
        delivered: delivered,
        cancelled: cancelled,
        today_orders: todayOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export orders to CSV
router.get('/orders/export/csv', async (req, res) => {
  try {
    const { date_from, date_to, status } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `);

    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const csvData = data.map(order => ({
      'Order Number': order.order_number,
      'Customer': order.profiles?.full_name || 'Guest',
      'Email': order.profiles?.email || 'N/A',
      'Date': new Date(order.created_at).toLocaleDateString(),
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Total': order.total_amount,
      'Items': JSON.stringify(order.order_items || [])
    }));

    res.json({
      success: true,
      data: csvData
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DASHBOARD STATISTICS ==========

router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    const responseData = {
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      totalRevenue: 0,
      recentOrders: [],
      monthlySales: [],
      orderStatus: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      },
      topProducts: [],
      categoryDistribution: []
    };

    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (!error) responseData.totalOrders = count || 0;
    } catch (err) {}

    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!error) responseData.totalProducts = count || 0;
    } catch (err) {}

    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!error) responseData.totalUsers = count || 0;
    } catch (err) {}

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      if (!error) {
        responseData.totalRevenue = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      }
    } catch (err) {}

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error in dashboard stats:', error);
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: [],
        monthlySales: [],
        orderStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        },
        topProducts: [],
        categoryDistribution: []
      }
    });
  }
});

module.exports = router;