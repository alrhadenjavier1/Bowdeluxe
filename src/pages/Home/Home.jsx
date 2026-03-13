// pages/Home/Home.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiStar, 
  FiTrendingUp, 
  FiHeart, 
  FiShoppingBag, 
  FiChevronDown,
  FiAward,
  FiClock,
  FiShield
} from 'react-icons/fi';
import VideoCarousel from '../../components/VideoCarousel/VideoCarousel';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import { useProducts } from '../../hooks/useProducts';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState(null);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring animations for parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heroScale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0.3]);
  const heroY = useTransform(smoothProgress, [0, 0.5], [0, 100]);

  // Better product fetching with loading states
  const { products: bestSellers, loading: bestSellersLoading, error: bestSellersError } = useProducts({ 
    bestSeller: true, 
    limit: 8 
  });
  
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError } = useProducts({ 
    newArrival: true, 
    limit: 8 
  });
  
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuredRef, featuredInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [bestSellersRef, bestSellersInView] = useInView({ threshold: 0.1, triggerOnce: false }); // Changed to false to allow re-triggering
  const [newArrivalsRef, newArrivalsInView] = useInView({ threshold: 0.1, triggerOnce: false });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Debounced mouse move for performance
  useEffect(() => {
    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 10,
          y: (e.clientY / window.innerHeight - 0.5) * 10,
        });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Categories data with gradients and images
  const categories = useMemo(() => [
    { 
      name: 'Women', 
      path: '/category/women', 
      gradient: 'from-rose-400 to-pink-600',
      lightGradient: 'from-rose-100 to-pink-100',
      description: 'Elegant & Timeless',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
      color: 'rose'
    },
    { 
      name: 'Men', 
      path: '/category/men', 
      gradient: 'from-blue-400 to-indigo-600',
      lightGradient: 'from-blue-100 to-indigo-100',
      description: 'Classic & Refined',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500',
      color: 'blue'
    },
    { 
      name: 'Kids', 
      path: '/category/kids', 
      gradient: 'from-emerald-400 to-teal-600',
      lightGradient: 'from-emerald-100 to-teal-100',
      description: 'Playful & Colorful',
      image: 'https://images.unsplash.com/photo-1623859062539-d3636cac0845?w=500',
      color: 'emerald'
    },
    { 
      name: 'Teen', 
      path: '/category/teen', 
      gradient: 'from-purple-400 to-violet-600',
      lightGradient: 'from-purple-100 to-violet-100',
      description: 'Trendy & Modern',
      image: 'https://images.unsplash.com/photo-1620921083104-5c6cde4a5685?w=500',
      color: 'purple'
    },
  ], []);

  // Benefits data (replacing stats)
  const benefits = useMemo(() => [
    { 
      label: 'Handcrafted Quality', 
      description: 'Each bow meticulously crafted',
      icon: FiAward,
      color: 'rose'
    },
    { 
      label: 'Fast Shipping', 
      description: '2-3 business days delivery',
      icon: FiClock,
      color: 'blue'
    },
    { 
      label: 'Secure Returns', 
      description: '30-day money-back guarantee',
      icon: FiShield,
      color: 'emerald'
    },
    { 
      label: 'Premium Materials', 
      description: 'Only the finest fabrics',
      icon: FiStar,
      color: 'purple'
    },
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Loading skeleton for products
  const ProductSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <section 
        ref={heroRef} 
        className="relative h-screen"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {/* Background with smooth gradient animation */}
        <motion.div
          className="absolute inset-0"
          style={{
            scale: heroScale,
            opacity: heroOpacity,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>

        {/* Subtle floating orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full bg-white/5 blur-3xl"
            style={{
              width: `${400 + i * 200}px`,
              height: `${400 + i * 200}px`,
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Hero Content */}
        <motion.div
          style={{
            y: heroY,
          }}
          className="relative h-full flex items-center justify-center text-center text-white z-10"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="max-w-5xl px-4"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider mb-6">
                LUXURY BOWS & ACCESSORIES
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-7xl md:text-9xl font-bold mb-6 tracking-tight"
            >
              Bowdeluxe
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl mb-12 text-white/80 max-w-2xl mx-auto leading-relaxed"
            >
              Handcrafted elegance for the modern individual. 
              Where tradition meets contemporary design.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white text-gray-900 px-10 py-5 rounded-full font-medium hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span className="text-lg">Explore Collection</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-transparent border-2 border-white/30 text-white px-10 py-5 rounded-full font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <FiHeart className="w-5 h-5" />
                <span className="text-lg">Shop Now</span>
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              animate={isHoveringHero ? { y: [0, 8, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-7 h-12 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
                <motion.div
                  className="w-1.5 h-3 bg-white/80 rounded-full mt-3"
                  animate={isHoveringHero ? { y: [0, 20, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <FiChevronDown className="w-5 h-5 mx-auto mt-2 text-white/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Video Carousel Section */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/30 to-transparent" />
        <div className="container-custom relative z-10">
          <VideoCarousel />
        </div>
      </section>

      {/* Featured Categories with Enhanced Cards */}
      <section ref={featuredRef} className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-rose-50/20 to-purple-50/20" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={featuredInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-medium tracking-wider mb-4"
            >
              SHOP BY CATEGORY
            </motion.span>
            
            <h2 className="heading-secondary mb-4 text-4xl md:text-5xl lg:text-6xl">
              Discover Your Style
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our curated collection of handcrafted bows for every occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 40 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 80
                }}
                onHoverStart={() => setActiveCategory(index)}
                onHoverEnd={() => setActiveCategory(null)}
                className="group"
              >
                <Link to={category.path}>
                  <motion.div
                    className="relative rounded-2xl overflow-hidden cursor-pointer"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Gradient Overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`}
                    />
                    
                    {/* Image */}
                    <div className="aspect-[4/5] overflow-hidden">
                      <motion.img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <motion.div
                        animate={{
                          y: activeCategory === index ? -5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="font-display text-2xl font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-white/80 text-sm mb-3">
                          {category.description}
                        </p>
                        
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: activeCategory === index ? 1 : 0,
                            x: activeCategory === index ? 0 : -10
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center space-x-2 text-white text-sm font-medium"
                        >
                          <span>Shop Now</span>
                          <FiArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Category Indicator */}
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-${category.color}-500/20 backdrop-blur-sm flex items-center justify-center z-20`}>
                      <div className={`w-8 h-8 rounded-full bg-${category.color}-500/40`} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section - Fixed flickering */}
      <section ref={bestSellersRef} className="relative py-32 bg-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bestSellersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={bestSellersInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-2xl mb-6"
            >
              <FiStar className="w-8 h-8 text-rose-600" />
            </motion.div>

            <h2 className="heading-secondary mb-4 text-4xl md:text-5xl">
              Best Sellers
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our most loved bows, handpicked just for you
            </p>
          </motion.div>

          {/* Fixed loading state with skeleton and no flickering */}
          <AnimatePresence mode="wait">
            {bestSellersLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductSkeleton />
              </motion.div>
            ) : bestSellersError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">Unable to load products. Please try again.</p>
              </motion.div>
            ) : bestSellers && bestSellers.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProductCarousel products={bestSellers} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">No best sellers available</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Benefits Section - Replacing stats */}
      <section ref={benefitsRef} className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-purple-50" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="heading-secondary mb-4 text-4xl md:text-5xl">
              Why Choose Bowdeluxe
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Quality and craftsmanship you can trust
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center group cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className={`inline-flex items-center justify-center w-20 h-20 bg-${benefit.color}-100 rounded-2xl mb-6 group-hover:shadow-xl transition-all duration-300`}
                  >
                    <Icon className={`w-8 h-8 text-${benefit.color}-600`} />
                  </motion.div>
                  
                  <h3 className="font-display text-xl font-bold mb-2">
                    {benefit.label}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Arrivals - Fixed flickering */}
      <section ref={newArrivalsRef} className="relative py-32 bg-gradient-to-b from-purple-50/30 to-transparent">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={newArrivalsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={newArrivalsInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6"
            >
              <FiTrendingUp className="w-8 h-8 text-purple-600" />
            </motion.div>

            <h2 className="heading-secondary mb-4 text-4xl md:text-5xl">
              New Arrivals
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Fresh designs to elevate your style
            </p>
          </motion.div>

          {/* Fixed loading state with skeleton and no flickering */}
          <AnimatePresence mode="wait">
            {newArrivalsLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductSkeleton />
              </motion.div>
            ) : newArrivalsError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">Unable to load products. Please try again.</p>
              </motion.div>
            ) : newArrivals && newArrivals.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProductCarousel products={newArrivals} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">No new arrivals available</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Parallax Banner */}
      <section className="relative h-[600px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            scale: useTransform(smoothProgress, [0.5, 1], [1, 1.15]),
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200"
            alt="Luxury bows collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="relative h-full flex items-center"
        >
          <div className="container-custom">
            <div className="max-w-xl text-white">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider mb-6"
              >
                LIMITED EDITION
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Timeless
                <br />
                Elegance
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl mb-10 text-white/80 max-w-lg leading-relaxed"
              >
                Handcrafted with precision, designed for the discerning individual. 
                Each piece tells a unique story of sophistication.
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white text-gray-900 px-10 py-5 rounded-full font-medium hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
              >
                <span className="text-lg">Discover the Collection</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Subtle floating elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`floating-${i}`}
            className="absolute w-32 h-32 bg-white/5 backdrop-blur-sm rounded-full"
            style={{
              left: `${70 + i * 10}%`,
              top: `${20 + i * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </section>

      {/* Newsletter Section */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 to-purple-600">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-2xl mx-auto text-center text-white"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Stay in the Loop
            </h2>
            
            <p className="text-lg md:text-xl mb-10 text-white/90 leading-relaxed">
              Subscribe to receive exclusive offers, early access to new collections, 
              and styling inspiration.
            </p>

            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300"
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 shadow-lg"
              >
                Subscribe
              </motion.button>
            </form>

            <p className="text-sm mt-6 text-white/70">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;