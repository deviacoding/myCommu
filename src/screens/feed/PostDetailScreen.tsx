import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { posts } from '../../mocks/posts';
import { usersById } from '../../mocks/users';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { ScreenHeader } from '../../components/ScreenHeader';
import { timeAgo } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'PostDetail'>;

const FAKE_COMMENTS = [
  { id: 'cm1', authorId: 'u1', text: 'Magnifique, merci pour le partage !', createdAt: '2026-05-13T09:00:00Z' },
  { id: 'cm2', authorId: 'u4', text: 'Très inspirant. Chabbat Shalom.', createdAt: '2026-05-13T08:45:00Z' },
  { id: 'cm3', authorId: 'u3', text: 'Belle initiative que vous menez.', createdAt: '2026-05-13T08:20:00Z' },
];

export function PostDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const post = posts.find((p) => p.id === route.params.postId);
  if (!post) return null;
  const author = usersById[post.authorId];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScreenHeader title="Publication" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Avatar uri={author?.avatar} name={author?.name} size={48} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 16 }}>{author?.name}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {author?.handle} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24 }}>{post.content}</Text>
        {post.image && <Image source={{ uri: post.image }} style={styles.img} />}

        <View style={[styles.stats, { borderColor: theme.colors.border }]}>
          <StatBtn icon={post.liked ? 'heart' : 'heart-outline'} label={`${post.likes} J’aime`} color={post.liked ? theme.colors.danger : theme.colors.textMuted} />
          <StatBtn icon="chatbubble-outline" label={`${post.comments} Commentaires`} />
          <StatBtn icon="paper-plane-outline" label="Partager" />
        </View>

        <Text style={[styles.section, { color: theme.colors.text }]}>Commentaires</Text>
        {FAKE_COMMENTS.map((c) => {
          const a = usersById[c.authorId];
          return (
            <View key={c.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Avatar uri={a?.avatar} name={a?.name} size={36} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={[styles.bubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={{ fontWeight: '700', color: theme.colors.text }}>{a?.name}</Text>
                  <Text style={{ color: theme.colors.text, marginTop: 4 }}>{c.text}</Text>
                </View>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                  {timeAgo(c.createdAt)} · Répondre
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.composer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TextInput
          placeholder="Écrire un commentaire…"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
        />
        <Pressable style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatBtn({ icon, label, color }: { icon: any; label: string; color?: string }) {
  const { theme } = useTheme();
  return (
    <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={20} color={color || theme.colors.textMuted} />
      <Text style={{ color: color || theme.colors.textMuted, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', aspectRatio: 16 / 10, borderRadius: 12, marginTop: 14, backgroundColor: '#eee' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, marginTop: 18, marginBottom: 18 },
  section: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  bubble: { padding: 10, borderRadius: 14, borderWidth: 1 },
  composer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
