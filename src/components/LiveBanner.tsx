import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';

// Bandeau « live en cours » affiché chez les fidèles quand le Rav a lancé un direct.
export function LiveBanner() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { live, congregation } = useAppState();
  const [joined, setJoined] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [live]);

  if (!live) return null;
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(live.startedAt).getTime()) / 1000));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <View style={[styles.wrap, { backgroundColor: '#111827' }]}>
      <View style={styles.liveTag}>
        <View style={[styles.dot, { opacity: tick % 2 ? 1 : 0.3 }]} />
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>LIVE</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
          {live.title}
        </Text>
        <Text style={{ color: '#D1D5DB', fontSize: 12 }}>
          {congregation.rav.name} · {mm}:{ss} · {live.viewers + (joined ? 1 : 0)} spectateurs
        </Text>
      </View>
      <Pressable onPress={() => setJoined((v) => !v)} style={[styles.btn, { backgroundColor: joined ? '#374151' : c.danger }]}>
        <Ionicons name={joined ? 'checkmark' : 'play'} size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{joined ? 'Vous regardez' : 'Regarder'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, marginBottom: 12 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
});
