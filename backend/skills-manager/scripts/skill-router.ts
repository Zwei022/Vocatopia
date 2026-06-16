/**
 * Vocatopia 智能路由器
 * 根據用戶輸入自動判斷應該使用哪個 Skill
 * 改寫自 Zynkr 的 /zynkr Skill 邏輯
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SkillDefinition {
  name: string;
  category: 'learning' | 'content' | 'admin';
  sub_category?: string;
  platform: string;
  status: string;
  author: string;
  description: string;
  vocab_level?: string;
  input?: string;
  process?: string;
  output?: string;
  triggers?: string[];  // 觸發詞，從 description 提取
  synergy?: string[];
}

export interface SkillIndex {
  [slug: string]: SkillDefinition;
}

export class VocatopiaSkillRouter {
  private skillIndex: SkillIndex = {};
  private skillsDir: string;

  constructor(skillsDir: string = './skills') {
    this.skillsDir = skillsDir;
    this.loadSkillIndex();
  }

  /**
   * 第 1 步：從所有 SKILL.md 檔案讀取並建立索引
   */
  private loadSkillIndex() {
    const categories = ['1-learning', '2-content', '3-admin'];

    for (const cat of categories) {
      const catPath = path.join(this.skillsDir, cat);
      if (!fs.existsSync(catPath)) continue;

      const dirs = fs.readdirSync(catPath);
      for (const dir of dirs) {
        const skillMdPath = path.join(catPath, dir, 'SKILL.md');
        if (fs.existsSync(skillMdPath)) {
          const skill = this.parseSKILLmd(skillMdPath);
          if (skill) {
            this.skillIndex[skill.name] = skill;
          }
        }
      }
    }

    console.log(`✅ 已加載 ${Object.keys(this.skillIndex).length} 個 Skills`);
  }

  /**
   * 第 1.5 步：解析 SKILL.md 檔案
   */
  private parseSKILLmd(filePath: string): SkillDefinition | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // 提取 Frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        console.warn(`⚠️ ${filePath} 缺少 Frontmatter`);
        return null;
      }

      const frontmatterStr = frontmatterMatch[1];
      const skill = this.parseFrontmatter(frontmatterStr);

      // 從 description 提取觸發詞
      if (skill.description) {
        skill.triggers = this.extractTriggers(skill.description);
      }

      return skill;
    } catch (error) {
      console.error(`❌ 解析 ${filePath} 失敗:`, error);
      return null;
    }
  }

  /**
   * 簡單的 YAML 解析（用來解析 Frontmatter）
   * 支援多行 description（以 | 開頭）
   */
  private parseFrontmatter(yaml: string): SkillDefinition {
    const skill: any = {};
    const lines = yaml.split('\n');
    let inMultiline = false;
    let multilineKey = '';
    let multilineValue = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 檢查是否進入多行模式
      if (line.includes(': |') || line.includes(': |-')) {
        inMultiline = true;
        const keyMatch = line.match(/^(\w+):\s*\|/);
        if (keyMatch) {
          multilineKey = keyMatch[1];
          multilineValue = '';
        }
        continue;
      }

      // 如果在多行模式中
      if (inMultiline) {
        // 檢查是否結束多行（下一行是新的 key 或沒有縮進）
        if (line && !line.startsWith('  ') && line.includes(':')) {
          skill[multilineKey] = multilineValue.trim();
          inMultiline = false;
          // 處理這一行作為新的 key-value
          const match = line.match(/^(\w+):\s*(.*)$/);
          if (match) {
            const [, key, value] = match;
            skill[key] = value.trim();
          }
        } else {
          // 累積多行內容
          multilineValue += line.slice(2) + '\n';
        }
      } else {
        // 單行 key-value
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          if (value.startsWith('"') || value.startsWith("'")) {
            skill[key] = value.slice(1, -1);
          } else if (value === 'true') {
            skill[key] = true;
          } else if (value === 'false') {
            skill[key] = false;
          } else if (value) {
            skill[key] = value;
          }
        }
      }
    }

    // 如果最後還在多行模式
    if (inMultiline && multilineValue) {
      skill[multilineKey] = multilineValue.trim();
    }

    return skill as SkillDefinition;
  }

  /**
   * 從 description 提取觸發詞
   * 格式：觸發詞: ... - 詞1 - 詞2 ... 或 Triggers: ... - word1 - word2
   */
  private extractTriggers(description: string): string[] {
    const triggers: string[] = [];

    // 查找「觸發詞」或「Triggers」部分
    const triggerSection = description.match(
      /(?:觸發詞|triggers?)\s*[:\：]\s*([\s\S]*?)(?=(?:何時|when|$))/i
    );

    if (triggerSection && triggerSection[1]) {
      // 提取 - 開頭或 • 開頭或 * 開頭的項目
      const items = triggerSection[1].match(/[-•*]\s*([^\n-•*]+)/g);
      if (items) {
        for (const item of items) {
          let trigger = item.replace(/^[-•*]\s*/, '').trim();
          // 移除中文引號
          trigger = trigger.replace(/[「」]/g, '').trim();
          // 移除英文引號
          trigger = trigger.replace(/[""'"]/g, '').trim();
          if (trigger && trigger.length > 0) {
            triggers.push(trigger.toLowerCase());
          }
        }
      }
    }

    return triggers;
  }

  /**
   * 第 2 步：分類用戶輸入類型
   * 模仿 Zynkr /zynkr 的 Step 1
   */
  detectInputType(userInput: string): {
    type: 'skill-request' | 'status-query' | 'qa-request' | 'unclassified';
    confidence: 'high' | 'medium' | 'low';
    hint?: string;
  } {
    const input = userInput.toLowerCase();

    // QA 相關
    if (input.includes('qa') || input.includes('健檢') || input.includes('檢查')) {
      return { type: 'qa-request', confidence: 'high' };
    }

    // 狀態查詢
    if (input.match(/(?:什麼|what).*(?:隊列|queue|進度|status)/)) {
      return { type: 'status-query', confidence: 'high' };
    }

    // Skill 請求
    if (userInput.length > 5) {
      return { type: 'skill-request', confidence: 'medium' };
    }

    return { type: 'unclassified', confidence: 'low' };
  }

  /**
   * 第 3 步：判斷使用者意圖
   * 比對 Skills 的觸發詞（支援中文和英文）
   */
  detectIntent(userInput: string): {
    skillName: string | null;
    confidence: 'high' | 'medium' | 'low';
    candidates: Array<{ name: string; confidence: number }>;
  } {
    // 中文不需要轉小寫，英文部分轉小寫
    const inputLower = userInput.toLowerCase();
    const scores: { name: string; score: number }[] = [];

    // 掃描所有 Skills
    for (const [name, skill] of Object.entries(this.skillIndex)) {
      let score = 0;

      // 比對觸發詞
      if (skill.triggers && skill.triggers.length > 0) {
        for (const trigger of skill.triggers) {
          const triggerLower = trigger.toLowerCase();
          // 完全匹配
          if (inputLower === triggerLower) {
            score += 20;
          }
          // 包含匹配（中文或英文都支援）
          else if (userInput.includes(trigger) || inputLower.includes(triggerLower)) {
            score += 10;
          }
          // 部分匹配（至少 50% 的字符匹配）
          else if (this.calculateSimilarity(userInput, trigger) > 0.5) {
            score += 5;
          }
        }
      }

      // 比對 category（模糊匹配）
      if (inputLower.includes(skill.category)) {
        score += 3;
      }

      // 比對 name
      if (inputLower.includes(name.replace(/-/g, ' '))) {
        score += 5;
      }

      if (score > 0) {
        scores.push({ name, score });
      }
    }

    // 排序
    scores.sort((a, b) => b.score - a.score);

    const topMatch = scores[0];
    if (!topMatch) {
      return {
        skillName: null,
        confidence: 'low',
        candidates: []
      };
    }

    // 判斷信心度
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (topMatch.score >= 10) {
      confidence = 'high';
    } else if (topMatch.score >= 5) {
      confidence = 'medium';
    }

    return {
      skillName: topMatch.name,
      confidence,
      candidates: scores.slice(0, 3).map(s => ({
        name: s.name,
        confidence: s.score / topMatch.score  // 相對分數
      }))
    };
  }

  /**
   * 計算兩個字符串的相似度（用於模糊匹配）
   */
  private calculateSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein 距離（編輯距離）
   */
  private levenshteinDistance(a: string, b: string): number {
    const distances: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      distances[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
      distances[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          distances[i][j] = distances[i - 1][j - 1];
        } else {
          distances[i][j] = Math.min(
            distances[i - 1][j - 1] + 1,
            distances[i][j - 1] + 1,
            distances[i - 1][j] + 1
          );
        }
      }
    }

    return distances[a.length][b.length];
  }

  /**
   * 第 4 步：根據信心度決定動作
   */
  async route(userInput: string): Promise<{
    action: 'auto-invoke' | 'ask' | 'unknown';
    skillName?: string;
    clarifyingQuestion?: string;
    reason: string;
  }> {
    const inputType = this.detectInputType(userInput);
    const intent = this.detectIntent(userInput);

    console.log(`\n📍 輸入類型: ${inputType.type} (信心: ${inputType.confidence})`);
    console.log(`🎯 意圖偵測: ${intent.skillName || 'unknown'} (信心: ${intent.confidence})`);
    console.log(`候選: ${intent.candidates.map(c => `${c.name}`).join(', ')}`);

    // 高信心 → 自動呼叫
    if (intent.confidence === 'high' && intent.skillName) {
      return {
        action: 'auto-invoke',
        skillName: intent.skillName,
        reason: `檢測到高信心度意圖: 用戶要 ${intent.skillName}`
      };
    }

    // 中信心 → 詢問
    if (intent.confidence === 'medium' && intent.candidates.length > 0) {
      const options = intent.candidates
        .slice(0, 3)
        .map(c => `${c.name}`)
        .join('、');

      return {
        action: 'ask',
        clarifyingQuestion: `我偵測到可能是 ${options}。你想用哪一個？`,
        reason: '意圖不明確，需要用戶澄清'
      };
    }

    // 低信心 → 無法判斷
    return {
      action: 'unknown',
      reason: '無法判斷你的意圖。請說得更具體，例如「生成考題」或「優化發音」'
    };
  }

  /**
   * 取得 Skill 詳細資料
   */
  getSkill(skillName: string): SkillDefinition | null {
    return this.skillIndex[skillName] || null;
  }

  /**
   * 列出所有 Skills
   */
  listSkills(category?: 'learning' | 'content' | 'admin'): SkillDefinition[] {
    return Object.values(this.skillIndex).filter(
      skill => !category || skill.category === category
    );
  }

  /**
   * 匯出 Skills 索引為 JSON
   * 用來供前端消費
   */
  exportIndex(outputPath: string) {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(this.skillIndex, null, 2),
      'utf-8'
    );
    console.log(`✅ Skills 索引已匯出到 ${outputPath}`);
  }
}

// 使用範例
if (require.main === module) {
  const router = new VocatopiaSkillRouter('./skills');

  // Debug: 列出加載的 Skills
  console.log('📚 加載的 Skills:');
  const allSkills = router.listSkills();
  for (const skill of allSkills) {
    console.log(`  - ${skill.name}: triggers = [${(skill.triggers || []).join(', ')}]`);
  }
  console.log('');

  // 測試 1: 高信心度觸發
  (async () => {
    console.log('=== 測試 1: 生成考題 ===');
    const intent1 = router.detectIntent('我想生成一份會考試卷');
    console.log('Intent 檢測:', intent1);
    const result1 = await router.route('我想生成一份會考試卷');
    console.log('Route 結果:', result1);

    console.log('\n=== 測試 2: 發音檢查 ===');
    const intent2 = router.detectIntent('幫我檢查這個單字的發音');
    console.log('Intent 檢測:', intent2);
    const result2 = await router.route('幫我檢查這個單字的發音');
    console.log('Route 結果:', result2);

    console.log('\n=== 測試 3: 直接說生成考題 ===');
    const intent3 = router.detectIntent('生成考題');
    console.log('Intent 檢測:', intent3);
    const result3 = await router.route('生成考題');
    console.log('Route 結果:', result3);

    // 匯出索引
    router.exportIndex('./generated/skills-index.json');
  })();
}

export default VocatopiaSkillRouter;
