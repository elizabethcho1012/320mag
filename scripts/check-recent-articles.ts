import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const checkArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      excerpt,
      featured_image_url,
      categories(name),
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('최근 기사 10개:');
  data?.forEach((article, idx) => {
    console.log(`\n[${idx + 1}] ${article.title}`);
    console.log(`   카테고리: ${(article.categories as any)?.name || 'N/A'}`);
    console.log(`   이미지: ${article.featured_image_url ? '✓' : 'X'}`);
    console.log(`   생성일: ${new Date(article.created_at).toLocaleString('ko-KR')}`);
  });
};

checkArticles();
