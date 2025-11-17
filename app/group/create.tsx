import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Users, Lock, Globe } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStudyGroups } from '@/contexts/StudyGroupContext';
import { supabase } from '@/lib/supabase';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createGroup } = useStudyGroups();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState('20');
  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
    } catch (err) {
      console.error('Exception fetching courses:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      alert('Ange ett gruppnamn');
      return;
    }

    const maxMembersNum = parseInt(maxMembers, 10);
    if (isNaN(maxMembersNum) || maxMembersNum < 2) {
      alert('Max antal medlemmar måste vara minst 2');
      return;
    }

    setIsCreating(true);
    const { group, error } = await createGroup(
      name.trim(),
      description.trim() || null,
      selectedCourseId,
      isPrivate,
      maxMembersNum
    );

    setIsCreating(false);

    if (error) {
      alert(error);
    } else if (group) {
      router.replace(`/group/${group.id}` as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Skapa grupp</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Users size={48} color={theme.colors.primary} strokeWidth={2} />
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Gruppnamn *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface, 
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="T.ex. Matematik 1a - Studiegrupp"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Beskrivning</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface, 
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Beskriv vad gruppen handlar om..."
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Kurs</Text>
            {isLoadingCourses ? (
              <View style={[styles.loadingBox, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coursesScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.courseChip,
                    { 
                      backgroundColor: selectedCourseId === null ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => setSelectedCourseId(null)}
                >
                  <Text
                    style={[
                      styles.courseChipText,
                      { color: selectedCourseId === null ? '#fff' : theme.colors.text }
                    ]}
                  >
                    Ingen kurs
                  </Text>
                </TouchableOpacity>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseChip,
                      {
                        backgroundColor: selectedCourseId === course.id ? theme.colors.primary : theme.colors.surface,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setSelectedCourseId(course.id)}
                  >
                    <Text
                      style={[
                        styles.courseChipText,
                        { color: selectedCourseId === course.id ? '#fff' : theme.colors.text }
                      ]}
                    >
                      {course.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Max antal medlemmar</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface, 
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="20"
              placeholderTextColor={theme.colors.textMuted}
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.switchLeft}>
              {isPrivate ? (
                <Lock size={20} color={theme.colors.text} strokeWidth={2} />
              ) : (
                <Globe size={20} color={theme.colors.text} strokeWidth={2} />
              )}
              <View>
                <Text style={[styles.switchTitle, { color: theme.colors.text }]}>
                  {isPrivate ? 'Privat grupp' : 'Publik grupp'}
                </Text>
                <Text style={[styles.switchDescription, { color: theme.colors.textMuted }]}>
                  {isPrivate 
                    ? 'Endast personer med inbjudningskod kan gå med'
                    : 'Alla kan se och gå med i gruppen'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={isPrivate ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, { 
              backgroundColor: theme.colors.primary,
              opacity: isCreating || !name.trim() ? 0.5 : 1
            }]}
            onPress={handleCreateGroup}
            disabled={isCreating || !name.trim()}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Skapa grupp</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 120,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  coursesScroll: {
    gap: 8,
    paddingRight: 20,
  },
  courseChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  courseChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  switchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  switchDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
