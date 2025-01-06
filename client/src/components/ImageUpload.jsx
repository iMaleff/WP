import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import supabase from '../utils/supabase';

const ImageUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      try {
        setUploading(true);
        const file = acceptedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-covers')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-covers')
          .getPublicUrl(filePath);

        onUpload(publicUrl);
        toast.success('Изображение успешно загружено');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Ошибка при загрузке изображения');
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="text-gray-600">Загрузка...</div>
      ) : isDragActive ? (
        <div className="text-blue-600">Перетащите файл сюда...</div>
      ) : (
        <div className="text-gray-600">
          Перетащите изображение сюда или кликните для выбора
          <p className="text-sm mt-1">PNG, JPG или WEBP до 5MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 