import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Header } from '../src/components/Chrome';
import { C } from '../src/theme';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  let el = document.getElementById('ca-focus');
  if (!el) {
    el = document.createElement('style');
    el.id = 'ca-focus';
    document.head.appendChild(el);
  }
  el.textContent = 'a:focus-visible, button:focus-visible, [role="button"]:focus-visible, [role="tab"]:focus-visible, input:focus-visible { outline: 2px solid #D9B26A; outline-offset: 3px; }';
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }} />
      </View>
    </SafeAreaProvider>
  );
}
