import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const comingSoon = () => setNotice('La connexion réelle arrive bientôt. En attendant, utilisez le bouton « Accès démo ».');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={[styles.logo, { backgroundColor: c.primary }]}>
              <MaterialCommunityIcons name="account-group" size={40} color={c.textOnPrimary} />
            </View>
            <Text style={[styles.title, { color: c.text }]}>myCommu</Text>
            <Text style={[styles.sub, { color: c.textMuted }]}>Votre communauté, à portée de main</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('DemoCommunity')}
            style={({ pressed }) => [styles.demo, { backgroundColor: c.secondary, opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="play-circle" size={26} color={c.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.primaryDark, fontWeight: '900', fontSize: 17 }}>Accès démo</Text>
              <Text style={{ color: c.primaryDark, opacity: 0.8, fontSize: 12 }}>Découvrir l’application sans compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={c.primaryDark} />
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={{ color: c.textMuted, fontSize: 13 }}>ou connectez-vous</Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          </View>

          <Pressable
            onPress={comingSoon}
            style={({ pressed }) => [styles.google, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleTxt, { color: c.text }]}>Continuer avec Google</Text>
          </Pressable>

          <Text style={[styles.label, { color: c.text, marginTop: 18 }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />
          <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>Mot de passe</Text>
          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPw}
              placeholderTextColor={c.textMuted}
              style={[...inputStyle, { paddingRight: 44 }]}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} style={styles.eye} hitSlop={8}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
            </Pressable>
          </View>
          <Pressable style={{ alignSelf: 'flex-end', marginTop: 10 }} onPress={comingSoon}>
            <Text style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}>Mot de passe oublié ?</Text>
          </Pressable>

          <Button label="Se connecter" onPress={comingSoon} style={{ marginTop: 20 }} />

          {notice ? (
            <View style={[styles.notice, { backgroundColor: c.primaryLight }]}>
              <Ionicons name="information-circle" size={18} color={c.primary} />
              <Text style={{ color: c.primary, fontSize: 13, flex: 1, fontWeight: '600' }}>{notice}</Text>
            </View>
          ) : null}

          <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: c.textMuted }}>
              Pas encore de compte ? <Text style={{ color: c.primary, fontWeight: '700' }}>Créer un compte</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 26 },
  logo: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 4 },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 16 },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  googleTxt: { fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  eye: { position: 'absolute', right: 14, top: 13 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
