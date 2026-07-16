# Vocatopia 開發規範

## 設計系統（2026-07-04 全站改版定案）

### 視覺方向：暖色可愛風
參考基準：奶油底 + 深咖啡描邊 + 番茄紅 CTA 的學習 App 風格。
取代原本的深色 RPG 風（霓虹光效、shimmer、掃描線已全數移除，禁止再引入）。

### Design Tokens（styles.css `:root`，禁止硬編碼色碼）
| Token | 值 | 用途 |
|-------|-----|------|
| `--bg` | `#F0EDE6` | 頁面牆面 |
| `--card` / `--card2` | `#FBF6EA` / `#F4EDDD` | 奶油卡片 / 嵌入區塊 |
| `--nav` | `#FFFDF8` | 底部導覽、白色面 |
| `--line` / `--line2` / `--line3` | `#7A5C43` / `#E2D7C3` / `#D4C6AD` | 主描邊 / 淺描邊 / 中間 |
| `--ink` / `--ink2` / `--ink3` | `#4B382A` / `#94826F` / `#C3B49E` | 主文字 / 次文字 / 停用 |
| `--red` / `--red2` | `#E0472E` / `#C63A24` | 主 CTA / 按壓陰影 |
| `--orange` / `--orange2` | `#F5921E` / `#D97C0E` | active 狀態 / 點綴 |
| `--gold` | `#F0AD1D` | 金幣、收藏星號 |
| `--green` / `--wrong` | `#3BA55D` / `#E04B3E` | 答對 / 答錯（語意色，不挪作裝飾） |
| 各 `*soft` | — | 對應色的淡底（如 `--redsoft`、`--greensoft`） |

### 元件語彙
- **主 CTA**：`--red` 底 + 白字 + `box-shadow:0 4px 0 var(--red2)`；`:active` 時 `translateY(3px)` + 陰影收為 1px（實體按壓感）
- **重點卡片**：`--card` 底 + `2.5px solid var(--line)` 粗描邊 + `0 4px 0 rgba(122,92,67,.2)` 實色陰影
- **一般卡片**：`--card` 底 + `2px solid var(--line2)`
- **分頁籤（segmented tabs）**：膠囊形（`border-radius:999px`），選中 = 紅底白字，未選 = 白底淺描邊
- **底部導覽**：`--nav` 白底，active = 橘色 + 上浮放大動畫；未選中 emoji 圖示套 `grayscale(1) opacity(.55)`
- **語意色只表達語意**：綠 = 正確/完成、紅（wrong）= 錯誤、金 = 收藏/金幣；裝飾一律用橘

### Legacy aliases（勿刪）
`script.js` 動態 HTML 仍引用舊變數名：`--white`（→ ink）、`--gray`（→ ink2）、`--gray2`（→ ink3）、`--green3`（→ green）、`--orange`。
新代碼一律使用新語意名稱（`--ink`、`--card`⋯），不要再使用 alias。

### JS 內嵌樣式規範
- JS 生成的 HTML 樣式優先引用 CSS 變數，不得寫死深色主題色碼
- SVG 繪圖（如雷達圖）的線條用咖啡色系 `rgba(122,92,67,x)` / `rgba(75,56,42,x)`

### 其他慣例
- 每次改動前端資產必須升版 `sw.js` 的 `CACHE` 版本號
- 字體：`Nunito`（顯示/數字）+ `Noto Sans TC`（中文內文）；已移除 Space Grotesk

## App 全域返回鍵/手勢返回架構（2026-07-16 定案，第一階段）

### 背景
全站原本有 6 種不同的「開關語言」並存，且完全沒有 Android 實體返回鍵／iOS
邊緣滑動手勢的處理（`@capacitor/app` 早就裝了但沒註冊 `backButton` 監聽）。

### 第一階段涵蓋範圍
- **標準彈窗**（`.modal-overlay` + `.show`）：`openModal(id)`/`closeModal(id)`
  改為維護全域堆疊 `_modalStack`，開啟 push、關閉（不論是被 ✕ 按鈕/背景點擊/
  返回鍵關閉）都要 filter 掉，因此**新彈窗一律要透過這兩個函式開關，不可以
  直接操作 `.show` class**，否則堆疊會跟畫面顯示狀態脫節。
- **畫面切換**（`.screen` + `.active`）：`goScreen(id, btn)` 改為維護
  `_screenHistory`，每次「真的换到不同畫面」才 push 前一個 id。

### 特殊全螢幕蓋版（教學導覽/設定面板/動態彈窗如簽到恭喜與收件夾/測驗子畫面）
這類**沒有各自的返回堆疊**，按返回鍵/手勢一律是「直接關閉 + 回首頁」
（`_closeAnySpecialOverlay()` + `goScreen('home')`），不會回到「使用者原本在的
那個畫面」。這是刻意的取捨（分階段做，避免一次全部重構），新增這類全螢幕蓋版
時要記得在 `_closeAnySpecialOverlay()` 補上對應的判斷式。

### 統一返回邏輯 `handleBack()`（`script.js`）
優先序：特殊蓋版 → 標準彈窗堆疊（關最上層）→ 畫面歷史（回上一頁）→
都空了（已在首頁）→ 2 秒內再按一次才真的 `App.exitApp()`。
Android 由 `CapApp.addListener('backButton', handleBack)` 觸發；iOS 沒有實體
返回鍵，改用螢幕左緣 24px 內起始、右滑超過 60px 的手勢偵測觸發同一個
`handleBack()`，只在 `Capacitor.getPlatform() === 'ios'` 時啟用。
