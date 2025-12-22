// 이미 저장된 기사에서 금지 표현 체크
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const forbiddenTerms = ['중년', '시니어'];

async function checkForbiddenTerms() {
  console.log('🔍 기존 기사에서 금지 표현 검색 중...\n');

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, category_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  console.log(`📊 총 ${articles?.length || 0}개 기사 검사\n`);

  const problematicArticles: Array<{
    id: string;
    title: string;
    issues: string[];
  }> = [];

  articles?.forEach(article => {
    const issues: string[] = [];
    const fullText = `${article.title} ${article.content}`;

    forbiddenTerms.forEach(term => {
      if (fullText.includes(term)) {
        const count = (fullText.match(new RegExp(term, 'g')) || []).length;
        issues.push(`"${term}" ${count}회`);
      }
    });

    if (issues.length > 0) {
      problematicArticles.push({
        id: article.id,
        title: article.title,
        issues
      });
    }
  });

  console.log(`\n⚠️  금지 표현이 있는 기사: ${problematicArticles.length}개\n`);

  if (problematicArticles.length > 0) {
    problematicArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   문제: ${article.issues.join(', ')}`);
      console.log(`   ID: ${article.id}\n`);
    });

    console.log('\n💡 수정 방법:');
    console.log('   npx tsx scripts/fix-forbidden-terms.ts');
  } else {
    console.log('✅ 모든 기사가 브랜드 가이드라인을 준수합니다!');
  }
}

checkForbiddenTerms();
