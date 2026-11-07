import { useEffect } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import ambassadors from '../../src/data/ambassadors.json';
import products from '../../src/data/products.json';
import Grid, { MAX } from '../../src/components/Grid';
import { Footer } from '../../src/components/Chrome';
import { C, img } from '../../src/theme';

// Muted autoplay loop, like the client's site; viewers can unmute with the controls.
function ChampionVideo({ uri, size, name }) {
  const player = useVideoPlayer(uri, (p) => { p.loop = true; p.muted = true; });
  // on web play() only reaches a mounted, loaded <video>, so start once the player is ready
  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => status === 'readyToPlay' && player.play());
    return () => sub.remove();
  }, [player]);
  const ratio = size[0] / size[1];
  // fills the column, but tall clips stop at 540px high
  return (
    <View style={[s.video, { aspectRatio: ratio, maxWidth: 540 * ratio }]} accessibilityLabel={`${name} video`}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls allowsFullscreen />
    </View>
  );
}

export default function Champion() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const a = ambassadors.find((x) => x.id === id);
  const pad = width < 600 ? 16 : 40;
  const wide = width > 900;

  if (!a) return (
    <View style={{ padding: 40, gap: 12 }}>
      <Text style={s.h1}>Champion not found</Text>
      <Link href="/champions"><Text style={{ color: C.red }}>See all champions</Text></Link>
    </View>
  );

  const gear = a.products.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
  const wrap = [s.wrap, { paddingHorizontal: pad }];
  const momentW = (Math.min(width, MAX) - pad * 2 - 16 * 2) / 3;

  return (
    <ScrollView>
      <Stack.Screen options={{ title: `${a.name} | CA Sports Champions` }} />
      <View style={[wrap, { paddingTop: 24 }]}>
        <Link href="/champions"><Text style={s.back}>← All champions</Text></Link>
        <Image source={{ uri: img(a.portrait) }} style={s.banner} resizeMode="cover" accessibilityLabel={`${a.name} banner`} />
      </View>

      <View style={[wrap, { flexDirection: wide ? 'row' : 'column', gap: 40 }]}>
        <View style={{ flex: 1, gap: 18 }}>
          <Text style={s.kicker}>CA CHAMPION</Text>
          <Text style={s.h1}>{a.name}</Text>
          <View style={s.stats}>
            {a.stats.map((st) => (
              <View key={st.label} style={s.stat}>
                <Text style={s.statLabel}>{st.label.toUpperCase()}</Text>
                <Text style={s.statValue}>{st.value}</Text>
              </View>
            ))}
          </View>
          {a.quote ? (
            <View style={s.quote}>
              <Text style={s.quoteText}>“{a.quote}”</Text>
              <Text style={s.quoteBy}>— {a.name}</Text>
            </View>
          ) : null}
          {a.video && a.videoSize ? <ChampionVideo key={a.id} uri={img(a.video)} size={a.videoSize} name={a.name} /> : null}
        </View>
        <View style={{ flex: 1.2, gap: 14 }}>
          <Text style={s.h2}>Profile</Text>
          {a.bio.map((p, i) => <Text key={i} style={s.body}>{p}</Text>)}
        </View>
      </View>


      {a.awards.length ? (
        <View style={wrap}>
          <Text style={s.h2}>Career highlights</Text>
          <View style={s.timeline}>
            {a.awards.map((w, i) => (
              <View key={i} style={s.tl}>
                <Text style={s.year}>{w.year}</Text>
                <Text style={[s.body, { flex: 1 }]}>{w.text}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {a.records.length ? (
        <View style={wrap}>
          <Text style={s.h2}>Records & representative honours</Text>
          <View style={s.records}>
            {a.records.map((r, i) => (
              <View key={i} style={[s.record, { flexBasis: wide ? '45%' : '100%' }]}>
                <View style={s.dot} />
                <Text style={[s.body, { flex: 1 }]}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {gear.length ? (<>
        <View style={wrap}><Text style={s.h2}>{a.name} Collection</Text><Text style={s.dim}>The gear {a.name.split(' ')[0]} plays with.</Text></View>
        <Grid items={gear} />
      </>) : null}

      {a.moments.length ? (
        <View style={wrap}>
          <Text style={s.h2}>{a.name} Moments</Text>
          <Text style={s.dim}>Batting photos, studio shoots, signing ceremonies and match action highlights.</Text>
          <View style={[s.moments, { flexDirection: width < 600 ? 'column' : 'row' }]}>
            {a.moments.map((u, i) => (
              <Image key={u} source={{ uri: img(u) }} resizeMode="cover" accessibilityLabel={`${a.name} moment ${i + 1}`}
                style={[s.moment, width < 600 ? { width: '100%' } : { width: momentW }]} />
            ))}
          </View>
        </View>
      ) : null}
      <Footer />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { maxWidth: MAX, width: '100%', alignSelf: 'center', paddingVertical: 24, gap: 14 },
  back: { color: C.dim, fontSize: 14, fontWeight: '700' },
  banner: { width: '100%', aspectRatio: 1600 / 417, borderRadius: 20, backgroundColor: C.panel },
  kicker: { color: C.gold, fontWeight: '800', letterSpacing: 3, fontSize: 12 },
  h1: { color: C.text, fontSize: 44, fontWeight: '900', fontStyle: 'italic', lineHeight: 48 },
  h2: { color: C.text, fontSize: 26, fontWeight: '900' },
  dim: { color: C.dim, fontSize: 14, marginTop: -6 },
  body: { color: '#C9C8C4', fontSize: 15, lineHeight: 24 },
  stats: { gap: 10 },
  stat: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, gap: 4 },
  statLabel: { color: C.red, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  statValue: { color: C.text, fontSize: 16, fontWeight: '700' },
  quote: { borderLeftWidth: 3, borderLeftColor: C.red, paddingLeft: 16, gap: 8 },
  quoteText: { color: C.text, fontSize: 17, lineHeight: 26, fontStyle: 'italic' },
  quoteBy: { color: C.dim, fontSize: 14, fontWeight: '700' },
  timeline: { borderLeftWidth: 2, borderLeftColor: C.line, marginLeft: 6, gap: 18 },
  tl: { flexDirection: 'row', gap: 16, paddingLeft: 18 },
  year: { color: C.gold, fontSize: 18, fontWeight: '900', width: 56 },
  records: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 32, rowGap: 10 },
  record: { flexDirection: 'row', gap: 12, flexGrow: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginTop: 9 },
  video: { width: '100%', alignSelf: 'center', borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', marginBottom: 10 },
  moments: { gap: 16, marginTop: 6 },
  moment: { aspectRatio: 1200 / 924, borderRadius: 16, backgroundColor: C.panel },
});
