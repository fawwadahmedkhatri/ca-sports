// Downloads every product photo, compresses to WebP in public/images/products, and points
// products.json at the local copies. Safe to re-run: already-local images are skipped.
// Run after `npm run scrape`: npm run images
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import assert from 'node:assert';
import sharp from 'sharp';

const DATA = 'src/data/products.json';
const OUT = 'public/images/products';
const products = JSON.parse(readFileSync(DATA, 'utf8'));
mkdirSync(OUT, { recursive: true });

const local = (url) => `/images/products/${basename(url, extname(url))}.webp`;

async function convert(url) {
  const dest = 'public' + local(url);
  if (existsSync(dest)) return true;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null);
    if (r?.ok) {
      // 1000px covers the largest viewer stage; white bg stays (the UI blends it away)
      await sharp(Buffer.from(await r.arrayBuffer())).resize(1000, 1000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
      return true;
    }
    await new Promise((s) => setTimeout(s, 1000));
  }
  return false;
}

const urls = [...new Set(products.flatMap((p) => p.images).filter((u) => u.startsWith('http')))];
const failed = new Set();
let done = 0;
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let u; (u = queue.shift()); ) {
    if (!(await convert(u).catch(() => false))) failed.add(u);
    if (++done % 50 === 0) console.log(done, '/', urls.length);
  }
}));

// Failed downloads keep their remote URL so nothing breaks.
for (const p of products) p.images = p.images.map((u) => (u.startsWith('http') && !failed.has(u) ? local(u) : u));
writeFileSync(DATA, JSON.stringify(products, null, 1));
assert(products.every((p) => p.images.length), 'every product keeps at least one image');
console.log('converted', urls.length - failed.size, 'failed', failed.size, [...failed].slice(0, 5));
