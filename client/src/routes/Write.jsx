import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import supabase from '../utils/supabase';
import ImageUpload from '../components/ImageUpload';

const Write = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    coverUrl: '',
    tags: []
  });

  // Проверка роли пользователя
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Получение списка тегов
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name');
      if (error) throw error;
      return data;
    }
  });

  // Мутация для создания поста
  const createPost = useMutation({
    mutationFn: async (postData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          author_id: user.id,
          slug: postData.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Пост успешно создан');
      navigate(`/post/${data.slug}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Ошибка при создании поста');
    }
  });

  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== 'editor')) {
      navigate('/');
    }
  }, [profile, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Запо��ните все обязательные поля');
      return;
    }

    createPost.mutate({
      title: formData.title,
      content: formData.content,
      description: formData.description || formData.content.slice(0, 200),
      cover_url: formData.coverUrl,
      tags: formData.tags
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  if (!profile || profile.role !== 'editor') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Создать пост</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Обложка поста
          </label>
          <ImageUpload 
            onUpload={(url) => setFormData(prev => ({ ...prev, coverUrl: url }))} 
          />
          {formData.coverUrl && (
            <div className="mt-2">
              <img
                src={formData.coverUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Краткое описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Содержание *
          </label>
          <ReactQuill
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            className="h-64 mb-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Теги
          </label>
          <select
            multiple
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              tags: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full p-2 border rounded"
          >
            {tags?.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createPost.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createPost.isPending ? 'Публикация...' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Write;
