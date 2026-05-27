/**
 * 難度校正腳本（一次性執行）
 * 爬取 Simple English Wikipedia 的 B1 級文章，
 * 計算平均句長、字數、FK 可讀性指數，
 * 輸出做為 generate_daily_articles.js prompt 的基準。
 *
 * 執行方式：node server/scripts/calibrate.js
 */
require('dotenv').config();

const SAMPLE_URLS = [
  'https://simple.wikipedia.org/w/api.php?action=query&titles=Habit&prop=extracts&explaintext=1&format=json',
  'https://simple.wikipedia.org/w/api.php?action=query&titles=Exercise&prop=extracts&explaintext=1&format=json',
  'https://simple.wikipedia.org/w/api.php?action=query&titles=Recycling&prop=extracts&explaintext=1&format=json',
  'https://simple.wikipedia.org/w/api.php?action=query&titles=Sleep&prop=extracts&explaintext=1&format=json',
  'https://simple.wikipedia.org/w/api.php?action=query&titles=Climate_change&prop=extracts&explaintext=1&format=json',
];

function extractText(apiJson) {
  const pages = apiJson.query?.pages || {};
  const page  = Object.values(pages)[0];
  return page?.extract || '';
}

function splitSentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && /^[A-Z]/.test(s));
}

function wordsOf(sentence) {
  return sentence.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
}

function fleschKincaid(sentences, words) {
  const syllables = words.reduce((n, w) => n + countSyllables(w), 0);
  const asl = words.length / sentences.length;        // avg sentence length
  const asw = syllables / words.length;               // avg syllables/word
  const fkgl = 0.39 * asl + 11.8 * asw - 15.59;     // grade level
  return { asl: asl.toFixed(1), asw: asw.toFixed(2), fkgl: fkgl.toFixed(1) };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

async function calibrate() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Vocatopia 難度校正工具              ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log('抓取 Simple English Wikipedia 文章中...\n');

  const allSentences = [];
  const allWords     = [];

  for (const url of SAMPLE_URLS) {
    try {
      const res  = await fetch(url);
      const json = await res.json();
      const text = extractText(json);
      const title = url.split('titles=')[1].split('&')[0];

      const sentences = splitSentences(text).slice(0, 30);
      const words     = sentences.flatMap(wordsOf);

      if (sentences.length < 5) { console.log(`  ✗ ${title}: 內容不足`); continue; }

      allSentences.push(...sentences);
      allWords.push(...words);

      const { asl, fkgl } = fleschKincaid(sentences, words);
      console.log(`  ✓ ${title.padEnd(20)} 句數:${sentences.length.toString().padStart(3)}  平均句長:${asl.padStart(5)}字  FK年級:${fkgl}`);
    } catch (err) {
      console.log(`  ✗ 抓取失敗:`, err.message);
    }
  }

  if (allSentences.length === 0) {
    console.log('\n⚠  無法取得樣本，請確認網路連線');
    return;
  }

  const { asl, asw, fkgl } = fleschKincaid(allSentences, allWords);

  const report = {
    sampleSentences: allSentences.length,
    avgSentenceLength: parseFloat(asl),
    avgSyllablesPerWord: parseFloat(asw),
    fleschKincaidGrade: parseFloat(fkgl),
    cefrEquivalent: parseFloat(fkgl) <= 7 ? 'A2-B1' : parseFloat(fkgl) <= 10 ? 'B1-B2' : 'B2+',
  };

  console.log('\n══════════════════════════════════════');
  console.log('校正結果（適用於 prompt 難度參數）：');
  console.log('══════════════════════════════════════');
  console.log(`  樣本句數：      ${report.sampleSentences}`);
  console.log(`  平均句長：      ${report.avgSentenceLength} 字/句`);
  console.log(`  平均音節/字：   ${report.avgSyllablesPerWord}`);
  console.log(`  FK 年級水準：   ${report.fleschKincaidGrade} → ${report.cefrEquivalent}`);
  console.log('\n建議 prompt 參數：');
  console.log(`  - 文章字數：180-230 字`);
  console.log(`  - 平均句長：${Math.round(report.avgSentenceLength * 0.9)}–${Math.round(report.avgSentenceLength * 1.1)} 字`);
  console.log(`  - FK 目標：  6.5–8.5（等同 CEFR B1）`);
  console.log('\n✓ 此參數已內嵌於 generate_daily_articles.js');
}

calibrate();
