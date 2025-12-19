// Update creator names from Korean to English in Supabase
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

console.log('\n🔄 크리에이터 이름 업데이트 (한글 → 영어)\n');
console.log('='.repeat(60));

const nameMapping = {
  '소피아': 'Sophia',
  '제인': 'Jane',
  '마틴': 'Martin',
  '클라라': 'Clara',
  '헨리': 'Henry',
  '마커스': 'Marcus',
  '앙투안': 'Antoine',
  '토마스': 'Thomas',
  '닥터 사라': 'Sarah',
  '레베카': 'Rebecca',
  '마크': 'Mark',
  '엘리자베스': 'Elizabeth'
};

async function updateCreatorNames() {
  try {
    console.log(`\n📝 업데이트할 이름: ${Object.keys(nameMapping).length}개\n`);

    let updated = 0;
    let notFound = 0;

    for (const [koreanName, englishName] of Object.entries(nameMapping)) {
      // Check if creator exists
      const { data: existing, error: checkError } = await supabase
        .from('creators')
        .select('id, name')
        .eq('name', koreanName)
        .maybeSingle();

      if (checkError) {
        console.error(`   ❌ ${koreanName} 확인 실패:`, checkError.message);
        continue;
      }

      if (!existing) {
        console.log(`   ⚠️  ${koreanName} → ${englishName} (존재하지 않음, 건너뜀)`);
        notFound++;
        continue;
      }

      // Update the name
      const { error: updateError } = await supabase
        .from('creators')
        .update({ name: englishName })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`   ❌ ${koreanName} → ${englishName} 업데이트 실패:`, updateError.message);
      } else {
        console.log(`   ✅ ${koreanName} → ${englishName}`);
        updated++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 업데이트 결과:`);
    console.log(`   ✅ 성공: ${updated}개`);
    console.log(`   ⚠️  건너뜀: ${notFound}개`);

    // Verify results
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 업데이트된 크리에이터 목록:\n');

    const { data: creators, error: listError } = await supabase
      .from('creators')
      .select('name, profession, specialty')
      .order('name');

    if (listError) {
      console.error('❌ 목록 조회 실패:', listError.message);
    } else if (creators) {
      creators.forEach((creator, index) => {
        console.log(`${index + 1}. ${creator.name} - ${creator.profession} (${creator.specialty})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 업데이트 완료!\n');

  } catch (error: any) {
    console.error('\n❌ 업데이트 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateCreatorNames();
