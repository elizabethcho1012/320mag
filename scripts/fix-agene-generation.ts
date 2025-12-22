// '에이진 세대' → '에이진'으로 수정 (중복 표현 제거)
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
  excerpt?: string;
}

// '에이진 세대' → '에이진' 변환 규칙
const replacementRules = [
  // 띄어쓰기 있는 버전
  { pattern: /에이진 세대의/g, replacement: '에이진의' },
  { pattern: /에이진 세대를/g, replacement: '에이진을' },
  { pattern: /에이진 세대에게/g, replacement: '에이진에게' },
  { pattern: /에이진 세대가/g, replacement: '에이진이' },
  { pattern: /에이진 세대는/g, replacement: '에이진은' },
  { pattern: /에이진 세대와/g, replacement: '에이진과' },
  { pattern: /에이진 세대에/g, replacement: '에이진에' },
  { pattern: /에이진 세대도/g, replacement: '에이진도' },
  { pattern: /에이진 세대로/g, replacement: '에이진으로' },
  { pattern: /에이진 세대만/g, replacement: '에이진만' },
  { pattern: /에이진 세대/g, replacement: '에이진' },

  // 붙여쓰기 버전
  { pattern: /에이진세대의/g, replacement: '에이진의' },
  { pattern: /에이진세대를/g, replacement: '에이진을' },
  { pattern: /에이진세대에게/g, replacement: '에이진에게' },
  { pattern: /에이진세대가/g, replacement: '에이진이' },
  { pattern: /에이진세대는/g, replacement: '에이진은' },
  { pattern: /에이진세대와/g, replacement: '에이진과' },
  { pattern: /에이진세대에/g, replacement: '에이진에' },
  { pattern: /에이진세대도/g, replacement: '에이진도' },
  { pattern: /에이진세대로/g, replacement: '에이진으로' },
  { pattern: /에이진세대만/g, replacement: '에이진만' },
  { pattern: /에이진세대/g, replacement: '에이진' },
];

function fixText(text: string): string {
  let fixed = text;

  for (const rule of replacementRules) {
    fixed = fixed.replace(rule.pattern, rule.replacement);
  }

  return fixed;
}

async function fixAgeneGeneration() {
  console.log('🔧 "에이진 세대" → "에이진" 수정 시작...\n');

  // 1. 문제가 있는 기사 찾기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, excerpt')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  const forbiddenTerms = ['에이진 세대', '에이진세대'];
  const problematicArticles: Article[] = [];

  articles?.forEach(article => {
    const fullText = `${article.title} ${article.content} ${article.excerpt || ''}`;
    const hasForbidden = forbiddenTerms.some(term => fullText.includes(term));

    if (hasForbidden) {
      problematicArticles.push(article);
    }
  });

  console.log(`📊 수정 대상: ${problematicArticles.length}개 기사\n`);

  if (problematicArticles.length === 0) {
    console.log('✅ 수정할 기사가 없습니다!');
    return;
  }

  // 2. 각 기사 수정
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < problematicArticles.length; i++) {
    const article = problematicArticles[i];
    console.log(`\n[${i + 1}/${problematicArticles.length}] "${article.title}"`);

    // 수정 전 카운트
    const beforeText = `${article.title} ${article.content} ${article.excerpt || ''}`;
    const beforeCounts = forbiddenTerms.map(term => {
      const matches = beforeText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 전: "에이진 세대" ${beforeCounts[0]}회, "에이진세대" ${beforeCounts[1]}회`);

    // 정규표현식으로 수정
    const fixedTitle = fixText(article.title);
    const fixedContent = fixText(article.content);
    const fixedExcerpt = article.excerpt ? fixText(article.excerpt) : article.excerpt;

    // 수정 후 검증
    const afterText = `${fixedTitle} ${fixedContent} ${fixedExcerpt || ''}`;
    const afterCounts = forbiddenTerms.map(term => {
      const matches = afterText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 후: "에이진 세대" ${afterCounts[0]}회, "에이진세대" ${afterCounts[1]}회`);

    // 변경사항이 있으면 업데이트
    if (afterCounts[0] < beforeCounts[0] || afterCounts[1] < beforeCounts[1]) {
      const updateData: any = {
        title: fixedTitle,
        content: fixedContent,
        updated_at: new Date().toISOString()
      };

      if (fixedExcerpt) {
        updateData.excerpt = fixedExcerpt;
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', article.id);

      if (updateError) {
        console.error(`   ❌ DB 업데이트 실패:`, updateError);
        failCount++;
      } else {
        if (afterCounts[0] === 0 && afterCounts[1] === 0) {
          console.log(`   ✅ 완전히 수정됨! (저장 완료)`);
          successCount++;
        } else {
          console.log(`   🔶 부분 수정됨 (저장 완료, 추가 검토 필요)`);
          successCount++;
        }
      }
    } else {
      console.log(`   ⚠️  교체 규칙 없음 - 수동 확인 필요`);
      failCount++;
    }
  }

  console.log('\n\n📊 최종 결과:');
  console.log(`   ✅ 수정: ${successCount}개`);
  console.log(`   ⚠️  검토 필요: ${failCount}개`);
  console.log(`   합계: ${problematicArticles.length}개`);

  if (successCount > 0) {
    console.log('\n✅ 기사 수정 완료!');
  }

  // 최종 검증
  console.log('\n\n🔍 최종 검증 중...');
  const { data: finalCheck } = await supabase
    .from('articles')
    .select('id, title, content, excerpt')
    .order('created_at', { ascending: false});

  let remainingIssues = 0;
  finalCheck?.forEach(article => {
    const fullText = `${article.title} ${article.content} ${article.excerpt || ''}`;
    const hasForbidden = forbiddenTerms.some(term => fullText.includes(term));
    if (hasForbidden) remainingIssues++;
  });

  console.log(`\n📈 남은 "에이진 세대" 표현 포함 기사: ${remainingIssues}개`);

  if (remainingIssues === 0) {
    console.log('🎉 모든 기사가 올바른 표현을 사용합니다!');
  } else {
    console.log('⚠️  일부 기사는 수동 수정이 필요합니다.');
  }
}

fixAgeneGeneration();
