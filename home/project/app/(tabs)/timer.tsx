import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Platform, ScrollView, Alert } from 'react-native';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Crown, Lock, Settings } from 'lucide-react-native';
import { useCourses } from '@/contexts/CourseContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

export default function Timer() {
  const { courses, logStudyTime } = useCourses();
  const { isPremium, limits } = usePremium();
  const { addStudySession, userProgress, todayStats } = useProgress();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'custom' | 'stopwatch'>('pomodoro');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const WORK_TIME = 25;
  const SHORT_BREAK = 5;
  const LONG_BREAK = 15;

  const canUseAdvancedTimers = isPremium; // For now, all advanced features require premium
  const canCustomizeTimer = isPremium;

  const handleTimerModeChange = (mode: 'pomodoro' | 'custom' | 'stopwatch') => {
    if (mode !== 'pomodoro' && !canUseAdvancedTimers) {
      Alert.alert(
        'Premium krävs',
        'Avancerade timers är endast tillgängliga för Premium-användare.',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Uppgradera', onPress: () => router.push('/premium') }
        ]
      );
      return;
    }
    setTimerMode(mode);
    resetTimer();
  };

  const handleCustomizeTimer = () => {
    if (!canCustomizeTimer) {
      Alert.alert(
        'Premium krävs',
        'Anpassning av timer-inställningar kräver Premium.',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Uppgradera', onPress: () => router.push('/premium') }
        ]
      );
      return;
    }
    // Handle timer customization
    console.log('Timer customization would go here');
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            if (minutes === 0) {
              handleTimerComplete();
              return 0;
            }
            setMinutes((m) => m - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 200, 100, 200]);
    }

    if (!isBreak && selectedCourse) {
      const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
      
      // Log to courses context
      await logStudyTime(selectedCourse, elapsedMinutes / 60);
      
      // Log to progress context
      const currentCourse = courses.find(c => c.id === selectedCourse);
      await addStudySession({
        courseId: selectedCourse,
        courseName: currentCourse?.name || 'Okänd kurs',
        duration: elapsedMinutes,
        date: new Date(),
        technique: timerMode,
        completed: true,
        notes: `${timerMode} session - ${Math.round(elapsedMinutes)} minuter`
      });
      
      setSessionsCompleted((prev) => prev + 1);
    }

    if (!isBreak) {
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % 4 === 0) {
        setMinutes(LONG_BREAK);
        setIsBreak(true);
      } else {
        setMinutes(SHORT_BREAK);
        setIsBreak(true);
      }
    } else {
      setMinutes(WORK_TIME);
      setIsBreak(false);
    }
    setSeconds(0);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(WORK_TIME);
    setSeconds(0);
    setIsBreak(false);
  };

  const skipBreak = () => {
    if (isBreak) {
      setIsRunning(false);
      setMinutes(WORK_TIME);
      setSeconds(0);
      setIsBreak(false);
    }
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const progress = currentCourse ? (currentCourse.studiedHours / currentCourse.totalHours) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {isBreak ? 'Paus' : 'Fokusläge'}
          </Text>
          {isPremium && <Crown size={24} color="#FFD700" />}
        </View>
        
        {/* Timer Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeButton, timerMode === 'pomodoro' && styles.modeButtonActive]}
            onPress={() => handleTimerModeChange('pomodoro')}
          >
            <Text style={[styles.modeButtonText, timerMode === 'pomodoro' && styles.modeButtonTextActive]}>
              Pomodoro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, timerMode === 'custom' && styles.modeButtonActive, !canUseAdvancedTimers && styles.modeButtonDisabled]}
            onPress={() => handleTimerModeChange('custom')}
          >
            {!canUseAdvancedTimers && <Lock size={14} color="#95a5a6" />}
            <Text style={[styles.modeButtonText, timerMode === 'custom' && styles.modeButtonTextActive, !canUseAdvancedTimers && styles.modeButtonTextDisabled]}>
              Anpassad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, timerMode === 'stopwatch' && styles.modeButtonActive, !canUseAdvancedTimers && styles.modeButtonDisabled]}
            onPress={() => handleTimerModeChange('stopwatch')}
          >
            {!canUseAdvancedTimers && <Lock size={14} color="#95a5a6" />}
            <Text style={[styles.modeButtonText, timerMode === 'stopwatch' && styles.modeButtonTextActive, !canUseAdvancedTimers && styles.modeButtonTextDisabled]}>
              Stoppur
            </Text>
          </TouchableOpacity>
        </View>

        {!isBreak && (
          <View style={styles.courseSelector}>
            <BookOpen size={20} color="#4ECDC4" />
            <Picker
              selectedValue={selectedCourse}
              onValueChange={setSelectedCourse}
              style={styles.picker}
            >
              {courses.map((course) => (
                <Picker.Item 
                  key={course.id} 
                  label={course.name} 
                  value={course.id}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <View style={styles.timerContainer}>
        <View style={[styles.timerCircle, isBreak && styles.breakCircle]}>
          <Text style={styles.timerText}>
            {formatTime(minutes, seconds)}
          </Text>
          <Text style={styles.timerLabel}>
            {isBreak ? 'Vila och återhämta dig' : currentCourse?.name}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={resetTimer}
        >
          <RotateCcw size={24} color="#7f8c8d" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryButton, isRunning && styles.pauseButton]}
          onPress={toggleTimer}
        >
          {isRunning ? (
            <Pause size={32} color="#fff" />
          ) : (
            <Play size={32} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, (!isBreak || !canCustomizeTimer) && styles.disabledButton]}
          onPress={isBreak ? skipBreak : handleCustomizeTimer}
          disabled={!isBreak && !canCustomizeTimer}
        >
          {isBreak ? (
            <Coffee size={24} color="#7f8c8d" />
          ) : canCustomizeTimer ? (
            <Settings size={24} color="#7f8c8d" />
          ) : (
            <Lock size={24} color="#d0d0d0" />
          )}
        </TouchableOpacity>
      </View>

      {currentCourse && !isBreak && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dagens sessioner</Text>
            <Text style={styles.statValue}>{todayStats.sessionsCompleted}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dagens tid</Text>
            <Text style={styles.statValue}>
              {Math.round(todayStats.totalMinutes)}min
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{userProgress.currentStreak} dagar</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>Lvl {userProgress.level}</Text>
          </View>
        </View>
      )}

      <View style={styles.techniqueCard}>
        <View style={styles.techniqueHeader}>
          <Text style={styles.techniqueTitle}>
            {timerMode === 'pomodoro' ? 'Pomodoro-tekniken' : 
             timerMode === 'custom' ? 'Anpassad Timer' : 'Stoppur-läge'}
          </Text>
          {!isPremium && timerMode !== 'pomodoro' && (
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/premium')}
            >
              <Crown size={16} color="#FFFFFF" />
              <Text style={styles.upgradeButtonText}>Premium</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.techniqueDescription}>
          {timerMode === 'pomodoro' ? 
            '25 minuter fokuserat arbete följt av 5 minuters paus. Efter 4 sessioner, ta en längre paus på 15 minuter.' :
           timerMode === 'custom' ? 
            'Skapa dina egna timer-inställningar och anpassa längden på arbets- och pausperioder.' :
            'Använd stoppur för flexibel tidstagning av dina studiesessioner.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  modeButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  modeButtonTextDisabled: {
    color: '#95a5a6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 15,
  },
  courseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  breakCircle: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300' as const,
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 40,
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  pauseButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  techniqueCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 10,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});