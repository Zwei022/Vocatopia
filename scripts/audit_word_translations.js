const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const targetDoc = JSON.parse(fs.readFileSync(path.join(ROOT, 'target_2000_words.json'), 'utf8'));
const cache = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase', 'words_cache.json'), 'utf8'));
const backup = JSON.parse(fs.readFileSync(path.join(ROOT, 'backups', 'cap2000_2026-06-01.json'), 'utf8'));
const pdfDefs = JSON.parse(fs.readFileSync(path.join(ROOT, 'pdf_words_with_def.json'), 'utf8'));

const normalize = value => String(value || '').trim().toLowerCase();
const targets = [...new Set(targetDoc.words.map(normalize))];
const cacheByWord = Object.fromEntries(Object.entries(cache).map(([key, value]) => [normalize(key), value]));
const backupByWord = Object.fromEntries(backup.map(row => [normalize(row.word), row]));
const pdfByWord = Object.fromEntries(Object.entries(pdfDefs).map(([key, value]) => [normalize(key), value]));

// 高精度規則只標出可由資料本身判定的問題；不把「未被規則抓到」誤稱為人工校對通過。
const simplifiedChars = /[汉语后发里复应会国这为与从东丝业严丧个临丽举么义乌乐乔习乡书买乱争于亏云亚产亲仅仆仓仪们价众优伙伞伟传伤伦伪体余佣侠侣侥侧侦侨侩侪侬俭债倾偿储儿兑党兰关兴养兽冯冲决况冻净凉减凑几凤凭凯击凿刘则刚创删别剂剑剧劝办务动励劲劳势勋区医华协单卖卢卫厂厅历厉压厌厕县参双变叙叶号叹吓吗听启吴员呛呜咏响哑哗唤团园围图圆圣场坏块坚坛坟坠垄垒垦垫堑堕墙壮声壳壶处备够头夹夺奋奖奥妈妆妇娱婴宁宝实宠审宪宫宾寝对寻导寿将尔尘尝层属岁岂岗岛岭岳峡巩币帅师帐帘带帮并庄庆庐库庙庞废广归当录彻径忆忧怀态怜总恋恶恼恳悦悬惊惧惨惩惫惯愤愿懒戏户扑执扩扫扬扰抚抛护报担拟拢拥拦拨择挂挚挠挡挣挤挥捞损换捣据掷揽携摄摆摇摊撑攒敌数斋斗断无旧时旷显晋晒晓晕暂术朴机杀杂权条来杨极构枪柜标栈栋栏树样桥检楼欢欧残毁毙气汇汤沟没沦沧沪泪泻泽洁洼浆浇浊测济浑浓涂涛涡涣涤润涧涨渊渔湾湿溃溅滚滞满滤滥滨滩灭灯灵灾炉点炼烁烂烟烛烦烧烫热爱爷牵犹状狈狞独狭狮狱猎猪猫献玛环现琐电画畅疗疮疯疲痒症痴瘫瘾皱盘盏盐监盖盗着睁矫矿码砖础确礼祷祸离积称税稳穷窃竞笔笼签简篮篱类粮紧纠红纤约级纪纬纯纲纳纵纷纸纹纽线练组绅细织终绍经绑结绕绘给络绝统绢绣继绩续绿缀缆罢罗罚职联聪肃肠肤肿胀胁胆胜胶脉脏脑脚脱脸腻腾舰艰艳艺节苏范茧荐荡荣药获莲莱萝营萧萨葱蒋蓝虑虚虫虽虾蚀蚁蚂蚊蚕蜕蝇蝉补衬袜袭装裤见观规觉览触誉计订认讨让训议记讲讳许论设访证评识诈诉诊词译试诗诚话诞询该详误诱说请诸读课谁调谈谊谋谎谜谢谨谱贝负贡财责贤败货质贩贪贫购贯贱贴贵贷贸费贺贼贿赁赂资赋赌赎赏赔赖赚赠赞赢赶趋跃践车轨转轮软轰轴轻载较辅辆辈辉辐辑输辖辗辙边辽达迁过迈运还进远违连迟适选逊递逻遗遥邮邻郁郑酿释鉴钉针钓钙钟钢钥钦钧钩钱钳钻铁铃铅铲银铜铝铭链销锁锄锅锋锐错锦锭键锯锻镀镇镜长门闪闭问闯闲间闷闸闹闻阁阀队阳阴阵阶际陆陈险随隐难雏鸡鱼鲁鲜鸟鸣鸭鸿鹤鹰麦黄齐齿龙龟]/;
const sharedTraditionalChars = new Set(['症', '疲', '斗', '蚊', '据', '后']);
const cjk = /[\u3400-\u9fff]/;
const mojibake = /\ufffd|(?:Ã|Â|â€|ðŸ)/;
const chinesePos = /^(名詞|動詞|形容詞|副詞|介系詞|連接詞|代名詞|助動詞|限定詞|感嘆詞|數詞|冠詞|片語|稱呼語)([；、,/].*)?$/;

// 由英文字義與例句可直接證實的錯義，避免只靠主觀風格判斷。
const confirmedSenseErrors = {
  industry: ['目前英文定義採用罕見的「勤勉」義，但目標詞性/教材語境應至少涵蓋「工業；產業」；例句也談勤勉，整筆選義偏離常用會考義。'],
  japan: ['英文定義與例句採用小寫 japan「黑色亮漆」義，但清單項目是國名 Japan，應為「日本」。'],
  mandarin: ['英文定義與例句採用「中國帝制官員」義，但台灣國中教材的 Mandarin 通常指「國語／華語」；目前中譯與例句選義偏離。'],
  marker: ['英文定義與例句採用「位置標記物」義，但國中生活字彙通常指「麥克筆／白板筆」；目前沒有涵蓋主要教材義。'],
  "ma'am": ['目前以動詞「用 ma’am 稱呼」造句，詞性與國中常用感嘆／稱呼語「女士；太太」不對位。'],
  melon: ['英文定義是瓜類植物總稱，但中文與例句聚焦西瓜，會讓 melon 與 watermelon 混淆。'],
  measurement: ['英文定義為名詞「測量（的行為／結果）」，例句卻使用不自然的 take measurement 單數結構；中譯需同時核對名詞義與例句。'],
  "michael jackson": ['此項英文 definition 看似殘留「Music TV」來源文字，並非 Michael Jackson 的正確人物定義。'],
};
const oldSenseSignatures = {
  industry: /diligence|persistently/i, japan: /varnish|enamel|coating/i,
  mandarin: /bureaucrat|emperor|province/i, marker: /mark a location|fossil/i,
  "ma'am": /restaurant job|using ["“]ma'am/i, melon: /watermelon/i,
  measurement: /took measurement/i, "michael jackson": /music tv/i,
};

const rows = targets.map(word => {
  const entry = cacheByWord[word];
  const issues = [];
  if (!entry) {
    issues.push({ severity: 'critical', type: 'missing_cache_entry', message: '官方目標清單有此字，但 words_cache.json 沒有內容。' });
    return { word, status: 'needs_review', source: null, issues };
  }
  const definitionZh = String(entry.definition_zh || '').trim();
  const exampleEn = String(entry.example_en || '').trim();
  const exampleZh = String(entry.example_zh || '').trim();
  const pos = String(entry.pos || '').trim();
  if (!definitionZh) issues.push({ severity: 'critical', type: 'missing_definition_zh', message: '缺少中文定義。' });
  else if (!cjk.test(definitionZh)) issues.push({ severity: 'critical', type: 'definition_zh_not_chinese', message: '中文定義未含中日韓統一表意文字。' });
  if (!exampleEn || !exampleZh) issues.push({ severity: 'major', type: 'missing_example_pair', message: '英文或中文例句缺漏，無法逐句對照。' });
  const simplifiedHit = [...(definitionZh + exampleZh)].find(ch => !sharedTraditionalChars.has(ch) && simplifiedChars.test(ch));
  if (simplifiedHit) issues.push({ severity: 'major', type: 'possible_simplified_chinese', message: `含疑似簡體字形「${simplifiedHit[0]}」；需人工排除繁簡共形與正當用字。` });
  if (mojibake.test(JSON.stringify(entry))) issues.push({ severity: 'critical', type: 'mojibake', message: '偵測到替代字元或常見亂碼片段。' });
  if (!pos) issues.push({ severity: 'major', type: 'missing_pos', message: '缺少詞性。' });
  else if (!chinesePos.test(pos) && !/^(n|v|adj|adv|prep|conj|pron|aux|det|interj|interjection|num)\.?$/i.test(pos)) {
    issues.push({ severity: 'minor', type: 'nonstandard_pos', message: `詞性格式不一致：${pos}` });
  }
  for (const message of confirmedSenseErrors[word] || []) {
    if (oldSenseSignatures[word]?.test(`${entry.definition || ''} ${exampleEn}`)) {
      issues.push({ severity: 'critical', type: 'confirmed_or_high_confidence_sense_error', message });
    }
  }
  const pdfDefinition = typeof pdfByWord[word] === 'string' ? pdfByWord[word].trim() : '';
  if (pdfDefinition && definitionZh && normalize(pdfDefinition) !== normalize(definitionZh)) {
    issues.push({ severity: 'info', type: 'source_disagreement', message: `PDF 中譯來源與 cache 不同（PDF：${pdfDefinition}）。` });
  }
  return {
    word,
    status: issues.some(i => ['critical', 'major'].includes(i.severity)) ? 'needs_review' : 'automated_checks_passed_not_human_verified',
    source: { pos, definition: entry.definition || '', definition_zh: definitionZh, example_en: exampleEn, example_zh: exampleZh },
    issues,
  };
});

const severityCounts = { critical: 0, major: 0, minor: 0, info: 0 };
const typeCounts = {};
for (const row of rows) for (const issue of row.issues) {
  severityCounts[issue.severity]++;
  typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
}
const cacheWords = new Set(Object.keys(cacheByWord));
const targetSet = new Set(targets);
const summary = {
  generated_at: new Date().toISOString(),
  scope: '離線資料靜態稽核；未連線讀取 Supabase 線上 words 表',
  target_unique_words: targets.length,
  cache_total_entries: cacheWords.size,
  cache_entries_in_target: targets.filter(w => cacheWords.has(w)).length,
  target_missing_from_cache: targets.filter(w => !cacheWords.has(w)).length,
  cache_entries_outside_target: [...cacheWords].filter(w => !targetSet.has(w)).length,
  old_backup_rows: backup.length,
  old_backup_overlap_with_target: targets.filter(w => backupByWord[w]).length,
  pdf_definition_rows: Object.keys(pdfByWord).length,
  pdf_definition_overlap_with_target: targets.filter(w => pdfByWord[w] !== undefined).length,
  missing_definition_zh_with_legacy_chinese_definition: rows.filter(r => r.issues.some(i => i.type === 'missing_definition_zh') && cjk.test(String(r.source?.definition || ''))).length,
  rows_needing_review: rows.filter(r => r.status === 'needs_review').length,
  rows_without_critical_or_major_flags: rows.filter(r => r.status !== 'needs_review').length,
  issue_counts_by_severity: severityCounts,
  issue_counts_by_type: typeCounts,
};

const output = {
  methodology: {
    unit_of_review: 'target_2000_words.json 的每個唯一字詞',
    canonical_offline_candidate: 'target_2000_words.json（清單）＋ supabase/words_cache.json（內容）',
    checks: ['資料覆蓋', 'definition_zh 空值與中文字符', '繁簡疑似字形', '亂碼', '詞性格式', '英中例句成對完整性', '已確認／高信心錯義', 'PDF 中譯來源差異'],
    important_caveat: '自動檢查通過不等於語意已由人工逐字校對通過；未查詢線上 DB，也不能宣稱 100% 正確。',
  },
  summary,
  words: rows,
};

const reportDir = path.join(ROOT, 'reports');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'word_translation_audit.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');

const actionable = rows.filter(row => row.issues.some(i => i.severity !== 'info'));
const confirmed = rows.filter(row => row.issues.some(i => i.type === 'confirmed_or_high_confidence_sense_error'));
const md = `# Vocatopia 單字中譯稽核\n\n` +
`產出時間：${summary.generated_at}\n\n` +
`## 結論\n\n` +
`目前最接近現行資料庫內容的離線組合是 \`target_2000_words.json\`（官方目標清單）搭配 \`supabase/words_cache.json\`（匯入與補字腳本實際使用的內容快取）。舊備份 \`backups/cap2000_2026-06-01.json\` 只有 ${summary.old_backup_rows} 筆，且沒有 \`definition_zh\`，不能作為中文翻譯的完整基準。\n\n` +
`這份報告不能證明線上 DB 或全部翻譯「100% 正確」。原因是本次依任務限制只盤點離線檔案，沒有讀取 Supabase 線上 \`words\` 表；此外，自動規則只能可靠找出缺漏、亂碼、格式與少數可由上下文證實的錯義，不能取代 1,994 筆逐字人工語意審校。JSON 報告已把每個目標字逐筆列出，標記為「需複核」或「僅通過自動檢查、尚未人工確認」。\n\n` +
`## 資料覆蓋\n\n` +
`| 來源 | 筆數／覆蓋 | 判定 |\n|---|---:|---|\n` +
`| target_2000_words.json | ${summary.target_unique_words} 個唯一目標字 | 現行官方清單候選 |\n` +
`| supabase/words_cache.json | ${summary.cache_total_entries} 筆；覆蓋目標 ${summary.cache_entries_in_target} 筆 | 現行內容最完整的離線候選 |\n` +
`| target 缺少 cache | ${summary.target_missing_from_cache} 筆 | 必須補資料 |\n` +
`| cache 不在 target | ${summary.cache_entries_outside_target} 筆 | 可能是歷史／延伸字，不應當成官方 2000 字 |\n` +
`| cap2000_2026-06-01.json | ${summary.old_backup_rows} 筆；與 target 重疊 ${summary.old_backup_overlap_with_target} 筆 | 舊版半量備份、無中譯 |\n` +
`| pdf_words_with_def.json | ${summary.pdf_definition_rows} 筆；與 target 重疊 ${summary.pdf_definition_overlap_with_target} 筆 | 可當第二中譯來源，但不是完整記錄 |\n\n` +
`## 自動檢查結果\n\n` +
`- 需人工複核：${summary.rows_needing_review} 筆。\n` +
`- 未出現 critical／major 規則旗標：${summary.rows_without_critical_or_major_flags} 筆；這些仍不能視為人工審校通過。\n` +
`- 嚴重問題旗標：${severityCounts.critical} 個；主要問題旗標：${severityCounts.major} 個；格式／一致性旗標：${severityCounts.minor} 個。\n` +
`- 第二來源中譯不同：${typeCounts.source_disagreement || 0} 筆。差異不必然代表錯誤，需按詞性與語境裁定。\n\n` +
`- 缺少 \`definition_zh\` 的資料中，有 ${summary.missing_definition_zh_with_legacy_chinese_definition} 筆在舊 \`definition\` 欄位含中文。這代表快取混有舊／新 schema；它們仍屬欄位缺漏，但不等於畫面必然沒有中譯，因前端部分流程會回退讀取 \`definition\`。\n\n` +
`## 已確認或高信心的錯義\n\n` +
(confirmed.length ? confirmed.map(row => `- **${row.word}**：${row.issues.filter(i => i.type === 'confirmed_or_high_confidence_sense_error').map(i => i.message).join('；')}`).join('\n') : '- 本輪沒有找到。') +
`\n\n## 其他需處理項目\n\n` +
(actionable.length ? actionable.slice(0, 200).map(row => `- **${row.word}**：${row.issues.filter(i => i.severity !== 'info').map(i => `${i.type}（${i.message}）`).join('；')}`).join('\n') : '- 自動規則未發現其他問題。') +
(actionable.length > 200 ? `\n- 其餘 ${actionable.length - 200} 筆請見 JSON 明細。` : '') +
`\n\n## 下一階段校對方式\n\n` +
`1. 先取得線上 \`words\` 表快照，依 \`id\`、\`updated_at\` 與標籤確認真正上線版本。\n` +
`2. 以 target 的 ${summary.target_unique_words} 個字為母體，逐字核對詞性、常用義、definition_zh、英文例句與例句中譯。\n` +
`3. 對多義字保留與該詞性及例句一致的義項；國名、人名、片語要避免字典抓到同形異義。\n` +
`4. 每筆修訂保留來源、審校人與狀態；完成第二人獨立複核後，才能標記為人工審校通過。\n`;
fs.writeFileSync(path.join(reportDir, 'word_translation_audit.md'), md, 'utf8');
console.log(JSON.stringify(summary, null, 2));
