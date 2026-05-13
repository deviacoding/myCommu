import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { usersById } from '../mocks/users';
import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeProvider';
import { timeAgo } from '../utils/time';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  const { theme } = useTheme();
  const author = usersById[post.authorId];
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.headerRow}>
        <Avatar uri={author?.avatar} name={author?.name} size={42} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{author?.name}</Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {author?.handle} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
      </View>
      <Text style={[styles.content, { color: theme.colors.text }]}>{post.content}</Text>
      {post.image && <Image source={{ uri: post.image }} style={styles.image} />}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.map((t) => (
            <Text key={t} style={[styles.tag, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>
              #{t}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked ? theme.colors.danger : theme.colors.textMuted}
          />
          <Text style={[styles.actionTxt, { color: theme.colors.textMuted }]}>{post.likes}</Text>
        </View>
        <View style={styles.action}>
          <Ionicons name="chatbubble-outline" size={19} color={theme.colors.textMuted} />
          <Text style={[styles.actionTxt, { color: theme.colors.textMuted }]}>{post.comments}</Text>
        </View>
        <View style={styles.action}>
          <Ionicons name="paper-plane-outline" size={19} color={theme.colors.textMuted} />
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons name="bookmark-outline" size={19} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  name: { fontWeight: '700', fontSize: 15 },
  meta: { fontSize: 12, marginTop: 2 },
  content: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
  image: { width: '100%', aspectRatio: 16 / 10, borderRadius: 10, marginBottom: 10, backgroundColor: '#eee' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionTxt: { fontSize: 13, fontWeight: '500' },
});
