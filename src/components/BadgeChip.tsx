import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge } from '../types';
import { useTheme } from '../theme/ThemeProvider';

const rarityColor: Record<Badge['rarity'], string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export function BadgeChip({ badge, large }: { badge: Badge; large?: boolean }) {
  const { theme } = useTheme();
  const color = rarityColor[badge.rarity];
  const size = large ? 86 : 64;
  const iconSize = large ? 36 : 26;
  return (
    <View style={[styles.wrap, { width: size }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: badge.earned ? color + '22' : theme.colors.background,
            opacity: badge.earned ? 1 : 0.45,
          },
        ]}
      >
        <MaterialCommunityIcons name={badge.icon as any} size={iconSize} color={color} />
      </View>
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
        {badge.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: 12 },
  circle: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: 6, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
