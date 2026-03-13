import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import toast from 'react-hot-toast';

const WishlistButton = ({ product }) => {
  // ✅ Use toggleItem instead of toggleWishlist
  const { isInWishlist, toggleItem } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await toggleItem(product);
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`flex-1 py-2 px-3 rounded-full border transition-all duration-300 flex items-center justify-center space-x-2 ${
        isWishlisted
          ? 'bg-pink-50 border-pink-200 text-pink-500'
          : 'border-gray-200 text-gray-600 hover:border-pink-200 hover:text-pink-500'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isWishlisted ? {
          scale: [1, 1.2, 1],
          transition: { duration: 0.3 }
        } : {}}
      >
        <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </motion.div>
      <span className="text-sm font-medium">
        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
      </span>
    </motion.button>
  );
};

export default WishlistButton;