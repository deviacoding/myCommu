import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Interface pensée pour des utilisateurs âgés : gros textes, gros boutons, une action par écran.
export const BIG = { title: 28, text: 20, label: 18, small: 16, button: 20 };

export function RavScreen({ title, subtitle, onBack, children, right }: { title: string; subtitle?: string; onBack?: () => void; children: ReactNode; right?: ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t, rtl } = useI18n();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {onBack ? (
          <Pressable onPress={onBack} style={[styles.back, { backgroundColor: c.primaryLight }]} hitSlop={10}>
            <Ionicons name={rtl ? 'arrow-forward' : 'arrow-back'} size={26} color={c.primary} />
            <Text style={{ color: c.primary, fontWeight: '800', fontSize: 17 }}>{t('common.back')}</Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BigLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: 18, marginBottom: 8 }}>
      <Text style={{ color: theme.colors.text, fontSize: BIG.label, fontWeight: '800' }}>{children}</Text>
      {hint ? <Text style={{ color: theme.colors.textMuted, fontSize: BIG.small, marginTop: 2 }}>{hint}</Text> : null}
    </View>
  );
}

export function BigInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  style,
  onBlur,
  onSelectionChange,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  style?: StyleProp<TextStyle>;
  onBlur?: () => void;
  onSelectionChange?: (sel: { start: number; end: number }) => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      onSelectionChange={onSelectionChange ? (e) => onSelectionChange(e.nativeEvent.selection) : undefined}
      placeholder={placeholder}
      placeholderTextColor={c.textMuted}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType}
      style={[
        styles.input,
        { borderColor: c.border, backgroundColor: c.surface, color: c.text },
        multiline && { minHeight: 220, lineHeight: 30 },
        style,
      ]}
    />
  );
}

export function BigButton({
  label,
  icon,
  onPress,
  color,
  textColor,
  disabled,
  style,
}: {
  label: string;
  icon?: IoniconName;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const bg = color ?? c.primary;
  const fg = textColor ?? c.textOnPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.bigBtn, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}
    >
      {icon ? <Ionicons name={icon} size={26} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: BIG.button, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

export function BigChoice<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.choice, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
          >
            {active ? <Ionicons name="checkmark" size={20} color={c.textOnPrimary} /> : null}
            <Text style={{ color: active ? c.textOnPrimary : c.text, fontSize: 17, fontWeight: '700' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Done({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.done, { backgroundColor: c.success + '18', borderColor: c.success }]}>
      <Ionicons name="checkmark-circle" size={56} color={c.success} />
      <Text style={{ color: c.text, fontSize: 24, fontWeight: '900', marginTop: 10, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 6, textAlign: 'center' }}>{text}</Text> : null}
      {children}
    </View>
  );
}

export function RavCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  title: { fontSize: BIG.title, fontWeight: '900' },
  content: { padding: 18, maxWidth: 720, width: '100%', alignSelf: 'center' },
  input: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: BIG.text },
  bigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderRadius: 16, minHeight: 64 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2, minHeight: 54 },
  done: { alignItems: 'center', padding: 24, borderRadius: 18, borderWidth: 2, marginTop: 10 },
  card: { borderRadius: 18, padding: 18, borderWidth: StyleSheet.hairlineWidth, marginBottom: 14 },
});
