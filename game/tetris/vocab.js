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

// ── 句子題庫（60秒計時題）──
let _ttSentenceBank = null;

async function ttLoadSentenceBank() {
  if (_ttSentenceBank) return _ttSentenceBank;
  try {
    const res = await fetch('/server/data/question_bank_vocab_practice.json');
    const data = await res.json();
    _ttSentenceBank = Array.isArray(data) ? data : [];
  } catch {
    _ttSentenceBank = [];
  }
  return _ttSentenceBank;
}

// 60秒計時題：回傳 { kind:'sentence', prompt(句子), options[4](英文,去掉ABC前綴), answer }
function ttMakeSentenceQuestion() {
  if (!_ttSentenceBank || !_ttSentenceBank.length) return null;
  const q = _ttSentenceBank[Math.floor(Math.random() * _ttSentenceBank.length)];
  const options = (q.options || []).map(o => o.replace(/^\([A-D]\)\s*/, ''));
  if (options.length !== 4) return null;
  return {
    kind: 'sentence',
    prompt: q.sentence,
    promptSub: q.pos || '',
    options,
    answer: q.answer,
    optionsZh: q.optionsZh || null,
  };
}
