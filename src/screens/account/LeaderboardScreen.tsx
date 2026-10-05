import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Card, Muted, Segmented } from '../../components/ui';
import { EmptyState } from '../../components/EmptyState';
import { Score } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'Leaderboard'>;
type Mode = 'points' | 'assiduity';

// Prénom + initiale : on se reconnaît, sans exposer les noms complets à toute la communauté.
export const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : name;
};

export function rankIn(scores: Score[], uid: string, mode: Mode): { rank: number; total: number } {
  const key = mode === 'points' ? 'points' : 'assiduityPoints';
  const sorted = [...scores].sort((a, b) => b[key] - a[key]);
  const idx = sorted.findIndex((s) => s.uid === uid);
  return { rank: idx + 1, total: sorted.length };
}

// Classement de la communauté : podium par points et par assiduité, et sa propre place.
export function LeaderboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { scores, congregation, seed, ora } = useAppState();
  const { user, uid } = useAuth();
  const me = uid ?? user.id;
  const [mode, setMode] = useState<Mode>('points');
  const key = mode === 'points' ? 'points' : 'assiduityPoints';
  const sorted = useMemo(() => [...scores].sort((a, b) => b[key] - a[key]), [scores, key]);
  const mine = rankIn(scores, me, mode);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Classement" subtitle={congregation.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Segmented<Mode> options={[{ value: 'points', label: 'Points' }, { value: 'assiduity', label: 'Assiduité' }]} value={mode} onChange={setMode} />

        <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.rankBig, { backgroundColor: c.primary }]}>
            <Text style={{ color: c.textOnPrimary, fontWeight: '900', fontSize: 18 }}>{mine.rank ? `#${mine.rank}` : '—'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>Votre place{mine.total ? ` sur ${mine.total}` : ''}</Text>
            <Muted>{mode === 'points' ? `${ora.points} points · niveau ${ora.level}` : `${ora.assiduityPoints} points d’assiduité · ${ora.activeDays12m} jours actifs`}</Muted>
          </View>
          <MaterialCommunityIcons name={mode === 'points' ? 'star-four-points' : 'calendar-check'} size={26} color={c.secondary} />
        </Card>

        {sorted.length === 0 ? (
          <EmptyState icon="podium-outline" title="Pas encore de classement" hint="Il se construit dès que les fidèles de la communauté utilisent l’application." />
        ) : (
          <>
            {/* Podium */}
            <View style={styles.podium}>
              {[1, 0, 2].map((i) => {
                const s = sorted[i];
                if (!s) return <View key={i} style={{ flex: 1 }} />;
                const h = i === 0 ? 96 : i === 1 ? 72 : 56;
                const col = i === 0 ? '#D4A017' : i === 1 ? '#9CA3AF' : '#B87333';
                return (
                  <View key={s.id} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Avatar name={s.name} size={i === 0 ? 56 : 46} ring={s.uid === me} />
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: 13, textAlign: 'center' }} numberOfLines={1}>{s.uid === me ? 'Vous' : shortName(s.name)}</Text>
                    <Text style={{ color: c.textMuted, fontSize: 12 }}>{s[key]} pts</Text>
                    <View style={[styles.step, { height: h, backgroundColor: col }]}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>{i + 1}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Card style={{ gap: 0, paddingVertical: 4 }}>
              {sorted.slice(0, 20).map((s, i) => {
                const isMe = s.uid === me;
                return (
                  <View key={s.id} style={[styles.row, { borderBottomColor: c.border, backgroundColor: isMe ? c.primaryLight : 'transparent' }]}>
                    <Text style={{ color: c.textMuted, width: 30, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{i + 1}</Text>
                    <Avatar name={s.name} size={32} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isMe ? c.primary : c.text, fontWeight: isMe ? '900' : '700' }}>{isMe ? 'Vous' : shortName(s.name)}</Text>
                      <Muted style={{ fontSize: 11 }}>niveau {s.level}{mode === 'points' ? ` · assiduité ${s.assiduityPoints} · générosité ${s.generosityPoints}` : ''}</Muted>
                    </View>
                    <Text style={{ color: c.text, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{s[key]}</Text>
                  </View>
                );
              })}
            </Card>
            {mine.rank > 20 ? <Muted style={{ textAlign: 'center', marginTop: 8 }}>Vous êtes #{mine.rank}. Encore {sorted[19][key] - scores.find((s) => s.uid === me)![key] + 1} points pour entrer dans les 20 premiers.</Muted> : null}
          </>
        )}

        <View style={[styles.note, { backgroundColor: c.primaryLight }]}>
          <Ionicons name="eye-outline" size={18} color={c.primary} />
          <Text style={{ color: c.primary, fontSize: 12, flex: 1 }}>Seuls les membres de {congregation.name} voient ce classement, avec des prénoms. Les montants des dons ne sont jamais affichés : seulement des points. Votre {seed.gamification.name} grandit avec votre présence et vos dons.</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  rankBig: { minWidth: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 18, marginBottom: 14 },
  step: { alignSelf: 'stretch', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 8 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 14 },
});
