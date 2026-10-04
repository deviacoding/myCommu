import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Message affiché à la place d'une liste vide : jamais de page blanche.
export function EmptyState({ icon = 'file-tray-outline', title, hint, children, compact }: { icon?: IoniconName; title: string; hint?: string; children?: ReactNode; compact?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border, paddingVertical: compact ? 18 : 32 }]}>
      <View style={[styles.icon, { backgroundColor: c.primaryLight }]}>
        <Ionicons name={icon} size={compact ? 22 : 30} color={c.primary} />
      </View>
      <Text style={{ color: c.text, fontSize: compact ? 15 : 17, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
      {hint ? <Text style={{ color: c.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4, maxWidth: 320 }}>{hint}</Text> : null}
      {children ? <View style={{ marginTop: 12, alignSelf: 'stretch' }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 20, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, marginVertical: 8 },
  icon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});
