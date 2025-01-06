import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TagManager = () => {
  const [newTag, setNewTag] = useState({ name: '', category: '' });
  const queryClient = useQueryClient();

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await axios.get('/api/tags');
      return response.data;
    }
  });

  const createTag = useMutation({
    mutationFn: async (tag) => {
      const response = await axios.post('/api/tags', tag);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
    }
  });

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tag name"
          value={newTag.name}
          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Category"
          value={newTag.category}
          onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => createTag.mutate(newTag)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Tag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <TagCard key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
}; 