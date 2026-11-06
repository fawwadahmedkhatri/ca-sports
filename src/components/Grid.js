import { View, useWindowDimensions } from 'react-native';
import ProductCard from './ProductCard';

export const MAX = 1280;

export default function Grid({ items }) {
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : 40;
  const inner = Math.min(width, MAX) - pad * 2;
  const cols = inner > 1050 ? 4 : inner > 700 ? 3 : 2;
  const gap = width < 600 ? 10 : 20;
  const w = (inner - gap * (cols - 1)) / cols;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, paddingHorizontal: pad, maxWidth: MAX, width: '100%', alignSelf: 'center' }}>
      {items.map((p) => <ProductCard key={p.id} p={p} width={w} />)}
    </View>
  );
}
