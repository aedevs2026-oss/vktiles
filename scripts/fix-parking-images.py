import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out_dir = root / 'public' / 'products' / 'parking-tiles'
out_dir.mkdir(parents=True, exist_ok=True)

variants = [
    ('park-grey', '#8c8c8c', '#6a6a6a', '#dcdcdc', 'PARK GREY'),
    ('park-red', '#b94f4a', '#7b2d2a', '#f2dfdc', 'PARK RED'),
    ('park-yellow', '#d7b454', '#a57919', '#f7edc9', 'PARK YELLOW'),
    ('park-white', '#f2f2f2', '#d9d9d9', '#b8b8b8', 'PARK WHITE'),
    ('park-300-grey', '#8c8c8c', '#6a6a6a', '#dcdcdc', 'PARK 300 GREY'),
    ('park-300-red', '#b94f4a', '#7b2d2a', '#f2dfdc', 'PARK 300 RED'),
    ('park-500-grey', '#8c8c8c', '#6a6a6a', '#dcdcdc', 'PARK 500 GREY'),
    ('park-500-yellow', '#d7b454', '#a57919', '#f7edc9', 'PARK 500 YELLOW'),
    ('park-600-grey', '#8c8c8c', '#6a6a6a', '#dcdcdc', 'PARK 600 GREY'),
    ('park-600-red', '#b94f4a', '#7b2d2a', '#f2dfdc', 'PARK 600 RED'),
    ('parking-series', '#5c6b7a', '#2f3b4a', '#cbd6df', 'PARKING SERIES'),
]


def build_svg(name, base, accent, grout, label):
    size = 800 if '300' not in name and '500' not in name and '600' not in name else 600
    if '300' in name:
        size = 320
    elif '500' in name:
        size = 520
    elif '600' in name:
        size = 620
    tile = 120 if '300' not in name and '500' not in name and '600' not in name else 80 if '300' in name else 104 if '500' in name else 120
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="100%" height="100%" fill="{base}" opacity="0.12"/>
  <g fill="none" stroke="{grout}" stroke-width="10">
    <path d="M0 0 H{size} M0 0 V{size}"/>
    <path d="M0 {tile} H{size}"/>
    <path d="M{tile} 0 V{size}"/>
    <path d="M0 {tile*2} H{size}"/>
    <path d="M{tile*2} 0 V{size}"/>
    <path d="M0 {tile*3} H{size}"/>
    <path d="M{tile*3} 0 V{size}"/>
  </g>
  <g>
    <rect x="24" y="24" width="{tile-24}" height="{tile-24}" rx="18" fill="{accent}" opacity="0.95"/>
    <rect x="{tile+24}" y="24" width="{tile-24}" height="{tile-24}" rx="18" fill="{base}" opacity="0.95"/>
    <rect x="24" y="{tile+24}" width="{tile-24}" height="{tile-24}" rx="18" fill="{base}" opacity="0.95"/>
    <rect x="{tile+24}" y="{tile+24}" width="{tile-24}" height="{tile-24}" rx="18" fill="{accent}" opacity="0.95"/>
  </g>
  <rect x="24" y="{size-80}" width="{size-48}" height="44" rx="8" fill="#ffffff" opacity="0.92"/>
  <text x="{size/2}" y="{size-48}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#1f2937">{label}</text>
</svg>'''

for name, base, accent, grout, label in variants:
    path = out_dir / f'{name}.svg'
    path.write_text(build_svg(name, base, accent, grout, label), encoding='utf-8')
    print('wrote', path.name)

catalog_path = root / 'content' / 'valenza-catalog.json'
text = catalog_path.read_text(encoding='utf-8')
for name in [v[0] for v in variants]:
    text = text.replace(f'/products/parking-tiles/{name}.webp', f'/products/parking-tiles/{name}.svg')
catalog_path.write_text(text, encoding='utf-8')

category_images_path = root / 'lib' / 'category-images.js'
text = category_images_path.read_text(encoding='utf-8')
text = text.replace('/products/parking-tiles/park-grey.webp', '/products/parking-tiles/park-grey.svg')
text = text.replace('/products/parking-tiles/park-300-grey.webp', '/products/parking-tiles/park-300-grey.svg')
text = text.replace('/products/parking-tiles/park-500-grey.webp', '/products/parking-tiles/park-500-grey.svg')
text = text.replace('/products/parking-tiles/park-600-grey.webp', '/products/parking-tiles/park-600-grey.svg')
category_images_path.write_text(text, encoding='utf-8')

print('done')
