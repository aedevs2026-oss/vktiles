import fitz
from pathlib import Path

ROOT = Path(r"C:\Users\shiya\Videos\vktiles")
pdf = ROOT / "VKPdf" / "GLOSSY ENDLESS 1.pdf"
doc = fitz.open(pdf)

# Find pages with many links or "INDEX" in image - check links across first 20 pages
for i in range(min(20, doc.page_count)):
    page = doc[i]
    links = page.get_links()
    annots = list(page.annots() or [])
    print(f"page {i}: links={len(links)} annots={len(annots)}")
    for link in links[:5]:
        print("  ", {k: link.get(k) for k in ("kind", "page", "uri", "xref", "from")})
    # try get_text from widgets
    widgets = list(page.widgets() or [])
    if widgets:
        print("  widgets", len(widgets))

# Also check TOC
toc = doc.get_toc()
print("TOC entries", len(toc))
for t in toc[:30]:
    print(t)

# Check named destinations
print("page_count", doc.page_count)
