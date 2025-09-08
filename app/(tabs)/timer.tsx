import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Timer, Play, Pause, Square, Settings, BookOpen, BellOff, Bell } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

export default function TimerScreen() {
  const { courses, addPomodoroSession, pomodoroSessions } = useStudy();
  const { showSuccess, showAchievement } = useToast();
  const { theme, isDark } = useTheme();
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
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

  // Check notification permissions on mount
  useEffect(() => {
    checkNotificationPermissions();
  }, []);

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
      // Set notification behavior to be less intrusive during focus sessions
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
      showSuccess('Stör ej aktiverat! 🔕', 'Notifikationer är nu tysta');
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
      // Restore normal notification behavior
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
      showSuccess('Stör ej inaktiverat! 🔔', 'Notifikationer är nu aktiva');
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
    
    // Disable Do Not Disturb when session completes
    if (isDndActive && sessionType === 'focus') {
      await disableDoNotDisturb();
    }
    
    if (sessionType === 'focus' && sessionStartTime) {
      // Save the completed focus session
      try {
        await addPomodoroSession({
          courseId: selectedCourse || undefined,
          duration: focusTime,
          startTime: sessionStartTime.toISOString(),
          endTime: new Date().toISOString()
        });
        
        // Show success toast
        const courseName = selectedCourse 
          ? courses.find(c => c.id === selectedCourse)?.title || 'Okänd kurs'
          : 'Allmän session';
        showSuccess(
          'Session slutförd! 🎉',
          `${focusTime} minuter ${courseName}`
        );
      } catch (error) {
        console.error('Failed to save pomodoro session:', error);
      }
    }

    // Switch to break or back to focus
    if (sessionType === 'focus') {
      setSessionType('break');
      setTimeLeft(breakTime * 60);
      showSuccess('Bra jobbat! 🎉', 'Tid för en paus!');
    } else {
      setSessionType('focus');
      setTimeLeft(focusTime * 60);
      showSuccess('Pausen är över! 💪', 'Dags att fokusera igen!');
    }
  };

  const startTimer = async () => {
    if (timerState === 'idle') {
      setSessionStartTime(new Date());
      
      // Enable Do Not Disturb for focus sessions
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
    
    // Disable Do Not Disturb when stopping
    if (isDndActive) {
      await disableDoNotDisturb();
    }
  };

  const resetTimer = async () => {
    setTimerState('idle');
    setSessionType('focus');
    setTimeLeft(focusTime * 60);
    setSessionStartTime(null);
    
    // Disable Do Not Disturb when resetting
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
    
    // Calculate daily breakdown
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

  const getMonthStats = () => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthSessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= monthAgo && sessionDate <= now;
    });
    
    const totalMinutes = monthSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    return {
      sessions: monthSessions.length,
      minutes: totalMinutes,
      hours: totalHours
    };
  };

  const getCourseStats = () => {
    const courseStats = new Map<string, { sessions: number; minutes: number; courseName: string; subject: string; lastSession: string }>();
    
    pomodoroSessions.forEach(session => {
      if (session.courseId) {
        const course = courses.find(c => c.id === session.courseId);
        const courseName = course?.title || 'Okänd kurs';
        const subject = course?.subject || 'Allmänt';
        const existing = courseStats.get(session.courseId) || { 
          sessions: 0, 
          minutes: 0, 
          courseName, 
          subject,
          lastSession: session.endTime
        };
        courseStats.set(session.courseId, {
          sessions: existing.sessions + 1,
          minutes: existing.minutes + session.duration,
          courseName,
          subject,
          lastSession: new Date(session.endTime) > new Date(existing.lastSession) ? session.endTime : existing.lastSession
        });
      }
    });
    
    return Array.from(courseStats.entries())
      .map(([courseId, stats]) => ({ courseId, ...stats }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  };
  
  const getProductivityInsights = () => {
    if (pomodoroSessions.length === 0) return null;
    
    // Find most productive time of day
    const hourStats = new Map<number, number>();
    pomodoroSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourStats.set(hour, (hourStats.get(hour) || 0) + session.duration);
    });
    
    const mostProductiveHour = Array.from(hourStats.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    // Find most productive day of week
    const dayStats = new Map<number, number>();
    pomodoroSessions.forEach(session => {
      const day = new Date(session.startTime).getDay();
      dayStats.set(day, (dayStats.get(day) || 0) + session.duration);
    });
    
    const mostProductiveDay = Array.from(dayStats.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    
    // Calculate average session length
    const avgSessionLength = Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / pomodoroSessions.length);
    
    // Calculate study consistency (sessions per week)
    const weeksActive = Math.max(1, Math.ceil((Date.now() - new Date(pomodoroSessions[pomodoroSessions.length - 1].startTime).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const sessionsPerWeek = Math.round(pomodoroSessions.length / weeksActive);
    
    return {
      mostProductiveHour: mostProductiveHour ? `${mostProductiveHour[0].toString().padStart(2, '0')}:00` : 'N/A',
      mostProductiveDay: mostProductiveDay ? dayNames[mostProductiveDay[0]] : 'N/A',
      avgSessionLength,
      sessionsPerWeek,
      totalHours: Math.round(pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10
    };
  };

  const getStreakStats = () => {
    if (pomodoroSessions.length === 0) return { current: 0, longest: 0, weeklyGoal: 0, monthlyGoal: 0 };
    
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
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Calculate current streak
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
    } else if (uniqueDates.includes(yesterday)) {
      // If no session today but had yesterday, streak is broken
      currentStreak = 0;
    }
    
    // Calculate longest streak
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
    
    // Calculate goal progress
    const weeklyGoal = 5; // 5 days per week
    const monthlyGoal = 20; // 20 days per month
    
    const thisWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });
    
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthDays = [];
    const daysInMonth = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(thisMonthStart);
      date.setDate(i + 1);
      thisMonthDays.push(date.toDateString());
    }
    
    const weeklyProgress = thisWeekDays.filter(day => uniqueDates.includes(day)).length;
    const monthlyProgress = thisMonthDays.filter(day => uniqueDates.includes(day)).length;
    
    return { 
      current: currentStreak, 
      longest: longestStreak,
      weeklyGoal: Math.round((weeklyProgress / weeklyGoal) * 100),
      monthlyGoal: Math.round((monthlyProgress / monthlyGoal) * 100)
    };
  };

  const getSelectedCourseTitle = () => {
    if (!selectedCourse) return 'Allmän session';
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.title : 'Okänd kurs';
  };

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  const monthStats = getMonthStats();
  const courseStats = getCourseStats();
  const streakStats = getStreakStats();
  const productivityInsights = getProductivityInsights();

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

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
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {sessionType === 'focus' ? 'Fokus' : 'Paus'}
              </Text>
              {isDndActive && (
                <View style={styles.dndIndicator}>
                  <BellOff size={16} color="#EF4444" />
                  <Text style={styles.dndText}>Stör ej</Text>
                </View>
              )}
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {getSelectedCourseTitle()}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {Platform.OS !== 'web' && dndPermissionGranted && (
              <TouchableOpacity
                style={[
                  styles.headerButton, 
                  { 
                    backgroundColor: isDndActive ? '#EF4444' : theme.colors.card,
                    borderColor: isDndActive ? '#DC2626' : '#475569'
                  }
                ]}
                onPress={isDndActive ? disableDoNotDisturb : enableDoNotDisturb}
                activeOpacity={0.8}
              >
                {isDndActive ? (
                  <BellOff size={22} color="#F9FAFB" />
                ) : (
                  <Bell size={22} color={theme.colors.text} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.8}
            >
              <Settings size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          {/* Outer Progress Ring */}
          <Svg width={320} height={320} style={styles.outerProgressSvg}>
            {/* Background circle */}
            <Circle
              cx={160}
              cy={160}
              r={150}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={6}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={160}
              cy={160}
              r={150}
              stroke="#A3E635"
              strokeWidth={6}
              fill="none"
              strokeDasharray={2 * Math.PI * 150}
              strokeDashoffset={2 * Math.PI * 150 * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 160 160)`}
            />
          </Svg>
          
          <LinearGradient
            colors={theme.colors.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.timerCircle}
          >
            <View style={styles.timerContent}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.sessionTypeText}>
                {sessionType === 'focus' ? 'Fokus' : 'Paus'}
              </Text>
              <View style={styles.timerDots}>
                <View style={[styles.dot, timerState === 'running' && styles.dotActive]} />
                <View style={[styles.dot, timerState === 'paused' && styles.dotActive]} />
                <View style={[styles.dot, timerState === 'idle' && styles.dotActive]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Course Selection */}
        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vad pluggar du?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  { 
                    backgroundColor: !selectedCourse ? '#A3E635' : theme.colors.card, 
                    borderColor: !selectedCourse ? '#84CC16' : theme.colors.border 
                  }
                ]}
                onPress={() => setSelectedCourse('')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.courseChipText,
                  { 
                    color: !selectedCourse ? '#1E293B' : theme.colors.textSecondary
                  }
                ]}>✨ Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: selectedCourse === course.id ? '#A3E635' : theme.colors.card, 
                      borderColor: selectedCourse === course.id ? '#84CC16' : theme.colors.border 
                    }
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.courseChipText,
                    { 
                      color: selectedCourse === course.id ? '#1E293B' : theme.colors.textSecondary
                    }
                  ]}>📚 {course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {timerState === 'idle' ? (
            <TouchableOpacity 
              style={[
                styles.playButton, 
                { 
                  backgroundColor: 'white',
                  transform: [{ scale: 1 }]
                }
              ]} 
              onPress={startTimer}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A3E635', '#84CC16']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 3,
                  left: 3,
                  right: 3,
                  bottom: 3,
                  borderRadius: 37,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Play size={32} color="white" fill="white" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.stopButton, { backgroundColor: '#EF4444' }]} 
                onPress={stopTimer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 26,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Square size={22} color="white" fill="white" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.playButton, 
                  { 
                    backgroundColor: 'white',
                    transform: [{ scale: 1 }]
                  }
                ]}
                onPress={timerState === 'running' ? pauseTimer : startTimer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={timerState === 'running' ? ['#F59E0B', '#D97706'] : ['#A3E635', '#84CC16']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: 3,
                    right: 3,
                    bottom: 3,
                    borderRadius: 37,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {timerState === 'running' ? (
                    <Pause size={32} color="white" fill="white" />
                  ) : (
                    <Play size={32} color="white" fill="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsMainSection}>
          {/* Productivity Score Circle */}
          <View style={styles.productivitySection}>
            <View style={styles.dateSelector}>
              <TouchableOpacity style={styles.dateArrow} activeOpacity={0.7}>
                <Text style={styles.dateArrowText}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>Sep 8, 2025</Text>
              <TouchableOpacity style={styles.dateArrow} activeOpacity={0.7}>
                <Text style={styles.dateArrowText}>›</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.viewToggle}>
              <TouchableOpacity 
                style={[styles.viewButton, styles.viewButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.viewButtonTextActive}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewButton}
                activeOpacity={0.8}
              >
                <Text style={styles.viewButtonText}>Week</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productivityCircleContainer}>
              <Svg width={280} height={280} style={styles.productivitySvg}>
                {/* Background circle */}
                <Circle
                  cx={140}
                  cy={140}
                  r={100}
                  stroke="#334155"
                  strokeWidth={20}
                  fill="none"
                />
                {/* Progress arc */}
                <Circle
                  cx={140}
                  cy={140}
                  r={100}
                  stroke="url(#gradient)"
                  strokeWidth={20}
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 100 * 0.5} ${2 * Math.PI * 100}`}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                />
                <Defs>
                  <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#06B6D4" />
                    <Stop offset="50%" stopColor="#10B981" />
                    <Stop offset="100%" stopColor="#10B981" />
                  </SvgLinearGradient>
                </Defs>
                {/* Scale markers */}
                <SvgText x="140" y="50" fill="#94A3B8" fontSize="14" textAnchor="middle">100</SvgText>
                <SvgText x="230" y="145" fill="#94A3B8" fontSize="14" textAnchor="middle">75</SvgText>
                <SvgText x="140" y="240" fill="#94A3B8" fontSize="14" textAnchor="middle">50</SvgText>
                <SvgText x="50" y="145" fill="#94A3B8" fontSize="14" textAnchor="middle">25</SvgText>
                <SvgText x="35" y="210" fill="#94A3B8" fontSize="14" textAnchor="middle">0</SvgText>
              </Svg>
              <View style={styles.productivityContent}>
                <Text style={styles.productivityIcon}>🔒</Text>
                <Text style={styles.productivityTitle}>Productivity</Text>
                <Text style={styles.productivitySubtitle}>Score</Text>
              </View>
            </View>

            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Streak</Text>
                <View style={styles.quickStatValue}>
                  <Text style={styles.quickStatNumber}>{streakStats.current}</Text>
                  <Text style={styles.quickStatEmoji}>🔥</Text>
                </View>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Focus</Text>
                <Text style={styles.quickStatTime}>{Math.floor(todayStats.minutes / 60)}h</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Breaks</Text>
                <Text style={styles.quickStatTime}>0h</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.showOffButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.showOffGradient}
              >
                <Text style={styles.showOffText}>Show Off Your Work</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Streaks & Goals */}
          <View style={styles.streakSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mål & Streaks</Text>
            <View style={styles.streakGrid}>
              <View style={[styles.streakCard, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.streakNumber}>{streakStats.current}</Text>
                <Text style={styles.streakLabel}>Nuvarande streak</Text>
                <Text style={styles.streakSubtext}>🔥 dagar i rad</Text>
              </View>
              <View style={[styles.streakCard, { backgroundColor: '#EA580C' }]}>
                <Text style={styles.streakNumber}>{streakStats.longest}</Text>
                <Text style={styles.streakLabel}>Längsta streak</Text>
                <Text style={styles.streakSubtext}>🏆 personligt rekord</Text>
              </View>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.graphSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Veckoöversikt</Text>
            <View style={styles.weeklyGraphContainer}>
              <View style={styles.weeklyGraph}>
                {weekStats.dailyStats.map((day, i) => {
                  const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  const maxMinutes = Math.max(120, Math.max(...weekStats.dailyStats.map(d => d.minutes)));
                  const barHeight = Math.max(4, (day.minutes / maxMinutes) * 80);
                  
                  return (
                    <View key={i} style={styles.dayColumn}>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.dayBar, 
                            { 
                              height: barHeight, 
                              backgroundColor: day.minutes > 0 ? (isToday ? '#F59E0B' : '#A3E635') : '#475569'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{dayName}</Text>
                      <Text style={[styles.dayValue, isToday && styles.todayValue]}>{day.minutes}m</Text>
                    </View>
                  );
                })}
              </View>
              
              <View style={styles.weekSummary}>
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryLabel}>Totalt denna vecka</Text>
                  <Text style={styles.weekSummaryValue}>{Math.round(weekStats.minutes / 60 * 10) / 10}h</Text>
                </View>
                <View style={styles.weekSummaryItem}>
                  <Text style={styles.weekSummaryLabel}>Snitt per dag</Text>
                  <Text style={styles.weekSummaryValue}>{weekStats.averagePerDay}m</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Productivity Insights */}
          {productivityInsights && (
            <View style={styles.insightsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Produktivitetsinsikter</Text>
              <View style={styles.insightsGrid}>
                <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                  <Text style={styles.insightIcon}>🌟</Text>
                  <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>Bästa tid</Text>
                  <Text style={[styles.insightValue, { color: theme.colors.text }]}>{productivityInsights.mostProductiveHour}</Text>
                </View>
                <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                  <Text style={styles.insightIcon}>📅</Text>
                  <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>Bästa dag</Text>
                  <Text style={[styles.insightValue, { color: theme.colors.text }]}>{productivityInsights.mostProductiveDay}</Text>
                </View>
                <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                  <Text style={styles.insightIcon}>⏱️</Text>
                  <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>Snitt/session</Text>
                  <Text style={[styles.insightValue, { color: theme.colors.text }]}>{productivityInsights.avgSessionLength}m</Text>
                </View>
                <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                  <Text style={styles.insightIcon}>📈</Text>
                  <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>Per vecka</Text>
                  <Text style={[styles.insightValue, { color: theme.colors.text }]}>{productivityInsights.sessionsPerWeek}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Top Courses */}
          {courseStats.length > 0 && (
            <View style={styles.courseStatsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mest studerade kurser</Text>
              {courseStats.slice(0, 3).map((stat, index) => {
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                const rankEmojis = ['🥇', '🥈', '🥉'];
                
                return (
                  <View key={stat.courseId} style={[styles.courseStatItem, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.courseStatRank, { backgroundColor: rankColors[index] }]}>
                      <Text style={styles.courseStatRankEmoji}>{rankEmojis[index]}</Text>
                    </View>
                    <View style={styles.courseStatInfo}>
                      <Text style={[styles.courseStatName, { color: theme.colors.text }]}>{stat.courseName}</Text>
                      <Text style={[styles.courseStatSubject, { color: theme.colors.primary }]}>{stat.subject}</Text>
                      <Text style={[styles.courseStatDetails, { color: theme.colors.textSecondary }]}>
                        {stat.sessions} sessioner • {Math.round(stat.minutes / 60 * 10) / 10}h
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Inställningar</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.closeButton}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Fokustid (minuter)</Text>
              <View style={styles.timeSelector}>
                {[15, 20, 25, 30, 45, 60].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      focusTime === time && styles.timeOptionActive
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
                      focusTime === time && styles.timeOptionTextActive
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Paustid (minuter)</Text>
              <View style={styles.timeSelector}>
                {[5, 10, 15, 20].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      breakTime === time && styles.timeOptionActive
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
                      breakTime === time && styles.timeOptionTextActive
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={async () => {
                await resetTimer();
                showSuccess('Timer återställd', 'Redo för en ny session!');
              }}
            >
              <Text style={styles.resetButtonText}>Återställ timer</Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <View style={styles.settingGroup}>
                <Text style={styles.settingLabel}>Stör ej-läge</Text>
                <Text style={styles.settingDescription}>
                  {dndPermissionGranted 
                    ? 'Aktiveras automatiskt under fokussessioner för att blockera notifikationer.'
                    : 'Notifikationsbehörigheter krävs för att aktivera stör ej-läge.'
                  }
                </Text>
                {!dndPermissionGranted && (
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={checkNotificationPermissions}
                  >
                    <Text style={styles.permissionButtonText}>Aktivera behörigheter</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>




    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: 320,
    height: 320,
    alignSelf: 'center',
    position: 'relative',
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  outerProgressSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  timerContent: {
    alignItems: 'center',
    zIndex: 3,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sessionTypeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 16,
  },
  timerDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: 'white',
  },
  courseSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  courseList: {
    flexDirection: 'row',
  },
  courseChip: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  closeButton: {
    fontSize: 16,
    color: '#A3E635',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  settingGroup: {
    marginBottom: 32,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  timeOptionActive: {
    backgroundColor: '#A3E635',
    borderColor: '#A3E635',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: '#1E293B',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 32,
  },
  resetButtonText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  bigStatCard: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  bigStatNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  bigStatLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  bigStatSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  recentSessions: {
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#475569',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionCourse: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#94A3B8',
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A3E635',
  },
  // New statistics styles
  streakSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  streakGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#A3E635',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  streakSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  periodSection: {
    marginBottom: 32,
  },
  periodCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  periodHeader: {
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodStat: {
    alignItems: 'center',
  },
  periodStatNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#A3E635',
    marginBottom: 4,
  },
  periodStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  courseStatsSection: {
    backgroundColor: '#334155',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#475569',
  },
  courseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  courseStatRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseStatRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  courseStatInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseStatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  courseStatDetails: {
    fontSize: 12,
    color: '#94A3B8',
  },
  courseStatProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    overflow: 'hidden',
  },
  courseStatBar: {
    height: '100%',
    backgroundColor: '#A3E635',
    borderRadius: 2,
  },
  // DND styles
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dndIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dndText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#A3E635',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  // Graph styles
  graphSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  weeklyGraph: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  dayBar: {
    width: 16,
    borderRadius: 8,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  dayValue: {
    fontSize: 10,
    color: '#A3E635',
    fontWeight: '600',
  },
  weekProgressBar: {
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  weekProgressFill: {
    height: '100%',
    backgroundColor: '#A3E635',
    borderRadius: 2,
  },
  monthProgressBar: {
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  monthProgressFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 2,
  },
  // New enhanced statistics styles
  insightsSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#475569',
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '600',
    textAlign: 'center',
  },
  goalSection: {
    marginTop: 16,
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 14,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  goalPercentage: {
    fontSize: 16,
    color: '#A3E635',
    fontWeight: '700',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  weeklyGraphContainer: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  sessionDots: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  sessionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#A3E635',
  },
  sessionOverflow: {
    fontSize: 8,
    color: '#A3E635',
    fontWeight: '600',
  },
  todayLabel: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  todayValue: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  sessionCount: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  weekSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#475569',
  },
  weekSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  weekSummaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  weekSummaryValue: {
    fontSize: 16,
    color: '#A3E635',
    fontWeight: '700',
  },
  courseStatRankEmoji: {
    fontSize: 16,
  },
  courseStatSubject: {
    fontSize: 12,
    color: '#A3E635',
    fontWeight: '500',
    marginBottom: 2,
  },
  courseStatLastSession: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  courseStatMinutes: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  statsMainSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  productivitySection: {
    marginBottom: 32,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  dateArrow: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 24,
    padding: 4,
    marginBottom: 32,
    alignSelf: 'center',
  },
  viewButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewButtonActive: {
    backgroundColor: '#F9FAFB',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  viewButtonTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  productivityCircleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  productivitySvg: {
    position: 'absolute',
  },
  productivityContent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 280,
  },
  productivityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  productivityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  productivitySubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  quickStatValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  quickStatEmoji: {
    fontSize: 20,
  },
  quickStatTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  showOffButton: {
    marginBottom: 32,
  },
  showOffGradient: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  showOffText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});