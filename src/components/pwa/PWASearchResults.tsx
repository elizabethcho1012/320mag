import { PWAAppCard } from './PWAAppCard';
import type { PWAApp } from '@/types/pwa.types';

export interface PWASearchResultsProps {
  results: PWAApp[];
  isLoading: boolean;
  query: string;
  onAppClick?: (appId: string) => void;
}

export function PWASearchResults({
  results,
  isLoading,
  query,
  onAppClick,
}: PWASearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enter a search query to find apps</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 animate-pulse shadow-sm"
          >
            <div className="h-48 bg-gray-200 rounded-xl mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-2 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-12" />
              <div className="h-5 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No apps found for "{query}"</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">
        Found {results.length} {results.length === 1 ? 'app' : 'apps'} for "{query}"
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((app) => (
          <PWAAppCard key={app.id} app={app} onClick={onAppClick} />
        ))}
      </div>
    </div>
  );
}
