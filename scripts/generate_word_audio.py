#!/usr/bin/env python3
"""
generate_word_audio.py
批次生成 2000 個單字 MP3（male_40 / am_echo）

用法：
  python scripts/generate_word_audio.py           # 生成全部缺少的
  python scripts/generate_word_audio.py --rebuild  # 全部重新生成（覆蓋舊檔）
  python scripts/generate_word_audio.py --word cat # 只生成單一單字
"""
import sys, json, time, argparse
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8','utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT         = Path(__file__).parent.parent
OFFICIAL_TXT = ROOT / "official_with_pos.txt"   # 完整 2000 字來源
CACHE        = ROOT / "supabase" / "words_cache.json"
OUT_DIR      = ROOT / "public" / "audio" / "words"
VOICE_ID     = "am_michael"  # 統一男聲（清晰有活力）
SPEED        = 0.95          # 接近正常語速
TARGET_DB    = -16.0         # 音量正規化目標

def load_words():
    """讀取官方 2000 字清單；若 txt 不存在則回退到 cache。"""
    if OFFICIAL_TXT.exists():
        words = []
        with open(OFFICIAL_TXT, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    words.append(line.split()[0].lower())
        return words
    # fallback: cache
    with open(CACHE, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return [w["word"] for w in data if w.get("word")]
    return list(data.keys())

def gen_mp3(pipeline, word: str, out_path: Path):
    import numpy as np, soundfile as sf
    from pydub import AudioSegment
    # 前後加句點，避免 Kokoro 把首字母 a 解讀為冠詞
    text = f"{word}."
    segments = []
    for _, _, audio in pipeline(text, voice=VOICE_ID, speed=SPEED):
        segments.append(audio)
    wav = np.concatenate(segments)
    tmp = out_path.with_suffix(".tmp.wav")
    sf.write(str(tmp), wav, 24000)
    audio = AudioSegment.from_wav(str(tmp))
    diff = TARGET_DB - audio.dBFS
    audio = audio.apply_gain(diff)
    audio.export(str(out_path), format="mp3", bitrate="96k")
    tmp.unlink(missing_ok=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="重新生成所有單字（覆蓋舊檔）")
    parser.add_argument("--word",    type=str,            help="只生成指定單字")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    from kokoro import KPipeline
    print(f"[*] Loading Kokoro (voice: {VOICE_ID} = male_40)...")
    pipeline = KPipeline(lang_code='a')

    # 單一單字模式
    if args.word:
        out = OUT_DIR / f"{args.word}.mp3"
        print(f"[*] Generating: {args.word}")
        gen_mp3(pipeline, args.word, out)
        print(f"[OK] {out}")
        return

    words = load_words()
    total = len(words)

    if not args.rebuild:
        words = [w for w in words if not (OUT_DIR / f"{w}.mp3").exists()]

    need = len(words)
    already = total - need
    print(f"[*] Total: {total}  |  Already done: {already}  |  Need: {need}")
    if need == 0:
        print("[*] All words already generated.")
        return

    print(f"[*] Starting batch generation...\n")
    ok = 0; fail = 0; t0 = time.time()
    for i, word in enumerate(words, 1):
        out = OUT_DIR / f"{word}.mp3"
        try:
            gen_mp3(pipeline, word, out)
            ok += 1
        except Exception as e:
            print(f"  [FAIL] {word}: {e}")
            fail += 1

        if i % 50 == 0 or i == need:
            elapsed = time.time() - t0
            rate    = i / elapsed
            remaining = (need - i) / rate if rate > 0 else 0
            print(f"  [{i}/{need}] {ok} OK / {fail} fail | "
                  f"{elapsed:.0f}s elapsed | ~{remaining:.0f}s left")

    print(f"\n[*] Done: {ok}/{need} generated, {fail} failed")
    print(f"[*] Output: {OUT_DIR}")

if __name__ == "__main__":
    main()
