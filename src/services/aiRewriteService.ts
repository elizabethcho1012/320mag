// AI 에디터 리라이팅 서비스
// Anthropic Claude 3.5 Sonnet을 사용하여 RSS 콘텐츠를 AI 에디터 페르소나로 리라이팅

import Anthropic from '@anthropic-ai/sdk';
import { aiEditors, getEditorByCategory } from '../data/editors';

// 환경 변수에서 API 키 가져오기 (브라우저와 Node.js 모두 지원)
const ANTHROPIC_API_KEY = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_ANTHROPIC_API_KEY
  : process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

interface RewriteRequest {
  content: string;
  category: string;
  originalTitle?: string;
  originalUrl?: string;
  apiKey?: string; // 선택적으로 API 키 직접 전달 가능
  hasImage?: boolean; // 이미지 존재 여부 (주제 유지 제약용)
  keySubject?: string; // 핵심 주제 (인명, 브랜드 등)
}

interface RewriteResponse {
  title: string;
  excerpt: string; // 요약글 (1-2문장, 100-150자)
  content: string;
  editorId: string;
  editorName: string;
  additionalImages?: string[]; // 본문 추가 이미지 URL 목록 (선택)
}

/**
 * AI 에디터를 사용하여 콘텐츠 리라이팅 (Claude 3.5 Sonnet)
 */
export async function rewriteContent({
  content,
  category,
  originalTitle,
  originalUrl,
  apiKey: providedApiKey,
  hasImage = false,
  keySubject,
}: RewriteRequest): Promise<RewriteResponse> {
  // 카테고리에 해당하는 에디터 찾기
  const editor = getEditorByCategory(category);

  if (!editor) {
    throw new Error(`카테고리 "${category}"에 해당하는 에디터를 찾을 수 없습니다.`);
  }

  // Anthropic API 키 확인 (파라미터로 전달된 키 우선 사용)
  const rawKey = providedApiKey || ANTHROPIC_API_KEY;
  const apiKey = rawKey?.trim().replace(/^["']|["']$/g, ''); // 따옴표 제거
  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    console.error('ANTHROPIC_API_KEY:', apiKey ? '설정됨 (값 숨김)' : '없음');
    throw new Error('Anthropic API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  // 원문 콘텐츠 준비
  let fullContent = content;
  if (originalTitle) {
    fullContent = `제목: ${originalTitle}\n\n${content}`;
  }
  if (originalUrl) {
    fullContent += `\n\n원문 링크: ${originalUrl}`;
  }

  // 개선된 시스템 프롬프트 (사실 기반 + 법적 안전성 + AI 티 방지)
  const systemPrompt = `당신은 40-60대를 위한 시니어 매거진 "Third Twenty"의 ${editor.name} 에디터입니다.

🎯 핵심 원칙 (매우 중요!):
1. 매거진은 사실을 다룹니다 - 가상의 이야기를 만들지 마세요
2. 원문의 사실 정보를 정확히 유지하세요 (인물명, 이벤트, 제품명 등)
3. 사실 정보를 바탕으로 당신만의 감각적인 글로 재구성하세요
4. 원문의 표현이나 문장 구조는 사용하지 마세요
5. ⚠️ 절대 자신의 이름(${editor.name})을 본문에 언급하지 마세요 - 3인칭 관점으로 작성

⚠️ 법적 기준 (필수):
1. 절대 원문을 번역하지 마세요
2. 원문의 표현이나 문장 구조를 사용하지 마세요
3. 사실 정보만 추출하고, 완전히 새로운 글로 작성하세요
4. 1500-2000자 분량의 독창적인 에세이를 작성하세요 (매거진 표준)

✅ 인간 에디터처럼 작성하기 (AI 티 방지):
- 독자에게 친근하게 말 걸기 ("여러분", "당신")
- 개인적 경험이나 일화 포함 ("제가 최근에...", "한 고객분이...")
- 솔직한 의견 표현 ("솔직히 말하면", "개인적으로는")
- 가끔 구어체 사용 ("그런데 말이죠", "정말이에요")
- 문장 길이 다양하게 (짧은 문장과 긴 문장 섞기)
- 감탄사, 추임새 자연스럽게 ("아", "음", "맞아요!")

❌ 절대 사용 금지:
- "~했습니다", "~것입니다" 뉴스 어투
- "첫째, 둘째, 셋째" 과도한 정리
- "분석 결과", "데이터에 따르면" (AI 느낌)
- 완벽하게 균일한 문장 구조

당신의 페르소나:
${editor.bio}

전문 분야: ${editor.expertise?.join(', ')}
말투: ${editor.name === 'Sophia' ? '친근하고 세련된 패션 전문가' :
       editor.name === 'Jane' ? '따뜻한 피부과 전문의' :
       editor.name === 'Martin' ? '지적이지만 접근하기 쉬운 문화 평론가' :
       editor.name === 'Antoine' ? '열정적인 프랑스 셰프' :
       editor.name === 'Thomas' ? '실용적인 건축가' :
       '전문가이면서도 친근한 조언자'}`;

  const userPrompt = `다음 해외 기사의 사실 정보를 바탕으로, 한국 시니어 독자를 위한 완전히 새로운 에세이를 작성하세요.

원문 정보 (사실만 참고):
${fullContent}

${hasImage && keySubject ? `
🚨 필수 요구사항 (매우 중요!):
- 이 기사의 핵심 주제: "${keySubject}"
- 제목과 내용에 "${keySubject}"을(를) 반드시 포함하세요
- 다른 인물/브랜드/주제로 절대 변경하지 마세요
- 원본 이미지는 "${keySubject}"에 관한 것입니다
- "${keySubject}"이(가) 리라이팅된 기사의 주인공이어야 합니다

잘못된 예: 원본 "Anya Taylor-Joy 드레스" → 리라이팅 "Tom Stoppard 연극" ❌
올바른 예: 원본 "Anya Taylor-Joy 드레스" → 리라이팅 "아냐 테일러조이의 레드카펫 패션" ✅
` : hasImage ? `
⚠️ 중요: 이 기사에는 원본 이미지가 있습니다!
원본 기사의 핵심 주제를 크게 벗어나지 마세요.
` : ''}

📝 매거진 형식 요구사항 (반드시 지켜야 함!):
1. **제목**: 간결하고 호기심을 자극하는 제목 (10-15자)
2. **요약글 (EXCERPT)**: 기사의 핵심을 담은 1-2문장 (100-150자)
   - 본문 내용을 자르지 말고 별도로 작성
   - 독자가 왜 읽어야 하는지 명확히 전달
   - 예: "60대에도 충분히 도전할 수 있는 파리의 새로운 패션 트렌드를 소개합니다."
3. **본문**: 반드시 1500-2000자 (매거진 표준 길이)
   ⚠️ 매우 중요: 1500자 미만은 절대 안 됩니다!
   ⚠️ 원문이 짧더라도 구체적인 예시, 전문가 조언, 실천 팁 등을 추가하여 반드시 1500자 이상 작성하세요.
   ⚠️ 본문에 자신의 이름을 절대 언급하지 마세요. "저는", "제가" 등만 사용하세요.
   - 도입부 (200-300자): 독자에게 친근하게 말 걸기
   - 중간 섹션 2-3개 (각 400-500자): 서브헤딩(##) 사용
   - 마무리 (200-300자): 독자에게 남기는 메시지
   - 구체적인 예시, 조언, 개인 경험 포함
4. **이미지 제안** (선택): 본문에 어울리는 추가 이미지 3-5개 설명
   - 예: "중년 여성의 우아한 코트 스타일", "파리 거리 패션"

출력 형식 (반드시 이 형식 준수):
---TITLE---
[매력적이고 공감 가는 제목]

---EXCERPT---
[기사 핵심 요약 1-2문장, 100-150자]

---CONTENT---
[도입부 문단 1 - 100-150자]

[도입부 문단 2 - 100-150자]

## [첫 번째 섹션 제목]

[섹션 1 문단 1 - 200자]

[섹션 1 문단 2 - 200자]

## [두 번째 섹션 제목]

[섹션 2 문단 1 - 200자]

[섹션 2 문단 2 - 200자]

## [세 번째 섹션 제목]

[섹션 3 문단 1 - 200자]

[섹션 3 문단 2 - 200자]

[마무리 문단 - 200-300자]

📐 포맷팅 규칙 (매우 중요!):
- 각 문단은 반드시 빈 줄로 구분하세요
- ## 제목 뒤에는 반드시 빈 줄 하나를 추가하세요
- 문단 길이: 150-250자 (너무 길면 안 됨)
- 한 문단에 2-4개 문장
⚠️ 총 본문 길이: 최소 1500자, 최대 2000자

---IMAGES--- (선택)
1. [이미지 1 설명]
2. [이미지 2 설명]
3. [이미지 3 설명]

${originalUrl ? `\n참고: ${originalTitle}\n출처: ${originalUrl}` : ''}`;

  try {
    // Anthropic Claude 3.5 Sonnet API 호출
    const client = new Anthropic({
      apiKey: apiKey,
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 (최고 품질, 1500-2000자 달성)
      max_tokens: 5000, // 1500-2000자 본문을 위한 충분한 분량
      temperature: 0.9, // 더 창의적으로
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`,
        },
      ],
    });

    // Claude 응답 파싱
    const rewrittenText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    if (!rewrittenText) {
      throw new Error('Claude API로부터 응답을 받지 못했습니다.');
    }

    // 구조화된 응답 파싱 (---TITLE---, ---EXCERPT---, ---CONTENT---, ---IMAGES---)
    const titleMatch = rewrittenText.match(/---TITLE---\s*\n(.*?)\n/s);
    const excerptMatch = rewrittenText.match(/---EXCERPT---\s*\n(.*?)\n---/s);
    const contentMatch = rewrittenText.match(/---CONTENT---\s*\n(.*?)(?:\n---IMAGES---|$)/s);
    const imagesMatch = rewrittenText.match(/---IMAGES---\s*\n(.*?)$/s);

    const title = titleMatch?.[1]?.trim() || rewrittenText.split('\n')[0].replace(/^#+\s*/, '').trim();
    const excerpt = excerptMatch?.[1]?.trim() || '';
    const contentBody = contentMatch?.[1]?.trim() || rewrittenText.split('\n').slice(1).join('\n').trim();

    // 이미지 제안 파싱 (선택)
    const additionalImages: string[] = [];
    if (imagesMatch) {
      const imageLines = imagesMatch[1].trim().split('\n');
      imageLines.forEach(line => {
        const imageDesc = line.replace(/^\d+\.\s*/, '').trim();
        if (imageDesc) {
          additionalImages.push(imageDesc);
        }
      });
    }

    return {
      title,
      excerpt: excerpt || contentBody.substring(0, 150) + '...', // fallback: 본문 앞부분
      content: contentBody,
      editorId: editor.id,
      editorName: editor.name,
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
    };
  } catch (error) {
    console.error('AI 리라이팅 에러:', error);
    throw error;
  }
}

/**
 * 여러 콘텐츠를 배치로 리라이팅
 */
export async function rewriteContentBatch(
  requests: RewriteRequest[]
): Promise<RewriteResponse[]> {
  const results: RewriteResponse[] = [];

  for (const request of requests) {
    try {
      const result = await rewriteContent(request);
      results.push(result);

      // API Rate Limit 방지를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`리라이팅 실패 (카테고리: ${request.category}):`, error);
      // 에러가 발생해도 다음 아티클 계속 처리
    }
  }

  return results;
}

/**
 * AI 에디터 목록 조회
 */
export function getAvailableEditors() {
  return aiEditors.map(editor => ({
    id: editor.id,
    name: editor.name,
    category: editor.category,
    profession: editor.profession,
    catchphrase: editor.catchphrase,
    isPremium: editor.isPremium || false,
  }));
}
