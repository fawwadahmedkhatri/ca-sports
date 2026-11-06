import { Link, usePathname } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { C, WHATSAPP } from '../theme';

const NAV = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
];

export function Header() {
  const path = usePathname();
  const { width } = useWindowDimensions();
  return (
    <View style={s.header}>
      <View style={s.bar}>
        <Text style={s.barText}>Free shipping on orders above Rs. 5,000 across Pakistan</Text>
      </View>
      <View style={[s.nav, width < 600 && { paddingHorizontal: 16 }]}>
        <Link href="/" accessibilityLabel="CA Sports home">
          <Text style={[s.logo, width < 600 && { fontSize: 20 }]}>CA<Text style={{ color: C.red }}>/</Text>SPORTS</Text>
        </Link>
        <View style={[s.links, width < 600 && { gap: 14 }]}>
          {NAV.filter(([href]) => width >= 600 || href !== '/').map(([href, label]) => (
            <Link key={href} href={href}>
              <Text style={[s.link, path === href && s.active]}>{label}</Text>
            </Link>
          ))}
          <Pressable onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}`)} style={s.cta} accessibilityRole="link">
            <Text style={s.ctaText}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function Footer() {
  return (
    <View style={s.footer}>
      <Text style={s.logo}>CA<Text style={{ color: C.red }}>/</Text>SPORTS</Text>
      <Text style={s.foot}>Crafting cricket equipment in Sialkot since 1958. Bats, protection, shoes and kit trusted by international players.</Text>
      <Text style={s.foot}>WhatsApp: 0300-8710858</Text>
      <Text style={[s.foot, { marginTop: 16 }]}>© {new Date().getFullYear()} CA Sports. All rights reserved.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.line, zIndex: 10 },
  bar: { backgroundColor: C.red, paddingVertical: 6, alignItems: 'center' },
  barText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, paddingVertical: 16, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  logo: { color: C.text, fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  link: { color: C.dim, fontSize: 15, fontWeight: '700' },
  active: { color: C.text },
  cta: { backgroundColor: C.text, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  ctaText: { color: C.bg, fontWeight: '800' },
  footer: { borderTopWidth: 1, borderTopColor: C.line, padding: 40, gap: 8, marginTop: 60, alignItems: 'center' },
  foot: { color: C.dim, fontSize: 13, textAlign: 'center', maxWidth: 520 },
});
