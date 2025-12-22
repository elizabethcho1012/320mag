import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMarkToMia() {
  console.log('\n🔄 Mark → Mia 업데이트\n');

  // Mark를 Mia로 변경
  const { error } = await supabase
    .from('editors')
    .update({ name: 'Mia' })
    .eq('name', 'Mark');

  if (error) {
    console.error('❌ 업데이트 실패:', error.message);
  } else {
    console.log('✅ Mark → Mia 변경 완료');
  }

  // 최종 에디터 목록 확인
  const { data: editors, count } = await supabase
    .from('editors')
    .select('name', { count: 'exact' })
    .order('name');

  console.log(`\n📋 최종 에디터 목록: ${count}명`);
  editors?.forEach((editor, i) => {
    console.log(`  ${i + 1}. ${editor.name}`);
  });

  console.log('\n✅ 예상 에디터 (9명):');
  const expectedEditors = ['Sophia', 'Jane', 'Clara', 'Marcus', 'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mia'];
  expectedEditors.forEach((name, i) => {
    const exists = editors?.some(e => e.name === name);
    console.log(`  ${i + 1}. ${name} ${exists ? '✓' : '✗ (누락)'}`);
  });
}

updateMarkToMia();
