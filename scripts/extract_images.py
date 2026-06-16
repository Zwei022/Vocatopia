#!/usr/bin/env python3
"""從聽力/閱讀 PDF 裁出圖片題的圖 - 用 get_drawings 找向量框"""
import fitz
from pathlib import Path

BASE   = Path("C:/Users/qaz10/Desktop/歷屆會考英文")
LISTEN = {
    2025: BASE/"2025/114P_Listening/114P_Listening.pdf",
    2024: BASE/"2024/113_Listening/113P_Listening.pdf",
    2023: BASE/"2023/112P_Listening/112P_Listening.pdf",
}
READ   = {
    2025: BASE/"2025/114P_English.pdf",
    2024: BASE/"2024/113P_English.pdf",
    2023: BASE/"2023/112P_English.pdf",
}
IMG_OUT = Path("C:/Users/qaz10/Desktop/Vocatopia/public/images/gsat")

DPI = 150
SCALE = DPI / 72

def get_rects(page):
    """取出頁面上所有向量框（忽略細小線條）"""
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width > 40 and r.height > 40:
            rects.append(r)
    return rects

def crop_rect(page, rect, out_path, margin=4):
    """裁切頁面特定區域存成 PNG"""
    clip = rect + fitz.Rect(-margin, -margin, margin, margin)
    mat  = fitz.Matrix(SCALE, SCALE)
    pix  = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(str(out_path))

# ──────────────────────────────────────────────
# 聽力 Q1-3 (第一部分看圖選一) - 頁 2 和 3
# ──────────────────────────────────────────────
for year, pdf_path in LISTEN.items():
    out_dir = IMG_OUT / f"{year}_listening"
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))

    # Q1, Q2 在 page index 1 (PDF 頁 2)
    # Q3      在 page index 2 (PDF 頁 3)
    # page 1 (idx=1): 示例題(skip) + Q1 + Q2
    # page 2 (idx=2): Q3 + Part2 heading
    question_locs = {1: ([1, 2], 1), 2: ([3], 0)}  # page_idx: (question_nums, skip_n)

    for page_idx, (q_nums, skip) in question_locs.items():
        page = doc[page_idx]
        rects = sorted(get_rects(page), key=lambda r: r.y0)
        # 每題是一列三欄圖，把 rects 依 y 聚合成「題」
        groups = []
        cur_group = []
        for r in rects:
            if cur_group and (r.y0 - cur_group[-1].y1 > 20):
                groups.append(cur_group)
                cur_group = [r]
            else:
                cur_group.append(r)
        if cur_group:
            groups.append(cur_group)

        img_groups = [g for g in groups if len(g) >= 2]
        # 跳過示例題群組
        img_groups = img_groups[skip:]

        for i, q in enumerate(q_nums):
            out_file = out_dir / f"q{q}.png"
            if out_file.exists():
                print(f"  {year} listen q{q}: exists, skip")
                continue
            if i < len(img_groups):
                grp = img_groups[i]
                x0 = min(r.x0 for r in grp) - 5
                y0 = min(r.y0 for r in grp) - 5
                x1 = max(r.x1 for r in grp) + 5
                y1 = max(r.y1 for r in grp) + 5
                clip_rect = fitz.Rect(x0, y0, x1, y1)
                crop_rect(page, clip_rect, out_file)
                print(f"  {year} listen q{q}: saved ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})")
            else:
                print(f"  {year} listen q{q}: WARNING - not enough groups ({len(img_groups)})")
    doc.close()

# ──────────────────────────────────────────────
# 閱讀 Q1 (看圖填空)
# ──────────────────────────────────────────────
for year, pdf_path in READ.items():
    out_dir = IMG_OUT / str(year)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "q1_picture.png"
    if out_file.exists():
        print(f"  {year} read q1: exists, skip")
        continue

    doc = fitz.open(str(pdf_path))
    page = doc[1]  # 第一題通常在 page 1 (0-indexed)
    rects = get_rects(page)

    if rects:
        # Q1 圖片通常是頁面上方最大的矩形
        rects_sorted = sorted(rects, key=lambda r: r.height * r.width, reverse=True)
        big = rects_sorted[0]
        crop_rect(page, big, out_file)
        print(f"  {year} read q1: saved {big}")
    else:
        # 嘗試找 xobject (嵌入圖片)
        images = page.get_images(full=True)
        print(f"  {year} read q1: no vector rects, images={len(images)}")
    doc.close()

print("\nDone!")
