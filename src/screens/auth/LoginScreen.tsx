import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];

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
            onPress={signInWithGoogle}
            style={({ pressed }) => [styles.google, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleTxt, { color: c.text }]}>Continuer avec Google</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={{ color: c.textMuted, fontSize: 13 }}>ou</Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          </View>

          <Text style={[styles.label, { color: c.text }]}>Email</Text>
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
          <Pressable style={{ alignSelf: 'flex-end', marginTop: 10 }}>
            <Text style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}>Mot de passe oublié ?</Text>
          </Pressable>

          <Button label="Se connecter" onPress={() => signInWithEmail(email)} style={{ marginTop: 20 }} />

          <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: c.textMuted }}>
              Pas encore de compte ? <Text style={{ color: c.primary, fontWeight: '700' }}>Créer un compte</Text>
            </Text>
          </Pressable>

          <Text style={[styles.note, { color: c.textMuted }]}>Maquette : la connexion est simulée, aucune donnée n’est envoyée.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  logo: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 4 },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  googleTxt: { fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  eye: { position: 'absolute', right: 14, top: 13 },
  note: { fontSize: 11, textAlign: 'center', marginTop: 28 },
});
