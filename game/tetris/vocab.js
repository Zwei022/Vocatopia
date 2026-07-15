// ════════════════════════════════
// 俄羅斯方塊 — 出題模組
// 消行快問：英文單字 → 4個中文釋義（用全站 WORDS 字庫）
// 60秒計時題：句子填空 → 4個英文選項（用會考單字練習題庫）
// ════════════════════════════════

function _ttShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 只取「有乾淨中文釋義」的單字，避免選項過長或空白
function _ttWordPool() {
  if (typeof WORDS === 'undefined') return [];
  return WORDS.filter(w => {
    const zh = (w.definition_zh || '').trim();
    return w.word && zh && zh.length <= 12 && !/\s{2,}/.test(w.word);
  });
}

// 消行快問：回傳 { kind:'word', prompt(英文單字), options[4](中文), answer }
function ttMakeWordQuestion() {
  const pool = _ttWordPool();
  if (pool.length < 4) return null;
  const shuffled = _ttShuffle(pool);
  const target = shuffled[0];
  const correctZh = (target.definition_zh || '').trim();

  // 3 個干擾項：釋義不同的其他單字
  const distractors = [];
  for (const w of shuffled.slice(1)) {
    const zh = (w.definition_zh || '').trim();
    if (zh && zh !== correctZh && !distractors.includes(zh)) distractors.push(zh);
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) return null;

  const options = _ttShuffle([correctZh, ...distractors]);
  return {
    kind: 'word',
    prompt: target.word,
    promptSub: target.pos || '',
    options,
    answer: options.indexOf(correctZh),
  };
}

// ── 句子題庫（60秒英文選擇題）──
// 混合三種題型（單字 / 文法 / 片語），讓計時題更有變化
const _TT_BANKS = [
  { file: '/server/data/question_bank_vocab_practice.json', label: '單字' },
  { file: '/server/data/question_bank_grammar.json',        label: '文法' },
  { file: '/server/data/question_bank_phrase.json',         label: '片語' },
];
let _ttSentenceBank = null;

async function ttLoadSentenceBank() {
  if (_ttSentenceBank) return _ttSentenceBank;
  const pool = [];
  await Promise.all(_TT_BANKS.map(async (b) => {
    try {
      const res = await fetch(b.file);
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const q of data) { q._typeLabel = b.label; pool.push(q); }
      }
    } catch { /* 單一題庫失敗不影響其他 */ }
  }));
  _ttSentenceBank = pool;
  return _ttSentenceBank;
}

// 60秒計時題：回傳 { kind:'sentence', typeLabel(單字/文法/片語), prompt, options[4], answer }
function ttMakeSentenceQuestion() {
  if (!_ttSentenceBank || !_ttSentenceBank.length) return null;
  const q = _ttSentenceBank[Math.floor(Math.random() * _ttSentenceBank.length)];
  const rawOpts = (q.options || []).map(o => o.replace(/^\([A-D]\)\s*/, ''));
  if (rawOpts.length !== 4) return null;
  const rawZh = q.optionsZh || null;
  // per-render 洗牌選項順序（連同對應的中譯），避免同一題重複出現時正解永遠在同一位置
  // 被死背；並保證每次出題答案位置真隨機（題庫本身正解分佈已平均，見 #15）。
  const paired = rawOpts.map((opt, i) => ({ opt, zh: rawZh ? rawZh[i] : null, correct: i === q.answer }));
  const shuffled = _ttShuffle(paired);
  return {
    kind: 'sentence',
    typeLabel: q._typeLabel || '',
    prompt: q.sentence,
    promptSub: q.pos || q.target_grammar || '',
    options: shuffled.map(p => p.opt),
    answer: shuffled.findIndex(p => p.correct),
    optionsZh: rawZh ? shuffled.map(p => p.zh) : null,
  };
}
