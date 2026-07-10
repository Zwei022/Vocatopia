/**
 * 補齊 Unit 8（健康）在 words 表裡缺少的 16 個字，原創生成內容。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'sore throat', pos: 'n.', phonetic: '/sɔr θroʊt/', definition: 'a painful feeling in your throat, often caused by a cold', definition_zh: '喉嚨痛', example_en: 'He had a sore throat and could not sing today.', example_zh: '他喉嚨痛，今天沒辦法唱歌。', tier: '基礎' },
  { word: 'drugstore', pos: 'n.', phonetic: '/ˈdrʌgstɔr/', definition: 'a shop that sells medicine and other daily items', definition_zh: '藥妝店；藥局', example_en: 'She bought some medicine at the drugstore near school.', example_zh: '她在學校附近的藥妝店買了一些藥。', tier: '進階' },
  { word: 'homesick', pos: 'adj.', phonetic: '/ˈhoʊmsɪk/', definition: 'feeling sad because you miss your home and family', definition_zh: '想家的', example_en: 'He felt homesick during his first week at camp.', example_zh: '他在營隊的第一週感到很想家。', tier: '進階' },
  { word: 'hunger', pos: 'n.', phonetic: '/ˈhʌŋgər/', definition: 'the feeling of wanting or needing food', definition_zh: '飢餓', example_en: 'The hikers felt hunger after walking all morning.', example_zh: '健行者走了一整個早上後感到飢餓。', tier: '進階' },
  { word: 'injury', pos: 'n.', phonetic: '/ˈɪndʒəri/', definition: 'damage to a part of your body', definition_zh: '傷害；受傷', example_en: 'The player left the field because of a leg injury.', example_zh: '那位球員因腿部受傷而離場。', tier: '進階' },
  { word: 'medical', pos: 'adj.', phonetic: '/ˈmɛdɪkəl/', definition: 'related to medicine or treating illness', definition_zh: '醫療的；醫學的', example_en: 'The school offers free medical checkups every year.', example_zh: '學校每年提供免費的健康檢查。', tier: '進階' },
  { word: 'pain', pos: 'n.', phonetic: '/peɪn/', definition: 'an uncomfortable feeling in the body caused by illness or injury', definition_zh: '疼痛', example_en: 'She felt a sharp pain in her stomach at night.', example_zh: '她晚上感到肚子一陣劇痛。', tier: '進階' },
  { word: 'painful', pos: 'adj.', phonetic: '/ˈpeɪnfəl/', definition: 'causing pain or hurting a lot', definition_zh: '疼痛的', example_en: 'Walking on the hurt ankle was very painful for him.', example_zh: '用受傷的腳踝走路讓他非常疼痛。', tier: '進階' },
  { word: 'pale', pos: 'adj.', phonetic: '/peɪl/', definition: 'having skin with less color than usual, often from illness', definition_zh: '蒼白的', example_en: 'She looked pale after staying up all night studying.', example_zh: '熬夜唸書後她看起來臉色蒼白。', tier: '進階' },
  { word: 'physical', pos: 'adj.', phonetic: '/ˈfɪzɪkəl/', definition: 'related to the body rather than the mind', definition_zh: '身體的；生理的', example_en: 'Regular exercise is good for your physical health.', example_zh: '規律運動對身體健康有益。', tier: '進階' },
  { word: 'poison', pos: 'n.', phonetic: '/ˈpɔɪzən/', definition: 'a substance that can make you sick or kill you if eaten', definition_zh: '毒藥；毒素', example_en: 'Keep poison for insects away from small children.', example_zh: '要把殺蟲的毒藥放在小孩拿不到的地方。', tier: '進階' },
  { word: 'recover', pos: 'v.', phonetic: '/rɪˈkʌvər/', definition: 'to become healthy again after being sick or hurt', definition_zh: '康復；恢復', example_en: 'It took two weeks for him to recover from the flu.', example_zh: '他花了兩星期才從流感中康復。', tier: '進階' },
  { word: 'stomachache', pos: 'n.', phonetic: '/ˈstʌməkeɪk/', definition: 'a pain in your stomach', definition_zh: '胃痛；肚子痛', example_en: 'He got a stomachache after eating too much cake.', example_zh: '他吃太多蛋糕後肚子痛。', tier: '進階' },
  { word: 'toothache', pos: 'n.', phonetic: '/ˈtuːθeɪk/', definition: 'a pain in your tooth', definition_zh: '牙痛', example_en: 'A bad toothache kept her awake all night.', example_zh: '嚴重的牙痛讓她整晚都睡不著。', tier: '進階' },
  { word: 'treatment', pos: 'n.', phonetic: '/ˈtriːtmənt/', definition: 'medical care given to a sick or injured person', definition_zh: '治療', example_en: 'The doctor gave him treatment for his broken arm.', example_zh: '醫生為他斷掉的手臂進行治療。', tier: '進階' },
  { word: 'wound', pos: 'n.', phonetic: '/wuːnd/', definition: 'an injury in which the skin is cut or broken', definition_zh: '傷口', example_en: 'The nurse cleaned the wound before putting on a bandage.', example_zh: '護士在包紮前先清理了傷口。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit8 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit8 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit8']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit8', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
