#!/usr/bin/env tsx
import { supabase } from '../src/integrations/supabase/client';

async function checkRSSSources() {
  const { data: sources, error } = await supabase
    .from('content_sources')
    .select(`
      id,
      name,
      url,
      category,
      is_active
    `)
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📡 현재 활성화된 RSS 소스:\n');

  // 카테고리별로 그룹화
  const byCategory = sources?.reduce((acc, source) => {
    if (!acc[source.category]) acc[source.category] = [];
    acc[source.category].push(source);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(byCategory || {}).forEach(([category, srcs]) => {
    console.log(`\n📂 [${category}]`);
    srcs.forEach((src, i) => {
      console.log(`   ${i + 1}. ${src.name}`);
      console.log(`      URL: ${src.url}`);
    });
  });

  console.log('\n\n📊 전체 통계:');
  console.log(`   총 ${sources?.length || 0}개의 활성 RSS 소스`);
  console.log(`   ${Object.keys(byCategory || {}).length}개 카테고리`);
}

checkRSSSources();
