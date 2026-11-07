import { useState } from 'react';
import { Link } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import products from '../src/data/products.json';
import Tilt3D from '../src/components/Tilt3D';
import Grid, { MAX } from '../src/components/Grid';
import { Footer } from '../src/components/Chrome';
import { C, img, rs } from '../src/theme';
import { SHELVES, flagship, fromPrice, plain, productsIn, specLine, spread } from '../src/catalog';

const TILES = SHELVES.filter((s) => s.tile);
const PREVIEW = SHELVES.filter((s) => s.preview);
const reduceMotion = Platform.OS === 'web'
  && typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Home() {
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const pad = width < 600 ? 16 : 40;
  const cols = wide ? 3 : 2;
  const gap = 18;
  const tileWidth = (Math.min(width, MAX) - pad * 2 - gap * (cols - 1)) / cols;
  const [tab, setTab] = useState('bats');
  const hero = flagship(products);

  if (!hero) {
    return (
      <View style={[s.empty, { paddingHorizontal: pad }]}>
        <Text style={s.h2}>The catalog is empty</Text>
        <Text style={s.lead}>New gear will show here once products are loaded. The shop is the full list.</Text>
        <Link href="/shop" asChild>
          <Pressable style={s.btn} accessibilityRole="link"><Text style={s.btnText}>Open the shop</Text></Pressable>
        </Link>
      </View>
    );
  }

  const active = PREVIEW.find((shelf) => shelf.id === tab) || PREVIEW[0];
  const preview = spread(productsIn(products, active.id));
  const heroLine = specLine(hero);

  return (
    <ScrollView>
      <LinearGradient colors={['#1A0B0D', C.bg]} style={{ width: '100%' }}>
        <View style={[s.hero, { flexDirection: wide ? 'row' : 'column', paddingHorizontal: pad }]}>
          <View style={[s.copy, wide && { flex: 1 }]}>
            <Text style={s.kicker}>SIALKOT · SINCE 1958</Text>
            <Text style={[s.h1, { fontSize: wide ? 68 : 40, lineHeight: wide ? 70 : 44 }]}>Built for{'\n'}the big hit.</Text>
            <Text style={s.lead}>CA bats, shoes and protection from Sialkot. Start with a shelf, or open the flagship bat.</Text>
            {wide ? <HeroActions hero={hero} /> : null}
          </View>
          <View style={[s.stageWrap, wide && { flex: 1 }]}>
            <Tilt3D uri={hero.images[0]} height={wide ? 520 : 300} max={18} float={!reduceMotion}>
              <Text style={s.heroPrice}>{rs(hero.price)}</Text>
            </Tilt3D>
            {heroLine ? <Text style={s.heroSpec}>{heroLine}</Text> : null}
          </View>
          {wide ? null : <HeroActions hero={hero} />}
        </View>
      </LinearGradient>

      <View style={[s.section, { paddingHorizontal: pad }]}>
        <View style={s.sectionHead}>
          <Text style={s.h2}>Shop the shelves</Text>
          <Link href="/shop" asChild>
            <Pressable accessibilityRole="link"><Text style={s.see}>Full catalog</Text></Pressable>
          </Link>
        </View>
        <View style={[s.tiles, { gap }]}>
          {TILES.map((shelf) => (
            <ShelfTile key={shelf.id} shelf={shelf} tileWidth={tileWidth} />
          ))}
        </View>
      </View>

      <View style={s.band}>
        <View style={[s.section, { paddingHorizontal: pad, paddingTop: 8 }]}>
          <View style={s.sectionHead}>
            <Text style={s.h2}>From the shelf</Text>
            <Link href={{ pathname: '/shop', params: { shelf: active.id } }} asChild>
              <Pressable accessibilityRole="link"><Text style={s.see}>See all {active.label.toLowerCase()}</Text></Pressable>
            </Link>
          </View>
          <View style={s.tabs} accessibilityRole="tablist">
            {PREVIEW.map((shelf) => {
              const on = shelf.id === active.id;
              return (
                <Pressable
                  key={shelf.id}
                  onPress={() => setTab(shelf.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${shelf.label}. ${shelf.line}`}
                  style={[s.tab, on && s.tabOn]}
                >
                  <Text style={[s.tabText, on && s.tabTextOn]}>{shelf.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={s.shelfLine}>{active.line}</Text>
        </View>
        {preview.length ? (
          <Grid items={preview} />
        ) : (
          <Text style={[s.shelfLine, { textAlign: 'center', paddingBottom: 24 }]}>Nothing on this shelf yet.</Text>
        )}
      </View>

      <View style={[s.section, { paddingHorizontal: pad }]}>
        <Link href={{ pathname: '/shop', params: { shelf: 'accessories' } }} asChild>
          <Pressable accessibilityRole="link">
            <Text style={s.also}>Grips, bat covers, stumps and scorebooks are in accessories.</Text>
          </Pressable>
        </Link>
      </View>

      <View style={[s.trust, { paddingHorizontal: pad }]}>
        {[
          ['Fast delivery', '3–5 working days nationwide'],
          ['Genuine gear', 'Every piece is CA, made in Sialkot'],
          ['Easy exchange', 'Hassle-free exchange policy'],
          ['WhatsApp orders', '0300-8710858'],
        ].map(([title, detail]) => (
          <View key={title} style={s.trustItem}>
            <Text style={s.trustT}>{title}</Text>
            <Text style={s.trustD}>{detail}</Text>
          </View>
        ))}
      </View>
      <Footer />
    </ScrollView>
  );
}

function HeroActions({ hero }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={s.actions}>
        <Link href={{ pathname: '/shop', params: { shelf: 'bats' } }} asChild>
          <Pressable style={s.btn} accessibilityRole="link">
            <Text style={s.btnText}>Shop bats</Text>
          </Pressable>
        </Link>
        <Link href={`/product/${hero.id}`} asChild>
          <Pressable style={s.ghost} accessibilityRole="link">
            <Text style={s.ghostText} numberOfLines={1}>{plain(hero.name)}</Text>
          </Pressable>
        </Link>
      </View>
      <Link href="/shop" asChild>
        <Pressable accessibilityRole="link"><Text style={s.catalog}>Full catalog · {products.length} products</Text></Pressable>
      </Link>
    </View>
  );
}

function ShelfTile({ shelf, tileWidth }) {
  const [failed, setFailed] = useState(false);
  const list = productsIn(products, shelf.id);
  const cover = [...list].sort((a, b) => (b.price || 0) - (a.price || 0))[0];
  const from = fromPrice(list);
  return (
    <Link href={{ pathname: '/shop', params: { shelf: shelf.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${shelf.label}, ${list.length} products${from ? `, from ${rs(from)}` : ''}. ${shelf.line}`}
        style={StyleSheet.flatten([s.tile, { width: tileWidth }])}
      >
        <View style={[s.shot, { height: Math.max(148, Math.round(tileWidth * 0.62)) }]}>
          <LinearGradient colors={['#F7F6F3', '#D6D4CF']} style={StyleSheet.absoluteFill} />
          {cover && !failed ? (
            <Image
              source={{ uri: img(cover.images[0]) }}
              resizeMode="contain"
              style={[s.shotImg, Platform.OS === 'web' && { mixBlendMode: 'multiply' }]}
              onError={() => setFailed(true)}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={s.shotFallback}>{shelf.label}</Text>
          )}
        </View>
        <Text style={s.tileName}>{shelf.label}</Text>
        <Text style={s.tileMeta}>{list.length}{from ? ` · from ${rs(from)}` : ''}</Text>
        <Text style={s.tileLine} numberOfLines={2}>{shelf.line}</Text>
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  hero: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingVertical: 36, gap: 28, alignItems: 'center' },
  copy: { gap: 16, justifyContent: 'center', minWidth: 260 },
  stageWrap: { minWidth: 260, width: '100%', gap: 10 },
  kicker: { color: C.gold, fontWeight: '800', letterSpacing: 3, fontSize: 13 },
  h1: { color: C.text, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  h2: { color: C.text, fontSize: 26, fontWeight: '900' },
  lead: { color: C.dim, fontSize: 16, lineHeight: 24, maxWidth: 460 },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  btn: { backgroundColor: C.red, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  ghost: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, maxWidth: 280 },
  ghostText: { color: C.text, fontWeight: '700', fontSize: 15 },
  catalog: { color: C.gold, fontWeight: '700', fontSize: 14 },
  heroPrice: { position: 'absolute', bottom: 18, right: 18, backgroundColor: C.bg, color: C.text, fontWeight: '900', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  heroSpec: { color: C.dim, fontSize: 13, fontWeight: '600' },
  section: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingTop: 36, paddingBottom: 8, gap: 16 },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  see: { color: '#FF5C5C', fontWeight: '800', fontSize: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { gap: 6, marginBottom: 8 },
  shot: { borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  shotImg: { width: '78%', height: '78%' },
  shotFallback: { color: '#3A3D44', fontWeight: '900', fontSize: 18 },
  tileName: { color: C.text, fontWeight: '900', fontSize: 18, marginTop: 4 },
  tileMeta: { color: C.gold, fontWeight: '700', fontSize: 13 },
  tileLine: { color: C.dim, fontSize: 13, lineHeight: 18, minHeight: 36 },
  band: { marginTop: 20, paddingTop: 8, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.line },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 2, marginRight: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: C.red },
  tabText: { color: C.dim, fontWeight: '800', fontSize: 15 },
  tabTextOn: { color: C.text },
  shelfLine: { color: C.dim, fontSize: 14 },
  also: { color: C.dim, fontSize: 15, lineHeight: 22, textDecorationLine: 'underline' },
  trust: { maxWidth: MAX, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingTop: 8, paddingBottom: 8 },
  trustItem: { flexGrow: 1, flexBasis: 200, borderTopWidth: 2, borderTopColor: C.red, paddingTop: 10, gap: 4 },
  trustT: { color: C.text, fontWeight: '800', fontSize: 15 },
  trustD: { color: C.dim, fontSize: 13, lineHeight: 18 },
  empty: { paddingVertical: 64, gap: 14, maxWidth: MAX, alignSelf: 'center', width: '100%' },
});
