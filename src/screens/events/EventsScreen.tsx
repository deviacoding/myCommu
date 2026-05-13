import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { events as allEvents } from '../../mocks/events';
import { EventCard } from '../../components/EventCard';
import { useTheme } from '../../theme/ThemeProvider';
import { AppStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
const FILTERS = ['À venir', 'Cette semaine', 'Ma communauté', 'Mes événements'] as const;

export function EventsScreen() {
  const { theme, community } = useTheme();
  const nav = useNavigation<Nav>();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('À venir');

  const events = useMemo(() => {
    if (filter === 'Ma communauté') return allEvents.filter((e) => e.community === community);
    if (filter === 'Mes événements') return allEvents.filter((e) => e.going);
    return allEvents;
  }, [filter, community]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Événements</Text>
        <Pressable style={[styles.iconBtn, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? theme.colors.textOnPrimary : theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => <EventCard event={item} onPress={() => nav.navigate('EventDetail', { eventId: item.id })} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 24, fontWeight: '800' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  filterRow: { paddingVertical: 10, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
});
