// src/pages/Admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, 
  FiFilter, FiEye, FiX, FiUpload, FiSave,
  FiCopy, FiCheck, FiStar, FiTrendingUp,
  FiPackage, FiDollarSign, FiImage
} from 'react-icons/fi';
import { supabase } from '../../config/supabase';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';
import axios from 'axios';

const AdminProducts = () => {
  const { 
    products, 
    loading, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    duplicateProduct,
    toggleProductStatus 
  } = useAdminProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stock: 'all',
    priceRange: { min: '', max: '' },
    bestSeller: false,
    newArrival: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (productId) => {
    await deleteProduct(productId);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    
    // This would need bulk delete implementation
    toast.success(`${selectedProducts.length} products deleted (demo)`);
    setSelectedProducts([]);
  };

  const handleToggleSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    const matchesStock = filters.stock === 'all' ? true :
                        filters.stock === 'in-stock' ? product.stock > 0 :
                        filters.stock === 'low-stock' ? product.stock > 0 && product.stock <= 10 :
                        filters.stock === 'out-of-stock' ? product.stock === 0 : true;
    
    const matchesPrice = (!filters.priceRange.min || product.price >= filters.priceRange.min) &&
                        (!filters.priceRange.max || product.price <= filters.priceRange.max);
    
    const matchesBestSeller = !filters.bestSeller || product.is_best_seller;
    const matchesNewArrival = !filters.newArrival || product.is_new_arrival;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice && 
           matchesBestSeller && matchesNewArrival;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Products Management</h2>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedProducts.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-4 py-3 bg-rose-100 text-rose-600 rounded-xl font-medium hover:bg-rose-200 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              <span>Delete Selected ({selectedProducts.length})</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Product</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock > 0 && p.stock <= 10).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 border rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                  <select
                    value={filters.stock}
                    onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    <option value="all">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, min: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, max: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="10000"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.bestSeller}
                      onChange={(e) => setFilters({ ...filters, bestSeller: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.newArrival}
                      onChange={(e) => setFilters({ ...filters, newArrival: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group relative"
          >
            {/* Selection Checkbox */}
            <div className="absolute top-4 left-4 z-20">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleToggleSelect(product.id)}
                className="w-5 h-5 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
              />
            </div>

            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Badges */}
              <div className="absolute top-4 right-4 space-x-2 flex">
                {product.is_new_arrival && (
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                    New
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Stock Badge */}
              <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-600'
                  : product.stock > 0
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
              </div>
              
              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setEditingProduct(product);
                    setIsModalOpen(true);
                  }}
                  className="p-3 bg-white rounded-full text-gray-700 hover:text-rose-600 transition-colors"
                  title="Edit Product"
                >
                  <FiEdit2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => duplicateProduct(product)}
                  className="p-3 bg-white rounded-full text-gray-700 hover:text-rose-600 transition-colors"
                  title="Duplicate Product"
                >
                  <FiCopy className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.open(`/product/${product.id}`, '_blank')}
                  className="p-3 bg-white rounded-full text-gray-700 hover:text-rose-600 transition-colors"
                  title="View Product"
                >
                  <FiEye className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(product.id)}
                  className="p-3 bg-white rounded-full text-gray-700 hover:text-rose-600 transition-colors"
                  title="Delete Product"
                >
                  <FiTrash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-display font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-2xl font-bold text-rose-600 mb-2">{formatPrice(product.price)}</p>
              
              {/* Quick Stats */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Category: {product.category}</span>
                <div className="flex space-x-1">
                  {product.is_best_seller && (
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" title="Best Seller" />
                  )}
                  {product.is_new_arrival && (
                    <FiTrendingUp className="w-4 h-4 text-green-500" title="New Arrival" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
            <FiPackage className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or add a new product</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Your First Product</span>
          </motion.button>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setIsModalOpen(false)}
            onSave={async (data) => {
              if (editingProduct) {
                await updateProduct(editingProduct.id, data);
              } else {
                await createProduct(data);
              }
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Product Modal Component
// In AdminProducts.jsx - Update ProductModal component

// Product Modal Component - Updated with working file upload
const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState(product ? {
    name: product.name || '',
    price: product.price || '',
    category: product.category || '',
    description: product.description || '',
    stock: product.stock || '',
    images: product.images || [''],
    video: product.video || '',
    is_new_arrival: product.is_new_arrival || false,
    is_best_seller: product.is_best_seller || false
  } : {
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    images: [''],
    video: '',
    is_new_arrival: false,
    is_best_seller: false
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.images[0] || '');
  const fileInputRef = React.useRef(null);

  // Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be less than 5MB');
    return;
  }

  setUploading(true);

  // ✅ Delete old image if it exists AND it's from Cloudinary
  if (imagePreview && imagePreview.includes('cloudinary')) {
    try {
      // Extract public_id from the old image URL
      const publicId = extractPublicIdFromUrl(imagePreview);
      
      if (publicId) {
        await axios.delete('/admin/upload/image', {
          data: { public_id: publicId }
        });
        console.log('Old image deleted from Cloudinary');
      }
    } catch (error) {
      console.error('Error deleting old image:', error);
      // Don't stop the upload if delete fails - just log it
    }
  }

  // Upload new image
  const uploadFormData = new FormData();
  uploadFormData.append('image', file);

  try {
    const response = await axios.post('/admin/upload/image', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      const imageUrl = response.data.secure_url || response.data.url;
      
      setFormData(prev => ({
        ...prev,
        images: [imageUrl]
      }));
      
      setImagePreview(imageUrl);
      toast.success('Image uploaded successfully!');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.response?.data?.error || 'Failed to upload image');
  } finally {
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

const extractPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud-name/image/upload/v123456789/folder/public_id.jpg
    const matches = url.match(/\/upload\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};


  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      setSaving(false);
      return;
    }

    await onSave(formData);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-gray-800">
                {product ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {product ? 'Update product details' : 'Create a new product'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Image Preview/Upload Area */}
              <div 
                onClick={triggerFileInput}
                className={`relative aspect-video bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer ${
                  uploading ? 'opacity-50' : 'hover:border-rose-300'
                } ${imagePreview ? 'border-transparent' : 'border-gray-300'}`}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <FiImage className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}

                {/* Uploading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Uploading...</p>
                    </div>
                  </div>
                )}

                {/* Edit/Remove Overlay (only when image exists and not uploading) */}
                {imagePreview && !uploading && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      className="p-3 bg-white rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                      title="Change image"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, images: [''] }));
                        setImagePreview('');
                      }}
                      className="p-3 bg-white rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove image"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Image URL Input (optional fallback) */}
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) => {
                    setFormData({ ...formData, images: [e.target.value] });
                    setImagePreview(e.target.value);
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Or enter image URL manually..."
                />
              </div>
            </div>

            {/* Rest of your form fields... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="e.g., Classic Silk Bow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₱) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (Optional)
              </label>
              <input
                type="url"
                value={formData.video}
                onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_new_arrival}
                  onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">Mark as New Arrival</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">Mark as Best Seller</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>{product ? 'Update Product' : 'Create Product'}</span>
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminProducts;