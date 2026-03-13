// src/pages/Profile/ProfileOrders.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiClock, FiEye, FiX, FiMapPin, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.service'; // ✅ Use API instead of db
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getUserOrders(); // ✅ Using API
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.getOrderById(orderId); // ✅ Using API
      setSelectedOrder(response.order);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <FiPackage className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <FiTruck className="w-5 h-5 text-purple-500" />;
      case 'pending': return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled': return <FiXCircle className="w-5 h-5 text-red-500" />;
      default: return <FiPackage className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-gray-800">My Orders</h2>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Order Info */}
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Order Stats */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-rose-600">₱{order.total_amount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="font-semibold">{order.order_items?.length || 0}</p>
                  </div>
                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Preview */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {order.order_items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          +{order.order_items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Order Details Modal (same as before, but with proper null checks)
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

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
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {order.status}
              </span>
            </div>
            {order.tracking_number && (
              <p className="text-sm text-gray-600">
                Tracking: <span className="font-medium">{order.tracking_number}</span>
              </p>
            )}
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FiMapPin className="w-4 h-4 mr-2 text-rose-500" />
                Shipping Address
              </h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{order.shipping_address.street}</p>
                <p className="text-gray-700">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p className="text-gray-700">{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-3">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-rose-600">₱{item.price?.toLocaleString() || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Summary</h4>
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
                <span className="text-rose-600">₱{order.total_amount?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {order.payment_method && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FiCreditCard className="w-4 h-4 mr-2 text-rose-500" />
                Payment Method
              </h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{order.payment_method}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileOrders;