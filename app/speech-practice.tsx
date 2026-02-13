import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Mic,
  MicOff,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Target,
  Volume2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Brain,
  MessageSquare,
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumGate } from '@/components/PremiumGate';
import { FadeInView, SlideInView } from '@/components/Animations';
import { MarkdownText } from '@/components/MarkdownText';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';

interface PracticeTopic {
  id: string;
  title: string;
  description: string;
  subject: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleQuestion: string;
}

const PRACTICE_TOPICS: PracticeTopic[] = [
  {
    id: '1',
    title: 'Fotosyntesen',
    description: 'Förklara processen steg för steg',
    subject: 'Biologi',
    emoji: '🌿',
    difficulty: 'medium',
    sampleQuestion: 'Förklara fotosyntesens process, inklusive ljusreaktionerna och Calvincykeln. Vilka är de viktigaste molekylerna som deltar?',
  },
  {
    id: '2',
    title: 'Franska revolutionen',
    description: 'Orsaker och konsekvenser',
    subject: 'Historia',
    emoji: '🏰',
    difficulty: 'medium',
    sampleQuestion: 'Beskriv de viktigaste orsakerna till franska revolutionen och vilka konsekvenser den hade för Europa.',
  },
  {
    id: '3',
    title: 'Pythagoras sats',
    description: 'Bevisa och tillämpa',
    subject: 'Matematik',
    emoji: '📐',
    difficulty: 'easy',
    sampleQuestion: 'Förklara Pythagoras sats och ge ett praktiskt exempel på hur den kan användas.',
  },
  {
    id: '4',
    title: 'Demokrati & makt',
    description: 'Svenska styrelseskicket',
    subject: 'Samhällskunskap',
    emoji: '🏛️',
    difficulty: 'medium',
    sampleQuestion: 'Förklara hur den svenska demokratin fungerar. Beskriv riksdagens, regeringens och kommunernas roller.',
  },
  {
    id: '5',
    title: 'Klimatförändringar',
    description: 'Orsaker, effekter och lösningar',
    subject: 'Geografi',
    emoji: '🌍',
    difficulty: 'hard',
    sampleQuestion: 'Diskutera orsakerna till klimatförändringar, vilka effekter vi ser idag, och vilka lösningar som finns tillgängliga.',
  },
  {
    id: '6',
    title: 'DNA & arvsmekanismer',
    description: 'Genetik och proteinssyntes',
    subject: 'Biologi',
    emoji: '🧬',
    difficulty: 'hard',
    sampleQuestion: 'Förklara DNA:s struktur, hur proteinsyntesen fungerar (transkription och translation), och hur genetisk information ärvs.',
  },
];

const evaluationSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall score 0-100'),
  completeness: z.number().min(0).max(100).describe('How complete the answer is 0-100'),
  accuracy: z.number().min(0).max(100).describe('How accurate the answer is 0-100'),
  clarity: z.number().min(0).max(100).describe('How clear and well-structured 0-100'),
  strengths: z.array(z.string()).describe('List of strengths in the answer, in Swedish'),
  improvements: z.array(z.string()).describe('List of things to improve, in Swedish'),
  missingConcepts: z.array(z.string()).describe('Key concepts that were missing, in Swedish'),
  detailedFeedback: z.string().describe('Detailed feedback and explanation in Swedish'),
  grade: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).describe('Swedish grade equivalent'),
});

type EvaluationResult = z.infer<typeof evaluationSchema>;

export default function SpeechPracticeScreen() {
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [step, setStep] = useState<'select' | 'record' | 'result'>('select');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    if (isRecording) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = useCallback(async () => {
    try {
      console.log('[SpeechPractice] Starting recording...');

      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.start();
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till mikrofonen.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: 3,
            audioEncoder: 3,
          },
          ios: {
            extension: '.wav',
            outputFormat: 0x6C70636D,
            audioQuality: 127,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          web: {},
        });
        await recording.startAsync();
        recordingRef.current = recording;
      }

      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      console.log('[SpeechPractice] Recording started');
    } catch (err) {
      console.error('[SpeechPractice] Start recording error:', err);
      Alert.alert('Fel', 'Kunde inte starta inspelning. Kontrollera mikrofontillstånd.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      console.log('[SpeechPractice] Stopping recording...');

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const formData = new FormData();
      formData.append('language', 'sv');

      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current) {
          return new Promise<void>((resolve) => {
            mediaRecorderRef.current!.onstop = async () => {
              const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
              formData.append('audio', audioBlob, 'recording.webm');

              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
              }

              await doTranscribeAndEvaluate(formData);
              resolve();
            };
            mediaRecorderRef.current!.stop();
          });
        }
      } else {
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

          const uri = recordingRef.current.getURI();
          if (uri) {
            const uriParts = uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            const audioFile = {
              uri,
              name: 'recording.' + fileType,
              type: 'audio/' + fileType,
            };

            formData.append('audio', audioFile as any);
            await doTranscribeAndEvaluate(formData);
          }
          recordingRef.current = null;
        }
      }
    } catch (err) {
      console.error('[SpeechPractice] Stop recording error:', err);
      Alert.alert('Fel', 'Kunde inte stoppa inspelning.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  const transcribeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('[SpeechPractice] Transcribing audio...');

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transkription misslyckades');
      }

      const result: { text: string; language: string } = await response.json();
      console.log('[SpeechPractice] Transcribed:', result.text.substring(0, 100));
      return result.text;
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!selectedTopic) throw new Error('Inget ämne valt');

      console.log('[SpeechPractice] Evaluating answer...');

      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: `Du är en svensk lärare som utvärderar en elevs muntliga svar. Bedöm svaret noggrant.

FRÅGA: ${selectedTopic.sampleQuestion}

ÄMNE: ${selectedTopic.subject}
SVÅRIGHETSGRAD: ${selectedTopic.difficulty}

ELEVENS SVAR (transkriberat från tal):
${answer}

Utvärdera svaret baserat på:
1. Fullständighet - Täcker svaret alla viktiga aspekter?
2. Korrekthet - Är informationen korrekt?
3. Tydlighet - Är svaret välstrukturerat och lätt att förstå?

Ge betyg enligt det svenska betygssystemet (A-F).
Var pedagogisk och uppmuntrande i din feedback.`,
          },
        ],
        schema: evaluationSchema,
      });

      console.log('[SpeechPractice] Evaluation complete, score:', result.overallScore);
      return result;
    },
  });

  const doTranscribeAndEvaluate = async (formData: FormData) => {
    try {
      const text = await transcribeMutation.mutateAsync(formData);
      setTranscribedText(text);

      if (text.trim().length < 5) {
        Alert.alert('Inget ljud', 'Vi kunde inte höra ditt svar. Försök igen och tala tydligt.');
        return;
      }

      const result = await evaluateMutation.mutateAsync(text);
      setEvaluation(result);
      setStep('result');

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('[SpeechPractice] Transcribe/evaluate error:', err);
      Alert.alert('Fel', 'Kunde inte utvärdera ditt svar. Försök igen.');
    }
  };

  const handleSelectTopic = (topic: PracticeTopic) => {
    setSelectedTopic(topic);
    setTranscribedText('');
    setEvaluation(null);
    setStep('record');

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReset = () => {
    setSelectedTopic(null);
    setTranscribedText('');
    setEvaluation(null);
    setRecordingDuration(0);
    setStep('select');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#34D399';
      case 'C': return '#F59E0B';
      case 'D': return '#FB923C';
      case 'E': return '#F87171';
      case 'F': return '#EF4444';
      default: return '#6366F1';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#FB923C';
    return '#EF4444';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6366F1';
    }
  };

  const isProcessing = transcribeMutation.isPending || evaluateMutation.isPending;

  return (
    <PremiumGate feature="ai-chat" fullScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <LinearGradient
            colors={isDark ? ['#1E3A5F', '#164E63'] : ['#ECFDF5', '#D1FAE5']}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => step === 'select' ? router.back() : handleReset()} style={styles.backBtn}>
                <ArrowLeft size={24} color={isDark ? '#6EE7B7' : '#065F46'} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerTitleRow}>
                  <Volume2 size={20} color={isDark ? '#6EE7B7' : '#059669'} />
                  <Text style={[styles.headerTitle, { color: isDark ? '#D1FAE5' : '#064E3B' }]}>Talpraktik</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#6EE7B7' : '#059669' }]}>Öva muntliga svar med AI-feedback</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        >
          {step === 'select' && (
            <>
              <SlideInView direction="up" delay={0} duration={300}>
                <View style={styles.introSection}>
                  <View style={[styles.introCard, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: isDark ? '#334155' : '#BBF7D0' }]}>
                    <Brain size={28} color="#10B981" />
                    <Text style={[styles.introTitle, { color: theme.colors.text }]}>Öva som inför ett muntligt prov</Text>
                    <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
                      Välj ett ämne, förklara konceptet med din röst, och få AI-feedback på fullständighet, korrekthet och tydlighet.
                    </Text>
                  </View>
                </View>
              </SlideInView>

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Välj ämne</Text>

              {PRACTICE_TOPICS.map((topic, index) => (
                <FadeInView key={topic.id} delay={100 + index * 60} duration={250}>
                  <TouchableOpacity
                    style={[styles.topicCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={() => handleSelectTopic(topic)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.topicLeft}>
                      <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                      <View style={styles.topicInfo}>
                        <Text style={[styles.topicTitle, { color: theme.colors.text }]}>{topic.title}</Text>
                        <Text style={[styles.topicDesc, { color: theme.colors.textSecondary }]}>{topic.description}</Text>
                        <View style={styles.topicMeta}>
                          <View style={[styles.subjectBadge, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
                            <Text style={[styles.subjectText, { color: theme.colors.textSecondary }]}>{topic.subject}</Text>
                          </View>
                          <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(topic.difficulty) + '15' }]}>
                            <Text style={[styles.diffText, { color: getDifficultyColor(topic.difficulty) }]}>
                              {topic.difficulty === 'easy' ? 'Enkel' : topic.difficulty === 'medium' ? 'Medel' : 'Svår'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </>
          )}

          {step === 'record' && selectedTopic && (
            <>
              <SlideInView direction="up" delay={0} duration={300}>
                <View style={[styles.questionCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionEmoji}>{selectedTopic.emoji}</Text>
                    <View style={styles.questionHeaderInfo}>
                      <Text style={[styles.questionSubject, { color: theme.colors.primary }]}>{selectedTopic.subject}</Text>
                      <Text style={[styles.questionTopicTitle, { color: theme.colors.text }]}>{selectedTopic.title}</Text>
                    </View>
                  </View>
                  <View style={[styles.questionBody, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <MessageSquare size={16} color={theme.colors.primary} />
                    <Text style={[styles.questionText, { color: theme.colors.text }]}>{selectedTopic.sampleQuestion}</Text>
                  </View>
                </View>
              </SlideInView>

              <SlideInView direction="up" delay={150} duration={300}>
                <View style={styles.recordSection}>
                  {isProcessing ? (
                    <View style={styles.processingState}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
                        {transcribeMutation.isPending ? 'Transkriberar ditt svar...' : 'Utvärderar ditt svar...'}
                      </Text>
                      <Text style={[styles.processingSubtitle, { color: theme.colors.textSecondary }]}>
                        {transcribeMutation.isPending ? 'Omvandlar tal till text' : 'AI analyserar ditt svar'}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.recordInstructions, { color: theme.colors.textSecondary }]}>
                        {isRecording ? 'Tala tydligt och förklara konceptet...' : 'Tryck på mikrofonen och börja prata'}
                      </Text>

                      {isRecording && (
                        <View style={styles.durationContainer}>
                          <View style={[styles.recordingDot, { backgroundColor: '#EF4444' }]} />
                          <Text style={[styles.durationText, { color: '#EF4444' }]}>
                            {formatDuration(recordingDuration)}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={isRecording ? stopRecording : startRecording}
                        activeOpacity={0.8}
                        style={styles.micBtnWrapper}
                      >
                        <Animated.View style={[styles.micBtnOuter, { transform: [{ scale: pulseAnim }] }]}>
                          <LinearGradient
                            colors={isRecording ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
                            style={styles.micBtn}
                          >
                            {isRecording ? (
                              <MicOff size={36} color="#fff" />
                            ) : (
                              <Mic size={36} color="#fff" />
                            )}
                          </LinearGradient>
                        </Animated.View>
                      </TouchableOpacity>

                      <Text style={[styles.micHint, { color: theme.colors.textMuted }]}>
                        {isRecording ? 'Tryck för att stoppa' : 'Tryck för att börja'}
                      </Text>
                    </>
                  )}
                </View>
              </SlideInView>
            </>
          )}

          {step === 'result' && evaluation && (
            <>
              <SlideInView direction="up" delay={0} duration={300}>
                <View style={[styles.gradeCard]}>
                  <LinearGradient
                    colors={isDark ? ['#1E293B', '#0F172A'] : ['#fff', '#F8FAFC']}
                    style={[styles.gradeCardInner, { borderColor: getGradeColor(evaluation.grade) + '40' }]}
                  >
                    <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(evaluation.grade) }]}>
                      <Text style={styles.gradeText}>{evaluation.grade}</Text>
                    </View>
                    <Text style={[styles.gradeTitle, { color: theme.colors.text }]}>
                      {evaluation.overallScore >= 80 ? 'Utmärkt!' : evaluation.overallScore >= 60 ? 'Bra jobbat!' : evaluation.overallScore >= 40 ? 'På god väg!' : 'Fortsätt öva!'}
                    </Text>
                    <Text style={[styles.gradeScore, { color: getScoreColor(evaluation.overallScore) }]}>
                      {evaluation.overallScore}/100 poäng
                    </Text>
                  </LinearGradient>
                </View>
              </SlideInView>

              <SlideInView direction="up" delay={100} duration={300}>
                <View style={styles.metricsRow}>
                  {[
                    { label: 'Fullständighet', score: evaluation.completeness, icon: Target },
                    { label: 'Korrekthet', score: evaluation.accuracy, icon: CheckCircle },
                    { label: 'Tydlighet', score: evaluation.clarity, icon: MessageSquare },
                  ].map((metric, i) => (
                    <View key={i} style={[styles.metricCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                      <metric.icon size={18} color={getScoreColor(metric.score)} />
                      <Text style={[styles.metricScore, { color: getScoreColor(metric.score) }]}>{metric.score}%</Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
                    </View>
                  ))}
                </View>
              </SlideInView>

              {transcribedText && (
                <SlideInView direction="up" delay={200} duration={300}>
                  <View style={[styles.transcriptCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <View style={styles.transcriptHeader}>
                      <Volume2 size={16} color={theme.colors.primary} />
                      <Text style={[styles.transcriptTitle, { color: theme.colors.text }]}>Ditt svar</Text>
                    </View>
                    <Text style={[styles.transcriptText, { color: theme.colors.textSecondary }]}>{transcribedText}</Text>
                  </View>
                </SlideInView>
              )}

              <SlideInView direction="up" delay={300} duration={300}>
                <View style={[styles.feedbackCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <View style={styles.feedbackHeader}>
                    <Sparkles size={16} color={theme.colors.primary} />
                    <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>Detaljerad feedback</Text>
                  </View>
                  <MarkdownText style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>
                    {evaluation.detailedFeedback}
                  </MarkdownText>
                </View>
              </SlideInView>

              {evaluation.strengths.length > 0 && (
                <SlideInView direction="up" delay={400} duration={300}>
                  <View style={[styles.listCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: '#10B981' + '30' }]}>
                    <View style={styles.listHeader}>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={[styles.listTitle, { color: '#10B981' }]}>Styrkor</Text>
                    </View>
                    {evaluation.strengths.map((s, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: '#10B981' }]}>✓</Text>
                        <Text style={[styles.listText, { color: theme.colors.text }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </SlideInView>
              )}

              {evaluation.improvements.length > 0 && (
                <SlideInView direction="up" delay={500} duration={300}>
                  <View style={[styles.listCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: '#F59E0B' + '30' }]}>
                    <View style={styles.listHeader}>
                      <AlertTriangle size={16} color="#F59E0B" />
                      <Text style={[styles.listTitle, { color: '#F59E0B' }]}>Att förbättra</Text>
                    </View>
                    {evaluation.improvements.map((s, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: '#F59E0B' }]}>→</Text>
                        <Text style={[styles.listText, { color: theme.colors.text }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </SlideInView>
              )}

              {evaluation.missingConcepts.length > 0 && (
                <SlideInView direction="up" delay={600} duration={300}>
                  <View style={[styles.listCard, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: '#EF4444' + '30' }]}>
                    <View style={styles.listHeader}>
                      <XCircle size={16} color="#EF4444" />
                      <Text style={[styles.listTitle, { color: '#EF4444' }]}>Saknade begrepp</Text>
                    </View>
                    {evaluation.missingConcepts.map((s, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: '#EF4444' }]}>•</Text>
                        <Text style={[styles.listText, { color: theme.colors.text }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </SlideInView>
              )}

              <SlideInView direction="up" delay={700} duration={300}>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.retryBtn]}
                    onPress={() => {
                      setTranscribedText('');
                      setEvaluation(null);
                      setRecordingDuration(0);
                      setStep('record');
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.retryBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <RotateCcw size={20} color="#fff" />
                      <Text style={styles.retryBtnText}>Försök igen</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.newTopicBtn, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={handleReset}
                  >
                    <BookOpen size={18} color={theme.colors.textSecondary} />
                    <Text style={[styles.newTopicText, { color: theme.colors.textSecondary }]}>Nytt ämne</Text>
                  </TouchableOpacity>
                </View>
              </SlideInView>
            </>
          )}
        </ScrollView>
      </View>
    </PremiumGate>
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
  scrollContent: { padding: 16 },
  introSection: { marginBottom: 20 },
  introCard: { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center' },
  introTitle: { fontSize: 18, fontWeight: '700' as const, marginTop: 12, textAlign: 'center' },
  introText: { fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 12, letterSpacing: -0.3 },
  topicCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  topicLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  topicEmoji: { fontSize: 32, marginRight: 14 },
  topicInfo: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: '600' as const },
  topicDesc: { fontSize: 13, marginTop: 2 },
  topicMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  subjectBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  subjectText: { fontSize: 11, fontWeight: '500' as const },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 11, fontWeight: '600' as const },
  questionCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 24 },
  questionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  questionEmoji: { fontSize: 36, marginRight: 14 },
  questionHeaderInfo: { flex: 1 },
  questionSubject: { fontSize: 13, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 2 },
  questionTopicTitle: { fontSize: 18, fontWeight: '700' as const },
  questionBody: { flexDirection: 'row', padding: 14, borderRadius: 14, borderWidth: 1, gap: 10, alignItems: 'flex-start' },
  questionText: { fontSize: 15, lineHeight: 22, flex: 1 },
  recordSection: { alignItems: 'center', paddingVertical: 32 },
  recordInstructions: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  durationContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  recordingDot: { width: 10, height: 10, borderRadius: 5 },
  durationText: { fontSize: 24, fontWeight: '700' as const, fontVariant: ['tabular-nums'] },
  micBtnWrapper: { marginBottom: 16 },
  micBtnOuter: {},
  micBtn: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  micHint: { fontSize: 13 },
  processingState: { alignItems: 'center', paddingVertical: 32 },
  processingTitle: { fontSize: 18, fontWeight: '600' as const, marginTop: 20 },
  processingSubtitle: { fontSize: 14, marginTop: 6 },
  gradeCard: { marginBottom: 16 },
  gradeCardInner: { borderRadius: 24, padding: 32, borderWidth: 2, alignItems: 'center' },
  gradeBadge: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  gradeText: { fontSize: 36, fontWeight: '800' as const, color: '#fff' },
  gradeTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 6 },
  gradeScore: { fontSize: 16, fontWeight: '600' as const },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: 'center' },
  metricScore: { fontSize: 22, fontWeight: '700' as const, marginTop: 6 },
  metricLabel: { fontSize: 11, fontWeight: '500' as const, marginTop: 4, textAlign: 'center' },
  transcriptCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  transcriptTitle: { fontSize: 14, fontWeight: '600' as const },
  transcriptText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' as const },
  feedbackCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  feedbackTitle: { fontSize: 14, fontWeight: '600' as const },
  feedbackText: { fontSize: 14, lineHeight: 20 },
  listCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  listTitle: { fontSize: 14, fontWeight: '700' as const },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  listBullet: { fontSize: 14, fontWeight: '600' as const, marginTop: 1 },
  listText: { fontSize: 14, lineHeight: 20, flex: 1 },
  resultActions: { gap: 12, marginTop: 8 },
  retryBtn: { borderRadius: 16, overflow: 'hidden' },
  retryBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  newTopicBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  newTopicText: { fontSize: 14, fontWeight: '500' as const },
});
