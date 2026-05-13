import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Créer un compte</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
            Rejoignez votre communauté en quelques secondes
          </Text>

          <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Daniel Levy" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="vous@exemple.com" keyboardType="email-address" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secure />

          <Pressable style={[styles.btn, { backgroundColor: theme.colors.primary }]} onPress={signIn}>
            <Text style={[styles.btnTxt, { color: theme.colors.textOnPrimary }]}>Créer mon compte</Text>
          </Pressable>

          <View style={styles.separator}>
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.sepTxt, { color: theme.colors.textMuted }]}>ou</Text>
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          </View>

          <SocialBtn icon="logo-google" label="Continuer avec Google" />
          <SocialBtn icon="logo-apple" label="Continuer avec Apple" />

          <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textMuted }}>
              Déjà un compte ? <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, secure, ...rest }: any) {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        {...rest}
        secureTextEntry={secure}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
        ]}
      />
    </View>
  );
}

function SocialBtn({ icon, label }: { icon: any; label: string }) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[styles.social, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
      <Text style={[styles.socialTxt, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 18 },
  sub: { fontSize: 14, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  btnTxt: { fontSize: 16, fontWeight: '700' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  line: { flex: 1, height: 1 },
  sepTxt: { fontSize: 13 },
  social: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderWidth: 1, borderRadius: 12, marginBottom: 10 },
  socialTxt: { fontSize: 15, fontWeight: '600' },
});
