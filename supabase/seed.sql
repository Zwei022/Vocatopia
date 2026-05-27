-- ============================================================
-- Vocatopia Seed — 閱讀文章（單字已有 100 筆）
-- Run AFTER schema.sql
-- ============================================================

insert into articles (title, content, emoji, tag, locked, year) values
(
  'The Power of Habit',
  E'Every morning, millions of people wake up and follow the same routine. They brush their teeth, make coffee, and check their phones. These actions happen automatically because of habits.\n\nHabits are powerful tools. Scientists have found that about 40 percent of our daily actions are habits. A habit has three parts: a cue, a routine, and a reward. The cue triggers the habit. The routine is the behavior itself. The reward is what you get from doing it.\n\nUnderstanding habits can help you improve your life. If you want to build a new habit, start small. Do it every day at the same time. After a few weeks, it becomes automatic.',
  '🌿', '精選', false, null
),
(
  'Ocean Plastic Pollution',
  E'Every year, millions of tons of plastic enter the ocean. This pollution harms sea animals and damages marine ecosystems. Sea turtles mistake plastic bags for jellyfish. Fish eat tiny pieces of plastic, called microplastics.\n\nScientists estimate that by 2050, there could be more plastic than fish in the ocean by weight. This is a serious environmental problem that requires immediate action.\n\nMany countries have started to ban single-use plastics. You can help by using reusable bags, avoiding plastic straws, and joining local beach cleanups.',
  '🌊', '精選', false, null
),
(
  '2023 會考閱讀理解',
  E'Dear Lisa,\n\nI am writing to thank you for your help last month. When I first arrived in Taiwan, I felt lost and nervous. I could not speak Chinese, and everything was different from my home country.\n\nYou were the first person to speak to me in English. You helped me find the school office and showed me around the campus. Your kindness made a huge difference.\n\nNow I have many friends and I love studying here. I hope we can stay in touch. Please come visit me someday.\n\nYour friend,\nSarah',
  '📖', '歷屆', false, 2023
),
(
  '2022 會考閱讀理解',
  '',
  '🤖', '歷屆', true, 2022
),
(
  'Benefits of Exercise',
  '',
  '🏃', '精選', true, null
)
on conflict do nothing;
