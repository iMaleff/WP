import { useState, useMemo } from 'react';

const TAG_CATEGORIES = {
  technology: ['react', 'javascript', 'nodejs', 'python', 'database'],
  design: ['ui', 'ux', 'responsive', 'mobile', 'web-design'],
  development: ['frontend', 'backend', 'fullstack', 'api', 'testing'],
  other: ['tutorial', 'guide', 'tips', 'best-practices', 'career']
};

const TagInput = ({ value = [], onChange, maxTags = 5 }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const suggestions = useMemo(() => {
    const input = inputValue.toLowerCase();
    if (!input) return [];

    let tags = selectedCategory === 'all'
      ? Object.values(TAG_CATEGORIES).flat()
      : TAG_CATEGORIES[selectedCategory] || [];

    return tags
      .filter(tag => 
        tag.includes(input) && 
        !value.includes(tag)
      )
      .slice(0, 5);
  }, [inputValue, selectedCategory, value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim().toLowerCase();
      
      if (tag && !value.includes(tag) && value.length < maxTags) {
        onChange([...value, tag]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="all">All Categories</option>
          {Object.keys(TAG_CATEGORIES).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 border rounded min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500">
          {value.map(tag => (
            <span 
              key={tag}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length < maxTags ? "Add tags..." : ""}
            disabled={value.length >= maxTags}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>

        {suggestions.length > 0 && inputValue && (
          <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
            {suggestions.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  onChange([...value, tag]);
                  setInputValue('');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput; 