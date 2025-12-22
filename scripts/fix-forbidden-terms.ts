// 기존 기사에서 금지 표현 자동 수정
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // 관리자 권한 사용
const anthropicKey = process.env.ANTHROPIC_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

const forbiddenTerms = ['중년', '시니어'];

interface Article {
  id: string;
  title: string;
  content: string;
}

async function fixArticle(article: Article): Promise<{ title: string; content: string }> {
  const systemPrompt = `당신은 320MAG의 편집자입니다.
기사에서 "중년", "시니어" 같은 표현을 찾아서 맥락에 맞는 적절한 표현으로 변경해야 합니다.

⚠️ 절대 규칙:
1. "중년"과 "시니어"를 절대 사용하지 마세요. (0개가 되어야 함)
2. 교체할 때 "시니어"를 사용하지 마세요.
3. 다른 금지 단어를 추가하지 마세요.

교체 가능한 표현:
- "AGene", "Ageless Generation", "에이진"
- "40-50대", "40대", "50대" (구체적 연령)
- "우리 세대", "성숙한 세대", "어른"
- "중장년" 대신 → "40-50대"
- 문맥상 연령 표현 불필요하면 → 삭제

예시:
❌ "중년 여성" → "시니어 여성" (절대 안됨!)
✅ "중년 여성" → "40-50대 여성"
✅ "중년 여성" → "AGene 여성"
✅ "중년 부부" → "부부" (연령 표현 생략)

중요: 금지 표현만 교체하고, 나머지는 원본 그대로 유지하세요.`;

  const userPrompt = `다음 기사에서 "중년", "시니어" 표현을 적절한 용어로 교체해주세요.

⚠️ 중요: 결과물에 "중년"과 "시니어"가 0개가 되어야 합니다!

제목: ${article.title}

본문:
${article.content}

---

교체된 제목과 본문을 다음 형식으로 정확히 반환하세요:

TITLE:
[교체된 제목]

CONTENT:
[교체된 본문]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.1, // 더 낮은 temperature로 일관성 강화
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // TITLE:과 CONTENT: 파싱
    const titleMatch = text.match(/TITLE:\s*\n(.+?)(?=\n\nCONTENT:)/s);
    const contentMatch = text.match(/CONTENT:\s*\n(.+)$/s);

    if (!titleMatch || !contentMatch) {
      console.error('❌ AI 응답 파싱 실패');
      return { title: article.title, content: article.content };
    }

    return {
      title: titleMatch[1].trim(),
      content: contentMatch[1].trim()
    };
  } catch (error) {
    console.error('❌ AI 처리 실패:', error);
    return { title: article.title, content: article.content };
  }
}

async function fixForbiddenTerms() {
  console.log('🔧 기존 기사 자동 수정 시작...\n');

  // 1. 문제가 있는 기사 찾기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

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

    // 수정 전 금지 표현 카운트
    const beforeText = `${article.title} ${article.content}`;
    const beforeCounts = forbiddenTerms.map(term => {
      const matches = beforeText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 전: "중년" ${beforeCounts[0]}회, "시니어" ${beforeCounts[1]}회`);

    // AI로 수정
    const fixed = await fixArticle(article);

    // 수정 후 검증
    const afterText = `${fixed.title} ${fixed.content}`;
    const afterCounts = forbiddenTerms.map(term => {
      const matches = afterText.match(new RegExp(term, 'g'));
      return matches ? matches.length : 0;
    });

    console.log(`   수정 후: "중년" ${afterCounts[0]}회, "시니어" ${afterCounts[1]}회`);

    // 금지 표현이 제거되었는지 확인
    if (afterCounts[0] === 0 && afterCounts[1] === 0) {
      // DB 업데이트
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: fixed.title,
          content: fixed.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`   ❌ DB 업데이트 실패:`, updateError);
        failCount++;
      } else {
        console.log(`   ✅ 수정 완료 및 저장 성공`);
        successCount++;
      }
    } else {
      console.error(`   ⚠️  금지 표현이 여전히 남아있음 - 수정 실패`);
      failCount++;
    }

    // API 요청 간 딜레이 (rate limit 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n📊 최종 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  console.log(`   합계: ${problematicArticles.length}개`);

  if (successCount > 0) {
    console.log('\n✅ 기사 수정 완료! 브랜드 가이드라인을 준수합니다.');
  }
}

fixForbiddenTerms();
