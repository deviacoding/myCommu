import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { LANGUAGES, useI18n } from '../i18n';

// Sélecteur de langue : une rangée de boutons, la langue active est cochée.
export function LanguagePicker({ compact, big }: { compact?: boolean; big?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { lang, setLang, t } = useI18n();
  return (
    <View>
      {!compact ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ionicons name="language" size={big ? 22 : 18} color={c.primary} />
          <Text style={{ color: c.text, fontWeight: '800', fontSize: big ? 18 : 15 }}>{t('common.language')}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        {LANGUAGES.map((l) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              accessibilityRole="radio"
              aria-checked={active}
              style={[styles.pill, big && styles.pillBig, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
            >
              <Text style={{ color: active ? c.textOnPrimary : c.text, fontWeight: '800', fontSize: big ? 17 : 14 }}>{l.native}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5 },
  pillBig: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2 },
});
