import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {post.cover_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-4">
        <Link to={`/post/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <HeartIcon className="w-4 h-4 mr-1" />
              {post.likes_count}
            </span>
            <span className="flex items-center">
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              {post.comments_count}
            </span>
          </div>
          <div className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            {post.views || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 