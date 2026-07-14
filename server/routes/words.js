const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const WORD_COLUMNS = 'id, word, pos, definition, definition_zh, phonetic, example_en, example_zh, tags, level, frequency_rank';

// GET /api/words?limit=20&offset=0&tag=cap_2000
// 主字庫列表：排除使用者查詢/自建的字（user_lookup / user_custom），維持會考 2000 字純淨
router.get('/', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 2000);
  const offset = parseInt(req.query.offset) || 0;
  const tag    = req.query.tag;

  let query = supabase
    .from('words')
    .select(WORD_COLUMNS)
    .not('tags', 'cs', '{user_lookup}')
    .not('tags', 'cs', '{user_custom}')
    .order('word', { ascending: true })
    .range(offset, offset + limit - 1);

  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── 快速查詢：共享快取 → 未命中才生成 ─────────────────────────────
// GET /api/words/search?query=serendipity
// 1. 查 words 表（會考 2000 字 + 其他使用者查過的字）→ 命中直接回傳
// 2. 未命中 → Gemini 生成字典級資料（原創改寫的中英定義 + 中英例句）
// 3. 寫回 words 表（tags: user_lookup），下一位使用者直接調用
router.get('/search', async (req, res) => {
  const raw = (req.query.query || '').trim().toLowerCase();
  if (!raw) return res.status(400).json({ success: false, error: '請提供查詢單字' });
  if (!/^[a-z][a-z' -]{0,40}$/.test(raw)) {
    return res.status(400).json({ success: false, error: '僅支援英文單字或片語' });
  }

  // 1) 共享快取（words 表，不分 tag）
  const { data: hit, error: qErr } = await supabase
    .from('words')
    .select(WORD_COLUMNS)
    .ilike('word', raw)
    .limit(1);
  if (qErr) return res.status(500).json({ success: false, error: qErr.message });
  if (hit && hit.length) {
    return res.json({ success: true, source: 'cache', data: hit[0] });
  }

  // 1.5) 字尾還原：查詢字若是動詞變化/複數/比較級（如 accepted/activities），
  // 先試著比對字庫裡可能已有的原形，命中就直接回傳，不需要多耗一次 Gemini 額度
  const lemmaHit = await _findByLemma(raw);
  if (lemmaHit) return res.json({ success: true, source: 'cache-lemma', data: lemmaHit });

  // 2) Gemini 生成（字典查詢 + 版權改寫，一次完成）
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ success: false, error: '查詢服務未設定' });
  }
  let entry;
  try {
    entry = await generateDictEntry(raw);
  } catch (err) {
    const isRateLimit = /429|quota|rate limit|resource_exhausted/i.test(err.message || '');
    console.error('[words/search] 生成失敗:', err.message);
    if (isRateLimit) {
      return res.status(429).json({ success: false, error: '查詢的人太多了，請稍後再試一次', rateLimited: true });
    }
    return res.status(502).json({ success: false, error: '字典查詢失敗，請確認拼字後重試' });
  }
  if (!entry) {
    return res.status(404).json({ success: false, error: '找不到這個單字，請確認拼字' });
  }

  // 3) 寫回共享快取（失敗不阻擋回傳，下次查詢會重新生成）
  const row = {
    word: raw,
    pos: entry.pos,
    phonetic: entry.phonetic,
    definition: entry.definition,
    definition_zh: entry.definition_zh,
    example_en: entry.example_en,
    example_zh: entry.example_zh,
    tags: ['user_lookup'],
    level: 1,
  };
  const { data: saved, error: insErr } = await supabase
    .from('words').insert([row]).select(WORD_COLUMNS);
  if (insErr) {
    console.error('[words/search] 快取寫入失敗:', insErr.message);
    return res.json({ success: true, source: 'generated', data: row });
  }
  res.json({ success: true, source: 'generated', data: saved[0] });
});

// 簡易字尾還原候選（跟前端 script.js 的 _lemmaCandidates 邏輯一致），
// 用於在呼叫 Gemini 前先確認字庫裡是否已有這個詞的原形
function _lemmaCandidates(w) {
  const c = [];
  if (w.endsWith('ies') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ied') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ier') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('iest') && w.length > 5) c.push(w.slice(0, -4) + 'y');
  if (w.endsWith('ing') && w.length > 5) { c.push(w.slice(0, -3)); c.push(w.slice(0, -3) + 'e'); c.push(w.slice(0, -4)); }
  if (w.endsWith('ed') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); c.push(w.slice(0, -3)); }
  if (w.endsWith('es') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); }
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) c.push(w.slice(0, -1));
  if (w.endsWith('er') && w.length > 4) c.push(w.slice(0, -2));
  if (w.endsWith('est') && w.length > 5) c.push(w.slice(0, -3));
  if (w.endsWith('ly') && w.length > 4) c.push(w.slice(0, -2));
  return c;
}
async function _findByLemma(raw) {
  const candidates = _lemmaCandidates(raw);
  if (!candidates.length) return null;
  const { data } = await supabase
    .from('words').select(WORD_COLUMNS).in('word', candidates).limit(1);
  return (data && data[0]) || null;
}

// Gemini 字典生成：回傳 null 表示不是有效英文單字
async function generateDictEntry(word) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
  });
  const prompt = `You are a dictionary editor for Taiwanese junior high school English learners.
For the English word or phrase "${word}", return ONLY a JSON object:
{
 "valid": true or false,            // false if this is not a real English word/phrase
 "pos": "名詞|動詞|形容詞|副詞|片語|介系詞|連接詞|代名詞|感嘆詞",
 "phonetic": "/IPA/",               // US IPA with slashes
 "definition": "...",               // ORIGINAL English definition, A2 level, simple words, NOT copied from any dictionary
 "definition_zh": "...",            // 繁體中文短語式定義，分號分隔多義，不寫完整句，不超過20字
 "example_en": "...",               // ORIGINAL example sentence, 8-14 words, everyday situation for a Taiwanese teen
 "example_zh": "..."                // 自然的繁體中文翻譯
}
Rules: definitions and examples must be entirely original wording (no copying from Cambridge/Oxford etc.). Traditional Chinese only (no simplified characters).`;
  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  if (!parsed.valid) return null;
  const need = ['pos', 'phonetic', 'definition', 'definition_zh', 'example_en', 'example_zh'];
  for (const k of need) {
    if (!parsed[k] || typeof parsed[k] !== 'string') throw new Error(`生成欄位缺失: ${k}`);
  }
  return parsed;
}

// ── 新增單字到卡組 ────────────────────────────────────────────────
// POST /api/words/add  body: { deck_id, word, definition, ... }
// 字已存在（含 2000 字與快取字）→ 回傳現有 id；不存在（手動模式）→ 插入 user_custom
router.post('/add', async (req, res) => {
  const { deck_id, word, ...fields } = req.body || {};
  if (!deck_id) return res.status(400).json({ success: false, error: 'deck_id 為必填' });
  if (!word || !word.trim()) return res.status(400).json({ success: false, error: 'word 為必填' });

  const key = word.trim();

  // 已存在 → 直接回傳現有 id（快速模式查詢結果必然已在表中）
  const { data: existing, error: qErr } = await supabase
    .from('words').select('id').ilike('word', key).limit(1);
  if (qErr) return res.status(500).json({ success: false, error: qErr.message });
  if (existing && existing.length) {
    return res.json({ success: true, wordId: existing[0].id, existed: true });
  }

  // 手動模式：插入新列（definition 欄存中文解釋是前端手動模式的既定行為）
  const row = {
    word: key,
    pos: fields.pos || '',
    phonetic: fields.phonetic || '',
    definition: fields.definition || '',
    definition_zh: fields.definition_zh || '',
    example_en: fields.example_en || '',
    example_zh: fields.example_zh || '',
    tags: ['user_custom'],
    level: 1,
  };
  const { data: saved, error: insErr } = await supabase
    .from('words').insert([row]).select('id');
  if (insErr) return res.status(500).json({ success: false, error: insErr.message });
  res.json({ success: true, wordId: saved[0].id, existed: false });
});

// POST /api/words/by-ids  body: { ids: [1,2,3] }
// 自訂卡組存的是 word_ids，但主字庫列表 GET / 會刻意排除 user_lookup/user_custom
// 標籤的字（快速查詢/手動新增的字不算進「純淨 2000 字」）。這代表換裝置或重新
// 登入後，自訂卡組裡任何不屬於核心 2000 字的單字，光靠 loadWords() 抓回來的
// WORDS 陣列永遠查不到，畫面就會卡在「【加載中】」的佔位字，且沒有任何重試
// 機制能修好——這支路由專門補這個洞：直接用 id 精準查表，不受標籤過濾影響。
router.post('/by-ids', async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(id => Number.isInteger(id)) : [];
  if (!ids.length) return res.json([]);
  const { data, error } = await supabase
    .from('words')
    .select(WORD_COLUMNS)
    .in('id', ids);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/words/count
// 必須跟上面主列表 GET / 用同一套過濾條件（排除 user_lookup/user_custom），
// 不然前端算出來的總筆數會比實際能列出的還多，用這個數字去算分頁批次
// 就會產生對不上的資料洞。
router.get('/count', async (req, res) => {
  const { count, error } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('tags', 'cs', '{user_lookup}')
    .not('tags', 'cs', '{user_custom}');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count });
});

// DELETE /api/words/delete/:word
// 刪除指定單字（by word text）
router.delete('/delete/:word', async (req, res) => {
  const word = req.params.word;

  const { error } = await supabase
    .from('words')
    .delete()
    .eq('word', word);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, deleted_word: word });
});

// POST /api/words/restore
// 恢復被刪除的單字（插入新紀錄）
router.post('/restore', async (req, res) => {
  const wordData = req.body;

  if (!wordData.word) {
    return res.status(400).json({ error: 'word field is required' });
  }

  const { data, error } = await supabase
    .from('words')
    .insert([wordData])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, restored_word: wordData.word, data });
});

// ── 從卡組移除單字 ────────────────────────────────────────────────
// POST /api/words/delete  body: { deck_id, word_ids: [] }
// 卡組成員關係由前端 localStorage 保管；words 表的列為共享資料
//（會考 2000 字、查詢快取）可能被其他卡組與使用者引用，因此伺服器
// 端不刪除任何共享列，僅確認請求合法。前端負責更新卡組成員。
router.post('/delete', (req, res) => {
  const { deck_id, word_ids } = req.body || {};
  if (!deck_id || !Array.isArray(word_ids) || word_ids.length === 0) {
    return res.status(400).json({ success: false, error: 'deck_id 與 word_ids 為必填' });
  }
  if (['cap2000', 'weak'].includes(deck_id)) {
    return res.status(403).json({ success: false, error: '內置卡組無法修改' });
  }
  res.json({ success: true, removed: word_ids.length });
});

module.exports = router;
