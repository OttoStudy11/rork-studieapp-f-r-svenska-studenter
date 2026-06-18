import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AIStudyInsights, AIQuickHelp } from '@/components/AIStudyInsights';
import CourseAIChat from '@/components/CourseAIChat';
import type { CourseHeroStyle } from '@/components/CourseHero';

interface CourseAISectionProps {
  courseTitle: string;
  courseDescription: string;
  userCourseData: { progress: number } | null;
  userProgress: { completed: number; total: number };
  courseStyle: CourseHeroStyle;
  accentColor: string;
  theme: {
    colors: {
      text: string;
      textMuted: string;
      card: string;
    };
  };
}

export default function CourseAISection({
  courseTitle,
  courseDescription,
  userCourseData,
  userProgress,
  courseStyle,
  accentColor,
  theme,
}: CourseAISectionProps) {
  return (
    <View style={styles.aiSection}>
      <View style={styles.aiSectionHeader}>
        <Sparkles size={24} color={accentColor} />
        <Text style={[styles.aiSectionTitle, { color: theme.colors.text }]}>
          AI-Assisterad Inlärning
        </Text>
      </View>

      <AIStudyInsights
        courseTitle={courseTitle}
        courseDescription={courseDescription}
        progress={userCourseData?.progress || 0}
        totalLessons={userProgress.total}
        completedLessons={userProgress.completed}
        courseStyle={courseStyle as any}
      />

      <AIQuickHelp
        courseTitle={courseTitle}
        courseStyle={courseStyle as any}
        onAskQuestion={(question) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(
            `/ai-chat?question=${encodeURIComponent(question)}&course=${encodeURIComponent(courseTitle)}` as any
          );
        }}
      />

      <CourseAIChat
        courseTitle={courseTitle}
        accentColor={accentColor}
        compact
      />
    </View>
  );
}

const styles = StyleSheet.create({
  aiSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  aiSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
});
