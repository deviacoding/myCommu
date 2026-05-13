import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { groups } from '../../mocks/groups';
import { posts } from '../../mocks/posts';
import { useTheme } from '../../theme/ThemeProvider';
import { PostCard } from '../../components/PostCard';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupDetail'>;

export function GroupDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const group = groups.find((g) => g.id === route.params.groupId);
  const [joined, setJoined] = useState(group?.joined ?? false);
  if (!group) return null;
  const groupPosts = posts.filter((p) => p.community === group.community).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={groupPosts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <View>
              {group.cover ? (
                <Image source={{ uri: group.cover }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, { backgroundColor: theme.colors.primaryLight }]} />
              )}
              <SafeAreaView edges={['top']} style={styles.backWrap}>
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </Pressable>
              </SafeAreaView>
            </View>
            <View style={{ padding: 18 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{group.name}</Text>
              <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{group.description}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="people" size={16} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>{group.members} membres</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                <Pressable
                  onPress={() => setJoined((j) => !j)}
                  style={[
                    styles.btn,
                    { backgroundColor: joined ? theme.colors.primaryLight : theme.colors.primary, flex: 1 },
                  ]}
                >
                  <Text style={{ color: joined ? theme.colors.primary : theme.colors.textOnPrimary, fontWeight: '700' }}>
                    {joined ? 'Quitter le groupe' : 'Rejoindre'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.iconBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
                </Pressable>
                <Pressable
                  style={[styles.iconBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
                </Pressable>
              </View>
              <Text style={[styles.section, { color: theme.colors.text }]}>Publications récentes</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 180, backgroundColor: '#eee' },
  backWrap: { position: 'absolute', left: 12, top: 0 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  desc: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 17, fontWeight: '700', marginTop: 24 },
});
