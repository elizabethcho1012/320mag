import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyKoreanEditorsDeleted() {
  console.log('\n🔍 한글 에디터 확인\n');

  const koreanEditorNames = ['김영희', '박미경', '이정수', '최현정', '정민호', '조혜진'];

  for (const name of koreanEditorNames) {
    const { data, error } = await supabase
      .from('editors')
      .select('id, name')
      .eq('name', name);

    if (error) {
      console.error(`❌ ${name} 조회 실패:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`⚠️  ${name} 아직 존재함 (${data.length}개)`);
      data.forEach(editor => {
        console.log(`    ID: ${editor.id}`);
      });
    } else {
      console.log(`✅ ${name} 삭제 완료`);
    }
  }

  // 전체 에디터 목록
  const { data: allEditors, count } = await supabase
    .from('editors')
    .select('name', { count: 'exact' })
    .order('name');

  console.log(`\n📋 전체 에디터: ${count}명`);
  allEditors?.forEach((editor, i) => {
    console.log(`  ${i + 1}. ${editor.name}`);
  });
}

verifyKoreanEditorsDeleted();
