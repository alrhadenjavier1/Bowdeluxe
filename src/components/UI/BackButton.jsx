import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ to = '/', label = 'Back to Home', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === 'back') {
      navigate(-1); // Go back to previous page
    } else {
      navigate(to); // Navigate to specific route
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors ${className}`}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FiArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default BackButton;