#!/usr/bin/env python3
"""
generate_all_word_audio.py
補齊「全字庫」（不只是核心2000字）的單字發音 mp3。

原本 generate_word_audio.py 只讀 official_with_pos.txt（會考核心 2000 字，
實際 1936 字），但 Supabase words 表其實還有 hs7000、Unit1-32、
使用者查詢字等，全部加起來 7000+ 字——只要不在核心 2000 字範圍內，
單字卡/文法教學點字查詢等功能點下去發音就會是壞的（Supabase word-audio
bucket 裡沒有那個檔案，fallback 到 Railway 本機 TTS 也是壞的）。

輸入：public/audio/sentences/all_words_for_audio.json
      （由 scripts/export 邏輯內嵌在這支腳本裡的 node one-liner 產生，
        或參考 README 重新用 supabase.from('words').select('word') 匯出）
輸出：public/audio/words/<word>.mp3（跟 generate_word_audio.py 同一個資料夾，
      已存在的字自動跳過，不會重複生成）

用法：
  python scripts/generate_all_word_audio.py
"""
import sys, json, time
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT      = Path(__file__).parent.parent
WORD_LIST = ROOT / "public" / "audio" / "sentences" / "all_words_for_audio.json"
OUT_DIR   = ROOT / "public" / "audio" / "words"
VOICE_ID  = "am_michael"
SPEED     = 0.95
TARGET_DB = -16.0

def sanitize(word: str) -> str:
    import re
    return re.sub(r"[^a-z0-9_'-]", "", word.lower().replace(" ", "_"))

def gen_mp3(pipeline, word: str, out_path: Path):
    import numpy as np, soundfile as sf
    from pydub import AudioSegment
    text = f"{word}."
    segments = [audio for _, _, audio in pipeline(text, voice=VOICE_ID, speed=SPEED)]
    wav = np.concatenate(segments)
    tmp = out_path.with_suffix(".tmp.wav")
    sf.write(str(tmp), wav, 24000)
    audio = AudioSegment.from_wav(str(tmp))
    audio = audio.apply_gain(TARGET_DB - audio.dBFS)
    audio.export(str(out_path), format="mp3", bitrate="96k")
    tmp.unlink(missing_ok=True)

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    words = json.loads(WORD_LIST.read_text(encoding="utf-8"))
    todo = [w for w in words if w and not (OUT_DIR / f"{sanitize(w)}.mp3").exists()]
    print(f"[*] 全字庫 {len(words)} 字，已存在 {len(words) - len(todo)}，需要生成 {len(todo)}")
    if not todo:
        print("[*] 全部已生成完畢")
        return

    from kokoro import KPipeline
    print(f"[*] Loading Kokoro (voice: {VOICE_ID})...")
    pipeline = KPipeline(lang_code='a')

    ok = 0; fail = 0; t0 = time.time()
    for i, word in enumerate(todo, 1):
        out = OUT_DIR / f"{sanitize(word)}.mp3"
        try:
            gen_mp3(pipeline, word, out)
            ok += 1
        except Exception as e:
            print(f"  [FAIL] {word}: {e}")
            fail += 1
        if i % 100 == 0 or i == len(todo):
            elapsed = time.time() - t0
            rate = i / elapsed if elapsed > 0 else 0
            remaining = (len(todo) - i) / rate if rate > 0 else 0
            print(f"  [{i}/{len(todo)}] {ok} OK / {fail} fail | {elapsed:.0f}s elapsed | ~{remaining:.0f}s left")

    print(f"\n[*] 完成：{ok}/{len(todo)} 生成，{fail} 失敗")

if __name__ == "__main__":
    main()
