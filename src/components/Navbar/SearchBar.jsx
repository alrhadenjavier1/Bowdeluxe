// src/components/Navbar/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { formatPrice } from '../../utils/helpers';

const SearchBar = ({ textColor, hoverBg, mobile = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsExpanded(false);
    setSearchQuery('');
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.button
        className={`flex items-center justify-center p-2 rounded-full transition-colors ${hoverBg} ${textColor}`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Search"
      >
        <FiSearch className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${mobile ? 'left-0' : 'right-0'} mt-2 w-96 z-50`}
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for bows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-lg bg-white text-gray-800"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-500 hover:text-rose-600"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </form>

            {/* Search Results Dropdown */}
            {(searchResults.length > 0 || isLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full mr-2" />
                    Searching...
                  </div>
                ) : (
                  <>
                    {searchResults.map((product) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleResultClick(product.id)}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                        whileHover={{ x: 5 }}
                      >
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                    {searchResults.length === 0 && searchQuery.length >= 2 && (
                      <div className="p-4 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;