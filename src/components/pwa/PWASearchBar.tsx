import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface PWASearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PWASearchBar({
  value,
  onChange,
  placeholder = 'Search for apps...',
}: PWASearchBarProps) {
  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />
    </div>
  );
}
