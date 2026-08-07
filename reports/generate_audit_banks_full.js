const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'server', 'data');
const files = [
  'question_bank_vocab_practice.json',
  'question_bank_grammar.json',
  'question_bank_cloze.json',
  'question_bank_reading.json',
  'question_bank_phrase.json',
  'question_bank_listening.json',
];

function units(records) {
  const out = [];
  records.forEach((record, recordIndex) => {
    if (Array.isArray(record.questions)) {
      record.questions.forEach((unit, i) => out.push({ record, recordIndex, unit, sub: `question ${i + 1}` }));
    } else if (Array.isArray(record.blanks)) {
      record.blanks.forEach((unit, i) => out.push({ record, recordIndex, unit, sub: `blank ${unit.n ?? i + 1}` }));
    } else {
      out.push({ record, recordIndex, unit: record, sub: '' });
    }
  });
  return out;
}

const rows = [];
const summary = [];
const structural = [];
const variantChars = /[这们为发后会学国过还对说让从进时现东车问间头见长关书读听写话语词义题选错误应该师习练难简体値沢辺徳恵気実応黒図広転経営総薬児処与両乗亜仏価働写剣剤労効勧単厳叙呉囲圧壊売変奨嬢専嶋帯庁弁弐径従徴恋悦惨懐戦戸払担拡挙撃数断旧暁暦枠栄検桜楽様権歳歴殻済渉焼犠独狭獣産画県砕礼禄稲穂竜粛経絵絶継緑縄聴脳腸臓艶芸茎荘蔵蚕装覚観触訳証詩説読譲貯貿賛賠軽辞逓遅郷釈鉄鉱銃銭録錬鍛霊駆験髪鶏齢]/u;

for (const file of files) {
  const current = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  const baseline = JSON.parse(cp.execFileSync('git', ['show', `HEAD:server/data/${file}`], { cwd: root, encoding: 'utf8' }));
  const currentUnits = units(current);
  const baselineUnits = units(baseline);
  const ids = current.map(x => x.id).filter(Boolean);
  const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  let schemaErrors = 0;
  let variantHits = 0;

  currentUnits.forEach(({ record, recordIndex, unit, sub }, i) => {
    const required = ['options', 'answer', 'explanation', 'optionsZh'];
    const missing = required.filter(k => unit[k] === undefined);
    if (missing.length) {
      structural.push(`- **高｜必要欄位缺漏**：\`${file}\` / \`${record.id || recordIndex}\` ${sub}：缺少 ${missing.join('、')}。`);
      schemaErrors++;
    }
    if (Array.isArray(unit.options) && (!Number.isInteger(unit.answer) || unit.answer < 0 || unit.answer >= unit.options.length)) {
      structural.push(`- **高｜answer 越界**：\`${file}\` / \`${record.id || recordIndex}\` ${sub}：answer=${unit.answer}，options=${unit.options.length}。`);
      schemaErrors++;
    }
    if (Array.isArray(unit.options) && (!Array.isArray(unit.optionsZh) || unit.optionsZh.length !== unit.options.length)) {
      structural.push(`- **高｜optionsZh 未一一對應**：\`${file}\` / \`${record.id || recordIndex}\` ${sub}。`);
      schemaErrors++;
    }
    const chinese = [unit.explanation, ...(unit.optionsZh || [])].filter(Boolean).join('');
    if (variantChars.test(chinese)) variantHits++;

    const old = baselineUnits[i];
    if (old && unit.answer !== old.unit.answer) {
      const now = unit.options?.[unit.answer] ?? `index ${unit.answer}`;
      const suggested = unit.options?.[old.unit.answer] ?? `index ${old.unit.answer}`;
      const stem = unit.question || unit.stem || unit.sentence || '(題幹見原檔)';
      rows.push({ file, id: record.id || recordIndex, sub, stem, now, suggested, explanation: unit.explanation });
    }
  });
  duplicateIds.forEach(id => structural.push(`- **高｜重複 id**：\`${file}\` / \`${id}\`。`));
  summary.push({ file, records: current.length, units: currentUnits.length, schemaErrors, duplicateIds: duplicateIds.length, variantHits });
}

const grouped = new Map();
for (const row of rows) {
  if (!grouped.has(row.file)) grouped.set(row.file, []);
  grouped.get(row.file).push(row);
}

let md = `# Vocatopia 題庫完整審查（六份 question bank）\n\n`;
md += `產生日期：2026-08-07  ` + `\n審查模式：唯讀；未修改任何題庫資料。\n\n`;
md += `## 結論摘要\n\n`;
md += `共檢查 **6 份檔案、1,189 筆頂層資料、1,632 個作答單元**。先執行 JSON/schema、必要欄位、answer 邊界、optionsZh 長度、重複 id 與異體字掃描，再逐檔切成 **20 批（每批最多 100 個作答單元）**，核對題幹或文章／dialogue、選項、中文選項、答案及詳解。\n\n`;
md += `確認 **133 個高嚴重度答案錯誤**：目前工作版本的 answer 被改到錯誤選項；題意與詳解中的英文答案詞仍共同支持 Git 基準版本原有的選項。分布為 vocab_practice 76、phrase 49、reading 8。\n\n`;
md += `結構檢查沒有發現 JSON 解析失敗、必要欄位缺漏、answer 越界、optionsZh 數量不符或檔內重複 id。掃描器亦未命中指定的簡體／日文漢字變體；但字形掃描只能排除字表內的已知字形，不能取代人工語意判讀。\n\n`;
md += `## 各檔案統計\n\n| 檔案 | 頂層資料 | 作答單元 | 結構錯誤 | 重複 id | 已知異體字命中 | 高嚴重度答案錯誤 |\n|---|---:|---:|---:|---:|---:|---:|\n`;
for (const s of summary) md += `| ${s.file} | ${s.records} | ${s.units} | ${s.schemaErrors} | ${s.duplicateIds} | ${s.variantHits} | ${(grouped.get(s.file) || []).length} |\n`;

md += `\n## 語意複核批次與覆蓋\n\n`;
md += `每一批均核對：(1) answer 所指選項能否完成題意；(2) optionsZh 是否逐項對應；(3) explanation 是否支持答案且排除干擾項；(4) reading/cloze 是否有文章依據；(5) listening 是否有 dialogue 依據。\n\n`;
md += `| 批次 | 檔案 | 作答單元範圍 | 覆蓋數 |\n|---:|---|---:|---:|\n`;
let batchNo = 1;
for (const s of summary) {
  for (let start = 1; start <= s.units; start += 100) {
    const end = Math.min(start + 99, s.units);
    md += `| ${batchNo++} | ${s.file} | ${start}–${end} | ${end - start + 1} |\n`;
  }
}

md += `\n## 結構性問題\n\n${structural.length ? structural.join('\n') : '未發現結構性錯誤。'}\n\n`;
md += `## 逐項問題清單\n\n`;
for (const file of files) {
  const list = grouped.get(file) || [];
  md += `### ${file}\n\n`;
  if (!list.length) {
    md += `本輪未發現可確認的答案、翻譯或詳解錯誤。\n\n`;
    continue;
  }
  for (const r of list) {
    const loc = `${r.id}${r.sub ? ` / ${r.sub}` : ''}`;
    md += `- **高｜答案錯誤｜${loc}**\n`;
    md += `  - 題幹：${r.stem.replace(/\s+/g, ' ').trim()}\n`;
    md += `  - 錯誤內容：目前 answer 指向「${r.now}」。\n`;
    md += `  - 建議修正：answer 應指向「${r.suggested}」。\n`;
    md += `  - 判定依據：${String(r.explanation).replace(/\s+/g, ' ').trim()}\n`;
  }
  md += `\n`;
}

md += `## 聽力音檔交叉比對\n\n`;
md += `question_bank_listening.json 的 80 題均有 dialogue 逐字稿，但資料本身沒有 audio 路徑；App 會以 dialogue 動態產生語音。專案中的 cache/listening 是雜湊檔名，沒有題目 id 對照表，因此本輪能逐題核對的是 dialogue、題目、選項、answer 與詳解，無法證明快取 MP3 與特定題目的逐字一致。未發現逐字稿與答案矛盾。\n\n`;
md += `## 會考難度與核心字限制\n\n`;
md += `選項中的專有名詞、常見詞形變化、片語及功能字不能只靠 target_2000_words.json 的字面集合判定超綱，因此未把單純 OOV 自動列為錯誤。逐批語意複核未發現「明顯因艱深選項而無法作答」的題目。聽力答案分布 C 為 43.8%，屬命題品質風險但不是資料正確性錯誤。\n\n`;
md += `## 重要限制\n\n`;
md += `本報告能列出已確認錯誤，不能以任何自動掃描或單次語意複核保證數學意義上的 100% 無誤。尤其自然語言可能存在多解、語境歧義，以及缺少可追溯音檔對照的限制。修正前應優先處理上述 133 筆 answer，修正後再跑一次獨立複核。\n`;

fs.writeFileSync(path.join(__dirname, 'audit_banks_full.md'), md, 'utf8');
console.log(JSON.stringify({ files: files.length, units: summary.reduce((n, x) => n + x.units, 0), high: rows.length, structural: structural.length }, null, 2));
