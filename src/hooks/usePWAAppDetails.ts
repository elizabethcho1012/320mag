import { useQuery } from '@tanstack/react-query';
import { getPWAAppById } from '@/services/pwaDatabase';

export function usePWAAppDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['pwa-app', id],
    queryFn: () => {
      if (!id) throw new Error('PWA App ID is required');
      return getPWAAppById(id);
    },
    enabled: !!id,
  });
}
