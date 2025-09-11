import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCourses } from '@/contexts/CourseContext';
import { ChevronRight, School, BookOpen, User, GraduationCap, MapPin, Award } from 'lucide-react-native';
import { getCoursesForProgramAndYear } from '@/constants/gymnasium-courses';

// Temporary hardcoded data for testing
const gymnasiums = [
  'Kungsholmens gymnasium',
  'Norra Real',
  'Södra Latin',
  'Östra Real',
  'Viktor Rydberg gymnasium',
  'Hvitfeldtska gymnasiet',
  'Katrinelundsgymnasiet',
  'Malmö Borgarskola',
  'Malmö latinskola',
  'Katedralskolan',
  'Lundellska skolan',
  'Berzeliusskolan',
  'Folkungaskolan'
];

const allPrograms = [
  'Naturvetenskapsprogrammet',
  'Teknikprogrammet', 
  'Samhällsvetenskapsprogrammet',
  'Ekonomiprogrammet',
  'Estetiska programmet',
  'Humanistiska programmet',
  'Barn- och fritidsprogrammet',
  'Vård- och omsorgsprogrammet'
];

const getProgramsForGymnasium = (gymnasium: string): string[] => {
  return allPrograms; // Return all programs for now
};

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

  // Filter gymnasiums based on search
  const filteredGymnasiums = searchQuery 
    ? gymnasiums.filter((gym: string) => 
        gym.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : gymnasiums;

  // Get available programs for selected gymnasium
  const availablePrograms = gymnasium ? getProgramsForGymnasium(gymnasium) : [];
  
  // Get courses for selected program and year
  const availableCourses = program ? getCoursesForProgramAndYear(program, year) : [];
  const mandatoryCourses = availableCourses.filter(course => course.mandatory);
  const electiveCourses = availableCourses.filter(course => !course.mandatory);

  // Get gymnasium info for display
  const selectedGymnasiumInfo = gymnasium ? {
    name: gymnasium,
    city: gymnasium.includes('Stockholm') ? 'Stockholm' : 
          gymnasium.includes('Göteborg') ? 'Göteborg' :
          gymnasium.includes('Malmö') ? 'Malmö' :
          gymnasium.includes('Uppsala') ? 'Uppsala' :
          gymnasium.includes('Lund') ? 'Lund' : 'Sverige'
  } : null;

  // Get program category
  const getProgramCategory = (programName: string) => {
    if (!programName?.trim() || programName.length > 100) return 'Okänt program';
    const sanitizedName = programName.trim();
    const yrkesProgram = [
      'Barn- och fritidsprogrammet',
      'Bygg- och anläggningsprogrammet', 
      'El- och energiprogrammet',
      'Fordons- och transportprogrammet',
      'Handels- och administrationsprogrammet',
      'Hantverksprogrammet',
      'Hotell- och turismprogrammet',
      'Industritekniska programmet',
      'Naturbruksprogrammet',
      'Restaurang- och livsmedelsprogrammet',
      'VVS- och fastighetsprogrammet',
      'Vård- och omsorgsprogrammet'
    ];
    return yrkesProgram.includes(sanitizedName) ? 'Yrkesprogram' : 'Högskoleförberedande';
  };

  const handleComplete = async () => {
    console.log('🎯 Starting onboarding completion with data:', {
      name,
      gymnasium,
      program,
      year,
      selectedCourses: selectedCourses.length,
      mandatoryCourses: mandatoryCourses.length
    });
    
    try {
      // Include all mandatory courses automatically
      const allSelectedCourses = [
        ...mandatoryCourses.map(course => course.code),
        ...selectedCourses
      ];
      
      console.log('📚 Final course selection:', {
        mandatory: mandatoryCourses.length,
        elective: selectedCourses.length,
        total: allSelectedCourses.length,
        courses: allSelectedCourses
      });
      
      // Update profile with all data - this will save to database
      console.log('📝 Updating user profile with complete data...');
      await updateUserProfile({
        name,
        gymnasium,
        program,
        year,
        selectedCourses: allSelectedCourses,
      } as any);
      
      // Wait a moment for profile to be saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Complete onboarding process - this will sync everything
      console.log('🎯 Completing onboarding process...');
      await completeOnboarding();
      
      // Wait another moment for completion to be processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Onboarding completed successfully, navigating to home');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      // Still navigate to home even if there's an error
      router.replace('/(tabs)/home');
    }
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
            <Text style={styles.subtitle}>Låt oss börja med att lära känna dig</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vad heter du?</Text>
              <TextInput
                style={styles.input}
                placeholder="Ditt förnamn"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
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
            <Text style={styles.title}>Hej {name}! 👋</Text>
            <Text style={styles.subtitle}>Vilket gymnasium går du på?</Text>
            <View style={styles.searchContainer}>
              <MapPin size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Sök efter ditt gymnasium..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {filteredGymnasiums.slice(0, 50).map((gym: string) => (
                <TouchableOpacity
                  key={gym}
                  style={[styles.listItem, gymnasium === gym && styles.listItemSelected]}
                  onPress={() => {
                    if (gym?.trim() && gym.length <= 200) {
                      setGymnasium(gym.trim());
                      setProgram(''); // Reset program when changing gymnasium
                      setStep(3);
                    }
                  }}
                >
                  <View style={styles.listItemContent}>
                    <Text style={[styles.listItemText, gymnasium === gym && styles.listItemTextSelected]}>
                      {gym}
                    </Text>
                    <Text style={[styles.listItemSubtext, gymnasium === gym && styles.listItemTextSelected]}>
                      {!gym?.trim() ? 'Sverige' :
                       gym.includes('Stockholm') ? 'Stockholm' : 
                       gym.includes('Göteborg') ? 'Göteborg' :
                       gym.includes('Malmö') ? 'Malmö' :
                       gym.includes('Uppsala') ? 'Uppsala' :
                       gym.includes('Lund') ? 'Lund' : 'Sverige'}
                    </Text>
                  </View>
                  {gymnasium === gym && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj ditt program</Text>
            <Text style={styles.subtitle}>Vilket program läser du på {selectedGymnasiumInfo?.name}?</Text>
            
            <ScrollView style={styles.programList} showsVerticalScrollIndicator={false}>
              {availablePrograms.map((programName: string) => (
                <TouchableOpacity
                  key={programName}
                  style={[styles.programItem, program === programName && styles.programItemSelected]}
                  onPress={() => {
                    if (programName?.trim() && programName.length <= 100) {
                      setProgram(programName.trim());
                      setSelectedCourses([]); // Reset courses when changing program
                    }
                  }}
                >
                  <View style={styles.programContent}>
                    <Text style={[styles.programName, program === programName && styles.programNameSelected]}>
                      {programName}
                    </Text>
                    <Text style={[styles.programCategory, program === programName && styles.programCategorySelected]}>
                      {getProgramCategory(programName)}
                    </Text>
                  </View>
                  {program === programName && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.button, !program && styles.buttonDisabled]}
              onPress={() => program && setStep(4)}
              disabled={!program}
            >
              <Text style={styles.buttonText}>Fortsätt</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Award size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj årskurs</Text>
            <Text style={styles.subtitle}>Vilken årskurs går du i?</Text>
            
            <View style={styles.yearSelectionContainer}>
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
            
            <View style={styles.selectionSummary}>
              <Text style={styles.summaryTitle}>Din utbildning</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gymnasium:</Text>
                <Text style={styles.summaryValue}>{selectedGymnasiumInfo?.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Program:</Text>
                <Text style={styles.summaryValue}>{program}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Årskurs:</Text>
                <Text style={styles.summaryValue}>År {year}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(5)}
            >
              <Text style={styles.buttonText}>Välj kurser</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <GraduationCap size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj dina kurser</Text>
            <View style={styles.programSummary}>
              <Text style={styles.programSummaryText}>År {year} - {program}</Text>
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
            
            <View style={styles.completionSummary}>
              <Text style={styles.summaryTitle}>Sammanfattning</Text>
              <Text style={styles.summaryText}>
                {mandatoryCourses.length} obligatoriska kurser + {selectedCourses.length} valbara kurser
              </Text>
              <Text style={styles.summarySubtext}>
                Totalt: {mandatoryCourses.length + selectedCourses.length} kurser
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Kom igång!</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
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
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 17,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  listItemContent: {
    flex: 1,
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
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  programList: {
    flex: 1,
    paddingHorizontal: 20,
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
    paddingVertical: 30,
    marginHorizontal: 20,
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
  selectionSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600' as const,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
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
  coursesList: {
    flex: 1,
    paddingHorizontal: 20,
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
  courseCategoryTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
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
  electiveSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  completionSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600' as const,
    textAlign: 'center',
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
});