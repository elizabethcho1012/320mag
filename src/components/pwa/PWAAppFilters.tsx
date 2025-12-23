import { usePWACategories } from '@/hooks/usePWACategories';
import type { PWASortBy } from '@/types/pwa.types';

export interface PWAAppFiltersProps {
  category: string;
  sortBy: PWASortBy;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: PWASortBy) => void;
}

export function PWAAppFilters({
  category,
  sortBy,
  onCategoryChange,
  onSortChange,
}: PWAAppFiltersProps) {
  const { data: categories } = usePWACategories();

  // Fallback categories if database query fails
  const fallbackCategories = [
    { name: 'Productivity', icon: '📊' },
    { name: 'Games', icon: '🎮' },
    { name: 'Social', icon: '👥' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Education', icon: '📚' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Utilities', icon: '🔧' },
    { name: 'Business', icon: '💼' },
    { name: 'Health', icon: '💪' },
    { name: 'Travel', icon: '✈️' },
  ];

  const displayCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-10">
      {/* Category Filter */}
      <div className="flex-1 relative z-20">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer relative z-20"
        >
          <option value="">All Categories</option>
          {displayCategories.map((cat, index) => (
            <option key={cat.name || index} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex-1 relative z-20">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as PWASortBy)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer relative z-20"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="recently_updated">Recently Updated</option>
        </select>
      </div>
    </div>
  );
}
