import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { badges } from '../../mocks/badges';
import { currentUser } from '../../mocks/users';
import { useTheme } from '../../theme/ThemeProvider';
import { ScreenHeader } from '../../components/ScreenHeader';
import { BadgeChip } from '../../components/BadgeChip';

type Props = NativeStackScreenProps<AppStackParamList, 'Badges'>;

export function BadgesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const earned = badges.filter((b) => currentUser.badges.includes(b.id)).map((b) => ({ ...b, earned: true }));
  const locked = badges.filter((b) => !currentUser.badges.includes(b.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Badges" subtitle={`${earned.length} / ${badges.length} débloqués`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={[styles.section, { color: theme.colors.text }]}>Obtenus</Text>
        <View style={styles.grid}>
          {earned.map((b) => (
            <BadgeChip key={b.id} badge={b} large />
          ))}
        </View>

        <Text style={[styles.section, { color: theme.colors.text, marginTop: 28 }]}>À débloquer</Text>
        <View style={styles.grid}>
          {locked.map((b) => (
            <View key={b.id} style={{ width: '33%', alignItems: 'center', marginBottom: 18 }}>
              <BadgeChip badge={b} large />
              <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4, paddingHorizontal: 4 }} numberOfLines={2}>
                {b.description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
});
