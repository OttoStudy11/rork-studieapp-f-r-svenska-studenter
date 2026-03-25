import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Zap,
  Brain,
  Star,
  Info,
  Play,
  FileText,
  HelpCircle
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CourseStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
  lightColor: string;
}

interface InfoBoxProps {
  type: 'tip' | 'info' | 'warning' | 'success';
  title: string;
  content: string;
  courseStyle?: CourseStyle;
}

export function InfoBox({ type, title, content, courseStyle }: InfoBoxProps) {
  const { theme } = useTheme();
  
  const getTypeConfig = () => {
    switch (type) {
      case 'tip':
        return {
          icon: Lightbulb,
          bgColor: courseStyle?.lightColor || '#FEF3C7',
          borderColor: courseStyle?.primaryColor || '#F59E0B',
          iconColor: courseStyle?.primaryColor || '#F59E0B',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: theme.colors.info + '15',
          borderColor: theme.colors.info,
          iconColor: theme.colors.info,
        };
      case 'warning':
        return {
          icon: Zap,
          bgColor: theme.colors.warning + '15',
          borderColor: theme.colors.warning,
          iconColor: theme.colors.warning,
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: theme.colors.success + '15',
          borderColor: theme.colors.success,
          iconColor: theme.colors.success,
        };
      default:
        return {
          icon: Info,
          bgColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
          iconColor: theme.colors.primary,
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <View style={[
      styles.infoBox,
      { 
        backgroundColor: config.bgColor,
        borderLeftColor: config.borderColor,
      }
    ]}>
      <View style={styles.infoBoxHeader}>
        <View style={[styles.infoBoxIcon, { backgroundColor: config.borderColor + '20' }]}>
          <Icon size={18} color={config.iconColor} />
        </View>
        <Text style={[styles.infoBoxTitle, { color: config.borderColor }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.infoBoxContent, { color: theme.colors.text }]}>
        {content}
      </Text>
    </View>
  );
}

interface LearningObjectivesProps {
  objectives: string[];
  courseStyle: CourseStyle;
}

export function LearningObjectives({ objectives, courseStyle }: LearningObjectivesProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.learningSection, { backgroundColor: theme.colors.card }]}>
      <View style={styles.learningSectionHeader}>
        <View style={[styles.learningSectionIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
          <Target size={22} color={courseStyle.primaryColor} />
        </View>
        <View style={styles.learningSectionTitleContainer}>
          <Text style={[styles.learningSectionTitle, { color: theme.colors.text }]}>
            Du kommer att lära dig
          </Text>
          <Text style={[styles.learningSectionSubtitle, { color: theme.colors.textSecondary }]}>
            Efter att ha slutfört denna kurs kommer du kunna:
          </Text>
        </View>
      </View>
      <View style={styles.objectivesList}>
        {objectives.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <View style={[styles.objectiveCheck, { backgroundColor: courseStyle.primaryColor }]}>
              <CheckCircle size={14} color="white" />
            </View>
            <Text style={[styles.objectiveText, { color: theme.colors.text }]}>
              {objective}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface MotivationCardProps {
  quote: string;
  author?: string;
  courseStyle: CourseStyle;
}

export function MotivationCard({ quote, author, courseStyle }: MotivationCardProps) {
  return (
    <LinearGradient
      colors={[courseStyle.primaryColor + '15', courseStyle.primaryColor + '08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.motivationCard}
    >
      <View style={[styles.motivationQuoteIcon, { backgroundColor: courseStyle.primaryColor + '20' }]}>
        <Sparkles size={20} color={courseStyle.primaryColor} />
      </View>
      <Text style={[styles.motivationQuote, { color: courseStyle.primaryColor }]}>
        {`"${quote}"`}
      </Text>
      {author && (
        <Text style={[styles.motivationAuthor, { color: courseStyle.primaryColor + 'AA' }]}>
          — {author}
        </Text>
      )}
    </LinearGradient>
  );
}

interface StatCardProps {
  icon: 'modules' | 'lessons' | 'time' | 'progress' | 'difficulty';
  value: string | number;
  label: string;
  courseStyle: CourseStyle;
}

export function StatCard({ icon, value, label, courseStyle }: StatCardProps) {
  const { theme } = useTheme();
  
  const getIcon = () => {
    switch (icon) {
      case 'modules': return BookOpen;
      case 'lessons': return FileText;
      case 'time': return Clock;
      case 'progress': return TrendingUp;
      case 'difficulty': return Brain;
      default: return Star;
    }
  };

  const Icon = getIcon();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.statCardIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
        <Icon size={20} color={courseStyle.primaryColor} />
      </View>
      <Text style={[styles.statCardValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  courseStyle?: CourseStyle;
}

export function SectionHeader({ title, subtitle, icon, action, courseStyle }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon && (
          <View style={[
            styles.sectionHeaderIcon, 
            { backgroundColor: courseStyle?.primaryColor ? courseStyle.primaryColor + '15' : theme.colors.primaryLight }
          ]}>
            {icon}
          </View>
        )}
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionHeaderTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.sectionHeaderSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && (
        <TouchableOpacity 
          style={[styles.sectionHeaderAction, { backgroundColor: theme.colors.primaryLight }]}
          onPress={action.onPress}
        >
          <Text style={[styles.sectionHeaderActionText, { color: theme.colors.primary }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ProgressSummaryProps {
  completed: number;
  total: number;
  percentage: number;
  courseStyle: CourseStyle;
  timeSpent?: number;
  streak?: number;
}

export function ProgressSummary({ completed, total, percentage, courseStyle, timeSpent, streak }: ProgressSummaryProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.progressSummary, { backgroundColor: theme.colors.card }]}>
      <View style={styles.progressSummaryHeader}>
        <View style={styles.progressSummaryTitleRow}>
          <View style={[styles.progressSummaryIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
            <TrendingUp size={20} color={courseStyle.primaryColor} />
          </View>
          <Text style={[styles.progressSummaryTitle, { color: theme.colors.text }]}>
            Din framgång
          </Text>
        </View>
        <View style={[styles.progressPercentBadge, { backgroundColor: courseStyle.primaryColor + '15' }]}>
          <Text style={[styles.progressPercentText, { color: courseStyle.primaryColor }]}>
            {percentage}%
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.borderLight }]}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${percentage}%`,
                backgroundColor: courseStyle.primaryColor 
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.progressStats}>
        <View style={styles.progressStatItem}>
          <View style={[styles.progressStatIcon, { backgroundColor: theme.colors.success + '15' }]}>
            <CheckCircle size={14} color={theme.colors.success} />
          </View>
          <Text style={[styles.progressStatText, { color: theme.colors.textSecondary }]}>
            {completed} av {total} lektioner klara
          </Text>
        </View>
        {timeSpent !== undefined && (
          <View style={styles.progressStatItem}>
            <View style={[styles.progressStatIcon, { backgroundColor: theme.colors.info + '15' }]}>
              <Clock size={14} color={theme.colors.info} />
            </View>
            <Text style={[styles.progressStatText, { color: theme.colors.textSecondary }]}>
              {timeSpent} min studerad
            </Text>
          </View>
        )}
        {streak !== undefined && streak > 0 && (
          <View style={styles.progressStatItem}>
            <View style={[styles.progressStatIcon, { backgroundColor: theme.colors.warning + '15' }]}>
              <Zap size={14} color={theme.colors.warning} />
            </View>
            <Text style={[styles.progressStatText, { color: theme.colors.textSecondary }]}>
              {streak} dagars streak
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface CourseIntroProps {
  title: string;
  description: string;
  courseStyle: CourseStyle;
  difficulty?: 'Nybörjare' | 'Mellan' | 'Avancerad';
  prerequisites?: string[];
}

export function CourseIntro({ title, description, courseStyle, difficulty, prerequisites }: CourseIntroProps) {
  const { theme } = useTheme();

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Nybörjare': return theme.colors.success;
      case 'Mellan': return theme.colors.warning;
      case 'Avancerad': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.courseIntro, { backgroundColor: theme.colors.card }]}>
      <View style={styles.courseIntroHeader}>
        <Text style={[styles.courseIntroTitle, { color: theme.colors.text }]}>
          Om kursen
        </Text>
        {difficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '15' }]}>
            <Brain size={14} color={getDifficultyColor()} />
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {difficulty}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.courseIntroDescription, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>

      {prerequisites && prerequisites.length > 0 && (
        <View style={styles.prerequisitesSection}>
          <Text style={[styles.prerequisitesTitle, { color: theme.colors.text }]}>
            Förkunskaper
          </Text>
          <View style={styles.prerequisitesList}>
            {prerequisites.map((prereq, index) => (
              <View key={index} style={[styles.prerequisiteItem, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.prerequisiteDot, { backgroundColor: courseStyle.primaryColor }]} />
                <Text style={[styles.prerequisiteText, { color: theme.colors.textSecondary }]}>
                  {prereq}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

interface ModuleCardEnhancedProps {
  moduleIndex: number;
  title: string;
  description: string;
  lessonsCount: number;
  durationMinutes: number;
  isCompleted: boolean;
  isLocked: boolean;
  progressPercent: number;
  courseStyle: CourseStyle;
  onPress: () => void;
}

export function ModuleCardEnhanced({
  moduleIndex,
  title,
  description,
  lessonsCount,
  durationMinutes,
  isCompleted,
  isLocked,
  progressPercent,
  courseStyle,
  onPress
}: ModuleCardEnhancedProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.moduleCardEnhanced,
        { backgroundColor: theme.colors.card },
        isCompleted && { borderColor: theme.colors.success, borderWidth: 1.5 }
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      <View style={styles.moduleCardHeader}>
        <View style={[
          styles.moduleNumberBadge,
          { 
            backgroundColor: isCompleted 
              ? theme.colors.success + '15' 
              : isLocked 
              ? theme.colors.textMuted + '15'
              : courseStyle.primaryColor + '15' 
          }
        ]}>
          {isCompleted ? (
            <CheckCircle size={20} color={theme.colors.success} />
          ) : (
            <Text style={[
              styles.moduleNumberText, 
              { color: isLocked ? theme.colors.textMuted : courseStyle.primaryColor }
            ]}>
              {moduleIndex + 1}
            </Text>
          )}
        </View>
        
        <View style={styles.moduleCardContent}>
          <Text 
            style={[
              styles.moduleCardTitle, 
              { color: isLocked ? theme.colors.textMuted : theme.colors.text }
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text 
            style={[styles.moduleCardDescription, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
          
          <View style={styles.moduleCardMeta}>
            <View style={styles.moduleMetaItem}>
              <FileText size={14} color={theme.colors.textMuted} />
              <Text style={[styles.moduleMetaText, { color: theme.colors.textMuted }]}>
                {lessonsCount} lektioner
              </Text>
            </View>
            <View style={styles.moduleMetaItem}>
              <Clock size={14} color={theme.colors.textMuted} />
              <Text style={[styles.moduleMetaText, { color: theme.colors.textMuted }]}>
                {durationMinutes} min
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.moduleCardRight}>
          {progressPercent > 0 && progressPercent < 100 && (
            <View style={[styles.moduleProgressBadge, { backgroundColor: courseStyle.primaryColor + '15' }]}>
              <Text style={[styles.moduleProgressText, { color: courseStyle.primaryColor }]}>
                {progressPercent}%
              </Text>
            </View>
          )}
          {!isLocked && <ChevronRight size={20} color={theme.colors.textMuted} />}
        </View>
      </View>

      {progressPercent > 0 && (
        <View style={styles.moduleProgressBar}>
          <View style={[styles.moduleProgressBarBg, { backgroundColor: theme.colors.borderLight }]}>
            <View 
              style={[
                styles.moduleProgressBarFill, 
                { 
                  width: `${progressPercent}%`,
                  backgroundColor: isCompleted ? theme.colors.success : courseStyle.primaryColor 
                }
              ]} 
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface LessonCardEnhancedProps {
  lessonIndex: number;
  title: string;
  type: 'text' | 'video' | 'quiz';
  durationMinutes?: number;
  isCompleted: boolean;
  isNext: boolean;
  courseStyle: CourseStyle;
  onPress: () => void;
}

export function LessonCardEnhanced({
  lessonIndex,
  title,
  type,
  durationMinutes,
  isCompleted,
  isNext,
  courseStyle,
  onPress
}: LessonCardEnhancedProps) {
  const { theme } = useTheme();

  const getTypeIcon = () => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'video': return 'Video';
      case 'quiz': return 'Quiz';
      default: return 'Läsning';
    }
  };

  const Icon = getTypeIcon();

  return (
    <TouchableOpacity
      style={[
        styles.lessonCardEnhanced,
        { backgroundColor: theme.colors.card },
        isCompleted && { borderLeftWidth: 3, borderLeftColor: theme.colors.success },
        isNext && !isCompleted && { borderLeftWidth: 3, borderLeftColor: courseStyle.primaryColor }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.lessonCardIcon,
        { 
          backgroundColor: isCompleted 
            ? theme.colors.success + '15' 
            : isNext 
            ? courseStyle.primaryColor + '15'
            : theme.colors.borderLight 
        }
      ]}>
        {isCompleted ? (
          <CheckCircle size={20} color={theme.colors.success} />
        ) : (
          <Icon size={20} color={isNext ? courseStyle.primaryColor : theme.colors.textSecondary} />
        )}
      </View>

      <View style={styles.lessonCardContent}>
        <View style={styles.lessonCardTitleRow}>
          <Text style={[styles.lessonCardNumber, { color: theme.colors.textMuted }]}>
            Lektion {lessonIndex + 1}
          </Text>
          {isCompleted && (
            <View style={[styles.lessonStatusBadge, { backgroundColor: theme.colors.success + '15' }]}>
              <Text style={[styles.lessonStatusText, { color: theme.colors.success }]}>Klar</Text>
            </View>
          )}
          {isNext && !isCompleted && (
            <View style={[styles.lessonStatusBadge, { backgroundColor: courseStyle.primaryColor + '15' }]}>
              <Text style={[styles.lessonStatusText, { color: courseStyle.primaryColor }]}>Nästa</Text>
            </View>
          )}
        </View>
        <Text 
          style={[
            styles.lessonCardTitle, 
            { color: isCompleted ? theme.colors.success : theme.colors.text }
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={styles.lessonCardMeta}>
          <View style={[styles.lessonTypeBadge, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.lessonTypeText, { color: theme.colors.textMuted }]}>
              {getTypeLabel()}
            </Text>
          </View>
          {durationMinutes && (
            <View style={styles.lessonDurationBadge}>
              <Clock size={12} color={theme.colors.textMuted} />
              <Text style={[styles.lessonDurationText, { color: theme.colors.textMuted }]}>
                {durationMinutes} min
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChevronRight size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
  courseStyle: CourseStyle;
  variant?: 'primary' | 'secondary';
}

export function QuickActionButton({ icon, label, sublabel, onPress, courseStyle, variant = 'primary' }: QuickActionButtonProps) {
  const { theme } = useTheme();

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.quickActionPrimary, { backgroundColor: courseStyle.primaryColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {icon}
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionPrimaryLabel}>{label}</Text>
          {sublabel && (
            <Text style={styles.quickActionPrimarySublabel}>{sublabel}</Text>
          )}
        </View>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.quickActionSecondary, 
        { 
          backgroundColor: theme.colors.card,
          borderColor: courseStyle.primaryColor + '40'
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
        {icon}
      </View>
      <View style={styles.quickActionContent}>
        <Text style={[styles.quickActionSecondaryLabel, { color: theme.colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.quickActionSecondarySublabel, { color: theme.colors.textSecondary }]}>
            {sublabel}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  courseStyle: CourseStyle;
}

export function AchievementBadge({ title, description, icon, isUnlocked, courseStyle }: AchievementBadgeProps) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.achievementBadge, 
      { 
        backgroundColor: isUnlocked ? courseStyle.lightColor : theme.colors.surface,
        borderColor: isUnlocked ? courseStyle.primaryColor : theme.colors.border,
        opacity: isUnlocked ? 1 : 0.6
      }
    ]}>
      <View style={[
        styles.achievementIcon, 
        { backgroundColor: isUnlocked ? courseStyle.primaryColor + '20' : theme.colors.borderLight }
      ]}>
        {icon}
      </View>
      <Text style={[
        styles.achievementTitle, 
        { color: isUnlocked ? courseStyle.primaryColor : theme.colors.textMuted }
      ]}>
        {title}
      </Text>
      <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoBoxIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  infoBoxContent: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500' as const,
  },

  learningSection: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  learningSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 14,
  },
  learningSectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learningSectionTitleContainer: {
    flex: 1,
  },
  learningSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  learningSectionSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  objectivesList: {
    gap: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  objectiveCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },

  motivationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  motivationQuoteIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  motivationQuote: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic' as const,
    marginBottom: 8,
  },
  motivationAuthor: {
    fontSize: 13,
    fontWeight: '500' as const,
  },

  statCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sectionHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  sectionHeaderAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sectionHeaderActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },

  progressSummary: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSummaryTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  progressPercentBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressStats: {
    gap: 10,
  },
  progressStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStatText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },

  courseIntro: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  courseIntroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  courseIntroTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  courseIntroDescription: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  prerequisitesSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  prerequisitesTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  prerequisitesList: {
    gap: 8,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  prerequisiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  prerequisiteText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },

  moduleCardEnhanced: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  moduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  moduleNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  moduleCardContent: {
    flex: 1,
  },
  moduleCardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 6,
    lineHeight: 22,
  },
  moduleCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  moduleCardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  moduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moduleMetaText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  moduleCardRight: {
    alignItems: 'center',
    gap: 8,
  },
  moduleProgressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  moduleProgressText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  moduleProgressBar: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  moduleProgressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  moduleProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  lessonCardEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonCardContent: {
    flex: 1,
  },
  lessonCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lessonCardNumber: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  lessonStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lessonStatusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  lessonCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
    lineHeight: 20,
  },
  lessonCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lessonTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lessonTypeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  lessonDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDurationText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },

  quickActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionPrimaryLabel: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  quickActionPrimarySublabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  quickActionSecondaryLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  quickActionSecondarySublabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },

  achievementBadge: {
    width: 100,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default {
  InfoBox,
  LearningObjectives,
  MotivationCard,
  StatCard,
  SectionHeader,
  ProgressSummary,
  CourseIntro,
  ModuleCardEnhanced,
  LessonCardEnhanced,
  QuickActionButton,
  AchievementBadge
};
