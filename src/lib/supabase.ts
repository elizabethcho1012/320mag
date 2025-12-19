// src/lib/supabase.ts
import { supabase } from '../integrations/supabase/client';

// Supabase 클라이언트 생성 (기존 설정 재사용)
export { supabase };
export const supabaseAny = supabase as any;

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('Supabase 연결 테스트 중...');
    
    const { data, error } = await supabaseAny
      .from('articles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase 연결 실패:', error);
      return false;
    }
    
    console.log('Supabase 연결 성공!');
    return true;
  } catch (error) {
    console.error('Supabase 연결 테스트 중 오류:', error);
    return false;
  }
};

export default supabase;