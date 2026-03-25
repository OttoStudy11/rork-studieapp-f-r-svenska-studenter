import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Layers,
  FileText,
  Play,
  HelpCircle
} from 'lucide-react-native';
import { router } from 'expo-router';

interface CourseStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
  lightColor: string;
}

interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  courseStyle: CourseStyle;
  breadcrumb?: {
    label: string;
    onPress: () => void;
  };
  stats?: {
    label: string;
    value: string | number;
    icon?: 'modules' | 'lessons' | 'time' | 'progress';
  }[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  badge?: string;
  isCompleted?: boolean;
  lessonType?: 'text' | 'video' | 'quiz';
  lessonNumber?: string;
}

export const courseStyles: Record<string, CourseStyle> = {
  'Matematik': { emoji: '📐', gradient: ['#3B82F6', '#1D4ED8'], primaryColor: '#3B82F6', lightColor: '#DBEAFE' },
  'Svenska': { emoji: '📚', gradient: ['#EC4899', '#BE185D'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Engelska': { emoji: '🌍', gradient: ['#10B981', '#047857'], primaryColor: '#10B981', lightColor: '#D1FAE5' },
  'Biologi': { emoji: '🧬', gradient: ['#14B8A6', '#0F766E'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Fysik': { emoji: '⚡', gradient: ['#F59E0B', '#B45309'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Kemi': { emoji: '🧪', gradient: ['#8B5CF6', '#6D28D9'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Historia': { emoji: '🏛️', gradient: ['#F97316', '#C2410C'], primaryColor: '#F97316', lightColor: '#FFEDD5' },
  'Samhällskunskap': { emoji: '🏛️', gradient: ['#06B6D4', '#0E7490'], primaryColor: '#06B6D4', lightColor: '#CFFAFE' },
  'Idrott och hälsa': { emoji: '⚽', gradient: ['#EF4444', '#B91C1C'], primaryColor: '#EF4444', lightColor: '#FEE2E2' },
  'Religionskunskap': { emoji: '🕊️', gradient: ['#A855F7', '#7E22CE'], primaryColor: '#A855F7', lightColor: '#F3E8FF' },
  'Naturkunskap': { emoji: '🌿', gradient: ['#22C55E', '#15803D'], primaryColor: '#22C55E', lightColor: '#DCFCE7' },
  'Geografi': { emoji: '🗺️', gradient: ['#0EA5E9', '#0369A1'], primaryColor: '#0EA5E9', lightColor: '#E0F2FE' },
  'Filosofi': { emoji: '🤔', gradient: ['#64748B', '#334155'], primaryColor: '#64748B', lightColor: '#F1F5F9' },
  'Psykologi': { emoji: '🧠', gradient: ['#D946EF', '#A21CAF'], primaryColor: '#D946EF', lightColor: '#FAE8FF' },
  'Företagsekonomi': { emoji: '💼', gradient: ['#84CC16', '#4D7C0F'], primaryColor: '#84CC16', lightColor: '#ECFCCB' },
  'Juridik': { emoji: '⚖️', gradient: ['#6366F1', '#4338CA'], primaryColor: '#6366F1', lightColor: '#E0E7FF' },
  'Teknik': { emoji: '⚙️', gradient: ['#78716C', '#44403C'], primaryColor: '#78716C', lightColor: '#F5F5F4' },
  'Programmering': { emoji: '💻', gradient: ['#14B8A6', '#0F766E'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Moderna språk': { emoji: '🗣️', gradient: ['#EC4899', '#BE185D'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Estetisk kommunikation': { emoji: '🎨', gradient: ['#F43F5E', '#BE123C'], primaryColor: '#F43F5E', lightColor: '#FFE4E6' },
  'Musik': { emoji: '🎵', gradient: ['#8B5CF6', '#6D28D9'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Bild': { emoji: '🖼️', gradient: ['#F59E0B', '#B45309'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Dans': { emoji: '💃', gradient: ['#EC4899', '#BE185D'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Teater': { emoji: '🎭', gradient: ['#8B5CF6', '#6D28D9'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Studieteknik': { emoji: '📖', gradient: ['#6366F1', '#4338CA'], primaryColor: '#6366F1', lightColor: '#E0E7FF' },
  'Stresshantering': { emoji: '🧘', gradient: ['#14B8A6', '#0F766E'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'default': { emoji: '📖', gradient: ['#6366F1', '#4338CA'], primaryColor: '#6366F1', lightColor: '#E0E7FF' }
};

export function getCourseStyle(subject: string): CourseStyle {
  return courseStyles[subject] || courseStyles.default;
}

const getStatIcon = (icon: string | undefined, color: string) => {
  switch (icon) {
    case 'modules': return <Layers size={14} color={color} />;
    case 'lessons': return <FileText size={14} color={color} />;
    case 'time': return <Clock size={14} color={color} />;
    case 'progress': return <CheckCircle size={14} color={color} />;
    default: return null;
  }
};

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video': return Play;
    case 'quiz': return HelpCircle;
    default: return FileText;
  }
};

export function CourseHeader({
  title,
  subtitle,
  courseStyle,
  breadcrumb,
  stats,
  progress,
  badge,
  isCompleted,
  lessonType,
  lessonNumber
}: CourseHeaderProps) {
  const LessonIcon = lessonType ? getLessonIcon(lessonType) : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={courseStyle.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.backgroundPattern}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>

          {breadcrumb && (
            <TouchableOpacity 
              style={styles.breadcrumb}
              onPress={breadcrumb.onPress}
            >
              <Text style={styles.breadcrumbText} numberOfLines={1}>
                {breadcrumb.label}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.titleRow}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{courseStyle.emoji}</Text>
            </View>
            <View style={styles.titleContent}>
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
              {lessonType && lessonNumber && (
                <View style={styles.lessonBadgeRow}>
                  <View style={styles.lessonTypeBadge}>
                    {LessonIcon && <LessonIcon size={12} color="white" />}
                    <Text style={styles.lessonTypeText}>
                      {lessonType === 'text' ? 'Läsning' : lessonType === 'video' ? 'Video' : 'Quiz'}
                    </Text>
                  </View>
                  <View style={styles.lessonNumberBadge}>
                    <Text style={styles.lessonNumberText}>{lessonNumber}</Text>
                  </View>
                </View>
              )}
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
              )}
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle size={20} color="#10B981" />
              </View>
            )}
          </View>

          {stats && stats.length > 0 && (
            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  {stat.icon && getStatIcon(stat.icon, 'rgba(255,255,255,0.9)')}
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}

          {progress && progress.percentage > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Framsteg</Text>
                <Text style={styles.progressValue}>{progress.percentage}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
              </View>
              <Text style={styles.progressMeta}>
                {progress.completed} av {progress.total} klara
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 80,
    right: 60,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.85,
  },
  breadcrumbText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  titleContent: {
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  lessonBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  lessonTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  lessonTypeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  lessonNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  lessonNumberText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: 'white',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500' as const,
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  progressContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  progressValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500' as const,
  },
});

export default CourseHeader;
