// src/pages/Checkout/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiCreditCard, FiMapPin } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // ✅ Use the new API
  const { items, total, checkout } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Philippines',
      recipient_name: user?.full_name || '',
      phone: user?.phone || ''
    },
    billing_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Philippines'
    },
    payment_method: 'cod',
    notes: '',
    same_as_shipping: true
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        total_amount: total,
        shipping_address: formData.shipping_address,
        billing_address: formData.same_as_shipping ? formData.shipping_address : formData.billing_address,
        payment_method: formData.payment_method,
        notes: formData.notes
      };

      const result = await checkout(orderData);
      
      if (result.success) {
        navigate('/profile/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use items.length instead of cart.length
  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom text-center">
          <h2 className="heading-secondary mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 text-white px-8 py-3 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-display text-2xl font-bold mb-6">Checkout</h2>

              {/* Progress Steps */}
              <div className="flex mb-8">
                <div className={`flex-1 text-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-sm">Shipping</span>
                </div>
                <div className={`flex-1 text-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-sm">Payment</span>
                </div>
                <div className={`flex-1 text-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="text-sm">Review</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Shipping Address */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2 text-primary-500" />
                      Shipping Address
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Recipient Name"
                          value={formData.shipping_address.recipient_name}
                          onChange={(e) => handleInputChange('shipping_address', 'recipient_name', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.shipping_address.phone}
                          onChange={(e) => handleInputChange('shipping_address', 'phone', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={formData.shipping_address.street}
                          onChange={(e) => handleInputChange('shipping_address', 'street', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.shipping_address.city}
                          onChange={(e) => handleInputChange('shipping_address', 'city', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State/Province"
                          value={formData.shipping_address.state}
                          onChange={(e) => handleInputChange('shipping_address', 'state', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={formData.shipping_address.postal_code}
                          onChange={(e) => handleInputChange('shipping_address', 'postal_code', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Country"
                          value={formData.shipping_address.country}
                          onChange={(e) => handleInputChange('shipping_address', 'country', e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full bg-primary-500 text-white py-3 rounded-xl"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center">
                      <FiCreditCard className="w-5 h-5 mr-2 text-primary-500" />
                      Payment Method
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={formData.payment_method === 'cod'}
                          onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 opacity-50">
                        <input
                          type="radio"
                          disabled
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">Credit Card (Coming Soon)</p>
                          <p className="text-sm text-gray-500">Pay securely with credit card</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 bg-primary-500 text-white py-3 rounded-xl"
                      >
                        Review Order
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review Order */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Review Your Order</h3>
                    
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                          </div>
                          <p className="font-bold text-primary-600">₱{item.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span className="font-medium">₱{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Shipping</span>
                        <span className="font-medium">Free</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">₱{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl"
                      >
                        Back
                      </button>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Place Order'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-2 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{item.name}</span>
                    <span className="font-medium">₱{item.price.toLocaleString()}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-sm text-gray-500">+{items.length - 3} more items</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₱{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">₱{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;