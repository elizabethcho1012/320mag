// src/hooks/useArticles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../lib/supabase';
// import type { Database } from '../lib/database.types';

// 임시로 타입 정의 (Database 타입이 없는 경우)
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: string;
  featured: boolean;
  published_at: string;
  category_id: string;
  subcategory_id: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  views: number;
};

type Creator = {
  id: string;
  name: string;
  profession: string;
  bio: string;
  image_url: string;
  verified: boolean;
  status: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type DailyNews = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published_date: string;
  status: string;
};

// 발행된 기사 조회 (프론트엔드용) - 에러 처리 강화
export const usePublishedArticles = () => {
  return useQuery({
    queryKey: ['articles', 'published'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories(name, slug),
            subcategories(name, slug),
            creators(name, profession, verified),
            editors(name, profession, verified)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Published articles 쿼리 오류:', error);
          throw error;
        }
        
        console.log('Published articles 조회 성공:', data?.length, '개');
        return data || [];
      } catch (error) {
        console.error('usePublishedArticles 에러:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30 * 1000, // 30초 (더 자주 새 데이터 확인)
    gcTime: 2 * 60 * 1000, // 2분
  });
};

// 카테고리별 기사 조회 - 에러 처리 강화
export const useArticlesByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['articles', 'category', categorySlug],
    queryFn: async () => {
      try {
        if (!categorySlug) {
          throw new Error('Category slug is required');
        }

        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories!inner(name, slug),
            subcategories(name, slug),
            creators(name, profession)
          `)
          .eq('categories.slug', categorySlug)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Category articles 쿼리 오류:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('useArticlesByCategory 에러:', error);
        throw error;
      }
    },
    enabled: !!categorySlug,
    retry: 1,
  });
};

// Featured 기사 조회 - 에러 처리 강화
export const useFeaturedArticles = () => {
  return useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories(name, slug),
            subcategories(name, slug),
            creators(name, profession)
          `)
          .eq('status', 'published')
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Featured articles 쿼리 오류:', error);
          throw error;
        }
        
        console.log('Featured articles 조회 성공:', data?.length, '개');
        return data || [];
      } catch (error) {
        console.error('useFeaturedArticles 에러:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30 * 1000, // 30초 (더 자주 새 데이터 확인)
  });
};

// 기사 상세 조회 (slug 기반) - 에러 처리 강화
export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      try {
        if (!slug) {
          throw new Error('Article slug is required');
        }

        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories(name, slug),
            subcategories(name, slug),
            creators(name, profession, bio, image_url, verified)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error('Article 쿼리 오류:', error);
          throw error;
        }
        
        // 조회수 증가 (에러가 발생해도 기사 로딩은 계속)
        try {
          const { error: rpcError } = await supabase
            .rpc('update_article_views', { article_uuid: data.id });

          if (rpcError) {
            console.warn('조회수 업데이트 실패:', rpcError);
          }
        } catch (viewError) {
          console.warn('조회수 업데이트 중 오류:', viewError);
        }
        
        return data;
      } catch (error) {
        console.error('useArticle 에러:', error);
        throw error;
      }
    },
    enabled: !!slug,
    retry: 1,
  });
};

// 기사 상세 조회 (ID 기반) - UUID 형식 검증 추가
export const useArticleById = (articleId: string) => {
  return useQuery({
    queryKey: ['article', 'id', articleId],
    queryFn: async () => {
      try {
        console.log('기사 조회 시도 - ID:', articleId);

        if (!articleId) {
          throw new Error('Article ID is required');
        }

        // UUID 형식 간단 검증
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(articleId)) {
          console.error('잘못된 UUID 형식:', articleId);
          throw new Error('Invalid UUID format');
        }

        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories(name, slug),
            subcategories(name, slug),
            creators(name, profession, bio, image_url, verified),
            editors(name, profession, verified)
          `)
          .eq('id', articleId)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error('기사 조회 오류:', error);
          console.error('시도한 ID:', articleId);
          throw error;
        }
        
        console.log('조회된 기사:', data.title);
        
        // 조회수 증가
        try {
          const { error: rpcError } = await supabase
            .rpc('update_article_views', { article_uuid: data.id });

          if (rpcError) {
            console.warn('조회수 업데이트 실패:', rpcError);
          }
        } catch (viewError) {
          console.warn('조회수 업데이트 중 오류:', viewError);
        }
        
        return data;
      } catch (error) {
        console.error('useArticleById 에러:', error);
        throw error;
      }
    },
    enabled: !!articleId,
    retry: 1,
  });
};

// 관련 기사 조회 - 에러 처리 강화
export const useRelatedArticles = (articleId: string, categoryId: string) => {
  return useQuery({
    queryKey: ['articles', 'related', articleId],
    queryFn: async () => {
      try {
        if (!articleId || !categoryId) {
          throw new Error('Article ID and Category ID are required');
        }

        const { data, error } = await supabase
          .from('articles')
          .select(`
            id, title, slug, excerpt, featured_image_url,
            categories(name, slug),
            creators(name)
          `)
          .eq('category_id', categoryId)
          .eq('status', 'published')
          .neq('id', articleId)
          .limit(3);

        if (error) {
          console.error('Related articles 쿼리 오류:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('useRelatedArticles 에러:', error);
        throw error;
      }
    },
    enabled: !!articleId && !!categoryId,
    retry: 1,
  });
};

// 기사 검색 - 에러 처리 강화
export const useSearchArticles = (query: string) => {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: async () => {
      try {
        if (!query || query.trim().length < 2) {
          return [];
        }
        
        const searchQuery = query.trim();
        
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories(name, slug),
            subcategories(name, slug),
            creators(name)
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Search articles 쿼리 오류:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('useSearchArticles 에러:', error);
        throw error;
      }
    },
    enabled: !!query && query.trim().length >= 2,
    retry: 1,
  });
};

// 크리에이터 조회 - 실제 크리에이터만 (AI 에디터는 editors 테이블로 분리됨)
export const useCreators = () => {
  return useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Creators 쿼리 오류:', error);
          throw error;
        }

        console.log('Creators 조회 성공:', (data || []).length, '개');
        return data || [];
      } catch (error) {
        console.error('useCreators 에러:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 카테고리 조회 - 에러 처리 강화
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories(*)
          `)
          .order('order_index');

        if (error) {
          console.error('Categories 쿼리 오류:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('useCategories 에러:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30 * 60 * 1000, // 30분
  });
};

// 데일리뉴스 조회 - 에러 처리 강화
export const useDailyNews = () => {
  return useQuery({
    queryKey: ['daily_news'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('daily_news')
          .select('*')
          .eq('status', 'published')
          .order('published_date', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Daily news 쿼리 오류:', error);
          throw error;
        }

        console.log('Daily news 조회 성공:', data?.length, '개');
        return data || [];
      } catch (error) {
        console.error('useDailyNews 에러:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 이전글/다음글 조회 (같은 카테고리 내)
export const usePrevNextArticles = (currentArticleId: string, categoryId: string, publishedAt: string) => {
  return useQuery({
    queryKey: ['articles', 'prev-next', currentArticleId],
    queryFn: async () => {
      try {
        if (!currentArticleId || !categoryId || !publishedAt) {
          return { prev: null, next: null };
        }

        // 이전 글 (현재 글보다 이전에 발행된 글 중 가장 최근 것)
        const { data: prevData } = await supabase
          .from('articles')
          .select('id, title, slug, featured_image_url')
          .eq('category_id', categoryId)
          .eq('status', 'published')
          .lt('published_at', publishedAt)
          .order('published_at', { ascending: false })
          .limit(1)
          .single();

        // 다음 글 (현재 글보다 나중에 발행된 글 중 가장 오래된 것)
        const { data: nextData } = await supabase
          .from('articles')
          .select('id, title, slug, featured_image_url')
          .eq('category_id', categoryId)
          .eq('status', 'published')
          .gt('published_at', publishedAt)
          .order('published_at', { ascending: true })
          .limit(1)
          .single();

        return {
          prev: prevData || null,
          next: nextData || null,
        };
      } catch (error) {
        console.error('usePrevNextArticles 에러:', error);
        return { prev: null, next: null };
      }
    },
    enabled: !!currentArticleId && !!categoryId && !!publishedAt,
    retry: 1,
  });
};