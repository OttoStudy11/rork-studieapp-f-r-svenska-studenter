import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { GraduationCap, Target, Users, BookOpen, MapPin, Calculator, Zap, Globe, Palette, Building, Heart, Car, ShoppingBag, Scissors, Coffee, Factory, Leaf, ChefHat, Home, Stethoscope, Wrench } from 'lucide-react-native';
import GymnasiumAndProgramPicker from '@/components/GymnasiumAndProgramPicker';
import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import { getGymnasiumCourses, type GymnasiumCourse } from '@/constants/gymnasium-courses';

interface OnboardingData {
  name: string;
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
  const { user } = useAuth();
  const { completeOnboarding } = useStudy();
  const { showError } = useToast();
  
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: user?.email?.split('@')[0] || '',
    studyLevel: '',
    gymnasium: null,
    gymnasiumProgram: null,
    gymnasiumGrade: null,
    program: '',
    goals: [],
    purpose: [],
    selectedCourses: new Set()
  });
  
  const [availableCourses, setAvailableCourses] = useState<GymnasiumCourse[]>([]);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (data.studyLevel && data.name) {
      try {
        console.log('Completing onboarding with data:', data);
        const finalName = data.name || user?.email?.split('@')[0] || '';
        const programName = data.gymnasiumProgram ? 
          `${data.gymnasiumProgram.name} - År ${data.gymnasiumGrade}` : 
          data.program || 'Ej valt';
        
        await completeOnboarding({
          name: finalName,
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
      case 0: return data.name.length > 0;
      case 1: return data.studyLevel !== '';
      case 2: return data.studyLevel !== 'gymnasie' || (data.gymnasium !== null && data.gymnasiumProgram !== null);
      case 3: return true; // Make goals optional
      case 4: return true; // Make purpose optional
      case 5: return data.studyLevel !== 'gymnasie' || data.selectedCourses.size > 0; // Require course selection for gymnasium
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
            <Text style={styles.subtitle}>Låt oss anpassa StudieStugan för dig</Text>
            <TextInput
              style={styles.input}
              placeholder="Ange ditt namn"
              value={data.name}
              onChangeText={(text) => setData({ ...data, name: text })}
              autoFocus
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vad studerar du?</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
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
              </TouchableOpacity>
              <TouchableOpacity
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
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            {data.studyLevel === 'gymnasie' ? (
              <>
                <MapPin size={80} color="#4F46E5" style={styles.icon} />
                <Text style={styles.title}>Välj gymnasium och program</Text>
                <Text style={styles.subtitle}>Välj ditt gymnasium, årskurs och program</Text>
                <View style={styles.gymnasiumPickerContainer}>
                  <GymnasiumAndProgramPicker
                    selectedGymnasium={data.gymnasium}
                    selectedProgram={data.gymnasiumProgram}
                    selectedGrade={data.gymnasiumGrade}
                    onSelect={(gymnasium, program, grade) => {
                      setData({ ...data, gymnasium, gymnasiumProgram: program, gymnasiumGrade: grade });
                      
                      // Update available courses when selection changes
                      if (gymnasium && program && grade) {
                        const courses = getGymnasiumCourses(gymnasium, program, grade);
                        setAvailableCourses(courses);
                        // Auto-select all mandatory courses
                        const mandatoryCourseIds = courses
                          .filter((course: GymnasiumCourse) => course.mandatory)
                          .map((course: GymnasiumCourse) => course.id);
                        setData((prev: OnboardingData) => ({ 
                          ...prev, 
                          gymnasium, 
                          gymnasiumProgram: program, 
                          gymnasiumGrade: grade,
                          selectedCourses: new Set(mandatoryCourseIds)
                        }));
                      } else {
                        setAvailableCourses([]);
                        setData((prev: OnboardingData) => ({ ...prev, selectedCourses: new Set() }));
                      }
                    }}
                    placeholder="Välj gymnasium, årskurs och program"
                  />
                </View>
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
                <TouchableOpacity
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
                </TouchableOpacity>
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
                <TouchableOpacity
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
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        if (data.studyLevel !== 'gymnasie') {
          // Skip course selection for university students
          handleComplete();
          return null;
        }
        
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Välj dina kurser</Text>
            <Text style={styles.subtitle}>
              {data.gymnasiumProgram?.name} - År {data.gymnasiumGrade}
            </Text>
            <ScrollView style={styles.coursesScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.coursesContainer}>
                {/* Group courses by category */}
                {['gymnasiegemensam', 'programgemensam', 'inriktning', 'programfördjupning', 'individuellt val'].map(category => {
                  const coursesInCategory = availableCourses.filter(course => course.category === category);
                  if (coursesInCategory.length === 0) return null;
                  
                  const getCategoryTitle = (cat: string) => {
                    switch (cat) {
                      case 'gymnasiegemensam': return 'Gymnasiegemensamma ämnen';
                      case 'programgemensam': return 'Programgemensamma ämnen';
                      case 'inriktning': return 'Inriktningsämnen';
                      case 'programfördjupning': return 'Programfördjupning';
                      case 'individuellt val': return 'Individuellt val';
                      default: return cat;
                    }
                  };
                  
                  const getCategoryColor = (cat: string) => {
                    switch (cat) {
                      case 'gymnasiegemensam': return '#3B82F6';
                      case 'programgemensam': return '#10B981';
                      case 'inriktning': return '#F59E0B';
                      case 'programfördjupning': return '#8B5CF6';
                      case 'individuellt val': return '#6B7280';
                      default: return '#6B7280';
                    }
                  };
                  
                  const getCourseIcon = (courseCode: string) => {
                    const prefix = courseCode.substring(0, 3).toUpperCase();
                    const iconMap: Record<string, any> = {
                      'MAT': Calculator,
                      'FYS': Zap,
                      'KEM': Zap,
                      'BIO': Leaf,
                      'ENG': Globe,
                      'SVE': BookOpen,
                      'HIS': BookOpen,
                      'SAM': Users,
                      'REL': BookOpen,
                      'IDR': Heart,
                      'NAK': Leaf,
                      'FÖR': Building,
                      'JUR': Building,
                      'PSK': Users,
                      'FIL': BookOpen,
                      'EST': Palette,
                      'MUS': Palette,
                      'BIL': Palette,
                      'DAN': Palette,
                      'TEA': Palette,
                      'TEK': Zap,
                      'PRR': Zap,
                      'WEB': Zap,
                      'DAT': Zap,
                      'ELE': Zap,
                      'VVS': Wrench,
                      'BYG': Home,
                      'FOR': Car,
                      'HAN': ShoppingBag,
                      'HTV': Scissors,
                      'HOT': Coffee,
                      'IND': Factory,
                      'NAT': Leaf,
                      'RES': ChefHat,
                      'VÅR': Stethoscope,
                    };
                    return iconMap[prefix] || BookOpen;
                  };
                  
                  return (
                    <View key={category} style={styles.categorySection}>
                      <View style={[styles.categoryHeader, { backgroundColor: getCategoryColor(category) + '20' }]}>
                        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                        <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>
                          {getCategoryTitle(category)}
                        </Text>
                      </View>
                      
                      <View style={styles.coursesGrid}>
                        {coursesInCategory.map((course) => {
                          const isSelected = data.selectedCourses.has(course.id);
                          const isMandatory = course.mandatory;
                          const IconComponent = getCourseIcon(course.code);
                          const categoryColor = getCategoryColor(category);
                          
                          return (
                            <TouchableOpacity
                              key={course.id}
                              style={[
                                styles.courseCard,
                                isSelected && styles.selectedCourseCard,
                                isMandatory && styles.mandatoryCourseCard,
                                { borderColor: isSelected ? categoryColor : '#E5E7EB' }
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
                              <View style={[styles.courseIconContainer, { backgroundColor: categoryColor + '20' }]}>
                                <IconComponent size={20} color={categoryColor} />
                              </View>
                              
                              <Text style={[
                                styles.courseCardName,
                                isSelected && { color: categoryColor }
                              ]} numberOfLines={2}>
                                {course.name}
                              </Text>
                              
                              <View style={styles.courseCardFooter}>
                                <Text style={[
                                  styles.courseCardPoints,
                                  isSelected && { color: categoryColor }
                                ]}>
                                  {course.points}p
                                </Text>
                                <Text style={styles.courseCardYear}>
                                  År {course.year}
                                </Text>
                              </View>
                              
                              {isMandatory && (
                                <View style={[styles.mandatoryBadge, { backgroundColor: categoryColor }]}>
                                  <Text style={styles.mandatoryText}>Obligatorisk</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
                
                {availableCourses.length === 0 && (
                  <View style={styles.noCoursesContainer}>
                    <Text style={styles.noCoursesText}>
                      Välj gymnasium och program för att se tillgängliga kurser
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.coursesSummary}>
              <Text style={styles.summaryText}>
                {data.selectedCourses.size} kurser valda • {' '}
                {availableCourses
                  .filter(c => data.selectedCourses.has(c.id))
                  .reduce((sum, c) => sum + c.points, 0)} poäng
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

          {renderStep()}

          <View style={styles.buttonContainer}>
            {step > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Tillbaka</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {step === (data.studyLevel === 'gymnasie' ? 5 : 4) ? 'Slutför' : 'Nästa'}
              </Text>
            </TouchableOpacity>
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
  coursesScrollView: {
    maxHeight: 400,
    width: '100%',
    marginVertical: 20,
  },
  coursesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  selectedCourseCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  mandatoryCourseCard: {
    opacity: 0.8,
  },
  courseIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  courseCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    minHeight: 32,
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseCardPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  courseCardYear: {
    fontSize: 11,
    color: '#6B7280',
  },
  mandatoryBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mandatoryText: {
    fontSize: 8,
    fontWeight: '600',
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
});