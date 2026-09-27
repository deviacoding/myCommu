import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, Chip, SectionTitle, Pill, Muted } from '../../components/ui';
import { courses } from '../../mocks/courses';
import { CourseCategory } from '../../types';
import { formatShort } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Filter = 'Tous' | CourseCategory;

const filters: Filter[] = ['Tous', 'Fête', 'Paracha', 'Halakha', 'Moussar', 'Michna'];

export function CoursesScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { readCourses } = useAppState();
  const [filter, setFilter] = useState<Filter>('Tous');

  const featured = courses.find((x) => x.featured)!;
  const list = courses.filter((x) => !x.featured && (filter === 'Tous' || x.category === filter));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Cours" subtitle={`${readCourses.length} cours suivis · ${courses.length} disponibles`} />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Cours de la semaine" />
        <Card onPress={() => navigation.navigate('CourseDetail', { courseId: featured.id })} style={[styles.featured, { backgroundColor: c.primary, borderColor: c.primary }]}>
          <Pill label={featured.category.toUpperCase()} color={c.secondary} style={{ backgroundColor: c.secondary + '33' }} />
          <Text style={[styles.featuredTitle, { color: c.textOnPrimary }]}>{featured.title}</Text>
          <Text style={{ color: c.textOnPrimary, opacity: 0.85, marginTop: 4 }}>{featured.subtitle}</Text>
          <View style={[styles.metaRow, { marginTop: 14 }]}>
            <Ionicons name="person-circle-outline" size={18} color={c.textOnPrimary} />
            <Text style={{ color: c.textOnPrimary, fontWeight: '600' }}>{featured.teacher}</Text>
            <Text style={{ color: c.textOnPrimary, opacity: 0.7 }}>· {featured.duration}</Text>
            <View style={{ flex: 1 }} />
            {readCourses.includes(featured.id) ? (
              <Ionicons name="checkmark-circle" size={20} color={c.secondary} />
            ) : (
              <Ionicons name="play-circle" size={22} color={c.secondary} />
            )}
          </View>
        </Card>

        <SectionTitle title="Tous les cours" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
          {filters.map((f) => (
            <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {list.map((course) => {
          const read = readCourses.includes(course.id);
          return (
            <Card key={course.id} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.thumb, { backgroundColor: c.primaryLight }]}>
                <Ionicons name={read ? 'checkmark-done' : 'book-outline'} size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pill label={course.category} color={c.primary} />
                  <Muted>{course.level}</Muted>
                </View>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15, marginTop: 6 }}>{course.title}</Text>
                <Muted style={{ marginTop: 2 }}>{course.subtitle}</Muted>
                <View style={[styles.metaRow, { marginTop: 8 }]}>
                  <Muted>{course.teacher}</Muted>
                  <Muted>· {course.duration}</Muted>
                  <Muted>· {formatShort(course.date)}</Muted>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.textMuted} style={{ alignSelf: 'center' }} />
            </Card>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  featured: { padding: 18 },
  featuredTitle: { fontSize: 21, fontWeight: '800', marginTop: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  thumb: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
