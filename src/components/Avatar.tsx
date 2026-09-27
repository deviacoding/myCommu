import React from 'react';
import { Image, View, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AvatarProps {
  uri?: string;
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  online?: boolean;
  ring?: boolean;
  style?: ViewStyle;
}

export function Avatar({ uri, source, name, size = 44, online, ring, style }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';
  const img = source ?? (uri ? { uri } : undefined);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {img ? (
        <Image
          source={img}
          style={[
            styles.img,
            { width: size, height: size, borderRadius: size / 2 },
            ring && { borderWidth: 3, borderColor: theme.colors.secondary },
          ]}
        />
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
  img: { backgroundColor: '#eee', resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
});
