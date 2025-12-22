// 심리 카테고리에 잘못 분류된 섹슈얼리티 기사를 올바른 카테고리로 이동
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 섹슈얼리티 관련 키워드 (폐경, 성욕, 친밀감, 생리, 난소, 성생활, 성문화 등)
const sexualityKeywords = [
  '폐경', '성욕', '친밀감', '생리', '난소', '성생활', '성문화',
  'menopause', 'libido', 'intimacy', 'period', 'ovary', 'PCOS',
  '갱년기', '발기', '발기부전', 'erectile', 'sexual health', 'sex life',
  '오르가즘', 'orgasm', '성기능', '성관계'
];

async function fixMindToSexuality() {
  console.log('🔧 심리 → 섹슈얼리티 카테고리 수정 시작...\n');

  // 1. 카테고리 ID 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name')
    .in('slug', ['mind', 'sexuality']);

  if (!categories || categories.length !== 2) {
    console.error('❌ 카테고리를 찾을 수 없습니다.');
    return;
  }

  const mindCategory = categories.find(c => c.slug === 'mind');
  const sexualityCategory = categories.find(c => c.slug === 'sexuality');

  if (!mindCategory || !sexualityCategory) {
    console.error('❌ mind 또는 sexuality 카테고리를 찾을 수 없습니다.');
    return;
  }

  console.log(`📂 mind 카테고리 ID: ${mindCategory.id}`);
  console.log(`📂 sexuality 카테고리 ID: ${sexualityCategory.id}\n`);

  // 2. mind 카테고리의 모든 기사 가져오기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content')
    .eq('category_id', mindCategory.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  console.log(`📊 mind 카테고리 총 기사: ${articles?.length || 0}개\n`);

  // 3. 섹슈얼리티 키워드가 포함된 기사 찾기
  const articlesToMove: Array<{ id: string; title: string; matchedKeywords: string[] }> = [];

  articles?.forEach(article => {
    const fullText = `${article.title} ${article.content}`.toLowerCase();
    const matchedKeywords: string[] = [];

    sexualityKeywords.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    });

    if (matchedKeywords.length > 0) {
      articlesToMove.push({
        id: article.id,
        title: article.title,
        matchedKeywords
      });
    }
  });

  console.log(`🎯 이동 대상: ${articlesToMove.length}개 기사\n`);

  if (articlesToMove.length === 0) {
    console.log('✅ 이동할 기사가 없습니다!');
    return;
  }

  // 4. 각 기사 이동
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < articlesToMove.length; i++) {
    const article = articlesToMove[i];
    console.log(`\n[${i + 1}/${articlesToMove.length}] "${article.title}"`);
    console.log(`   매칭 키워드: ${article.matchedKeywords.join(', ')}`);

    // 카테고리 업데이트
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        category_id: sexualityCategory.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id);

    if (updateError) {
      console.error(`   ❌ 업데이트 실패:`, updateError);
      failCount++;
    } else {
      console.log(`   ✅ mind → sexuality 이동 완료`);
      successCount++;
    }
  }

  console.log('\n\n📊 최종 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  console.log(`   합계: ${articlesToMove.length}개`);

  if (successCount > 0) {
    console.log('\n✅ 섹슈얼리티 기사 이동 완료!');

    // 5. 최종 검증
    const { data: sexualityArticles } = await supabase
      .from('articles')
      .select('id, title')
      .eq('category_id', sexualityCategory.id);

    console.log(`\n📈 섹슈얼리티 카테고리 현재 기사: ${sexualityArticles?.length || 0}개`);

    if (sexualityArticles && sexualityArticles.length > 0) {
      console.log('\n섹슈얼리티 카테고리 기사 목록:');
      sexualityArticles.forEach((article, idx) => {
        console.log(`   ${idx + 1}. ${article.title}`);
      });
    }
  }
}

fixMindToSexuality();
