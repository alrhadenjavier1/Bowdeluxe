// src/pages/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
      }, 5 * 60 * 1000); // Lock for 5 minutes
    }
  }, [loginAttempts]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (isLocked) {
    toast.error('Too many login attempts. Please try again later.');
    return;
  }

  if (!validateForm()) return;
  
  const result = await signIn(formData.email, formData.password);
  
  if (result.success) {
    toast.success('Welcome back!');
    
    setLoginAttempts(0);
    
    console.log('Login result:', result); // Debug log
    
    // Check user role from the response
    if (result.user?.role === 'admin') {
      console.log('Admin user detected, redirecting to /admin');
      navigate('/admin', { replace: true });
    } else {
      console.log('Regular user, redirecting to:', from);
      navigate(from, { replace: true });
    }
  } else {
    setLoginAttempts(prev => prev + 1);
    
    // Show user-friendly error message
    if (result.error?.includes('Invalid login credentials')) {
      toast.error('Invalid email or password');
    } else if (result.error?.includes('verify your email')) {
      toast.error('Please verify your email address first');
    } else {
      toast.error(result.error || 'Login failed. Please try again.');
    }
  }
};

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@user.com',
      password: 'demo123'
    });
    toast.success('Demo credentials loaded!');
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container-custom max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Bowdeluxe
              </h1>
            </Link>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                  disabled={loading || isLocked}
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                  disabled={loading || isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-400"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm text-rose-600 hover:text-rose-700 hover:underline transition-colors"
                onClick={() => toast.success('Password reset link sent to your email!')}
              >
                Forgot Password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : isLocked ? (
                'Too many attempts - Try later'
              ) : (
                'Sign In'
              )}
            </motion.button>

            {/* Demo Login Button */}
            <motion.button
              type="button"
              onClick={handleDemoLogin}
              className="w-full border-2 border-rose-200 text-rose-600 py-3 rounded-xl font-medium hover:bg-rose-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Use Demo Account
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => toast.success('Google login coming soon!')}
              className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-sm">Google</span>
            </button>
            <button 
              onClick={() => toast.success('Facebook login coming soon!')}
              className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
              <span className="text-sm">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-rose-600 hover:text-rose-700 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;