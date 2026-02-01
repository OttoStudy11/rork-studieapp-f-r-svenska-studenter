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
  AppStateStatus
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
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
import { Play, Pause, Square, Settings, Flame, Target, Coffee, Brain, Zap, Volume2, VolumeX, SkipForward, X, Star, Calendar, Clock, Plus, ChevronDown, ChevronUp, BookOpen, FileText, CheckCircle, TrendingUp, TrendingDown, Award, BarChart3, PieChart, Sunrise, Sun, Moon, Lightbulb, Trophy, Activity } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import AddExamModal from '@/components/AddExamModal';

import * as Notifications from 'expo-notifications';



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
  const [starsVisible, setStarsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setStarsVisible(true);
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, [fadeAnim, scaleAnim, starsAnim]);

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
    }, 800);
  }, [checkmarkAnim, onSave]);

  if (!data) return null;

  const progressPercentage = Math.min(Math.round((currentSessions / dailyGoal) * 100), 100);
  const isFocusSession = data.sessionType === 'focus';

  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 16 + 8,
  }));

  const getMotivationalMessage = () => {
    if (progressPercentage >= 100) return 'Fantastiskt! Dagsmål uppnått! 🎉';
    if (progressPercentage >= 75) return 'Nästan där! Fortsätt så! 💪';
    if (progressPercentage >= 50) return 'Halvvägs! Bra jobbat! 🌟';
    if (progressPercentage >= 25) return 'Bra start! Kör på! 🚀';
    return 'Första steget är taget! ⭐';
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
      <View style={[styles.completionContainer, { backgroundColor: '#1a1a2e' }]}>
        <TouchableOpacity 
          style={styles.completionCloseButton} 
          onPress={onDiscard}
          activeOpacity={0.7}
        >
          <X size={24} color="#8e8e93" />
        </TouchableOpacity>

        {starsVisible && (
          <Animated.View 
            style={[
              styles.starsContainer,
              { opacity: starsAnim }
            ]}
          >
            {stars.map((star) => (
              <Animated.View
                key={star.id}
                style={[
                  styles.star,
                  {
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    width: star.size,
                    height: star.size,
                  }
                ]}
              >
                <Star 
                  size={star.size} 
                  color="#FFD700" 
                  fill="#FFD700" 
                  opacity={0.4}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        <View style={styles.completionContent}>
          <Text style={styles.completionTitle}>
            {isFocusSession ? getMotivationalMessage() : 'Paus avslutad! ☕'}
          </Text>
          
          <View style={styles.progressContainer}>
            <Svg width={180} height={180}>
              <Circle
                cx={90}
                cy={90}
                r={70}
                stroke="#2c2c54"
                strokeWidth={10}
                fill="none"
              />
              <Circle
                cx={90}
                cy={90}
                r={70}
                stroke={theme.colors.primary}
                strokeWidth={10}
                fill="none"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            </Svg>
            <View style={styles.progressContent}>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              <Text style={styles.progressLabel}>av dagsmål</Text>
            </View>
          </View>

          <View style={styles.completionStatsRow}>
            <View style={styles.completionStatItem}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.completionStatValue}>{data.duration} min</Text>
              <Text style={styles.completionStatLabel}>Studietid</Text>
            </View>
            <View style={[styles.completionStatDivider, { backgroundColor: '#3d3d5c' }]} />
            <View style={styles.completionStatItem}>
              <BookOpen size={20} color={theme.colors.secondary} />
              <Text style={styles.completionStatValue} numberOfLines={1}>{data.courseName}</Text>
              <Text style={styles.completionStatLabel}>Kurs</Text>
            </View>
            <View style={[styles.completionStatDivider, { backgroundColor: '#3d3d5c' }]} />
            <View style={styles.completionStatItem}>
              <Zap size={20} color="#FFD700" />
              <Text style={[styles.completionStatValue, { color: '#FFD700' }]}>+{data.coinsEarned}</Text>
              <Text style={styles.completionStatLabel}>XP</Text>
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
              <CheckCircle size={28} color={theme.colors.success} />
              <Text style={[styles.savedText, { color: theme.colors.success }]}>Sparad!</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <LinearGradient
            colors={isSaved ? ['#4CAF50', '#45a049'] : [theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isSaved}
            >
              <Text style={styles.saveButtonText}>
                {isSaved ? '✓ Sparad' : 'Spara & Stäng'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
          
          {!isSaved && (
            <TouchableOpacity 
              style={styles.discardButton} 
              onPress={onDiscard}
              activeOpacity={0.7}
            >
              <Text style={styles.discardButtonText}>Stäng utan att spara</Text>
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
  usePremium();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isDndActive, setIsDndActive] = useState(false);
  const [dndPermissionGranted, setDndPermissionGranted] = useState(false);
  const [selectedStatView, setSelectedStatView] = useState<'day' | 'week'>('day');

  const [sessionCount, setSessionCount] = useState(0);
  const [dailyGoal] = useState(4); // Daily session goal
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
  
  // Suppress unused variable warnings for now
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
  const timerStartTimeRef = useRef<number | null>(null);
  const lastKnownTimeLeftRef = useRef<number>(timeLeft);
  const handleTimerCompleteRef = useRef<(() => Promise<void>) | null>(null);


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
    // Calculate today's total focus time
    const today = new Date().toDateString();
    const todaySessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime).toDateString();
      return sessionDate === today;
    });
    const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    setTotalFocusToday(todayMinutes);

    // Calculate weekly average
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= weekAgo && sessionDate <= now;
    });
    const weekMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    setWeeklyAverage(Math.round(weekMinutes / 7));

    // Get best streak
    const streakStats = getStreakStats();
    setBestStreak(streakStats.longest);
  }, [pomodoroSessions, getStreakStats]);

  // Check notification permissions on mount and set random quote
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
        
        setTimerState(savedState.status);
        setSessionType(savedState.sessionType);
        setTimeLeft(savedState.remainingTime);
        setSessionStartTime(new Date(savedState.startTimestamp));
        setSelectedCourse(savedState.courseId || '');
        timerStartTimeRef.current = savedState.startTimestamp;
        
        if (savedState.remainingTime > 0) {
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
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale animation for timer
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
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
    setTimerState('idle');
    
    await soundManager.playSound('complete');
    await hapticsManager.triggerHaptic('success');
    await TimerPersistence.clearTimerState();
    
    if (isDndActive && sessionType === 'focus') {
      await disableDoNotDisturb();
    }
    
    if (sessionType === 'focus' && sessionStartTime) {
      try {
        await addPomodoroSession({
          courseId: selectedCourse || undefined,
          duration: focusTime,
          startTime: sessionStartTime.toISOString(),
          endTime: new Date().toISOString()
        });
        
        const courseName = selectedCourse 
          ? courses.find((c) => c.id === selectedCourse)?.title || 'Okänd kurs'
          : 'Allmän session';
        
        setSessionCount(prev => prev + 1);
        
        // Award XP and update challenge progress
        let pointsEarned = focusTime;
        try {
          console.log('🎯 Awarding study session XP and updating challenges...');
          const levelUpEvent = await awardStudySession(focusTime, selectedCourse || undefined);
          if (levelUpEvent) {
            console.log(`🎉 Level up! ${levelUpEvent.previousLevel} -> ${levelUpEvent.newLevel}`);
          }
          pointsEarned = Math.floor(focusTime / 5) * 5; // XP earned based on 5min intervals
          console.log('✅ Study session XP awarded successfully');
        } catch (xpError) {
          console.log('⚠️ Could not award study session XP:', xpError);
        }
        
        // Check for achievements after session is saved
        try {
          console.log('🏆 Checking for achievements after session...');
          await checkAchievements();
          await refreshAchievements();
          console.log('✅ Achievements checked and refreshed successfully');
        } catch (achError) {
          console.log('⚠️ Could not check achievements:', achError);
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
        console.error('Failed to save pomodoro session:', error);
      }
    } else {
      // For break completion, just show a simple completion
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
    
    // Update motivational quote
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [sessionType, isDndActive, disableDoNotDisturb, addPomodoroSession, selectedCourse, courses, focusTime, sessionStartTime, sessionCount, dailyGoal, showAchievement, breakTime, motivationalQuotes, checkAchievements, refreshAchievements, settings.notificationsEnabled, awardStudySession]);

  // Keep the ref updated with latest handleTimerComplete
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // AppState listener for background/foreground - must be after handleTimerComplete is defined
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', appState.current, '->', nextAppState);

      // App going to background
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('📱 App going to background');
        
        if (timerState === 'running' && settings.backgroundTimerEnabled) {
          const courseName = selectedCourse 
            ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
            : 'Allmän session';
          
          // Save current state
          await TimerPersistence.saveTimerState({
            status: 'running',
            sessionType,
            totalDuration: sessionType === 'focus' ? focusTime * 60 : breakTime * 60,
            remainingTime: lastKnownTimeLeftRef.current,
            startTimestamp: timerStartTimeRef.current || Date.now(),
            courseId: selectedCourse || undefined,
            courseName,
          });
          
          console.log('💾 Saved timer state to storage, remaining:', lastKnownTimeLeftRef.current, 'seconds');
        }
      }

      // App coming to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App coming to foreground');
        
        if (settings.backgroundTimerEnabled) {
          const savedState = await TimerPersistence.loadTimerState();
          
          if (savedState && savedState.status === 'running') {
            console.log('🔄 Recalculating time after background');
            console.log('⏱️ New remaining time:', savedState.remainingTime, 'seconds');
            
            // Update state with recalculated time
            setTimeLeft(savedState.remainingTime);
            setTimerState('running');
            timerStartTimeRef.current = savedState.startTimestamp;
            
            // If timer completed while in background
            if (savedState.remainingTime <= 0) {
              console.log('✅ Timer completed in background');
              await handleTimerComplete();
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
      console.log('🏃 Timer is running, creating interval');
      
      if (intervalRef.current) {
        console.log('🧹 Clearing existing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (prev <= 1) {
            console.log('⏱️ Timer completed!');
            handleTimerCompleteRef.current?.();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      
      console.log('✅ Interval created:', intervalRef.current);
      
    } else {
      console.log('⏹️ Timer not running, clearing intervals');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      console.log('🧹 Cleaning up timer intervals');
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
    console.log('🎬 Starting timer, current state:', timerState);
    const now = Date.now();
    
    if (timerState === 'idle') {
      const startDate = new Date(now);
      console.log('⏰ Setting session start time:', startDate.toISOString());
      setSessionStartTime(startDate);
      timerStartTimeRef.current = now;
      
      if (sessionType === 'focus' && dndPermissionGranted) {
        await enableDoNotDisturb();
      }
      
      await soundManager.playSound('start');
      await hapticsManager.triggerHaptic('light');
    } else {
      console.log('⏸️ Resuming timer from pause');
      // Resuming from pause - reset start time
      timerStartTimeRef.current = now;
    }
    
    console.log('▶️ Setting timer state to running');
    setTimerState('running');
    
    const courseName = selectedCourse 
      ? courses.find((c) => c.id === selectedCourse)?.title || 'Allmän session'
      : 'Allmän session';
    
    await TimerPersistence.saveTimerState({
      status: 'running',
      sessionType,
      totalDuration: sessionType === 'focus' ? focusTime * 60 : breakTime * 60,
      remainingTime: timeLeft,
      startTimestamp: Date.now(),
      courseId: selectedCourse || undefined,
      courseName,
    });
    
    if (settings.notificationsEnabled) {
      await TimerPersistence.scheduleCompletionNotification(
        timeLeft,
        sessionType,
        courseName
      );
      
      // Show initial background notification
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

  const circumference = 2 * Math.PI * 120;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>Timer 🎯</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {sessionType === 'focus' ? 'Fokusera på dina mål' : 'Ta en välförtjänt paus'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.colors.primary + '15' }]}
                onPress={() => setShowSettings(true)}
                activeOpacity={0.7}
              >
                <Settings size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.colors.secondary + '15' }]}
                onPress={() => {
                  soundManager.setEnabled(!settings.soundEnabled);
                }}
                activeOpacity={0.7}
              >
                {settings.soundEnabled ? (
                  <Volume2 size={22} color={theme.colors.secondary} />
                ) : (
                  <VolumeX size={22} color={theme.colors.secondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>



        {/* Hero Timer Card */}
        <View style={styles.timerSection}>
            <View style={styles.timerWrapper}>
              <Svg width={260} height={260} style={styles.timerSvg}>
                <Circle
                  cx={130}
                  cy={130}
                  r={110}
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth={8}
                  fill="none"
                />
                <Circle
                  cx={130}
                  cy={130}
                  r={110}
                  stroke={sessionType === 'focus' ? theme.colors.primary : theme.colors.secondary}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  transform={`rotate(-90 130 130)`}
                />
              </Svg>
              
              <View style={styles.timerInnerContent}>
                <Animated.View>
                  <Text style={[styles.timerText, { color: theme.colors.text }]}>
                    {formatTime(timeLeft)}
                  </Text>
                </Animated.View>
                
                <View style={styles.timerMetaContainer}>
                  <Text style={[styles.sessionCourse, { color: theme.colors.textSecondary }]}>
                    {getSelectedCourseTitle()}
                  </Text>
                  
                  <View style={styles.sessionBadgeWrapper}>
                    <LinearGradient
                      colors={sessionType === 'focus' 
                        ? [theme.colors.primary, theme.colors.primary + 'DD'] as any
                        : [theme.colors.secondary, theme.colors.secondary + 'DD'] as any
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sessionBadgeGradient}
                    >
                      {sessionType === 'focus' ? (
                        <Brain size={14} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <Coffee size={14} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                      <Text style={styles.sessionBadgeText}>
                        {sessionType === 'focus' ? 'Fokus' : 'Paus'}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </View>
        </View>

        {/* Course Selection */}
        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <Text style={[styles.courseSectionTitle, { color: theme.colors.text }]}>Välj kurs</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  !selectedCourse && styles.courseChipActive,
                  { 
                    backgroundColor: !selectedCourse ? theme.colors.primary : theme.colors.card,
                    borderColor: !selectedCourse ? theme.colors.primary : 'transparent'
                  }
                ]}
                onPress={() => setSelectedCourse('')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.courseChipText,
                  { color: !selectedCourse ? '#FFFFFF' : theme.colors.text }
                ]}>Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    selectedCourse === course.id && styles.courseChipActive,
                    { 
                      backgroundColor: selectedCourse === course.id ? theme.colors.primary : theme.colors.card,
                      borderColor: selectedCourse === course.id ? theme.colors.primary : 'transparent'
                    }
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.courseChipText,
                    { color: selectedCourse === course.id ? '#FFFFFF' : theme.colors.text }
                  ]}>{course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {timerState === 'idle' ? (
            <View style={styles.idleControls}>
              <LinearGradient
                colors={theme.colors.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainButtonGradient}
              >
                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={startTimer}
                  activeOpacity={0.8}
                >
                  <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
              
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(15);
                    setTimeLeft(15 * 60);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>15 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(25);
                    setTimeLeft(25 * 60);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>25 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(45);
                    setTimeLeft(45 * 60);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>45 min</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: theme.colors.card }]} 
                onPress={stopTimer}
                activeOpacity={0.7}
              >
                <Square size={24} color={theme.colors.error} />
              </TouchableOpacity>
              
              <LinearGradient
                colors={timerState === 'running' 
                  ? [theme.colors.warning, theme.colors.warning + 'DD'] as any
                  : theme.colors.gradient as any
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainButtonGradient}
              >
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={timerState === 'running' ? pauseTimer : startTimer}
                  activeOpacity={0.8}
                >
                  {timerState === 'running' ? (
                    <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </LinearGradient>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: theme.colors.card }]} 
                onPress={async () => {
                  // Skip session without counting it
                  setSessionType(sessionType === 'focus' ? 'break' : 'focus');
                  setTimeLeft(sessionType === 'focus' ? breakTime * 60 : focusTime * 60);
                  setTimerState('idle');
                  setSessionStartTime(null);
                  
                  // Disable DND if active
                  if (isDndActive) {
                    await disableDoNotDisturb();
                  }
                  
                  // Show toast to inform user that session was skipped and not counted
                  showSuccess('Session skipped', 'Tiden räknas inte i din statistik');
                }}
                activeOpacity={0.7}
              >
                <SkipForward size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.quickStatIconWrapper, { backgroundColor: theme.colors.warning + '20' }]}>
              <Flame size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>{currentStreak}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
          </View>
          
          <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.quickStatIconWrapper, { backgroundColor: theme.colors.primary + '20' }]}>
              <Target size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
              {sessionCount}/{dailyGoal}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Dagsmål</Text>
          </View>
          
          <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.quickStatIconWrapper, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Zap size={24} color={theme.colors.secondary} />
            </View>
            <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>{todayStats.minutes}m</Text>
            <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Idag</Text>
          </View>
        </View>

        {/* Planning & History Section */}
        <View style={styles.plannerSection}>
          <TouchableOpacity 
            style={[styles.plannerCard, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowPlanner(!showPlanner)}
            activeOpacity={0.8}
          >
            <View style={styles.plannerHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.plannerIcon}
              >
                <Calendar size={22} color="#FFF" />
              </LinearGradient>
              <View style={styles.plannerInfo}>
                <Text style={[styles.plannerTitle, { color: theme.colors.text }]}>Planering & Prov</Text>
                <Text style={[styles.plannerSubtitle, { color: theme.colors.textSecondary }]}>
                  {upcomingExams.length > 0 ? `${upcomingExams.length} kommande prov` : 'Planera dina sessioner'}
                </Text>
              </View>
              <View style={[styles.chevronContainer, { backgroundColor: theme.colors.background }]}>
                {showPlanner ? (
                  <ChevronUp size={18} color={theme.colors.primary} />
                ) : (
                  <ChevronDown size={18} color={theme.colors.primary} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {showPlanner && (
            <View style={styles.plannerContainer}>
              {/* Exams Section - Moved to top */}
              <TouchableOpacity 
                style={styles.plannerSectionHeader}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'exams' ? null : 'exams')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <FileText size={20} color={theme.colors.warning} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Prov</Text>
                </View>
                <View style={styles.plannerSectionRight}>
                  <TouchableOpacity
                    style={[styles.addSessionButton, { backgroundColor: theme.colors.warning }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowAddExam(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Plus size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  {expandedSectionPlanner === 'exams' ? (
                    <ChevronUp size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {expandedSectionPlanner === 'exams' && (
                <View style={styles.sessionsList}>
                  {upcomingExams.length === 0 && completedExams.length === 0 ? (
                    <View style={styles.emptyState}>
                      <FileText size={48} color={theme.colors.textSecondary} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                        Inga prov schemalagda
                      </Text>
                      <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                        Tryck på + för att lägga till ett prov
                      </Text>
                    </View>
                  ) : (
                    <>
                      {upcomingExams.length > 0 && (
                        <View style={styles.examSection}>
                          <Text style={[styles.examSectionTitle, { color: theme.colors.text }]}>Kommande prov</Text>
                          {upcomingExams.map((exam) => {
                            const courseName = exam.courseId 
                              ? courses.find((c) => c.id === exam.courseId)?.title || 'Allmän kurs'
                              : 'Allmänt prov';
                            
                            return (
                              <View key={exam.id} style={[styles.examCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.warning }]}>
                                <View style={styles.examCardHeader}>
                                  <View style={styles.examCardLeft}>
                                    <FileText size={20} color={theme.colors.warning} />
                                    <View>
                                      <Text style={[styles.examTitle, { color: theme.colors.text }]}>
                                        {exam.title}
                                      </Text>
                                      <Text style={[styles.examCourse, { color: theme.colors.textSecondary }]}>
                                        {courseName}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <View style={styles.examCardDetails}>
                                  <View style={styles.examDetailRow}>
                                    <Calendar size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.examDetailText, { color: theme.colors.textSecondary }]}>
                                      {new Date(exam.examDate).toLocaleDateString('sv-SE', { 
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                  </View>
                                  {exam.location && (
                                    <View style={styles.examDetailRow}>
                                      <Text style={[styles.examDetailText, { color: theme.colors.textSecondary }]}>
                                        📍 {exam.location}
                                      </Text>
                                    </View>
                                  )}
                                  {exam.durationMinutes && (
                                    <View style={styles.examDetailRow}>
                                      <Clock size={16} color={theme.colors.textSecondary} />
                                      <Text style={[styles.examDetailText, { color: theme.colors.textSecondary }]}>
                                        {exam.durationMinutes} minuter
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                {exam.notes && (
                                  <Text style={[styles.examNotes, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                    {exam.notes}
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}

                      {completedExams.length > 0 && (
                        <View style={[styles.examSection, { marginTop: 16 }]}>
                          <Text style={[styles.examSectionTitle, { color: theme.colors.text }]}>Genomförda prov</Text>
                          {completedExams.slice(0, 5).map((exam) => {
                            const courseName = exam.courseId 
                              ? courses.find((c) => c.id === exam.courseId)?.title || 'Allmän kurs'
                              : 'Allmänt prov';
                            
                            return (
                              <View key={exam.id} style={[styles.examCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.success, opacity: 0.7 }]}>
                                <View style={styles.examCardHeader}>
                                  <View style={styles.examCardLeft}>
                                    <CheckCircle size={20} color={theme.colors.success} />
                                    <View>
                                      <Text style={[styles.examTitle, { color: theme.colors.text }]}>
                                        {exam.title}
                                      </Text>
                                      <Text style={[styles.examCourse, { color: theme.colors.textSecondary }]}>
                                        {courseName}
                                      </Text>
                                    </View>
                                  </View>
                                  {exam.grade && (
                                    <View style={[styles.gradeBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                      <Text style={[styles.gradeText, { color: theme.colors.success }]}>
                                        {exam.grade}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <View style={styles.examCardDetails}>
                                  <View style={styles.examDetailRow}>
                                    <Calendar size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.examDetailText, { color: theme.colors.textSecondary }]}>
                                      {new Date(exam.examDate).toLocaleDateString('sv-SE', { 
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* Upcoming Sessions */}
              <TouchableOpacity 
                style={[styles.plannerSectionHeader, { marginTop: 16 }]}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'upcoming' ? null : 'upcoming')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <Clock size={20} color={theme.colors.primary} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Kommande Sessioner</Text>
                </View>
                <View style={styles.plannerSectionRight}>
                  <TouchableOpacity
                    style={[styles.addSessionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowAddSession(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Plus size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  {expandedSectionPlanner === 'upcoming' ? (
                    <ChevronUp size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {expandedSectionPlanner === 'upcoming' && (
                <View style={styles.sessionsList}>
                  {plannedSessions.filter(s => !s.completed && new Date(s.date) >= new Date()).length === 0 ? (
                    <View style={styles.emptyState}>
                      <Calendar size={48} color={theme.colors.textSecondary} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                        Inga planerade sessioner än
                      </Text>
                      <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                        Tryck på + för att lägga till en session
                      </Text>
                    </View>
                  ) : (
                    plannedSessions
                      .filter(s => !s.completed && new Date(s.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((session) => (
                        <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.card }]}>
                          <View style={styles.sessionCardHeader}>
                            <BookOpen size={20} color={theme.colors.primary} />
                            <Text style={[styles.sessionCourseText, { color: theme.colors.text }]}>
                              {session.courseName}
                            </Text>
                          </View>
                          <View style={styles.sessionCardDetails}>
                            <View style={styles.sessionDetailRow}>
                              <Calendar size={16} color={theme.colors.textSecondary} />
                              <Text style={[styles.sessionDetailText, { color: theme.colors.textSecondary }]}>
                                {new Date(session.date).toLocaleDateString('sv-SE', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </Text>
                            </View>
                            <View style={styles.sessionDetailRow}>
                              <Clock size={16} color={theme.colors.textSecondary} />
                              <Text style={[styles.sessionDetailText, { color: theme.colors.textSecondary }]}>
                                {session.duration} min
                              </Text>
                            </View>
                          </View>
                          {session.notes && (
                            <Text style={[styles.sessionNotes, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                              {session.notes}
                            </Text>
                          )}
                          <TouchableOpacity
                            style={[styles.completeButton, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}
                            onPress={() => {
                              setPlannedSessions(prev => 
                                prev.map(s => s.id === session.id ? { ...s, completed: true } : s)
                              );
                              showSuccess('Session markerad', 'Sessionen har markerats som slutförd');
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.completeButtonText, { color: theme.colors.primary }]}>Markera som slutförd</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                  )}
                </View>
              )}

              {/* History */}
              <TouchableOpacity 
                style={[styles.plannerSectionHeader, { marginTop: 16 }]}
                onPress={() => setExpandedSectionPlanner(expandedSectionPlanner === 'history' ? null : 'history')}
                activeOpacity={0.7}
              >
                <View style={styles.plannerSectionLeft}>
                  <BookOpen size={20} color={theme.colors.secondary} />
                  <Text style={[styles.plannerSectionTitle, { color: theme.colors.text }]}>Historik</Text>
                </View>
                {expandedSectionPlanner === 'history' ? (
                  <ChevronUp size={20} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>

              {expandedSectionPlanner === 'history' && (
                <View style={styles.sessionsList}>
                  {pomodoroSessions.length === 0 ? (
                    <View style={styles.emptyState}>
                      <BookOpen size={48} color={theme.colors.textSecondary} opacity={0.3} />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                        Ingen historik än
                      </Text>
                      <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                        Slutför en session för att se den här
                      </Text>
                    </View>
                  ) : (
                    pomodoroSessions
                      .slice(0, 10)
                      .map((session) => {
                        const courseName = session.courseId 
                          ? courses.find((c) => c.id === session.courseId)?.title || 'Okänd kurs'
                          : 'Allmän session';
                        
                        return (
                          <View key={session.id} style={[styles.historyCard, { backgroundColor: theme.colors.card }]}>
                            <View style={styles.historyCardHeader}>
                              <View style={styles.historyCardLeft}>
                                <Brain size={20} color={theme.colors.secondary} />
                                <Text style={[styles.historyCourseText, { color: theme.colors.text }]}>
                                  {courseName}
                                </Text>
                              </View>
                              <View style={[styles.historyBadge, { backgroundColor: theme.colors.secondary + '20' }]}>
                                <Text style={[styles.historyBadgeText, { color: theme.colors.secondary }]}>
                                  {session.duration} min
                                </Text>
                              </View>
                            </View>
                            <View style={styles.historyCardDetails}>
                              <Calendar size={14} color={theme.colors.textSecondary} />
                              <Text style={[styles.historyDetailText, { color: theme.colors.textSecondary }]}>
                                {new Date(session.endTime).toLocaleDateString('sv-SE', { 
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
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

        {/* Statistics Section - PREMIUM FEATURE */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsSectionTitle, { color: theme.colors.text }]}>Avancerad Statistik</Text>
          <PremiumGate feature="statistics" fullScreen={false}>

          {/* Focus Score Hero Card */}
          <LinearGradient
            colors={theme.colors.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.focusScoreCard}
          >
            <View style={styles.focusScoreContent}>
              <View style={styles.focusScoreLeft}>
                <Text style={styles.focusScoreLabel}>FOKUSPOÄNG</Text>
                <Text style={styles.focusScoreValue}>{focusScore.score}</Text>
                <View style={styles.focusScoreBadge}>
                  <Trophy size={14} color="#FFD700" />
                  <Text style={styles.focusScoreLevel}>{focusScore.level}</Text>
                </View>
              </View>
              <View style={styles.focusScoreRight}>
                <Svg width={100} height={100}>
                  <Circle
                    cx={50}
                    cy={50}
                    r={42}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={8}
                    fill="none"
                  />
                  <Circle
                    cx={50}
                    cy={50}
                    r={42}
                    stroke="#FFFFFF"
                    strokeWidth={8}
                    fill="none"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - focusScore.score / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.focusScoreCenter}>
                  <Award size={28} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <Text style={styles.focusScoreDescription}>{focusScore.description}</Text>
          </LinearGradient>

          {/* View Toggle */}
          <LinearGradient
            colors={[theme.colors.card, theme.colors.card + 'DD'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewToggle}
          >
            <TouchableOpacity 
              style={[
                styles.viewButton,
                selectedStatView === 'day' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedStatView('day')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.viewButtonText,
                { color: selectedStatView === 'day' ? '#FFFFFF' : theme.colors.textSecondary }
              ]}>Idag</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewButton,
                selectedStatView === 'week' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedStatView('week')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.viewButtonText,
                { color: selectedStatView === 'week' ? '#FFFFFF' : theme.colors.textSecondary }
              ]}>Vecka</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Enhanced Stats Cards */}
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '10'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '30' }]}>
                <Brain size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {selectedStatView === 'day' ? todayStats.sessions : weekStats.sessions}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Sessioner
              </Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[theme.colors.secondary + '20', theme.colors.secondary + '10'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.secondary + '30' }]}>
                <Zap size={20} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {selectedStatView === 'day' 
                  ? `${Math.floor(todayStats.minutes / 60)}h ${todayStats.minutes % 60}m`
                  : `${Math.floor(weekStats.minutes / 60)}h`
                }
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total tid
              </Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[theme.colors.warning + '20', theme.colors.warning + '10'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning + '30' }]}>
                <Flame size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {streakStats.longest}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Bästa streak
              </Text>
            </LinearGradient>
          </View>

          {/* Week Comparison Card */}
          <View style={[styles.weekComparisonCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.weekComparisonHeader}>
              <BarChart3 size={20} color={theme.colors.primary} />
              <Text style={[styles.weekComparisonTitle, { color: theme.colors.text }]}>Veckoförändring</Text>
            </View>
            <View style={styles.weekComparisonContent}>
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: theme.colors.textSecondary }]}>Denna vecka</Text>
                <Text style={[styles.weekComparisonValue, { color: theme.colors.text }]}>
                  {Math.floor(weekComparison.thisWeek.minutes / 60)}h {weekComparison.thisWeek.minutes % 60}m
                </Text>
              </View>
              <View style={styles.weekComparisonDivider} />
              <View style={styles.weekComparisonItem}>
                <Text style={[styles.weekComparisonLabel, { color: theme.colors.textSecondary }]}>Förra veckan</Text>
                <Text style={[styles.weekComparisonValue, { color: theme.colors.text }]}>
                  {Math.floor(weekComparison.lastWeek.minutes / 60)}h {weekComparison.lastWeek.minutes % 60}m
                </Text>
              </View>
              <View style={[
                styles.weekComparisonBadge, 
                { backgroundColor: weekComparison.isImprovement ? theme.colors.success + '20' : theme.colors.error + '20' }
              ]}>
                {weekComparison.isImprovement ? (
                  <TrendingUp size={16} color={theme.colors.success} />
                ) : (
                  <TrendingDown size={16} color={theme.colors.error} />
                )}
                <Text style={[
                  styles.weekComparisonBadgeText,
                  { color: weekComparison.isImprovement ? theme.colors.success : theme.colors.error }
                ]}>
                  {weekComparison.percentChange > 0 ? '+' : ''}{weekComparison.percentChange}%
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Graph */}
          {selectedStatView === 'week' && (
            <LinearGradient
              colors={[theme.colors.card, theme.colors.card + 'EE'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.weeklyGraph}
            >
              <Text style={[styles.graphTitle, { color: theme.colors.text }]}>Veckoöversikt</Text>
              <View style={styles.graphBars}>
                {weekStats.dailyStats.map((day: any, i: number) => {
                  const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const maxMinutes = Math.max(60, Math.max(...weekStats.dailyStats.map(d => d.minutes)));
                  const barHeight = Math.max(4, (day.minutes / maxMinutes) * 100);
                  
                  return (
                    <View key={`day-${i}`} style={styles.dayColumn}>
                      <View style={styles.barContainer}>
                        <LinearGradient
                          colors={isToday 
                            ? theme.colors.gradient as any
                            : [theme.colors.border, theme.colors.border + 'AA'] as any
                          }
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0, y: 0 }}
                          style={[
                            styles.dayBar, 
                            { height: `${barHeight}%` }
                          ]} 
                        />
                        {day.minutes > 0 && (
                          <Text style={[styles.barValue, { color: theme.colors.text }]}>
                            {Math.round(day.minutes / 60)}h
                          </Text>
                        )}
                      </View>
                      <Text style={[
                        styles.dayLabel, 
                        { 
                          color: isToday ? theme.colors.primary : theme.colors.textSecondary,
                          fontWeight: isToday ? '700' : '500'
                        }
                      ]}>{dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          )}

          {/* Productivity by Time of Day */}
          <View style={[styles.productivityCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.productivityHeader}>
              <Activity size={20} color={theme.colors.secondary} />
              <Text style={[styles.productivityTitle, { color: theme.colors.text }]}>Produktivitet per tid</Text>
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
                      <View style={[styles.productivityIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                        <IconComponent size={16} color={theme.colors.secondary} />
                      </View>
                      <View>
                        <Text style={[styles.productivityLabel, { color: theme.colors.text }]}>{period.label}</Text>
                        <Text style={[styles.productivityHours, { color: theme.colors.textSecondary }]}>{period.hours}</Text>
                      </View>
                    </View>
                    <View style={styles.productivityBarContainer}>
                      <View style={[styles.productivityBarBg, { backgroundColor: theme.colors.border }]}>
                        <LinearGradient
                          colors={theme.colors.gradient as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.productivityBarFill, { width: `${Math.max(percentage, 2)}%` }]}
                        />
                      </View>
                      <Text style={[styles.productivityValue, { color: theme.colors.text }]}>
                        {Math.round(period.minutes / 60)}h
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Course Distribution */}
          {courseDistribution.length > 0 && (
            <View style={[styles.courseDistributionCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.courseDistributionHeader}>
                <PieChart size={20} color={theme.colors.primary} />
                <Text style={[styles.courseDistributionTitle, { color: theme.colors.text }]}>Kursfördelning</Text>
              </View>
              <View style={styles.courseDistributionList}>
                {courseDistribution.slice(0, 5).map((course, index) => {
                  const totalMinutes = courseDistribution.reduce((sum, c) => sum + c.minutes, 0);
                  const percentage = totalMinutes > 0 ? Math.round((course.minutes / totalMinutes) * 100) : 0;
                  
                  return (
                    <View key={index} style={styles.courseDistributionItem}>
                      <View style={styles.courseDistributionLeft}>
                        <View style={[styles.courseColorDot, { backgroundColor: course.color }]} />
                        <Text style={[styles.courseDistributionName, { color: theme.colors.text }]} numberOfLines={1}>
                          {course.name}
                        </Text>
                      </View>
                      <View style={styles.courseDistributionRight}>
                        <View style={[styles.courseDistributionBarBg, { backgroundColor: theme.colors.border }]}>
                          <View style={[styles.courseDistributionBarFill, { width: `${percentage}%`, backgroundColor: course.color }]} />
                        </View>
                        <Text style={[styles.courseDistributionPercent, { color: theme.colors.textSecondary }]}>
                          {percentage}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Monthly Heatmap */}
          <View style={[styles.heatmapCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.heatmapHeader}>
              <Calendar size={20} color={theme.colors.warning} />
              <Text style={[styles.heatmapTitle, { color: theme.colors.text }]}>
                {monthlyHeatmap.monthName.charAt(0).toUpperCase() + monthlyHeatmap.monthName.slice(1)}
              </Text>
            </View>
            <View style={styles.heatmapWeekdays}>
              {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(day => (
                <Text key={day} style={[styles.heatmapWeekday, { color: theme.colors.textSecondary }]}>{day}</Text>
              ))}
            </View>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: monthlyHeatmap.firstDayOffset === 0 ? 6 : monthlyHeatmap.firstDayOffset - 1 }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.heatmapCell} />
              ))}
              {monthlyHeatmap.data.map((day) => {
                const intensityColors = [
                  theme.colors.border,
                  theme.colors.primary + '40',
                  theme.colors.primary + '70',
                  theme.colors.primary + 'AA',
                  theme.colors.primary
                ];
                const isToday = day.day === new Date().getDate();
                
                return (
                  <View 
                    key={day.day} 
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: intensityColors[day.intensity] },
                      isToday && styles.heatmapCellToday
                    ]}
                  >
                    <Text style={[
                      styles.heatmapDayText,
                      { color: day.intensity >= 2 ? '#FFFFFF' : theme.colors.textSecondary },
                      isToday && { fontWeight: '700' as const }
                    ]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.heatmapLegendText, { color: theme.colors.textSecondary }]}>Mindre</Text>
              <View style={styles.heatmapLegendColors}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View 
                    key={i} 
                    style={[
                      styles.heatmapLegendCell,
                      { backgroundColor: [
                        theme.colors.border,
                        theme.colors.primary + '40',
                        theme.colors.primary + '70',
                        theme.colors.primary + 'AA',
                        theme.colors.primary
                      ][i] }
                    ]} 
                  />
                ))}
              </View>
              <Text style={[styles.heatmapLegendText, { color: theme.colors.textSecondary }]}>Mer</Text>
            </View>
          </View>

          {/* Extra Stats Row */}
          <View style={styles.extraStatsRow}>
            <View style={[styles.extraStatCard, { backgroundColor: theme.colors.card }]}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={[styles.extraStatValue, { color: theme.colors.text }]}>{longestSession}m</Text>
              <Text style={[styles.extraStatLabel, { color: theme.colors.textSecondary }]}>Längsta session</Text>
            </View>
            <View style={[styles.extraStatCard, { backgroundColor: theme.colors.card }]}>
              <Target size={20} color={theme.colors.secondary} />
              <Text style={[styles.extraStatValue, { color: theme.colors.text }]}>
                {Math.floor(totalAllTime / 60)}h
              </Text>
              <Text style={[styles.extraStatLabel, { color: theme.colors.textSecondary }]}>Totalt all tid</Text>
            </View>
            <View style={[styles.extraStatCard, { backgroundColor: theme.colors.card }]}>
              <Brain size={20} color={theme.colors.warning} />
              <Text style={[styles.extraStatValue, { color: theme.colors.text }]}>
                {pomodoroSessions.length > 0 ? Math.round(totalAllTime / pomodoroSessions.length) : 0}m
              </Text>
              <Text style={[styles.extraStatLabel, { color: theme.colors.textSecondary }]}>Snitt/session</Text>
            </View>
          </View>

          {/* Study Insights */}
          <View style={[styles.insightsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.insightsHeader}>
              <Lightbulb size={20} color="#FFD700" />
              <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Insikter</Text>
            </View>
            <View style={styles.insightsList}>
              {studyInsights.map((insight, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.insightItem,
                    { 
                      backgroundColor: insight.type === 'success' ? theme.colors.success + '10' :
                        insight.type === 'warning' ? theme.colors.warning + '10' : theme.colors.primary + '10'
                    }
                  ]}
                >
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                  <View style={styles.insightContent}>
                    <Text style={[styles.insightItemTitle, { color: theme.colors.text }]}>{insight.title}</Text>
                    <Text style={[styles.insightItemDescription, { color: theme.colors.textSecondary }]}>
                      {insight.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          </PremiumGate>
        </View>
      </ScrollView>

      {/* Completion Screen Modal */}
      <Modal
        visible={showCompletionScreen}
        animationType="fade"
        presentationStyle="overFullScreen"
        transparent={true}
      >
        <CompletionScreen
          data={completedSessionData}
          onSave={() => {
            setShowCompletionScreen(false);
            setCompletedSessionData(null);
          }}
          onDiscard={() => {
            setShowCompletionScreen(false);
            setCompletedSessionData(null);
          }}
          dailyGoal={dailyGoal}
          currentSessions={sessionCount}
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Inställningar</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={[styles.modalCloseButton, { color: theme.colors.primary }]}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Fokustid (minuter)</Text>
              <View style={styles.timeSelector}>
                {[15, 25, 45, 60].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: focusTime === time ? theme.colors.primary : theme.colors.card,
                        borderWidth: 2,
                        borderColor: focusTime === time ? theme.colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => {
                      setFocusTime(time);
                      if (sessionType === 'focus' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                      showSuccess('Inställning sparad', `Fokustid: ${time} minuter`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: focusTime === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Paustid (minuter)</Text>
              <View style={styles.timeSelector}>
                {[5, 10, 15, 20].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: breakTime === time ? theme.colors.primary : theme.colors.card,
                        borderWidth: 2,
                        borderColor: breakTime === time ? theme.colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => {
                      setBreakTime(time);
                      if (sessionType === 'break' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                      showSuccess('Inställning sparad', `Paustid: ${time} minuter`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: breakTime === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: theme.colors.error }]} 
              onPress={async () => {
                await resetTimer();
                showSuccess('Timer återställd', 'Redo för en ny session');
              }}
            >
              <Text style={styles.resetButtonText}>Återställ timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Exam Modal */}
      <AddExamModal
        visible={showAddExam}
        onClose={() => setShowAddExam(false)}
      />

      {/* Add Session Modal */}
      <Modal
        visible={showAddSession}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Ny Studiesession</Text>
            <TouchableOpacity onPress={() => {
              setShowAddSession(false);
              setNewSessionCourse('');
              setNewSessionNotes('');
              setNewSessionDuration(25);
              setNewSessionDate(new Date());
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}>
              <Text style={[styles.modalCloseButton, { color: theme.colors.primary }]}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Kurs</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
                <TouchableOpacity
                  style={[
                    styles.courseChip,
                    !newSessionCourse && styles.courseChipActive,
                    { 
                      backgroundColor: !newSessionCourse ? theme.colors.primary : theme.colors.card,
                      borderColor: !newSessionCourse ? theme.colors.primary : 'transparent'
                    }
                  ]}
                  onPress={() => setNewSessionCourse('')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.courseChipText,
                    { color: !newSessionCourse ? '#FFFFFF' : theme.colors.text }
                  ]}>Allmänt</Text>
                </TouchableOpacity>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseChip,
                      newSessionCourse === course.id && styles.courseChipActive,
                      { 
                        backgroundColor: newSessionCourse === course.id ? theme.colors.primary : theme.colors.card,
                        borderColor: newSessionCourse === course.id ? theme.colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => setNewSessionCourse(course.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.courseChipText,
                      { color: newSessionCourse === course.id ? '#FFFFFF' : theme.colors.text }
                    ]}>{course.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Längd (minuter)</Text>
              <View style={styles.timeSelector}>
                {[15, 25, 45, 60, 90].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { 
                        backgroundColor: newSessionDuration === time ? theme.colors.primary : theme.colors.card,
                        borderWidth: 2,
                        borderColor: newSessionDuration === time ? theme.colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => setNewSessionDuration(time)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: newSessionDuration === time ? '#FFFFFF' : theme.colors.text }
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Datum & Tid</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={20} color={theme.colors.primary} />
                  <Text style={[styles.dateTimeButtonText, { color: theme.colors.text }]}>
                    {newSessionDate.toLocaleDateString('sv-SE', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={20} color={theme.colors.secondary} />
                  <Text style={[styles.dateTimeButtonText, { color: theme.colors.text }]}>
                    {newSessionDate.toLocaleTimeString('sv-SE', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
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
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (selectedDate) {
                      setNewSessionDate(selectedDate);
                    }
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
                    if (Platform.OS === 'android') {
                      setShowTimePicker(false);
                    }
                    if (selectedTime) {
                      setNewSessionDate(selectedTime);
                    }
                  }}
                />
              )}
              
              {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneButtonText}>Klar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Anteckningar (valfritt)</Text>
              <TextInput
                style={[
                  styles.notesInput,
                  { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                placeholder="Vad ska du plugga?"
                placeholderTextColor={theme.colors.textSecondary}
                value={newSessionNotes}
                onChangeText={setNewSessionNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <LinearGradient
              colors={theme.colors.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <TouchableOpacity 
                style={styles.saveButton} 
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
                  
                  const scheduledDate = new Date(newSessionDate);
                  const now = new Date();
                  if (scheduledDate > now) {
                    const hours = Math.floor((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                    if (hours < 24) {
                      showAchievement('Planerad! 📅', `Session schemalagd om ${hours}h`);
                    }
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Lägg till session</Text>
              </TouchableOpacity>
            </LinearGradient>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  timerWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerInnerContent: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  timerMetaContainer: {
    alignItems: 'center',
    gap: 10,
  },
  sessionCourse: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sessionBadgeWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  sessionTypeIndicator: {
    alignItems: 'center',
  },
  sessionTypeBadgeGradient: {
    borderRadius: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  sessionTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  sessionTypeText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  courseSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  courseSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  courseList: {
    flexDirection: 'row',
  },
  courseChip: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginRight: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  courseChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  courseChipText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },


  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  viewButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  weeklyGraph: {
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  graphBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '400',
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
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingGroup: {
    marginBottom: 32,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  sessionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginTop: 12,
  },
  sessionCounterText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  playButtonGradient: {
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },

  quickStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quickStatIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  plannerSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  plannerCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  plannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  plannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  plannerInfo: {
    flex: 1,
  },
  plannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  plannerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  barValue: {
    position: 'absolute',
    bottom: '105%',
    fontSize: 10,
    fontWeight: '600',
  },


  sessionProgressBar: {
    width: 100,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  sessionProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  idleControls: {
    alignItems: 'center',
    gap: 30,
  },
  mainButtonGradient: {
    borderRadius: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  mainButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Completion Screen Styles
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  completionCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
  },
  completionContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 4,
  },
  completionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  completionStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  completionStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  completionStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8e8e93',
    textAlign: 'center',
  },
  completionStatDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  savedConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  savedText: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    width: '100%',
    gap: 16,
    zIndex: 2,
  },
  saveButtonGradient: {
    borderRadius: 25,
    shadowColor: '#40E0D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  discardButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8e8e93',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plannerContainer: {
    marginTop: 8,
  },
  plannerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  plannerSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plannerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  plannerSectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addSessionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsList: {
    marginTop: 12,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  sessionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sessionCourseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionCardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  sessionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDetailText: {
    fontSize: 14,
  },
  sessionNotes: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyCourseText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDetailText: {
    fontSize: 13,
  },
  notesInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examSection: {
    marginTop: 8,
  },
  examSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  examCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examCardLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  examCourse: {
    fontSize: 14,
    fontWeight: '500',
  },
  examCardDetails: {
    gap: 8,
  },
  examDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examDetailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  examNotes: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  focusScoreCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  focusScoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusScoreLeft: {
    flex: 1,
  },
  focusScoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  focusScoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 60,
  },
  focusScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  focusScoreLevel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  focusScoreDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 16,
    textAlign: 'center',
  },
  weekComparisonCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekComparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  weekComparisonTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  weekComparisonValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  weekComparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  weekComparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekComparisonBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  productivityCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  productivityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  productivityBars: {
    gap: 16,
  },
  productivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productivityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 100,
  },
  productivityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productivityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  productivityHours: {
    fontSize: 11,
    fontWeight: '500',
  },
  productivityBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 160,
  },
  productivityBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  productivityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  productivityValue: {
    fontSize: 13,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },
  courseDistributionCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseDistributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  courseDistributionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  courseDistributionList: {
    gap: 14,
  },
  courseDistributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseDistributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    maxWidth: '45%',
  },
  courseColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  courseDistributionName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  courseDistributionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  courseDistributionBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  courseDistributionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  courseDistributionPercent: {
    fontSize: 13,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  heatmapCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  heatmapWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  heatmapWeekday: {
    fontSize: 11,
    fontWeight: '600',
    width: 36,
    textAlign: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapCellToday: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  heatmapDayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  heatmapLegendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  heatmapLegendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapLegendCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  extraStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  extraStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  extraStatValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  extraStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightItemDescription: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});