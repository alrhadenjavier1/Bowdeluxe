import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, onClose }) => {
  // ✅ Use toggleItem instead of toggleWishlist
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem } = useCart(); // Note: useCart exports addItem, not addToCart
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, 1);
    onClose();
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleItem(product);
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
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
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                className="rounded-2xl overflow-hidden"
              >
                {product.images?.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">
                {product.name}
              </h2>
              
              <p className="text-2xl font-semibold text-rose-600 mb-4">
                ₱{product.price?.toLocaleString()}
              </p>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Availability */}
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Availability: {' '}
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                    product.stock > 0
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-full border-2 transition-colors ${
                    isWishlisted
                      ? 'border-pink-200 bg-pink-50 text-pink-500'
                      : 'border-gray-200 text-gray-400 hover:border-pink-200 hover:text-pink-500'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Product Features */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-800 mb-3">Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-rose-400 rounded-full mr-2"></span>
                    Premium quality materials
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-rose-400 rounded-full mr-2"></span>
                    Handcrafted with care
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-rose-400 rounded-full mr-2"></span>
                    Perfect for special occasions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickViewModal;