import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Tilt3D from './Tilt3D';
import { C, rs } from '../theme';
import { plain } from '../catalog';

export default function ProductCard({ p, width }) {
  return (
    <Link href={`/product/${p.id}`} asChild>
      <Pressable style={StyleSheet.flatten([s.card, { width }])} accessibilityRole="link" accessibilityLabel={`${plain(p.name)}, ${rs(p.price)}`}>
        <Tilt3D uri={p.images[0]} height={width * 1.05} float={false}>
          {p.oldPrice ? <Text style={s.tag}>SALE</Text> : null}
        </Tilt3D>
        <View style={s.meta}>
          <Text style={s.cat}>{p.category.toUpperCase()}</Text>
          <Text style={s.name} numberOfLines={2}>{plain(p.name)}</Text>
          <View style={s.row}>
            <Text style={s.price}>{rs(p.price)}</Text>
            {p.oldPrice ? <Text style={s.old}>{rs(p.oldPrice)}</Text> : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.panel, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: C.line },
  meta: { padding: 10, gap: 4 },
  cat: { color: C.red, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  name: { color: C.text, fontSize: 16, fontWeight: '700', minHeight: 40 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { color: C.text, fontSize: 16, fontWeight: '800' },
  old: { color: C.dim, fontSize: 13, textDecorationLine: 'line-through' },
  tag: { position: 'absolute', top: 12, left: 12, backgroundColor: C.red, color: '#fff', fontWeight: '900', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, letterSpacing: 1 },
});
