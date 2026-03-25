import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  ArrowLeft,
  GraduationCap,
  Target,
  Calendar,
  HelpCircle,
  Lightbulb,
  Copy,
  RotateCcw,
  BookOpen,
  Brain,
} from 'lucide-react-native';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useStudy } from '@/contexts/StudyContext';
import { PremiumGate } from '@/components/PremiumGate';
import { MarkdownText } from '@/components/MarkdownText';
import { FadeInView } from '@/components/Animations';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';

const COACH_SUGGESTIONS = [
  {
    text: 'Varför fick jag fel på den frågan?',
    icon: HelpCircle,
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'] as const,
  },
  {
    text: 'Skapa en studieplan inför mitt prov',
    icon: Calendar,
    color: '#6366F1',
    gradient: ['#6366F1', '#8B5CF6'] as const,
  },
  {
    text: 'Analysera mina svaga områden',
    icon: Target,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'] as const,
  },
  {
    text: 'Ge mig motiverande studietips',
    icon: Lightbulb,
    color: '#10B981',
    gradient: ['#10B981', '#059669'] as const,
  },
];

export default function StudyCoachScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user, courses, pomodoroSessions } = useStudy();

  const buildSystemContext = useCallback(() => {
    const activeCourses = courses.filter(c => c.isActive);
    const totalStudyMinutes = pomodoroSessions.reduce((sum, s) => sum + s.duration, 0);
    const recentSessions = pomodoroSessions.slice(0, 10);

    return `Du är en personlig studiecoach för en svensk student. Svara ALLTID på svenska.
Studentens namn: ${user?.name || 'Studenten'}
Utbildningsnivå: ${user?.studyLevel || 'okänd'}
Program: ${user?.program || 'okänt'}
Aktiva kurser: ${activeCourses.map(c => `${c.title} (${c.progress}% klart)`).join(', ') || 'Inga'}
Total studietid: ${Math.round(totalStudyMinutes / 60)} timmar
Senaste sessioner: ${recentSessions.length} st
Streak: Aktiv

Du ska:
- Analysera studentens prestationer och ge konkreta råd
- Förklara varför svar är rätt/fel på ett pedagogiskt sätt  
- Skapa realistiska studieplaner baserade på provdatum
- Anpassa motivationsmeddelanden till studentens personlighet och framsteg
- Vara uppmuntrande men ärlig
- Ge specifika, handlingsbara tips`;
  }, [user, courses, pomodoroSessions]);

  const { messages, error, sendMessage, setMessages } = useRorkAgent({
    tools: {
      analyzePerformance: createRorkTool({
        description: 'Analyze student performance across courses',
        zodSchema: z.object({
          courseTitle: z.string().describe('Course to analyze').optional(),
        }),
        execute(input) {
          const targetCourses = input.courseTitle 
            ? courses.filter(c => c.title.toLowerCase().includes(input.courseTitle!.toLowerCase()))
            : courses.filter(c => c.isActive);
          
          return JSON.stringify({
            courses: targetCourses.map(c => ({
              title: c.title,
              progress: c.progress,
              subject: c.subject,
            })),
            totalStudyMinutes: pomodoroSessions.reduce((sum, s) => sum + s.duration, 0),
            sessionCount: pomodoroSessions.length,
            averageSessionLength: pomodoroSessions.length > 0
              ? Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / pomodoroSessions.length)
              : 0,
          });
        },
      }),
      generateStudyPlan: createRorkTool({
        description: 'Generate a study plan based on courses and exam dates',
        zodSchema: z.object({
          examDate: z.string().describe('Exam date in YYYY-MM-DD format').optional(),
          courseName: z.string().describe('Course name for the study plan').optional(),
          hoursPerDay: z.number().describe('Available study hours per day').optional(),
        }),
        execute(input) {
          const activeCourses = courses.filter(c => c.isActive);
          return JSON.stringify({
            activeCourses: activeCourses.map(c => ({ title: c.title, progress: c.progress })),
            examDate: input.examDate || 'not specified',
            suggestedHoursPerDay: input.hoursPerDay || 2,
            currentStudyHabits: {
              averageMinutesPerDay: pomodoroSessions.length > 0
                ? Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / 7)
                : 0,
            },
          });
        },
      }),
    },
  });

  useEffect(() => {
    if (messages.length === 0) {
      const ctx = buildSystemContext();
      console.log('[StudyCoach] System context built, length:', ctx.length);
    }
  }, [buildSystemContext, messages.length]);

  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isSending) return;

    setInput('');
    setIsSending(true);
    setLocalError(null);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    console.log('[StudyCoach] Sending:', messageText);

    try {
      await sendMessage(messageText);
      console.log('[StudyCoach] Message sent successfully');
    } catch (err) {
      console.error('[StudyCoach] Error:', err);
      setLocalError('Ett fel uppstod. Försök igen.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Kopierat!', 'Texten har kopierats.');
  };

  const handleReset = () => {
    Alert.alert('Ny konversation', 'Vill du börja om?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Börja om',
        onPress: () => {
          setMessages([]);
          setLocalError(null);
        },
      },
    ]);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const visibleMessages = messages.filter(m => m.role !== 'system');

  const renderMessage = (message: any) => {
    const isUser = message.role === 'user';

    return (
      <FadeInView key={message.id} duration={200}>
        <View
          style={[
            styles.messageRow,
            isUser ? styles.userRow : styles.assistantRow,
          ]}
        >
          {!isUser && (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.coachAvatar}
            >
              <GraduationCap size={16} color="#fff" />
            </LinearGradient>
          )}
          <View style={{ flex: 1, maxWidth: isUser ? '80%' : undefined }}>
            <View
              style={[
                styles.bubble,
                isUser
                  ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                  : [styles.assistantBubble, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }],
              ]}
            >
              {message.parts.map((part: any, i: number) => {
                if (part.type === 'text') {
                  return isUser ? (
                    <Text key={`${message.id}-${i}`} style={styles.userText} selectable>
                      {part.text}
                    </Text>
                  ) : (
                    <MarkdownText key={`${message.id}-${i}`} style={[styles.assistantText, { color: theme.colors.text }]}>
                      {part.text}
                    </MarkdownText>
                  );
                }
                if (part.type === 'tool') {
                  if (part.state === 'output-available') return null;
                  return (
                    <View key={`${message.id}-${i}`} style={[styles.toolIndicator, { backgroundColor: theme.colors.primary + '10' }]}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={[styles.toolText, { color: theme.colors.primary }]}>Analyserar...</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
            {!isUser && (
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => {
                  const text = message.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('\n');
                  handleCopy(text);
                }}
              >
                <Copy size={12} color={theme.colors.textMuted} />
                <Text style={[styles.copyText, { color: theme.colors.textMuted }]}>Kopiera</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </FadeInView>
    );
  };

  return (
    <PremiumGate feature="ai-chat" fullScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={isDark ? '#C7D2FE' : '#4338CA'} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerTitleRow}>
                  <GraduationCap size={20} color={isDark ? '#A5B4FC' : '#6366F1'} />
                  <Text style={[styles.headerTitle, { color: isDark ? '#E0E7FF' : '#1E1B4B' }]}>Studiecoach</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#A5B4FC' : '#6366F1' }]}>Din personliga AI-handledare</Text>
              </View>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <RotateCcw size={20} color={isDark ? '#A5B4FC' : '#6366F1'} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {visibleMessages.length === 0 ? (
              <View style={styles.emptyState}>
                <Animated.View style={[styles.emptyIconWrap, { transform: [{ scale: headerAnim }] }]}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.emptyIcon}
                  >
                    <Brain size={40} color="#fff" />
                  </LinearGradient>
                </Animated.View>

                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Hej {user?.name || 'där'}! 👋
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Jag är din personliga studiecoach. Fråga mig om studietips, provplanering eller varför ett svar var fel.
                </Text>

                <View style={styles.suggestions}>
                  {COACH_SUGGESTIONS.map((s, i) => (
                    <FadeInView key={i} delay={200 + i * 80} duration={300}>
                      <TouchableOpacity
                        style={[styles.suggestionCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: s.color + '25' }]}
                        onPress={() => handleSend(s.text)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.suggestionIconWrap, { backgroundColor: s.color + '15' }]}>
                          <s.icon size={18} color={s.color} />
                        </View>
                        <Text style={[styles.suggestionText, { color: theme.colors.text }]} numberOfLines={2}>
                          {s.text}
                        </Text>
                      </TouchableOpacity>
                    </FadeInView>
                  ))}
                </View>

                {courses.filter(c => c.isActive).length > 0 && (
                  <FadeInView delay={600} duration={300}>
                    <View style={[styles.contextCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                      <View style={styles.contextHeader}>
                        <BookOpen size={16} color={theme.colors.primary} />
                        <Text style={[styles.contextTitle, { color: theme.colors.text }]}>Dina aktiva kurser</Text>
                      </View>
                      {courses.filter(c => c.isActive).slice(0, 3).map(c => (
                        <View key={c.id} style={styles.contextCourse}>
                          <Text style={[styles.contextCourseName, { color: theme.colors.textSecondary }]}>{c.title}</Text>
                          <View style={[styles.contextProgress, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.contextProgressText, { color: theme.colors.primary }]}>{c.progress}%</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </FadeInView>
                )}
              </View>
            ) : (
              visibleMessages.map(renderMessage)
            )}

            {isSending && (
              <View style={styles.typingRow}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.coachAvatar}>
                  <GraduationCap size={16} color="#fff" />
                </LinearGradient>
                <View style={[styles.typingBubble, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <TypingIndicator color={theme.colors.primary} />
                </View>
              </View>
            )}

            {(error || localError) && (
              <View style={[styles.errorBox, { backgroundColor: '#FEF2F2' }]}>
                <Text style={styles.errorText}>
                  {localError || 'Ett fel uppstod. Försök igen.'}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { backgroundColor: theme.colors.background, borderTopColor: isDark ? '#1E293B' : '#E2E8F0', paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: theme.colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Fråga din studiecoach..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                maxLength={1500}
                editable={!isSending}
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: theme.colors.primary }, (!input.trim() || isSending) && { opacity: 0.4 }]}
                onPress={() => handleSend()}
                disabled={!input.trim() || isSending}
              >
                <Send size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </PremiumGate>
  );
}

function TypingIndicator({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    };

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start(); a2.start(); a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDots}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { backgroundColor: color, opacity: d }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {},
  headerGradient: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, fontWeight: '500' as const, marginTop: 2 },
  resetBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  emptyState: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 8 },
  emptyIconWrap: { marginBottom: 24 },
  emptyIcon: { width: 88, height: 88, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  suggestions: { width: '100%', gap: 10 },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionIconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  suggestionText: { fontSize: 14, fontWeight: '600' as const, flex: 1 },
  contextCard: { width: '100%', marginTop: 24, borderRadius: 16, padding: 16, borderWidth: 1 },
  contextHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  contextTitle: { fontSize: 14, fontWeight: '600' as const },
  contextCourse: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  contextCourseName: { fontSize: 13, flex: 1 },
  contextProgress: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  contextProgressText: { fontSize: 12, fontWeight: '600' as const },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  coachAvatar: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  bubble: { padding: 14, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  assistantBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  userText: { fontSize: 15, lineHeight: 22, color: '#fff' },
  assistantText: { fontSize: 15, lineHeight: 22 },
  toolIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginTop: 6 },
  toolText: { fontSize: 13, fontWeight: '500' as const },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 8, paddingVertical: 4 },
  copyText: { fontSize: 11 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  typingBubble: { padding: 16, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1 },
  typingDots: { flexDirection: 'row', gap: 6 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  errorBox: { padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  inputArea: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
});
