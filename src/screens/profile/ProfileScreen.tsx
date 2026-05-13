import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { currentUser } from '../../mocks/users';
import { badges as allBadges, pointsForNextLevel } from '../../mocks/badges';
import { Avatar } from '../../components/Avatar';
import { ProgressBar } from '../../components/ProgressBar';
import { BadgeChip } from '../../components/BadgeChip';
import { AppStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ProfileScreen() {
  const { theme } = useTheme();
  const nav = useNavigation<Nav>();
  const earnedBadges = allBadges.filter((b) => currentUser.badges.includes(b.id)).map((b) => ({ ...b, earned: true }));
  const nextLvlPoints = pointsForNextLevel(currentUser.level);
  const progress = (currentUser.points % nextLvlPoints) / nextLvlPoints;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.cover, { backgroundColor: theme.colors.primary }]}>
          <SafeAreaView style={styles.topActions} edges={['top']}>
            <Pressable onPress={() => nav.navigate('Settings')} hitSlop={8} style={styles.coverBtn}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.headerCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: -44, paddingHorizontal: 18 }}>
            <View style={[styles.avatarRing, { borderColor: theme.colors.surface, backgroundColor: theme.colors.surface }]}>
              <Avatar uri={currentUser.avatar} name={currentUser.name} size={88} />
            </View>
            <View style={{ flex: 1, marginLeft: 14, marginBottom: 8 }}>
              <Pressable style={[styles.editBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>Modifier le profil</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ paddingHorizontal: 18, marginTop: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.colors.text }}>{currentUser.name}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 2 }}>{currentUser.handle}</Text>
            <Text style={{ color: theme.colors.text, marginTop: 10, lineHeight: 20 }}>{currentUser.bio}</Text>

            <View style={styles.statsRow}>
              <Stat label="Posts" value="42" />
              <Stat label="Abonnés" value={currentUser.followers.toString()} />
              <Stat label="Abonnements" value={currentUser.following.toString()} />
            </View>
          </View>
        </View>

        <View style={[styles.gamiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.gamiHeader}>
            <View>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' }}>NIVEAU {currentUser.level}</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.text, marginTop: 2 }}>
                {currentUser.points.toLocaleString('fr-FR')} pts
              </Text>
            </View>
            <View style={[styles.lvlCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="crown" size={28} color="#fff" />
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar progress={progress} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 6 }}>
              {Math.floor(nextLvlPoints * (1 - progress))} pts jusqu’au niveau {currentUser.level + 1}
            </Text>
          </View>

          <View style={styles.gamiActions}>
            <Pressable onPress={() => nav.navigate('Leaderboard')} style={styles.gamiAction}>
              <View style={[styles.gamiIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="trophy" size={22} color={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>Classement</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate('Badges')} style={styles.gamiAction}>
              <View style={[styles.gamiIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="ribbon" size={22} color={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>Badges</Text>
            </Pressable>
            <Pressable style={styles.gamiAction}>
              <View style={[styles.gamiIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="gift" size={22} color={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>Récompenses</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 24 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mes badges</Text>
            <Pressable onPress={() => nav.navigate('Badges')}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Voir tout</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {earnedBadges.map((b) => (
              <BadgeChip key={b.id} badge={b} />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Raccourcis</Text>
          <View style={{ marginTop: 10 }}>
            <MenuItem icon="people-outline" label="Mes groupes" onPress={() => nav.navigate('Groups')} />
            <MenuItem icon="bookmark-outline" label="Posts enregistrés" />
            <MenuItem icon="search-outline" label="Explorer" onPress={() => nav.navigate('Search')} />
            <MenuItem icon="settings-outline" label="Paramètres" onPress={() => nav.navigate('Settings')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontWeight: '800', fontSize: 18, color: theme.colors.text }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={{ color: theme.colors.text, flex: 1, fontWeight: '500' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: { height: 140 },
  topActions: { position: 'absolute', right: 12, top: 0 },
  coverBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerCard: {},
  avatarRing: { padding: 4, borderRadius: 50, borderWidth: 4 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-end' },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingVertical: 12, borderRadius: 12 },
  gamiCard: { marginHorizontal: 16, marginTop: 18, padding: 16, borderRadius: 14, borderWidth: 1 },
  gamiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lvlCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  gamiActions: { flexDirection: 'row', marginTop: 18, gap: 10 },
  gamiAction: { flex: 1, alignItems: 'center', gap: 6 },
  gamiIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
