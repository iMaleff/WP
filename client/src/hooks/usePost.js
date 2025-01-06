import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Получение списка постов
export const usePosts = (params = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/posts`, { params });
      return response.data;
    }
  });
};

// Получение одного поста
export const usePost = (slug) => {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/posts/${slug}`);
      return response.data;
    },
    enabled: !!slug
  });
};

// Создание поста
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      const response = await axios.post(`${API_URL}/api/posts`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });
};

// Обновление поста
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`${API_URL}/api/posts/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['post', data.slug]);
    }
  });
};

// Удаление поста
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });
}; 