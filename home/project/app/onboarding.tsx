import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCourses } from '@/contexts/CourseContext';
import { ChevronRight, School, BookOpen, User, GraduationCap } from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS, searchGymnasiums } from '@/constants/gymnasiums';
import { GYMNASIUM_PROGRAMS, GYMNASIUM_PROGRAM_MAPPING } from '@/constants/gymnasium-programs';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';

export default function Onboarding() {
  const router = useRouter();
  const { updateUserProfile, completeOnboarding } = useCourses();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gymnasium, setGymnasium] = useState('');
  const [program, setProgram] = useState('');
  const [year, setYear] = useState<1 | 2 | 3>(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGymnasiums = searchQuery 
    ? searchGymnasiums(searchQuery)
    : SWEDISH_GYMNASIUMS;


  const programIds = gymnasium ? GYMNASIUM_PROGRAM_MAPPING[gymnasium] || [] : [];
  const availablePrograms = programIds.length > 0 
    ? GYMNASIUM_PROGRAMS.filter(p => programIds.includes(p.id))
    : GYMNASIUM_PROGRAMS;
  
  const availableCourses = program ? getCoursesForProgramAndYear(program, year) : [];
  const mandatoryCourses = availableCourses.filter(course => course.mandatory);
  const electiveCourses = availableCourses.filter(course => !course.mandatory);

  const handleComplete = async () => {
    console.log('Completing onboarding with data:', {
      name,
      gymnasium,
      program,
      year,
      selectedCourses: selectedCourses.length
    });
    
    await updateUserProfile({
      name,
      gymnasium,
      program,
      year,
      selectedCourses,
    } as any);
    
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const toggleCourse = (courseCode: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseCode) 
        ? prev.filter(code => code !== courseCode)
        : [...prev, courseCode]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <User size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välkommen till StudieStugan!</Text>
            <Text style={styles.subtitle}>Vad heter du?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ditt namn"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, !name && styles.buttonDisabled]}
              onPress={() => name && setStep(2)}
              disabled={!name}
            >
              <Text style={styles.buttonText}>Fortsätt</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <School size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj ditt gymnasium</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Sök gymnasium..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {filteredGymnasiums.map((gym) => (
                <TouchableOpacity
                  key={gym.id}
                  style={[styles.listItem, gymnasium === gym.id && styles.listItemSelected]}
                  onPress={() => {
                    setGymnasium(gym.id);
                    setStep(3);
                  }}
                >
                  <View>
                    <Text style={[styles.listItemText, gymnasium === gym.id && styles.listItemTextSelected]}>
                      {gym.name}
                    </Text>
                    <Text style={[styles.listItemSubtext, gymnasium === gym.id && styles.listItemTextSelected]}>
                      {gym.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj program och årskurs</Text>
            
            <View style={styles.programSelectionContainer}>
              <Text style={styles.sectionTitle}>Program</Text>
              <ScrollView style={styles.programList} showsVerticalScrollIndicator={false}>
                {availablePrograms.map((prog) => (
                  <TouchableOpacity
                    key={prog.id}
                    style={[styles.programItem, program === prog.id && styles.programItemSelected]}
                    onPress={() => setProgram(prog.id)}
                  >
                    <View style={styles.programContent}>
                      <Text style={[styles.programName, program === prog.id && styles.programNameSelected]}>
                        {prog.name}
                      </Text>
                      <Text style={[styles.programCategory, program === prog.id && styles.programCategorySelected]}>
                        {prog.category === 'högskoleförberedande' ? 'Högskoleförberedande' : 'Yrkesprogram'}
                      </Text>
                    </View>
                    {program === prog.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {program && (
              <View style={styles.yearSelectionContainer}>
                <Text style={styles.sectionTitle}>Årskurs</Text>
                <View style={styles.yearGrid}>
                  {[1, 2, 3].map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearCard, year === y && styles.yearCardSelected]}
                      onPress={() => setYear(y as 1 | 2 | 3)}
                    >
                      <Text style={[styles.yearNumber, year === y && styles.yearNumberSelected]}>
                        {y}
                      </Text>
                      <Text style={[styles.yearLabel, year === y && styles.yearLabelSelected]}>
                        År {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, (!program || !year) && styles.buttonDisabled]}
              onPress={() => program && year && setStep(4)}
              disabled={!program || !year}
            >
              <Text style={styles.buttonText}>Välj kurser</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <GraduationCap size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj dina kurser</Text>
            <View style={styles.programSummary}>
              <Text style={styles.programSummaryText}>År {year} - {GYMNASIUM_PROGRAMS.find(p => p.id === program)?.name}</Text>
            </View>
            
            <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
              {mandatoryCourses.length > 0 && (
                <View style={styles.coursesSection}>
                  <View style={styles.courseSectionHeader}>
                    <Text style={styles.courseCategoryTitle}>Obligatoriska kurser</Text>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{mandatoryCourses.length}</Text>
                    </View>
                  </View>
                  <View style={styles.coursesGrid}>
                    {mandatoryCourses.map((course) => (
                      <View key={course.code} style={styles.mandatoryCourseCard}>
                        <View style={styles.courseCardHeader}>
                          <Text style={styles.courseCardName}>{course.name}</Text>
                          <View style={styles.mandatoryIndicator}>
                            <Text style={styles.mandatoryIndicatorText}>✓</Text>
                          </View>
                        </View>
                        <Text style={styles.courseCardDetails}>
                          {course.code} • {course.points}p
                        </Text>
                        <Text style={styles.courseCardCategory}>{course.category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {electiveCourses.length > 0 && (
                <View style={styles.coursesSection}>
                  <View style={styles.courseSectionHeader}>
                    <Text style={styles.courseCategoryTitle}>Valbara kurser</Text>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{selectedCourses.length}/{electiveCourses.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.electiveSubtitle}>Välj de kurser du är intresserad av</Text>
                  <View style={styles.coursesGrid}>
                    {electiveCourses.map((course) => (
                      <TouchableOpacity
                        key={course.code}
                        style={[
                          styles.electiveCourseCard,
                          selectedCourses.includes(course.code) && styles.selectedCourseCard
                        ]}
                        onPress={() => toggleCourse(course.code)}
                      >
                        <View style={styles.courseCardHeader}>
                          <Text style={[
                            styles.courseCardName,
                            selectedCourses.includes(course.code) && styles.selectedCourseCardName
                          ]}>
                            {course.name}
                          </Text>
                          <View style={[
                            styles.selectionCircle,
                            selectedCourses.includes(course.code) && styles.selectedCircle
                          ]}>
                            {selectedCourses.includes(course.code) && (
                              <Text style={styles.selectedCircleText}>✓</Text>
                            )}
                          </View>
                        </View>
                        <Text style={[
                          styles.courseCardDetails,
                          selectedCourses.includes(course.code) && styles.selectedCourseCardDetails
                        ]}>
                          {course.code} • {course.points}p
                        </Text>
                        <Text style={[
                          styles.courseCardCategory,
                          selectedCourses.includes(course.code) && styles.selectedCourseCardCategory
                        ]}>
                          {course.category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Kom igång!</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[styles.progressDot, s <= step && styles.progressDotActive]}
          />
        ))}
      </View>
      {renderStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
    backgroundColor: '#f8f9fa',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#4ECDC4',
    width: 30,
  },
  stepContainer: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listItemSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
  },
  listItemTextSelected: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  listItemSubtext: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  programSelectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  programList: {
    flex: 1,
  },
  programItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  programItemSelected: {
    backgroundColor: '#f0fffe',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.15,
  },
  programContent: {
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  programNameSelected: {
    color: '#2d7a73',
  },
  programCategory: {
    fontSize: 14,
    color: '#666',
  },
  programCategorySelected: {
    color: '#4ECDC4',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  yearSelectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  yearGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  yearCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  yearCardSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
  },
  yearNumber: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  yearNumberSelected: {
    color: '#fff',
  },
  yearLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  yearLabelSelected: {
    color: '#fff',
  },
  programSummary: {
    backgroundColor: '#f0fffe',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  programSummaryText: {
    fontSize: 16,
    color: '#2d7a73',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  coursesSection: {
    marginBottom: 32,
  },
  courseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseBadge: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  courseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  coursesGrid: {
    gap: 12,
  },
  mandatoryCourseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e8f4f8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  electiveCourseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedCourseCard: {
    backgroundColor: '#f0fffe',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.15,
  },
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  selectedCourseCardName: {
    color: '#2d7a73',
  },
  courseCardDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedCourseCardDetails: {
    color: '#4ECDC4',
  },
  courseCardCategory: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500' as const,
  },
  selectedCourseCardCategory: {
    color: '#4ECDC4',
  },
  mandatoryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandatoryIndicatorText: {
    color: '#2d7a73',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  selectedCircleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 30,
    marginHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
    marginRight: 5,
  },
  coursesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  courseCategoryTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  electiveSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  courseItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  electiveCourse: {
    borderColor: '#e0e0e0',
  },
  selectedCourse: {
    backgroundColor: '#f0fffe',
    borderColor: '#4ECDC4',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectedCourseName: {
    color: '#2d7a73',
  },
  courseDetails: {
    fontSize: 14,
    color: '#666',
  },
  selectedCourseDetails: {
    color: '#4ECDC4',
  },
  mandatoryBadge: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mandatoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#2d7a73',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedIndicator: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
});