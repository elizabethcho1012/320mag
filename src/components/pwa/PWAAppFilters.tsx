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

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Category Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as PWASortBy)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="recently_updated">Recently Updated</option>
        </select>
      </div>
    </div>
  );
}
