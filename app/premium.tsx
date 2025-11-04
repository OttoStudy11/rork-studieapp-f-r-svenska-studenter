import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Crown, 
  Check, 
  BarChart3, 
  ArrowLeft,
  Shield,
  Clock,
  Sparkles,
  Zap,
  Star
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const { isPremium, upgradeToPremium } = usePremium();
  const { theme, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    {
      icon: BarChart3,
      title: 'Avancerad Statistik',
      description: 'Detaljerade grafer och insikter om din studietid',
      gradient: [theme.colors.primary, '#7C3AED'] as const
    },
    {
      icon: Shield,
      title: 'Distraktionsblockerare',
      description: 'Blockera appar och webbplatser under studiesessioner',
      gradient: ['#10B981', '#059669'] as const
    },
    {
      icon: Clock,
      title: 'Anpassade Timers',
      description: 'Pomodoro, stoppur och skräddarsydda studietimers',
      gradient: ['#F59E0B', '#D97706'] as const
    },
    {
      icon: Sparkles,
      title: 'AI-assisterad lärande',
      description: 'Personliga studietips baserade på dina vanor',
      gradient: ['#EC4899', '#8B5CF6'] as const
    },
    {
      icon: Zap,
      title: 'Obegränsad Synkning',
      description: 'Synka dina data mellan alla enheter',
      gradient: ['#3B82F6', '#06B6D4'] as const
    },
    {
      icon: Star,
      title: 'Prioriterad Support',
      description: 'Få snabb hjälp när du behöver det',
      gradient: ['#F59E0B', '#EF4444'] as const
    }
  ];

  const handleUpgrade = async () => {
    console.log('Upgrading to premium:', selectedPlan);
    await upgradeToPremium();
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.colors.card }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <FadeInView delay={200}>
              <View style={styles.premiumBadgeContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.crownGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Crown size={60} color="#FFF" />
                </LinearGradient>
              </View>
            </FadeInView>
            <SlideInView direction="up" delay={300}>
              <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>Du är Premium!</Text>
              <Text style={[styles.premiumSubtitle, { color: theme.colors.textSecondary }]}>
                Tack för att du stödjer Studiestugan
              </Text>
            </SlideInView>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <SlideInView direction="up" delay={400}>
              <View style={styles.benefitsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dina Premium-fördelar</Text>
                {features.map((feature, index) => (
                  <FadeInView key={index} delay={500 + index * 100}>
                    <View style={[styles.benefitItem, { backgroundColor: theme.colors.card }]}>
                      <LinearGradient
                        colors={feature.gradient}
                        style={styles.iconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <feature.icon size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={styles.benefitContent}>
                        <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                        <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
                          {feature.description}
                        </Text>
                      </View>
                      <View style={[styles.checkContainer, { backgroundColor: theme.colors.success + '20' }]}>
                        <Check size={20} color={theme.colors.success} />
                      </View>
                    </View>
                  </FadeInView>
                ))}
              </View>
            </SlideInView>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.colors.card }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <FadeInView delay={100}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Studiestugan Pro</Text>
              <Text style={[styles.titleSubtitle, { color: theme.colors.textSecondary }]}>Uppgradera din studiupplevelse</Text>
            </FadeInView>
          </View>

          {/* Pricing Cards */}
          <SlideInView direction="up" delay={200}>
            <View style={styles.pricingContainer}>
              {/* Monthly Plan */}
              <TouchableOpacity
                style={[
                  styles.pricingCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  selectedPlan === 'monthly' && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                {selectedPlan === 'monthly' && (
                  <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                    <Check size={14} color="#FFF" />
                  </View>
                )}
                <View style={styles.pricingContent}>
                  <Text style={[styles.price, { color: theme.colors.text }]}>39 kr</Text>
                  <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>/månad</Text>
                </View>
                <Text style={[styles.trialText, { color: theme.colors.textMuted }]}>3 dagars gratis provperiod</Text>
              </TouchableOpacity>

              {/* Yearly Plan - Featured */}
              <TouchableOpacity
                style={[
                  styles.pricingCard, 
                  styles.featuredCard,
                  { backgroundColor: theme.colors.card },
                  selectedPlan === 'yearly' && { borderWidth: 2 }
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <LinearGradient
                  colors={[theme.colors.success, '#059669']}
                  style={[styles.dealBadge, { flexDirection: 'row', gap: 6 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Sparkles size={14} color="#FFF" />
                  <Text style={styles.dealText}>SPARA 50% - POPULÄRT VAL</Text>
                </LinearGradient>
                {selectedPlan === 'yearly' && (
                  <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary, top: 40 }]}>
                    <Check size={14} color="#FFF" />
                  </View>
                )}
                <View style={styles.pricingContent}>
                  <View style={[styles.yearlyPriceContainer, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.yearlyPrice}>129 kr</Text>
                  </View>
                  <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>/år</Text>
                </View>
                <Text style={[styles.savingsText, { color: theme.colors.success }]}>Spara 339 kr/år</Text>
                <Text style={[styles.trialText, { color: theme.colors.textMuted }]}>7 dagars gratis provperiod</Text>
              </TouchableOpacity>
            </View>
          </SlideInView>

          {/* Features */}
          <SlideInView direction="up" delay={300}>
            <View style={styles.featuresContainer}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>Vad ingår i Premium?</Text>
              {features.map((feature, index) => (
                <FadeInView key={index} delay={400 + index * 100}>
                  <View style={[styles.featureItem, { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 12 }]}>
                    <LinearGradient
                      colors={feature.gradient}
                      style={styles.featureIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <feature.icon size={28} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                      <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>{feature.description}</Text>
                    </View>
                    <Check size={20} color={theme.colors.success} />
                  </View>
                </FadeInView>
              ))}
            </View>
          </SlideInView>

          {/* No Payment Due */}
          <FadeInView delay={800}>
            <View style={[styles.noPaymentContainer, { backgroundColor: theme.colors.success + '15', borderRadius: 12, marginHorizontal: 20, paddingVertical: 16, paddingHorizontal: 20 }]}>
              <Shield size={20} color={theme.colors.success} />
              <Text style={[styles.noPaymentText, { color: theme.colors.success }]}>Ingen betalning nu - avbryt när som helst</Text>
            </View>
          </FadeInView>

          {/* CTA Button */}
          <FadeInView delay={900}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleUpgrade}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#7C3AED']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={20} color="#FFF" />
                <Text style={styles.ctaButtonText}>BÖRJA GRATIS PROVPERIOD</Text>
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Sekretesspolicy</Text></TouchableOpacity>
            <Text style={[styles.footerDivider, { color: theme.colors.textMuted }]}>•</Text>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Villkor</Text></TouchableOpacity>
            <Text style={[styles.footerDivider, { color: theme.colors.textMuted }]}>•</Text>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Återställ köp</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B23',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  pricingCard: {
    backgroundColor: '#2A2B35',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3B47',
  },
  featuredCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    position: 'relative',
  },
  dealBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  dealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pricingContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  yearlyPriceContainer: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearlyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  trialText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  noPaymentText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  benefitsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2B35',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  premiumBadgeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  crownGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  footerDivider: {
    fontSize: 14,
  },
});