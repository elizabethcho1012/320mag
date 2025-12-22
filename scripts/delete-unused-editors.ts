import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUnusedEditors() {
  console.log('\n🗑️  미사용 영문 에디터 삭제\n');

  const unusedEditorNames = ['Coach Sarah', 'Dr. Emma', 'Dr. Maya', 'Luna'];

  console.log('삭제할 에디터:');
  unusedEditorNames.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
  });

  // 각 에디터 삭제
  let deletedCount = 0;

  for (const name of unusedEditorNames) {
    const { error } = await supabase
      .from('editors')
      .delete()
      .eq('name', name);

    if (error) {
      console.error(`❌ ${name} 삭제 실패:`, error.message);
    } else {
      console.log(`✅ ${name} 삭제 완료`);
      deletedCount++;
    }
  }

  console.log(`\n📊 총 ${deletedCount}명의 미사용 에디터 삭제 완료`);

  // 남은 에디터 확인
  const { data: remainingEditors, count } = await supabase
    .from('editors')
    .select('name', { count: 'exact' })
    .order('name');

  console.log(`\n📋 남은 에디터: ${count}명`);
  remainingEditors?.forEach((editor, i) => {
    console.log(`  ${i + 1}. ${editor.name}`);
  });

  // 코드에 정의된 에디터와 비교
  const definedEditors = [
    'Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus',
    'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'
  ];

  console.log('\n✅ 코드에 정의된 12명의 에디터:');
  definedEditors.forEach((name, i) => {
    const exists = remainingEditors?.some(e => e.name === name);
    console.log(`  ${i + 1}. ${name} ${exists ? '✓' : '✗ (누락)'}`);
  });
}

deleteUnusedEditors();
