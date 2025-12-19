import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

/**
 * 모든 크리에이터 조회
 */
export function useCreators() {
  return useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}

/**
 * 특정 크리에이터 조회
 */
export function useCreatorById(id: string) {
  return useQuery({
    queryKey: ['creator', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * 크리에이터의 아티클 조회
 */
export function useCreatorArticles(creatorId: string, limit = 10) {
  return useQuery({
    queryKey: ['creator-articles', creatorId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*),
          creators (*)
        `)
        .eq('creator_id', creatorId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!creatorId,
  });
}
