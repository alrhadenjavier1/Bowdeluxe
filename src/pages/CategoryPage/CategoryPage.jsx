import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import { useProducts } from '../../hooks/useProducts';
import { staggerContainer, staggerItem } from '../../animations/framerAnimations';

const CategoryPage = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const { products, loading, hasMore, loadMore } = useProducts({ 
    category,
    sort: sortBy 
  });

  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView, hasMore, loadMore]);

  const categoryTitles = {
    women: "Women's Collection",
    men: "Men's Collection",
    kids: "Kids' Collection",
    teen: "Teen Collection"
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="heading-secondary mb-2">
            {categoryTitles[category] || `${category}'s Collection`}
          </h1>
          <p className="text-gray-600">
            Discover our curated selection of {category}'s hair accessories
          </p>
        </motion.div>

        {/* Filters and Sort */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span>Filter</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                filterOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <SkeletonLoader type="grid" count={8} />
        ) : (
          <motion.div
            variants={staggerContainer(0.1)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={ref} className="py-12 text-center">
            {loading && (
              <div className="inline-flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500">Loading more products...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;