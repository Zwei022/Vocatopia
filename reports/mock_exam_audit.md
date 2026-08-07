# Vocatopia 模擬試題逐項稽核報告

稽核日期：2026-08-07  
範圍：`server/data/gsat_sim_2023_reading_1.json` 至 `gsat_sim_2023_reading_10.json`  
依據：`exam-question-generator` Skill、`docs/mock_exam_difficulty_spec.md`  
限制：本輪只稽核，不修改題庫檔案；不包含每日題庫與 `words`。

## 結論

- 10 份 JSON 全部可解析，共 430 題。
- 所有試卷皆為第 1–43 題且無缺號、跳號或重號。
- 每題皆有 4 個英文選項、4 個對位中文選項、合法的 0-based `answer` 與詳解。
- 所有完形填空的空格編號均與題號一致。
- 未發現完全重複的題目、選項組合或文章。
- 未確認到唯一正解、答案索引、文章依據或選項中譯對位的實質錯誤。
- 主要缺漏是 20 篇一般閱讀文章不符合規格要求的 230–245 字，以及第 1 回的題組結構與其餘九回不一致。

因此，目前內容正確性可通過本輪稽核，但尚不能宣稱「完全符合模擬試題規格」。修正篇幅時必須重新校對受影響文章與題目，避免改文後破壞答案依據。

## 全量結構檢查

| 試卷 | 題數 | 題組數 | A/B/C/D 答案數 | JSON / schema | 重複 |
|---|---:|---:|---:|---|---|
| reading_1 | 43 | 8 | 11/11/11/10 | 通過 | 無 |
| reading_2 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_3 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_4 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_5 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_6 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_7 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_8 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_9 | 43 | 7 | 11/11/11/10 | 通過 | 無 |
| reading_10 | 43 | 7 | 11/11/11/10 | 通過 | 無 |

答案位置非常平均，沒有 A 選項偏誤。所有選項陣列內也未發現完全相同的重複選項。

## 必須處理：篇幅不符合規格

規格要求一般 narrative / informational 文章約 230–245 個英文單字。以下 20 篇超出範圍：

| 試卷 | 題號 | 類型 | 字數 | 標題 |
|---|---:|---|---:|---|
| reading_1 | 22–23 | narrative | 249 | The Lost Wallet |
| reading_1 | 24–26 | informational | 203 | Why Do Leaves Change Color? |
| reading_1 | 27–28 | narrative | 202 | A Weekend Job? |
| reading_2 | 28–30 | narrative | 223 | An Old Friend Returns |
| reading_2 | 31–34 | informational | 220 | The Story of Paper |
| reading_3 | 31–34 | informational | 229 | The Surprising History of the Umbrella |
| reading_4 | 22–24 | narrative | 224 | A Night on the Mountain Trail |
| reading_4 | 25–27 | informational | 221 | How Are Bridges Built? |
| reading_4 | 28–30 | narrative | 182 | A Talk Before the Concert |
| reading_4 | 31–34 | informational | 224 | Beneath the Surface: The Secret Life of Coral Reefs |
| reading_5 | 22–24 | narrative | 252 | First Day at the Bakery |
| reading_5 | 25–27 | informational | 221 | How Volcanoes Form |
| reading_5 | 31–34 | informational | 223 | A Sweet History: The Story of Chocolate |
| reading_6 | 25–28 | informational | 218 | Why Do Some Animals Travel So Far? |
| reading_7 | 22–24 | narrative | 263 | The Woman Next Door |
| reading_7 | 25–27 | informational | 229 | How Does a Rainbow Form? |
| reading_7 | 28–30 | narrative | 225 | Looking Down Without Fear |
| reading_8 | 28–30 | narrative | 227 | My First Real Meal |
| reading_10 | 25–27 | informational | 223 | Why Is the Sky Blue? |
| reading_10 | 28–30 | narrative | 292 | Finding My Way: A Conversation on the First Day |

最嚴重的是 reading_4 題 28–30（182 字）與 reading_10 題 28–30（292 字）。

## 題組結構差異

`reading_2`–`reading_10` 均為 7 個題組：1 practical、2 narrative、2 informational、1 dual、1 cloze。

`reading_1` 則有 8 個題組：1 practical、2 narrative、3 informational、1 dual、1 cloze。題數仍為 43，功能上沒有錯誤，但和其餘九回及規格的固定模版不一致。若產品要求各回結構等值，應重整第 1 回；若允許題組數浮動，則需在規格文件明確記錄例外。

## 容易被自動規則誤報、但人工核對後正確

- reading_4 Q21：`answer: 3`（D）正確。詳解先說「故(A)錯」再於結尾說「故選(D)」，不是答案索引衝突。
- reading_9 Q34：`answer: 2`（C）正確。題目問 NOT mentioned，詳解中的「(A) 有提及」不是答案宣告。
- reading_10 Q20：`answer: 1`（B）正確。週末不能用家庭套票，分開購票是可看週六 Tiger Show 的最低可行價格。
- reading_10 Q21：`answer: 0`（A）正確。詳解先排除 C/B/D，最後才選 A。

## 逐項稽核準則與結果

- JSON/schema：通過；頂層欄位、sections、items/passages/questions 均可遍歷。
- 題號：通過；每份恰為 1–43。
- 唯一正解：通過；未發現兩個選項同時符合或正解缺失。
- answer index：通過；皆為 0–3，且與正解選項一致。
- 選項：通過；每題四項、無完全重複，文法與語意可區辨。
- 詳解：通過；每題均有詳解，且能指出文法規則、上下文或文章證據。
- 文章依據：通過；閱讀題答案均可由文章或題面資訊推出。
- 翻譯對位：通過；`optionsZh[0..3]` 與英文 `options[0..3]` 順序一致，未見正反義倒置。
- 題組結構：資料有效；第 1 回有一項規格一致性問題，詳見上節。
- 重複：通過；跨 10 回未發現完全重複題目或文章。
- 歧義：未發現會導致多重正解的實質歧義。

## 建議修正順序

1. 先決定第 1 回是否必須統一成 7 題組。
2. 將 20 篇超出範圍的一般閱讀調整至 230–245 字；只補充或刪減不影響答案的背景句。
3. 每篇修改後重新做「文章證據 → 正解 → 詳解 → optionsZh」四向核對。
4. 修正完成後再執行一次 430 題全量 schema、題號、答案與重複檢查。
