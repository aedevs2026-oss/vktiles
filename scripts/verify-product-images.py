import json
import os
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
catalog_path = root / 'content' / 'valenza-catalog.json'
with catalog_path.open('r', encoding='utf-8') as fh:
    catalog = json.load(fh)
products = catalog.get('products', [])
refs = []
for product in products:
    for key in ['image', 'imageThumb', 'imageMedium']:
        value = product.get(key)
        if isinstance(value, str) and value.startswith('/'):
            refs.append((product.get('slug'), key, value))
    images = product.get('images') or []
    if isinstance(images, list):
        for src in images:
            if isinstance(src, str) and src.startswith('/'):
                refs.append((product.get('slug'), 'images', src))

bad = []
for slug, key, src in refs:
    full_path = root / src.lstrip('/')
    exists = full_path.exists()
    ok = False
    if exists:
        ext = full_path.suffix.lower()
        ok = ext in {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'}
    if not exists or not ok:
        bad.append((slug, key, src, exists, full_path.suffix.lower() if full_path.exists() else ''))

print('total refs', len(refs))
print('bad count', len(bad))
for item in bad[:200]:
    print(item[0], item[1], item[2], 'exists=', item[3], 'ext=', item[4])
