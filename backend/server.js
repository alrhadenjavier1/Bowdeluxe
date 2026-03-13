require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');        // New
const wishlistRoutes = require('./routes/wishlist'); // New
const ordersRoutes = require('./routes/orders');    // New

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);           // New
app.use('/api/wishlist', wishlistRoutes);   // New
app.use('/api/orders', ordersRoutes);       // New

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment loaded:', {
    supabaseUrl: !!process.env.SUPABASE_URL,
    serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
  });
});

module.exports = app;