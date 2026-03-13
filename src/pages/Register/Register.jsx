// src/pages/Register/Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheck, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, sendVerificationCode, verifyCode, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'gray'
  });

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const checkPasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { score: 0, message: 'Very Weak', color: 'red-500' },
      1: { score: 1, message: 'Weak', color: 'red-500' },
      2: { score: 2, message: 'Fair', color: 'yellow-500' },
      3: { score: 3, message: 'Good', color: 'green-500' },
      4: { score: 4, message: 'Strong', color: 'green-600' },
      5: { score: 5, message: 'Very Strong', color: 'green-700' }
    };

    setPasswordStrength(strengthMap[score] || strengthMap[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 2) {
      newErrors.password = 'Password is too weak';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVerificationChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when all digits are filled
      if (index === 5 && value && newCode.every(digit => digit)) {
        setTimeout(() => handleVerifyCode(), 100);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    if (!validateForm()) return;
    
    setSendingCode(true);
    try {
      const result = await sendVerificationCode(formData.email, formData.name);
      
      if (result.success) {
        setStep(2);
        setResendTimer(60);
        toast.success('Verification code sent to your email!', {
          icon: '📧',
          duration: 5000
        });
      } else {
        toast.error(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSendingCode(false);
    }
  };

const handleVerifyCode = async () => {
  const code = verificationCode.join('');
  
  if (code.length !== 6) {
    toast.error('Please enter the 6-digit verification code');
    return;
  }
  
  setVerifying(true);
  try {
    const result = await verifyCode(
      formData.email,
      code,
      formData.password,
      formData.name
    );
    
    if (result.success) {
      // Success message is shown in verifyCode function
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    setVerifying(false);
  }
};

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setSendingCode(true);
    try {
      const result = await sendVerificationCode(formData.email, formData.name);
      if (result.success) {
        setResendTimer(60);
        toast.success('New verification code sent!');
      } else {
        toast.error(result.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSendingCode(false);
    }
  };

  const getStrengthBarColor = (index) => {
    if (index < passwordStrength.score) {
      return passwordStrength.color;
    }
    return 'gray-200';
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Bowdeluxe
              </h1>
            </Link>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              {step === 1 ? 'Create Account' : 'Verify Your Email'}
            </h2>
            <p className="text-gray-600">
              {step === 1 
                ? 'Join our community of fashion lovers' 
                : 'We\'ve sent a verification code to your email'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {s < step ? <FiCheck className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    s < step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              {step === 1 ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                        placeholder="John Doe"
                        disabled={sendingCode}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                        placeholder="john@example.com"
                        disabled={sendingCode}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                        placeholder="••••••••"
                        disabled={sendingCode}
                      />
                    </div>
                    
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex space-x-1">
                          {[0, 1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className={`flex-1 h-1 rounded-full transition-all ${
                                index < passwordStrength.score
                                  ? `bg-${passwordStrength.color}`
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs mt-1 text-${passwordStrength.color}`}>
                          {passwordStrength.message}
                        </p>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all`}
                        placeholder="••••••••"
                        disabled={sendingCode}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sendingCode || authLoading}
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {sendingCode ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Code...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Continue</span>
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    )}
                  </motion.button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-rose-100 rounded-full mb-4">
                      <FiMail className="w-6 h-6 text-rose-600" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="font-medium text-gray-800 bg-rose-50 px-4 py-2 rounded-full inline-block">
                      {formData.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center space-x-2">
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => inputRefs.current[index] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleVerificationChange(index, value);
                          }}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
                          disabled={verifying}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center justify-center"
                      disabled={verifying}
                    >
                      <FiChevronLeft className="w-4 h-4 mr-1" />
                      Change email address
                    </button>
                    
                    <div>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={sendingCode || verifying || resendTimer > 0}
                        className="text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
                      >
                        {sendingCode ? 'Sending...' : 
                         resendTimer > 0 ? `Resend in ${resendTimer}s` : 
                         'Resend code'}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleVerifyCode}
                    disabled={verifying || verificationCode.some(d => !d)}
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {verifying ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Verify & Create Account</span>
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 hover:text-rose-700 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;