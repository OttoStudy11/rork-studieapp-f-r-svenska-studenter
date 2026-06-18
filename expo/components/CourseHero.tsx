import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  Trophy,
  Zap,
  Sparkles,
  Edit3,
} from 'lucide-react-native';

export interface CourseHeroCourse {
  id: string;
  title: string;
  description: string;
  subject: string;
  level?: string;
}

export interface CourseHeroStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
}

export interface CourseHeroProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface CourseHeroProps {
  course: CourseHeroCourse;
  courseStyle: CourseHeroStyle;
  userCourseData: { progress: number; target_grade?: string } | null;
  userProgress: CourseHeroProgress;
  modulesCount: number;
  totalHours: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onEdit: () => void;
}

export default function CourseHero({
  course,
  courseStyle,
  userCourseData,
  userProgress,
  modulesCount,
  totalHours,
  fadeAnim,
  slideAnim,
  onEdit,
}: CourseHeroProps) {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={[courseStyle.gradient[0], courseStyle.gradient[1]] as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.courseHeader}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <View style={styles.courseHeaderContent}>
            <View style={styles.courseTitleSection}>
              <View
                style={[
                  styles.emojiContainer,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <Text style={styles.courseEmojiLarge}>{courseStyle.emoji}</Text>
              </View>
              <View style={styles.courseTitleContainer}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.subjectBadge}>
                  <Sparkles size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.courseSubject}>{course.subject}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.courseDescription}>{course.description}</Text>

            {userCourseData && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressLabelContainer}>
                    <TrendingUp size={18} color="white" />
                    <Text style={styles.progressLabel}>Din framgång</Text>
                  </View>
                  <View style={styles.progressPercentBadge}>
                    <Text style={styles.progressPercent}>
                      {userCourseData.progress}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { width: `${userCourseData.progress}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.progressTextContainer}>
                  <View style={styles.progressStat}>
                    <CheckCircle size={14} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={styles.progressText}>
                      {userProgress.completed} av {userProgress.total} lektioner
                    </Text>
                  </View>
                  {userCourseData?.target_grade && (
                    <View style={styles.progressStat}>
                      <Trophy size={14} color="#FCD34D" />
                      <Text style={styles.progressText}>
                        Mål: {userCourseData.target_grade}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.quickStatsContainer}>
              <View
                style={[
                  styles.quickStatCard,
                  { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                ]}
              >
                <BookOpen size={20} color="white" />
                <Text style={styles.quickStatNumber}>{modulesCount}</Text>
                <Text style={styles.quickStatLabel}>Moduler</Text>
              </View>
              <View
                style={[
                  styles.quickStatCard,
                  { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                ]}
              >
                <Clock size={20} color="white" />
                <Text style={styles.quickStatNumber}>{totalHours}h</Text>
                <Text style={styles.quickStatLabel}>Uppskattad tid</Text>
              </View>
              <View
                style={[
                  styles.quickStatCard,
                  { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                ]}
              >
                <Zap size={20} color="#FCD34D" />
                <Text style={styles.quickStatNumber}>
                  {userProgress.percentage}%
                </Text>
                <Text style={styles.quickStatLabel}>Genomfört</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity
          style={[
            styles.editButton,
            { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
          ]}
          onPress={onEdit}
        >
          <Edit3 size={20} color={courseStyle.primaryColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    marginBottom: 20,
  },
  courseHeader: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -40,
    left: -50,
  },
  courseHeaderContent: {
    position: 'relative',
    zIndex: 1,
  },
  courseTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  courseEmojiLarge: {
    fontSize: 40,
  },
  courseTitleContainer: {
    flex: 1,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  courseTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 2,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  courseSubject: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
  },
  courseDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    marginBottom: 28,
  },
  progressSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700' as const,
  },
  progressPercentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressPercent: {
    fontSize: 20,
    color: 'white',
    fontWeight: '800' as const,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: 'white',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
