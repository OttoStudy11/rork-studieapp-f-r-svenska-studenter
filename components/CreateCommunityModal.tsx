import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, GraduationCap, BookOpen, UsersRound, Sparkles, Globe, Lock, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStudy } from '@/contexts/StudyContext';
import { useCommunity, CommunityType, CommunityVisibility, CreateCommunityData } from '@/contexts/CommunityContext';
import { useToast } from '@/contexts/ToastContext';

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const communityTypes: { type: CommunityType; label: string; icon: any; description: string }[] = [
  { type: 'school', label: 'Skola', icon: GraduationCap, description: 'För alla på din skola' },
  { type: 'program', label: 'Program/Linje', icon: BookOpen, description: 'För ditt program eller linje' },
  { type: 'study-group', label: 'Studiegrupp', icon: UsersRound, description: 'För plugg och studier' },
  { type: 'other', label: 'Övrigt', icon: Sparkles, description: 'För andra intressen' },
];

export default function CreateCommunityModal({ visible, onClose, onCreated }: CreateCommunityModalProps) {
  const { theme } = useTheme();
  const { user: studyUser } = useStudy();
  const { createCommunity } = useCommunity();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CommunityType>('study-group');
  const [visibility, setVisibility] = useState<CommunityVisibility>('open');
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setType('study-group');
    setVisibility('open');
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showError('Ange ett namn för din community');
      return;
    }

    setIsCreating(true);

    const data: CreateCommunityData = {
      name: name.trim(),
      description: description.trim(),
      type,
      visibility,
      schoolName: studyUser?.gymnasium?.name,
      programName: studyUser?.program,
    };

    const { community, error } = await createCommunity(data);

    setIsCreating(false);

    if (error) {
      showError(error);
      return;
    }

    showSuccess('Community skapad! 🎉');
    handleClose();
    onCreated?.();
  };

  const canProceed = step === 1 ? type !== null : name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {step === 1 ? 'Välj typ' : 'Skapa community'}
          </Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.stepDot, step >= 2 && { backgroundColor: theme.colors.primary }]} />
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <View style={styles.typeSelection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Vilken typ av community?
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Välj den kategori som passar bäst
              </Text>

              <View style={styles.typeGrid}>
                {communityTypes.map((item) => {
                  const isSelected = type === item.type;
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.typeCard,
                        { 
                          backgroundColor: theme.colors.card,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        }
                      ]}
                      onPress={() => setType(item.type)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.typeIconContainer,
                        { backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.border + '50' }
                      ]}>
                        <Icon size={28} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
                      </View>
                      <Text style={[
                        styles.typeLabel,
                        { color: isSelected ? theme.colors.primary : theme.colors.text }
                      ]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.typeDescription, { color: theme.colors.textSecondary }]}>
                        {item.description}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkMark, { backgroundColor: theme.colors.primary }]}>
                          <Check size={14} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.detailsForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Namn *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  placeholder="T.ex. KTH Datateknik 2024"
                  placeholderTextColor={theme.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Beskrivning</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  placeholder="Beskriv vad din community handlar om..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  maxLength={500}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Synlighet</Text>
                <View style={styles.visibilityOptions}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { 
                        backgroundColor: theme.colors.card,
                        borderColor: visibility === 'open' ? theme.colors.primary : theme.colors.border,
                        borderWidth: visibility === 'open' ? 2 : 1,
                      }
                    ]}
                    onPress={() => setVisibility('open')}
                  >
                    <View style={[styles.visibilityIcon, { backgroundColor: theme.colors.success + '20' }]}>
                      <Globe size={20} color={theme.colors.success} />
                    </View>
                    <View style={styles.visibilityInfo}>
                      <Text style={[styles.visibilityTitle, { color: theme.colors.text }]}>Öppen</Text>
                      <Text style={[styles.visibilityDesc, { color: theme.colors.textSecondary }]}>
                        Alla kan gå med direkt
                      </Text>
                    </View>
                    {visibility === 'open' && (
                      <Check size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { 
                        backgroundColor: theme.colors.card,
                        borderColor: visibility === 'closed' ? theme.colors.primary : theme.colors.border,
                        borderWidth: visibility === 'closed' ? 2 : 1,
                      }
                    ]}
                    onPress={() => setVisibility('closed')}
                  >
                    <View style={[styles.visibilityIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                      <Lock size={20} color={theme.colors.warning} />
                    </View>
                    <View style={styles.visibilityInfo}>
                      <Text style={[styles.visibilityTitle, { color: theme.colors.text }]}>Stängd</Text>
                      <Text style={[styles.visibilityDesc, { color: theme.colors.textSecondary }]}>
                        Kräver godkännande
                      </Text>
                    </View>
                    {visibility === 'closed' && (
                      <Check size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {studyUser?.gymnasium?.name && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                  <GraduationCap size={18} color={theme.colors.primary} />
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    Denna community kopplas automatiskt till {studyUser.gymnasium.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          {step === 2 && (
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.border }]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
                Tillbaka
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { 
                backgroundColor: canProceed ? theme.colors.primary : theme.colors.border,
                flex: step === 1 ? 1 : undefined,
              }
            ]}
            onPress={step === 1 ? () => setStep(2) : handleCreate}
            disabled={!canProceed || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: canProceed ? 'white' : theme.colors.textMuted }]}>
                {step === 1 ? 'Fortsätt' : 'Skapa community'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
    width: 40,
    justifyContent: 'flex-end',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  typeSelection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
  },
  visibilityOptions: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  visibilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityInfo: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  visibilityDesc: {
    fontSize: 13,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
