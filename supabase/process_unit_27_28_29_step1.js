/**
 * Unit 27 (介系詞 Prepositions), Unit 28 (Be動詞、助動詞), Unit 29 (其他形容詞 Other Adjectives)
 * 步驟 1-3：比對資料庫、標記 unitN 標籤、修正 user_lookup/user_custom 標籤升格。
 * 步驟 4（缺字生成）另外在 step2 腳本處理（讀完這支輸出的缺字清單後再原創生成內容）。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNITS = {
  27: {
    basic: `about above across after along around at before behind below beside between by down during except for from in "in back of" "in front of" inside into like near "next to" of off on out "out of" outside over since than to under until up with without`,
    adv: `against among besides beyond concerning including through throughout till toward upon within`,
  },
  28: {
    basic: `am are be been can could did do does done had has have is may might must shall should was were will would`,
    adv: ``,
  },
  29: {
    basic: `able best better common convenient dangerous dark dear different else enough foreign free helpful loud lucky magic modern only other possible public ready real same sorry sure wonderful`,
    adv: `accidental actual additional advanced advantageous advisory alike alive alone ancient artistic asleep available aware brief casual certain classic classical comparative concerned continual creative criminal cultural desirous double doubtful dramatic educational elective electrical electronic empty encouraging entire eventual fair fancy fantastic following formal former general grand historic horrible imaginary impossible inclusive indicative individual industrial informative insistent instant instrumental lacking latest latter likely main major marvelous meaningful minor missing musical necessary negative numerous objective operational partial particular peaceful periodical personal positive practical precious primary private productive professional progressive promising protective rapid reasonable recent respective royal satisfactory scientific secondary selective separate silent similar skilled soft speedy spiritual sticky stressful sudden suggestive super symbolic tearful universal useless usual valuable whole willing worthy`,
  },
};

// 解析含多字詞（用雙引號包住的片語，如 "in back of"）的清單字串
function parseWordList(str) {
  const words = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    words.push(m[1] || m[2]);
  }
  return words;
}

async function processUnit(unitNum, basicStr, advStr) {
  const basicWords = parseWordList(basicStr);
  const advWords = parseWordList(advStr);
  const allWords = [
    ...basicWords.map(w => ({ word: w, tier: '基礎' })),
    ...advWords.map(w => ({ word: w, tier: '進階' })),
  ];
  console.log(`\n========== Unit ${unitNum} ==========`);
  console.log(`書上共 ${allWords.length} 字（基礎 ${basicWords.length} + 進階 ${advWords.length}）`);

  const matched = [];
  const missing = [];
  const unitTag = `unit${unitNum}`;

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

  console.log(`比對結果：資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
  if (missing.length) {
    console.log('缺少的字：');
    console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
  }

  // 標記 tags，並修正 user_lookup / user_custom 升格
  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = Array.from(new Set([...(m.tags || []), unitTag]));
    const hadUserTag = tags.includes('user_lookup') || tags.includes('user_custom');
    if (hadUserTag) {
      tags = Array.from(new Set(
        tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')
      ));
    }
    const origTags = m.tags || [];
    const changed = tags.length !== origTags.length || !tags.every(t => origTags.includes(t));
    if (!changed) continue;
    const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
    if (error) { console.error('更新失敗:', m.word, error.message); continue; }
    tagged++;
    if (hadUserTag) promoted++;
  }
  console.log(`已標記/更新 ${tagged} 個字的 tags（其中 ${promoted} 個做了 user_lookup/user_custom → cap_2000 升格）`);

  return { unitNum, totalBook: allWords.length, matchedCount: matched.length, missing };
}

async function main() {
  const results = [];
  for (const [unitNum, lists] of Object.entries(UNITS)) {
    const r = await processUnit(unitNum, lists.basic, lists.adv);
    results.push(r);
  }

  console.log('\n\n========== 缺字彙總（供 step2 生成內容用）==========');
  for (const r of results) {
    console.log(`\nUnit ${r.unitNum}: 書上 ${r.totalBook} 字，已有 ${r.matchedCount} 字，缺 ${r.missing.length} 字`);
    if (r.missing.length) {
      console.log(JSON.stringify(r.missing));
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
