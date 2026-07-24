-- 推播通知實際觸發點所需的欄位：目前 sendPushToUsers() 只有 /api/push/test 會呼叫，
-- 這個 migration 補上讓每日提醒/回訪提醒/訂閱到期提醒能運作所需的追蹤欄位，
-- 以及讓使用者能個別關閉某一類通知的偏好設定。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  -- 最後活躍時間：App 開啟且已登入時由前端更新（見 auth.js _loadProfile()），
  -- 用來判斷「好幾天沒開 App」的回訪提醒對象。
  add column if not exists last_active_at timestamptz,
  -- 避免回訪提醒對長期不活躍的使用者每天狂發，最多一週發一次。
  add column if not exists last_winback_sent_at timestamptz,
  -- 通知偏好，key 不存在時預設視為 true（開啟）。
  -- 類別：streak(每日打卡提醒) / social(好友邀請、對戰邀請) / arena(競技場週結算) /
  --      winback(回訪提醒) / subscription(訂閱到期提醒)
  add column if not exists push_prefs jsonb not null default '{}'::jsonb;
