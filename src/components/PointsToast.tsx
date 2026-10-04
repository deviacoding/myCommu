import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/AppState';

// Petit « +1 » discret quand une action rapporte des points ; disparaît seul.
export function PointsToast() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { lastGain, clearLastGain } = useAppState();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lastGain) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(({ finished }) => finished && clearLastGain());
  }, [lastGain, opacity, clearLastGain]);

  if (!lastGain) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.toast, { backgroundColor: c.primary, opacity }]}>
        <Ionicons name="sparkles" size={16} color={c.textOnPrimary} />
        <Text style={{ color: c.textOnPrimary, fontWeight: '900', fontSize: 15 }}>+{lastGain.points}</Text>
        <Text style={{ color: c.textOnPrimary, opacity: 0.9, fontSize: 13 }}>{lastGain.label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 64, left: 0, right: 0, alignItems: 'center', zIndex: 50 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
});
