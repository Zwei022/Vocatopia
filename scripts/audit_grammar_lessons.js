const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'server/data/grammar_lessons.json'), 'utf8'));
const issues = [];
const units = [];
const prompts = new Map();
const add = (locator, type, severity, found, suggestion) => issues.push({ locator, type, severity, found, suggestion });

function walk(node, locator = '$') {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${locator}[${i}]`));
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.options) && 'answer' in node) {
    units.push({ locator, ...node });
    const clean = node.options.map(x => String(x).replace(/^\s*\([A-D]\)\s*/, '').trim());
    if (new Set(clean.map(x => x.toLowerCase())).size !== clean.length) add(locator, '重複選項', '高', JSON.stringify(node.options), '所有選項須互不相同，且正解文字必須真的存在');
    if (!Number.isInteger(node.answer) || !node.options[node.answer]) add(locator, '答案 index 錯誤', '高', String(node.answer), 'answer 指向有效選項');
    if (Array.isArray(node.optionsZh) && node.optionsZh.length !== node.options.length) add(locator, 'optionsZh 數量錯誤', '高', String(node.optionsZh.length), `應為 ${node.options.length}`);
    const prompt = String(node.sentence || node.question || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (prompt) {
      if (prompts.has(prompt)) add(locator, '重複題目', '中', prompt, `與 ${prompts.get(prompt)} 重複；確認是否刻意複習`);
      else prompts.set(prompt, locator);
    }
    const claims = [...String(node.explanation || '').matchAll(/(?:故|所以|因此)?選\s*\(?([A-D])\)?/gi)].map(m => m[1].charCodeAt(0) - 65);
    if (claims.some(x => x !== node.answer)) add(locator, '詳解與 answer 矛盾', '高', `answer=${node.answer}; explanation=${node.explanation}`, '同步修正正解或詳解');
  }
  for (const [key, value] of Object.entries(node)) if (value && typeof value === 'object') walk(value, `${locator}.${key}`);
}
walk(data);

const knownConceptIssues = [
  ['$.1.subLessons[0].teaching.explanation','錯誤文法規則','高','宣稱 because／since 等附屬連接詞前後子句時態基本上要一致','時態應由每個動作的實際時間關係決定；because 本身不要求兩子句同時態'],
  ['$.1.subLessons[1].teaching.explanation','錯誤文法規則','高','把 lose、decide 列為不能使用進行式的狀態動詞','兩者可用進行式，例如 I am losing hope / We are deciding what to do'],
  ['$.2.subLessons[0].teaching.explanation','錯誤文法規則','高','宣稱 buy、open、arrive、finish 等瞬間動作天生沒有進行式，且 while 子句一定用進行式','這些動詞可用進行式；while 也能接一般式，應依語意判斷'],
  ['$.1.subLessons[1].teaching.explanation','過度絕對化','中','宣稱 before long 只指向未來','before long 可搭配過去或未來，表示「不久之後」'],
  ['$.15.subLessons[1].teaching.explanation','錯誤／高風險規則','高','把 I said 與 I think／I believe 一併說成附加問句要依受詞子句','轉移附加問句主要適用第一人稱現在式的 think/believe/suppose 等；I said 通常不照搬'],
];
for (const issue of knownConceptIssues) add(...issue);

const out = { generatedAt: new Date().toISOString(), chapters: Object.keys(data).length, answerUnits: units.length, issueCount: issues.length, issues };
fs.writeFileSync(path.join(root, 'reports/audit_grammar_structural.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ chapters: out.chapters, answerUnits: out.answerUnits, issueCount: out.issueCount }, null, 2));
