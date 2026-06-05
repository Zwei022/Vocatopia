#!/usr/bin/env python3
"""
generate_words_voxcpm.py

流程：
1. 對每個單字，從劍橋字典下載美式發音（暫存）
2. 以該音檔為參考，用 VoxCPM2 複製聲音特徵、生成全新 AI 音檔
3. 立即刪除劍橋原始音檔（不保留、不服務）
4. 只保留 VoxCPM2 生成的音檔

最終服務的是 AI 生成音，版權上屬全新創作。

用法：
  python scripts/generate_words_voxcpm.py           # 只處理缺少的
  python scripts/generate_words_voxcpm.py --rebuild  # 全部重做
  python scripts/generate_words_voxcpm.py --test 5   # 先測試 5 個字
"""

import sys, json, time, random, argparse, tempfile, subprocess
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import requests
import soundfile as sf
import numpy as np
from pydub import AudioSegment

ROOT     = Path(__file__).parent.parent
OUT_DIR  = ROOT / "public" / "audio" / "words"
BASE_URL = "https://dictionary.cambridge.org"
HEADERS  = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 Chrome/124.0",
    "Accept-Language": "en-US,en;q=0.9",
}

# ── 字表 ────────────────────────────────────────────────────────────────────

def load_words():
    full = ROOT / "scripts" / "full_wordlist.txt"
    if full.exists():
        return [w.strip() for w in full.read_text(encoding="utf-8").splitlines() if w.strip()]
    cache = ROOT / "supabase" / "words_cache.json"
    data = json.loads(cache.read_text(encoding="utf-8"))
    return list(data.keys()) if isinstance(data, dict) else [w["word"] for w in data]

def safe_filename(word: str) -> str:
    return "".join(c for c in word.lower().replace(" ", "_") if c.isalnum() or c == "_")

# ── 劍橋爬取（暫存用，生成後立即刪除）──────────────────────────────────────

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

def fetch_cambridge_wav(word: str, tmp_path: Path) -> bool:
    """下載劍橋美式發音，轉成 16kHz mono WAV 暫存。成功回傳 True。"""
    from bs4 import BeautifulSoup
    url = f"{BASE_URL}/dictionary/english/{word.replace(' ', '-')}"
    try:
        r = SESSION.get(url, timeout=12)
        if r.status_code != 200:
            return False
        soup = BeautifulSoup(r.text, "html.parser")
        src = next(
            (s.get("src") for s in soup.select('source[type="audio/mpeg"]')
             if "us_pron" in (s.get("src") or "")),
            None
        )
        if not src:
            return False
        mp3_bytes = SESSION.get(BASE_URL + src, timeout=12).content
        if len(mp3_bytes) < 500:
            return False
    except Exception:
        return False

    # MP3 → 16kHz mono WAV（VoxCPM2 需要）
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(mp3_bytes)
        tmp_mp3 = f.name
    try:
        audio = AudioSegment.from_mp3(tmp_mp3).set_channels(1).set_frame_rate(16000)
        audio.export(str(tmp_path), format="wav")
        return True
    except Exception:
        return False
    finally:
        Path(tmp_mp3).unlink(missing_ok=True)

# ── VoxCPM2 生成 ──────────────────────────────────────────────────────────

_model = None

def get_model():
    global _model
    if _model is None:
        from voxcpm import VoxCPM
        print("[*] Loading VoxCPM2...")
        _model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
        print("[*] Model ready")
    return _model

def generate_with_reference(word: str, ref_wav: Path, out_mp3: Path) -> bool:
    """用劍橋音檔為參考，VoxCPM2 生成全新音檔。"""
    try:
        model = get_model()
        wav = model.generate(text=word, reference_wav_path=str(ref_wav))
        # 正規化音量
        tmp_wav = out_mp3.with_suffix(".tmp.wav")
        sf.write(str(tmp_wav), wav, model.tts_model.sample_rate)
        audio = AudioSegment.from_wav(str(tmp_wav))
        diff = -20.0 - audio.dBFS
        audio.apply_gain(diff).export(str(out_mp3), format="mp3", bitrate="96k")
        tmp_wav.unlink(missing_ok=True)
        return True
    except Exception as e:
        print(f"  [VoxCPM2 ERR] {word}: {e}")
        return False

# ── Kokoro 備援 ───────────────────────────────────────────────────────────

_kokoro = None

def generate_with_kokoro(word: str, out_mp3: Path) -> bool:
    global _kokoro
    try:
        if _kokoro is None:
            from kokoro import KPipeline
            _kokoro = KPipeline(lang_code='a')
        segs = [a for _, _, a in _kokoro(f"{word}.", voice="am_michael", speed=0.95)]
        if not segs:
            return False
        wav = np.concatenate(segs)
        tmp_wav = out_mp3.with_suffix(".tmp.wav")
        sf.write(str(tmp_wav), wav, 24000)
        audio = AudioSegment.from_wav(str(tmp_wav))
        audio.apply_gain(-20.0 - audio.dBFS).export(str(out_mp3), format="mp3", bitrate="96k")
        tmp_wav.unlink(missing_ok=True)
        return True
    except Exception as e:
        print(f"  [Kokoro ERR] {word}: {e}")
        return False

# ── 主流程 ────────────────────────────────────────────────────────────────

def process_word_to(word: str, out: Path) -> str:
    """回傳 'cambridge' | 'kokoro' | 'fail'"""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        ref_wav = Path(f.name)
    try:
        if fetch_cambridge_wav(word, ref_wav):
            if generate_with_reference(word, ref_wav, out):
                return "cambridge"
        if generate_with_kokoro(word, out):
            return "kokoro"
        return "fail"
    finally:
        ref_wav.unlink(missing_ok=True)   # 一定刪除暫存的劍橋音檔

def process_word(word: str) -> str:
    return process_word_to(word, OUT_DIR / f"{safe_filename(word)}.mp3")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild",  action="store_true")
    parser.add_argument("--test",     type=int, default=0)
    parser.add_argument("--single",   type=str, default="",  help="生成單一單字後退出")
    parser.add_argument("--output",   type=str, default="",  help="--single 的輸出路徑")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── 單字模式（快速模式新增字使用）──────────────────────────────
    if args.single:
        word = args.single.strip()
        fn   = safe_filename(word)
        out  = Path(args.output) if args.output else OUT_DIR / f"{fn}.mp3"
        # 先檢查是否已存在
        if out.exists():
            print(f"[EXISTS] {out}")
            return
        result = process_word_to(word, out)
        print(f"[{result.upper()}] {out}")
        return

    # ── 批次模式 ─────────────────────────────────────────────────
    words = load_words()
    if args.test:
        words = words[:args.test]

    if not args.rebuild:
        words = [w for w in words if not (OUT_DIR / f"{safe_filename(w)}.mp3").exists()]

    total = len(words)
    print(f"[*] Processing {total} words  (cambridge ref -> VoxCPM2, fallback Kokoro)\n")

    results = {"cambridge": 0, "kokoro": 0, "fail": 0}
    t0 = time.time()

    for i, word in enumerate(words, 1):
        r = process_word(word)
        results[r] += 1

        if i % 20 == 0 or i == total:
            elapsed = time.time() - t0
            rate = i / elapsed
            left = (total - i) / rate if rate else 0
            print(f"  [{i}/{total}] cambridge={results['cambridge']} "
                  f"kokoro={results['kokoro']} fail={results['fail']} "
                  f"| ~{left:.0f}s left")

        time.sleep(random.uniform(0.4, 0.7))

    print(f"\n[*] Done: cambridge={results['cambridge']} "
          f"kokoro={results['kokoro']} fail={results['fail']}")

if __name__ == "__main__":
    main()
