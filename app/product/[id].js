import { useRef, useState } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Animated, Image, Linking, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import products from '../../src/data/products.json';
import Grid, { MAX } from '../../src/components/Grid';
import { Footer } from '../../src/components/Chrome';
import { C, WHATSAPP, img, rs } from '../../src/theme';
import { plain } from '../../src/catalog';

// Drag sideways to "turn" the product: rotates in 3D and steps through the photo angles.
function Viewer({ images, height }) {
  const [i, setI] = useState(0);
  const rot = useRef(new Animated.Value(0)).current;
  const cur = useRef(0);
  const start = useRef(0);
  const n = images.length;
  const show = (k) => { cur.current = k; setI(k); };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { start.current = cur.current; },
      onPanResponderMove: (_, g) => {
        rot.setValue(Math.max(-35, Math.min(35, g.dx / 6)));
        show((((start.current + Math.round(g.dx / 90)) % n) + n) % n);
      },
      onPanResponderRelease: () => Animated.spring(rot, { toValue: 0, useNativeDriver: true, friction: 5 }).start(),
    }),
  ).current;
  const rotateY = rot.interpolate({ inputRange: [-35, 35], outputRange: ['-35deg', '35deg'] });

  return (
    <View style={{ gap: 12 }}>
      <View {...pan.panHandlers} style={[s.stage, { height }, Platform.OS === 'web' && { cursor: 'grab', userSelect: 'none' }]} accessibilityLabel="Product viewer, drag to rotate">
        <LinearGradient colors={['#FAF9F6', '#D3D1CB']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={s.floor} pointerEvents="none" />
        <Animated.View pointerEvents="none" style={[s.big, { transform: [{ perspective: 900 }, { rotateY }] }]}>
          <Image source={{ uri: img(images[i]) }} resizeMode="contain" draggable={false} style={{ width: '100%', height: '100%' }} />
        </Animated.View>
        {n > 1 ? <Text style={s.hint}>⟲ Drag to rotate · {i + 1}/{n}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {images.map((u, k) => (
          <Pressable key={u} onPress={() => show(k)} style={[s.thumb, k === i && { borderColor: C.red }]} accessibilityLabel={`View image ${k + 1}`}>
            <Image source={{ uri: img(u) }} style={s.thumbImg} resizeMode="contain" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function Product() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const p = products.find((x) => x.id === id);
  if (!p) return (
    <View style={{ padding: 40, gap: 12 }}>
      <Text style={s.h1}>Product not found</Text>
      <Link href="/shop"><Text style={{ color: C.red }}>Back to shop</Text></Link>
    </View>
  );
  const wide = width > 900;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const order = () => Linking.openURL(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi CA Sports, I want to order: ${plain(p.name)} (${rs(p.price)})`)}`);

  return (
    <ScrollView>
      <Stack.Screen options={{ title: `${plain(p.name)} | CA Sports` }} />
      <View style={[s.wrap, { flexDirection: wide ? 'row' : 'column', paddingHorizontal: width < 600 ? 16 : 40 }]}>
        <View style={{ flex: 1.1 }}><Viewer key={p.id} images={p.images} height={wide ? 560 : 380} /></View>
        <View style={{ flex: 1, gap: 16 }}>
          <Link href={{ pathname: '/shop', params: { cat: p.category } }}><Text style={s.cat}>{p.category.toUpperCase()}</Text></Link>
          <Text style={s.h1}>{plain(p.name)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
            <Text style={s.price}>{rs(p.price)}</Text>
            {p.oldPrice ? <Text style={s.old}>{rs(p.oldPrice)}</Text> : null}
          </View>
          {p.colors.length > 1 ? <Text style={s.dim}>Available colours: {p.colors.join(', ')}</Text> : null}
          <Pressable onPress={order} style={s.btn} accessibilityRole="button"><Text style={s.btnText}>Order on WhatsApp</Text></Pressable>
          <Pressable onPress={() => Linking.openURL(p.url)} accessibilityRole="link"><Text style={s.dim}>View on the official store ↗</Text></Pressable>
          {p.summary ? <Text style={s.body}>{p.summary}</Text> : null}
          {p.specs.length ? (
            <View style={s.specs}>
              {p.specs.map((x) => (
                <View key={x.label} style={s.spec}><Text style={s.specL}>{plain(x.label)}</Text><Text style={s.specV}>{plain(x.value)}</Text></View>
              ))}
            </View>
          ) : null}
          {p.highlights.map((h) => <Text key={h} style={s.body}>•  {plain(h)}</Text>)}
        </View>
      </View>
      {related.length ? (<>
        <View style={[s.wrap, { paddingBottom: 0 }]}><Text style={s.h2}>More {p.category}</Text></View>
        <Grid items={related} />
      </>) : null}
      <Footer />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingHorizontal: 40, paddingVertical: 40, gap: 40 },
  stage: { borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  big: { width: '84%', height: '84%', ...(Platform.OS === 'web' ? { mixBlendMode: 'multiply' } : null) },
  floor: { position: 'absolute', bottom: '6%', width: '50%', height: 22, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.2)', ...(Platform.OS === 'web' ? { filter: 'blur(10px)' } : null) },
  hint: { position: 'absolute', bottom: 14, color: '#555', fontSize: 12, fontWeight: '700' },
  thumb: { width: 68, height: 68, borderRadius: 12, backgroundColor: '#EEE', borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  cat: { color: C.red, fontWeight: '800', letterSpacing: 2, fontSize: 12 },
  h1: { color: C.text, fontSize: 38, fontWeight: '900', fontStyle: 'italic', lineHeight: 42 },
  h2: { color: C.text, fontSize: 26, fontWeight: '900' },
  price: { color: C.text, fontSize: 28, fontWeight: '900' },
  old: { color: C.dim, fontSize: 18, textDecorationLine: 'line-through' },
  dim: { color: C.dim, fontSize: 14 },
  body: { color: '#C9C8C4', fontSize: 15, lineHeight: 23 },
  btn: { backgroundColor: C.red, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  specs: { borderWidth: 1, borderColor: C.line, borderRadius: 16, overflow: 'hidden' },
  spec: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, padding: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  specL: { color: C.dim, fontSize: 14, flex: 1 },
  specV: { color: C.text, fontSize: 14, fontWeight: '600', flex: 1.4, textAlign: 'right' },
});
