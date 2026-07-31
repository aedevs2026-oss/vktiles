import fitz
from pathlib import Path

pdf = Path(r"C:\Users\shiya\Videos\vktiles\VKPdf\VALENZA NEW CARVING.pdf")
doc = fitz.open(pdf)
print("pages", doc.page_count)
for i in range(min(15, doc.page_count)):
    links = doc[i].get_links()
    print(f"p{i}: links={len(links)} kinds={[l.get('kind') for l in links[:8]]}")

# save a few pages
out = Path(r"C:\Users\shiya\AppData\Local\Temp\vkpdf-pages")
for i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12]:
    pix = doc[i].get_pixmap(matrix=fitz.Matrix(0.35, 0.35))
    pix.save(str(out / f"vnc-{i}.png"))
