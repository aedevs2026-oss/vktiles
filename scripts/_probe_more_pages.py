import fitz
from pathlib import Path

ROOT = Path(r"C:\Users\shiya\Videos\vktiles")
out = Path(r"C:\Users\shiya\AppData\Local\Temp\vkpdf-pages")
out.mkdir(exist_ok=True)

# Sample more page types from glossy endless - find index and product pages
pdf = ROOT / "VKPdf" / "GLOSSY ENDLESS 1.pdf"
doc = fitz.open(pdf)
for i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50]:
    if i >= doc.page_count:
        continue
    pix = doc[i].get_pixmap(matrix=fitz.Matrix(0.35, 0.35))
    pix.save(str(out / f"ge1-{i}.png"))
    print("saved", i)

# wooden index page already known - check product pages after index
doc2 = fitz.open(ROOT / "VKPdf" / "WOODEN MATT.pdf")
for i in [1, 3, 4, 6, 7, 8, 9, 11, 12, 15, 20]:
    if i >= doc2.page_count:
        continue
    pix = doc2[i].get_pixmap(matrix=fitz.Matrix(0.35, 0.35))
    pix.save(str(out / f"wm-{i}.png"))
    print("wm", i)
