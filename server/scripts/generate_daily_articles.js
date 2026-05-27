/**
 * 每日閱讀文章自動生成腳本
 * 使用 Gemini 2.5 Flash 產生 5 篇 B1 英文閱讀 + 3 道題目 + 中文詳解
 *
 * 手動執行：node server/scripts/generate_daily_articles.js [YYYY-MM-DD]
 * Cron 由 server/index.js 排程每日 00:05 (台灣時間) 觸發
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db/supabase');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 8 個主題循環，每天依日期偏移選出 5 個不重複主題
const TOPICS = [
  { name: '環境與自然', emoji: '🌿', tag: '環境' },
  { name: '科學與科技', emoji: '🔬', tag: '科技' },
  { name: '健康與生活', emoji: '💪', tag: '健康' },
  { name: '文化與社會', emoji: '🏛', tag: '文化' },
  { name: '動物與生態', emoji: '🦁', tag: '動物' },
  { name: '台灣與在地', emoji: '🏝', tag: '台灣' },
  { name: '職涯與未來', emoji: '🚀', tag: '未來' },
  { name: '運動與休閒', emoji: '⚽', tag: '運動' },
];

function getTodayTopics(dateStr) {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const start = dayOfYear % TOPICS.length;
  return Array.from({ length: 5 }, (_, i) => TOPICS[(start + i) % TOPICS.length]);
}

// 難度校正參數（來自 calibrate.js 對 Simple Wikipedia 的分析結果）
const CALIBRATION = `
台灣108課綱「國中英語會考」閱讀難度標準（CEFR B1）：
- 文章字數：180-230 字（正文，不含標題）
- 平均句長：12-16 字/句
- 詞彙：85% 使用教育部國中 2000 核心字彙
- FK 可讀性年級：6.5-8.5
- 段落結構：2-3 段，每段有明確主題句
- 體裁：說明文為主`;

function buildSinglePrompt(topicName) {
  return `你是台灣國中英語教材設計師。

${CALIBRATION}

任務：為主題「${topicName}」生成一篇英文閱讀文章，搭配 3 道閱讀理解題。

規格：
1. 英文文章：180-230 字，CEFR B1，2-3 段，內容真實有教育意義
2. 3 道四選一測驗題（繁體中文）：
   - 題型：細節理解×1、推論判斷×1、詞彙語境×1
   - 每題附 50-70 字繁體中文詳解

只輸出 JSON，格式如下：
{"title":"英文標題","content":"英文文章正文","word_count":200,"questions":[{"question":"繁體中文題目？","options":["A選項","B選項","C選項","D選項"],"answer":0,"explanation":"繁體中文詳解"}]}`;
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    // 嘗試從 markdown code block 取出
    const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (mdMatch) return JSON.parse(mdMatch[1]);
    // 嘗試抓第一個 { 到最後一個 }
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('無法解析 JSON');
  }
}

async function getExistingSlots(dateStr) {
  const { data } = await supabase
    .from('daily_articles')
    .select('slot')
    .eq('date', dateStr);
  return new Set((data || []).map(r => r.slot));
}

async function generateOne(model, topicName) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, 3000 * attempt));
      const result = await model.generateContent(buildSinglePrompt(topicName));
      return parseJSON(result.response.text());
    } catch (err) {
      if (attempt === 3) throw err;
    }
  }
}

async function generateAndSave(dateStr) {
  console.log(`\n[生成] 日期：${dateStr}`);

  const existingSlots = await getExistingSlots(dateStr);
  if (existingSlots.size >= 5) {
    console.log('[跳過] 今日文章已全部存在');
    return { skipped: true };
  }

  const topics = getTodayTopics(dateStr);
  const missing = topics.filter((_, i) => !existingSlots.has(i + 1));
  console.log('[主題]', topics.map((t, i) => existingSlots.has(i + 1) ? `✓${t.name}` : t.name).join(' | '));

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.85,
      maxOutputTokens: 4096,
    },
  });

  let saved = 0;
  for (let i = 0; i < 5; i++) {
    if (existingSlots.has(i + 1)) continue;
    const topic = topics[i];
    process.stdout.write(`  [${i + 1}/5] ${topic.name} ... `);

    let a;
    try {
      a = await generateOne(model, topic.name);
    } catch (err) {
      console.log(`✗ 生成失敗（3次重試後）：${err.message}`);
      continue;
    }

    const { data: art, error: artErr } = await supabase
      .from('daily_articles')
      .insert({
        date:       dateStr,
        slot:       i + 1,
        title:      a.title,
        emoji:      topic.emoji,
        tag:        topic.tag,
        topic:      topic.name,
        content:    a.content,
        difficulty: 'B1',
        word_count: a.word_count || a.content.split(/\s+/).length,
      })
      .select('id')
      .single();

    if (artErr) {
      console.log(`✗ DB 寫入失敗：${artErr.message}`);
      continue;
    }

    const qs = (a.questions || []).map((q, qi) => ({
      article_id:  art.id,
      sort_order:  qi + 1,
      question:    q.question,
      options:     q.options,
      answer:      q.answer,
      explanation: q.explanation,
    }));

    const { error: qErr } = await supabase
      .from('article_questions')
      .insert(qs);

    if (qErr) {
      console.log(`✗ 題目寫入失敗：${qErr.message}`);
    } else {
      saved++;
      console.log(`✓ 「${a.title}」(${a.word_count || '?'} 字)`);
    }
  }

  console.log(`\n✅ 完成：${saved}/5 篇儲存成功`);
  return { saved, date: dateStr };
}

// ── 直接執行時（手動 / 測試）──
if (require.main === module) {
  const dateArg = process.argv[2] || new Date().toISOString().split('T')[0];
  generateAndSave(dateArg)
    .then(() => process.exit(0))
    .catch(err => { console.error('❌', err.message); process.exit(1); });
}

module.exports = { generateAndSave };
