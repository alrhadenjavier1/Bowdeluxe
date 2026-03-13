// src/pages/Profile/ProfileOverview.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPackage, FiHeart, FiMapPin, FiSettings,
  FiShoppingBag, FiClock, FiCheckCircle, FiTruck
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import api from '../../services/api.service'; // ✅ Use API service instead of db
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProfileOverview = () => {
  const { user, profile } = useAuth();
  const { items: wishlistItems } = useWishlist(); // ✅ Fixed: use items instead of wishlist
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get orders using API
      const ordersResponse = await api.getUserOrders();
      const orders = ordersResponse.orders || [];
      setRecentOrders(orders.slice(0, 3));
      
      // Calculate stats
      const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      setStats({
        totalOrders: orders.length,
        totalSpent,
        wishlistCount: wishlistItems?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: FiShoppingBag, 
      label: 'Continue Shopping', 
      path: '/',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      icon: FiHeart, 
      label: 'View Wishlist', 
      path: '/profile/wishlist',
      color: 'from-rose-500 to-pink-500'
    },
    { 
      icon: FiMapPin, 
      label: 'Manage Addresses', 
      path: '/profile/addresses',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: FiSettings, 
      label: 'Account Settings', 
      path: '/profile/settings',
      color: 'from-purple-500 to-violet-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {profile?.full_name || 'User'}!
        </h2>
        <p className="text-gray-500">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
          <p className="text-sm opacity-90">Total Orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white"
        >
          <p className="text-3xl font-bold mb-1">₱{stats.totalSpent.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total Spent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-6 text-white"
        >
          <p className="text-3xl font-bold mb-1">{stats.wishlistCount}</p>
          <p className="text-sm opacity-90">Items in Wishlist</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-display text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all`}>
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold text-gray-800">Recent Orders</h3>
          <Link to="/profile/orders" className="text-rose-600 hover:text-rose-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    order.status === 'delivered' ? 'bg-green-100' :
                    order.status === 'processing' ? 'bg-blue-100' :
                    order.status === 'shipped' ? 'bg-purple-100' :
                    order.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {order.status === 'delivered' && <FiCheckCircle className="w-5 h-5 text-green-600" />}
                    {order.status === 'processing' && <FiPackage className="w-5 h-5 text-blue-600" />}
                    {order.status === 'shipped' && <FiTruck className="w-5 h-5 text-purple-600" />}
                    {order.status === 'pending' && <FiClock className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-rose-600">₱{order.total_amount?.toLocaleString() || 0}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Link
              to="/"
              className="inline-block mt-4 text-rose-600 hover:text-rose-700 text-sm font-medium"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOverview;