// App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import ProductPage from './pages/ProductPage/ProductPage';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import AdminLayout from './pages/Admin/AdminLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProfileLayout from './pages/Profile/ProfileLayout';
import Checkout from './pages/Checkout/Checkout';

// Create a separate component for the app content that uses hooks
const AppContent = () => {
  const { mergeGuestCart } = useCart();
  const { mergeGuestWishlist } = useWishlist();

  useEffect(() => {
    const handleLogin = () => {
      console.log('🎉 User logged in - merging guest data');
      mergeGuestCart();
      mergeGuestWishlist();
    };

    window.addEventListener('user-logged-in', handleLogin);
    return () => window.removeEventListener('user-logged-in', handleLogin);
  }, [mergeGuestCart, mergeGuestWishlist]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="category/:category" element={<CategoryPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify" element={<VerifyEmail />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      } />
      
      {/* Profile Routes */}
      <Route path="/profile/*" element={
        <ProtectedRoute>
          <ProfileLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;