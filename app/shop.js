import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import products from '../src/data/products.json';
import Grid, { MAX } from '../src/components/Grid';
import { Footer } from '../src/components/Chrome';
import { C } from '../src/theme';
import { plain, productsIn, shelfById } from '../src/catalog';

const CATS = ['All', ...new Set(products.map((p) => p.category))];
const SORTS = { featured: 'Featured', low: 'Price: low to high', high: 'Price: high to low' };

const first = (value) => (Array.isArray(value) ? value[0] : value) || '';

export default function Shop() {
  const params = useLocalSearchParams();
  const cat = first(params.cat) || 'All';
  const shelf = shelfById(first(params.shelf));
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : 40;
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = shelf ? productsIn(products, shelf.id) : products;
    const list = base.filter((p) => (shelf || cat === 'All' || p.category === cat) && (!needle || plain(p.name).toLowerCase().includes(needle)));
    if (sort === 'featured') return list;
    // unpriced items go last either way
    const dir = sort === 'low' ? 1 : -1;
    return [...list].sort((a, b) => (!a.price) - (!b.price) || dir * (a.price - b.price));
  }, [cat, q, sort, shelf]);

  return (
    <ScrollView>
      <View style={[s.top, { paddingHorizontal: pad }]}>
        <Text style={s.h1}>{shelf ? shelf.label : cat === 'All' ? 'All products' : cat}</Text>
        <Text style={s.count}>{shelf ? shelf.line : `${items.length} products`}</Text>
        {shelf ? <Text style={s.count}>{items.length} products</Text> : null}
        <TextInput value={q} onChangeText={setQ} placeholder="Search bats, gloves, helmets…" placeholderTextColor={C.dim} style={s.search} accessibilityLabel="Search products" />
        <View style={s.chips}>
          {CATS.map((c) => (
            <Pressable key={c} onPress={() => router.setParams({ cat: c, shelf: '' })} style={[s.chip, !shelf && c === cat && s.chipOn]} accessibilityRole="button" accessibilityState={{ selected: !shelf && c === cat }}>
              <Text style={[s.chipText, !shelf && c === cat && { color: C.bg }]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.chips}>
          {Object.entries(SORTS).map(([k, v]) => (
            <Pressable key={k} onPress={() => setSort(k)} accessibilityRole="button" accessibilityState={{ selected: k === sort }}>
              <Text style={[s.sort, k === sort && { color: C.text, textDecorationLine: 'underline' }]}>{v}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {items.length ? <Grid items={items} /> : (
        <View style={{ paddingHorizontal: pad, paddingTop: 28, gap: 12 }}>
          <Text style={s.count}>{q ? `No products match “${q}”.` : 'Nothing on this shelf yet.'}</Text>
          <Pressable onPress={() => { setQ(''); router.setParams({ cat: 'All', shelf: '' }); }} accessibilityRole="button">
            <Text style={s.clear}>Clear and show the full catalog</Text>
          </Pressable>
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  top: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingTop: 36, paddingBottom: 24, gap: 14 },
  clear: { color: '#FF5C5C', fontWeight: '800', fontSize: 14 },
  h1: { color: C.text, fontSize: 40, fontWeight: '900', fontStyle: 'italic' },
  count: { color: C.dim, fontSize: 14 },
  search: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, color: C.text, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxWidth: 520 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  chipOn: { backgroundColor: C.text, borderColor: C.text },
  chipText: { color: C.text, fontWeight: '700', fontSize: 14 },
  sort: { color: C.dim, fontSize: 14, fontWeight: '600' },
});
