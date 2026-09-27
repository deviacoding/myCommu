import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { RavScreen, BigButton, RavCard, BIG } from './RavUi';
import { money, formatNumeric, daysBetween, parseISODate } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavCollect'>;

export function RavCollectScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { pledges, removePledge, updatePledgeNote, sendReminder } = useAppState();
  const [reminded, setReminded] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Du plus grand au plus petit montant.
  const due = pledges.filter((p) => p.status === 'due').sort((a, b) => b.amount - a.amount);
  const paid = pledges.filter((p) => p.status === 'paid');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);

  const remind = (id: string, who: string, what: string, amt: number) => {
    sendReminder(id);
    setReminded(`Notification push envoyée à ${who} : « Rappel : ${what}, ${money(amt)} ».`);
    setTimeout(() => setReminded(null), 4000);
  };

  return (
    <RavScreen title="Dons à récupérer" subtitle={`${due.length} en attente · ${money(dueTotal)}`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 12 }}>
        Classés du plus grand au plus petit. Notez où vous en êtes, et envoyez un rappel sur le téléphone du fidèle.
      </Text>

      {reminded ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="notifications" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{reminded}</Text>
        </View>
      ) : null}

      {due.length === 0 ? (
        <RavCard style={{ alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={40} color={c.success} />
          <Text style={{ color: c.text, fontSize: BIG.text, fontWeight: '700', marginTop: 8 }}>Tout est encaissé</Text>
        </RavCard>
      ) : null}

      {due.map((p, i) => {
        const late = daysBetween(parseISODate(p.dueDate), new Date()) > 0;
        const who = p.member ?? 'Fidèle';
        return (
          <RavCard key={p.id} style={{ borderWidth: 2, borderColor: i === 0 ? c.danger : c.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.rank, { backgroundColor: i === 0 ? c.danger : c.primaryLight }]}>
                <Text style={{ color: i === 0 ? '#fff' : c.primary, fontWeight: '900', fontSize: 18 }}>{i + 1}</Text>
              </View>
              <Avatar name={who} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{who}</Text>
                <Text style={{ color: c.textMuted, fontSize: BIG.small }}>
                  {p.label} · {p.origin}
                </Text>
                <Text style={{ color: late ? c.danger : c.textMuted, fontSize: 15, fontWeight: late ? '800' : '400', marginTop: 2 }}>
                  {late ? 'En retard · ' : ''}échéance {formatNumeric(p.dueDate)}
                  {p.lastReminder ? ` · dernier rappel ${formatNumeric(p.lastReminder)}` : ' · jamais rappelé'}
                </Text>
              </View>
              <Text style={{ color: c.text, fontSize: 26, fontWeight: '900' }}>{money(p.amount)}</Text>
            </View>

            <View style={[styles.noteWrap, { borderColor: c.border, backgroundColor: c.background }]}>
              <Ionicons name="create-outline" size={20} color={c.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                value={p.note ?? ''}
                onChangeText={(v) => updatePledgeNote(p.id, v)}
                placeholder="Où en est-on ? Ex. : a promis de payer après Chabbat…"
                placeholderTextColor={c.textMuted}
                multiline
                style={[styles.note, { color: c.text }]}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => remind(p.id, who, p.label, p.amount)} style={({ pressed }) => [styles.remind, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
                <Ionicons name="notifications" size={24} color={c.textOnPrimary} />
                <Text style={{ color: c.textOnPrimary, fontSize: 17, fontWeight: '800' }}>Envoyer un rappel push</Text>
              </Pressable>
              {confirmId === p.id ? (
                <Pressable onPress={() => { removePledge(p.id); setConfirmId(null); }} style={[styles.trash, { backgroundColor: c.danger, width: undefined, paddingHorizontal: 12 }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setConfirmId(p.id)} hitSlop={8} style={[styles.trash, { backgroundColor: c.danger + '18' }]}>
                  <Ionicons name="trash" size={22} color={c.danger} />
                </Pressable>
              )}
            </View>
          </RavCard>
        );
      })}

      <View style={{ marginTop: 10 }}>
        <BigButton label="Enregistrer un nouveau don" icon="add-circle" color={c.primaryLight} textColor={c.primary} onPress={() => navigation.replace('RavRecordDonation')} />
      </View>

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 30, marginBottom: 10 }}>Réglés ({paid.length})</Text>
      {paid.map((p) => (
        <RavCard key={p.id} style={{ opacity: 0.7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="checkmark-circle" size={28} color={c.success} />
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', flex: 1 }}>
              {p.member ?? 'Fidèle'} · {p.label}
            </Text>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{money(p.amount)}</Text>
          </View>
        </RavCard>
      ))}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 12 },
  rank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  noteWrap: { flexDirection: 'row', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 10, marginTop: 12 },
  note: { flex: 1, fontSize: 16, lineHeight: 22, minHeight: 44, padding: 0 },
  remind: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, minHeight: 56 },
  trash: { width: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
