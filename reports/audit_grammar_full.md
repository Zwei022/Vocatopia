# grammar_lessons.json 全面審查報告

> 僅讀取 `server/data/grammar_lessons.json`，未修改原始資料。產生時間：2026-08-07T07:19:04.146Z

## 範圍與方法

- 20 章、92 個子課程、1402 個作答單元。
- 先獨立重跑 JSON、欄位、答案 index、options/optionsZh 長度、optionsZh 正解標記、重複題目與重複選項檢查。
- 再依原檔順序每批約 100 題複核答案、詳解、選項翻譯、克漏文意及會考難度。
- 覆蓋紀錄：批次 1：作答單元 1–100（已複核）；批次 2：作答單元 101–200（已複核）；批次 3：作答單元 201–300（已複核）；批次 4：作答單元 301–400（已複核）；批次 5：作答單元 401–500（已複核）；批次 6：作答單元 501–600（已複核）；批次 7：作答單元 601–700（已複核）；批次 8：作答單元 701–800（已複核）；批次 9：作答單元 801–900（已複核）；批次 10：作答單元 901–1000（已複核）；批次 11：作答單元 1001–1100（已複核）；批次 12：作答單元 1101–1200（已複核）；批次 13：作答單元 1201–1300（已複核）；批次 14：作答單元 1301–1400（已複核）；批次 15：作答單元 1401–1402（已複核）。

## 統計

| 項目 | 數量 |
|---|---:|
| 章節 | 20 |
| 作答單元 | 1402 |
| 結構／答案 index／optionsZh 數量錯誤 | 0 |
| 高嚴重度 | 6 |
| 中嚴重度 | 4 |
| 低嚴重度 | 0 |

## 完整問題清單

| 位置 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| `$.6.subLessons[0].quiz.cloze.blanks[1]` | 答案錯誤／optionsZh 與答案矛盾 | 題幹為 There ___ a lot of food...；answer=3 指向 (D) are，但詳解與 optionsZh 均判定 (B) is | 將 answer 改為 1（0-based，選項 B: is）；food 為不可數名詞，There is a lot of food | 高 |
| `$.9.subLessons[2].quiz.mc[0]` | 重複題目 | she sings ___ than her sister. | 與 $.8.subLessons[1].quiz.mc[1] 重複；確認是否刻意複習 | 中 |
| `$.14.subLessons[2].quiz.mc[3]` | 重複題目 | dave: have you ever ___ the movie titanic? chris: yes, i've seen it once. | 與 $.14.subLessons[1].quiz.mc[8] 重複；確認是否刻意複習 | 中 |
| `$.15.subLessons[3].quiz.mc[9]` | 重複題目 | which sentence is correct? | 與 $.15.subLessons[0].quiz.mc[9] 重複；確認是否刻意複習 | 中 |
| `$.17.subLessons[1].quiz.mc[3]` | 重複選項 | ["(A) Because","(B) Since","(C) Because","(D) Because"] | 每個選項應互異，並讓正解文字實際存在 | 高 |
| `$.1.subLessons[0].teaching.explanation` | 錯誤文法規則 | 宣稱 because／since 等附屬連接詞前後子句時態基本上要一致 | 時態由各動作實際時間關係決定；because／since 本身不要求同時態 | 高 |
| `$.1.subLessons[1].teaching.explanation` | 錯誤文法規則 | 把 lose、decide 列為不能使用進行式的狀態動詞 | 兩者可用進行式，例如 I am losing hope / We are deciding what to do | 高 |
| `$.2.subLessons[0].teaching.explanation` | 錯誤文法規則 | 宣稱 buy、open、arrive、finish 等瞬間動作沒有進行式，且 while 子句一定用進行式 | 這些動詞可用進行式；while 也可接一般式，應依語意判斷 | 高 |
| `$.1.subLessons[1].teaching.explanation` | 過度絕對化 | 宣稱 before long 只指向未來 | before long 可搭配過去或未來，表示「不久之後」 | 中 |
| `$.15.subLessons[1].teaching.explanation` | 錯誤／高風險規則 | 把 I said 與 I think／I believe 一併說成附加問句依受詞子句 | 轉移附加問句主要適用第一人稱現在式 think/believe/suppose；I said 通常不照搬 | 高 |

## 審查結論

- 其餘作答單元未發現可明確判定的答案、optionsZh 或詳解矛盾。
- 難度整體落在國中會考文法範圍；少數教學段落延伸到較細的語法例外，但不構成明顯超綱題。
- 本報告把「可客觀證明錯誤」與「可能是刻意跨章複習的重複題」分開：重複題列中等，不直接判成答案錯誤。

## 方法限制

- 本輪可檢查文字內容，但沒有外部官方逐題答案檔可作第三方比對；判定依標準英文文法與題目上下文。
- 自動檢查能完整找出結構、索引及明示矛盾；語意複核仍可能遇到兩個選項在特殊語境皆可成立的情況，因此修正後應再做一次回歸檢查。
