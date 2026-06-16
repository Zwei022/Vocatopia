#!/usr/bin/env python3
"""渲染 PDF 頁面為 PNG，存入 temp_sources/pages_{year}_{type}/"""
import fitz
from pathlib import Path

BASE = Path("C:/Users/qaz10/Desktop/歷屆會考英文")
OUT  = Path("C:/Users/qaz10/Desktop/Vocatopia/temp_sources")

PDFS = {
    ("2025","reading"):   BASE / "2025/114P_English.pdf",
    ("2024","reading"):   BASE / "2024/113P_English.pdf",
    ("2023","reading"):   BASE / "2023/112P_English.pdf",
    ("2025","listening"): BASE / "2025/114P_Listening/114P_Listening.pdf",
    ("2024","listening"): BASE / "2024/113_Listening/113P_Listening.pdf",
    ("2023","listening"): BASE / "2023/112P_Listening/112P_Listening.pdf",
}

DPI = 130

for (year, type_), pdf_path in PDFS.items():
    folder = OUT / f"pages_{year}_{type_}"
    if folder.exists() and list(folder.glob("*.png")):
        print(f"{year} {type_}: skip (exists)")
        continue
    folder.mkdir(exist_ok=True)
    doc = fitz.open(str(pdf_path))
    n = doc.page_count
    mat = fitz.Matrix(DPI/72, DPI/72)
    for i in range(n):
        page = doc[i]
        pix = page.get_pixmap(matrix=mat)
        out = folder / f"p{i+1:02d}.png"
        pix.save(str(out))
    doc.close()
    print(f"{year} {type_}: {n} pages rendered -> {folder}")

print("Done!")
