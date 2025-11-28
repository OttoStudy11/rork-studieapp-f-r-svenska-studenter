import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated
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
  Star,
  TrendingUp,
  Award,
  Unlock,
  Infinity,
  Users
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

export default function PremiumScreen() {
  const { isPremium, upgradeToPremium } = usePremium();
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const features = [
    {
      icon: Infinity,
      title: 'Obegränsade Kurser',
      description: 'Lägg till hur många kurser du vill utan begränsningar',
      gradient: ['#8B5CF6', '#7C3AED'] as const,
      badge: 'Populärt'
    },
    {
      icon: BarChart3,
      title: 'Avancerad Statistik',
      description: 'Detaljerade grafer, insikter och trendanalys av din studietid i fokus-sidan',
      gradient: ['#06B6D4', '#0891B2'] as const,
      badge: 'Nytt'
    },
    {
      icon: Sparkles,
      title: 'AI-assisterad Lärande',
      description: 'Personliga studietips och AI-chatbot som hjälper dig studera smartare',
      gradient: ['#EC4899', '#DB2777'] as const,
      badge: 'AI'
    },
    {
      icon: Users,
      title: 'Tävlingsfunktionen',
      description: 'Tävla mot dina vänner i battle-läget och se vem som pluggar mest',
      gradient: ['#EF4444', '#DC2626'] as const
    },
    {
      icon: Sparkles,
      title: 'AI-genererade Flashcards',
      description: 'Automatiskt genererade flashcards med spaced repetition för bättre minne',
      gradient: ['#F59E0B', '#D97706'] as const,
      badge: 'AI'
    },
    {
      icon: Award,
      title: 'Exklusiva Achievements',
      description: 'Lås upp speciella premium-badges och achievements',
      gradient: ['#F59E0B', '#F97316'] as const
    },
    {
      icon: Star,
      title: 'Prioriterad Support',
      description: 'Få snabb och personlig hjälp direkt från teamet',
      gradient: ['#3B82F6', '#2563EB'] as const
    },
    {
      icon: Zap,
      title: 'Allt Framtida Innehåll',
      description: 'Få tillgång till alla nya premium-funktioner automatiskt',
      gradient: ['#10B981', '#059669'] as const,
      badge: 'Kommande'
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
          <View style={[styles.heroSection, { backgroundColor: theme.colors.background }]}>
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Floating Header */}
        <Animated.View 
          style={[
            styles.floatingHeader, 
            { 
              backgroundColor: theme.colors.background,
              opacity: headerOpacity,
              borderBottomColor: theme.colors.border
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.headerBackButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.floatingHeaderTitle, { color: theme.colors.text }]}>Premium</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.colors.card }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <FadeInView delay={100}>
              <Animated.View style={[styles.crownContainer, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  style={styles.crownGradientLarge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Crown size={64} color="#FFF" strokeWidth={2.5} />
                </LinearGradient>
              </Animated.View>
            </FadeInView>

            <SlideInView direction="up" delay={200}>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Studiestugan Pro</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                Lås upp ditt fulla studiepotential
              </Text>
            </SlideInView>

            <FadeInView delay={300}>
              <View style={[styles.trustBadge, { backgroundColor: theme.colors.card }]}>
                <Check size={16} color={theme.colors.success} />
                <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>Över 10,000+ nöjda studenter</Text>
              </View>
            </FadeInView>
          </View>

          {/* Value Proposition */}
          <SlideInView direction="up" delay={400}>
            <View style={styles.valueSection}>
              <View style={styles.valueGrid}>
                <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.valueIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Unlock size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.valueNumber, { color: theme.colors.text }]}>10+</Text>
                  <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Premium Funktioner</Text>
                </View>
                <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.valueIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                    <TrendingUp size={24} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.valueNumber, { color: theme.colors.text }]}>2.5x</Text>
                  <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Snabbare Framsteg</Text>
                </View>
                <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.valueIconContainer, { backgroundColor: theme.colors.warning + '15' }]}>
                    <Award size={24} color={theme.colors.warning} />
                  </View>
                  <Text style={[styles.valueNumber, { color: theme.colors.text }]}>98%</Text>
                  <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Rekommenderar</Text>
                </View>
              </View>
            </View>
          </SlideInView>

          {/* Pricing Cards */}
          <SlideInView direction="up" delay={500}>
            <Text style={[styles.pricingSectionTitle, { color: theme.colors.text }]}>Välj din plan</Text>
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
                  <Text style={[styles.price, { color: theme.colors.text }]}>49 kr</Text>
                  <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>/månad</Text>
                </View>
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
                    <Text style={styles.yearlyPrice}>150 kr</Text>
                  </View>
                  <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>/år</Text>
                </View>
                <Text style={[styles.savingsText, { color: theme.colors.success }]}>Spara 438 kr/år</Text>
              </TouchableOpacity>
            </View>
          </SlideInView>

          {/* Features */}
          <SlideInView direction="up" delay={700}>
            <View style={styles.featuresContainer}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>Allt du får med Premium</Text>
              <Text style={[styles.featuresSubtitle, { color: theme.colors.textSecondary }]}>Kraftfulla funktioner för seriösa studenter</Text>
              
              {features.map((feature, index) => (
                <FadeInView key={index} delay={800 + index * 50}>
                  <View style={[styles.featureItem, { backgroundColor: theme.colors.card }]}>
                    <LinearGradient
                      colors={feature.gradient}
                      style={styles.featureIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <feature.icon size={24} color="#FFFFFF" strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.featureContent}>
                      <View style={styles.featureTitleRow}>
                        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                        {feature.badge && (
                          <View style={[styles.featureBadge, { 
                            backgroundColor: feature.badge === 'Nytt' ? theme.colors.success + '20' :
                                           feature.badge === 'AI' ? theme.colors.primary + '20' :
                                           feature.badge === 'Populärt' ? theme.colors.warning + '20' :
                                           theme.colors.primary + '20'
                          }]}>
                            <Text style={[styles.featureBadgeText, { 
                              color: feature.badge === 'Nytt' ? theme.colors.success :
                                    feature.badge === 'AI' ? theme.colors.primary :
                                    feature.badge === 'Populärt' ? theme.colors.warning :
                                    theme.colors.primary
                            }]}>{feature.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>{feature.description}</Text>
                    </View>
                    <View style={[styles.featureCheck, { backgroundColor: theme.colors.success + '20' }]}>
                      <Check size={16} color={theme.colors.success} strokeWidth={3} />
                    </View>
                  </View>
                </FadeInView>
              ))}
            </View>
          </SlideInView>

          {/* Comparison */}
          <SlideInView direction="up" delay={1200}>
            <View style={styles.comparisonSection}>
              <Text style={[styles.comparisonTitle, { color: theme.colors.text }]}>Varför välja Premium?</Text>
              <View style={[styles.comparisonCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonColumn}>
                    <Text style={[styles.comparisonLabel, { color: theme.colors.textMuted }]}>Gratis</Text>
                  </View>
                  <View style={styles.comparisonColumn}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={styles.premiumLabel}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Crown size={14} color="#FFF" />
                      <Text style={styles.premiumLabelText}>Premium</Text>
                    </LinearGradient>
                  </View>
                </View>
                
                <View style={[styles.comparisonDivider, { backgroundColor: theme.colors.border }]} />
                
                {[
                  { feature: 'Antal kurser', free: 'Begränsat', premium: 'Obegränsat' },
                  { feature: 'AI Chat', free: '—', premium: '✓' },
                  { feature: 'Flashcards', free: '—', premium: '✓' },
                  { feature: 'Tävlingsfunktion', free: '—', premium: '✓' },
                  { feature: 'Avancerad statistik', free: '—', premium: '✓' },
                ].map((item, index) => (
                  <View key={index}>
                    <View style={styles.comparisonRow}>
                      <View style={[styles.comparisonColumn, styles.comparisonFeature]}>
                        <Text style={[styles.comparisonFeatureText, { color: theme.colors.text }]}>{item.feature}</Text>
                      </View>
                      <View style={styles.comparisonColumn}>
                        <Text style={[styles.comparisonValue, { color: theme.colors.textMuted }]}>{item.free}</Text>
                      </View>
                      <View style={styles.comparisonColumn}>
                        <Text style={[styles.comparisonValue, styles.comparisonPremiumValue, { color: theme.colors.primary }]}>{item.premium}</Text>
                      </View>
                    </View>
                    {index < 4 && <View style={[styles.comparisonDivider, { backgroundColor: theme.colors.borderLight }]} />}
                  </View>
                ))}
              </View>
            </View>
          </SlideInView>

          {/* CTA Button */}
          <FadeInView delay={1400}>
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
                <Text style={styles.ctaButtonText}>KÖP PREMIUM</Text>
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>

          {/* Payment Info */}
          <FadeInView delay={1500}>
            <View style={[styles.noPaymentContainer, { backgroundColor: 'transparent', borderRadius: 12, marginHorizontal: 20, paddingVertical: 8, paddingHorizontal: 20 }]}>
              <Text style={[styles.paymentInfoText, { color: theme.colors.textSecondary }]}>Säker betalning • Avbryt när som helst</Text>
            </View>
          </FadeInView>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Sekretesspolicy</Text></TouchableOpacity>
            <Text style={[styles.footerDivider, { color: theme.colors.textMuted }]}>•</Text>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Villkor</Text></TouchableOpacity>
            <Text style={[styles.footerDivider, { color: theme.colors.textMuted }]}>•</Text>
            <TouchableOpacity><Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Återställ köp</Text></TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
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
  crownContainer: {
    marginBottom: 24,
  },
  crownGradientLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  trustText: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  valueGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  valueCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  valueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  paymentInfoText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  featuresSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  comparisonCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonFeature: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  premiumLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonDivider: {
    height: 1,
    marginVertical: 4,
  },
  comparisonFeatureText: {
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonPremiumValue: {
    fontWeight: '700',
  },
});