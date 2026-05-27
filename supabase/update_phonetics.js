require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// IPA phonetics for all 100 words
const PHONETICS = {
  able:        '/ˈeɪbəl/',
  absence:     '/ˈæbsəns/',
  accept:      '/əkˈsept/',
  accident:    '/ˈæksɪdənt/',
  achieve:     '/əˈtʃiːv/',
  action:      '/ˈækʃən/',
  actually:    '/ˈæktʃuəli/',
  adult:       '/ˈædʌlt/',
  advice:      '/ədˈvaɪs/',
  afford:      '/əˈfɔːrd/',
  agree:       '/əˈɡriː/',
  allow:       '/əˈlaʊ/',
  almost:      '/ˈɔːlməʊst/',
  alone:       '/əˈləʊn/',
  although:    '/ɔːlˈðəʊ/',
  amount:      '/əˈmaʊnt/',
  angry:       '/ˈæŋɡri/',
  animal:      '/ˈænɪməl/',
  another:     '/əˈnʌðər/',
  appear:      '/əˈpɪər/',
  attention:   '/əˈtenʃən/',
  attitude:    '/ˈætɪtjuːd/',
  avoid:       '/əˈvɔɪd/',
  belong:      '/bɪˈlɒŋ/',
  benefit:     '/ˈbenɪfɪt/',
  believe:     '/bɪˈliːv/',
  boring:      '/ˈbɔːrɪŋ/',
  bother:      '/ˈbɒðər/',
  brave:       '/breɪv/',
  breath:      '/breθ/',
  calm:        '/kɑːm/',
  careful:     '/ˈkeəfəl/',
  cause:       '/kɔːz/',
  certain:     '/ˈsɜːrtən/',
  chance:      '/tʃɑːns/',
  change:      '/tʃeɪndʒ/',
  character:   '/ˈkærɪktər/',
  choice:      '/tʃɔɪs/',
  collect:     '/kəˈlekt/',
  comfortable: '/ˈkʌmftəbəl/',
  communicate: '/kəˈmjuːnɪkeɪt/',
  compare:     '/kəmˈpeər/',
  complete:    '/kəmˈpliːt/',
  condition:   '/kənˈdɪʃən/',
  confident:   '/ˈkɒnfɪdənt/',
  connect:     '/kəˈnekt/',
  consider:    '/kənˈsɪdər/',
  continue:    '/kənˈtɪnjuː/',
  control:     '/kənˈtrəʊl/',
  correct:     '/kəˈrekt/',
  create:      '/kriˈeɪt/',
  culture:     '/ˈkʌltʃər/',
  decide:      '/dɪˈsaɪd/',
  describe:    '/dɪˈskraɪb/',
  develop:     '/dɪˈveləp/',
  different:   '/ˈdɪfrənt/',
  difficult:   '/ˈdɪfɪkəlt/',
  discover:    '/dɪˈskʌvər/',
  discuss:     '/dɪˈskʌs/',
  disease:     '/dɪˈziːz/',
  dream:       '/driːm/',
  earth:       '/ɜːrθ/',
  education:   '/ˌedʒuˈkeɪʃən/',
  effect:      '/ɪˈfekt/',
  energy:      '/ˈenədʒi/',
  environment: '/ɪnˈvaɪrənmənt/',
  especially:  '/ɪˈspeʃəli/',
  example:     '/ɪɡˈzɑːmpəl/',
  excellent:   '/ˈeksələnt/',
  experience:  '/ɪkˈspɪəriəns/',
  explain:     '/ɪkˈspleɪn/',
  fail:        '/feɪl/',
  famous:      '/ˈfeɪməs/',
  feel:        '/fiːl/',
  finally:     '/ˈfaɪnəli/',
  focus:       '/ˈfəʊkəs/',
  foreign:     '/ˈfɒrən/',
  forget:      '/fəˈɡet/',
  freedom:     '/ˈfriːdəm/',
  friendly:    '/ˈfrendli/',
  future:      '/ˈfjuːtʃər/',
  goal:        '/ɡəʊl/',
  government:  '/ˈɡʌvənmənt/',
  grateful:    '/ˈɡreɪtfəl/',
  grow:        '/ɡrəʊ/',
  habit:       '/ˈhæbɪt/',
  happen:      '/ˈhæpən/',
  health:      '/helθ/',
  helpful:     '/ˈhelpfəl/',
  honest:      '/ˈɒnɪst/',
  however:     '/haʊˈevər/',
  imagine:     '/ɪˈmædʒɪn/',
  improve:     '/ɪmˈpruːv/',
  include:     '/ɪnˈkluːd/',
  influence:   '/ˈɪnfluəns/',
  interest:    '/ˈɪntrəst/',
  introduce:   '/ˌɪntrəˈdjuːs/',
  invite:      '/ɪnˈvaɪt/',
  island:      '/ˈaɪlənd/',
  journey:     '/ˈdʒɜːrni/',
};

// Level → tags mapping
const LEVEL_TAGS = {
  1: ['cap_2000', '基礎'],
  2: ['cap_2000', '進階'],
};

async function updateWords() {
  const { data: words } = await supabase
    .from('words')
    .select('id, word, level');

  let updated = 0, skipped = 0;

  for (const w of words) {
    const phonetic = PHONETICS[w.word];
    const tags = LEVEL_TAGS[w.level] || ['cap_2000'];

    const { error } = await supabase
      .from('words')
      .update({ phonetic, tags })
      .eq('id', w.id);

    if (error) { console.error(`✗ ${w.word}:`, error.message); skipped++; }
    else { updated++; }
  }

  console.log(`\n✓ 更新完成：${updated} 筆成功，${skipped} 筆失敗`);

  // 驗證
  const { data: sample } = await supabase
    .from('words')
    .select('word, phonetic, tags')
    .limit(5);
  console.log('\n樣本驗證：');
  sample.forEach(w => console.log(`  ${w.word.padEnd(14)} ${(w.phonetic||'').padEnd(20)} ${JSON.stringify(w.tags)}`));
}

updateWords();
