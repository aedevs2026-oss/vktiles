"""Count products across all VKPdf catalogs."""
import fitz
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "VKPdf"

total = 0
for pdf in sorted(ROOT.glob("*.pdf")):
    doc = fitz.open(pdf)
    seen_pages = set()
    index_pages = []
    for i in range(doc.page_count):
        links = [
            l
            for l in doc[i].get_links()
            if l.get("kind") == 4 and l.get("page") is not None
        ]
        if len(links) >= 8:
            index_pages.append((i, len(links)))

    products = []
    for idx_page, _ in index_pages:
        links = [
            l
            for l in doc[idx_page].get_links()
            if l.get("kind") == 4 and l.get("page") is not None
        ]
        for link in links:
            page_num = int(link["page"])
            if page_num not in seen_pages:
                seen_pages.add(page_num)
                products.append(page_num)

    print(f"{pdf.name}: indexes={index_pages} products={len(products)}")
    total += len(products)
    doc.close()

print("TOTAL", total)
