"""Probe text/image positions on grid product pages."""
import fitz
from pathlib import Path
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "Vkpdf"
pdf = ROOT / "ALBERT-BOSTON ( 16x16 ).pdf"
doc = fitz.open(pdf)
page = doc[3]  # product grid page

print("TEXT BLOCKS:")
for block in page.get_text("dict")["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        text = "".join(s["text"] for s in line["spans"]).strip()
        if not text:
            continue
        bbox = line["bbox"]
        print(f"  {text!r} @ {bbox}")

print("\nIMAGES:")
for info in page.get_images(full=True):
    xref = info[0]
    rects = page.get_image_rects(xref)
    base = doc.extract_image(xref)
    w, h = base.get("width", 0), base.get("height", 0)
    for r in rects:
        print(f"  {w}x{h} area={w*h} rect={tuple(r)}")

doc.close()
