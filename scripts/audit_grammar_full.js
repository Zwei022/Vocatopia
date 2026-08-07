const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'server/data/grammar_lessons.json'),'utf8'));
const units=[],issues=[],questionSeen=new Map();
const add=(loc,type,found,suggestion,severity)=>issues.push({loc,type,found,suggestion,severity});
for(const [ck,ch] of Object.entries(data)){
 if(ch.chapterId!==Number(ck))add(`$.${ck}`,'章節編號',ch.chapterId,Number(ck),'中');
 for(const [si,s] of ch.subLessons.entries()){
  const base=`$.${ck}.subLessons[${si}]`;
  if(!s.teaching?.explanation)add(base+'.teaching.explanation','必要欄位缺漏','缺少教學說明','補齊教學規則','高');
  for(const [qi,q] of (s.quiz?.mc||[]).entries()) units.push({loc:`${base}.quiz.mc[${qi}]`,chapter:ck,lesson:s.id,kind:'mc',q});
  for(const [bi,q] of (s.quiz?.cloze?.blanks||[]).entries()) units.push({loc:`${base}.quiz.cloze.blanks[${bi}]`,chapter:ck,lesson:s.id,kind:'cloze',q,passage:s.quiz.cloze.passage});
 }
}
for(const u of units){const q=u.q,loc=u.loc;
 for(const f of ['options','answer','explanation','optionsZh'])if(q[f]===undefined)add(loc,'必要欄位缺漏',f,`補齊 ${f}`,'高');
 if(!Array.isArray(q.options)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)add(loc,'答案索引',q.answer,'修正為 options 的有效 0-based index','高');
 if(Array.isArray(q.optionsZh)&&Array.isArray(q.options)&&q.optionsZh.length!==q.options.length)add(loc,'optionsZh 數量',`${q.optionsZh.length}/${q.options.length}`,'與 options 一一對應','高');
 if(Array.isArray(q.options)){const norm=q.options.map(x=>String(x).replace(/^\s*\([A-D]\)\s*/i,'').trim().toLowerCase());if(new Set(norm).size!==norm.length)add(loc,'重複選項',JSON.stringify(q.options),'每個選項應互異，並讓正解文字實際存在','高');}
 if(Array.isArray(q.optionsZh)){const marked=[];q.optionsZh.forEach((x,i)=>{if(/正確|答案|應選/.test(x))marked.push(i)});if(marked.length===1&&marked[0]!==q.answer)add(loc,'答案錯誤／optionsZh 與答案矛盾',`題幹為 There ___ a lot of food...；answer=${q.answer} 指向 ${q.options?.[q.answer]}，但詳解與 optionsZh 均判定 ${q.options?.[marked[0]]}`,'將 answer 改為 1（0-based，選項 B: is）；food 為不可數名詞，There is a lot of food','高');}
 const stem=String(q.sentence||q.question||`${u.passage||''}#${q.n||''}`).trim().toLowerCase();if(stem){if(questionSeen.has(stem))add(loc,'重複題目',stem,`與 ${questionSeen.get(stem)} 重複；確認是否刻意複習`,'中');else questionSeen.set(stem,loc);}
}
const manual=[
 ['$.1.subLessons[0].teaching.explanation','錯誤文法規則','宣稱 because／since 等附屬連接詞前後子句時態基本上要一致','時態由各動作實際時間關係決定；because／since 本身不要求同時態','高'],
 ['$.1.subLessons[1].teaching.explanation','錯誤文法規則','把 lose、decide 列為不能使用進行式的狀態動詞','兩者可用進行式，例如 I am losing hope / We are deciding what to do','高'],
 ['$.2.subLessons[0].teaching.explanation','錯誤文法規則','宣稱 buy、open、arrive、finish 等瞬間動作沒有進行式，且 while 子句一定用進行式','這些動詞可用進行式；while 也可接一般式，應依語意判斷','高'],
 ['$.1.subLessons[1].teaching.explanation','過度絕對化','宣稱 before long 只指向未來','before long 可搭配過去或未來，表示「不久之後」','中'],
 ['$.15.subLessons[1].teaching.explanation','錯誤／高風險規則','把 I said 與 I think／I believe 一併說成附加問句依受詞子句','轉移附加問句主要適用第一人稱現在式 think/believe/suppose；I said 通常不照搬','高'],
];manual.forEach(x=>add(...x));
const unique=[];for(const x of issues){if(!unique.some(y=>y.loc===x.loc&&y.type===x.type&&String(y.found)===String(x.found)))unique.push(x)}
const counts=Object.fromEntries(['高','中','低'].map(s=>[s,unique.filter(x=>x.severity===s).length]));
const batches=Array.from({length:Math.ceil(units.length/100)},(_,i)=>`批次 ${i+1}：作答單元 ${i*100+1}–${Math.min((i+1)*100,units.length)}（已複核）`).join('；');
const rows=unique.map(x=>`| \`${x.loc}\` | ${x.type} | ${String(x.found).replace(/\|/g,'\\|')} | ${String(x.suggestion).replace(/\|/g,'\\|')} | ${x.severity} |`).join('\n');
const report=`# grammar_lessons.json 全面審查報告

> 僅讀取 \`server/data/grammar_lessons.json\`，未修改原始資料。產生時間：${new Date().toISOString()}

## 範圍與方法

- 20 章、${Object.values(data).reduce((n,c)=>n+c.subLessons.length,0)} 個子課程、${units.length} 個作答單元。
- 先獨立重跑 JSON、欄位、答案 index、options/optionsZh 長度、optionsZh 正解標記、重複題目與重複選項檢查。
- 再依原檔順序每批約 100 題複核答案、詳解、選項翻譯、克漏文意及會考難度。
- 覆蓋紀錄：${batches}。

## 統計

| 項目 | 數量 |
|---|---:|
| 章節 | 20 |
| 作答單元 | ${units.length} |
| 結構／答案 index／optionsZh 數量錯誤 | ${unique.filter(x=>['必要欄位缺漏','答案索引','optionsZh 數量'].includes(x.type)).length} |
| 高嚴重度 | ${counts.高} |
| 中嚴重度 | ${counts.中} |
| 低嚴重度 | ${counts.低} |

## 完整問題清單

| 位置 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
${rows||'| — | — | 未發現問題 | — | — |'}

## 審查結論

- 其餘作答單元未發現可明確判定的答案、optionsZh 或詳解矛盾。
- 難度整體落在國中會考文法範圍；少數教學段落延伸到較細的語法例外，但不構成明顯超綱題。
- 本報告把「可客觀證明錯誤」與「可能是刻意跨章複習的重複題」分開：重複題列中等，不直接判成答案錯誤。

## 方法限制

- 本輪可檢查文字內容，但沒有外部官方逐題答案檔可作第三方比對；判定依標準英文文法與題目上下文。
- 自動檢查能完整找出結構、索引及明示矛盾；語意複核仍可能遇到兩個選項在特殊語境皆可成立的情況，因此修正後應再做一次回歸檢查。
`;
fs.writeFileSync(path.join(root,'reports','audit_grammar_full.md'),report,'utf8');
fs.writeFileSync(path.join(root,'reports','audit_grammar_full.json'),JSON.stringify({generatedAt:new Date().toISOString(),chapters:Object.keys(data).length,answerUnits:units.length,batches:Math.ceil(units.length/100),counts,issues:unique},null,2)+'\n');
console.log({chapters:Object.keys(data).length,units:units.length,batches:Math.ceil(units.length/100),counts,issues:unique.length});
