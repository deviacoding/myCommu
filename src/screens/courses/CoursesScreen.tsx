import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { LiveBanner } from '../../components/LiveBanner';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { DvarTorahBody, RavByline } from '../../components/DvarTorah';
import { Card, Chip, SectionTitle, Pill, Muted } from '../../components/ui';
import { CourseCategory } from '../../types';
import { formatShort } from '../../utils/time';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Filter = 'Tous' | CourseCategory;


export function CoursesScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const { readCourses, markCourseRead, myCourses: courses, congregation, seed } = useAppState();
  const filters: Filter[] = ['Tous', ...seed.themes];
  const [filter, setFilter] = useState<Filter>('Tous');
  const [liked, setLiked] = useState(false);

  // Le dernier dvar Torah publié s'affiche directement, en entier.
  const latest = [...courses].sort((a, b) => (a.date < b.date ? 1 : -1)).find((x) => x.featured) ?? courses[0];
  const others = courses.filter((x) => x.id !== latest.id && (filter === 'Tous' || x.category === filter));

  useEffect(() => {
    markCourseRead(latest.id);
  }, [latest.id, markCourseRead]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader
        title={seed.teachingLabel}
        subtitle={seed.teachingSubtitle(congregation.rav.name)}
        communitySwitch
      />
      <ScrollView contentContainerStyle={styles.content}>
        <LiveBanner />
        <SectionTitle title={seed.teachingLatestTitle} action={`${readCourses.length} lus`} />
        <Card style={{ padding: 18 }}>
          <RavByline date={latest.date} />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <DvarTorahBody course={latest} />
          <View style={[styles.actions, { borderTopColor: c.border }]}>
            <Pressable onPress={() => setLiked((v) => !v)} style={styles.action} hitSlop={6}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? c.danger : c.textMuted} />
              <Text style={{ color: liked ? c.danger : c.textMuted, fontWeight: '600' }}>{liked ? 48 : 47}</Text>
            </Pressable>
            <Pressable style={styles.action} hitSlop={6} onPress={() => navigation.navigate('AskQuestion')}>
              <Ionicons name="chatbubble-outline" size={20} color={c.textMuted} />
              <Text style={{ color: c.textMuted, fontWeight: '600' }}>Poser une question</Text>
            </Pressable>
            <Pressable style={styles.action} hitSlop={6}>
              <Ionicons name="share-social-outline" size={20} color={c.textMuted} />
              <Text style={{ color: c.textMuted, fontWeight: '600' }}>Partager</Text>
            </Pressable>
          </View>
        </Card>

        <SectionTitle title={seed.teachingPreviousTitle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
          {filters.map((f) => (
            <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {others.map((course) => {
          const read = readCourses.includes(course.id);
          return (
            <Card key={course.id} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} style={{ flexDirection: 'row', gap: 12 }}>
              <Avatar source={congregation.rav.photo} name={congregation.rav.name} size={44} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pill label={course.category} color={c.primary} />
                  <Muted>{formatShort(course.date)}</Muted>
                  {read ? <Ionicons name="checkmark-done" size={16} color={c.success} /> : null}
                </View>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15, marginTop: 6 }}>{course.title}</Text>
                <Muted style={{ marginTop: 2 }}>{course.subtitle}</Muted>
                <Muted style={{ marginTop: 6 }}>{course.teacher} · {course.duration}</Muted>
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
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 22, paddingTop: 14, flexWrap: 'wrap', gap: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
