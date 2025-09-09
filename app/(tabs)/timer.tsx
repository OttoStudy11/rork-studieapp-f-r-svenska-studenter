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
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { Play, Pause, Square, Settings, Flame, Target, Coffee, Brain, Zap, Volume2, VolumeX, SkipForward, X, Star } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';



type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

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
  // Remove unused theme variable
  // const { theme } = useTheme();
  const [starsVisible, setStarsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate entrance
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

    // Show stars after a delay
    setTimeout(() => {
      setStarsVisible(true);
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, [fadeAnim, scaleAnim, starsAnim]);

  if (!data) return null;

  const progressPercentage = Math.round((currentSessions / dailyGoal) * 100);
  const isBreak = data.sessionType === 'break';

  // Generate random star positions
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 1000,
  }));

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
        {/* Close button */}
        <TouchableOpacity 
          style={styles.completionCloseButton} 
          onPress={onDiscard}
          activeOpacity={0.7}
        >
          <X size={24} color="#8e8e93" />
        </TouchableOpacity>

        {/* Animated stars background */}
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
                  color="white" 
                  fill="white" 
                  opacity={0.6}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Main content */}
        <View style={styles.completionContent}>
          <Text style={styles.completionTitle}>Come on...</Text>
          
          {/* Progress circle */}
          <View style={styles.progressContainer}>
            <Svg width={200} height={200}>
              <Circle
                cx={100}
                cy={100}
                r={80}
                stroke="#2c2c54"
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={80}
                stroke="#40407a"
                strokeWidth={8}
                fill="none"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </Svg>
            <View style={styles.progressContent}>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              <Text style={styles.progressLabel}>of daily goal</Text>
            </View>
          </View>

          {/* Session info */}
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>
              You completed {data.duration}{isBreak ? 's' : 'm'}
            </Text>
            <Text style={styles.sessionText}>
              of {data.courseName} and
            </Text>
            <Text style={styles.sessionText}>
              earned {data.coinsEarned} coins.
            </Text>
          </View>

          {/* Challenges section */}
          <View style={styles.challengesSection}>
            <Text style={styles.challengesTitle}>Challenges worked on</Text>
            <Text style={styles.challengesSubtitle}>You don&apos;t have any active challenges</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <LinearGradient
            colors={['#40E0D0', '#48CAE4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={onSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
          
          <TouchableOpacity 
            style={styles.discardButton} 
            onPress={onDiscard}
            activeOpacity={0.7}
          >
            <Text style={styles.discardButtonText}>Discard</Text>
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
  const { currentStreak } = useAchievements();
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [dailyGoal] = useState(4); // Daily session goal
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
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
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;


  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

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
  }, [calculateStats, motivationalQuotes, pulseAnim, scaleAnim]);

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
    
    // Add haptic feedback
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback not available:', error);
      }
    }
    
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
        
        // Update session count
        setSessionCount(prev => prev + 1);
        
        // Calculate coins earned (1 coin per minute)
        const coinsEarned = focusTime;
        
        // Set completion data and show completion screen
        setCompletedSessionData({
          duration: focusTime,
          sessionType: 'focus',
          courseName,
          coinsEarned
        });
        setShowCompletionScreen(true);
        
        // Show achievement if daily goal reached
        if (sessionCount + 1 === dailyGoal) {
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
  }, [sessionType, isDndActive, disableDoNotDisturb, addPomodoroSession, selectedCourse, courses, focusTime, sessionStartTime, sessionCount, dailyGoal, showAchievement, breakTime, motivationalQuotes]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, handleTimerComplete]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const startTimer = async () => {
    if (timerState === 'idle') {
      setSessionStartTime(new Date());
      
      if (sessionType === 'focus' && dndPermissionGranted) {
        await enableDoNotDisturb();
      }
    }
    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const stopTimer = async () => {
    setTimerState('idle');
    setTimeLeft(sessionType === 'focus' ? focusTime * 60 : breakTime * 60);
    setSessionStartTime(null);
    
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
                onPress={() => setSoundEnabled(!soundEnabled)}
                activeOpacity={0.7}
              >
                {soundEnabled ? (
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
          <View style={[styles.timerCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.timerContainer}>
              <Svg width={280} height={280} style={styles.timerSvg}>
                {/* Background circle */}
                <Circle
                  cx={140}
                  cy={140}
                  r={120}
                  stroke={theme.colors.border}
                  strokeWidth={8}
                  fill="none"
                />
                {/* Progress circle */}
                <Circle
                  cx={140}
                  cy={140}
                  r={120}
                  stroke={sessionType === 'focus' ? theme.colors.primary : theme.colors.secondary}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  transform={`rotate(-90 140 140)`}
                />
              </Svg>
              
              <View style={styles.timerContent}>
                <Text style={[styles.timerText, { color: theme.colors.text }]}>
                  {formatTime(timeLeft)}
                </Text>
                <Text style={[styles.sessionLabel, { color: theme.colors.textSecondary }]}>
                  {getSelectedCourseTitle()}
                </Text>
                <View style={styles.sessionTypeIndicator}>
                  <View style={[styles.sessionTypeBadge, { 
                    backgroundColor: sessionType === 'focus' 
                      ? theme.colors.primary + '20' 
                      : theme.colors.secondary + '20'
                  }]}>
                    {sessionType === 'focus' ? (
                      <Brain size={16} color={theme.colors.primary} />
                    ) : (
                      <Coffee size={16} color={theme.colors.secondary} />
                    )}
                    <Text style={[styles.sessionTypeText, { color: theme.colors.text }]}>
                      {sessionType === 'focus' ? 'Fokus' : 'Paus'}
                    </Text>
                  </View>
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
                onPress={() => {
                  setSessionType(sessionType === 'focus' ? 'break' : 'focus');
                  setTimeLeft(sessionType === 'focus' ? breakTime * 60 : focusTime * 60);
                  setTimerState('idle');
                }}
                activeOpacity={0.7}
              >
                <SkipForward size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hero Stats Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.secondary + '20'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroStatsCard}
          >
            <View style={styles.heroStatsContent}>
              <View style={styles.heroStatItem}>
                <View style={[styles.heroStatIcon, { backgroundColor: theme.colors.warning + '30' }]}>
                  <Flame size={20} color={theme.colors.warning} />
                </View>
                <Text style={[styles.heroStatNumber, { color: theme.colors.text }]}>{currentStreak}</Text>
                <Text style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>Dagars streak</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <View style={[styles.heroStatIcon, { backgroundColor: theme.colors.primary + '30' }]}>
                  <Target size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.heroStatNumber, { color: theme.colors.text }]}>
                  {Math.round((sessionCount / dailyGoal) * 100)}%
                </Text>
                <Text style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>Av dagsmål</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statistik</Text>
          </View>

          {/* View Toggle with gradient */}
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

          {/* Enhanced Stats Cards with gradients */}
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

          {/* Enhanced Weekly Graph */}
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
  timerCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  timerContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerContent: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    letterSpacing: -2,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  sessionTypeIndicator: {
    alignItems: 'center',
  },
  sessionTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
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
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    alignSelf: 'center',
  },
  viewButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    borderRadius: 12,
    padding: 20,
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
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  heroStatsCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  heroStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
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
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#8e8e93',
    marginBottom: 40,
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
    marginBottom: 40,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
  challengesSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  challengesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  challengesSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8e8e93',
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  },
});