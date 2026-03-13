// src/components/Cart/CartPreview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';

const CartPreview = ({ onClose }) => {
  // ✅ Use the new API
  const { items, removeItem, updateQuantity, total, loading } = useCart();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full mb-3" />
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <FiShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Your cart is empty</p>
          <button
            onClick={onClose}
            className="mt-4 text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-display text-lg font-semibold">Shopping Bag</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 border-b border-gray-100 flex space-x-3"
          >
            <img
              src={item.images?.[0] || 'https://via.placeholder.com/64'}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <Link to={`/product/${item.id}`} onClick={onClose}>
                <h4 className="font-medium text-gray-800 hover:text-primary-600 transition-colors">
                  {item.name}
                </h4>
              </Link>
              <p className="text-sm text-primary-600 font-semibold mt-1">
                {formatPrice(item.price)}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 text-gray-600 hover:text-primary-600"
                  >
                    -
                  </button>
                  <span className="px-2 py-1 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 text-gray-600 hover:text-primary-600"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex justify-between mb-3">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold text-primary-600">
            {formatPrice(total)}
          </span>
        </div>
        
        <Link to="/cart" onClick={onClose}>
          <motion.button
            className="w-full bg-primary-500 text-white py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Cart
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default CartPreview;