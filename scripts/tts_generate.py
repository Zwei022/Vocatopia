#!/usr/bin/env python3
"""
tts_generate.py — 多說話者對話 TTS 生成器（Kokoro）
男女使用不同音色確保明確區分，無雜音（音量正規化）。

呼叫方式（由 server/routes/listening_audio.js 呼叫）：
  python scripts/tts_generate.py \
    --dialogue '[{"speaker":"male_40","text":"..."},{"speaker":"female_25","text":"..."}]' \
    --output /path/to/output.mp3
"""
import sys, json, argparse
from pathlib import Path

# Kokoro 音色 ID 對照：age_gender → (voice_id, speed)
# 男聲選低沉音色（am_echo），女聲選清晰音色（af_sarah），音調差異最大 → 最易區分
KOKORO_VOICE = {
    'male_12':   ('am_puck',    0.95),   # 少年男聲（活潑）
    'male_25':   ('am_michael', 0.92),   # 青年男聲（清晰標準）
    'male_40':   ('am_echo',    0.90),   # 成人男聲（低沉穩重）
    'female_12': ('af_nicole',  1.00),   # 少女音色（輕柔）
    'female_25': ('af_sarah',   0.95),   # 成年女聲（清晰自然）
    'female_40': ('af_heart',   0.92),   # 成熟女聲（溫潤）
}
DEFAULT_VOICE, DEFAULT_SPEED = 'af_sarah', 0.95

SILENCE_DIFF_MS = 450   # 不同說話者之間（ms）
SILENCE_SAME_MS = 200   # 同說話者連續（ms）
TARGET_DB       = -16.0  # 音量正規化目標
SR              = 24000  # Kokoro 輸出採樣率


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dialogue', required=True, help='JSON array of {speaker, text}')
    parser.add_argument('--output',   required=True, help='Output MP3 path')
    args = parser.parse_args()

    lines = json.loads(args.dialogue)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    import numpy as np
    import soundfile as sf
    from pydub import AudioSegment
    from kokoro import KPipeline

    print(f'[tts_generate] Loading Kokoro ({len(lines)} lines)...', flush=True)
    pipeline = KPipeline(lang_code='a')

    parts = []
    prev_speaker = None

    for line in lines:
        spk  = line.get('speaker', 'female_25')
        text = line.get('text', '').strip()
        if not text:
            continue

        voice_id, speed = KOKORO_VOICE.get(spk, (DEFAULT_VOICE, DEFAULT_SPEED))

        # 說話者切換用長停頓，同人連說用短停頓
        if parts:
            gap_ms = SILENCE_SAME_MS if spk == prev_speaker else SILENCE_DIFF_MS
            parts.append(np.zeros(int(SR * gap_ms / 1000), dtype=np.float32))

        segs = [a for _, _, a in pipeline(text, voice=voice_id, speed=speed)]
        if segs:
            parts.append(np.concatenate(segs))
        prev_speaker = spk

    if not parts:
        print('[tts_generate] ERROR: no audio segments generated', file=sys.stderr)
        sys.exit(1)

    combined = np.concatenate(parts)

    # 音量正規化：消除雜音感（過低 → 放大，過高 → 壓制）
    tmp_wav = out_path.with_suffix('.tmp.wav')
    sf.write(str(tmp_wav), combined, SR)
    seg = AudioSegment.from_wav(str(tmp_wav))
    seg = seg.apply_gain(TARGET_DB - seg.dBFS)
    seg.export(str(out_path), format='mp3', bitrate='128k')
    tmp_wav.unlink(missing_ok=True)

    print(f'[tts_generate] OK → {out_path}', flush=True)


if __name__ == '__main__':
    main()
