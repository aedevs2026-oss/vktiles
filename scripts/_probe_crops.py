import fitz
from pathlib import Path
from PIL import Image
import io

ROOT = Path(r"C:\Users\shiya\Videos\vktiles")
out = Path(r"C:\Users\shiya\AppData\Local\Temp\vkpdf-crops")
out.mkdir(exist_ok=True)

doc = fitz.open(ROOT / "VKPdf" / "GLOSSY ENDLESS 1.pdf")
page = doc[5]  # index
# render full page at higher res
mat = fitz.Matrix(2, 2)
pix = page.get_pixmap(matrix=mat)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

links = page.get_links()
print("links", len(links))
for i, link in enumerate(links[:6]):
    r = link["from"]
    # scale rect by matrix
    box = (int(r.x0 * 2), int(r.y0 * 2), int(r.x1 * 2), int(r.y1 * 2))
    # expand downward for label
    label_box = (box[0], box[3], box[2], min(box[3] + 80, img.height))
    thumb = img.crop(box)
    label = img.crop(label_box)
    thumb.save(out / f"thumb-{i}.png")
    label.save(out / f"label-{i}.png")
    print(i, "-> page", link.get("page"), "rect", box, "label", label_box)

# Product detail page 7
page7 = doc[7]
pix7 = page7.get_pixmap(matrix=fitz.Matrix(0.5, 0.5))
pix7.save(str(out / "product-7.png"))
print("product page size", page7.rect)
