#!/usr/bin/env python3
"""批次跑 faster-whisper 轉錄三年聽力音檔，輸出到 temp_sources/"""
import os, json, re
from pathlib import Path
from faster_whisper import WhisperModel

BASE = Path("C:/Users/qaz10/Desktop/歷屆會考英文")
OUT  = Path("C:/Users/qaz10/Desktop/Vocatopia/temp_sources")
OUT.mkdir(exist_ok=True)

YEARS = {
    2025: BASE / "2025/114P_Listening/Listening",
    2024: BASE / "2024/113_Listening/Listening",
    2023: BASE / "2023/112P_Listening",
}

model = WhisperModel("base", device="cpu", compute_type="int8")

def get_q_num(filename):
    m = re.search(r"第(\d+)題", filename)
    return int(m.group(1)) if m else None

for year, folder in YEARS.items():
    out_file = OUT / f"listening_asr_{year}.json"
    if out_file.exists():
        print(f"{year}: already done, skip")
        continue
    print(f"\n=== {year} ===")
    files = sorted(folder.glob("*.mp3"))
    result = {}
    for f in files:
        q = get_q_num(f.name)
        if q is None:
            continue
        print(f"  Q{q} {f.name} ...", end=" ", flush=True)
        segs, info = model.transcribe(str(f), language="en", beam_size=5)
        texts = [s.text.strip() for s in segs]
        # 每題音檔唸兩次，取所有 segment 合併（不強制去重，保留原始）
        full_text = " ".join(texts)
        result[str(q)] = full_text
        print(full_text[:60])
    with open(out_file, "w", encoding="utf-8") as fp:
        json.dump(result, fp, ensure_ascii=False, indent=2)
    print(f"  Saved: {out_file}")

print("\nDone!")
