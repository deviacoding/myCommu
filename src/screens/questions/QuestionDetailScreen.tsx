import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Card, Pill, Muted, Button } from '../../components/ui';
import { EmptyState } from '../../components/EmptyState';
import { formatLong, capitalize } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'QuestionDetail'>;

export function QuestionDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { questions, congregation, seed, replyToQuestion } = useAppState();
  const [reply, setReply] = useState('');
  const rav = congregation.rav;
  const q = questions.find((x) => x.id === route.params.questionId);
  if (!q) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
        <ScreenHeader title={seed.questionTitle} onBack={() => navigation.goBack()} />
        <View style={{ padding: 16 }}>
          <EmptyState icon="chatbubbles-outline" title="Cette question n’est plus disponible" hint="Elle a peut-être été retirée." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title={q.category} subtitle={capitalize(formatLong(q.date))} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <Pill label={q.status === 'answered' ? 'Répondu' : 'Non répondu'} color={q.status === 'answered' ? c.success : c.danger} />
          {q.anonymous ? <Pill label="Anonyme" color={c.textMuted} /> : null}
        </View>
        <Text style={[styles.subject, { color: c.text }]}>{q.subject}</Text>

        {(q.messages ?? []).map((m) => {
          const isRav = m.author === 'rav';
          return (
            <Card key={m.id} style={[styles.msg, isRav && { borderColor: c.primary, borderWidth: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isRav ? <Avatar source={rav.photo} name={rav.name} size={44} ring /> : <Avatar name={m.name} size={40} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isRav ? c.primary : c.text, fontWeight: '700' }}>{m.name}</Text>
                  <Muted>{isRav ? rav.title : capitalize(formatLong(m.date))}</Muted>
                </View>
                {isRav ? <Ionicons name="shield-checkmark" size={18} color={c.success} /> : null}
              </View>
              <Text style={[styles.body, { color: c.text }]}>{m.text}</Text>
              {m.sources?.length ? (
                <View style={[styles.sources, { borderTopColor: c.border }]}>
                  <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>SOURCES</Text>
                  {m.sources.map((s) => (
                    <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="bookmark" size={12} color={c.secondary} />
                      <Text style={{ color: c.textMuted, fontSize: 13 }}>{s}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          );
        })}

        {q.status === 'pending' && q.messages[q.messages.length - 1]?.author !== 'rav' ? (
          <Card style={{ alignItems: 'center', gap: 6 }}>
            <Avatar source={rav.photo} name={rav.name} size={48} />
            <Text style={{ color: c.text, fontWeight: '700', marginTop: 4 }}>{rav.name} n’a pas encore répondu</Text>
            <Muted style={{ textAlign: 'center' }}>Vous recevrez une notification dès que la réponse sera publiée.</Muted>
          </Card>
        ) : null}
        {/* Conversation : le fidèle peut répondre dans le fil, le responsable est prévenu. */}
        <Card style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontWeight: '800' }}>{q.kind === 'message' ? 'Répondre' : 'Poursuivre la conversation'}</Text>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder={q.kind === 'message' ? `Répondre à ${rav.name}…` : 'Une précision, une question complémentaire…'}
            placeholderTextColor={c.textMuted}
            multiline
            style={[styles.input, { borderColor: c.border, backgroundColor: c.surface, color: c.text }]}
          />
          <Button
            label="Envoyer"
            icon="send"
            disabled={reply.trim().length < 2}
            onPress={() => {
              replyToQuestion(q.id, reply.trim());
              setReply('');
            }}
          />
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  subject: { fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  msg: { gap: 10 },
  body: { fontSize: 15, lineHeight: 23 },
  sources: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 3 },
});
