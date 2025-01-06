import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import { usePost, useUpdatePost } from '../hooks/usePost';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading: isLoadingPost } = usePost(id);
  const updatePost = useUpdatePost();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const content = watch('content') || '';
  const coverImage = watch('coverImage') || '';

  useEffect(() => {
    if (post) {
      setValue('title', post.title);
      setValue('description', post.description);
      setValue('content', post.content);
      setValue('category', post.category);
      setValue('coverImage', post.coverImage);
    }
  }, [post, setValue]);

  const onSubmit = async (data) => {
    try {
      await updatePost.mutateAsync({
        id,
        data: {
          ...data,
          content
        }
      });
      
      toast.success('Post updated successfully');
      navigate(`/post/${post.slug}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating post');
    }
  };

  if (isLoadingPost) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FileUpload
          currentImage={coverImage}
          onUploadSuccess={(data) => setValue('coverImage', data.url)}
          onUploadError={(error) => toast.error('Error uploading image')}
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
          onChange={(value) => setValue('content', value)}
          className="h-64 mb-12"
        />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/post/${post.slug}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updatePost.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {updatePost.isLoading ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost; 