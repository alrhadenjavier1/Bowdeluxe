// components/Navbar/CategoryDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { supabase } from '../../config/supabase';

const CategoryDropdown = ({ textColor, hoverBg, mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const formattedCategories = data.map(cat => ({
        name: cat.name,
        path: `/category/${cat.slug}`,
        icon: getCategoryIcon(cat.name),
        description: cat.description,
        color: getCategoryColor(cat.name)
      }));
      
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name) => {
    const icons = {
      'Women': '👗',
      'Men': '👔',
      'Kids': '🧸',
      'Teen': '✨'
    };
    return icons[name] || '📦';
  };

  const getCategoryColor = (name) => {
    const colors = {
      'Women': 'from-rose-500 to-pink-500',
      'Men': 'from-blue-500 to-indigo-500',
      'Kids': 'from-emerald-500 to-teal-500',
      'Teen': 'from-purple-500 to-violet-500'
    };
    return colors[name] || 'from-gray-500 to-gray-600';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getButtonClasses = () => {
    if (mobile) {
      return `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${textColor} ${hoverBg}`;
    }
    return `flex items-center space-x-1 px-4 py-2 rounded-full transition-colors ${hoverBg} ${textColor}`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${mobile ? 'w-full' : ''}`}>
      <motion.button
        className={getButtonClasses()}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: mobile ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        <span className="font-medium">Categories</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${
              mobile 
                ? 'static mt-2' 
                : 'absolute right-0 mt-2 w-80'
            } z-50`}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 border-b border-gray-100">
                <h3 className="font-display text-lg font-bold text-gray-800">Shop by Category</h3>
                <p className="text-sm text-gray-600">Find your perfect style</p>
              </div>

              {/* Categories */}
              <div className="p-2">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={category.path}
                      onClick={() => setIsOpen(false)}
                    >
                      <motion.div
                        className="group relative p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                            {category.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-display font-bold text-gray-800">
                              {category.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {category.description}
                            </p>
                          </div>

                          <FiArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <motion.div
                          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${category.color}`}
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link
                  to="/categories"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  View All Categories →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryDropdown;