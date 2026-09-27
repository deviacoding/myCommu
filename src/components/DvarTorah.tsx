import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Avatar } from './Avatar';
import { Muted, Pill } from './ui';
import { useAppState } from '../state/AppState';
import { Course } from '../types';
import { capitalize, formatLong } from '../utils/time';
import { renderRich } from './RichText';

// En-tête auteur façon réseau social : photo ronde du Rav, nom, fonction, date.
export function RavByline({ date, size = 52 }: { date?: string; size?: number }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { congregation } = useAppState();
  const rav = { ...congregation.rav, synagogue: congregation.name };
  return (
    <View style={styles.byline}>
      <Avatar source={rav.photo} name={rav.name} size={size} ring />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>{rav.name}</Text>
          <Ionicons name="checkmark-circle" size={16} color={c.primary} />
        </View>
        <Muted>{rav.title} · {rav.synagogue}</Muted>
        {date ? <Muted style={{ fontSize: 12 }}>{capitalize(formatLong(date))}</Muted> : null}
      </View>
    </View>
  );
}

// Corps complet d'un dvar Torah : titre, sous-titre, sections avec sources.
export function DvarTorahBody({ course, showTitle = true }: { course: Course; showTitle?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View>
      {showTitle ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Pill label={course.category} color={c.primary} />
            <Muted>{course.duration} de lecture · {course.level}</Muted>
          </View>
          <Text style={[styles.title, { color: c.text }]}>{course.title}</Text>
          <Text style={{ color: c.textMuted, fontSize: 15, marginTop: 6 }}>{course.subtitle}</Text>
        </>
      ) : null}
      {course.media ? (
        <View style={[styles.media, { backgroundColor: '#111827' }]}>
          <MaterialCommunityIcons name={course.media.type === 'photo' ? 'image' : 'play-circle'} size={56} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 8, fontSize: 15 }}>
            {course.media.type === 'video' ? 'Vidéo' : course.media.type === 'audio' ? 'Audio' : 'Photo'}
            {course.media.duration ? ` · ${course.media.duration}` : ''}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{course.media.name} · lecteur à venir (maquette)</Text>
        </View>
      ) : null}
      {course.sections.map((s, i) => (
        <View key={i} style={{ marginTop: 18 }}>
          {s.heading ? <Text style={[styles.heading, { color: c.text }]}>{s.heading}</Text> : null}
          {s.source ? (
            <View style={[styles.source, { borderLeftColor: c.secondary, backgroundColor: c.surface }]}>
              <Ionicons name="bookmark" size={14} color={c.secondary} />
              <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '600', flex: 1 }}>{s.source}</Text>
            </View>
          ) : null}
          <Text style={[styles.body, { color: c.text }]}>{renderRich(s.text)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  byline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 6, borderLeftWidth: 3, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
  body: { fontSize: 16, lineHeight: 26 },
  media: { borderRadius: 14, padding: 28, alignItems: 'center', marginTop: 16 },
});
