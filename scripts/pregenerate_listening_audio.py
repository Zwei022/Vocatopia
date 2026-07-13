#!/usr/bin/env python3
"""
pregenerate_listening_audio.py
把 question_bank_listening.json 全部題目的對話音檔，用跟
server/routes/listening_audio.js 完全相同的 md5 hash 命名規則、
跟 tts_generate.py 完全相同的多說話者合成邏輯，一次把 Kokoro 模型
只載入一次、批次生成到 cache/listening/，避免逐題呼叫 subprocess
重複載入模型（很慢）。

用法：
  python scripts/pregenerate_listening_audio.py
"""
import sys, json, hashlib, re
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT      = Path(__file__).parent.parent
BANK_PATH = ROOT / "server" / "data" / "question_bank_listening.json"
CACHE_DIR = ROOT / "cache" / "listening"

VOICE_MAP = {
    'kevin': 'male_12', 'tom': 'male_12', 'boy': 'male_12',
    'sarah': 'female_12', 'lily': 'female_12', 'jessica': 'female_12', 'lisa': 'female_12', 'girl': 'female_12',
    'ben': 'male_25', 'mike': 'male_25', 'mark': 'male_25', 'james': 'male_25', 'david': 'male_25', 'waiter': 'male_25', 'narrator': 'male_25',
    'amy': 'female_25', 'anna': 'female_25', 'woman': 'female_25', 'clerk': 'female_25',
    'teacher': 'female_40', 'nurse': 'female_40', 'mom': 'female_40', 'mother': 'female_40', 'receptionist': 'female_40',
    'man': 'male_40', 'dad': 'male_40', 'father': 'male_40', 'doctor': 'male_40',
}

KOKORO_VOICE = {
    'male_12':   ('am_puck',    0.95),
    'male_25':   ('am_michael', 0.92),
    'male_40':   ('am_echo',    0.90),
    'female_12': ('af_nicole',  1.00),
    'female_25': ('af_sarah',   0.95),
    'female_40': ('af_heart',   0.92),
}
DEFAULT_VOICE, DEFAULT_SPEED = 'af_sarah', 0.95
SILENCE_DIFF_MS = 450
SILENCE_SAME_MS = 200
TARGET_DB       = -16.0
SR              = 24000

def parse_dialogue(text):
    lines = []
    for line in text.split('\n'):
        if not line.strip():
            continue
        m = re.match(r'^([^:]+):\s*(.+)$', line.strip())
        if not m:
            continue
        speaker = VOICE_MAP.get(m.group(1).strip().lower(), 'female_25')
        lines.append({'speaker': speaker, 'text': m.group(2).strip()})
    return lines

def gen_dialogue_mp3(pipeline, lines, out_path: Path):
    import numpy as np, soundfile as sf
    from pydub import AudioSegment

    parts = []
    prev_speaker = None
    for line in lines:
        spk, text = line['speaker'], line['text']
        if not text:
            continue
        voice_id, speed = KOKORO_VOICE.get(spk, (DEFAULT_VOICE, DEFAULT_SPEED))
        if parts:
            gap_ms = SILENCE_SAME_MS if spk == prev_speaker else SILENCE_DIFF_MS
            parts.append(np.zeros(int(SR * gap_ms / 1000), dtype=np.float32))
        segs = [a for _, _, a in pipeline(text, voice=voice_id, speed=speed)]
        if segs:
            parts.append(np.concatenate(segs))
        prev_speaker = spk

    if not parts:
        raise ValueError('no audio segments generated')

    combined = np.concatenate(parts)
    tmp = out_path.with_suffix('.tmp.wav')
    sf.write(str(tmp), combined, SR)
    seg = AudioSegment.from_wav(str(tmp))
    seg = seg.apply_gain(TARGET_DB - seg.dBFS)
    seg.export(str(out_path), format='mp3', bitrate='128k')
    tmp.unlink(missing_ok=True)

def main():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    bank = json.loads(BANK_PATH.read_text(encoding='utf-8'))
    items = bank if isinstance(bank, list) else [q for v in bank.values() for q in v]
    items = [q for q in items if q.get('dialogue', '').strip()]
    print(f"[*] 共 {len(items)} 筆對話需要生成")

    from kokoro import KPipeline
    print("[*] Loading Kokoro...")
    pipeline = KPipeline(lang_code='a')

    ok = 0; skip = 0; fail = 0
    for q in items:
        dialogue = q['dialogue'].strip()
        h = hashlib.md5(dialogue.encode('utf-8')).hexdigest()
        out = CACHE_DIR / f"{h}.mp3"
        if out.exists():
            skip += 1
            continue
        lines = parse_dialogue(dialogue)
        if not lines:
            print(f"  [SKIP] {q.get('id')}: 無法解析對話格式")
            continue
        try:
            gen_dialogue_mp3(pipeline, lines, out)
            ok += 1
            print(f"  [OK] {q.get('id')} -> {h}.mp3")
        except Exception as e:
            print(f"  [FAIL] {q.get('id')}: {e}")
            fail += 1

    print(f"\n[*] 完成：{ok} 成功、{skip} 已存在跳過、{fail} 失敗")
    print(f"[*] Output: {CACHE_DIR}")

if __name__ == "__main__":
    main()
