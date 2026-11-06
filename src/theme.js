export const C = {
  bg: '#0A0B0E',
  panel: '#13151A',
  line: '#23262E',
  text: '#F4F2EE',
  dim: '#9A9CA3',
  red: '#E3262F',
  gold: '#D9B26A',
};

export const WHATSAPP = '923008710858'; // from the client's current site header

// Self-hosted images are root paths; prefix the deploy base (e.g. /ca-sports on GitHub Pages).
// shortcut: native builds need an absolute host here too, add one when shipping the app.
export const img = (u) => (u.startsWith('/') ? (process.env.EXPO_BASE_URL || '') + u : u);

export const rs =(n) => (n ? 'Rs. ' + n.toLocaleString('en-PK') : 'Price on request');
