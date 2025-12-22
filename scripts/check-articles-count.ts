#!/usr/bin/env tsx
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticlesCount() {
  const { count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ 기사 조회 실패:', error.message);
  } else {
    console.log(`📰 총 ${count}개의 기사가 있습니다.`);
  }
}

checkArticlesCount();
