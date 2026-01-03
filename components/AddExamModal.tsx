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
import { X, Calendar, Clock, AlertCircle } from 'lucide-react-native';
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
        notificationTimeBeforeMinutes: 1440
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

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Beskrivning</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                placeholder="Lägg till eventuell beskrivning..."
                placeholderTextColor={theme.colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
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
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={examDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                is24Hour={true}
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
