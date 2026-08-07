# Vocatopia 全面資料正確性審查報告

> 審查日期：2026-08-07  
> 專案：`C:\Users\qaz10\Desktop\Vocatopia`  
> 模式：只讀審查。本輪未覆寫任何單字、題庫、真題、模擬題或文法資料。

## 執行摘要

本次先以程式完整掃描 JSON、schema、必要欄位、答案邊界、重複 ID、中文字形、IPA 外框、`done`、目標字集合與例句字頭，再把大量資料切成每批約 100 筆進行語意複核。

| 類別 | 覆蓋範圍 | 主要結果 |
|---|---:|---|
| 核心單字 | 1,994 個目標字，20 批 | 缺字 0；快取另含 1,320 個非目標字；6 個高嚴重問題；141 筆缺 IPA；292 筆 definition 為英文 |
| 六份題庫 | 1,632 個作答單元，20 批 | **133 題目前 answer 指向語意錯誤選項**；其餘 schema、ID、optionsZh 數量通過 |
| 歷屆＋模擬 | 18 檔、686 題，7 批 | 檔內未確認到正解錯誤；2026 聽力 Q13–21 不是實際逐字稿；20 篇模擬文章篇幅不符規格 |
| 文法教材 | 20 章、92 子課、1,402 個作答單元，15 批 | 1 題答案錯、1 題有三個相同正解、至少 9 項錯誤／高風險教學內容 |

### 最高優先處理順序

1. 六份題庫中的 133 題答案錯誤。這些錯誤與目前工作目錄相對 Git 基準版的 answer 變更一致；題意與詳解支持基準版答案。
2. 單字庫 4 筆整組資料錯置：`Chinese New Year`、`Christmas Eve`、`class leader`、`Rome`，以及錯誤字頭 `ld`、`running nose`。
3. 文法教材的確定答案錯誤、正解不存在，以及錯誤教學規則。
4. 2026 聽力 Q13–21 的摘要型 transcript，不能當真正逐字稿呈現。
5. 補齊 141 筆 IPA，並決定快取中 1,320 個非核心字是否移出權威核心字庫。

## 方法、可信度與限制

- 結構檢查可完整覆蓋機械性問題；語意部分依固定順序分批核對，沒有用抽樣結果冒充全量結果。
- 核心字表實際是 1,994 個唯一字頭，不是整數 2,000。`words_cache.json` 共有 3,314 筆，因此若它被定義為「權威核心字庫」，目前確實多出 1,320 筆；這些額外字只做結構與集合審查，沒有宣稱已逐筆語意複核。
- 歷屆題已核對檔內文章／逐字稿、選項、答案與詳解。官方網站確實提供歷屆題本與參考答案頁，但本輪未把每份官方 PDF 下載後逐字 OCR 比對，因此「檔內一致」不等於「已證明與官方原卷逐字相同」。官方入口：[國中教育會考歷屆試題](https://cap.rcpet.edu.tw/examination.html)。
- 2023–2025 聽力有本機音檔與 ASR 可交叉檢查；2026 缺獨立 ASR／官方原卷留存，可信度較低。
- 本報告針對目前工作目錄快照；工作目錄在審查開始前已有未提交資料變更。本輪沒有自動修復任何來源資料。

---

## 1. 單字資料庫

> 審查範圍：`target_2000_words.json` 與 `supabase/words_cache.json`。本報告只讀取原始資料；未覆寫任何資料檔。產生時間：2026-08-07T07:16:53.346Z

## 方法與覆蓋

1. 先以程式檢查 JSON、必要欄位、目標／快取集合差異、重複字頭、done、IPA 外框、中文字形、詞性格式與例句字頭命中。
2. 再把 1,994 個目標字依原順序切成 20 批（第 1–19 批各 100 筆，第 20 批 94 筆），逐批複核字義、詞性、中英例句對應及字頭合理性。
3. 額外的 1,320 筆快取資料只做集合與結構辨識，**未宣稱完成逐筆人工語意複核**；因為它們不屬於本次權威目標字表。
4. 詞形檢查包含常見規則變化與不規則變化。程式候選再經語意複核，避免把 admitted、became、children 等正確詞形誤報。

批次覆蓋：批次 1：1–100（已複核）；批次 2：101–200（已複核）；批次 3：201–300（已複核）；批次 4：301–400（已複核）；批次 5：401–500（已複核）；批次 6：501–600（已複核）；批次 7：601–700（已複核）；批次 8：701–800（已複核）；批次 9：801–900（已複核）；批次 10：901–1000（已複核）；批次 11：1001–1100（已複核）；批次 12：1101–1200（已複核）；批次 13：1201–1300（已複核）；批次 14：1301–1400（已複核）；批次 15：1401–1500（已複核）；批次 16：1501–1600（已複核）；批次 17：1601–1700（已複核）；批次 18：1701–1800（已複核）；批次 19：1801–1900（已複核）；批次 20：1901–1994（已複核）。

## 摘要

| 項目 | 結果 |
|---|---:|
| 目標字筆數／唯一字頭 | 1,994／1,994 |
| 目標字缺字 | 0 |
| 快取總筆數 | 3,314 |
| 非目標額外快取字 | 1,320 |
| done 非 true | 0 |
| 缺少 phonetic | 141 |
| IPA 使用方括號而非 / / | 4 |
| definition 不是繁體中文 | 292 |
| 已確認嚴重語意錯置 | 4 |
| 高／中／低嚴重度問題筆數 | 6／456／1320 |

## 已確認會誤導學生的問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| `chinese new year 農曆新年(n)` | 字義／例句／詞性錯置 | 字頭混入中文與詞性標記，內容卻是 choice（選擇）的資料。 | 字頭改為 Chinese New Year；詞性名詞；中譯「農曆新年／春節」，並換成相關中英例句。 | 高 |
| `christmas eve` | 字義／例句／詞性錯置 | 詞性為形容詞，定義與例句實際是 plump（胖嘟嘟的）。 | 詞性改名詞；中譯「聖誕夜／平安夜」，並換成 Christmas Eve 例句。 | 高 |
| `class leader` | 字義／例句／詞性錯置 | 定義與例句實際是 masterpiece（傑作）。 | 中譯改為「班長」，並換成 class leader 例句。 | 高 |
| `rome` | 字義／例句／詞性錯置 | 定義與例句實際是 roof（屋頂）。 | 中譯改為「羅馬」，並換成 Rome 例句。 | 高 |
| `ld` | 拼字／字頭格式 | 無法辨識為標準英文單字或常用縮寫。 | 回查權威目標字表來源，確認是否誤植；未確認前停用。 | 高 |
| `running nose` | 拼字／字頭格式 | 搭配錯誤；標準說法是 runny nose。 | 改為 runny nose。 | 高 |
| `pingpong` | 拼字／字頭格式 | 非主流標準拼法。 | 改為 ping-pong 或 table tennis。 | 中 |
| `over-weight` | 拼字／字頭格式 | 一般字頭拼法錯誤。 | 改為 overweight。 | 中 |
| `under-weight` | 拼字／字頭格式 | 一般字頭拼法錯誤。 | 改為 underweight。 | 中 |
| `table cloth` | 拼字／字頭格式 | 現代標準字頭通常合寫。 | 改為 tablecloth。 | 中 |
| `baby sitter` | 拼字／字頭格式 | 現代標準字頭通常合寫。 | 改為 babysitter。 | 中 |
| `milk shake` | 拼字／字頭格式 | 常見標準字頭通常合寫。 | 改為 milkshake。 | 中 |
| `soy-sauce` | 拼字／字頭格式 | 一般不加連字號。 | 改為 soy sauce。 | 中 |
| `teacher's day` | 拼字／字頭格式 | 節日名稱所有格通常使用複數所有格。 | 改為 Teachers' Day。 | 中 |
| `both xxx and` | 拼字／字頭格式 | xxx 是版面占位符，不應存在正式字頭。 | 改為 both ... and ...。 | 中 |
| `either xxx or` | 拼字／字頭格式 | xxx 是版面占位符，不應存在正式字頭。 | 改為 either ... or ...。 | 中 |
| `neither xxx nor` | 拼字／字頭格式 | xxx 是版面占位符，不應存在正式字頭。 | 改為 neither ... nor ...。 | 中 |

## 中文字形問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| `crime` | 簡體字／日文漢字變體 | definition、definition_zh 使用「爲」。 | 改為台灣繁體「為」。 | 中 |
| `embarrass` | 簡體字／日文漢字變體 | definition、definition_zh 使用「爲」。 | 改為台灣繁體「為」。 | 中 |
| `sincere` | 簡體字／日文漢字變體 | definition、definition_zh 使用「爲」。 | 改為台灣繁體「為」。 | 中 |
| `poor` | 簡體字／日文漢字變體 | definition、definition_zh 使用簡體「据」。 | 依語意改為「拮据」中的繁體「據」。 | 中 |

註：程式初篩曾命中「公里」的「里」與「王后」的「后」，但在台灣繁體語境均為正確用字，已排除，不列為錯誤。

## 詞性欄位問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| `hey` | 詞性格式 | interjection | 感嘆詞 | 中 |
| `oh-oh` | 詞性格式 | interjection | 感嘆詞 | 中 |
| `uh-uh` | 詞性格式 | interjection | 感嘆詞 | 中 |
| `ma'am` | 詞性格式 | 稱呼語 | 名詞（稱呼語可保留在說明，不宜作為非標準 pos 值） | 中 |

## IPA 問題

### 缺少 phonetic（141 筆，中）

錯誤內容均為空字串；建議依一致的英式或美式發音來源補上以 `/ /` 包住的標準 IPA。多字詞也不可因為是片語、地名或專名就留空。

- `a lot of`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `air conditioner`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `airline`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `alarm clock`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `as if`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `as soon as`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `asia`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `asian`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `australia`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `australian`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `baby sitter`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `bicycle riding`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `both xxx and`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `britain`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `british`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `bus stop`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `canada`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `canadian`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `cd`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `cd player`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `cheerleader`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `chinese new year 農曆新年(n)`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `christmas eve`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `class leader`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `computer game`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `contact lens`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `credit card`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `culture center`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `earrings`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `either xxx or`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `england`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `englishman`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `europe`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `european`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `even if`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `exercising`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `expensive fruit`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `extra large`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `family name`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `fast food`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `fire station`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `first grade`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `first name`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `flat tire`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `flower shop`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `foggy`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `food restaurant`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `france`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `germany`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `get in`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `get off`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `get on`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `given name`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `good looking`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `granddaughter`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `grow up`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `haircut`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `hairdresser`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `homesick`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `hong kong`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `in back of`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `in front of`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `instant noodle`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `italy`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `japanese`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `kaohsiung`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `korea`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `korean`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `ktv`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `lantern festival`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `last name`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `ld`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `london`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `los angeles`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `lunch box`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `marker`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `men's room`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `michael jackson`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `microwave oven`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `mid-autumn`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `milk shake`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `neither xxx nor`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `new year's day`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `new york`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `next to`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `nice looking`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `over-weight`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `overpass`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `paris`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `parking lot`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `pencil box`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `philippines`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `pingpong`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `police officer`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `police station`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `pop music`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `primary school`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `reading test`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `roller skating`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `rome`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `rubber band`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `running nose`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `russia`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `russian`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `salesman`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `san francisco`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `schoolmate`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `second grade`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `singapore`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `social science`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `soft drink`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `softball`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `sore throat`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `soy-sauce`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `stamp collecting`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `stationery store`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `swimsuit`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `table cloth`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `table tennis`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `tableware`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `taichung`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `tainan`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `taipei`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `taiwanese`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `tape recorder`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `teacher's day`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `tokyo`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `traffic jam`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `traffic light`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `traffic lights`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `traffic sign`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `under-weight`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `underpass`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `valentine's day`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `vcr`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `walkman`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `washing machine`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `women's room`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `youth day`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `convenience store`：`phonetic: ""` → 補上經權威字典核對的 IPA。
- `t-shirt`：`phonetic: ""` → 補上經權威字典核對的 IPA。

### IPA 外框錯誤（4 筆，中）

- `better`：目前 `[ˈbeɾə]` → 改為以 `/ /` 包住；並統一專案採用的音位／語音標記粒度。
- `children`：目前 `[ˈt͡ʃʊld̠ɹ̠ ̝ʷən]` → 改為以 `/ /` 包住；並統一專案採用的音位／語音標記粒度。
- `typewriter`：目前 `[ˈtaɪpˌɹaɪtə(ɹ)]` → 改為以 `/ /` 包住；並統一專案採用的音位／語音標記粒度。
- `uh-uh`：目前 `[ˈ(ʔ)ʌ̃˧.ʔʌ̃˩]` → 改為以 `/ /` 包住；並統一專案採用的音位／語音標記粒度。

## definition 欄位語言不符（292 筆，中）

這些字的 `definition_zh` 有繁中，但 `definition` 是英文；不符合本次「definition／definition_zh 均為繁體中文」的驗收條件。建議讓兩欄都使用繁體中文，或正式改 schema，另設 `definition_en` 存英文，避免同一欄混用語言。

- `ability`：`definition` = "Suitableness."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "能力；才能；勝任能力"。
- `achieve`：`definition` = "To succeed in something, now especially in academic performance."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（尤指經過努力）完成；達到；實現"。
- `addition`：`definition` = "The act of adding anything."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "加法；添加；增加；補充"。
- `adjective`：`definition` = "(grammar) A word that modifies a noun or describes a noun’s referent."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（語法）修飾或描述名詞的詞；形容詞"。
- `admit`：`definition` = "To allow to enter; to grant entrance (to), whether into a place, into the mind, or into consideration"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "允許進入；接納；承認"。
- `adopt`：`definition` = "To take by choice into relationship (a child, heir, friend, citizen, etc.)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "領養；採納；採取；接受"。
- `advance`：`definition` = "A forward move; improvement or progression."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "進步；進展；前進；發展"。
- `advantage`：`definition` = "Any condition, circumstance, opportunity or means, particularly favorable to success, or to any desired end."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "優勢；優點；有利條件；好處"。
- `adverb`：`definition` = "(grammar) A word that modifies a verb, adjective, other adverbs, or various other types of words, phrases, or clauses."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（語法）修飾動詞或形容詞的詞；副詞"。
- `affair`：`definition` = "(often in the plural) Something which is done or is to be done; business of any kind, commercial, professional, or public."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "事務；事情；需要處理的事項"。
- `aid`：`definition` = "Help; assistance; succor, relief."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "幫助；援助；協助"。
- `aids`：`definition` = "Help; assistance; succor, relief."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "援助；幫助；支持（複數或第三人稱）"。
- `aircraft`：`definition` = "A vehicle capable of atmospheric flight due to interaction with the air, such as buoyancy or lift"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "飛機；航空器"。
- `airline`：`definition` = "A company that flies airplanes to transport people and goods."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "航空公司"。
- `airmail`：`definition` = "The system of conveying mail using aircraft."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "航空郵件；空運郵件"。
- `alarm clock`：`definition` = "A clock with an alarm that can be set to sound at a determined time."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鬧鐘；帶有警報的時鐘"。
- `alley`：`definition` = "A narrow street or passageway, especially one through the middle of a block giving access to the rear of lots or buildings."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小巷；狹窄的街道或通道"。
- `alphabet`：`definition` = "The set of letters used when writing in a language."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "字母表；字母系統"。
- `amount`：`definition` = "The total, aggregate or sum of material (not applicable to discrete numbers or units or items in standard English)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（材料的）總量；總數"。
- `anyway`：`definition` = "Regardless; anyhow."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "不管怎樣；反正；儘管如此"。
- `appearance`：`definition` = "The act of appearing or coming into sight; the act of becoming visible to the eye."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（某人或某事物的）出現；顯現"。
- `apply`：`definition` = "To lay or place; to put (one thing to another)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（將某物）放置或塗抹於；應用"。
- `arrest`：`definition` = "A check, stop, an act or instance of arresting something."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（警察對某人的）逮捕；拘禁"。
- `article`：`definition` = "A piece of nonfictional writing such as a story, report, opinion piece, or entry in a newspaper, magazine, journal, dictionary, encyclopedia, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（報紙或雜誌等中的）文章；報導"。
- `as if`：`definition` = "As though; in a manner suggesting."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "彷彿；好像；仿佛"。
- `as well as`：`definition` = "In addition to; further to."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "除了…之外；同時；以及"。
- `attend`：`definition` = "To listen to (something or someone); to pay attention to; regard; heed."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "注意；聆聽；關注"。
- `audience`：`definition` = "A group of people within hearing; specifically, a large gathering of people listening to or watching a performance, speech, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "觀眾；聽眾；觀看或聆聽表演的人群"。
- `auxiliary`：`definition` = "A person or group that acts in an auxiliary manner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "輔助的；支援的；副的"。
- `awake`：`definition` = "Not asleep; conscious."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "醒著的；清醒的；未入睡的"。
- `aware`：`definition` = "Vigilant or on one's guard against danger or difficulty."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "意識到的；察覺的；警覺的"。
- `backward`：`definition` = "The state behind or past."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "向後的；往後的；反向的"。
- `banker`：`definition` = "One who conducts the business of banking; one who, individually, or as a member of a company, keeps an establishment for the deposit or loan of money, or for traffic in money, bills of exchange, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（銀行工作者）銀行家；銀行職員"。
- `bar`：`definition` = "A solid, more or less rigid object of metal or wood with a uniform cross-section smaller than its length."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（堅硬物體）金屬棒；木棒；條狀物"。
- `basis`：`definition` = "A physical base or foundation."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（事物的基礎）基礎；基底；根據"。
- `beautifully`：`definition` = "In a beautiful manner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "漂亮地；優美地；迷人地"。
- `best`：`definition` = "The supreme effort one can make, or has made."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（最高的努力或成就）最好的；最優的；盡力"。
- `better`：`definition` = "An entity, usually animate, deemed superior to another; one who has a claim to precedence; a superior."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（較優越的人）更優秀的人；超越者"。
- `bit`：`definition` = "A piece of metal placed in a horse's mouth and connected to the reins to direct the animal."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（馬的控制裝置）馬銜；嚼子；銜鐵"。
- `blouse`：`definition` = "A shirt, typically loose and reaching from the neck to the waist."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "女襯衫；寬鬆上衣；襯衣"。
- `board`：`definition` = "A relatively long, wide and thin piece of any material, usually wood or similar, often for use in construction or furniture-making."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（長形）木板；板材"。
- `boyfriend`：`definition` = "A male partner in an unmarried romantic relationship."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "男朋友；（未婚戀愛關係中的）異性伴侶"。
- `burger`：`definition` = "A hamburger."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "漢堡（漢堡包）；漢堡肉餅"。
- `bus stop`：`definition` = "A place where public transport buses stop to allow passengers to board or leave."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "公車站；公車站牌"。
- `cabinet`：`definition` = "A storage closet either separate from, or built into, a wall."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（廚房或衣櫃的）櫃子；儲物櫃"。
- `camping`：`definition` = "To live in a tent or similar temporary accommodation."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "露營；野營；在帳篷中住宿"。
- `career`：`definition` = "One's calling in life; a person's occupation; one's profession."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "職業；終身事業；人生的工作"。
- `carefully`：`definition` = "Sorrowfully."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小心地；謹慎地；注意細節地"。
- `certainly`：`definition` = "In a way which is certain; with certainty."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "確實地；無疑地；肯定地"。
- `chairman`：`definition` = "A person presiding over a meeting."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "主席；會議或組織的領導人"。
- `chapter`：`definition` = "(authorship) One of the main sections into which the text of a book is divided."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "章；章節；書籍的主要部分"。
- `cheerleader`：`definition` = "A person, usually a young, attractive female, who encourages applause and cheers at a sports event, and wearing a specially-designed uniform in the official colors of the team he/she cheers for."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "啦啦隊員；運動比賽中帶領歡呼的人"。
- `childhood`：`definition` = "The state of being a child."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "童年；兒童時期；幼年"。
- `children`：`definition` = "A person who has not yet reached adulthood, whether natural (puberty), cultural (initiation), or legal (majority)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小孩；兒童；未達成年的人"。
- `citizen`：`definition` = "A resident of a city or town, especially one with legally-recognized rights or duties."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "城市或城鎮居民；公民；有法律權利的人"。
- `classical`：`definition` = "One that is classical in some way; for example, a classical economist."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "古典類型的；古典派的；遵循古典風格的"。
- `climbing`：`definition` = "To ascend; rise; to go up."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "攀登；往上爬；上升"。
- `cloth`：`definition` = "A woven fabric such as used in dressing, decorating, cleaning or other practical use."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "布料；織物；衣著或裝飾用材料"。
- `clothing`：`definition` = "To adorn or cover with clothing; to dress; to supply clothes or clothing."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "穿衣；提供衣物；用衣物覆蓋"。
- `comfortably`：`definition` = "In a comfortable manner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "舒適地；舒服地；自在地"。
- `computer game`：`definition` = "An electronic game, especially a game played using a general-purpose computer (as opposed to a game console)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在電腦上玩的遊戲"。
- `confirm`：`definition` = "To strengthen; to make firm or resolute."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "使確定；加強"。
- `connective`：`definition` = "That which connects."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "連接的事物；連接詞"。
- `contact lens`：`definition` = "A thin lens, made of flexible or rigid plastic, that is placed directly on to the eye to correct vision, used as an alternative to spectacles, or, if coloured, to change one's eye color cosmetically."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "戴在眼睛上矯正視力的薄透鏡"。
- `contain`：`definition` = "To hold inside."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "包含；裡面有"。
- `cookies`：`definition` = "A small, flat, baked good which is either crisp or soft but firm."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小的扁平烤製甜點；餅乾"。
- `cooking`：`definition` = "To prepare (food) for eating by heating it, often by combining it with other ingredients."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用熱加工食物；烹飪"。
- `countryside`：`definition` = "A rural area, or the rural part of a larger area."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鄉村地區；農村"。
- `county`：`definition` = "The land ruled by a count or a countess."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "伯爵或女伯爵統治的地區；郡"。
- `credit card`：`definition` = "A plastic card, usually with a magnetic strip or an embedded microchip, connected to a credit account and used to buy goods or services."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "與信用帳戶連結、用來購買商品的塑膠卡；信用卡"。
- `crisis`：`definition` = "A crucial or decisive point or situation; a turning point."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "關鍵時刻；危急關頭；轉折點"。
- `crowd`：`definition` = "A group of people congregated or collected into a close body without order."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "聚集在一起的許多人；人群"。
- `crowded`：`definition` = "To press forward; to advance by pushing."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "人很多的；擁擠的；滿是人的"。
- `daily`：`definition` = "Something that is produced, consumed, used, or done every day."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "每天發生或進行的；日常的"。
- `dancing`：`definition` = "To move with rhythmic steps or movements, especially in time to music."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "隨著音樂節奏跳舞；舞蹈"。
- `debt`：`definition` = "An action, state of mind, or object one has an obligation to perform for another, adopt toward another, or give to another."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "欠別人的錢；債務；借款"。
- `deer`：`definition` = "A wild animal with long legs; males often have antlers."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鹿"。
- `delay`：`definition` = "A period of time before an event occurs; the act of delaying; procrastination; lingering inactivity."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "延遲；耽擱；推遲"。
- `democracy`：`definition` = "Rule by the people, especially as a form of government; either directly or through elected representatives (representative democracy)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "人民統治；民主制度；民主政治"。
- `democratic`：`definition` = "Pertaining to democracy; favoring democracy, or constructed upon the principle of government by the people."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "民主的；以人民統治為基礎的；具民主精神的"。
- `donkey`：`definition` = "An animal related to a horse, often used to carry things."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "驢子"。
- `drawing`：`definition` = "To move or develop something."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "素描；繪畫；拉動；吸引"。
- `dresser`：`definition` = "An item of kitchen furniture, like a cabinet with shelves, for storing crockery or utensils."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "餐具櫥；廚房儲物傢俱；有層架的食器櫃"。
- `drinks`：`definition` = "To consume (a liquid) through the mouth."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "飲；喝；飲用（液體）"。
- `drugstore`：`definition` = "A pharmacy; a retail store, the main product of which is medications (usually both prescription and non-prescription), along with first aid and other similar products."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "藥房；藥店；銷售藥物和保健用品的店鋪"。
- `eagle`：`definition` = "A large, strong bird with excellent eyesight."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "老鷹；鷹"。
- `earrings`：`definition` = "A piece of jewelry worn on the ear."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "耳環；耳飾；戴在耳朵上的飾品"。
- `easter`：`definition` = "Eastern."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "東方的；東邊的；來自東方的"。
- `eat`：`definition` = "To put food in your mouth and swallow it."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "吃"。
- `effective`：`definition` = "A soldier fit for duty"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "適合執勤的；能夠履職的；可用的（士兵）"。
- `eighteenth`：`definition` = "The person or thing in the eighteenth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第十八個；第十八位的人或物"。
- `election`：`definition` = "A process of choosing a leader, members of parliament, councillors or other representatives by popular vote."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "選舉；投票選出領導人或代表的過程"。
- `electricity`：`definition` = "Originally, a property of amber and certain other nonconducting substances to attract lightweight material when rubbed, or the cause of this property; now understood to be a phenomenon caused by the distribution and movement of charged subatomic particles and their interaction with the electromagnetic field."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "電；電能；驅動燈和機器的能源"。
- `element`：`definition` = "One of the simplest or essential parts or principles of which anything consists, or upon which the constitution or fundamental powers of anything are based."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "元素；基本組成部分；要素"。
- `eleventh`：`definition` = "The person or thing in the eleventh position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第十一；第11個；排在第11位的"。
- `encourage`：`definition` = "To mentally support; to motivate, give courage, hope or spirit."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鼓勵；激勵；給予勇氣和信心"。
- `entire`：`definition` = "The whole of something; the entirety."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "整個的；完整的；全部的"。
- `even if`：`definition` = "Regardless of whether; irrespective of (something happening or being the case)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "即使；縱然；不管"。
- `everywhere`：`definition` = "In or to all locations under discussion."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "到處；四面八方；各個地方"。
- `examine`：`definition` = "To observe or inspect carefully or critically"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "仔細檢查；細心觀察；審視"。
- `exercising`：`definition` = "To exert for the sake of training or improvement; to practice in order to develop."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "運動；鍛鍊；做體育活動"。
- `extra large`：`definition` = "Very large."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "特大號的；超大的；非常大的"。
- `failure`：`definition` = "State or condition of not meeting a desirable or intended objective, opposite of success."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "失敗；失利；未能成功"。
- `family name`：`definition` = "A surname."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "姓氏；家族的姓；代代相傳的姓"。
- `fashionable`：`definition` = "A fashionable person; a fop"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "時尚的；流行的；入時的"。
- `fast food`：`definition` = "Food that is served quickly, often standardized and pre-prepared."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "快速提供的；預先準備好的食物"。
- `favor`：`definition` = "A kind or helpful deed; an instance of voluntarily assisting (someone)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "幫助；幫忙的行為"。
- `feather`：`definition` = "A branching, hair-like structure that grows on the bodies of birds, used for flight, swimming, protection and display."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鳥類身上的羽毛；用於飛行和保溫"。
- `fellow`：`definition` = "A colleague or partner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "同事；夥伴；同學"。
- `field`：`definition` = "A land area free of woodland, cities, and towns; open country."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "田地；草地；開放的鄉村地區"。
- `fifteenth`：`definition` = "The person or thing in the fifteenth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第十五個；位於第十五位的事物或人物"。
- `figure`：`definition` = "A drawing or diagram conveying information."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "圖表；圖形；圖解"。
- `fire station`：`definition` = "The building where firefighters and fire trucks/fire engines are housed when not answering an alarm."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "消防局；消防人員和消防車停放的建築物"。
- `firm`：`definition` = "A business partnership; the name under which it trades."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（商業）公司；商行；事務所"。
- `first grade`：`definition` = "The first year of grade school, the period in school that comes after kindergarten and before second grade. Children usually begin first grade at age six."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小學教育階段的第一年；幼兒園之後開始的正式學年"。
- `first name`：`definition` = "The first element of a full name in cultures that place the given name first."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "人名中排在最前面的名字；(某些文化中的)名字而非姓氏"。
- `fishing`：`definition` = "The act of catching fish."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "捕魚；用釣竿或漁網抓魚的活動"。
- `flat`：`definition` = "An area of level ground."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "平坦的；沒有高低起伏的地面或區域"。
- `flow`：`definition` = "A movement in people or things with a particular way in large numbers or amounts"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "流動；(液體、人或物品的)連續移動"。
- `foggy`：`definition` = "Obscured by mist or fog; unclear; hazy"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "被霧或薄霧籠罩的；能見度低的；朦朧不清的"。
- `forward`：`definition` = "One of the eight players (comprising two props, one hooker, two locks, two flankers and one number eight, collectively known as the pack) whose primary task is to gain and maintain possession of the ball (compare back)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（橄欖球）前鋒球員；主要職責是爭奪並保持球權的球員"。
- `fourteenth`：`definition` = "The person or thing in the fourteenth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "位於序列中第十四位的人或物"。
- `freezer`：`definition` = "An appliance or room used to store food or other perishable items at temperatures below 0° Celsius (32° Fahrenheit)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "保存食物於低溫的機器或空間"。
- `freezing`：`definition` = "Especially of a liquid, to become solid due to low temperature."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "因溫度很低而變成冰或固體"。
- `german`：`definition` = "A near relative."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "與自己有血緣關係的親屬"。
- `get in`：`definition` = "To get into or inside something, literally or figuratively."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "進入或移入某個地方"。
- `get off`：`definition` = "To move from being on top of (something) to not being on top of it."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "從某物上下來或離開"。
- `get on`：`definition` = "To board or mount (something), especially a vehicle."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "登上或進入交通工具"。
- `girlfriend`：`definition` = "A female partner in an unmarried romantic relationship."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "與某人有浪漫關係但未婚的女性"。
- `given name`：`definition` = "A first name, a name chosen for a child, usually by the child's parents; a forename."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "父母為新生兒選擇的名字；名字（不是姓氏）"。
- `glasses`：`definition` = "Lenses in a frame worn to help a person see."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "眼鏡"。
- `gloves`：`definition` = "An item of clothing other than a mitten, covering all or part of the hand and fingers, but usually allowing independent movement of the fingers."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "遮蓋手和手指的衣物；手套（每個手指有獨立的空間）"。
- `grand`：`definition` = "(plural \"grand\") A thousand of some unit of currency, such as dollars or pounds. (Compare G.)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "一千元（指美元、英鎊等貨幣）"。
- `granddaughter`：`definition` = "The daughter of someone's child."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "兒子或女兒的女兒；孫女"。
- `grapefruit`：`definition` = "The tree of the species Citrus paradisi, a hybrid of pomelo (Citrus maxima) and sweet orange."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "黃色的柑橘類水果；葡萄柚；味道酸澀"。
- `grow up`：`definition` = "To mature and become an adult."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "長大；成熟；變成大人"。
- `haircut`：`definition` = "The act of cutting of the hair, often done professionally by a barber, hair stylist, or beautician."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "剪頭髮；理髮；頭髮被剪後的樣子"。
- `hairdresser`：`definition` = "A person who cuts or styles hair as an occupation or profession."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "以剪頭髮或設計髮型為職業的人；理髮師"。
- `hey`：`definition` = "An exclamation to get attention."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用來吸引注意力的感嘆詞；嘿"。
- `hiking`：`definition` = "To take a long walk for pleasure or exercise."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "為了休閒或運動的長途步行；登山健行"。
- `hippopotamus`：`definition` = "A large, semi-aquatic, herbivorous (plant-eating) African mammal (Hippopotamus amphibius)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "大型半水生食草動物，生活在非洲的河流和湖泊中；河馬"。
- `homesick`：`definition` = "(with for) missing one's home and family very much when away; nostalgic"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "遠離家鄉時思念家人和家園的；想家的"。
- `in front of`：`definition` = "At or near the front part of (something)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在某人或某物的前面；在...的正前方"。
- `indefinite`：`definition` = "(grammar) A word or phrase that designates an unspecified or unidentified person or thing or group of persons or things."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（文法）指代不特定或未確定的人或事物；不明確的"。
- `industry`：`definition` = "An area of business that produces goods or provides services."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "工業；產業；行業"。
- `japan`：`definition` = "A country in East Asia made up of many islands."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "日本"。
- `jar`：`definition` = "An earthenware container, either with two or no handles, for holding oil, water, wine, etc., or used for burial."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "玻璃或陶土製的容器；罐子"。
- `jogging`：`definition` = "The action of the verb to jog."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "慢跑；緩慢奔跑作為運動"。
- `kangaroo`：`definition` = "A member of the Macropodidae family of large marsupials with strong hind legs for hopping, native to Australia."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "澳洲有袋動物；後腿強壯能跳躍的大型動物"。
- `kitty`：`definition` = "A kitten or young cat."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小貓；年幼的貓"。
- `koala`：`definition` = "A tree-dwelling marsupial, Phascolarctos cinereus, that resembles a small bear with a broad head, large ears and sharp claws, mainly found in eastern Australia."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "澳洲樹棲動物；毛茸茸身體圓胖的有袋動物"。
- `lane`：`definition` = "(used in street names) A road, street, or similar thoroughfare."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "狹窄的道路；小巷；街道"。
- `last name`：`definition` = "One's family name; surname."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "姓氏；家族名字；姓"。
- `length`：`definition` = "The distance measured along the longest dimension of an object."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "長度；物體從一端到另一端的距離"。
- `location`：`definition` = "A particular point or place in physical space."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "地點；位置；特定的地方"。
- `loss`：`definition` = "The result of no longer possessing an object, a function, or a characteristic due to external causes or misplacement."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "喪失；失去；不再擁有某物"。
- `lunch box`：`definition` = "A container for transporting meals, especially lunch."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "便當盒；盛裝飯菜以便攜帶的容器"。
- `lychee`：`definition` = "The Chinese tropical fruit tree Litchi chinensis, of the soapberry family."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "荔枝；甜蜜多汁的熱帶水果，有粗糙的殼"。
- `ma'am`：`definition` = "A polite way to address a woman."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "女士；太太；小姐（對女性的禮貌稱呼）"。
- `mandarin`：`definition` = "The standard form of Chinese spoken in Taiwan and China."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "國語；華語；普通話"。
- `marker`：`definition` = "A pen with a thick tip used for writing or drawing."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "麥克筆；簽字筆；白板筆"。
- `measurement`：`definition` = "The act of measuring something or the result obtained."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "測量；尺寸；測量結果"。
- `melon`：`definition` = "A large, round fruit with sweet, juicy flesh."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "瓜；甜瓜"。
- `men's room`：`definition` = "A lavatory intended for use by men, often including urinals in addition to toilets."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "男廁所；男性使用的洗手間或盥洗室"。
- `michael jackson`：`definition` = "An American singer and dancer known around the world as the King of Pop."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "麥可・傑克森；美國歌手與舞者，被稱為「流行樂之王」"。
- `milk shake`：`definition` = "A thick beverage consisting of milk and ice cream mixed together, often with fruit, chocolate, or other flavoring."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "牛奶和冰淇淋混合製成的冷飲；奶昔"。
- `mosquito`：`definition` = "A small flying insect that bites people and animals."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "蚊子"。
- `necktie`：`definition` = "A strip of cloth worn around the neck and tied in the front. See also bowtie."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "領帶；繞在脖子上並在前面打結的布料"。
- `next to`：`definition` = "Beside, alongside, by, adjacent to, or near."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在…的旁邊；靠近；相鄰"。
- `nineteenth`：`definition` = "The person or thing in the nineteenth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第19個；第十九位；序數第19"。
- `ninetieth`：`definition` = "The person or thing in the ninetieth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第90個；第九十位；序數第90"。
- `noodles`：`definition` = "(usually in the plural) a string or strip of pasta"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（通常用複數）長條形的麵食；麵條"。
- `northern`：`definition` = "An inhabitant of the northern regions."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "北方人；來自北方地區的人"。
- `occupation`：`definition` = "An activity or task with which one occupies oneself; usually specifically the productive activity, service, trade, or craft for which one is regularly paid; a job."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "職業；工作；職務；佔領"。
- `occur`：`definition` = "To happen or take place."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "發生；出現；想到；被發現"。
- `official`：`definition` = "An office holder invested with powers and authorities."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "官員；高級公務員；負責人；權威人士"。
- `oh`：`definition` = "An utterance of oh; a spoken expression of surprise, acknowledgement, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "哦；呀；啊（表示驚訝、明白、高興或疼痛）"。
- `oh-oh`：`definition` = "An exclamation of error, concern, or awareness of a problem."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "呃呀；哎呀（表示出錯或發現問題）"。
- `oops`：`definition` = "A minor mistake or unforseen difficulty."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "哎呀；糟糕（表示輕微錯誤或出了點問題）"。
- `operation`：`definition` = "The method by which a device performs its function."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "操作；運作；運行；手術；營運"。
- `organize`：`definition` = "To arrange in working order."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "整理；安排；組織"。
- `out of`：`definition` = "Expressing motion away, literal or figurative; opposed to into."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（表示方向）從...出來；離開"。
- `outer space`：`definition` = "Region outside explored space."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "地球大氣層外的宇宙；太空"。
- `overpass`：`definition` = "A section of a road or path that crosses over an obstacle, especially another road, railway, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "跨越的道路或橋樑；立交橋"。
- `parking lot`：`definition` = "An open area, generally paved, where automobiles may be left when not in use."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "停放汽車的露天場地；停車場"。
- `pear`：`definition` = "A sweet fruit that is narrow at the top and wide at the bottom."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "梨子"。
- `pencil box`：`definition` = "A container for stationery such as pencils, pens, rubber, correction fluid, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "存放鉛筆和文具的盒子；文具盒"。
- `pencil case`：`definition` = "An object purposed to contain different stationery like pencil, rubber, correction fluid, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "存放筆類和文具的軟布袋；筆袋"。
- `photograph`：`definition` = "A picture created by projecting an image onto a photosensitive surface such as a chemically treated plate or film, CCD receptor, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "照片；用相機或攝影設備拍攝的影像"。
- `photographer`：`definition` = "One who takes photographs, typically as an occupation."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "攝影師；以拍攝照片為職業的人"。
- `plastic`：`definition` = "A synthetic, solid, hydrocarbon-based polymer, whether thermoplastic or thermosetting."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "塑膠；人造的輕硬材料"。
- `pleased`：`definition` = "To make happy or satisfy; to give pleasure to."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "高興的；滿意的；開心的"。
- `pleasure`：`definition` = "A state of being pleased or contented; gratification."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "愉快；享受；滿足感"。
- `poem`：`definition` = "A piece of writing arranged in lines, often using rhythm or rhyme."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "詩；詩歌"。
- `police officer`：`definition` = "A peace officer and member of a police force, i.e. policeman or policewoman."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "警察；執法部門的成員，維持公共安全"。
- `police station`：`definition` = "A building serving as the headquarters of a branch of the police force, and sometimes as a temporary place of confinement for offenders."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "警察局；警察工作的總部或辦公地點"。
- `policeman`：`definition` = "One who enforces."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "男警察；執行警務維持秩序的男性"。
- `pop music`：`definition` = "Music intended for or accepted by a wide audience, usually with a commercial basis and distinguished from other genres such as classical music and folk music."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "流行音樂；廣受大眾歡迎的音樂類型"。
- `possessive`：`definition` = "(grammar) The possessive case."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（文法）擁有格；所有格"。
- `preposition`：`definition` = "(grammar, strict sense) Any of a class of non-inflecting words typically employed to connect a following noun or a pronoun, in an adjectival or adverbial sense, with some other word: a particle used with a noun or pronoun (in English always in the objective case) to make a phrase limiting some other word."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（文法）前置詞；介詞"。
- `press`：`definition` = "A device used to apply pressure to an item."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "按壓機；壓力機"。
- `primary school`：`definition` = "The first formal, obligatory school. Usually begins with nursery school or first grade and ends at fifth or sixth grade."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "小學；初級學校"。
- `printer`：`definition` = "One who makes prints."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "印刷工人；排版工人"。
- `prisoner`：`definition` = "A person incarcerated in a prison, while on trial or serving a sentence."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "囚犯；獄中人"。
- `product`：`definition` = "A commodity offered for sale."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "商品；產品"。
- `pronoun`：`definition` = "(grammar) A type of noun that refers anaphorically to another noun or noun phrase, but which cannot ordinarily be preceded by a determiner and rarely takes an attributive adjective. English examples include I, you, him, who, me, my, each other."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（文法）代名詞；代詞"。
- `quickly`：`definition` = "Rapidly; with speed; fast."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "迅速地；快速地"。
- `raincoat`：`definition` = "A waterproof coat to be worn in the rain."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "雨衣；防水外套"。
- `rapid`：`definition` = "(often in the plural) a rough section of a river or stream which is difficult to navigate due to the swift and turbulent motion of the water."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（河流中）激流；急流；湍急的河段"。
- `reading`：`definition` = "To look at and interpret letters or other information that is written."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "閱讀；讀；理解文字"。
- `recent`：`definition` = "Having happened a short while ago."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "最近的；近期的；新近發生的"。
- `reflexive`：`definition` = "That reflects, or redirects back to the source."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "反身的；自指的；回應性的"。
- `roller skating`：`definition` = "Skating on roller skates"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "滑輪溜冰；穿著滑冰鞋活動"。
- `rubber band`：`definition` = "An elastic band made of rubber."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "橡皮筋；橡膠圈；彈性橡皮筋"。
- `running`：`definition` = "To move swiftly."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "跑步；奔跑；快速移動"。
- `sailing`：`definition` = "To be impelled or driven forward by the action of wind upon sails, as a ship on water; to be impelled on a body of water by steam or other power."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "航海；乘帆船行駛；駕船航行"。
- `salesman`：`definition` = "A man whose job it is to sell things, either in a shop/store or elsewhere."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "銷售員；推銷員；男性售貨員"。
- `satisfied`：`definition` = "To do enough for; to meet the needs of; to fulfill the wishes or requirements of."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "感到滿意的；滿足的；心滿意足"。
- `scared`：`definition` = "To frighten, terrify, startle, especially in a minor way."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "害怕的；受驚的；感到恐懼"。
- `schoolmate`：`definition` = "A person who was a fellow attendee at one's school."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "同學；校友；同班同學"。
- `secondary`：`definition` = "Any flight feather attached to the ulna (forearm) of a bird."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鳥類翅膀上的飛羽（位於前臂骨附近）"。
- `separate`：`definition` = "(usually in the plural) Anything that is sold by itself, especially an article of clothing."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "單獨出售的物品；尤其指衣服"。
- `seventeenth`：`definition` = "One of seventeen equal parts of a whole."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "整體分成十七等份中的一份"。
- `shoes`：`definition` = "A protective covering for the foot, with a bottom part composed of thick leather or plastic sole and often a thicker heel, and a softer upper part made of leather or synthetic material. Shoes generally do not extend above the ankle, as opposed to boots, which do."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "覆蓋腳部的保護用鞋類；通常包括鞋底和柔軟鞋面，不超過腳踝"。
- `shopping`：`definition` = "To visit stores or shops to browse or explore merchandise, especially with the intention of buying such merchandise."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "去商店或賣場瀏覽或購買商品"。
- `shot`：`definition` = "To launch a projectile."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用力發射或投擲物體"。
- `singing`：`definition` = "To produce musical or harmonious sounds with one’s voice."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用聲音發出音樂或悅耳的聲音；唱歌"。
- `sixteenth`：`definition` = "One of sixteen equal parts of a whole."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "整體分成十六等份中的一份"。
- `skating`：`definition` = "To move along a surface (ice or ground) using skates."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "穿著溜冰鞋在冰面或光滑地面上滑行"。
- `skiing`：`definition` = "To move on skis"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在雪地上以滑雪板滑行的運動"。
- `sneaky`：`definition` = "Any device used for covert surveillance."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "暗地進行的；秘密進行的；隱瞞的"。
- `snowman`：`definition` = "A humanoid figure made with large snowballs stacked on each other. Human traits like a face and arms may be fashioned with sticks (arms), a carrot (nose), and stones or coal (eyes, mouth)."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用滾成球狀的雪堆疊而成的人形"。
- `social science`：`definition` = "A branch of science that studies the society and human behavior in it, including anthropology, communication studies, criminology, economics, geography, history, political science, psychology, social studies, and sociology."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "研究社會及人類行為的學科"。
- `softball`：`definition` = "A game similar to baseball but played with a larger and softer ball which can be thrown overhand or underhand."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "類似棒球但使用較大較軟球的運動"。
- `sore throat`：`definition` = "Any inflammation of the pharynx that causes soreness."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "喉嚨發炎疼痛的症狀"。
- `sort`：`definition` = "A general type."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "類型；種類；品種"。
- `southern`：`definition` = "Someone from one of the states which seceded in 1861 and briefly formed the Confederate States of America, or, more broadly, from some neighboring states as well (but excluding geographically-southerly states like Arizona); compare the South."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "南部的；來自南方的；向南的"。
- `spread`：`definition` = "The act of spreading."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "傳播；蔓延；塗抹的動作或過程"。
- `stairs`：`definition` = "A single step in a staircase."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "樓梯；一組台階"。
- `stamp collecting`：`definition` = "The hobby of collecting and displaying postage stamps and related items."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "集郵；收集和展示郵票的愛好"。
- `standard`：`definition` = "A principle or example or measure used for comparison."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "標準；衡量或比較的準則"。
- `stick`：`definition` = "An elongated piece of wood or similar material, typically put to some use, for example as a wand or baton."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "木棍；樹枝；細長的木制物品"。
- `stomachache`：`definition` = "A pain in the stomach."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "胃痛；肚子痛"。
- `stormy`：`definition` = "Of or pertaining to storms."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "暴風雨的；有大風和雨的"。
- `struggle`：`definition` = "A contortion of the body in an attempt to escape or to perform a difficult task."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "掙扎；奮力；克服困難的努力"。
- `submarine`：`definition` = "A boat that can go underwater."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "潛水艇；在水下航行的艦船"。
- `successfully`：`definition` = "In a successful manner; with success; without failing."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "成功地；順利地；圓滿地"。
- `such`：`definition` = "Something being indicated that is similar to something else."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "這樣的人或物；類似的東西"。
- `suddenly`：`definition` = "Happening quickly and with little or no warning; in a sudden manner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "突然地；毫無預警地；出人意料地"。
- `suitcase`：`definition` = "A large (usually rectangular) piece of luggage used for carrying clothes, and sometimes suits, when travelling."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "行李箱；手提箱"。
- `surfing`：`definition` = "To ride a wave, usually on a surfboard."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "衝浪；在浪上滑行"。
- `swimming`：`definition` = "The act or art of sustaining and propelling the body in water."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "游泳；在水中游動的運動"。
- `swimsuit`：`definition` = "A garment worn for swimming."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "游泳衣；泳裝"。
- `table tennis`：`definition` = "A game or sport (similar to tennis) that involves the hitting of a light plastic ball across a table (fashioned like a mini tennis court) by racquets (a.k.a. paddles, a.k.a bats in Britain)"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "桌球；乒乓球"。
- `tableware`：`definition` = "The cutlery, crockery and glassware used in setting a table for a meal."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "餐具；用於進餐的盤子、杯子和刀叉"。
- `tape recorder`：`definition` = "(sound engineering) An electromechanical device use to record and play back sound, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "用磁帶記錄和播放聲音的裝置；錄音機"。
- `throughout`：`definition` = "Completely through, right the way through."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "貫穿整個；在...的始終；到處"。
- `thus`：`definition` = "(manner) In this way or manner."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "（以這種方式）因此；所以；這樣"。
- `tour`：`definition` = "A journey through a particular building, estate, country, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "參觀有趣地方的旅行；導覽；遊覽"。
- `traffic jam`：`definition` = "A situation in which road traffic accumulates until it is stationary or very slow."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "交通堵塞；車流停滯的情況"。
- `traffic light`：`definition` = "A signalling device positioned at a road intersection or pedestrian crossing to indicate when it may be safe to drive, ride or walk, using a universal colour code."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "紅綠燈；交通控制信號"。
- `traffic lights`：`definition` = "A signalling device positioned at a road intersection or pedestrian crossing to indicate when it may be safe to drive, ride or walk, using a universal colour code."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "紅綠燈；交通管制裝置"。
- `traffic sign`：`definition` = "A sign for the control of traffic or the information of drivers."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "交通標誌；道路警告牌"。
- `twelfth`：`definition` = "One of twelve equal parts of a whole."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "十二分之一；第十二部分"。
- `twentieth`：`definition` = "A person or thing in the twentieth position."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "第二十個；排在第二十位"。
- `typewriter`：`definition` = "A device, at least partially mechanical, used to print text by pressing keys that cause type to be impressed through an inked ribbon onto paper."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "打字機；機械式文字列印機"。
- `uh-uh`：`definition` = "No"；建議搬至 `definition_en`，並將 `definition` 改為繁中 "不；不是；否定回應"。
- `underlie`：`definition` = "To lie in a position directly beneath."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "位於...之下；構成...的基礎"。
- `underpass`：`definition` = "A passage that crosses a road, railroad or similar obstacle in a tunnel underneath it."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "地下通道；位於道路或鐵路下方的隧道"。
- `unfriendly`：`definition` = "An enemy."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "不友善的；帶有敵意的；不親切的"。
- `unit`：`definition` = "A particular, minute unit of mass, defined differently for different substances, but so that varying substances of the same general type have the property that one international unit of the one has the same effect on the human body as one international unit of the other."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "單位；單個物體；構成整體的個別部分"。
- `upon`：`definition` = "Being the target of an action."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在...之上；位於...的表面；一旦...時"。
- `used`：`definition` = "To utilize or employ."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "使用；利用；運用"。
- `verb`：`definition` = "(grammar) A word that indicates an action, event, or state."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "動詞；表示動作、事件或狀態的詞"。
- `vinegar`：`definition` = "A sour liquid used to add flavor to food."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "醋"。
- `voter`：`definition` = "Someone who votes."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "投票的人；選民"。
- `walkman`：`definition` = "A portable personal audio cassette player with headphones."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "便攜式音樂播放器；隨身聽"。
- `washing machine`：`definition` = "A machine, usually automatic, which washes clothes, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "洗衣機；自動洗衣設備"。
- `western`：`definition` = "A film, or some other dramatic work, set in, the historic (c. 1850-1910) American West (west of the Mississippi river) focusing on conflict between whites and Indians, lawmen and outlaws, ranchers and farmers, or industry (railroads, mining) and agriculture."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "西部片；以美國西部為背景的電影或故事"。
- `whale`：`definition` = "A very large sea mammal."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "鯨魚"。
- `whatever`：`definition` = "Unexceptional or unimportant; blah."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "無所謂的；不重要的；平凡的"。
- `whom`：`definition` = "(interrogative) What person or people; which person or people."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "誰（用作賓語）；哪個人（疑問形式）"。
- `willing`：`definition` = "To wish, desire."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "願意；期望；想要"。
- `within`：`definition` = "In the context of which the present document or ruling is made."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "在...之內的；內部的"。
- `wooden`：`definition` = "Made of wood."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "木製的；由木頭製成的"。
- `woods`：`definition` = "The substance making up the central part of the trunk and branches of a tree. Used as a material for construction, to manufacture various items, etc. or as fuel."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "樹木的木質部分；建築及製造的原料；燃料"。
- `worried`：`definition` = "Thinking about unpleasant things that have happened or that might happen; feeling afraid and unhappy."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "因害怕或想起不好的事而感到不安；煩惱的"。
- `wow`：`definition` = "Anything exceptionally surprising, unbelievable, outstanding, etc."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "令人驚嘆的事物；令人印象深刻的事情"。
- `yucky`：`definition` = "Of something highly offensive; causing aversion or disgust."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "令人厭惡的；令人感到噁心的；很糟糕的"。
- `zebra`：`definition` = "Any of three species of genus Equus: E. grevyi, E. quagga, or E. zebra, all with black and white stripes and native to Africa."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "非洲產的野生動物，外形似馬，身上有黑白相間的條紋"。
- `convenience store`：`definition` = "A small shop open for long hours that sells everyday items."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "便利商店"。
- `t-shirt`：`definition` = "A simple shirt with short sleeves and no collar."；建議搬至 `definition_en`，並將 `definition` 改為繁中 "T恤"。

## 例句檢查

- 已確認 1,994 個目標字都有 `example_en` 與 `example_zh`。
- 規則／不規則詞形候選經複核後，admit→admitted、become→became、big→bigger、children→child、clothing→clothe、lay→laid、nod→nodded、occur→occurred、rub→rubbed、shake→shook、shoot→shot、throw→threw 等均屬可接受詞形，不列錯。
- 真正不相符者是前述 `chinese new year 農曆新年(n)`、`christmas eve`、`class leader`、`rome` 四筆；其英文例句與中譯彼此相符，但整組內容放錯字頭，因此仍屬高嚴重度。
- `officer` 與 `police officer` 共用同一句例句，語意皆成立；這是內容重複，不是翻譯錯誤，列低嚴重度，建議日後改寫其中一句以增加學習變化。

## 目標字與快取集合差異

目標 1,994 字全部存在，沒有缺字或目標字重複。快取另有 1,320 個不在權威目標字表的 key。這不一定代表內容錯誤，但若 App 把整份 cache 當成「核心 2,000 字」載入，就會多載，因此列低嚴重度。建議載入時嚴格以 target 清單過濾，或將額外資料移至獨立擴充字庫。

<details><summary>展開 1,320 個額外快取字頭</summary>

- `sandwich`
- `saturday`
- `sauce`
- `save`
- `say`
- `scare`
- `scenery`
- `school`
- `scooter`
- `sea`
- `season`
- `seat`
- `second`
- `see`
- `seldom`
- `self`
- `sell`
- `send`
- `sentence`
- `september`
- `serious`
- `settle`
- `seven`
- `seventeen`
- `seventy`
- `several`
- `shall`
- `shape`
- `share`
- `sheep`
- `shell`
- `ship`
- `shirt`
- `shoe`
- `shop`
- `short`
- `should`
- `shoulder`
- `show`
- `shy`
- `sick`
- `side`
- `sidewalk`
- `silk`
- `simple`
- `since`
- `sing`
- `singer`
- `sir`
- `sister`
- `sit`
- `sitter`
- `six`
- `sixteen`
- `sixty`
- `size`
- `skirt`
- `sky`
- `sleep`
- `slow`
- `small`
- `smart`
- `smell`
- `smile`
- `smoke`
- `snack`
- `snake`
- `snow`
- `so`
- `sock`
- `sofa`
- `some`
- `someone`
- `something`
- `sometimes`
- `somewhere`
- `son`
- `song`
- `soon`
- `sore`
- `sorry`
- `sound`
- `soup`
- `source`
- `south`
- `soy`
- `space`
- `speak`
- `special`
- `spell`
- `spend`
- `spoon`
- `spring`
- `square`
- `stair`
- `stand`
- `star`
- `start`
- `station`
- `stay`
- `steak`
- `still`
- `stomach`
- `stop`
- `store`
- `story`
- `strange`
- `stranger`
- `street`
- `strong`
- `student`
- `study`
- `stupid`
- `successful`
- `sugar`
- `summer`
- `sun`
- `sunday`
- `sunny`
- `super`
- `supermarket`
- `supply`
- `sure`
- `surprise`
- `surprised`
- `sweater`
- `sweet`
- `swim`
- `system`
- `table`
- `take`
- `tale`
- `talent`
- `talk`
- `tall`
- `tape`
- `taste`
- `taxi`
- `tea`
- `teach`
- `teacher`
- `team`
- `teenager`
- `telephone`
- `television`
- `tell`
- `ten`
- `tennis`
- `test`
- `than`
- `thank`
- `that`
- `theater`
- `then`
- `there`
- `these`
- `thief`
- `thin`
- `thing`
- `think`
- `third`
- `thirsty`
- `thirteen`
- `thirty`
- `this`
- `those`
- `though`
- `thought`
- `thousand`
- `three`
- `throat`
- `thursday`
- `ticket`
- `tiger`
- `time`
- `tired`
- `to`
- `today`
- `together`
- `tomato`
- `tomorrow`
- `tonight`
- `too`
- `tooth`
- `touch`
- `towel`
- `town`
- `toy`
- `traffic`
- `train`
- `trap`
- `trash`
- `travel`
- `treasure`
- `treat`
- `tree`
- `triangle`
- `trick`
- `trip`
- `trouble`
- `trousers`
- `truck`
- `true`
- `trust`
- `truth`
- `try`
- `tube`
- `tuesday`
- `tunnel`
- `turn`
- `twelve`
- `twenty`
- `two`
- `typhoon`
- `umbrella`
- `uncle`
- `under`
- `underline`
- `understand`
- `unhappy`
- `uniform`
- `until`
- `up`
- `upper`
- `use`
- `useful`
- `user`
- `usually`
- `vacation`
- `vegetable`
- `vendor`
- `very`
- `video`
- `visit`
- `voice`
- `wait`
- `waiter`
- `waitress`
- `wake`
- `walk`
- `wall`
- `want`
- `warm`
- `wash`
- `watch`
- `water`
- `way`
- `weak`
- `weapon`
- `wear`
- `weather`
- `wednesday`
- `week`
- `weekend`
- `welcome`
- `well`
- `west`
- `wet`
- `what`
- `when`
- `where`
- `whether`
- `which`
- `white`
- `who`
- `whose`
- `why`
- `wife`
- `will`
- `win`
- `wind`
- `window`
- `windy`
- `winter`
- `wire`
- `wise`
- `wish`
- `with`
- `without`
- `woman`
- `wonderful`
- `wool`
- `word`
- `work`
- `worker`
- `world`
- `worm`
- `worry`
- `write`
- `writer`
- `wrong`
- `year`
- `yellow`
- `yes`
- `yesterday`
- `yet`
- `young`
- `zoo`
- `absolutely`
- `according`
- `account`
- `afford`
- `allergy`
- `although`
- `amazing`
- `antique`
- `anytime`
- `apart`
- `app`
- `argument`
- `aside`
- `assembly`
- `athletes`
- `attic`
- `award`
- `barely`
- `became`
- `bike`
- `blink`
- `blossoms`
- `bookstore`
- `bully`
- `calculator`
- `campsite`
- `championship`
- `charity`
- `chef`
- `cherry`
- `chores`
- `cleanliness`
- `clearly`
- `climbers`
- `cloudy`
- `code`
- `completely`
- `concert`
- `conditioner`
- `contest`
- `contrary`
- `coworkers`
- `creative`
- `criticism`
- `crook`
- `cross`
- `crossed`
- `currently`
- `decades`
- `defend`
- `delivery`
- `demanding`
- `despite`
- `detail`
- `details`
- `differently`
- `disagreement`
- `disease`
- `displays`
- `disturbing`
- `document`
- `doing`
- `drill`
- `dripping`
- `drowning`
- `due`
- `dynasty`
- `earthquake`
- `easily`
- `eightieth`
- `elegant`
- `elementary`
- `employee`
- `endings`
- `erase`
- `essay`
- `essays`
- `eventually`
- `everyone`
- `everything`
- `exactly`
- `exception`
- `exhibit`
- `exhibits`
- `expectations`
- `experiment`
- `explanation`
- `extent`
- `extremely`
- `fabric`
- `fierce`
- `files`
- `financial`
- `floral`
- `fluently`
- `forecast`
- `fridge`
- `friendship`
- `funding`
- `generation`
- `generations`
- `global`
- `goalkeeper`
- `goodbye`
- `grab`
- `graduated`
- `graduating`
- `graduation`
- `grammar`
- `grandchildren`
- `grandma`
- `grandparents`
- `greatly`
- `halfway`
- `hallway`
- `handmade`
- `happiness`
- `hardworking`
- `harvest`
- `heard`
- `heavily`
- `hesitant`
- `hikers`
- `homeless`
- `hook`
- `illness`
- `indoors`
- `instantly`
- `instead`
- `instructions`
- `intern`
- `issues`
- `kindly`
- `laptop`
- `laughter`
- `led`
- `librarian`
- `lifeguard`
- `likelihood`
- `logo`
- `loudly`
- `luckily`
- `managed`
- `math`
- `meantime`
- `midday`
- `mild`
- `mom`
- `monthly`
- `mostly`
- `mount`
- `much`
- `muddy`
- `musical`
- `needless`
- `neighborhood`
- `nicer`
- `nicest`
- `nick`
- `nobody`
- `normal`
- `nowhere`
- `odds`
- `online`
- `opposed`
- `ornaments`
- `outdated`
- `outdoor`
- `overtime`
- `owing`
- `paperwork`
- `partly`
- `per`
- `performing`
- `permanent`
- `permission`
- `person`
- `personality`
- `personally`
- `phone`
- `podcasts`
- `politely`
- `possibility`
- `postman`
- `postponed`
- `presentation`
- `quietly`
- `rarely`
- `rate`
- `recipe`
- `reduce`
- `regularly`
- `relationships`
- `relaxing`
- `relieved`
- `remained`
- `rescue`
- `reserve`
- `retrospect`
- `rid`
- `runners`
- `sadness`
- `safely`
- `sake`
- `schoolwork`
- `shelter`
- `skip`
- `skipping`
- `slipped`
- `slowly`
- `smartphone`
- `snowstorm`
- `spill`
- `spite`
- `spot`
- `stock`
- `stole`
- `stolen`
- `storage`
- `stress`
- `stressful`
- `strict`
- `summarize`
- `summit`
- `sunrise`
- `sunset`
- `surgery`
- `teammate`
- `temper`
- `tend`
- `texted`
- `thunderstorm`
- `tourism`
- `tourists`
- `translate`
- `tricky`
- `truly`
- `tv`
- `twins`
- `uncomfortable`
- `underdog`
- `unkind`
- `unless`
- `unlocked`
- `upset`
- `upsetting`
- `victims`
- `virtue`
- `volume`
- `volunteers`
- `worse`
- `worst`
- `zone`
- `grandpa`
- `mayor`
- `abandoned`
- `accidentally`
- `acknowledged`
- `activate`
- `activist`
- `adjusted`
- `allergic`
- `amazes`
- `amused`
- `ancestors`
- `announced`
- `annoyed`
- `applauded`
- `archaeologists`
- `assured`
- `attached`
- `bakers`
- `beeping`
- `bent`
- `bleaching`
- `blessings`
- `blogger`
- `blushes`
- `blushing`
- `boredom`
- `bred`
- `breeding`
- `briefly`
- `brightened`
- `broth`
- `bubbles`
- `buds`
- `bumps`
- `bushes`
- `calmly`
- `candlelight`
- `carotenoids`
- `carriages`
- `challenges`
- `charger`
- `chatting`
- `cheeks`
- `chewy`
- `chlorophyll`
- `circadian`
- `citywide`
- `closely`
- `clutter`
- `colonies`
- `combined`
- `combining`
- `commonly`
- `compounds`
- `concentrating`
- `concentration`
- `confirmation`
- `constantly`
- `convinced`
- `coordinator`
- `copper`
- `costumes`
- `cracks`
- `crookedly`
- `crops`
- `crushed`
- `decorations`
- `defensively`
- `delighted`
- `demonstrated`
- `denser`
- `desperately`
- `determined`
- `devastated`
- `devices`
- `dimensional`
- `dioxide`
- `directly`
- `disasters`
- `discouraged`
- `disturbed`
- `dormant`
- `dramatically`
- `dreading`
- `drip`
- `dusk`
- `echoes`
- `echoing`
- `ecosystems`
- `efficiently`
- `embarrassment`
- `enclosures`
- `entertaining`
- `entirely`
- `eruption`
- `evolved`
- `exhausting`
- `expires`
- `exploded`
- `explodes`
- `explorers`
- `exposed`
- `eyelids`
- `faded`
- `fades`
- `falsely`
- `fascinated`
- `fed`
- `fermentation`
- `firecracker`
- `firework`
- `fireworks`
- `fishermen`
- `flickered`
- `flopped`
- `flopping`
- `footprint`
- `fragments`
- `frames`
- `frantically`
- `frustrated`
- `frustrating`
- `fungus`
- `genes`
- `gently`
- `genuinely`
- `gills`
- `giver`
- `goggles`
- `goosebumps`
- `graffiti`
- `graphs`
- `graves`
- `gravestones`
- `grinning`
- `groaned`
- `groggy`
- `hardships`
- `helplessly`
- `herbs`
- `hesitated`
- `hesitation`
- `hillside`
- `homemade`
- `honestly`
- `hotline`
- `hugged`
- `humblest`
- `humming`
- `improvement`
- `inconvenience`
- `incredibly`
- `intimidating`
- `invest`
- `investing`
- `involved`
- `involves`
- `knots`
- `laces`
- `larger`
- `lateness`
- `laziness`
- `leash`
- `leftover`
- `lifestyle`
- `limestone`
- `lit`
- `located`
- `lungs`
- `magically`
- `maple`
- `marine`
- `matures`
- `meant`
- `melted`
- `memorizing`
- `mentioned`
- `midsummer`
- `midway`
- `mistakenly`
- `moldy`
- `molecules`
- `motors`
- `mumbles`
- `myth`
- `neatly`
- `nerves`
- `nervousness`
- `newfound`
- `nicknames`
- `nightstand`
- `nighttime`
- `nocturnal`
- `normally`
- `noticeably`
- `nutrients`
- `obstacles`
- `opponents`
- `outages`
- `outgoing`
- `overall`
- `overfishing`
- `overjoyed`
- `overwhelming`
- `packets`
- `paddle`
- `paddled`
- `paddling`
- `panicked`
- `panicking`
- `parrotfish`
- `participation`
- `particles`
- `pastries`
- `pathway`
- `paws`
- `pedaled`
- `pedals`
- `pedestrians`
- `peeked`
- `perked`
- `pheromones`
- `physically`
- `pollinate`
- `poorly`
- `pottery`
- `pouches`
- `precisely`
- `predators`
- `previously`
- `procrastination`
- `properly`
- `published`
- `puffs`
- `rainforests`
- `rapidly`
- `reasonably`
- `reassured`
- `recess`
- `recharge`
- `rechecked`
- `recital`
- `recyclable`
- `reddish`
- `reflex`
- `refreshed`
- `relaxed`
- `removing`
- `renewals`
- `reorganizing`
- `replaced`
- `replaces`
- `represented`
- `residents`
- `responsibly`
- `responsive`
- `retired`
- `reusable`
- `reveals`
- `reversed`
- `riddles`
- `roaring`
- `robotics`
- `roosters`
- `sank`
- `scarier`
- `scavenger`
- `scent`
- `scissors`
- `screws`
- `seafloor`
- `secretly`
- `seedlings`
- `series`
- `seriously`
- `shades`
- `shakier`
- `shaky`
- `shortening`
- `shown`
- `showtime`
- `shyly`
- `siblings`
- `slightly`
- `smoothly`
- `sourdough`
- `specifically`
- `splattered`
- `spooky`
- `sprang`
- `spraying`
- `squeaky`
- `starters`
- `steadily`
- `stillness`
- `storefront`
- `strands`
- `strangely`
- `strategies`
- `stray`
- `streetlight`
- `streetlights`
- `stretching`
- `strontium`
- `stuck`
- `stung`
- `stunned`
- `submitted`
- `substances`
- `subtle`
- `superhero`
- `supposed`
- `surfboard`
- `surprisingly`
- `surrounded`
- `surrounding`
- `suspected`
- `switching`
- `symbolize`
- `symbolized`
- `symbolizes`
- `tangled`
- `tangling`
- `tangy`
- `teahouse`
- `teasing`
- `tectonic`
- `tenth`
- `texture`
- `thankfully`
- `thoughtfully`
- `threatening`
- `threats`
- `thrilled`
- `transform`
- `trembled`
- `trustworthy`
- `tucked`
- `twisted`
- `unavailable`
- `uncontrollable`
- `underneath`
- `unexpected`
- `unfairly`
- `unfamiliar`
- `unfold`
- `unfolded`
- `unfortunately`
- `unimportant`
- `unnatural`
- `unrealistic`
- `unsafe`
- `unsure`
- `unsurprised`
- `unused`
- `unwanted`
- `update`
- `updates`
- `upright`
- `upside`
- `uselessly`
- `variety`
- `vehicles`
- `vessels`
- `villagers`
- `violently`
- `vivid`
- `wag`
- `wagged`
- `wagging`
- `wags`
- `wandered`
- `wandering`
- `warmly`
- `websites`
- `weeds`
- `weedy`
- `wildlife`
- `wiping`
- `wobbled`
- `wobbles`
- `wobbly`
- `woke`
- `workdays`
- `worldwide`
- `wrapped`
- `wrinkled`
- `zippers`
- `zongzi`
- `zookeepers`
- `accompanying`
- `adequate`
- `adjusting`
- `adjustment`
- `adjustments`
- `airy`
- `alertness`
- `anatomy`
- `appliances`
- `applications`
- `approached`
- `approaching`
- `approximately`
- `architects`
- `assigned`
- `associated`
- `auditioned`
- `balanced`
- `begged`
- `birdhouse`
- `blindness`
- `blob`
- `blueprints`
- `blurry`
- `bounced`
- `brightly`
- `bustling`
- `caffeine`
- `calmness`
- `cardiovascular`
- `catheters`
- `checkmate`
- `civilizations`
- `cleanly`
- `clues`
- `coastal`
- `coaxing`
- `collapsing`
- `comedies`
- `competing`
- `cone`
- `cones`
- `congestion`
- `conservationists`
- `contaminants`
- `convinces`
- `corrections`
- `cramped`
- `crawled`
- `creeping`
- `criticized`
- `crouched`
- `crucial`
- `cupcakes`
- `curled`
- `cyclists`
- `debris`
- `declared`
- `dedicated`
- `dedication`
- `deliberate`
- `density`
- `development`
- `diner`
- `disappointed`
- `disappointing`
- `discarding`
- `discharges`
- `discoveries`
- `discreetly`
- `dismissed`
- `dismissing`
- `displaying`
- `dissipate`
- `distinctly`
- `distraction`
- `doorknob`
- `doorway`
- `downstream`
- `drained`
- `dreaded`
- `dribble`
- `drifted`
- `ecological`
- `editing`
- `editor`
- `editors`
- `electronics`
- `electrons`
- `elevation`
- `emissions`
- `endlessly`
- `enrolled`
- `environmentally`
- `equator`
- `erupting`
- `erupts`
- `established`
- `evacuate`
- `evenly`
- `evolutionary`
- `exchanged`
- `excitedly`
- `explosively`
- `farmland`
- `feedback`
- `fibers`
- `filtration`
- `flawlessly`
- `floating`
- `fluffy`
- `fluorescent`
- `flyers`
- `follicle`
- `fondly`
- `fragrant`
- `frequently`
- `friction`
- `friendliness`
- `froze`
- `fumes`
- `fundraiser`
- `fungal`
- `gasps`
- `generally`
- `generic`
- `genetically`
- `geological`
- `glacial`
- `glacier`
- `gluten`
- `graciously`
- `granted`
- `grasslands`
- `handsaw`
- `handwritten`
- `hardens`
- `harmless`
- `heartbeat`
- `hiker`
- `hoops`
- `hopelessly`
- `horseback`
- `households`
- `hugging`
- `humpback`
- `illustrations`
- `imbalance`
- `imperfections`
- `importantly`
- `impurities`
- `incentives`
- `incorrectly`
- `increasingly`
- `indefinitely`
- `infrastructure`
- `inherited`
- `instructed`
- `instructing`
- `intended`
- `intentionally`
- `interconnected`
- `internship`
- `investment`
- `jotting`
- `karate`
- `kennel`
- `kennels`
- `kneading`
- `labels`
- `lamppost`
- `latitudes`
- `layers`
- `littering`
- `livable`
- `lopsided`
- `mammals`
- `mangrove`
- `marshes`
- `measurable`
- `melodies`
- `meltwater`
- `memorized`
- `meowing`
- `merchants`
- `messengers`
- `midfielder`
- `midmorning`
- `migrating`
- `millimeters`
- `minerals`
- `misleading`
- `mistaken`
- `misty`
- `mixers`
- `mochi`
- `molten`
- `murky`
- `muscles`
- `narrator`
- `navigation`
- `negatively`
- `nervously`
- `nook`
- `notecards`
- `nutrient`
- `obesity`
- `observed`
- `observers`
- `observing`
- `obsolete`
- `occasionally`
- `offstage`
- `ongoing`
- `opportunities`
- `organizers`
- `originally`
- `originating`
- `outweighed`
- `overgrown`
- `overhang`
- `overlooked`
- `pancakes`
- `particularly`
- `partway`
- `peaks`
- `perceive`
- `performed`
- `pesticides`
- `pests`
- `placement`
- `planners`
- `polar`
- `pollutants`
- `porcelain`
- `positively`
- `postal`
- `potentially`
- `poured`
- `predictions`
- `preserving`
- `professionally`
- `proposes`
- `props`
- `proteins`
- `protested`
- `proven`
- `psychologists`
- `pulp`
- `pulpy`
- `qualified`
- `random`
- `reacting`
- `rechargeable`
- `redirect`
- `refill`
- `refilling`
- `regions`
- `regulating`
- `relays`
- `relevant`
- `reliably`
- `relied`
- `relying`
- `remarkably`
- `repeatedly`
- `replaying`
- `replicate`
- `researchers`
- `resented`
- `residential`
- `resources`
- `restlessness`
- `restored`
- `restoring`
- `reused`
- `revealed`
- `reversing`
- `ridge`
- `rivals`
- `riverbank`
- `roadside`
- `rollers`
- `rotate`
- `rotating`
- `rumbling`
- `rural`
- `rusted`
- `safest`
- `satellites`
- `savings`
- `scattered`
- `scolding`
- `screeching`
- `scrimmages`
- `secured`
- `semifinals`
- `sensor`
- `severity`
- `shadows`
- `shelves`
- `shopkeepers`
- `sideways`
- `significantly`
- `simpler`
- `situations`
- `slicker`
- `sockets`
- `spans`
- `spark`
- `sparked`
- `sparring`
- `specialized`
- `splintering`
- `sponges`
- `standardized`
- `stigma`
- `stimulants`
- `stimulating`
- `storytelling`
- `straightforward`
- `strengthening`
- `strengths`
- `struck`
- `substitute`
- `sufficiently`
- `suggestions`
- `supervised`
- `supporters`
- `surplus`
- `surrendered`
- `sustainable`
- `swamps`
- `tailored`
- `technically`
- `technicians`
- `temporarily`
- `terrifying`
- `territories`
- `thinly`
- `thoughtless`
- `threatens`
- `ticked`
- `tires`
- `traders`
- `transporting`
- `trays`
- `triggered`
- `triple`
- `typically`
- `unbearably`
- `unchanging`
- `uncontrollably`
- `uncut`
- `underestimated`
- `undisturbed`
- `undivided`
- `uneven`
- `unnoticed`
- `unprepared`
- `unreasonable`
- `unreliable`
- `variations`
- `vegetation`
- `vertebrae`
- `vividly`
- `volcanic`
- `volcanoes`
- `wavelengths`
- `wetland`
- `wetlands`
- `widely`
- `widening`
- `widespread`
- `woken`
- `workshop`
- `workshops`
- `wrappers`

</details>

## 方法限制

- 本審查能確認離線兩個 JSON 的狀態，不能證明線上 Supabase 資料與快取完全相同。
- IPA 缺漏可客觀確認；但要替 141 筆填入唯一正確 IPA，必須先指定英式或美式發音標準，兩者可能都合法。
- 額外 1,320 筆不是目標核心字，本輪未做完整逐筆語意人工複核，不能對其翻譯品質作 100% 保證。
- 對 1,994 個目標字已完成結構檢查與分批語意複核；仍建議實際修正後再跑一次回歸稽核，因修正字頭可能造成 target 與 cache key 同步問題。

---

## 2. 六份題庫

產生日期：2026-08-07  
審查模式：唯讀；未修改任何題庫資料。

## 結論摘要

共檢查 **6 份檔案、1,189 筆頂層資料、1,632 個作答單元**。先執行 JSON/schema、必要欄位、answer 邊界、optionsZh 長度、重複 id 與異體字掃描，再逐檔切成 **20 批（每批最多 100 個作答單元）**，核對題幹或文章／dialogue、選項、中文選項、答案及詳解。

確認 **133 個高嚴重度答案錯誤**：目前工作版本的 answer 被改到錯誤選項；題意與詳解中的英文答案詞仍共同支持 Git 基準版本原有的選項。分布為 vocab_practice 76、phrase 49、reading 8。

結構檢查沒有發現 JSON 解析失敗、必要欄位缺漏、answer 越界、optionsZh 數量不符或檔內重複 id。掃描器亦未命中指定的簡體／日文漢字變體；但字形掃描只能排除字表內的已知字形，不能取代人工語意判讀。

## 各檔案統計

| 檔案 | 頂層資料 | 作答單元 | 結構錯誤 | 重複 id | 已知異體字命中 | 高嚴重度答案錯誤 |
|---|---:|---:|---:|---:|---:|---:|
| question_bank_vocab_practice.json | 312 | 312 | 0 | 0 | 0 | 76 |
| question_bank_grammar.json | 312 | 312 | 0 | 0 | 0 | 0 |
| question_bank_cloze.json | 81 | 341 | 0 | 0 | 0 | 0 |
| question_bank_reading.json | 92 | 275 | 0 | 0 | 0 | 8 |
| question_bank_phrase.json | 312 | 312 | 0 | 0 | 0 | 49 |
| question_bank_listening.json | 80 | 80 | 0 | 0 | 0 | 0 |

## 語意複核批次與覆蓋

每一批均核對：(1) answer 所指選項能否完成題意；(2) optionsZh 是否逐項對應；(3) explanation 是否支持答案且排除干擾項；(4) reading/cloze 是否有文章依據；(5) listening 是否有 dialogue 依據。

| 批次 | 檔案 | 作答單元範圍 | 覆蓋數 |
|---:|---|---:|---:|
| 1 | question_bank_vocab_practice.json | 1–100 | 100 |
| 2 | question_bank_vocab_practice.json | 101–200 | 100 |
| 3 | question_bank_vocab_practice.json | 201–300 | 100 |
| 4 | question_bank_vocab_practice.json | 301–312 | 12 |
| 5 | question_bank_grammar.json | 1–100 | 100 |
| 6 | question_bank_grammar.json | 101–200 | 100 |
| 7 | question_bank_grammar.json | 201–300 | 100 |
| 8 | question_bank_grammar.json | 301–312 | 12 |
| 9 | question_bank_cloze.json | 1–100 | 100 |
| 10 | question_bank_cloze.json | 101–200 | 100 |
| 11 | question_bank_cloze.json | 201–300 | 100 |
| 12 | question_bank_cloze.json | 301–341 | 41 |
| 13 | question_bank_reading.json | 1–100 | 100 |
| 14 | question_bank_reading.json | 101–200 | 100 |
| 15 | question_bank_reading.json | 201–275 | 75 |
| 16 | question_bank_phrase.json | 1–100 | 100 |
| 17 | question_bank_phrase.json | 101–200 | 100 |
| 18 | question_bank_phrase.json | 201–300 | 100 |
| 19 | question_bank_phrase.json | 301–312 | 12 |
| 20 | question_bank_listening.json | 1–80 | 80 |

## 結構性問題

未發現結構性錯誤。

## 逐項問題清單

### question_bank_vocab_practice.json

- **高｜答案錯誤｜vocab_5**
  - 題幹：Because the traffic was terrible, the bus _____ at the station twenty minutes later than usual.
  - 錯誤內容：目前 answer 指向「(A) escaped」。
  - 建議修正：answer 應指向「(B) arrived」。
  - 判定依據：arrive 指抵達。公車比平常晚到站，故選 arrived；depart 是出發，語意相反。
- **高｜答案錯誤｜vocab_17**
  - 題幹：When Amy didn't know a word, she looked it up in a _____.
  - 錯誤內容：目前 answer 指向「(D) calendar」。
  - 建議修正：answer 應指向「(C) dictionary」。
  - 判定依據：dictionary 指字典。查詢不懂的單字要用字典，故選 dictionary。
- **高｜答案錯誤｜vocab_23**
  - 題幹：Be careful! Don't _____ the glass cup while washing it.
  - 錯誤內容：目前 answer 指向「(B) clean」。
  - 建議修正：answer 應指向「(A) break」。
  - 判定依據：break 指打破。洗杯子時要小心避免打破，故選 break。
- **高｜答案錯誤｜vocab_24**
  - 題幹：Every morning, Ken puts his books and lunch box into his _____.
  - 錯誤內容：目前 answer 指向「(B) wallet」。
  - 建議修正：answer 應指向「(D) backpack」。
  - 判定依據：backpack 指背包。把書和便當放進背包準備上學，故選 backpack。
- **高｜答案錯誤｜vocab_25**
  - 題幹：The movie will _____ at seven o'clock, so let's hurry.
  - 錯誤內容：目前 answer 指向「(B) end」。
  - 建議修正：answer 應指向「(D) begin」。
  - 判定依據：begin 指開始。電影七點要開始了必須趕快，故選 begin；end 結束語意相反。
- **高｜答案錯誤｜vocab_29**
  - 題幹：The night market was so _____ that we could hardly move.
  - 錯誤內容：目前 answer 指向「(C) peaceful」。
  - 建議修正：answer 應指向「(B) crowded」。
  - 判定依據：crowded 指擁擠的。夜市人多到幾乎無法移動，故選 crowded；peaceful、silent 皆與擁擠情境相反。
- **高｜答案錯誤｜vocab_31**
  - 題幹：The cake Grandma made was so _____ that everyone asked for a second piece.
  - 錯誤內容：目前 answer 指向「(D) spicy」。
  - 建議修正：answer 應指向「(C) delicious」。
  - 判定依據：delicious 指美味的。大家都要求再吃一塊，暗示蛋糕非常好吃，故選 delicious。
- **高｜答案錯誤｜vocab_38**
  - 題幹：This sofa is so _____ that I always fall asleep on it.
  - 錯誤內容：目前 answer 指向「(C) heavy」。
  - 建議修正：answer 應指向「(B) comfortable」。
  - 判定依據：comfortable 指舒適的。坐在上面總是不小心睡著，暗示沙發很舒適，故選 comfortable。
- **高｜答案錯誤｜vocab_41**
  - 題幹：Jason likes to _____ stamps from different countries as his hobby.
  - 錯誤內容：目前 answer 指向「(C) sell」。
  - 建議修正：answer 應指向「(B) collect」。
  - 判定依據：collect 指收集。當作興趣收集各國郵票，故選 collect。
- **高｜答案錯誤｜vocab_42**
  - 題幹：Living near the MRT station is very _____ for people who work in the city.
  - 錯誤內容：目前 answer 指向「(C) noisy」。
  - 建議修正：answer 應指向「(B) convenient」。
  - 判定依據：convenient 指方便的。住在捷運站附近對上班族來說很方便，故選 convenient。
- **高｜答案錯誤｜vocab_46**
  - 題幹：Because her little sister was afraid of the dark, Amy decided to _____ her to the bathroom at night.
  - 錯誤內容：目前 answer 指向「(A) lead」。
  - 建議修正：answer 應指向「(C) accompany」。
  - 判定依據：accompany 指陪同。妹妹怕黑，所以決定晚上陪她去廁所，故選 accompany。
- **高｜答案錯誤｜vocab_47**
  - 題幹：Since the flight was delayed for hours, all the passengers waiting at the gate became increasingly _____.
  - 錯誤內容：目前 answer 指向「(A) curious」。
  - 建議修正：answer 應指向「(D) anxious」。
  - 判定依據：anxious 指焦慮的。班機延誤數小時使乘客越來越焦慮，故選 anxious。
- **高｜答案錯誤｜vocab_48**
  - 題幹：After training every day for a whole year, the young athlete finally managed to _____ her Olympic dream.
  - 錯誤內容：目前 answer 指向「(A) attempt」。
  - 建議修正：answer 應指向「(B) achieve」。
  - 判定依據：achieve 指達成。訓練一整年終於達成奧運夢想，故選 achieve。
- **高｜答案錯誤｜vocab_54**
  - 題幹：Because the road was under construction, drivers were told to _____ that area during rush hour.
  - 錯誤內容：目前 answer 指向「(A) repair」。
  - 建議修正：answer 應指向「(C) avoid」。
  - 判定依據：avoid 指避免。道路施工，駕駛被告知尖峰時間要避開該區域，故選 avoid。
- **高｜答案錯誤｜vocab_55**
  - 題幹：Even though it was her first speech contest, Mia looked very _____ standing on the stage.
  - 錯誤內容：目前 answer 指向「(C) ashamed」。
  - 建議修正：answer 應指向「(D) confident」。
  - 判定依據：confident 指有自信的。雖是第一次參加演講比賽，Mia 站上台看起來很有自信，故選 confident。
- **高｜答案錯誤｜vocab_60**
  - 題幹：Many students _____ their teacher because she always helps them patiently after class.
  - 錯誤內容：目前 answer 指向「(A) envy」。
  - 建議修正：answer 應指向「(C) admire」。
  - 判定依據：admire 指欽佩。老師總是耐心幫助學生，因此許多學生欽佩她，故選 admire。
- **高｜答案錯誤｜vocab_65**
  - 題幹：The manager was late again; _____, his car had broken down on the highway.
  - 錯誤內容：目前 answer 指向「(A) definitely」。
  - 建議修正：answer 應指向「(C) apparently」。
  - 判定依據：apparently 指據說、顯然。經理又遲到了，據說他的車在高速公路上拋錨，故選 apparently。
- **高｜答案錯誤｜vocab_67**
  - 題幹：The design team spent all week trying to _____ a new solution for the packaging problem.
  - 錯誤內容：目前 answer 指向「(C) come across」。
  - 建議修正：answer 應指向「(B) come up with」。
  - 判定依據：come up with 指想出。設計團隊整週都在設法想出包裝新方案，故選 come up with。
- **高｜答案錯誤｜vocab_71**
  - 題幹：Although the plan wasn't finalized, the manager said the event would _____ happen next month.
  - 錯誤內容：目前 answer 指向「(D) possibly」。
  - 建議修正：answer 應指向「(A) definitely」。
  - 判定依據：definitely 指確定地。雖然計畫尚未定案，經理仍表示活動下個月一定會舉行，故選 definitely。
- **高｜答案錯誤｜vocab_73**
  - 題幹：Before opening the new store, the company needed to _____ a detailed market survey.
  - 錯誤內容：目前 answer 指向「(C) carry over」。
  - 建議修正：answer 應指向「(D) carry out」。
  - 判定依據：carry out 指執行。開新店前公司需要先執行詳細的市場調查，故選 carry out。
- **高｜答案錯誤｜vocab_78**
  - 題幹：A _____ roommate always keeps the noise down when others are sleeping.
  - 錯誤內容：目前 answer 指向「(C) selfish」。
  - 建議修正：answer 應指向「(B) considerate」。
  - 判定依據：considerate 指體貼的。體貼的室友總會在別人睡覺時放低音量，故選 considerate。
- **高｜答案錯誤｜vocab_79**
  - 題幹：On the way to the airport, their car suddenly _____, so they had to call a taxi.
  - 錯誤內容：目前 answer 指向「(B) break out」。
  - 建議修正：answer 應指向「(A) break down」。
  - 判定依據：break down 指故障。前往機場途中車子突然故障，只好叫計程車，故選 break down。
- **高｜答案錯誤｜vocab_80**
  - 題幹：Because the storm warning had just been issued and the organizers worried about safety, they decided to _____ the outdoor concert.
  - 錯誤內容：目前 answer 指向「(C) call on」。
  - 建議修正：answer 應指向「(B) call off」。
  - 判定依據：call off 指取消。暴風警報剛發布，主辦單位擔心安全便決定取消戶外演唱會，故選 call off。
- **高｜答案錯誤｜vocab_82**
  - 題幹：Although the theory sounded strange to most scientists at the time, later experiments were able to _____ that it was actually correct.
  - 錯誤內容：目前 answer 指向「(D) imagine」。
  - 建議修正：answer 應指向「(C) demonstrate」。
  - 判定依據：demonstrate 指證明。理論當初聽起來很怪，但後來的實驗證明它是對的，故選 demonstrate。
- **高｜答案錯誤｜vocab_89**
  - 題幹：While cleaning out the old attic that her grandmother had left untouched for decades, she happened to _____ a collection of handwritten letters.
  - 錯誤內容：目前 answer 指向「(C) go along」。
  - 建議修正：answer 應指向「(D) come across」。
  - 判定依據：come across 指偶然發現。整理祖母多年未動的閣樓時，她偶然發現一疊手寫信件，故選 come across。
- **高｜答案錯誤｜vocab_91**
  - 題幹：Since the airline had canceled the flight without warning and many passengers missed important events, the company agreed to _____ them with vouchers.
  - 錯誤內容：目前 answer 指向「(C) complain」。
  - 建議修正：answer 應指向「(D) compensate」。
  - 判定依據：compensate 指補償。航空公司無預警取消班機導致乘客錯過重要行程，公司同意以票券補償，故選 compensate。
- **高｜答案錯誤｜vocab_99**
  - 題幹：Although it took her nearly two years after the divorce, she finally began to _____ the fact that her old life was truly over.
  - 錯誤內容：目前 answer 指向「(C) keep in touch with」。
  - 建議修正：answer 應指向「(B) come to terms with」。
  - 判定依據：come to terms with 指接受(難以接受的事實)。離婚近兩年後，她才終於開始接受舊生活真正結束的事實，故選 come to terms with。
- **高｜答案錯誤｜vocab_100**
  - 題幹：Because the young executive was so determined to get promoted, he worked overtime every night, often _____ his health and family time.
  - 錯誤內容：目前 answer 指向「(A) in charge of」。
  - 建議修正：answer 應指向「(C) at the expense of」。
  - 判定依據：at the expense of 指以...為代價。年輕主管為了升遷每晚加班，常以健康與家庭時間為代價，故選 at the expense of。
- **高｜答案錯誤｜vocab_101**
  - 題幹：Although losing his job seemed like a disaster at the time, it turned out to be _____, since it pushed him to start the business he had always dreamed of.
  - 錯誤內容：目前 answer 指向「(A) a drop in the ocean」。
  - 建議修正：answer 應指向「(D) a blessing in disguise」。
  - 判定依據：a blessing in disguise 指因禍得福。失業當時看似災難，卻促使他開始夢想已久的事業，故選 a blessing in disguise。
- **高｜答案錯誤｜vocab_104**
  - 題幹：Although he dreaded going to the dentist, he finally decided to _____ and book the appointment he had been avoiding for months.
  - 錯誤內容：目前 answer 指向「(B) beat around the bush」。
  - 建議修正：answer 應指向「(C) bite the bullet」。
  - 判定依據：bite the bullet 指咬緊牙關面對。雖然害怕看牙醫，他終於決定硬著頭皮預約已拖延數月的看診，故選 bite the bullet。
- **高｜答案錯誤｜vocab_110**
  - 題幹：Because the contractor was under pressure to finish the building before the deadline, he began to _____, which later caused serious safety problems.
  - 錯誤內容：目前 answer 指向「(C) cut in line」。
  - 建議修正：answer 應指向「(D) cut corners」。
  - 判定依據：cut corners 指偷工減料。承包商為了趕在期限前完工開始偷工減料，之後造成嚴重的安全問題，故選 cut corners。
- **高｜答案錯誤｜vocab_112**
  - 題幹：After stepping on her foot by accident, Tom quickly turned to _____ to the woman on the train.
  - 錯誤內容：目前 answer 指向「(A) complain」。
  - 建議修正：answer 應指向「(C) apologize」。
  - 判定依據：apologize 指道歉。不小心踩到別人的腳應該道歉，故選 apologize；complain 抱怨語意不符。
- **高｜答案錯誤｜vocab_113**
  - 題幹：I really _____ your help with my math homework; I could not have finished it without you.
  - 錯誤內容：目前 answer 指向「(A) blame」。
  - 建議修正：answer 應指向「(C) appreciate」。
  - 判定依據：appreciate 指感激。他人幫忙寫功課應心懷感激，故選 appreciate。
- **高｜答案錯誤｜vocab_115**
  - 題幹：All students are required to _____ the school assembly every Monday morning.
  - 錯誤內容：目前 answer 指向「(A) leave」。
  - 建議修正：answer 應指向「(D) attend」。
  - 判定依據：attend 指出席。學生每週一早上都必須出席週會，故選 attend。
- **高｜答案錯誤｜vocab_116**
  - 題幹：The whole family gathered together to _____ Grandpa's eightieth birthday.
  - 錯誤內容：目前 answer 指向「(C) cancel」。
  - 建議修正：answer 應指向「(D) celebrate」。
  - 判定依據：celebrate 指慶祝。全家聚在一起慶祝爺爺八十歲生日，故選 celebrate。
- **高｜答案錯誤｜vocab_117**
  - 題幹：Several customers began to _____ loudly when the restaurant took over an hour to serve their food.
  - 錯誤內容：目前 answer 指向「(C) apologize」。
  - 建議修正：answer 應指向「(A) complain」。
  - 判定依據：complain 指抱怨。上菜等超過一小時，顧客開始大聲抱怨，故選 complain。
- **高｜答案錯誤｜vocab_118**
  - 題幹：This bottle of juice _____ a lot of sugar, so you shouldn't drink too much of it.
  - 錯誤內容：目前 answer 指向「(C) produces」。
  - 建議修正：answer 應指向「(B) contains」。
  - 判定依據：contain 指含有。果汁含糖量高，不宜喝太多，故選 contains。
- **高｜答案錯誤｜vocab_120**
  - 題幹：It is important to _____ your temper instead of shouting at others when you are angry.
  - 錯誤內容：目前 answer 指向「(C) express」。
  - 建議修正：answer 應指向「(D) control」。
  - 判定依據：control 指控制。生氣時應控制脾氣而非對人吼叫，故選 control。
- **高｜答案錯誤｜vocab_121**
  - 題幹：Doctors are working hard to find a new medicine to _____ the disease.
  - 錯誤內容：目前 answer 指向「(C) catch」。
  - 建議修正：answer 應指向「(B) cure」。
  - 判定依據：cure 指治癒。醫生努力研發新藥治癒疾病，故選 cure。
- **高｜答案錯誤｜vocab_122**
  - 題幹：The heavy storm _____ many houses along the coast last night.
  - 錯誤內容：目前 answer 指向「(D) protected」。
  - 建議修正：answer 應指向「(B) damaged」。
  - 判定依據：damage 指損害。強烈風暴損毀了沿海許多房屋，故選 damaged。
- **高｜答案錯誤｜vocab_123**
  - 題幹：Every December, families _____ their houses with colorful lights and ornaments.
  - 錯誤內容：目前 answer 指向「(D) clean」。
  - 建議修正：answer 應指向「(A) decorate」。
  - 判定依據：decorate 指裝飾。十二月家家戶戶用彩燈和裝飾品裝飾房子，故選 decorate。
- **高｜答案錯誤｜vocab_125**
  - 題幹：The company promises to _____ your package within three days.
  - 錯誤內容：目前 answer 指向「(D) buy」。
  - 建議修正：answer 應指向「(C) deliver」。
  - 判定依據：deliver 指遞送。公司承諾三天內遞送包裹，故選 deliver。
- **高｜答案錯誤｜vocab_126**
  - 題幹：Can you _____ what the thief looked like to the police officer?
  - 錯誤內容：目前 answer 指向「(D) forget」。
  - 建議修正：answer 應指向「(B) describe」。
  - 判定依據：describe 指描述。向警察描述小偷的外貌，故選 describe。
- **高｜答案錯誤｜vocab_127**
  - 題幹：Scientists are trying to _____ a cheaper way to produce clean energy.
  - 錯誤內容：目前 answer 指向「(D) reject」。
  - 建議修正：answer 應指向「(C) develop」。
  - 判定依據：develop 指開發。科學家嘗試開發更便宜的乾淨能源生產方式，故選 develop。
- **高｜答案錯誤｜vocab_131**
  - 題幹：The teacher decided to _____ the class into four small groups for the project.
  - 錯誤內容：目前 answer 指向「(D) join」。
  - 建議修正：answer 應指向「(B) divide」。
  - 判定依據：divide 指分成。老師決定將班級分成四小組進行專案，故選 divide。
- **高｜答案錯誤｜vocab_175**
  - 題幹：The small dog began to bark loudly when a stranger tried to _____ its owner.
  - 錯誤內容：目前 answer 指向「(A) follow」。
  - 建議修正：answer 應指向「(D) attack」。
  - 判定依據：attack 指攻擊。陌生人試圖攻擊主人，小狗因此大聲吠叫，故選 attack。
- **高｜答案錯誤｜vocab_177**
  - 題幹：The car _____ on the highway caused a long traffic jam this morning.
  - 錯誤內容：目前 answer 指向「(A) opinion」。
  - 建議修正：answer 應指向「(B) accident」。
  - 判定依據：accident 指意外事故。高速公路上的意外事故造成今早長長的塞車，故選 accident。
- **高｜答案錯誤｜vocab_181**
  - 題幹：I read an interesting _____ about ocean pollution in the newspaper this morning.
  - 錯誤內容：目前 answer 指向「(A) message」。
  - 建議修正：answer 應指向「(C) article」。
  - 判定依據：article 指文章。今早在報紙上讀到一篇關於海洋污染的有趣文章，故選 article。
- **高｜答案錯誤｜vocab_183**
  - 題幹：Reading books every day is good exercise for your _____.
  - 錯誤內容：目前 answer 指向「(B) skin」。
  - 建議修正：answer 應指向「(A) brain」。
  - 判定依據：brain 指大腦。每天讀書對大腦是很好的運動，故選 brain。
- **高｜答案錯誤｜vocab_184**
  - 題幹：After graduating from college, she started her _____ as a nurse.
  - 錯誤內容：目前 answer 指向「(C) hobby」。
  - 建議修正：answer 應指向「(D) career」。
  - 判定依據：career 指職業生涯。大學畢業後她展開護理師的職業生涯，故選 career。
- **高｜答案錯誤｜vocab_185**
  - 題幹：This trip to Japan may be my only _____ to see cherry blossoms in person.
  - 錯誤內容：目前 answer 指向「(C) change」。
  - 建議修正：answer 應指向「(A) chance」。
  - 判定依據：chance 指機會。這趟日本行可能是親眼看櫻花的唯一機會，故選 chance。
- **高｜答案錯誤｜vocab_186**
  - 題幹：The main _____ in the movie is a brave young girl who saves her village.
  - 錯誤內容：目前 answer 指向「(C) actor」。
  - 建議修正：answer 應指向「(B) character」。
  - 判定依據：character 指角色。電影主角是拯救村莊的勇敢女孩，故選 character。
- **高｜答案錯誤｜vocab_187**
  - 題幹：As a good _____, you should follow the laws of your country.
  - 錯誤內容：目前 answer 指向「(C) guest」。
  - 建議修正：answer 應指向「(A) citizen」。
  - 判定依據：citizen 指公民。身為好公民應遵守國家的法律，故選 citizen。
- **高｜答案錯誤｜vocab_189**
  - 題幹：The teacher wrote a short _____ on my essay to explain what I should improve.
  - 錯誤內容：目前 answer 指向「(C) contact」。
  - 建議修正：answer 應指向「(B) comment」。
  - 判定依據：comment 指評語。老師在作文上寫了簡短評語說明該改進之處，故選 comment。
- **高｜答案錯誤｜vocab_190**
  - 題幹：The two neighbors had a _____ over where to put the fence between their yards.
  - 錯誤內容：目前 answer 指向「(C) opinion」。
  - 建議修正：answer 應指向「(A) conflict」。
  - 判定依據：conflict 指衝突。兩位鄰居因院子間籬笆位置起了衝突，故選 conflict。
- **高｜答案錯誤｜vocab_191**
  - 題幹：It took a lot of _____ for her to speak in front of the whole school.
  - 錯誤內容：目前 answer 指向「(C) fear」。
  - 建議修正：answer 應指向「(D) courage」。
  - 判定依據：courage 指勇氣。在全校面前演講需要很大的勇氣，故選 courage。
- **高｜答案錯誤｜vocab_192**
  - 題幹：Stealing money from other people is a serious _____.
  - 錯誤內容：目前 answer 指向「(C) mistake」。
  - 建議修正：answer 應指向「(B) crime」。
  - 判定依據：crime 指犯罪。偷別人的錢是嚴重的犯罪行為，故選 crime。
- **高｜答案錯誤｜vocab_193**
  - 題幹：The company faced a financial _____ after losing its biggest customer.
  - 錯誤內容：目前 answer 指向「(C) progress」。
  - 建議修正：answer 應指向「(B) crisis」。
  - 判定依據：crisis 指危機。公司失去最大客戶後面臨財務危機，故選 crisis。
- **高｜答案錯誤｜vocab_194**
  - 題幹：Traveling to different countries helps you understand other people's _____.
  - 錯誤內容：目前 answer 指向「(C) climate」。
  - 建議修正：answer 應指向「(A) culture」。
  - 判定依據：culture 指文化。到不同國家旅行有助於了解他人的文化，故選 culture。
- **高｜答案錯誤｜vocab_195**
  - 題幹：Taking off your shoes before entering a house is a common _____ in Taiwan.
  - 錯誤內容：目前 answer 指向「(C) course」。
  - 建議修正：answer 應指向「(A) custom」。
  - 判定依據：custom 指習俗。進屋前脫鞋在台灣是常見習俗，故選 custom。
- **高｜答案錯誤｜vocab_196**
  - 題幹：The class held a _____ about whether students should wear uniforms.
  - 錯誤內容：目前 answer 指向「(D) conversation」。
  - 建議修正：answer 應指向「(B) debate」。
  - 判定依據：debate 指辯論。班上針對是否該穿制服舉行辯論，故選 debate。
- **高｜答案錯誤｜vocab_197**
  - 題幹：She earned a _____ in biology from the university last year.
  - 錯誤內容：目前 answer 指向「(D) class」。
  - 建議修正：answer 應指向「(A) degree」。
  - 判定依據：degree 指學位。她去年從大學取得生物學學位，故選 degree。
- **高｜答案錯誤｜vocab_198**
  - 題幹：His strong _____ to become a doctor pushed him to study very hard.
  - 錯誤內容：目前 answer 指向「(D) fear」。
  - 建議修正：answer 應指向「(A) desire」。
  - 判定依據：desire 指渴望。想成為醫生的強烈渴望驅使他努力讀書，故選 desire。
- **高｜答案錯誤｜vocab_199**
  - 題幹：The _____ between the two cities is about two hundred kilometers.
  - 錯誤內容：目前 answer 指向「(D) area」。
  - 建議修正：answer 應指向「(C) distance」。
  - 判定依據：distance 指距離。兩城市間的距離約兩百公里，故選 distance。
- **高｜答案錯誤｜vocab_200**
  - 題幹：It is the manager's _____ to make sure all workers follow safety rules.
  - 錯誤內容：目前 answer 指向「(D) habit」。
  - 建議修正：answer 應指向「(B) duty」。
  - 判定依據：duty 指職責。確保員工遵守安全規則是經理的職責，故選 duty。
- **高｜答案錯誤｜vocab_266**
  - 題幹：My grandfather is still very _____; he goes hiking every weekend.
  - 錯誤內容：目前 answer 指向「(A) rude」。
  - 建議修正：answer 應指向「(D) active」。
  - 判定依據：active 指活躍的。祖父仍很活躍，每週末都去健行，故選 active。
- **高｜答案錯誤｜vocab_267**
  - 題幹：The museum displays many _____ tools used thousands of years ago.
  - 錯誤內容：目前 answer 指向「(A) local」。
  - 建議修正：answer 應指向「(D) ancient」。
  - 判定依據：ancient 指古代的。博物館展示許多數千年前使用的古老工具，故選 ancient；modern 現代的語意相反。
- **高｜答案錯誤｜vocab_269**
  - 題幹：She wasn't _____ that her phone had fallen out of her bag.
  - 錯誤內容：目前 answer 指向「(A) proud」。
  - 建議修正：answer 應指向「(C) aware」。
  - 判定依據：aware 指知道、意識到的。她沒意識到手機從包包掉出來了，故選 aware。
- **高｜答案錯誤｜vocab_270**
  - 題幹：It was very _____ of the boy to jump into the river to save the drowning dog.
  - 錯誤內容：目前 answer 指向「(B) lazy」。
  - 建議修正：answer 應指向「(D) brave」。
  - 判定依據：brave 指勇敢的。男孩跳入河中救溺水的狗是很勇敢的行為，故選 brave。
- **高｜答案錯誤｜vocab_272**
  - 題幹：Even during the fire drill, the teacher stayed _____ and led the students outside.
  - 錯誤內容：目前 answer 指向「(C) worried」。
  - 建議修正：answer 應指向「(A) calm」。
  - 判定依據：calm 指冷靜的。即使消防演習期間，老師仍保持冷靜帶學生到戶外，故選 calm。
- **高｜答案錯誤｜vocab_273**
  - 題幹：It was _____ of him to leave the door unlocked all night.
  - 錯誤內容：目前 answer 指向「(C) polite」。
  - 建議修正：answer 應指向「(B) careless」。
  - 判定依據：careless 指粗心的。整晚沒鎖門是粗心的行為，故選 careless；careful 小心的語意相反。
- **高｜答案錯誤｜vocab_274**
  - 題幹：The night market sells lots of _____ but delicious snacks.
  - 錯誤內容：目前 answer 指向「(C) valuable」。
  - 建議修正：answer 應指向「(B) cheap」。
  - 判定依據：cheap 指便宜的。夜市賣許多便宜卻美味的小吃，故選 cheap；expensive 昂貴語意相反。
- **高｜答案錯誤｜vocab_275**
  - 題幹：The _____ fox found a way to get the grapes without climbing the tree.
  - 錯誤內容：目前 answer 指向「(C) foolish」。
  - 建議修正：answer 應指向「(A) clever」。
  - 判定依據：clever 指聰明的。這隻聰明的狐狸不用爬樹就找到方法拿到葡萄，故選 clever。
- **高｜答案錯誤｜vocab_277**
  - 題幹：The building project is now _____ and the new library will open next week.
  - 錯誤內容：目前 answer 指向「(C) formal」。
  - 建議修正：answer 應指向「(B) complete」。
  - 判定依據：complete 指完成的。工程已完成，新圖書館下週開幕，故選 complete。
- **高｜答案錯誤｜vocab_278**
  - 題幹：Swimming alone in the deep sea can be very _____.
  - 錯誤內容：目前 answer 指向「(D) calm」。
  - 建議修正：answer 應指向「(C) dangerous」。
  - 判定依據：dangerous 指危險的。獨自在深海游泳很危險，故選 dangerous；safe 安全語意相反。
- **高｜答案錯誤｜vocab_280**
  - 題幹：Being a _____ student, Mary always finishes her homework before playing games.
  - 錯誤內容：目前 answer 指向「(D) rude」。
  - 建議修正：answer 應指向「(B) diligent」。
  - 判定依據：diligent 指勤奮的。身為勤奮的學生，Mary 總是先完成作業才玩遊戲，故選 diligent。

### question_bank_grammar.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

### question_bank_cloze.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

### question_bank_reading.json

- **高｜答案錯誤｜reading_0 / question 2**
  - 題幹：How can a student get a free movie ticket?
  - 錯誤內容：目前 answer 指向「(C) By bringing a friend to the library」。
  - 建議修正：answer 應指向「(D) By reading 5 books and writing a note about each」。
  - 判定依據：Finish all 5（讀 5 本並各寫短文）才能拿到免費電影票，選 C；帶朋友是得到書籤，不是電影票。
- **高｜答案錯誤｜reading_1 / question 1**
  - 題幹：What is the main purpose of Grandma's email?
  - 錯誤內容：目前 answer 指向「(B) To invite Anna to come and live with her」。
  - 建議修正：answer 應指向「(D) To thank Anna for the card and say she looks forward to the visit」。
  - 判定依據：信中先感謝生日卡，又說期待下個月相見、一起烤餅乾，主要目的為感謝並表達期待，選 B。
- **高｜答案錯誤｜reading_4 / question 3**
  - 題幹：What does "sorts through" in the second paragraph most likely mean?
  - 錯誤內容：目前 answer 指向「(B) Hides」。
  - 建議修正：answer 應指向「(D) Organizes」。
  - 判定依據：後面用 like cleaning a messy room（像整理凌亂的房間）作比喻，可推知 sorts through 意為「整理」，選 B。
- **高｜答案錯誤｜reading_5 / question 1**
  - 題幹：By what time should students arrive at the school gate?
  - 錯誤內容：目前 answer 指向「(A) 4:00 p.m.」。
  - 建議修正：answer 應指向「(D) 8:00 a.m.」。
  - 判定依據：8:00 在校門口集合、8:30 巴士就開（別遲到），所以最晚 8:00 必須到，選 A。
- **高｜答案錯誤｜reading_6 / question 2**
  - 題幹：Why did Karl von Frisch win the Nobel Prize?
  - 錯誤內容：目前 answer 指向「(B) He grew a new kind of flower for bees」。
  - 建議修正：answer 應指向「(D) He discovered how bees communicate through dance」。
  - 判定依據：第三段說他花了多年觀察蜜蜂、弄懂牠們的舞蹈語言，因此在 1973 年獲諾貝爾獎，選 B。
- **高｜答案錯誤｜reading_6 / question 3**
  - 題幹：What does the writer suggest in the last paragraph?
  - 錯誤內容：目前 answer 指向「(C) We should eat less honey to protect bees」。
  - 建議修正：answer 應指向「(B) Bees play an important role in helping our food supply」。
  - 判定依據：末段說蜜蜂幫助植物結種、若蜜蜂消失許多蔬果也會消失，暗示保護蜜蜂就是保護糧食，選 C。
- **高｜答案錯誤｜reading_9 / question 3**
  - 題幹：What does this story mainly show?
  - 錯誤內容：目前 answer 指向「(B) Old radios sound better than modern music players」。
  - 建議修正：answer 應指向「(A) Simple things can bring people closer and create lasting memories」。
  - 判定依據：故事透過廣播機連接祖孫兩代、讓 Sam 每年回訪直到廣播沉默，主旨是簡單的事物可以拉近人心並留下深刻回憶，選 B。
- **高｜答案錯誤｜reading_49 / question 2**
  - 題幹：Why do bakers often put dough in a warm place?
  - 錯誤內容：目前 answer 指向「(A) It helps the flour turn white」。
  - 建議修正：answer 應指向「(C) Warm temperatures help yeast work faster」。
  - 判定依據：文中說 Warm temperatures help yeast work faster，故麵包師常把麵團放在溫暖處，選 A。

### question_bank_phrase.json

- **高｜答案錯誤｜phrase_1**
  - 題幹：I have been waiting _____ the bus stop for almost half an hour.
  - 錯誤內容：目前 answer 指向「(A) on」。
  - 建議修正：answer 應指向「(B) at」。
  - 判定依據：表示在某個定點用介系詞 at。at the bus stop 指在公車站等車，故選 at。
- **高｜答案錯誤｜phrase_26**
  - 題幹：Please _____ your room before dinner.
  - 錯誤內容：目前 answer 指向「(C) clean out」。
  - 建議修正：answer 應指向「(D) clean up」。
  - 判定依據：晚餐前要把房間「整理乾淨」，故選 clean up。
- **高｜答案錯誤｜phrase_33**
  - 題幹：Whether we go hiking tomorrow will _____ the weather.
  - 錯誤內容：目前 answer 指向「(D) depend at」。
  - 建議修正：answer 應指向「(A) depend on」。
  - 判定依據：是否去健行「取決於」天氣，故選 depend on。
- **高｜答案錯誤｜phrase_34**
  - 題幹：This old bicycle used to _____ my grandfather.
  - 錯誤內容：目前 answer 指向「(B) belong with」。
  - 建議修正：answer 應指向「(A) belong to」。
  - 判定依據：這台舊腳踏車以前「屬於」爺爺，故選 belong to。
- **高｜答案錯誤｜phrase_35**
  - 題幹：I don't _____ your opinion about the new rule.
  - 錯誤內容：目前 answer 指向「(A) agree at」。
  - 建議修正：answer 應指向「(D) agree with」。
  - 判定依據：表達不「同意」對方的意見，故選 agree with。
- **高｜答案錯誤｜phrase_65**
  - 題幹：The new manager soon _____ strong resistance from the staff.
  - 錯誤內容：目前 answer 指向「(C) came up with」。
  - 建議修正：answer 應指向「(D) came up against」。
  - 判定依據：新經理很快就「遭遇」員工強烈的抵制，故選 came up against。
- **高｜答案錯誤｜phrase_74**
  - 題幹：You can always _____ your best friend in times of trouble.
  - 錯誤內容：目前 answer 指向「(C) count up」。
  - 建議修正：answer 應指向「(B) count on」。
  - 判定依據：遇到困難時總能「依靠」最好的朋友，故選 count on。
- **高｜答案錯誤｜phrase_75**
  - 題幹：It's not easy to _____ such a difficult customer.
  - 錯誤內容：目前 answer 指向「(D) deal in」。
  - 建議修正：answer 應指向「(C) deal with」。
  - 判定依據：「應付」難搞的顧客並不容易，故選 deal with。
- **高｜答案錯誤｜phrase_80**
  - 題幹：The heavy traffic can partly _____ why he arrived so late.
  - 錯誤內容：目前 answer 指向「(A) account with」。
  - 建議修正：answer 應指向「(D) account for」。
  - 判定依據：塞車可以部分「解釋」他為何遲到，故選 account for。
- **高｜答案錯誤｜phrase_81**
  - 題幹：Jenny stayed home today because she _____ a bad cold.
  - 錯誤內容：目前 answer 指向「(C) came up with」。
  - 建議修正：answer 應指向「(B) came down with」。
  - 判定依據：Jenny 今天請假在家是因為她「染上」重感冒，故選 came down with。
- **高｜答案錯誤｜phrase_82**
  - 題幹：The new manager decided to _____ the old, inefficient system completely.
  - 錯誤內容：目前 answer 指向「(D) do over with」。
  - 建議修正：answer 應指向「(C) do away with」。
  - 判定依據：新經理決定完全「廢除」舊有沒效率的制度，故選 do away with。
- **高｜答案錯誤｜phrase_94**
  - 題幹：You should always _____ your important files in case your computer crashes.
  - 錯誤內容：目前 answer 指向「(B) back down」。
  - 建議修正：answer 應指向「(A) back up」。
  - 判定依據：應該隨時「備份」重要檔案以防電腦當機，故選 back up。
- **高｜答案錯誤｜phrase_95**
  - 題幹：Before the trip to France, I want to _____ my French.
  - 錯誤內容：目前 answer 指向「(B) brush off on」。
  - 建議修正：answer 應指向「(A) brush up on」。
  - 判定依據：去法國前想「複習」法文，故選 brush up on。
- **高｜答案錯誤｜phrase_112**
  - 題幹：My car _____ on the highway, so I had to call for help.
  - 錯誤內容：目前 answer 指向「(B) broke up」。
  - 建議修正：answer 應指向「(D) broke down」。
  - 判定依據：break down 指（車輛、機器）故障。車子在高速公路上故障，故選 broke down；break up 是分手、break into 是闖入。
- **高｜答案錯誤｜phrase_113**
  - 題幹：She didn't want to _____ the topic of money at the dinner table.
  - 錯誤內容：目前 answer 指向「(B) bring about」。
  - 建議修正：answer 應指向「(C) bring up」。
  - 判定依據：bring up 指提起、提出話題。她不想在餐桌上提起錢的話題，故選 bring up；bring back 是帶回、恢復。
- **高｜答案錯誤｜phrase_116**
  - 題幹：We arrived at the hotel early, but we couldn't _____ until three o'clock.
  - 錯誤內容：目前 answer 指向「(C) check up」。
  - 建議修正：answer 應指向「(D) check in」。
  - 判定依據：check in 指辦理入住。太早到飯店，三點才能辦理入住，故選 check in；check out 是退房。
- **高｜答案錯誤｜phrase_117**
  - 題幹：The old bookstore had to _____ after forty years of business.
  - 錯誤內容：目前 answer 指向「(C) close off」。
  - 建議修正：answer 應指向「(A) close down」。
  - 判定依據：close down 指（店家）歇業、關閉。老書店經營四十年後歇業，故選 close down；close up 是打烊。
- **高｜答案錯誤｜phrase_119**
  - 題幹：The doctor told him to _____ sugar in order to stay healthy.
  - 錯誤內容：目前 answer 指向「(C) cut in」。
  - 建議修正：answer 應指向「(D) cut down on」。
  - 判定依據：cut down on 指減少。醫生要他減少糖分攝取以維持健康，故選 cut down on；cut off 是切斷。
- **高｜答案錯誤｜phrase_177**
  - 題幹：During the holiday, I finally had time to _____ some much-needed sleep.
  - 錯誤內容：目前 answer 指向「(C) catch up with」。
  - 建議修正：answer 應指向「(D) catch up on」。
  - 判定依據：catch up on 指補做落後的事。假期終於有時間補足睡眠，故選 catch up on；catch up with 是趕上某人。
- **高｜答案錯誤｜phrase_178**
  - 題幹：After being away for years, it took him a while to _____ his old classmates.
  - 錯誤內容：目前 answer 指向「(C) catch on with」。
  - 建議修正：answer 應指向「(A) catch up with」。
  - 判定依據：catch up with 指（在消息或進度上）趕上某人。離開多年後花時間才跟老同學敘舊、跟上近況，故選 catch up with。
- **高｜答案錯誤｜phrase_180**
  - 題幹：The whole class started _____ the last ten seconds before the bell rang.
  - 錯誤內容：目前 answer 指向「(C) counting on」。
  - 建議修正：answer 應指向「(D) counting down」。
  - 判定依據：count down 指倒數。下課鈴響前全班開始倒數最後十秒，故選 counting down；count on 是依靠。
- **高｜答案錯誤｜phrase_181**
  - 題幹：It's not easy to _____ such a strict and demanding customer.
  - 錯誤內容：目前 answer 指向「(D) deal for」。
  - 建議修正：answer 應指向「(A) deal with」。
  - 判定依據：deal with 指應付、處理。應付嚴格苛刻的顧客並不容易，故選 deal with；deal in 是經營、買賣。
- **高｜答案錯誤｜phrase_182**
  - 題幹：You should always _____ your important files in case your laptop breaks.
  - 錯誤內容：目前 answer 指向「(B) back down」。
  - 建議修正：answer 應指向「(A) back up」。
  - 判定依據：back up 指備份。應隨時備份重要檔案以防筆電故障，故選 back up；back down 是讓步、放棄。
- **高｜答案錯誤｜phrase_183**
  - 題幹：After the loud argument, he finally had to _____ and apologize.
  - 錯誤內容：目前 answer 指向「(B) back into」。
  - 建議修正：answer 應指向「(D) back down」。
  - 判定依據：back down 指讓步、退讓。激烈爭吵後他最終讓步並道歉，故選 back down；back up 是備份。
- **高｜答案錯誤｜phrase_186**
  - 題幹：Before the interview, I want to _____ my presentation skills.
  - 錯誤內容：目前 answer 指向「(B) brush over on」。
  - 建議修正：answer 應指向「(C) brush up on」。
  - 判定依據：brush up on 指複習、加強。面試前想加強自己的簡報技巧，故選 brush up on。
- **高｜答案錯誤｜phrase_220**
  - 題幹：Tommy stayed home from school today because he _____ a bad fever.
  - 錯誤內容：目前 answer 指向「(C) came along with」。
  - 建議修正：answer 應指向「(A) came down with」。
  - 判定依據：come down with 指染上（疾病）。Tommy 今天請假在家是因為染上重感冒，故選 came down with。
- **高｜答案錯誤｜phrase_221**
  - 題幹：The school decided to _____ the outdated dress code completely.
  - 錯誤內容：目前 answer 指向「(D) do out with」。
  - 建議修正：answer 應指向「(C) do away with」。
  - 判定依據：do away with 指廢除、擺脫。學校決定完全廢除過時的服儀規定，故選 do away with。
- **高｜答案錯誤｜phrase_224**
  - 題幹：We didn't plan to meet, but we happened to _____ each other outside the library.
  - 錯誤內容：目前 answer 指向「(C) come into」。
  - 建議修正：answer 應指向「(A) come across」。
  - 判定依據：come across 指偶然遇見（或發現）。沒約好卻在圖書館外巧遇，故選 came across；come into 是進入。
- **高｜答案錯誤｜phrase_227**
  - 題幹：The strong wind almost _____ the tent during the campsite storm.
  - 錯誤內容：目前 answer 指向「(B) blew up」。
  - 建議修正：answer 應指向「(C) blew away」。
  - 判定依據：blow away 指被風吹走。露營時暴風差點把帳篷吹走，故選 blew away；blow out 是吹熄。
- **高｜答案錯誤｜phrase_228**
  - 題幹：Please remember to _____ the candles before you leave the room.
  - 錯誤內容：目前 answer 指向「(B) blow up」。
  - 建議修正：answer 應指向「(A) blow out」。
  - 判定依據：blow out 指吹熄。離開房間前記得吹熄蠟燭，故選 blow out；blow up 是爆炸。
- **高｜答案錯誤｜phrase_229**
  - 題幹：The tired old bridge finally _____ after decades of heavy use.
  - 錯誤內容：目前 answer 指向「(B) broke up」。
  - 建議修正：answer 應指向「(A) broke down」。
  - 判定依據：break down 指損壞、倒塌。老舊的橋在數十年使用後終於損壞，故選 broke down；break out 是爆發。
- **高｜答案錯誤｜phrase_236**
  - 題幹：Before the guests arrive, we need to completely _____ the storage closet.
  - 錯誤內容：目前 answer 指向「(C) put on」。
  - 建議修正：answer 應指向「(B) clean out」。
  - 判定依據：clean out 指徹底清空。客人來之前要徹底清空儲藏室，故選 clean out；clean up 是整理乾淨。
- **高｜答案錯誤｜phrase_237**
  - 題幹：Whether the picnic happens tomorrow will completely _____ the weather.
  - 錯誤內容：目前 answer 指向「(D) depend to」。
  - 建議修正：answer 應指向「(C) depend on」。
  - 判定依據：depend on 指取決於。野餐是否舉行完全取決於天氣，故選 depend on。
- **高｜答案錯誤｜phrase_238**
  - 題幹：I really don't _____ your decision to quit the team without telling anyone.
  - 錯誤內容：目前 answer 指向「(A) agree to」。
  - 建議修正：answer 應指向「(B) agree with」。
  - 判定依據：agree with 指同意（某人的看法或做法）。表達不同意在沒告知任何人的情況下退隊的決定，故選 agree with。
- **高｜答案錯誤｜phrase_239**
  - 題幹：This antique clock used to _____ my great-grandmother a hundred years ago.
  - 錯誤內容：目前 answer 指向「(B) belong for」。
  - 建議修正：answer 應指向「(D) belong to」。
  - 判定依據：belong to 指屬於。這個古董鐘一百年前屬於我的曾祖母，故選 belong to。
- **高｜答案錯誤｜phrase_241**
  - 題幹：The store owner had to _____ dozens of angry customers after the price increase.
  - 錯誤內容：目前 answer 指向「(D) deal for」。
  - 建議修正：answer 應指向「(A) deal with」。
  - 判定依據：deal with 指應付、處理。漲價後店主必須應付數十位憤怒的顧客，故選 deal with。
- **高｜答案錯誤｜phrase_242**
  - 題幹：The company's new logo _____ a lot of criticism online.
  - 錯誤內容：目前 answer 指向「(C) came out with」。
  - 建議修正：answer 應指向「(D) came up against」。
  - 判定依據：come up against 指遭遇（阻力、反對）。公司新標誌在網路上遭遇不少批評，故選 came up against。
- **高｜答案錯誤｜phrase_252**
  - 題幹：You can always _____ your grandmother to make you feel better.
  - 錯誤內容：目前 answer 指向「(C) count out on」。
  - 建議修正：answer 應指向「(B) count on」。
  - 判定依據：count on 指依靠。心情不好時總能依靠奶奶讓你好過一些，故選 count on。
- **高｜答案錯誤｜phrase_255**
  - 題幹：I'm not sure she'll agree, but _____, we should ask her first.
  - 錯誤內容：目前 answer 指向「(A) at any moment」。
  - 建議修正：answer 應指向「(C) at any rate」。
  - 判定依據：at any rate 指無論如何。不確定她是否會同意，但無論如何該先問她，故選 at any rate。
- **高｜答案錯誤｜phrase_260**
  - 題幹：My little cousin gets upset _____; almost anything can make him cry.
  - 錯誤內容：目前 answer 指向「(A) out of the blue」。
  - 建議修正：answer 應指向「(D) at the drop of a hat」。
  - 判定依據：at the drop of a hat 指動不動就。表弟動不動就難過，幾乎任何小事都能讓他哭，故選 at the drop of a hat。
- **高｜答案錯誤｜phrase_268**
  - 題幹：_____, the underdog team ended up winning the championship.
  - 錯誤內容：目前 answer 指向「(A) By all means」。
  - 建議修正：answer 應指向「(D) Against all odds」。
  - 判定依據：against all odds 指儘管困難重重。實力較弱的隊伍儘管困難重重最終贏得冠軍，故選 Against all odds。
- **高｜答案錯誤｜phrase_269**
  - 題幹：_____, the museum's new exhibit has received mostly positive reviews.
  - 錯誤內容：目前 answer 指向「(B) By the way」。
  - 建議修正：answer 應指向「(A) By and large」。
  - 判定依據：by and large 指整體而言。整體而言博物館的新展覽獲得大多正面評價，故選 By and large。
- **高｜答案錯誤｜phrase_274**
  - 題幹：The lifeguard told everyone to leave the pool _____.
  - 錯誤內容：目前 answer 指向「(A) in once」。
  - 建議修正：answer 應指向「(C) at once」。
  - 判定依據：at once 指立刻。救生員要求大家立刻離開泳池，故選 at once。
- **高｜答案錯誤｜phrase_281**
  - 題幹：_____ the weather report, a typhoon will hit the island this weekend.
  - 錯誤內容：目前 answer 指向「(A) Owing to」。
  - 建議修正：answer 應指向「(D) According to」。
  - 判定依據：according to 指根據。根據氣象報告，這週末颱風將侵襲該島，故選 According to。
- **高｜答案錯誤｜phrase_286**
  - 題幹：_____, this year's science fair was a great success for our school.
  - 錯誤內容：目前 answer 指向「(A) At once」。
  - 建議修正：answer 應指向「(B) All in all」。
  - 判定依據：all in all 指總的來說。總的來說，今年的科展對我們學校是一大成功，故選 All in all。
- **高｜答案錯誤｜phrase_302**
  - 題幹：He forgot his lines during the play, but he managed to keep going _____.
  - 錯誤內容：目前 answer 指向「(A) hand in hand」。
  - 建議修正：answer 應指向「(D) all the same」。
  - 判定依據：all the same 指儘管如此、仍然。他忘詞了，儘管如此仍設法繼續演下去，故選 all the same。
- **高｜答案錯誤｜phrase_304**
  - 題幹："May I use your calculator?" "_____, here it is."
  - 錯誤內容：目前 answer 指向「(B) At all costs」。
  - 建議修正：answer 應指向「(A) By all means」。
  - 判定依據：by all means 指當然可以。回應對方可以借用計算機，故選 By all means。
- **高｜答案錯誤｜phrase_306**
  - 題幹：_____, it's a difficult decision, and I understand why you're hesitant.
  - 錯誤內容：目前 answer 指向「(A) In other words」。
  - 建議修正：answer 應指向「(C) At the same time」。
  - 判定依據：at the same time 此處指同時、話雖如此。同時這確實是個困難的決定，理解你猶豫的原因，故選 At the same time。
- **高｜答案錯誤｜phrase_309**
  - 題幹：_____, the new student hasn't made any friends yet, but it's only been a week.
  - 錯誤內容：目前 answer 指向「(A) On the other hand」。
  - 建議修正：answer 應指向「(B) As far as I know」。
  - 判定依據：as far as I know 指據我所知。據我所知新同學還沒交到朋友，但才過一週，故選 As far as I know。

### question_bank_listening.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

## 聽力音檔交叉比對

question_bank_listening.json 的 80 題均有 dialogue 逐字稿，但資料本身沒有 audio 路徑；App 會以 dialogue 動態產生語音。專案中的 cache/listening 是雜湊檔名，沒有題目 id 對照表，因此本輪能逐題核對的是 dialogue、題目、選項、answer 與詳解，無法證明快取 MP3 與特定題目的逐字一致。未發現逐字稿與答案矛盾。

## 會考難度與核心字限制

選項中的專有名詞、常見詞形變化、片語及功能字不能只靠 target_2000_words.json 的字面集合判定超綱，因此未把單純 OOV 自動列為錯誤。逐批語意複核未發現「明顯因艱深選項而無法作答」的題目。聽力答案分布 C 為 43.8%，屬命題品質風險但不是資料正確性錯誤。

## 重要限制

本報告能列出已確認錯誤，不能以任何自動掃描或單次語意複核保證數學意義上的 100% 無誤。尤其自然語言可能存在多解、語境歧義，以及缺少可追溯音檔對照的限制。修正前應優先處理上述 133 筆 answer，修正後再跑一次獨立複核。

---

## 3. 歷屆會考與模擬試題

審查日期：2026-08-07  
範圍：`server/data/gsat_exam_2023~2026_reading/listening.json`、`gsat_sim_2023_reading_1~10.json`  
原則：本次只讀審查，未修改任何試題資料。

## 結論摘要

- 共審查 **18 個 JSON、686 題**：歷屆題 256 題（閱讀 172、聽力 84），模擬題 430 題。
- 18 個 JSON 全部可解析；必要欄位、題號、選項數、`optionsZh` 數量、0-based `answer` 範圍與檔內重複題號皆通過。
- 逐題核對正解、`optionsZh`、詳解與文章／逐字稿依據後，**未發現可確定的答案索引或語意正解錯誤**。
- 84 個聽力音檔路徑全部存在。2023–2025 共 63 題另有本機 ASR 結果，儲存逐字稿的英文詞彙覆蓋率最低 92%，其餘皆至少 98%，未發現會改變答案的音文差異。
- 找到一項實質內容問題：2026 聽力 Q13–Q21 的 `transcript` 是英文摘要／轉述，不是逐字稿。
- 找到 21 項規格／一致性問題：20 篇模擬閱讀文章不在既定的 230–245 字範圍，以及第 1 回題組數與其餘九回不同。這些目前未造成答案錯誤。

## 重要限制：真題真實性

本專案保留了 2023–2025 的本機原題文字擷取檔及聽力 ASR，可用來核對題面與音文；但本次**沒有連線比對教育部／國中教育會考官方網站的原卷與官方答案表**。2026 也沒有對應的本機原卷擷取檔或獨立 ASR 檔。

因此，本報告能確認的是「檔內題面、答案、翻譯、詳解、文章／儲存逐字稿彼此一致」，**不能把這項結果解讀成 2023–2026 檔案已被證實與官方原卷逐字、逐題完全相同**。檔名與 `source` 自稱真題不等於外部真實性已驗證。

## 審查方法與批次覆蓋

第一階段以程式檢查 JSON、schema、題號、重複、答案範圍、選項與中譯數量、題數宣告及聽力檔案存在性。第二階段依固定排序，每批最多約 100 題，核對唯一正解、選項中譯、詳解、閱讀依據及聽力語意：

| 批次 | 題數 | 覆蓋範圍 |
|---|---:|---|
| 1 | 100 | 2023 聽力 Q1–21、2023 閱讀 Q1–43、2024 聽力 Q1–21、2024 閱讀 Q1–15 |
| 2 | 100 | 2024 閱讀 Q16–43、2025 聽力 Q1–21、2025 閱讀 Q1–43、2026 聽力 Q1–8 |
| 3 | 100 | 2026 聽力 Q9–21、2026 閱讀 Q1–43、模擬第 1 回 Q1–43、第 2 回 Q1 |
| 4 | 100 | 模擬第 2 回 Q2–43、第 3 回 Q1–43、第 4 回 Q1–15 |
| 5 | 100 | 模擬第 4 回 Q16–43、第 5 回 Q1–43、第 6 回 Q1–29 |
| 6 | 100 | 模擬第 6 回 Q30–43、第 7 回 Q1–43、第 8 回 Q1–43 |
| 7 | 86 | 模擬第 9 回 Q1–43、第 10 回 Q1–43 |

## 問題清單

### gsat_exam_2023_listening.json（21 題）

未發現可確定的資料錯誤。21 個音檔均存在；本機 ASR 與儲存逐字稿一致，最低詞彙覆蓋率為 Q3 的 92%，差異屬 ASR 辨識，不影響答案。

### gsat_exam_2023_reading.json（43 題）

未發現可確定的答案、翻譯、詳解或文章依據錯誤。圖片型題組的答案依賴圖片內容，本次核對的是檔內題面、圖片引用與詳解的一致性。

### gsat_exam_2024_listening.json（21 題）

未發現可確定的資料錯誤。21 個音檔均存在；本機 ASR 與儲存逐字稿最低詞彙覆蓋率 98%，不影響答案。

### gsat_exam_2024_reading.json（43 題）

未發現可確定的答案、翻譯、詳解或文章依據錯誤。

### gsat_exam_2025_listening.json（21 題）

未發現可確定的資料錯誤。21 個音檔均存在；本機 ASR 與儲存逐字稿最低詞彙覆蓋率 98%，不影響答案。

### gsat_exam_2025_reading.json（43 題）

未發現可確定的答案、翻譯、詳解或文章依據錯誤。

### gsat_exam_2026_listening.json（21 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q13–Q21，`transcript` | 聽力逐字稿不實 | 欄位內容使用第三人稱摘要與括號情境，例如 Q13 以 `(A long line for movie tickets) — The woman says...` 開頭，Q21 以 `News: ... Three people react...` 濃縮內容；這不是音檔逐字稿，卻會在 UI 被當成逐字稿展示。 | 逐題由音檔重新轉錄，保留每位說話者的實際台詞與題問原文；完成後再重核答案與詳解。 | **高** |
| 整份檔案 | 來源可驗證性 | 專案內有 21 個音檔，但沒有 2026 原卷文字擷取檔、官方答案留存或獨立 ASR 比對結果。本次只能確認儲存摘要、選項、答案與詳解內部一致。 | 從官方來源留存試題本、答案表與音檔來源資訊，逐題建立可追溯比對紀錄。 | **中** |

Q1–Q21 依現有題面／逐字稿內容核對，正解與詳解一致；上述問題是「逐字稿品質與來源證據」，不是已確認的答案錯誤。

### gsat_exam_2026_reading.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| 整份檔案 | 來源可驗證性 | 專案內沒有 2026 官方原卷／答案表的本機擷取或比對紀錄。本次只能確認 43 題檔內自洽。 | 留存官方原卷與答案表，逐題比對題面、圖片、答案及題號。 | **中** |

依目前檔內文章、圖片引用與詳解，未發現可確定的正解錯誤。

### gsat_sim_2023_reading_1.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q22–23，`The Lost Wallet` | 篇幅規格 | 249 字，高於 230–245 字。 | 刪減不影響 Q22–23 依據的背景語句，改後重核答案。 | 低 |
| Q24–26，`Why Do Leaves Change Color?` | 篇幅規格 | 203 字，低於 230–245 字。 | 補充不產生新歧義的背景內容，改後重核答案。 | 低 |
| Q27–28，`A Weekend Job?` | 篇幅規格 | 202 字，低於 230–245 字。 | 補充不影響既有推論的對話內容，改後重核答案。 | 低 |
| 整份試卷 | 題組結構不一致 | 本回有 8 個題組；第 2–10 回均為 7 個題組。題數仍為 43，功能與答案不受影響。 | 若產品要求等值測驗，統一模板；若允許浮動，將例外寫入規格。 | 低 |

### gsat_sim_2023_reading_2.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q28–30，`An Old Friend Returns` | 篇幅規格 | 223 字，低於規格。 | 補充不影響答案依據的內容，改後重核。 | 低 |
| Q31–34，`The Story of Paper` | 篇幅規格 | 220 字，低於規格。 | 同上。 | 低 |

### gsat_sim_2023_reading_3.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q31–34，`The Surprising History of the Umbrella` | 篇幅規格 | 229 字，低於規格 1 字。 | 補入不影響語意的一字以上內容，改後重核。 | 低 |

### gsat_sim_2023_reading_4.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q22–24，`A Night on the Mountain Trail` | 篇幅規格 | 224 字，低於規格。 | 補充背景內容，改後重核。 | 低 |
| Q25–27，`How Are Bridges Built?` | 篇幅規格 | 221 字，低於規格。 | 同上。 | 低 |
| Q28–30，`A Talk Before the Concert` | 篇幅規格 | 182 字，明顯低於規格。 | 擴充對話，但避免新增可成為替代答案的資訊。 | **中** |
| Q31–34，`Beneath the Surface: The Secret Life of Coral Reefs` | 篇幅規格 | 224 字，低於規格。 | 補充背景內容，改後重核。 | 低 |

### gsat_sim_2023_reading_5.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q22–24，`First Day at the Bakery` | 篇幅規格 | 252 字，高於規格。 | 刪減非作答依據句，改後重核。 | 低 |
| Q25–27，`How Volcanoes Form` | 篇幅規格 | 221 字，低於規格。 | 補充背景內容，改後重核。 | 低 |
| Q31–34，`A Sweet History: The Story of Chocolate` | 篇幅規格 | 223 字，低於規格。 | 同上。 | 低 |

### gsat_sim_2023_reading_6.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q25–28，`Why Do Some Animals Travel So Far?` | 篇幅規格 | 218 字，低於規格。 | 補充不改變答案的背景內容，改後重核。 | 低 |

### gsat_sim_2023_reading_7.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q22–24，`The Woman Next Door` | 篇幅規格 | 263 字，高於規格。 | 刪減非必要背景，改後重核。 | 低 |
| Q25–27，`How Does a Rainbow Form?` | 篇幅規格 | 229 字，低於規格 1 字。 | 補入不影響語意的內容，改後重核。 | 低 |
| Q28–30，`Looking Down Without Fear` | 篇幅規格 | 225 字，低於規格。 | 補充背景內容，改後重核。 | 低 |

### gsat_sim_2023_reading_8.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q28–30，`My First Real Meal` | 篇幅規格 | 227 字，低於規格。 | 補充不改變答案的內容，改後重核。 | 低 |

### gsat_sim_2023_reading_9.json（43 題）

未發現可確定的答案、翻譯、詳解、文章依據或篇幅規格錯誤。

### gsat_sim_2023_reading_10.json（43 題）

| 定位 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
| Q25–27，`Why Is the Sky Blue?` | 篇幅規格 | 223 字，低於規格。 | 補充背景內容，改後重核。 | 低 |
| Q28–30，`Finding My Way: A Conversation on the First Day` | 篇幅規格 | 292 字，明顯高於規格。 | 刪減不影響人物動機與推論題依據的對話，改後重核。 | **中** |

## 難度檢查

- 歷屆題的較難字多由題面註解、上下文或選項設計支撐，未發現單一超綱字直接造成無法作答的明確案例。
- 模擬題整體為國中會考閱讀與文法層級；主題字如 `migration`、`atmosphere`、`coral reefs` 等主要出現在文章中並有上下文支撐，未發現因冷僻字造成只有背超綱字才能判斷答案的題目。
- 「是否超出 2,000 字表」不等於題目一定不合格：會考閱讀允許透過中文註解與上下文考查陌生字推論。本報告以是否妨礙公平作答判定，未把每個表外字自動列為錯誤。

## 統計

| 類別 | 數量 |
|---|---:|
| JSON / schema 高風險錯誤 | 0 |
| 答案 index 越界或可確定的正解錯誤 | 0 |
| 可確定的 optionsZh 對位錯誤 | 0 |
| 可確定的詳解矛盾 | 0 |
| 閱讀文章無答案依據 | 0 |
| 聽力逐字稿品質問題 | 9 題（同一問題） |
| 真題來源可驗證性缺口 | 2 個 2026 檔案 |
| 模擬文章篇幅規格問題 | 20 篇 |
| 模擬題組結構一致性問題 | 1 份試卷 |

## 建議處理順序

1. 優先重做 2026 聽力 Q13–Q21 的真正逐字稿，並以音檔重新核對答案。
2. 補齊 2026 官方原卷、官方答案與音檔來源的可追溯證據；其餘年份也建議完成外部官方答案表比對。
3. 若 230–245 字是強制產品規格，再修整 20 篇模擬文章；每次改文後重新核對文章證據、答案、詳解與中譯。
4. 決定模擬第 1 回是否必須統一成 7 題組。

---

## 4. 文法教學內容

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

### 作答單元獨立覆核

審查日期：2026-08-07  
模式：唯讀；未修改 `server/data/grammar_lessons.json` 或 `AUDIT_REPORT.md`。

## 結論

共覆蓋 20 章、92 個子課程、1,402 個作答單元（MC 920、cloze 482）。先檢查 JSON、必要欄位、`answer` 索引、`optionsZh` 數量與重複選項，再依原始順序逐批核對題意、正解、中文選項及詳解。

確認 2 個高嚴重度問題：一題的 `answer` 明確指向錯誤選項；另一題有三個文字完全相同且都能成立的正解，無法唯一作答。

| 檢查項目 | 結果 |
|---|---:|
| JSON 解析錯誤 | 0 |
| 必要欄位缺漏 | 0 |
| answer 索引越界 | 0 |
| options／optionsZh 數量不一致 | 0 |
| 答案或詳解矛盾 | 2 |
| 題內重複英文選項 | 1 |
| 完全相同的 MC 題幹＋整組選項 | 0 |

## 語意複核批次

每批均核對：`answer` 指向的選項是否真正成立、`optionsZh` 是否逐項對應、`explanation` 是否支持答案，以及 cloze 選項放回文章後是否合乎文法與語意。

| 批次 | 作答單元範圍 | 覆蓋數 |
|---:|---:|---:|
| 1 | 1–100 | 100 |
| 2 | 101–200 | 100 |
| 3 | 201–300 | 100 |
| 4 | 301–400 | 100 |
| 5 | 401–500 | 100 |
| 6 | 501–600 | 100 |
| 7 | 601–700 | 100 |
| 8 | 701–800 | 100 |
| 9 | 801–900 | 100 |
| 10 | 901–1000 | 100 |
| 11 | 1001–1100 | 100 |
| 12 | 1101–1200 | 100 |
| 13 | 1201–1300 | 100 |
| 14 | 1301–1400 | 100 |
| 15 | 1401–1402 | 2 |

## 完整問題清單

### 1. 第 6 章 `6-1`，cloze 第 2 空

- 位置：`$.6.subLessons[0].quiz.cloze.blanks[1]`
- 問題類型：答案錯誤；`answer`、`optionsZh` 與詳解互相矛盾
- 嚴重度：高
- 題目語境：`There ___ a lot of food ...`
- 目前錯誤內容：`answer: 3`，指向 `(D) are`。
- 正確答案：`(B) is`，0-based index 應為 `1`。
- 判定依據：`food` 在此為不可數名詞，`a lot of food` 的中心名詞仍是 `food`，標準用法為 `There is a lot of food`。原詳解也明確說應使用 `is`；`optionsZh[1]` 標示為正確，而 `optionsZh[3]` 明確說 `are` 不符。
- 建議修正：把 `answer` 從 `3` 改為 `1`；英文選項、中譯與詳解其餘部分可保留，但詳解中「主詞其實是 a lot of」的說法不精確，建議一併改成「動詞單複數依 of 後的名詞 food 判斷」。

### 2. 第 17 章 `17-2`，MC 第 4 題

- 位置：`$.17.subLessons[1].quiz.mc[3]`
- 問題類型：重複選項、存在三個正解、answer 無法唯一成立
- 嚴重度：高
- 題幹：`___ of the heavy rain, the outdoor concert was postponed.`
- 目前錯誤內容：選項為 `(A) Because`、`(B) Since`、`(C) Because`、`(D) Because`，其中 `Because` 重複三次；`answer: 3` 指向 `(D) Because`。
- 正確答案：空格必須填 `Because`，和題幹既有的 `of` 合成 `Because of the heavy rain`。因此若保留目前題幹，正確選項文字可以是 `(D) Because`，但 A、C 與 D 完全相同，使題目同時有三個正解；原詳解卻誤稱選項本身是 `Because of`。
- 建議修正：保留 `(D) Because` 為正解並把 A、C 換成不重複且不能接 `of` 的干擾項；或把題幹改成 `___ the heavy rain`，再將唯一正解寫成 `(D) Because of`。兩種方案只能選一種，並同步更新 `optionsZh` 與詳解。

## 重複題判定補充

以下三組只有題幹文字相同，但測驗重點或整組選項不同，不能直接當作重複題刪除：

- `She sings ___ than her sister.` 分別測驗副詞形式與副詞比較級。
- `Have you ever ___ the movie Titanic?` 分別測驗 `see a movie` 與 `hear of`。
- `Which sentence is correct?` 是泛用指示語，但兩題的選項與文法點完全不同。

同一篇 cloze 內重複使用相同介系詞或詞形選項組，也不等於重複題，因為各空格在文章中的位置與正解不同。本報告只把「同一題內選項文字重複，導致多個正解」列為錯誤。

## 審查限制

本輪沒有外部官方答案檔可作第三方比對，語意判定依標準英文文法、題目上下文、`optionsZh` 與詳解交叉驗證。報告列出的是可明確證明的錯誤；自然語言題仍可能存在特殊語境下的多解，因此修正後應再做一次獨立回歸審查。

### 教學規則獨立交叉覆核

審查日期：2026-08-07  
資料檔：`server/data/grammar_lessons.json`  
參考：`reports/audit_grammar_structural.json`  
原則：只讀審查，未修改教學資料或 `AUDIT_REPORT.md`。

## 覆蓋範圍

- 覆核全部 20 章、92 個 subLesson 的教學說明，特別檢查「一定、只能、絕對、沒有某用法」等高風險敘述。
- 逐項重核結構主審列出的 9 個問題。
- 題目部分先以程式結果確認 1,402 個答案單元的結構，再語意重核所有已標示題、每章至少 5 題，共抽查 112 題；因此不能把本報告解讀成 920 題選擇題都經第二位審查者逐題人工判讀。

## 結論

- 結構主審列出的 5 項文法規則問題均確認成立。
- 「重複選項」定位應修正為第 17 章第 2 小節 Q4；這題不是單純重複選項，而是正解文字根本不存在，屬高嚴重度。
- 另新增確認 8 項教學問題，其中 4 項可能直接教錯學生，應優先修正。
- 三組重複題目的答案與詳解本身可成立；是否保留取決於是否刻意安排複習，不屬正解錯誤。

## 確認主審問題

| 定位 | 問題 | 獨立覆核 | 嚴重度 |
|---|---|---|---|
| 第 1 章「現在簡單式」教學說明 | 宣稱 because／since 等連接的前後子句時態基本上要一致 | **確認錯誤。** 時態由各事件時間關係決定，例如 `I am tired because I didn't sleep well last night.` 合法且自然。 | 高 |
| 第 1 章「過去簡單式」教學說明 | 把 `lose`、`decide` 列為不能用進行式的狀態動詞 | **確認錯誤。** `I am losing hope.`、`We are deciding what to do.` 都成立。 | 高 |
| 第 1 章「過去簡單式」教學說明 | 宣稱 `before long` 只指未來 | **確認過度絕對。** 可用於過去敘事，如 `Before long, he returned.` | 中 |
| 第 2 章「現在進行式」教學說明 | 宣稱 buy/open/arrive/finish 等天生沒有進行式，且 while 子句一定用進行式 | **確認錯誤。** `I'm buying a car.`、`The shop is opening.`、`She is arriving tomorrow.`、`I'm finishing my work.` 都成立；`While I live here, ...` 也可用一般式。 | 高 |
| 第 15 章「附加問句」教學說明 | 把 `I said` 與 `I think/I believe` 一起列為依受詞子句造附加問句 | **確認錯誤。** 轉移型附加問句主要限第一人稱現在式的 think/believe/suppose 等；`I said he was late, didn't I?` 通常依主要子句。 | 高 |
| 第 17 章第 2 小節「附屬連接詞」Q4 | 題目為 `___ of the heavy rain...`，四選項實際是 Because / Since / Because / Because，`answer: 3`；詳解卻說答案是 `Because of` | **確認高風險答案錯誤。** 正確文字不在選項中，選 D 仍得到不合文法的 `Because of of the heavy rain`。D 應為 `Because` 且題幹去掉 `of`，或 D 改為 `Because of` 且題幹改成 `___ the heavy rain`。 | 高 |

## 新增發現

### 1. 第 2 章「過去進行式」：錯誤例句與時態規則

- **錯誤內容：** `Mary had a dog now.` 後面標示「現在簡單式」。`had` 是過去式，且和當下時間詞 `now` 衝突。
- **建議：** 若表示現在擁有，改為 `Mary has a dog now.`；若表示過去擁有，改為 `Mary had a dog then.`。
- **嚴重度：高。** 例句本身直接示範錯誤時態。

同一小節另說 `and`、`because`、`that` 引導的形容詞子句「都要求前後句時態一致」，也不成立。應改成「依每個動作的實際時間與先後關係選擇時態」。

### 2. 第 2 章「過去進行式」：不自然／錯誤複數

- **錯誤內容：** `There were some big fishes in his hands.` 用來描述手上的數條魚。
- **建議：** 一般同種魚的複數用 `fish`：`There were some big fish in his hands.`；`fishes` 通常指不同魚種。
- **嚴重度：中。** 不一定造成文法題誤答，但會讓學生學到不恰當用法。

### 3. 第 3 章「未來簡單式」：unless 例句中譯反向

- **錯誤內容：** `Unless it stops raining, we won't go out.` 譯為「除非雨停了，我們才不出門」。
- **建議：** 改為「除非雨停，否則我們不會出門」或「如果雨不停，我們就不出門」。
- **嚴重度：高。** 現有中譯把條件邏輯說反，會誤導 `unless` 用法。

### 4. 第 15 章「附加問句」：兩項特殊規則錯誤

- **錯誤內容 A：** `mustn't`（禁止）的附加問句寫成 `may you?`。
- **建議 A：** 一般依 `mustn't` 造肯定 `must you?`；不要教成 `may you?`。
- **錯誤內容 B：** `Let's not...` 的附加問句列為 `OK? / all right?`。
- **建議 B：** 標準附加問句仍為 `shall we?`，例如 `Let's not argue, shall we?`。`OK?` 可作一般確認語，但不應冒充標準 tag question 規則。
- **嚴重度：高。** 兩項都會直接影響選擇題答案。

### 5. 第 19 章「祈使句」：把正確句子判為錯誤

- **錯誤內容：** 宣稱 `Open your book, David, please.` 因把人名夾在中間而錯誤。
- **建議：** 此句文法與標點均可成立，`David` 是呼格，前後逗號正確。可保留 `David, please open your book.` 等其他自然語序，但不能把原句標成錯誤。
- **嚴重度：高。** 教材明確否定了一個合法英文句型。

### 6. 第 19 章「祈使句」：例句的主要動詞判定不精確

- **錯誤內容：** `Closing the door at night can keep you safe.` 說「主要動詞是 keep」。
- **建議：** 述語是 `can keep`；`Closing the door at night` 是動名詞片語主詞。若只為辨識祈使句，至少應寫「主要述語為 can keep」。
- **嚴重度：低。**

### 7. 第 19 章 `there be`：不可接特定名詞說得過度絕對

- **錯誤內容：** 宣稱 there be 後「不能」接 my/this/the 等特定限定詞。
- **建議：** 基礎存在句通常引入不定資訊，但呈現式用法可接特定名詞，例如 `There's John at the door.`、`There's my bus.`。宜改為「會考基礎存在句通常接不定名詞；特定名詞僅見於特殊呈現語境」。
- **嚴重度：中。**

### 8. 第 20 章「假設語氣」：`were` 一律化需標示考試語域

- **錯誤內容：** 多次說假設語氣的 be 動詞「一律」用 `were`，完全排除 `was`。
- **建議：** 應寫「正式文法與考試通常用 were；非正式現代英語中第一、三人稱單數也可見 was」。會考作答仍可要求選 `were`，但教學規則不宜宣稱自然語言中絕不存在 `was`。
- **嚴重度：低。**

## 重複題目覆核

以下三組重複題的答案與詳解本身沒有發現錯誤：

1. 第 9／10 章的 `She sings ___ than her sister.`
2. 第 15 章內重複的 Titanic 現在完成式題。
3. 第 16 章內重複的 `Which sentence is correct?`

若重複是刻意的跨章複習，可保留但應加上複習標記；若不是，建議替換其中一題以提高題庫多樣性。嚴重度為低至中，不等同答案錯誤。

## 各章抽查結果

| 章 | 主題 | 二次覆核結果 |
|---:|---|---|
| 1 | 現在／過去簡單式 | 發現 because/since 時態一致、lose/decide、before long 問題 |
| 2 | 現在／過去進行式 | 發現瞬間動詞、while、`Mary had...now`、時態一致與 fishes 問題 |
| 3 | 未來式與完成式 | 發現 unless 中譯錯誤；抽查題目正解可成立 |
| 4 | 助動詞 | 抽查規則、例句與題目未見明確錯誤 |
| 5 | 介系詞 | 抽查規則、例句與題目未見明確錯誤 |
| 6 | 名詞與代名詞 | 抽查規則、例句與題目未見明確錯誤 |
| 7 | 形容詞 | 抽查規則、例句與題目未見明確錯誤 |
| 8 | 副詞 | 抽查規則、例句與題目未見明確錯誤 |
| 9 | 比較級／最高級 | 重複題可作答；抽查未見正解錯誤 |
| 10 | 動名詞與不定詞 | 重複題可作答；抽查未見正解錯誤 |
| 11 | 情緒動詞／形容詞 | 抽查未見明確錯誤 |
| 12 | 被動語態 | 抽查未見明確錯誤 |
| 13 | 特殊動詞（一） | 抽查未見明確錯誤 |
| 14 | 特殊動詞（二） | 抽查未見明確錯誤 |
| 15 | 倒裝句型／附加問句 | 發現 `I said`、`mustn't`、`Let's not` 三項規則問題 |
| 16 | 疑問詞 | 重複題可作答；抽查未見正解錯誤 |
| 17 | 連接詞 | Q4 正解文字不存在，需優先修正 |
| 18 | 關係代名詞 | 抽查未見明確錯誤 |
| 19 | 其他重要句型 | 發現祈使句與 there be 過度絕對化問題 |
| 20 | 假設語氣 | 考試答案可成立；建議標明正式／非正式語域差異 |

## 修正優先順序

1. 第 17 章 Q4 選項與題幹：目前沒有合法正解。
2. 第 1、2 章的時態與進行式錯誤規則，以及 `Mary had a dog now.`。
3. 第 3 章 unless 反向中譯。
4. 第 15 章附加問句的 `I said`、`mustn't`、`Let's not`。
5. 第 19 章把合法祈使句判錯的說明。
6. 最後處理重複題、語域與過度絕對化敘述。

### 交叉報告歧異裁定

- 第 17 章第 2 小節 Q4 的題幹是 `___ of the heavy rain`，把選項 `Because` 放入後會形成合法的 `Because of the heavy rain`。因此精確問題不是「正解文字不存在」，而是 A、C、D 三個選項完全相同且都能成立，導致沒有唯一答案。最終裁定以「作答單元獨立覆核」的說明為準。
- 三組只有 stem 相同、但選項與考點不同的題目，不列為確定重複題錯誤；若產品不希望跨章重現，可另列內容多樣性改善。

---

## 建議修正後的回歸驗證

1. 每批修正後重新跑 `scripts/audit_all_content.js` 與各分類審查程式。
2. 答案修正必須依「題意與正解詞」判斷，不能只根據詳解內的 A／B／C／D 字母改 answer。
3. 任何文章或 transcript 改寫後，都要重新核對答案、optionsZh 與詳解。
4. 單字修正後重新檢查 IPA、例句詞形命中、繁體字形與詞性一致性。
5. 正式發布前再從官方原卷／答案表做一次歷屆題外部比對，並保存來源與比對紀錄。
