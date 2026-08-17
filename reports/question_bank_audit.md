# Vocatopia 題庫逐項稽核報告

產生時間：2026-08-17T02:19:01.844Z

## 範圍與方法

本次只檢查 `server/data/question_bank_*.json` 共 7 份檔案、1764 個作答單元；未檢查模擬試題與 words 翻譯，也未修改任何題庫。
每個作答單元均檢查 schema、選項數、answer 索引、選項標籤、optionsZh 數量、詳解與答案字母一致性；另檢查題幹重複、選項重複、克漏字編號、答案分布、連續答案與英文標點空格。

## 最高優先結論

- 題庫結構、answer 索引範圍、選項數及 optionsZh 數量未發現結構性錯誤。
- 多份題庫疑似在選項重新排序後，沒有同步更新詳解中的答案字母；所有 `EXPLANATION_ANSWER_MISMATCH` 必須逐題修正。
- 克漏字與片語題大量出現英文標點前多餘空格，會直接顯示為 `word ,` 或 `word .`。
- 小型 vocab 題庫的 12 題全部與 vocab_practice 開頭重複；是否會造成實際重題，取決於兩份題庫是否共用抽題池。
- 「100% 正確率」只能作為校對目標；在所有 Error 修正並完成人工語意覆核前，不應宣稱已達 100%。

## 數量與答案分布

| 檔案 | 題組/記錄 | 作答單元 | A | B | C | D |
|---|---:|---:|---:|---:|---:|---:|
| question_bank_cloze.json | 81 | 341 | 96 (28.2%) | 91 (26.7%) | 75 (22%) | 79 (23.2%) |
| question_bank_grammar.json | 312 | 312 | 74 (23.7%) | 86 (27.6%) | 75 (24%) | 77 (24.7%) |
| question_bank_listening.json | 200 | 200 | 59 (29.5%) | 65 (32.5%) | 76 (38%) | 0 (0%) |
| question_bank_phrase.json | 312 | 312 | 68 (21.8%) | 65 (20.8%) | 87 (27.9%) | 92 (29.5%) |
| question_bank_reading.json | 92 | 275 | 73 (26.5%) | 57 (20.7%) | 68 (24.7%) | 77 (28%) |
| question_bank_vocab.json | 12 | 12 | 6 (50%) | 1 (8.3%) | 2 (16.7%) | 3 (25%) |
| question_bank_vocab_practice.json | 312 | 312 | 80 (25.6%) | 77 (24.7%) | 80 (25.6%) | 75 (24%) |

## 發現摘要

- Error：0
- Warning：13

## 詳細發現

- **WARNING · ANSWER_STREAK** — `question_bank_listening.json` / `-` / `file`：相同答案最長連續 13 題（建議少於 8 題）
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_0` / `[0]`：題目與 question_bank_vocab.json / vocab_0 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_1` / `[1]`：題目與 question_bank_vocab.json / vocab_1 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_2` / `[2]`：題目與 question_bank_vocab.json / vocab_2 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_3` / `[3]`：題目與 question_bank_vocab.json / vocab_3 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_4` / `[4]`：題目與 question_bank_vocab.json / vocab_4 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_5` / `[5]`：題目與 question_bank_vocab.json / vocab_5 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_6` / `[6]`：題目與 question_bank_vocab.json / vocab_6 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_7` / `[7]`：題目與 question_bank_vocab.json / vocab_7 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_8` / `[8]`：題目與 question_bank_vocab.json / vocab_8 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_9` / `[9]`：題目與 question_bank_vocab.json / vocab_9 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_10` / `[10]`：題目與 question_bank_vocab.json / vocab_10 重複；若兩份題庫會同時抽題，使用者可能遇到重題
- **WARNING · CROSS_FILE_DUPLICATE** — `question_bank_vocab_practice.json` / `vocab_11` / `[11]`：題目與 question_bank_vocab.json / vocab_11 重複；若兩份題庫會同時抽題，使用者可能遇到重題

## 判讀限制

- 「唯一正解」與題意歧義屬語意判斷；自動規則只能找出重複選項、索引／詳解矛盾及部分高風險候選。
- `optionsZh` 可驗證數量與位置，但逐字翻譯是否精準仍需人工逐題比對。
- 因此「100% 正確率」只能作為校對目標，不能在仍有未修正 Error 或未人工覆核時保證。
