import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
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
import { soulLevels } from '../../mocks/donations';
import { CommunityId } from '../../types';
import { euros, formatNumeric } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function AccountScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { user, signOut, updateUser } = useAuth();
  const { points, level, levelIndex, nextLevel, levelProgress, totalGiven, givenThisMonth, streakMonths, readCourses, questions } = useAppState();
  const [notif, setNotif] = useState(true);
  const [shabbatMode, setShabbatMode] = useState(true);

  const myQuestions = questions.filter((q) => q.askedBy === user.name).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader
        title="Mon compte"
        right={
          <Pressable hitSlop={8}>
            <Ionicons name="create-outline" size={22} color={c.primary} />
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

        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={[styles.oraTitle, { color: c.textMuted }]}>MON ORA</Text>
          <Aura levelIndex={levelIndex} progress={levelProgress} size={230} />
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
            Votre ora grandit à chaque don, chaque cours étudié et chaque question posée.
          </Muted>
          <Button
            label="Faire grandir mon ora"
            icon="heart"
            onPress={() => navigation.navigate('Donate', { type: 'tsedaka' })}
            style={{ alignSelf: 'stretch', marginTop: 14 }}
          />
        </Card>

        <View style={styles.stats}>
          <Stat icon="hand-heart" label="Total donné" value={euros(totalGiven)} />
          <Stat icon="calendar-month" label="Ce mois" value={euros(givenThisMonth)} />
          <Stat icon="fire" label="Mois d’affilée" value={String(streakMonths)} />
          <Stat icon="book-open-variant" label="Cours suivis" value={String(readCourses.length)} />
          <Stat icon="comment-question" label="Questions" value={String(myQuestions)} />
          <Stat icon="star-david" label="Niveau" value={`${levelIndex + 1}/5`} />
        </View>

        <SectionTitle title="Mes informations" />
        <Card style={{ gap: 12 }}>
          <Info icon="mail-outline" label="Email" value={user.email} />
          <Info icon="call-outline" label="Téléphone" value={user.phone ?? '—'} />
          <Info icon="location-outline" label="Ville" value={user.city ?? '—'} />
          <Info icon="business-outline" label="Synagogue" value={user.synagogue ?? '—'} />
          <Info icon="gift-outline" label="Date de naissance" value={user.birthDate ? `${formatNumeric(user.birthDate)} · ${user.hebrewBirthDate ?? ''}` : '—'} />
        </Card>

        <SectionTitle title="Préférences" />
        <Card style={{ gap: 14 }}>
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
              <Text style={{ color: c.text, fontWeight: '600' }}>Mode Chabbat</Text>
              <Muted>Aucune notification du vendredi soir au samedi soir</Muted>
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
            <Muted style={{ fontSize: 12 }}>Maquette : seuls les contenus de la communauté juive sont disponibles pour l’instant.</Muted>
          </View>
        </Card>

        <Button label="Se déconnecter" variant="ghost" icon="log-out-outline" onPress={signOut} style={{ marginTop: 6 }} />
        <Muted style={{ textAlign: 'center', marginTop: 14, fontSize: 11 }}>myCommu · maquette v0.2</Muted>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}>
      <MaterialCommunityIcons name={icon} size={20} color={c.primary} />
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
