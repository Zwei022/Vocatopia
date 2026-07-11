// ════════════════════════════════
// 音效合成（Web Audio API 即時合成，不需外部音檔）
// 用於俄羅斯方塊對戰跟商店抽卡，環境沒有 AI 音效生成工具可用，
// 改用瀏覽器內建振盪器/雜訊即時合成，輕量、不佔用任何素材檔案空間。
// ════════════════════════════════

let _sfxCtx = null;
function _sfxGetCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!_sfxCtx) _sfxCtx = new AC();
  if (_sfxCtx.state === 'suspended') _sfxCtx.resume();
  return _sfxCtx;
}

function _sfxEnabled() {
  try { return localStorage.getItem('voca_sfx_on') !== '0'; } catch { return true; }
}

// 播放單一音（sweepTo 可做滑音效果）
function _sfxTone(freq, duration, opts = {}) {
  const ctx = _sfxGetCtx();
  if (!ctx) return;
  const { type = 'sine', volume = 0.15, delay = 0, sweepTo = null } = opts;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  const t0 = ctx.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 1), t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// 白噪音（爆炸/懲罰音效用），filterFreq 可做悶聲低通效果
function _sfxNoise(duration, opts = {}) {
  const ctx = _sfxGetCtx();
  if (!ctx) return;
  const { volume = 0.2, delay = 0, filterFreq = null } = opts;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  let node = noise;
  if (filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    node.connect(filter);
    node = filter;
  }
  node.connect(gain).connect(ctx.destination);
  noise.start(t0);
}

const SFX = {
  move()     { if (_sfxEnabled()) _sfxTone(220, .04, { type: 'square', volume: .08 }); },
  rotate()   { if (_sfxEnabled()) _sfxTone(440, .05, { type: 'square', volume: .1 }); },
  lock()     { if (_sfxEnabled()) _sfxTone(180, .07, { type: 'triangle', volume: .12 }); },
  lineClear(n) {
    if (!_sfxEnabled()) return;
    const notes = [523, 659, 784, 1046];
    for (let i = 0; i < Math.min(n, 4); i++) _sfxTone(notes[i], .12, { type: 'square', volume: .14, delay: i * .05 });
  },
  bomb() {
    if (!_sfxEnabled()) return;
    _sfxNoise(.5, { volume: .3, filterFreq: 1200 });
    _sfxTone(80, .4, { type: 'sawtooth', volume: .25, sweepTo: 30 });
  },
  clearBottom() {
    if (!_sfxEnabled()) return;
    _sfxNoise(.35, { volume: .22, filterFreq: 2000 });
    _sfxTone(300, .3, { type: 'sine', volume: .2, sweepTo: 100 });
  },
  skillCast() {
    if (!_sfxEnabled()) return;
    _sfxTone(660, .08, { type: 'sine', volume: .16 });
    _sfxTone(880, .12, { type: 'sine', volume: .14, delay: .08 });
  },
  quizCorrect() {
    if (!_sfxEnabled()) return;
    _sfxTone(523, .1, { type: 'sine', volume: .18 });
    _sfxTone(784, .16, { type: 'sine', volume: .18, delay: .1 });
  },
  quizWrong() { if (_sfxEnabled()) _sfxTone(200, .2, { type: 'sawtooth', volume: .18, sweepTo: 100 }); },
  gameOver() {
    if (!_sfxEnabled()) return;
    [392, 349, 330, 262].forEach((f, i) => _sfxTone(f, .25, { type: 'triangle', volume: .16, delay: i * .15 }));
  },
  newRecord() {
    if (!_sfxEnabled()) return;
    [523, 659, 784, 1046, 1318].forEach((f, i) => _sfxTone(f, .15, { type: 'square', volume: .16, delay: i * .09 }));
  },

  // ── 商店抽卡 ──
  gachaDraw() { if (_sfxEnabled()) _sfxTone(400, .1, { type: 'sine', volume: .15, sweepTo: 700 }); },
  gachaGlow(rarity) {
    if (!_sfxEnabled()) return;
    if (rarity === 'legendary') [660, 880, 1108, 1318].forEach((f, i) => _sfxTone(f, .18, { type: 'sine', volume: .2, delay: i * .06 }));
    else if (rarity === 'mythic') [523, 698, 880].forEach((f, i) => _sfxTone(f, .16, { type: 'sine', volume: .18, delay: i * .07 }));
    else if (rarity === 'epic') [440, 554, 659].forEach((f, i) => _sfxTone(f, .14, { type: 'sine', volume: .15, delay: i * .07 }));
    else _sfxTone(220, .15, { type: 'sine', volume: .1 });
  },
  gachaReveal(isNew) {
    if (!_sfxEnabled()) return;
    if (isNew) [523, 659, 784, 1046].forEach((f, i) => _sfxTone(f, .14, { type: 'square', volume: .16, delay: i * .06 }));
    else _sfxTone(330, .12, { type: 'sine', volume: .12 });
  },
};
