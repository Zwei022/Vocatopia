/**
 * 補齊 Unit 7（情緒）在 words 表裡缺少的 9 個字。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'joy', pos: 'n.', phonetic: '/dʒɔɪ/', definition: 'a feeling of great happiness', definition_zh: '喜悅；歡樂', example_en: 'Her face was full of joy on her birthday.', example_zh: '她生日那天臉上充滿了喜悅。', tier: '基礎' },
  { word: 'mad', pos: 'adj.', phonetic: '/mæd/', definition: 'very angry', definition_zh: '生氣的；發狂的', example_en: 'Dad was mad when I broke his favorite mug.', example_zh: '我打破爸爸最愛的馬克杯時他很生氣。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'jealous', pos: 'adj.', phonetic: '/ˈdʒɛləs/', definition: 'feeling unhappy because someone else has something you want', definition_zh: '嫉妒的', example_en: 'He felt jealous when his friend won the prize.', example_zh: '朋友得獎時他覺得嫉妒。', tier: '進階' },
  { word: 'patience', pos: 'n.', phonetic: '/ˈpeɪʃəns/', definition: 'the ability to stay calm while waiting or facing problems', definition_zh: '耐心', example_en: 'Teaching young children requires a lot of patience.', example_zh: '教導年幼的孩子需要很大的耐心。', tier: '進階' },
  { word: 'pleasant', pos: 'adj.', phonetic: '/ˈplɛzənt/', definition: 'nice and enjoyable', definition_zh: '愉快的；宜人的', example_en: 'We had a pleasant walk in the park at sunset.', example_zh: '我們在日落時分在公園裡愉快地散步。', tier: '進階' },
  { word: 'pleased', pos: 'adj.', phonetic: '/plizd/', definition: 'happy or satisfied about something', definition_zh: '高興的；滿意的', example_en: 'She was pleased with her test results this time.', example_zh: '她這次對自己的考試成績感到滿意。', tier: '進階' },
  { word: 'satisfy', pos: 'v.', phonetic: '/ˈsætəsˌfaɪ/', definition: 'to make someone pleased by giving them what they want', definition_zh: '使滿意', example_en: 'The big meal satisfied everyone at the table.', example_zh: '這頓豐盛的餐點讓餐桌上每個人都滿意。', tier: '進階' },
  { word: 'shock', pos: 'n.', phonetic: '/ʃɑk/', definition: 'a sudden strong feeling of surprise, usually unpleasant', definition_zh: '震驚；打擊', example_en: 'The bad news came as a shock to the whole family.', example_zh: '這個壞消息讓全家人都感到震驚。', tier: '進階' },
  { word: 'tension', pos: 'n.', phonetic: '/ˈtɛnʃən/', definition: 'a feeling of nervousness or stress', definition_zh: '緊張；壓力', example_en: 'There was a lot of tension before the final exam.', example_zh: '期末考前氣氛充滿了緊張。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit7）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit7 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit7']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word,
      pos: e.pos,
      phonetic: e.phonetic,
      definition: e.definition,
      definition_zh: e.definition_zh,
      example_en: e.example_en,
      example_zh: e.example_zh,
      tags: ['cap_2000', 'unit7', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
