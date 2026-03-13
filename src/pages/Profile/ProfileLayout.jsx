// src/pages/Profile/ProfileLayout.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiPackage, FiHeart, FiMapPin,
  FiSettings, FiLogOut, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import ProfileOverview from './ProfileOverview';
import ProfileOrders from './ProfileOrders';
import ProfileWishlist from './ProfileWishlist';
import ProfileAddresses from './ProfileAddresses';
import ProfileSettings from './ProfileSettings';

const ProfileLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navItems = [
    { path: '/profile', icon: FiUser, label: 'Overview' },
    { path: '/profile/orders', icon: FiPackage, label: 'My Orders' },
    { path: '/profile/wishlist', icon: FiHeart, label: 'Wishlist' },
    { path: '/profile/addresses', icon: FiMapPin, label: 'Addresses' },
    { path: '/profile/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-80"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 bg-gradient-to-r from-rose-500 to-purple-600">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-white">
                    <h3 className="font-display font-bold">{profile?.full_name || 'User'}</h3>
                    <p className="text-sm opacity-90">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-colors ${
                          isActive 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <FiChevronRight className={`w-4 h-4 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`} />
                      </motion.div>
                    </Link>
                  );
                })}

                <button
                  onClick={signOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 mt-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route index element={<ProfileOverview />} />
                  <Route path="orders" element={<ProfileOrders />} />
                  <Route path="wishlist" element={<ProfileWishlist />} />
                  <Route path="addresses" element={<ProfileAddresses />} />
                  <Route path="settings" element={<ProfileSettings />} />
                </Routes>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;