import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyCode } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      const email = searchParams.get('email');
      const code = searchParams.get('code');

      if (!email || !code) {
        setError('Invalid verification link');
        setVerifying(false);
        return;
      }

      const result = await verifyCode(email, code);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Verification failed');
      }
      
      setVerifying(false);
    };

    verify();
  }, [searchParams, verifyCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4"
      >
        <div className="text-center">
          {verifying ? (
            <>
              <FiLoader className="w-16 h-16 text-rose-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold mb-2">Verifying...</h2>
              <p className="text-gray-600">Please wait while we verify your email</p>
            </>
          ) : success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;