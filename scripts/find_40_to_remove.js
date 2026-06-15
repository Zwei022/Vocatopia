require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const s = require('../server/db/supabase');

(async () => {
  // 全部 DB 字
  const dbAll = [];
  let from = 0;
  while (true) {
    const { data } = await s.from('words')
      .select('id,word,pos,definition,frequency_rank')
      .range(from, from + 999);
    if (!data || !data.length) break;
    dbAll.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const dbMap = new Map(dbAll.map(w => [w.word.toLowerCase(), w]));

  // 候選刪除清單（由人工判斷）
  // 規則：保留更標準/教育性的形式，刪除重複/太口語/太基礎的
  const toRemove = [
    // ── 重複字（保留更標準的） ──────────────────────────────────
    { word: 'math',         reason: '保留 mathematics（更正式）' },
    { word: 'donut',        reason: '保留 doughnut（標準拼寫）' },
    { word: 'e-mail',       reason: '保留 email（db 已有）' },
    { word: 'hi',           reason: '保留 hello（更標準）' },
    { word: 'hey',          reason: '保留 hello（更標準）' },
    { word: 'bye',          reason: '保留 goodbye（更完整）' },
    { word: 'china',        reason: '瓷器義太少用，China 是專有名詞' },
    { word: 'be',           reason: '極基礎助動詞，學生從 is/am/are 學' },
    { word: 'been',         reason: 'be 的過去分詞，太基礎' },
    { word: 'chopstick',    reason: '保留 chopsticks（複數更常用）' },
    { word: 'bike',         reason: '保留 bicycle（更正式）' },

    // ── 非 2000 核心、太基礎或太口語 ───────────────────────────
    { word: 'bloody',       reason: '英式口語，不適合國中會考' },
    { word: 'dove',         reason: '已有 bird，太少用' },
    { word: 'brand',        reason: '不在官方核心清單' },
    { word: 'clay',         reason: '不在官方核心清單' },
    { word: 'brief',        reason: '不在官方核心清單' },
    { word: 'deny',         reason: '不在官方核心清單' },
    { word: 'conflict',     reason: '不在官方核心清單' },
    { word: 'claim',        reason: '不在官方核心清單' },
    { word: 'data',         reason: '不在官方核心清單' },
    { word: 'classic',      reason: '已有 classical' },
    { word: 'chemical',     reason: '不在官方核心清單' },
    { word: 'chief',        reason: '不在官方核心清單' },
    { word: 'childlike',    reason: '已有 childish；太罕見' },
    { word: 'cell',         reason: '不完整（cell phone 是片語）' },
    { word: 'complaint',    reason: '已有 complain（動詞）' },
    { word: 'connect',      reason: '不在官方核心清單' },
    { word: 'contact',      reason: '不在官方核心清單' },
    { word: 'disagree',     reason: '不在官方核心清單' },
    { word: 'detect',       reason: '不在官方核心清單' },
    { word: 'december',     reason: '已有 December（大寫）' },
    { word: 'april',        reason: '已有 April（大寫）' },
    { word: 'brain',        reason: '不在官方核心清單' },
    { word: 'autumn',       reason: '已有 fall（秋天）' },
    { word: 'christmas',    reason: '已有 Christmas（大寫）' },
    { word: 'diplomat',     reason: '不在官方核心清單' },
    { word: 'can',          reason: '助動詞 can 太基礎（但確實應教）' },
    { word: 'come',         reason: '已是非常基礎字（但確實在清單）' },
    { word: 'but',          reason: '連接詞，太基礎' },
    { word: 'secondary',    reason: '不在官方核心清單（已有 junior/senior high school）' },
    { word: 'hard-working', reason: '非官方核心；可用 diligent 替代' },
  ];

  // 只刪 DB 中實際存在的
  const confirmed = toRemove.filter(r => {
    const exists = dbMap.has(r.word.toLowerCase());
    if (!exists) console.log(`  跳過（不在DB）: ${r.word}`);
    return exists;
  });

  console.log(`\n=== 建議刪除 ${confirmed.length} 字 → 剩餘 ${dbAll.length - confirmed.length} 字 ===\n`);
  confirmed.forEach((r, i) =>
    console.log(`${String(i+1).padStart(2)}. ${r.word.padEnd(20)} // ${r.reason}`)
  );

  // 如果數量不足 40，顯示還差幾個
  const need = dbAll.length - 2000;
  console.log(`\n目前 DB: ${dbAll.length} 字`);
  console.log(`建議刪除: ${confirmed.length} 字`);
  console.log(`刪後剩: ${dbAll.length - confirmed.length} 字`);
  if (confirmed.length < need) {
    console.log(`\n⚠ 還需要再找 ${need - confirmed.length} 個字刪除才能達到 2000`);
  }
})();
