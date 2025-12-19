import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qitdjfckazpkqhhlacyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdGRqZmNrYXpwa3FoaGxhY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDE1ODQsImV4cCI6MjA3MTI3NzU4NH0.9ReVIN2cnqMYTCwB0CKqtx1UmMrbrmi1_QylukgusRE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('📊 마이그레이션 결과 확인\n');

  // 1. Editors 테이블 확인
  const { data: editors, error: editorsError } = await supabase
    .from('editors')
    .select('*');

  if (editorsError) {
    console.error('❌ Editors 테이블 조회 오류:', editorsError);
  } else {
    console.log(`✅ Editors 테이블: ${editors?.length || 0}명`);
  }

  // 2. Articles의 editor_id 확인
  const { data: articlesWithEditor, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, editor_id')
    .not('editor_id', 'is', null)
    .limit(5);

  if (articlesError) {
    console.error('❌ Articles 조회 오류:', articlesError);
  } else {
    console.log(`✅ Editor_id가 있는 기사: ${articlesWithEditor?.length || 0}개 (샘플)`);
  }

  // 3. Creators 테이블 확인
  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('*')
    .eq('status', 'active');

  if (creatorsError) {
    console.error('❌ Creators 테이블 조회 오류:', creatorsError);
  } else {
    console.log(`✅ Creators 테이블: ${creators?.length || 0}명 (AI 에디터 아직 포함)`);
  }

  console.log('\n🎯 마이그레이션 검증 완료!');
}

verifyMigration();
