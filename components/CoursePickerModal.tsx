import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Search, BookOpen, Check, Filter, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { programCourses } from '@/home/project/constants/program-courses';
import type { Course } from '@/home/project/constants/program-courses';
import { UNIVERSITY_PROGRAM_COURSES } from '@/constants/university-program-courses';
import { UNIVERSITY_PROGRAMS } from '@/constants/universities';
import { FadeInView } from './Animations';

export interface UnifiedCourse {
  code: string;
  name: string;
  points?: number;
  credits?: number;
  year: number;
  mandatory: boolean;
  category: string;
  program: string;
  field?: string;
  isUniversity: boolean;
}

interface CoursePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course | UnifiedCourse) => void;
}

export default function CoursePickerModal({ visible, onClose, onSelectCourse }: CoursePickerModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string>('gymnasie');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      console.log('Loading user profile for course picker...');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('level, program')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setUserLevel('gymnasie');
      } else if (profile) {
        console.log('User profile loaded:', profile);
        setUserLevel(profile.level || 'gymnasie');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUserLevel('gymnasie');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible && user?.id) {
      loadUserProfile();
    }
  }, [visible, user?.id, loadUserProfile]);

  const isUniversityUser = userLevel === 'högskola' || userLevel === 'universitet';

  const allGymnasiumCourses = useMemo(() => {
    return programCourses.flatMap(pc => 
      pc.courses.map(course => ({
        ...course,
        program: pc.program,
        isUniversity: false
      } as UnifiedCourse))
    );
  }, []);

  const allUniversityCourses = useMemo(() => {
    const coursesFromConstants = UNIVERSITY_PROGRAM_COURSES.flatMap(pc => 
      pc.courses.map(course => ({
        code: course.code,
        name: course.name,
        credits: course.credits,
        year: course.year,
        mandatory: course.mandatory,
        category: course.category,
        program: pc.programName,
        field: course.field,
        isUniversity: true
      } as UnifiedCourse))
    );

    // Generate default courses for programs without defined courses
    const programsWithCourses = new Set(UNIVERSITY_PROGRAM_COURSES.map(pc => pc.programId));
    const programsWithoutCourses = UNIVERSITY_PROGRAMS.filter(p => !programsWithCourses.has(p.id));
    
    const defaultCourses: UnifiedCourse[] = [];
    for (const program of programsWithoutCourses) {
      const field = program.field || 'Allm\u00e4nt';
      const degreeType = program.degreeType;
      
      // Generate courses for years 1-3
      for (const year of [1, 2, 3] as const) {
        if (degreeType === 'civilingenj\u00f6r' || degreeType === 'h\u00f6gskoleingenj\u00f6r') {
          if (year === 1) {
            defaultCourses.push(
              { code: `${program.id}-MAT1`, name: 'Matematik I', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field: 'Matematik', isUniversity: true },
              { code: `${program.id}-MAT2`, name: 'Matematik II', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field: 'Matematik', isUniversity: true },
              { code: `${program.id}-PROG1`, name: 'Programmering I', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field: 'Datateknik', isUniversity: true },
              { code: `${program.id}-INTRO`, name: `Introduktion till ${field}`, credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 2) {
            defaultCourses.push(
              { code: `${program.id}-MAT3`, name: 'Matematik III', credits: 7.5, year: 2, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field: 'Matematik', isUniversity: true },
              { code: `${program.id}-STAT`, name: 'Sannolikhetsteori och statistik', credits: 7.5, year: 2, mandatory: true, category: 'grundkurs', program: program.name, field: 'Matematik', isUniversity: true },
              { code: `${program.id}-SPEC1`, name: `${field} - Grundkurs`, credits: 7.5, year: 2, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 3) {
            defaultCourses.push(
              { code: `${program.id}-ADV1`, name: `Avancerad ${field}`, credits: 7.5, year: 3, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true },
              { code: `${program.id}-PROJ`, name: 'Projektarbete', credits: 15, year: 3, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          }
        } else if (degreeType === 'professionsprogram') {
          if (year === 1) {
            defaultCourses.push(
              { code: `${program.id}-GRUND1`, name: `${field} - Grunder`, credits: 15, year: 1, mandatory: true, category: 'professionskurs', program: program.name, field, isUniversity: true },
              { code: `${program.id}-GRUND2`, name: `${field} - Introduktion`, credits: 15, year: 1, mandatory: true, category: 'professionskurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 2) {
            defaultCourses.push(
              { code: `${program.id}-FORD1`, name: `${field} - F\u00f6rdjupning`, credits: 15, year: 2, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 3) {
            defaultCourses.push(
              { code: `${program.id}-EX`, name: 'Examensarbete', credits: 15, year: 3, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          }
        } else {
          // Bachelor/Master programs
          if (year === 1) {
            defaultCourses.push(
              { code: `${program.id}-INTRO`, name: `Introduktion till ${field}`, credits: 15, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field, isUniversity: true },
              { code: `${program.id}-GRUND1`, name: `${field} - Grundkurs I`, credits: 15, year: 1, mandatory: true, category: 'grundkurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 2) {
            defaultCourses.push(
              { code: `${program.id}-FORD1`, name: `${field} - F\u00f6rdjupning I`, credits: 15, year: 2, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          } else if (year === 3) {
            defaultCourses.push(
              { code: `${program.id}-KAND`, name: 'Kandidatuppsats', credits: 15, year: 3, mandatory: true, category: 'f\u00f6rdjupningskurs', program: program.name, field, isUniversity: true }
            );
          }
        }
      }
    }
    
    return [...coursesFromConstants, ...defaultCourses];
  }, []);

  const allCourses = useMemo(() => {
    return isUniversityUser ? allUniversityCourses : allGymnasiumCourses;
  }, [isUniversityUser, allUniversityCourses, allGymnasiumCourses]);

  const uniquePrograms = useMemo(() => {
    if (isUniversityUser) {
      // Include all university programs, not just those with defined courses
      const programNames = new Set([
        ...UNIVERSITY_PROGRAM_COURSES.map(pc => pc.programName),
        ...UNIVERSITY_PROGRAMS.map(p => p.name)
      ]);
      return Array.from(programNames);
    }
    return Array.from(new Set(programCourses.map(pc => pc.program)));
  }, [isUniversityUser]);

  const categories = useMemo(() => {
    if (isUniversityUser) {
      return [
        { id: 'grundkurs', label: 'Grundkurs' },
        { id: 'fördjupningskurs', label: 'Fördjupningskurs' },
        { id: 'avancerad', label: 'Avancerad' },
        { id: 'mastersnivå', label: 'Mastersnivå' },
        { id: 'professionskurs', label: 'Professionskurs' },
        { id: 'valbara', label: 'Valbara' },
      ];
    }
    return [
      { id: 'gymnasiegemensam', label: 'Gymnasiegemensam' },
      { id: 'programgemensam', label: 'Programgemensam' },
      { id: 'inriktning', label: 'Inriktning' },
      { id: 'programfördjupning', label: 'Programfördjupning' },
      { id: 'individuellt val', label: 'Individuellt val' },
    ];
  }, [isUniversityUser]);

  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    if (selectedProgram) {
      filtered = filtered.filter(c => c.program === selectedProgram);
    }

    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.program.toLowerCase().includes(query) ||
        (c.field && c.field.toLowerCase().includes(query))
      );
    }

    const uniqueCourses = filtered.reduce((acc, course) => {
      const key = `${course.code}-${course.name}`;
      if (!acc.has(key)) {
        acc.set(key, course);
      }
      return acc;
    }, new Map<string, UnifiedCourse>());

    return Array.from(uniqueCourses.values());
  }, [allCourses, selectedProgram, selectedCategory, searchQuery]);

  const handleSelectCourse = (course: UnifiedCourse) => {
    onSelectCourse(course);
    setSearchQuery('');
    setSelectedProgram(null);
    setSelectedCategory(null);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProgram(null);
    setSelectedCategory(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Välj kurs</Text>
              {isUniversityUser && (
                <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <GraduationCap size={14} color={theme.colors.primary} />
                  <Text style={[styles.levelBadgeText, { color: theme.colors.primary }]}>Högskola</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isLoadingProfile ? 'Laddar...' : `${filteredCourses.length} ${isUniversityUser ? 'högskole' : 'gymnasie'}kurser tillgängliga`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {isLoadingProfile ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar kurser...</Text>
          </View>
        ) : (
          <>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Sök efter kurs..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <Filter size={16} color={theme.colors.primary} />
              <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Filter</Text>
            </View>
            {(selectedProgram || selectedCategory) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearFilters, { color: theme.colors.primary }]}>Rensa</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Program Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {uniquePrograms.map((program) => (
              <TouchableOpacity
                key={program}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border 
                  },
                  selectedProgram === program && {
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => setSelectedProgram(selectedProgram === program ? null : program)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    { color: theme.colors.textSecondary },
                    selectedProgram === program && { 
                      color: theme.colors.primary,
                      fontWeight: '600'
                    }
                  ]}
                  numberOfLines={1}
                >
                  {program}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border 
                  },
                  selectedCategory === category.id && {
                    backgroundColor: theme.colors.success + '15',
                    borderColor: theme.colors.success
                  }
                ]}
                onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    { color: theme.colors.textSecondary },
                    selectedCategory === category.id && { 
                      color: theme.colors.success,
                      fontWeight: '600'
                    }
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Course List */}
        <ScrollView 
          style={styles.courseList}
          contentContainerStyle={styles.courseListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Inga kurser hittades
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Prova att ändra dina filter eller sökord
              </Text>
            </View>
          ) : (
            filteredCourses.map((course, index) => (
              <FadeInView key={`${course.code}-${index}`} delay={Math.min(index * 30, 500)}>
                <TouchableOpacity
                  style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => handleSelectCourse(course)}
                >
                  <View style={styles.courseIcon}>
                    <View style={[styles.courseIconInner, { backgroundColor: course.isUniversity ? theme.colors.success + '15' : theme.colors.primary + '15' }]}>
                      {course.isUniversity ? (
                        <GraduationCap size={20} color={theme.colors.success} />
                      ) : (
                        <BookOpen size={20} color={theme.colors.primary} />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseName, { color: theme.colors.text }]} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <Text style={[styles.courseProgram, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {course.program}
                    </Text>
                    {course.field && (
                      <Text style={[styles.courseField, { color: theme.colors.textMuted }]} numberOfLines={1}>
                        {course.field}
                      </Text>
                    )}
                    <View style={styles.courseMeta}>
                      <View style={[styles.courseTag, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Text style={[styles.courseTagText, { color: theme.colors.primary }]}>
                          {course.isUniversity ? `${course.credits} hp` : `${course.points}p`}
                        </Text>
                      </View>
                      <View style={[styles.courseTag, { backgroundColor: theme.colors.warning + '10' }]}>
                        <Text style={[styles.courseTagText, { color: theme.colors.warning }]}>
                          År {course.year}
                        </Text>
                      </View>
                      {course.mandatory && (
                        <View style={[styles.courseTag, { backgroundColor: theme.colors.success + '10' }]}>
                          <Text style={[styles.courseTagText, { color: theme.colors.success }]}>
                            Obligatorisk
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={[styles.addButton, { backgroundColor: course.isUniversity ? theme.colors.success : theme.colors.primary }]}>
                    <Check size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </FadeInView>
            ))
          )}
        </ScrollView>
        </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersSection: {
    paddingBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  courseList: {
    flex: 1,
  },
  courseListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseIcon: {
    marginRight: 12,
  },
  courseIconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseProgram: {
    fontSize: 13,
    marginBottom: 4,
  },
  courseField: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  courseTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
