import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/AppState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { DvarTorahBody, RavByline } from '../../components/DvarTorah';
import { Card, Muted, Button } from '../../components/ui';
import { EmptyState } from '../../components/EmptyState';

type Props = NativeStackScreenProps<AppStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { markCourseRead, readCourses, courses, seed, recordActivity } = useAppState();
  const course = courses.find((x) => x.id === route.params.courseId);

  // Lu jusqu'en bas, ou 30 secondes passées sur le cours : alors seulement il compte (2 points).
  useEffect(() => {
    if (!course) return;
    const t = setTimeout(() => {
      markCourseRead(course.id);
      recordActivity('course');
    }, 30000);
    return () => clearTimeout(t);
  }, [course, markCourseRead, recordActivity]);
  const onScroll = (e: { nativeEvent: { contentOffset: { y: number }; layoutMeasurement: { height: number }; contentSize: { height: number } } }) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (course && contentOffset.y + layoutMeasurement.height >= contentSize.height - 40) {
      markCourseRead(course.id);
      recordActivity('course');
    }
  };

  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
        <ScreenHeader title={seed.teachingLabel} onBack={() => navigation.goBack()} />
        <View style={{ padding: 16 }}>
          <EmptyState icon="book-outline" title="Ce cours n’est plus disponible" hint="Il a peut-être été retiré par votre responsable." />
        </View>
      </SafeAreaView>
    );
  }
  const read = readCourses.includes(course.id);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title={seed.teachingLabel} subtitle={course.category} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} onScroll={onScroll} scrollEventThrottle={400}>
        <RavByline date={course.date} />
        <View style={{ height: 18 }} />
        <DvarTorahBody course={course} />

        <Card style={{ marginTop: 28, alignItems: 'center', gap: 8 }}>
          <Ionicons name={read ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={c.success} />
          <Text style={{ color: c.text, fontWeight: '700' }}>{seed.teachingLabel} lu · +18 points</Text>
          <Muted style={{ textAlign: 'center' }}>{seed.gamification.growHint}</Muted>
          <Button label={`Retour : ${seed.teachingPlural}`} variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 6, alignSelf: 'stretch' }} />
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
});
