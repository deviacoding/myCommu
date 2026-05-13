import React from 'react';
import { Image, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 44, online, style }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.primaryLight,
            },
          ]}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: size / 2.5 }}>{initials}</Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.success,
              borderColor: theme.colors.surface,
              width: size / 4,
              height: size / 4,
              borderRadius: size / 8,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: '#eee' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
});
