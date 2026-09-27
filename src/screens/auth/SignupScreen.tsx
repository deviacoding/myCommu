import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { CommunityId } from '../../types';
import { themes } from '../../theme/themes';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const religions: { id: CommunityId; label: string; icon: MciName; hint: string }[] = [
  { id: 'jewish', label: 'Judaïsme', icon: 'star-david', hint: 'Horaires des fêtes, cours de Torah, tsedaka et maasser' },
  { id: 'christian', label: 'Christianisme', icon: 'cross', hint: 'Messes, catéchèse, dîme et offrandes' },
  { id: 'muslim', label: 'Islam', icon: 'star-crescent', hint: 'Horaires de prière, cours, zakat et sadaqa' },
];

export function SignupScreen({ navigation }: Props) {
  const { theme, setCommunity } = useTheme();
  const c = theme.colors;
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [religion, setReligion] = useState<CommunityId | null>(null);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const canSubmit = religion !== null && name.trim().length > 0;

  const choose = (id: CommunityId) => {
    setReligion(id);
    setCommunity(id); // le thème change en direct pour montrer la couleur de la communauté
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ alignSelf: 'flex-start' }}>
            <Ionicons name="chevron-back" size={28} color={c.text} />
          </Pressable>
          <Text style={[styles.title, { color: c.text }]}>Créer un compte</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>Quelques informations pour rejoindre votre communauté</Text>

          <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>Nom complet</Text>
          <TextInput value={name} onChangeText={setName} placeholder="David Cohen" placeholderTextColor={c.textMuted} style={inputStyle} />

          <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>Email</Text>
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
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="8 caractères minimum"
            secureTextEntry
            placeholderTextColor={c.textMuted}
            style={inputStyle}
          />

          <Text style={[styles.label, { color: c.text, marginTop: 22 }]}>Ma religion</Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 10 }}>
            L’application s’adapte à votre communauté : contenus, calendrier et couleurs.
          </Text>
          {religions.map((r) => {
            const active = religion === r.id;
            const tint = themes[r.id].colors.primary;
            return (
              <Pressable
                key={r.id}
                onPress={() => choose(r.id)}
                style={[
                  styles.religion,
                  { borderColor: active ? tint : c.border, backgroundColor: active ? tint + '14' : c.surface },
                ]}
              >
                <View style={[styles.religionIcon, { backgroundColor: tint + '22' }]}>
                  <MaterialCommunityIcons name={r.icon} size={24} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{r.label}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{r.hint}</Text>
                </View>
                <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? tint : c.border} />
              </Pressable>
            );
          })}

          <Button
            label="Créer mon compte"
            disabled={!canSubmit}
            onPress={() => religion && signUp({ name, email, community: religion })}
            style={{ marginTop: 22 }}
          />
          <Text style={[styles.note, { color: c.textMuted }]}>
            En créant un compte, vous acceptez les conditions d’utilisation et la politique de confidentialité.
          </Text>
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
  note: { fontSize: 11, textAlign: 'center', marginTop: 16 },
});
