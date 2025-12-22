import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkCategorySlugs() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  console.log('📂 Current DB category slugs:\n');
  categories?.forEach(cat => {
    console.log(`   ${cat.name.padEnd(12)} → slug: ${cat.slug}`);
  });
}

checkCategorySlugs();
