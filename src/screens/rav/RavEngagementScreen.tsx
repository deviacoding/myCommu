import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { brackets, DAILY_POINTS, RULES } from '../../config/gamification';
import { money, todayISO } from '../../utils/time';
import { RavScreen, RavCard, BigChoice, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavEngagement'>;
type Period = 'month' | 'year';

// Vue réservée au responsable : qui est présent, qui donne. Jamais affichée aux fidèles.
export function RavEngagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { communityActivity, donations, members, seed, congregation, backendMode } = useAppState();
  const [period, setPeriod] = useState<Period>('month');
  const today = todayISO();
  const since = period === 'month' ? today.slice(0, 7) + '-01' : today.slice(0, 4) + '-01-01';
  const b = brackets(seed.currency);

  const nameOf = (uid: string) => members.find((m) => m.id === uid)?.name ?? (backendMode === 'demo' ? seed.user.name : 'Fidèle');

  // Assiduité : points des actions quotidiennes sur la période, par fidèle.
  const assiduous = useMemo(() => {
    const map = new Map<string, { points: number; days: Set<string> }>();
    for (const e of communityActivity) {
      if (e.date < since) continue;
      const cur = map.get(e.uid) ?? { points: 0, days: new Set<string>() };
      cur.points += DAILY_POINTS[e.type];
      if (e.type === 'open') cur.days.add(e.date);
      map.set(e.uid, cur);
    }
    return [...map.entries()].map(([uid, v]) => ({ uid, points: v.points, days: v.days.size })).sort((a, b2) => b2.points - a.points).slice(0, 10);
  }, [communityActivity, since]);

  // Générosité : dons confirmés sur la période, par donateur.
  const generous = useMemo(() => {
    const map = new Map<string, { amount: number; points: number; count: number }>();
    for (const d of donations) {
      // En démo, les dons n'ont pas de communauté : on les prend tous.
      if (d.date < since || (backendMode === 'firebase' && d.congregationId !== congregation.id)) continue;
      const key = d.uid ?? d.dedication ?? 'inconnu';
      const cur = map.get(key) ?? { amount: 0, points: 0, count: 0 };
      cur.amount += d.amount;
      cur.count += 1;
      cur.points += d.type === 'maasser' ? Math.floor(d.amount / b.tithe) * RULES.tithePerBracket : Math.floor(d.amount / b.alms) * RULES.almsPerBracket;
      map.set(key, cur);
    }
    return [...map.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b2) => b2.amount - a.amount).slice(0, 10);
  }, [donations, since, congregation.id, b]);

  return (
    <RavScreen title="Fidèles engagés" subtitle="Visible par vous seul · pour remercier, appeler, encourager" onBack={() => navigation.goBack()}>
      <BigChoice<Period> options={[{ value: 'month', label: 'Ce mois' }, { value: 'year', label: 'Cette année' }]} value={period} onChange={setPeriod} />

      <Text style={[styles.section, { color: c.text }]}>Les plus assidus</Text>
      {assiduous.length === 0 ? (
        <EmptyState compact icon="calendar-outline" title="Aucune présence enregistrée sur la période" hint="Les points d’assiduité se comptent dès que vos fidèles ouvrent l’application." />
      ) : (
        assiduous.map((a, i) => (
          <RavCard key={a.uid} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Rank i={i} />
            <Avatar name={nameOf(a.uid)} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{nameOf(a.uid)}</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{a.days} jour{a.days > 1 ? 's' : ''} de présence · {a.points} pts</Text>
            </View>
            <MaterialCommunityIcons name="calendar-check" size={22} color={c.primary} />
          </RavCard>
        ))
      )}

      <Text style={[styles.section, { color: c.text, marginTop: 20 }]}>Les plus généreux</Text>
      {generous.length === 0 ? (
        <EmptyState compact icon="heart-outline" title="Aucun don sur la période" hint="Les dons confirmés (en ligne ou enregistrés par le trésorier) apparaîtront ici." />
      ) : (
        generous.map((g, i) => (
          <RavCard key={g.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Rank i={i} />
            <Avatar name={nameOf(g.key)} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{nameOf(g.key)}</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{money(g.amount)} · {g.count} don{g.count > 1 ? 's' : ''} · {g.points} pts</Text>
            </View>
            <MaterialCommunityIcons name="hand-heart" size={22} color={c.secondary} />
          </RavCard>
        ))
      )}

      <View style={[styles.note, { backgroundColor: c.primaryLight }]}>
        <Ionicons name="lock-closed" size={18} color={c.primary} />
        <Text style={{ color: c.primary, fontSize: 13, flex: 1 }}>Ces listes ne sont jamais montrées aux fidèles. Chacun ne voit que son propre ora.</Text>
      </View>
    </RavScreen>
  );
}

function Rank({ i }: { i: number }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const medal = i === 0 ? '#D4A017' : i === 1 ? '#9CA3AF' : i === 2 ? '#B87333' : c.border;
  return (
    <View style={[styles.rank, { backgroundColor: medal }]}>
      <Text style={{ color: '#fff', fontWeight: '900' }}>{i + 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: BIG.label, fontWeight: '900', marginTop: 14, marginBottom: 8 },
  rank: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 18 },
});
