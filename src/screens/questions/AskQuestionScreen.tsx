import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, Chip, Muted, Button } from '../../components/ui';
import { QuestionCategory } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'AskQuestion'>;


export function AskQuestionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { askQuestion, seed, congregation } = useAppState();
  const categories: QuestionCategory[] = seed.questionCategories;
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<QuestionCategory>(seed.questionCategories[0]);
  const [anonymous, setAnonymous] = useState(false);
  const [sent, setSent] = useState(false);

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }];
  const canSend = subject.trim().length > 5 && text.trim().length > 10;

  const submit = () => {
    askQuestion({ subject: subject.trim(), text: text.trim(), category, anonymous, askedBy: user.name });
    setSent(true);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Poser une question" subtitle={`Réponse de ${congregation.rav.name} sous 48 h`} onBack={() => navigation.goBack()} />
      {sent ? (
        <View style={styles.center}>
          <Ionicons name="paper-plane" size={48} color={c.primary} />
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '800', marginTop: 14 }}>Question envoyée</Text>
          <Muted style={{ textAlign: 'center', marginTop: 6, maxWidth: 300 }}>
            {congregation.rav.name} a reçu votre question. Elle reste privée jusqu’à sa réponse.
          </Muted>
          <Button label="Retour aux questions" onPress={() => navigation.goBack()} style={{ marginTop: 24, minWidth: 220 }} />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: c.text }]}>Thème</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <Chip key={cat} label={cat} active={category === cat} onPress={() => setCategory(cat)} />
              ))}
            </View>

            <Text style={[styles.label, { color: c.text, marginTop: 10 }]}>Sujet</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Ex. : Peut-on cuisiner à Yom Tov pour le lendemain ?"
              placeholderTextColor={c.textMuted}
              style={inputStyle}
            />

            <Text style={[styles.label, { color: c.text, marginTop: 14 }]}>Votre question</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Décrivez votre situation avec le plus de précisions possible…"
              placeholderTextColor={c.textMuted}
              multiline
              textAlignVertical="top"
              style={[...inputStyle, { minHeight: 140 }]}
            />

            <Card style={[styles.switchRow, { marginTop: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '600' }}>Poser anonymement</Text>
                <Muted>Votre nom ne sera pas affiché aux autres membres.</Muted>
              </View>
              <Switch value={anonymous} onValueChange={setAnonymous} trackColor={{ true: c.primary }} />
            </Card>

            <Button label={`Envoyer à ${seed.leaderShort === 'Rav' ? 'au Rav' : seed.leaderShort}`.replace('Envoyer à au', 'Envoyer au')} icon="send" disabled={!canSend} onPress={submit} />
            <Muted style={{ textAlign: 'center', marginTop: 12 }}>
              Les questions et réponses sont visibles par les membres de la communauté.
            </Muted>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
