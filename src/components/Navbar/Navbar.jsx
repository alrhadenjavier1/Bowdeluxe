// components/Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import NavIcons from './NavIcons';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  
  // Always dark background with slight transparency when scrolled
  const navbarBackground = useTransform(
    scrollY,
    [0, 50],
    [
      'rgba(255, 255, 255, 0.95)', // Light background at top
      'rgba(255, 255, 255, 0.98)' // Slightly more opaque when scrolled
    ]
  );

  const navbarBlur = useTransform(scrollY, [0, 50], [8, 10]);
  const navbarShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 4px 20px rgba(0, 0, 0, 0.05)', '0 4px 20px rgba(0, 0, 0, 0.1)']
  );

  // Always use dark text
  const textColor = 'text-gray-800';
  const hoverBg = 'hover:bg-gray-100';

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', updateScroll);
    updateScroll();
    
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navbarBackground,
          backdropFilter: `blur(${navbarBlur}px)`,
          boxShadow: navbarShadow,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Always dark */}
            <Link to="/" className="relative group z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <h1 className={`font-display text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300 ${textColor}`}>
                  Bowdeluxe
                </h1>
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-rose-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation - Pass dark theme props */}
            <div className="hidden md:flex items-center space-x-2">
              <SearchBar textColor={textColor} hoverBg={hoverBg} />
              <CategoryDropdown textColor={textColor} hoverBg={hoverBg} />
              <NavIcons textColor={textColor} hoverBg={hoverBg} />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={`md:hidden p-2 rounded-full transition-colors ${hoverBg} ${textColor}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="container-custom py-4 space-y-4">
                <SearchBar textColor="text-gray-800" hoverBg="hover:bg-gray-100" mobile />
                <CategoryDropdown textColor="text-gray-800" hoverBg="hover:bg-gray-100" mobile />
                <div className="flex justify-center space-x-4 pt-2">
                  <NavIcons textColor="text-gray-800" hoverBg="hover:bg-gray-100" mobile />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 z-50"
        style={{
          scaleX: useTransform(scrollY, [0, document.body.scrollHeight - window.innerHeight], [0, 1]),
          transformOrigin: '0%',
        }}
      />
    </>
  );
};

export default Navbar;