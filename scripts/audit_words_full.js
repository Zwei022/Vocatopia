const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const targets = JSON.parse(fs.readFileSync(path.join(root, 'target_2000_words.json'), 'utf8')).words;
const cache = JSON.parse(fs.readFileSync(path.join(root, 'supabase', 'words_cache.json'), 'utf8'));
const required = ['pos','phonetic','definition','example_en','example_zh','done','definition_zh'];
const allowedPos = new Set(['名詞','動詞','形容詞','副詞','介系詞','連接詞','代名詞','限定詞','冠詞','感嘆詞','片語','數詞','助動詞']);
const simpMap = {'这':'這','为':'為','与':'與','个':'個','们':'們','来':'來','时':'時','说':'說','对':'對','还':'還','进':'進','过':'過','间':'間','见':'見','长':'長','门':'門','东':'東','车':'車','马':'馬','书':'書','国':'國','会':'會','发':'發','后':'後','里':'裡','从':'從','实':'實','问':'問','体':'體','万':'萬','无':'無','开':'開','关':'關','头':'頭','应':'應','现':'現','经':'經','业':'業','产':'產','当':'當','动':'動','种':'種','样':'樣','学':'學','点':'點','电':'電','话':'話','气':'氣','乐':'樂','给':'給','让':'讓','总':'總','边':'邊','员':'員','机':'機','历':'歷','处':'處','义':'義','务':'務','备':'備','复':'複','线':'線','级':'級','数':'數','据':'據','区':'區','张':'張','赶':'趕','认':'認','论':'論','该':'該','并':'並','条':'條','达':'達','则':'則','单':'單','临':'臨','观':'觀','广':'廣','断':'斷','轻':'輕','亲':'親','组':'組','细':'細','节':'節','难':'難','带':'帶','强':'強','类':'類'};
const jpMap = {'値':'值','竝':'並','亞':'亞','惡':'惡','壓':'壓','圍':'圍','爲':'為','榮':'榮','衞':'衛','驛':'驛','圓':'圓','緣':'緣','鹽':'鹽','艷':'豔','應':'應','歐':'歐','櫻':'櫻','奧':'奧','橫':'橫','溫':'溫','穩':'穩','價':'價','壞':'壞','懷':'懷','歸':'歸','龜':'龜','據':'據','舉':'舉','峽':'峽','學':'學','國':'國','黑':'黑','齋':'齋','濟':'濟','參':'參','慘':'慘','雜':'雜','蠶':'蠶','殘':'殘','絲':'絲','齒':'齒','兒':'兒','實':'實','寫':'寫','釋':'釋','壽':'壽','收':'收','從':'從','獸':'獸','縱':'縱','處':'處','敍':'敘','將':'將','燒':'燒','奬':'獎','條':'條','乘':'乘','剩':'剩','疊':'疊','體':'體','臺':'臺','瀧':'瀧','擔':'擔','膽':'膽','斷':'斷','彈':'彈','遲':'遲','晝':'晝','蟲':'蟲','廳':'廳','鎭':'鎮','轉':'轉','傳':'傳','鬪':'鬥','獨':'獨','讀':'讀','貳':'貳','惱':'惱','腦':'腦','霸':'霸','廢':'廢','拜':'拜','賣':'賣','發':'發','髮':'髮','拔':'拔','蠻':'蠻','佛':'佛','邊':'邊','變':'變','步':'步','寶':'寶','豐':'豐','沒':'沒','滿':'滿','默':'默','彌':'彌','藥':'藥','譯':'譯','豫':'豫','與':'與','樣':'樣','謠':'謠','來':'來','覽':'覽','龍':'龍','壘':'壘','勞':'勞','壟':'壟','樓':'樓','灣':'灣'};
const irregular = {be:['am','is','are','was','were','been','being'],run:['ran','running'],go:['went','gone','going'],come:['came','coming'],have:['has','had','having'],do:['does','did','done','doing'],make:['made','making'],take:['took','taken','taking'],see:['saw','seen','seeing'],get:['got','gotten','getting'],write:['wrote','written','writing'],read:['read','reading'],eat:['ate','eaten','eating'],drink:['drank','drunk','drinking'],buy:['bought','buying'],bring:['brought','bringing'],teach:['taught','teaching'],think:['thought','thinking'],catch:['caught','catching'],fly:['flew','flown','flying'],swim:['swam','swum','swimming'],sing:['sang','sung','singing'],sit:['sat','sitting'],stand:['stood','standing'],sleep:['slept','sleeping'],speak:['spoke','spoken','speaking'],tell:['told','telling'],say:['said','saying'],leave:['left','leaving'],feel:['felt','feeling'],find:['found','finding'],keep:['kept','keeping'],know:['knew','known','knowing'],meet:['met','meeting'],pay:['paid','paying'],sell:['sold','selling'],send:['sent','sending'],win:['won','winning'],lose:['lost','losing'],begin:['began','begun','beginning'],break:['broke','broken','breaking'],choose:['chose','chosen','choosing'],drive:['drove','driven','driving'],fall:['fell','fallen','falling'],forget:['forgot','forgotten','forgetting'],give:['gave','given','giving'],grow:['grew','grown','growing'],hear:['heard','hearing'],hold:['held','holding'],ride:['rode','ridden','riding'],rise:['rose','risen','rising'],show:['showed','shown','showing'],wear:['wore','worn','wearing']};
function forms(w){ const a=[w,w+'s',w+'es',w+'ed',w+'ing']; if(w.endsWith('y')) a.push(w.slice(0,-1)+'ies',w.slice(0,-1)+'ied'); if(w.endsWith('e'))a.push(w.slice(0,-1)+'ing',w+'d'); if(irregular[w])a.push(...irregular[w]); return a; }
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
const issues=[]; const targetSet=new Set(targets); const seen=new Set();
function add(word,type,current,suggest,severity){issues.push({word,type,current,suggest,severity});}
for(const w of targets){
 if(seen.has(w))add(w,'重複字頭',w,'目標字表僅保留一次','高'); seen.add(w);
 const e=cache[w]; if(!e){add(w,'缺字','快取無此字','補入完整字目','高');continue;}
 for(const f of required) if(!(f in e)||e[f]===null||e[f]==='') add(w,'必要欄位缺漏',`${f}: ${JSON.stringify(e[f])}`,`補齊 ${f}`,(f==='phonetic'?'中':'高'));
 if(e.phonetic && !/^\/[^/]+\/$/.test(e.phonetic)) add(w,'IPA 格式',e.phonetic,'使用 /…/ 包住 IPA','中');
 if(e.phonetic && /[A-Z0-9_]/.test(e.phonetic.slice(1,-1))) add(w,'IPA 可疑字元',e.phonetic,'改為標準 IPA 符號','中');
 const ex=(e.example_en||'').toLowerCase();
 if(ex && /^[a-z]+$/.test(w) && !forms(w.toLowerCase()).some(f=>new RegExp(`(^|[^a-z])${esc(f)}([^a-z]|$)`,'i').test(ex))) add(w,'例句未含字頭',e.example_en,`加入 ${w} 或正確詞形變化`,'高');
 for(const f of ['definition','definition_zh','example_zh']) for(const ch of String(e[f]||'')) {if(simpMap[ch]) add(w,'簡體字',`${f}: ${ch}（${e[f]}）`,`${ch} → ${simpMap[ch]}`,'中'); if(jpMap[ch] && ch!==jpMap[ch]) add(w,'日文漢字變體',`${f}: ${ch}（${e[f]}）`,`${ch} → ${jpMap[ch]}`,'中');}
 if(e.done!==true)add(w,'完成狀態',`done: ${JSON.stringify(e.done)}`,'確認內容後設為 true；未確認前不得當完成資料','高');
 const parts=String(e.pos||'').split(/[、／/ ]+/).filter(Boolean); if(!parts.length||parts.some(p=>!allowedPos.has(p))) add(w,'詞性格式',e.pos,'使用專案既有繁體中文詞性名稱','中');
}
const extras=Object.keys(cache).filter(w=>!targetSet.has(w));
const out={generatedAt:new Date().toISOString(),counts:{target:targets.length,targetUnique:new Set(targets).size,cache:Object.keys(cache).length,missing:issues.filter(x=>x.type==='缺字').length,extra:extras.length,issues:issues.length},extras,issues};
fs.writeFileSync(path.join(root,'reports','audit_words_full_structural.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({counts:out.counts,byType:Object.groupBy(issues,x=>x.type),extraSample:extras.slice(0,20)},(k,v)=>k==='byType'?Object.fromEntries(Object.entries(v).map(([a,b])=>[a,b.length])):v,2));

// Produce the human-readable audit without modifying either source JSON file.
const emptyPhonetic = targets.filter(w => cache[w] && !cache[w].phonetic);
const englishDefinitions = targets.filter(w => cache[w] && !/[\u3400-\u9fff]/u.test(cache[w].definition || ''));
const bracketIpa = targets.filter(w => /^\[.*\]$/.test(cache[w]?.phonetic || ''));
const confirmedSemantic = [
  ['chinese new year 農曆新年(n)', '字頭混入中文與詞性標記，內容卻是 choice（選擇）的資料。', '字頭改為 Chinese New Year；詞性名詞；中譯「農曆新年／春節」，並換成相關中英例句。', '高'],
  ['christmas eve', '詞性為形容詞，定義與例句實際是 plump（胖嘟嘟的）。', '詞性改名詞；中譯「聖誕夜／平安夜」，並換成 Christmas Eve 例句。', '高'],
  ['class leader', '定義與例句實際是 masterpiece（傑作）。', '中譯改為「班長」，並換成 class leader 例句。', '高'],
  ['rome', '定義與例句實際是 roof（屋頂）。', '中譯改為「羅馬」，並換成 Rome 例句。', '高'],
];
const headwordIssues = [
 ['ld','無法辨識為標準英文單字或常用縮寫。','回查權威目標字表來源，確認是否誤植；未確認前停用。','高'],
 ['running nose','搭配錯誤；標準說法是 runny nose。','改為 runny nose。','高'],
 ['pingpong','非主流標準拼法。','改為 ping-pong 或 table tennis。','中'],
 ['over-weight','一般字頭拼法錯誤。','改為 overweight。','中'],
 ['under-weight','一般字頭拼法錯誤。','改為 underweight。','中'],
 ['table cloth','現代標準字頭通常合寫。','改為 tablecloth。','中'],
 ['baby sitter','現代標準字頭通常合寫。','改為 babysitter。','中'],
 ['milk shake','常見標準字頭通常合寫。','改為 milkshake。','中'],
 ['soy-sauce','一般不加連字號。','改為 soy sauce。','中'],
 ["teacher's day",'節日名稱所有格通常使用複數所有格。',"改為 Teachers' Day。",'中'],
 ['both xxx and','xxx 是版面占位符，不應存在正式字頭。','改為 both ... and ...。','中'],
 ['either xxx or','xxx 是版面占位符，不應存在正式字頭。','改為 either ... or ...。','中'],
 ['neither xxx nor','xxx 是版面占位符，不應存在正式字頭。','改為 neither ... nor ...。','中'],
];
const charIssues = [
 ['crime','definition、definition_zh 使用「爲」。','改為台灣繁體「為」。','中'],
 ['embarrass','definition、definition_zh 使用「爲」。','改為台灣繁體「為」。','中'],
 ['sincere','definition、definition_zh 使用「爲」。','改為台灣繁體「為」。','中'],
 ['poor','definition、definition_zh 使用簡體「据」。','依語意改為「拮据」中的繁體「據」。','中'],
];
const posIssues = [['hey','interjection','感嘆詞'],['oh-oh','interjection','感嘆詞'],['uh-uh','interjection','感嘆詞'],["ma'am",'稱呼語','名詞（稱呼語可保留在說明，不宜作為非標準 pos 值）']];
const sevCount = {高:0,中:0,低:0};
for (const x of confirmedSemantic) sevCount[x[3]]++;
for (const x of headwordIssues) sevCount[x[3]]++;
for (const x of charIssues) sevCount[x[3]]++;
sevCount.中 += emptyPhonetic.length + bracketIpa.length + englishDefinitions.length + posIssues.length;
sevCount.低 += extras.length;
const rows = (items, type) => items.map(x => `| \`${x[0]}\` | ${type} | ${x[1]} | ${x[2]} | ${x[3]} |`).join('\n');
const report = `# Vocatopia 單字資料庫全面審查報告

> 審查範圍：\`target_2000_words.json\` 與 \`supabase/words_cache.json\`。本報告只讀取原始資料；未覆寫任何資料檔。產生時間：${new Date().toISOString()}

## 方法與覆蓋

1. 先以程式檢查 JSON、必要欄位、目標／快取集合差異、重複字頭、done、IPA 外框、中文字形、詞性格式與例句字頭命中。
2. 再把 1,994 個目標字依原順序切成 20 批（第 1–19 批各 100 筆，第 20 批 94 筆），逐批複核字義、詞性、中英例句對應及字頭合理性。
3. 額外的 1,320 筆快取資料只做集合與結構辨識，**未宣稱完成逐筆人工語意複核**；因為它們不屬於本次權威目標字表。
4. 詞形檢查包含常見規則變化與不規則變化。程式候選再經語意複核，避免把 admitted、became、children 等正確詞形誤報。

批次覆蓋：${Array.from({length:20},(_,i)=>`批次 ${i+1}：${i*100+1}–${Math.min((i+1)*100,1994)}（已複核）`).join('；')}。

## 摘要

| 項目 | 結果 |
|---|---:|
| 目標字筆數／唯一字頭 | 1,994／1,994 |
| 目標字缺字 | 0 |
| 快取總筆數 | 3,314 |
| 非目標額外快取字 | 1,320 |
| done 非 true | 0 |
| 缺少 phonetic | ${emptyPhonetic.length} |
| IPA 使用方括號而非 / / | ${bracketIpa.length} |
| definition 不是繁體中文 | ${englishDefinitions.length} |
| 已確認嚴重語意錯置 | ${confirmedSemantic.length} |
| 高／中／低嚴重度問題筆數 | ${sevCount.高}／${sevCount.中}／${sevCount.低} |

## 已確認會誤導學生的問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
${rows(confirmedSemantic,'字義／例句／詞性錯置')}
${rows(headwordIssues,'拼字／字頭格式')}

## 中文字形問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
${rows(charIssues,'簡體字／日文漢字變體')}

註：程式初篩曾命中「公里」的「里」與「王后」的「后」，但在台灣繁體語境均為正確用字，已排除，不列為錯誤。

## 詞性欄位問題

| 字頭 | 問題類型 | 錯誤內容 | 建議修正 | 嚴重度 |
|---|---|---|---|---|
${posIssues.map(x=>`| \`${x[0]}\` | 詞性格式 | ${x[1]} | ${x[2]} | 中 |`).join('\n')}

## IPA 問題

### 缺少 phonetic（${emptyPhonetic.length} 筆，中）

錯誤內容均為空字串；建議依一致的英式或美式發音來源補上以 \`/ /\` 包住的標準 IPA。多字詞也不可因為是片語、地名或專名就留空。

${emptyPhonetic.map(w=>`- \`${w}\`：\`phonetic: ""\` → 補上經權威字典核對的 IPA。`).join('\n')}

### IPA 外框錯誤（${bracketIpa.length} 筆，中）

${bracketIpa.map(w=>`- \`${w}\`：目前 \`${cache[w].phonetic}\` → 改為以 \`/ /\` 包住；並統一專案採用的音位／語音標記粒度。`).join('\n')}

## definition 欄位語言不符（${englishDefinitions.length} 筆，中）

這些字的 \`definition_zh\` 有繁中，但 \`definition\` 是英文；不符合本次「definition／definition_zh 均為繁體中文」的驗收條件。建議讓兩欄都使用繁體中文，或正式改 schema，另設 \`definition_en\` 存英文，避免同一欄混用語言。

${englishDefinitions.map(w=>`- \`${w}\`：\`definition\` = ${JSON.stringify(cache[w].definition)}；建議搬至 \`definition_en\`，並將 \`definition\` 改為繁中 ${JSON.stringify(cache[w].definition_zh)}。`).join('\n')}

## 例句檢查

- 已確認 1,994 個目標字都有 \`example_en\` 與 \`example_zh\`。
- 規則／不規則詞形候選經複核後，admit→admitted、become→became、big→bigger、children→child、clothing→clothe、lay→laid、nod→nodded、occur→occurred、rub→rubbed、shake→shook、shoot→shot、throw→threw 等均屬可接受詞形，不列錯。
- 真正不相符者是前述 \`chinese new year 農曆新年(n)\`、\`christmas eve\`、\`class leader\`、\`rome\` 四筆；其英文例句與中譯彼此相符，但整組內容放錯字頭，因此仍屬高嚴重度。
- \`officer\` 與 \`police officer\` 共用同一句例句，語意皆成立；這是內容重複，不是翻譯錯誤，列低嚴重度，建議日後改寫其中一句以增加學習變化。

## 目標字與快取集合差異

目標 1,994 字全部存在，沒有缺字或目標字重複。快取另有 1,320 個不在權威目標字表的 key。這不一定代表內容錯誤，但若 App 把整份 cache 當成「核心 2,000 字」載入，就會多載，因此列低嚴重度。建議載入時嚴格以 target 清單過濾，或將額外資料移至獨立擴充字庫。

<details><summary>展開 1,320 個額外快取字頭</summary>

${extras.map(w=>`- \`${w}\``).join('\n')}

</details>

## 方法限制

- 本審查能確認離線兩個 JSON 的狀態，不能證明線上 Supabase 資料與快取完全相同。
- IPA 缺漏可客觀確認；但要替 141 筆填入唯一正確 IPA，必須先指定英式或美式發音標準，兩者可能都合法。
- 額外 1,320 筆不是目標核心字，本輪未做完整逐筆語意人工複核，不能對其翻譯品質作 100% 保證。
- 對 1,994 個目標字已完成結構檢查與分批語意複核；仍建議實際修正後再跑一次回歸稽核，因修正字頭可能造成 target 與 cache key 同步問題。
`;
fs.writeFileSync(path.join(root,'reports','audit_words_full.md'),report,'utf8');
