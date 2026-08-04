import fitz
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "Vkpdf" / "300x450 MM HIGH DEPTH ELEVATION 01.pdf"
doc = fitz.open(p)
seen = {}
for i in range(doc.page_count):
    imgs = doc[i].get_images(full=True)
    if not imgs:
        print(f"page {i}: no images")
        continue
    xref = imgs[0][0]
    base = doc.extract_image(xref)
    key = (xref, base.get("width"), base.get("height"))
    if key not in seen:
        seen[key] = []
    seen[key].append(i)
print(f"pages={doc.page_count} unique={len(seen)}")
for k, pages in list(seen.items())[:10]:
    print(f"  xref={k[0]} {k[1]}x{k[2]} on pages {pages[:8]}{'...' if len(pages)>8 else ''}")
