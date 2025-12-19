import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qitdjfckazpkqhhlacyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdGRqZmNrYXpwa3FoaGxhY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDE1ODQsImV4cCI6MjA3MTI3NzU4NH0.9ReVIN2cnqMYTCwB0CKqtx1UmMrbrmi1_QylukgusRE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEditorsTable() {
  console.log('📊 Editors 테이블 설정 시작...\n');

  try {
    // 1. SQL 파일 안내
    console.log('1️⃣ Supabase Dashboard에서 SQL 실행 필요');
    console.log('⚠️  다음 SQL 파일들을 Supabase Dashboard > SQL Editor에서 순서대로 실행하세요:\n');
    console.log('   1. scripts/create-editors-table.sql');
    console.log('   2. scripts/migrate-editors.sql');
    console.log('   3. scripts/add-editor-id-to-articles.sql\n');

    // 2. 현재 creators 테이블의 AI 에디터 확인
    console.log('2️⃣ Creators 테이블의 AI 에디터 확인...');
    const AI_EDITOR_NAMES = [
      'Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus',
      'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'
    ];

    const { data: aiEditors, error: aiError } = await supabase
      .from('creators')
      .select('*')
      .in('name', AI_EDITOR_NAMES)
      .eq('status', 'active');

    if (aiError) {
      console.error('❌ AI 에디터 조회 오류:', aiError);
      return;
    }

    console.log(`✅ AI 에디터 발견: ${aiEditors?.length || 0}명`);
    if (aiEditors && aiEditors.length > 0) {
      aiEditors.forEach((editor, idx) => {
        console.log(`   ${idx + 1}. ${editor.name} (${editor.profession})`);
      });
    }

    console.log('\n3️⃣ 다음 단계:');
    console.log('   위의 SQL 파일들을 Supabase Dashboard에서 실행한 후,');
    console.log('   코드를 업데이트하여 editors 테이블을 사용하도록 수정합니다.\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

setupEditorsTable();
