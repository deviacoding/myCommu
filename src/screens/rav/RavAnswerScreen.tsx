import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { AiAssist } from '../../components/AiAssist';
import { rav } from '../../mocks/rav';
import { RavScreen, BigLabel, BigInput, BigButton, Done, RavCard, BIG } from './RavUi';
import { capitalize, formatLong } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavAnswer'>;

const sourceShortcuts = ['Choulhan Aroukh, Orah Haïm', 'Choulhan Aroukh, Yoré Déa', 'Michna Beroura', 'Rama', 'Rambam, Michné Torah', 'Igrot Moché', 'Yalkout Yossef', 'Ben Ich Haï'];

export function RavAnswerScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { questions, answerQuestion } = useAppState();
  const q = questions.find((x) => x.id === route.params.questionId);
  const [text, setText] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState('');
  const [done, setDone] = useState(false);

  if (!q) return null;
  const question = q.messages[0];
  const existing = q.messages.filter((m) => m.author === 'rav');

  const toggleSource = (s: string) => setSources((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));
  const addCustom = () => {
    if (customSource.trim()) {
      setSources((list) => [...list, customSource.trim()]);
      setCustomSource('');
    }
  };

  if (done) {
    return (
      <RavScreen title="Réponse publiée" onBack={() => navigation.goBack()}>
        <Done title="Réponse envoyée" text={`${q.askedBy} reçoit une notification. La réponse est visible par toute la communauté avec votre photo.`}>
          <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
            <BigButton label="Retour aux questions" icon="chatbubbles" onPress={() => navigation.goBack()} />
          </View>
        </Done>
      </RavScreen>
    );
  }

  return (
    <RavScreen title="Répondre" subtitle={q.category} onBack={() => navigation.goBack()}>
      <RavCard style={{ borderColor: c.primary, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={q.askedBy} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{q.askedBy}</Text>
            <Text style={{ color: c.textMuted, fontSize: 15 }}>{capitalize(formatLong(q.date))}</Text>
          </View>
        </View>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', marginTop: 14 }}>{q.subject}</Text>
        <Text style={{ color: c.text, fontSize: BIG.text, lineHeight: 30, marginTop: 8 }}>{question.text}</Text>
      </RavCard>

      {existing.map((m) => (
        <RavCard key={m.id} style={{ backgroundColor: c.primaryLight }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar source={rav.photo} name={rav.name} size={40} />
            <Text style={{ color: c.primary, fontWeight: '800', fontSize: 17 }}>Votre réponse du {formatLong(m.date)}</Text>
          </View>
          <Text style={{ color: c.text, fontSize: 18, lineHeight: 27, marginTop: 8 }}>{m.text}</Text>
        </RavCard>
      ))}

      <BigLabel hint="Écrivez simplement, ChatGPT peut corriger ensuite.">{existing.length ? 'Ajouter un complément' : 'Votre réponse'}</BigLabel>
      <BigInput value={text} onChangeText={setText} multiline placeholder={`Bonjour ${q.askedBy.split(' ')[0]}, …`} />
      <AiAssist text={text} onAccept={setText} />

      <BigLabel hint="Touchez une ou plusieurs sources, elles s’affichent sous la réponse.">Sources (facultatif)</BigLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[...sourceShortcuts, ...sources.filter((s) => !sourceShortcuts.includes(s))].map((s) => {
          const active = sources.includes(s);
          return (
            <Pressable key={s} onPress={() => toggleSource(s)} style={[styles.src, { backgroundColor: active ? c.secondary : c.surface, borderColor: active ? c.secondary : c.border }]}>
              <Ionicons name={active ? 'bookmark' : 'bookmark-outline'} size={18} color={active ? c.primaryDark : c.textMuted} />
              <Text style={{ color: active ? c.primaryDark : c.text, fontSize: 16, fontWeight: '700' }}>{s}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <BigInput value={customSource} onChangeText={setCustomSource} placeholder="Autre source, ex. : Souccah 11b" style={{ flex: 1 }} />
        <BigButton label="Ajouter" onPress={addCustom} color={c.primaryLight} textColor={c.primary} style={{ paddingHorizontal: 18 }} />
      </View>

      <View style={{ marginTop: 26 }}>
        <BigButton
          label="Publier la réponse"
          icon="send"
          disabled={text.trim().length < 10}
          onPress={() => {
            answerQuestion(q.id, text.trim(), sources);
            setDone(true);
          }}
        />
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  src: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2 },
});
