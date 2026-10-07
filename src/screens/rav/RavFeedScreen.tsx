import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { EmptyState } from '../../components/EmptyState';
import { ReactionComposer } from '../../components/ReactionComposer';
import { DonorChip } from '../../components/DonorChip';
import { donorTier, isoDaysAgo } from '../../config/gamification';
import { can } from '../../config/roles';
import { formatLong, money, todayISO } from '../../utils/time';
import { RavScreen, RavCard, BigButton, BigInput, BIG } from './RavUi';
import { useRavFeed } from './useRavFeed';

type Props = NativeStackScreenProps<RavStackParamList, 'RavFeed'>;

interface NewsItem { key: string; date: string; uid: string; name: string; title: string; sub: string; icon: string; color: string; about: string; tier?: ReturnType<typeof donorTier> }

// Fil d'actualité du responsable : d'abord ce qu'il y a à faire (remercier, féliciter), puis ce qui s'est passé
// dans la communauté ces 30 derniers jours. L'accueil reste libre pour piloter.
export function RavFeedScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { thankDonation, congratulateWinner, league, scores, members } = useAppState();
  const { role, congDonations, toThank, winner, todo, donorKey, donorName, tierOf, kindOf } = useRavFeed();
  const [thanking, setThanking] = useState<string | null>(null);
  const [congratsText, setCongratsText] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const [reacting, setReacting] = useState<string | null>(null);
  const today = todayISO();

  // Ce qui s'est passé : dons déjà remerciés, séries, badges, nouveaux fidèles, tête de ligue. À saluer d'un geste si on veut.
  const news = useMemo<NewsItem[]>(() => {
    const since30 = isoDaysAgo(today, 30);
    const items: NewsItem[] = [];
    if (can(role, 'donations')) {
      for (const d of congDonations) {
        if (d.date < since30 || !d.thankedAt) continue;
        const kind = kindOf(d);
        items.push({ key: 'd' + d.id, date: d.date, uid: donorKey(d), name: donorName(d), title: `${donorName(d)} · ${kind}`, sub: `${money(d.amount)} · ${d.cause} · remercié`, icon: d.type === 'maasser' ? 'percent-circle' : 'hand-heart', color: d.type === 'maasser' ? '#D4A017' : '#F59E0B', about: `votre ${kind.toLowerCase()} de ${money(d.amount)}`, tier: tierOf(d) });
      }
    }
    if (can(role, 'answers')) {
      for (const s of scores) {
        const date = s.updatedAt ? s.updatedAt.slice(0, 10) : today;
        if (date < since30) continue;
        if ((s.streakDays ?? 0) >= 7) items.push({ key: 's' + s.uid, date, uid: s.uid, name: s.name, title: `${s.name} · ${s.streakDays} jours de série`, sub: 'Présence régulière dans l’application', icon: 'fire', color: '#EA580C', about: `votre série de ${s.streakDays} jours` });
        if ((s.badges ?? 0) >= 5) items.push({ key: 'b' + s.uid, date, uid: s.uid, name: s.name, title: `${s.name} · ${s.badges} badges`, sub: `Niveau ${s.level}`, icon: 'medal', color: '#7C3AED', about: `vos ${s.badges} badges` });
      }
      for (const m of members) {
        if (m.joinedAt && m.joinedAt >= since30) items.push({ key: 'm' + m.id, date: m.joinedAt, uid: m.id, name: m.name, title: `${m.name} a rejoint la communauté`, sub: 'Un mot de bienvenue fait toujours plaisir', icon: 'account-plus', color: '#0F766E', about: 'votre arrivée dans la communauté' });
      }
      league.ranking.slice(0, 3).forEach((r, i) => {
        const left = league.period.daysLeft;
        items.push({ key: 'l' + r.uid, date: today, uid: r.uid, name: r.name, title: `${i + 1}${i === 0 ? 'er' : 'e'} de la ligue · ${r.name}`, sub: `${r.points} pts sur la quinzaine · ${left} jour${left > 1 ? 's' : ''} restant${left > 1 ? 's' : ''}`, icon: 'trophy', color: i === 0 ? '#D4A017' : i === 1 ? '#9CA3AF' : '#B87333', about: 'votre place dans la ligue' });
      });
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [congDonations, scores, members, league, today, role]);

  return (
    <RavScreen title="Fil d’actualité" subtitle={todo ? `${todo} chose${todo > 1 ? 's' : ''} à faire` : 'Rien à faire, tout est à jour'} onBack={() => navigation.goBack()}>
      {todo ? (
        <>
          <Text style={[styles.section, { color: c.text }]}>À faire</Text>
          <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 10 }}>Un like, un mot, un audio ou une vidéo de 5 secondes : le fidèle le reçoit dans sa messagerie.</Text>
        </>
      ) : null}

      {winner ? (
        <RavCard style={{ borderColor: '#D4A017', borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="trophy" size={30} color="#D4A017" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>Ligue terminée : {winner.name} a gagné la quinzaine</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>{winner.points} points du {formatLong(winner.period.from)} au {formatLong(winner.period.to)}. Un mot du responsable, c’est ce qui compte le plus.</Text>
            </View>
          </View>
          {showCongrats ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <BigInput value={congratsText} onChangeText={setCongratsText} multiline style={{ minHeight: 100 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <BigButton label="Envoyer" icon="send" disabled={congratsText.trim().length < 2} onPress={() => { congratulateWinner(congratsText.trim()); setShowCongrats(false); }} style={{ flex: 1 }} />
                <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setShowCongrats(false)} style={{ borderWidth: 1, borderColor: c.border }} />
              </View>
            </View>
          ) : (
            <BigButton
              label="Féliciter"
              icon="sparkles"
              color="#D4A017"
              textColor="#111827"
              style={{ marginTop: 10 }}
              onPress={() => {
                setCongratsText(`Mazal tov ${winner.name.split(' ')[0]} ! Vous êtes premier de la ligue de la quinzaine avec ${winner.points} points. Toute la communauté vous salue.`);
                setShowCongrats(true);
              }}
            />
          )}
        </RavCard>
      ) : null}

      {toThank.length ? (
        <RavCard style={{ borderColor: c.secondary, borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="notifications" size={28} color={c.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{toThank.length} don{toThank.length > 1 ? 's' : ''} à remercier</Text>
              <Text style={{ color: c.textMuted, fontSize: BIG.small }}>Les 14 derniers jours. Un don remercié quitte cette liste.</Text>
            </View>
          </View>
          {toThank.map((d) => (
            <View key={d.id} style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: BIG.small }}>{donorName(d)} · {kindOf(d)} · {money(d.amount)} · {d.date}</Text>
                {tierOf(d) ? <DonorChip tier={tierOf(d)!} small /> : null}
              </View>
              {thanking === d.id ? (
                <View style={{ marginTop: 4 }}>
                  <ReactionComposer memberUid={d.uid ?? 'inconnu'} memberName={donorName(d)} about={`votre ${kindOf(d).toLowerCase()} de ${money(d.amount)}`} onDone={() => { thankDonation(d.id); setThanking(null); }} />
                  <BigButton label="Annuler" color={c.background} textColor={c.textMuted} onPress={() => setThanking(null)} style={{ borderWidth: 1, borderColor: c.border, marginTop: 8, minHeight: 50, paddingVertical: 12 }} />
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <BigButton label="Remercier" icon="chatbubble-ellipses" color={c.secondary} textColor={c.primaryDark} onPress={() => setThanking(d.id)} style={{ flex: 1 }} />
                  <BigButton label="Déjà fait" color={c.background} textColor={c.textMuted} onPress={() => thankDonation(d.id)} style={{ borderWidth: 1, borderColor: c.border }} />
                </View>
              )}
            </View>
          ))}
          {toThank.length >= 3 ? (
            <BigButton
              label="Tout marquer comme remercié"
              icon="checkmark-done"
              color={c.background}
              textColor={c.textMuted}
              onPress={() => toThank.forEach((d) => thankDonation(d.id))}
              style={{ borderWidth: 1, borderColor: c.border, marginTop: 14, minHeight: 54, paddingVertical: 12 }}
            />
          ) : null}
        </RavCard>
      ) : null}

      {!todo ? <EmptyState icon="checkmark-done-outline" title="Rien à faire pour l’instant" hint="Les dons à remercier et le vainqueur de la ligue à féliciter apparaîtront ici, avec une pastille sur l’accueil." /> : null}

      {can(role, 'answers') && league.ranking.length ? (
        <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 12 }}>
          Ligue en cours : {league.period.daysLeft} jour{league.period.daysLeft > 1 ? 's' : ''} restant{league.period.daysLeft > 1 ? 's' : ''} · en tête : {league.ranking[0]?.name} ({league.ranking[0]?.points} pts)
        </Text>
      ) : null}

      <Text style={[styles.section, { color: c.text, marginTop: 24 }]}>Ces 30 derniers jours</Text>
      {news.length === 0 ? (
        <EmptyState compact icon="newspaper-outline" title="Rien à signaler pour l’instant" hint="Les dons, les séries, les badges et les arrivées de vos fidèles apparaîtront ici." />
      ) : (
        news.map((it) => (
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

      <View style={[styles.note, { backgroundColor: c.primaryLight }]}>
        <Ionicons name="lock-closed" size={18} color={c.primary} />
        <Text style={{ color: c.primary, fontSize: 13, flex: 1 }}>Ce fil n’est jamais montré aux fidèles. Chacun ne voit que son propre ora.</Text>
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: BIG.label, fontWeight: '900', marginTop: 4, marginBottom: 8 },
  feedIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  react: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 18 },
});
