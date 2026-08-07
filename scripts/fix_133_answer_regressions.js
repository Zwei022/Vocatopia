// 修正 Codex 稽核找到的 133 題答案錯誤中，格式單純的 vocab_practice.json（76題）
// 跟 phrase.json（49題）。這批錯誤是 answer 索引被獨立損毀，options/explanation/
// optionsZh 都沒被動，故只需比對選項文字找到正確 index 寫回去。
// reading.json 的 8 題（分組子題+ explanation 內嵌字母需一併修正）另外手動處理。
const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'AUDIT_REPORT.md');
const report = fs.readFileSync(reportPath, 'utf-8');

// 只抓 vocab_practice / phrase 兩個章節區間
function extractSection(text, startHeader) {
  const startIdx = text.indexOf(startHeader);
  const rest = text.slice(startIdx + startHeader.length);
  const nextHeaderIdx = rest.search(/\n### question_bank_|\n## \d/);
  return rest.slice(0, nextHeaderIdx === -1 ? undefined : nextHeaderIdx);
}

const vocabSection = extractSection(report, '### question_bank_vocab_practice.json');
const phraseSection = extractSection(report, '### question_bank_phrase.json');

const ENTRY_RE = /- \*\*高｜答案錯誤｜([a-z_0-9]+)\*\*\n {2}- 題幹：.*\n {2}- 錯誤內容：目前 answer 指向「\([A-D]\) (.+?)」。\n {2}- 建議修正：answer 應指向「\([A-D]\) (.+?)」。/g;

function parseEntries(section) {
  const out = [];
  let m;
  const re = new RegExp(ENTRY_RE);
  while ((m = re.exec(section))) {
    out.push({ id: m[1], oldText: m[2].trim(), newText: m[3].trim() });
  }
  return out;
}

function applyFixes(file, entries) {
  const filePath = path.join(__dirname, '..', 'server', 'data', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let fixed = 0, skipped = 0;
  for (const { id, oldText, newText } of entries) {
    const q = data.find(x => x.id === id);
    if (!q) { console.error(`[${file}] 找不到 id=${id}`); skipped++; continue; }
    const optTexts = q.options.map(o => o.replace(/^\([A-D]\)\s*/, '').trim());
    const curIdx = q.answer;
    const newIdx = optTexts.findIndex(t => t === newText);
    if (newIdx === -1) { console.error(`[${file}] ${id} 找不到選項文字「${newText}」，選項為 ${JSON.stringify(optTexts)}`); skipped++; continue; }
    if (optTexts[curIdx] !== oldText) {
      console.error(`[${file}] ${id} 目前答案「${optTexts[curIdx]}」跟報告記載的「${oldText}」不符，跳過以策安全`);
      skipped++; continue;
    }
    q.answer = newIdx;
    fixed++;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`${file}：修正 ${fixed} 筆，跳過 ${skipped} 筆`);
}

const vocabEntries = parseEntries(vocabSection);
const phraseEntries = parseEntries(phraseSection);
console.log(`解析到 vocab_practice ${vocabEntries.length} 筆、phrase ${phraseEntries.length} 筆`);

applyFixes('question_bank_vocab_practice.json', vocabEntries);
applyFixes('question_bank_phrase.json', phraseEntries);
