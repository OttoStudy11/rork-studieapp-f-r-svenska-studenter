import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { Play, Pause, Square, Settings, BellOff, Bell, Flame, Target, Trophy, Coffee, Brain, Zap, Volume2, VolumeX, SkipForward, BookOpen, Clock, TrendingUp, Award, Star, CheckCircle, Timer, Activity } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
import * as Notifications from 'expo-notifications';



type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

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
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;


  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

  const motivationalQuotes = [
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
  ];

  // Check notification permissions on mount and set random quote
  useEffect(() => {
    checkNotificationPermissions();
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    calculateStats();
    
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
  }, []);

  const calculateStats = () => {
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
  };

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

  const disableDoNotDisturb = async () => {
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
  };

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
  }, [timerState]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleTimerComplete = async () => {
    setTimerState('idle');
    
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
          ? courses.find(c => c.id === selectedCourse)?.title || 'Okänd kurs'
          : 'Allmän session';
        
        // Update session count
        setSessionCount(prev => prev + 1);
        
        // Show achievement if daily goal reached
        if (sessionCount + 1 === dailyGoal) {
          showAchievement('Dagsmål uppnått! 🎯', `Du har slutfört ${dailyGoal} sessioner idag!`);
        }
        
        showSuccess(
          'Session slutförd! 🎉',
          `${focusTime} minuter ${courseName}`
        );
      } catch (error) {
        console.error('Failed to save pomodoro session:', error);
      }
    }

    if (sessionType === 'focus') {
      setSessionType('break');
      setTimeLeft(breakTime * 60);
      showSuccess('Bra jobbat! ☕', 'Tid för en välförtjänt paus');
    } else {
      setSessionType('focus');
      setTimeLeft(focusTime * 60);
      showSuccess('Pausen är över! 💪', 'Dags att fokusera igen');
    }
    
    // Update motivational quote
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  };

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

  const getTodayStats = () => {
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
  };

  const getWeekStats = () => {
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
  };

  const getStreakStats = () => {
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
  };

  const getSelectedCourseTitle = () => {
    if (!selectedCourse) return 'Allmän session';
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.title : 'Okänd kurs';
  };

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  const streakStats = getStreakStats();

  const circumference = 2 * Math.PI * 130;

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
        {/* Enhanced Header with gradient */}
        <LinearGradient
          colors={theme.colors.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  {sessionType === 'focus' ? 'Fokusläge' : 'Pausläge'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {getSelectedCourseTitle()}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[
                    styles.headerButton, 
                    { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                  ]}
                  onPress={() => setSoundEnabled(!soundEnabled)}
                  activeOpacity={0.7}
                >
                  {soundEnabled ? (
                    <Volume2 size={22} color="white" />
                  ) : (
                    <VolumeX size={22} color="white" />
                  )}
                </TouchableOpacity>
                {Platform.OS !== 'web' && dndPermissionGranted && (
                  <TouchableOpacity
                    style={[
                      styles.headerButton, 
                      { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                    ]}
                    onPress={isDndActive ? disableDoNotDisturb : enableDoNotDisturb}
                    activeOpacity={0.7}
                  >
                    {isDndActive ? (
                      <BellOff size={22} color="white" />
                    ) : (
                      <Bell size={22} color="white" />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}
                  onPress={() => setShowSettings(true)}
                  activeOpacity={0.7}
                >
                  <Settings size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Quick Stats Bar */}
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <Timer size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.headerStatValue}>{Math.floor(totalFocusToday / 60)}h {totalFocusToday % 60}m</Text>
                <Text style={styles.headerStatLabel}>Idag</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Activity size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.headerStatValue}>{sessionCount}/{dailyGoal}</Text>
                <Text style={styles.headerStatLabel}>Sessioner</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Flame size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.headerStatValue}>{currentStreak}</Text>
                <Text style={styles.headerStatLabel}>Streak</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Motivational Quote Card */}
        <LinearGradient
          colors={[theme.colors.primary + '10', theme.colors.secondary + '10'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quoteCard}
        >
          <View style={[styles.quoteIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Zap size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.quoteText, { color: theme.colors.text }]}>{motivationalQuote}</Text>
        </LinearGradient>

        {/* Enhanced Timer Circle with Gradient */}
        <Animated.View style={[
          styles.timerContainer,
          { transform: [{ scale: timerState === 'running' ? pulseAnim : scaleAnim }] }
        ]}>
          <Svg width={320} height={320} style={styles.timerSvg}>
            <Defs>
              <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="1" />
                <Stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            {/* Outer decorative circle */}
            <Circle
              cx={160}
              cy={160}
              r={145}
              stroke={theme.colors.border}
              strokeWidth={2}
              fill="none"
              opacity={0.2}
            />
            {/* Background circle */}
            <Circle
              cx={160}
              cy={160}
              r={130}
              stroke={theme.colors.border}
              strokeWidth={16}
              fill="none"
              opacity={0.3}
            />
            {/* Progress circle with gradient */}
            <Circle
              cx={160}
              cy={160}
              r={130}
              stroke="url(#grad)"
              strokeWidth={16}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 160 160)`}
            />
          </Svg>
          
          <View style={styles.timerContent}>
            <View style={[styles.sessionTypeIcon, { backgroundColor: sessionType === 'focus' ? theme.colors.primary + '15' : theme.colors.secondary + '15' }]}>
              {sessionType === 'focus' ? (
                <Brain size={32} color={theme.colors.primary} />
              ) : (
                <Coffee size={32} color={theme.colors.secondary} />
              )}
            </View>
            <Text style={[styles.timerText, { color: theme.colors.text }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={[styles.sessionLabel, { color: theme.colors.textSecondary }]}>
              {sessionType === 'focus' ? 'FOKUSLÄGE' : 'PAUSLÄGE'}
            </Text>
            
            {/* Enhanced Session Progress */}
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.secondary + '20'] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sessionCounter}
            >
              <Trophy size={18} color={theme.colors.primary} />
              <Text style={[styles.sessionCounterText, { color: theme.colors.text }]}>
                {sessionCount}/{dailyGoal} sessioner
              </Text>
              <View style={[styles.sessionProgressBar, { backgroundColor: theme.colors.border + '40' }]}>
                <View style={[
                  styles.sessionProgressFill,
                  { 
                    width: `${Math.min(100, (sessionCount / dailyGoal) * 100)}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]} />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Course Selection */}
        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  { 
                    backgroundColor: !selectedCourse ? theme.colors.primary : theme.colors.card,
                    borderColor: theme.colors.border
                  }
                ]}
                onPress={() => setSelectedCourse('')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.courseChipText,
                  { 
                    color: !selectedCourse ? '#FFFFFF' : theme.colors.textSecondary
                  }
                ]}>Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: selectedCourse === course.id ? theme.colors.primary : theme.colors.card,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.courseChipText,
                    { 
                      color: selectedCourse === course.id ? '#FFFFFF' : theme.colors.textSecondary
                    }
                  ]}>{course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Enhanced Controls with Better Design */}
        <View style={styles.controls}>
          {timerState === 'idle' ? (
            <View style={styles.idleControls}>
              <LinearGradient
                colors={theme.colors.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButtonGradient}
              >
                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={startTimer}
                  activeOpacity={0.7}
                >
                  <Play size={36} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.mainButtonText}>STARTA SESSION</Text>
                </TouchableOpacity>
              </LinearGradient>
              
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(15);
                    setTimeLeft(15 * 60);
                    showSuccess('Snabbläge', '15 minuters fokus aktiverat');
                  }}
                  activeOpacity={0.7}
                >
                  <Zap size={20} color={theme.colors.warning} />
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>15 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(45);
                    setTimeLeft(45 * 60);
                    showSuccess('Djupfokus', '45 minuters fokus aktiverat');
                  }}
                  activeOpacity={0.7}
                >
                  <Brain size={20} color={theme.colors.primary} />
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>45 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setFocusTime(60);
                    setTimeLeft(60 * 60);
                    showSuccess('Maratonläge', '60 minuters fokus aktiverat');
                  }}
                  activeOpacity={0.7}
                >
                  <Target size={20} color={theme.colors.secondary} />
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>60 min</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: theme.colors.error + '15' }]} 
                onPress={stopTimer}
                activeOpacity={0.7}
              >
                <Square size={24} color={theme.colors.error} fill={theme.colors.error} />
                <Text style={[styles.controlButtonText, { color: theme.colors.error }]}>Stoppa</Text>
              </TouchableOpacity>
              
              <LinearGradient
                colors={timerState === 'running' 
                  ? [theme.colors.warning, theme.colors.warning + 'DD'] as any
                  : theme.colors.gradient as any
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButtonGradient}
              >
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={timerState === 'running' ? pauseTimer : startTimer}
                  activeOpacity={0.7}
                >
                  {timerState === 'running' ? (
                    <>
                      <Pause size={36} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.mainButtonText}>PAUSA</Text>
                    </>
                  ) : (
                    <>
                      <Play size={36} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.mainButtonText}>FORTSÄTT</Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: theme.colors.secondary + '15' }]} 
                onPress={() => {
                  setSessionType(sessionType === 'focus' ? 'break' : 'focus');
                  setTimeLeft(sessionType === 'focus' ? breakTime * 60 : focusTime * 60);
                  setTimerState('idle');
                }}
                activeOpacity={0.7}
              >
                <SkipForward size={24} color={theme.colors.secondary} />
                <Text style={[styles.controlButtonText, { color: theme.colors.secondary }]}>Hoppa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Enhanced Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsSectionTitle, { color: theme.colors.text }]}>📊 Din statistik</Text>
          
          {/* Streak and Goal Card */}
          <LinearGradient
            colors={[theme.colors.primary + '15', theme.colors.secondary + '15'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakContent}>
              <View style={styles.streakItem}>
                <Flame size={24} color={theme.colors.warning} />
                <Text style={[styles.streakNumber, { color: theme.colors.text }]}>{currentStreak}</Text>
                <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>Dagars streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Target size={24} color={theme.colors.primary} />
                <Text style={[styles.streakNumber, { color: theme.colors.text }]}>
                  {Math.round((sessionCount / dailyGoal) * 100)}%
                </Text>
                <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>Av dagsmål</Text>
              </View>
            </View>
          </LinearGradient>

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
                selectedStatView === 'day' && styles.viewButtonActive
              ]}
              onPress={() => setSelectedStatView('day')}
              activeOpacity={0.8}
            >
              {selectedStatView === 'day' && (
                <LinearGradient
                  colors={theme.colors.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <Text style={[
                styles.viewButtonText,
                { color: selectedStatView === 'day' ? '#FFFFFF' : theme.colors.textSecondary }
              ]}>Idag</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewButton,
                selectedStatView === 'week' && styles.viewButtonActive
              ]}
              onPress={() => setSelectedStatView('week')}
              activeOpacity={0.8}
            >
              {selectedStatView === 'week' && (
                <LinearGradient
                  colors={theme.colors.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
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
              <Text style={[styles.graphTitle, { color: theme.colors.text }]}>📈 Veckoöversikt</Text>
              <View style={styles.graphBars}>
                {weekStats.dailyStats.map((day, i) => {
                  const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const maxMinutes = Math.max(60, Math.max(...weekStats.dailyStats.map(d => d.minutes)));
                  const barHeight = Math.max(4, (day.minutes / maxMinutes) * 100);
                  
                  return (
                    <View key={i} style={styles.dayColumn}>
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
              <Text style={[styles.closeButton, { color: theme.colors.primary }]}>Stäng</Text>
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
                      { backgroundColor: theme.colors.card },
                      focusTime === time && [styles.timeOptionActive, { backgroundColor: theme.colors.primary }]
                    ]}
                    onPress={() => {
                      setFocusTime(time);
                      if (sessionType === 'focus' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                      showSuccess('Inställning sparad', `Fokustid: ${time} minuter`);
                    }}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: focusTime === time ? '#FFFFFF' : theme.colors.textSecondary }
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
                      { backgroundColor: theme.colors.card },
                      breakTime === time && [styles.timeOptionActive, { backgroundColor: theme.colors.primary }]
                    ]}
                    onPress={() => {
                      setBreakTime(time);
                      if (sessionType === 'break' && timerState === 'idle') {
                        setTimeLeft(time * 60);
                      }
                      showSuccess('Inställning sparad', `Paustid: ${time} minuter`);
                    }}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: breakTime === time ? '#FFFFFF' : theme.colors.textSecondary }
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerContent: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '300',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  courseSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  courseList: {
    flexDirection: 'row',
  },
  courseChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
  },
  courseChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
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
    gap: 24,
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
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
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
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
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
  closeButton: {
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
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timeOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  headerGradient: {
    borderRadius: 0,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
    fontWeight: '600',
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  streakDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  headerTop: {
    flexDirection: 'column',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  headerStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quoteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    gap: 20,
  },
  mainButtonGradient: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});