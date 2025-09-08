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
  Platform
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Play, Pause, Square, Settings, BellOff, Bell, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Notifications from 'expo-notifications';



type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

export default function TimerScreen() {
  const { courses, addPomodoroSession, pomodoroSessions } = useStudy();
  const { showSuccess } = useToast();
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
  const [selectedStatView, setSelectedStatView] = useState<'day' | 'week'>('day');
  
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
        showSuccess(
          'Session slutförd',
          `${focusTime} minuter ${courseName}`
        );
      } catch (error) {
        console.error('Failed to save pomodoro session:', error);
      }
    }

    if (sessionType === 'focus') {
      setSessionType('break');
      setTimeLeft(breakTime * 60);
      showSuccess('Bra jobbat', 'Tid för en paus');
    } else {
      setSessionType('focus');
      setTimeLeft(focusTime * 60);
      showSuccess('Pausen är över', 'Dags att fokusera igen');
    }
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {sessionType === 'focus' ? 'Fokustid' : 'Paus'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {getSelectedCourseTitle()}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {Platform.OS !== 'web' && dndPermissionGranted && (
              <TouchableOpacity
                style={[
                  styles.headerButton, 
                  { backgroundColor: theme.colors.card }
                ]}
                onPress={isDndActive ? disableDoNotDisturb : enableDoNotDisturb}
                activeOpacity={0.8}
              >
                {isDndActive ? (
                  <BellOff size={20} color={theme.colors.primary} />
                ) : (
                  <Bell size={20} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.8}
            >
              <Settings size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <Svg width={260} height={260} style={styles.timerSvg}>
            {/* Background circle */}
            <Circle
              cx={130}
              cy={130}
              r={120}
              stroke={theme.colors.border}
              strokeWidth={8}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={130}
              cy={130}
              r={120}
              stroke={theme.colors.primary}
              strokeWidth={8}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 130 130)`}
            />
          </Svg>
          
          <View style={styles.timerContent}>
            <Text style={[styles.timerText, { color: theme.colors.text }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={[styles.sessionLabel, { color: theme.colors.textSecondary }]}>
              {sessionType === 'focus' ? 'Fokus' : 'Paus'}
            </Text>
          </View>
        </View>

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

        {/* Controls */}
        <View style={styles.controls}>
          {timerState === 'idle' ? (
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]} 
              onPress={startTimer}
              activeOpacity={0.8}
            >
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: theme.colors.card }]} 
                onPress={stopTimer}
                activeOpacity={0.8}
              >
                <Square size={20} color={theme.colors.text} fill={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                onPress={timerState === 'running' ? pauseTimer : startTimer}
                activeOpacity={0.8}
              >
                {timerState === 'running' ? (
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          {/* Date Selector */}
          <View style={styles.dateSelector}>
            <TouchableOpacity style={styles.dateArrow} activeOpacity={0.7}>
              <ChevronLeft size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {new Date().toLocaleDateString('sv-SE', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <TouchableOpacity style={styles.dateArrow} activeOpacity={0.7}>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* View Toggle */}
          <View style={[styles.viewToggle, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity 
              style={[
                styles.viewButton,
                selectedStatView === 'day' && [styles.viewButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setSelectedStatView('day')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.viewButtonText,
                { color: selectedStatView === 'day' ? '#FFFFFF' : theme.colors.textSecondary }
              ]}>Dag</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewButton,
                selectedStatView === 'week' && [styles.viewButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setSelectedStatView('week')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.viewButtonText,
                { color: selectedStatView === 'week' ? '#FFFFFF' : theme.colors.textSecondary }
              ]}>Vecka</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {selectedStatView === 'day' ? todayStats.sessions : weekStats.sessions}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Sessioner
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {selectedStatView === 'day' 
                  ? `${Math.floor(todayStats.minutes / 60)}h ${todayStats.minutes % 60}m`
                  : `${Math.floor(weekStats.minutes / 60)}h`
                }
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total tid
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {streakStats.current}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Streak 🔥
              </Text>
            </View>
          </View>

          {/* Weekly Graph */}
          {selectedStatView === 'week' && (
            <View style={[styles.weeklyGraph, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.graphTitle, { color: theme.colors.text }]}>Veckoöversikt</Text>
              <View style={styles.graphBars}>
                {weekStats.dailyStats.map((day, i) => {
                  const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const maxMinutes = Math.max(60, Math.max(...weekStats.dailyStats.map(d => d.minutes)));
                  const barHeight = Math.max(4, (day.minutes / maxMinutes) * 100);
                  
                  return (
                    <View key={i} style={styles.dayColumn}>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.dayBar, 
                            { 
                              height: `${barHeight}%`, 
                              backgroundColor: isToday ? theme.colors.primary : theme.colors.border
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.dayLabel, 
                        { color: isToday ? theme.colors.primary : theme.colors.textSecondary }
                      ]}>{dayName}</Text>
                    </View>
                  );
                })}
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
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
    width: 260,
    height: 260,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
});