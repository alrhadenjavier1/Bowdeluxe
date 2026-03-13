require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - FIXED VERSION
const allowedOrigins = [
  'http://localhost:3000',
  'https://bowdeluxe-c08knaisx-this-is-radenzs-projects.vercel.app',
  'https://bowdeluxe-2mzfb7wgb-this-is-radenzs-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment loaded:', {
      supabaseUrl: !!process.env.SUPABASE_URL,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
  });
}

// Export for Vercel
module.exports = app;