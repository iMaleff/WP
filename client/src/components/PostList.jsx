import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdvancedSearch from './AdvancedSearch';
import PostCard from './PostCard';
import Pagination from './Pagination';
import supabase from '../utils/supabase';

const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ['posts', searchParams.toString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_posts', {
        search_params: Object.fromEntries(searchParams.entries())
      });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Загрузка...</div>;

  const { posts, pagination } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AdvancedSearch />
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900">
            Посты не найдены
          </h3>
          <p className="mt-2 text-gray-500">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={(newPage) => {
                setSearchParams(prev => {
                  prev.set('page', newPage);
                  return prev;
                });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PostList;
