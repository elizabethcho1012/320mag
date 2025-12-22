import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * 특정 기사의 좋아요 정보를 가져오는 훅
 */
export function useArticleLikes(articleId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // 기사의 총 좋아요 수
  const { data: likeCount = 0 } = useQuery({
    queryKey: ['article-likes-count', articleId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!articleId,
  });

  // 현재 사용자가 좋아요를 눌렀는지 여부
  const { data: hasLiked = false } = useQuery({
    queryKey: ['article-user-liked', articleId, profile?.id],
    queryFn: async () => {
      if (!profile) return false;

      const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!articleId && !!profile,
  });

  // 좋아요 토글 뮤테이션
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error('로그인이 필요합니다.');
      }

      if (hasLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', profile.id);

        if (error) throw error;
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('article_likes')
          .insert({
            article_id: articleId,
            user_id: profile.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // 캐시 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['article-likes-count', articleId] });
      queryClient.invalidateQueries({ queryKey: ['article-user-liked', articleId, profile?.id] });
    },
  });

  return {
    likeCount,
    hasLiked,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
}

/**
 * 기사 조회수를 기록하는 훅
 */
export function useArticleView(articleId: string) {
  const { profile } = useAuth();
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    if (!articleId || hasRecorded) return;

    const recordView = async () => {
      try {
        // 세션 ID 생성 (비로그인 사용자용)
        let sessionId = sessionStorage.getItem('visitor_session');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('visitor_session', sessionId);
        }

        await supabase.from('article_views').insert({
          article_id: articleId,
          user_id: profile?.id || null,
          session_id: sessionId,
        });

        setHasRecorded(true);
      } catch (error) {
        console.error('조회수 기록 오류:', error);
      }
    };

    // 페이지 진입 후 3초 뒤에 조회수 기록 (봇 방지)
    const timer = setTimeout(recordView, 3000);

    return () => clearTimeout(timer);
  }, [articleId, profile, hasRecorded]);
}

/**
 * 기사의 통계 정보를 가져오는 훅
 */
export function useArticleStats(articleId: string) {
  return useQuery({
    queryKey: ['article-stats', articleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_article_stats', {
        p_article_id: articleId,
      });

      if (error) {
        // RPC 함수가 없을 경우 대체 방법 사용
        console.warn('get_article_stats RPC not available, using fallback');

        const [likesResult, viewsResult] = await Promise.all([
          supabase
            .from('article_likes')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', articleId),
          supabase
            .from('article_views')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', articleId),
        ]);

        return {
          like_count: likesResult.count || 0,
          view_count: viewsResult.count || 0,
          unique_view_count: viewsResult.count || 0, // 근사값
        };
      }

      return data?.[0] || { like_count: 0, view_count: 0, unique_view_count: 0 };
    },
    enabled: !!articleId,
    staleTime: 30 * 1000, // 30초
  });
}
