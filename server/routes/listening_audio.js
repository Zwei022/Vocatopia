const express    = require('express');
const router     = express.Router();
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');
const { execFile } = require('child_process');

const CACHE_DIR  = path.resolve(__dirname, '../../cache/listening');
const TTS_SCRIPT = path.resolve(__dirname, '../../scripts/tts_generate.py');
const python     = process.platform === 'win32' ? 'python' : 'python3';

// 每日練習聽力題目對話已全部預先生成、上傳到 Supabase Storage（public bucket），
// 命名規則跟這支路由的本機快取一致：md5(dialogue.trim()) + ".mp3"。
// Railway 正式站沒有安裝 Python/Kokoro，本機即時生成（下面 execFile 那段）在正式站
// 一定會失敗，所以優先查 Supabase，只有真的查不到（例如未來新增題目還沒預生成）
// 才會嘗試本機生成，此時在本機開發環境仍可用、正式站則會如預期地回傳 503。
const LISTENING_AUDIO_BASE = 'https://teivfkwjhrkzrdebutkz.supabase.co/storage/v1/object/public/listening-audio';

async function checkSupabaseListeningAudio(hash) {
  try {
    const url = `${LISTENING_AUDIO_BASE}/${hash}.mp3`;
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

const VOICE_MAP = {
  // 少年男（am_puck）
  kevin: 'male_12', tom: 'male_12', boy: 'male_12',
  // 少女（af_nicole）
  sarah: 'female_12', lily: 'female_12', jessica: 'female_12', lisa: 'female_12', girl: 'female_12',
  // 青年男（am_michael）
  ben: 'male_25', mike: 'male_25', mark: 'male_25', james: 'male_25', david: 'male_25', waiter: 'male_25', narrator: 'male_25',
  // 青年女（af_sarah）
  amy: 'female_25', anna: 'female_25', woman: 'female_25', clerk: 'female_25',
  // 成熟女（af_heart）
  teacher: 'female_40', nurse: 'female_40', mom: 'female_40', mother: 'female_40', receptionist: 'female_40',
  // 成熟男（am_echo）：低沉清晰，與女聲差異最大
  man: 'male_40', dad: 'male_40', father: 'male_40', doctor: 'male_40',
};

function parseDialogue(text) {
  return text.split('\n').filter(l => l.trim()).map(l => {
    const m = l.match(/^([^:]+):\s*(.+)$/);
    if (!m) return null;
    return { speaker: VOICE_MAP[m[1].toLowerCase().trim()] || 'female_25', text: m[2].trim() };
  }).filter(Boolean);
}

router.post('/generate', async (req, res) => {
  const { dialogue } = req.body;
  if (!dialogue) return res.status(400).json({ error: 'dialogue required' });

  const hash = crypto.createHash('md5').update(dialogue.trim()).digest('hex');
  const mp3  = path.join(CACHE_DIR, `${hash}.mp3`);

  if (fs.existsSync(mp3)) return res.json({ hash, url: `/api/listening-audio/${hash}.mp3`, cached: true });

  const supabaseUrl = await checkSupabaseListeningAudio(hash);
  if (supabaseUrl) return res.json({ hash, url: supabaseUrl, cached: true });

  const lines = parseDialogue(dialogue);
  if (!lines.length) return res.status(400).json({ error: 'no valid dialogue lines' });

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  execFile(python, [TTS_SCRIPT, '--dialogue', JSON.stringify(lines), '--output', mp3], { timeout: 180000 }, (err) => {
    if (err || !fs.existsSync(mp3)) {
      console.error('[listening-audio] 生成失敗:', err?.message?.slice(0, 100));
      return res.status(503).json({ error: 'tts_failed' });
    }
    res.json({ hash, url: `/api/listening-audio/${hash}.mp3`, cached: false });
  });
});

router.get('/:hash.mp3', (req, res) => {
  const mp3 = path.join(CACHE_DIR, `${req.params.hash}.mp3`);
  if (!fs.existsSync(mp3)) return res.status(404).json({ error: 'not found' });
  res.setHeader('Cache-Control', 'public, max-age=604800');
  res.sendFile(mp3);
});

module.exports = router;
