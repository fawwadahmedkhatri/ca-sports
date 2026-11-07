import { useState } from 'react';
import { Link, useGlobalSearchParams, usePathname } from 'expo-router';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { C, WHATSAPP } from '../theme';
import { SHELVES } from '../catalog';

const SHELF_NAV = SHELVES.filter((shelf) => ['bats', 'shoes', 'protection', 'bags'].includes(shelf.id));
const LOGO = require('../../assets/logo.png');

function Logo({ height }) {
  return (
    <Image
      source={LOGO}
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      style={{ height, width: Math.round(height * (256 / 300)) }}
    />
  );
}

const param = (value) => (Array.isArray(value) ? value[0] : value) || '';

export function Header() {
  const path = usePathname();
  const shelf = param(useGlobalSearchParams().shelf);
  const { width } = useWindowDimensions();
  const roomy = width >= 980;
  const onShop = path === '/shop';
  return (
    <View style={s.header}>
      <View style={s.bar}>
        <Text style={s.barText}>Free shipping on orders above Rs. 5,000 across Pakistan</Text>
      </View>
      <View style={[s.nav, width < 600 && { paddingHorizontal: 16 }]}>
        <Link href="/" accessibilityLabel="CA Sports home">
          <Logo height={width < 600 ? 36 : 46} />
        </Link>
        <View style={[s.links, width < 600 && { gap: 14 }]}>
          {roomy && SHELF_NAV.map((item) => (
            <Link key={item.id} href={{ pathname: '/shop', params: { shelf: item.id } }} accessibilityLabel={`Shop ${item.label}`}>
              <Text style={[s.link, onShop && shelf === item.id && s.active]}>{item.label}</Text>
            </Link>
          ))}
          <Link href="/shop" accessibilityLabel="Full catalog">
            <Text style={[s.link, onShop && !shelf && s.active]}>Shop</Text>
          </Link>
          <Link href="/champions" accessibilityLabel="Our champions, brand ambassadors">
            <Text style={[s.link, path.startsWith('/champions') && s.active]}>Champions</Text>
          </Link>
          <Pressable onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}`)} style={s.cta} accessibilityRole="link">
            <Text style={s.ctaText}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const SITE = 'https://thecasports.com';

const ABOUT = [
  ['About Us', `${SITE}/about`],
  ['Our Champions', '/champions'],
  ['Inside CA', `${SITE}/inside-ca`],
  ['Why Players Choose CA', `${SITE}/testimonials`],
  ['Blogs', `${SITE}/blog_posts`],
  ['Contact Us', `${SITE}/contact`],
  ['Customer Care', `${SITE}/customer-care`],
];

const SUPPORT = [
  ['Exchange Policy', `${SITE}/page/exchange-policy`],
  ['Shipping & Handling', `${SITE}/page/shipping---handling`],
  ['Bat Warranty', `${SITE}/page/bat-warranty`],
  ['Size Guide', `${SITE}/page/size-guide`],
  ['Product Verification', `${SITE}/scratch-to-reveal`],
  ['Authorized Dealers', `${SITE}/certified-resellers`],
  ['Protect Yourself From Counterfeit Products', `${SITE}/page/protect-yourself-from-counterfeit-products`],
  ['Privacy Policy', `${SITE}/page/privacy-policy`],
  ['Terms & Conditions', `${SITE}/page/terms-and-conditions`],
  ["FAQ's", `${SITE}/faq`],
];

const icon = (body) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F4F2EE" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)}`;

const SOCIAL = [
  { name: 'Facebook', href: 'https://www.facebook.com/casportsofficial/', icon: icon('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>') },
  { name: 'Instagram', href: 'https://www.instagram.com/Casports.official/', icon: icon('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="#F4F2EE" stroke="none"/>') },
  { name: 'TikTok', href: 'https://www.tiktok.com/@ca.sports6', icon: icon('<path d="M9 18a4 4 0 1 0 4-4V6h4a5 5 0 0 1-5 5"/>') },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UC77vaF-MDlYne4ZRp4V3oDg', icon: icon('<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m10 9 6 3-6 3z" fill="#F4F2EE" stroke="none"/>') },
  { name: 'X', href: 'https://x.com/OfficialCAPRO', icon: icon('<path d="M4 4l7 8.4L4.6 20H7l5-6.2L16.2 20H20l-7.2-8.8L19.6 4H17l-4.6 5.6L8 4H4z"/>') },
  { name: 'WhatsApp', href: 'https://wa.me/923454663399', icon: icon('<path d="M6 19l1-3.2A8 8 0 1 1 8.8 17.6L6 19z"/><path d="M9 10.2c.3 2 2 3.2 3.6 3.4"/>') },
];

function open(url) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !/^(mailto|tel):/.test(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url);
}

function FootLink({ href, children }) {
  if (href.startsWith('/')) return <Link href={href}><Text style={s.footLink}>{children}</Text></Link>; // in-app page
  return (
    <Pressable onPress={() => open(href)} accessibilityRole="link">
      <Text style={s.footLink}>{children}</Text>
    </Pressable>
  );
}

function Col({ title, links }) {
  return (
    <View style={s.col}>
      <Text style={s.colTitle}>{title}</Text>
      {links.map(([label, href]) => <FootLink key={label} href={href}>{label}</FootLink>)}
    </View>
  );
}

function StoreLine({ mark, href, label, children }) {
  const text = <Text style={s.storeText}>{children}</Text>;
  return (
    <View style={s.storeLine}>
      <Text style={s.mark} accessibilityElementsHidden>{mark}</Text>
      {href ? (
        <Pressable onPress={() => open(href)} accessibilityRole="link" accessibilityLabel={label} style={s.storeHit}>
          {text}
        </Pressable>
      ) : text}
    </View>
  );
}

export function Footer() {
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : 48;
  const stacked = width < 800;
  const band = Math.max(pad, (width - 1280) / 2 + pad); // full-width bands, content aligned to the 1280 column
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const subscribe = () => {
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setNote('Enter a valid email address.');
      return;
    }
    setNote('');
    open(`mailto:shop@ca-sports.com.pk?subject=${encodeURIComponent('CA Pro Newsletter')}&body=${encodeURIComponent(`Please add ${v} to the CA Pro newsletter.`)}`);
  };

  return (
    <View style={s.footer}>
      <View style={[s.footMain, { paddingHorizontal: pad }]}>
        <View style={s.brand}>
          <Logo height={58} />
          <Text style={s.brandTitle}>CA Sports – Crafting Cricket Excellence Since 1958.</Text>
          <Text style={s.blurb}>
            What began as a cricket bat manufacturing company has evolved into one of the most recognized names in the cricket industry. Today, CA Sports is a leading international cricket brand with a presence across cricket-playing nations and expanding markets worldwide. With over 60 years of heritage, CA Sports proudly manufactures and markets its flagship brand, CA Pro, offering a comprehensive range of cricket equipment, sportswear, footwear, and accessories designed for players of all levels.
          </Text>
          <View style={s.social}>
            {SOCIAL.map((item) => (
              <Pressable key={item.name} onPress={() => open(item.href)} accessibilityRole="link" accessibilityLabel={item.name} hitSlop={6}>
                <Image source={{ uri: item.icon }} style={s.socialIcon} accessibilityIgnoresInvertColors />
              </Pressable>
            ))}
          </View>
        </View>
        <Col title="ABOUT CA PRO" links={ABOUT} />
        <Col title="SUPPORT & POLICIES" links={SUPPORT} />
        <View style={s.store}>
          <Text style={s.colTitle}>STORE INFORMATION</Text>
          <StoreLine mark="⌖">CA SPORTS Haji Pura Daska Road, Bogra, Sialkot 51310, Punjab, Pakistan</StoreLine>
          <StoreLine mark="☎" href="tel:+9252111227275" label="Call 052-111-227-275">052-111-227-275</StoreLine>
          <StoreLine mark="☎" href="tel:+923454663399" label="Call 03454663399">03454663399</StoreLine>
          <StoreLine mark="✆" href={`https://wa.me/${WHATSAPP}`} label="WhatsApp +92 300 8710858">+92 300 8710858</StoreLine>
          <StoreLine mark="✉" href="mailto:shop@ca-sports.com.pk" label="Email Pakistan queries">Pakistan Queries: Shop@ca-sports.com.pk</StoreLine>
          <StoreLine mark="✉" href="mailto:sales@ca-sports.com.pk" label="Email international queries">International Queries: Sales@ca-sports.com.pk</StoreLine>
        </View>
      </View>

      <View style={[s.news, { paddingHorizontal: band, flexDirection: stacked ? 'column' : 'row' }]}>
        <View style={s.newsCopy}>
          <Text style={s.newsTitle}>Join The CA Pro Newsletter</Text>
          <Text style={s.newsSub}>Get product drops, offers & cricket news straight to your inbox.</Text>
        </View>
        <View style={s.newsForm}>
          <View style={s.newsRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={subscribe}
              placeholder="Enter your email address"
              placeholderTextColor="#8E8E8E"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email address"
              style={s.email}
            />
            <Pressable onPress={subscribe} accessibilityRole="button" style={s.sub}>
              <Text style={s.subText}>SUBSCRIBE</Text>
            </Pressable>
          </View>
          {note ? <Text style={s.note}>{note}</Text> : null}
        </View>
      </View>

      <View style={[s.legal, { paddingHorizontal: band, flexDirection: width < 700 ? 'column' : 'row' }]}>
        <Text style={s.legalText}>© {new Date().getFullYear()} CA Pro ( PVT.LTD ). All rights reserved. Powered by: Graficano</Text>
        <View style={s.pay}>
          <Text style={s.payText}>Cash on Delivery</Text>
          <Pressable onPress={() => open('https://postex.pk/tracking')} accessibilityRole="link" accessibilityLabel="PostEx tracking">
            <Text style={s.postex}>PostEx</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.line, zIndex: 10 },
  bar: { backgroundColor: C.red, paddingVertical: 6, alignItems: 'center' },
  barText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, paddingVertical: 16, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  links: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  link: { color: C.dim, fontSize: 15, fontWeight: '700' },
  active: { color: C.text },
  cta: { backgroundColor: C.text, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  ctaText: { color: C.bg, fontWeight: '800' },
  footer: { borderTopWidth: 1, borderTopColor: C.line, marginTop: 60, backgroundColor: C.panel },
  footMain: { flexDirection: 'row', flexWrap: 'wrap', gap: 40, paddingVertical: 56, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  brand: { flexGrow: 2, flexBasis: 380, gap: 14 },
  brandTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  blurb: { color: C.dim, fontSize: 14, lineHeight: 26, maxWidth: 460 },
  social: { flexDirection: 'row', gap: 22, marginTop: 10 },
  socialIcon: { width: 20, height: 20 },
  col: { flexGrow: 1, flexBasis: 200, gap: 12 },
  colTitle: { color: C.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  footLink: { color: C.dim, fontSize: 14, lineHeight: 20 },
  store: { flexGrow: 1, flexBasis: 240, gap: 14 },
  storeLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  mark: { color: C.red, fontSize: 14, width: 16, textAlign: 'center', lineHeight: 22 },
  storeHit: { flexShrink: 1 },
  storeText: { color: C.dim, fontSize: 14, lineHeight: 22, flexShrink: 1 },
  news: { backgroundColor: '#1B1E24', paddingVertical: 28, gap: 20, justifyContent: 'space-between', alignItems: 'center' },
  newsCopy: { gap: 6, flexShrink: 1 },
  newsTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  newsSub: { color: C.dim, fontSize: 15 },
  newsForm: { flexGrow: 1, maxWidth: 680, width: '100%', gap: 6 },
  newsRow: { flexDirection: 'row' },
  email: { flex: 1, minWidth: 0, backgroundColor: '#fff', color: '#111', fontSize: 15, paddingHorizontal: 14, paddingVertical: 14, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  sub: { backgroundColor: C.red, paddingHorizontal: 24, justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  subText: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  note: { color: '#FF8A8A', fontSize: 13 },
  legal: { backgroundColor: C.bg, paddingVertical: 20, gap: 12, justifyContent: 'space-between', alignItems: 'center' },
  legalText: { color: C.dim, fontSize: 14 },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  payText: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', borderWidth: 1, borderColor: C.line, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  postex: { color: C.text, fontSize: 22, fontWeight: '900' },
});
