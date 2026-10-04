import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n';
import { useAuth, authErrorMessage } from '../../state/AuthContext';
import { Button } from '../../components/ui';
import { LanguagePicker } from '../../components/LanguagePicker';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const { signIn, signInWithGoogle, resetPassword, firebaseAvailable } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | 'reset' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];

  const run = async (kind: 'email' | 'google' | 'reset', fn: () => Promise<void>, okText?: string) => {
    if (!firebaseAvailable) {
      setNotice({ kind: 'error', text: t('auth.notConfigured') });
      return;
    }
    setBusy(kind);
    setNotice(null);
    try {
      await fn();
      if (okText) setNotice({ kind: 'info', text: okText });
    } catch (e) {
      setNotice({ kind: 'error', text: authErrorMessage(e) });
    } finally {
      setBusy(null);
    }
  };

  const canSubmit = /.+@.+\..+/.test(email.trim()) && password.length >= 6;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <LanguagePicker compact />
          <View style={styles.hero}>
            <View style={[styles.logo, { backgroundColor: c.primary }]}>
              <MaterialCommunityIcons name="account-group" size={40} color={c.textOnPrimary} />
            </View>
            <Text style={[styles.title, { color: c.text }]}>myCommu</Text>
            <Text style={[styles.sub, { color: c.textMuted }]}>{t('auth.tagline')}</Text>
          </View>

          <Pressable onPress={() => navigation.navigate('DemoCommunity')} style={({ pressed }) => [styles.demo, { backgroundColor: c.primaryLight, opacity: pressed ? 0.85 : 1 }]}>
            <View style={[styles.demoIcon, { backgroundColor: c.primary }]}>
              <Ionicons name="play" size={22} color={c.textOnPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.primary, fontWeight: '800', fontSize: 16 }}>{t('auth.demoAccess')}</Text>
              <Text style={{ color: c.primary, opacity: 0.8, fontSize: 12 }}>{t('auth.demoHint')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={c.primary} />
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={{ color: c.textMuted, fontSize: 12 }}>{t('auth.orSignIn')}</Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          </View>

          <Pressable
            onPress={() => run('google', signInWithGoogle)}
            disabled={busy !== null}
            style={({ pressed }) => [styles.google, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed || busy ? 0.7 : 1 }]}
          >
            {busy === 'google' ? <ActivityIndicator color={c.primary} /> : <Ionicons name="logo-google" size={20} color="#DB4437" />}
            <Text style={[styles.googleTxt, { color: c.text }]}>{t('auth.google')}</Text>
          </Pressable>

          <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>{t('auth.email')}</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="vous@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholderTextColor={c.textMuted} style={inputStyle} />
          <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>{t('auth.password')}</Text>
          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPw}
              autoComplete="password"
              placeholderTextColor={c.textMuted}
              style={[...inputStyle, { paddingEnd: 44 }]}
              onSubmitEditing={() => canSubmit && run('email', () => signIn(email, password))}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} style={styles.eye} hitSlop={8}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
            </Pressable>
          </View>
          <Pressable
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
            onPress={() => {
              if (!/.+@.+\..+/.test(email.trim())) {
                setNotice({ kind: 'error', text: t('auth.enterEmailFirst') });
                return;
              }
              run('reset', () => resetPassword(email), t('auth.resetSent', { email: email.trim() }));
            }}
          >
            <Text style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}>{t('auth.forgot')}</Text>
          </Pressable>
          <Button label={busy === 'email' ? t('auth.signingIn') : t('auth.signIn')} disabled={!canSubmit || busy !== null} onPress={() => run('email', () => signIn(email, password))} style={{ marginTop: 20 }} />
          {notice ? (
            <View style={[styles.notice, { backgroundColor: notice.kind === 'error' ? c.danger + '14' : c.primaryLight }]}>
              <Ionicons name={notice.kind === 'error' ? 'alert-circle' : 'information-circle'} size={18} color={notice.kind === 'error' ? c.danger : c.primary} />
              <Text style={{ color: notice.kind === 'error' ? c.danger : c.primary, fontSize: 13, flex: 1, fontWeight: '600' }}>{notice.text}</Text>
            </View>
          ) : null}
          <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: c.textMuted }}>
              {t('auth.noAccount')} <Text style={{ color: c.primary, fontWeight: '700' }}>{t('auth.createAccount')}</Text>
            </Text>
          </Pressable>
          <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>{t('auth.staffCodeHint')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginTop: 20, marginBottom: 26 },
  logo: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 4 },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 16 },
  demoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  googleTxt: { fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  eye: { position: 'absolute', end: 14, top: 13 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
