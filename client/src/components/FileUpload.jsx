import { useState, useCallback } from 'react';
import { useImage } from '../hooks/useImage';
import ImageCropper from './ImageCropper';

const FileUpload = ({ currentImage, onUploadSuccess, onUploadError, aspectRatio = 16/9 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const { uploadImage, isUploading, progress } = useImage();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (file) => {
    try {
      const result = await uploadImage(file);
      onUploadSuccess?.(result);
    } catch (error) {
      onUploadError?.(error);
    }
  };

  const handleCropComplete = async (croppedArea) => {
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = previewImage;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      canvas.width = croppedArea.width;
      canvas.height = croppedArea.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        croppedArea.x,
        croppedArea.y,
        croppedArea.width,
        croppedArea.height,
        0,
        0,
        croppedArea.width,
        croppedArea.height
      );

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        const result = await uploadImage(file);
        onUploadSuccess?.(result);
        setShowCropper(false);
        setPreviewImage(null);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      onUploadError?.(error);
      setShowCropper(false);
      setPreviewImage(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setPreviewImage(null);
  };

  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center 
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <div className="space-y-2">
          {currentImage ? (
            <div>
              <p className="text-gray-600">Current image:</p>
              <img 
                src={currentImage} 
                alt="Current" 
                className="w-32 h-32 mx-auto object-cover rounded"
              />
              <p className="text-sm text-gray-500 mt-2">
                {isUploading ? 'Uploading new image...' : 'Drag new image here or click to replace'}
              </p>
            </div>
          ) : (
            <>
              <div className="text-gray-600">
                {isUploading ? 'Uploading...' : 'Drag and drop your image here or click to select'}
              </div>
              <div className="text-sm text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP (max 5MB)
              </div>
            </>
          )}

          {isUploading && (
            <div className="w-full mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}
        </div>
      </div>

      {showCropper && previewImage && (
        <ImageCropper
          image={previewImage}
          aspect={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default FileUpload; 