import { Link, Stack } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ambassadors from '../../src/data/ambassadors.json';
import { MAX } from '../../src/components/Grid';
import { Footer } from '../../src/components/Chrome';
import { C, img } from '../../src/theme';

export default function Champions() {
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : 40;
  const inner = Math.min(width, MAX) - pad * 2;
  const cols = inner > 1050 ? 3 : inner > 640 ? 2 : 1;
  const gap = 20;
  const w = (inner - gap * (cols - 1)) / cols;

  return (
    <ScrollView>
      <Stack.Screen options={{ title: 'Our Champions | CA Sports' }} />
      <View style={[s.top, { paddingHorizontal: pad }]}>
        <Text style={s.kicker}>BRAND AMBASSADORS</Text>
        <Text style={s.h1}>Our Champions</Text>
        <Text style={s.lead}>The international stars who walk out to bat with CA. Meet the players, their journeys, and the gear they trust.</Text>
      </View>
      <View style={[s.grid, { paddingHorizontal: pad, gap }]}>
        {ambassadors.map((a) => (
          <Link key={a.id} href={`/champions/${a.id}`} asChild>
            <Pressable style={StyleSheet.flatten([s.card, { width: w }])} accessibilityRole="link" accessibilityLabel={`${a.name}, view profile`}>
              <Image source={{ uri: img(a.card) }} style={s.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
              <View style={s.meta}>
                <Text style={s.name}>{a.name}</Text>
                {a.stats[1] ? <Text style={s.stat} numberOfLines={1}>{a.stats[1].value}</Text> : null}
                <Text style={s.more}>View profile →</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
      <Footer />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  top: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingTop: 48, paddingBottom: 28, gap: 12 },
  kicker: { color: C.gold, fontWeight: '800', letterSpacing: 3, fontSize: 13 },
  h1: { color: C.text, fontSize: 44, fontWeight: '900', fontStyle: 'italic' },
  lead: { color: C.dim, fontSize: 16, lineHeight: 24, maxWidth: 560 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: MAX, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1466 / 824, backgroundColor: '#000' },
  meta: { padding: 16, gap: 4 },
  name: { color: C.text, fontSize: 20, fontWeight: '900' },
  stat: { color: C.dim, fontSize: 14 },
  more: { color: C.red, fontSize: 13, fontWeight: '800', marginTop: 6 },
});
