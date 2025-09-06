import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Search, Check } from 'lucide-react-native';

type Program = { 
  id: string; 
  name: string; 
  level: 'gymnasie' | 'högskola';
};

type Course = { 
  id: string; 
  title: string; 
  subject: string; 
  level: string;
};

export default function ProgramPicker() {
  const { user, setOnboardingCompleted } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [query, setQuery] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pickedCourseIds, setPickedCourseIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const searchPrograms = async () => {
      if (!query.trim()) {
        setPrograms([]);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id, name, level')
          .ilike('name', `%${query}%`)
          .limit(10);

        if (active) {
          if (error) {
            console.error('Error searching programs:', error);
            showError('Kunde inte söka program');
          } else {
            setPrograms((data ?? []) as Program[]);
          }
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          console.error('Error in program search:', error);
          showError('Något gick fel vid sökning');
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(searchPrograms, 300);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [query, showError]);

  const fetchProgramCourses = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('program_courses')
        .select(`
          courses!inner (
            id,
            title,
            subject,
            level
          )
        `)
        .eq('program_id', programId);

      if (error) {
        console.error('Error fetching program courses:', error);
        showError('Kunde inte hämta kurser');
        return;
      }

      const courseList: Course[] = (data ?? [])
        .map((row: any) => ({
          id: row.courses.id,
          title: row.courses.title,
          subject: row.courses.subject,
          level: row.courses.level
        }));

      setCourses(courseList);
      setPickedCourseIds(new Set(courseList.map(c => c.id)));
    } catch (error) {
      console.error('Error in fetchProgramCourses:', error);
      showError('Något gick fel vid hämtning av kurser');
    }
  };

  const onPickProgram = async (program: Program) => {
    setSelectedProgram(program);
    setPrograms([]);
    setQuery(program.name);
    await fetchProgramCourses(program.id);
  };

  const toggleCourse = (courseId: string) => {
    const newSet = new Set(pickedCourseIds);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setPickedCourseIds(newSet);
  };

  const allSelected = useMemo(
    () => courses.length > 0 && pickedCourseIds.size === courses.length,
    [courses, pickedCourseIds]
  );

  const toggleAll = () => {
    if (allSelected) {
      setPickedCourseIds(new Set());
    } else {
      setPickedCourseIds(new Set(courses.map(c => c.id)));
    }
  };

  const saveSelection = async () => {
    if (!user || !selectedProgram) {
      showError('Ingen användare eller program valt');
      return;
    }

    setSaving(true);
    try {
      // Update user profile with selected program
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          program_id: selectedProgram.id,
          program: selectedProgram.name
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Add selected courses to user_courses
      if (pickedCourseIds.size > 0) {
        const coursesToInsert = Array.from(pickedCourseIds).map(courseId => ({
          user_id: user.id,
          course_id: courseId,
          progress: 0,
          is_active: true
        }));

        const { error: coursesError } = await supabase
          .from('user_courses')
          .upsert(coursesToInsert, { 
            onConflict: 'user_id,course_id',
            ignoreDuplicates: false 
          });

        if (coursesError) {
          throw coursesError;
        }
      }

      // Remove unselected courses
      const unselectedCourses = courses
        .map(c => c.id)
        .filter(id => !pickedCourseIds.has(id));

      if (unselectedCourses.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_courses')
          .delete()
          .eq('user_id', user.id)
          .in('course_id', unselectedCourses);

        if (deleteError) {
          console.warn('Error removing unselected courses:', deleteError);
        }
      }

      // Mark onboarding as completed
      await setOnboardingCompleted();
      
      showSuccess('Program och kurser sparade!');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Error saving selection:', error?.message || error?.toString() || 'Unknown error');
      if (error?.code) {
        console.error('Error code:', error.code);
      }
      if (error?.details) {
        console.error('Error details:', error.details);
      }
      if (error?.hint) {
        console.error('Error hint:', error.hint);
      }
      console.error('Full error object:', JSON.stringify(error, null, 2));
      showError(error?.message ?? 'Kunde inte spara valet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Välj din linje/utbildning</Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök t.ex. Teknikprogrammet, Industritekniska..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
          />
          {loading && (
            <ActivityIndicator size="small" color="#4F46E5" style={styles.loadingIcon} />
          )}
        </View>
        
        {!selectedProgram && programs.length > 0 && (
          <View style={styles.programsList}>
            {programs.map(program => (
              <TouchableOpacity
                key={program.id}
                style={styles.programItem}
                onPress={() => onPickProgram(program)}
              >
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programLevel}>({program.level})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedProgram && (
        <View style={styles.selectedProgramContainer}>
          <View style={styles.coursesHeader}>
            <Text style={styles.coursesTitle}>
              Föreslagna kurser för {selectedProgram.name}
            </Text>
            <TouchableOpacity onPress={toggleAll} style={styles.toggleAllButton}>
              <Text style={styles.toggleAllText}>
                {allSelected ? 'Avmarkera alla' : 'Markera alla'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesList}>
            {courses.map(course => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseItem}
                onPress={() => toggleCourse(course.id)}
              >
                <View style={styles.courseCheckbox}>
                  {pickedCourseIds.has(course.id) && (
                    <Check size={16} color="#4F46E5" />
                  )}
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDetails}>
                    {course.subject} · {course.level}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {courses.length === 0 && (
              <View style={styles.noCourses}>
                <Text style={styles.noCoursesText}>
                  Inga kopplade kurser hittades.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedProgram || saving) && styles.saveButtonDisabled
            ]}
            onPress={saveSelection}
            disabled={!selectedProgram || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Text style={styles.saveButtonText}>Spara och fortsätt</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  programsList: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  programName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  programLevel: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedProgramContainer: {
    gap: 20,
  },
  coursesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  toggleAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleAllText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  coursesList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  courseCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4F46E5',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  courseDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  noCourses: {
    padding: 20,
    alignItems: 'center',
  },
  noCoursesText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});