// Shopper-facing shelves. The scraped categories lump bats, balls and kits
// into "Cricket Equipment", so the home page and /shop?shelf= use this cut.

export function plain(value) {
  return String(value ?? '')
    .replace(/&#0*39;|&#x0*27;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&ndash;|&#8211;|&#0*150;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function specText(p) {
  return (p.specs || []).map((s) => `${s.label} ${s.value}`).join(' ');
}

export function kind(p) {
  const name = plain(p.name);
  const spec = specText(p);
  if (p.category === 'Cricket Shoes') return 'shoes';
  if (p.category === 'Cricket Bags') return 'bags';
  if (p.category === 'Softball Bats') return 'softball';
  if (p.category === 'Accessories') return 'accessories';
  if (p.category === 'Protection Gear') return 'protection';
  if (/complete kit/i.test(name)) return 'kits';
  if (/bat size|sweet spot|handle type|edge thickness|willow|grain count/i.test(spec)) return 'bats';
  if (/stitch|cork|leather|pack size|felt|seam|chrome leather/i.test(spec) || /\bballs?\b/i.test(name)) return 'balls';
  if (/pad|glove|guard|helmet|thigh|abdominal|protection/i.test(spec)) return 'protection';
  if (p.category === 'Cricket Equipment') return 'bats';
  return 'other';
}

export const SHELVES = [
  { id: 'bats', label: 'Bats', line: 'Willow, fiber and practice bats', tile: true, preview: true },
  { id: 'shoes', label: 'Shoes', line: 'Spikes and trainers for the crease', tile: true, preview: true },
  { id: 'protection', label: 'Protection', line: 'Pads, gloves and guards', tile: true, preview: true },
  { id: 'balls', label: 'Balls', line: 'Match leather and training balls', tile: true, preview: false },
  { id: 'bags', label: 'Bags', line: 'Duffle bags and wheel kits', tile: true, preview: false },
  { id: 'softball', label: 'Softball', line: 'Tape-ball and tennis-ball bats', tile: true, preview: false },
  { id: 'kits', label: 'Kits', line: 'Bat, pads and gloves, priced as a set', tile: false, preview: true },
  { id: 'accessories', label: 'Accessories', line: 'Grips, covers, stumps and scorebooks', tile: false, preview: false },
];

export const shelfById = (id) => SHELVES.find((s) => s.id === id) || null;

export function productsIn(list, id) {
  return list.filter((p) => kind(p) === id);
}

export function fromPrice(list) {
  const prices = list.map((p) => p.price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
}

// Four products spread across the price range, dearest first.
export function spread(list, n = 4) {
  const priced = [...list].filter((p) => p.price > 0).sort((a, b) => b.price - a.price);
  const pool = priced.length ? priced : list;
  if (pool.length <= n) return pool.slice(0, n);
  const step = (pool.length - 1) / (n - 1);
  const seen = new Set();
  const out = [];
  for (let i = 0; i < n; i++) {
    const item = pool[Math.round(i * step)];
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function flagship(list) {
  const willow = list.filter((p) => kind(p) === 'bats' && /willow/i.test(specText(p)));
  const pool = willow.length ? willow : list.filter((p) => kind(p) === 'bats');
  return [...pool].sort((a, b) => (b.price || 0) - (a.price || 0))[0] || list[0] || null;
}

export function specLine(p) {
  if (!p) return '';
  const specs = p.specs || [];
  const willow = specs.find((s) => /willow/i.test(s.label));
  const edge = specs.find((s) => /edge/i.test(s.label));
  const bits = [];
  if (willow) bits.push(plain(willow.value));
  if (edge) bits.push(`${plain(edge.value)} edge`);
  return bits.join(' · ');
}
