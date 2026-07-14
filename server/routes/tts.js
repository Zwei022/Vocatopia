/**
 * /api/tts/:word
 *
 * 流程（新字/尚未被批次生成過的字才會走到這裡，speak() 第一層已經優先打
 * Supabase word-audio bucket，命中的話根本不會呼叫這支路由）：
 *   1. 本地磁碟已有音檔（僅開發環境，本機批次生成後會留在這） → 直接回傳
 *   2. Supabase word-audio bucket 已有（可能是另一個請求剛生成過） → 直接回傳
 *   3. 呼叫 Google Cloud TTS（Standard 音質）即時生成，同時把結果永久存進
 *      Supabase word-audio bucket，下一次同一個字就會命中第 2 層、不再重複收費
 *   4. 都沒有設定 Google Cloud 憑證 → 503（前端降級 Web Speech API）
 */
const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const supabase = require('../db/supabase');

const AUDIO_DIR   = path.resolve(__dirname, '../../public/audio/words');
const WORD_BUCKET = 'word-audio';
const WORD_AUDIO_BASE = 'https://teivfkwjhrkzrdebutkz.supabase.co/storage/v1/object/public/word-audio';

function sanitize(word) {
  return word.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_'-]/g, '');
}

let _ttsClient;
let _ttsClientTried = false;
function getTtsClient() {
  if (_ttsClientTried) return _ttsClient;
  _ttsClientTried = true;
  const json = process.env.GOOGLE_TTS_SERVICE_ACCOUNT_JSON;
  if (!json) {
    console.warn('[tts] GOOGLE_TTS_SERVICE_ACCOUNT_JSON 未設定，即時生成 fallback 停用');
    return null;
  }
  try {
    const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
    const credentials = JSON.parse(json);
    _ttsClient = new TextToSpeechClient({ credentials, projectId: credentials.project_id });
  } catch (e) {
    console.error('[tts] Google Cloud TTS 憑證解析失敗:', e.message);
    _ttsClient = null;
  }
  return _ttsClient;
}

async function checkSupabase(filename) {
  try {
    const res = await fetch(`${WORD_AUDIO_BASE}/${filename}.mp3`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

router.get('/:word', async (req, res) => {
  const word     = decodeURIComponent(req.params.word).slice(0, 80).trim();
  const filename = sanitize(word);
  if (!filename || !/^[a-z0-9_'-]+$/.test(filename)) return res.status(400).json({ error: 'invalid word' });

  // ── 1. 本地磁碟快取（僅開發環境會有）───────────────────────
  const mp3 = path.join(AUDIO_DIR, `${filename}.mp3`);
  if (fs.existsSync(mp3)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(mp3);
  }

  // ── 2. Supabase 已有（另一個請求剛生成過，或批次生成漏抓的舊字）──
  if (await checkSupabase(filename)) {
    return res.redirect(302, `${WORD_AUDIO_BASE}/${filename}.mp3`);
  }

  // ── 3. Google Cloud TTS 即時生成 + 寫回 Supabase 永久快取 ──────
  const client = getTtsClient();
  if (!client) return res.status(503).json({ error: 'tts_unavailable' });

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text: word },
      voice: { languageCode: 'en-US', name: 'en-US-Standard-D', ssmlGender: 'MALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
    });
    const audioBuffer = response.audioContent;

    // 寫回 Supabase，之後同一個字（不管哪個使用者）都會在第 1 層 speak() 或
    // 第 2 層命中，不會再重複呼叫 Google Cloud TTS、不會重複收費。
    supabase.storage.from(WORD_BUCKET).upload(`${filename}.mp3`, audioBuffer, {
      contentType: 'audio/mpeg', cacheControl: '86400', upsert: true,
    }).catch(err => console.error('[tts] 寫回 Supabase 失敗（不影響這次回應）:', err.message));

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(audioBuffer);
  } catch (err) {
    console.error('[tts] Google Cloud TTS 生成失敗:', err.message);
    res.status(503).json({ error: 'tts_failed' });
  }
});

module.exports = router;
