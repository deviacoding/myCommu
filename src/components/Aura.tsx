import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface AuraProps {
  levelIndex: number; // 0..4
  progress: number; // 0..1 vers le niveau suivant
  size?: number;
  icon?: string; // MaterialCommunityIcons, selon la confession
}

// L'ora : des cercles concentriques qui grandissent et s'intensifient avec le niveau.
export function Aura({ levelIndex, progress, size = 220, icon = 'star-david' }: AuraProps) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const intensity = Math.min(1, (levelIndex + progress) / 4); // 0..1
  const rings = 4;
  const gold = theme.colors.secondary;
  const primary = theme.colors.primary;
  const coreSize = size * (0.28 + 0.14 * intensity);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {Array.from({ length: rings }).map((_, i) => {
        const base = coreSize + ((size - coreSize) * (i + 1)) / rings;
        const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + 0.04 * (i + 1)] });
        const opacity = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.06 + 0.16 * intensity * (1 - i / rings), 0.12 + 0.22 * intensity * (1 - i / rings)],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                width: base,
                height: base,
                borderRadius: base / 2,
                backgroundColor: i % 2 === 0 ? primary : gold,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
      <Animated.View
        style={[
          styles.core,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
            backgroundColor: primary,
            shadowColor: gold,
            shadowOpacity: 0.5 + 0.5 * intensity,
            shadowRadius: 12 + 24 * intensity,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }],
          },
        ]}
      >
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={coreSize * 0.45} color={gold} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  core: { alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, elevation: 8 },
});
