import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Bon retour</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>Connectez-vous à votre compte</Text>

          <View style={{ marginTop: 24 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
              ]}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
              ]}
            />
          </View>

          <Pressable style={{ alignSelf: 'flex-end', marginTop: 10 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Mot de passe oublié ?</Text>
          </Pressable>

          <Pressable style={[styles.btn, { backgroundColor: theme.colors.primary }]} onPress={signIn}>
            <Text style={[styles.btnTxt, { color: theme.colors.textOnPrimary }]}>Se connecter</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Welcome')} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textMuted }}>
              Pas encore de compte ? <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>S’inscrire</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 18 },
  sub: { fontSize: 14, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  btnTxt: { fontSize: 16, fontWeight: '700' },
});
