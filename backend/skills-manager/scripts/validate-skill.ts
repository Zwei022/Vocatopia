/**
 * Vocatopia SKILL.md 驗證工具
 * 改寫自 Zynkr 的 validate-skill.ts
 *
 * 執行: npm run validate [skill-path]
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  pass: boolean;
  errors: Finding[];
  warnings: Finding[];
  infos: Finding[];
}

interface Finding {
  check: string;
  tier: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  file: string;
  line?: number;
  fixable?: boolean;
  suggestion?: string;
}

class SkillValidator {
  private file: string;
  private content: string;
  private frontmatter: Map<string, any>;

  constructor(filePath: string) {
    this.file = filePath;
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ 檔案不存在: ${filePath}`);
    }
    this.content = fs.readFileSync(filePath, 'utf-8');
    this.frontmatter = this.extractFrontmatter();
  }

  /**
   * 提取 YAML Frontmatter
   */
  private extractFrontmatter(): Map<string, any> {
    const match = this.content.match(/^---\n([\s\S]*?)\n---/);
    const result = new Map();

    if (!match) {
      return result;
    }

    const yaml = match[1];
    const lines = yaml.split('\n');

    for (const line of lines) {
      const keyMatch = line.match(/^(\w+):\s*(.*)$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;
        result.set(key, value.trim());
      }
    }

    return result;
  }

  /**
   * 執行所有驗證檢查
   */
  validate(): ValidationResult {
    const errors: Finding[] = [];
    const warnings: Finding[] = [];
    const infos: Finding[] = [];

    // 必填欄位檢查
    const required = ['name', 'category', 'platform', 'status', 'author'];
    for (const field of required) {
      if (!this.frontmatter.has(field) || !this.frontmatter.get(field)) {
        errors.push({
          check: 'frontmatter.required',
          tier: 'ERROR',
          message: `缺少必填欄位: ${field}`,
          file: this.file
        });
      }
    }

    // Name 格式檢查
    const name = this.frontmatter.get('name');
    if (name && !/^[a-z0-9-]+$/.test(name)) {
      errors.push({
        check: 'frontmatter.name_format',
        tier: 'ERROR',
        message: `name 必須是小寫 kebab-case: ${name}`,
        file: this.file,
        fixable: true,
        suggestion: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      });
    }

    // Category 檢查
    const category = this.frontmatter.get('category');
    const validCategories = ['learning', 'content', 'admin'];
    if (category && !validCategories.includes(category)) {
      errors.push({
        check: 'frontmatter.category',
        tier: 'ERROR',
        message: `category 必須是: ${validCategories.join(', ')}，但收到: ${category}`,
        file: this.file
      });
    }

    // Status 檢查
    const status = this.frontmatter.get('status');
    const validStatus = ['Done', 'WIP', 'Not started', 'Paused', 'Outdated'];
    if (status && !validStatus.includes(status)) {
      warnings.push({
        check: 'frontmatter.status',
        tier: 'WARN',
        message: `status 建議值: ${validStatus.join(', ')}`,
        file: this.file
      });
    }

    // H1 檢查
    const h1Match = this.content.match(/^#\s+([^\n]+)/m);
    if (!h1Match) {
      errors.push({
        check: 'body.h1_present',
        tier: 'ERROR',
        message: '缺少 H1 標題',
        file: this.file
      });
    } else if (name && !h1Match[1].toLowerCase().includes(name.replace(/-/g, ' '))) {
      warnings.push({
        check: 'body.h1_matches_name',
        tier: 'WARN',
        message: `H1 標題 "${h1Match[1]}" 與 name "${name}" 不符`,
        file: this.file
      });
    }

    // Install snippet 檢查
    const installMatch = this.content.match(/```bash\nnpx skills add.*?\n```/);
    if (!installMatch) {
      errors.push({
        check: 'body.install_snippet',
        tier: 'ERROR',
        message: '缺少 install snippet (bash code block with npx skills add)',
        file: this.file,
        fixable: true
      });
    } else if (name && !installMatch[0].includes(`--skill ${name}`)) {
      warnings.push({
        check: 'body.install_snippet_slug',
        tier: 'WARN',
        message: `install snippet 的 --skill 參數應該是 "${name}"`,
        file: this.file,
        fixable: true
      });
    }

    // Description 檢查
    const description = this.frontmatter.get('description');
    if (!description) {
      warnings.push({
        check: 'frontmatter.description',
        tier: 'WARN',
        message: '建議新增 description 欄位（幫助 AI 判斷何時觸發）',
        file: this.file
      });
    } else if (description.length < 20) {
      warnings.push({
        check: 'frontmatter.description_length',
        tier: 'WARN',
        message: 'description 太短（建議 20+ 字元）',
        file: this.file
      });
    }

    // 觸發詞檢查
    if (description && !description.includes('觸發') && !description.includes('trigger')) {
      warnings.push({
        check: 'frontmatter.triggers_missing',
        tier: 'WARN',
        message: 'description 中未找到「觸發詞」或「triggers」',
        file: this.file
      });
    }

    // 相對路徑檢查
    const absolutePaths = this.content.match(/[A-Z]:\\|\/Users\/|\/home\/|\/root\//g);
    if (absolutePaths) {
      errors.push({
        check: 'paths.absolute_path',
        tier: 'ERROR',
        message: `檢測到絕對路徑: ${absolutePaths.join(', ')}`,
        file: this.file,
        suggestion: '使用相對路徑，如 ./references/guide.md'
      });
    }

    // 空檔案檢查
    if (this.content.trim().length < 100) {
      errors.push({
        check: 'body.content_length',
        tier: 'ERROR',
        message: '檔案內容太短（應該至少 100 字元）',
        file: this.file
      });
    }

    // Vocab level 檢查
    const vocabLevel = this.frontmatter.get('vocab_level');
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', '會考'];
    if (vocabLevel && !validLevels.includes(vocabLevel)) {
      warnings.push({
        check: 'frontmatter.vocab_level',
        tier: 'WARN',
        message: `vocab_level 建議值: ${validLevels.join(', ')}`,
        file: this.file
      });
    }

    // 可下載檢查（只有 INFO）
    if (this.frontmatter.has('download_url')) {
      infos.push({
        check: 'metadata.downloadable',
        tier: 'INFO',
        message: '此 Skill 已標記為可下載',
        file: this.file
      });
    }

    return {
      pass: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }

  /**
   * 格式化驗證結果
   */
  formatResults(results: ValidationResult): string {
    let output = '';

    // 標題
    const verdict = results.pass ? '✅ PASS' : '❌ FAIL';
    output += `${verdict} — ${results.errors.length} errors, ${results.warnings.length} warnings\n\n`;

    // 錯誤
    if (results.errors.length > 0) {
      output += '❌ **ERRORS (Blocking)**\n';
      for (const error of results.errors) {
        output += `  - ${error.check}: ${error.message}\n`;
        if (error.suggestion) {
          output += `    💡 ${error.suggestion}\n`;
        }
      }
      output += '\n';
    }

    // 警告
    if (results.warnings.length > 0) {
      output += '⚠️ **WARNINGS (Advisory)**\n';
      for (const warning of results.warnings) {
        output += `  - ${warning.check}: ${warning.message}\n`;
        if (warning.suggestion) {
          output += `    💡 ${warning.suggestion}\n`;
        }
      }
      output += '\n';
    }

    // 提示
    if (results.infos.length > 0) {
      output += 'ℹ️ **INFO**\n';
      for (const info of results.infos) {
        output += `  - ${info.message}\n`;
      }
      output += '\n';
    }

    return output;
  }
}

// 主函數
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ 用法: npm run validate <skill-path>');
    console.error('範例: npm run validate skills/1-learning/exam-generator/SKILL.md');
    process.exit(1);
  }

  try {
    const validator = new SkillValidator(filePath);
    const results = validator.validate();
    const formatted = validator.formatResults(results);

    console.log(formatted);
    process.exit(results.pass ? 0 : 1);
  } catch (error) {
    console.error(`❌ 驗證失敗:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { SkillValidator, ValidationResult, Finding };
