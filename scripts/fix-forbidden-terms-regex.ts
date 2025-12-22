// 정규표현식으로 금지 표현 자동 수정 (간단하고 확실한 방법)
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
}

// 문맥에 맞게 교체할 패턴들
const replacementRules = [
  // 제목에서 교체
  { pattern: /^중년 부부/g, replacement: 'AGene 부부' },
  { pattern: /^중년 여성/g, replacement: 'AGene 여성' },
  { pattern: /^중년의 /g, replacement: 'AGene의 ' },
  { pattern: /중년의 성/g, replacement: 'AGene의 성' },

  // 본문에서 패턴별 교체
  { pattern: /중년 여성들/g, replacement: '40-50대 여성들' },
  { pattern: /중년 여성의/g, replacement: '40-50대 여성의' },
  { pattern: /중년 여성을/g, replacement: '40-50대 여성을' },
  { pattern: /중년 여성에게/g, replacement: '40-50대 여성에게' },
  { pattern: /중년 부부들/g, replacement: '40-50대 부부들' },
  { pattern: /중년 부부의/g, replacement: '40-50대 부부의' },
  { pattern: /중년 부부를/g, replacement: '40-50대 부부를' },
  { pattern: /중년 남성/g, replacement: '40-50대 남성' },
  { pattern: /중년기/g, replacement: '40-50대' },

  // 추가 패턴 (남은 4개 기사용)
  { pattern: /중년에 접어들/g, replacement: '40대에 접어들' },
  { pattern: /중년에 이르/g, replacement: '40-50대에 이르' },
  { pattern: /중년층/g, replacement: 'AGene층' },
  { pattern: /중년이라는/g, replacement: '40-50대라는' },
  { pattern: /중년이란/g, replacement: '40-50대란' },
  { pattern: /중년이면/g, replacement: '40-50대면' },
  { pattern: /중년들에게/g, replacement: 'AGene에게' },
  { pattern: /중년들이/g, replacement: 'AGene이' },
  { pattern: /중년들은/g, replacement: 'AGene은' },
  { pattern: /중년들의/g, replacement: 'AGene의' },

  // 기본 패턴들
  { pattern: /중년의/g, replacement: 'AGene의' },
  { pattern: /중년에게/g, replacement: 'AGene에게' },
  { pattern: /중년을/g, replacement: 'AGene을' },
  { pattern: /중년이/g, replacement: 'AGene이' },
  { pattern: /중년은/g, replacement: 'AGene은' },
  { pattern: /중년과/g, replacement: 'AGene과' },
  { pattern: /중년에/g, replacement: 'AGene에' },
  { pattern: /중년도/g, replacement: 'AGene도' },
  { pattern: /중년만/g, replacement: 'AGene만' },

  // 마지막: 나머지 "중년" 모두 포괄
  { pattern: /중년/g, replacement: 'AGene' },

  // 시니어 교체
  { pattern: /시니어 세대/g, replacement: 'AGene 세대' },
  { pattern: /시니어들/g, replacement: '성숙한 세대' },
  { pattern: /시니어의/g, replacement: 'AGene의' },
  { pattern: /시니어를/g, replacement: 'AGene을' },
  { pattern: /시니어에게/g, replacement: 'AGene에게' },
  { pattern: /시니어/g, replacement: 'AGene' },
];

function fixText(text: string): string {
  let fixed = text;

  for (const rule of replacementRules) {
    fixed = fixed.replace(rule.pattern, rule.replacement);
  }

  return fixed;
}

async function fixForbiddenTermsRegex() {
  console.log('🔧 정규표현식으로 금지 표현 수정 시작...\n');

  // 1. 문제가 있는 기사 찾기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  const forbiddenTerms = ['중년', '시니어'];
  const problematicArticles: Article[] = [];

  articles?.forEach(article => {
    const fullText = `${article.title} ${article.content}`;
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
    const beforeText = `${article.title} ${article.content}`;
    const beforeCounts = forbiddenTerms.map(term => {
      const matches = beforeText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 전: "중년" ${beforeCounts[0]}회, "시니어" ${beforeCounts[1]}회`);

    // 정규표현식으로 수정
    const fixedTitle = fixText(article.title);
    const fixedContent = fixText(article.content);

    // 수정 후 검증
    const afterText = `${fixedTitle} ${fixedContent}`;
    const afterCounts = forbiddenTerms.map(term => {
      const matches = afterText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 후: "중년" ${afterCounts[0]}회, "시니어" ${afterCounts[1]}회`);

    // 변경사항이 있으면 업데이트
    if (afterCounts[0] < beforeCounts[0] || afterCounts[1] < beforeCounts[1]) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: fixedTitle,
          content: fixedContent,
          updated_at: new Date().toISOString()
        })
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
    .select('id, title, content')
    .order('created_at', { ascending: false});

  let remainingIssues = 0;
  finalCheck?.forEach(article => {
    const fullText = `${article.title} ${article.content}`;
    const hasForbidden = forbiddenTerms.some(term => fullText.includes(term));
    if (hasForbidden) remainingIssues++;
  });

  console.log(`\n📈 남은 금지 표현 포함 기사: ${remainingIssues}개`);

  if (remainingIssues === 0) {
    console.log('🎉 모든 기사가 브랜드 가이드라인을 준수합니다!');
  } else {
    console.log('⚠️  일부 기사는 수동 수정이 필요합니다.');
    console.log('   npx tsx scripts/check-forbidden-terms.ts 로 확인하세요.');
  }
}

fixForbiddenTermsRegex();
