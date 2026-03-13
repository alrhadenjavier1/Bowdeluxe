// src/pages/Profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiCamera,
  FiLock, FiEye, FiEyeOff, FiCheckCircle,
  FiAlertCircle, FiSave
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, profile, setProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-gray-800">Account Settings</h2>

      {/* Tabs */}
      <div className="bg-gray-50 rounded-xl p-1 flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6">
        {activeTab === 'profile' && (
          <ProfileSettingsForm user={user} profile={profile} setProfile={setProfile} />
        )}
        {activeTab === 'security' && (
          <SecuritySettingsForm />
        )}
      </div>
    </div>
  );
};

// Profile Settings Form
const ProfileSettingsForm = ({ user, profile, setProfile }) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        {
          full_name: formData.full_name,
          phone: formData.phone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfile(response.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {formData.full_name?.charAt(0) || 'U'}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            onClick={() => toast.success('Avatar upload coming soon!')}
          >
            <FiCamera className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div>
          <p className="font-medium text-gray-800">Profile Photo</p>
          <p className="text-sm text-gray-500">Click the camera icon to update</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 ${
              errors.full_name ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <FiAlertCircle className="w-3 h-3 mr-1" />
              {errors.full_name}
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
              value={formData.email}
              disabled
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="09123456789"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

// Security Settings Form
const SecuritySettingsForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
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
            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
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
            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
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
            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
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
        type="submit"
        disabled={isChanging}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
    </form>
  );
};

export default ProfileSettings;