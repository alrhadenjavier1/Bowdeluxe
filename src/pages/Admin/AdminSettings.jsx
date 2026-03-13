// src/pages/Admin/AdminSettings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiGlobe, FiMail, FiShield, FiCreditCard,
  FiTruck, FiSave, FiBell,
  FiLock, FiUser, FiEye, FiEyeOff,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { user, profile, setProfile } = useAuth();

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'payments', label: 'Payments', icon: FiCreditCard },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return <GeneralSettings user={user} profile={profile} setProfile={setProfile} />;
      case 'security':
        return <SecuritySettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'shipping':
        return <ShippingSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <GeneralSettings user={user} profile={profile} setProfile={setProfile} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="font-display text-2xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </motion.div>
  );
};

// General Settings
const GeneralSettings = ({ user, profile, setProfile }) => {
  const [formData, setFormData] = useState({
    storeName: 'Bowdeluxe',
    storeEmail: profile?.email || '',
    fullName: profile?.full_name || '',
    currency: 'PHP',
    language: 'English',
    timezone: 'Asia/Manila',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'fullName') {
      if (value.length < 2) {
        setNameError('Name must be at least 2 characters');
      } else {
        setNameError('');
      }
    }
  };

  const handleSaveName = async () => {
    if (nameError || !formData.fullName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        { full_name: formData.fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfile(response.data.user);
        toast.success('Name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error.response?.data?.error || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = () => {
    // Save general store settings
    toast.success('Store settings saved!');
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiUser className="w-5 h-5 mr-2 text-rose-500" />
          Personal Information
        </h3>
        <div className="bg-rose-50 rounded-xl p-6 border border-rose-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                    nameError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <FiAlertCircle className="w-3 h-3 mr-1" />
                    {nameError}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveName}
                disabled={isSaving || !!nameError}
                className="mt-3 px-6 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSaving ? 'Updating...' : 'Update Name'}
              </motion.button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.storeEmail}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Settings Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Store Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="PHP">PHP - Philippine Peso</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveGeneral}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <FiSave className="w-5 h-5" />
          <span>Save Store Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

// Security Settings (Password Change)
const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChanging, setIsChanging] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'gray'
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    // Validation
    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChanging(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/change-password`,
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-6 border border-rose-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiLock className="w-5 h-5 mr-2 text-rose-500" />
          Change Password
        </h3>

        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.newPassword && (
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {formData.confirmPassword && formData.newPassword && (
              <p className={`mt-1 text-xs flex items-center ${
                formData.newPassword === formData.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="w-3 h-3 mr-1" />
                    Passwords do not match
                  </>
                )}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChangePassword}
            disabled={isChanging}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isChanging ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <FiLock className="w-5 h-5" />
                <span>Change Password</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="font-medium text-gray-800">Two-Factor Authentication</p>
          <p className="text-sm text-gray-500 mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>
    </div>
  );
};

// Payment Settings
const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cod', name: 'Cash on Delivery', enabled: true },
    { id: 'gcash', name: 'GCash', enabled: true },
    { id: 'paymaya', name: 'PayMaya', enabled: false },
    { id: 'credit', name: 'Credit Card', enabled: false },
  ]);

  const handleToggle = (id) => {
    setPaymentMethods(paymentMethods.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleSave = () => {
    toast.success('Payment settings saved!');
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-800 mb-4">Payment Methods</h3>
      
      {paymentMethods.map((method) => (
        <div key={method.id} className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-700">{method.name}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={method.enabled}
              onChange={() => handleToggle(method.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      ))}

      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <FiSave className="w-5 h-5" />
          <span>Save Payment Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

// Shipping Settings
const ShippingSettings = () => {
  const [shipping, setShipping] = useState({
    freeShippingThreshold: 2000,
    standardRate: 100,
    expressRate: 200,
    sameDayRate: 350,
    processingTime: '1-2',
    enableTracking: true
  });

  const handleSave = () => {
    toast.success('Shipping settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₱)</label>
          <input
            type="number"
            value={shipping.freeShippingThreshold}
            onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping Rate (₱)</label>
          <input
            type="number"
            value={shipping.standardRate}
            onChange={(e) => setShipping({ ...shipping, standardRate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping Rate (₱)</label>
          <input
            type="number"
            value={shipping.expressRate}
            onChange={(e) => setShipping({ ...shipping, expressRate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time (days)</label>
          <select
            value={shipping.processingTime}
            onChange={(e) => setShipping({ ...shipping, processingTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="1-2">1-2 business days</option>
            <option value="2-3">2-3 business days</option>
            <option value="3-5">3-5 business days</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-700">Order Tracking</p>
          <p className="text-sm text-gray-500">Send tracking information to customers</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={shipping.enableTracking}
            onChange={(e) => setShipping({ ...shipping, enableTracking: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <FiSave className="w-5 h-5" />
          <span>Save Shipping Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

// Notification Settings
const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailInventory: true,
    emailMarketing: false,
    pushOrders: true,
    pushInventory: false
  });

  const handleSave = () => {
    toast.success('Notification settings saved!');
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-800 mb-4">Email Notifications</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">New Orders</p>
            <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.emailOrders}
              onChange={(e) => setNotifications({ ...notifications, emailOrders: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Low Inventory</p>
            <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.emailInventory}
              onChange={(e) => setNotifications({ ...notifications, emailInventory: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <FiSave className="w-5 h-5" />
          <span>Save Notification Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

export default AdminSettings;