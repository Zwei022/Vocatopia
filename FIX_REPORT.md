# Vocatopia 資料修正報告

修正依據：專案根目錄 `AUDIT_REPORT.md` 與本次重新讀取的現行資料。  
原則：只有現況與報告相符的項目才修改；未自動 commit 或 push。

## 1. 單字資料庫整組錯置與字頭／中文字形／詞性

- 實際修正：
  - 4 筆整組錯置資料：`Chinese New Year`、`Christmas Eve`、`class leader`、`Rome` 的詞義、繁中解釋、詞性、英文例句、中文例句與 IPA 已改回各自內容。
  - 12 筆字頭格式：`runny nose`、`ping-pong`、`overweight`、`underweight`、`tablecloth`、`babysitter`、`milkshake`、`soy sauce`、`Teachers' Day`、`both ... and ...`、`either ... or ...`、`neither ... nor ...`。
  - 4 筆中文字形：`crime`、`embarrass`、`sincere` 的「爲」改為「為」；`poor` 的「据」改為「據」。
  - 4 筆詞性：`hey`、`oh-oh`、`uh-uh` 改為「感嘆詞」；`ma'am` 改為「名詞」。
  - 同步更新 `target_2000_words.json` 中上述 12 個字頭，避免目標字表與快取失去對應。
- 已核對但未修改：
  - `choice`、`roof` 現有內容正確。
  - `plump`、`masterpiece` 沒有獨立字頭，因此沒有另一筆被交換後的錯誤資料可修。
- 跳過：
  - `ld` 未更名。現有詞義、例句與來源脈絡一致指向 LaserDisc（雷射光碟）縮寫，沒有足夠證據判定為其他字的誤植；已補上字母讀音 `/ˌelˈdiː/`。
- 修改檔案：
  - `supabase/words_cache.json`
  - `target_2000_words.json`

## 2. IPA

- 實際修正：145 筆。
  - 141 筆空字串已補上 IPA。
  - 4 筆方括號格式（`better`、`children`、`typewriter`、`uh-uh`）已改為 `/ /`，並統一為美式 IPA。
- 採用標準：Cambridge Dictionary 的 US pronunciation 與 IPA 符號規則；字典沒有獨立收錄的組合詞，以同一來源的美式詞素讀音組合，沒有混用英式音標。
- 驗證結果：空白 IPA 0 筆；非 `/ /` 外框 0 筆；必要欄位缺漏 0 筆。
- 跳過：無。
- 修改檔案：
  - `supabase/words_cache.json`
- 來源：
  - https://dictionary.cambridge.org/us/help/phonetics
  - https://dictionary.cambridge.org/pronunciation/

## 3. definition 欄位語言

- 實際修正：292 筆。
- 修正方式：僅處理報告指出、現況仍為英文且 `definition_zh` 已有繁體中文的資料；將 `definition` 改為對應繁中內容，沒有改動英文例句與答案資料。
- 驗證結果：報告所列 292 筆英文 `definition` 已清除。
- 跳過：無。
- 修改檔案：
  - `supabase/words_cache.json`

## 4. 文法教學內容

- 實際修正：15 個問題單元。
  - 2 個作答單元：第 6 章 `6-1` 克漏字第 2 空改指向 `is`；第 17 章 `17-2` MC 第 4 題改成唯一正解 `Because of`，並同步修正題幹、選項中譯與詳解。
  - 13 個教學問題：時態不必一律一致、`lose/decide` 可用進行式、`before long` 可用於過去敘事、`buy/open/arrive/finish` 可用進行式、`while` 不一定接進行式、`Mary has ... now`、`fish` 複數、`unless` 中譯、附加問句三項規則、祈使句呼格、`can keep` 述語、`there be` 特定名詞例外、假設語氣 `were/was` 語域說明。
- 驗證結果：報告列出的舊錯誤文字均已不存在；兩題答案 index 與選項、詳解一致。
- 跳過：無。
- 修改檔案：
  - `server/data/grammar_lessons.json`

## 5. 2026 會考聽力逐字稿（Q13–21）

- 實際修正：9 題。
- 音檔狀態：Q13–21 的 9 個 MP3 全部存在，沒有缺音檔。
- 修正方式：先從本機音檔逐題轉寫，再與公開的 115 年會考聽力稿交叉校正；保留完整對話／獨白，移除原本以括號摘要內容的寫法。格式沿用專案 2023–2025 年資料，只收錄題幹前的完整聽力內容，不重複收錄第二次播放。
- 驗證結果：Q13–21 均不再含 `(Q)` 摘要標記；每題逐字稿均為完整句子。
- 跳過：無。
- 修改檔案：
  - `server/data/gsat_exam_2026_listening.json`
- 交叉校正來源：
  - https://public.ehanlin.com.tw/pre-exam/cap/115%E6%9C%83%E8%80%83%E8%8B%B1%E8%81%BD%E8%A7%A3%E6%9E%90.pdf

## 6. 模擬試題篇幅

- 實際修正：20 篇。
- 規格：依 `AUDIT_REPORT.md` 統一為 230–245 個英文字。
- 修正後範圍：最短 230 字，最長 245 字；20 篇全部合格。
- 修改原則：只增刪不影響既有作答依據的背景或銜接內容；沒有修改任何題目的 `answer`、選項、選項中譯或詳解。
- 跳過：無。
- 修改檔案：
  - `server/data/gsat_sim_2023_reading_1.json`
  - `server/data/gsat_sim_2023_reading_2.json`
  - `server/data/gsat_sim_2023_reading_3.json`
  - `server/data/gsat_sim_2023_reading_4.json`
  - `server/data/gsat_sim_2023_reading_5.json`
  - `server/data/gsat_sim_2023_reading_6.json`
  - `server/data/gsat_sim_2023_reading_7.json`
  - `server/data/gsat_sim_2023_reading_8.json`
  - `server/data/gsat_sim_2023_reading_10.json`

## 最終驗證

- 專案測試：通過（Tetris engine 47/47；Node test 3/3；題庫稽核程式可完成執行）。
- 本次涉及的 JSON：全部可解析。
- 單字必要欄位：無缺漏；空白 IPA 0；IPA 外框錯誤 0。
- 20 篇模擬文章：全部 230–245 字。
- 受保護的三份題庫檔案在本次修正前後 SHA-256 完全一致，未被本次工作改動：
  - `question_bank_vocab_practice.json`：`EB49FA2DC71E3C27DF7F923CF320F5B8E0CF49E703097E68F1D7BB6F21DCD971`
  - `question_bank_phrase.json`：`3AC9C14768C8BC71C4572A043914B2DA9E75D311375D78225280E5A960370B76`
  - `question_bank_reading.json`：`5D4483718E61BC87433F6C407A7BEFE8A9A3B2437F92D178103E1EBEE639AF5B`
- 未執行 commit 或 push。
