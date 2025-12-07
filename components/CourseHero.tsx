import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  Trophy,
  Sparkles,
  Edit3,
  Zap,
  Target,
  Play
} from 'lucide-react-native';


interface CourseStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
  lightColor: string;
}

interface CourseHeroProps {
  title: string;
  subject?: string;
  description?: string;
  courseStyle: CourseStyle;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  targetGrade?: string;
  modulesCount: number;
  lessonsCount: number;
  estimatedHours?: number;
  onEditPress?: () => void;
  onStartPress?: () => void;
  showEditButton?: boolean;
  imageUrl?: string;
  fadeAnim?: Animated.Value;
  slideAnim?: Animated.Value;
  variant?: 'full' | 'compact' | 'minimal';
  badgeText?: string;
}

export const courseStyles: Record<string, CourseStyle> = {
  'Matematik': { emoji: '📐', gradient: ['#3B82F6', '#2563EB'], primaryColor: '#3B82F6', lightColor: '#DBEAFE' },
  'Svenska': { emoji: '📚', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Engelska': { emoji: '🌍', gradient: ['#10B981', '#059669'], primaryColor: '#10B981', lightColor: '#D1FAE5' },
  'Biologi': { emoji: '🧬', gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Fysik': { emoji: '⚡', gradient: ['#F59E0B', '#D97706'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Kemi': { emoji: '🧪', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Historia': { emoji: '🏛️', gradient: ['#F97316', '#EA580C'], primaryColor: '#F97316', lightColor: '#FFEDD5' },
  'Samhällskunskap': { emoji: '🏛️', gradient: ['#06B6D4', '#0891B2'], primaryColor: '#06B6D4', lightColor: '#CFFAFE' },
  'Idrott och hälsa': { emoji: '⚽', gradient: ['#EF4444', '#DC2626'], primaryColor: '#EF4444', lightColor: '#FEE2E2' },
  'Religionskunskap': { emoji: '🕊️', gradient: ['#A855F7', '#9333EA'], primaryColor: '#A855F7', lightColor: '#F3E8FF' },
  'Naturkunskap': { emoji: '🌿', gradient: ['#22C55E', '#16A34A'], primaryColor: '#22C55E', lightColor: '#DCFCE7' },
  'Geografi': { emoji: '🗺️', gradient: ['#0EA5E9', '#0284C7'], primaryColor: '#0EA5E9', lightColor: '#E0F2FE' },
  'Filosofi': { emoji: '🤔', gradient: ['#64748B', '#475569'], primaryColor: '#64748B', lightColor: '#F1F5F9' },
  'Psykologi': { emoji: '🧠', gradient: ['#D946EF', '#C026D3'], primaryColor: '#D946EF', lightColor: '#FAE8FF' },
  'Företagsekonomi': { emoji: '💼', gradient: ['#84CC16', '#65A30D'], primaryColor: '#84CC16', lightColor: '#ECFCCB' },
  'Juridik': { emoji: '⚖️', gradient: ['#6366F1', '#4F46E5'], primaryColor: '#6366F1', lightColor: '#E0E7FF' },
  'Teknik': { emoji: '⚙️', gradient: ['#78716C', '#57534E'], primaryColor: '#78716C', lightColor: '#F5F5F4' },
  'Programmering': { emoji: '💻', gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'Moderna språk': { emoji: '🗣️', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Estetisk kommunikation': { emoji: '🎨', gradient: ['#F43F5E', '#E11D48'], primaryColor: '#F43F5E', lightColor: '#FFE4E6' },
  'Musik': { emoji: '🎵', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Bild': { emoji: '🖼️', gradient: ['#F59E0B', '#D97706'], primaryColor: '#F59E0B', lightColor: '#FEF3C7' },
  'Dans': { emoji: '💃', gradient: ['#EC4899', '#DB2777'], primaryColor: '#EC4899', lightColor: '#FCE7F3' },
  'Teater': { emoji: '🎭', gradient: ['#8B5CF6', '#7C3AED'], primaryColor: '#8B5CF6', lightColor: '#EDE9FE' },
  'Studieteknik': { emoji: '📖', gradient: ['#6366F1', '#8B5CF6'], primaryColor: '#6366F1', lightColor: '#E0E7FF' },
  'Stresshantering': { emoji: '🧘', gradient: ['#14B8A6', '#0D9488'], primaryColor: '#14B8A6', lightColor: '#CCFBF1' },
  'default': { emoji: '📖', gradient: ['#6366F1', '#4F46E5'], primaryColor: '#6366F1', lightColor: '#E0E7FF' }
};

export function getCourseStyle(subject: string): CourseStyle {
  return courseStyles[subject] || courseStyles.default;
}

export function CourseHero({
  title,
  subject,
  description,
  courseStyle,
  progress,
  targetGrade,
  modulesCount,
  lessonsCount,
  estimatedHours,
  onEditPress,
  onStartPress,
  showEditButton = true,
  imageUrl,
  fadeAnim,
  slideAnim,
  variant = 'full',
  badgeText
}: CourseHeroProps) {

  const animatedStyle = fadeAnim && slideAnim ? {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  } : {};

  const renderFullVariant = () => (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={courseStyle.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <View style={styles.heroContent}>
          <View style={styles.titleSection}>
            <View style={[styles.emojiContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.emojiLarge}>{courseStyle.emoji}</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
              {(subject || badgeText) && (
                <View style={styles.subjectBadge}>
                  <Sparkles size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.subjectText}>{badgeText || subject}</Text>
                </View>
              )}
            </View>
          </View>

          {description && (
            <Text style={styles.heroDescription} numberOfLines={3}>{description}</Text>
          )}

          {progress && progress.percentage > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelContainer}>
                  <TrendingUp size={18} color="white" />
                  <Text style={styles.progressLabel}>Din framgång</Text>
                </View>
                <View style={styles.progressPercentBadge}>
                  <Text style={styles.progressPercent}>{progress.percentage}%</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
                </View>
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <CheckCircle size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.progressStatText}>
                    {progress.completed} av {progress.total} lektioner
                  </Text>
                </View>
                {targetGrade && (
                  <View style={styles.progressStat}>
                    <Trophy size={14} color="#FCD34D" />
                    <Text style={styles.progressStatText}>Mål: {targetGrade}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.quickStats}>
            <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <BookOpen size={20} color="white" />
              <Text style={styles.quickStatNumber}>{modulesCount}</Text>
              <Text style={styles.quickStatLabel}>Moduler</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Target size={20} color="white" />
              <Text style={styles.quickStatNumber}>{lessonsCount}</Text>
              <Text style={styles.quickStatLabel}>Lektioner</Text>
            </View>
            {estimatedHours !== undefined && (
              <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Clock size={20} color="white" />
                <Text style={styles.quickStatNumber}>{estimatedHours}h</Text>
                <Text style={styles.quickStatLabel}>Tid</Text>
              </View>
            )}
            <View style={[styles.quickStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Zap size={20} color="#FCD34D" />
              <Text style={styles.quickStatNumber}>{progress?.percentage || 0}%</Text>
              <Text style={styles.quickStatLabel}>Klart</Text>
            </View>
          </View>

          {progress && progress.percentage === 0 && onStartPress && (
            <TouchableOpacity style={styles.startButton} onPress={onStartPress}>
              <Play size={20} color={courseStyle.primaryColor} />
              <Text style={[styles.startButtonText, { color: courseStyle.primaryColor }]}>
                Börja kursen
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {showEditButton && onEditPress && (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
          onPress={onEditPress}
        >
          <Edit3 size={20} color={courseStyle.primaryColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCompactVariant = () => (
    <View style={styles.compactContainer}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.compactImage} />
      ) : (
        <LinearGradient
          colors={courseStyle.gradient as any}
          style={styles.compactGradient}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.compactOverlay}
      />
      <View style={styles.compactContent}>
        {(badgeText || subject) && (
          <View style={styles.compactBadge}>
            <Sparkles size={14} color="white" />
            <Text style={styles.compactBadgeText}>{badgeText || subject}</Text>
          </View>
        )}
        <Text style={styles.compactTitle}>{title}</Text>
        {description && (
          <Text style={styles.compactDescription} numberOfLines={2}>{description}</Text>
        )}
        <View style={styles.compactStats}>
          <View style={styles.compactStatItem}>
            <BookOpen size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.compactStatText}>{modulesCount} moduler</Text>
          </View>
          <View style={styles.compactStatItem}>
            <Target size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.compactStatText}>{lessonsCount} lektioner</Text>
          </View>
          {estimatedHours !== undefined && (
            <View style={styles.compactStatItem}>
              <Clock size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.compactStatText}>{estimatedHours}h</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderMinimalVariant = () => (
    <LinearGradient
      colors={courseStyle.gradient as any}
      style={styles.minimalContainer}
    >
      <View style={styles.minimalContent}>
        <View style={styles.minimalLeft}>
          <Text style={styles.minimalEmoji}>{courseStyle.emoji}</Text>
          <View style={styles.minimalInfo}>
            <Text style={styles.minimalTitle} numberOfLines={1}>{title}</Text>
            {subject && <Text style={styles.minimalSubject}>{subject}</Text>}
          </View>
        </View>
        {progress && progress.percentage > 0 && (
          <View style={styles.minimalProgress}>
            <Text style={styles.minimalProgressText}>{progress.percentage}%</Text>
          </View>
        )}
      </View>
      {progress && progress.percentage > 0 && (
        <View style={styles.minimalProgressBar}>
          <View style={[styles.minimalProgressFill, { width: `${progress.percentage}%` }]} />
        </View>
      )}
    </LinearGradient>
  );

  const content = variant === 'full' 
    ? renderFullVariant() 
    : variant === 'compact' 
    ? renderCompactVariant() 
    : renderMinimalVariant();

  if (fadeAnim && slideAnim) {
    return (
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  heroContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  heroGradient: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: 100,
    right: 40,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  titleSection: {
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
  emojiLarge: {
    fontSize: 40,
  },
  titleContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  subjectText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    marginBottom: 24,
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
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatNumber: {
    fontSize: 22,
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
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  compactContainer: {
    height: 280,
    position: 'relative',
    marginBottom: 24,
  },
  compactImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  compactGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  compactOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  compactContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  compactBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  compactTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 8,
    lineHeight: 32,
  },
  compactDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 16,
  },
  compactStats: {
    flexDirection: 'row',
    gap: 20,
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactStatText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  minimalContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minimalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  minimalEmoji: {
    fontSize: 32,
  },
  minimalInfo: {
    flex: 1,
  },
  minimalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 2,
  },
  minimalSubject: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
  },
  minimalProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  minimalProgressText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'white',
  },
  minimalProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  minimalProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default CourseHero;
