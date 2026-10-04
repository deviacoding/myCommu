import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../state/AuthContext';
import { useAppState } from '../../state/AppState';
import { themes } from '../../theme/themes';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Aura } from '../../components/Aura';
import { ProgressBar } from '../../components/ProgressBar';
import { Card, SectionTitle, Muted, Button, Chip } from '../../components/ui';
import { MyDates } from '../../components/MyDates';
import { IconByName } from '../../components/ReligionIcon';
import { LanguagePicker } from '../../components/LanguagePicker';
import { useI18n } from '../../i18n';
import { CommunityId } from '../../types';
import { money, formatNumeric } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function AccountScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { user, signOut, updateUser, isDemo, memberships, switchRole } = useAuth();
  const staffMembership = memberships.find((m) => m.role !== 'member');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, phone: user.phone ?? '', city: user.city ?? '' });
  const { points, level, levelIndex, nextLevel, levelProgress, totalGiven, givenThisMonth, streakMonths, readCourses, questions, congregations, myCongregations, congregation, setCongregation, seed } = useAppState();
  const soulLevels = seed.gamification.levels;
  const g = seed.gamification;
  const mine = congregations.filter((k) => myCongregations.includes(k.id));
  const [notif, setNotif] = useState(true);
  const [shabbatMode, setShabbatMode] = useState(true);

  const myQuestions = questions.filter((q) => q.askedBy === user.name).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader
        title={t('account.title')}
        communitySwitch
        right={
          <Pressable hitSlop={8} onPress={() => { setDraft({ name: user.name, phone: user.phone ?? '', city: user.city ?? '' }); setEditing((v) => !v); }}>
            <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={22} color={c.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Avatar name={user.name} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>{user.name}</Text>
            {user.hebrewName ? <Text style={{ color: c.textMuted, fontSize: 15 }}>{user.hebrewName}</Text> : null}
            <Muted>{theme.name} · membre depuis {formatNumeric(user.memberSince)}</Muted>
          </View>
        </View>

        {editing ? (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: c.text, fontWeight: '800' }}>Modifier mes informations</Text>
            <TextInput value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} placeholder="Nom complet" placeholderTextColor={c.textMuted} style={[styles.input, { borderColor: c.border, color: c.text }]} />
            <TextInput value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: v })} placeholder="Téléphone" keyboardType="phone-pad" placeholderTextColor={c.textMuted} style={[styles.input, { borderColor: c.border, color: c.text }]} />
            <TextInput value={draft.city} onChangeText={(v) => setDraft({ ...draft, city: v })} placeholder="Ville" placeholderTextColor={c.textMuted} style={[styles.input, { borderColor: c.border, color: c.text }]} />
            <Button label={t('common.save')} icon="checkmark" disabled={draft.name.trim().length < 2} onPress={() => { updateUser({ name: draft.name.trim(), phone: draft.phone.trim() || undefined, city: draft.city.trim() || undefined }); setEditing(false); }} />
          </Card>
        ) : null}

        {staffMembership ? (
          <Button label={t('auth.leaderSpace')} icon="ribbon-outline" variant="secondary" onPress={() => switchRole(staffMembership.role === 'treasurer' ? 'treasurer' : staffMembership.role === 'organizer' ? 'organizer' : 'rav')} style={{ marginBottom: 12 }} />
        ) : null}

        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={[styles.oraTitle, { color: c.textMuted }]}>{g.title}</Text>
          <Aura levelIndex={levelIndex} progress={levelProgress} size={230} icon={g.icon} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <Text style={{ color: c.text, fontSize: 26, fontWeight: '900' }}>{level.name}</Text>
            <Text style={{ color: c.textMuted, fontSize: 18 }}>{level.hebrew}</Text>
          </View>
          <Muted style={{ textAlign: 'center', marginTop: 4, maxWidth: 300 }}>{level.description}</Muted>
          <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{points} points</Text>
              {nextLevel ? <Muted>{nextLevel.min - points} points avant {nextLevel.name}</Muted> : <Muted>Niveau maximal</Muted>}
            </View>
            <ProgressBar progress={levelProgress} />
          </View>
          <View style={styles.levels}>
            {soulLevels.map((l, i) => (
              <View key={l.id} style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={[
                    styles.levelDot,
                    { backgroundColor: i <= levelIndex ? c.primary : c.primaryLight, borderColor: i === levelIndex ? c.secondary : 'transparent' },
                  ]}
                />
                <Text style={{ color: i <= levelIndex ? c.text : c.textMuted, fontSize: 10, fontWeight: '600', marginTop: 4 }}>{l.name}</Text>
              </View>
            ))}
          </View>
          <Muted style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
            {g.growHint}
          </Muted>
          <Button
            label={g.ctaLabel}
            icon="heart"
            onPress={() => navigation.navigate('Donate', { type: 'tsedaka' })}
            style={{ alignSelf: 'stretch', marginTop: 14 }}
          />
        </Card>

        <View style={styles.stats}>
          <Stat icon="hand-heart" label="Total donné" value={money(totalGiven)} />
          <Stat icon="calendar-month" label="Ce mois" value={money(givenThisMonth)} />
          <Stat icon="fire" label="Mois d’affilée" value={String(streakMonths)} />
          <Stat icon="book-open-variant" label={`${seed.teachingPlural} lus`} value={String(readCourses.length)} />
          <Stat icon="comment-question" label="Questions" value={String(myQuestions)} />
          <Stat icon={g.icon} label="Niveau" value={`${levelIndex + 1}/${soulLevels.length}`} />
        </View>

        <SectionTitle title={t('account.myCommunities')} action={t('common.join')} onAction={() => navigation.navigate('JoinCommunity', { onboarding: false })} />
        <Card style={{ gap: 10 }}>
          {mine.map((k) => {
            const active = k.id === congregation.id;
            return (
              <Pressable key={k.id} onPress={() => setCongregation(k.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar source={k.rav.photo} name={k.rav.name} size={40} ring={active} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '700' }}>{k.name}</Text>
                  <Muted>{k.rite} · {k.rav.name}</Muted>
                </View>
                <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? c.primary : c.border} />
              </Pressable>
            );
          })}
          <Muted style={{ fontSize: 12 }}>Touchez une communauté pour l’afficher. Le bouton en haut de chaque écran permet aussi de basculer.</Muted>
        </Card>

        <MyDates compact />

        <SectionTitle title="Mes informations" />
        <Card style={{ gap: 12 }}>
          <Info icon="mail-outline" label="Email" value={user.email} />
          <Info icon="call-outline" label="Téléphone" value={user.phone ?? '—'} />
          <Info icon="location-outline" label="Ville" value={user.city ?? '—'} />
          <Info icon="business-outline" label="Communauté affichée" value={`${congregation.name} · ${congregation.rite}`} />
          <Info icon="gift-outline" label="Date de naissance" value={user.birthDate ? `${formatNumeric(user.birthDate)}${user.hebrewBirthDate ? ' · ' + user.hebrewBirthDate : ''}` : '—'} />
        </Card>

        <SectionTitle title={t('account.preferences')} />
        <Card style={{ gap: 14 }}>
          <LanguagePicker />
          <Muted style={{ fontSize: 12 }}>{t('common.languageHint')}</Muted>
          <View style={styles.prefRow}>
            <Ionicons name="notifications-outline" size={20} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '600' }}>Rappels d’allumage et d’offices</Text>
              <Muted>30 minutes avant</Muted>
            </View>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ true: c.primary }} />
          </View>
          <View style={styles.prefRow}>
            <MaterialCommunityIcons name="candle" size={20} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '600' }}>{seed.quietMode.label}</Text>
              <Muted>{seed.quietMode.hint}</Muted>
            </View>
            <Switch value={shabbatMode} onValueChange={setShabbatMode} trackColor={{ true: c.primary }} />
          </View>
          <View>
            <Text style={{ color: c.text, fontWeight: '600', marginBottom: 8 }}>Communauté</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {(Object.keys(themes) as CommunityId[]).map((id) => (
                <Chip key={id} label={themes[id].name.replace('Communauté ', '')} active={user.community === id} color={themes[id].colors.primary} onPress={() => updateUser({ community: id })} />
              ))}
            </View>
            <Muted style={{ fontSize: 12 }}>{isDemo ? 'Changer de confession recharge la démo avec les contenus correspondants.' : 'Votre confession détermine le vocabulaire, le calendrier et les couleurs de l’application.'}</Muted>
          </View>
        </Card>

        <Button label={isDemo ? 'Quitter la démo' : t('auth.signOut')} variant="ghost" icon="log-out-outline" onPress={signOut} style={{ marginTop: 6 }} />
        <Muted style={{ textAlign: 'center', marginTop: 14, fontSize: 11 }}>myCommu · {isDemo ? 'maquette v0.2' : 'v0.3 · Firebase'}</Muted>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}>
      <IconByName icon={icon} size={20} color={c.primary} />
      <Text style={{ color: c.text, fontWeight: '800', fontSize: 16, marginTop: 6 }}>{value}</Text>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
    </View>
  );
}

function Info({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name={icon} size={18} color={c.textMuted} />
      <View style={{ flex: 1 }}>
        <Muted style={{ fontSize: 11 }}>{label}</Muted>
        <Text style={{ color: c.text, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, marginTop: 4 },
  oraTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  levels: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 16 },
  levelDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
  stat: { width: '30%', flexGrow: 1, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
