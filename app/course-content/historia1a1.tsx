import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronRight, BookOpen, Clock, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'exercise';
}

const COURSE_MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Historiska tidsbegrepp och epokindelning',
    description: 'Grundläggande historisk terminologi och periodindelning',
    lessons: [
      {
        id: 'l1',
        title: 'Vad är historia?',
        description: 'Introduktion till historieämnet och varför vi studerar det förflutna',
        duration: '20 min',
        type: 'reading',
      },
      {
        id: 'l2',
        title: 'Historiska epoker',
        description: 'Överblick över historiens huvudepoker: antiken, medeltiden, nyare tid',
        duration: '25 min',
        type: 'video',
      },
      {
        id: 'l3',
        title: 'Källkritik och historisk metod',
        description: 'Hur historiker arbetar med källor och bevis',
        duration: '30 min',
        type: 'reading',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Antiken: Grekland och Rom',
    description: 'De gamla högkulturerna runt Medelhavet',
    lessons: [
      {
        id: 'l4',
        title: 'Det antika Grekland',
        description: 'Grekisk kultur, demokrati och filosofi',
        duration: '35 min',
        type: 'video',
      },
      {
        id: 'l5',
        title: 'Romarriket',
        description: 'Från republik till kejsardöme',
        duration: '40 min',
        type: 'reading',
      },
      {
        id: 'l6',
        title: 'Antikens arv',
        description: 'Hur den antika kulturen påverkat vår tid',
        duration: '25 min',
        type: 'exercise',
      },
    ],
  },
  {
    id: 'm3',
    title: 'Medeltiden i Europa',
    description: 'Från romarrikets fall till renässansen',
    lessons: [
      {
        id: 'l7',
        title: 'Folkvandringstiden',
        description: 'Romarrikets fall och nya riken',
        duration: '30 min',
        type: 'reading',
      },
      {
        id: 'l8',
        title: 'Feodalsamhället',
        description: 'Samhällsstruktur, riddare och jordbruk',
        duration: '35 min',
        type: 'video',
      },
      {
        id: 'l9',
        title: 'Kyrkans makt',
        description: 'Religionens roll i medeltiden',
        duration: '30 min',
        type: 'reading',
      },
    ],
  },
];

const courseStyle = {
  emoji: '🏛️',
  gradient: ['#F97316', '#EA580C'],
  primaryColor: '#F97316',
  lightColor: '#FFEDD5',
};

export default function Historia1a1Screen() {
  const { theme, isDark } = useTheme();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen
        options={{
          title: 'Historia 1a1',
          headerShown: true,
          headerStyle: { backgroundColor: courseStyle.primaryColor },
          headerTintColor: 'white',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={courseStyle.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.courseHeader}
        >
          <View style={styles.courseTitleRow}>
            <Text style={styles.courseEmoji}>{courseStyle.emoji}</Text>
            <View style={styles.courseTitleContainer}>
              <Text style={styles.courseTitle}>Historia 1a1</Text>
              <Text style={styles.courseSubject}>Historia</Text>
            </View>
          </View>
          <Text style={styles.courseDescription}>
            Upptäck hur mänskliga samhällen har utvecklats genom tiderna, från antiken till medeltiden.
          </Text>

          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <BookOpen size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.quickStatText}>{COURSE_MODULES.length} moduler</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Clock size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.quickStatText}>50 poäng</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Target size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.quickStatText}>År 1</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📖 Kursinnehåll</Text>
          {COURSE_MODULES.map((module, moduleIndex) => (
            <View key={module.id} style={[styles.moduleCard, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModule(module.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeaderContent}>
                  <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
                    {moduleIndex + 1}. {module.title}
                  </Text>
                  <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                    {module.description}
                  </Text>
                  <Text style={[styles.lessonCount, { color: theme.colors.textMuted }]}>
                    {module.lessons.length} lektioner
                  </Text>
                </View>
                <ChevronRight
                  size={24}
                  color={theme.colors.textMuted}
                  style={{
                    transform: [{ rotate: expandedModule === module.id ? '90deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>

              {expandedModule === module.id && (
                <View style={styles.lessonsContainer}>
                  {module.lessons.map((lesson, lessonIndex) => (
                    <View
                      key={lesson.id}
                      style={[
                        styles.lessonCard,
                        { backgroundColor: theme.colors.surface },
                      ]}
                    >
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
                          {lessonIndex + 1}. {lesson.title}
                        </Text>
                        <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
                          {lesson.description}
                        </Text>
                        <Text style={[styles.lessonDuration, { color: theme.colors.textMuted }]}>
                          {lesson.duration}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>💡 Om kursen</Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Historia 1a1 är den första delen av historiekursen på gymnasiet. Kursen ger dig kunskap om
              historiska tidsbegrepp och viktiga händelser från antiken och medeltiden.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  courseHeader: {
    padding: 24,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  courseTitleContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  courseSubject: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  courseDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  lessonCount: {
    fontSize: 12,
  },
  lessonsContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 12,
    marginBottom: 6,
  },
  lessonDuration: {
    fontSize: 10,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
