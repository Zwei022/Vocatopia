-- 修復 words 表未開啟 RLS 的漏洞
-- 問題：Supabase Dashboard 確認 words 表「RLS DISABLED」，且無任何 policy，
--       代表任何人只要有 anon key 就能透過 Data API 讀寫這張表（包含新增/竄改/
--       刪除單字內容）。單字內容本身不是機敏資料，本來就要給前端讀取，
--       但「任何人可寫入」是需要立即封鎖的漏洞。
-- 在 Supabase SQL Editor 貼上執行一次即可。

-- 1) 先明確收回 anon / authenticated 的寫入權限（防禦性作法：即使之後 RLS
--    policy 設定有疏漏，寫入權限本身就已經被擋在最外層）
revoke insert, update, delete on public.words from anon, authenticated;
grant select on public.words to anon, authenticated;

-- 2) 開啟 RLS
alter table public.words enable row level security;

-- 3) 只開放唯讀 policy，比照 checkin_reward_config 的作法
--    （單字內容前端要顯示給所有使用者，含未登入狀態，所以開放給 anon）
drop policy if exists words_read_all on public.words;
create policy words_read_all on public.words
  for select using (true);

-- 沒有建立任何 INSERT/UPDATE/DELETE policy：預設狀態下 RLS 會擋掉所有寫入，
-- 只有用 service-role key 的後端（維運腳本/管理後台）能繞過 RLS 寫入單字資料。
