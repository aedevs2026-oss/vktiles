import json
import re
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image, UnidentifiedImageError

root = Path(__file__).resolve().parents[1]
catalog_path = root / 'content' / 'valenza-catalog.json'
out_dir = root / 'public' / 'products'

with catalog_path.open('r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog.get('products', [])

for product in products:
    category = re.sub(r'[^a-z0-9]+', '-', (product.get('category') or 'uncategorized').lower()).strip('-')
    (out_dir / category).mkdir(parents=True, exist_ok=True)


def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', (text or '').strip().lower()).strip('-')


def candidate_urls(product: dict):
    urls = []
    for key in ('image', 'imageMedium', 'imageThumb'):
        value = product.get(key)
        if isinstance(value, str) and value.strip():
            urls.append(value.strip())
    for value in product.get('images', []) or []:
        if isinstance(value, str) and value.strip():
            urls.append(value.strip())
    return urls


def download_image(source_url: str, dest_path: Path) -> bool:
    for attempt in range(3):
        try:
            response = requests.get(source_url, timeout=20)
            response.raise_for_status()
            break
        except Exception:
            if attempt == 2:
                return False

    try:
        with Image.open(BytesIO(response.content)) as img:
            img = img.convert('RGB')
            max_side = 1600
            img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
            img.save(dest_path, format='WEBP', quality=82, optimize=True)
    except (UnidentifiedImageError, OSError, ValueError):
        return False

    return dest_path.exists()


count = 0
for product in products:
    slug = slugify(product.get('name') or product.get('slug') or 'product')
    category = re.sub(r'[^a-z0-9]+', '-', (product.get('category') or 'uncategorized').lower()).strip('-')
    dest_path = out_dir / category / f'{slug}.webp'
    local_path = f'/products/{category}/{slug}.webp'

    if dest_path.exists():
        product['image'] = local_path
        product['imageThumb'] = local_path
        product['imageMedium'] = local_path
        product['images'] = [local_path]
        continue

    for url in candidate_urls(product):
        if not url.startswith('http'):
            continue
        if download_image(url, dest_path):
            product['image'] = local_path
            product['imageThumb'] = local_path
            product['imageMedium'] = local_path
            product['images'] = [local_path]
            count += 1
            break
        else:
            product['image'] = local_path
            product['imageThumb'] = local_path
            product['imageMedium'] = local_path
            product['images'] = [local_path]

    if not product.get('image') or product['image'] == '':
        product['image'] = local_path
        product['imageThumb'] = local_path
        product['imageMedium'] = local_path
        product['images'] = [local_path]

with catalog_path.open('w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print(f'Updated {count} products with local images in {out_dir}')
