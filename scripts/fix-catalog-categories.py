import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "content" / "valenza-catalog.json"
catalog = json.loads(path.read_text(encoding="utf-8"))
categories = {}
for p in catalog["products"]:
    key = f"{p['category']}::{p['subcategory']}::{p['collection']}"
    if key not in categories:
        categories[key] = {
            "slug": p["subcategory"],
            "name": p["collection"],
            "category": p["category"],
            "subcategory": p["subcategory"],
            "parent": p["category"],
            "blurb": f"VK {p['collection']} — {p['size']}",
            "image": p["image"],
            "count": 0,
        }
    categories[key]["count"] += 1
catalog["categories"] = sorted(categories.values(), key=lambda c: (c["category"], c["name"]))
path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Updated {len(catalog['categories'])} categories")
