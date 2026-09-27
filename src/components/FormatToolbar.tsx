import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { RICH_COLORS } from './RichText';

export interface Selection {
  start: number;
  end: number;
}

interface Props {
  text: string;
  selection: Selection;
  onChange: (next: string) => void;
}

// Sur le web, la zone de texte perd le focus quand on touche un bouton : on lit la sélection
// au moment du « pointer down », avant que le navigateur ne la retire.
function readDomSelection(text: string): Selection | null {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  const el = document.activeElement as HTMLTextAreaElement | null;
  if (!el || el.tagName !== 'TEXTAREA' || el.value !== text) return null;
  if (typeof el.selectionStart !== 'number' || typeof el.selectionEnd !== 'number') return null;
  return { start: el.selectionStart, end: el.selectionEnd };
}

// Barre de mise en forme pour l'éditeur : on sélectionne un mot ou une phrase, puis on touche un bouton.
export function FormatToolbar({ text, selection, onChange }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [domSel, setDomSel] = useState<Selection | null>(null);

  const effective = domSel && domSel.end > domSel.start ? domSel : selection;
  const hasSelection = effective.end > effective.start && effective.end <= text.length;
  const selected = hasSelection ? text.slice(effective.start, effective.end) : '';

  const capture = () => {
    const s = readDomSelection(text);
    if (s) setDomSel(s);
  };

  const wrap = (open: string, close: string) => {
    const s = readDomSelection(text) ?? effective;
    if (!(s.end > s.start)) return;
    onChange(text.slice(0, s.start) + open + text.slice(s.start, s.end) + close + text.slice(s.end));
    setDomSel(null);
  };

  const btn = (label: string, icon: React.ReactNode, onPress: () => void, extra?: object) => (
    <Pressable
      key={label}
      onPressIn={capture}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }, extra]}
    >
      {icon}
      <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: c.background, borderColor: c.border }]}>
      <View style={styles.row}>
        {btn('Gras', <MaterialCommunityIcons name="format-bold" size={24} color={c.text} />, () => wrap('**', '**'))}
        {btn('Surligner', <MaterialCommunityIcons name="marker" size={22} color="#B45309" />, () => wrap('==', '=='), { backgroundColor: '#FDE68A' })}
        {Object.entries(RICH_COLORS).map(([name, color]) =>
          btn(name.charAt(0).toUpperCase() + name.slice(1), <View style={[styles.dot, { backgroundColor: color }]} />, () => wrap(`{{${name}|`, '}}'))
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Ionicons name={hasSelection ? 'checkmark-circle' : 'hand-left-outline'} size={18} color={hasSelection ? c.success : c.textMuted} />
        <Text style={{ color: hasSelection ? c.success : c.textMuted, fontSize: 14, flex: 1 }} numberOfLines={1}>
          {hasSelection
            ? `Sélection : « ${selected.length > 40 ? selected.slice(0, 40) + '…' : selected} »`
            : 'Sélectionnez un mot ou une phrase dans le texte, puis touchez Gras, Surligner ou une couleur.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 14, padding: 10, marginTop: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, minHeight: 48 },
  dot: { width: 18, height: 18, borderRadius: 9 },
});
