import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
  AppState,
  AppStateStatus,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useTimerSettings } from '@/contexts/TimerSettingsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useExams } from '@/contexts/ExamContext';
import { TimerPersistence } from '@/lib/timer-persistence';
import { soundManager } from '@/lib/sound-manager';
import { hapticsManager } from '@/lib/haptics-manager';
import { PremiumGate } from '@/components/PremiumGate';
import { Play, Pause, Square, Settings, Flame, Target, Coffee, Brain, Zap, Volume2, VolumeX, SkipForward, X, Star, Calendar, Clock, Plus, ChevronDown, ChevronUp, BookOpen, FileText, CheckCircle, TrendingUp, TrendingDown, Award, BarChart3, PieChart, Sunrise, Sun, Moon, Lightbulb, Trophy, Activity, BellOff } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import AddExamModal from '@/components/AddExamModal';

import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BG_THEMES = [
  { colors: ['#FFFFFF', '#F0F0F0'] as [string, string], dark: false, dot: '#D1D5DB' },
  { colors: ['#FFF7ED', '#FDDCBC'] as [string, string], dark: false, dot: '#F97316' },
  { colors: ['#EEF6FF', '#BFDBFE'] as [string, string], dark: false, dot: '#3B82F6' },
  { colors: ['#ECFDF5', '#A7F3D0'] as [string, string], dark: false, dot: '#10B981' },
  { colors: ['#FFF1F2', '#FECDD3'] as [string, string], dark: false, dot: '#F43F5E' },
  { colors: ['#0F172A', '#1E293B'] as [string, string], dark: true, dot: '#475569' },
];

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

interface PlannedSession {
  id: string;
  courseId?: string;
  courseName: string;
  date: Date;
  duration: number;
  notes?: string;
  completed: boolean;
}

interface CompletionScreenProps {
  data: {
    duration: number;
    sessionType: SessionType;
    courseName: string;
    coinsEarned: number;
  } | null;
  onSave: () => void;
  onDiscard: () => void;
  dailyGoal: number;
  currentSessions: number;
}

function CompletionScreen({ data, onSave, onDiscard, dailyGoal, currentSessions }: CompletionScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSave = useCallback(() => {
    setIsSaved(true);
    Animated.spring(checkmarkAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      onSave();
    }, 600);
  }, [checkmarkAnim, onSave]);

  if (!data) return null;

  const progressPercentage = Math.min(Math.round((currentSessions / dailyGoal) * 100), 100);
  const isFocusSession = data.sessionType === 'focus';

  const getMotivationalMessage = () => {
    if (progressPercentage >= 100) return 'Dagsmål uppnått!';
    if (progressPercentage >= 75) return 'Nästan där!';
    if (progressPercentage >= 50) return 'Halvvägs!';
    if (progressPercentage >= 25) return 'Bra start!';
    return 'Första steget!';
  };

  return (
    <Animated.View 
      style={[
        styles.completionOverlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={[styles.completionContainer, { backgroundColor: theme.colors.background, paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={[styles.completionCloseButton, { backgroundColor: theme.colors.card }]}
          onPress={onDiscard}
          activeOpacity={0.7}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.completionContent}>
          <View style={[styles.completionEmojiCircle, { backgroundColor: theme.colors.primary + '12' }]}>
            <Text style={styles.completionEmoji}>{isFocusSession ? '🎯' : '☕'}</Text>
          </View>
          
          <Text style={[styles.completionTitle, { color: theme.colors.text }]}>
            {isFocusSession ? getMotivationalMessage() : 'Paus avslutad'}
          </Text>
          <Text style={[styles.completionSubtitle, { color: theme.colors.textSecondary }]}>
            {isFocusSession ? 'Session slutförd' : 'Redo att fortsätta'}
          </Text>
          
          <View style={styles.completionProgressWrapper}>
            <Svg width={160} height={160}>
              <Circle
                cx={80}
                cy={80}
                r={66}
                stroke={theme.colors.border}
                strokeWidth={6}
                fill="none"
              />
              <Circle
                cx={80}
                cy={80}
                r={66}
                stroke={theme.colors.primary}
                strokeWidth={6}
                fill="none"
                strokeDasharray={2 * Math.PI * 66}
                strokeDashoffset={2 * Math.PI * 66 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </Svg>
            <View style={styles.completionProgressInner}>
              <Text style={[styles.completionProgressValue, { color: theme.colors.text }]}>{progressPercentage}%</Text>
              <Text style={[styles.completionProgressLabel, { color: theme.colors.textMuted }]}>dagsmål</Text>
            </View>
          </View>

          <View style={[styles.completionStatsRow, { backgroundColor: theme.colors.card }]}>
            <View style={styles.completionStatItem}>
              <Text style={[styles.completionStatValue, { color: theme.colors.text }]}>{data.duration}</Text>
              <Text style={[styles.completionStatUnit, { color: theme.colors.textMuted }]}>min</Text>
            </View>
            <View style={[styles.completionStatDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.completionStatItem}>
              <Text style={[styles.completionStatValue, { color: theme.colors.text }]} numberOfLines={1}>{data.courseName}</Text>
              <Text style={[styles.completionStatUnit, { color: theme.colors.textMuted }]}>kurs</Text>
            </View>
            <View style={[styles.completionStatDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.completionStatItem}>
              <Text style={[styles.completionStatValue, { color: '#F59E0B' }]}>+{data.coinsEarned}</Text>
              <Text style={[styles.completionStatUnit, { color: theme.colors.textMuted }]}>XP</Text>
            </View>
          </View>

          {isSaved && (
            <Animated.View 
              style={[
                styles.savedConfirmation,
                {
                  opacity: checkmarkAnim,
                  transform: [{ scale: checkmarkAnim }]
                }
              ]}
            >
              <CheckCircle size={22} color={theme.colors.success} />
              <Text style={[styles.savedText, { color: theme.colors.success }]}>Sparad</Text>
            </Animated.View>
          )}
        </View>

        <View style={[styles.completionActions, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={[styles.completionPrimaryButton, { backgroundColor: isSaved ? theme.colors.success : theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaved}
          >
            <Text style={styles.completionPrimaryButtonText}>
              {isSaved ? '✓ Sparad' : 'Spara session'}
            </Text>
          </TouchableOpacity>
          
          {!isSaved && (
            <TouchableOpacity 
              style={styles.completionSecondaryButton}
              onPress={onDiscard}
              activeOpacity={0.7}
            >
              <Text style={[styles.completionSecondaryButtonText, { color: theme.colors.textMuted }]}>Stäng utan att spara</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function TimerScreen() {
  const { courses, addPomodoroSession, pomodoroSessions } = useStudy();
  const { showSuccess, showAchievement } = useToast();
  const { upcomingExams, completedExams } = useExams();
  const { theme, isDark } = useTheme();
  const { currentStreak, checkAchievements, refreshAchievements } = useAchievements();
  const { awardStudySession } = useGamification();
  const { settings } = useTimerSettings();
  const insets = useSafeAreaInsets();
  usePremium();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isDndActive, setIsDndActive] = useState(false);
  const [dndPermissionGranted, setDndPermissionGranted] = useState(false);
  const [selectedStatView, setSelectedStatView] = useState<'day' | 'week'>('day');

  const [sessionCount, setSessionCount] = useState(0);
  const [dailyGoal] = useState(4);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date());
  const [newSessionDuration, setNewSessionDuration] = useState(25);
  const [newSessionCourse, setNewSessionCourse] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');
  const [expandedSectionPlanner, setExpandedSectionPlanner] = useState<'upcoming' | 'history' | 'exams' | null>('upcoming');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showAddExam, setShowAddExam] = useState(false);
  const [bgIndex, setBgIndex] = useState<number>(0);
  
  void motivationalQuote;
  void totalFocusToday;
  void weeklyAverage;
  void bestStreak;
  const isDarkBg = BG_THEMES[bgIndex].dark;
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<{
    duration: number;
    sessionType: SessionType;
    courseName: string;
    coinsEarned: number;
  } | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const timerEndTimeRef = useRef<number | null>(null);
  const lastKnownTimeLeftRef = useRef<number>(timeLeft);
  const handleTimerCompleteRef = useRef<(() => Promise<void>) | null>(null);
  const isCompletingRef = useRef<boolean>(false);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const addPomodoroSessionRef = useRef(addPomodoroSession);
  const awardStudySessionRef = useRef(awardStudySession);
  const coursesRef = useRef(courses);
  const checkAchievementsRef = useRef(checkAchievements);
  const refreshAchievementsRef = useRef(refreshAchievements);


  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

  useEffect(() => {
    lastKnownTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const motivationalQuotes = useMemo(() => [
    'Du är fantastisk! Fortsätt så! 💪',
    'Varje minut räknas! 🌟',
    'Fokus är din superkraft! 🚀',
    'Du bygger din framtid just nu! 🏗️',
    'Kunskap är makt! 📚',
    'Steg för steg mot målet! 🎯',
    'Du klarar det här! 💯',
    'Håll fokus, du är grym! 🔥',
    'Framgång börjar här! ⭐',
    'Din tid, din framtid! ⏰',
    'Varje session räknas! 📈',
    'Du är på rätt väg! 🛤️'
  ], []);

  const getStreakStats = useCallback(() => {
    if (pomodoroSessions.length === 0) return { current: 0, longest: 0 };
    
    const sortedSessions = [...pomodoroSessions]
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
    
    const sessionDates = new Set(
      sortedSessions.map(session => new Date(session.endTime).toDateString())
    );
    
    const uniqueDates = Array.from(sessionDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toDateString();
    
    if (uniqueDates.includes(today)) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const previousDate = new Date(uniqueDates[i - 1]);
        const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    tempStreak = 1;
    longestStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);
      const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
      
      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    return { current: currentStreak, longest: longestStreak };
  }, [pomodoroSessions]);

  const calculateStats = useCallback(() => {
    const today = new Date().toDateString();
    const todaySessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime).toDateString();
      return sessionDate === today;
    });
    const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    setTotalFocusToday(todayMinutes);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= weekAgo && sessionDate <= now;
    });
    const weekMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    setWeeklyAverage(Math.round(weekMinutes / 7));

    const streakStats = getStreakStats();
    setBestStreak(streakStats.longest);
  }, [pomodoroSessions, getStreakStats]);

  useEffect(() => {
    const initializeTimer = async () => {
      await checkNotificationPermissions();
      await soundManager.initialize();
      await soundManager.preloadAllSounds();
      
      soundManager.setEnabled(settings.soundEnabled);
      hapticsManager.setEnabled(settings.hapticsEnabled);
      
      const savedState = await TimerPersistence.loadTimerState();
      if (savedState && savedState.status === 'running' && settings.backgroundTimerEnabled) {
        console.log('🔄 Restoring timer from background');
        console.log('⏱️ Remaining time:', savedState.remainingTime, 'seconds');
        
        if (savedState.remainingTime <= 0) {
          console.log('✅ Timer completed while app was closed, saving session...');
          timerEndTimeRef.current = null;
          setTimerState('idle');
          setSessionType(savedState.sessionType);
          if (savedState.sessionType === 'focus') {
            const duration = Math.round(savedState.totalDuration / 60);
            setFocusTime(duration);
          }
          if (savedState.courseId !== undefined) {
            setSelectedCourse(savedState.courseId || '');
          }
          if (savedState.sessionStartTimestamp) {
            sessionStartTimeRef.current = new Date(savedState.sessionStartTimestamp);
            setSessionStartTime(new Date(savedState.sessionStartTimestamp));
          }
          await TimerPersistence.clearTimerState();
          setTimeout(async () => {
            if (handleTimerCompleteRef.current && !isCompletingRef.current) {
              await handleTimerCompleteRef.current();
            }
          }, 500);
        } else {
          const now = Date.now();
          timerEndTimeRef.current = now + (savedState.remainingTime * 1000);
          console.log('⏰ Timer end time set to:', new Date(timerEndTimeRef.current).toISOString());
          
          setTimerState(savedState.status);
          setSessionType(savedState.sessionType);
          setTimeLeft(savedState.remainingTime);
          const startTime = savedState.sessionStartTimestamp 
            ? new Date(savedState.sessionStartTimestamp) 
            : new Date(savedState.startTimestamp);
          setSessionStartTime(startTime);
          sessionStartTimeRef.current = startTime;
          setSelectedCourse(savedState.courseId || '');
          
          await TimerPersistence.scheduleCompletionNotification(
            savedState.remainingTime,
            savedState.sessionType,
            savedState.courseName
          );
        }
      }
      
      setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      calculateStats();
    };
    
    initializeTimer();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.01,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [calculateStats, motivationalQuotes, pulseAnim, scaleAnim, settings.backgroundTimerEnabled, settings.hapticsEnabled, settings.soundEnabled]);

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      setDndPermissionGranted(false);
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        setDndPermissionGranted(newStatus === 'granted');
      } else {
        setDndPermissionGranted(true);
      }
    } catch (error) {
      console.log('Error checking notification permissions:', error);
      setDndPermissionGranted(false);
    }
  };

  const enableDoNotDisturb = async () => {
    if (Platform.OS === 'web') {
      console.log('DND not available on web');
      return;
    }

    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        }),
      });
      
      setIsDndActive(true);
      showSuccess('Stör ej aktiverat', 'Notifikationer är nu tysta');
    } catch (error) {
      console.log('Error enabling DND:', error);
    }
  };

  const disableDoNotDisturb = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('DND not available on web');
      return;
    }

    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      
      setIsDndActive(false);
      showSuccess('Stör ej inaktiverat', 'Notifikationer är nu aktiva');
    } catch (error) {
      console.log('Error disabling DND:', error);
    }
  }, [showSuccess]);

  const handleTimerComplete = useCallback(async () => {
    if (isCompletingRef.current) {
      console.log('⚠️ Timer completion already in progress, skipping...');
      return;
    }
    
    isCompletingRef.current = true;
    console.log('✅ Timer completed! Session type:', sessionType, 'Duration:', sessionType === 'focus' ? focusTime : breakTime, 'minutes');
    
    try {
      setTimerState('idle');
      timerEndTimeRef.current = null;
      
      await soundManager.playSound('complete');
      await hapticsManager.triggerHaptic('success');
      await TimerPersistence.clearTimerState();
      
      if (isDndActive && sessionType === 'focus') {
        await disableDoNotDisturb();
      }
      
      if (sessionType === 'focus' && sessionStartTime) {
        try {
          console.log('💾 Saving pomodoro session to database...');
          await addPomodoroSession({
            courseId: selectedCourse || undefined,
            duration: focusTime,
            startTime: sessionStartTime.toISOString(),
            endTime: new Date().toISOString()
          });
          console.log('✅ Pomodoro session saved');
          
          const courseName = selectedCourse 
            ? courses.find((c) => c.id === selectedCourse)?.title || 'Okänd kurs'
            : 'Allmän session';
          
          setSessionCount(prev => prev + 1);
          
          let pointsEarned = focusTime;
          try {
            console.log('🎯 Awarding', focusTime, 'minutes of study XP...');
            const levelUpEvent = await awardStudySession(focusTime, selectedCourse || undefined);
            if (levelUpEvent) {
              console.log(`🎉 Level up! ${levelUpEvent.previousLevel} -> ${levelUpEvent.newLevel}`);
            }
            pointsEarned = Math.floor(focusTime / 5) * 5;
            console.log('✅ Study session XP awarded:', pointsEarned, 'XP');
          } catch (xpError) {
            console.error('❌ Failed to award study session XP:', xpError);
          }
          
          try {
            console.log('🏆 Checking for achievements...');
            await checkAchievements();
            await refreshAchievements();
            console.log('✅ Achievements checked');
          } catch (achError) {
            console.error('❌ Failed to check achievements:', achError);
          }
          
          setCompletedSessionData({
            duration: focusTime,
            sessionType: 'focus',
            courseName,
            coinsEarned: pointsEarned
          });
          setShowCompletionScreen(true);
          
          if (settings.notificationsEnabled) {
            await TimerPersistence.showImmediateNotification(
              '🎯 Focus Session Complete!',
              `Great work on ${courseName}! You earned ${pointsEarned} points.`
            );
          }
          
          if (sessionCount + 1 === dailyGoal) {
            await soundManager.playSound('achievement');
            showAchievement('Dagsmål uppnått! 🎯', `Du har slutfört ${dailyGoal} sessioner idag!`);
          }
        } catch (error) {
          console.error('❌ Failed to complete focus session:', error);
        }
      } else {
        setCompletedSessionData({
          duration: breakTime,
          sessionType: 'break',
          courseName: 'Paus',
          coinsEarned: 0
        });
        setShowCompletionScreen(true);
      }

      if (sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(breakTime * 60);
      } else {
        setSessionType('focus');
        setTimeLeft(focusTime * 60);
      }
      
      setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 1000);
    }
  }, [sessionType, isDndActive, disableDoNotDisturb, addPomodoroSession, selectedCourse, courses, focusTime, sessionStartTime, sessionCount, dailyGoal, showAchievement, breakTime, motivationalQuotes, checkAchievements, refreshAchievements, settings.notificationsEnabled, awardStudySession]);

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', appState.current, '->', nextAppState);

      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('📱 App going to background');
        
        if (timerState === 'running' && settings.backgroundTimerEnabled) {
          const courseName = selectedCourse 
            ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
            : 'Allmän session';
          
          const now = Date.now();
          const remainingTime = timerEndTimeRef.current 
            ? Math.max(0, Math.ceil((timerEndTimeRef.current - now) / 1000))
            : lastKnownTimeLeftRef.current;
          
          await TimerPersistence.saveTimerState({
            status: 'running',
            sessionType,
            totalDuration: sessionType === 'focus' ? focusTime * 60 : breakTime * 60,
            remainingTime,
            startTimestamp: now,
            sessionStartTimestamp: sessionStartTimeRef.current?.getTime() ?? now,
            courseId: selectedCourse || undefined,
            courseName,
          });
          
          console.log('💾 Saved timer state to storage, remaining:', remainingTime, 'seconds');
        }
      }

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App coming to foreground');
        
        if (settings.backgroundTimerEnabled) {
          const savedState = await TimerPersistence.loadTimerState();
          
          if (savedState && savedState.status === 'running') {
            console.log('🔄 Recalculating time after background');
            
            if (savedState.remainingTime <= 0) {
              console.log('✅ Timer completed in background, completing now...');
              timerEndTimeRef.current = null;
              setTimerState('idle');
              setSessionType(savedState.sessionType);
              if (savedState.sessionType === 'focus') {
                setFocusTime(Math.round(savedState.totalDuration / 60));
              }
              if (savedState.courseId !== undefined) {
                setSelectedCourse(savedState.courseId || '');
              }
              if (savedState.sessionStartTimestamp) {
                sessionStartTimeRef.current = new Date(savedState.sessionStartTimestamp);
                setSessionStartTime(new Date(savedState.sessionStartTimestamp));
              }
              if (handleTimerCompleteRef.current && !isCompletingRef.current) {
                await handleTimerCompleteRef.current();
              }
            } else {
              const now = Date.now();
              timerEndTimeRef.current = now + (savedState.remainingTime * 1000);
              setTimeLeft(savedState.remainingTime);
              lastKnownTimeLeftRef.current = savedState.remainingTime;
              setTimerState('running');
            }
          }
        }
      }

      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateSubscription.remove();
    };
  }, [timerState, sessionType, selectedCourse, courses, focusTime, breakTime, settings.backgroundTimerEnabled, handleTimerComplete]);

  useEffect(() => {
    console.log('⚙️ Timer effect triggered, state:', timerState);
    
    if (timerState === 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      intervalRef.current = setInterval(() => {
        if (!timerEndTimeRef.current) {
          return;
        }
        
        const now = Date.now();
        const remainingMs = timerEndTimeRef.current - now;
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        
        lastKnownTimeLeftRef.current = remainingSeconds;
        
        if (remainingSeconds <= 0 && !isCompletingRef.current) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setTimeLeft(0);
          handleTimerCompleteRef.current?.();
        } else if (remainingSeconds > 0) {
          setTimeLeft(remainingSeconds);
        }
      }, 100);
      
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  useEffect(() => {
    if (timerState !== 'running') {
      if (backgroundUpdateRef.current) {
        clearInterval(backgroundUpdateRef.current);
        backgroundUpdateRef.current = null;
      }
      return;
    }

    const courseName = selectedCourse 
      ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
      : 'Allmän session';
    
    backgroundUpdateRef.current = setInterval(async () => {
      if (settings.notificationsEnabled && settings.backgroundTimerEnabled) {
        await TimerPersistence.updateBackgroundNotification(
          lastKnownTimeLeftRef.current,
          sessionType,
          courseName
        );
      }
    }, 10000);

    return () => {
      if (backgroundUpdateRef.current) {
        clearInterval(backgroundUpdateRef.current);
        backgroundUpdateRef.current = null;
      }
    };
  }, [timerState, sessionType, selectedCourse, courses, settings.notificationsEnabled, settings.backgroundTimerEnabled]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const startTimer = async () => {
    const now = Date.now();
    
    if (timerState === 'idle') {
      const startDate = new Date(now);
      setSessionStartTime(startDate);
      
      const durationSeconds = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
      timerEndTimeRef.current = now + (durationSeconds * 1000);
      
      if (sessionType === 'focus' && dndPermissionGranted) {
        await enableDoNotDisturb();
      }
      
      await soundManager.playSound('start');
      await hapticsManager.triggerHaptic('light');
    } else {
      timerEndTimeRef.current = now + (timeLeft * 1000);
    }
    
    setTimerState('running');
    
    const courseName = selectedCourse 
      ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
      : 'Allmän session';
    
    const sessionOriginalStart = timerState === 'idle' ? now : (sessionStartTimeRef.current?.getTime() ?? now);
    await TimerPersistence.saveTimerState({
      status: 'running',
      sessionType,
      totalDuration: sessionType === 'focus' ? focusTime * 60 : breakTime * 60,
      remainingTime: timeLeft,
      startTimestamp: now,
      sessionStartTimestamp: sessionOriginalStart,
      courseId: selectedCourse || undefined,
      courseName,
    });
    
    if (settings.notificationsEnabled) {
      await TimerPersistence.scheduleCompletionNotification(
        timeLeft,
        sessionType,
        courseName
      );
      
      if (settings.backgroundTimerEnabled) {
        await TimerPersistence.updateBackgroundNotification(
          timeLeft,
          sessionType,
          courseName
        );
      }
      
      if (sessionType === 'focus' && timeLeft > 600) {
        await TimerPersistence.scheduleProgressNotification(
          600,
          sessionType,
          courseName
        );
      }
    }
  };

  const pauseTimer = async () => {
    timerEndTimeRef.current = null;
    setTimerState('paused');
    await hapticsManager.triggerHaptic('medium');
    await TimerPersistence.cancelNotification();
    
    const courseName = selectedCourse 
      ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
      : 'Allmän session';
    
    await TimerPersistence.saveTimerState({
      status: 'paused',
      sessionType,
      totalDuration: sessionType === 'focus' ? focusTime * 60 : breakTime * 60,
      remainingTime: timeLeft,
      startTimestamp: Date.now(),
      pausedAt: Date.now(),
      courseId: selectedCourse || undefined,
      courseName,
    });
  };

  const stopTimer = async () => {
    timerEndTimeRef.current = null;
    setTimerState('idle');
    setTimeLeft(sessionType === 'focus' ? focusTime * 60 : breakTime * 60);
    setSessionStartTime(null);
    
    await TimerPersistence.clearTimerState();
    await hapticsManager.triggerHaptic('heavy');
    
    if (isDndActive) {
      await disableDoNotDisturb();
    }
  };

  const resetTimer = async () => {
    timerEndTimeRef.current = null;
    setTimerState('idle');
    setSessionType('focus');
    setTimeLeft(focusTime * 60);
    setSessionStartTime(null);
    
    if (isDndActive) {
      await disableDoNotDisturb();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSelectedCourseTitle = useCallback(() => {
    if (!selectedCourse) return 'Allmän session';
    const course = courses.find((c) => c.id === selectedCourse);
    return course ? course.title : 'Okänd kurs';
  }, [selectedCourse, courses]);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime).toDateString();
      return sessionDate === today;
    });
    
    const totalMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    return {
      sessions: todaySessions.length,
      minutes: totalMinutes
    };
  }, [pomodoroSessions]);

  const weekStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekSessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= weekAgo && sessionDate <= now;
    });
    
    const totalMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    const averagePerDay = Math.round(totalMinutes / 7);
    
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayString = date.toDateString();
      
      const daySessions = weekSessions.filter(session => {
        const sessionDate = new Date(session.endTime).toDateString();
        return sessionDate === dayString;
      });
      
      return {
        date: date,
        sessions: daySessions.length,
        minutes: daySessions.reduce((sum, session) => sum + session.duration, 0)
      };
    });
    
    return {
      sessions: weekSessions.length,
      minutes: totalMinutes,
      averagePerDay,
      dailyStats
    };
  }, [pomodoroSessions]);

  const streakStats = useMemo(() => getStreakStats(), [getStreakStats]);

  const courseDistribution = useMemo(() => {
    const distribution: { [key: string]: { name: string; minutes: number; sessions: number; color: string } } = {};
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    let colorIndex = 0;
    
    pomodoroSessions.forEach(session => {
      const courseId = session.courseId || 'general';
      const courseName = session.courseId 
        ? courses.find(c => c.id === session.courseId)?.title || 'Okänd kurs'
        : 'Allmän session';
      
      if (!distribution[courseId]) {
        distribution[courseId] = {
          name: courseName,
          minutes: 0,
          sessions: 0,
          color: colors[colorIndex % colors.length]
        };
        colorIndex++;
      }
      distribution[courseId].minutes += session.duration;
      distribution[courseId].sessions += 1;
    });
    
    return Object.values(distribution).sort((a, b) => b.minutes - a.minutes);
  }, [pomodoroSessions, courses]);

  const productivityByTimeOfDay = useMemo(() => {
    const periods = {
      morning: { label: 'Morgon', icon: 'sunrise', minutes: 0, sessions: 0, hours: '06-12' },
      afternoon: { label: 'Eftermiddag', icon: 'sun', minutes: 0, sessions: 0, hours: '12-18' },
      evening: { label: 'Kväll', icon: 'moon', minutes: 0, sessions: 0, hours: '18-24' },
      night: { label: 'Natt', icon: 'star', minutes: 0, sessions: 0, hours: '00-06' }
    };
    
    pomodoroSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (hour >= 6 && hour < 12) {
        periods.morning.minutes += session.duration;
        periods.morning.sessions += 1;
      } else if (hour >= 12 && hour < 18) {
        periods.afternoon.minutes += session.duration;
        periods.afternoon.sessions += 1;
      } else if (hour >= 18 && hour < 24) {
        periods.evening.minutes += session.duration;
        periods.evening.sessions += 1;
      } else {
        periods.night.minutes += session.duration;
        periods.night.sessions += 1;
      }
    });
    
    const maxMinutes = Math.max(...Object.values(periods).map(p => p.minutes), 1);
    return { periods, maxMinutes };
  }, [pomodoroSessions]);

  const weekComparison = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    
    const thisWeekSessions = pomodoroSessions.filter(s => new Date(s.endTime) >= thisWeekStart);
    const lastWeekSessions = pomodoroSessions.filter(s => {
      const date = new Date(s.endTime);
      return date >= lastWeekStart && date < lastWeekEnd;
    });
    
    const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);
    const lastWeekMinutes = lastWeekSessions.reduce((sum, s) => sum + s.duration, 0);
    
    const percentChange = lastWeekMinutes > 0 
      ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : thisWeekMinutes > 0 ? 100 : 0;
    
    return {
      thisWeek: { minutes: thisWeekMinutes, sessions: thisWeekSessions.length },
      lastWeek: { minutes: lastWeekMinutes, sessions: lastWeekSessions.length },
      percentChange,
      isImprovement: percentChange >= 0
    };
  }, [pomodoroSessions]);

  const focusScore = useMemo(() => {
    if (pomodoroSessions.length === 0) return { score: 0, level: 'Nybörjare', description: 'Börja plugga för att bygga din poäng!' };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = pomodoroSessions.filter(s => new Date(s.endTime) >= thirtyDaysAgo);
    
    const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionLength = recentSessions.length > 0 ? totalMinutes / recentSessions.length : 0;
    const consistency = streakStats.current * 5;
    const volume = Math.min(totalMinutes / 10, 40);
    const quality = Math.min(avgSessionLength / 25 * 20, 20);
    
    const score = Math.min(Math.round(consistency + volume + quality), 100);
    
    let level = 'Nybörjare';
    let description = 'Fortsätt plugga för att öka din poäng!';
    
    if (score >= 90) { level = 'Mästare'; description = 'Otroligt! Du är en studiemaskin!'; }
    else if (score >= 75) { level = 'Expert'; description = 'Fantastiskt arbete, fortsätt så!'; }
    else if (score >= 60) { level = 'Avancerad'; description = 'Bra jobbat! Du är på rätt väg.'; }
    else if (score >= 40) { level = 'Mellanliggande'; description = 'Bra start! Öka konsistensen.'; }
    else if (score >= 20) { level = 'Lärling'; description = 'Du kommer igång, fortsätt!'; }
    
    return { score, level, description };
  }, [pomodoroSessions, streakStats]);

  const monthlyHeatmap = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    
    const heatmapData: { day: number; minutes: number; intensity: number }[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), i);
      const dayString = dayDate.toDateString();
      
      const dayMinutes = pomodoroSessions
        .filter(s => new Date(s.endTime).toDateString() === dayString)
        .reduce((sum, s) => sum + s.duration, 0);
      
      const intensity = dayMinutes === 0 ? 0 : 
        dayMinutes < 30 ? 1 : 
        dayMinutes < 60 ? 2 : 
        dayMinutes < 120 ? 3 : 4;
      
      heatmapData.push({ day: i, minutes: dayMinutes, intensity });
    }
    
    return { data: heatmapData, firstDayOffset: firstDayOfMonth, monthName: now.toLocaleDateString('sv-SE', { month: 'long' }) };
  }, [pomodoroSessions]);

  const studyInsights = useMemo(() => {
    const insights: { icon: string; title: string; description: string; type: 'success' | 'warning' | 'info' }[] = [];
    
    if (streakStats.current >= 7) {
      insights.push({ icon: '🔥', title: 'Imponerande streak!', description: `Du har pluggat ${streakStats.current} dagar i rad!`, type: 'success' });
    }
    
    const { periods } = productivityByTimeOfDay;
    const mostProductivePeriod = Object.entries(periods).sort((a, b) => b[1].minutes - a[1].minutes)[0];
    if (mostProductivePeriod[1].minutes > 0) {
      insights.push({ icon: '⏰', title: 'Bästa tiden', description: `Du är mest produktiv på ${mostProductivePeriod[1].label.toLowerCase()} (${mostProductivePeriod[1].hours})`, type: 'info' });
    }
    
    if (weekComparison.isImprovement && weekComparison.percentChange > 20) {
      insights.push({ icon: '📈', title: 'Stark vecka!', description: `${weekComparison.percentChange}% mer studietid än förra veckan!`, type: 'success' });
    } else if (!weekComparison.isImprovement && weekComparison.percentChange < -20) {
      insights.push({ icon: '💪', title: 'Tid att öka tempot', description: 'Du har studerat mindre denna vecka. Sätt igång!', type: 'warning' });
    }
    
    if (courseDistribution.length > 0) {
      const topCourse = courseDistribution[0];
      insights.push({ icon: '📚', title: 'Favoritkurs', description: `${topCourse.name} - ${Math.round(topCourse.minutes / 60)}h totalt`, type: 'info' });
    }
    
    const avgSession = pomodoroSessions.length > 0 
      ? Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / pomodoroSessions.length)
      : 0;
    if (avgSession >= 25) {
      insights.push({ icon: '🎯', title: 'Bra sessioner', description: `Snitt ${avgSession} min per session - perfekt längd!`, type: 'success' });
    }
    
    if (insights.length === 0) {
      insights.push({ icon: '🚀', title: 'Börja plugga!', description: 'Slutför några sessioner för att se insikter', type: 'info' });
    }
    
    return insights.slice(0, 4);
  }, [streakStats, productivityByTimeOfDay, weekComparison, courseDistribution, pomodoroSessions]);

  const longestSession = useMemo(() => {
    if (pomodoroSessions.length === 0) return 0;
    return Math.max(...pomodoroSessions.map(s => s.duration));
  }, [pomodoroSessions]);

  const totalAllTime = useMemo(() => {
    return pomodoroSessions.reduce((sum, s) => sum + s.duration, 0);
  }, [pomodoroSessions]);

  const timerCircleSize = Math.min(SCREEN_WIDTH - 100, 230);
  const timerRadius = (timerCircleSize / 2) - 22;
  const circumference = 2 * Math.PI * timerRadius;

  const renderWatchFace = () => {
    const size = timerCircleSize;
    const center = size / 2;
    const totalTicks = 60;
    const outerR = size / 2 - 6;
    const elements = [];
    for (let i = 0; i < totalTicks; i++) {
      const angle = (i / totalTicks) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const tickLen = isMajor ? 11 : 6;
      const r1 = outerR;
      const r2 = outerR - tickLen;
      const x1 = center + r1 * Math.cos(angle);
      const y1 = center + r1 * Math.sin(angle);
      const x2 = center + r2 * Math.cos(angle);
      const y2 = center + r2 * Math.sin(angle);
      const elapsed = 1 - progress;
      const isActive = (i / totalTicks) <= elapsed;
      elements.push(
        <React.Fragment key={`tick-${i}`}>
          <Circle cx={x1} cy={y1} r={isMajor ? 1.5 : 1.0} fill={isActive ? (isDarkBg ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)') : (isDarkBg ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.13)')} />
          <Circle cx={x2} cy={y2} r={0.1} fill="transparent" />
        </React.Fragment>
      );
      void x2; void y2;
    }
    const needleAngle = ((1 - progress) * 2 * Math.PI) - Math.PI / 2;
    const nLen = timerRadius - 16;
    const nx = center + nLen * Math.cos(needleAngle);
    const ny = center + nLen * Math.sin(needleAngle);
    elements.push(
      <React.Fragment key="needle">
        <Circle cx={nx} cy={ny} r={4} fill={isDarkBg ? '#FFFFFF' : '#111827'} />
        <Circle cx={center} cy={center} r={4} fill={isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
      </React.Fragment>
    );
    return elements;
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle={isDarkBg ? 'light-content' : 'dark-content'} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <LinearGradient colors={BG_THEMES[bgIndex].colors} style={styles.timerBackground}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: isDarkBg ? '#FFFFFF' : '#111827' }]}>Timer</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.headerIconButton, { backgroundColor: isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
                onPress={() => { soundManager.setEnabled(!settings.soundEnabled); }}
                activeOpacity={0.7}
              >
                {settings.soundEnabled ? (
                  <Volume2 size={18} color={isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} />
                ) : (
                  <VolumeX size={18} color={isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconButton, { backgroundColor: isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
                onPress={() => setShowSettings(true)}
                activeOpacity={0.7}
              >
                <Settings size={18} color={isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bgPickerRow}>
            {BG_THEMES.map((bg, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.bgPickerDot,
                  { backgroundColor: bg.dot },
                  i === bgIndex && [styles.bgPickerDotActive, { borderColor: isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)' }]
                ]}
                onPress={() => setBgIndex(i)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </View>

        <View style={styles.timerSection}>
          <Text style={[styles.timerSessionName, { color: isDarkBg ? '#FFFFFF' : '#111827' }]}>
            {sessionType === 'focus' ? 'Fokus' : 'Paus'}
          </Text>
          <Text style={[styles.timerSessionSub, { color: isDarkBg ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>{getSelectedCourseTitle()}</Text>

          <Animated.View style={[styles.timerWrapper, { transform: [{ scale: timerState === 'running' ? pulseAnim : scaleAnim }] }]}>
            <View style={[styles.timerDarkCircle, { width: timerCircleSize, height: timerCircleSize }]}>
              <Svg width={timerCircleSize} height={timerCircleSize}>
                <Circle
                  cx={timerCircleSize / 2}
                  cy={timerCircleSize / 2}
                  r={timerCircleSize / 2}
                  fill={isDarkBg ? '#1E2A3A' : '#F8F8F8'}
                />
                {renderWatchFace()}
                <Circle
                  cx={timerCircleSize / 2}
                  cy={timerCircleSize / 2}
                  r={timerRadius}
                  stroke={isDarkBg ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={1}
                  fill="none"
                />
                <Circle
                  cx={timerCircleSize / 2}
                  cy={timerCircleSize / 2}
                  r={timerRadius}
                  stroke={isDarkBg ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'}
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * progress}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${timerCircleSize / 2} ${timerCircleSize / 2})`}
                />
              </Svg>
            </View>
          </Animated.View>

          <Text style={[styles.timerDigitsBelow, { color: isDarkBg ? '#FFFFFF' : '#111827' }]}>{formatTime(timeLeft)}</Text>
        </View>

        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <Text style={[styles.sectionLabel, { color: isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }]}>KURS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseListContent}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  { 
                    backgroundColor: !selectedCourse ? (isDarkBg ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)') : (isDarkBg ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
                    borderColor: !selectedCourse ? (isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)') : 'transparent',
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setSelectedCourse('')}
                activeOpacity={0.7}
              >
                <Text style={[styles.courseChipText, { color: !selectedCourse ? (isDarkBg ? '#FFFFFF' : '#111827') : (isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }]}>Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: selectedCourse === course.id ? (isDarkBg ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)') : (isDarkBg ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
                      borderColor: selectedCourse === course.id ? (isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)') : 'transparent',
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.courseChipText, { color: selectedCourse === course.id ? (isDarkBg ? '#FFFFFF' : '#111827') : (isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }]} numberOfLines={1}>{course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.controlsSection}>
          {timerState === 'idle' ? (
            <View style={styles.idleControls}>
              <View style={styles.quickTimeRow}>
                {[15, 25, 45].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.quickTimeChip,
                      { 
                        backgroundColor: focusTime === time ? (isDarkBg ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)') : (isDarkBg ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                        borderColor: focusTime === time ? (isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)') : 'transparent',
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => { setFocusTime(time); setTimeLeft(time * 60); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickTimeText, { color: focusTime === time ? (isDarkBg ? '#FFFFFF' : '#111827') : (isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }]}>{time} min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.playButton}
                onPress={startTimer}
                activeOpacity={0.85}
              >
                <View style={[styles.playButtonInner, { backgroundColor: isDarkBg ? '#FFFFFF' : '#111827' }]}>
                  <Play size={28} color={isDarkBg ? '#111827' : '#FFFFFF'} fill={isDarkBg ? '#111827' : '#FFFFFF'} />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: 'rgba(239,68,68,0.15)' }]} 
                onPress={stopTimer}
                activeOpacity={0.7}
              >
                <Square size={20} color="#EF4444" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.mainControlButton}
                onPress={timerState === 'running' ? pauseTimer : startTimer}
                activeOpacity={0.85}
              >
                <View style={[styles.mainControlInner, { backgroundColor: isDarkBg ? '#FFFFFF' : '#111827' }]}>
                  {timerState === 'running' ? (
                    <Pause size={26} color={isDarkBg ? '#111827' : '#FFFFFF'} fill={isDarkBg ? '#111827' : '#FFFFFF'} />
                  ) : (
                    <Play size={26} color={isDarkBg ? '#111827' : '#FFFFFF'} fill={isDarkBg ? '#111827' : '#FFFFFF'} />
                  )}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]} 
                onPress={async () => {
                  setSessionType(sessionType === 'focus' ? 'break' : 'focus');
                  setTimeLeft(sessionType === 'focus' ? breakTime * 60 : focusTime * 60);
                  setTimerState('idle');
                  setSessionStartTime(null);
                  if (isDndActive) { await disableDoNotDisturb(); }
                  showSuccess('Session skipped', 'Tiden räknas inte i din statistik');
                }}
                activeOpacity={0.7}
              >
                <SkipForward size={20} color={isDarkBg ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          {[
            { value: currentStreak.toString(), label: 'Streak', icon: Flame, color: '#F59E0B' },
            { value: `${sessionCount}/${dailyGoal}`, label: 'Dagsmål', icon: Target, color: '#A78BFA' },
            { value: `${todayStats.minutes}m`, label: 'Idag', icon: Zap, color: '#34D399' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statMiniCard, { backgroundColor: isDarkBg ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)' }]}>
              <View style={[styles.statMiniIcon, { backgroundColor: stat.color + '22' }]}>
                <stat.icon size={16} color={stat.color} />
              </View>
              <Text style={[styles.statMiniValue, { color: isDarkBg ? '#FFFFFF' : '#111827' }]}>{stat.value}</Text>
              <Text style={[styles.statMiniLabel, { color: isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
        </LinearGradient>

        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 24, marginTop: 4 }]}>
          <TouchableOpacity 
            style={[styles.expandableCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
            onPress={() => setShowPlanner(!showPlanner)}
            activeOpacity={0.7}
          >
            <View style={styles.expandableCardInner}>
              <View style={[styles.expandableIcon, { backgroundColor: theme.colors.primary + '14' }]}>
                <Calendar size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.expandableInfo}>
                <Text style={[styles.expandableTitle, { color: theme.colors.text }]}>Planering & Prov</Text>
                <Text style={[styles.expandableSubtitle, { color: theme.colors.textMuted }]}>
                  {upcomingExams.length > 0 ? `${upcomingExams.length} kommande prov` : 'Planera dina sessioner'}
                </Text>
              </View>
              {showPlanner ? (
                <ChevronUp size={18} color={theme.colors.textMuted} />
              ) : (
                <ChevronDown size={18} color={theme.colors.textMuted} />
              )}
            </View>
          </TouchableOpacity>

          {showPlanner && (
            <View style={styles.plannerBody}>
              <TouchableOpacity 
                style={[styles.plannerSectionHeader, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)' }]}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'exams' ? null : 'exams')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <FileText size={16} color={theme.colors.warning} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Prov</Text>
                </View>
                <View style={styles.plannerSectionRight}>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.warning + '18' }]}
                    onPress={(e) => { e.stopPropagation(); setShowAddExam(true); }}
                    activeOpacity={0.8}
                  >
                    <Plus size={14} color={theme.colors.warning} />
                  </TouchableOpacity>
                  {expandedSectionPlanner === 'exams' ? (
                    <ChevronUp size={16} color={theme.colors.textMuted} />
                  ) : (
                    <ChevronDown size={16} color={theme.colors.textMuted} />
                  )}
                </View>
              </TouchableOpacity>

              {expandedSectionPlanner === 'exams' && (
                <View style={styles.listBody}>
                  {upcomingExams.length === 0 && completedExams.length === 0 ? (
                    <View style={styles.emptyState}>
                      <FileText size={36} color={theme.colors.textMuted} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textMuted }]}>Inga prov schemalagda</Text>
                    </View>
                  ) : (
                    <>
                      {upcomingExams.map((exam) => {
                        const courseName = exam.courseId 
                          ? courses.find((c) => c.id === exam.courseId)?.title || 'Allmän kurs'
                          : 'Allmänt prov';
                        return (
                          <View key={exam.id} style={[styles.listCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', borderLeftColor: theme.colors.warning, borderLeftWidth: 3 }]}>
                            <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>{exam.title}</Text>
                            <Text style={[styles.listCardSubtitle, { color: theme.colors.textMuted }]}>{courseName}</Text>
                            <View style={styles.listCardMeta}>
                              <Calendar size={12} color={theme.colors.textMuted} />
                              <Text style={[styles.listCardMetaText, { color: theme.colors.textMuted }]}>
                                {new Date(exam.examDate).toLocaleDateString('sv-SE', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                      {completedExams.slice(0, 3).map((exam) => (
                        <View key={exam.id} style={[styles.listCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderLeftColor: theme.colors.success, borderLeftWidth: 3, opacity: 0.6 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={14} color={theme.colors.success} />
                            <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>{exam.title}</Text>
                          </View>
                          {exam.grade && (
                            <Text style={[styles.listCardSubtitle, { color: theme.colors.success }]}>Betyg: {exam.grade}</Text>
                          )}
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.plannerSectionHeader, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', marginTop: 8 }]}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'upcoming' ? null : 'upcoming')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Kommande</Text>
                </View>
                <View style={styles.plannerSectionRight}>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary + '18' }]}
                    onPress={(e) => { e.stopPropagation(); setShowAddSession(true); }}
                    activeOpacity={0.8}
                  >
                    <Plus size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                  {expandedSectionPlanner === 'upcoming' ? (
                    <ChevronUp size={16} color={theme.colors.textMuted} />
                  ) : (
                    <ChevronDown size={16} color={theme.colors.textMuted} />
                  )}
                </View>
              </TouchableOpacity>

              {expandedSectionPlanner === 'upcoming' && (
                <View style={styles.listBody}>
                  {plannedSessions.filter(s => !s.completed && new Date(s.date) >= new Date()).length === 0 ? (
                    <View style={styles.emptyState}>
                      <Calendar size={36} color={theme.colors.textMuted} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textMuted }]}>Inga planerade sessioner</Text>
                    </View>
                  ) : (
                    plannedSessions
                      .filter(s => !s.completed && new Date(s.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((session) => (
                        <View key={session.id} style={[styles.listCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)' }]}>
                          <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>{session.courseName}</Text>
                          <View style={styles.listCardMeta}>
                            <Clock size={12} color={theme.colors.textMuted} />
                            <Text style={[styles.listCardMetaText, { color: theme.colors.textMuted }]}>{session.duration} min</Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.completeButton, { backgroundColor: theme.colors.primary + '12' }]}
                            onPress={() => {
                              setPlannedSessions(prev => prev.map(s => s.id === session.id ? { ...s, completed: true } : s));
                              showSuccess('Session markerad', 'Sessionen har markerats som slutförd');
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.completeButtonText, { color: theme.colors.primary }]}>Markera slutförd</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.plannerSectionHeader, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', marginTop: 8 }]}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'history' ? null : 'history')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <BookOpen size={16} color={theme.colors.secondary} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Historik</Text>
                </View>
                {expandedSectionPlanner === 'history' ? (
                  <ChevronUp size={16} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={16} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>

              {expandedSectionPlanner === 'history' && (
                <View style={styles.listBody}>
                  {pomodoroSessions.length === 0 ? (
                    <View style={styles.emptyState}>
                      <BookOpen size={36} color={theme.colors.textMuted} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textMuted }]}>Ingen historik än</Text>
                    </View>
                  ) : (
                    pomodoroSessions.slice(0, 10).map((session) => {
                      const courseName = session.courseId 
                        ? courses.find((c) => c.id === session.courseId)?.title || 'Okänd kurs'
                        : 'Allmän session';
                      return (
                        <View key={session.id} style={[styles.historyItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)' }]}>
                          <View style={styles.historyItemLeft}>
                            <Text style={[styles.historyItemTitle, { color: theme.colors.text }]}>{courseName}</Text>
                            <Text style={[styles.historyItemDate, { color: theme.colors.textMuted }]}>
                              {new Date(session.endTime).toLocaleDateString('sv-SE', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                          <View style={[styles.historyItemBadge, { backgroundColor: theme.colors.secondary + '14' }]}>
                            <Text style={[styles.historyItemBadgeText, { color: theme.colors.secondary }]}>{session.duration}m</Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.background, paddingTop: 28 }]}>
          <View style={styles.statsSectionHeader}>
            <View style={styles.statsSectionTitleRow}>
              <View style={[styles.statsSectionAccent, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statistik</Text>
            </View>
            <Text style={[styles.statsSectionSubtitle, { color: theme.colors.textMuted }]}>Din studieprestanda</Text>
          </View>
          <PremiumGate feature="statistics" fullScreen={false}>

          <View style={[styles.focusScoreCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.07, shadowRadius: 14, elevation: 3 }]}>
            <View style={styles.focusScoreRow}>
              <View style={styles.focusScoreLeft}>
                <Text style={[styles.focusScoreLabel, { color: theme.colors.textMuted }]}>FOKUSPOÄNG</Text>
                <Text style={[styles.focusScoreValue, { color: theme.colors.text }]}>{focusScore.score}</Text>
                <View style={[styles.focusScoreBadge, { backgroundColor: theme.colors.primary + '18' }]}>
                  <Trophy size={11} color={theme.colors.primary} />
                  <Text style={[styles.focusScoreLevel, { color: theme.colors.primary }]}>{focusScore.level}</Text>
                </View>
              </View>
              <View style={styles.focusScoreRight}>
                <Svg width={96} height={96}>
                  <Circle cx={48} cy={48} r={40} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} strokeWidth={6} fill="none" />
                  <Circle cx={48} cy={48} r={40} stroke={theme.colors.primary} strokeWidth={6} fill="none" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - focusScore.score / 100)} strokeLinecap="round" transform="rotate(-90 48 48)" />
                </Svg>
                <View style={styles.focusScoreCenter}>
                  <Award size={24} color={theme.colors.primary} />
                </View>
              </View>
            </View>
            <Text style={[styles.focusScoreDesc, { color: theme.colors.textSecondary }]}>{focusScore.description}</Text>
          </View>

          <View style={[styles.viewToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#EBEBEB' }]}>
            {(['day', 'week'] as const).map((view) => (
              <TouchableOpacity 
                key={view}
                style={[
                  styles.viewToggleButton,
                  selectedStatView === view && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedStatView(view)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.viewToggleText,
                  { color: selectedStatView === view ? '#FFFFFF' : theme.colors.textMuted }
                ]}>{view === 'day' ? 'Idag' : 'Vecka'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {[
              { value: selectedStatView === 'day' ? todayStats.sessions.toString() : weekStats.sessions.toString(), label: 'Sessioner', icon: Brain, color: theme.colors.primary },
              { value: selectedStatView === 'day' ? `${Math.floor(todayStats.minutes / 60)}h ${todayStats.minutes % 60}m` : `${Math.floor(weekStats.minutes / 60)}h`, label: 'Total tid', icon: Zap, color: '#F59E0B' },
              { value: streakStats.longest.toString(), label: 'Bästa streak', icon: Flame, color: '#EF4444' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statsGridCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
                <View style={[styles.statsGridIcon, { backgroundColor: stat.color + '18' }]}>
                  <stat.icon size={17} color={stat.color} />
                </View>
                <Text style={[styles.statsGridValue, { color: theme.colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statsGridLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.weekComparisonCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.weekComparisonHeader}>
              <BarChart3 size={16} color={theme.colors.primary} />
              <Text style={[styles.weekComparisonTitle, { color: theme.colors.text }]}>Veckoförändring</Text>
            </View>
            <View style={styles.weekComparisonContent}>
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: theme.colors.textMuted }]}>Denna vecka</Text>
                <Text style={[styles.weekComparisonValue, { color: theme.colors.text }]}>
                  {Math.floor(weekComparison.thisWeek.minutes / 60)}h {weekComparison.thisWeek.minutes % 60}m
                </Text>
              </View>
              <View style={[styles.weekComparisonDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: theme.colors.textMuted }]}>Förra veckan</Text>
                <Text style={[styles.weekComparisonValue, { color: theme.colors.text }]}>
                  {Math.floor(weekComparison.lastWeek.minutes / 60)}h {weekComparison.lastWeek.minutes % 60}m
                </Text>
              </View>
              <View style={[styles.weekComparisonBadge, { backgroundColor: weekComparison.isImprovement ? '#10B981' + '14' : '#EF4444' + '14' }]}>
                {weekComparison.isImprovement ? (
                  <TrendingUp size={14} color="#10B981" />
                ) : (
                  <TrendingDown size={14} color="#EF4444" />
                )}
                <Text style={[styles.weekComparisonBadgeText, { color: weekComparison.isImprovement ? '#10B981' : '#EF4444' }]}>
                  {weekComparison.percentChange > 0 ? '+' : ''}{weekComparison.percentChange}%
                </Text>
              </View>
            </View>
          </View>

          {selectedStatView === 'week' && (
            <View style={[styles.weeklyGraph, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
              <Text style={[styles.graphTitle, { color: theme.colors.text }]}>Veckoöversikt</Text>
              <View style={styles.graphBars}>
                {weekStats.dailyStats.map((day: any, i: number) => {
                  const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const maxMinutes = Math.max(60, Math.max(...weekStats.dailyStats.map((d: any) => d.minutes)));
                  const barHeight = Math.max(4, (day.minutes / maxMinutes) * 100);
                  
                  return (
                    <View key={`day-${i}`} style={styles.dayColumn}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.dayBar, 
                            { 
                              height: `${barHeight}%`,
                              backgroundColor: isToday ? theme.colors.primary : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.dayLabel, 
                        { 
                          color: isToday ? theme.colors.primary : theme.colors.textMuted,
                          fontWeight: isToday ? '600' as const : '400' as const
                        }
                      ]}>{dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={[styles.productivityCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Activity size={16} color={theme.colors.secondary} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>Produktivitet per tid</Text>
            </View>
            <View style={styles.productivityBars}>
              {Object.entries(productivityByTimeOfDay.periods).map(([key, period]) => {
                const percentage = productivityByTimeOfDay.maxMinutes > 0 
                  ? (period.minutes / productivityByTimeOfDay.maxMinutes) * 100 
                  : 0;
                const IconComponent = key === 'morning' ? Sunrise : key === 'afternoon' ? Sun : key === 'evening' ? Moon : Star;
                
                return (
                  <View key={key} style={styles.productivityRow}>
                    <View style={styles.productivityLabelContainer}>
                      <View style={[styles.productivityIcon, { backgroundColor: theme.colors.secondary + '14' }]}>
                        <IconComponent size={13} color={theme.colors.secondary} />
                      </View>
                      <Text style={[styles.productivityLabel, { color: theme.colors.text }]}>{period.label}</Text>
                    </View>
                    <View style={styles.productivityBarContainer}>
                      <View style={[styles.productivityBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <View style={[styles.productivityBarFill, { width: `${Math.max(percentage, 2)}%`, backgroundColor: theme.colors.secondary }]} />
                      </View>
                      <Text style={[styles.productivityValue, { color: theme.colors.textMuted }]}>
                        {Math.round(period.minutes / 60)}h
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {courseDistribution.length > 0 && (
            <View style={[styles.courseDistCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
              <View style={styles.cardHeader}>
                <PieChart size={16} color={theme.colors.primary} />
                <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>Kursfördelning</Text>
              </View>
              {courseDistribution.slice(0, 5).map((course, index) => {
                const totalMinutes = courseDistribution.reduce((sum, c) => sum + c.minutes, 0);
                const percentage = totalMinutes > 0 ? Math.round((course.minutes / totalMinutes) * 100) : 0;
                return (
                  <View key={index} style={styles.courseDistItem}>
                    <View style={styles.courseDistLeft}>
                      <View style={[styles.courseDistDot, { backgroundColor: course.color }]} />
                      <Text style={[styles.courseDistName, { color: theme.colors.text }]} numberOfLines={1}>{course.name}</Text>
                    </View>
                    <Text style={[styles.courseDistPercent, { color: theme.colors.textMuted }]}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.heatmapCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Calendar size={16} color={theme.colors.warning} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                {monthlyHeatmap.monthName.charAt(0).toUpperCase() + monthlyHeatmap.monthName.slice(1)}
              </Text>
            </View>
            <View style={styles.heatmapWeekdays}>
              {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((day, i) => (
                <Text key={`${day}-${i}`} style={[styles.heatmapWeekday, { color: theme.colors.textMuted }]}>{day}</Text>
              ))}
            </View>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: monthlyHeatmap.firstDayOffset === 0 ? 6 : monthlyHeatmap.firstDayOffset - 1 }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.heatmapCell} />
              ))}
              {monthlyHeatmap.data.map((day) => {
                const intensityColors = [
                  isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  theme.colors.primary + '30',
                  theme.colors.primary + '55',
                  theme.colors.primary + '88',
                  theme.colors.primary
                ];
                const isToday = day.day === new Date().getDate();
                
                return (
                  <View 
                    key={day.day} 
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: intensityColors[day.intensity] },
                      isToday && { borderWidth: 1.5, borderColor: theme.colors.warning }
                    ]}
                  >
                    <Text style={[
                      styles.heatmapDayText,
                      { color: day.intensity >= 2 ? '#FFFFFF' : theme.colors.textMuted },
                      isToday && { fontWeight: '700' as const }
                    ]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.heatmapLegendText, { color: theme.colors.textMuted }]}>Mindre</Text>
              <View style={styles.heatmapLegendColors}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View 
                    key={i} 
                    style={[styles.heatmapLegendCell, { backgroundColor: [
                      isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      theme.colors.primary + '30',
                      theme.colors.primary + '55',
                      theme.colors.primary + '88',
                      theme.colors.primary
                    ][i] }]} 
                  />
                ))}
              </View>
              <Text style={[styles.heatmapLegendText, { color: theme.colors.textMuted }]}>Mer</Text>
            </View>
          </View>

          <View style={styles.extraStatsRow}>
            {[
              { value: `${longestSession}m`, label: 'Längsta', icon: Clock, color: theme.colors.primary },
              { value: `${Math.floor(totalAllTime / 60)}h`, label: 'Totalt', icon: Target, color: theme.colors.secondary },
              { value: `${pomodoroSessions.length > 0 ? Math.round(totalAllTime / pomodoroSessions.length) : 0}m`, label: 'Snitt', icon: Brain, color: theme.colors.warning },
            ].map((stat, i) => (
              <View key={i} style={[styles.extraStatCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
                <stat.icon size={16} color={stat.color} />
                <Text style={[styles.extraStatValue, { color: theme.colors.text }]}>{stat.value}</Text>
                <Text style={[styles.extraStatLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.insightsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={16} color="#F59E0B" />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>Insikter</Text>
            </View>
            {studyInsights.map((insight, index) => (
              <View 
                key={index} 
                style={[styles.insightItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8F9FA' }]}
              >
                <Text style={styles.insightEmoji}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={[styles.insightTitle, { color: theme.colors.text }]}>{insight.title}</Text>
                  <Text style={[styles.insightDesc, { color: theme.colors.textMuted }]}>{insight.description}</Text>
                </View>
              </View>
            ))}
          </View>

          </PremiumGate>
        </View>
      </ScrollView>

      <Modal visible={showCompletionScreen} animationType="fade" presentationStyle="overFullScreen" transparent={true}>
        <CompletionScreen
          data={completedSessionData}
          onSave={() => { setShowCompletionScreen(false); setCompletedSessionData(null); }}
          onDiscard={() => { setShowCompletionScreen(false); setCompletedSessionData(null); }}
          dailyGoal={dailyGoal}
          currentSessions={sessionCount}
        />
      </Modal>

      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Inställningar</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={[styles.modalCloseText, { color: theme.colors.primary }]}>Klar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>FOKUSTID</Text>
              <View style={styles.timeSelector}>
                {[15, 25, 45, 60].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: focusTime === time 
                          ? theme.colors.primary 
                          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      }
                    ]}
                    onPress={() => {
                      setFocusTime(time);
                      if (sessionType === 'focus' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: focusTime === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>PAUSTID</Text>
              <View style={styles.timeSelector}>
                {[5, 10, 15, 20].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: breakTime === time 
                          ? theme.colors.primary 
                          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      }
                    ]}
                    onPress={() => {
                      setBreakTime(time);
                      if (sessionType === 'break' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: breakTime === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: '#EF4444' + '12' }]}
              onPress={async () => {
                await resetTimer();
                showSuccess('Timer återställd', 'Redo för en ny session');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.resetButtonText, { color: '#EF4444' }]}>Återställ timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddExamModal visible={showAddExam} onClose={() => setShowAddExam(false)} />

      <Modal visible={showAddSession} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Ny session</Text>
            <TouchableOpacity onPress={() => {
              setShowAddSession(false);
              setNewSessionCourse('');
              setNewSessionNotes('');
              setNewSessionDuration(25);
              setNewSessionDate(new Date());
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}>
              <Text style={[styles.modalCloseText, { color: theme.colors.primary }]}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>KURS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseListContent}>
                <TouchableOpacity
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: !newSessionCourse 
                        ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                      borderColor: !newSessionCourse ? theme.colors.primary + '40' : 'transparent',
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => setNewSessionCourse('')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.courseChipText,
                    { color: !newSessionCourse ? theme.colors.primary : theme.colors.textSecondary }
                  ]}>Allmänt</Text>
                </TouchableOpacity>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseChip,
                      { 
                        backgroundColor: newSessionCourse === course.id 
                          ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')
                          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                        borderColor: newSessionCourse === course.id ? theme.colors.primary + '40' : 'transparent',
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => setNewSessionCourse(course.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.courseChipText,
                      { color: newSessionCourse === course.id ? theme.colors.primary : theme.colors.textSecondary }
                    ]}>{course.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>LÄNGD</Text>
              <View style={styles.timeSelector}>
                {[15, 25, 45, 60, 90].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: newSessionDuration === time 
                          ? theme.colors.primary 
                          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      }
                    ]}
                    onPress={() => setNewSessionDuration(time)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: newSessionDuration === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>DATUM & TID</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[styles.dateTimeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={theme.colors.primary} />
                  <Text style={[styles.dateTimeBtnText, { color: theme.colors.text }]}>
                    {newSessionDate.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateTimeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={theme.colors.secondary} />
                  <Text style={[styles.dateTimeBtnText, { color: theme.colors.text }]}>
                    {newSessionDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {(Platform.OS === 'ios' || showDatePicker) && showDatePicker && (
                <DateTimePicker
                  value={newSessionDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  textColor={theme.colors.text}
                  accentColor={theme.colors.primary}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (selectedDate) setNewSessionDate(selectedDate);
                  }}
                />
              )}
              {(Platform.OS === 'ios' || showTimePicker) && showTimePicker && (
                <DateTimePicker
                  value={newSessionDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  textColor={theme.colors.text}
                  accentColor={theme.colors.primary}
                  onChange={(event, selectedTime) => {
                    if (Platform.OS === 'android') setShowTimePicker(false);
                    if (selectedTime) setNewSessionDate(selectedTime);
                  }}
                />
              )}
              {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                <TouchableOpacity
                  style={[styles.donePickerBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.donePickerBtnText}>Klar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>ANTECKNINGAR</Text>
              <TextInput
                style={[styles.notesInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.text }]}
                placeholder="Vad ska du plugga?"
                placeholderTextColor={theme.colors.textMuted}
                value={newSessionNotes}
                onChangeText={setNewSessionNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={[styles.addSessionBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                const courseName = newSessionCourse 
                  ? courses.find((c) => c.id === newSessionCourse)?.title || 'Okänd kurs'
                  : 'Allmän session';
                
                const newSession: PlannedSession = {
                  id: `planned-${Date.now()}`,
                  courseId: newSessionCourse || undefined,
                  courseName,
                  date: newSessionDate,
                  duration: newSessionDuration,
                  notes: newSessionNotes || undefined,
                  completed: false
                };
                
                setPlannedSessions(prev => [...prev, newSession]);
                setShowAddSession(false);
                setNewSessionCourse('');
                setNewSessionNotes('');
                setNewSessionDuration(25);
                setNewSessionDate(new Date());
                setShowDatePicker(false);
                setShowTimePicker(false);
                showSuccess('Session planerad', `${courseName} - ${newSessionDuration} min`);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addSessionBtnText}>Lägg till session</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerBackground: {
    paddingBottom: 4,
  },
  bgPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  bgPickerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgPickerDotActive: {
    borderWidth: 2.5,
  },
  statsSectionHeader: {
    marginBottom: 18,
  },
  statsSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  statsSectionAccent: {
    width: 4,
    height: 26,
    borderRadius: 2,
  },
  statsSectionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  timerSessionName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  timerSessionSub: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  timerWrapper: {
    alignItems: 'center',
  },
  timerDarkCircle: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#AAAAAA',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
  },
  timerDigitsBelow: {
    fontSize: 44,
    fontWeight: '300',
    color: '#111827',
    letterSpacing: 3,
    marginTop: 22,
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-light',
      default: 'sans-serif',
    }),
  },
  timerInnerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDigits: {
    fontSize: 54,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  sessionTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  sessionTypePillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  timerCourseLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    maxWidth: 160,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  courseSection: {
    marginBottom: 16,
  },
  courseListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  courseChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  courseChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  controlsSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  idleControls: {
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    borderRadius: 40,
  },
  playButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  quickTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickTimeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  quickTimeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControlButton: {
    borderRadius: 36,
  },
  mainControlInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  mainControlGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
    marginBottom: 24,
  },
  statMiniCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  statMiniIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statMiniValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statMiniLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 0,
  },
  expandableCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  expandableCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  expandableIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandableInfo: {
    flex: 1,
  },
  expandableTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  expandableSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  plannerBody: {
    marginTop: 8,
    gap: 2,
  },
  plannerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  plannerSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plannerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  plannerSectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBody: {
    marginTop: 6,
    gap: 6,
    paddingHorizontal: 4,
  },
  listCard: {
    borderRadius: 12,
    padding: 14,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listCardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  listCardMetaText: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completeButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyItemDate: {
    fontSize: 12,
    fontWeight: '400',
  },
  historyItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  focusScoreCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  focusScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusScoreLeft: {
    flex: 1,
  },
  focusScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  focusScoreValue: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 60,
  },
  focusScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  focusScoreLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  focusScoreRight: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusScoreCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusScoreDesc: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 14,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statsGridCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statsGridIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsGridValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 2,
    textAlign: 'center',
  },
  statsGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  weekComparisonCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  weekComparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  weekComparisonTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  weekComparisonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekComparisonItem: {
    flex: 1,
  },
  weekComparisonLabel: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 3,
  },
  weekComparisonValue: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weekComparisonDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 14,
  },
  weekComparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  weekComparisonBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weeklyGraph: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  graphTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  graphBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayBar: {
    width: 20,
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
  productivityCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productivityBars: {
    gap: 14,
  },
  productivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productivityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 110,
  },
  productivityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productivityLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  productivityBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 150,
  },
  productivityBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  productivityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  productivityValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  courseDistCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  courseDistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  courseDistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  courseDistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courseDistName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  courseDistPercent: {
    fontSize: 13,
    fontWeight: '600',
  },
  heatmapCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  heatmapWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  heatmapWeekday: {
    fontSize: 10,
    fontWeight: '500',
    width: 34,
    textAlign: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  heatmapCell: {
    width: 34,
    height: 34,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapDayText: {
    fontSize: 11,
    fontWeight: '400',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
  },
  heatmapLegendText: {
    fontSize: 10,
    fontWeight: '400',
  },
  heatmapLegendColors: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapLegendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  extraStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  extraStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  extraStatValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: -0.8,
  },
  extraStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  insightsCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  insightEmoji: {
    fontSize: 18,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  insightDesc: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  completionCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completionEmojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionEmoji: {
    fontSize: 36,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 28,
  },
  completionProgressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  completionProgressInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  completionProgressValue: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  completionProgressLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  completionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  completionStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  completionStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  completionStatUnit: {
    fontSize: 11,
    fontWeight: '400',
  },
  completionStatDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 8,
  },
  savedConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  savedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completionActions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  completionPrimaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completionPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completionSecondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  completionSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  settingGroup: {
    marginBottom: 28,
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 56,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dateTimeBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  donePickerBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  donePickerBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  addSessionBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  addSessionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
