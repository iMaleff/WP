export const Sidebar = () => {
  return (
    <div className="space-y-8">
      {/* Поиск */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Search with text</h2>
        <input 
          type="search"
          placeholder="Search..."
          className="w-full px-4 py-2 rounded-lg border bg-background"
        />
      </div>

      {/* Теги */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Search With Tags</h2>
        <div className="flex flex-wrap gap-2">
          {/* Теги из вашего API */}
        </div>
      </div>

      {/* Категории */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="space-y-2">
          {/* Категории из вашего API */}
        </div>
      </div>
    </div>
  );
}; 