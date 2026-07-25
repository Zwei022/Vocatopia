// 讀 question_bank_usage 累積的資料，統計各題型的消耗狀況，
// 用來判斷哪個分類該優先擴充題庫。
// Usage: node scripts/analyze_question_bank_usage.js [--days 30]
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const BANK_SIZE = { // 目前各分類的題庫總量，手動維護，跟 server/data 實際檔案對齊
  reading: 92, cloze: 81, vocab: 312, phrase: 312, grammar: 312, listening: 80,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--days');
  return { days: i >= 0 ? parseInt(args[i + 1]) : 30 };
}

(async () => {
  const { days } = parseArgs();
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await supabase
    .from('question_bank_usage')
    .select('type, mode, question_count, is_premium, user_id, created_at')
    .gte('created_at', since);
  if (error) { console.error(error.message); process.exit(1); }
  if (!data.length) { console.log(`過去 ${days} 天沒有任何記錄，題庫使用追蹤可能才剛上線。`); return; }

  const byType = {};
  data.forEach(r => {
    const t = byType[r.type] || (byType[r.type] = {
      dailyRequests: 0, unlimitedRequests: 0, totalQuestionsServed: 0,
      unlimitedUsers: new Set(), premiumRequests: 0,
    });
    t.totalQuestionsServed += r.question_count;
    if (r.mode === 'unlimited') { t.unlimitedRequests++; if (r.user_id) t.unlimitedUsers.add(r.user_id); }
    else t.dailyRequests++;
    if (r.is_premium) t.premiumRequests++;
  });

  console.log(`\n過去 ${days} 天題庫消耗量統計\n${'='.repeat(60)}`);
  Object.entries(byType).forEach(([type, t]) => {
    const bankSize = BANK_SIZE[type] || '?';
    const avgPerUnlimitedUser = t.unlimitedUsers.size ? (t.totalQuestionsServed / t.unlimitedUsers.size).toFixed(0) : 0;
    console.log(`\n【${type}】題庫量 ${bankSize}`);
    console.log(`  每日模式請求數：${t.dailyRequests}　無限模式請求數：${t.unlimitedRequests}（${t.unlimitedUsers.size} 位不同使用者）`);
    console.log(`  累計出題數：${t.totalQuestionsServed}`);
    if (t.unlimitedUsers.size) {
      console.log(`  無限模式重度使用者平均已刷：${avgPerUnlimitedUser} 題（題庫量 ${bankSize}，約需 ${(bankSize / (avgPerUnlimitedUser / days) || 0).toFixed(0)} 天刷完一輪，粗估）`);
    }
  });
  console.log('\n' + '='.repeat(60));
})();
