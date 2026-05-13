import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { leaderboard } from '../../mocks/badges';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { ScreenHeader } from '../../components/ScreenHeader';

type Props = NativeStackScreenProps<AppStackParamList, 'Leaderboard'>;
const PERIODS = ['Semaine', 'Mois', 'Toujours'] as const;

export function LeaderboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Mois');

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const medal = ['#F59E0B', '#9CA3AF', '#B45309'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Classement" onBack={() => navigation.goBack()} />

      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.tab,
              {
                backgroundColor: period === p ? theme.colors.primary : 'transparent',
              },
            ]}
          >
            <Text style={{ color: period === p ? theme.colors.textOnPrimary : theme.colors.text, fontWeight: '600' }}>
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.podium}>
        {top3.map((u, i) => {
          const heights = [110, 90, 75];
          const order = [1, 0, 2];
          const idx = order[i];
          const user = top3[idx];
          return (
            <View key={user.userId} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Avatar uri={user.avatar} name={user.name} size={idx === 0 ? 72 : 58} />
                {idx === 0 && (
                  <MaterialCommunityIcons
                    name="crown"
                    size={24}
                    color="#F59E0B"
                    style={{ position: 'absolute', top: -16 }}
                  />
                )}
                <Text style={{ color: theme.colors.text, fontWeight: '700', marginTop: 6, fontSize: 13 }} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{user.points.toLocaleString('fr-FR')} pts</Text>
              </View>
              <View
                style={[
                  styles.bar,
                  { backgroundColor: medal[idx], height: heights[idx] },
                ]}
              >
                <Text style={styles.barRank}>{idx + 1}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <FlatList
        data={rest}
        keyExtractor={(e) => e.userId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMe = item.userId === 'u-me';
          return (
            <View
              style={[
                styles.row,
                {
                  backgroundColor: isMe ? theme.colors.primaryLight : theme.colors.card,
                  borderColor: isMe ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={{ width: 32, fontWeight: '800', color: theme.colors.text, fontSize: 16 }}>{item.rank}</Text>
              <Avatar uri={item.avatar} name={item.name} size={40} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>{item.name}{isMe ? ' (vous)' : ''}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Niveau {item.level}</Text>
              </View>
              <Text style={{ fontWeight: '800', color: theme.colors.primary }}>{item.points.toLocaleString('fr-FR')} pts</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  podium: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  bar: { width: '70%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 },
  barRank: { color: '#fff', fontWeight: '800', fontSize: 18 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
