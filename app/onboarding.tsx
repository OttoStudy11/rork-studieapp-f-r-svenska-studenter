import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Target, Users, BookOpen, MapPin } from 'lucide-react-native';
import { AnimatedPressable, PressableCard, RippleButton, FadeInView } from '@/components/Animations';
import GymnasiumAndProgramPicker from '@/components/GymnasiumAndProgramPicker';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';
import { GYMNASIUM_PROGRAMS } from '@/constants/gymnasium-programs';

interface OnboardingData {
  username: string;
  displayName: string;
  studyLevel: 'gymnasie' | 'högskola' | '';
  gymnasium: Gymnasium | null;
  gymnasiumProgram: GymnasiumProgram | null;
  gymnasiumGrade: GymnasiumGrade | null;
  program: string;
  goals: string[];
  purpose: string[];
  selectedCourses: Set<string>;
}

const goalOptions = [
  'Bättre planering',
  'Högre betyg',
  'Minska stress',
  'Balans fritid/studier',
  'Bättre fokus',
  'Motivation'
];

const purposeOptions = [
  'Fokus & koncentration',
  'Motivation & disciplin',
  'Studera med vänner',
  'Studietips & tekniker',
  'Spåra framsteg',
  'Organisera material'
];



export default function OnboardingScreen() {
  const authContext = useAuth();
  const studyContext = useStudy();
  const toastContext = useToast();
  
  // Initialize hooks first
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    username: '',
    displayName: '',
    studyLevel: '',
    gymnasium: null,
    gymnasiumProgram: null,
    gymnasiumGrade: null,
    program: '',
    goals: [],
    purpose: [],
    selectedCourses: new Set()
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);
  
  // Safety checks for contexts
  if (!authContext || !studyContext || !toastContext) {
    console.error('OnboardingScreen: Required contexts are not available');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Update data with user info when available
  useEffect(() => {
    if (authContext?.user?.email && !data.displayName) {
      const emailPrefix = authContext.user!.email.split('@')[0] || '';
      setData(prev => ({
        ...prev,
        displayName: emailPrefix,
        username: emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      }));
    }
  }, [authContext.user?.email, data.displayName]);

  useEffect(() => {
    if (data.gymnasiumProgram && step === 5) {
      console.log('Loading courses for program:', data.gymnasiumProgram.name);
      const defaultGymnasium: Gymnasium = { 
        id: 'default', 
        name: 'Gymnasie', 
        type: 'kommunal', 
        city: '', 
        municipality: '' 
      };
      const courses = getGymnasiumCourses(
        defaultGymnasium,
        data.gymnasiumProgram,
        undefined
      );
      console.log('Available courses:', courses.length, courses.map(c => c.name));
      setAvailableCourses(courses);
      
      const mandatoryCourseIds = courses
        .filter((course: GymnasiumCourse) => course.mandatory)
        .map((course: GymnasiumCourse) => course.id);
      setData((prev: OnboardingData) => ({ 
        ...prev,
        selectedCourses: new Set(mandatoryCourseIds)
      }));
    }
  }, [data.gymnasiumProgram, step]);
  
  const { user } = authContext;
  const { completeOnboarding } = studyContext;
  const { showError } = toastContext;
  
  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    // Validate format
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(false);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data: result, error } = await supabase.rpc('check_username_available', {
        username_to_check: username
      });
      
      if (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(result);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };
  
  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.username) {
        checkUsernameAvailability(data.username);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data.username]);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (data.studyLevel && data.displayName && data.username && usernameAvailable) {
      try {
        console.log('Completing onboarding with data:', data);
        const programName = data.gymnasiumProgram ? 
          `${data.gymnasiumProgram.name} - År ${data.gymnasiumGrade}` : 
          data.program || 'Ej valt';
        
        await completeOnboarding({
          name: data.displayName,
          username: data.username,
          displayName: data.displayName,
          email: user?.email || '',
          studyLevel: data.studyLevel as 'gymnasie' | 'högskola',
          program: programName,
          purpose: [...data.goals, ...data.purpose].join(', ') || 'Allmän studiehjälp',
          subscriptionType: 'free',
          gymnasium: data.gymnasium,
          avatar: { emoji: '😊' },
          selectedCourses: Array.from(data.selectedCourses)
        });
        console.log('Onboarding completed successfully');
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Onboarding error:', error);
        showError('Något gick fel. Försök igen.');
      }
    }
  };

  const toggleSelection = (array: string[], item: string, key: 'goals' | 'purpose') => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setData({ ...data, [key]: newArray });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.username.length >= 3 && data.displayName.length > 0 && usernameAvailable === true;
      case 1: return data.studyLevel !== '';
      case 2: return data.studyLevel !== 'gymnasie' || data.gymnasiumProgram !== null;
      case 3: return true;
      case 4: return true;
      case 5: return data.studyLevel !== 'gymnasie' || data.selectedCourses.size > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <GraduationCap size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Hej {user?.email?.split('@')[0] || 'där'}!</Text>
            <Text style={styles.subtitle}>Skapa ditt användarnamn och visningsnamn</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Användarnamn (för att lägga till vänner)</Text>
              <View style={styles.usernameInputContainer}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="användarnamn"
                  value={data.username}
                  onChangeText={(text) => {
                    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setData({ ...data, username: cleanText });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>
              {checkingUsername && (
                <Text style={styles.inputHint}>Kontrollerar tillgänglighet...</Text>
              )}
              {usernameAvailable === false && (
                <Text style={[styles.inputHint, { color: '#EF4444' }]}>Användarnamnet är inte tillgängligt eller ogiltigt</Text>
              )}
              {usernameAvailable === true && (
                <Text style={[styles.inputHint, { color: '#10B981' }]}>✓ Användarnamnet är tillgängligt</Text>
              )}
              <Text style={styles.inputHint}>
                3-20 tecken, endast bokstäver, siffror och _
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Visningsnamn (för- och efternamn)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ditt för- och efternamn"
                value={data.displayName}
                onChangeText={(text) => setData({ ...data, displayName: text })}
                maxLength={50}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vad studerar du?</Text>
            <View style={styles.optionsContainer}>
              <AnimatedPressable
                style={[
                  styles.optionButton,
                  data.studyLevel === 'gymnasie' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'gymnasie' && styles.selectedOptionText
                ]}>
                  Gymnasie
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[
                  styles.optionButton,
                  data.studyLevel === 'högskola' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'högskola' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'högskola' && styles.selectedOptionText
                ]}>
                  Högskola/Universitet
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            {data.studyLevel === 'gymnasie' ? (
              <>
                <MapPin size={60} color="#4F46E5" style={styles.icon} />
                <Text style={styles.title}>Välj program</Text>
                <Text style={styles.subtitle}>Välj ditt gymnasieprogram</Text>
                <ScrollView style={styles.programScrollView} showsVerticalScrollIndicator={false}>
                  <View style={styles.programGrid}>
                    {GYMNASIUM_PROGRAMS.map((program) => {
                      const isSelected = data.gymnasiumProgram?.id === program.id;
                      
                      return (
                        <AnimatedPressable
                          key={program.id}
                          style={[
                            styles.programCard,
                            isSelected && styles.selectedProgramCard
                          ]}
                          onPress={() => {
                            console.log('Selected program:', program.name);
                            setData({ ...data, gymnasiumProgram: program });
                          }}
                        >
                          <Text style={[
                            styles.programCardText,
                            isSelected && styles.selectedProgramCardText
                          ]} numberOfLines={1}>
                            {program.name}
                          </Text>
                        </AnimatedPressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  Nästan klar!
                </Text>
                <Text style={styles.subtitle}>
                  Vi kommer att hjälpa dig välja program och kurser i nästa steg
                </Text>
              </>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Target size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vilka är dina mål?</Text>
            <Text style={styles.subtitle}>Välj alla som passar dig</Text>
            <View style={styles.multiSelectContainer}>
              {goalOptions.map((goal) => (
                <AnimatedPressable
                  key={goal}
                  style={[
                    styles.multiSelectOption,
                    data.goals.includes(goal) && styles.selectedMultiOption
                  ]}
                  onPress={() => toggleSelection(data.goals, goal, 'goals')}
                >
                  <Text style={[
                    styles.multiSelectText,
                    data.goals.includes(goal) && styles.selectedMultiText
                  ]}>
                    {goal}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Users size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vad vill du fokusera på?</Text>
            <Text style={styles.subtitle}>Välj dina huvudintressen</Text>
            <View style={styles.multiSelectContainer}>
              {purposeOptions.map((purpose) => (
                <AnimatedPressable
                  key={purpose}
                  style={[
                    styles.multiSelectOption,
                    data.purpose.includes(purpose) && styles.selectedMultiOption
                  ]}
                  onPress={() => toggleSelection(data.purpose, purpose, 'purpose')}
                >
                  <Text style={[
                    styles.multiSelectText,
                    data.purpose.includes(purpose) && styles.selectedMultiText
                  ]}>
                    {purpose}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        );

      case 5:
        if (data.studyLevel !== 'gymnasie') {
          handleComplete();
          return null;
        }
        
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={60} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Välj dina kurser</Text>
            <Text style={styles.subtitle}>
              {data.gymnasiumProgram?.name}
            </Text>
            <ScrollView style={styles.coursesScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.coursesContainer}>
                {availableCourses.map((course) => {
                  const isSelected = data.selectedCourses.has(course.id);
                  const isMandatory = course.mandatory;
                  
                  return (
                    <AnimatedPressable
                      key={course.id}
                      style={[
                        styles.courseCardLarge,
                        isSelected && styles.selectedCourseCardLarge,
                        isMandatory && styles.mandatoryCourseCardLarge
                      ]}
                      onPress={() => {
                        if (isMandatory) return;
                        
                        const newSelectedCourses = new Set(data.selectedCourses);
                        if (isSelected) {
                          newSelectedCourses.delete(course.id);
                        } else {
                          newSelectedCourses.add(course.id);
                        }
                        setData({ ...data, selectedCourses: newSelectedCourses });
                      }}
                      disabled={isMandatory}
                    >
                      <Text style={[
                        styles.courseCardLargeText,
                        isSelected && styles.selectedCourseCardLargeText
                      ]} numberOfLines={1}>
                        {course.name}
                      </Text>
                      {isMandatory && (
                        <View style={styles.mandatoryBadgeLarge}>
                          <Text style={styles.mandatoryTextLarge}>Obligatorisk</Text>
                        </View>
                      )}
                    </AnimatedPressable>
                  );
                })}
                
                {availableCourses.length === 0 && (
                  <View style={styles.noCoursesContainer}>
                    <Text style={styles.noCoursesText}>
                      Välj program för att se tillgängliga kurser
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.coursesSummary}>
              <Text style={styles.summaryText}>
                {data.selectedCourses.size} kurser valda
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((step + 1) / (data.studyLevel === 'gymnasie' ? 6 : 5)) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{step + 1} av {data.studyLevel === 'gymnasie' ? '6' : '5'}</Text>
          </View>

          <FadeInView key={step} duration={300}>
            {renderStep()}
          </FadeInView>

          <View style={styles.buttonContainer}>
            {step > 0 && (
              <AnimatedPressable
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Tillbaka</Text>
              </AnimatedPressable>
            )}
            
            <RippleButton
              style={[
                styles.nextButton,
                !canProceed() && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
              rippleColor="#4F46E5"
              rippleOpacity={0.2}
            >
              <Text style={styles.nextButtonText}>
                {step === (data.studyLevel === 'gymnasie' ? 5 : 4) ? 'Slutför' : 'Nästa'}
              </Text>
            </RippleButton>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'white',
    borderColor: '#4F46E5',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#4F46E5',
  },
  multiSelectContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  multiSelectOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedMultiOption: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  multiSelectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMultiText: {
    color: '#4F46E5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  inputHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gymnasiumPickerContainer: {
    width: '100%',
    marginTop: 20,
  },
  programScrollView: {
    maxHeight: 450,
    width: '100%',
    marginVertical: 20,
  },
  programGrid: {
    gap: 12,
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedProgramCard: {
    backgroundColor: 'white',
    borderColor: '#4F46E5',
  },
  programCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedProgramCardText: {
    color: '#4F46E5',
  },
  coursesScrollView: {
    maxHeight: 450,
    width: '100%',
    marginVertical: 20,
  },
  coursesContainer: {
    gap: 12,
  },
  courseCardLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedCourseCardLarge: {
    backgroundColor: 'white',
    borderColor: '#4F46E5',
  },
  mandatoryCourseCardLarge: {
    opacity: 0.7,
  },
  courseCardLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedCourseCardLargeText: {
    color: '#4F46E5',
  },
  mandatoryBadgeLarge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mandatoryTextLarge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },
  noCoursesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noCoursesText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  coursesSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
});