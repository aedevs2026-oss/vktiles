"""Probe Vkpdf structure for extraction strategy."""
import fitz
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "Vkpdf"
samples = [
    "ALBERT-BOSTON ( 16x16 ).pdf",
    "CARVING-3.pdf",
    "300x450 MM HIGH DEPTH ELEVATION 01.pdf",
    "WL GLITTER COLLECTION.pdf",
    "PLAIN COLLECTION ( 16x16 ).pdf",
]

for name in samples:
    p = ROOT / name
    if not p.exists():
        print(f"missing {name}")
        continue
    doc = fitz.open(p)
    print(f"=== {name} pages={doc.page_count} ===")
    link_kinds = {}
    for i in range(doc.page_count):
        for l in doc[i].get_links():
            k = l.get("kind")
            link_kinds[k] = link_kinds.get(k, 0) + 1
    print(f"  link kinds: {link_kinds}")
    for i in range(min(8, doc.page_count)):
        page = doc[i]
        links = page.get_links()
        imgs = page.get_images(full=True)
        text_lines = [ln.strip() for ln in page.get_text().splitlines() if ln.strip()][:8]
        print(f"  page {i}: links={len(links)} imgs={len(imgs)}")
        if text_lines:
            print(f"    text: {text_lines[:5]}")
        if imgs:
            areas = []
            for info in imgs[:5]:
                xref = info[0]
                try:
                    base = doc.extract_image(xref)
                    w, h = base.get("width", 0), base.get("height", 0)
                    areas.append((w, h, w * h))
                except Exception:
                    pass
            print(f"    img sizes: {areas}")
    doc.close()
    print()
