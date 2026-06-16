# Vocatopia Skills Manager

Vocatopia 的智能 Skill 管理系統。根據 Zynkr 架構改造，用於管理和驗證教學 Skills。

## 📁 目錄結構

```
skills-manager/
├── SKILL_SPEC.md              ← Skill 規範文檔（必讀）
├── README.md                  ← 本檔案
├── package.json               ← 依賴配置
├── skills/
│   ├── 1-learning/            ← 學習 Skills（發音、聽力、文法等）
│   │   ├── exam-generator/
│   │   │   └── SKILL.md       ← 考題生成 Skill（範例）
│   │   ├── pronunciation-optimizer/
│   │   └── listening-generator/
│   ├── 2-content/             ← 內容 Skills（翻譯、文章等）
│   │   ├── article-seo/
│   │   └── translation/
│   └── 3-admin/               ← 行政 Skills（驗證、統計等）
│       ├── skill-qa/
│       └── skill-router/
├── scripts/
│   ├── skill-router.ts        ← 智能路由器（改寫自 Zynkr）
│   ├── validate-skill.ts      ← 品質檢查工具
│   └── ingest.ts              ← （待實現）Skill 索引生成
└── generated/
    └── skills-index.json      ← 生成的 Skill 索引（前端消費）
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
cd backend/skills-manager
npm install
```

### 2. 驗證現有 Skill

```bash
# 驗證 exam-generator
npm run validate skills/1-learning/exam-generator/SKILL.md

# 預期輸出：
# ✅ PASS — 0 errors, 0 warnings
```

### 3. 測試路由器

```bash
# 編譯 TypeScript
npx tsc scripts/skill-router.ts

# 執行測試
node scripts/skill-router.js

# 預期輸出：
# 📍 輸入類型: skill-request (信心: medium)
# 🎯 意圖偵測: exam-generator (信心: high)
# 候選: exam-generator, ...
```

### 4. 生成 Skill 索引

```bash
npm run ingest
# 輸出: generated/skills-index.json
```

## 📝 創建新 Skill 的步驟

### 步驟 1：建立資料夾

```bash
# 假設要建立發音優化 Skill
mkdir -p skills/1-learning/pronunciation-optimizer
touch skills/1-learning/pronunciation-optimizer/SKILL.md
```

### 步驟 2：寫 SKILL.md

參考 `SKILL_SPEC.md` 和 `skills/1-learning/exam-generator/SKILL.md`：

```markdown
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
  
  觸發詞：「幫我發音」、「check pronunciation」
input: "英文單字 + 可選 MP3 檔"
process: "用 Kokoro TTS 生成標準發音，對比用戶輸入"
output: "IPA 符號 + 發音影片連結"
---

# 發音優化器

\`\`\`bash
npx skills add https://github.com/<你的 GitHub>/vocatopia-skills --skill pronunciation-optimizer
\`\`\`

[... 更多內容 ...]
```

### 步驟 3：驗證

```bash
npm run validate skills/1-learning/pronunciation-optimizer/SKILL.md
```

如果輸出 `❌ FAIL`，按照建議修復。

### 步驟 4：更新路由器（自動發現）

```bash
npm run ingest
```

路由器會自動掃描新的 SKILL.md 並添加到索引。

## 🔧 核心概念

### 1. 智能路由器 (`skill-router.ts`)

自動判斷用戶意圖，路由到正確的 Skill：

```typescript
import { VocatopiaSkillRouter } from './scripts/skill-router';

const router = new VocatopiaSkillRouter('./skills');

// 用戶說什麼
const result = await router.route('我想生成一份考試');

// 輸出
// {
//   action: 'auto-invoke',
//   skillName: 'exam-generator',
//   reason: '檢測到高信心度意圖: 用戶要 exam-generator'
// }
```

### 2. 品質檢查 (`validate-skill.ts`)

確保 SKILL.md 符合規範：

```bash
npm run validate <skill-path>
```

檢查項目：
- ✅ Frontmatter 格式和必填欄位
- ✅ H1 標題與 name 相符
- ✅ Install snippet 存在且正確
- ✅ 沒有絕對路徑洩露
- ✅ 包含觸發詞和說明

### 3. Skill 索引 (`generated/skills-index.json`)

供前端和 API 消費的 Skill 清單：

```json
{
  "exam-generator": {
    "name": "exam-generator",
    "category": "learning",
    "description": "...",
    "triggers": ["生成考題", "生成試卷", "出題"],
    "vocab_level": "會考"
  },
  // ... 更多 Skills
}
```

## 📋 NPM Scripts

```bash
# 驗證指定 Skill
npm run validate -- skills/1-learning/exam-generator/SKILL.md

# 驗證所有 Skills
npm run validate:all

# 生成 Skills 索引
npm run ingest

# 編譯 TypeScript
npm run build

# 運行測試
npm test

# 監控模式（自動重編譯）
npm run dev
```

## 🔗 集成到你的 Agent

在你的 Agent 代碼裡：

```typescript
import { VocatopiaSkillRouter } from './skills-manager/scripts/skill-router';

class VocatopiaAgent {
  private router: VocatopiaSkillRouter;

  constructor() {
    this.router = new VocatopiaSkillRouter('./skills-manager/skills');
  }

  async handleUserMessage(message: string) {
    // 第 1 步：自動判斷意圖
    const route = await this.router.route(message);

    if (route.action === 'auto-invoke') {
      // 第 2 步：執行對應 Skill
      return await this.executeSkill(route.skillName!, message);
    } else if (route.action === 'ask') {
      // 需要澄清
      return route.clarifyingQuestion;
    } else {
      // 無法判斷
      return route.reason;
    }
  }

  private async executeSkill(skillName: string, input: string): Promise<string> {
    // 根據 skillName 呼叫對應的 API 端點
    const response = await fetch(`/api/skills/${skillName}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input })
    });
    return response.json();
  }
}
```

## 📊 現有 Skills

### 1-learning（學習）

| Skill | 狀態 | 說明 |
|-------|------|------|
| `exam-generator` | WIP | 生成會考考題 |
| `pronunciation-optimizer` | ❌ | （待創建） |
| `listening-generator` | ❌ | （待創建） |

### 2-content（內容）

| Skill | 狀態 | 說明 |
|-------|------|------|
| `article-seo` | ❌ | （待創建） |
| `translation` | ❌ | （待創建） |

### 3-admin（行政）

| Skill | 狀態 | 說明 |
|-------|------|------|
| `skill-qa` | ✅ | 品質檢查工具 |
| `skill-router` | ✅ | 智能路由器 |

## 🎯 下一步

1. **創建更多 Skills**
   - [ ] pronunciation-optimizer
   - [ ] listening-generator
   - [ ] article-seo
   - [ ] translation

2. **集成到 Agent**
   - 改造 Agent 代碼，使用 VocatopiaSkillRouter
   - 測試自動路由功能

3. **API 端點**
   - 為每個 Skill 實現 `/api/skills/<name>/execute` 端點
   - 返回結構化結果

4. **前端集成**
   - 在前端加載 `generated/skills-index.json`
   - 顯示可用 Skills 清單
   - 提供「創建 Skill」表單

## ❓ 常見問題

**Q: 為什麼要用 SKILL.md 而不是 JSON？**  
A: SKILL.md 人類友善，易於版本控制，符合 skills.sh 標準。JSON 由 ingest 自動生成。

**Q: 路由器怎麼判斷用戶意圖？**  
A: 比對 description 中的「觸發詞」，計算相似度，選擇信心度最高的 Skill。

**Q: 可以手動編輯 generated/skills-index.json 嗎？**  
A: 不可以。這個檔案由 `npm run ingest` 自動生成，手動改動會被覆蓋。

**Q: 如何測試新 Skill 的路由？**  
A: 修改 skill-router.ts 的 main 函數，添加測試用例。

## 📚 參考

- [Zynkr SKILL_SPEC](https://github.com/peter-tu-zynkr/zynkr-skill-builder/blob/main/SKILL_SPEC.md)
- [skills.sh](https://skills.sh)
- [Vocatopia SKILL_SPEC](./SKILL_SPEC.md)

---

**問題？建議？** 開 Issue 或聯繫開發團隊。
