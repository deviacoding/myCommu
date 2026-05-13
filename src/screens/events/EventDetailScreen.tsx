import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { events } from '../../mocks/events';
import { usersById } from '../../mocks/users';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/Avatar';

type Props = NativeStackScreenProps<AppStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const event = events.find((e) => e.id === route.params.eventId);
  const [going, setGoing] = useState(event?.going ?? false);
  if (!event) return null;
  const organizer = usersById[event.organizerId];
  const d = new Date(event.date);
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View>
          {event.cover ? (
            <Image source={{ uri: event.cover }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: theme.colors.primaryLight }]} />
          )}
          <SafeAreaView style={styles.backWrap} edges={['top']}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={{ padding: 18 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{event.title}</Text>

          <InfoRow icon="calendar-outline" label={dateStr} sub={event.time} />
          <InfoRow icon="location-outline" label={event.location} />
          <InfoRow icon="people-outline" label={`${event.attendees} participants`} />

          <Text style={[styles.section, { color: theme.colors.text }]}>À propos</Text>
          <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{event.description}</Text>

          <Text style={[styles.section, { color: theme.colors.text }]}>Organisateur</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar uri={organizer?.avatar} name={organizer?.name} size={44} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 15 }}>{organizer?.name}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Niveau {organizer?.level}</Text>
            </View>
          </View>

          <Text style={[styles.section, { color: theme.colors.text }]}>Lieu</Text>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <Ionicons name="map" size={32} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, marginTop: 8, fontWeight: '600' }}>Carte (mock)</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.cta, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Pressable
          onPress={() => setGoing((g) => !g)}
          style={[styles.ctaBtn, { backgroundColor: going ? theme.colors.success : theme.colors.primary }]}
        >
          <Ionicons name={going ? 'checkmark' : 'add'} size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {going ? 'Je participe' : 'Participer'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, sub }: { icon: any; label: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View>
        <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 15 }}>{label}</Text>
        {sub && <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 220, backgroundColor: '#eee' },
  backWrap: { position: 'absolute', left: 12, top: 0 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 17, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  desc: { fontSize: 15, lineHeight: 22 },
  mapPlaceholder: { height: 140, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
});
