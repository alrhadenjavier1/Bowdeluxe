import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <FiCheck className="w-5 h-5 text-green-500" />,
    error: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-700">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;