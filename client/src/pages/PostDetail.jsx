import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePost, useDeletePost } from '../hooks/usePost';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const { data: post, isLoading, error } = usePost(slug);
  const deletePost = useDeletePost();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost.mutateAsync(post._id);
        toast.success('Post deleted successfully');
        navigate('/');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting post');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error loading post</div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-lg"
          loading="lazy"
          srcSet={`${post.thumbnail} 400w, ${post.coverImage} 1200w`}
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between text-gray-500 mb-8">
          <div className="flex items-center space-x-4">
            <span>By {post.author.username}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/edit/${post._id}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-xl text-gray-600">{post.description}</p>
        </div>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
};

export default PostDetail; 