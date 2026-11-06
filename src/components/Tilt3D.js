import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { img } from '../theme';

// Studio stage: product floats above a lit backdrop and tilts toward the pointer.
export default function Tilt3D({ uri, height = 260, max = 14, float = true, children }) {
  const rx = useRef(new Animated.Value(0)).current;
  const ry = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const size = useRef({ width: 1, height: 1 });

  useEffect(() => {
    if (!float) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, bob]);

  const to = (x, y) =>
    Animated.parallel([
      Animated.spring(rx, { toValue: x, useNativeDriver: true, friction: 7 }),
      Animated.spring(ry, { toValue: y, useNativeDriver: true, friction: 7 }),
    ]).start();

  const onMove = (e) => {
    const n = e.nativeEvent;
    let x = n.locationX, y = n.locationY, w = size.current.width, h = size.current.height;
    if (web) { // RNW location values aren't relative to this view; use its rect instead
      const r = e.currentTarget.getBoundingClientRect();
      x = n.clientX - r.left; y = n.clientY - r.top; w = r.width; h = r.height;
    }
    const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
    to(-clamp(y / h - 0.5) * max * 2, clamp(x / w - 0.5) * max * 2);
  };

  const rotateX = rx.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });
  const rotateY = ry.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });
  const lift = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const shadowScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });
  const glareX = ry.interpolate({ inputRange: [-max, max], outputRange: [-80, 80] });

  return (
    <View
      style={[s.stage, { height }]}
      onLayout={(e) => (size.current = e.nativeEvent.layout)}
      onPointerMove={onMove}
      onPointerLeave={() => to(0, 0)}
    >
      <LinearGradient colors={['#F7F6F3', '#D6D4CF']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <Animated.View pointerEvents="none" style={[s.floor, { transform: [{ scaleX: shadowScale }] }]} />
      <Animated.View pointerEvents="none" style={[s.obj, { transform: [{ perspective: 800 }, { translateY: lift }, { rotateX }, { rotateY }] }]}>
        <Animated.Image source={{ uri: img(uri) }} resizeMode="contain" style={s.img} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[s.glare, { transform: [{ translateX: glareX }, { rotate: '20deg' }] }]} />
      {children}
    </View>
  );
}

const web = Platform.OS === 'web';
const s = StyleSheet.create({
  stage: { overflow: 'hidden', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // multiply drops the white photo background into the lit backdrop (web only); must sit on the
  // transformed layer, since a transform makes its own stacking context
  obj: { width: '82%', height: '80%', ...(web ? { mixBlendMode: 'multiply' } : null) },
  img: { width: '100%', height: '100%' },
  floor: { position: 'absolute', bottom: '7%', width: '55%', height: 18, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.22)', ...(web ? { filter: 'blur(8px)' } : null) },
  glare: { position: 'absolute', top: -40, width: 70, height: '160%', backgroundColor: 'rgba(255,255,255,0.16)' },
});
