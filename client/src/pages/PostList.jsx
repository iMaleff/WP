import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PostList = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
      return response.data.posts;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error loading posts</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link 
            key={post._id} 
            to={`/post/${post.slug}`}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={post.thumbnail || post.coverImage}
                alt={post.title}
                className="w-full h-48 object-cover group-hover:opacity-90 transition"
                loading="lazy"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="mt-2 text-gray-600 line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>By {post.author.username}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostList; 