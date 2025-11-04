import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Search, BookOpen, Check, Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { programCourses } from '@/home/project/constants/program-courses';
import type { Course } from '@/home/project/constants/program-courses';
import { FadeInView } from './Animations';

interface CoursePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
}

export default function CoursePickerModal({ visible, onClose, onSelectCourse }: CoursePickerModalProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allCourses = useMemo(() => {
    return programCourses.flatMap(pc => 
      pc.courses.map(course => ({
        ...course,
        program: pc.program
      }))
    );
  }, []);

  const uniquePrograms = useMemo(() => {
    return Array.from(new Set(programCourses.map(pc => pc.program)));
  }, []);

  const categories = [
    { id: 'gymnasiegemensam', label: 'Gymnasiegemensam' },
    { id: 'programgemensam', label: 'Programgemensam' },
    { id: 'inriktning', label: 'Inriktning' },
    { id: 'programfördjupning', label: 'Programfördjupning' },
    { id: 'individuellt val', label: 'Individuellt val' },
  ];

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
        c.program.toLowerCase().includes(query)
      );
    }

    const uniqueCourses = filtered.reduce((acc, course) => {
      const key = `${course.code}-${course.name}`;
      if (!acc.has(key)) {
        acc.set(key, course);
      }
      return acc;
    }, new Map());

    return Array.from(uniqueCourses.values());
  }, [allCourses, selectedProgram, selectedCategory, searchQuery]);

  const handleSelectCourse = (course: Course) => {
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Välj kurs</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {filteredCourses.length} kurser tillgängliga
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

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
                    <View style={[styles.courseIconInner, { backgroundColor: theme.colors.primary + '15' }]}>
                      <BookOpen size={20} color={theme.colors.primary} />
                    </View>
                  </View>
                  
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseName, { color: theme.colors.text }]} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <Text style={[styles.courseProgram, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {course.program}
                    </Text>
                    <View style={styles.courseMeta}>
                      <View style={[styles.courseTag, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Text style={[styles.courseTagText, { color: theme.colors.primary }]}>
                          {course.points}p
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

                  <View style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
                    <Check size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </FadeInView>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
    marginBottom: 8,
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
