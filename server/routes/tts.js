/**
 * /api/tts/:word
 *
 * 流程：
 *   1. 本地磁碟已有音檔 → 直接回傳
 *   2. 轉發到本地 tts_server.py（Kokoro am_michael 常駐，生成後快取）
 *   3. tts_server 未啟動 → 503（前端降級 Web Speech）
 */
const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const http     = require('http');

const AUDIO_DIR    = path.resolve(__dirname, '../../public/audio/words');
const TTS_SERVER   = 'http://127.0.0.1:5001';

function sanitize(word) {
  return word.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_'-]/g, '');
}

router.get('/:word', async (req, res) => {
  const word     = decodeURIComponent(req.params.word).slice(0, 80).trim();
  const filename = sanitize(word);
  if (!filename || !/^[a-z0-9_'-]+$/.test(filename)) return res.status(400).json({ error: 'invalid word' });

  const mp3 = path.join(AUDIO_DIR, `${filename}.mp3`);

  // ── 1. 本地磁碟快取（命中率高，直接回傳）───────────────────────
  if (fs.existsSync(mp3)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(mp3);
  }

  // ── 2. 轉發到本地 Kokoro TTS server ────────────────────────────
  const ttsUrl = `${TTS_SERVER}/tts/${encodeURIComponent(word)}`;
  const proxyReq = http.get(ttsUrl, { timeout: 30000 }, (proxyRes) => {
    if (proxyRes.statusCode !== 200) {
      res.status(503).json({ error: 'tts_unavailable' });
      proxyRes.resume();
      return;
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    // tts_server 未啟動 → 讓前端降級 Web Speech API
    if (!res.headersSent) res.status(503).json({ error: 'tts_unavailable' });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) res.status(503).json({ error: 'tts_timeout' });
  });
});

module.exports = router;
