import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Lightbulb, 
  TrendingUp,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageCircle,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';

interface CourseStyle {
  emoji: string;
  gradient: string[];
  primaryColor: string;
  lightColor: string;
}

interface AIStudyInsightsProps {
  courseTitle: string;
  courseDescription?: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  courseStyle: CourseStyle;
  compact?: boolean;
}

interface StudyInsight {
  type: 'tip' | 'motivation' | 'strategy' | 'warning';
  title: string;
  content: string;
  actionable?: string;
}

interface AIInsightsData {
  insights: StudyInsight[];
  studyPlan: string;
  focusAreas: string[];
  estimatedTimeToComplete: string;
}

const insightIcons: Record<string, any> = {
  tip: Lightbulb,
  motivation: Zap,
  strategy: Target,
  warning: Clock,
};

const insightColors: Record<string, string> = {
  tip: '#F59E0B',
  motivation: '#10B981',
  strategy: '#6366F1',
  warning: '#EF4444',
};

export function AIStudyInsights({
  courseTitle,
  courseDescription,
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  courseStyle,
  compact = false,
}: AIStudyInsightsProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const generateInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const insightsSchema = z.object({
        insights: z.array(z.object({
          type: z.enum(['tip', 'motivation', 'strategy', 'warning']),
          title: z.string(),
          content: z.string(),
          actionable: z.string().optional(),
        })),
        studyPlan: z.string(),
        focusAreas: z.array(z.string()),
        estimatedTimeToComplete: z.string(),
      });

      const result = await generateObject({
        schema: insightsSchema as any,
        messages: [
          {
            role: 'user',
            content: `Du är en erfaren studiecoach som hjälper svenska gymnasie- och högskolestudenter att lyckas med sina studier.

Analysera följande kurs och ge personliga studieinsikter:

📚 KURS: ${courseTitle}
📝 BESKRIVNING: ${courseDescription || 'Ingen beskrivning tillgänglig'}
📊 FRAMSTEG: ${progress}% (${completedLessons} av ${totalLessons} lektioner klara)

Ge mig:
1. 3-4 specifika studieinsikter (blanda tips, motivation, strategier)
2. En kort studieplan anpassad till studentens framsteg
3. 3 fokusområden att prioritera
4. Uppskattad tid för att slutföra kursen

Var konkret, motiverande och anpassa råden till studentens nuvarande framsteg.
Om studenten har låg progress, ge uppmuntrande tips för att komma igång.
Om studenten har hög progress, fokusera på att slutföra och fördjupa kunskapen.

Skriv på svenska och var pedagogisk men inte överdrivet formell.`,
          },
        ],
      });

      setInsightsData(result);
      setIsExpanded(true);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Error generating insights:', err);
      setError('Kunde inte generera insikter. Försök igen.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [courseTitle, courseDescription, progress, totalLessons, completedLessons, fadeAnim]);

  const toggleExpanded = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const renderInsightCard = useCallback((insight: StudyInsight, index: number) => {
    const IconComponent = insightIcons[insight.type] || Lightbulb;
    const iconColor = insightColors[insight.type] || theme.colors.primary;

    return (
      <View 
        key={index} 
        style={[styles.insightCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={[styles.insightIconContainer, { backgroundColor: iconColor + '15' }]}>
          <IconComponent size={20} color={iconColor} />
        </View>
        <View style={styles.insightContent}>
          <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
            {insight.title}
          </Text>
          <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
            {insight.content}
          </Text>
          {insight.actionable && (
            <View style={[styles.actionableBadge, { backgroundColor: iconColor + '10' }]}>
              <Text style={[styles.actionableText, { color: iconColor }]}>
                💡 {insight.actionable}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [theme]);

  if (compact && !insightsData) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: theme.colors.card }]}
        onPress={generateInsights}
        disabled={isLoading}
      >
        <LinearGradient
          colors={courseStyle.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Sparkles size={20} color="white" />
              <Text style={styles.compactButtonText}>AI Studieinsikter</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: theme.colors.card }]}
        onPress={insightsData ? toggleExpanded : generateInsights}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
            <Brain size={24} color={courseStyle.primaryColor} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              AI Studieassistent
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {insightsData ? 'Personliga insikter baserat på din progress' : 'Få personliga studietips'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          {isLoading ? (
            <ActivityIndicator size="small" color={courseStyle.primaryColor} />
          ) : insightsData ? (
            <TouchableOpacity 
              onPress={generateInsights}
              style={[styles.refreshButton, { backgroundColor: theme.colors.surface }]}
            >
              <RefreshCw size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.generateBadge, { backgroundColor: courseStyle.primaryColor }]}>
              <Sparkles size={14} color="white" />
              <Text style={styles.generateBadgeText}>Generera</Text>
            </View>
          )}
          {insightsData && (
            isExpanded ? (
              <ChevronUp size={20} color={theme.colors.textMuted} />
            ) : (
              <ChevronDown size={20} color={theme.colors.textMuted} />
            )
          )}
        </View>
      </TouchableOpacity>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '15' }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={generateInsights}>
            <Text style={[styles.retryText, { color: theme.colors.error }]}>Försök igen</Text>
          </TouchableOpacity>
        </View>
      )}

      {insightsData && isExpanded && (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={[styles.studyPlanCard, { backgroundColor: courseStyle.primaryColor + '10' }]}>
            <View style={styles.studyPlanHeader}>
              <BookOpen size={18} color={courseStyle.primaryColor} />
              <Text style={[styles.studyPlanTitle, { color: courseStyle.primaryColor }]}>
                Din studieplan
              </Text>
            </View>
            <Text style={[styles.studyPlanText, { color: theme.colors.text }]}>
              {insightsData.studyPlan}
            </Text>
            <View style={styles.studyPlanMeta}>
              <View style={[styles.timeBadge, { backgroundColor: theme.colors.card }]}>
                <Clock size={14} color={theme.colors.textMuted} />
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  {insightsData.estimatedTimeToComplete}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.focusAreasContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              🎯 Fokusområden
            </Text>
            <View style={styles.focusAreasList}>
              {insightsData.focusAreas.map((area, index) => (
                <View 
                  key={index} 
                  style={[styles.focusAreaBadge, { backgroundColor: theme.colors.card }]}
                >
                  <TrendingUp size={14} color={courseStyle.primaryColor} />
                  <Text style={[styles.focusAreaText, { color: theme.colors.text }]}>
                    {area}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              💡 Studieinsikter
            </Text>
            {insightsData.insights.map((insight, index) => renderInsightCard(insight, index))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

interface AIQuickHelpProps {
  courseTitle: string;
  courseStyle: CourseStyle;
  onAskQuestion?: (question: string) => void;
}

export function AIQuickHelp({ courseTitle, courseStyle, onAskQuestion }: AIQuickHelpProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [quickTip, setQuickTip] = useState<string | null>(null);

  const suggestedQuestions = useMemo(() => [
    `Förklara huvudkoncepten i ${courseTitle}`,
    'Hur kan jag studera mer effektivt?',
    'Vad bör jag fokusera på inför provet?',
    'Ge mig en snabb sammanfattning',
  ], [courseTitle]);

  const generateQuickTip = useCallback(async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const tipSchema = z.object({
        tip: z.string(),
      });

      const result = await generateObject({
        schema: tipSchema as any,
        messages: [
          {
            role: 'user',
            content: `Ge ett kort, användbart studietips (max 2 meningar) för kursen "${courseTitle}". Var konkret och motiverande. Skriv på svenska.`,
          },
        ],
      });

      setQuickTip(result.tip);
    } catch (err) {
      console.error('Error generating quick tip:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseTitle]);

  return (
    <View style={[styles.quickHelpContainer, { backgroundColor: theme.colors.card }]}>
      <View style={styles.quickHelpHeader}>
        <View style={[styles.quickHelpIcon, { backgroundColor: courseStyle.primaryColor + '15' }]}>
          <MessageCircle size={20} color={courseStyle.primaryColor} />
        </View>
        <View style={styles.quickHelpTextContainer}>
          <Text style={[styles.quickHelpTitle, { color: theme.colors.text }]}>
            AI Studiehjälp
          </Text>
          <Text style={[styles.quickHelpSubtitle, { color: theme.colors.textSecondary }]}>
            Ställ frågor eller få snabba tips
          </Text>
        </View>
      </View>

      {quickTip && (
        <View style={[styles.quickTipBubble, { backgroundColor: courseStyle.primaryColor + '10' }]}>
          <Sparkles size={16} color={courseStyle.primaryColor} />
          <Text style={[styles.quickTipText, { color: theme.colors.text }]}>
            {quickTip}
          </Text>
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        <TouchableOpacity
          style={[styles.quickTipButton, { backgroundColor: courseStyle.primaryColor }]}
          onPress={generateQuickTip}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Lightbulb size={16} color="white" />
              <Text style={styles.quickTipButtonText}>Snabbtips</Text>
            </>
          )}
        </TouchableOpacity>

        {suggestedQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
            onPress={() => onAskQuestion?.(question)}
          >
            <Text 
              style={[styles.suggestionText, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {question}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  generateBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
  contentContainer: {
    marginTop: 12,
    gap: 16,
  },
  studyPlanCard: {
    borderRadius: 16,
    padding: 18,
  },
  studyPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  studyPlanTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  studyPlanText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  studyPlanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  focusAreasContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  focusAreasList: {
    gap: 8,
  },
  focusAreaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  focusAreaText: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionableBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionableText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  compactButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  compactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  quickHelpContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickHelpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  quickHelpIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickHelpTextContainer: {
    flex: 1,
  },
  quickHelpTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  quickHelpSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  quickTipBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
  },
  quickTipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  suggestionsContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  quickTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  quickTipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});

export default AIStudyInsights;
