import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceDeleteKoreanEditors() {
  console.log('\n🗑️  한글 에디터 강제 삭제 (ID 기반)\n');

  const koreanEditorIds = [
    '550e8400-e29b-41d4-a716-446655440001', // 김영희
    '550e8400-e29b-41d4-a716-446655440002', // 박미경
    '550e8400-e29b-41d4-a716-446655440003', // 이정수
    '550e8400-e29b-41d4-a716-446655440004', // 최현정
    '550e8400-e29b-41d4-a716-446655440005', // 정민호
    '550e8400-e29b-41d4-a716-446655440006', // 조혜진
  ];

  let deletedCount = 0;

  for (const id of koreanEditorIds) {
    // ID로 이름 먼저 조회
    const { data: editor } = await supabase
      .from('editors')
      .select('name')
      .eq('id', id)
      .single();

    const name = editor?.name || id;

    // 삭제
    const { error } = await supabase
      .from('editors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`❌ ${name} 삭제 실패:`, error.message);
    } else {
      console.log(`✅ ${name} 삭제 완료 (ID: ${id})`);
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

forceDeleteKoreanEditors();
