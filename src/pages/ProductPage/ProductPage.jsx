import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
// Correct Swiper v9+ imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { FiHeart, FiShoppingBag, FiShare2 } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import api from '../../services/api';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // ✅ Use the correct API function names
  const { addItem } = useCart();  // Changed from addToCart
  const { isInWishlist, toggleItem } = useWishlist();  // Changed from toggleWishlist

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data);
        
        // Fetch related products (same category)
        if (data && data.category) {
          const related = await api.getProductsByCategory(data.category, { limit: 4 });
          setRelatedProducts(related.data.filter(p => p.id !== data.id));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Not enough stock');
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleItem(product);
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom text-center">
          <h2 className="heading-secondary mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div>
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation
              thumbs={{ swiper: activeThumb }}
              spaceBetween={10}
              slidesPerView={1}
              className="rounded-2xl overflow-hidden mb-4"
            >
              {product.images?.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnails */}
            <Swiper
              onSwiper={setActiveThumb}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress
              className="thumbnails"
            >
              {product.images?.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Product Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              
              <p className="text-3xl font-semibold text-rose-600 mb-6">
                ₱{product.price?.toLocaleString()}
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Availability */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">
                  Availability: {' '}
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-rose-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-rose-500 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 ${
                    product.stock > 0
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={product.stock > 0 ? { scale: 1.02 } : {}}
                  whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
                >
                  <FiShoppingBag className="w-5 h-5" />
                  <span>Add to Bag</span>
                </motion.button>

                <motion.button
                  onClick={handleToggleWishlist}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isInWishlist(product.id)
                      ? 'border-pink-200 bg-pink-50 text-pink-500'
                      : 'border-gray-200 text-gray-400 hover:border-pink-200 hover:text-pink-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiHeart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-rose-500 hover:text-rose-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiShare2 className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-medium text-gray-800 mb-4">Product Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Premium quality materials</li>
                  <li>• Handcrafted with care</li>
                  <li>• Perfect for special occasions</li>
                  <li>• Available in multiple colors</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="heading-secondary mb-8">You May Also Like</h2>
            <ProductCarousel products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;