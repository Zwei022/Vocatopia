---
name: exam-generator
category: learning
sub_category: exam
platform: claude
status: WIP
author: "Claude Code"
vocab_level: "會考"
description: |
  根據指定的單字列表和難度級別，自動生成台灣國中會考級英文考題組合。
  支援 4 種題型：閱讀測驗、單字選擇題、文法選擇題、克漏字測驗。
  每份試卷包含 40 題，難度分佈符合真實會考比例。
  
  觸發詞：
  - 「生成考題」
  - 「生成試卷」
  - 「出題」
  - 「會考試題」
  - 「generate exam」
  - 「create test」
  - 「做一份考試」
  
  何時使用：
  - 教師準備測驗
  - 學生自我評估
  - 批量生成練習卷
---

# exam-generator 考題生成器

```bash
npx skills add https://github.com/qaz1021922/vocatopia-skills --skill exam-generator
```

根據指定的單字和難度，自動生成符合台灣國中會考格式的英文考題。每份試卷包含閱讀、單字、文法、克漏字四種題型，共 40 題。

---

## 使用場景

- 教師快速製作練習卷
- 學生進度評估
- 大規模題庫生成
- 教學材料補充

---

## 輸入要求

```json
{
  "vocab_list": ["apple", "beautiful", "consequence", ...],  // 單字列表
  "difficulty_level": "CEFR-B1",  // 或 "會考"、"A1-B2"
  "question_count": 40,
  "include_explanations": true,
  "output_format": "json"  // 或 "pdf"、"markdown"
}
```

---

## 流程

### 第 1 步 — 驗證輸入

檢查：
- 單字列表有效性（英文、已知單字）
- 難度級別符合 CEFR 或台灣會考標準
- 題數合理（10-100 題）

```bash
# 驗證範例
npm run validate-input -- --vocab-list=words.txt --level=B1
```

### 第 2 步 — 題目生成

根據難度和題型分佈，生成：
- **閱讀測驗** (10 題) — 短文理解
- **單字選擇** (10 題) — 詞彙辨析
- **文法選擇** (10 題) — 語法應用
- **克漏字** (10 題) — 綜合運用

```typescript
const examGenerator = new ExamGenerator({
  vocabList: words,
  difficulty: 'CEFR-B1',
  questionTypes: ['reading', 'vocab', 'grammar', 'cloze'],
  distribution: [0.25, 0.25, 0.25, 0.25]
});

const exam = await examGenerator.generate();
```

### 第 3 步 — 難度平衡檢查

確保：
- 每題難度符合目標級別
- 題目分佈均勻（不會連續難題）
- 選項誘惑力適當

### 第 4 步 — 答案 + 解釋生成

為每題生成：
- 正確答案
- 詳細解釋
- 易錯原因分析
- 相關詞彙擴展

```json
{
  "question_id": "reading_001",
  "answer": "B",
  "explanation": "根據第三段...",
  "why_others_wrong": {
    "A": "過度推論",
    "C": "與原文相反",
    "D": "未提及"
  },
  "related_vocab": ["infer", "conclude"]
}
```

### 第 5 步 — 匯出

支援格式：
- **JSON** — 供 API 消費
- **PDF** — 列印考卷
- **Markdown** — GitHub 檢視
- **Google Sheets** — 教師管理

---

## 輸出範例

```json
{
  "exam_id": "exam_20260610_001",
  "created_at": "2026-06-10T10:30:00Z",
  "metadata": {
    "vocabulary_level": "CEFR-B1",
    "total_questions": 40,
    "estimated_time": "45 分鐘",
    "difficulty_score": 6.2
  },
  "questions": [
    {
      "id": "reading_001",
      "type": "reading",
      "passage": "Sally has always been interested in...",
      "question": "What can be inferred about Sally?",
      "options": {
        "A": "她喜歡運動",
        "B": "她熱愛學習",
        "C": "她想要放假",
        "D": "她害怕挑戰"
      },
      "answer": "B",
      "explanation": "根據段落提到她主動參加各種課程...",
      "difficulty": 5.5,
      "cefr_level": "B1"
    },
    // ... 共 40 題
  ],
  "answer_key": { "reading_001": "B", ... },
  "download_links": {
    "pdf": "https://...",
    "json": "https://...",
    "markdown": "https://..."
  }
}
```

---

## 品質檢查清單

執行前必須通過：

- [ ] 所有單字都是有效的英文單字
- [ ] 難度級別正確分佈（不會都簡單或都難）
- [ ] 選項設計合理（不會有明顯正確答案）
- [ ] 答案解釋清晰詳細
- [ ] 沒有文法錯誤或拼字錯誤

---

## API 端點

```bash
# 直接呼叫 API
POST /api/skills/exam-generator/execute
Content-Type: application/json

{
  "vocab_list": ["apple", "beautiful", ...],
  "difficulty_level": "會考",
  "question_count": 40,
  "output_format": "json"
}

# 回應
200 OK
{
  "exam_id": "exam_20260610_001",
  "questions": [ ... ],
  "answer_key": { ... }
}
```

---

## 相關 Skills

- `pronunciation-optimizer` — 為生成的單字添加發音
- `listening-generator` — 基於相同單字生成聽力題
- `skill-qa` — 驗證考題品質

---

## 常見問題

**Q: 可以客製化題型分佈嗎？**  
A: 可以。在 input 的 `distribution` 欄位設定 `[0.3, 0.2, 0.3, 0.2]` 等。

**Q: 可以包含圖片嗎？**  
A: 目前只支援文字題。圖片題在規劃中。

**Q: 生成速度有多快？**  
A: 40 題約 5-10 秒（取決於難度和複雜度）。

---

## 故障排除

| 問題 | 解決方案 |
|------|--------|
| 題目重複 | 增加 vocab_list 或降低 question_count |
| 難度不符 | 檢查 difficulty_level 是否正確；重新執行 |
| 選項太明顯 | 自動調整選項生成策略；重試 |

---

## 技術細節

- **模型:** Claude 3.5 Sonnet
- **快取:** 啟用提示詞快取以加速重複生成
- **驗證:** 每題通過 CEFR 詞彙檢查器
- **延遲:** P95 < 15 秒（40 題）

---

## 版本

- **v1.0** — 基礎四題型支援
- **v1.1** (WIP) — 圖片題、配對題支援
- **v1.2** (計畫) — 教師後台管理、題庫複用

---

**問題？問我。**
