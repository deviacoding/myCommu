import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n';
import { BigInput } from '../screens/rav/RavUi';
import { COMMON_COUNTRIES, countryName } from '../utils/countries';

// Choix du pays : les pays les plus courants en un geste, ou un autre pays à saisir.
export function CountryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t, lang } = useI18n();
  const [other, setOther] = useState(!!value && !COMMON_COUNTRIES.includes(value));
  const showOther = other || (!!value && !COMMON_COUNTRIES.includes(value));

  const chip = (key: string, label: string, active: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={active}
      style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
    >
      {active ? <Ionicons name="checkmark" size={20} color={c.textOnPrimary} /> : null}
      <Text style={{ color: active ? c.textOnPrimary : c.text, fontSize: 17, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {COMMON_COUNTRIES.map((code) =>
          chip(code, countryName(code, lang), !showOther && value === code, () => {
            setOther(false);
            onChange(code);
          })
        )}
        {chip('other', t('create.otherCountry'), showOther, () => {
          setOther(true);
          if (COMMON_COUNTRIES.includes(value)) onChange('');
        })}
      </View>
      {showOther ? <BigInput value={value} onChangeText={onChange} placeholder={t('create.countryPlaceholder')} style={{ marginTop: 10 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, minHeight: 50 },
});
