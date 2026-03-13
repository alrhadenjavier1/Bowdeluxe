import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'product', count = 1 }) => {
  const renderProductSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="flex space-x-2 pt-2">
          <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-full w-10 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const renderCarouselSkeleton = () => (
    <div className="w-full">
      <div className="aspect-[21/9] bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderProductSkeleton()}
        </motion.div>
      ))}
    </div>
  );

  const skeletons = {
    product: renderProductSkeleton,
    carousel: renderCarouselSkeleton,
    text: renderTextSkeleton,
    grid: renderGridSkeleton,
  };

  const SkeletonComponent = skeletons[type] || skeletons.product;

  return type === 'grid' ? SkeletonComponent() : (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonComponent />
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;