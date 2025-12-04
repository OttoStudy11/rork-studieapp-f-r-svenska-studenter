import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Crown, 
  Check, 
  BarChart3, 
  ArrowLeft,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Award,
  Unlock,
  Infinity,
  Users,
  AlertCircle,
  RefreshCw,
  X,
  Shield,
  ExternalLink,
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import {
  isMonthlyPackage,
  isAnnualPackage,
  getDebugMode,
} from '@/services/revenuecat';

// ============================================================================
// CONFIGURATION - PLACEHOLDER URLS
// ============================================================================
// IMPORTANT: Ersätt dessa med riktiga länkar innan publicering!
// Du kan använda GitHub Pages för att snabbt skapa en enkel sida med policies.
const TERMS_URL = 'https://placeholder.example/terms';
const PRIVACY_URL = 'https://placeholder.example/privacy';

// Privacy policy placeholder text för in-app modal
const PRIVACY_POLICY_PLACEHOLDER = `
INTEGRITETSPOLICY - STUDIESTUGAN

Senast uppdaterad: [DATUM]

1. INLEDNING
Denna integritetspolicy beskriver hur Studiestugan ("vi", "oss", "vår") samlar in, använder och skyddar dina personuppgifter.

2. INFORMATION VI SAMLAR IN
- Kontouppgifter (e-post, användarnamn)
- Studiestatistik och framsteg
- Betalningsinformation (hanteras av Apple/Google)
- Användningsdata för att förbättra appen

3. HUR VI ANVÄNDER INFORMATIONEN
- Tillhandahålla våra tjänster
- Förbättra användarupplevelsen
- Hantera prenumerationer
- Kommunicera med dig

4. DELNING AV INFORMATION
Vi delar inte dina personuppgifter med tredje part förutom:
- När det krävs enligt lag
- För betalningshantering via Apple/Google

5. DATASÄKERHET
Vi använder branschstandard säkerhetsåtgärder för att skydda dina uppgifter.

6. DINA RÄTTIGHETER
Du har rätt att:
- Begära tillgång till dina uppgifter
- Begära rättelse eller radering
- Invända mot behandling

7. KONTAKT
[Kontaktinformation]

---
OBS: Detta är en placeholder-policy. 
Ersätt med en riktig juridiskt granskad policy innan publicering.
`;

// ============================================================================
// TYPES
// ============================================================================
interface PricingPlan {
  id: 'monthly' | 'yearly';
  pkg?: PurchasesPackage;
  title: string;
  price: string;
  period: string;
  savings?: string;
  isFeatured: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function PremiumScreen() {
  const { isPremium, getOfferings, purchasePackage, restorePurchases, isOffline } = usePremium();
  const { theme } = useTheme();
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for crown
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

  // Load offerings with exponential backoff retry
  const loadOfferings = useCallback(async (attempt: number = 0) => {
    setIsLoadingOfferings(true);
    setLoadError(null);
    
    try {
      console.log('[Premium Screen] Loading offerings, attempt:', attempt + 1);
      const result = await getOfferings();
      
      if (result) {
        setOfferings(result);
        setLoadError(null);
        console.log('[Premium Screen] Offerings loaded successfully');
      } else {
        // No offerings available
        if (attempt < 2) {
          // Retry with exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[Premium Screen] Retrying in ${delay}ms...`);
          setTimeout(() => loadOfferings(attempt + 1), delay);
          return;
        }
        setLoadError('Produkter ej tillgängliga. Försök igen om en stund.');
      }
    } catch (error) {
      console.error('[Premium Screen] Failed to load offerings:', error);
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => loadOfferings(attempt + 1), delay);
        return;
      }
      setLoadError('Kunde inte ladda produkter. Kontrollera din internetanslutning.');
    } finally {
      setIsLoadingOfferings(false);
    }
  }, [getOfferings]);

  useEffect(() => {
    loadOfferings(0);
  }, [loadOfferings]);

  // Get pricing plans from offerings
  const pricingPlans = React.useMemo((): PricingPlan[] => {
    if (!offerings) {
      // Fallback display while loading
      return [
        {
          id: 'monthly',
          title: 'Månadsvis',
          price: '...',
          period: '/månad',
          isFeatured: false,
        },
        {
          id: 'yearly',
          title: 'Årsvis',
          price: '...',
          period: '/år',
          savings: 'Laddar...',
          isFeatured: true,
        },
      ];
    }

    const packages = offerings.availablePackages;
    const monthlyPkg = packages.find(p => isMonthlyPackage(p));
    const yearlyPkg = packages.find(p => isAnnualPackage(p));

    const plans: PricingPlan[] = [];

    if (monthlyPkg) {
      plans.push({
        id: 'monthly',
        pkg: monthlyPkg,
        title: 'Månadsvis',
        price: monthlyPkg.product.priceString,
        period: '/månad',
        isFeatured: false,
      });
    }

    if (yearlyPkg) {
      // Calculate savings if monthly price is available
      let savings = '';
      if (monthlyPkg) {
        const monthlyPrice = monthlyPkg.product.price;
        const yearlyPrice = yearlyPkg.product.price;
        const yearlyEquivalentMonthly = yearlyPrice / 12;
        const savingsPercent = Math.round((1 - yearlyEquivalentMonthly / monthlyPrice) * 100);
        if (savingsPercent > 0) {
          savings = `Spara ${savingsPercent}%`;
        }
      }

      plans.push({
        id: 'yearly',
        pkg: yearlyPkg,
        title: 'Årsvis',
        price: yearlyPkg.product.priceString,
        period: '/år',
        savings: savings || 'Bäst värde',
        isFeatured: true,
      });
    }

    // If no packages found, show debug info in dev mode
    if (plans.length === 0 && getDebugMode()) {
      console.warn('[Premium Screen] No packages found. Available packages:', 
        packages.map(p => ({ id: p.identifier, type: p.packageType }))
      );
    }

    return plans;
  }, [offerings]);

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
      description: 'Detaljerade grafer, insikter och trendanalys av din studietid',
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

  const handlePurchase = async () => {
    if (!offerings || isPurchasing) return;
    
    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);
    if (!selectedPlanData?.pkg) {
      console.error('[Premium Screen] Selected package not found');
      return;
    }
    
    setIsPurchasing(true);
    try {
      const success = await purchasePackage(selectedPlanData.pkg);
      if (success) {
        console.log('[Premium Screen] Purchase successful');
        // User is now premium, UI will update automatically
      }
    } catch (error) {
      console.error('[Premium Screen] Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (isRestoring) return;
    
    setIsRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        router.back();
      }
    } catch (error) {
      console.error('[Premium Screen] Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRetry = () => {
    loadOfferings(0);
  };

  const openExternalLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn('[Premium Screen] Cannot open URL:', url);
      }
    } catch (error) {
      console.error('[Premium Screen] Error opening URL:', error);
    }
  };

  // Premium user view
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

          {/* Offline/Error Notice */}
          {(isOffline || loadError) && (
            <SlideInView direction="up" delay={350}>
              <View style={[styles.noticeContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                <AlertCircle size={20} color={theme.colors.warning} />
                <Text style={[styles.noticeText, { color: theme.colors.text }]}>
                  {loadError || 'Du är offline. Vissa funktioner kan vara begränsade.'}
                </Text>
                {loadError && (
                  <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                    <RefreshCw size={16} color={theme.colors.primary} />
                    <Text style={[styles.retryText, { color: theme.colors.primary }]}>Försök igen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SlideInView>
          )}

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
            
            {isLoadingOfferings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Laddar priser...
                </Text>
              </View>
            ) : pricingPlans.length === 0 ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.card }]}>
                <AlertCircle size={32} color={theme.colors.warning} />
                <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
                  Produkter ej tillgängliga
                </Text>
                <Text style={[styles.errorDescription, { color: theme.colors.textSecondary }]}>
                  Vi kunde inte ladda produkterna just nu. Försök igen om en stund.
                </Text>
                <TouchableOpacity 
                  style={[styles.errorRetryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleRetry}
                >
                  <RefreshCw size={18} color="#FFF" />
                  <Text style={styles.errorRetryText}>Försök igen</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pricingContainer}>
                {pricingPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.pricingCard,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                      plan.isFeatured && styles.featuredCard,
                      selectedPlan === plan.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                    disabled={!plan.pkg}
                  >
                    {plan.isFeatured && plan.savings && (
                      <LinearGradient
                        colors={[theme.colors.success, '#059669']}
                        style={styles.dealBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Sparkles size={14} color="#FFF" />
                        <Text style={styles.dealText}>{plan.savings.toUpperCase()}</Text>
                      </LinearGradient>
                    )}
                    {selectedPlan === plan.id && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary, top: plan.isFeatured ? 40 : 12 }]}>
                        <Check size={14} color="#FFF" />
                      </View>
                    )}
                    <View style={[styles.pricingContent, plan.isFeatured && { marginTop: 20 }]}>
                      <Text style={[styles.planTitle, { color: theme.colors.textSecondary }]}>{plan.title}</Text>
                      <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: theme.colors.text }]}>{plan.price}</Text>
                        <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>{plan.period}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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

          {/* CTA Button */}
          <FadeInView delay={1400}>
            <TouchableOpacity
              style={[
                styles.ctaButton, 
                { 
                  backgroundColor: theme.colors.primary, 
                  opacity: (isPurchasing || isLoadingOfferings || pricingPlans.length === 0) ? 0.6 : 1 
                }
              ]}
              onPress={handlePurchase}
              disabled={isPurchasing || isLoadingOfferings || pricingPlans.length === 0}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#7C3AED']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Crown size={20} color="#FFF" />
                    <Text style={styles.ctaButtonText}>
                      {isLoadingOfferings ? 'LADDAR...' : 'STARTA PREMIUM'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>

          {/* Apple Subscription Terms (Required) */}
          <FadeInView delay={1450}>
            <View style={[styles.subscriptionTerms, { backgroundColor: theme.colors.card }]}>
              <View style={styles.termsHeader}>
                <Shield size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.termsHeaderText, { color: theme.colors.textSecondary }]}>
                  Prenumerationsinformation
                </Text>
              </View>
              <Text style={[styles.termsText, { color: theme.colors.textMuted }]}>
                • Abonnemanget förnyas automatiskt tills det avslutas.{'\n'}
                • Debitering sker via ditt Apple-konto.{'\n'}
                • Avsluta när som helst via App Store → Konto → Prenumerationer.{'\n'}
                • Återbetalningar hanteras av Apple.
              </Text>
            </View>
          </FadeInView>

          {/* Restore Purchases */}
          <FadeInView delay={1500}>
            <TouchableOpacity 
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={[styles.restoreText, { color: theme.colors.primary }]}>
                  Återställ köp
                </Text>
              )}
            </TouchableOpacity>
          </FadeInView>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Integritetspolicy</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDivider, { color: theme.colors.textMuted }]}>•</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <Text style={[styles.footerLink, { color: theme.colors.textMuted }]}>Användarvillkor</Text>
            </TouchableOpacity>
          </View>

          {/* Debug info in dev mode */}
          {getDebugMode() && offerings && (
            <View style={[styles.debugContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.debugTitle, { color: theme.colors.warning }]}>DEBUG INFO</Text>
              <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
                Offering ID: {offerings.identifier}{'\n'}
                Packages: {offerings.availablePackages.map(p => p.identifier).join(', ')}
              </Text>
            </View>
          )}
        </Animated.ScrollView>
      </SafeAreaView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Integritetspolicy</Text>
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowPrivacyModal(false)}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalText, { color: theme.colors.text }]}>
              {PRIVACY_POLICY_PLACEHOLDER}
            </Text>
            <TouchableOpacity 
              style={[styles.externalLinkButton, { borderColor: theme.colors.border }]}
              onPress={() => openExternalLink(PRIVACY_URL)}
            >
              <ExternalLink size={16} color={theme.colors.primary} />
              <Text style={[styles.externalLinkText, { color: theme.colors.primary }]}>
                Öppna i webbläsare
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Användarvillkor</Text>
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowTermsModal(false)}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalText, { color: theme.colors.text }]}>
              ANVÄNDARVILLKOR - STUDIESTUGAN{'\n\n'}
              Senast uppdaterad: [DATUM]{'\n\n'}
              1. GODKÄNNANDE AV VILLKOR{'\n'}
              Genom att använda Studiestugan godkänner du dessa villkor.{'\n\n'}
              2. TJÄNSTEBESKRIVNING{'\n'}
              Studiestugan är en studieapp som hjälper dig att planera och följa upp dina studier.{'\n\n'}
              3. PRENUMERATIONER{'\n'}
              • Premium-prenumeration ger tillgång till extra funktioner{'\n'}
              • Priser visas i appen innan köp{'\n'}
              • Prenumerationer förnyas automatiskt{'\n'}
              • Avsluta via App Store / Google Play{'\n\n'}
              4. ANVÄNDARENS ANSVAR{'\n'}
              Du ansvarar för att hålla din kontoinformation säker.{'\n\n'}
              5. ÄNDRINGAR{'\n'}
              Vi kan uppdatera dessa villkor. Fortsatt användning innebär godkännande.{'\n\n'}
              ---{'\n'}
              OBS: Detta är placeholder-villkor. Ersätt med juridiskt granskade villkor innan publicering.
            </Text>
            <TouchableOpacity 
              style={[styles.externalLinkButton, { borderColor: theme.colors.border }]}
              onPress={() => openExternalLink(TERMS_URL)}
            >
              <ExternalLink size={16} color={theme.colors.primary} />
              <Text style={[styles.externalLinkText, { color: theme.colors.primary }]}>
                Öppna i webbläsare
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
    fontWeight: '700' as const,
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
    fontWeight: '800' as const,
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
    fontWeight: '600' as const,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  errorRetryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 16,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
  },
  featuredCard: {
    borderWidth: 2,
  },
  dealBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold' as const,
    letterSpacing: 0.5,
  },
  pricingContent: {
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  pricePeriod: {
    fontSize: 16,
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
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
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
    fontWeight: '700' as const,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
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
    lineHeight: 20,
  },
  ctaButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
    letterSpacing: 0.5,
  },
  subscriptionTerms: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  termsHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 20,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footerLink: {
    fontSize: 14,
  },
  footerDivider: {
    fontSize: 14,
  },
  debugContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  benefitsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
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
    fontWeight: 'bold' as const,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  externalLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  externalLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
