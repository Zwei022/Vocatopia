// 修正 question_bank_reading.json 裡 8 題分組子題的 answer 損毀，並同步修正
// explanation 詳解文字裡跟著錯掉的「選X」字母引用（其餘推論文字本身正確，只置換字母）。
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'server', 'data', 'question_bank_reading.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const FIXES = [
  { id: 'reading_0', idx: 1, newAnswer: 3, oldLetter: 'C', newLetter: 'D' },
  { id: 'reading_1', idx: 0, newAnswer: 3, oldLetter: 'B', newLetter: 'D' },
  { id: 'reading_4', idx: 2, newAnswer: 3, oldLetter: 'B', newLetter: 'D' },
  { id: 'reading_5', idx: 0, newAnswer: 3, oldLetter: 'A', newLetter: 'D' },
  { id: 'reading_6', idx: 1, newAnswer: 3, oldLetter: 'B', newLetter: 'D' },
  { id: 'reading_6', idx: 2, newAnswer: 1, oldLetter: 'C', newLetter: 'B' },
  { id: 'reading_9', idx: 2, newAnswer: 0, oldLetter: 'B', newLetter: 'A' },
  { id: 'reading_49', idx: 1, newAnswer: 2, oldLetter: 'A', newLetter: 'C' },
];

let fixed = 0;
for (const { id, idx, newAnswer, oldLetter, newLetter } of FIXES) {
  const g = data.find(x => x.id === id);
  if (!g) { console.error(`找不到 ${id}`); continue; }
  const q = g.questions[idx];
  if (!q) { console.error(`${id} 找不到 question index ${idx}`); continue; }

  const beforeAnswer = q.answer;
  q.answer = newAnswer;

  // 只替換句尾那個「選X」字母（避免誤動其他敘述性文字），格式為 選 + 字母 + 句尾標點
  const pattern = new RegExp(`選\\s*${oldLetter}([；。])`);
  const before = q.explanation;
  q.explanation = q.explanation.replace(pattern, `選 ${newLetter}$1`);

  console.log(`${id} q${idx + 1}：answer ${beforeAnswer}→${newAnswer}；explanation ${before === q.explanation ? '未變動(請檢查!)' : '已同步修正字母'}`);
  fixed++;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`\n共修正 ${fixed} 筆`);
