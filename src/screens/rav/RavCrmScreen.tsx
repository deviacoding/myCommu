import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { DonorChip } from '../../components/DonorChip';
import { ProgressBar } from '../../components/ProgressBar';
import { ReactionComposer } from '../../components/ReactionComposer';
import { EmptyState } from '../../components/EmptyState';
import { daysUntil, useDateTypeMeta } from '../../components/MyDates';
import { donorTier, isoDaysAgo } from '../../config/gamification';
import { can } from '../../config/roles';
import { capitalize, formatLong, formatShort, money, todayISO } from '../../utils/time';
import { ActivityEvent, Donation } from '../../types';
import { useRavFeed, useRavRole } from './useRavFeed';

type Props = NativeStackScreenProps<RavStackParamList, 'RavCrm'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type Section = 'dashboard' | 'members' | 'donations' | 'agenda' | 'questions';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`;

// Démo : une activité plausible pour chaque fidèle de la démo (en base, c'est la vraie activité de la communauté).
function demoCommunityActivity(uids: string[], today: string): ActivityEvent[] {
  const out: ActivityEvent[] = [];
  uids.forEach((uid, i) => {
    for (let d = 0; d < 30; d++) {
      if ((d + i) % (2 + (i % 3)) === 0) continue; // chacun son rythme
      const date = isoDaysAgo(today, d);
      out.push({ id: `${uid}_${date}_open`, uid, type: 'open', date });
      if ((d + i) % 2 === 0) out.push({ id: `${uid}_${date}_schedule`, uid, type: 'schedule', date });
      if ((d * 3 + i) % 5 === 0) out.push({ id: `${uid}_${date}_course`, uid, type: 'course', date });
      if ((d + i * 2) % 4 === 0) out.push({ id: `${uid}_${date}_agenda`, uid, type: 'agenda', date });
    }
  });
  return out;
}

// Vue CRM : le tableau de bord complet du responsable. Sur ordinateur, les onglets sont à gauche comme dans un vrai
// logiciel de gestion ; sur téléphone, ils passent en haut. Tout est calculé depuis les données déjà en base.
export function RavCrmScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { rtl } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const role = useRavRole();
  const { congDonations, toThank, donorName, tierOf, kindOf } = useRavFeed();
  const { congregation, members, seed, backendMode, communityActivity, scores, myQuestions, myAgenda, myMemberDates, myPledges, myCourses, funds, campaigns, campaignProgress, league, sendReminder } = useAppState();
  const dateTypeMeta = useDateTypeMeta();
  const [section, setSection] = useState<Section>('dashboard');
  const [search, setSearch] = useState('');
  const [writing, setWriting] = useState<string | null>(null);
  const [reminded, setReminded] = useState<string | null>(null);
  const today = todayISO();
  const month = today.slice(0, 7);
  const since30 = isoDaysAgo(today, 30);
  const since7 = isoDaysAgo(today, 7);
  const since12m = isoDaysAgo(today, 365);

  const activity = useMemo(() => (backendMode === 'demo' ? demoCommunityActivity(members.map((m) => m.id), today) : communityActivity), [backendMode, members, communityActivity, today]);
  const questions = myQuestions.filter((q) => q.kind !== 'message');
  const pending = questions.filter((q) => q.status === 'pending');
  const answered = questions.filter((q) => q.status === 'answered');
  const memberCount = Math.max(congregation.members, members.length);
  const monthDonations = congDonations.filter((d) => d.date.slice(0, 7) === month);
  const sum = (list: Donation[]) => list.reduce((s, d) => s + d.amount, 0);
  const count = (type: ActivityEvent['type'], since?: string) => activity.filter((e) => e.type === type && (!since || e.date >= since)).length;
  const activeUids = (since: string) => new Set(activity.filter((e) => e.type === 'open' && e.date >= since).map((e) => e.uid)).size;
  const duePledges = myPledges.filter((p) => p.status === 'due');
  const upcoming = [...myAgenda].filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...myMemberDates].sort((a, b) => daysUntil(a) - daysUntil(b));
  const datesWeek = dates.filter((d) => daysUntil(d) <= 7);

  // Dons des 6 derniers mois : une seule série, étiquettes directes, pas de légende.
  const months = useMemo(() => {
    const out: { ym: string; amount: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 - i, 1);
      const ym = todayISO(d).slice(0, 7);
      const list = congDonations.filter((x) => x.date.slice(0, 7) === ym);
      out.push({ ym, amount: sum(list), count: list.length });
    }
    return out;
  }, [congDonations, month]);
  const maxMonth = Math.max(1, ...months.map((m) => m.amount));

  const byType = [
    { label: seed.alms.name, amount: sum(congDonations.filter((d) => d.type === 'tsedaka')), color: '#F59E0B' },
    { label: seed.tithe?.name ?? 'Maasser', amount: sum(congDonations.filter((d) => d.type === 'maasser')), color: '#D4A017' },
    { label: 'Promesses réglées', amount: sum(congDonations.filter((d) => d.type === 'engagement')), color: '#BE123C' },
  ].filter((t) => t.amount > 0);
  const maxType = Math.max(1, ...byType.map((t) => t.amount));

  // Fiche de chaque fidèle : dons, présence, série, dates. C'est le cœur du CRM : connaître chacun.
  const people = useMemo(() => {
    // Démo : les dons sans uid sont ceux du fidèle de démo, le premier de la liste.
    const keyOf = (d: Donation) => d.uid ?? (backendMode === 'demo' ? members[0]?.id : d.dedication) ?? 'inconnu';
    const list = members.map((m) => {
      const mine = congDonations.filter((d) => keyOf(d) === m.id);
      const given12m = sum(mine.filter((d) => d.date >= since12m));
      const last = mine.map((d) => d.date).sort().pop();
      const presence = new Set(activity.filter((e) => e.uid === m.id && e.type === 'open' && e.date >= since30).map((e) => e.date)).size;
      const lastSeen = activity.filter((e) => e.uid === m.id).map((e) => e.date).sort().pop();
      const score = scores.find((s) => s.uid === m.id);
      const myDates = myMemberDates.filter((d) => d.uid === m.id || d.member === m.name);
      const openQuestions = pending.filter((q) => q.askerUid === m.id).length;
      return { id: m.id, name: m.name, given12m, total: sum(mine), donations: mine.length, last, presence, lastSeen, streak: score?.streakDays ?? 0, tier: donorTier(given12m, seed.currency), dates: myDates, openQuestions };
    });
    return list.sort((a, b) => b.given12m - a.given12m || b.presence - a.presence);
  }, [members, congDonations, activity, scores, myMemberDates, pending, since12m, since30, seed.currency, backendMode]);
  // Classement des donateurs sur une liste de dons : calculé sur les dons eux-mêmes (un donateur peut ne pas avoir de fiche).
  const rankDonors = (list: Donation[]) => {
    const map = new Map<string, { amount: number; count: number; sample: Donation }>();
    for (const d of list) {
      const key = d.uid ?? d.dedication ?? 'inconnu';
      const cur = map.get(key) ?? { amount: 0, count: 0, sample: d };
      cur.amount += d.amount;
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.entries()].map(([key, v]) => ({ id: key, name: donorName(v.sample), amount: v.amount, count: v.count, tier: tierOf(v.sample) })).sort((a, b) => b.amount - a.amount);
  };
  // Donateur du mois : celui qui a donné le plus ce mois-ci (tous types de dons) ; podium sur 12 mois.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const donorOfMonth = useMemo(() => rankDonors(monthDonations)[0] ?? null, [monthDonations.length, congDonations]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const topDonors = useMemo(() => rankDonors(congDonations.filter((d) => d.date >= since12m)).slice(0, 3), [congDonations, since12m]);
  const shown = people.filter((p) => !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const fading = people.filter((p) => p.lastSeen && p.lastSeen < isoDaysAgo(today, 14) && p.presence > 0).length;

  const nav: { key: Section; label: string; icon: IoniconName; count?: number; show: boolean }[] = [
    { key: 'dashboard', label: 'Tableau de bord', icon: 'speedometer', show: true },
    { key: 'members', label: 'Fidèles', icon: 'people', count: memberCount, show: can(role, 'answers') || can(role, 'donations') },
    { key: 'donations', label: 'Dons', icon: 'cash', count: duePledges.length || undefined, show: can(role, 'donations') },
    { key: 'agenda', label: 'Agenda & dates', icon: 'calendar', count: datesWeek.length || undefined, show: can(role, 'agenda') || can(role, 'dates') },
    { key: 'questions', label: 'Questions', icon: 'chatbubbles', count: pending.length || undefined, show: can(role, 'answers') },
  ];
  const tabs = nav.filter((n) => n.show);

  const kpis: { label: string; value: string; sub: string; icon: IoniconName; color: string; go?: Section }[] = [
    { label: 'Fidèles', value: String(memberCount), sub: `${activeUids(since7)} actifs ces 7 jours`, icon: 'people', color: c.primary, go: 'members' },
    { label: 'Dons ce mois', value: money(sum(monthDonations)), sub: `${monthDonations.length} don${monthDonations.length > 1 ? 's' : ''}`, icon: 'cash', color: '#BE123C', go: 'donations' },
    { label: 'Dons depuis le début', value: money(sum(congDonations)), sub: `${congDonations.length} don${congDonations.length > 1 ? 's' : ''} · ${new Set(congDonations.map((d) => d.uid ?? d.dedication)).size} donateurs`, icon: 'wallet', color: '#B45309', go: 'donations' },
    { label: 'Cours lus (30 j)', value: String(count('course', since30)), sub: `${myCourses.length} cours publiés`, icon: 'book', color: '#7C3AED' },
    { label: 'Horaires consultés (30 j)', value: String(count('schedule', since30)), sub: `${count('agenda', since30)} consultations de l’agenda`, icon: 'time', color: '#0F766E' },
    { label: 'Questions répondues', value: String(answered.length), sub: `${questions.length} questions au total`, icon: 'checkmark-done', color: '#059669', go: 'questions' },
    { label: 'Questions sans réponse', value: String(pending.length), sub: pending.length ? 'À traiter' : 'Tout est répondu', icon: 'help-circle', color: pending.length ? c.danger : '#059669', go: 'questions' },
    { label: 'Promesses à relancer', value: String(duePledges.length), sub: money(duePledges.reduce((s, p) => s + p.amount, 0)), icon: 'alarm', color: '#DB2777', go: 'donations' },
    { label: 'Dates des fidèles (7 j)', value: String(datesWeek.length), sub: `${dates.filter((d) => d.type === 'azkara').length} ${dateTypeMeta.azkara.label.toLowerCase()}s suivies`, icon: 'calendar-number', color: '#4B5563', go: 'agenda' },
    { label: 'Fidèles qui s’éloignent', value: String(fading), sub: 'Pas ouvert l’app depuis 14 jours', icon: 'walk', color: '#EA580C', go: 'members' },
  ];

  const chevron: IoniconName = rtl ? 'chevron-back' : 'chevron-forward';

  const EventRows = ({ limit }: { limit?: number }) =>
    upcoming.length === 0 ? (
      <EmptyState compact icon="calendar-outline" title="Aucun événement à venir" />
    ) : (
      <Card>
        {(limit ? upcoming.slice(0, limit) : upcoming).map((e, i) => (
          <View key={e.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
            <View style={[styles.dateBox, { backgroundColor: c.primaryLight }]}>
              <Text style={{ color: c.primary, fontWeight: '900', fontSize: 16 }}>{e.date.slice(8, 10)}</Text>
              <Text style={{ color: c.primary, fontSize: 11, fontWeight: '700' }}>{MONTHS[Number(e.date.slice(5, 7)) - 1]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{e.title}</Text>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>{e.time} · {e.place}</Text>
            </View>
          </View>
        ))}
      </Card>
    );

  const DateRows = ({ list }: { list: typeof dates }) =>
    list.length === 0 ? (
      <EmptyState compact icon="calendar-outline" title="Aucune date enregistrée" hint="Anniversaires et souvenirs de vos fidèles : un mot au bon moment crée le lien." />
    ) : (
      <Card>
        {list.map((d, i) => {
          const meta = dateTypeMeta[d.type];
          const n = daysUntil(d);
          return (
            <View key={d.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
              <View style={[styles.iconBox, { backgroundColor: meta.color + '22' }]}>
                <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{d.member} · {d.label}</Text>
                <Text style={{ color: c.textMuted, fontSize: 13 }}>{capitalize(formatLong(d.date))}{d.hebrewDate ? ` · ${d.hebrewDate}` : ''} · {meta.label}</Text>
              </View>
              <Text style={{ color: n <= 7 ? meta.color : c.primary, fontWeight: '900', fontSize: 13 }}>{n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : `J-${n}`}</Text>
            </View>
          );
        })}
      </Card>
    );

  const Bars = ({ rows, max }: { rows: { label: string; amount: number; sub?: string; color?: string }[]; max: number }) => (
    <Card>
      {rows.map((r) => (
        <View key={r.label} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>{r.label}{r.sub ? <Text style={{ color: c.textMuted, fontWeight: '400' }}> · {r.sub}</Text> : null}</Text>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 14 }}>{money(r.amount)}</Text>
          </View>
          <ProgressBar progress={r.amount / max} height={8} color={r.color} />
        </View>
      ))}
    </Card>
  );

  // Podium : or, argent, bronze. Les trois premiers d'un classement, à remercier ou à citer.
  const MEDALS = ['#D4A017', '#9CA3AF', '#B87333'];
  const podium = (rows: { id: string; name: string; value: string; sub: string; tier?: ReturnType<typeof donorTier> }[], icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'], color: string, empty: string) =>
    rows.length === 0 ? (
      <EmptyState compact icon="trophy-outline" title={empty} />
    ) : (
      <Card>
        {rows.map((r, i) => (
          <View key={r.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
            <View style={[styles.medal, { backgroundColor: MEDALS[i] }]}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{i + 1}</Text>
            </View>
            <Avatar name={r.name} size={40} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{r.name}</Text>
                {r.tier ? <DonorChip tier={r.tier} small /> : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>{r.sub}</Text>
            </View>
            <Text style={{ color: c.text, fontWeight: '900', fontSize: 16 }}>{r.value}</Text>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
          </View>
        ))}
      </Card>
    );

  // Appelé comme fonction (pas comme composant) : le composeur de réaction garde son texte quand l'écran se rafraîchit.
  const personRow = (p: (typeof people)[number]) => (
    <View key={p.id} style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={p.name} size={40} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{p.name}</Text>
            {p.tier ? <DonorChip tier={p.tier} small /> : null}
            {p.openQuestions ? <Text style={{ color: c.danger, fontWeight: '800', fontSize: 12 }}>{p.openQuestions} question{p.openQuestions > 1 ? 's' : ''} en attente</Text> : null}
          </View>
          <Text style={{ color: c.textMuted, fontSize: 13 }}>
            {money(p.given12m)} sur 12 mois · {p.donations} don{p.donations > 1 ? 's' : ''}{p.last ? ` · dernier le ${formatShort(p.last)}` : ''}
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 13 }}>
            {p.presence} jour{p.presence > 1 ? 's' : ''} de présence sur 30{p.streak ? ` · série de ${p.streak} j` : ''}{p.dates.length ? ` · ${p.dates.length} date${p.dates.length > 1 ? 's' : ''}` : ''}
            {p.lastSeen && p.lastSeen < isoDaysAgo(today, 14) ? ' · s’éloigne' : ''}
          </Text>
        </View>
        {can(role, 'answers') ? (
          <Pressable onPress={() => setWriting(writing === p.id ? null : p.id)} style={[styles.smallBtn, { backgroundColor: writing === p.id ? c.primary : c.primaryLight }]}>
            <Ionicons name="chatbubble-ellipses" size={16} color={writing === p.id ? c.textOnPrimary : c.primary} />
            <Text style={{ color: writing === p.id ? c.textOnPrimary : c.primary, fontWeight: '800', fontSize: 13 }}>Écrire</Text>
          </Pressable>
        ) : null}
      </View>
      {writing === p.id ? <ReactionComposer memberUid={p.id} memberName={p.name} onDone={() => setWriting(null)} /> : null}
    </View>
  );

  const Dashboard = () => (
    <>
      <Text style={{ color: c.textMuted, fontSize: 14, marginBottom: 10 }}>
        Votre communauté en un coup d’œil : qui est là, qui donne, qui attend une réponse, qui a une date importante. Touchez un indicateur pour entrer dans le détail.
      </Text>
      <View style={styles.grid}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ flexBasis: wide ? '18%' : '46%', flexGrow: 1, marginBottom: 0 }} onPress={k.go ? () => setSection(k.go!) : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + '22' }]}>
                <Ionicons name={k.icon} size={16} color={k.color} />
              </View>
              <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', flex: 1 }} numberOfLines={2}>{k.label}</Text>
            </View>
            <Text style={{ color: c.text, fontSize: 26, fontWeight: '900', marginTop: 8 }} numberOfLines={1}>{k.value}</Text>
            <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={2}>{k.sub}</Text>
          </Card>
        ))}
      </View>

      {donorOfMonth ? (
        <Card style={{ borderColor: '#D4A017', borderWidth: 2, marginTop: 18, marginBottom: 0 }} onPress={() => { setSection('members'); setSearch(donorOfMonth.name); }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={[styles.iconBox, { backgroundColor: '#D4A01722', width: 46, height: 46 }]}>
              <MaterialCommunityIcons name="crown" size={26} color="#D4A017" />
            </View>
            <Avatar name={donorOfMonth.name} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Donateur du mois · {MONTHS[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>{donorOfMonth.name}</Text>
                {donorOfMonth.tier ? <DonorChip tier={donorOfMonth.tier} small /> : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>{donorOfMonth.count} don{donorOfMonth.count > 1 ? 's' : ''} ce mois-ci · un mot de votre part, c’est ce qui compte le plus</Text>
            </View>
            <Text style={{ color: '#D4A017', fontSize: 22, fontWeight: '900' }}>{money(donorOfMonth.amount)}</Text>
          </View>
        </Card>
      ) : null}

      <View style={wide ? styles.cols : undefined}>
        <View style={wide ? styles.col : undefined}>
          <H action="Fidèles" onAction={() => setSection('members')}>Podium des donateurs (12 mois)</H>
          {podium(
            topDonors.map((p) => ({ id: p.id, name: p.name, value: money(p.amount), sub: `${p.count} don${p.count > 1 ? 's' : ''}`, tier: p.tier })),
            'hand-heart',
            c.secondary,
            'Aucun don sur 12 mois',
          )}
        </View>
        <View style={wide ? styles.col : undefined}>
          <H action="Fidèles" onAction={() => setSection('members')}>Podium des plus assidus (30 jours)</H>
          {podium(
            [...people].filter((p) => p.presence > 0).sort((a, b) => b.presence - a.presence || b.streak - a.streak).slice(0, 3).map((p) => ({ id: p.id, name: p.name, value: `${p.presence} j`, sub: p.streak ? `série de ${p.streak} jours` : 'de présence sur 30' })),
            'calendar-check',
            c.primary,
            'Aucune présence enregistrée',
          )}
        </View>
      </View>

      <View style={wide ? styles.cols : undefined}>
        <View style={wide ? styles.col : undefined}>
          <H action="Tout voir" onAction={() => setSection('agenda')}>Événements à venir</H>
          <EventRows limit={5} />
          <H action="Tout voir" onAction={() => setSection('agenda')}>Dates des fidèles ces 30 jours</H>
          <DateRows list={dates.filter((d) => daysUntil(d) <= 30).slice(0, 6)} />
        </View>
        <View style={wide ? styles.col : undefined}>
          <H action="Détail" onAction={() => setSection('donations')}>Dons des 6 derniers mois</H>
          <Bars rows={months.map((m) => ({ label: monthLabel(m.ym), amount: m.amount, sub: `${m.count} don${m.count > 1 ? 's' : ''}` }))} max={maxMonth} />
          {can(role, 'answers') ? (
            <>
              <H action="Répondre" onAction={() => setSection('questions')}>Questions en attente</H>
              {pending.length === 0 ? (
                <EmptyState compact icon="checkmark-done-outline" title="Toutes les questions ont une réponse" />
              ) : (
                <Card>
                  {pending.slice(0, 5).map((q, i) => (
                    <Pressable key={q.id} onPress={() => navigation.navigate('RavAnswer', { questionId: q.id })} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>{q.subject}</Text>
                        <Text style={{ color: c.textMuted, fontSize: 13 }}>{q.anonymous ? 'Anonyme' : q.askedBy} · {formatShort(q.date)} · {q.category}</Text>
                      </View>
                      <Ionicons name={chevron} size={18} color={c.textMuted} />
                    </Pressable>
                  ))}
                </Card>
              )}
            </>
          ) : null}
          {can(role, 'donations') && toThank.length ? (
            <Card style={{ borderColor: c.secondary, borderWidth: 2 }} onPress={() => navigation.navigate('RavFeed')}>
              <Text style={{ color: c.text, fontWeight: '900', fontSize: 15 }}>{toThank.length} don{toThank.length > 1 ? 's' : ''} à remercier</Text>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>Ouvrir le fil d’actualité pour réagir.</Text>
            </Card>
          ) : null}
        </View>
      </View>
      <View style={[styles.note, { backgroundColor: c.primaryLight }]}>
        <Ionicons name="lock-closed" size={16} color={c.primary} />
        <Text style={{ color: c.primary, fontSize: 12, flex: 1 }}>Ce tableau de bord n’est visible que par l’équipe. Les fidèles ne voient jamais ces chiffres.{backendMode === 'demo' ? ' Démo : la présence des fidèles est simulée.' : ''}</Text>
      </View>
    </>
  );

  const Members = () => (
    <>
      <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Ionicons name="search" size={18} color={c.textMuted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Chercher un fidèle" placeholderTextColor={c.textMuted} style={{ flex: 1, color: c.text, fontSize: 15, paddingVertical: 8 }} />
      </View>
      <Text style={{ color: c.textMuted, fontSize: 13, marginBottom: 8 }}>
        {members.length} fiche{members.length > 1 ? 's' : ''} · classées par générosité sur 12 mois puis par présence. {fading ? `${fading} fidèle${fading > 1 ? 's' : ''} ne sont pas venus depuis 14 jours : un mot suffit souvent.` : ''}
      </Text>
      {shown.length === 0 ? (
        <EmptyState compact icon="people-outline" title="Aucun fidèle trouvé" hint="Les fiches se créent quand un fidèle rejoint la communauté (QR code ou code)." />
      ) : (
        <Card>{shown.map(personRow)}</Card>
      )}
    </>
  );

  const Donations = () => (
    <>
      <View style={styles.grid}>
        {[
          { label: 'Ce mois', value: money(sum(monthDonations)), sub: `${monthDonations.length} don${monthDonations.length > 1 ? 's' : ''}` },
          { label: 'Cette année', value: money(sum(congDonations.filter((d) => d.date.slice(0, 4) === today.slice(0, 4)))), sub: `${congDonations.filter((d) => d.date.slice(0, 4) === today.slice(0, 4)).length} dons` },
          { label: 'Depuis le début', value: money(sum(congDonations)), sub: `${congDonations.length} dons` },
          { label: 'Promesses dues', value: money(duePledges.reduce((s, p) => s + p.amount, 0)), sub: `${duePledges.length} à relancer` },
        ].map((k) => (
          <Card key={k.label} style={{ flexBasis: wide ? '22%' : '46%', flexGrow: 1, marginBottom: 0 }}>
            <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700' }}>{k.label}</Text>
            <Text style={{ color: c.text, fontSize: 24, fontWeight: '900', marginTop: 6 }} numberOfLines={1}>{k.value}</Text>
            <Text style={{ color: c.textMuted, fontSize: 12 }}>{k.sub}</Text>
          </Card>
        ))}
      </View>
      <View style={wide ? styles.cols : undefined}>
        <View style={wide ? styles.col : undefined}>
          <H>Par mois</H>
          <Bars rows={months.map((m) => ({ label: monthLabel(m.ym), amount: m.amount, sub: `${m.count} don${m.count > 1 ? 's' : ''}` }))} max={maxMonth} />
          <H>Par type de don</H>
          {byType.length ? <Bars rows={byType} max={maxType} /> : <EmptyState compact icon="cash-outline" title="Aucun don enregistré" />}
          {funds.length || campaigns.length ? (
            <>
              <H action="Gérer" onAction={() => navigation.navigate('RavFunds')}>Caisses et chaînes</H>
              <Card>
                {funds.map((f) => (
                  <Text key={f.id} style={{ color: c.text, fontSize: 14, paddingVertical: 4 }}>
                    <Text style={{ fontWeight: '800' }}>{f.name}</Text> · {money(sum(congDonations.filter((d) => d.fundId === f.id)))}
                  </Text>
                ))}
                {campaigns.map((k) => {
                  const p = campaignProgress(k.id);
                  return (
                    <View key={k.id} style={{ paddingVertical: 6 }}>
                      <Text style={{ color: c.text, fontSize: 14, fontWeight: '800' }}>{k.title} · {money(p.raised)} / {money(k.target)} · {p.donors} donateur{p.donors > 1 ? 's' : ''}</Text>
                      <ProgressBar progress={p.raised / Math.max(1, k.target)} height={8} />
                    </View>
                  );
                })}
              </Card>
            </>
          ) : null}
        </View>
        <View style={wide ? styles.col : undefined}>
          <H action="Dons" onAction={() => navigation.navigate('RavDons')}>Promesses à relancer</H>
          {duePledges.length === 0 ? (
            <EmptyState compact icon="checkmark-circle-outline" title="Aucune promesse en attente" />
          ) : (
            <Card>
              {duePledges.map((p, i) => (
                <View key={p.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{p.member ?? 'Fidèle'} · {money(p.amount)}</Text>
                    <Text style={{ color: c.textMuted, fontSize: 13 }}>{p.label} · échéance {formatShort(p.dueDate)}{p.lastReminder ? ` · relancé le ${formatShort(p.lastReminder)}` : ''}</Text>
                  </View>
                  <Pressable onPress={() => { sendReminder(p.id); setReminded(p.id); }} style={[styles.smallBtn, { backgroundColor: reminded === p.id ? c.success + '22' : c.primaryLight }]}>
                    <Ionicons name={reminded === p.id ? 'checkmark' : 'notifications'} size={16} color={reminded === p.id ? c.success : c.primary} />
                    <Text style={{ color: reminded === p.id ? c.success : c.primary, fontWeight: '800', fontSize: 13 }}>{reminded === p.id ? 'Relancé' : 'Relancer'}</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
          <H action="Remercier" onAction={() => navigation.navigate('RavFeed')}>Derniers dons</H>
          <Card>
            {[...congDonations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12).map((d, i) => (
              <View key={d.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{donorName(d)}</Text>
                    {tierOf(d) ? <DonorChip tier={tierOf(d)!} small /> : null}
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: 13 }}>{kindOf(d)} · {d.cause} · {formatShort(d.date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: c.text, fontWeight: '900', fontSize: 15 }}>{money(d.amount)}</Text>
                  <Text style={{ color: d.thankedAt ? c.success : c.warning, fontSize: 12, fontWeight: '700' }}>{d.thankedAt ? 'Remercié' : 'À remercier'}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </View>
    </>
  );

  const Agenda = () => (
    <View style={wide ? styles.cols : undefined}>
      <View style={wide ? styles.col : undefined}>
        <H action="Agenda" onAction={() => navigation.navigate('RavAgenda')}>Événements à venir</H>
        <EventRows />
      </View>
      <View style={wide ? styles.col : undefined}>
        <H action="Dates" onAction={() => navigation.navigate('RavDates')}>Dates des fidèles</H>
        <Text style={{ color: c.textMuted, fontSize: 13, marginBottom: 8 }}>
          {dates.filter((d) => d.type === 'azkara').length} {dateTypeMeta.azkara.label.toLowerCase()}s · {dates.filter((d) => d.type === 'anniversaire').length} {dateTypeMeta.anniversaire.label.toLowerCase()}s. Un appel ou un mot la veille, et le fidèle sait qu’on pense à lui.
        </Text>
        <DateRows list={dates.filter((d) => daysUntil(d) <= 90)} />
      </View>
    </View>
  );

  const Questions = () => (
    <View style={wide ? styles.cols : undefined}>
      <View style={wide ? styles.col : undefined}>
        <H action="Répondre" onAction={() => navigation.navigate('RavAnswers')}>Sans réponse ({pending.length})</H>
        {pending.length === 0 ? (
          <EmptyState compact icon="checkmark-done-outline" title="Toutes les questions ont une réponse" />
        ) : (
          <Card>
            {pending.map((q, i) => (
              <Pressable key={q.id} onPress={() => navigation.navigate('RavAnswer', { questionId: q.id })} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{q.subject}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 13 }}>{q.anonymous ? 'Anonyme' : q.askedBy} · {formatShort(q.date)} · {q.category}</Text>
                </View>
                <Ionicons name={chevron} size={18} color={c.textMuted} />
              </Pressable>
            ))}
          </Card>
        )}
      </View>
      <View style={wide ? styles.col : undefined}>
        <H>Répondues ({answered.length})</H>
        {answered.length === 0 ? (
          <EmptyState compact icon="chatbubbles-outline" title="Pas encore de réponse" />
        ) : (
          <Card>
            {answered.slice(0, 15).map((q, i) => (
              <Pressable key={q.id} onPress={() => navigation.navigate('RavAnswer', { questionId: q.id })} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{q.subject}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 13 }}>{q.anonymous ? 'Anonyme' : q.askedBy} · {formatShort(q.date)}{q.isPublic ? ' · publiée' : ''}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={c.success} />
              </Pressable>
            ))}
          </Card>
        )}
        {league.ranking.length ? (
          <>
            <H>Ligue de la quinzaine</H>
            <Card>
              {league.ranking.slice(0, 5).map((r, i) => (
                <Text key={r.uid} style={{ color: c.text, fontSize: 14, paddingVertical: 3 }}>
                  <Text style={{ fontWeight: '900' }}>{i + 1}.</Text> {r.name} · {r.points} pts
                </Text>
              ))}
            </Card>
          </>
        ) : null}
      </View>
    </View>
  );

  const NavItem = ({ n }: { n: (typeof nav)[number] }) => {
    const active = section === n.key;
    return (
      <Pressable onPress={() => setSection(n.key)} style={[wide ? styles.navItem : styles.navChip, { backgroundColor: active ? c.primary : wide ? 'transparent' : c.surface, borderColor: active ? c.primary : c.border }]}>
        <Ionicons name={n.icon} size={wide ? 20 : 16} color={active ? c.textOnPrimary : c.text} />
        <Text style={{ color: active ? c.textOnPrimary : c.text, fontWeight: '800', fontSize: wide ? 15 : 13, flex: wide ? 1 : undefined }}>{n.label}</Text>
        {n.count ? (
          <View style={[styles.count, { backgroundColor: active ? c.textOnPrimary : c.danger }]}>
            <Text style={{ color: active ? c.primary : '#fff', fontWeight: '900', fontSize: 11 }}>{n.count}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  const titles: Record<Section, string> = { dashboard: 'Tableau de bord', members: 'Fidèles', donations: 'Dons', agenda: 'Agenda & dates', questions: 'Questions' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.back, { backgroundColor: c.primaryLight }]} hitSlop={10}>
          <Ionicons name={rtl ? 'arrow-forward' : 'arrow-back'} size={22} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: '800', fontSize: 15 }}>Retour</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>Vue CRM · {titles[section]}</Text>
          <Text style={{ color: c.textMuted, fontSize: 13 }}>{congregation.name} · {capitalize(formatLong(today))}</Text>
        </View>
        <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={40} ring />
      </View>
      {!wide ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 10 }} style={{ flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }}>
          {tabs.map((n) => <NavItem key={n.key} n={n} />)}
        </ScrollView>
      ) : null}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {wide ? (
          <View style={[styles.sidebar, { backgroundColor: c.surface, borderRightColor: c.border }]}>
            {tabs.map((n) => <NavItem key={n.key} n={n} />)}
            <View style={{ flex: 1 }} />
            <Text style={{ color: c.textMuted, fontSize: 12, padding: 12 }}>Un CRM pour connaître chacun : qui donne, qui vient, qui a besoin d’un mot.</Text>
          </View>
        ) : null}
        <ScrollView contentContainerStyle={[styles.content, { maxWidth: wide ? 1180 : undefined }]} keyboardShouldPersistTaps="handled">
          {/* Appels de fonction, pas de composants : le champ de recherche et les composeurs gardent le focus et leur texte. */}
          {section === 'dashboard' ? Dashboard() : section === 'members' ? Members() : section === 'donations' ? Donations() : section === 'agenda' ? Agenda() : Questions()}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Composants stables (définis hors de l'écran) : leurs enfants ne sont pas remontés à chaque rafraîchissement.
function H({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  const c = useTheme().theme.colors;
  const { rtl } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
      <Text style={{ color: c.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: c.primary, fontWeight: '800', fontSize: 14 }}>{action}</Text>
          <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={c.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Card({ children, style, onPress }: { children: React.ReactNode; style?: object; onPress?: () => void }) {
  const c = useTheme().theme.colors;
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  sidebar: { width: 230, borderRightWidth: StyleSheet.hairlineWidth, padding: 10, gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  navChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  count: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  content: { padding: 16, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cols: { flexDirection: 'row', gap: 18 },
  col: { flex: 1, minWidth: 0 },
  card: { borderRadius: 16, padding: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12 },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  medal: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  dateBox: { width: 46, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 8 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginTop: 16 },
});
