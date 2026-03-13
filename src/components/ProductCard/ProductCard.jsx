// src/components/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import WishlistButton from './WishlistButton';
import AddToCartButton from '../Cart/AddToCartButton';
import QuickViewModal from './QuickViewModal';
import { formatPrice } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  if (!product) return null;

  return (
    <>
      <motion.div
        ref={ref}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {inView && (
          <>
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/400'}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                onLoad={() => setImageLoaded(true)}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
              
              {/* Second Image on Hover */}
              {product.images?.[1] && (
                <img
                  src={product.images[1]}
                  alt={`${product.name} alternate view`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: isHovered ? 1 : 0 }}
                />
              )}

              {/* Quick View Button */}
              <motion.button
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQuickView(true)}
              >
                <FiEye className="w-5 h-5 text-gray-700" />
              </motion.button>

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.is_new_arrival && (
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    New
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Best Seller
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
              <Link to={`/product/${product.id}`} className="flex-1">
                <h3 className="font-medium text-gray-800 hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              <p className="text-lg font-semibold text-primary-600 mb-3">
                {formatPrice(product.price)}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-auto">
                <WishlistButton product={product} />
                <AddToCartButton product={product} />
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal
            product={product}
            onClose={() => setShowQuickView(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;