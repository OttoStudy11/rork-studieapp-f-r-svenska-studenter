import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { Timer, Play, Pause, Square, Settings, BarChart3, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={sessionType === 'focus' ? ['#667eea', '#764ba2'] : ['#11998e', '#38ef7d']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {sessionType === 'focus' ? 'Fokus' : 'Paus'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {sessionType === 'focus' ? 'Tid att koncentrera sig' : 'Vila och ladda om'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowStats(true)}
          >
            <BarChart3 size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Animated.View
            style={[
              styles.progressRing,
              {
                transform: [{
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
          />
          <View style={styles.timerContent}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionTypeText}>
              {sessionType === 'focus' ? 'Fokus' : 'Paus'}
            </Text>
          </View>
        </View>
      </View>

      {/* Course Selection */}
      {sessionType === 'focus' && (
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
            <Play size={32} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity style={styles.controlButton} onPress={stopTimer}>
              <Square size={24} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playButton, styles.pauseButton]}
              onPress={timerState === 'running' ? pauseTimer : startTimer}
            >
              {timerState === 'running' ? (
                <Pause size={32} color="white" />
              ) : (
                <Play size={32} color="white" />
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

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
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
        </SafeAreaView>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={showStats}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
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
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 10,
    borderColor: '#4F46E5',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sessionTypeText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  courseSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  courseList: {
    flexDirection: 'row',
  },
  courseChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  courseChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  courseChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  courseChipTextActive: {
    color: 'white',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeOptionActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: 'white',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  bigStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bigStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  bigStatLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  recentSessions: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionCourse: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});