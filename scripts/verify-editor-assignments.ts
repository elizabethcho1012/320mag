import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function verifyEditorAssignments() {
  console.log('🔍 AI 에디터 배정 확인 중...\n');

  // 최근 20개 기사의 카테고리와 크리에이터 확인
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      categories(name),
      creators(name, profession, bio)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('❌ 기사가 없습니다.');
    return;
  }

  console.log(`📝 최근 기사 ${articles.length}개 에디터 배정 확인\n`);

  // 카테고리별로 그룹화
  const categoryGroups: Record<string, any[]> = {};

  articles.forEach(article => {
    const categoryName = (article.categories as any)?.name || 'N/A';
    if (!categoryGroups[categoryName]) {
      categoryGroups[categoryName] = [];
    }
    categoryGroups[categoryName].push(article);
  });

  // 카테고리별 분석
  let mismatches = 0;

  Object.entries(categoryGroups).forEach(([category, arts]) => {
    console.log(`\n=== ${category} 카테고리 (${arts.length}개) ===`);

    arts.forEach((article, idx) => {
      const creatorName = (article.creators as any)?.name || 'N/A';
      const creatorProf = (article.creators as any)?.profession || 'N/A';
      const creatorBio = (article.creators as any)?.bio || '';

      console.log(`\n[${idx + 1}] ${article.title.substring(0, 60)}...`);
      console.log(`   에디터: ${creatorName} (${creatorProf})`);

      // 카테고리-에디터 매칭 검증
      const expectedEditors: Record<string, string[]> = {
        '패션': ['Sophia'],
        '뷰티': ['Jane'],
        '컬처': ['Martin'],
        '여행': ['Clara'],
        '시니어시장': ['Henry'],
        '글로벌트렌드': ['Marcus'],
        '푸드': ['Antoine'],
        '하우징': ['Thomas'],
        '섹슈얼리티': ['Dr. Sarah'],
        '심리': ['Rebecca'],
        '운동': ['Mark'],
        '라이프스타일': ['Elizabeth'],
      };

      const expected = expectedEditors[category];
      if (expected && !expected.includes(creatorName)) {
        console.log(`   ⚠️  미스매치! "${category}" 카테고리인데 "${creatorName}" 에디터가 배정됨`);
        console.log(`   (예상: ${expected.join(', ')})`);
        mismatches++;
      } else if (expected) {
        console.log(`   ✅ 올바른 에디터 배정`);
      }
    });
  });

  console.log(`\n\n=== 요약 ===`);
  console.log(`총 기사: ${articles.length}개`);
  console.log(`카테고리: ${Object.keys(categoryGroups).length}개`);
  console.log(`미스매치: ${mismatches}개`);

  if (mismatches === 0) {
    console.log('\n🎉 모든 에디터 배정이 올바릅니다!');
  } else {
    console.log(`\n⚠️  ${mismatches}개의 미스매치가 발견되었습니다.`);
  }
}

verifyEditorAssignments().catch(console.error);
