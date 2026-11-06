// Scrapes all products from thecasports.com into src/data/products.json.
// Run: node scripts/scrape.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert';

const BASE = 'https://thecasports.com';
// Specific categories first; 1 (broad 'Cricket Equipments') last so items get the most specific label.
const CATEGORIES = [[19, 'Softball Bats'], [11, 'Cricket Shoes'], [15, 'Protection Gear'], [20, 'Cricket Bags'], [12, 'Accessories'], [1, 'Cricket Equipment']];

const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok) return r.text();
    await new Promise((s) => setTimeout(s, 1000));
  }
  throw new Error('fetch failed ' + url);
};
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

// Product links (slug/color) from a listing page, plus whether a next page exists.
const listing = async (url) => {
  const html = await get(url);
  const slugs = [...html.matchAll(/<h3 class="product-title"><a href="https:\/\/thecasports\.com\/product\/([^/"]+\/[^"]+)"/g)].map((m) => m[1]);
  return { slugs: [...new Set(slugs)], html };
};

const crawlList = async (query) => {
  const all = new Set();
  for (let page = 1; page < 30; page++) {
    const { slugs } = await listing(`${BASE}/Shop-all-products?${query}page=${page}`); console.log(query, page, slugs.length);
    const before = all.size;
    slugs.forEach((s) => all.add(s));
    if (!slugs.length || all.size === before) break;
  }
  return [...all];
};

const detail = async (path, slug) => {
  const html = await get(`${BASE}/product/${path}`);
  const main = html.split('pdp-trust')[0];
  const name = text((main.match(/<h1 class="pdp-info__title">([\s\S]*?)<\/h1>/) || [, slug])[1]);
  const gallery = main.split('id="pdpGallery"')[1] || '';
  const images = [...new Set([...gallery.matchAll(/images\/products\/([\w.-]+\.(?:jpg|jpeg|png|webp))/gi)].map((m) => `${BASE}/images/products/${m[1]}`))];
  const prices = [...main.matchAll(/Rs\.\s?([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, ''))).filter((n) => n !== 5000 || main.includes('Rs. 5,000'));
  const colors = [...new Set([...main.matchAll(new RegExp(`/product/${slug.replace(/[()]/g, '\\$&')}/([^"/?]+)"`, 'g'))].map((m) => decodeURIComponent(m[1])))];
  const specs = [...html.matchAll(/<dt class="pdp-spec-label">([\s\S]*?)<\/dt><dd class="pdp-spec-value">([\s\S]*?)<\/dd>/g)].map((m) => ({ label: text(m[1]), value: text(m[2]) }));
  const descHtml = (html.match(/Description<\/h3><div class="pdp-section__body pdp-prose">([\s\S]*?)<\/div><\/section>/) || [, ''])[1];
  const bullets = [...descHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1])).filter(Boolean);
  const summary = text(descHtml.replace(/<li[\s\S]*?<\/li>/g, '').replace(/<h2[\s\S]*?<\/h2>/g, '')).slice(0, 600);
  return { name, images, prices, colors, specs, bullets, summary };
};

const bySlug = new Map();
for (const [id, cat] of CATEGORIES) {
  for (const s of await crawlList(`category=${id}&`)) if (!bySlug.has(s.split('/')[0])) bySlug.set(s.split('/')[0], [s, cat]);
}
for (const s of await crawlList('')) if (!bySlug.has(s.split('/')[0])) bySlug.set(s.split('/')[0], [s, 'Cricket Equipment']);
console.log('found', bySlug.size, 'products');

const products = [];
for (const [slug, [path, category]] of bySlug) {
  try {
    const d = await detail(path, slug);
    products.push(build(slug, category, d)); console.log(products.length, slug);
  } catch (e) { console.warn('skip', slug, e.message); }
}

function build(slug, category, d) {
  // First "Rs." on the page is the selling price; a higher second one is the struck-out original.
  const [price, maybeOld] = d.prices;
  return {
    id: slug, name: d.name, category, price: price || null,
    oldPrice: maybeOld && maybeOld > price ? maybeOld : null,
    colors: d.colors, images: d.images, specs: d.specs, highlights: d.bullets, summary: d.summary,
    url: `${BASE}/product/${slug}/${d.colors[0] || ''}`,
  };
}

assert(products.length > 20, 'expected many products');
assert(products.every((p) => p.name && p.images.length), 'every product needs a name and image');
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/products.json', JSON.stringify(products, null, 1));
console.log('wrote', products.length, 'products');
