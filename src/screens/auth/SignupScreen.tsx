import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { CommunityId } from '../../types';
import { themes } from '../../theme/themes';
import { Button } from '../../components/ui';
import { useI18n } from '../../i18n';
import { useAuth, authErrorMessage } from '../../state/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const religions: { id: CommunityId; icon: MciName; hint: string }[] = [
  { id: 'jewish', icon: 'star-david', hint: 'Horaires des fêtes, cours de Torah, tsedaka et maasser' },
  { id: 'christian', icon: 'cross', hint: 'Messes, catéchèse, dîme et offrandes' },
  { id: 'muslim', icon: 'star-crescent', hint: 'Horaires de prière, cours, zakat et sadaqa' },
  { id: 'buddhist', icon: 'meditation', hint: 'Séances de méditation, enseignements du Dharma, dana' },
];

export function SignupScreen({ navigation }: Props) {
  const { theme, setCommunity } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { signUp, firebaseAvailable } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [religion, setReligion] = useState<CommunityId | null>(null);
  const [intent, setIntent] = useState<'member' | 'leader'>('member');

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const canSubmit = religion !== null && name.trim().length > 1 && /.+@.+\..+/.test(email.trim()) && password.length >= 8;

  const choose = (id: CommunityId) => {
    setReligion(id);
    setCommunity(id); // le thème change en direct pour montrer la couleur de la communauté
  };

  const submit = async () => {
    if (!religion) return;
    if (!firebaseAvailable) {
      setError(t('auth.notConfigured'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signUp({ name, email, password, religion, intent });
      // La session s'ouvre toute seule : l'écran d'accueil du fidèle ou du responsable prend le relais.
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ alignSelf: 'flex-start' }}>
            <Ionicons name="chevron-back" size={28} color={c.text} />
          </Pressable>
          <Text style={[styles.title, { color: c.text }]}>{t('auth.createAccount')}</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>{t('auth.signupIntro')}</Text>

          <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>{t('auth.fullName')}</Text>
          <TextInput value={name} onChangeText={setName} placeholder="David Cohen" autoComplete="name" placeholderTextColor={c.textMuted} style={inputStyle} />
          <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>{t('auth.email')}</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="vous@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholderTextColor={c.textMuted} style={inputStyle} />
          <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>{t('auth.password')}</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder={t('auth.passwordHint')} secureTextEntry autoComplete="new-password" placeholderTextColor={c.textMuted} style={inputStyle} />

          <Text style={[styles.label, { color: c.text, marginTop: 22 }]}>{t('auth.myReligion')}</Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 10 }}>{t('auth.religionHint')}</Text>
          {religions.map((r) => {
            const active = religion === r.id;
            const tint = themes[r.id].colors.primary;
            return (
              <Pressable key={r.id} onPress={() => choose(r.id)} accessibilityRole="radio" aria-checked={active} style={[styles.religion, { borderColor: active ? tint : c.border, backgroundColor: active ? tint + '14' : c.surface }]}>
                <View style={[styles.religionIcon, { backgroundColor: tint + '22' }]}>
                  <MaterialCommunityIcons name={r.icon} size={24} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{t(`religions.${r.id}.community`)}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{r.hint}</Text>
                </View>
                <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? tint : c.border} />
              </Pressable>
            );
          })}

          <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>{t('auth.iAm')}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['member', 'leader'] as const).map((k) => {
              const active = intent === k;
              return (
                <Pressable key={k} onPress={() => setIntent(k)} accessibilityRole="radio" aria-checked={active} style={[styles.intent, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryLight : c.surface }]}>
                  <Ionicons name={k === 'member' ? 'people' : 'ribbon'} size={22} color={active ? c.primary : c.textMuted} />
                  <Text style={{ color: active ? c.primary : c.text, fontWeight: '800', fontSize: 14, textAlign: 'center' }}>{k === 'member' ? t('auth.intentMember') : t('auth.intentLeader')}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 8 }}>{intent === 'leader' ? t('auth.intentLeaderHint') : t('auth.intentMemberHint')}</Text>

          <Button label={busy ? t('auth.creating') : t('auth.createMyAccount')} disabled={!canSubmit || busy} onPress={submit} style={{ marginTop: 22 }} />
          {error ? (
            <View style={[styles.notice, { backgroundColor: c.danger + '14' }]}>
              <Ionicons name="alert-circle" size={18} color={c.danger} />
              <Text style={{ color: c.danger, fontSize: 13, flex: 1, fontWeight: '600' }}>{error}</Text>
            </View>
          ) : null}
          <Text style={[styles.note, { color: c.textMuted }]}>{t('auth.terms')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 14 },
  sub: { fontSize: 14, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  religion: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 14, padding: 12, marginBottom: 10 },
  religionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  intent: { flex: 1, alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 14, padding: 12 },
  note: { fontSize: 11, textAlign: 'center', marginTop: 16 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
