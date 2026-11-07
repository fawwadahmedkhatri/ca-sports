// Scrapes the brand ambassadors ("Our Champions") from thecasports.com into src/data/ambassadors.json.
// Run: npm run ambassadors   (then `npm run images` to self-host the photos)
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert';

const BASE = 'https://thecasports.com';
const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null);
    if (r?.ok) return r.text();
    await new Promise((s) => setTimeout(s, 1000));
  }
  throw new Error('fetch failed ' + url);
};
const text = (s = '') => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
  .replace(/&([aeiou])(acute|grave|uml|circ);/gi, (_, ch, m) => (ch + { acute: '́', grave: '̀', uml: '̈', circ: '̂' }[m.toLowerCase()]).normalize('NFC'))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))) // e.g. &#039; -> '
  .replace(/\s+/g, ' ').trim();
const between = (html, a, b) => { const i = html.indexOf(a); if (i < 0) return ''; const j = html.indexOf(b, i + a.length); return html.slice(i + a.length, j < 0 ? undefined : j); };
const paras = (html) => [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter(Boolean);
const imgs = (html) => [...new Set([...html.matchAll(/src=["']?(https:\/\/thecasports\.com\/images\/brands\/[^"' >]+)/g)].map((m) => m[1]))];

// Video width/height from the MP4 track headers ('tkhd' boxes end with 16.16 fixed-point width, height);
// the widest track is the video one (audio tracks are 0x0). Pages need it to size the player box.
async function videoSize(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null);
  if (!r?.ok) return null;
  const b = Buffer.from(await r.arrayBuffer());
  let best = null;
  for (let i = b.indexOf('tkhd'); i > 3; i = b.indexOf('tkhd', i + 4)) {
    const end = i - 4 + b.readUInt32BE(i - 4); // box start + box size
    const w = b.readUInt32BE(end - 8) / 65536, h = b.readUInt32BE(end - 4) / 65536;
    if (w > 0 && h > 0 && (!best || w * h > best[0] * best[1])) best = [w, h];
  }
  return best;
}

const productIds =new Set(JSON.parse(readFileSync('src/data/products.json', 'utf8')).map((p) => p.id));

const list = await get(`${BASE}/brand_ambassadors`);
const main = list.split('<footer')[0];
const cards = [...main.matchAll(/href="https:\/\/thecasports\.com\/brand_ambassador\/([a-z0-9-]+)"[\s\S]*?<img src=["']?([^"' >]+)[\s\S]*?<h2 class="title-inner1">([^<]+)/g)]
  .map((m) => ({ id: m[1], card: m[2], name: text(m[3]) }));

const out = [];
for (const c of cards) {
  if (out.some((a) => a.id === c.id)) continue;
  const html = (await get(`${BASE}/brand_ambassador/${c.id}`)).split('<footer')[0];
  const stats = [...between(html, 'class="champion-stats"', 'champion-quote').matchAll(/<strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span>/g)]
    .map((m) => ({ label: text(m[2]), value: text(m[1]) }));
  const quote = text(between(html, '<blockquote>', '</blockquote>'));
  // The client's tab labels don't match their content: "Profile" = life story, "Bio" = awards by year, "Rep. Honours" = records list.
  const bio = paras(between(html, 'id="top-home"', 'id="top-profile"'));
  const awards = [...between(html, 'id="top-profile"', 'id="top-contact"').matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ year: text(m[1]), text: text(m[2]) })).filter((h) => h.text);
  const recHtml = between(html, 'id="top-contact" role="tabpanel">', 'Collection</h1>').split('<h1')[0];
  // usually a <ul>, but some players' records are <br>-separated lines in a <p>
  const items = [...recHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  const records = (items.length ? items : recHtml.split(/<br\s*\/?>|<\/p>/)).map(text).filter(Boolean);
  const collection = between(html, 'Collection</h1>', 'Moments</h2>');
  // keep only products that exist in our catalog, in page order
  const products = [...new Set([...collection.matchAll(/\/product\/([^/"]+)\//g)].map((m) => m[1]))].filter((id) => productIds.has(id));
  const top = html.split('class="champion-details')[0];
  const moments = imgs(html.split('Moments</h2>')[1] || '');
  const video = (top.match(/<video[\s\S]*?<source src=["']?(https:\/\/thecasports\.com\/images\/[^"' >]+\.mp4)/) || [])[1] || null;
  out.push({
    id: c.id,
    name: c.name.replace(/\b\w/g, (ch) => ch.toUpperCase()),
    card: c.card,
    portrait: imgs(top)[0] || c.card,
    stats, quote, bio, awards, records, products, moments, video,
    videoSize: video ? await videoSize(video) : null,
    url: `${BASE}/brand_ambassador/${c.id}`,
  });
  console.log(out.length, c.id, `stats:${stats.length} bio:${bio.length} awards:${awards.length} records:${records.length} products:${products.length} moments:${moments.length}`);
}

assert(out.length >= 10, 'expected the full ambassador list');
assert(out.every((a) => a.name && a.portrait), 'every ambassador needs a name and photo');
console.log('videos:', out.filter((a) => a.video).length, '/', out.length);
assert(out.every((a) => !a.video || a.videoSize), 'every video needs a measured size');
writeFileSync('src/data/ambassadors.json', JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'ambassadors');
