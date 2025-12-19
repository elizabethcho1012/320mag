// 카테고리와 크리에이터(AI 에디터) 초기 데이터 생성 스크립트
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env 파일을 직접 읽어서 환경 변수 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

// 환경 변수에 설정
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

import { supabase } from '../src/integrations/supabase/client';
import { aiEditors } from '../src/data/editors';

const categories = [
  { name: '패션', slug: 'fashion', description: '최신 패션 트렌드와 스타일링 팁', order_index: 1 },
  { name: '뷰티', slug: 'beauty', description: '뷰티 제품 리뷰와 메이크업 가이드', order_index: 2 },
  { name: '컬처', slug: 'culture', description: '문화, 예술, 엔터테인먼트', order_index: 3 },
  { name: '여행', slug: 'travel', description: '여행 정보와 추천 여행지', order_index: 4 },
  { name: '시니어시장', slug: 'senior-market', description: '시니어를 위한 시장 분석과 트렌드', order_index: 5 },
  { name: '글로벌트렌드', slug: 'global-trends', description: '세계의 최신 트렌드와 비즈니스', order_index: 6 },
  { name: '푸드', slug: 'food', description: '맛집과 요리 레시피', order_index: 7 },
  { name: '하우징', slug: 'housing', description: '인테리어와 라이프스타일', order_index: 8 },
];

console.log('\n🌱 카테고리 & 크리에이터 데이터 시딩 시작\n');
console.log('='.repeat(60));

async function seedData() {
  try {
    // 1. 카테고리 생성
    console.log('\n📂 카테고리 생성 중...\n');

    for (const category of categories) {
      // 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.slug)
        .single();

      if (existing) {
        console.log(`  ✓ "${category.name}" - 이미 존재 (ID: ${existing.id})`);
        continue;
      }

      // 없으면 생성
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error(`  ✗ "${category.name}" 생성 실패:`, error.message);
      } else {
        console.log(`  ✓ "${category.name}" 생성 완료 (ID: ${data.id})`);
      }
    }

    // 2. 크리에이터(AI 에디터) 생성
    console.log('\n👥 크리에이터(AI 에디터) 생성 중...\n');

    const editorMapping: Record<string, string> = {}; // string ID -> UUID 매핑

    for (const editor of aiEditors) {
      // 이름으로 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('creators')
        .select('id')
        .eq('name', editor.name)
        .single();

      if (existing) {
        console.log(`  ✓ "${editor.name}" - 이미 존재 (ID: ${existing.id})`);
        editorMapping[editor.id] = existing.id;
        continue;
      }

      // 없으면 생성 (UUID는 Supabase가 자동 생성)
      const { data, error } = await supabase
        .from('creators')
        .insert({
          name: editor.name,
          age: editor.age,
          profession: editor.profession,
          specialty: editor.category,
          bio: editor.background, // background를 bio로 사용
          experience: editor.expertise.join(', '), // 전문 분야를 경력으로
          status: 'active',
          verified: true,
          articles_count: 0,
          followers_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ✗ "${editor.name}" 생성 실패:`, error.message);
      } else {
        console.log(`  ✓ "${editor.name}" 생성 완료 (ID: ${data.id})`);
        editorMapping[editor.id] = data.id;
      }
    }

    // 매핑 결과 출력
    console.log('\n📋 에디터 ID 매핑:');
    console.log(JSON.stringify(editorMapping, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ 데이터 시딩 완료!\n');
  } catch (error: any) {
    console.error('\n❌ 데이터 시딩 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
