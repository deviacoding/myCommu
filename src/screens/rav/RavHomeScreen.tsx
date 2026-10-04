import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RavStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { useI18n } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { AiBanner } from '../../components/AiAssist';
import { LanguagePicker } from '../../components/LanguagePicker';
import { RavScreen, BigButton, RavCard, BIG } from './RavUi';
import { daysUntil } from '../../components/MyDates';
import { can, Permission, roleLabel, StaffRole } from '../../config/roles';
import { useReligion } from '../../state/useReligion';
import { paymentProvider } from '../../config/paymentProviders';
import { countryName } from '../../utils/countries';
import { capitalize, formatLong, todayISO } from '../../utils/time';

type Props = NativeStackScreenProps<RavStackParamList, 'RavHome'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function RavHomeScreen({ navigation }: Props) {
  const { theme, community } = useTheme();
  const c = theme.colors;
  const { t, rtl } = useI18n();
  const r = (k: string) => t(`religions.${community}.${k}`);
  const { signOut, switchRole, mode, staffRoleFor, isDemo } = useAuth();
  const { profile } = useReligion();
  const { congregationId: currentCongregationId } = useAppState();
  const role: StaffRole = staffRoleFor(currentCongregationId) ?? (mode === 'treasurer' ? 'treasurer' : mode === 'organizer' ? 'organizer' : 'leader');
  const isTreasurer = role === 'treasurer';
  const {
    myStaff,
    myPaymentLinks,
    myAssociations,
    myQuestions: questions,
    myCourses: courses,
    myPledges: pledges,
    myAgenda: agenda,
    joinCongregation,
    myMemberDates,
    live,
    congregation,
    seed,
    congregationId,
    currentOf,
    groupOf,
  } = useAppState();
  const treasurerName = myStaff.find((s) => s.role === 'treasurer')?.name ?? t('demo.treasurer');
  const soonDates = myMemberDates.filter((d) => daysUntil(d) <= 7).length;
  const pending = questions.filter((q) => q.status === 'pending').length;
  const due = pledges.filter((p) => p.status === 'due').length;
  const upcoming = agenda.filter((e) => e.date >= todayISO()).length;
  const religious = seed.religiousDate(new Date());
  const current = currentOf(congregation);
  const group = groupOf(congregation);

  const allTiles: { key: keyof RavStackParamList; perm: Permission; icon: IoniconName; title: string; sub: string; badge?: number; color: string }[] = [
    { key: 'RavDvarTorah', perm: 'teaching', icon: 'create', title: r('teachingShare'), sub: t('rav.teachingsSub', { count: courses.length }), color: c.primary },
    { key: 'RavAnswers', perm: 'answers', icon: 'chatbubbles', title: t('rav.answers'), sub: pending ? t('rav.answersPending', { count: pending }) : t('rav.answersNone'), badge: pending, color: '#B45309' },
    { key: 'RavSchedule', perm: 'schedule', icon: 'time', title: r('schedule'), sub: t('rav.scheduleSub'), color: '#0F766E' },
    { key: 'RavAgenda', perm: 'agenda', icon: 'calendar', title: t('rav.agenda'), sub: t('rav.agendaSub', { count: upcoming }), color: '#7C3AED' },
    { key: 'RavDates', perm: 'dates', icon: 'calendar-number', title: r('memberDates'), sub: soonDates ? t('rav.datesSoon', { count: soonDates }) : t('rav.datesNone', { members: r('members') }), badge: soonDates, color: '#DB2777' },
    { key: 'RavDons', perm: 'donations', icon: 'cash', title: t('rav.donations'), sub: due ? t('rav.donationsDue', { count: due }) : t('rav.donationsNone'), badge: due, color: '#BE123C' },
    {
      key: 'RavAssociations',
      perm: 'donations',
      icon: 'business',
      title: 'Mes associations',
      sub: myAssociations.length ? `${myAssociations.length} association${myAssociations.length > 1 ? 's' : ''} · ${[...new Set(myAssociations.map((a) => countryName(a.country)))].join(', ')}` : 'Qui reçoit vos dons : une par pays ou par œuvre',
      color: '#1D4ED8',
    },
    {
      key: 'RavPayments',
      perm: 'donations',
      icon: 'card',
      title: t('payments.title'),
      sub: myPaymentLinks.length ? t('payments.tileConnected', { list: myPaymentLinks.map((p) => paymentProvider(p.provider).name).join(', ') }) : t('payments.tileNone'),
      color: '#635BFF',
    },
    {
      key: 'RavAffiliation',
      perm: 'team',
      icon: 'git-network',
      title: t('rav.affiliation'),
      sub: t('rav.affiliationSub', { current: current?.name ?? t('affiliation.noCurrent'), group: group?.name ?? t('affiliation.independent') }),
      color: '#0E7490',
    },
    { key: 'RavShareQr', perm: 'qr', icon: 'qr-code', title: t('rav.qr'), sub: t('rav.qrSub', { code: congregation.code }), color: '#111827' },
    { key: 'RavTeam', perm: 'team', icon: 'key', title: t('rav.team'), sub: t('rav.teamSub', { deputy: roleLabel('deputy', profile) }), color: '#4338CA' },
  ];
  const tiles = allTiles.filter((x) => can(role, x.perm));
  const chevron = rtl ? 'chevron-back' : 'chevron-forward';

  return (
    <RavScreen
      title={isTreasurer ? t('rav.treasurerSpace') : congregation.name}
      subtitle={`${capitalize(formatLong(todayISO()))}${religious ? ` · ${religious}` : ''}`}
      onBack={isTreasurer ? signOut : () => navigation.navigate('RavStart')}
      right={isTreasurer ? <Avatar name={treasurerName} size={54} /> : <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={54} ring />}
    >
      <Text style={{ color: c.textMuted, fontSize: BIG.small, marginBottom: 14 }}>{t('rav.pickTask')}</Text>

      {isTreasurer ? (
        <View style={[styles.roleBanner, { backgroundColor: '#BE123C14', borderColor: '#BE123C' }]}>
          <Ionicons name="cash" size={30} color="#BE123C" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 19, fontWeight: '900' }}>{congregation.name}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 2 }}>{t('rav.treasurerBanner', { leader: r('leader') })}</Text>
          </View>
        </View>
      ) : null}

      {can(role, 'live') ? (
        <Pressable onPress={() => navigation.navigate('RavLive')} style={({ pressed }) => [styles.live, { backgroundColor: live ? '#111827' : c.danger, opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.liveDot}>
            <Ionicons name="radio" size={30} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 21, fontWeight: '900' }}>{live ? t('rav.liveOn') : t('rav.live')}</Text>
            <Text style={{ color: '#fff', opacity: 0.85, fontSize: BIG.small, marginTop: 2 }}>
              {live ? live.title : t('rav.liveSub', { count: congregation.members, members: r('members') })}
            </Text>
          </View>
          <Ionicons name={chevron} size={30} color="#fff" />
        </Pressable>
      ) : null}

      {tiles.map((x) => (
        <Pressable
          key={x.key}
          onPress={() => navigation.navigate(x.key as never)}
          style={({ pressed }) => [styles.tile, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.tileIcon, { backgroundColor: x.color }]}>
            <Ionicons name={x.icon} size={32} color="#fff" />
            {x.badge ? (
              <View style={[styles.badge, { backgroundColor: c.danger, borderColor: c.surface }]}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{x.badge}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 21, fontWeight: '900' }}>{x.title}</Text>
            <Text style={{ color: c.textMuted, fontSize: BIG.small, marginTop: 3 }}>{x.sub}</Text>
          </View>
          <Ionicons name={chevron} size={30} color={c.textMuted} />
        </Pressable>
      ))}

      {!isTreasurer ? (
        <View style={{ marginTop: 10 }}>
          <AiBanner />
        </View>
      ) : null}

      <RavCard style={{ marginTop: 14 }}>
        <LanguagePicker big />
      </RavCard>

      <View style={{ marginTop: 8, gap: 12 }}>
        {can(role, 'memberView') ? (
          <BigButton
            label={t('rav.seeAsMember', { member: r('member') })}
            icon="eye"
            color={c.primaryLight}
            textColor={c.primary}
            onPress={() => {
              joinCongregation(congregationId);
              switchRole('member');
            }}
          />
        ) : null}
        <BigButton label={isDemo ? t('rav.quitDemo') : t('auth.signOut')} icon="log-out-outline" color={c.surface} textColor={c.textMuted} onPress={signOut} style={{ borderWidth: 1, borderColor: c.border }} />
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
  badge: { position: 'absolute', top: -6, end: -6, minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2 },
});
