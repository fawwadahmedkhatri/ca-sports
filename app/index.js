import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import products from '../src/data/products.json';
import Tilt3D from '../src/components/Tilt3D';
import Grid, { MAX } from '../src/components/Grid';
import { Footer } from '../src/components/Chrome';
import { C, rs } from '../src/theme';

const CATS = [...new Set(products.map((p) => p.category))];
// Flagship = priciest willow bat (most bat names don't say "bat", so match on specs).
const hero = [...products].filter((p) => p.specs.some((x) => /willow/i.test(x.label + x.value))).sort((a, b) => b.price - a.price)[0] || products[0];

export default function Home() {
  const { width } = useWindowDimensions();
  const wide = width > 900;
  return (
    <ScrollView>
      <LinearGradient colors={['#1A0B0D', C.bg]} style={{ width: '100%' }}>
        <View style={[s.hero, { flexDirection: wide ? 'row' : 'column', paddingHorizontal: width < 600 ? 16 : 40 }]}>
          <View style={{ flex: 1, gap: 18, justifyContent: 'center' }}>
            <Text style={s.kicker}>SIALKOT · SINCE 1958</Text>
            <Text style={[s.h1, { fontSize: wide ? 72 : 44, lineHeight: wide ? 74 : 48 }]}>Built for{'\n'}the big hit.</Text>
            <Text style={s.lead}>Professional cricket bats, protection and footwear trusted by international players. Every piece made to perform.</Text>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/shop" asChild><Pressable style={s.btn}><Text style={s.btnText}>Shop all {products.length} products</Text></Pressable></Link>
              <Link href={`/product/${hero.id}`} asChild><Pressable style={s.ghost}><Text style={s.ghostText}>{hero.name}</Text></Pressable></Link>
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 280 }}>
            <Tilt3D uri={hero.images[0]} height={wide ? 520 : 380} max={18}>
              <Text style={s.heroPrice}>{rs(hero.price)}</Text>
            </Tilt3D>
          </View>
        </View>
      </LinearGradient>

      <View style={s.section}>
        <Text style={s.h2}>Shop by category</Text>
        <View style={s.cats}>
          {CATS.map((c) => (
            <Link key={c} href={{ pathname: '/shop', params: { cat: c } }} asChild>
              <Pressable style={s.cat}>
                <Text style={s.catName}>{c}</Text>
                <Text style={s.catCount}>{products.filter((p) => p.category === c).length} items →</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={s.section}><Text style={s.h2}>New & featured</Text></View>
      <Grid items={products.slice(0, 8)} />

      <View style={[s.section, s.trust]}>
        {[['Fast delivery', '3–5 working days nationwide'], ['Genuine gear', 'Verify every product by QR'], ['Easy exchange', 'Hassle-free exchange policy'], ['Secure payment', 'Safe and trusted checkout']].map(([t, d]) => (
          <View key={t} style={s.trustItem}><Text style={s.trustT}>{t}</Text><Text style={s.trustD}>{d}</Text></View>
        ))}
      </View>
      <Footer />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingVertical: 56, gap: 40 },
  kicker: { color: C.gold, fontWeight: '800', letterSpacing: 3, fontSize: 13 },
  h1: { color: C.text, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  lead: { color: C.dim, fontSize: 17, lineHeight: 26, maxWidth: 480 },
  btn: { backgroundColor: C.red, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  ghost: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999 },
  ghostText: { color: C.text, fontWeight: '700', fontSize: 15 },
  heroPrice: { position: 'absolute', bottom: 18, right: 18, backgroundColor: C.bg, color: C.text, fontWeight: '900', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  section: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingHorizontal: 40, paddingTop: 48, paddingBottom: 20 },
  h2: { color: C.text, fontSize: 28, fontWeight: '900', marginBottom: 18 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cat: { flexGrow: 1, flexBasis: 180, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 18, gap: 6 },
  catName: { color: C.text, fontWeight: '800', fontSize: 17 },
  catCount: { color: C.red, fontWeight: '700', fontSize: 13 },
  trust: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trustItem: { flexGrow: 1, flexBasis: 220, borderLeftWidth: 3, borderLeftColor: C.red, paddingLeft: 14, gap: 4 },
  trustT: { color: C.text, fontWeight: '800', fontSize: 16 },
  trustD: { color: C.dim, fontSize: 13 },
});
