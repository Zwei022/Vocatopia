/**
 * 批次生成 10 篇閱讀測驗文章並存入 DB
 * 使用 gemini-2.5-flash-lite（可用配額）+ calibration.json 難度標準
 *
 * 執行：node server/scripts/batch_generate_articles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db/supabase');
const fs = require('fs');
const path = require('path');

const CALIBRATION_PATH = path.join(
  'C:\\Users\\qaz10\\.claude\\skills\\reading-test-generator\\references\\calibration.json'
);

const TOPICS = [
  { name: '台灣文化',   emoji: '🏝', tag: '文化' },
  { name: '環境與自然', emoji: '🌿', tag: '環境' },
  { name: '科技與網路', emoji: '🔬', tag: '科技' },
  { name: '健康與運動', emoji: '💪', tag: '健康' },
  { name: '動物與生態', emoji: '🦁', tag: '動物' },
  { name: '飲食與烹飪', emoji: '🍜', tag: '飲食' },
  { name: '旅遊與探索', emoji: '✈️', tag: '旅遊' },
  { name: '音樂與藝術', emoji: '🎵', tag: '藝術' },
  { name: '家庭與友情', emoji: '👨‍👩‍👧', tag: '生活' },
  { name: '職涯與夢想', emoji: '🚀', tag: '未來' },
];

// 每天最多 5 篇（slot 1-5），10 篇分成兩天
const DATES = ['2026-05-29', '2026-05-30'];
const DELAY_MS = 2000;

// ── 讀取校正資料 ──────────────────────────────────────────────────
function loadCalibration() {
  if (fs.existsSync(CALIBRATION_PATH)) {
    return JSON.parse(fs.readFileSync(CALIBRATION_PATH, 'utf-8'));
  }
  // 預設值
  return { target: { word_count_min: 185, word_count_max: 236, avg_sentence_length_min: 12.9, avg_sentence_length_max: 15.5, fk_grade_min: 6.7, fk_grade_max: 8.3, question_count: 3 } };
}

// ── Gemini Prompt ─────────────────────────────────────────────────
function buildPrompt(topic, cal) {
  const t = cal.target;
  return `你是台灣國中英語教材設計師，專門為108課綱會考備考設計閱讀測驗。

難度校正標準（來自真實會考試題分析）：
- 文章字數：${t.word_count_min}–${t.word_count_max} 字（英文正文，不含標題）
- 平均句長：${t.avg_sentence_length_min}–${t.avg_sentence_length_max} 字/句
- FK 可讀性年級：${t.fk_grade_min}–${t.fk_grade_max}
- 詞彙：85% 使用教育部國中 2000 核心字彙，避免偏僻生字
- 段落：2–3 段，每段有明確主題句，說明文為主
- 題數：${t.question_count} 道，題型：細節理解 40%・推論判斷 35%・詞彙語境 25%

任務：為主題「${topic}」生成一篇英文閱讀文章 + ${t.question_count} 道四選一測驗題。

只輸出純 JSON（不要任何 markdown code block）：
{"title":"英文標題","content":"英文正文","word_count":210,"questions":[{"question":"繁體中文題目？","options":["A","B","C","D"],"answer":0,"explanation":"50–70字繁體中文詳解","type":"detail"}]}`;
}

// ── JSON 容錯解析 ─────────────────────────────────────────────────
function parseJSON(raw) {
  try { return JSON.parse(raw); } catch {}
  const md = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (md) try { return JSON.parse(md[1]); } catch {}
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
  if (s !== -1 && e !== -1) return JSON.parse(raw.slice(s, e + 1));
  throw new Error('無法解析 JSON');
}

// ── Gemini 生成 ───────────────────────────────────────────────────
async function generate(model, topic, cal) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, 4000 * attempt));
      const result = await model.generateContent(buildPrompt(topic, cal));
      return parseJSON(result.response.text());
    } catch (err) {
      if (attempt === 3) throw err;
      process.stdout.write(` retry${attempt}`);
    }
  }
}

// ── 取得指定日期下一個可用 slot ──────────────────────────────────
async function getNextSlot(date) {
  const { data } = await supabase
    .from('daily_articles')
    .select('slot')
    .eq('date', date)
    .order('slot', { ascending: false })
    .limit(1);
  return ((data?.[0]?.slot) || 0) + 1;
}

// ── 存入 DB ───────────────────────────────────────────────────────
async function saveToDB(article, topicMeta, slot, date) {
  const { data: art, error: artErr } = await supabase
    .from('daily_articles')
    .insert({
      date,
      slot,
      title:      article.title,
      emoji:      topicMeta.emoji,
      tag:        topicMeta.tag,
      topic:      topicMeta.name,
      content:    article.content,
      difficulty: 'B1',
      word_count: article.word_count || article.content.split(/\s+/).length,
    })
    .select('id')
    .single();

  if (artErr) throw new Error(`文章寫入失敗：${artErr.message}`);

  const qs = (article.questions || []).map((q, i) => ({
    article_id:  art.id,
    sort_order:  i + 1,
    question:    q.question,
    options:     q.options,
    answer:      q.answer,
    explanation: q.explanation,
  }));

  const { error: qErr } = await supabase.from('article_questions').insert(qs);
  if (qErr) throw new Error(`題目寫入失敗：${qErr.message}`);

  return art.id;
}

// ── 主程式 ───────────────────────────────────────────────────────
async function main() {
  console.log('=== 批次生成 10 篇閱讀測驗文章 ===');
  console.log(`日期：${DATES[0]} + ${DATES[1]}（每天 5 篇）  |  模型：gemini-2.5-flash-lite\n`);

  const cal = loadCalibration();
  console.log(`校正標準：${cal.target.word_count_min}–${cal.target.word_count_max} 字，FK ${cal.target.fk_grade_min}–${cal.target.fk_grade_max}\n`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.85, maxOutputTokens: 2048 },
  });

  let saved = 0;
  const results = [];

  for (let i = 0; i < TOPICS.length; i++) {
    const topicMeta = TOPICS[i];
    const date = DATES[Math.floor(i / 5)]; // 前5篇 → DATES[0]，後5篇 → DATES[1]
    process.stdout.write(`[${i + 1}/10] ${topicMeta.emoji} ${topicMeta.name} (${date}) ... `);

    try {
      const article = await generate(model, topicMeta.name, cal);
      const slot    = await getNextSlot(date);
      const id      = await saveToDB(article, topicMeta, slot, date);
      saved++;
      console.log(`✓ "${article.title}" (${article.word_count}字)`);
      results.push({ topic: topicMeta.name, title: article.title, date, status: 'ok' });
    } catch (err) {
      console.log(`✗ 失敗：${err.message.slice(0, 80)}`);
      results.push({ topic: topicMeta.name, status: 'error', error: err.message });
    }

    if (i < TOPICS.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n✅ 完成：${saved}/10 篇存入 DB`);
  results.forEach(r => {
    const icon = r.status === 'ok' ? '✓' : '✗';
    console.log(`  ${icon} [${r.date}] ${r.topic}：${r.status === 'ok' ? r.title : r.error}`);
  });
}

main().catch(err => {
  console.error('❌ 批次生成失敗：', err.message);
  process.exit(1);
});
