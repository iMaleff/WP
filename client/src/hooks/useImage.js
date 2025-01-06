import { useState } from 'react';
import axios from 'axios';

export const useImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file, cropData = null) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      if (cropData) {
        formData.append('crop', JSON.stringify(cropData));
      }

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      return {
        url: response.data.url,
        thumbnail: response.data.thumbnail,
        public_id: response.data.public_id
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress
  };
}; 