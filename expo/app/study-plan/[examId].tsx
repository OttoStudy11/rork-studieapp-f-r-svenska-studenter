import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  RefreshCw,
  Clock,
  Lightbulb,
  GraduationCap,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams } from '@/contexts/ExamContext';
import { generateText } from '@rork-ai/toolkit-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StudyTask {
  title: string;
  description: string;
  duration: number;
  type: string;
}

interface DailyPlan {
  day: number;
  date: string;
  theme: string;
  technique: string;
  techniqueReason: string;
  tasks: StudyTask[];
  skolverketFocus: string;
  motivationTip: string;
}

interface Phase {
  name: string;
  days: string;
  focus: string;
}

interface StudyPlanData {
  overview: string;
  phases: Phase[];
  dailyPlan: DailyPlan[];
  examDayTips: string[];
}

interface StoredPlan {
  plan: StudyPlanData;
  generatedAt: string;
  examId: string;
}

const LOADING_MESSAGES = [
  'Analyserar kursens innehåll...',
  'Hämtar Skolverkets kunskapskrav...',
  'Planerar studiefaser...',
  'Bygger din personliga plan...',
  'Optimerar studietiden...',
  'Lägger till studietekniker...',
];

const TECHNIQUE_EMOJIS: Record<string, string> = {
  'pomodoro': '🍅',
  'feynman': '🧠',
  'cornell': '📝',
  'spaced repetition': '📅',
  'active recall': '🔄',
  'mind map': '🗺️',
  'sammanfattning': '✍️',
  'flashcards': '🃏',
};

const getTechniqueEmoji = (technique: string): string => {
  const lower = technique.toLowerCase();
  for (const [key, emoji] of Object.entries(TECHNIQUE_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '📚';
};

const getGradeColor = (focus: string, theme: any): string => {
  const lower = focus.toLowerCase();
  if (lower.includes('a-nivå') || lower.includes('a-niv')) return theme.colors.success;
  if (lower.includes('c-nivå') || lower.includes('c-niv')) return theme.colors.info;
  return theme.colors.warning;
};

const getGradeBadge = (focus: string): string => {
  const lower = focus.toLowerCase();
  if (lower.includes('a-nivå') || lower.includes('a-niv')) return 'A';
  if (lower.includes('c-nivå') || lower.includes('c-niv')) return 'C';
  return 'E';
};

const getCountdownColor = (days: number): { color: string; bg: string } => {
  if (days > 14) return { color: '#10B981', bg: '#10B98120' };
  if (days >= 7) return { color: '#F59E0B', bg: '#F59E0B20' };
  return { color: '#EF4444', bg: '#EF444420' };
};

export default function StudyPlanScreen() {
  const { examId, courseTitle: paramCourseTitle } = useLocalSearchParams<{ examId: string; courseTitle?: string }>();
  const { theme, isDark } = useTheme();
  const { getExamById } = useExams();
  const insets = useSafeAreaInsets();

  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loadingPulse = useRef(new Animated.Value(0.4)).current;

  const exam = examId ? getExamById(examId) : undefined;

  const daysUntilExam = exam
    ? Math.max(0, Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const countdownStyle = getCountdownColor(daysUntilExam);

  const storageKey = `study-plan-${examId}`;

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (isGenerating) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(loadingPulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isGenerating, loadingPulse]);

  useEffect(() => {
    if (plan) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [plan, fadeAnim]);

  const loadSavedPlan = useCallback(async (): Promise<'loaded' | 'stale' | 'none'> => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        const stored = JSON.parse(saved) as StoredPlan | StudyPlanData;

        let planData: StudyPlanData;
        let generatedAt: string | null = null;

        if ('plan' in stored && 'generatedAt' in stored) {
          planData = stored.plan;
          generatedAt = stored.generatedAt;
        } else {
          planData = stored as StudyPlanData;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        const futureDays = planData.dailyPlan.filter((day) => day.date >= todayStr);

        if (futureDays.length === 0) {
          console.log('All plan days have passed, need regeneration');
          return 'stale';
        }

        const generatedDate = generatedAt ? generatedAt.split('T')[0] : null;
        const daysSinceGenerated = generatedDate
          ? Math.floor((Date.now() - new Date(generatedDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        if (daysSinceGenerated >= 3 && daysUntilExam > 2) {
          console.log(`Plan is ${daysSinceGenerated} days old with ${daysUntilExam} days until exam, regenerating`);
          return 'stale';
        }

        const updatedPlan: StudyPlanData = {
          ...planData,
          dailyPlan: futureDays.map((day, index) => ({ ...day, day: index + 1 })),
        };

        setPlan(updatedPlan);
        console.log(`Loaded study plan: ${futureDays.length}/${planData.dailyPlan.length} days remaining`);
        return 'loaded';
      }
    } catch (err) {
      console.error('Error loading saved plan:', err);
    }
    return 'none';
  }, [storageKey, daysUntilExam]);

  const generatePlan = useCallback(async (forceRegenerate = false) => {
    if (!exam) return;

    if (!forceRegenerate) {
      const result = await loadSavedPlan();
      if (result === 'loaded') return;
      if (result === 'stale') {
        console.log('Saved plan is stale, auto-regenerating...');
      }
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessageIndex(0);
    fadeAnim.setValue(0);

    const courseTitle = paramCourseTitle || exam.title;
    const daysLeft = Math.min(30, Math.max(1, daysUntilExam));

    const today = new Date();
    const dates = Array.from({ length: daysLeft }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const systemPrompt = `Du är en expert på studieplanering för svenska gymnasie- och högskolestudenter. Du känner till Skolverkets kunskapskrav och betygskriterier. Generera en detaljerad studieplan i JSON-format.

Returnera ENBART ett JSON-objekt utan markdown eller förklaringar:
{
  "overview": "kort motiverande text 1-2 meningar",
  "phases": [
    {
      "name": "fasnamn",
      "days": "dag X–Y",
      "focus": "vad fokuseras på denna fas"
    }
  ],
  "dailyPlan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "dagens tema",
      "technique": "studieteknik att använda (t.ex. Pomodoro, Feynman, Cornell-anteckningar, Spaced Repetition)",
      "techniqueReason": "varför denna teknik passar idag",
      "tasks": [
        {
          "title": "uppgiftstitel",
          "description": "vad eleven ska göra konkret",
          "duration": 45,
          "type": "läsning | övning | repetition | sammanfattning | flashcards | provförberedelse"
        }
      ],
      "skolverketFocus": "vilket kunskapskrav från Skolverket som tränas (t.ex. E-nivå grundförståelse, C-nivå analys, A-nivå syntes)",
      "motivationTip": "kort motiverande tips för dagen"
    }
  ],
  "examDayTips": ["tip1", "tip2", "tip3"]
}`;

    const userMessage = `Skapa en studieplan för kursen "${courseTitle}" med provet "${exam.title}" om ${daysLeft} dagar. Datum för varje dag: ${dates.join(', ')}. Skapa en plan för varje dag från idag till dagen innan provet (max 30 dagar). Inkludera varierade studietekniker och Skolverket-kopplingar.`;

    try {
      console.log('Generating study plan with AI...');
      const result = await generateText({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      console.log('AI response received, parsing...');

      let jsonStr = result.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr) as StudyPlanData;

      if (!parsed.dailyPlan || !Array.isArray(parsed.dailyPlan)) {
        throw new Error('Invalid plan format');
      }

      setPlan(parsed);
      const storedPlan: StoredPlan = {
        plan: parsed,
        generatedAt: new Date().toISOString(),
        examId: examId || '',
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(storedPlan));
      console.log('Study plan generated and saved');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error generating study plan:', err);
      setError('Kunde inte generera studieplanen. Försök igen.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  }, [exam, daysUntilExam, paramCourseTitle, loadSavedPlan, storageKey, fadeAnim, examId]);

  useEffect(() => {
    if (exam) {
      void generatePlan(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  const handleRegenerate = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void generatePlan(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (!exam) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.errorContainer, { paddingTop: insets.top + 60 }]}>
          <GraduationCap size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Provet hittades inte</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Det schemalagda provet finns inte längre.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            testID="study-plan-back"
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle} numberOfLines={1}>Studieplan</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{exam.title}</Text>
          </View>
          {plan && !isGenerating && (
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleRegenerate}
              testID="study-plan-refresh"
            >
              <RefreshCw size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoLeft}>
            <Text style={styles.courseLabel}>{paramCourseTitle || exam.title}</Text>
            <View style={styles.examDateRow}>
              <Calendar size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.examDateText}>
                Prov: {exam.examDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={[styles.countdownCircle, { backgroundColor: countdownStyle.bg, borderColor: countdownStyle.color }]}>
            <Text style={[styles.countdownNumber, { color: countdownStyle.color }]}>{daysUntilExam}</Text>
            <Text style={[styles.countdownLabel, { color: countdownStyle.color }]}>dagar</Text>
          </View>
        </View>
      </LinearGradient>

      {isGenerating && (
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Animated.View style={[styles.loadingContent, { opacity: loadingPulse }]}>
            <View style={[styles.loadingIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
              Skapar din studieplan
            </Text>
            <Text style={[styles.loadingMessage, { color: theme.colors.textSecondary }]}>
              {LOADING_MESSAGES[loadingMessageIndex]}
            </Text>
          </Animated.View>
        </View>
      )}

      {error && !isGenerating && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '15' }]}>
          <Text style={[styles.errorBannerText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.error }]}
            onPress={handleRegenerate}
          >
            <Text style={styles.retryBtnText}>Försök igen</Text>
          </TouchableOpacity>
        </View>
      )}

      {plan && !isGenerating && (
        <Animated.View style={[styles.planContainer, { opacity: fadeAnim }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          >
            <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.overviewIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Lightbulb size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.overviewText, { color: theme.colors.text }]}>{plan.overview}</Text>
            </View>

            {plan.phases && plan.phases.length > 0 && (
              <View style={styles.phasesSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studiefaser</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phasesScroll}>
                  {plan.phases.map((phase, index) => (
                    <View
                      key={index}
                      style={[styles.phaseChip, {
                        backgroundColor: isDark ? theme.colors.card : theme.colors.primary + '10',
                        borderColor: theme.colors.primary + '30',
                      }]}
                    >
                      <View style={[styles.phaseNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.phaseNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.phaseContent}>
                        <Text style={[styles.phaseName, { color: theme.colors.text }]}>{phase.name}</Text>
                        <Text style={[styles.phaseDays, { color: theme.colors.textSecondary }]}>{phase.days}</Text>
                        <Text style={[styles.phaseFocus, { color: theme.colors.textMuted }]} numberOfLines={2}>{phase.focus}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Dag för dag</Text>

            {plan.dailyPlan.map((day) => {
              const isToday = day.date === todayStr;
              const totalMinutes = day.tasks.reduce((s, t) => s + (t.duration || 0), 0);
              const gradeColor = getGradeColor(day.skolverketFocus || '', theme);
              const gradeBadge = getGradeBadge(day.skolverketFocus || '');

              return (
                <View
                  key={day.day}
                  style={[
                    styles.dayCard,
                    { backgroundColor: theme.colors.card },
                    isToday && { borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
                  ]}
                >
                  <View style={styles.dayHeader}>
                    <View style={styles.dayDateArea}>
                      <View style={[
                        styles.dayBadge,
                        { backgroundColor: isToday ? theme.colors.primary : theme.colors.primary + '15' }
                      ]}>
                        <Text style={[
                          styles.dayBadgeText,
                          { color: isToday ? '#fff' : theme.colors.primary }
                        ]}>
                          Dag {day.day}
                        </Text>
                      </View>
                      <Text style={[styles.dayDate, { color: theme.colors.textSecondary }]}>
                        {formatSwedishDate(day.date)}
                      </Text>
                      {isToday && (
                        <View style={[styles.todayBadge, { backgroundColor: theme.colors.success + '15' }]}>
                          <Text style={[styles.todayBadgeText, { color: theme.colors.success }]}>Idag</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.dayDuration}>
                      <Clock size={13} color={theme.colors.textMuted} />
                      <Text style={[styles.dayDurationText, { color: theme.colors.textMuted }]}>{totalMinutes} min</Text>
                    </View>
                  </View>

                  <Text style={[styles.dayTheme, { color: theme.colors.text }]}>{day.theme}</Text>

                  <View style={[styles.techniqueBadge, { backgroundColor: isDark ? '#2a2a3e' : '#f0f0ff' }]}>
                    <Text style={styles.techniqueEmoji}>{getTechniqueEmoji(day.technique)}</Text>
                    <View style={styles.techniqueContent}>
                      <Text style={[styles.techniqueName, { color: theme.colors.text }]}>{day.technique}</Text>
                      {day.techniqueReason ? (
                        <Text style={[styles.techniqueReason, { color: theme.colors.textMuted }]} numberOfLines={2}>
                          {day.techniqueReason}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.tasksList}>
                    {day.tasks.map((task, taskIndex) => (
                      <View key={taskIndex} style={[styles.taskItem, { borderBottomColor: theme.colors.borderLight }]}>
                        <View style={[styles.taskDot, { backgroundColor: theme.colors.primary }]} />
                        <View style={styles.taskContent}>
                          <View style={styles.taskTitleRow}>
                            <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                            <Text style={[styles.taskDuration, { color: theme.colors.textMuted }]}>{task.duration} min</Text>
                          </View>
                          {task.description ? (
                            <Text style={[styles.taskDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                              {task.description}
                            </Text>
                          ) : null}
                          <View style={[styles.taskTypeBadge, { backgroundColor: theme.colors.primary + '10' }]}>
                            <Text style={[styles.taskTypeText, { color: theme.colors.primary }]}>{task.type}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {day.skolverketFocus ? (
                    <View style={[styles.skolverketRow, { backgroundColor: gradeColor + '10' }]}>
                      <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
                        <Text style={styles.gradeBadgeText}>{gradeBadge}</Text>
                      </View>
                      <Text style={[styles.skolverketText, { color: gradeColor }]} numberOfLines={2}>
                        {day.skolverketFocus}
                      </Text>
                    </View>
                  ) : null}

                  {day.motivationTip ? (
                    <View style={[styles.motivationRow, { backgroundColor: theme.colors.warning + '08' }]}>
                      <Text style={styles.motivationEmoji}>💡</Text>
                      <Text style={[styles.motivationText, { color: theme.colors.textSecondary }]}>{day.motivationTip}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {plan.examDayTips && plan.examDayTips.length > 0 && (
              <View style={[styles.examTipsCard, { backgroundColor: isDark ? '#1a2332' : '#FFF7ED' }]}>
                <View style={styles.examTipsHeader}>
                  <View style={[styles.examTipsIcon, { backgroundColor: '#F59E0B20' }]}>
                    <GraduationCap size={24} color="#F59E0B" />
                  </View>
                  <Text style={[styles.examTipsTitle, { color: theme.colors.text }]}>Provdagstips</Text>
                </View>
                {plan.examDayTips.map((tip, index) => (
                  <View key={index} style={styles.examTipRow}>
                    <View style={[styles.examTipBullet, { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.examTipBulletText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.examTipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

function formatSwedishDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfoLeft: {
    flex: 1,
    marginRight: 16,
  },
  courseLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 6,
  },
  examDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examDateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  countdownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 30,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  loadingMessage: {
    fontSize: 15,
    textAlign: 'center',
  },
  errorBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  errorBannerText: {
    fontSize: 15,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  planContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 21,
  },
  phasesSection: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  phasesScroll: {
    gap: 12,
    paddingRight: 4,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    width: 200,
    gap: 10,
  },
  phaseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  phaseContent: {
    flex: 1,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  phaseDays: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  phaseFocus: {
    fontSize: 12,
    lineHeight: 17,
  },
  dayCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayDateArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  dayDate: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  dayDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayDurationText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  dayTheme: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  techniqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 14,
  },
  techniqueEmoji: {
    fontSize: 24,
  },
  techniqueContent: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  techniqueReason: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  tasksList: {
    gap: 0,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 8,
  },
  taskDuration: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  taskDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  taskTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskTypeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  skolverketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
    marginBottom: 8,
  },
  gradeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800' as const,
  },
  skolverketText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
  motivationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  motivationEmoji: {
    fontSize: 16,
    marginTop: 1,
  },
  motivationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  examTipsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  examTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  examTipsIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examTipsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  examTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  examTipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examTipBulletText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  examTipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 21,
  },
});
