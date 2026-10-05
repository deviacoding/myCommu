import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../theme/ThemeProvider';

// Fête d'un don : carillon + éclats qui jaillissent autour de l'aura, puis s'éteignent.
// Le son est un petit WAV généré (assets/sounds/tsedaka.wav), joué une seule fois.
const CHIME = require('../../assets/sounds/tsedaka.wav');
const N = 14;

export function Celebration({ size = 240, children, sound = true }: { size?: number; children: React.ReactNode; sound?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const player = useAudioPlayer(CHIME);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.6)).current;
  const played = useRef(false);

  useEffect(() => {
    // Sur le web, un son sans interaction préalable est refusé par le navigateur : on s'abstient plutôt que d'échouer.
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }) : undefined;
    const allowed = Platform.OS !== 'web' || !nav?.userActivation || nav.userActivation.hasBeenActive;
    if (sound && allowed && !played.current) {
      played.current = true;
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // le son est un bonus : pas d'erreur bloquante (autoplay refusé, etc.)
      }
    }
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, [player, progress, pulse, sound]);

  const colors = [c.secondary, c.primary, '#F59E0B', '#22C55E'];
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
        const dist = size * (0.45 + (i % 3) * 0.08);
        const tx = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
        const ty = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
        const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });
        const scale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1.1, 0.6] });
        return (
          <Animated.View key={i} pointerEvents="none" style={[styles.spark, { opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }]}>
            <MaterialCommunityIcons name={i % 4 === 0 ? 'star-four-points' : i % 4 === 1 ? 'heart' : i % 4 === 2 ? 'circle' : 'star'} size={i % 3 === 0 ? 22 : 16} color={colors[i % colors.length]} />
          </Animated.View>
        );
      })}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute' },
});
