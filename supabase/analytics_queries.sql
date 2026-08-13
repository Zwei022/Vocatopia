-- Vocatopia 使用狀況檢討查詢集
-- 用法：整段或單一段落貼到 Supabase Dashboard → SQL Editor 執行。
-- 前置條件：migrations/analytics_events.sql 已套用（events 表已建立且已累積資料）。

-- 1) 每日活躍使用者（DAU，依 app_open 事件計算，近 30 天）
select date_trunc('day', created_at)::date as day,
       count(distinct user_id) as dau
from public.events
where event_type = 'app_open' and created_at > now() - interval '30 days'
group by 1 order by 1;

-- 2) 各功能使用次數排行（screen_view 依畫面分類，近 7 天）
select metadata->>'screen' as screen, count(*) as views, count(distinct user_id) as unique_users
from public.events
where event_type = 'screen_view' and created_at > now() - interval '7 days'
group by 1 order by 2 desc;

-- 3) 各事件類型總覽（近 7 天，看整體哪個功能最常被觸發）
select event_type, count(*) as total, count(distinct user_id) as unique_users
from public.events
where created_at > now() - interval '7 days'
group by 1 order by 2 desc;

-- 4) 新使用者次日留存（D1 retention）粗估：
--    以 profiles.created_at 當天算一批新使用者，看他們隔天有沒有出現在 app_open 事件裡
with cohort as (
  select id, created_at::date as signup_day
  from public.profiles
  where created_at > now() - interval '30 days'
)
select c.signup_day,
       count(distinct c.id) as new_users,
       count(distinct e.user_id) as returned_next_day,
       round(100.0 * count(distinct e.user_id) / nullif(count(distinct c.id), 0), 1) as d1_retention_pct
from cohort c
left join public.events e
  on e.user_id = c.id
 and e.event_type = 'app_open'
 and e.created_at::date = c.signup_day + 1
group by c.signup_day
order by c.signup_day;

-- 5) 連續紀錄分布（現在有多少人 streak 在各區間，判斷 streak freeze 上線後有沒有效）
select
  case
    when streak = 0 then '0（無紀錄）'
    when streak between 1 and 2 then '1-2 天'
    when streak between 3 and 6 then '3-6 天'
    when streak between 7 and 13 then '7-13 天'
    else '14 天以上'
  end as streak_bucket,
  count(*) as users
from public.profiles
group by 1 order by min(coalesce(streak, 0));

-- 6) 抽卡活躍度：近 7 天有抽卡的使用者數 vs 抽卡總次數
select count(distinct user_id) as gacha_users,
       coalesce(sum((metadata->>'count')::int), 0) as total_pulls
from public.events
where event_type = 'gacha_pull' and created_at > now() - interval '7 days';
