#!/usr/bin/env python3
"""
generate_sentence_audio.py
批次生成例句朗讀 mp3（單字例句 + 文法教學例句），同樣使用 Kokoro am_michael。

輸入：
  - public/audio/sentences/words_examples.json   { "word": "example sentence", ... }
    （由 scripts/export_words_examples.js 從 Supabase 匯出）
  - server/data/grammar_lessons.json              文法課程，每個 subLesson.teaching.examples[] = {en, zh}

輸出：
  - public/audio/sentences/words/<word>.mp3          單字例句朗讀
  - public/audio/sentences/grammar/<subLessonId>_<i>.mp3   文法例句朗讀

用法：
  python scripts/generate_sentence_audio.py            # 只生成缺少的
  python scripts/generate_sentence_audio.py --rebuild  # 全部重新生成
"""
import sys, json, time, argparse, re
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT       = Path(__file__).parent.parent
WORDS_JSON = ROOT / "public" / "audio" / "sentences" / "words_examples.json"
GRAMMAR_JSON = ROOT / "server" / "data" / "grammar_lessons.json"
OUT_WORDS   = ROOT / "public" / "audio" / "sentences" / "words"
OUT_GRAMMAR = ROOT / "public" / "audio" / "sentences" / "grammar"
VOICE_ID   = "am_michael"
SPEED      = 0.95
TARGET_DB  = -16.0

def sanitize(word: str) -> str:
    return re.sub(r"[^a-z0-9_'-]", "", word.lower().replace(" ", "_"))

def gen_mp3(pipeline, text: str, out_path: Path):
    import numpy as np, soundfile as sf
    from pydub import AudioSegment
    segments = [audio for _, _, audio in pipeline(text, voice=VOICE_ID, speed=SPEED)]
    wav = np.concatenate(segments)
    tmp = out_path.with_suffix(".tmp.wav")
    sf.write(str(tmp), wav, 24000)
    audio = AudioSegment.from_wav(str(tmp))
    audio = audio.apply_gain(TARGET_DB - audio.dBFS)
    audio.export(str(out_path), format="mp3", bitrate="96k")
    tmp.unlink(missing_ok=True)

def load_word_examples():
    if not WORDS_JSON.exists():
        print(f"[!] 找不到 {WORDS_JSON}，請先跑 node scripts/export_words_examples.js")
        return {}
    with open(WORDS_JSON, encoding="utf-8") as f:
        return json.load(f)

def load_grammar_examples():
    """回傳 [(out_filename_stem, text), ...]"""
    items = []
    if not GRAMMAR_JSON.exists():
        return items
    with open(GRAMMAR_JSON, encoding="utf-8") as f:
        chapters = json.load(f)
    for chapter in chapters.values():
        for sub in chapter.get("subLessons", []):
            sub_id = sub.get("id", "unknown")
            examples = sub.get("teaching", {}).get("examples", [])
            for i, ex in enumerate(examples):
                text = (ex.get("en") or "").strip()
                if text:
                    items.append((f"{sub_id}_{i}", text))
    return items

def run_batch(pipeline, jobs, out_dir: Path, rebuild: bool, label: str):
    out_dir.mkdir(parents=True, exist_ok=True)
    if not rebuild:
        jobs = [(name, text) for name, text in jobs if not (out_dir / f"{name}.mp3").exists()]
    total = len(jobs)
    print(f"\n[*] {label}：需要生成 {total} 筆")
    if total == 0:
        return
    ok = 0; fail = 0; t0 = time.time()
    for i, (name, text) in enumerate(jobs, 1):
        out = out_dir / f"{name}.mp3"
        try:
            gen_mp3(pipeline, text, out)
            ok += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            fail += 1
        if i % 50 == 0 or i == total:
            elapsed = time.time() - t0
            rate = i / elapsed if elapsed > 0 else 0
            remaining = (total - i) / rate if rate > 0 else 0
            print(f"  [{label} {i}/{total}] {ok} OK / {fail} fail | {elapsed:.0f}s elapsed | ~{remaining:.0f}s left")
    print(f"[*] {label} 完成：{ok}/{total} 成功，{fail} 失敗")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true")
    parser.add_argument("--only", choices=["words", "grammar"], default=None)
    args = parser.parse_args()

    from kokoro import KPipeline
    print(f"[*] Loading Kokoro (voice: {VOICE_ID})...")
    pipeline = KPipeline(lang_code='a')

    if args.only in (None, "words"):
        word_examples = load_word_examples()
        jobs = [(sanitize(w), text) for w, text in word_examples.items()]
        run_batch(pipeline, jobs, OUT_WORDS, args.rebuild, "單字例句")

    if args.only in (None, "grammar"):
        grammar_jobs = load_grammar_examples()
        run_batch(pipeline, grammar_jobs, OUT_GRAMMAR, args.rebuild, "文法例句")

if __name__ == "__main__":
    main()
