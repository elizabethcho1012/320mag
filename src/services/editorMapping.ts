// AI 에디터 string ID → Supabase editor UUID 매핑 서비스
import { supabase } from '../integrations/supabase/client';
import { aiEditors } from '../data/editors';

// 캐시: 에디터 string ID → editor UUID
const editorIdCache: Record<string, string> = {};

/**
 * 에디터 string ID로 editor UUID 조회 (editors 테이블에서)
 */
export async function getCreatorUUID(editorId: string): Promise<string | null> {
  // 캐시에 있으면 반환
  if (editorIdCache[editorId]) {
    return editorIdCache[editorId];
  }

  // 에디터 정보 찾기
  const editor = aiEditors.find(e => e.id === editorId);
  if (!editor) {
    console.error(`에디터를 찾을 수 없습니다: ${editorId}`);
    return null;
  }

  // 이름으로 editor 조회 (editors 테이블에서)
  const { data, error } = await supabase
    .from('editors')
    .select('id')
    .eq('name', editor.name)
    .single();

  if (error || !data) {
    console.error(`Editor를 찾을 수 없습니다 (이름: ${editor.name}):`, error);
    return null;
  }

  // 캐시에 저장
  editorIdCache[editorId] = data.id;
  return data.id;
}

/**
 * 모든 에디터의 UUID 미리 로드
 */
export async function preloadEditorMappings(): Promise<void> {
  console.log('📥 에디터 UUID 매핑 로드 중...');

  for (const editor of aiEditors) {
    await getCreatorUUID(editor.id);
  }

  console.log(`✅ ${Object.keys(editorIdCache).length}개 에디터 매핑 완료`);
}

/**
 * 캐시된 매핑 정보 출력
 */
export function printEditorMappings(): void {
  console.log('\n📋 에디터 ID 매핑:');
  Object.entries(editorIdCache).forEach(([stringId, uuid]) => {
    const editor = aiEditors.find(e => e.id === stringId);
    console.log(`  ${editor?.name} (${stringId}) → ${uuid}`);
  });
}

/**
 * 카테고리에 맞는 AI 에디터 자동 선택
 * 중요: 카테고리와 에디터의 전문 분야를 매칭시킵니다
 */
export function selectEditorByCategory(categoryName: string): string | null {
  // 카테고리명 정규화 (한글 → 에디터 카테고리 매핑)
  const categoryMapping: Record<string, string> = {
    '패션': '패션',
    '뷰티': '뷰티',
    '컬처': '컬처',
    '여행': '여행',
    '시니어시장': '시니어시장',
    '글로벌트렌드': '글로벌트렌드',
    '푸드': '푸드',
    '하우징': '하우징',
    '섹슈얼리티': '섹슈얼리티',
    '심리': '심리',
    '운동': '운동',
    '라이프스타일': '라이프스타일',
  };

  const mappedCategory = categoryMapping[categoryName] || categoryName;

  // 해당 카테고리의 에디터 찾기
  const matchingEditors = aiEditors.filter(e => e.category === mappedCategory);

  if (matchingEditors.length === 0) {
    console.warn(`⚠️  카테고리 "${categoryName}"에 맞는 에디터가 없습니다. 기본 에디터 사용.`);
    // 기본 에디터 반환 (편집장)
    const defaultEditor = aiEditors.find(e => e.category === '편집장' || e.id.includes('chief'));
    return defaultEditor?.id || aiEditors[0].id;
  }

  // 여러 에디터가 있을 경우 랜덤 선택
  const selectedEditor = matchingEditors[Math.floor(Math.random() * matchingEditors.length)];

  console.log(`✅ 카테고리 "${categoryName}" → 에디터 "${selectedEditor.name}" (${selectedEditor.profession})`);

  return selectedEditor.id;
}
