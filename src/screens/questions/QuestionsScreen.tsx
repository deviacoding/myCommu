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
        subtitle={`${questions.length} questions · ${pending} en attente de réponse`}
        right={
          <Pressable onPress={() => navigation.navigate('AskQuestion')} style={[styles.ask, { backgroundColor: c.primary }]}>
            <Ionicons name="add" size={18} color={c.textOnPrimary} />
            <Text style={{ color: c.textOnPrimary, fontWeight: '700', fontSize: 13 }}>Poser</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name="Rav Yaacov Attias" size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '700' }}>Rav Yaacov Attias</Text>
            <Muted>Rabbin de la communauté · répond sous 48 h</Muted>
          </View>
          <Ionicons name="shield-checkmark" size={22} color={c.success} />
        </Card>

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Chip label="Toutes" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Répondues" active={filter === 'answered'} onPress={() => setFilter('answered')} />
          <Chip label="En attente" active={filter === 'pending'} onPress={() => setFilter('pending')} />
        </View>

        {list.map((q) => {
          const first = q.messages[0];
          const answer = q.messages.find((m) => m.author === 'rav');
          return (
            <Card key={q.id} onPress={() => navigation.navigate('QuestionDetail', { questionId: q.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pill label={q.category} color={c.primary} />
                <Pill
                  label={q.status === 'answered' ? 'Répondu' : 'En attente'}
                  color={q.status === 'answered' ? c.success : c.warning}
                />
                <View style={{ flex: 1 }} />
                <Muted>{formatShort(q.date)}</Muted>
              </View>
              <Text style={[styles.subject, { color: c.text }]}>{q.subject}</Text>
              <Muted style={{ marginTop: 4 }} >
                {q.askedBy} · « {first.text.length > 90 ? first.text.slice(0, 90).trimEnd() + '…' : first.text} »
              </Muted>
              {answer ? (
                <View style={[styles.answer, { backgroundColor: c.primaryLight }]}>
                  <Ionicons name="chatbubble-ellipses" size={14} color={c.primary} style={{ marginTop: 2 }} />
                  <Text style={{ color: c.text, fontSize: 13, flex: 1 }} numberOfLines={2}>
                    <Text style={{ fontWeight: '700', color: c.primary }}>Rav : </Text>
                    {answer.text}
                  </Text>
                </View>
              ) : null}
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
  answer: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, marginTop: 10 },
});
