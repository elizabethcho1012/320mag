// 잘못 분류된 기사 찾기 및 수정
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  id: string;
  title: string;
  content: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// 카테고리별 콘텐츠 매칭 규칙
const contentRules = {
  sexuality: {
    keywords: ['발기', '성관계', '성생활', '섹스', '친밀감', '성욕', '오르가즘', '성기능', 'erectile', 'impotence', 'sex life', 'intimacy', 'libido'],
    excludeIfIn: ['housing', 'food']
  },
  food: {
    keywords: ['레시피', '요리', '베이킹', '빵', '케이크', '음식', '식사', '재료', 'recipe', 'baking', 'bread', 'cooking', 'meal', 'ingredient'],
    mustHave: ['레시피', '요리', '베이킹', '빵', '케이크', 'recipe', 'baking', 'bread', 'cooking'],
    excludeIfIn: ['housing']
  },
  housing: {
    keywords: ['인테리어', '가구', '리모델링', '집 꾸미기', 'interior', 'furniture', 'remodel', 'decoration'],
    mustHave: ['인테리어', '가구', '리모델링', 'interior', 'furniture', 'remodel'],
    excludeKeywords: ['발기', '성관계', '레시피', '요리', '베이킹']
  }
};

async function getCategories(): Promise<Map<string, Category>> {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug');

  const map = new Map<string, Category>();
  data?.forEach(cat => map.set(cat.slug, cat));
  return map;
}

function shouldReclassify(article: Article, currentCategorySlug: string): { shouldFix: boolean; newCategory?: string; reason?: string } {
  const text = `${article.title} ${article.content}`.toLowerCase();

  // 하우징 카테고리 체크
  if (currentCategorySlug === 'housing') {
    // 섹슈얼리티 콘텐츠가 하우징에 있는 경우
    const hasSexualityKeywords = contentRules.sexuality.keywords.some(kw => text.includes(kw.toLowerCase()));
    if (hasSexualityKeywords) {
      return {
        shouldFix: true,
        newCategory: 'sexuality',
        reason: '섹슈얼리티 관련 콘텐츠가 하우징 카테고리에 잘못 분류됨'
      };
    }

    // 푸드 콘텐츠가 하우징에 있는 경우
    const hasFoodMustHave = contentRules.food.mustHave?.some(kw => text.includes(kw.toLowerCase()));
    if (hasFoodMustHave) {
      // 하우징 필수 키워드가 없으면 푸드로 이동
      const hasHousingMustHave = contentRules.housing.mustHave?.some(kw => text.includes(kw.toLowerCase()));
      if (!hasHousingMustHave) {
        return {
          shouldFix: true,
          newCategory: 'food',
          reason: '푸드 관련 콘텐츠(레시피/요리)가 하우징 카테고리에 잘못 분류됨'
        };
      }
    }

    // 하우징 제외 키워드 체크
    const hasExcludeKeywords = contentRules.housing.excludeKeywords?.some(kw => text.includes(kw.toLowerCase()));
    if (hasExcludeKeywords) {
      return {
        shouldFix: true,
        newCategory: 'unknown',
        reason: '하우징과 관련 없는 콘텐츠'
      };
    }
  }

  return { shouldFix: false };
}

async function fixMisclassifiedArticles() {
  console.log('🔍 잘못 분류된 기사 검색 중...\n');

  const categories = await getCategories();

  // 모든 기사 조회
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, category_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  console.log(`📊 총 ${articles?.length || 0}개 기사 검사\n`);

  const misclassified: Array<{
    article: Article;
    currentCategory: string;
    newCategory: string;
    reason: string;
  }> = [];

  // 각 기사 검사
  for (const article of articles || []) {
    // 현재 카테고리 찾기
    const currentCat = Array.from(categories.values()).find(c => c.id === article.category_id);
    if (!currentCat) continue;

    const result = shouldReclassify(article, currentCat.slug);

    if (result.shouldFix && result.newCategory) {
      misclassified.push({
        article,
        currentCategory: currentCat.slug,
        newCategory: result.newCategory,
        reason: result.reason || '카테고리 불일치'
      });
    }
  }

  console.log(`⚠️  잘못 분류된 기사: ${misclassified.length}개\n`);

  if (misclassified.length === 0) {
    console.log('✅ 모든 기사가 올바르게 분류되어 있습니다!');
    return;
  }

  // 잘못 분류된 기사 출력
  for (let i = 0; i < misclassified.length; i++) {
    const item = misclassified[i];
    console.log(`${i + 1}. "${item.article.title}"`);
    console.log(`   현재: ${item.currentCategory} → 수정: ${item.newCategory}`);
    console.log(`   이유: ${item.reason}`);
    console.log(`   ID: ${item.article.id}\n`);
  }

  // 수정 진행
  console.log('\n🔧 기사 재분류 시작...\n');

  let successCount = 0;
  let failCount = 0;

  for (const item of misclassified) {
    const newCat = categories.get(item.newCategory);
    if (!newCat) {
      console.log(`⚠️  "${item.newCategory}" 카테고리를 찾을 수 없음 - 건너뜀`);
      failCount++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ category_id: newCat.id })
      .eq('id', item.article.id);

    if (updateError) {
      console.error(`❌ "${item.article.title}" 수정 실패:`, updateError);
      failCount++;
    } else {
      console.log(`✅ "${item.article.title}" → ${item.newCategory}`);
      successCount++;
    }
  }

  console.log('\n\n📊 재분류 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  console.log(`   합계: ${misclassified.length}개`);

  if (successCount > 0) {
    console.log('\n✅ 기사 재분류 완료!');
  }
}

fixMisclassifiedArticles();
