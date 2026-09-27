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

type Props = NativeStackScreenProps<AppStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { markCourseRead, readCourses, courses } = useAppState();
  const course = courses.find((x) => x.id === route.params.courseId);

  useEffect(() => {
    if (course) markCourseRead(course.id);
  }, [course, markCourseRead]);

  if (!course) return null;
  const read = readCourses.includes(course.id);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top']}>
      <ScreenHeader title="Dvar Torah" subtitle={course.category} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <RavByline date={course.date} />
        <View style={{ height: 18 }} />
        <DvarTorahBody course={course} />

        <Card style={{ marginTop: 28, alignItems: 'center', gap: 8 }}>
          <Ionicons name={read ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={c.success} />
          <Text style={{ color: c.text, fontWeight: '700' }}>Dvar Torah lu · +18 points d’ora</Text>
          <Muted style={{ textAlign: 'center' }}>Chaque dvar Torah étudié fait grandir votre ora dans l’onglet Compte.</Muted>
          <Button label="Retour aux divré Torah" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 6, alignSelf: 'stretch' }} />
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
