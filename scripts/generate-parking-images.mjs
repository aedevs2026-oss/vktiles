import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'products', 'parking-tiles');
fs.mkdirSync(outDir, { recursive: true });

const variants = [
  {
    name: 'park-grey',
    width: 800,
    height: 800,
    base: '#8c8c8c',
    accent: '#6f6f6f',
    grout: '#d7d7d7',
    tileSize: 180,
    pattern: 'grid',
  },
  {
    name: 'park-red',
    width: 800,
    height: 800,
    base: '#b94f4a',
    accent: '#7b2d2a',
    grout: '#f3e2dc',
    tileSize: 180,
    pattern: 'grid',
  },
  {
    name: 'park-yellow',
    width: 800,
    height: 800,
    base: '#d7b454',
    accent: '#a57919',
    grout: '#f7f0cf',
    tileSize: 180,
    pattern: 'grid',
  },
  {
    name: 'park-white',
    width: 800,
    height: 800,
    base: '#f2f2f2',
    accent: '#dedede',
    grout: '#b8b8b8',
    tileSize: 180,
    pattern: 'grid',
  },
  {
    name: 'park-300-grey',
    width: 300,
    height: 300,
    base: '#8c8c8c',
    accent: '#606060',
    grout: '#dcdcdc',
    tileSize: 72,
    pattern: 'grid',
  },
  {
    name: 'park-300-red',
    width: 300,
    height: 300,
    base: '#b94f4a',
    accent: '#7b2d2a',
    grout: '#f2dfdc',
    tileSize: 72,
    pattern: 'grid',
  },
  {
    name: 'park-500-grey',
    width: 500,
    height: 500,
    base: '#8c8c8c',
    accent: '#606060',
    grout: '#dcdcdc',
    tileSize: 108,
    pattern: 'grid',
  },
  {
    name: 'park-500-yellow',
    width: 500,
    height: 500,
    base: '#d7b454',
    accent: '#986b12',
    grout: '#f7edd0',
    tileSize: 108,
    pattern: 'grid',
  },
  {
    name: 'park-600-grey',
    width: 600,
    height: 600,
    base: '#8c8c8c',
    accent: '#606060',
    grout: '#dcdcdc',
    tileSize: 132,
    pattern: 'grid',
  },
  {
    name: 'park-600-red',
    width: 600,
    height: 600,
    base: '#b94f4a',
    accent: '#7b2d2a',
    grout: '#f2dfdc',
    tileSize: 132,
    pattern: 'grid',
  },
];

async function createVariant(variant) {
  const { name, width, height, base, accent, grout, tileSize, pattern } = variant;
  const image = sharp({ create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } } });

  const tiles = [];
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tileColor = (x + y) % 2 === 0 ? base : accent;
      const x0 = x * tileSize;
      const y0 = y * tileSize;
      tiles.push({
        input: {
          create: {
            width: tileSize,
            height: tileSize,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        },
        left: x0,
        top: y0,
      });
    }
  }

  const composite = [];
  for (const tile of tiles) {
    const color = (tile.left / tileSize + tile.top / tileSize) % 2 === 0 ? base : accent;
    composite.push({
      input: {
        create: {
          width: tileSize,
          height: tileSize,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      },
      left: tile.left,
      top: tile.top,
    });
  }

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" />
    <rect x="0" y="0" width="100%" height="100%" fill="${base}" opacity="0.18" />
    <g fill="none" stroke="${grout}" stroke-width="10">
      ${Array.from({ length: Math.floor(width / tileSize) + 1 }, (_, i) => `<line x1="${i * tileSize}" y1="0" x2="${i * tileSize}" y2="${height}" />`).join('')}
      ${Array.from({ length: Math.floor(height / tileSize) + 1 }, (_, i) => `<line x1="0" y1="${i * tileSize}" x2="${width}" y2="${i * tileSize}" />`).join('')}
    </g>
    <g>
      ${Array.from({ length: Math.floor(width / tileSize) }, (_, col) => Array.from({ length: Math.floor(height / tileSize) }, (_, row) => {
        const fill = (col + row) % 2 === 0 ? base : accent;
        return `<rect x="${col * tileSize + 12}" y="${row * tileSize + 12}" width="${tileSize - 24}" height="${tileSize - 24}" rx="18" fill="${fill}" opacity="0.92" />`;
      }).join('')).join('')}
    </g>
  </svg>`;

  const outPath = path.join(outDir, `${name}.webp`);
  await sharp(Buffer.from(svg)).resize(width, height).webp({ quality: 90 }).toFile(outPath);
  console.log(`created ${path.relative(root, outPath)}`);
}

async function main() {
  for (const variant of variants) {
    await createVariant(variant);
  }
  console.log('done');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
