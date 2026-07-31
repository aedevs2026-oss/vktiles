import fitz
from pathlib import Path

ROOT = Path(r"C:\Users\shiya\Videos\vktiles\VKPdf")
for pdf in sorted(ROOT.glob("*.pdf")):
    doc = fitz.open(pdf)
    index_pages = []
    for i in range(doc.page_count):
        links = [l for l in doc[i].get_links() if l.get("kind") == 4 and l.get("page") is not None]
        if len(links) >= 8:
            index_pages.append((i, len(links)))
    print(f"{pdf.name}: pages={doc.page_count} indexes={index_pages}")
    doc.close()
