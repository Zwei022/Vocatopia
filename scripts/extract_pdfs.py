#!/usr/bin/env python3
"""提取三年閱讀 PDF 和聽力 PDF 的文字，存入 temp_sources/"""
import fitz, json
from pathlib import Path

BASE = Path("C:/Users/qaz10/Desktop/歷屆會考英文")
OUT  = Path("C:/Users/qaz10/Desktop/Vocatopia/temp_sources")
OUT.mkdir(exist_ok=True)

READING_PDFS = {
    2025: BASE / "2025/114P_English.pdf",
    2024: BASE / "2024/113P_English.pdf",
    2023: BASE / "2023/112P_English.pdf",
}
LISTENING_PDFS = {
    2025: BASE / "2025/114P_Listening/114P_Listening.pdf",
    2024: BASE / "2024/113_Listening/113P_Listening.pdf",
    2023: BASE / "2023/112P_Listening/112P_Listening.pdf",
}

def extract_text(pdf_path):
    doc = fitz.open(str(pdf_path))
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        pages.append({"page": i+1, "text": text})
    doc.close()
    return pages

for year, path in READING_PDFS.items():
    out = OUT / f"{year}_reading_raw.json"
    if out.exists():
        print(f"{year} reading: skip (exists)")
        continue
    if not path.exists():
        print(f"{year} reading: NOT FOUND at {path}")
        continue
    print(f"{year} reading: extracting...")
    pages = extract_text(path)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)
    # Also save plain text version
    out_txt = OUT / f"{year}_reading_raw.txt"
    with open(out_txt, "w", encoding="utf-8") as f:
        for p in pages:
            f.write(f"\n=== Page {p['page']} ===\n{p['text']}\n")
    print(f"  Done: {out} ({len(pages)} pages)")

for year, path in LISTENING_PDFS.items():
    out = OUT / f"{year}_listening_raw.json"
    if out.exists():
        print(f"{year} listening: skip (exists)")
        continue
    if not path.exists():
        print(f"{year} listening: NOT FOUND at {path}")
        continue
    print(f"{year} listening: extracting...")
    pages = extract_text(path)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)
    out_txt = OUT / f"{year}_listening_raw.txt"
    with open(out_txt, "w", encoding="utf-8") as f:
        for p in pages:
            f.write(f"\n=== Page {p['page']} ===\n{p['text']}\n")
    print(f"  Done: {out} ({len(pages)} pages)")

print("\nAll done!")
