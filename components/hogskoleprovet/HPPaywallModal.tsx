import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, CheckCircle2, Sparkles, Zap, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/design-system';

interface HPPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  type: 'before_trial' | 'after_trial';
  trialScore?: number;
  trialType?: 'full_test' | 'section';
  trialTarget?: string;
}

export function HPPaywallModal({
  visible,
  onClose,
  onUpgrade,
  type,
  trialScore,
  trialType,
  trialTarget,
}: HPPaywallModalProps) {
  const { theme, isDark } = useTheme();

  const isBeforeTrial = type === 'before_trial';
  const isAfterTrial = type === 'after_trial';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <LinearGradient
            colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
            style={styles.headerGradient}
          >
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
            >
              <X size={22} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.crownContainer}>
              <View style={styles.crownBg}>
                <Crown size={48} color="#FFD700" fill="#FFD700" />
              </View>
              <Sparkles size={24} color="#FFF" style={styles.sparkle1} />
              <Sparkles size={18} color="#FFF" style={styles.sparkle2} />
            </View>

            {isBeforeTrial && (
              <>
                <Text style={styles.headerTitle}>Prova Högskoleprovet</Text>
                <Text style={styles.headerSubtitle}>
                  Testa en gång gratis • Upplås allt med Premium
                </Text>
              </>
            )}

            {isAfterTrial && (
              <>
                <Text style={styles.headerTitle}>Bra jobbat! 🎉</Text>
                <Text style={styles.headerSubtitle}>
                  {trialScore !== undefined && `Du fick ${trialScore.toFixed(1)}% rätt`}
                </Text>
                <View style={styles.trialCompleteBadge}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.trialCompleteText}>Provperiod slutförd</Text>
                </View>
              </>
            )}
          </LinearGradient>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {isAfterTrial && (
              <View style={[styles.motivationCard, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
                <TrendingUp size={24} color="#10B981" />
                <View style={styles.motivationText}>
                  <Text style={[styles.motivationTitle, { color: theme.colors.text }]}>
                    Fortsätt förbättra ditt resultat!
                  </Text>
                  <Text style={[styles.motivationSubtitle, { color: theme.colors.textSecondary }]}>
                    Med Premium får du obegränsad tillgång till alla prov och kan träna tills du når ditt mål
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Vad ingår i Premium?
              </Text>
              
              <View style={styles.featuresList}>
                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <CheckCircle2 size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      Obegränsat antal prov
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Öva så mycket du vill på alla delprov och kompletta högskoleprov
                    </Text>
                  </View>
                </View>

                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <Zap size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      AI-genererade frågor
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Få anpassade övningar baserade på dina svagheter
                    </Text>
                  </View>
                </View>

                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <TrendingUp size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      Detaljerad statistik
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Se din utveckling över tid och identifiera förbättringsområden
                    </Text>
                  </View>
                </View>

                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <CheckCircle2 size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      Alla provversioner
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Tillgång till historiska prov från olika år och säsonger
                    </Text>
                  </View>
                </View>

                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <CheckCircle2 size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      Realistisk provmiljö
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Träna under tidsbegränsning precis som på riktiga provet
                    </Text>
                  </View>
                </View>

                <View style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                    <CheckCircle2 size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      Expertråd & tips
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      Få tillgång till studietips och strategier från experter
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {isBeforeTrial && (
              <View style={[styles.trialInfoCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.trialInfoTitle, { color: theme.colors.text }]}>
                  🎯 Prova gratis först
                </Text>
                <Text style={[styles.trialInfoText, { color: theme.colors.textSecondary }]}>
                  Du kan testa ett komplett prov eller ett enskilt delprov helt gratis innan du bestämmer dig
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {isBeforeTrial && (
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
                onPress={onClose}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                  Testa gratis först
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={20} color="#000" />
                <Text style={styles.primaryButtonText}>
                  {isBeforeTrial ? 'Se Premium-planer' : 'Uppgradera till Premium'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  crownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  crownBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    right: -10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  trialCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  trialCompleteText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  scroll: {
    maxHeight: 400,
  },
  motivationCard: {
    flexDirection: 'row',
    padding: 18,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    gap: 14,
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  motivationSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  trialInfoCard: {
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 14,
  },
  trialInfoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  trialInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#000',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
