import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { posts as allPosts } from '../../mocks/posts';
import { PostCard } from '../../components/PostCard';
import { Avatar } from '../../components/Avatar';
import { currentUser } from '../../mocks/users';
import { useTheme } from '../../theme/ThemeProvider';
import { AppStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
const FILTERS = ['Pour vous', 'Ma communauté', 'Tendances', 'Récents'] as const;

export function FeedScreen() {
  const { theme, community } = useTheme();
  const nav = useNavigation<Nav>();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Pour vous');

  const posts = useMemo(() => {
    if (filter === 'Ma communauté') return allPosts.filter((p) => p.community === community);
    if (filter === 'Tendances') return [...allPosts].sort((a, b) => b.likes - a.likes);
    return allPosts;
  }, [filter, community]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.brand, { color: theme.colors.primary }]}>myCommu</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => nav.navigate('Search')} hitSlop={8}>
            <Ionicons name="search" size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable onPress={() => nav.navigate('Notifications')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </View>
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
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => nav.navigate('CreatePost')}
            style={[styles.composer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Avatar uri={currentUser.avatar} name={currentUser.name} size={38} />
            <Text style={[styles.composerTxt, { color: theme.colors.textMuted }]}>
              Partagez quelque chose avec votre communauté…
            </Text>
            <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
          </Pressable>
        }
        renderItem={({ item }) => <PostCard post={item} onPress={() => nav.navigate('PostDetail', { postId: item.id })} />}
      />

      <Pressable
        onPress={() => nav.navigate('CreatePost')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  brand: { fontSize: 22, fontWeight: '800' },
  filterRow: { paddingVertical: 10, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  composer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12, gap: 10 },
  composerTxt: { flex: 1, fontSize: 14 },
  fab: { position: 'absolute', right: 18, bottom: 18, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
