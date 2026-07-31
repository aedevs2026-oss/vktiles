import fitz
from pathlib import Path

ROOT = Path(r"C:\Users\shiya\Videos\vktiles")
out = ROOT / "public" / "_pdf-preview"
out.mkdir(parents=True, exist_ok=True)

samples = [
    ("MATT.pdf", [0, 1, 2, 3, 4, 8, 15, 20]),
    ("WOODEN MATT.pdf", [0, 2, 5, 10]),
    ("CARVING.pdf", [0, 3, 10, 20]),
    ("GLOSSY ENDLESS 1.pdf", [0, 2, 5, 12]),
    ("INKY_1.pdf", [0, 3, 8]),
]

for name, idxs in samples:
    doc = fitz.open(ROOT / "VKPdf" / name)
    stem = Path(name).stem.replace(" ", "_")
    for i in idxs:
        if i >= doc.page_count:
            continue
        pix = doc[i].get_pixmap(matrix=fitz.Matrix(0.4, 0.4))
        path = out / f"{stem}-{i}.png"
        pix.save(str(path))
        print(path.name, pix.width, pix.height)
    doc.close()
