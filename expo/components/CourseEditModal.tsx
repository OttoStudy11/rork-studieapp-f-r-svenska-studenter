import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  CheckCircle,
  X as CloseIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface CourseEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  courseStyle: { emoji: string; primaryColor: string };
  courseTitle: string;
  editProgress: string;
  setEditProgress: (v: string) => void;
  editCurrentGrade: string;
  setEditCurrentGrade: (v: string) => void;
  editTargetGrade: string;
  setEditTargetGrade: (v: string) => void;
  editSelfEvaluation: number;
  setEditSelfEvaluation: (v: number) => void;
  editNotes: string;
  setEditNotes: (v: string) => void;
  activeTab: 'progress' | 'grades' | 'eval' | 'notes';
  setActiveTab: (t: 'progress' | 'grades' | 'eval' | 'notes') => void;
  theme: {
    colors: {
      text: string;
      textSecondary: string;
      textMuted: string;
      card: string;
      surface: string;
      border: string;
      background: string;
    };
  };
}

export default function CourseEditModal({
  visible,
  onClose,
  onSave,
  courseStyle,
  courseTitle,
  editProgress,
  setEditProgress,
  editCurrentGrade,
  setEditCurrentGrade,
  editTargetGrade,
  setEditTargetGrade,
  editSelfEvaluation,
  setEditSelfEvaluation,
  editNotes,
  setEditNotes,
  activeTab,
  setActiveTab,
  theme,
}: CourseEditModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIconBg, { backgroundColor: courseStyle.primaryColor + '18' }]}>
              <Text style={styles.sheetHeaderEmoji}>{courseStyle.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Redigera kurs</Text>
              <Text style={[styles.sheetSubtitle, { color: theme.colors.textMuted }]}>{courseTitle}</Text>
            </View>
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <CloseIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
            {[
              { key: 'progress', label: 'Framsteg', emoji: '📊' },
              { key: 'grades', label: 'Betyg', emoji: '🎯' },
              { key: 'eval', label: 'Värdering', emoji: '⭐' },
              { key: 'notes', label: 'Anteckningar', emoji: '📝' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  activeTab === tab.key && { backgroundColor: courseStyle.primaryColor },
                ]}
                onPress={() => {
                  setActiveTab(tab.key as typeof activeTab);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: activeTab === tab.key ? 'white' : theme.colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'progress' && (
              <View style={styles.tabContent}>
                <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>
                  Hur långt har du kommit?
                </Text>
                <View
                  style={[
                    styles.progressDisplayBox,
                    {
                      backgroundColor: courseStyle.primaryColor + '12',
                      borderColor: courseStyle.primaryColor + '30',
                    },
                  ]}
                >
                  <Text style={[styles.progressBigNumber, { color: courseStyle.primaryColor }]}>
                    {editProgress}%
                  </Text>
                  <Text style={[styles.progressBigLabel, { color: theme.colors.textMuted }]}>
                    slutfört
                  </Text>
                </View>
                <View style={[styles.progressBarEdit, { backgroundColor: theme.colors.surface }]}>
                  <View
                    style={[
                      styles.progressBarFillEdit,
                      {
                        width: `${Math.max(0, Math.min(100, parseInt(editProgress) || 0))}%`,
                        backgroundColor: courseStyle.primaryColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressControls}>
                  {[0, 10, 25, 50, 75, 90, 100].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.progressChip,
                        { borderColor: theme.colors.border },
                        editProgress === String(val) && {
                          backgroundColor: courseStyle.primaryColor,
                          borderColor: courseStyle.primaryColor,
                        },
                      ]}
                      onPress={() => {
                        setEditProgress(String(val));
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text
                        style={[
                          styles.progressChipText,
                          { color: editProgress === String(val) ? 'white' : theme.colors.text },
                        ]}
                      >
                        {val}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.progressManualRow}>
                  <TouchableOpacity
                    style={[styles.progressStepBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => {
                      const v = Math.max(0, (parseInt(editProgress) || 0) - 1);
                      setEditProgress(String(v));
                    }}
                  >
                    <Text style={[styles.progressStepBtnText, { color: theme.colors.text }]}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.progressManualInput,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={editProgress}
                    onChangeText={setEditProgress}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={[styles.progressStepBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => {
                      const v = Math.min(100, (parseInt(editProgress) || 0) + 1);
                      setEditProgress(String(v));
                    }}
                  >
                    <Text style={[styles.progressStepBtnText, { color: theme.colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'grades' && (
              <View style={styles.tabContent}>
                <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>
                  Betygsättning
                </Text>
                <View style={styles.gradeSection}>
                  <Text style={[styles.gradeSectionLabel, { color: theme.colors.textSecondary }]}>
                    Nuvarande betyg
                  </Text>
                  <Text style={[styles.gradeSectionHint, { color: theme.colors.textMuted }]}>
                    Vilket betyg har du fått hittills?
                  </Text>
                  <View style={styles.gradeRow}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.gradePillBtn,
                          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                          editCurrentGrade === grade && {
                            backgroundColor: courseStyle.primaryColor,
                            borderColor: courseStyle.primaryColor,
                          },
                        ]}
                        onPress={() => {
                          setEditCurrentGrade(grade === editCurrentGrade ? '' : grade);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text
                          style={[
                            styles.gradePillBtnText,
                            {
                              color:
                                editCurrentGrade === grade ? 'white' : theme.colors.text,
                            },
                          ]}
                        >
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.gradeDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.gradeSection}>
                  <Text style={[styles.gradeSectionLabel, { color: theme.colors.textSecondary }]}>
                    Målbetyg
                  </Text>
                  <Text style={[styles.gradeSectionHint, { color: theme.colors.textMuted }]}>
                    Vilket betyg siktar du på?
                  </Text>
                  <View style={styles.gradeRow}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.gradePillBtn,
                          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                          editTargetGrade === grade && {
                            backgroundColor: courseStyle.primaryColor + '25',
                            borderColor: courseStyle.primaryColor,
                          },
                        ]}
                        onPress={() => {
                          setEditTargetGrade(grade === editTargetGrade ? '' : grade);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text
                          style={[
                            styles.gradePillBtnText,
                            {
                              color:
                                editTargetGrade === grade
                                  ? courseStyle.primaryColor
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'eval' && (
              <View style={styles.tabContent}>
                <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>
                  Självvärdering
                </Text>
                <Text style={[styles.evalSubtitle, { color: theme.colors.textSecondary }]}>
                  Hur väl behärskar du kursen?
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setEditSelfEvaluation(star === editSelfEvaluation ? 0 : star);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                      style={styles.starButton}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.starLarge,
                          {
                            color:
                              star <= editSelfEvaluation ? '#F59E0B' : theme.colors.border,
                          },
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.evalLabel, { color: courseStyle.primaryColor }]}>
                  {editSelfEvaluation === 0
                    ? 'Ej värderad'
                    : editSelfEvaluation === 1
                      ? 'Nybörjare – Behöver mycket hjälp'
                      : editSelfEvaluation === 2
                        ? 'Grundläggande – Förstår det mesta'
                        : editSelfEvaluation === 3
                          ? 'Medel – Klarar de flesta uppgifter'
                          : editSelfEvaluation === 4
                            ? 'Bra – Behärskar kursen väl'
                            : 'Utmärkt – Fullständig behärskning'}
                </Text>
                <View style={styles.evalCardsRow}>
                  {[
                    { val: 1, label: 'Nybörjare', emoji: '🌱' },
                    { val: 2, label: 'Grundläggande', emoji: '📖' },
                    { val: 3, label: 'Medel', emoji: '💡' },
                    { val: 4, label: 'Bra', emoji: '🚀' },
                    { val: 5, label: 'Utmärkt', emoji: '🏆' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.val}
                      style={[
                        styles.evalCard,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface,
                        },
                        editSelfEvaluation === item.val && {
                          borderColor: courseStyle.primaryColor,
                          backgroundColor: courseStyle.primaryColor + '12',
                        },
                      ]}
                      onPress={() => {
                        setEditSelfEvaluation(item.val === editSelfEvaluation ? 0 : item.val);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={styles.evalCardEmoji}>{item.emoji}</Text>
                      <Text
                        style={[
                          styles.evalCardLabel,
                          {
                            color:
                              editSelfEvaluation === item.val
                                ? courseStyle.primaryColor
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'notes' && (
              <View style={styles.tabContent}>
                <Text style={[styles.tabSectionTitle, { color: theme.colors.text }]}>
                  Anteckningar
                </Text>
                <Text style={[styles.evalSubtitle, { color: theme.colors.textSecondary }]}>
                  Skriv dina egna tankar, mål eller påminnelser
                </Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                  numberOfLines={10}
                  placeholder="T.ex. 'Behöver repetera kapitel 3', 'Fråga läraren om derivatan', 'Plugga inför provet den 15e'..."
                  placeholderTextColor={theme.colors.textMuted}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
                  {editNotes.length} tecken
                </Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={[styles.sheetFooter, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.sheetCancelBtn, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.sheetCancelBtnText, { color: theme.colors.text }]}>
                Avbryt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetSaveBtn, { backgroundColor: courseStyle.primaryColor }]}
              onPress={onSave}
            >
              <CheckCircle size={18} color="white" />
              <Text style={styles.sheetSaveBtnText}>Spara ändringar</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    width: '92%',
    maxHeight: '88%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  sheetIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeaderEmoji: {
    fontSize: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  sheetBody: {
    paddingHorizontal: 20,
    maxHeight: 420,
  },
  tabContent: {
    gap: 16,
  },
  tabSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  progressDisplayBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  progressBigNumber: {
    fontSize: 48,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  progressBigLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  progressBarEdit: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFillEdit: {
    height: '100%',
    borderRadius: 5,
  },
  progressControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  progressChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  progressManualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressStepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepBtnText: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  progressManualInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  gradeSection: {
    gap: 8,
  },
  gradeSectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  gradeSectionHint: {
    fontSize: 13,
  },
  gradeDivider: {
    height: 1,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradePillBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradePillBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  starLarge: {
    fontSize: 40,
    lineHeight: 44,
  },
  evalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  evalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  evalCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evalCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  evalCardEmoji: {
    fontSize: 24,
  },
  evalCardLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  notesInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  sheetFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  sheetSaveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sheetSaveBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'white',
  },
});
