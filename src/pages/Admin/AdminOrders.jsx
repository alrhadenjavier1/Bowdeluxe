// src/pages/Admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiClock, FiSearch, FiFilter, FiEye, FiDownload,
  FiCalendar, FiDollarSign, FiMapPin, FiUser,
  FiCreditCard, FiPrinter, FiMail, FiX, FiSave,
  FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import db from '../../services/db.service';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    today_orders: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [searchTerm, statusFilter, paymentFilter, dateRange.from, dateRange.to, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/orders', {
        params: {
          search: searchTerm,
          status: statusFilter,
          payment_status: paymentFilter,
          date_from: dateRange.from,
          date_to: dateRange.to,
          page: pagination.page,
          limit: 10
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination({
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/orders/stats/summary');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        toast.success(`Order status updated to ${newStatus}`);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}/payment`, {
        payment_status: newStatus
      });

      if (response.data.success) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, payment_status: newStatus } : o
        ));
        toast.success(`Payment status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.response?.data?.error || 'Failed to update payment status');
    }
  };

  const addTrackingNumber = async (orderId, trackingNumber) => {
    try {
      const response = await axios.patch(`/admin/orders/${orderId}/tracking`, {
        tracking_number: trackingNumber
      });

      if (response.data.success) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, tracking_number: trackingNumber } : o
        ));
        toast.success('Tracking number added');
      }
    } catch (error) {
      console.error('Error adding tracking number:', error);
      toast.error(error.response?.data?.error || 'Failed to add tracking number');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/admin/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setIsOrderModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const exportOrders = async () => {
    try {
      const response = await axios.get('/admin/orders/export/csv', {
        params: {
          date_from: dateRange.from,
          date_to: dateRange.to,
          status: statusFilter
        }
      });

      if (response.data.success) {
        // Create CSV
        const ws = XLSX.utils.json_to_sheet(response.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `orders_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        
        toast.success('Orders exported successfully');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <FiCheckCircle className="w-4 h-4" />;
      case 'processing': return <FiPackage className="w-4 h-4" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'cancelled': return <FiXCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'cancelled': return 'bg-rose-100 text-rose-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentColor = (payment) => {
    switch(payment) {
      case 'paid': return 'text-emerald-600 bg-emerald-50';
      case 'unpaid': return 'text-amber-600 bg-amber-50';
      case 'refunded': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="font-display text-2xl font-bold text-gray-800">Order Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.total_orders}
          icon={FiPackage}
          color="from-blue-500 to-indigo-500"
        />
        <StatCard
          label="Total Revenue"
          value={`₱${stats.total_revenue.toLocaleString()}`}
          icon={FiDollarSign}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={FiClock}
          color="from-amber-500 to-orange-500"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={FiPackage}
          color="from-blue-500 to-indigo-500"
        />
        <StatCard
          label="Shipped"
          value={stats.shipped}
          icon={FiTruck}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={FiCheckCircle}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Today"
          value={stats.today_orders}
          icon={FiCalendar}
          color="from-rose-500 to-red-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 border rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="w-5 h-5" />
              <span>More Filters</span>
            </button>

            {/* Export Button */}
            <button
              onClick={exportOrders}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Order</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{order.order_number}</p>
                      {order.tracking_number && (
                        <p className="text-xs text-gray-500">Track: {order.tracking_number}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{order.profiles?.full_name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    ₱{order.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-rose-300`}
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.payment_status}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.payment_status)} border-0 focus:ring-2 focus:ring-rose-300`}
                    >
                      <option value="unpaid">unpaid</option>
                      <option value="paid">paid</option>
                      <option value="refunded">refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => viewOrderDetails(order.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <FiEye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} orders
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      pagination.page === pageNum
                        ? 'bg-rose-500 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setIsOrderModalOpen(false)}
            onUpdateStatus={updateOrderStatus}
            onUpdatePayment={updatePaymentStatus}
            onAddTracking={addTrackingNumber}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
  </motion.div>
);

// Order Details Modal
const OrderDetailsModal = ({ order, onClose, onUpdateStatus, onUpdatePayment, onAddTracking }) => {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [isEditingTracking, setIsEditingTracking] = useState(false);

  const handleAddTracking = () => {
    onAddTracking(order.id, trackingNumber);
    setIsEditingTracking(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-gray-800">
                Order {order.order_number}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy h:mm a')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FiUser className="w-4 h-4 mr-2 text-rose-500" />
                  Customer Information
                </h4>
                <p className="text-gray-700">{order.profiles?.full_name || 'Guest'}</p>
                <p className="text-gray-600 text-sm">{order.profiles?.email}</p>
                {order.profiles?.phone && (
                  <p className="text-gray-600 text-sm">{order.profiles.phone}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.payment_status)}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiMapPin className="w-4 h-4 mr-2 text-rose-500" />
              Shipping Address
            </h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700">{order.shipping_address?.street}</p>
              <p className="text-gray-700">
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
              </p>
              <p className="text-gray-700">{order.shipping_address?.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiPackage className="w-4 h-4 mr-2 text-rose-500" />
              Order Items
            </h4>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-3">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                    <p className="font-bold text-rose-600">₱{item.product_price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiDollarSign className="w-4 h-4 mr-2 text-rose-500" />
              Order Summary
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₱{(order.total_amount - (order.shipping_fee || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₱{(order.shipping_fee || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-rose-600">₱{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiCreditCard className="w-4 h-4 mr-2 text-rose-500" />
              Payment Method
            </h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700">{order.payment_method || 'Not specified'}</p>
            </div>
          </div>

          {/* Tracking Number */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiTruck className="w-4 h-4 mr-2 text-rose-500" />
              Tracking Information
            </h4>
            <div className="bg-gray-50 rounded-xl p-4">
              {isEditingTracking ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <button
                    onClick={handleAddTracking}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingTracking(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {order.tracking_number || 'No tracking number added'}
                  </p>
                  <button
                    onClick={() => setIsEditingTracking(true)}
                    className="text-rose-500 hover:text-rose-600 text-sm font-medium"
                  >
                    {order.tracking_number ? 'Update' : 'Add Tracking'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Update Status</h4>
            <div className="flex space-x-2">
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <FiPrinter className="w-5 h-5" />
              <span>Print Invoice</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FiMail className="w-5 h-5" />
              <span>Email Customer</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminOrders;