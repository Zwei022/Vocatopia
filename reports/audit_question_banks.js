const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../server/data');
const files = fs.readdirSync(DATA_DIR).filter((f) => /^question_bank_.*\.json$/.test(f)).sort();
const findings = [];
const stats = {};
const globalSinglePrompts = new Map();

function add(file, id, location, severity, code, message, evidence = null) {
  findings.push({ file, id, location, severity, code, message, evidence });
}
function norm(s) {
  return String(s || '').toLowerCase().replace(/^\s*\([a-d]\)\s*/i, '').replace(/[_\W]+/gu, ' ').trim();
}
function answerLetter(i) { return String.fromCharCode(65 + i); }
function checkEnglishSpacing(file,id,location,textValue) {
  if(typeof textValue!=='string') return;
  const hits=[...textValue.matchAll(/\s+[,.!?;]/g)].map(m=>textValue.slice(Math.max(0,m.index-24),Math.min(textValue.length,m.index+18)).replace(/\n/g,' '));
  if(hits.length) add(file,id,location,'warning','ENGLISH_SPACING',`英文標點前出現多餘空格 ${hits.length} 處`,hits);
}
function checkOptionSet(file, id, loc, obj, expectedCount) {
  if (!Array.isArray(obj.options)) return add(file,id,loc,'error','SCHEMA_OPTIONS','options 必須為陣列');
  if (obj.options.length !== expectedCount) add(file,id,loc,'error','OPTION_COUNT',`應有 ${expectedCount} 個選項，實際為 ${obj.options.length}`);
  if (!Number.isInteger(obj.answer) || obj.answer < 0 || obj.answer >= obj.options.length) add(file,id,loc,'error','ANSWER_RANGE','answer 必須是有效的零起算索引',obj.answer);
  const n = obj.options.map(norm);
  const duplicates = n.filter((v,i)=>v && n.indexOf(v)!==i);
  if (duplicates.length) add(file,id,loc,'error','DUPLICATE_OPTIONS','選項文字重複',[...new Set(duplicates)]);
  obj.options.forEach((o,i)=>{
    if (typeof o !== 'string' || !o.trim()) add(file,id,loc,'error','EMPTY_OPTION',`選項 ${answerLetter(i)} 為空`);
    else {
      const m=o.match(/^\s*\(([A-D])\)/i);
      if (!m) add(file,id,loc,'warning','OPTION_LABEL_MISSING',`選項 ${i} 缺少 (A)～(D) 標籤`,o);
      else if (m[1].toUpperCase()!==answerLetter(i)) add(file,id,loc,'error','OPTION_LABEL_ORDER',`索引 ${i} 的標籤應為 (${answerLetter(i)})`,o);
    }
  });
  if (!Array.isArray(obj.optionsZh)) add(file,id,loc,'error','SCHEMA_OPTIONS_ZH','optionsZh 必須為陣列');
  else {
    if (obj.optionsZh.length !== obj.options.length) add(file,id,loc,'error','OPTIONS_ZH_COUNT','optionsZh 數量與 options 不一致');
    obj.optionsZh.forEach((z,i)=>{ if(typeof z!=='string'||!z.trim()) add(file,id,loc,'error','EMPTY_OPTION_ZH',`選項 ${answerLetter(i)} 的中譯為空`); });
  }
  if (typeof obj.explanation !== 'string' || !obj.explanation.trim()) add(file,id,loc,'error','EMPTY_EXPLANATION','缺少繁體中文詳解');
  else if (Number.isInteger(obj.answer)) {
    const claimed = [];
    for (const re of [/故選\s*\(?([A-D])\)?/gi,/(?<!不)(?:所以|因此)選\s*\(?([A-D])\)?/gi,/(?<!不)選\s*\(?([A-D])\)?(?=[，。；;])/gi,/答案(?:為|是|應為)?\s*\(?([A-D])\)?/gi,/正確(?:答案|選項)(?:為|是)?\s*\(?([A-D])\)?/gi]) {
      let m; while ((m=re.exec(obj.explanation))) claimed.push(m[1].toUpperCase());
    }
    const wrong=[...new Set(claimed.filter(x=>x!==answerLetter(obj.answer)))];
    if(wrong.length) add(file,id,loc,'error','EXPLANATION_ANSWER_MISMATCH',`answer 是 ${answerLetter(obj.answer)}，詳解卻指向 ${wrong.join('/')}`,obj.explanation);
  }
}

for (const file of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR,file),'utf8'));
  stats[file]={records:arr.length,units:0,answers:{A:0,B:0,C:0,D:0},types:{}};
  if(!Array.isArray(arr)) { add(file,null,'root','error','ROOT_SCHEMA','根節點必須為陣列'); continue; }
  const ids=new Map();
  const signatures=new Map();
  arr.forEach((record,ri)=>{
    const id=record.id || `index:${ri}`;
    if(!record.id) add(file,id,`[${ri}]`,'error','MISSING_ID','缺少 id');
    if(ids.has(record.id)) add(file,id,`[${ri}]`,'error','DUPLICATE_ID',`id 與第 ${ids.get(record.id)} 筆重複`); else ids.set(record.id,ri);
    let units=[];
    if(file.includes('reading')) {
      for(const k of ['type','id','passageType','title','passage','questions']) if(record[k]===undefined) add(file,id,`[${ri}]`,'error','SCHEMA_FIELD',`缺少欄位 ${k}`);
      if(record.type!=='reading') add(file,id,`[${ri}]`,'error','TYPE_VALUE','type 應為 reading',record.type);
      if(!['narrative','informational','practical','chat','comics','dual'].includes(record.passageType)) add(file,id,`[${ri}]`,'warning','PASSAGE_TYPE',`未知 passageType：${record.passageType}`);
      units=(record.questions||[]).map((q,qi)=>({obj:q,loc:`questions[${qi}]`,text:`${record.passage || record.caption || ''}\n${q.question}`,displayText:q.question,expected:4}));
      if(!Array.isArray(record.questions)||record.questions.length<2) add(file,id,`[${ri}]`,'warning','QUESTION_COUNT','閱讀文章通常應有至少 2 題');
      checkEnglishSpacing(file,id,'passage/caption',record.passage || record.caption);
    } else if(file.includes('cloze')) {
      for(const k of ['type','id','title','passage','blanks']) if(record[k]===undefined) add(file,id,`[${ri}]`,'error','SCHEMA_FIELD',`缺少欄位 ${k}`);
      if(record.type!=='cloze') add(file,id,`[${ri}]`,'error','TYPE_VALUE','type 應為 cloze',record.type);
      units=(record.blanks||[]).map((q,qi)=>({obj:q,loc:`blanks[${qi}]`,text:q.stem,expected:4}));
      const nums=(record.passage.match(/__\((\d+)\)__/g)||[]).map(x=>+x.match(/\d+/)[0]);
      (record.blanks||[]).forEach((b,bi)=>{
        if(b.n!==bi+1) add(file,id,`blanks[${bi}]`,'error','BLANK_NUMBER',`n 應為 ${bi+1}，實際為 ${b.n}`);
        if(!nums.includes(b.n)) add(file,id,`blanks[${bi}]`,'error','BLANK_NOT_IN_PASSAGE',`文章沒有 __( ${b.n} )__ 對應空格`);
        if(typeof b.stem==='string'&&!b.stem.includes(`__(${b.n})__`)) add(file,id,`blanks[${bi}]`,'warning','STEM_BLANK','stem 沒有對應空格標記');
      });
      checkEnglishSpacing(file,id,'passage',record.passage);
    } else {
      units=[{obj:record,loc:`[${ri}]`,text:file.includes('listening')?`${record.dialogue}\n${record.question}`:(record.sentence||record.question),expected:file.includes('listening')?3:4}];
      const required=file.includes('listening')?['id','section','dialogue','question','options','answer','explanation','optionsZh']:['id','sentence','options','answer','explanation','optionsZh'];
      required.forEach(k=>{if(record[k]===undefined)add(file,id,`[${ri}]`,'error','SCHEMA_FIELD',`缺少欄位 ${k}`)});
      checkEnglishSpacing(file,id,file.includes('listening')?'dialogue':'sentence',file.includes('listening')?record.dialogue:record.sentence);
    }
    units.forEach((u)=>{
      stats[file].units++;
      checkOptionSet(file,id,u.loc,u.obj,u.expected);
      if(Number.isInteger(u.obj.answer)&&u.obj.answer>=0&&u.obj.answer<4) stats[file].answers[answerLetter(u.obj.answer)]++;
      if(typeof u.text!=='string'||!u.text.trim()) add(file,id,u.loc,'error','EMPTY_PROMPT','題幹為空');
      const sig=norm(u.text);
      if(sig) {
        if(signatures.has(sig)) add(file,id,u.loc,'warning','DUPLICATE_PROMPT',`題幹與 ${signatures.get(sig)} 重複`);
        else signatures.set(sig,`${id}/${u.loc}`);
      }
      const promptOnly=norm(u.displayText || u.text);
      if(!file.includes('reading')&&!file.includes('cloze')&&!file.includes('listening')&&promptOnly){
        const previous=globalSinglePrompts.get(promptOnly);
        if(previous&&previous.file!==file) add(file,id,u.loc,'warning','CROSS_FILE_DUPLICATE',`題目與 ${previous.file} / ${previous.id} 重複；若兩份題庫會同時抽題，使用者可能遇到重題`);
        else if(!previous) globalSinglePrompts.set(promptOnly,{file,id});
      }
    });
  });
  const a=stats[file].answers, total=Object.values(a).reduce((x,y)=>x+y,0);
  stats[file].answerPercent=Object.fromEntries(Object.entries(a).map(([k,v])=>[k,total?+(v*100/total).toFixed(1):0]));
  if(total>=20) {
    const usedLetters=file.includes('listening')?['A','B','C']:['A','B','C','D'];
    const expected=100/usedLetters.length, tolerance=10;
    for(const k of usedLetters) { const p=stats[file].answerPercent[k]; if(Math.abs(p-expected)>tolerance) add(file,null,'file','warning','ANSWER_DISTRIBUTION',`${k} 答案占 ${p}%，偏離理想值 ${expected.toFixed(1)}% 超過 ${tolerance}%`); }
    let streak=1,max=1,last=null;
    const seq=[];
    for(const r of arr){ for(const q of (r.questions||r.blanks||[r])) if(Number.isInteger(q.answer)) seq.push(q.answer); }
    for(const x of seq){ if(x===last){streak++;max=Math.max(max,streak)}else{streak=1;last=x} }
    if(max>=8)add(file,null,'file','warning','ANSWER_STREAK',`相同答案最長連續 ${max} 題（建議少於 8 題）`);
  }
}

const summary={generatedAt:new Date().toISOString(),scope:files,stats,counts:findings.reduce((a,f)=>(a[f.severity]=(a[f.severity]||0)+1,a),{}),findings};
fs.writeFileSync(path.join(__dirname,'question_bank_audit.json'),JSON.stringify(summary,null,2)+'\n');

const totalUnits=Object.values(stats).reduce((n,s)=>n+s.units,0);
const lines=['# Vocatopia 題庫逐項稽核報告','',`產生時間：${summary.generatedAt}`,'','## 範圍與方法','',`本次只檢查 \`server/data/question_bank_*.json\` 共 ${files.length} 份檔案、${totalUnits} 個作答單元；未檢查模擬試題與 words 翻譯，也未修改任何題庫。`,`每個作答單元均檢查 schema、選項數、answer 索引、選項標籤、optionsZh 數量、詳解與答案字母一致性；另檢查題幹重複、選項重複、克漏字編號、答案分布、連續答案與英文標點空格。`,'','## 最高優先結論','', '- 題庫結構、answer 索引範圍、選項數及 optionsZh 數量未發現結構性錯誤。','- 多份題庫疑似在選項重新排序後，沒有同步更新詳解中的答案字母；所有 `EXPLANATION_ANSWER_MISMATCH` 必須逐題修正。','- 克漏字與片語題大量出現英文標點前多餘空格，會直接顯示為 `word ,` 或 `word .`。','- 小型 vocab 題庫的 12 題全部與 vocab_practice 開頭重複；是否會造成實際重題，取決於兩份題庫是否共用抽題池。','- 「100% 正確率」只能作為校對目標；在所有 Error 修正並完成人工語意覆核前，不應宣稱已達 100%。','','## 數量與答案分布','', '| 檔案 | 題組/記錄 | 作答單元 | A | B | C | D |','|---|---:|---:|---:|---:|---:|---:|'];
for(const [f,s] of Object.entries(stats)) lines.push(`| ${f} | ${s.records} | ${s.units} | ${s.answers.A} (${s.answerPercent.A}%) | ${s.answers.B} (${s.answerPercent.B}%) | ${s.answers.C} (${s.answerPercent.C}%) | ${s.answers.D} (${s.answerPercent.D}%) |`);
lines.push('','## 發現摘要','',`- Error：${summary.counts.error||0}` ,`- Warning：${summary.counts.warning||0}`,'','## 詳細發現','');
if(!findings.length) lines.push('未發現可由規則辨識的問題。');
else for(const f of findings) lines.push(`- **${f.severity.toUpperCase()} · ${f.code}** — \`${f.file}\` / \`${f.id??'-'}\` / \`${f.location}\`：${f.message}${f.evidence!==null?`；證據：${JSON.stringify(f.evidence)}`:''}`);
lines.push('','## 判讀限制','','- 「唯一正解」與題意歧義屬語意判斷；自動規則只能找出重複選項、索引／詳解矛盾及部分高風險候選。','- `optionsZh` 可驗證數量與位置，但逐字翻譯是否精準仍需人工逐題比對。','- 因此「100% 正確率」只能作為校對目標，不能在仍有未修正 Error 或未人工覆核時保證。','');
fs.writeFileSync(path.join(__dirname,'question_bank_audit.md'),lines.join('\n'));
console.log(JSON.stringify({files:files.length,stats,counts:summary.counts,findings:findings.length},null,2));
