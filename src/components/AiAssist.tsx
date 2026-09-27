import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { improveText } from '../utils/ai';

export const CHATGPT_GREEN = '#10A37F';

interface Props {
  text: string;
  onAccept: (improved: string) => void;
  label?: string;
}

// Bouton « Corriger et réécrire avec ChatGPT » + carte de proposition à accepter ou refuser.
export function AiAssist({ text, onAccept, label = 'Corriger et réécrire avec ChatGPT' }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<{ text: string; changes: string[] } | null>(null);
  const [accepted, setAccepted] = useState(false);

  const run = () => {
    if (!text.trim()) return;
    setLoading(true);
    setAccepted(false);
    setTimeout(() => {
      setProposal(improveText(text));
      setLoading(false);
    }, 1200);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Pressable
        onPress={run}
        disabled={loading || !text.trim()}
        style={({ pressed }) => [styles.btn, { backgroundColor: CHATGPT_GREEN, opacity: !text.trim() ? 0.5 : pressed ? 0.85 : 1 }]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <MaterialCommunityIcons name="creation" size={24} color="#fff" />}
        <Text style={styles.btnTxt}>{loading ? 'ChatGPT relit votre texte…' : label}</Text>
      </Pressable>

      {proposal && !accepted ? (
        <View style={[styles.card, { borderColor: CHATGPT_GREEN, backgroundColor: c.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="creation" size={20} color={CHATGPT_GREEN} />
            <Text style={{ color: CHATGPT_GREEN, fontWeight: '800', fontSize: 16 }}>Version proposée par ChatGPT</Text>
          </View>
          <View style={{ marginTop: 8, gap: 2 }}>
            {proposal.changes.map((ch) => (
              <View key={ch} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark" size={16} color={CHATGPT_GREEN} />
                <Text style={{ color: c.textMuted, fontSize: 14 }}>{ch}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.proposal, { color: c.text, borderColor: c.border }]}>{proposal.text}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable
              onPress={() => {
                onAccept(proposal.text);
                setAccepted(true);
              }}
              style={[styles.choice, { backgroundColor: CHATGPT_GREEN }]}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Utiliser cette version</Text>
            </Pressable>
            <Pressable onPress={() => setProposal(null)} style={[styles.choice, { backgroundColor: c.background, borderWidth: 1, borderColor: c.border }]}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>Garder la mienne</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {accepted ? (
        <View style={[styles.done, { backgroundColor: CHATGPT_GREEN + '22' }]}>
          <Ionicons name="checkmark-circle" size={20} color={CHATGPT_GREEN} />
          <Text style={{ color: CHATGPT_GREEN, fontWeight: '700', fontSize: 15 }}>Texte corrigé par ChatGPT appliqué</Text>
        </View>
      ) : null}
    </View>
  );
}

// Bandeau d'information réutilisable.
export function AiBanner({ compact }: { compact?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.banner, { backgroundColor: CHATGPT_GREEN + '18', borderColor: CHATGPT_GREEN }]}>
      <MaterialCommunityIcons name="creation" size={compact ? 22 : 30} color={CHATGPT_GREEN} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontWeight: '800', fontSize: compact ? 15 : 17 }}>Tous vos textes peuvent être corrigés et réécrits par ChatGPT</Text>
        {!compact ? (
          <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 4 }}>
            Écrivez comme vous parlez. Un bouton vert relit l’orthographe, la ponctuation et la clarté. Vous gardez toujours le dernier mot.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 17 },
  card: { borderWidth: 2, borderRadius: 14, padding: 14, marginTop: 12 },
  proposal: { fontSize: 16, lineHeight: 25, marginTop: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 12 },
  choice: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 10 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
});
