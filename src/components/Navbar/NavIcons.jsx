// src/components/Navbar/NavIcons.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiHeart, 
  FiShoppingBag, 
  FiLogIn, 
  FiUserPlus, 
  FiLayout, 
  FiLogOut, 
  FiUserCheck,
  FiPackage,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import CartPreview from '../Cart/CartPreview';
import toast from 'react-hot-toast';

const NavIcons = ({ textColor, hoverBg, mobile = false }) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCartPreview(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Heart animation when wishlist count changes
  useEffect(() => {
    if (wishlistCount > 0) {
      setHeartAnimation(true);
      const timer = setTimeout(() => setHeartAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  const getIconClasses = (isActive = false) => {
    const baseClasses = 'p-2 rounded-full transition-colors relative';
    if (mobile) {
      return `${baseClasses} text-gray-700 hover:bg-gray-100`;
    }
    // Always use the passed textColor, but add rose color for active state
    const activeClass = isActive ? 'text-rose-600' : '';
    return `${baseClasses} ${hoverBg} ${textColor} ${activeClass}`;
  };

  const getBadgeClasses = () => {
    return 'absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg';
  };

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      setShowUserMenu(false);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className={`flex items-center ${mobile ? 'justify-center space-x-4' : 'space-x-2'}`}>
      
      {/* Admin Dashboard Link */}
      {profile?.role === 'admin' && (
        <Link to="/admin">
          <motion.button
            className={getIconClasses()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Admin Dashboard"
            title="Admin Dashboard"
          >
            <FiLayout className="w-5 h-5" />
          </motion.button>
        </Link>
      )}

      {/* User Menu / Auth Buttons */}
      <div ref={userMenuRef} className="relative">
        {user ? (
          <>
            <motion.button
              className={getIconClasses()}
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="User menu"
              title={profile?.full_name || 'User'}
            >
              <FiUser className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute ${mobile ? 'left-0' : 'right-0'} mt-2 w-56 z-50`}
                >
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user.email}
                          </p>
                          {profile?.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <motion.div
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <FiUserCheck className="w-4 h-4 text-gray-500" />
                          <span>My Profile</span>
                        </motion.div>
                      </Link>

                      <Link
                        to="/profile/orders"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <motion.div
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <FiPackage className="w-4 h-4 text-gray-500" />
                          <span>My Orders</span>
                        </motion.div>
                      </Link>

                      <Link
                        to="/profile/settings"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <motion.div
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <FiSettings className="w-4 h-4 text-gray-500" />
                          <span>Settings</span>
                        </motion.div>
                      </Link>
                      
                      {/* Admin link in user menu */}
                      {profile?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                          <motion.div
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            whileHover={{ x: 5 }}
                          >
                            <FiLayout className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </motion.div>
                        </Link>
                      )}
                      
                      {/* Divider */}
                      <div className="my-2 border-t border-gray-100"></div>
                      
                      {/* Sign Out Button */}
                      <motion.button
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ x: 5 }}
                        onClick={handleSignOut}
                        disabled={loggingOut}
                      >
                        {loggingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <FiLogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center space-x-1">
            <Link to="/login">
              <motion.button
                className={getIconClasses()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Login"
                title="Login"
              >
                <FiLogIn className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                className={`${getIconClasses()} hidden md:block`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Register"
                title="Create Account"
              >
                <FiUserPlus className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        )}
      </div>

      {/* Wishlist Icon */}
      <Link to="/wishlist">
        <motion.button
          className={getIconClasses(wishlistCount > 0)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={heartAnimation ? {
            scale: [1, 1.3, 1],
            transition: { duration: 0.5 }
          } : {}}
          aria-label="Wishlist"
          title="Wishlist"
        >
          <FiHeart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500' : ''}`} />
          {wishlistCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={getBadgeClasses()}
            >
              {wishlistCount > 9 ? '9+' : wishlistCount}
            </motion.span>
          )}
        </motion.button>
      </Link>

      {/* Shopping Bag Icon */}
      <div ref={cartRef} className="relative">
        <motion.button
          className={getIconClasses(cartCount > 0)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCartPreview(!showCartPreview)}
          aria-label="Shopping cart"
          title="Shopping Cart"
        >
          <FiShoppingBag className={`w-5 h-5 ${cartCount > 0 ? 'text-rose-500' : ''}`} />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={getBadgeClasses()}
            >
              {cartCount > 9 ? '9+' : cartCount}
            </motion.span>
          )}
        </motion.button>

        <AnimatePresence>
          {showCartPreview && (
            <CartPreview onClose={() => setShowCartPreview(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NavIcons;