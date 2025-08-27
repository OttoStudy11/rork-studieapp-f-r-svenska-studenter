import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { Timer, Play, Pause, Square, Settings, BarChart3, BookOpen } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

export default function TimerScreen() {
  const { courses, addPomodoroSession, pomodoroSessions } = useStudy();
  const { showSuccess, showAchievement } = useToast();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const totalTime = sessionType === 'focus' ? focusTime * 60 : breakTime * 60;
  const progress = timeLeft / totalTime;

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

  const startTimer = () => {
    if (timerState === 'idle') {
      setSessionStartTime(new Date());
    }
    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const stopTimer = () => {
    setTimerState('idle');
    setTimeLeft(sessionType === 'focus' ? focusTime * 60 : breakTime * 60);
    setSessionStartTime(null);
  };

  const resetTimer = () => {
    setTimerState('idle');
    setSessionType('focus');
    setTimeLeft(focusTime * 60);
    setSessionStartTime(null);
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

  const getSelectedCourseTitle = () => {
    if (!selectedCourse) return 'Allmän session';
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.title : 'Okänd kurs';
  };

  const todayStats = getTodayStats();

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {sessionType === 'focus' ? 'Fokus' : 'Paus'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getSelectedCourseTitle()}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowStats(true)}
            >
              <BarChart3 size={20} color="#F9FAFB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
            >
              <Settings size={20} color="#F9FAFB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Svg width={280} height={280} style={styles.progressSvg}>
              {/* Background circle */}
              <Circle
                cx={140}
                cy={140}
                r={120}
                stroke="#334155"
                strokeWidth={8}
                fill="none"
                opacity={0.3}
              />
              {/* Progress circle */}
              <Circle
                cx={140}
                cy={140}
                r={120}
                stroke={sessionType === 'focus' ? '#A3E635' : '#3B82F6'}
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 140 140)`}
              />
            </Svg>
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
          </View>
        </View>

        {/* Course Selection */}
        {sessionType === 'focus' && timerState === 'idle' && (
          <View style={styles.courseSection}>
            <Text style={styles.sectionTitle}>Vad pluggar du?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  !selectedCourse && styles.courseChipActive
                ]}
                onPress={() => setSelectedCourse('')}
              >
                <Text style={[
                  styles.courseChipText,
                  !selectedCourse && styles.courseChipTextActive
                ]}>Allmänt</Text>
              </TouchableOpacity>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    selectedCourse === course.id && styles.courseChipActive
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                >
                  <Text style={[
                    styles.courseChipText,
                    selectedCourse === course.id && styles.courseChipTextActive
                  ]}>{course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {timerState === 'idle' ? (
            <TouchableOpacity style={styles.playButton} onPress={startTimer}>
              <Play size={28} color="#1E293B" fill="#1E293B" />
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                <Square size={20} color="#F9FAFB" fill="#F9FAFB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playButton}
                onPress={timerState === 'running' ? pauseTimer : startTimer}
              >
                {timerState === 'running' ? (
                  <Pause size={28} color="#1E293B" fill="#1E293B" />
                ) : (
                  <Play size={28} color="#1E293B" fill="#1E293B" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Idag</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayStats.sessions}</Text>
              <Text style={styles.statLabel}>Sessioner</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayStats.minutes}</Text>
              <Text style={styles.statLabel}>Minuter</Text>
            </View>
          </View>
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
              onPress={() => {
                resetTimer();
                showSuccess('Timer återställd', 'Redo för en ny session!');
              }}
            >
              <Text style={styles.resetButtonText}>Återställ timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={showStats}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Statistik</Text>
            <TouchableOpacity onPress={() => setShowStats(false)}>
              <Text style={styles.closeButton}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.statsGrid}>
              <View style={styles.bigStatCard}>
                <Text style={styles.bigStatNumber}>{pomodoroSessions.length}</Text>
                <Text style={styles.bigStatLabel}>Totala sessioner</Text>
              </View>
              <View style={styles.bigStatCard}>
                <Text style={styles.bigStatNumber}>
                  {pomodoroSessions.reduce((sum, s) => sum + s.duration, 0)}
                </Text>
                <Text style={styles.bigStatLabel}>Totala minuter</Text>
              </View>
            </View>

            {pomodoroSessions.length > 0 && (
              <View style={styles.recentSessions}>
                <Text style={styles.sectionTitle}>Senaste sessioner</Text>
                {pomodoroSessions.slice(0, 10).map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionCourse}>
                        {session.courseId 
                          ? courses.find(c => c.id === session.courseId)?.title || 'Okänd kurs'
                          : 'Allmän session'
                        }
                      </Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.endTime).toLocaleDateString('sv-SE')}
                      </Text>
                    </View>
                    <Text style={styles.sessionDuration}>{session.duration} min</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#F9FAFB',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  sessionTypeText: {
    fontSize: 16,
    color: '#94A3B8',
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
    backgroundColor: '#475569',
  },
  dotActive: {
    backgroundColor: '#A3E635',
  },
  courseSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  courseList: {
    flexDirection: 'row',
  },
  courseChip: {
    backgroundColor: '#334155',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  courseChipActive: {
    backgroundColor: '#A3E635',
    borderColor: '#A3E635',
  },
  courseChipText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  courseChipTextActive: {
    color: '#1E293B',
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
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '600',
    color: '#A3E635',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
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
    fontWeight: '600',
    color: '#A3E635',
    marginBottom: 8,
  },
  bigStatLabel: {
    fontSize: 16,
    color: '#94A3B8',
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
});