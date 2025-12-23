import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: 'online' | 'offline' | 'hybrid' | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  registration_fee: number | null;
  featured_image_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category_id: string | null;
  creator_id: string | null;
  created_at: string;
  updated_at: string;
}

// 모든 published 이벤트 가져오기
export const usePublishedEvents = () => {
  return useQuery({
    queryKey: ['events', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching published events:', error);
        throw error;
      }

      return data as Event[];
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// Featured 이벤트 가져오기 (최신 3개)
export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      console.log('🎉 useFeaturedEvents: 이벤트 조회 시작...');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('❌ useFeaturedEvents 오류:', error);
        throw error;
      }

      console.log('✅ useFeaturedEvents 성공:', data?.length, '개 조회됨', data);
      return data as Event[];
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};
