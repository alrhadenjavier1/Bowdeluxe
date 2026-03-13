// src/hooks/useImageUpload.js
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file, folder = 'products') => {
    if (!file) return null;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      const response = await axios.post('/api/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        toast.success('Image uploaded successfully!');
        return response.data.secure_url || response.data.url;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleImages = async (files, folder = 'products') => {
    const uploadedUrls = [];

    for (const file of files) {
      const url = await uploadImage(file, folder);
      if (url) uploadedUrls.push(url);
    }

    return uploadedUrls;
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    uploadProgress
  };
};