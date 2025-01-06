import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

const ProtectedContent = ({ content }) => {
  useEffect(() => {
    // Отключаем контекстное меню
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Отключаем копирование
    document.addEventListener('copy', (e) => e.preventDefault());
    
    // Отключаем print screen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
      }
    });
  }, []);

  const addBookmark = useMutation({
    mutationFn: async (selection) => {
      const response = await axios.post('/api/bookmarks', {
        content: selection,
        sourceId: content.id
      });
      return response.data;
    }
  });

  const handleSelection = () => {
    const selection = window.getSelection().toString();
    if (selection) {
      addBookmark.mutate(selection);
    }
  };

  return (
    <div 
      onMouseUp={handleSelection}
      className="prose max-w-none select-text"
      style={{ WebkitUserSelect: 'text' }}
    >
      {content}
    </div>
  );
}; 