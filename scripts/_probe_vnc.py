"""Probe VALENZA NEW CARVING product pages."""
import fitz
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ocr = RapidOCR()
doc = fitz.open(ROOT / "VKPdf" / "VALENZA NEW CARVING.pdf")

for p in [5, 6, 7, 8, 9, 10, 15, 20, 30]:
    if p >= doc.page_count:
        continue
    page = doc[p]
    links = page.get_links()
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
    img = np.array(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
    result, _ = ocr(img)
    lines = [line[1] for line in (result or [])]
    print(f"p{p}: links={len(links)} ocr={' | '.join(lines[:6])}")

doc.close()
