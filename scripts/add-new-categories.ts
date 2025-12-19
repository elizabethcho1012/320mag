#!/usr/bin/env tsx
// 새로운 카테고리 추가 스크립트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qitdjfckazpkqhhlacyx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdGRqZmNrYXpwa3FoaGxhY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDE1ODQsImV4cCI6MjA3MTI3NzU4NH0.9ReVIN2cnqMYTCwB0CKqtx1UmMrbrmi1_QylukgusRE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addNewCategories() {
  console.log('📝 새로운 카테고리 추가 중...\n');

  // Supabase Dashboard에서 수동으로 추가해야 하는 카테고리들
  const newCategories = [
    { name: '글로벌푸드', slug: 'global-food', description: '세계 각국의 음식 문화와 트렌드' },
    { name: '건강푸드', slug: 'health-food', description: '건강을 위한 영양과 식단 정보' },
    { name: '심리', slug: 'psychology', description: '마음의 건강과 심리학 인사이트' },
    { name: '섹슈얼리티', slug: 'sexuality', description: '성과 관계에 대한 건강한 이해' },
    { name: '운동', slug: 'exercise', description: '건강한 신체를 위한 운동과 피트니스' }
  ];

  console.log('⚠️  RLS 정책으로 인해 Supabase Dashboard에서 직접 추가가 필요합니다.\n');
  console.log('📋 다음 카테고리들을 Supabase Dashboard > categories 테이블에 추가하세요:\n');

  newCategories.forEach((cat, i) => {
    console.log(`${i + 1}. name: ${cat.name}`);
    console.log(`   slug: ${cat.slug}`);
    console.log(`   description: ${cat.description}\n`);
  });

  console.log('또는 아래 SQL을 Supabase SQL Editor에서 실행하세요:\n');
  console.log('```sql');
  newCategories.forEach(cat => {
    console.log(`INSERT INTO categories (name, slug, description) VALUES ('${cat.name}', '${cat.slug}', '${cat.description}');`);
  });
  console.log('```');
}

addNewCategories();
