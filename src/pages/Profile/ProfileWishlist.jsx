// src/pages/Profile/ProfileWishlist.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProfileWishlist = () => {
  const { items, removeItem, clearWishlist, loading } = useWishlist(); // ✅ Fixed: items not wishlist
  const { addItem } = useCart(); // ✅ Fixed: addItem not addToCart

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = (productId, productName) => {
    removeItem(productId, productName);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Show empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-rose-50 rounded-full mb-4">
          <FiHeart className="w-12 h-12 text-rose-300" />
        </div>
        <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-500 mb-6">
          Save your favorite items and come back to them later.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold text-gray-800">
          My Wishlist ({items.length})
        </h2>
        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4 group hover:shadow-md transition-shadow"
          >
            <Link to={`/product/${product.id}`} className="flex-shrink-0">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/80'}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-medium text-gray-800 hover:text-rose-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-lg font-bold text-rose-600 mt-1">
                {formatPrice(product.price)}
              </p>
              {product.stock <= 0 && (
                <p className="text-xs text-red-500 mt-1">Out of Stock</p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className={`p-2 rounded-lg transition-colors ${
                  product.stock > 0
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title="Add to cart"
              >
                <FiShoppingBag className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove from wishlist"
              >
                <FiTrash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileWishlist;