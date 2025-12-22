import { useQuery } from '@tanstack/react-query';
import { getPWACategories } from '@/services/pwaDatabase';

export function usePWACategories() {
  return useQuery({
    queryKey: ['pwa-categories'],
    queryFn: getPWACategories,
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  });
}
