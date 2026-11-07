// Downloads every product and ambassador photo, compresses to WebP under public/images/<folder>,
// and points the data files at the local copies. Safe to re-run: already-local images are skipped.
// Run after `npm run scrape` / `npm run ambassadors`: npm run images
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import assert from 'node:assert';
import sharp from 'sharp';

const FILES = ['src/data/products.json', 'src/data/ambassadors.json'].filter(existsSync);
const REMOTE = /^https:\/\/thecasports\.com\/images\/([a-z_-]+)\/(.+)$/i;
const data = Object.fromEntries(FILES.map((f) => [f, JSON.parse(readFileSync(f, 'utf8'))]));

// https://thecasports.com/images/brands/x.jpg -> /images/brands/x.webp (keeps the source folder)
const isVideo = (url) => /\.mp4$/i.test(url);
const local = (url) => { const [, folder, file] = url.match(REMOTE); return `/images/${folder}/${basename(file, extname(file))}${isVideo(url) ? '.mp4' : '.webp'}`; };

// Walk any JSON value, collecting (or replacing) remote image URLs.
const walk = (v, fn) => (typeof v === 'string' ? fn(v) : Array.isArray(v) ? v.map((x) => walk(x, fn))
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, fn)])) : v);

async function convert(url) {
  const dest = 'public' + local(url);
  if (existsSync(dest)) return true;
  mkdirSync(dest.slice(0, dest.lastIndexOf('/')), { recursive: true });
  // products: 1000px covers the largest viewer stage; people photos show larger, so allow more
  const size = dest.includes('/products/') ? 1000 : 1600;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null);
    if (r?.ok) {
      // videos are already web-ready mp4s: store as-is
      if (isVideo(url)) { writeFileSync(dest, Buffer.from(await r.arrayBuffer())); return true; }
      await sharp(Buffer.from(await r.arrayBuffer())).resize(size, size, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
      return true;
    }
    await new Promise((s) => setTimeout(s, 1000));
  }
  return false;
}

const urls = new Set();
for (const v of Object.values(data)) walk(v, (s) => (REMOTE.test(s) && urls.add(s), s));
const failed = new Set();
let done = 0;
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let u; (u = queue.shift()); ) {
    if (!(await convert(u).catch(() => false))) failed.add(u);
    if (++done % 50 === 0) console.log(done, '/', urls.size);
  }
}));

// Failed downloads keep their remote URL so nothing breaks.
for (const [f, v] of Object.entries(data)) {
  const next = walk(v, (s) => (REMOTE.test(s) && !failed.has(s) ? local(s) : s));
  writeFileSync(f, JSON.stringify(next, null, 1));
  if (f.endsWith('products.json')) assert(next.every((p) => p.images.length), 'every product keeps at least one image');
}
console.log('converted', urls.size - failed.size, 'failed', failed.size, [...failed].slice(0, 5));
