import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator
} from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Lock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { usePremium } from '@/contexts/PremiumContext';



export default function CourseLibraryScreen() {
  const { theme } = useTheme();
  const { isPremium } = usePremium();
  const { 
    coursesWithProgress, 
    inProgressCourses, 
    completedCourses,
    isLoading 
  } = useCourseContent();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = coursesWithProgress.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const navigateToCourse = (courseId: string) => {
    router.push(`/content-course/${courseId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{ 
            title: 'Kursbibliotek',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar kurser...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Kursbibliotek',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text
        }} 
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Sök kurser..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {inProgressCourses.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Fortsätt lära dig
              </Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {inProgressCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[styles.inProgressCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => navigateToCourse(course.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.inProgressGradient}
                  >
                    <BookOpen size={24} color="white" />
                  </LinearGradient>
                  <View style={styles.inProgressInfo}>
                    <Text 
                      style={[styles.inProgressTitle, { color: theme.colors.text }]}
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${course.progress.percentComplete}%`,
                              backgroundColor: theme.colors.primary 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                        {course.progress.percentComplete}%
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={theme.colors.warning} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Alla kurser
            </Text>
          </View>

          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const isLocked = course.premiumRequired && !isPremium;
              const isCompleted = course.progress.percentComplete === 100;
              
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseCard, 
                    { backgroundColor: theme.colors.card },
                    isLocked && styles.lockedCard
                  ]}
                  onPress={() => !isLocked && navigateToCourse(course.id)}
                  activeOpacity={isLocked ? 1 : 0.8}
                >
                  {course.image ? (
                    <Image 
                      source={{ uri: course.image }} 
                      style={styles.courseImage}
                    />
                  ) : (
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      style={styles.courseImagePlaceholder}
                    >
                      <BookOpen size={32} color="white" />
                    </LinearGradient>
                  )}
                  
                  <View style={styles.courseContent}>
                    <View style={styles.courseTitleRow}>
                      <Text 
                        style={[
                          styles.courseTitle, 
                          { color: theme.colors.text },
                          isLocked && { color: theme.colors.textMuted }
                        ]}
                        numberOfLines={2}
                      >
                        {course.title}
                      </Text>
                      {isLocked && (
                        <View style={[styles.lockedBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                          <Lock size={12} color={theme.colors.warning} />
                          <Text style={[styles.lockedText, { color: theme.colors.warning }]}>Pro</Text>
                        </View>
                      )}
                      {isCompleted && (
                        <View style={[styles.completedBadge, { backgroundColor: theme.colors.success + '20' }]}>
                          <CheckCircle size={12} color={theme.colors.success} />
                        </View>
                      )}
                    </View>
                    
                    <Text 
                      style={[
                        styles.courseDescription, 
                        { color: theme.colors.textSecondary },
                        isLocked && { color: theme.colors.textMuted }
                      ]}
                      numberOfLines={2}
                    >
                      {course.description}
                    </Text>
                    
                    <View style={styles.courseMeta}>
                      <View style={styles.metaItem}>
                        <BookOpen size={14} color={theme.colors.textMuted} />
                        <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                          {course.modules.length} moduler
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={theme.colors.textMuted} />
                        <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                          {formatDuration(course.duration)}
                        </Text>
                      </View>
                      {course.progress.percentComplete > 0 && !isCompleted && (
                        <View style={styles.metaItem}>
                          <TrendingUp size={14} color={theme.colors.primary} />
                          <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                            {course.progress.percentComplete}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <ChevronRight size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Search size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Inga kurser hittades
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Prova att söka med andra ord
              </Text>
            </View>
          )}
        </View>

        {completedCourses.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color={theme.colors.success} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Genomförda kurser
              </Text>
            </View>
            
            {completedCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[styles.completedCard, { backgroundColor: theme.colors.card }]}
                onPress={() => navigateToCourse(course.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.completedIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <CheckCircle size={20} color={theme.colors.success} />
                </View>
                <View style={styles.completedInfo}>
                  <Text style={[styles.completedTitle, { color: theme.colors.text }]}>
                    {course.title}
                  </Text>
                  <Text style={[styles.completedMeta, { color: theme.colors.textSecondary }]}>
                    {course.totalLessons} lektioner • {formatDuration(course.duration)}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  horizontalScroll: {
    paddingRight: 24,
  },
  inProgressCard: {
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  inProgressGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inProgressInfo: {
    flex: 1,
  },
  inProgressTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
    lineHeight: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  lockedCard: {
    opacity: 0.7,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  courseImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseContent: {
    flex: 1,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    lineHeight: 22,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  completedBadge: {
    padding: 4,
    borderRadius: 6,
  },
  courseDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  completedMeta: {
    fontSize: 13,
  },
});
