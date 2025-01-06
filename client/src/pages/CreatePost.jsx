import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import { useCreatePost } from '../hooks/usePost';

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const createPost = useCreatePost();

  const onSubmit = async (data) => {
    if (!coverImage) {
      return toast.error('Please upload a cover image');
    }

    try {
      const post = await createPost.mutateAsync({
        ...data,
        content,
        coverImage
      });
      
      toast.success('Post created successfully');
      navigate(`/post/${post.slug}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FileUpload
          onUploadSuccess={(data) => setCoverImage(data.url)}
          onUploadError={(error) => toast.error('Error uploading image')}
          onProgress={setUploadProgress}
        />

        {coverImage && (
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        <div>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="Post title"
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Short description"
            className="w-full p-2 border rounded"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select category</option>
            <option value="general">General</option>
            <option value="web-design">Web Design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">SEO</option>
            <option value="marketing">Marketing</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="h-64 mb-12"
        />

        <button
          type="submit"
          disabled={createPost.isLoading || uploadProgress > 0}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 
            disabled:bg-blue-300"
        >
          {createPost.isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost; 