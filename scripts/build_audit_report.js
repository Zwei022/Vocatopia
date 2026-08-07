const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function section(file) {
  const text = fs.readFileSync(path.join(root, 'reports', file), 'utf8').trim();
  return text.replace(/^# .+\r?\n+/, '');
}

const report = `# Vocatopia 全面資料正確性審查報告

> 審查日期：2026-08-07  
> 專案：\`C:\\Users\\qaz10\\Desktop\\Vocatopia\`  
> 模式：只讀審查。本輪未覆寫任何單字、題庫、真題、模擬題或文法資料。

## 執行摘要

本次先以程式完整掃描 JSON、schema、必要欄位、答案邊界、重複 ID、中文字形、IPA 外框、\`done\`、目標字集合與例句字頭，再把大量資料切成每批約 100 筆進行語意複核。

| 類別 | 覆蓋範圍 | 主要結果 |
|---|---:|---|
| 核心單字 | 1,994 個目標字，20 批 | 缺字 0；快取另含 1,320 個非目標字；6 個高嚴重問題；141 筆缺 IPA；292 筆 definition 為英文 |
| 六份題庫 | 1,632 個作答單元，20 批 | **133 題目前 answer 指向語意錯誤選項**；其餘 schema、ID、optionsZh 數量通過 |
| 歷屆＋模擬 | 18 檔、686 題，7 批 | 檔內未確認到正解錯誤；2026 聽力 Q13–21 不是實際逐字稿；20 篇模擬文章篇幅不符規格 |
| 文法教材 | 20 章、92 子課、1,402 個作答單元，15 批 | 1 題答案錯、1 題有三個相同正解、至少 9 項錯誤／高風險教學內容 |

### 最高優先處理順序

1. 六份題庫中的 133 題答案錯誤。這些錯誤與目前工作目錄相對 Git 基準版的 answer 變更一致；題意與詳解支持基準版答案。
2. 單字庫 4 筆整組資料錯置：\`Chinese New Year\`、\`Christmas Eve\`、\`class leader\`、\`Rome\`，以及錯誤字頭 \`ld\`、\`running nose\`。
3. 文法教材的確定答案錯誤、正解不存在，以及錯誤教學規則。
4. 2026 聽力 Q13–21 的摘要型 transcript，不能當真正逐字稿呈現。
5. 補齊 141 筆 IPA，並決定快取中 1,320 個非核心字是否移出權威核心字庫。

## 方法、可信度與限制

- 結構檢查可完整覆蓋機械性問題；語意部分依固定順序分批核對，沒有用抽樣結果冒充全量結果。
- 核心字表實際是 1,994 個唯一字頭，不是整數 2,000。\`words_cache.json\` 共有 3,314 筆，因此若它被定義為「權威核心字庫」，目前確實多出 1,320 筆；這些額外字只做結構與集合審查，沒有宣稱已逐筆語意複核。
- 歷屆題已核對檔內文章／逐字稿、選項、答案與詳解。官方網站確實提供歷屆題本與參考答案頁，但本輪未把每份官方 PDF 下載後逐字 OCR 比對，因此「檔內一致」不等於「已證明與官方原卷逐字相同」。官方入口：[國中教育會考歷屆試題](https://cap.rcpet.edu.tw/examination.html)。
- 2023–2025 聽力有本機音檔與 ASR 可交叉檢查；2026 缺獨立 ASR／官方原卷留存，可信度較低。
- 本報告針對目前工作目錄快照；工作目錄在審查開始前已有未提交資料變更。本輪沒有自動修復任何來源資料。

---

## 1. 單字資料庫

${section('audit_words_full.md')}

---

## 2. 六份題庫

${section('audit_banks_full.md')}

---

## 3. 歷屆會考與模擬試題

${section('audit_exams_full.md')}

---

## 4. 文法教學內容

${section('audit_grammar_full.md')}

### 作答單元獨立覆核

${section('audit_grammar_questions_full.md')}

### 教學規則獨立交叉覆核

${section('audit_grammar_crosscheck.md')}

### 交叉報告歧異裁定

- 第 17 章第 2 小節 Q4 的題幹是 \`___ of the heavy rain\`，把選項 \`Because\` 放入後會形成合法的 \`Because of the heavy rain\`。因此精確問題不是「正解文字不存在」，而是 A、C、D 三個選項完全相同且都能成立，導致沒有唯一答案。最終裁定以「作答單元獨立覆核」的說明為準。
- 三組只有 stem 相同、但選項與考點不同的題目，不列為確定重複題錯誤；若產品不希望跨章重現，可另列內容多樣性改善。

---

## 建議修正後的回歸驗證

1. 每批修正後重新跑 \`scripts/audit_all_content.js\` 與各分類審查程式。
2. 答案修正必須依「題意與正解詞」判斷，不能只根據詳解內的 A／B／C／D 字母改 answer。
3. 任何文章或 transcript 改寫後，都要重新核對答案、optionsZh 與詳解。
4. 單字修正後重新檢查 IPA、例句詞形命中、繁體字形與詞性一致性。
5. 正式發布前再從官方原卷／答案表做一次歷屆題外部比對，並保存來源與比對紀錄。
`;

fs.writeFileSync(path.join(root, 'AUDIT_REPORT.md'), report);
console.log(`AUDIT_REPORT.md written (${report.length} characters)`);
