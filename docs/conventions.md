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
