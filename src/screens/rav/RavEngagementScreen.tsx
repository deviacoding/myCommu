import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { DAILY_POINTS, donationPoints, donorTier, isoDaysAgo } from '../../config/gamification';
import { ReactionComposer } from '../../components/ReactionComposer';
import { DonorChip } from '../../components/DonorChip';
import { money, todayISO } from '../../utils/time';
import { RavScreen, RavCard, BigChoice, BIG } from './RavUi';

type Props = NativeStackScreenProps<RavStackParamList, 'RavEngagement'>;
type Period = 'month' | 'year' | 'feed';

interface FeedItem { key: string; date: string; uid: string; name: string; title: string; sub: string; icon: string; color: string; about: string; tier?: ReturnType<typeof donorTier> }

// Vue réservée au responsable : qui est présent, qui donne. Jamais affichée aux fidèles.
export function RavEngagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { communityActivity, donations, members, seed, congregation, backendMode, scores, league } = useAppState();
  const [period, setPeriod] = useState<Period>('month');
  const [reacting, setReacting] = useState<string | null>(null);
  const today = todayISO();
  const since = period === 'month' ? today.slice(0, 7) + '-01' : today.slice(0, 4) + '-01-01';
  const since12m = isoDaysAgo(today, 365);
  const congDonations = donations.filter((d) => backendMode !== 'firebase' || d.congregationId === congregation.id);
  // Total sur 12 mois par donateur : le palier (petit, régulier, grand, pilier) se lit d'un coup d'œil.
  const given12m = (key: string) => congDonations.filter((d) => d.date >= since12m && (d.uid ?? d.dedication ?? 'inconnu') === key).reduce((s, d) => s + d.amount, 0);
  const tierOf = (key: string) => donorTier(given12m(key), seed.currency);

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
      cur.points += donationPoints(d, seed.currency);
      map.set(key, cur);
    }
    return [...map.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b2) => b2.amount - a.amount).slice(0, 10);
  }, [donations, since, congregation.id, seed.currency, backendMode]);

  // Fil : les 30 derniers jours, du plus récent au plus ancien (dons, séries, badges, ligue), à saluer d'un geste.
  const feed = useMemo<FeedItem[]>(() => {
    const since30 = isoDaysAgo(today, 30);
    const items: FeedItem[] = [];
    for (const d of congDonations) {
      if (d.date < since30) continue;
      const key = d.uid ?? d.dedication ?? 'inconnu';
      const name = nameOf(key);
      const kind = d.streakRepair ? 'Rachat de série' : d.type === 'maasser' ? seed.tithe?.name ?? 'Maasser' : d.type === 'engagement' ? 'Promesse réglée' : seed.alms.name;
      items.push({ key: 'd' + d.id, date: d.date, uid: key, name, title: `${name} · ${kind}`, sub: `${money(d.amount)} · ${d.cause}`, icon: d.type === 'maasser' ? 'percent-circle' : 'hand-heart', color: d.type === 'maasser' ? '#D4A017' : '#F59E0B', about: `votre ${kind.toLowerCase()} de ${money(d.amount)}`, tier: tierOf(key) });
    }
    for (const s of scores) {
      const date = s.updatedAt ? s.updatedAt.slice(0, 10) : today;
      if ((s.streakDays ?? 0) >= 7) items.push({ key: 's' + s.uid, date, uid: s.uid, name: s.name, title: `${s.name} · ${s.streakDays} jours de série`, sub: 'Présence régulière dans l’application', icon: 'fire', color: '#EA580C', about: `votre série de ${s.streakDays} jours` });
      if ((s.badges ?? 0) >= 5) items.push({ key: 'b' + s.uid, date, uid: s.uid, name: s.name, title: `${s.name} · ${s.badges} badges`, sub: `Niveau ${s.level}`, icon: 'medal', color: '#7C3AED', about: `vos ${s.badges} badges` });
    }
    league.ranking.slice(0, 3).forEach((r, i) => {
      const left = league.period.daysLeft;
      items.push({ key: 'l' + r.uid, date: today, uid: r.uid, name: r.name, title: `${i + 1}${i === 0 ? 'er' : 'e'} de la ligue · ${r.name}`, sub: `${r.points} pts sur la quinzaine · ${left} jour${left > 1 ? 's' : ''} restant${left > 1 ? 's' : ''}`, icon: 'trophy', color: i === 0 ? '#D4A017' : i === 1 ? '#9CA3AF' : '#B87333', about: 'votre place dans la ligue' });
    });
    return items.sort((a, b2) => b2.date.localeCompare(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [congDonations, scores, league, today, seed.currency]);

  return (
    <RavScreen title="Fidèles engagés" subtitle="Visible par vous seul · pour remercier, appeler, encourager" onBack={() => navigation.goBack()}>
      <BigChoice<Period> options={[{ value: 'month', label: 'Ce mois' }, { value: 'year', label: 'Cette année' }, { value: 'feed', label: 'Fil' }]} value={period} onChange={setPeriod} />

      {period === 'feed' ? (
        <>
          <Text style={[styles.section, { color: c.text }]}>Ces 30 derniers jours</Text>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 10 }}>Un like, un mot, un audio ou une vidéo de 5 secondes : le fidèle le reçoit dans sa messagerie.</Text>
          {feed.length === 0 ? (
            <EmptyState icon="newspaper-outline" title="Rien à signaler pour l’instant" hint="Les dons, les séries et les badges de vos fidèles apparaîtront ici." />
          ) : (
            feed.map((it) => (
              <RavCard key={it.key}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.feedIcon, { backgroundColor: it.color + '22' }]}>
                    <MaterialCommunityIcons name={it.icon as never} size={26} color={it.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{it.title}</Text>
                    <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{it.sub} · {it.date}</Text>
                    {it.tier ? <DonorChip tier={it.tier} style={{ marginTop: 6 }} /> : null}
                  </View>
                  <Pressable onPress={() => setReacting(reacting === it.key ? null : it.key)} style={[styles.react, { backgroundColor: reacting === it.key ? c.primary : c.primaryLight }]}>
                    <Ionicons name="heart" size={20} color={reacting === it.key ? c.textOnPrimary : c.primary} />
                    <Text style={{ color: reacting === it.key ? c.textOnPrimary : c.primary, fontWeight: '800', fontSize: 16 }}>Réagir</Text>
                  </Pressable>
                </View>
                {reacting === it.key ? <ReactionComposer memberUid={it.uid} memberName={it.name} about={it.about} onDone={() => setReacting(null)} /> : null}
              </RavCard>
            ))
          )}
        </>
      ) : null}

      {period !== 'feed' ? (<>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>{nameOf(g.key)}</Text>
                {tierOf(g.key) ? <DonorChip tier={tierOf(g.key)!} /> : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{money(g.amount)} · {g.count} don{g.count > 1 ? 's' : ''} · {g.points} pts</Text>
            </View>
            <MaterialCommunityIcons name="hand-heart" size={22} color={c.secondary} />
          </RavCard>
        ))
      )}

      </>) : null}

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
  feedIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  react: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 18 },
});
