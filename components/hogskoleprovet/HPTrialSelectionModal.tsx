import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCircle2, Play, BookOpen, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HP_SECTIONS, HP_VERBAL_SECTIONS, HP_QUANTITATIVE_SECTIONS } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';

interface HPTrialSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFullTest: () => void;
  onSelectSection: (sectionCode: string) => void;
}

export function HPTrialSelectionModal({
  visible,
  onClose,
  onSelectFullTest,
  onSelectSection,
}: HPTrialSelectionModalProps) {
  const { theme, isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[COLORS.primary, '#8B5CF6']}
                style={styles.headerIcon}
              >
                <GraduationCap size={22} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Prova gratis
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Välj vad du vill testa
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.colors.surface }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                🎯 Du får testa <Text style={{ fontWeight: '700' }}>en gång gratis</Text>
              </Text>
              <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
                Välj antingen ett komplett prov eller ett enskilt delprov
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
              onPress={onSelectFullTest}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.optionIcon}
              >
                <Play size={28} color="#FFF" fill="#FFF" />
              </LinearGradient>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  Komplett Högskoleprov
                </Text>
                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                  Alla 6 delprov • 235 min • Realistisk provupplevelse
                </Text>
                <View style={styles.benefitsList}>
                  <View style={styles.benefit}>
                    <CheckCircle2 size={14} color={COLORS.primary} />
                    <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                      Fullständig provupplevelse
                    </Text>
                  </View>
                  <View style={styles.benefit}>
                    <CheckCircle2 size={14} color={COLORS.primary} />
                    <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                      Korrekt tidsmätning
                    </Text>
                  </View>
                  <View style={styles.benefit}>
                    <CheckCircle2 size={14} color={COLORS.primary} />
                    <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                      Detaljerad resultatsammanfattning
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                ELLER
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={styles.sectionHeader}>
              <BookOpen size={18} color={theme.colors.text} />
              <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
                Välj ett delprov
              </Text>
            </View>

            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              Verbala delprov
            </Text>
            {HP_SECTIONS.filter(s => HP_VERBAL_SECTIONS.includes(s.code)).map((section) => (
              <TouchableOpacity
                key={section.code}
                style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => onSelectSection(section.code)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[...section.gradientColors] as any}
                  style={styles.sectionIconBg}
                >
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                </LinearGradient>
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionName, { color: theme.colors.text }]}>
                    {section.fullName}
                  </Text>
                  <Text style={[styles.sectionMeta, { color: theme.colors.textSecondary }]}>
                    {section.questionCount} frågor • {section.timeMinutes} min
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              Kvantitativa delprov
            </Text>
            {HP_SECTIONS.filter(s => HP_QUANTITATIVE_SECTIONS.includes(s.code)).map((section) => (
              <TouchableOpacity
                key={section.code}
                style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => onSelectSection(section.code)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[...section.gradientColors] as any}
                  style={styles.sectionIconBg}
                >
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                </LinearGradient>
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionName, { color: theme.colors.text }]}>
                    {section.fullName}
                  </Text>
                  <Text style={[styles.sectionMeta, { color: theme.colors.textSecondary }]}>
                    {section.questionCount} frågor • {section.timeMinutes} min
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 6,
  },
  infoSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 18,
    gap: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
  },
  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sectionMeta: {
    fontSize: 12,
  },
});
