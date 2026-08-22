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
import { useRating } from '@/contexts/RatingContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useTimerSettings } from '@/contexts/TimerSettingsContext';
import { usePremium } from '@/contexts/PremiumContext';

import { TimerPersistence } from '@/lib/timer-persistence';
import { soundManager } from '@/lib/sound-manager';
import { hapticsManager } from '@/lib/haptics-manager';

import { Play, Pause, Square, Settings, Flame, Target, Brain, Zap, Volume2, VolumeX, SkipForward, X, Star, Calendar, Clock, ChevronRight, CheckCircle, TrendingUp, TrendingDown, Award, BarChart3, PieChart, Sunrise, Sun, Moon, Lightbulb, Trophy, Activity, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';


import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Light green focus theme — matches the premium trial page
const FOCUS_BG = '#E8F6F0';
const FOCUS_GREEN = '#10B981';
const FOCUS_GREEN_DARK = '#059669';
const FOCUS_TEXT = '#1A2E25';
const FOCUS_TEXT_MID = '#3A4A42';
const FOCUS_TEXT_MUTED = '#6A7A72';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

interface CompletionScreenProps {
  data: {
    duration: number;
    sessionType: SessionType;
    courseName: string;
    coinsEarned: number;
  } | null;
  onClose: () => void;
  dailyGoal: number;
  currentSessions: number;
}

function CompletionScreen({ data, onClose, dailyGoal, currentSessions }: CompletionScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  if (!data) return null;

  const progressPercentage = Math.min(Math.round((currentSessions / dailyGoal) * 100), 100);
  const isFocusSession = data.sessionType === 'focus';

  const getMotivationalMessage = () => {
    if (progressPercentage >= 100) return `Dagsmål uppnått!`;
    if (progressPercentage >= 75) return `Nästan där!`;
    if (progressPercentage >= 50) return `Halvvägs!`;
    if (progressPercentage >= 25) return 'Bra start!';
    return `Första steget!`;
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
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.completionContent}>
          <View style={[styles.completionEmojiCircle, { backgroundColor: theme.colors.primary + '12' }]}>
            <Text style={styles.completionEmoji}>{isFocusSession ? `🎯` : `☕`}</Text>
          </View>
          
          <Text style={[styles.completionTitle, { color: theme.colors.text }]}>
            {isFocusSession ? getMotivationalMessage() : 'Paus avslutad'}
          </Text>
          <Text style={[styles.completionSubtitle, { color: theme.colors.textSecondary }]}>
            {isFocusSession ? `Session slutförd` : `Redo att fortsätta`}
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

          <View style={[styles.savedConfirmation]}>
            <CheckCircle size={22} color={theme.colors.success} />
            <Text style={[styles.savedText, { color: theme.colors.success }]}>Automatiskt sparad</Text>
          </View>
        </View>

        <View style={[styles.completionActions, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={[styles.completionPrimaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.completionPrimaryButtonText}>Stäng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function TimerScreen() {
  const { courses, addPomodoroSession, pomodoroSessions } = useStudy();
  const { showSuccess, showAchievement } = useToast();
  const { theme, isDark } = useTheme();
  const { currentStreak, checkAchievements, refreshAchievements } = useAchievements();
  const { awardStudySession } = useGamification();
  const { triggerRating } = useRating();
  const { settings } = useTimerSettings();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [_sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isDndActive, setIsDndActive] = useState(false);
  const [dndPermissionGranted, setDndPermissionGranted] = useState(false);
  const [selectedStatView, setSelectedStatView] = useState<'day' | 'week'>('day');

  const [sessionCount, setSessionCount] = useState(0);
  const [dailyGoal] = useState(4);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date());
  const [newSessionDuration, setNewSessionDuration] = useState(25);
  const [newSessionCourse, setNewSessionCourse] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  void motivationalQuote;
  void totalFocusToday;
  void weeklyAverage;
  void bestStreak;
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
  const sessionTypeRef = useRef<SessionType>(sessionType);
  const selectedCourseRef = useRef<string>(selectedCourse);
  const focusTimeRef = useRef<number>(focusTime);
  const breakTimeRef = useRef<number>(breakTime);
  const addPomodoroSessionRef = useRef(addPomodoroSession);
  const awardStudySessionRef = useRef(awardStudySession);
  const triggerRatingRef = useRef(triggerRating);
  const coursesRef = useRef(courses);
  const sessionCountRef = useRef<number>(sessionCount);
  const streakStatsRef = useRef<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const checkAchievementsRef = useRef(checkAchievements);
  const refreshAchievementsRef = useRef(refreshAchievements);


  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

  useEffect(() => {
    lastKnownTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
  useEffect(() => { selectedCourseRef.current = selectedCourse; }, [selectedCourse]);
  useEffect(() => { focusTimeRef.current = focusTime; }, [focusTime]);
  useEffect(() => { breakTimeRef.current = breakTime; }, [breakTime]);
  useEffect(() => { addPomodoroSessionRef.current = addPomodoroSession; }, [addPomodoroSession]);
  useEffect(() => { awardStudySessionRef.current = awardStudySession; }, [awardStudySession]);
  useEffect(() => { triggerRatingRef.current = triggerRating; }, [triggerRating]);
  useEffect(() => { coursesRef.current = courses; }, [courses]);
  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);
  useEffect(() => { checkAchievementsRef.current = checkAchievements; }, [checkAchievements]);
  useEffect(() => { refreshAchievementsRef.current = refreshAchievements; }, [refreshAchievements]);

  const motivationalQuotes = useMemo(() => [
    `Du är fantastisk! Fortsätt så! 💪`,
    `Varje minut räknas! 🌟`,
    `Fokus är din superkraft! 🚀`,
    `Du bygger din framtid just nu! 🏗️`,
    `Kunskap är makt! 📚`,
    `Steg för steg mot målet! 🎯`,
    `Du klarar det här! 💯`,
    `Håll fokus, du är grym! 🔥`,
    `Framgång börjar här! ⭐`,
    `Din tid, din framtid! ⏰`,
    `Varje session räknas! 📈`,
    `Du är på rätt väg! 🛤️`
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
        console.log(`🔄 Restoring timer from background`);
        console.log(`⏱️ Remaining time:`, savedState.remainingTime, 'seconds');
        
        if (savedState.remainingTime <= 0) {
          console.log(`✅ Timer completed while app was closed, saving session...`);
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
            const startDate = new Date(savedState.sessionStartTimestamp);
            sessionStartTimeRef.current = startDate;
            setSessionStartTime(startDate);
          }
          if (savedState.courseId !== undefined) {
            selectedCourseRef.current = savedState.courseId || '';
          }
          if (savedState.sessionType) {
            sessionTypeRef.current = savedState.sessionType;
          }
          if (savedState.totalDuration) {
            focusTimeRef.current = Math.round(savedState.totalDuration / 60);
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
          console.log(`⏰ Timer end time set to:`, new Date(timerEndTimeRef.current).toISOString());
          
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
    
    void initializeTimer();
    
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
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        }),
      });
      
      setIsDndActive(true);
      showSuccess(`Stör ej aktiverat`, `Notifikationer är nu tysta`);
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
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      
      setIsDndActive(false);
      showSuccess(`Stör ej inaktiverat`, `Notifikationer är nu aktiva`);
    } catch (error) {
      console.log('Error disabling DND:', error);
    }
  }, [showSuccess]);

  const handleTimerComplete = useCallback(async () => {
    if (isCompletingRef.current) {
      console.log(`⚠️ Timer completion already in progress, skipping...`);
      return;
    }
    
    isCompletingRef.current = true;

    // Use refs so we always have fresh values even when called from background restoration
    const currentSessionType = sessionTypeRef.current;
    const currentFocusTime = focusTimeRef.current;
    const currentBreakTime = breakTimeRef.current;
    const currentSelectedCourse = selectedCourseRef.current;
    const currentSessionStartTime = sessionStartTimeRef.current;
    const currentCourses = coursesRef.current;

    console.log(`✅ Timer completed! Session type:`, currentSessionType, 'Duration:', currentSessionType === 'focus' ? currentFocusTime : currentBreakTime, 'minutes');
    console.log(`📅 Session start time:`, currentSessionStartTime?.toISOString() ?? 'null');
    
    try {
      setTimerState('idle');
      timerEndTimeRef.current = null;
      
      await soundManager.playSound('complete');
      await hapticsManager.triggerHaptic('success');
      await TimerPersistence.clearTimerState();
      
      if (isDndActive && currentSessionType === 'focus') {
        await disableDoNotDisturb();
      }
      
      if (currentSessionType === 'focus' && currentSessionStartTime) {
        try {
          console.log(`💾 Saving pomodoro session to database...`);
          await addPomodoroSessionRef.current({
            courseId: currentSelectedCourse || undefined,
            duration: currentFocusTime,
            startTime: currentSessionStartTime.toISOString(),
            endTime: new Date().toISOString()
          });
          console.log(`✅ Pomodoro session saved`);
          
          const courseName = currentSelectedCourse 
            ? currentCourses.find((c) => c.id === currentSelectedCourse)?.title || `Okänd kurs`
            : `Allmän session`;
          
          setSessionCount(prev => prev + 1);

          // Rating prompt: completed study sessions milestone
          try {
            const totalSessions = (sessionCountRef.current ?? 0) + 1;
            if (totalSessions === 10) {
              triggerRatingRef.current?.('study_session_10', {
                title: `🎉 10 studiesessioner!`,
                message: `Du har slutfört 10 studiesessioner. Fantastiskt jobb!`,
              });
            } else if (totalSessions === 25) {
              triggerRatingRef.current?.('study_session_25', {
                title: `🎉 25 studiesessioner!`,
                message: `Du har slutfört 25 studiesessioner. Otroligt!`,
              });
            }
            // Streak-based triggers
            const streak = streakStatsRef.current?.current ?? 0;
            if (streak === 7) {
              triggerRatingRef.current?.('streak_7', {
                title: `🔥 7 dagars streak!`,
                message: 'Du har pluggat 7 dagar i rad. Imponerande!',
              });
            } else if (streak === 14) {
              triggerRatingRef.current?.('streak_14', {
                title: `🔥 14 dagars streak!`,
                message: 'Du har pluggat 14 dagar i rad. Helt galet!',
              });
            } else if (streak === 30) {
              triggerRatingRef.current?.('streak_30', {
                title: `🔥 30 dagars streak!`,
                message: 'Du har pluggat 30 dagar i rad. Legendariskt!',
              });
            }
          } catch (e) {
            console.warn('Rating trigger skipped:', e);
          }

          let pointsEarned = currentFocusTime;
          try {
            console.log(`🎯 Awarding`, currentFocusTime, 'minutes of study XP...');
            const levelUpEvent = await awardStudySessionRef.current(currentFocusTime, currentSelectedCourse || undefined);
            if (levelUpEvent) {
              console.log(`🎉 Level up! ${levelUpEvent.previousLevel} -> ${levelUpEvent.newLevel}`);
            }
            pointsEarned = Math.floor(currentFocusTime / 5) * 5;
            console.log(`✅ Study session XP awarded:`, pointsEarned, 'XP');
          } catch (xpError) {
            console.error(`❌ Failed to award study session XP:`, xpError);
          }
          
          try {
            console.log(`🏆 Checking for achievements...`);
            await checkAchievementsRef.current();
            await refreshAchievementsRef.current();
            console.log(`✅ Achievements checked`);
          } catch (achError) {
            console.error(`❌ Failed to check achievements:`, achError);
          }
          
          setCompletedSessionData({
            duration: currentFocusTime,
            sessionType: 'focus',
            courseName,
            coinsEarned: pointsEarned
          });
          setShowCompletionScreen(true);
          
          if (settings.notificationsEnabled) {
            await TimerPersistence.showImmediateNotification(
              `🎯 Focus Session Complete!`,
              `Great work on ${courseName}! You earned ${pointsEarned} points.`
            );
          }
          
          if (sessionCount + 1 === dailyGoal) {
            await soundManager.playSound('achievement');
            showAchievement(`Dagsmål uppnått! 🎯`, `Du har slutfört ${dailyGoal} sessioner idag!`);
          }
        } catch (error) {
          console.error(`❌ Failed to complete focus session:`, error);
        }
      } else {
        setCompletedSessionData({
          duration: currentBreakTime,
          sessionType: 'break',
          courseName: 'Paus',
          coinsEarned: 0
        });
        setShowCompletionScreen(true);
      }

      if (currentSessionType === 'focus') {
        setSessionType('break');
        sessionTypeRef.current = 'break';
        setTimeLeft(currentBreakTime * 60);
      } else {
        setSessionType('focus');
        sessionTypeRef.current = 'focus';
        setTimeLeft(currentFocusTime * 60);
      }
      
      setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 1000);
    }
  }, [isDndActive, disableDoNotDisturb, sessionCount, dailyGoal, showAchievement, motivationalQuotes, settings.notificationsEnabled]);

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(`📱 App state changed:`, appState.current, '->', nextAppState);

      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log(`📱 App going to background`);
        
        if (timerState === 'running' && settings.backgroundTimerEnabled) {
          const courseName = selectedCourse 
            ? courses.find((c) => c.id === selectedCourse)?.title || `Allmän session`
            : `Allmän session`;
          
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
          
          console.log(`💾 Saved timer state to storage, remaining:`, remainingTime, 'seconds');
        }
      }

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log(`📱 App coming to foreground`);
        
        if (settings.backgroundTimerEnabled) {
          const savedState = await TimerPersistence.loadTimerState();
          
          if (savedState && savedState.status === 'running') {
            console.log(`🔄 Recalculating time after background`);
            
            if (savedState.remainingTime <= 0) {
              console.log(`✅ Timer completed in background, completing now...`);
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
                const startDate = new Date(savedState.sessionStartTimestamp);
                sessionStartTimeRef.current = startDate;
                setSessionStartTime(startDate);
              }
              if (savedState.courseId !== undefined) {
                selectedCourseRef.current = savedState.courseId || '';
              }
              if (savedState.sessionType) {
                sessionTypeRef.current = savedState.sessionType;
              }
              if (savedState.totalDuration) {
                focusTimeRef.current = Math.round(savedState.totalDuration / 60);
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
    console.log(`⚙️ Timer effect triggered, state:`, timerState);
    
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
          void handleTimerCompleteRef.current?.();
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
      ? courses.find((c) => c.id === selectedCourse)?.title || `Allmän session`
      : `Allmän session`;
    
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
      sessionStartTimeRef.current = startDate;
      
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
      ? courses.find((c) => c.id === selectedCourse)?.title || `Allmän session`
      : `Allmän session`;
    
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
      ? courses.find((c) => c.id === selectedCourse)?.title || `Allmän session`
      : `Allmän session`;
    
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
    if (!selectedCourse) return `Allmän session`;
    const course = courses.find((c) => c.id === selectedCourse);
    return course ? course.title : `Okänd kurs`;
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
  useEffect(() => { streakStatsRef.current = streakStats; }, [streakStats]);

  const courseDistribution = useMemo(() => {
    const distribution: { [key: string]: { name: string; minutes: number; sessions: number; color: string } } = {};
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    let colorIndex = 0;
    
    pomodoroSessions.forEach(session => {
      const courseId = session.courseId || 'general';
      const courseName = session.courseId 
        ? courses.find(c => c.id === session.courseId)?.title || `Okänd kurs`
        : `Allmän session`;
      
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
      evening: { label: `Kväll`, icon: 'moon', minutes: 0, sessions: 0, hours: '18-24' },
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
    if (pomodoroSessions.length === 0) return { score: 0, level: `Nybörjare`, description: `Börja plugga för att bygga din poäng!` };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = pomodoroSessions.filter(s => new Date(s.endTime) >= thirtyDaysAgo);
    
    const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionLength = recentSessions.length > 0 ? totalMinutes / recentSessions.length : 0;
    const consistency = streakStats.current * 5;
    const volume = Math.min(totalMinutes / 10, 40);
    const quality = Math.min(avgSessionLength / 25 * 20, 20);
    
    const score = Math.min(Math.round(consistency + volume + quality), 100);
    
    let level = `Nybörjare`;
    let description = `Fortsätt plugga för att öka din poäng!`;
    
    if (score >= 90) { level = `Mästare`; description = `Otroligt! Du är en studiemaskin!`; }
    else if (score >= 75) { level = 'Expert'; description = `Fantastiskt arbete, fortsätt så!`; }
    else if (score >= 60) { level = 'Avancerad'; description = `Bra jobbat! Du är på rätt väg.`; }
    else if (score >= 40) { level = 'Mellanliggande'; description = `Bra start! Öka konsistensen.`; }
    else if (score >= 20) { level = `Lärling`; description = `Du kommer igång, fortsätt!`; }
    
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
      insights.push({ icon: `🔥`, title: 'Imponerande streak!', description: `Du har pluggat ${streakStats.current} dagar i rad!`, type: 'success' });
    }
    
    const { periods } = productivityByTimeOfDay;
    const mostProductivePeriod = Object.entries(periods).sort((a, b) => b[1].minutes - a[1].minutes)[0];
    if (mostProductivePeriod[1].minutes > 0) {
      insights.push({ icon: `⏰`, title: `Bästa tiden`, description: `Du är mest produktiv på ${mostProductivePeriod[1].label.toLowerCase()} (${mostProductivePeriod[1].hours})`, type: 'info' });
    }
    
    if (weekComparison.isImprovement && weekComparison.percentChange > 20) {
      insights.push({ icon: `📈`, title: 'Stark vecka!', description: `${weekComparison.percentChange}% mer studietid än förra veckan!`, type: 'success' });
    } else if (!weekComparison.isImprovement && weekComparison.percentChange < -20) {
      insights.push({ icon: `💪`, title: `Tid att öka tempot`, description: `Du har studerat mindre denna vecka. Sätt igång!`, type: 'warning' });
    }
    
    if (courseDistribution.length > 0) {
      const topCourse = courseDistribution[0];
      insights.push({ icon: `📚`, title: 'Favoritkurs', description: `${topCourse.name} - ${Math.round(topCourse.minutes / 60)}h totalt`, type: 'info' });
    }
    
    const avgSession = pomodoroSessions.length > 0 
      ? Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / pomodoroSessions.length)
      : 0;
    if (avgSession >= 25) {
      insights.push({ icon: `🎯`, title: 'Bra sessioner', description: `Snitt ${avgSession} min per session - perfekt längd!`, type: 'success' });
    }
    
    if (insights.length === 0) {
      insights.push({ icon: `🚀`, title: `Börja plugga!`, description: `Slutför några sessioner för att se insikter`, type: 'info' });
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
    const outerR = size / 2 - 8;
    const elements = [];
    for (let i = 0; i < totalTicks; i++) {
      const angle = (i / totalTicks) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const r1 = outerR;
      const elapsed = 1 - progress;
      const isActive = (i / totalTicks) <= elapsed;
      const x1 = center + r1 * Math.cos(angle);
      const y1 = center + r1 * Math.sin(angle);
      const activeColor = FOCUS_GREEN;
      elements.push(
        <React.Fragment key={`tick-${i}`}>
          <Circle
            cx={x1}
            cy={y1}
            r={isMajor ? 2.5 : 1.2}
            fill={isActive ? activeColor : 'rgba(16,185,129,0.15)'}
          />
        </React.Fragment>
      );
    }
    const needleAngle = ((1 - progress) * 2 * Math.PI) - Math.PI / 2;
    const nLen = timerRadius - 14;
    const nx = center + nLen * Math.cos(needleAngle);
    const ny = center + nLen * Math.sin(needleAngle);
    const activeColor = sessionType === 'focus'
      ? (isDark ? '#60A5FA' : '#2563EB')
      : (isDark ? '#34D399' : '#059669');
    elements.push(
      <React.Fragment key="needle">
        <Circle cx={nx} cy={ny} r={5} fill={activeColor} opacity={0.9} />
        <Circle cx={nx} cy={ny} r={2.5} fill="#FFFFFF" />
        <Circle cx={center} cy={center} r={5} fill="rgba(16,185,129,0.2)" />
        <Circle cx={center} cy={center} r={2.5} fill={activeColor} />
      </React.Fragment>
    );
    return elements;
  };

  return (
    <View style={[styles.container, { backgroundColor: FOCUS_BG }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.timerBackground}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Timer</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => { soundManager.setEnabled(!settings.soundEnabled); }}
                activeOpacity={0.7}
              >
                {settings.soundEnabled ? (
                  <Volume2 size={18} color="#059669" />
                ) : (
                  <VolumeX size={18} color="rgba(5,150,105,0.45)" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => setShowSettings(true)}
                activeOpacity={0.7}
              >
                <Settings size={18} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.timerSection}>
          <Text style={styles.timerSessionName}>
            {sessionType === 'focus' ? 'Fokus' : 'Paus'}
          </Text>
          <Text style={styles.timerSessionSub}>{getSelectedCourseTitle()}</Text>

          <Animated.View style={[styles.timerWrapper, { transform: [{ scale: timerState === 'running' ? pulseAnim : scaleAnim }] }]}>
            <View style={[styles.timer3DOuterRing, {
              width: timerCircleSize + 20,
              height: timerCircleSize + 20,
              borderRadius: (timerCircleSize + 20) / 2,
              backgroundColor: 'rgba(255,255,255,0.65)',
              borderWidth: 1,
              borderColor: 'rgba(16,185,129,0.12)',
            }]}>
              <View style={[styles.timerDarkCircle, {
                width: timerCircleSize,
                height: timerCircleSize,
                shadowColor: 'rgba(16,185,129,0.30)',
              }]}>
                <Svg width={timerCircleSize} height={timerCircleSize}>
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={timerCircleSize / 2}
                    fill="#FFFFFF"
                  />
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={timerCircleSize / 2 - 3}
                    fill="#F4FBF8"
                  />
                  {renderWatchFace()}
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={timerRadius}
                    stroke="rgba(16,185,129,0.12)"
                    strokeWidth={4}
                    fill="none"
                  />
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={timerRadius}
                    stroke={FOCUS_GREEN}
                    strokeWidth={4}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * progress}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${timerCircleSize / 2} ${timerCircleSize / 2})`}
                  />
                </Svg>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.timerDigitsBelow}>{formatTime(timeLeft)}</Text>
          {timerState === 'running' && (
            <Text style={styles.timerRunningHint}>pågår...</Text>
          )}
        </View>

        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <Text style={styles.sectionLabel}>Kurs</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseListContent}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  { 
                    backgroundColor: !selectedCourse ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                    borderColor: !selectedCourse ? 'rgba(16,185,129,0.45)' : 'transparent',
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setSelectedCourse('')}
                activeOpacity={0.7}
              >
                <Text style={[styles.courseChipText, { color: !selectedCourse ? FOCUS_GREEN_DARK : FOCUS_TEXT_MID }]}>Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: selectedCourse === course.id ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                      borderColor: selectedCourse === course.id ? 'rgba(16,185,129,0.45)' : 'transparent',
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.courseChipText, { color: selectedCourse === course.id ? FOCUS_GREEN_DARK : FOCUS_TEXT_MID }]} numberOfLines={1}>{course.title}</Text>
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
                        backgroundColor: focusTime === time ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                        borderColor: focusTime === time ? 'rgba(16,185,129,0.45)' : 'transparent',
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => { setFocusTime(time); setTimeLeft(time * 60); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickTimeText, { color: focusTime === time ? FOCUS_GREEN_DARK : FOCUS_TEXT_MID }]}>{time} min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.playButton}
                onPress={startTimer}
                activeOpacity={0.85}
              >
                <View style={styles.playButtonInner}>
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
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
                <View style={styles.mainControlInner}>
                  {timerState === 'running' ? (
                    <Pause size={26} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.7)' }]} 
                onPress={async () => {
                  setSessionType(sessionType === 'focus' ? 'break' : 'focus');
                  setTimeLeft(sessionType === 'focus' ? breakTime * 60 : focusTime * 60);
                  setTimerState('idle');
                  setSessionStartTime(null);
                  if (isDndActive) { await disableDoNotDisturb(); }
                  showSuccess('Session skipped', `Tiden räknas inte i din statistik`);
                }}
                activeOpacity={0.7}
              >
                <SkipForward size={20} color={FOCUS_TEXT_MID} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          {[
            { value: `🔥 ${currentStreak}`, label: 'Streak', icon: Flame, color: '#F59E0B' },
            { value: `${sessionCount}/${dailyGoal}`, label: `🎯 Dagsmål`, icon: Target, color: '#A78BFA' },
            { value: `${todayStats.minutes}m`, label: `⚡ Idag`, icon: Zap, color: '#34D399' },
          ].map((stat, i) => (
            <View key={i} style={styles.statMiniCard}>
              <View style={[styles.statMiniIcon, { backgroundColor: stat.color + '33' }]}>
                <stat.icon size={16} color={stat.color} />
              </View>
              <Text style={styles.statMiniValue}>{stat.value}</Text>
              <Text style={styles.statMiniLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: FOCUS_BG, paddingTop: 28, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 4 }]}>
          <View style={styles.statsSectionHeader}>
            <View style={styles.statsSectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: '#0F172A' }]}>Statistik</Text>
            </View>
            <Text style={[styles.statsSectionSubtitle, { color: '#64748B' }]}>Din studieprestanda</Text>
          </View>
          {!isPremium && (
            <LinearGradient
              colors={['#10B981', '#34D399'] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumGate}
            >
              <View style={styles.premiumGateHeaderRow}>
                <View style={styles.premiumGateIconCircle}>
                  <BarChart3 size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumGatePillText}>PREMIUM</Text>
                  <Text style={styles.premiumGateTitle}>Avancerad statistik</Text>
                </View>
                <View style={styles.premiumGateLock}>
                  <Lock size={13} color="rgba(255,255,255,0.8)" />
                </View>
              </View>

              <Text style={styles.premiumGateDesc}>
                Lås upp fokuspoäng, aktivitetskarta, veckotrender och djupgående insikter om din studietid.
              </Text>

              <View style={styles.premiumGateGrid}>
                {[
                  { icon: Flame, label: 'Streak & fokus' },
                  { icon: BarChart3, label: 'Veckotrender' },
                  { icon: Calendar, label: 'Aktivitetskarta' },
                  { icon: Trophy, label: 'Kursranking' },
                ].map((f, i) => (
                  <View key={i} style={styles.premiumGateChip}>
                    <f.icon size={13} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.premiumGateChipText}>{f.label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.premiumGateBtn}
                onPress={() => router.push('/premium')}
                activeOpacity={0.85}
              >
                <Star size={15} color="#059669" fill="#059669" />
                <Text style={styles.premiumGateBtnText}>Lås upp Premium</Text>
                <ChevronRight size={15} color="#059669" />
              </TouchableOpacity>
            </LinearGradient>
          )}

          {isPremium && (
          <>
          <View style={[styles.focusScoreCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3 }]}>
            <View style={styles.focusScoreRow}>
              <View style={styles.focusScoreLeft}>
                <Text style={[styles.focusScoreLabel, { color: '#94A3B8' }]}>FOKUSPOÄNG</Text>
                <Text style={[styles.focusScoreValue, { color: '#0F172A' }]}>{focusScore.score}</Text>
                <View style={[styles.focusScoreBadge, { backgroundColor: FOCUS_GREEN + '18' }]}>
                  <Trophy size={11} color={FOCUS_GREEN} />
                  <Text style={[styles.focusScoreLevel, { color: FOCUS_GREEN }]}>{focusScore.level}</Text>
                </View>
              </View>
              <View style={styles.focusScoreRight}>
                <Svg width={96} height={96}>
                  <Circle cx={48} cy={48} r={40} stroke={isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'} strokeWidth={6} fill="none" />
                  <Circle cx={48} cy={48} r={40} stroke={FOCUS_GREEN} strokeWidth={6} fill="none" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - focusScore.score / 100)} strokeLinecap="round" transform="rotate(-90 48 48)" />
                </Svg>
                <View style={styles.focusScoreCenter}>
                  <Award size={24} color={FOCUS_GREEN} />
                </View>
              </View>
            </View>
            <Text style={[styles.focusScoreDesc, { color: '#475569' }]}>{focusScore.description}</Text>
          </View>

          <View style={[styles.viewToggle, { backgroundColor: '#EEF2F7' }]}>
            {(['day', 'week'] as const).map((view) => (
              <TouchableOpacity 
                key={view}
                style={[
                  styles.viewToggleButton,
                  selectedStatView === view && { backgroundColor: FOCUS_GREEN }
                ]}
                onPress={() => setSelectedStatView(view)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.viewToggleText,
                  { color: selectedStatView === view ? '#FFFFFF' : (isDark ? 'rgba(255,255,255,0.5)' : '#64748B') }
                ]}>{view === 'day' ? 'Idag' : 'Vecka'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {[
              { value: selectedStatView === 'day' ? todayStats.sessions.toString() : weekStats.sessions.toString(), label: 'Sessioner', icon: Brain, color: FOCUS_GREEN },
              { value: selectedStatView === 'day' ? `${Math.floor(todayStats.minutes / 60)}h ${todayStats.minutes % 60}m` : `${Math.floor(weekStats.minutes / 60)}h`, label: 'Total tid', icon: Zap, color: '#F59E0B' },
              { value: streakStats.longest.toString(), label: `Bästa streak`, icon: Flame, color: '#EF4444' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statsGridCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
                <View style={[styles.statsGridIcon, { backgroundColor: stat.color + '22' }]}>
                  <stat.icon size={17} color={stat.color} />
                </View>
                <Text style={[styles.statsGridValue, { color: '#0F172A' }]}>{stat.value}</Text>
                <Text style={[styles.statsGridLabel, { color: '#94A3B8' }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.weekComparisonCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.weekComparisonHeader}>
              <BarChart3 size={16} color={FOCUS_GREEN} />
              <Text style={[styles.weekComparisonTitle, { color: '#0F172A' }]}>Veckoförändring</Text>
            </View>
            <View style={styles.weekComparisonContent}>
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: '#64748B' }]}>Denna vecka</Text>
                <Text style={[styles.weekComparisonValue, { color: '#0F172A' }]}>
                  {Math.floor(weekComparison.thisWeek.minutes / 60)}h {weekComparison.thisWeek.minutes % 60}m
                </Text>
              </View>
              <View style={[styles.weekComparisonDivider, { backgroundColor: '#E2E8F0' }]} />
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: '#64748B' }]}>Förra veckan</Text>
                <Text style={[styles.weekComparisonValue, { color: '#0F172A' }]}>
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
            <View style={[styles.weeklyGraph, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
              <Text style={[styles.graphTitle, { color: '#0F172A' }]}>Veckoöversikt</Text>
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
                              backgroundColor: isToday ? FOCUS_GREEN : '#E2E8F0',
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.dayLabel, 
                        { 
                          color: isToday ? FOCUS_GREEN_DARK : (isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'),
                          fontWeight: isToday ? '600' as const : '400' as const
                        }
                      ]}>{dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={[styles.productivityCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Activity size={16} color={theme.colors.secondary} />
              <Text style={[styles.cardHeaderTitle, { color: '#0F172A' }]}>Produktivitet per tid</Text>
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
                      <Text style={[styles.productivityLabel, { color: '#334155' }]}>{period.label}</Text>
                    </View>
                    <View style={styles.productivityBarContainer}>
                      <View style={[styles.productivityBarBg, { backgroundColor: '#E2E8F0' }]}>
                        <View style={[styles.productivityBarFill, { width: `${Math.max(percentage, 2)}%`, backgroundColor: theme.colors.secondary }]} />
                      </View>
                      <Text style={[styles.productivityValue, { color: '#94A3B8' }]}>
                        {Math.round(period.minutes / 60)}h
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {courseDistribution.length > 0 && (
            <View style={[styles.courseDistCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
              <View style={styles.cardHeader}>
                <PieChart size={16} color={theme.colors.primary} />
                <Text style={[styles.cardHeaderTitle, { color: '#0F172A' }]}>Kursfördelning</Text>
              </View>
              {courseDistribution.slice(0, 5).map((course, index) => {
                const totalMinutes = courseDistribution.reduce((sum, c) => sum + c.minutes, 0);
                const percentage = totalMinutes > 0 ? Math.round((course.minutes / totalMinutes) * 100) : 0;
                return (
                  <View key={index} style={styles.courseDistItem}>
                    <View style={styles.courseDistLeft}>
                      <View style={[styles.courseDistDot, { backgroundColor: course.color }]} />
                      <Text style={[styles.courseDistName, { color: '#1E293B' }]} numberOfLines={1}>{course.name}</Text>
                    </View>
                    <Text style={[styles.courseDistPercent, { color: '#94A3B8' }]}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.heatmapCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Calendar size={16} color={theme.colors.warning} />
              <Text style={[styles.cardHeaderTitle, { color: '#0F172A' }]}>
                {monthlyHeatmap.monthName.charAt(0).toUpperCase() + monthlyHeatmap.monthName.slice(1)}
              </Text>
            </View>
            <View style={styles.heatmapWeekdays}>
              {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((day, i) => (
                <Text key={`${day}-${i}`} style={[styles.heatmapWeekday, { color: '#94A3B8' }]}>{day}</Text>
              ))}
            </View>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: monthlyHeatmap.firstDayOffset === 0 ? 6 : monthlyHeatmap.firstDayOffset - 1 }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.heatmapCell} />
              ))}
              {monthlyHeatmap.data.map((day) => {
                const intensityColors = [
                  '#F1F5F9',
                  FOCUS_GREEN + '30',
                  FOCUS_GREEN + '55',
                  FOCUS_GREEN + '88',
                  FOCUS_GREEN
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
                      { color: day.intensity >= 2 ? '#FFFFFF' : '#94A3B8' },
                      isToday && { fontWeight: '700' as const }
                    ]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.heatmapLegendText, { color: '#94A3B8' }]}>Mindre</Text>
              <View style={styles.heatmapLegendColors}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View 
                    key={i} 
                    style={[styles.heatmapLegendCell, { backgroundColor: [
                      '#F1F5F9',
                      FOCUS_GREEN + '30',
                      FOCUS_GREEN + '55',
                      FOCUS_GREEN + '88',
                      FOCUS_GREEN
                    ][i] }]} 
                  />
                ))}
              </View>
              <Text style={[styles.heatmapLegendText, { color: '#94A3B8' }]}>Mer</Text>
            </View>
          </View>

          <View style={styles.extraStatsRow}>
            {[
              { value: `${longestSession}m`, label: `Längsta`, icon: Clock, color: FOCUS_GREEN },
              { value: `${Math.floor(totalAllTime / 60)}h`, label: 'Totalt', icon: Target, color: theme.colors.secondary },
              { value: `${pomodoroSessions.length > 0 ? Math.round(totalAllTime / pomodoroSessions.length) : 0}m`, label: 'Snitt', icon: Brain, color: theme.colors.warning },
            ].map((stat, i) => (
              <View key={i} style={[styles.extraStatCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
                <stat.icon size={16} color={stat.color} />
                <Text style={[styles.extraStatValue, { color: '#0F172A' }]}>{stat.value}</Text>
                <Text style={[styles.extraStatLabel, { color: '#94A3B8' }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.insightsCard, { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={16} color="#F59E0B" />
              <Text style={[styles.cardHeaderTitle, { color: '#0F172A' }]}>Insikter</Text>
            </View>
            {studyInsights.map((insight, index) => (
              <View 
                key={index} 
                style={[styles.insightItem, { backgroundColor: '#F8FAFC' }]}
              >
                <Text style={styles.insightEmoji}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={[styles.insightTitle, { color: '#1E293B' }]}>{insight.title}</Text>
                  <Text style={[styles.insightDesc, { color: '#64748B' }]}>{insight.description}</Text>
                </View>
              </View>
            ))}
          </View>

          </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showCompletionScreen} animationType="fade" presentationStyle="overFullScreen" transparent={true}>
        <CompletionScreen
          data={completedSessionData}
          onClose={() => { setShowCompletionScreen(false); setCompletedSessionData(null); }}
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
                showSuccess(`Timer återställd`, `Redo för en ny session`);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.resetButtonText, { color: '#EF4444' }]}>Återställ timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


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
                  ? courses.find((c) => c.id === newSessionCourse)?.title || `Okänd kurs`
                  : `Allmän session`;
                
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
  statsSectionHeader: {
    marginBottom: 20,
  },
  statsSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 3,
  },
  statsSectionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 3,
  },
  premiumGate: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  premiumGateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  premiumGateIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumGatePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  premiumGateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  premiumGateLock: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumGateDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  premiumGateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  premiumGateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  premiumGateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  premiumGateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  premiumGateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.1,
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
    color: FOCUS_TEXT,
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
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  timerSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  timerSessionName: {
    fontSize: 28,
    fontWeight: '700',
    color: FOCUS_TEXT,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  timerSessionSub: {
    fontSize: 14,
    fontWeight: '400',
    color: FOCUS_TEXT_MUTED,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  timerWrapper: {
    alignItems: 'center',
  },
  timer3DOuterRing: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
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
    color: FOCUS_TEXT,
    letterSpacing: 3,
    marginTop: 22,
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-light',
      default: 'sans-serif',
    }),
  },
  timerRunningHint: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: FOCUS_TEXT_MUTED,
    marginTop: 6,
    letterSpacing: 0.5,
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
    color: FOCUS_TEXT_MUTED,
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
    backgroundColor: FOCUS_GREEN,
    shadowColor: 'rgba(16,185,129,0.45)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderLeftColor: 'rgba(255,255,255,0.04)',
    borderRightColor: 'rgba(0,0,0,0.04)',
    borderBottomColor: 'rgba(0,0,0,0.06)',
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
    backgroundColor: FOCUS_GREEN,
    shadowColor: 'rgba(16,185,129,0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
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
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
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
    color: FOCUS_TEXT,
  },
  statMiniLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: FOCUS_TEXT_MUTED,
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
    borderRadius: 18,
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
    paddingRight: 8,
  },
  focusScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  focusScoreValue: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 64,
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
    borderRadius: 16,
    padding: 16,
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
    fontSize: 24,
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
    borderRadius: 18,
    padding: 18,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.6,
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
    borderRadius: 18,
    padding: 18,
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
    borderRadius: 18,
    padding: 18,
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
    borderRadius: 18,
    padding: 18,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  extraStatValue: {
    fontSize: 24,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
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
    letterSpacing: -0.2,
  },
  insightDesc: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19,
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
