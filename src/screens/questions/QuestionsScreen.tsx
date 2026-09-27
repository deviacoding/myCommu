import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Card, Chip, Pill, Muted } from '../../components/ui';
import { rav } from '../../mocks/rav';
import { formatShort } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Filter = 'all' | 'answered' | 'pending';

export function QuestionsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { questions } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');

  const list = questions.filter((q) => filter === 'all' || q.status === filter);
  const pending = questions.filter((q) => q.status === 'pending').length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader
        title="Questions au Rav"
        subtitle={`${questions.length} questions · ${pending} non répondue${pending > 1 ? 's' : ''}`}
        right={
          <Pressable onPress={() => navigation.navigate('AskQuestion')} style={[styles.ask, { backgroundColor: c.primary }]}>
            <Ionicons name="add" size={18} color={c.textOnPrimary} />
            <Text style={{ color: c.textOnPrimary, fontWeight: '700', fontSize: 13 }}>Poser</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar source={rav.photo} name={rav.name} size={56} ring />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{rav.name}</Text>
            <Muted>{rav.title} · répond sous 48 h</Muted>
          </View>
          <Ionicons name="shield-checkmark" size={22} color={c.success} />
        </Card>

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Chip label="Toutes" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Répondues" active={filter === 'answered'} onPress={() => setFilter('answered')} />
          <Chip label="Non répondues" active={filter === 'pending'} onPress={() => setFilter('pending')} />
        </View>

        {list.map((q) => {
          const first = q.messages[0];
          const answer = q.messages.find((m) => m.author === 'rav');
          return (
            <Card key={q.id} onPress={() => navigation.navigate('QuestionDetail', { questionId: q.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pill label={q.category} color={c.primary} />
                <Pill label={q.status === 'answered' ? 'Répondu' : 'Non répondu'} color={q.status === 'answered' ? c.success : c.danger} />
                <View style={{ flex: 1 }} />
                <Muted>{formatShort(q.date)}</Muted>
              </View>
              <Text style={[styles.subject, { color: c.text }]}>{q.subject}</Text>
              <Muted style={{ marginTop: 4 }}>
                {q.askedBy} · « {first.text.length > 90 ? first.text.slice(0, 90).trimEnd() + '…' : first.text} »
              </Muted>
              {answer ? (
                <View style={[styles.answer, { backgroundColor: c.primaryLight }]}>
                  <Avatar source={rav.photo} name={rav.name} size={28} />
                  <Text style={{ color: c.text, fontSize: 13, flex: 1 }} numberOfLines={2}>
                    <Text style={{ fontWeight: '700', color: c.primary }}>{rav.name} : </Text>
                    {answer.text}
                  </Text>
                </View>
              ) : (
                <View style={[styles.answer, { backgroundColor: c.danger + '12' }]}>
                  <Ionicons name="time-outline" size={16} color={c.danger} />
                  <Text style={{ color: c.danger, fontSize: 13, fontWeight: '600' }}>En attente de la réponse du Rav</Text>
                </View>
              )}
            </Card>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  subject: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  answer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginTop: 10 },
});
