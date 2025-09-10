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
            <Text style={styles.subtitle}>Program</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {availablePrograms.map((prog) => (
                <TouchableOpacity
                  key={prog.id}
                  style={[styles.listItem, program === prog.id && styles.listItemSelected]}
                  onPress={() => setProgram(prog.id)}
                >
                  <View>
                    <Text style={[styles.listItemText, program === prog.id && styles.listItemTextSelected]}>
                      {prog.name}
                    </Text>
                    <Text style={[styles.listItemSubtext, program === prog.id && styles.listItemTextSelected]}>
                      {prog.category === 'högskoleförberedande' ? 'Högskoleförberedande' : 'Yrkesprogram'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {program && (
              <>
                <Text style={[styles.subtitle, { marginTop: 20 }]}>Årskurs</Text>
                <View style={styles.yearContainer}>
                  {[1, 2, 3].map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearButton, year === y && styles.yearButtonSelected]}
                      onPress={() => setYear(y as 1 | 2 | 3)}
                    >
                      <Text style={[styles.yearButtonText, year === y && styles.yearButtonTextSelected]}>
                        År {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
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
            <Text style={styles.subtitle}>År {year} - {program}</Text>
            
            <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
              {mandatoryCourses.length > 0 && (
                <>
                  <Text style={styles.courseCategoryTitle}>Obligatoriska kurser</Text>
                  {mandatoryCourses.map((course) => (
                    <View key={course.code} style={styles.courseItem}>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseName}>{course.name}</Text>
                        <Text style={styles.courseDetails}>
                          {course.code} • {course.points}p • {course.category}
                        </Text>
                      </View>
                      <View style={styles.mandatoryBadge}>
                        <Text style={styles.mandatoryText}>Obligatorisk</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
              
              {electiveCourses.length > 0 && (
                <>
                  <Text style={[styles.courseCategoryTitle, { marginTop: 30 }]}>Valbara kurser</Text>
                  <Text style={styles.electiveSubtitle}>Välj de kurser du är intresserad av</Text>
                  {electiveCourses.map((course) => (
                    <TouchableOpacity
                      key={course.code}
                      style={[
                        styles.courseItem,
                        styles.electiveCourse,
                        selectedCourses.includes(course.code) && styles.selectedCourse
                      ]}
                      onPress={() => toggleCourse(course.code)}
                    >
                      <View style={styles.courseInfo}>
                        <Text style={[
                          styles.courseName,
                          selectedCourses.includes(course.code) && styles.selectedCourseName
                        ]}>
                          {course.name}
                        </Text>
                        <Text style={[
                          styles.courseDetails,
                          selectedCourses.includes(course.code) && styles.selectedCourseDetails
                        ]}>
                          {course.code} • {course.points}p • {course.category}
                        </Text>
                      </View>
                      <View style={[
                        styles.selectionIndicator,
                        selectedCourses.includes(course.code) && styles.selectedIndicator
                      ]} />
                    </TouchableOpacity>
                  ))}
                </>
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
  yearContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  yearButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  yearButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  yearButtonText: {
    fontSize: 16,
    color: '#333',
  },
  yearButtonTextSelected: {
    color: '#fff',
    fontWeight: '600' as const,
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