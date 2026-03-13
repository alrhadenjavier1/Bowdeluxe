// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import db from '../services/db.service';
console.log('🔥 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🔥 Using API_URL:', API_URL);
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = API_URL;
  
  // Add token to all requests if it exists
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    // Check for existing session on load
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        setInitializing(false);
        return;
      }

      try {
        const response = await axios.get('/auth/me');
        
        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.user);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    checkAuth();
  }, []);

  // In AuthContext.jsx - Update the signIn function
// src/contexts/AuthContext.jsx - Fix the signIn function
const signIn = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password
    });

    if (response.data.success) {
      setUser(response.data.user);
      setProfile(response.data.user);
      
      // Store token
      const token = response.data.token;
      localStorage.setItem('auth_token', token);
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Merge guest data after successful login
      setTimeout(() => {
        // You'll need to access these hooks differently
        // Consider using a custom event or refactoring
        window.dispatchEvent(new CustomEvent('user-logged-in'));
      }, 100);
      
      return { 
        success: true, 
        user: response.data.user 
      };
    }
    
    return { success: false, error: 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

// Update the axios interceptor
useEffect(() => {
  // Add token to all requests if it exists
  const interceptor = axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return () => {
    axios.interceptors.request.eject(interceptor);
  };
}, []);

  // In AuthContext.jsx - Update signOut function
const signOut = async () => {
  try {
    await axios.post('/auth/logout');
    
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
    
    toast.success('Logged out successfully');
    
    window.location.href = '/';
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Failed to log out');
    return { success: false, error: error.message };
  }
};

  const sendVerificationCode = async (email, name) => {
    try {
      const response = await axios.post('/auth/register', {
        email,
        name
      });

      if (response.data.success) {
        toast.success('Verification code sent to your email!', {
          icon: '📧',
          duration: 5000
        });
        
        if (process.env.REACT_APP_ENV === 'development' && response.data.devCode) {
          toast.success(`[DEV MODE] Code: ${response.data.devCode}`, {
            duration: 10000,
            icon: '🔑'
          });
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Failed to send code' };
    } catch (error) {
      console.error('Error sending code:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send verification code';
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const verifyCode = async (email, code, password, name) => {
    try {
      const response = await axios.post('/auth/verify', {
        email,
        code,
        password,
        name
      });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        
        const userResponse = await axios.get('/auth/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
          setProfile(userResponse.data.user);
        }
        
        toast.success('Account created successfully! 🎉', {
          duration: 5000
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Verification failed' };
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.error || 'Verification failed';
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/auth/profile', userData);
      
      if (response.data.success) {
        setProfile(response.data.user);
        setUser(response.data.user);
        toast.success('Profile updated successfully');
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await axios.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
      
      return { success: false, error: 'Failed to change password' };
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to change password' 
      };
    }
  };

  const value = {
    user,
    profile,
    loading,
    initializing,
    signIn,
    signUp: verifyCode,
    signOut,
    sendVerificationCode,
    verifyCode,
    updateProfile,
    changePassword,
    setProfile // Make sure this is included!
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};