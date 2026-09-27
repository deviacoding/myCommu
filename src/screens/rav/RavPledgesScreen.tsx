import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { RavScreen, BigLabel, BigInput, BigButton, RavCard, BIG } from './RavUi';
import { money, formatNumeric, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavPledges'>;

const presets: { label: string; amount: number; origin: string }[] = [
  { label: 'Chéni', amount: 104, origin: 'Montée à la Torah (2e montée)' },
  { label: 'Chlichi', amount: 104, origin: 'Montée à la Torah (3e montée)' },
  { label: 'Maftir', amount: 180, origin: 'Montée à la Torah (Maftir)' },
  { label: 'Nédava', amount: 52, origin: 'Promesse de don faite à la synagogue' },
  { label: 'Chaise à l’année', amount: 350, origin: 'Place réservée à la synagogue pour l’année' },
  { label: 'Cotisation annuelle', amount: 360, origin: 'Adhésion à la communauté' },
];

const members = ['David Cohen', 'Sarah Levy', 'Yossef Benhamou', 'Myriam Kalfon', 'Réouven Amar'];

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

export function RavPledgesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { pledges, addPledge, removePledge, donations } = useAppState();
  const [member, setMember] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [origin, setOrigin] = useState('');
  const [added, setAdded] = useState<string | null>(null);

  const due = pledges.filter((p) => p.status === 'due');
  const paid = pledges.filter((p) => p.status === 'paid');
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);
  const monthTotal = donations.filter((d) => d.date.startsWith(todayISO().slice(0, 7))).reduce((s, d) => s + d.amount, 0);
  const amountNum = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const canAdd = member.trim().length > 1 && label.trim().length > 1 && amountNum > 0;

  const submit = () => {
    addPledge({ member: member.trim(), label: label.trim(), amount: amountNum, dueDate: plusDays(30), origin: origin.trim() || 'Engagement enregistré par le Rav' });
    setAdded(`${label.trim()} · ${money(amountNum)} pour ${member.trim()}`);
    setLabel('');
    setAmount('');
    setOrigin('');
  };

  return (
    <RavScreen title="Dons et engagements" subtitle={`${money(dueTotal)} à encaisser · ${money(monthTotal)} reçus ce mois`} onBack={() => navigation.goBack()}>
      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800' }}>Enregistrer un engagement</Text>
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 4 }}>
        Après une montée à la Torah ou une promesse, notez-la ici : le fidèle la retrouve dans « À payer » et peut régler depuis son téléphone.
      </Text>

      <BigLabel>1. Qui ?</BigLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {members.map((m) => (
          <Pressable key={m} onPress={() => setMember(m)} style={[styles.chip, { backgroundColor: member === m ? c.primary : c.surface, borderColor: member === m ? c.primary : c.border }]}>
            <Text style={{ color: member === m ? c.textOnPrimary : c.text, fontSize: 16, fontWeight: '700' }}>{m}</Text>
          </Pressable>
        ))}
      </View>
      <BigInput value={member} onChangeText={setMember} placeholder="Ou tapez un nom" />

      <BigLabel hint="Touchez un modèle : le montant habituel se remplit tout seul, vous pouvez le changer.">2. Quoi ?</BigLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {presets.map((p) => (
          <Pressable
            key={p.label}
            onPress={() => {
              setLabel(p.label);
              setAmount(String(p.amount));
              setOrigin(p.origin);
            }}
            style={[styles.chip, { backgroundColor: label === p.label ? c.secondary : c.surface, borderColor: label === p.label ? c.secondary : c.border }]}
          >
            <Text style={{ color: label === p.label ? c.primaryDark : c.text, fontSize: 16, fontWeight: '700' }}>
              {p.label} · {p.amount} ₪
            </Text>
          </Pressable>
        ))}
      </View>
      <BigInput value={label} onChangeText={setLabel} placeholder="Ou décrivez l’engagement" />

      <BigLabel>3. Montant en shekels</BigLabel>
      <BigInput value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="104" />

      <View style={{ marginTop: 22 }}>
        <BigButton label={canAdd ? `Enregistrer ${money(amountNum)} pour ${member.trim()}` : 'Enregistrer l’engagement'} icon="checkmark-circle" disabled={!canAdd} onPress={submit} />
      </View>
      {added ? (
        <View style={[styles.ok, { backgroundColor: c.success + '22' }]}>
          <Ionicons name="checkmark-circle" size={24} color={c.success} />
          <Text style={{ color: c.success, fontSize: BIG.small, fontWeight: '800', flex: 1 }}>{added}. Le fidèle le voit dans « À payer ».</Text>
        </View>
      ) : null}

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 30, marginBottom: 10 }}>À encaisser ({due.length})</Text>
      {due.map((p) => (
        <RavCard key={p.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>{p.member ?? 'Fidèle'} · {p.label}</Text>
              <Text style={{ color: c.textMuted, fontSize: 15, marginTop: 3 }}>{p.origin} · échéance {formatNumeric(p.dueDate)}</Text>
            </View>
            <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>{money(p.amount)}</Text>
            <Pressable onPress={() => removePledge(p.id)} hitSlop={8} style={[styles.trash, { backgroundColor: c.danger + '18' }]}>
              <Ionicons name="trash" size={22} color={c.danger} />
            </Pressable>
          </View>
        </RavCard>
      ))}

      <Text style={{ color: c.text, fontSize: BIG.label, fontWeight: '800', marginTop: 24, marginBottom: 10 }}>Réglés ({paid.length})</Text>
      {paid.map((p) => (
        <RavCard key={p.id} style={{ opacity: 0.7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="checkmark-circle" size={28} color={c.success} />
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', flex: 1 }}>{p.member ?? 'Fidèle'} · {p.label}</Text>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{money(p.amount)}</Text>
          </View>
        </RavCard>
      ))}
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, minHeight: 50, justifyContent: 'center' },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 12 },
  trash: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
