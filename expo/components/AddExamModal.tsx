import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { X, Calendar, Clock, AlertCircle, BookOpen, Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams } from '@/contexts/ExamContext';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddExamModalProps {
  visible: boolean;
  onClose: () => void;
  courseId?: string;
  courseTitle?: string;
}

export default function AddExamModal({ visible, onClose, courseId, courseTitle }: AddExamModalProps) {
  const { theme } = useTheme();
  const { addExam } = useExams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examDate, setExamDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [examType, setExamType] = useState<'written' | 'oral' | 'practical' | 'online' | 'other'>('written');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [gradeGoal, setGradeGoal] = useState<'E' | 'C' | 'A'>('C');

  const COMMON_SUBJECTS = [
    'Matematik 1a', 'Matematik 1b', 'Matematik 1c',
    'Matematik 2a', 'Matematik 2b', 'Matematik 2c',
    'Matematik 3b', 'Matematik 3c', 'Matematik 4', 'Matematik 5',
    'Svenska 1', 'Svenska 2', 'Svenska 3',
    'Engelska 5', 'Engelska 6', 'Engelska 7',
    'Historia 1a1', 'Historia 1b', 'Historia 2a', 'Historia 2b',
    'Samhällskunskap 1a1', 'Samhällskunskap 1b', 'Samhällskunskap 2',
    'Biologi 1', 'Biologi 2',
    'Kemi 1', 'Kemi 2',
    'Fysik 1a', 'Fysik 1b', 'Fysik 2',
    'Geografi 1', 'Religionskunskap 1', 'Filosofi 1', 'Psykologi 1',
    'Naturkunskap 1a1', 'Naturkunskap 1b', 'Naturkunskap 2',
    'Ekonomi',
  ];

  const gradeGoals = [
    { value: 'E' as const, label: 'E', desc: 'Godkänt', color: '#10B981' },
    { value: 'C' as const, label: 'C', desc: 'Bra', color: '#3B82F6' },
    { value: 'A' as const, label: 'A', desc: 'Topp', color: '#8B5CF6' },
  ];

  const examTypes = [
    { value: 'written' as const, label: 'Skriftligt', icon: '📝' },
    { value: 'oral' as const, label: 'Muntligt', icon: '🗣️' },
    { value: 'practical' as const, label: 'Praktiskt', icon: '🔧' },
    { value: 'online' as const, label: 'Online', icon: '💻' },
    { value: 'other' as const, label: 'Annat', icon: '📋' }
  ];

  const importanceLevels = [
    { value: 'low' as const, label: 'Låg', color: '#10B981', icon: '🟢' },
    { value: 'medium' as const, label: 'Medel', color: '#F59E0B', icon: '🟡' },
    { value: 'high' as const, label: 'Hög', color: '#EF4444', icon: '🔴' }
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExamDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(examDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setExamDate(newDate);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fel', 'Vänligen ange en titel för provet');
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📝 Adding exam with data:', {
        title: title.trim(),
        examDate: examDate.toISOString(),
        status: 'scheduled'
      });

      const examNotes = JSON.stringify({
        subject: subject.trim(),
        topics: topics.trim(),
        gradeGoal,
      });

      await addExam({
        courseId: courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        examDate,
        durationMinutes: duration ? parseInt(duration) : undefined,
        location: location.trim() || undefined,
        examType,
        status: 'scheduled',
        notificationEnabled: true,
        notificationTimeBeforeMinutes: 1440,
        notes: examNotes,
      });

      console.log('✅ Exam added successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTitle('');
      setDescription('');
      setExamDate(new Date());
      setDuration('');
      setLocation('');
      setExamType('written');
      setImportance('medium');
      setNotificationEnabled(true);
      setSubject('');
      setTopics('');
      setGradeGoal('C');
      
      Alert.alert('Klart!', 'Provet har lagts till i din planering', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('❌ Error adding exam:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fel', 'Kunde inte lägga till provet. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Lägg till prov
              </Text>
              {courseTitle && (
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {courseTitle}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
              onPress={onClose}
            >
              <X size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Titel *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                placeholder="T.ex. Slutprov Matematik 1a"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Subject & Exam Content */}
            <View style={[styles.sectionBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.sectionBoxHeader}>
                <BookOpen size={16} color={theme.colors.primary} />
                <Text style={[styles.sectionBoxTitle, { color: theme.colors.text }]}>Provinnehåll</Text>
                <Text style={[styles.sectionBoxBadge, { backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }]}>Förbättrar studieplanen</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Ämne / Kurs</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="T.ex. Matematik 1a, Biologi 2, Svenska 3"
                  placeholderTextColor={theme.colors.textMuted}
                  value={subject}
                  onChangeText={setSubject}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.subjectChipsScroll}
                  contentContainerStyle={styles.subjectChipsContent}
                >
                  {COMMON_SUBJECTS.filter(s =>
                    subject === '' || s.toLowerCase().includes(subject.toLowerCase())
                  ).slice(0, 12).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.subjectChip,
                        {
                          backgroundColor: subject === s ? theme.colors.primary : theme.colors.background,
                          borderColor: subject === s ? theme.colors.primary : theme.colors.border,
                        }
                      ]}
                      onPress={() => setSubject(subject === s ? '' : s)}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        { color: subject === s ? 'white' : theme.colors.textSecondary }
                      ]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Vad ingår i provet?</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="T.ex. Kapitel 3–6, derivata, integraler, sannolikhetslära..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={topics}
                  onChangeText={setTopics}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <View style={styles.gradeLabelRow}>
                  <Target size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}>Betygsmål</Text>
                </View>
                <View style={styles.gradeGoalRow}>
                  {gradeGoals.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      style={[
                        styles.gradeGoalBtn,
                        {
                          backgroundColor: gradeGoal === g.value ? g.color + '18' : theme.colors.background,
                          borderColor: gradeGoal === g.value ? g.color : theme.colors.border,
                          borderWidth: gradeGoal === g.value ? 2 : 1,
                        }
                      ]}
                      onPress={() => setGradeGoal(g.value)}
                    >
                      <Text style={[styles.gradeGoalLetter, { color: gradeGoal === g.value ? g.color : theme.colors.text }]}>{g.label}</Text>
                      <Text style={[styles.gradeGoalDesc, { color: gradeGoal === g.value ? g.color : theme.colors.textMuted }]}>{g.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Anteckningar (valfritt)</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                placeholder="Lägg till eventuella anteckningar..."
                placeholderTextColor={theme.colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Provtyp</Text>
              <View style={styles.typeGrid}>
                {examTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      { 
                        backgroundColor: examType === type.value 
                          ? theme.colors.primary 
                          : theme.colors.card,
                        borderColor: examType === type.value
                          ? theme.colors.primary
                          : theme.colors.border
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExamType(type.value);
                    }}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      { 
                        color: examType === type.value 
                          ? 'white'
                          : theme.colors.text
                      }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Datum</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDatePicker(true);
                  }}
                >
                  <Calendar size={18} color={theme.colors.primary} />
                  <Text style={[styles.dateText, { color: theme.colors.text }]}>
                    {formatDate(examDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Tid</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowTimePicker(true);
                  }}
                >
                  <Clock size={18} color={theme.colors.primary} />
                  <Text style={[styles.dateText, { color: theme.colors.text }]}>
                    {formatTime(examDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={examDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor={theme.colors.text}
                accentColor={theme.colors.primary}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={examDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                is24Hour={true}
                textColor={theme.colors.text}
                accentColor={theme.colors.primary}
              />
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Längd (min)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="120"
                  placeholderTextColor={theme.colors.textMuted}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Plats</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="Sal A201"
                  placeholderTextColor={theme.colors.textMuted}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Prioritet</Text>
              <View style={styles.importanceGrid}>
                {importanceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.importanceButton,
                      { 
                        backgroundColor: importance === level.value 
                          ? level.color + '20'
                          : theme.colors.card,
                        borderColor: importance === level.value
                          ? level.color
                          : theme.colors.border
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setImportance(level.value);
                    }}
                  >
                    <Text style={styles.importanceIcon}>{level.icon}</Text>
                    <Text style={[
                      styles.importanceLabel,
                      { color: importance === level.value ? level.color : theme.colors.text }
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.notificationToggle,
                { 
                  backgroundColor: notificationEnabled ? theme.colors.primary + '15' : theme.colors.card,
                  borderColor: notificationEnabled ? theme.colors.primary : theme.colors.border
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotificationEnabled(!notificationEnabled);
              }}
            >
              <View style={styles.notificationContent}>
                <AlertCircle size={20} color={notificationEnabled ? theme.colors.primary : theme.colors.textMuted} />
                <View style={styles.notificationText}>
                  <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                    Påminnelser
                  </Text>
                  <Text style={[styles.notificationSubtitle, { color: theme.colors.textSecondary }]}>
                    Få notiser 1 vecka, 3 dagar och 1 dag innan
                  </Text>
                </View>
              </View>
              <View style={[
                styles.toggleIndicator,
                { backgroundColor: notificationEnabled ? theme.colors.primary : theme.colors.border }
              ]}>
                <View style={[
                  styles.toggleDot,
                  { 
                    backgroundColor: 'white',
                    transform: [{ translateX: notificationEnabled ? 16 : 0 }]
                  }
                ]} />
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.card }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Avbryt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: theme.colors.primary },
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Lägger till...' : 'Lägg till prov'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 80,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
  },
  sectionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 0,
  },
  sectionBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionBoxTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    flex: 1,
  },
  sectionBoxBadge: {
    fontSize: 11,
    fontWeight: '600' as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectChipsScroll: {
    marginTop: 8,
  },
  subjectChipsContent: {
    gap: 8,
    paddingBottom: 4,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  gradeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  gradeGoalRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gradeGoalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 3,
  },
  gradeGoalLetter: {
    fontSize: 22,
    fontWeight: '800' as const,
    lineHeight: 26,
  },
  gradeGoalDesc: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  importanceGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  importanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  importanceIcon: {
    fontSize: 16,
  },
  importanceLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  toggleIndicator: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
