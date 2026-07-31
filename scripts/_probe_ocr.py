import fitz
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()


def ocr_image(pil_img):
    arr = np.array(pil_img)
    result, _ = ocr(arr)
    return [line[1] for line in (result or [])]
doc = fitz.open("VKPdf/MATT.pdf")

page = doc[5]
mat = fitz.Matrix(2, 2)
pix = page.get_pixmap(matrix=mat)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
links = [l for l in page.get_links() if l.get("kind") == 4 and l.get("page") is not None]
for i, link in enumerate(links[:5]):
    r = link["from"]
    label_box = (int(r.x0 * 2), int(r.y1 * 2), int(r.x1 * 2), min(int(r.y1 * 2) + 80, img.height))
    crop = img.crop(label_box)
    text = " | ".join(ocr_image(crop))
    print(f"idx {i} page {link['page']}: {text}")

print("--- product page 8 ---")
page8 = doc[8]
pix8 = page8.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
img8 = Image.frombytes("RGB", [pix8.width, pix8.height], pix8.samples)
for line in ocr_image(img8)[:20]:
    print(line[1])

doc.close()
