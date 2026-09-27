import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, Pill, Muted, Button } from '../../components/ui';
import { courses } from '../../mocks/courses';
import { formatLong, capitalize } from '../../utils/time';

type Props = NativeStackScreenProps<AppStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { markCourseRead, readCourses } = useAppState();
  const course = courses.find((x) => x.id === route.params.courseId);

  useEffect(() => {
    if (course) markCourseRead(course.id);
  }, [course, markCourseRead]);

  if (!course) return null;
  const read = readCourses.includes(course.id);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title={course.category} subtitle={course.teacher} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>{course.title}</Text>
        <Text style={{ color: c.textMuted, fontSize: 15, marginTop: 6 }}>{course.subtitle}</Text>
        <View style={styles.metaRow}>
          <Pill label={course.level} color={c.primary} />
          <Muted>{course.duration} de lecture</Muted>
          <Muted>· {capitalize(formatLong(course.date))}</Muted>
        </View>

        <Card style={[styles.player, { backgroundColor: c.primaryLight, borderColor: c.primaryLight }]}>
          <Ionicons name="play-circle" size={40} color={c.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>Écouter le cours</Text>
            <Muted>Audio {course.duration} · maquette, lecteur à venir</Muted>
          </View>
        </Card>

        {course.sections.map((s, i) => (
          <View key={i} style={{ marginTop: 18 }}>
            {s.heading ? <Text style={[styles.heading, { color: c.text }]}>{s.heading}</Text> : null}
            {s.source ? (
              <View style={[styles.source, { borderLeftColor: c.secondary, backgroundColor: c.surface }]}>
                <Ionicons name="bookmark" size={14} color={c.secondary} />
                <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '600', flex: 1 }}>{s.source}</Text>
              </View>
            ) : null}
            <Text style={[styles.body, { color: c.text }]}>{s.text}</Text>
          </View>
        ))}

        <Card style={{ marginTop: 28, alignItems: 'center', gap: 8 }}>
          <Ionicons name={read ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={c.success} />
          <Text style={{ color: c.text, fontWeight: '700' }}>Cours suivi · +18 points d’ora</Text>
          <Muted style={{ textAlign: 'center' }}>Chaque cours étudié fait grandir votre ora dans l’onglet Compte.</Muted>
          <Button label="Retour aux cours" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 6, alignSelf: 'stretch' }} />
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  player: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 6, borderLeftWidth: 3, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
  body: { fontSize: 16, lineHeight: 26 },
});
