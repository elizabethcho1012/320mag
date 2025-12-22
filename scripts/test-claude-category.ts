// Claude 카테고리 추론 시스템 테스트
import * as dotenv from 'dotenv';
import { inferCategory } from '../src/services/categoryInference';

// 환경 변수 로드
dotenv.config();

async function testClaudeCategoryInference() {
  console.log('🧪 Claude 3.5 Haiku 카테고리 추론 테스트 시작...\n');

  // 테스트 케이스들 (실제 문제가 있었던 기사들)
  const testCases = [
    {
      title: '집에서 만드는 레스토랑 빵의 비밀',
      content: '집에서도 레스토랑 수준의 빵을 만들 수 있습니다. 필요한 재료는 밀가루, 이스트, 물, 소금입니다. 반죽을 만들고 발효시킨 후 오븐에서 구우면 완성됩니다.',
      expected: '푸드',
      reason: '레시피 내용이므로 푸드 (하우징 아님)'
    },
    {
      title: '집에서 시작하는 남성 건강 관리: 발기부전 예방법',
      content: '발기부전은 40-50대 남성들이 자주 겪는 문제입니다. 규칙적인 운동과 건강한 식습관이 중요하며, 성생활의 질을 개선하는 데 도움이 됩니다.',
      expected: '섹슈얼리티',
      reason: '성 건강 주제이므로 섹슈얼리티 (하우징 아님)'
    },
    {
      title: '갱년기에 충동구매를 멈추는 법',
      content: '갱년기 여성들이 충동구매를 많이 합니다. 이는 심리적 불안과 관련이 있으며, 마음챙김 명상과 소비 일기를 통해 개선할 수 있습니다.',
      expected: '심리',
      reason: '소비 심리가 핵심 (섹슈얼리티 아님)'
    },
    {
      title: '폐경 후 여성을 위한 첫 성욕 촉진제, 드디어 승인되다',
      content: '폐경 후 성욕 감소를 겪는 여성들을 위한 신약이 FDA 승인을 받았습니다. 이 약물은 libido를 증가시키고 친밀감을 개선하는 데 도움을 줍니다.',
      expected: '섹슈얼리티',
      reason: '성욕, 폐경, 친밀감 등 섹슈얼리티 주제'
    },
    {
      title: '인테리어 디자이너가 알려주는 작은 집 꾸미기',
      content: '좁은 공간을 효율적으로 활용하는 인테리어 팁입니다. 가구 배치와 색상 선택이 중요하며, 수납 공간을 최대화해야 합니다.',
      expected: '하우징',
      reason: '인테리어 주제이므로 하우징'
    },
    {
      title: '요가로 시작하는 건강한 하루',
      content: '아침 요가는 피트니스와 정신 건강 모두에 좋습니다. 간단한 스트레칭부터 시작하여 점차 강도를 높여갑니다.',
      expected: '건강',
      reason: '운동/피트니스 주제'
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n[${i + 1}/${testCases.length}] "${test.title}"`);
    console.log(`   예상 카테고리: ${test.expected}`);
    console.log(`   이유: ${test.reason}`);

    try {
      const result = await inferCategory(test.title, test.content);

      if (result === test.expected) {
        console.log(`   ✅ 성공: ${result}`);
        successCount++;
      } else {
        console.log(`   ❌ 실패: ${result} (예상: ${test.expected})`);
        failCount++;
      }
    } catch (error) {
      console.error(`   ❌ 에러:`, error);
      failCount++;
    }

    // API rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n📊 테스트 결과:');
  console.log(`   ✅ 성공: ${successCount}/${testCases.length}`);
  console.log(`   ❌ 실패: ${failCount}/${testCases.length}`);
  console.log(`   정확도: ${Math.round(successCount / testCases.length * 100)}%`);

  if (successCount === testCases.length) {
    console.log('\n🎉 모든 테스트 통과! Claude 3.5 Haiku 전환 성공!');
  } else {
    console.log('\n⚠️  일부 테스트 실패. 추가 조정이 필요합니다.');
  }
}

testClaudeCategoryInference();
