import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkArticleCounts() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  console.log('📊 현재 카테고리별 기사 수:\n');

  const counts: { [key: string]: number } = {};

  for (const cat of categories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .eq('category_id', cat.id);

    const count = articles?.length || 0;
    counts[cat.name] = count;

    const status = count >= 13 ? '✅' : count >= 10 ? '⚠️ ' : '❌';
    console.log(`   ${status} ${cat.name.padEnd(12)} ${count}개 (목표: 13개, 부족: ${Math.max(0, 13 - count)}개)`);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`\n   총 기사: ${total}개`);
  console.log(`   목표 기사: ${8 * 13}개 (카테고리당 13개 × 8개 카테고리)`);
  console.log(`   추가 필요: ${Math.max(0, 8 * 13 - total)}개\n`);
}

checkArticleCounts();
