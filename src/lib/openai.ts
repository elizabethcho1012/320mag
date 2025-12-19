// OpenAI API 통합
// GPT-4를 사용한 콘텐츠 리라이팅 및 이미지 생성

interface RewriteContentParams {
  originalContent: string;
  editorPromptTemplate: string;
  title?: string;
}

interface RewriteContentResult {
  title: string;
  content: string;
  excerpt: string;
}

interface GenerateImageParams {
  title: string;
  content: string;
  category: string;
}

/**
 * GPT-4를 사용하여 원본 콘텐츠를 AI 에디터의 스타일로 리라이팅
 */
export async function rewriteContent({
  originalContent,
  editorPromptTemplate,
  title,
}: RewriteContentParams): Promise<RewriteContentResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const prompt = editorPromptTemplate.replace('{content}', originalContent);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 에디터입니다. 주어진 페르소나와 스타일로 콘텐츠를 리라이팅하세요.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const rewrittenText = data.choices[0]?.message?.content || '';

    // 제목과 본문 파싱 (제목은 첫 번째 줄로 가정)
    const lines = rewrittenText.trim().split('\n');
    const parsedTitle = lines[0].replace(/^#+\s*/, '').trim();
    const parsedContent = lines.slice(1).join('\n').trim();

    // 요약본 생성 (첫 2-3문장)
    const sentences = parsedContent.split(/[.!?]\s+/);
    const excerpt = sentences.slice(0, 2).join('. ') + '.';

    return {
      title: parsedTitle || title || '제목 없음',
      content: parsedContent,
      excerpt,
    };
  } catch (error) {
    console.error('Error rewriting content:', error);
    throw error;
  }
}

/**
 * DALL-E 3를 사용하여 콘텐츠에 맞는 메인 이미지 생성
 */
export async function generateImage({
  title,
  content,
  category,
}: GenerateImageParams): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    // 콘텐츠 요약 (이미지 프롬프트용)
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '다음 콘텐츠를 이미지 생성 프롬프트로 요약하세요. 50-60대 시니어를 위한 매거진이며, 품격있고 우아한 이미지여야 합니다. 영어로 작성하세요.',
          },
          {
            role: 'user',
            content: `카테고리: ${category}\n제목: ${title}\n내용: ${content.substring(0, 500)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const summaryData = await summaryResponse.json();
    const imagePrompt = summaryData.choices[0]?.message?.content || title;

    // DALL-E 3로 이미지 생성
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${imagePrompt}. Professional magazine photography, elegant, sophisticated, high quality, suitable for 50-60 year old audience.`,
        n: 1,
        size: '1792x1024', // 16:9 비율
        quality: 'hd',
        style: 'natural', // 자연스러운 스타일
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      throw new Error(`DALL-E API error: ${error.error?.message || 'Unknown error'}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Whisper API를 사용하여 음성을 텍스트로 변환
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko'); // 한국어

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * 챌린지 질문 생성 (콘텐츠 기반)
 */
export async function generateChallengeQuestion(
  title: string,
  content: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `50-60대 시니어 독자들이 자신의 경험을 공유하도록 유도하는 챌린지 질문을 만드세요.
질문은 개인적이면서도 보편적이어야 하며, 따뜻하고 격려하는 톤이어야 합니다.
한 문장으로 간결하게 작성하세요.`,
          },
          {
            role: 'user',
            content: `제목: ${title}\n내용: ${content.substring(0, 300)}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '당신의 생각을 들려주세요';
  } catch (error) {
    console.error('Error generating challenge question:', error);
    return '당신의 생각을 들려주세요';
  }
}
