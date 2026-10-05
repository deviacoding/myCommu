import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, Muted } from '../../components/ui';
import { EmptyState } from '../../components/EmptyState';
import { BADGE_GROUPS, Badge } from '../../config/gamification';

type Props = NativeStackScreenProps<AppStackParamList, 'Badges'>;
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Tous les badges : obtenus en couleur, à venir grisés avec leur progression. Tout est récompensé.
export function BadgesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { badges, seed } = useAppState();
  const earned = badges.filter((b) => b.earned).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Mes badges" subtitle={`${earned} / ${badges.length} obtenus`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.big, { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name="medal" size={28} color={c.textOnPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '900', fontSize: 20 }}>{earned} badge{earned > 1 ? 's' : ''}</Text>
            <Muted>Sur {badges.length}. Chaque pas compte : présence, {seed.alms.name.toLowerCase()}, étude, ligue.</Muted>
          </View>
        </Card>

        {badges.length === 0 ? (
          <EmptyState icon="ribbon-outline" title="Pas encore de badges" hint="Ils apparaîtront dès vos premières actions dans l’application." />
        ) : (
          BADGE_GROUPS.map((g) => {
            const list = badges.filter((b) => b.group === g.key);
            if (!list.length) return null;
            const got = list.filter((b) => b.earned).length;
            return (
              <View key={g.key} style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{g.label}</Text>
                  <Muted>
                    {got} / {list.length}
                  </Muted>
                </View>
                <View style={styles.grid}>
                  {list.map((b) => (
                    <BadgeTile key={b.id} badge={b} />
                  ))}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const color = badge.earned ? badge.color : c.textMuted;
  return (
    <View style={[styles.tile, { backgroundColor: c.surface, borderColor: badge.earned ? badge.color : c.border, opacity: badge.earned ? 1 : 0.75 }]}>
      <View style={[styles.icon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={badge.icon as MciName} size={28} color={color} />
        {!badge.earned ? (
          <View style={[styles.lock, { backgroundColor: c.surface }]}>
            <MaterialCommunityIcons name="lock" size={12} color={c.textMuted} />
          </View>
        ) : null}
      </View>
      <Text style={{ color: c.text, fontWeight: '800', fontSize: 13, textAlign: 'center' }} numberOfLines={2}>
        {badge.name}
      </Text>
      <Muted style={{ fontSize: 11, textAlign: 'center' }} >{badge.description}</Muted>
      {badge.earned ? (
        <Text style={{ color: badge.color, fontWeight: '800', fontSize: 11, marginTop: 4 }}>Obtenu</Text>
      ) : (
        <View style={{ alignSelf: 'stretch', marginTop: 6 }}>
          <View style={[styles.track, { backgroundColor: c.primaryLight }]}>
            <View style={[styles.fill, { backgroundColor: badge.color, width: `${Math.round(badge.ratio * 100)}%` }]} />
          </View>
          <Muted style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>{badge.progress}</Muted>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  big: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '30%', flexGrow: 1, minWidth: 100, borderWidth: 1.5, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4 },
  icon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  lock: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
