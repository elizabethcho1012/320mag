import { useInfinitePWAApps } from '@/hooks/usePWAApps';
import { PWAAppCard } from './PWAAppCard';
import type { PWAAppFilters } from '@/types/pwa.types';

export interface PWAAppGridProps {
  filters?: PWAAppFilters;
}

export function PWAAppGrid({ filters }: PWAAppGridProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePWAApps(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Error: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  const apps = data?.pages.flatMap((page) => page.apps) || [];

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No PWA apps found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid - iPhone Mockup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {apps.map((app) => (
          <PWAAppCard key={app.id} app={app} />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
