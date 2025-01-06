import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import supabase from '@/utils/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Получаем список постов
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', searchQuery, selectedTag],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username),
          tags:post_tags(tag:tags(*))
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (selectedTag !== 'all') {
        query = query.contains('tags', [{ tag: { slug: selectedTag } }]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Получаем список тегов
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-12">
      {/* Hero секция */}
      <section className="py-16 -mt-8 mb-8 bg-primary/5 rounded-lg">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Wellness Puzzle - Ваш путь к здоровью
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Исследуйте статьи о здоровье, фитнесе и благополучии
          </p>
          <div className="flex gap-4 justify-center">
            <Input
              type="search"
              placeholder="Поиск статей..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Секция с тегами */}
      <section className="border-b pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedTag === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedTag('all')}
          >
            Все
          </Button>
          {tags?.map(tag => (
            <Button
              key={tag.id}
              variant={selectedTag === tag.slug ? 'default' : 'outline'}
              onClick={() => setSelectedTag(tag.slug)}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Секция со статьями */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map(post => (
            <Link key={post.id} to={`/post/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {post.author.username}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 