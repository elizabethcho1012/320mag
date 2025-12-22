import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface HomepageSettings {
  id: string;
  total_slides: number;
  article_slides: number;
  ad_slides: number;
  slide_categories: string[];
  autoplay_enabled: boolean;
  autoplay_interval: number;
  created_at: string;
  updated_at: string;
}

const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

// 홈페이지 설정 조회
export const useHomepageSettings = () => {
  return useQuery<HomepageSettings>({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .single();

      if (error) {
        console.error('홈페이지 설정 조회 실패:', error);
        // 기본값 반환
        return {
          id: SETTINGS_ID,
          total_slides: 5,
          article_slides: 3,
          ad_slides: 2,
          slide_categories: ['fashion', 'beauty', 'travel'],
          autoplay_enabled: true,
          autoplay_interval: 5000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 홈페이지 설정 업데이트
export const useUpdateHomepageSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<HomepageSettings>) => {
      const { data, error } = await supabase
        .from('homepage_settings')
        .update(updates)
        .eq('id', SETTINGS_ID)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
    },
  });
};
