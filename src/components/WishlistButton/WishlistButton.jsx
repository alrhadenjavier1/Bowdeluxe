import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import toast from 'react-hot-toast';

const WishlistButton = ({ product }) => {
  // ✅ Use the correct function names from your hook
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent any parent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    try {
      await toggleItem(product);
      // Toast is already shown in the hook, but you can add one here if needed
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-300 ${
        inWishlist 
          ? 'bg-rose-500 text-white hover:bg-rose-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
    </button>
  );
};

export default WishlistButton;