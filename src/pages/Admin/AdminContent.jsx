// src/pages/Admin/AdminContent.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiImage, FiSave, FiEye, FiX, FiPlus, FiTrash2,
  FiArrowLeft, FiArrowRight, FiStar, FiHeart, FiAward,
  FiClock, FiShield, FiTrendingUp,
} from 'react-icons/fi';
import adminService from '../../services/admin.service';
import api from '../../services/api.service';
import toast from 'react-hot-toast';
import BackButton from '../../components/UI/BackButton';

const AdminContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState({
    hero: {
      title: 'Bowdeluxe',
      subtitle: 'Handcrafted elegance for the modern individual',
      buttonText: 'Explore Collection',
      backgroundImage: ''
    },
    categories: [],
    benefits: [],
    featuredProducts: []
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: FiEye },
    { id: 'categories', label: 'Categories', icon: FiStar },
    { id: 'benefits', label: 'Benefits', icon: FiAward },
    { id: 'featured', label: 'Featured Products', icon: FiTrendingUp }
  ];

  useEffect(() => {
    fetchContent();
    fetchProducts();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHomepageContent();
      
      if (response.success) {
        setContent(response.content || content);
        
        // Initialize selected products for featured tab
        if (response.content?.featuredProducts) {
          setSelectedProducts(response.content.featuredProducts);
        }
      } else {
        toast.error('Failed to load content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      if (response.success) {
        setAvailableProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleHeroChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const handleBenefitChange = (index, field, value) => {
    const updatedBenefits = [...content.benefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      [field]: value
    };
    setContent(prev => ({ ...prev, benefits: updatedBenefits }));
  };

  const addBenefit = () => {
    setContent(prev => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          label: 'New Benefit',
          description: 'Benefit description',
          icon: 'FiAward',
          color: 'rose'
        }
      ]
    }));
  };

  const removeBenefit = (index) => {
    setContent(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...content.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };
    setContent(prev => ({ ...prev, categories: updatedCategories }));
  };

  const addCategory = () => {
    setContent(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          name: 'New Category',
          path: '/category/new',
          icon: '📦',
          description: 'Category description',
          color: 'from-gray-500 to-gray-600',
          image: ''
        }
      ]
    }));
  };

  const removeCategory = (index) => {
    setContent(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const saveFeaturedProducts = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateFeaturedProducts(selectedProducts);
      if (response.success) {
        toast.success('Featured products updated successfully');
        setContent(prev => ({ ...prev, featuredProducts: selectedProducts }));
        setShowProductSelector(false);
      } else {
        toast.error(response.error || 'Failed to update featured products');
      }
    } catch (error) {
      console.error('Error saving featured products:', error);
      toast.error('Error saving featured products');
    } finally {
      setSaving(false);
    }
  };

  const saveHeroSection = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateHeroSection(content.hero);
      if (response.success) {
        toast.success('Hero section updated successfully');
      } else {
        toast.error(response.error || 'Failed to update hero section');
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error('Error saving hero section');
    } finally {
      setSaving(false);
    }
  };

  const saveCategories = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateCategoriesSection(content.categories);
      if (response.success) {
        toast.success('Categories updated successfully');
      } else {
        toast.error(response.error || 'Failed to update categories');
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Error saving categories');
    } finally {
      setSaving(false);
    }
  };

  const saveBenefits = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateBenefitsSection(content.benefits);
      if (response.success) {
        toast.success('Benefits updated successfully');
      } else {
        toast.error(response.error || 'Failed to update benefits');
      }
    } catch (error) {
      console.error('Error saving benefits:', error);
      toast.error('Error saving benefits');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      <div className="flex items-center justify-between">
        <BackButton to="/admin" label="← Back to Dashboard" />
        <h1 className="font-display text-3xl font-bold text-gray-800">Content Manager</h1>
        <div className="w-24"></div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg flex space-x-2 overflow-x-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels - All content visible but darkened */}
      <div className="relative">
        {/* Dark overlay for all content */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FiClock className="w-12 h-12" />
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-xl text-white/80 max-w-md">
              Content management features are under development and will be available in the next update.
            </p>
            <div className="mt-8 flex space-x-3 justify-center">
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">Hero Section</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">Categories</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">Benefits</span>
            </div>
          </motion.div>
        </div>

        {/* Original content - visible but darkened by overlay */}
        <AnimatePresence mode="wait">
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-lg opacity-50"
            >
              <h2 className="font-display text-xl font-bold text-gray-800 mb-6">Hero Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-gray-100"
                    placeholder="Bowdeluxe"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <textarea
                    value={content.hero.subtitle}
                    onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-gray-100"
                    placeholder="Handcrafted elegance for the modern individual..."
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={content.hero.buttonText}
                    onChange={(e) => handleHeroChange('buttonText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-gray-100"
                    placeholder="Explore Collection"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={content.hero.backgroundImage}
                      onChange={(e) => handleHeroChange('backgroundImage', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-gray-100"
                      placeholder="https://example.com/image.jpg"
                      disabled
                    />
                    <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl cursor-not-allowed opacity-50">
                      <FiImage className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiSave className="w-5 h-5" />
                    <span>Save Hero Section</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Categories Section */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-lg opacity-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-gray-800">Categories</h2>
                <button
                  disabled
                  className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-xl opacity-50 cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-4">
                {content.categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 rounded-xl p-4 relative group"
                  >
                    <button
                      disabled
                      className="absolute top-2 right-2 p-2 text-gray-400 opacity-50 cursor-not-allowed"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Path</label>
                        <input
                          type="text"
                          value={category.path}
                          onChange={(e) => handleCategoryChange(index, 'path', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Icon</label>
                        <input
                          type="text"
                          value={category.icon}
                          onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Color</label>
                        <select
                          value={category.color}
                          onChange={(e) => handleCategoryChange(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        >
                          <option value="from-rose-500 to-pink-500">Rose</option>
                          <option value="from-blue-500 to-indigo-500">Blue</option>
                          <option value="from-emerald-500 to-teal-500">Emerald</option>
                          <option value="from-purple-500 to-violet-500">Purple</option>
                          <option value="from-amber-500 to-orange-500">Amber</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={category.description}
                          onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={category.image}
                          onChange={(e) => handleCategoryChange(index, 'image', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {content.categories.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No categories added yet. Click "Add Category" to create one.
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  disabled
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-5 h-5" />
                  <span>Save Categories</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Benefits Section */}
          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-lg opacity-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-gray-800">Benefits</h2>
                <button
                  disabled
                  className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-xl opacity-50 cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Benefit</span>
                </button>
              </div>

              <div className="space-y-4">
                {content.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 rounded-xl p-4 relative group"
                  >
                    <button
                      disabled
                      className="absolute top-2 right-2 p-2 text-gray-400 opacity-50 cursor-not-allowed"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Label</label>
                        <input
                          type="text"
                          value={benefit.label}
                          onChange={(e) => handleBenefitChange(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Icon</label>
                        <select
                          value={benefit.icon}
                          onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        >
                          <option value="FiAward">Award</option>
                          <option value="FiClock">Clock</option>
                          <option value="FiShield">Shield</option>
                          <option value="FiStar">Star</option>
                          <option value="FiHeart">Heart</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Color</label>
                        <select
                          value={benefit.color}
                          onChange={(e) => handleBenefitChange(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        >
                          <option value="rose">Rose</option>
                          <option value="blue">Blue</option>
                          <option value="emerald">Emerald</option>
                          <option value="purple">Purple</option>
                          <option value="amber">Amber</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={benefit.description}
                          onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                          disabled
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {content.benefits.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No benefits added yet. Click "Add Benefit" to create one.
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  disabled
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-5 h-5" />
                  <span>Save Benefits</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Featured Products Section */}
          {activeTab === 'featured' && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-lg opacity-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-gray-800">Featured Products</h2>
                <button
                  disabled
                  className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-xl opacity-50 cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Select Products</span>
                </button>
              </div>

              {/* Selected Products Display */}
              {selectedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts
                    .filter(product => selectedProducts.includes(product.id))
                    .map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 rounded-xl p-3 flex items-center space-x-3"
                      >
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-sm text-rose-600 font-semibold">₱{product.price}</p>
                        </div>
                        <button
                          disabled
                          className="p-2 text-gray-400 opacity-50 cursor-not-allowed"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No featured products selected. Click "Select Products" to choose products to feature on the homepage.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminContent;