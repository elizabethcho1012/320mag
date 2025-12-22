import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteKoreanEditors() {
  console.log('\n🗑️  한글 에디터 삭제\n');

  const koreanEditorNames = ['김영희', '박미경', '이정수', '최현정', '정민호', '조혜진'];

  console.log('삭제할 에디터:');
  koreanEditorNames.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
  });

  // 각 에디터 삭제
  let deletedCount = 0;

  for (const name of koreanEditorNames) {
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

  console.log(`\n📊 총 ${deletedCount}명의 한글 에디터 삭제 완료`);

  // 남은 에디터 확인
  const { data: remainingEditors, count } = await supabase
    .from('editors')
    .select('name', { count: 'exact' })
    .order('name');

  console.log(`\n📋 남은 에디터: ${count}명`);
  remainingEditors?.forEach((editor, i) => {
    console.log(`  ${i + 1}. ${editor.name}`);
  });
}

deleteKoreanEditors();
