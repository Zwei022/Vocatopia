-- 統一舊版中譯欄位；只搬移確定含中文字的資料。
update public.words
set definition_zh = definition
where coalesce(definition_zh, '') = '' and definition ~ '[一-龥]';

-- 已逐項確認的高信心錯義。
update public.words set
  definition = case lower(word)
    when 'industry' then 'An area of business that produces goods or provides services.'
    when 'japan' then 'A country in East Asia made up of many islands.'
    when 'ma''am' then 'A polite way to address a woman.'
    when 'mandarin' then 'The standard form of Chinese spoken in Taiwan and China.'
    when 'marker' then 'A pen with a thick tip used for writing or drawing.'
    when 'measurement' then 'The act of measuring something or the result obtained.'
    when 'melon' then 'A large, round fruit with sweet, juicy flesh.'
    when 'michael jackson' then 'An American singer and dancer known around the world as the King of Pop.' end,
  definition_zh = case lower(word)
    when 'industry' then '工業；產業；行業' when 'japan' then '日本'
    when 'ma''am' then '女士；太太；小姐（對女性的禮貌稱呼）'
    when 'mandarin' then '國語；華語；普通話' when 'marker' then '麥克筆；簽字筆；白板筆'
    when 'measurement' then '測量；尺寸；測量結果' when 'melon' then '瓜；甜瓜'
    when 'michael jackson' then '麥可・傑克森；美國歌手與舞者，被稱為「流行樂之王」' end
where lower(word) in ('industry','japan','ma''am','mandarin','marker','measurement','melon','michael jackson');

-- 補齊原本沒有中譯的基本字。
update public.words set definition_zh = case lower(word)
  when 'deer' then '鹿' when 'donkey' then '驢子' when 'eagle' then '老鷹；鷹'
  when 'eat' then '吃' when 'glasses' then '眼鏡' when 'mosquito' then '蚊子'
  when 'pear' then '梨子' when 'poem' then '詩；詩歌' when 'stomachache' then '胃痛；肚子痛'
  when 'vinegar' then '醋' when 'whale' then '鯨魚' end
where lower(word) in ('deer','donkey','eagle','eat','glasses','mosquito','pear','poem','stomachache','vinegar','whale');

update public.words set
  example_en = case lower(word)
    when 'convenience store' then 'I bought some milk at the convenience store.'
    when 't-shirt' then 'He wore a blue T-shirt to the picnic.' end,
  example_zh = case lower(word)
    when 'convenience store' then '我在便利商店買了一些牛奶。'
    when 't-shirt' then '他穿著藍色T恤去野餐。' end
where lower(word) in ('convenience store','t-shirt');
