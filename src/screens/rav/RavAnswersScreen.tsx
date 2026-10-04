import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { RavScreen, BIG, RavCard } from './RavUi';
import { capitalize, formatLong } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavAnswers'>;

export function RavAnswersScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { myQuestions: questions, seed } = useAppState();
  const pending = questions.filter((q) => q.status === 'pending');
  const answered = questions.filter((q) => q.status === 'answered');

  return (
    <RavScreen title={`Questions des ${seed.memberLabel}s`} subtitle={`${pending.length} sans réponse · ${answered.length} répondues`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginBottom: 10 }}>À répondre</Text>
      {pending.length === 0 ? (
        <RavCard style={{ alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={40} color={c.success} />
          <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '700', marginTop: 8 }}>Tout est répondu, bravo !</Text>
        </RavCard>
      ) : null}
      {pending.map((q) => (
        <Pressable
          key={q.id}
          onPress={() => navigation.navigate('RavAnswer', { questionId: q.id })}
          style={({ pressed }) => [styles.item, { backgroundColor: c.surface, borderColor: c.danger, opacity: pressed ? 0.85 : 1 }]}
        >
          <Avatar name={q.askedBy} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.danger, fontSize: 14, fontWeight: '800' }}>NON RÉPONDU · {q.category}</Text>
            <Text style={{ color: c.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{q.subject}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4 }}>
              {q.askedBy} · {capitalize(formatLong(q.date))}
            </Text>
          </View>
          <View style={[styles.cta, { backgroundColor: c.primary }]}>
            <Ionicons name="create" size={22} color={c.textOnPrimary} />
            <Text style={{ color: c.textOnPrimary, fontWeight: '800', fontSize: 15 }}>Répondre</Text>
          </View>
        </Pressable>
      ))}

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 24, marginBottom: 10 }}>Déjà répondues</Text>
      {answered.length === 0 ? (
        <RavCard>
          <Text style={{ color: c.textMuted, fontSize: BIG.small }}>
            {questions.length === 0 ? `Aucune question pour l’instant. Les ${seed.memberLabel}s peuvent vous écrire depuis l’onglet « Questions » de leur application.` : 'Aucune question répondue pour l’instant.'}
          </Text>
        </RavCard>
      ) : null}
      {answered.map((q) => (
        <Pressable
          key={q.id}
          onPress={() => navigation.navigate('RavAnswer', { questionId: q.id })}
          style={({ pressed }) => [styles.item, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 0.9 }]}
        >
          <Ionicons name="checkmark-circle" size={30} color={c.success} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>{q.subject}</Text>
            <Text style={{ color: c.textMuted, fontSize: 15, marginTop: 2 }}>{q.askedBy} · {q.category}</Text>
          </View>
          <Ionicons name="chevron-forward" size={26} color={c.textMuted} />
        </Pressable>
      ))}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 2, marginBottom: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
});
