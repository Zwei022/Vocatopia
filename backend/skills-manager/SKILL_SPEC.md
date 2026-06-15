# Vocatopia SKILL.md 規範

**狀態:** v1 — 2026-06-10  
**範圍:** 所有 `skills/` 目錄下的 SKILL.md 檔案  
**驗證工具:** `scripts/validate-skill.ts`

---

## 快速檢查清單

每個 SKILL.md 必須包含：

1. **Frontmatter** — 符合下面的 schema
2. **H1 標題** — 與 `name` 相符
3. **安裝命令** — 單一 code block，靠近頂部
4. **摘要段落** — 功能 + 何時觸發（中文或英文）
5. **步驟流程** — `## 第 1 步`、`## 第 2 步` 或 `## 流程`
6. **相對路徑** — 不允許絕對路徑（如 `/Users/...`）

---

## 1. Frontmatter 規範

SKILL.md 頂部的 `---` 之間寫 YAML。

### 必填欄位

| 欄位 | 型態 | 規則 |
|------|------|------|
| `name` | string | 技能代碼，小寫 kebab-case。必須與資料夾名稱和 H1 相符。 |
| `category` | enum | 必須是下列分類之一 |
| `platform` | enum | `claude` · `openai` · `gemini` · `multi` |
| `status` | enum | `Done` · `WIP` · `Not started` · `Paused` · `Outdated` |
| `author` | string | 原始創作者名稱 |

### 推薦欄位

| 欄位 | 型態 | 說明 |
|------|------|------|
| `description` | string | 簡短說明，AI 用來判斷何時觸發 |
| `input` | string | 單行：用戶需要提供什麼 |
| `process` | string | 單行：流程如何運作 |
| `output` | string | 單行：輸出什麼 |
| `vocab_level` | enum | 目標詞彙級數：`A1` · `A2` · `B1` · `B2` · `C1` · `會考` |
| `synergy` | string[] | 相關 Skill 的代碼 |

---

## 2. Vocatopia 分類系統

| 資料夾 | category 值 | 說明 |
|--------|-----------|------|
| `1-learning/` | `learning` | 學習功能（發音、聽力、文法、閱讀） |
| `2-content/` | `content` | 內容創作（例句、文章、翻譯） |
| `3-admin/` | `admin` | 行政管理（資料驗證、週報、統計） |

### 子分類（可選，寫在 description）

```yaml
category: learning
sub_category: pronunciation  # 或 listening, grammar, reading
```

---

## 3. 安裝命令格式

```markdown
# 單字發音優化器

\`\`\`bash
npx skills add https://github.com/<你的 GitHub>/vocatopia-skills --skill pronunciation-optimizer
\`\`\`
```

- `<slug>` 必須等於 frontmatter 的 `name`
- 一個檔案只能有一個 install snippet

---

## 4. 描述欄位（觸發詞）

`description` 決定 AI 何時呼叫你的 Skill。寫得越清楚，AI 越容易觸發。

### 好的例子

```yaml
description: |
  生成會考級英文單字的原創例句（Cambridge Dictionary 風格）。
  
  觸發詞：
  - 「生成例句」
  - 「造句」
  - 「幫我寫例句」
  - 「generate example sentence」
  - 「create an example for this word」
  
  何時使用：當你有新單字需要例句示範，或想批量生成例句時。
```

### 不好的例子

```yaml
description: This skill does something with examples.  # 太模糊
```

---

## 5. 輸入 / 流程 / 輸出

單行說明即可：

```yaml
input: "單字（English word）+ 目標詞彙級數（A1 ~ C1）"
process: "用 Cambridge 風格的規則生成原創例句，避免版權問題"
output: "JSON: { word, phonetic, example_sentence, explanation }"
```

---

## 6. 詞彙級數標籤

```yaml
vocab_level: "會考"  # 針對台灣國中會考
# 或
vocab_level: "B1"    # CEFR 級數
```

---

## 7. Frontmatter 完整範例

```yaml
---
name: pronunciation-optimizer
category: learning
sub_category: pronunciation
platform: claude
status: WIP
author: "你的名字"
vocab_level: "會考"
description: |
  優化單字發音教學。讀 MP3 檔或文字，輸出 IPA + 發音指南。
  
  觸發詞：「幫我發音」、「check pronunciation」、「發音檢查」
input: "英文單字 + 可選 MP3 檔"
process: "用 Kokoro TTS 生成標準發音，對比用戶輸入"
output: "IPA 符號 + 發音影片連結"
synergy: 
  - "exam-generator"
  - "listening-generator"
---
```

---

## 8. 檔案結構規範

```
skills/
├── 1-learning/
│   ├── exam-generator/
│   │   ├── SKILL.md           ← 必要
│   │   ├── examples/          ← 可選：參考範例
│   │   └── references/        ← 可選：輔助文件
│   ├── pronunciation-optimizer/
│   │   ├── SKILL.md
│   │   └── phonetic-guide.md
│   └── listening-generator/
│       └── SKILL.md
├── 2-content/
│   ├── article-seo/
│   │   └── SKILL.md
│   └── translation/
│       └── SKILL.md
└── 3-admin/
    ├── skill-qa/
    │   └── SKILL.md
    └── skill-router/
        └── SKILL.md
```

每個 Skill 一個資料夾，資料夾名 = `name` 欄位。

---

## 9. 相對路徑規則

✅ **可以**
```markdown
見 `../exam-generator/examples/cefr-levels.md`
見 `./references/phonetic-guide.pdf`
```

❌ **不可以**
```markdown
見 `/Users/qaz10/Desktop/Vocatopia/examples/cefr-levels.md`
見 `C:\Users\qaz10\Vocatopia\test.json`
```

---

## 10. 驗證檢查清單

執行前必須通過：

```bash
npm run validate  # 自動檢查
```

檢查項目：
- [ ] Frontmatter YAML 有效
- [ ] `name` 與資料夾名相符
- [ ] H1 與 `name` 相符
- [ ] 有 install snippet
- [ ] 沒有絕對路徑
- [ ] 相對路徑可解析

---

## 11. 什麼時候寫註解

只在「為什麼」不明顯時寫註解。

```typescript
// ✅ 好：解釋為什麼
// 用 Kokoro 而不是 Google TTS，因為 Google 開始限制免費 quota

// ❌ 不好：陳述事實
// 這是發音優化函數
function optimizePronunciation() { ... }
```

---

## 12. 版本控制

每個 SKILL.md 的修改：
- 修改 `status` 欄位（Done / WIP / Paused）
- 新增 `last_updated` 欄位（可選）

```yaml
status: Done
last_updated: "2026-06-10"
```

---

## 參考資源

- [Zynkr SKILL_SPEC](https://github.com/peter-tu-zynkr/zynkr-skill-builder/blob/main/SKILL_SPEC.md)
- [skills.sh 標準](https://skills.sh)
- [Cambridge Dictionary 例句風格](https://dictionary.cambridge.org)

---

**問題？** 在 `skills-manager/` 目錄開 Issue 或詢問。
