// src/pages/Admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiPackage, FiUsers, FiShoppingBag, 
  FiSettings, FiImage, FiBarChart2,
  FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminContent from './AdminContent';
import AdminSettings from './AdminSettings';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // Check if user is admin
  // Update the isAdmin check to be more robust
const isAdmin = user?.role === 'admin' || profile?.role === 'admin' || user?.user_metadata?.role === 'admin';

  console.log('AdminLayout - isAdmin:', isAdmin);
  console.log('AdminLayout - user:', user);
  console.log('AdminLayout - profile:', profile);

  if (!isAdmin) {
    console.log('Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', icon: FiHome, label: 'Overview' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/content', icon: FiImage, label: 'Content Manager' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full bg-white shadow-2xl z-50 overflow-hidden"
      >
        <div className="relative h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <motion.div
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="font-display text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
            >
              {isSidebarOpen ? 'Admin Panel' : 'AP'}
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl mb-2 transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isSidebarOpen && (
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="font-display text-xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{profile?.full_name || user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;