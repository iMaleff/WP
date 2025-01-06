import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import supabase from '../utils/supabase';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    tags: [],
    categories: [],
    dateFrom: null,
    dateTo: null,
    author: null,
    sortBy: { value: 'created_at', label: 'Дата создания' },
    sortOrder: { value: 'desc', label: 'По убыванию' }
  });

  // Получаем список тегов
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name');
      if (error) throw error;
      return data.map(tag => ({ value: tag.id, label: tag.name }));
    }
  });

  // Получаем список категорий
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      if (error) throw error;
      return data.map(cat => ({ value: cat.id, label: cat.name }));
    }
  });

  // Получаем список авторов
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('role', 'editor');
      if (error) throw error;
      return data.map(author => ({ value: author.id, label: author.username }));
    }
  });

  const sortOptions = [
    { value: 'created_at', label: 'По дате' },
    { value: 'title', label: 'По заголовку' },
    { value: 'likes', label: 'По популярности' },
    { value: 'comments', label: 'По комментариям' }
  ];

  const orderOptions = [
    { value: 'desc', label: 'По убыванию' },
    { value: 'asc', label: 'По возрастанию' }
  ];

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('query', filters.query);
    if (filters.tags.length) params.set('tags', JSON.stringify(filters.tags.map(t => t.value)));
    if (filters.categories.length) params.set('categories', JSON.stringify(filters.categories.map(c => c.value)));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.set('dateTo', filters.dateTo.toISOString());
    if (filters.author) params.set('author', filters.author.value);
    params.set('sortBy', filters.sortBy.value);
    params.set('sortOrder', filters.sortOrder.value);

    setSearchParams(params);
  }, [filters, setSearchParams]);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Поисковая строка */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Введите текст для поиска..."
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Теги */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Теги
          </label>
          <Select
            isMulti
            options={tags}
            value={filters.tags}
            onChange={(selected) => setFilters(prev => ({ ...prev, tags: selected || [] }))}
            placeholder="Выберите теги..."
            className="w-full"
          />
        </div>

        {/* Категории */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категории
          </label>
          <Select
            isMulti
            options={categories}
            value={filters.categories}
            onChange={(selected) => setFilters(prev => ({ ...prev, categories: selected || [] }))}
            placeholder="Выберите категории..."
            className="w-full"
          />
        </div>

        {/* Период */}
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              С
            </label>
            <DatePicker
              selected={filters.dateFrom}
              onChange={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
              className="w-full p-2 border rounded"
              dateFormat="dd.MM.yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              По
            </label>
            <DatePicker
              selected={filters.dateTo}
              onChange={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
              className="w-full p-2 border rounded"
              dateFormat="dd.MM.yyyy"
            />
          </div>
        </div>

        {/* Автор */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Автор
          </label>
          <Select
            options={authors}
            value={filters.author}
            onChange={(selected) => setFilters(prev => ({ ...prev, author: selected }))}
            placeholder="Выберите автора..."
            isClearable
            className="w-full"
          />
        </div>

        {/* Сортировка */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортировать по
            </label>
            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={(selected) => setFilters(prev => ({ ...prev, sortBy: selected }))}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок
            </label>
            <Select
              options={orderOptions}
              value={filters.sortOrder}
              onChange={(selected) => setFilters(prev => ({ ...prev, sortOrder: selected }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setFilters({
            query: '',
            tags: [],
            categories: [],
            dateFrom: null,
            dateTo: null,
            author: null,
            sortBy: { value: 'created_at', label: 'Дата создания' },
            sortOrder: { value: 'desc', label: 'По убыванию' }
          })}
          className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearch; 