/**
 * Unit 30（其他副詞 Other Adverbs）+ Unit 31（其他名詞 Other Nouns）
 * 比對資料庫 + 標記 tags + user_lookup/user_custom 升格修正。
 * 輸出缺少的字清單（給後續 insert_missing script 使用）。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT30_BASIC = `abroad again almost also always away either even ever finally least maybe never no not often perhaps quite really seldom so sometimes somewhere still then together too usually very yes yet`.split(/\s+/);
// yes/yeah 特殊處理：資料庫查詢用 yes，另外查 yeah
const UNIT30_ADV = `actually ahead aloud altogether anyway anywhere certainly doubtless especially everywhere hardly lately nearly neither nor probably rather recently simply suddenly therefore thus whenever`.split(/\s+/);

const UNIT31_BASIC = `action chance dream e-mail excuse experience fact fire fun idea mail matter noise pleasure sale seat set space thing ticket treat trick`.split(/\s+/);
const UNIT31_ADV = `absence acceptance advantage arrival assistance avoidance balloon behavior bomber cause chart choice citizenship command commentary companion comparison conflict confusion continuity creation creativity curiosity damage danger data debate decision delivery dependence description desire difference directory disappearance discovery efficiency electron element emphasis entry equality event examiner expression failure fashion favor force gathering handling hole humanitarian ignorance indicator introduction lack link locker maintenance majority mastery material memorial messenger mixture nationality necessity negation neighborhood occurrence operation opinion opportunity peace popularity possibility preference presence principle privacy project proposal purpose quality rapidity reason receipt refusal regularity repetition responsibility result royalty sample secret service signal signature silence speech spot stick struggle success surface symbol task trust truth usage value victory worth`.split(/\s+/);

const UNITS = [
  { n: 30, name: '其他副詞 Other Adverbs', basic: UNIT30_BASIC, adv: UNIT30_ADV, extra: [{ word: 'yeah', tier: '基礎' }] },
  { n: 31, name: '其他名詞 Other Nouns', basic: UNIT31_BASIC, adv: UNIT31_ADV, extra: [] },
];

async function processUnit(u) {
  const tag = `unit${u.n}`;
  const allWords = [
    ...u.basic.map(w => ({ word: w, tier: '基礎' })),
    ...u.adv.map(w => ({ word: w, tier: '進階' })),
    ...u.extra,
  ];
  console.log(`\n===== Unit ${u.n}（${u.name}）書上共 ${allWords.length} 字（基礎 ${u.basic.length} + 進階 ${u.adv.length}${u.extra.length ? ' + 額外 ' + u.extra.length : ''}） =====`);

  const matched = [];
  const missing = [];

  for (const { word, tier } of allWords) {
    const { data, error } = await supabase
      .from('words')
      .select('id, word, tags')
      .ilike('word', word)
      .limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) matched.push({ ...data[0], tier });
    else missing.push({ word, tier });
  }

  console.log(`比對結果：資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
  if (missing.length) {
    console.log('缺少的字：');
    console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
  }

  // 標記 unitN 標籤 + user_lookup/user_custom 升格修正
  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = m.tags || [];
    const hadUserTag = tags.includes('user_lookup') || tags.includes('user_custom');
    let newTags = Array.from(new Set([...tags, tag]));
    if (hadUserTag) {
      newTags = Array.from(new Set(
        newTags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')
      ));
    }
    const changed = newTags.length !== tags.length || newTags.some(t => !tags.includes(t)) || tags.some(t => !newTags.includes(t));
    if (!changed) continue;
    const { error } = await supabase.from('words').update({ tags: newTags }).eq('id', m.id);
    if (error) { console.error('更新失敗:', m.word, error.message); continue; }
    tagged++;
    if (hadUserTag) promoted++;
  }
  console.log(`已為 ${tagged} 個字更新標籤（含升格修正 ${promoted} 個）`);

  // 驗證
  const { data: verifyData, error: verifyErr } = await supabase.from('words').select('id').contains('tags', [tag]);
  if (verifyErr) console.error('驗證查詢失敗:', verifyErr.message);
  else console.log(`驗證：資料庫中 tags 含 '${tag}' 的字目前有 ${verifyData.length} 筆（尚未含後續補寫入的缺字）`);

  return { unit: u.n, name: u.name, total: allWords.length, matchedCount: matched.length, missing, tagged, promoted };
}

async function main() {
  const results = [];
  for (const u of UNITS) {
    results.push(await processUnit(u));
  }
  console.log('\n\n===== 總結 =====');
  for (const r of results) {
    console.log(`Unit ${r.unit}（${r.name}）：總 ${r.total} 字，已有 ${r.matchedCount}，缺 ${r.missing.length}，標籤更新 ${r.tagged}（升格 ${r.promoted}）`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
