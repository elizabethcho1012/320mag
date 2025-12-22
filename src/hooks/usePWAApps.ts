import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getPWAApps } from '@/services/pwaDatabase';
import type { PWAAppFilters } from '@/types/pwa.types';

export function usePWAApps(filters: PWAAppFilters = {}) {
  return useQuery({
    queryKey: ['pwa-apps', filters],
    queryFn: async () => {
      const { apps } = await getPWAApps(filters);
      return apps;
    },
  });
}

export function useInfinitePWAApps(filters: PWAAppFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['pwa-apps', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getPWAApps({
        ...filters,
        offset: pageParam
      });
      return result;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      const totalLoaded = allPages.reduce((sum, page) => sum + page.apps.length, 0);
      return totalLoaded;
    },
    initialPageParam: 0,
  });
}
