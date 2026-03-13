import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import ProductCard from '../../components/ProductCard/ProductCard';
import { staggerContainer, staggerItem } from '../../animations/framerAnimations';

const Wishlist = () => {
  // ✅ Use the new API - items instead of wishlist
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom text-center">
          <div className="max-w-md mx-auto">
            <FiHeart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="heading-secondary mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8">
              Save your favorite items and come back to them later.
            </p>
            <Link to="/">
              <motion.button
                className="bg-primary-500 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Discover Products
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="heading-secondary">My Wishlist ({items.length})</h1>
          
          <button
            onClick={clearWishlist}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear Wishlist
          </button>
        </div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {items.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;