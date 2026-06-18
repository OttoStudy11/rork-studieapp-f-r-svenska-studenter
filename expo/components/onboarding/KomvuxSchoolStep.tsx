import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { KOMVUX_COURSES, KOMVUX_SUBJECT_CATEGORIES, getKomvuxCoursesBySubject, type KomvuxCourse } from '@/constants/komvux-courses';
import { MAX_COURSES } from '@/lib/course-assignment';
import type { OnboardingData } from './shared';
import { ACCENT } from './shared';

interface Props {
  data: OnboardingData;
  setData: (d: OnboardingData) => void;
  komvuxSubjectFilter: string;
  setKomvuxSubjectFilter: (s: string) => void;
}

export default function KomvuxSchoolStep({
  data,
  setData,
  komvuxSubjectFilter,
  setKomvuxSubjectFilter,
}: Props): React.ReactElement {
  const filteredCourses = getKomvuxCoursesBySubject(komvuxSubjectFilter);
  const selectedCount = data.selectedCourses.size;

  const toggleCourse = (courseId: string) => {
    const ns = new Set(data.selectedCourses);
    if (ns.has(courseId)) {
      ns.delete(courseId);
    } else if (ns.size < MAX_COURSES) {
      ns.add(courseId);
    }
    setData({ ...data, selectedCourses: ns });
  };

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vilka kurser läser du?</Text>
      <Text style={styles.pageSubtitle}>
        {selectedCount === 0
          ? 'Välj de kurser du vill läsa på Komvux'
          : `${selectedCount} kurs${selectedCount !== 1 ? 'er' : ''} valda`}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginBottom: 4 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {KOMVUX_SUBJECT_CATEGORIES.map((cat) => {
          const active = komvuxSubjectFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.subjectChip,
                active && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}
              onPress={() => setKomvuxSubjectFilter(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.subjectChipEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.subjectChipText,
                  active && { color: '#fff', fontWeight: '700' as const },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {komvuxSubjectFilter === 'all' && selectedCount === 0 && (
        <View style={styles.komvuxRecommendBanner}>
          <Text style={styles.komvuxRecommendText}>
            💡 Vanligast bland Komvux-elever: Svenska 1, Engelska 5, Matematik 1b, Historia 1b, Samhällskunskap 1b
          </Text>
        </View>
      )}

      <View style={{ gap: 8, marginTop: 12 }}>
        {filteredCourses.map((course: KomvuxCourse) => {
          const sel = data.selectedCourses.has(course.id);
          const atMax = selectedCount >= MAX_COURSES && !sel;
          return (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.komvuxCourseRow,
                sel && styles.komvuxCourseRowSel,
                atMax && { opacity: 0.45 },
              ]}
              onPress={() => !atMax && toggleCourse(course.id)}
              activeOpacity={atMax ? 1 : 0.75}
            >
              <View style={[styles.smallCheck, sel && styles.smallCheckOn]}>
                {sel && <Check size={11} color="#fff" />}
              </View>
              <Text style={styles.komvuxCourseEmoji}>{course.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.courseTitle, sel && { color: ACCENT }]}>
                  {course.name}
                </Text>
                <Text style={styles.komvuxCourseMeta}>
                  {course.points} p · {course.code}
                </Text>
              </View>
              {sel && (
                <View style={styles.komvuxSelBadge}>
                  <Check size={12} color={ACCENT} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedCount >= MAX_COURSES && (
        <Text style={[styles.hintTxt, { marginTop: 12, color: '#F59E0B' }]}>
          Max {MAX_COURSES} kurser valda
        </Text>
      )}
    </ScrollView>
  );
}
