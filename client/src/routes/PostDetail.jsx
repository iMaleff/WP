import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import supabase from '../utils/supabase';

const PostDetail = () => {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, avatar_url),
          tags:post_tags(tag:tags(*))
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  if (!post) {
    return <div className="text-center p-8">Пост не найден</div>;
  }

  return (
    <article className="max-w-4xl mx-auto">
      {post.cover_url && (
        <img
          src={post.cover_url}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center mb-6">
        <img
          src={post.author.avatar_url || '/default-avatar.png'}
          alt={post.author.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="font-medium">{post.author.username}</div>
          <div className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags?.length > 0 && (
        <div className="mt-6 flex gap-2">
          {post.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-gray-100 text-sm rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default PostDetail; 