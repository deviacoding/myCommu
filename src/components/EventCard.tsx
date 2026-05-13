import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { useTheme } from '../theme/ThemeProvider';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { theme } = useTheme();
  const d = new Date(event.date);
  const day = d.getDate();
  const month = d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      {event.cover && <Image source={{ uri: event.cover }} style={styles.cover} />}
      <View style={styles.body}>
        <View style={[styles.dateBadge, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.day, { color: theme.colors.primary }]}>{day}</Text>
          <Text style={[styles.month, { color: theme.colors.primary }]}>{month}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{event.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.meta, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{event.attendees} participants</Text>
          </View>
        </View>
        {event.going && (
          <View style={[styles.going, { backgroundColor: theme.colors.success }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  cover: { width: '100%', height: 120, backgroundColor: '#eee' },
  body: { flexDirection: 'row', padding: 12 },
  dateBadge: { width: 54, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  day: { fontSize: 22, fontWeight: '800', lineHeight: 24 },
  month: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { fontSize: 13 },
  going: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
});
