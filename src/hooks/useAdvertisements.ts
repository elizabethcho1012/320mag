import { useQuery } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../lib/supabase';

export interface Advertisement {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  category_id: string | null;
  position: 'top' | 'sidebar' | 'inline';
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

/**
 * 특정 카테고리의 활성화된 광고를 가져옵니다.
 */
export function useAdvertisementsByCategory(categoryId: string | null, position: 'top' | 'sidebar' | 'inline' = 'top') {
  return useQuery({
    queryKey: ['advertisements', categoryId, position],
    queryFn: async () => {
      const now = new Date().toISOString();

      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .eq('position', position)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

      if (error) {
        console.error('광고 가져오기 오류:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}
