// Verify creator names in database
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

import { supabase } from '../src/integrations/supabase/client';

async function verifyNames() {
  const { data, error } = await supabase
    .from('creators')
    .select('name, profession')
    .in('name', ['Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus', 'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'])
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n✅ English Names Found:', data?.length || 0);
  data?.forEach(c => console.log(`  - ${c.name} (${c.profession})`));
}

verifyNames();
