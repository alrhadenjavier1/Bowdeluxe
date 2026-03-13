// src/pages/Admin/AdminOverview.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, FiPackage, FiUsers, FiShoppingBag,
  FiTrendingUp, FiTrendingDown, FiClock, FiCheckCircle,
  FiXCircle, FiTruck
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import api from '../../services/api.service'; // ✅ Use API service
import adminService from '../../services/admin.service'; // ✅ Use admin service
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../../components/UI/BackButton';

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: '+0%',
    ordersChange: '+0%',
    productsChange: '+0%',
    usersChange: '+0%'
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Single call to get all dashboard data
    await fetchStats();

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
  try {
    // Get dashboard stats from admin service
    const statsResponse = await adminService.getDashboardStats();
    
    if (statsResponse.success) {
      const data = statsResponse.data;
      
      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalProducts: data.totalProducts || 0,
        totalUsers: data.totalUsers || 0,
        revenueChange: data.totalRevenue > 0 ? '+12%' : '0%',
        ordersChange: data.totalOrders > 0 ? '+8%' : '0%',
        productsChange: data.totalProducts > 0 ? '+5%' : '0%',
        usersChange: data.totalUsers > 0 ? '+15%' : '0%'
      });
      
      // Set recent orders
      if (data.recentOrders && data.recentOrders.length > 0) {
        const formattedOrders = data.recentOrders.map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.profiles?.full_name || 'Guest',
          amount: order.total_amount,
          status: order.status,
          date: format(new Date(order.created_at), 'MMM dd, yyyy')
        }));
        setRecentOrders(formattedOrders);
      }
      
      // Set monthly sales
      if (data.monthlySales && data.monthlySales.length > 0) {
        setSalesData(data.monthlySales);
      }
      
      // Set order status data
      if (data.orderStatus) {
        const statusData = [
          { name: 'Pending', value: data.orderStatus.pending || 0 },
          { name: 'Processing', value: data.orderStatus.processing || 0 },
          { name: 'Shipped', value: data.orderStatus.shipped || 0 },
          { name: 'Delivered', value: data.orderStatus.delivered || 0 },
          { name: 'Cancelled', value: data.orderStatus.cancelled || 0 }
        ].filter(item => item.value > 0);
        setOrderStatusData(statusData);
      }
      
      // Set top products
      if (data.topProducts && data.topProducts.length > 0) {
        setTopProducts(data.topProducts);
      }
      
      // Set category distribution
      if (data.categoryDistribution && data.categoryDistribution.length > 0) {
        const total = data.categoryDistribution.reduce((sum, cat) => sum + cat.value, 0);
        const categoryPercentages = data.categoryDistribution.map(cat => ({
          name: cat.name,
          value: Math.round((cat.value / total) * 100)
        }));
        setCategoryData(categoryPercentages);
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

  const fetchRecentOrders = async () => {
    try {
      // Get recent orders from admin service
      const ordersResponse = await adminService.getOrders({ limit: 5 });
      
      if (ordersResponse.success) {
        const formattedOrders = (ordersResponse.orders || []).map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.profiles?.full_name || 'Guest',
          amount: order.total_amount,
          status: order.status,
          date: format(new Date(order.created_at), 'MMM dd, yyyy')
        }));
        setRecentOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setRecentOrders([]);
    }
  };

  const fetchSalesData = async () => {
    try {
      // Get orders for sales data
      const ordersResponse = await adminService.getOrders();
      
      if (ordersResponse.success) {
        const orders = ordersResponse.orders || [];
        
        // Group by month
        const salesByMonth = {};
        orders.forEach(order => {
          const month = format(new Date(order.created_at), 'MMM');
          salesByMonth[month] = (salesByMonth[month] || 0) + order.total_amount;
        });

        // Convert to array format for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(month => ({
          month,
          sales: salesByMonth[month] || 0
        })).filter(d => d.sales > 0).slice(-6); // Last 6 months with data

        setSalesData(data.length ? data : [
          { month: 'Jan', sales: 45000 },
          { month: 'Feb', sales: 52000 },
          { month: 'Mar', sales: 48000 },
          { month: 'Apr', sales: 61000 },
          { month: 'May', sales: 58000 },
          { month: 'Jun', sales: 72000 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
    }
  };

  const fetchCategoryData = async () => {
  try {
    // Get products for category distribution
    const productsResponse = await adminService.getProducts();
    
    if (productsResponse.success) {
      const products = productsResponse.products || [];
      
      if (products.length > 0) {
        // Group by category
        const categoryCount = {};
        products.forEach(product => {
          const category = product.category || 'Uncategorized';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const total = products.length;
        const data = Object.entries(categoryCount).map(([name, count]) => ({
          name,
          value: Math.round((count / total) * 100)
        }));

        setCategoryData(data);
      } else {
        // Fallback to empty data
        setCategoryData([]);
      }
    }
  } catch (error) {
    console.error('Error fetching category data:', error);
    setCategoryData([]);
  }
};

  const fetchOrderStatusData = async () => {
    try {
      // Get order stats from admin service
      const statsResponse = await adminService.getOrderStats();
      
      if (statsResponse.success) {
        const stats = statsResponse.stats;
        setOrderStatusData([
          { name: 'Pending', value: stats.pending || 0 },
          { name: 'Processing', value: stats.processing || 0 },
          { name: 'Shipped', value: stats.shipped || 0 },
          { name: 'Delivered', value: stats.delivered || 0 },
          { name: 'Cancelled', value: stats.cancelled || 0 }
        ].filter(item => item.value > 0));
      } else {
        // Fallback to mock data
        setOrderStatusData([
          { name: 'Pending', value: 15 },
          { name: 'Processing', value: 25 },
          { name: 'Shipped', value: 20 },
          { name: 'Delivered', value: 35 },
          { name: 'Cancelled', value: 5 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching order status data:', error);
      setOrderStatusData([]);
    }
  };

  const fetchTopProducts = async () => {
  try {
    // Get all orders to calculate real sales data
    const ordersResponse = await adminService.getOrders();
    
    if (ordersResponse.success) {
      const orders = ordersResponse.orders || [];
      
      // Create a map to track product sales
      const productSales = {};
      
      // Loop through all orders and their items
      orders.forEach(order => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach(item => {
            const productId = item.product_id || item.product?.id;
            const productName = item.product_name || item.product?.name;
            const quantity = item.quantity || 0;
            const price = item.price || item.product?.price || 0;
            
            if (productId) {
              if (!productSales[productId]) {
                productSales[productId] = {
                  id: productId,
                  name: productName || 'Unknown Product',
                  quantity: 0,
                  revenue: 0,
                  image: item.product?.images?.[0]
                };
              }
              productSales[productId].quantity += quantity;
              productSales[productId].revenue += quantity * price;
            }
          });
        }
      });

      // Convert to array and sort by quantity sold
      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Get top 5

      // If we have real sales data, use it
      if (sortedProducts.length > 0) {
        setTopProducts(sortedProducts);
      } else {
        // If no sales data, show empty state
        setTopProducts([]);
      }
    } else {
      setTopProducts([]);
    }
  } catch (error) {
    console.error('Error fetching top products:', error);
    setTopProducts([]);
  }
};

  const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <BackButton to="/" label="← Back to Homepage" />
        <h2 className="font-display text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={FiDollarSign}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={FiShoppingBag}
          color="from-blue-500 to-indigo-500"
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change={stats.productsChange}
          icon={FiPackage}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={FiUsers}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">Sales Overview (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold text-gray-800">Recent Orders</h3>
            <button className="text-rose-600 hover:text-rose-700 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      order.status === 'delivered' ? 'bg-green-100' :
                      order.status === 'processing' ? 'bg-blue-100' :
                      order.status === 'shipped' ? 'bg-purple-100' :
                      order.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {order.status === 'delivered' && <FiCheckCircle className="w-4 h-4 text-green-600" />}
                      {order.status === 'processing' && <FiPackage className="w-4 h-4 text-blue-600" />}
                      {order.status === 'shipped' && <FiTruck className="w-4 h-4 text-purple-600" />}
                      {order.status === 'pending' && <FiClock className="w-4 h-4 text-yellow-600" />}
                      {order.status === 'cancelled' && <FiXCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">₱{order.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-6">Top Selling Products</h3>

          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">₱{product.revenue?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No products data</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, change, icon: Icon, color }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {isPositive ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
          {change}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-500 text-sm">{label}</p>
    </motion.div>
  );
};

export default AdminOverview;