"""Probe cover pages and carving PDFs for metadata."""
import fitz
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ocr = RapidOCR()


def ocr_page(page, scale=1.5):
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    img = np.array(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
    result, _ = ocr(img)
    return [line[1] for line in (result or [])]


samples = [
    "MATT.pdf",
    "WOODEN MATT.pdf",
    "GLOSSY ENDLESS 1.pdf",
    "CARVING.pdf",
    "VALENZA NEW CARVING.pdf",
    "INKY_1.pdf",
]

for name in samples:
    doc = fitz.open(ROOT / "VKPdf" / name)
    print(f"\n=== {name} ===")
    for p in [0, 1, 2, 3, 4]:
        if p >= doc.page_count:
            break
        lines = ocr_page(doc[p])
        print(f"  page {p}: {' | '.join(lines[:8])}")
    doc.close()
