import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function ProgressBar({ progress, height = 10 }: { progress: number; height?: number }) {
  const { theme } = useTheme();
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { backgroundColor: theme.colors.primaryLight, height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: theme.colors.primary, width: `${pct * 100}%`, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
