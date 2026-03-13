// src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';

const AddToCartButton = ({ product, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  // ✅ Use the new API
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    addItem(product);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <motion.button
      onClick={handleAddToCart}
      className={`relative overflow-hidden bg-primary-500 text-white py-2 px-3 rounded-full flex items-center justify-center space-x-2 hover:bg-primary-600 transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isAnimating ? {
          x: [0, 100, -100, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <FiShoppingBag className="w-4 h-4" />
      </motion.div>
      <span className="text-sm font-medium">Add to Bag</span>
      
      {/* Success Animation Overlay */}
      {isAnimating && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-green-500 flex items-center justify-center"
        >
          <span className="text-sm font-medium">Added!</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export default AddToCartButton;