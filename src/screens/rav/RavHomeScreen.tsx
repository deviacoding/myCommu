import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { Avatar } from '../../components/Avatar';
import { AiBanner } from '../../components/AiAssist';
import { RavScreen, BigButton, BIG } from './RavUi';
import { daysUntil } from '../../components/MyDates';
import { can, Permission, roleLabel, StaffRole } from '../../config/roles';
import { useReligion } from '../../state/useReligion';
import { capitalize, formatLong, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavHome'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function RavHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signOut, switchRole, mode } = useAuth();
  const { profile } = useReligion();
  const role: StaffRole = mode === 'treasurer' ? 'treasurer' : 'leader';
  const isTreasurer = role === 'treasurer';
  const { myStaff } = useAppState();
  const treasurerName = myStaff.find((s) => s.role === 'treasurer')?.name ?? 'Trésorier';
  const { myQuestions: questions, myCourses: courses, myPledges: pledges, myAgenda: agenda, joinCongregation, myMemberDates, live, congregation, seed, congregationId } = useAppState();
  const soonDates = myMemberDates.filter((d) => daysUntil(d) <= 7).length;
  const datesSub = soonDates ? `${soonDates} date${soonDates > 1 ? 's' : ''} cette semaine` : `Anniversaires et souvenirs de vos ${seed.memberLabel}s`;
  const pending = questions.filter((q) => q.status === 'pending').length;
  const due = pledges.filter((p) => p.status === 'due').length;
  const upcoming = agenda.filter((e) => e.date >= todayISO()).length;
  const hebrew = seed.religiousDate(new Date());

  const allTiles: { key: keyof RavStackParamList; perm: Permission; icon: IoniconName; title: string; sub: string; badge?: number; color: string }[] = [
    { key: 'RavDvarTorah', perm: 'teaching', icon: 'create', title: seed.teachingShareTitle, sub: `${courses.length} partagés · texte, vidéo, photo ou audio`, color: c.primary },
    { key: 'RavAnswers', perm: 'answers', icon: 'chatbubbles', title: 'Répondre aux questions', sub: pending ? `${pending} question${pending > 1 ? 's' : ''} sans réponse` : 'Toutes les questions ont une réponse', badge: pending, color: '#B45309' },
    { key: 'RavSchedule', perm: 'schedule', icon: 'time', title: seed.scheduleTitle, sub: 'Calendrier : ajoutez des horaires jour par jour', color: '#0F766E' },
    { key: 'RavAgenda', perm: 'agenda', icon: 'calendar', title: 'Agenda de la communauté', sub: `${upcoming} événements à venir`, color: '#7C3AED' },
    { key: 'RavDates', perm: 'dates', icon: 'calendar-number', title: seed.memberDatesTitle, sub: datesSub, badge: soonDates, color: '#DB2777' },
    { key: 'RavDons', perm: 'donations', icon: 'cash', title: 'Dons', sub: due ? `Enregistrer un don · ${due} don${due > 1 ? 's' : ''} à récupérer` : 'Enregistrer un don · rien à récupérer', badge: due, color: '#BE123C' },
    { key: 'RavShareQr', perm: 'qr', icon: 'qr-code', title: 'Partager mon QR code', sub: `Code ${congregation.code} · à envoyer ou à imprimer`, color: '#111827' },
    { key: 'RavTeam', perm: 'team', icon: 'key', title: 'Créer des accès', sub: `${roleLabel('deputy', profile)}, trésorier, organisateur`, color: '#4338CA' },
  ];
  const tiles = allTiles.filter((t) => can(role, t.perm));

  return (
    <RavScreen
      title={isTreasurer ? 'Espace trésorier' : congregation.name}
      subtitle={`${capitalize(formatLong(todayISO()))}${hebrew ? ` · ${hebrew}` : ''}`}
      onBack={isTreasurer ? signOut : () => navigation.navigate('RavStart')}
      right={isTreasurer ? <Avatar name={treasurerName} size={54} /> : <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={54} ring />}
    >
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14 }}>Que souhaitez-vous faire aujourd’hui ? Touchez une case.</Text>

      {isTreasurer ? (
        <View style={[styles.roleBanner, { backgroundColor: '#BE123C14', borderColor: '#BE123C' }]}>
          <Ionicons name="cash" size={30} color="#BE123C" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{congregation.name}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>Accès trésorier : vous voyez uniquement la partie dons. Le reste est réservé au {profile.leaderTitle.split(' / ')[0].toLowerCase()}.</Text>
          </View>
        </View>
      ) : null}

      {can(role, 'live') ? (
      <Pressable onPress={() => navigation.navigate('RavLive')} style={({ pressed }) => [styles.live, { backgroundColor: live ? '#111827' : c.danger, opacity: pressed ? 0.85 : 1 }]}>
        <View style={styles.liveDot}>
          <Ionicons name="radio" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 21, fontWeight: '900' }}>{live ? 'Live en cours' : 'Faire un live et prévenir ma communauté'}</Text>
          <Text style={{ color: '#fff', opacity: 0.85, fontSize: BIG.small, marginTop: 2 }}>{live ? live.title : `Notification push à ${congregation.members} fidèles, puis cours ou office en direct`}</Text>
        </View>
        <Ionicons name="chevron-forward" size={30} color="#fff" />
      </Pressable>
      ) : null}

      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => navigation.navigate(t.key as never)}
          style={({ pressed }) => [styles.tile, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.tileIcon, { backgroundColor: t.color }]}>
            <Ionicons name={t.icon} size={32} color="#fff" />
            {t.badge ? (
              <View style={[styles.badge, { backgroundColor: c.danger, borderColor: c.surface }]}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{t.badge}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 21, fontWeight: '900' }}>{t.title}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{t.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={30} color={c.textMuted} />
        </Pressable>
      ))}

      {!isTreasurer ? (
        <View style={{ marginTop: 10 }}>
          <AiBanner />
        </View>
      ) : null}

      <View style={{ marginTop: 20, gap: 12 }}>
        {can(role, 'memberView') ? (
          <BigButton label={`Voir l’application comme un ${seed.memberLabel}`} icon="eye" color={c.primaryLight} textColor={c.primary} onPress={() => {
            joinCongregation(congregationId);
            switchRole('member');
          }} />
        ) : null}
        <BigButton label="Quitter la démo" icon="log-out-outline" color={c.surface} textColor={c.textMuted} onPress={signOut} style={{ borderWidth: 1, borderColor: c.border }} />
      </View>
    </RavScreen>
  );
}

const styles = StyleSheet.create({
  tile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12, minHeight: 96 },
  tileIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  roleBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 2, marginBottom: 14 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 20, marginBottom: 12, minHeight: 96 },
  liveDot: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -6, right: -6, minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2 },
});
