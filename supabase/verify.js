require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function verify() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Vocatopia Database Verify Report   ║');
  console.log('╚══════════════════════════════════════╝\n');

  const checks = [
    {
      name: 'words 表（含音標）',
      fn: async () => {
        const { data, error } = await supabase
          .from('words')
          .select('word, phonetic, tags')
          .not('phonetic', 'is', null)
          .limit(3);
        if (error) throw error;
        return `${data.length > 0 ? '✓' : '✗'} 樣本：${data.map(w => `${w.word} ${w.phonetic}`).join(' | ')}`;
      }
    },
    {
      name: 'words 總數',
      fn: async () => {
        const { count } = await supabase.from('words').select('*', { count: 'exact', head: true });
        return `✓ ${count} 個單字`;
      }
    },
    {
      name: 'articles 表',
      fn: async () => {
        const { data, error } = await supabase.from('articles').select('id, title, locked');
        if (error) throw error;
        const unlocked = data.filter(a => !a.locked).length;
        return `✓ ${data.length} 篇文章（${unlocked} 篇解鎖）`;
      }
    },
    {
      name: 'profiles 表',
      fn: async () => {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        return '✓ 資料表存在';
      }
    },
    {
      name: 'user_word_status 表',
      fn: async () => {
        const { error } = await supabase.from('user_word_status').select('id').limit(1);
        if (error) throw error;
        return '✓ 資料表存在';
      }
    },
    {
      name: 'pvp_matches 表',
      fn: async () => {
        const { error } = await supabase.from('pvp_matches').select('id').limit(1);
        if (error) throw error;
        return '✓ 資料表存在';
      }
    },
  ];

  let passed = 0;
  for (const check of checks) {
    try {
      const result = await check.fn();
      console.log(`[PASS] ${check.name}: ${result}`);
      passed++;
    } catch (err) {
      console.log(`[FAIL] ${check.name}: ${err.message}`);
    }
  }

  console.log(`\n結果：${passed}/${checks.length} 項通過`);
  if (passed === checks.length) {
    console.log('🎉 資料庫完全就緒，可以開始開發！');
  } else {
    console.log('⚠  請先在 Supabase SQL Editor 執行 supabase/full_setup.sql');
  }
}

verify();
