import fitz
from pathlib import Path

doc = fitz.open(Path(__file__).resolve().parents[1] / "Vkpdf" / "CARVING-3.pdf")
page = doc[3]
for block in page.get_text("dict")["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        text = "".join(s["text"] for s in line["spans"]).strip()
        if text:
            print(repr(text), line["bbox"])
