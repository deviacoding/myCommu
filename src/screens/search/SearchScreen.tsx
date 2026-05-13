import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { users } from '../../mocks/users';
import { groups } from '../../mocks/groups';
import { events } from '../../mocks/events';
import { Avatar } from '../../components/Avatar';

type Props = NativeStackScreenProps<AppStackParamList, 'Search'>;
const TABS = ['Tout', 'Personnes', 'Groupes', 'Événements'] as const;
const SUGGESTIONS = ['shabbat', 'iftar', 'prière', 'paroisse', 'solidarité', 'étudiants', 'concert'];

export function SearchScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>('Tout');

  const results = useMemo(() => {
    const lc = q.toLowerCase();
    return {
      users: users.filter((u) => u.name.toLowerCase().includes(lc) || u.handle.toLowerCase().includes(lc)),
      groups: groups.filter((g) => g.name.toLowerCase().includes(lc)),
      events: events.filter((e) => e.title.toLowerCase().includes(lc)),
    };
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
        </Pressable>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher des personnes, groupes…"
            placeholderTextColor={theme.colors.textMuted}
            style={{ flex: 1, color: theme.colors.text }}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? theme.colors.textOnPrimary : theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                {t}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {q.length === 0 ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[styles.section, { color: theme.colors.text }]}>Recherches populaires</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setQ(s)}
                style={[styles.sugg, { backgroundColor: theme.colors.primaryLight }]}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>#{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.section, { color: theme.colors.text }]}>Suggestions pour vous</Text>
          {users.slice(1, 4).map((u) => (
            <View key={u.id} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
              <Avatar uri={u.avatar} name={u.name} size={46} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{u.name}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{u.handle}</Text>
              </View>
              <Pressable style={[styles.followBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Suivre</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={[
            ...(tab === 'Tout' || tab === 'Personnes' ? results.users.map((u) => ({ kind: 'user' as const, item: u })) : []),
            ...(tab === 'Tout' || tab === 'Groupes' ? results.groups.map((g) => ({ kind: 'group' as const, item: g })) : []),
            ...(tab === 'Tout' || tab === 'Événements' ? results.events.map((e) => ({ kind: 'event' as const, item: e })) : []),
          ]}
          keyExtractor={(r, i) => `${r.kind}-${r.item.id}-${i}`}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 }}>
              Aucun résultat pour « {q} »
            </Text>
          }
          renderItem={({ item }) => {
            if (item.kind === 'user') {
              const u = item.item;
              return (
                <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
                  <Avatar uri={u.avatar} name={u.name} size={42} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{u.name}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{u.handle} · Niveau {u.level}</Text>
                  </View>
                </View>
              );
            }
            if (item.kind === 'group') {
              const g = item.item;
              return (
                <Pressable
                  onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                  style={[styles.row, { borderBottomColor: theme.colors.border }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryLight }]}>
                    <Ionicons name="people" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{g.name}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{g.members} membres</Text>
                  </View>
                </Pressable>
              );
            }
            const e = item.item;
            return (
              <Pressable
                onPress={() => navigation.navigate('EventDetail', { eventId: e.id })}
                style={[styles.row, { borderBottomColor: theme.colors.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="calendar" size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{e.title}</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{e.date} · {e.location}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  tabs: { paddingVertical: 10, flexGrow: 0 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sugg: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
});
