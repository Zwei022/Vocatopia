/**
 * 試點：把 Unit 1（身體部位和相關動詞）的單字，用書上的清單去比對資料庫，
 * 比對到的字加上 tags: 'unit1'，比對不到的列出來（表示資料庫還沒有這個字）。
 * 這是先給使用者看 Unit 1 卡組效果用的一次性腳本，不動其他任何資料。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT1_BASIC = `arm back bite blow body bottom bow carry catch clap cry drop ear eye face fall finger follow foot hair hand head heart hit hold hop jump kick kiss knee knock laugh leg lie lip mouth move nail neck nod nose pick point pull push put run shake shoulder shout sight sign sit sleep smile stand stomach throat throw toe tooth voice walk wave`.split(/\s+/);

const UNIT1_ADV = `ankle beard beat blood bone brain chase flow gesture hip hug joint lay lick lift motion movement press print rub sense skin slip soul step thumb view waist wrist yell`.split(/\s+/);

async function main() {
  const allWords = [...UNIT1_BASIC.map(w => ({ word: w, tier: '基礎' })), ...UNIT1_ADV.map(w => ({ word: w, tier: '進階' }))];
  console.log(`Unit 1 書上共 ${allWords.length} 字（基礎 ${UNIT1_BASIC.length} + 進階 ${UNIT1_ADV.length}）`);

  const matched = [];
  const missing = [];

  for (const { word, tier } of allWords) {
    const { data, error } = await supabase
      .from('words')
      .select('id, word, tags')
      .ilike('word', word)
      .limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) {
      matched.push({ ...data[0], tier });
    } else {
      missing.push({ word, tier });
    }
  }

  console.log(`\n比對結果：資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
  if (missing.length) {
    console.log('缺少的字（資料庫沒有，需要之後補）：');
    console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
  }

  // 幫已比對到的字加上 tags: unit1（保留原有 tags，不重複加）
  let tagged = 0;
  for (const m of matched) {
    const newTags = Array.from(new Set([...(m.tags || []), 'unit1']));
    if (newTags.length === (m.tags || []).length) continue; // 已經有這個 tag，跳過
    const { error } = await supabase.from('words').update({ tags: newTags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`\n已為 ${tagged} 個字加上 unit1 標籤（本來就有標籤的略過）`);
}

main().catch(err => { console.error(err); process.exit(1); });
