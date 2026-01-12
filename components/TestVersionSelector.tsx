import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { X, Check, Calendar, FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HPTestVersion } from '@/constants/hogskoleprovet';

interface TestVersionSelectorProps {
  visible: boolean;
  onClose: () => void;
  testVersions: HPTestVersion[];
  selectedVersionId?: string;
  onSelectVersion: (versionId: string) => void;
  sectionName: string;
  sectionColor: string;
}

export default function TestVersionSelector({
  visible,
  onClose,
  testVersions,
  selectedVersionId,
  onSelectVersion,
  sectionName,
  sectionColor,
}: TestVersionSelectorProps) {
  const { theme } = useTheme();

  const handleSelectVersion = (versionId: string) => {
    onSelectVersion(versionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <FileText size={24} color={sectionColor} />
              <View style={styles.headerTextContainer}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Välj testversion
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {sectionName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.versionCard,
                { 
                  backgroundColor: theme.colors.surface,
                  borderColor: !selectedVersionId ? sectionColor : theme.colors.border,
                },
                !selectedVersionId && styles.selectedCard,
              ]}
              onPress={() => {
                onSelectVersion('');
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.versionCardContent}>
                <View style={styles.versionInfo}>
                  <Text style={[styles.versionName, { color: theme.colors.text }]}>
                    Blandade frågor
                  </Text>
                  <Text style={[styles.versionDescription, { color: theme.colors.textSecondary }]}>
                    Slumpmässigt urval från alla tillgängliga frågor
                  </Text>
                </View>
                {!selectedVersionId && (
                  <View style={[styles.checkIcon, { backgroundColor: `${sectionColor}20` }]}>
                    <Check size={18} color={sectionColor} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                Eller välj specifikt test
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            {testVersions.map((version) => {
              const isSelected = selectedVersionId === version.id;
              
              return (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionCard,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: isSelected ? sectionColor : theme.colors.border,
                    },
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectVersion(version.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.versionCardContent}>
                    <View style={[styles.versionIcon, { backgroundColor: `${sectionColor}15` }]}>
                      <Calendar size={20} color={sectionColor} />
                    </View>
                    <View style={styles.versionInfo}>
                      <Text style={[styles.versionName, { color: theme.colors.text }]}>
                        {version.name}
                      </Text>
                      <Text style={[styles.versionDescription, { color: theme.colors.textSecondary }]}>
                        {version.questionCount} frågor
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkIcon, { backgroundColor: `${sectionColor}20` }]}>
                        <Check size={18} color={sectionColor} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Välj en testversion för att öva på specifika prov från tidigare tillfällen
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  versionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  selectedCard: {
    borderWidth: 2,
  },
  versionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  versionDescription: {
    fontSize: 13,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
