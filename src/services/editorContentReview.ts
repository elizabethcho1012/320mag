import { supabaseAny as supabase } from '../lib/supabase';

interface CategoryClassification {
  category: string;
  subcategory: string;
  confidence: number;
  reasoning: string;
}

/**
 * AI를 사용하여 에디터가 작성한 글의 카테고리를 자동으로 분류합니다.
 * Supabase Edge Function을 통해 서버에서 안전하게 AI 호출을 수행합니다.
 */
export async function classifyEditorArticle(
  articleId: string,
  title: string,
  content: string,
  excerpt?: string
): Promise<CategoryClassification> {
  try {
    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('classify-article', {
      body: {
        articleId,
        title,
        content,
        excerpt,
      },
    });

    if (error) {
      console.error('Edge Function 오류:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Edge Function에서 응답이 없습니다.');
    }

    console.log(`[AI 분류] 기사 "${title}" → ${data.category}/${data.subcategory || '없음'} (신뢰도: ${data.confidence}%)`);

    return {
      category: data.category,
      subcategory: data.subcategory,
      confidence: data.confidence,
      reasoning: data.reasoning,
    };
  } catch (error) {
    console.error('AI 카테고리 분류 오류:', error);
    throw error;
  }
}

/**
 * 발행된 에디터 글들을 주기적으로 검토하고 카테고리를 분류합니다.
 */
export async function reviewPendingEditorArticles() {
  try {
    // 카테고리가 지정되지 않은 발행된 글 찾기
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt')
      .eq('status', 'published')
      .is('category_id', null)
      .limit(10);

    if (error) throw error;

    if (!articles || articles.length === 0) {
      console.log('분류할 기사가 없습니다.');
      return;
    }

    console.log(`${articles.length}개의 기사를 AI로 분류합니다...`);

    for (const article of articles) {
      try {
        await classifyEditorArticle(
          article.id,
          article.title,
          article.content || '',
          article.excerpt || undefined
        );

        // API 제한 방지를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`기사 ${article.id} 분류 실패:`, error);
      }
    }

    console.log('AI 카테고리 분류 완료');
  } catch (error) {
    console.error('에디터 글 검토 오류:', error);
  }
}

/**
 * 에디터가 글을 발행할 때 즉시 AI 분류를 실행합니다.
 */
export async function classifyOnPublish(articleId: string) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('title, content, excerpt')
      .eq('id', articleId)
      .single();

    if (error) throw error;
    if (!article) throw new Error('기사를 찾을 수 없습니다.');

    await classifyEditorArticle(
      articleId,
      article.title,
      article.content || '',
      article.excerpt || undefined
    );

    return true;
  } catch (error) {
    console.error('즉시 분류 오류:', error);
    return false;
  }
}
