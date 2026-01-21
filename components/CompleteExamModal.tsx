import React, { useState, useEffect } from 'react';
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
import { X, Award, FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExams, Exam } from '@/contexts/ExamContext';
import * as Haptics from 'expo-haptics';

interface CompleteExamModalProps {
  visible: boolean;
  onClose: () => void;
  exam: Exam;
}

export default function CompleteExamModal({ visible, onClose, exam }: CompleteExamModalProps) {
  const { theme } = useTheme();
  const { updateExam } = useExams();

  const [grade, setGrade] = useState<string>(exam.grade || '');
  const [notes, setNotes] = useState<string>(exam.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setGrade(exam.grade || '');
      setNotes(exam.notes || '');
    }
  }, [visible, exam]);

  const grades = [
    { value: 'A', label: 'A', color: '#10B981', description: 'Berömvärd' },
    { value: 'B', label: 'B', color: '#34D399', description: 'Mycket god' },
    { value: 'C', label: 'C', color: '#60A5FA', description: 'God' },
    { value: 'D', label: 'D', color: '#FBBF24', description: 'Tillfredsställande' },
    { value: 'E', label: 'E', color: '#FB923C', description: 'Godkänd' },
    { value: 'F', label: 'F', color: '#EF4444', description: 'Underkänd' },
    { value: 'IG', label: 'IG', color: '#6B7280', description: 'Icke godkänd' },
  ];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateExam(exam.id, {
        status: 'completed',
        grade: grade || undefined,
        notes: notes.trim() || undefined
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Klart!', 'Provresultatet har sparats', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('❌ Error completing exam:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fel', 'Kunde inte spara resultatet. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipGrade = async () => {
    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateExam(exam.id, {
        status: 'completed',
        notes: notes.trim() || undefined
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error('❌ Error completing exam:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fel', 'Kunde inte markera som genomfört. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
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
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Award size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Hur gick det?
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {exam.title}
                </Text>
              </View>
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Award size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Vilket betyg fick du?
                </Text>
              </View>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Vänligen välj ditt betyg nedan
              </Text>

              <View style={styles.gradeGrid}>
                {grades.map((gradeOption) => {
                  const isSelected = grade === gradeOption.value;
                  return (
                    <TouchableOpacity
                      key={gradeOption.value}
                      style={[
                        styles.gradeButton,
                        { 
                          backgroundColor: isSelected 
                            ? gradeOption.color + '20'
                            : theme.colors.card,
                          borderColor: isSelected
                            ? gradeOption.color
                            : theme.colors.border
                        }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGrade(gradeOption.value);
                      }}
                    >
                      <Text style={[
                        styles.gradeLabel,
                        { color: isSelected ? gradeOption.color : theme.colors.text }
                      ]}>
                        {gradeOption.label}
                      </Text>
                      <Text style={[
                        styles.gradeDescription,
                        { color: isSelected ? gradeOption.color : theme.colors.textMuted }
                      ]}>
                        {gradeOption.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Anteckningar
                </Text>
              </View>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Hur upplevde du provet? (valfritt)
              </Text>

              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                placeholder="T.ex. 'Svårt men hann klart' eller 'Kunde mer än jag trodde'"
                placeholderTextColor={theme.colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: theme.colors.card }]}
              onPress={handleSkipGrade}
              disabled={isSubmitting}
            >
              <Text style={[styles.skipButtonText, { color: theme.colors.text }]}>
                Hoppa över betyg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: theme.colors.primary },
                (!grade || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!grade || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sparar...' : 'Spara resultat'}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 2,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    marginBottom: 16,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gradeButton: {
    width: '31%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  gradeDescription: {
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  textArea: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  submitButton: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
