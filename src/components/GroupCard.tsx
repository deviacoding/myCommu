import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../types';
import { useTheme } from '../theme/ThemeProvider';

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      {group.cover && <Image source={{ uri: group.cover }} style={styles.cover} />}
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {group.description}
        </Text>
        <View style={styles.row}>
          <View style={styles.metaRow}>
            <Ionicons name="people" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{group.members} membres</Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: group.joined ? theme.colors.primaryLight : theme.colors.primary,
              },
            ]}
          >
            <Text style={{ color: group.joined ? theme.colors.primary : theme.colors.textOnPrimary, fontWeight: '700', fontSize: 12 }}>
              {group.joined ? 'Rejoint' : 'Rejoindre'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  cover: { width: '100%', height: 80, backgroundColor: '#eee' },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: 13 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
});
