/**
 * Unit 15-20 比對＋標記＋標籤升格（一支腳本處理 6 個 Unit）。
 * 對每個 Unit 的書上單字清單：
 *   1. 用 .ilike('word', word) 查資料庫
 *   2. 已存在 → 加上 unitN 標籤（保留原有 tags），並修正 user_lookup/user_custom → cap_2000
 *   3. 缺少 → 記錄下來，輸出成 JSON 給下一支 insert 腳本使用
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNITS = {
  15: {
    topic: '數字 (Numbers)',
    basic: `a few,a little,a lot,all,any,both,few,less,little,many,more,much,number,several,some,total`.split(','),
    adv: `add,addition,divide,division,double,minus,plus,times`.split(','),
  },
  16: {
    topic: '時間 (Time)',
    basic: `a.m.,afternoon,ago,already,April,August,autumn,clock,date,day,December,early,evening,February,Friday,future,half,hour,January,July,June,last,late,later,March,May,minute,moment,Monday,month,morning,next,night,noon,November,now,o'clock,October,once,p.m.,past,quarter,Saturday,season,second,September,soon,spring,summer,Thursday,time,today,tomorrow,tonight,Tuesday,watch,Wednesday,week,weekend,winter`.split(','),
    adv: `alarm clock,calendar,daily,dawn,midnight,monthly,period,stopwatch,weekday,weekly,yearly`.split(','),
  },
  17: {
    topic: '金錢 (Money)',
    basic: `borrow,buy,cent,change,cheap,cost,deal,dollar,expensive,lend,money,pay,price,prize,save,sell,spend`.split(','),
    adv: `bill,cash,charge,coin,credit card,currency,debt,earn,fee,fine,income,loss`.split(','),
  },
  18: {
    topic: '尺寸、形狀、測量 (Size, Shape & Measurements)',
    basic: `big,bottle,can,centimeter,circle,cup,dot,dozen,far,foot,glass,gram,high,huge,inch,kilogram,large,line,little,long,low,medium,mile,pack,package,pair,piece,point,pound,round,row,shape,sharp,short,side,size,small,square,straight,tall,thick,tiny`.split(','),
    adv: `amount,bit,bundle,circular,deep,distant,extra,height,kilometer,length,level,liter,loaf,maximum,measure,meter,narrow,pattern,range,rectangle,regular,scale,spacious,standard,triangle,unit,volume,weight,wide,widen,width`.split(','),
  },
  19: {
    topic: '假日、節慶 (Holidays & Festivals)',
    basic: `birthday,celebrate,Chinese New Year,Christmas,Easter,Father's Day,festival,gift,Halloween,holiday,Lantern Festival,Moon Festival,Mother's Day,New Year's Day,New Year's Eve,party,photo,Teacher's Day,vacation`.split(','),
    adv: `album,congratulation,culture,custom,Double Tenth Day,Dragon Boat Festival,invitation,memory,Thanksgiving,Valentine's Day`.split(','),
  },
  20: {
    topic: '國家、地區、語言 (Countries, Cities & Languages)',
    basic: `America,American,China,Chinese,country,English,national,ROC,Taiwan,USA,world`.split(','),
    adv: `Asia,Asian,Australia,Australian,Britain,British,Canada,Canadian,England,Englishman,Europe,European,flag,France,French,German,Germany,governmental,Hong Kong,Hualien,international,Japan,Japanese,Kaohsiung,kingdom,Korea,Korean,local,London,Mandarin,nation,New York,overseas,Paris,Philippines,region,regional,Russia,Russian,section,Singapore,state,Taichung,Tainan,Taiwanese`.split(','),
  },
};

async function processUnit(n, def) {
  const tag = `unit${n}`;
  const allWords = [
    ...def.basic.map(w => ({ word: w, tier: '基礎' })),
    ...def.adv.map(w => ({ word: w, tier: '進階' })),
  ];
  console.log(`\n===== Unit ${n}（${def.topic}）書上共 ${allWords.length} 字（基礎 ${def.basic.length} + 進階 ${def.adv.length}）=====`);

  const matched = [];
  const missing = [];

  for (const { word, tier } of allWords) {
    const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) matched.push({ ...data[0], tier });
    else missing.push({ word, tier });
  }

  console.log(`比對結果：資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
  if (missing.length) {
    console.log('缺少的字：');
    console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
  }

  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = m.tags || [];
    const hadLookup = tags.includes('user_lookup') || tags.includes('user_custom');
    if (hadLookup) {
      tags = tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000');
      promoted++;
    }
    const newTags = Array.from(new Set([...tags, tag]));
    if (newTags.length === (m.tags || []).length && !hadLookup) continue; // 已有 tag 且無需升格
    const { error } = await supabase.from('words').update({ tags: newTags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`已為 ${tagged} 個字加上 ${tag} 標籤（含更新），其中 ${promoted} 個做了 user_lookup/user_custom → cap_2000 升格修正`);

  return { unit: n, topic: def.topic, total: allWords.length, matchedCount: matched.length, missing, tagged, promoted };
}

async function main() {
  const results = [];
  for (const [n, def] of Object.entries(UNITS)) {
    results.push(await processUnit(Number(n), def));
  }
  const outPath = path.join(__dirname, 'unit15to20_missing.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n\n已將缺字清單寫入 ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
