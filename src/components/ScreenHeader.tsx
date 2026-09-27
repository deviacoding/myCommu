import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { CommunitySwitcher } from './CommunitySwitcher';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  communitySwitch?: boolean;
}

export function ScreenHeader({ title, subtitle, onBack, right, communitySwitch }: ScreenHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.row}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {communitySwitch ? <CommunitySwitcher /> : null}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4, marginLeft: -4 },
  title: { fontSize: 20, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
});
