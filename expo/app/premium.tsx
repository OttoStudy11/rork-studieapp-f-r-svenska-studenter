import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Platform,
  Alert,
  Dimensions,
  LayoutAnimation,
  UIManager,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { usePremium } from '@/contexts/PremiumContext';
import {
  Crown,
  Check,
  X,
  BarChart3,
  ArrowLeft,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Award,
  Unlock,
  Users,
  AlertCircle,
  RefreshCw,
  Shield,
  ExternalLink,
  Palette,
  User,
  Brain,
  Flame,
  BookOpen,
  Target,
  Layers,
  Clock,
  Lock,
  ChevronDown,
  Quote,
} from 'lucide-react-native';
import { FadeInView, SlideInView, AnimatedPressable } from '@/components/Animations';
import {
  isMonthlyPackage,
  isAnnualPackage,
  getDebugMode,
} from '@/services/revenuecat';
import { PRIVACY_POLICY_TEXT } from '@/components/LegalText';

// ============================================================================
// ENABLE LAYOUT ANIMATION ON ANDROID
// ============================================================================
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// CONFIGURATION
// ============================================================================
const TERMS_URL = 'https://studiestugan.se/terms';
const PRIVACY_URL = 'https://studiestugan.se/privacy';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Warm Scandinavian light palette
const PALETTE = {
  bgWarm: '#FAFAF8',
  bgSoft: '#F7F7F5',
  white: '#FFFFFF',
  indigo: '#6366F1',
  indigoDark: '#4F46E5',
  indigoLight: '#818CF8',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  emerald: '#10B981',
  emeraldDark: '#059669',
  amber: '#F59E0B',
  rose: '#F43F5E',
  cyan: '#06B6D4',
  textDark: '#1A1A2E',
  textMid: '#4A4A5E',
  textLight: '#7A7A8E',
  textMuted: '#A0A0B0',
  borderLight: 'rgba(99, 102, 241, 0.08)',
  borderGlass: 'rgba(255, 255, 255, 0.6)',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBgLight: 'rgba(255, 255, 255, 0.55)',
} as const;

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

interface FeatureItem {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  description: string;
  gradient: readonly [string, string];
  badge?: string;
}

interface ComparisonRow {
  label: string;
  free: boolean | string;
  premium: boolean | string;
}

interface StatItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  gradient: readonly [string, string];
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarColor: readonly [string, string];
  initials: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ============================================================================
// DATA
// ============================================================================
const FEATURES: FeatureItem[] = [
  {
    icon: Sparkles,
    title: 'Obegränsad AI',
    description: 'Generera quiz och flashcards utan veckogräns',
    gradient: ['#6366F1', '#818CF8'] as const,
    badge: 'Nytt',
  },
  {
    icon: Layers,
    title: 'AI Flashcards',
    description: 'Obegränsade AI-flashcards med spaced repetition',
    gradient: ['#8B5CF6', '#A78BFA'] as const,
    badge: 'AI',
  },
  {
    icon: Target,
    title: 'AI Quiz-generator',
    description: 'Skapa quiz från valfritt studiematerial på sekunder',
    gradient: ['#06B6D4', '#22D3EE'] as const,
    badge: 'AI',
  },
  {
    icon: BookOpen,
    title: 'Komplett HP-övning',
    description: 'Alla 8 delprov med riktiga frågor och tidsgränser',
    gradient: ['#F59E0B', '#FBBF24'] as const,
  },
  {
    icon: BookOpen,
    title: 'Full ordbank',
    description: 'Komplett ordlista med SRS och minnestips',
    gradient: ['#10B981', '#34D399'] as const,
  },
  {
    icon: Target,
    title: 'Personliga studieplaner',
    description: 'AI skapar en plan anpassad efter dina mål',
    gradient: ['#F43F5E', '#FB7185'] as const,
  },
  {
    icon: BarChart3,
    title: 'Avancerad statistik',
    description: 'Detaljerade grafer, trender och prediktioner',
    gradient: ['#6366F1', '#4F46E5'] as const,
  },
  {
    icon: Brain,
    title: 'AI Studiecoach',
    description: 'Personlig AI-coach som guidar dig mot dina mål',
    gradient: ['#8B5CF6', '#7C3AED'] as const,
    badge: 'AI',
  },
  {
    icon: Flame,
    title: 'Studie-streaks',
    description: 'Håll motivation uppe med streaks och belöningar',
    gradient: ['#F59E0B', '#EA580C'] as const,
  },
  {
    icon: Zap,
    title: 'Snabbare inlärning',
    description: 'Smart repetition som maximerar retention',
    gradient: ['#06B6D4', '#0891B2'] as const,
  },
];

const COMPARISON: ComparisonRow[] = [
  { label: 'AI-genereringar per vecka', free: '10 st', premium: 'Obegränsat' },
  { label: 'AI Flashcards', free: false, premium: true },
  { label: 'AI Quiz-generator', free: false, premium: true },
  { label: 'Högskoleprov-övning', free: 'Begränsat', premium: 'Komplett' },
  { label: 'Ordbank', free: 'Grundläggande', premium: 'Fullständig' },
  { label: 'Studieplaner', free: false, premium: true },
  { label: 'Avancerad statistik', free: false, premium: true },
  { label: 'AI Studiecoach', free: false, premium: true },
  { label: 'Antal kurser', free: '3', premium: 'Obegränsat' },
  { label: 'Anpassade teman', free: false, premium: true },
  { label: 'Tävlingsläge', free: false, premium: true },
  { label: 'Premium-avatarer', free: false, premium: true },
];

const STATS: StatItem[] = [
  {
    value: '2 500+',
    label: 'Studenter',
    icon: Users,
    gradient: ['#6366F1', '#818CF8'] as const,
  },
  {
    value: '200+',
    label: 'Premium-medlemmar',
    icon: Crown,
    gradient: ['#F59E0B', '#FBBF24'] as const,
  },
  {
    value: '4.8★',
    label: 'Snittbetyg',
    icon: Star,
    gradient: ['#10B981', '#34D399'] as const,
  },
  {
    value: '10k+',
    label: 'Studiesessioner',
    icon: TrendingUp,
    gradient: ['#8B5CF6', '#A78BFA'] as const,
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Erik Lindqvist',
    role: 'HP-student',
    quote: 'Höjde mitt HP-resultat med 0.6 på bara två månader. AI-coachen gav mig exakt det jag behövde fokusera på.',
    rating: 5,
    avatarColor: ['#6366F1', '#818CF8'] as const,
    initials: 'EL',
  },
  {
    name: 'Sofia Andersson',
    role: 'Gymnasiet – SAES',
    quote: 'Studiestugan har helt förändrat hur jag pluggar. Flashcards och quiz sparar mig timmar varje vecka.',
    rating: 5,
    avatarColor: ['#8B5CF6', '#A78BFA'] as const,
    initials: 'SA',
  },
  {
    name: 'Johan Bergström',
    role: 'Premium-användare',
    quote: 'Värt varje krona. Statistiken visar exakt var jag står och streaks håller mig motiverad varje dag.',
    rating: 5,
    avatarColor: ['#10B981', '#34D399'] as const,
    initials: 'JB',
  },
];

const FAQS: FAQItem[] = [
  {
    question: 'Kan jag avbryta när som helst?',
    answer: 'Ja, absolut. Du kan avbryta din prenumeration när som helst via App Store eller Google Play. Du behåller full Premium-åtkomst till slutet av den fakturerade perioden.',
  },
  {
    question: 'Vad händer efter provperioden?',
    answer: 'Efter den 3-dagars gratis provperioden övergår prenumerationen automatiskt till vald plan (månadsvis eller årsvis). Du debiteras inte förrän provperioden är slut och kan avbryta innan dess utan kostnad.',
  },
  {
    question: 'Fungerar Premium på alla enheter?',
    answer: 'Ja, din Premium-prenumeration är kopplad till ditt Studiestugan-konto och fungerar på alla enheter där du är inloggad — iPhone, iPad och Android.',
  },
  {
    question: 'Är min data säker?',
    answer: 'Ja. All din data lagras säkert med end-to-end-kryptering via Supabase. Vi delar aldrig din information med tredje part. Du kan radera ditt konto och all data när som helst.',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function PremiumScreen() {
  const { isPremium, getOfferings, purchasePackage, restorePurchases, isOffline } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for crown
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // Floating orb animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb3Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(orb3Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();
  }, [orb1Anim, orb2Anim, orb3Anim]);

  // Yearly card glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim]);

  // Load offerings with exponential backoff retry
  const loadOfferings = useCallback(async (attempt: number = 0) => {
    if (Platform.OS === 'web') {
      setIsLoadingOfferings(false);
      setLoadError('RevenueCat stöds inte på web. Testa på iOS eller Android.');
      return;
    }

    if (attempt === 0) {
      setIsLoadingOfferings(true);
      setLoadError(null);
    }

    try {
      const result = await getOfferings();
      if (result) {
        setOfferings(result);
        setLoadError(null);
        setIsLoadingOfferings(false);
      } else {
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          setTimeout(() => loadOfferings(attempt + 1), delay);
          return;
        }
        setLoadError('Produkter ej tillgängliga. Försök igen om en stund.');
        setIsLoadingOfferings(false);
      }
    } catch (error) {
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => loadOfferings(attempt + 1), delay);
        return;
      }
      setLoadError('Kunde inte ladda produkter. Kontrollera din internetanslutning.');
      setIsLoadingOfferings(false);
    }
  }, [getOfferings]);

  useEffect(() => {
    void loadOfferings(0);
  }, [loadOfferings]);

  // Pricing plans from offerings
  const pricingPlans = useMemo((): PricingPlan[] => {
    if (!offerings) {
      return [
        { id: 'monthly', title: 'Månadsvis', price: '...', period: '/månad', isFeatured: false },
        { id: 'yearly', title: 'Årsvis', price: '...', period: '/år', savings: 'Laddar...', isFeatured: true },
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

    if (plans.length === 0 && packages.length > 0) {
      packages.forEach(pkg => {
        const isAnnual = isAnnualPackage(pkg);
        plans.push({
          id: isAnnual ? 'yearly' : 'monthly',
          pkg,
          title: isAnnual ? 'Årsvis' : 'Månadsvis',
          price: pkg.product.priceString,
          period: isAnnual ? '/år' : '/månad',
          savings: isAnnual ? 'Bäst värde' : undefined,
          isFeatured: isAnnual,
        });
      });
    }

    return plans;
  }, [offerings]);

  const canPurchase = !isPurchasing && !isLoadingOfferings && !!offerings && pricingPlans.length > 0;

  const handlePurchase = async () => {
    if (isPurchasing) return;
    if (isLoadingOfferings) {
      Alert.alert('Vänligen vänta', 'Produkter laddas fortfarande. Försök igen om ett ögonblick.');
      return;
    }
    if (!offerings) {
      Alert.alert('Produkter ej tillgängliga', 'Vi kunde inte ladda produkter just nu. Kontrollera din internetanslutning och försök igen.', [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Försök igen', onPress: () => loadOfferings(0) },
      ]);
      return;
    }

    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);
    if (!selectedPlanData?.pkg) {
      Alert.alert('Fel', 'Vald prenumeration kunde inte hittas. Försök igen.');
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchasePackage(selectedPlanData.pkg);
      if (success) {
        router.back();
      }
    } catch (error) {
      Alert.alert('Köpfel', 'Något gick fel vid köpet. Försök igen eller kontakta support.');
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
      // handled in context
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRetry = () => {
    void loadOfferings(0);
  };

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const openExternalLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      // silently ignore
    }
  };

  // Scroll listener for sticky CTA
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const shouldShow = y > SCREEN_WIDTH * 1.2;
        if (shouldShow !== showStickyCTA) {
          setShowStickyCTA(shouldShow);
        }
      },
    }
  );

  // Orb interpolated positions
  const orb1TranslateY = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const orb2TranslateY = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
  const orb3TranslateX = orb3Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });

  // ==========================================================================
  // PREMIUM USER VIEW
  // ==========================================================================
  if (isPremium) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.premiumUserScroll}>
            {/* Decorative gradient header */}
            <LinearGradient
              colors={[PALETTE.indigo, PALETTE.purple]}
              style={styles.premiumUserHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <ArrowLeft size={22} color={PALETTE.white} />
              </TouchableOpacity>

              <Animated.View style={[styles.premiumCrownWrap, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.premiumCrownCircle}>
                  <Crown size={48} color={PALETTE.white} strokeWidth={2} />
                </View>
              </Animated.View>

              <Text style={styles.premiumUserTitle}>Du är Premium</Text>
              <Text style={styles.premiumUserSubtitle}>
                Tack för att du stödjer Studiestugan
              </Text>
            </LinearGradient>

            <View style={styles.premiumUserBenefits}>
              <Text style={styles.premiumUserBenefitsTitle}>Dina Premium-fördelar</Text>
              {FEATURES.map((feature, index) => (
                <FadeInView key={index} delay={index * 60}>
                  <View style={styles.glassCard}>
                    <LinearGradient
                      colors={feature.gradient as [string, string]}
                      style={styles.featureIconCircle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <feature.icon size={22} color="#FFFFFF" strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.featureTextContent}>
                      <Text style={styles.featureTitleText}>{feature.title}</Text>
                      <Text style={styles.featureDescText}>{feature.description}</Text>
                    </View>
                    <View style={styles.checkCircle}>
                      <Check size={16} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                  </View>
                </FadeInView>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================================================
  // MAIN PAYWALL VIEW
  // ==========================================================================
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Floating glass header */}
        <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
          <BlurView intensity={60} tint="light" style={styles.headerBlur}>
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={PALETTE.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Premium</Text>
            <View style={{ width: 40 }} />
          </BlurView>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* ================================================================
              SECTION 1: HERO
          ================================================================= */}
          <View style={styles.heroSection}>
            {/* Animated gradient background */}
            <LinearGradient
              colors={[PALETTE.bgWarm, '#F0F0FF', PALETTE.bgSoft]}
              style={styles.heroBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Floating blurred orbs */}
            <Animated.View
              style={[
                styles.orb,
                styles.orb1,
                { transform: [{ translateY: orb1TranslateY }] },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                styles.orb2,
                { transform: [{ translateY: orb2TranslateY }] },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                styles.orb3,
                { transform: [{ translateX: orb3TranslateX }] },
              ]}
            />

            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <BlurView intensity={40} tint="light" style={styles.backButtonBlur}>
                <ArrowLeft size={20} color={PALETTE.textDark} />
              </BlurView>
            </TouchableOpacity>

            {/* Premium badge */}
            <FadeInView delay={100}>
              <View style={styles.premiumBadge}>
                <BlurView intensity={30} tint="light" style={styles.premiumBadgeBlur}>
                  <Sparkles size={14} color={PALETTE.indigo} />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </BlurView>
              </View>
            </FadeInView>

            {/* Crown icon */}
            <FadeInView delay={200}>
              <Animated.View style={[styles.heroCrownWrap, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={[PALETTE.indigo, PALETTE.purple]}
                  style={styles.heroCrownCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Crown size={40} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              </Animated.View>
            </FadeInView>

            {/* Headline */}
            <SlideInView direction="up" delay={300}>
              <Text style={styles.heroTitle}>Lås upp din fulla studiepotential</Text>
            </SlideInView>

            <SlideInView direction="up" delay={400}>
              <Text style={styles.heroSubtitle}>
                Tusentals studenter pluggar smartare med AI
              </Text>
            </SlideInView>

            {/* CTA */}
            <SlideInView direction="up" delay={500}>
              <AnimatedPressable
                style={[styles.primaryCTABtn, !canPurchase && { opacity: 0.6 }]}
                onPress={handlePurchase}
                disabled={!canPurchase}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[PALETTE.indigo, PALETTE.purple]}
                  style={styles.ctaGradientFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Crown size={20} color="#FFFFFF" />
                      <Text style={styles.primaryCTAText}>Starta 3-dagars gratis provperiod</Text>
                    </>
                  )}
                </LinearGradient>
              </AnimatedPressable>
            </SlideInView>

            <FadeInView delay={600}>
              <Text style={styles.heroSubtext}>Avbryt när som helst • Ingen bindningstid</Text>
            </FadeInView>
          </View>

          {/* Offline / error notice */}
          {(isOffline || loadError) && (
            <SlideInView direction="up" delay={350}>
              <View style={styles.noticeCard}>
                <AlertCircle size={18} color={PALETTE.amber} />
                <Text style={styles.noticeText}>
                  {loadError || 'Du är offline. Vissa funktioner kan vara begränsade.'}
                </Text>
                {loadError && (
                  <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
                    <RefreshCw size={15} color={PALETTE.indigo} />
                    <Text style={styles.retryText}>Försök igen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SlideInView>
          )}

          {/* ================================================================
              SECTION 2: VALUE PROPOSITION
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <View style={styles.valueGrid}>
                <FadeInView delay={100}>
                  <View style={styles.glassCardCentered}>
                    <View style={[styles.valueIconWrap, { backgroundColor: PALETTE.indigo + '15' }]}>
                      <Unlock size={22} color={PALETTE.indigo} />
                    </View>
                    <Text style={styles.valueNumber}>10+</Text>
                    <Text style={styles.valueLabel}>Premium-funktioner</Text>
                  </View>
                </FadeInView>
                <FadeInView delay={200}>
                  <View style={styles.glassCardCentered}>
                    <View style={[styles.valueIconWrap, { backgroundColor: PALETTE.emerald + '15' }]}>
                      <TrendingUp size={22} color={PALETTE.emerald} />
                    </View>
                    <Text style={styles.valueNumber}>∞</Text>
                    <Text style={styles.valueLabel}>Obegränsat</Text>
                  </View>
                </FadeInView>
                <FadeInView delay={300}>
                  <View style={styles.glassCardCentered}>
                    <View style={[styles.valueIconWrap, { backgroundColor: PALETTE.purple + '15' }]}>
                      <Sparkles size={22} color={PALETTE.purple} />
                    </View>
                    <Text style={styles.valueNumber}>AI</Text>
                    <Text style={styles.valueLabel}>Assisterad</Text>
                  </View>
                </FadeInView>
              </View>
            </SlideInView>
          </View>

          {/* ================================================================
              SECTION 3: PREMIUM FEATURES GRID
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Allt du får med Premium</Text>
              <Text style={styles.sectionSubheading}>Kraftfulla funktioner för seriösa studenter</Text>
            </SlideInView>

            <View style={styles.featuresGrid}>
              {FEATURES.map((feature, index) => (
                <FadeInView key={index} delay={index * 50}>
                  <View style={styles.featureCard}>
                    <LinearGradient
                      colors={feature.gradient as [string, string]}
                      style={styles.featureIconCircleLarge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <feature.icon size={24} color="#FFFFFF" strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.featureCardBody}>
                      <View style={styles.featureTitleRow}>
                        <Text style={styles.featureCardTitle}>{feature.title}</Text>
                        {feature.badge && (
                          <View style={[
                            styles.featureBadgeSmall,
                            {
                              backgroundColor: feature.badge === 'AI'
                                ? PALETTE.indigo + '15'
                                : feature.badge === 'Nytt'
                                ? PALETTE.emerald + '15'
                                : PALETTE.amber + '15',
                            },
                          ]}>
                            <Text style={[
                              styles.featureBadgeSmallText,
                              {
                                color: feature.badge === 'AI'
                                  ? PALETTE.indigo
                                  : feature.badge === 'Nytt'
                                  ? PALETTE.emerald
                                  : PALETTE.amber,
                              },
                            ]}>{feature.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.featureCardDesc}>{feature.description}</Text>
                    </View>
                    <View style={styles.checkCircleSmall}>
                      <Check size={14} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                  </View>
                </FadeInView>
              ))}
            </View>

            {/* Mid-page CTA */}
            <FadeInView delay={200}>
              <AnimatedPressable
                style={[styles.secondaryCTABtn, !canPurchase && { opacity: 0.6 }]}
                onPress={handlePurchase}
                disabled={!canPurchase}
                activeOpacity={0.85}
              >
                <Crown size={18} color={PALETTE.indigo} />
                <Text style={styles.secondaryCTAText}>Starta gratis provperiod</Text>
                <ArrowLeft size={16} color={PALETTE.indigo} style={{ transform: [{ rotate: '180deg' }] }} />
              </AnimatedPressable>
            </FadeInView>
          </View>

          {/* ================================================================
              SECTION 4: WHY PREMIUM? (COMPARISON)
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Varför Premium?</Text>
              <Text style={styles.sectionSubheading}>Se skillnaden mellan Gratis och Premium</Text>
            </SlideInView>

            <SlideInView direction="up" delay={100}>
              <View style={styles.comparisonContainer}>
                {/* Header row */}
                <View style={styles.comparisonHeader}>
                  <View style={styles.comparisonLabelCol} />
                  <View style={styles.comparisonCol}>
                    <Text style={styles.comparisonColTitle}>Gratis</Text>
                  </View>
                  <View style={styles.comparisonColFeatured}>
                    <LinearGradient
                      colors={[PALETTE.indigo, PALETTE.purple]}
                      style={styles.comparisonFeaturedBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Crown size={12} color="#FFFFFF" />
                      <Text style={styles.comparisonFeaturedBadgeText}>PREMIUM</Text>
                    </LinearGradient>
                  </View>
                </View>

                {/* Rows */}
                {COMPARISON.map((row, index) => (
                  <View
                    key={index}
                    style={[
                      styles.comparisonRow,
                      index % 2 === 0 && { backgroundColor: 'rgba(99, 102, 241, 0.03)' },
                    ]}
                  >
                    <View style={styles.comparisonLabelCol}>
                      <Text style={styles.comparisonRowLabel}>{row.label}</Text>
                    </View>
                    <View style={styles.comparisonCol}>
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check size={18} color={PALETTE.emerald} strokeWidth={2.5} />
                        ) : (
                          <X size={18} color={PALETTE.textMuted} strokeWidth={2.5} />
                        )
                      ) : (
                        <Text style={styles.comparisonRowValueFree}>{row.free}</Text>
                      )}
                    </View>
                    <View style={styles.comparisonColFeatured}>
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check size={18} color={PALETTE.indigo} strokeWidth={2.5} />
                        ) : (
                          <X size={18} color={PALETTE.textMuted} strokeWidth={2.5} />
                        )
                      ) : (
                        <Text style={styles.comparisonRowValuePremium}>{row.premium}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </SlideInView>
          </View>

          {/* ================================================================
              SECTION 5: STATISTICS
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Tusentals litar på Studiestugan</Text>
              <Text style={styles.sectionSubheading}>Se vad vår community har uppnått</Text>
            </SlideInView>

            <View style={styles.statsGrid}>
              {STATS.map((stat, index) => (
                <FadeInView key={index} delay={index * 80}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={stat.gradient as [string, string]}
                      style={styles.statIconCircle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <stat.icon size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </FadeInView>
              ))}
            </View>
          </View>

          {/* ================================================================
              SECTION 6: TESTIMONIALS
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Vad våra studenter säger</Text>
            </SlideInView>

            <View style={styles.testimonialsContainer}>
              {TESTIMONIALS.map((testimonial, index) => (
                <SlideInView key={index} direction="up" delay={index * 120}>
                  <View style={styles.testimonialCard}>
                    <Quote size={24} color={PALETTE.indigo + '30'} style={styles.testimonialQuoteIcon} />
                    <View style={styles.testimonialStars}>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} size={14} color={PALETTE.amber} fill={PALETTE.amber} />
                      ))}
                    </View>
                    <Text style={styles.testimonialText}>"{testimonial.quote}"</Text>
                    <View style={styles.testimonialAuthor}>
                      <LinearGradient
                        colors={testimonial.avatarColor as [string, string]}
                        style={styles.testimonialAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.testimonialAvatarText}>{testimonial.initials}</Text>
                      </LinearGradient>
                      <View>
                        <Text style={styles.testimonialName}>{testimonial.name}</Text>
                        <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                      </View>
                    </View>
                  </View>
                </SlideInView>
              ))}
            </View>
          </View>

          {/* ================================================================
              SECTION 7: PRICING
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Välj din plan</Text>
              <Text style={styles.sectionSubheading}>Starta med 3 dagar gratis — avbryt när som helst</Text>
            </SlideInView>

            {isLoadingOfferings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PALETTE.indigo} />
                <Text style={styles.loadingText}>Laddar priser...</Text>
              </View>
            ) : pricingPlans.length === 0 ? (
              <View style={styles.errorPricingCard}>
                <AlertCircle size={28} color={PALETTE.amber} />
                <Text style={styles.errorPricingTitle}>
                  {Platform.OS === 'web' ? 'Endast tillgängligt på mobil' : 'Produkter ej tillgängliga'}
                </Text>
                <Text style={styles.errorPricingDesc}>
                  {Platform.OS === 'web'
                    ? 'RevenueCat in-app purchases fungerar endast på iOS och Android.'
                    : 'Vi kunde inte ladda produkterna just nu. Försök igen om en stund.'}
                </Text>
                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.errorRetryBtn}
                    onPress={handleRetry}
                    activeOpacity={0.8}
                  >
                    <RefreshCw size={16} color="#FFFFFF" />
                    <Text style={styles.errorRetryBtnText}>Försök igen</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.pricingContainer}>
                {pricingPlans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const isFeatured = plan.isFeatured;

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.pricingCard,
                        isFeatured && styles.pricingCardFeatured,
                        isSelected && isFeatured && styles.pricingCardSelectedFeatured,
                        isSelected && !isFeatured && styles.pricingCardSelected,
                      ]}
                      onPress={() => setSelectedPlan(plan.id)}
                      disabled={!plan.pkg}
                      activeOpacity={0.85}
                    >
                      {/* Featured glow */}
                      {isFeatured && (
                        <Animated.View
                          style={[styles.pricingGlow, { opacity: glowOpacity }]}
                          pointerEvents="none"
                        />
                      )}

                      {/* Badge for featured */}
                      {isFeatured && plan.savings && (
                        <View style={styles.pricingBadgeWrap}>
                          <LinearGradient
                            colors={[PALETTE.emerald, PALETTE.emeraldDark]}
                            style={styles.pricingBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <Sparkles size={12} color="#FFFFFF" />
                            <Text style={styles.pricingBadgeText}>{plan.savings.toUpperCase()}</Text>
                          </LinearGradient>
                        </View>
                      )}

                      {/* Most popular tag */}
                      {isFeatured && (
                        <View style={styles.mostPopularTag}>
                          <Crown size={11} color={PALETTE.indigo} />
                          <Text style={styles.mostPopularText}>MEST POPULÄR</Text>
                        </View>
                      )}

                      <View style={styles.pricingCardBody}>
                        <Text style={styles.pricingPlanTitle}>{plan.title}</Text>
                        <View style={styles.pricingPriceRow}>
                          <Text style={styles.pricingPrice}>{plan.price}</Text>
                          <Text style={styles.pricingPeriod}>{plan.period}</Text>
                        </View>
                        {isFeatured && (
                          <Text style={styles.pricingSubtext}>Endast ~21 SEK/månad</Text>
                        )}
                      </View>

                      {/* Selected indicator */}
                      <View style={[
                        styles.pricingSelectedDot,
                        isSelected
                          ? { backgroundColor: PALETTE.indigo }
                          : { backgroundColor: PALETTE.borderLight },
                      ]}>
                        {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Pricing CTA */}
            {pricingPlans.length > 0 && (
              <FadeInView delay={200}>
                <AnimatedPressable
                  style={[styles.primaryCTABtn, !canPurchase && { opacity: 0.6 }]}
                  onPress={handlePurchase}
                  disabled={!canPurchase}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[PALETTE.indigo, PALETTE.purple]}
                    style={styles.ctaGradientFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Crown size={20} color="#FFFFFF" />
                        <Text style={styles.primaryCTAText}>Starta 3-dagars gratis provperiod</Text>
                      </>
                    )}
                  </LinearGradient>
                </AnimatedPressable>
              </FadeInView>
            )}
          </View>

          {/* ================================================================
              SECTION 8: FREE TRIAL CLARITY
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <View style={styles.trialClarityCard}>
                <Text style={styles.trialTitle}>Starta din 3-dagars gratis provperiod idag</Text>
                <View style={styles.trialItems}>
                  <View style={styles.trialItem}>
                    <View style={styles.trialCheckCircle}>
                      <Check size={16} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                    <Text style={styles.trialItemText}>Full Premium-åtkomst i 3 dagar</Text>
                  </View>
                  <View style={styles.trialItem}>
                    <View style={styles.trialCheckCircle}>
                      <Check size={16} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                    <Text style={styles.trialItemText}>Avbryt innan förnyelse — ingen kostnad</Text>
                  </View>
                  <View style={styles.trialItem}>
                    <View style={styles.trialCheckCircle}>
                      <Check size={16} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                    <Text style={styles.trialItemText}>Ingen risk, ingen bindningstid</Text>
                  </View>
                  <View style={styles.trialItem}>
                    <View style={styles.trialCheckCircle}>
                      <Check size={16} color={PALETTE.emerald} strokeWidth={3} />
                    </View>
                    <Text style={styles.trialItemText}>Behåll alla framsteg om du avbryter</Text>
                  </View>
                </View>
              </View>
            </SlideInView>
          </View>

          {/* ================================================================
              SECTION 9: FAQ ACCORDION
          ================================================================= */}
          <View style={styles.sectionWrap}>
            <SlideInView direction="up" delay={0}>
              <Text style={styles.sectionHeading}>Vanliga frågor</Text>
            </SlideInView>

            <View style={styles.faqContainer}>
              {FAQS.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Animated.View style={{
                      transform: [{
                        rotate: expandedFAQ === index ? '180deg' as string : '0deg' as string,
                      }],
                    }}>
                      <ChevronDown size={20} color={PALETTE.indigo} />
                    </Animated.View>
                  </View>
                  {expandedFAQ === index && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ================================================================
              SECTION 10: FINAL CTA
          ================================================================= */}
          <View style={styles.finalCTASection}>
            <LinearGradient
              colors={[PALETTE.indigo, PALETTE.purple, PALETTE.indigoDark]}
              style={styles.finalCTABg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative orbs */}
              <View style={[styles.finalOrb, styles.finalOrb1]} />
              <View style={[styles.finalOrb, styles.finalOrb2]} />

              <SlideInView direction="up" delay={0}>
                <Text style={styles.finalCTAHeading}>Ditt framtida jag kommer tacka dig</Text>
                <Text style={styles.finalCTASubtitle}>
                  Börja plugga smartare idag — det är gratis i 3 dagar
                </Text>
              </SlideInView>

              <FadeInView delay={200}>
                <AnimatedPressable
                  style={[styles.finalCTABtn, !canPurchase && { opacity: 0.6 }]}
                  onPress={handlePurchase}
                  disabled={!canPurchase}
                  activeOpacity={0.85}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color={PALETTE.indigo} />
                  ) : (
                    <>
                      <Crown size={20} color={PALETTE.indigo} />
                      <Text style={styles.finalCTABtnText}>Starta gratis provperiod</Text>
                    </>
                  )}
                </AnimatedPressable>
              </FadeInView>

              <FadeInView delay={300}>
                <View style={styles.trustBadges}>
                  <View style={styles.trustBadgeRow}>
                    <Shield size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.trustBadgeText}>Säker betalning</Text>
                  </View>
                  <View style={styles.trustBadgeRow}>
                    <Lock size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.trustBadgeText}>Krypterad</Text>
                  </View>
                  <View style={styles.trustBadgeRow}>
                    <Check size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.trustBadgeText}>Avbryt när som helst</Text>
                  </View>
                </View>
              </FadeInView>
            </LinearGradient>
          </View>

          {/* ================================================================
              SECTION 11: FOOTER
          ================================================================= */}
          <View style={styles.footerSection}>
            {/* Restore purchases */}
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={handleRestorePurchases}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={PALETTE.indigo} />
              ) : (
                <Text style={styles.restoreBtnText}>Återställ köp</Text>
              )}
            </TouchableOpacity>

            {/* Subscription terms (Apple required) */}
            <View style={styles.termsCard}>
              <View style={styles.termsHeaderRow}>
                <Shield size={14} color={PALETTE.textMuted} />
                <Text style={styles.termsHeaderText}>Prenumerationsinformation</Text>
              </View>
              <Text style={styles.termsBodyText}>
                <Text style={{ fontWeight: '600' as const }}>Tjänst:</Text> Studiestugan Premium{'\n'}
                <Text style={{ fontWeight: '600' as const }}>Längd:</Text> Månadsvis eller årsvis{'\n'}
                <Text style={{ fontWeight: '600' as const }}>Pris:</Text> Visas ovan{'\n\n'}
                • Förnyas automatiskt tills det avslutas{'\n'}
                • Debitering via Apple ID / Google Play{'\n'}
                • Avsluta minst 24h före periodens slut{'\n'}
                • Avsluta via App Store eller Google Play
              </Text>
            </View>

            {/* Legal links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Text style={styles.footerLink}>Integritetspolicy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>•</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={styles.footerLink}>Användarvillkor</Text>
              </TouchableOpacity>
            </View>

            {/* Debug info */}
            {getDebugMode() && offerings && (
              <View style={styles.debugBox}>
                <Text style={styles.debugTitle}>DEBUG</Text>
                <Text style={styles.debugText}>
                  Offering: {offerings.identifier}{'\n'}
                  Packages: {offerings.availablePackages.map(p => p.identifier).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Sticky floating CTA bar */}
        {showStickyCTA && (
          <Animated.View style={styles.stickyCTAWrap}>
            <BlurView intensity={60} tint="light" style={styles.stickyCTABlur}>
              <View style={styles.stickyCTAContent}>
                <View style={styles.stickyCTAInfo}>
                  <Text style={styles.stickyCTATitle}>Studiestugan Premium</Text>
                  <Text style={styles.stickyCTASub}>3 dagar gratis • Avbryt när som helst</Text>
                </View>
                <AnimatedPressable
                  style={[styles.stickyCTABtn, !canPurchase && { opacity: 0.5 }]}
                  onPress={handlePurchase}
                  disabled={!canPurchase}
                  activeOpacity={0.85}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.stickyCTABtnText}>Starta gratis</Text>
                  )}
                </AnimatedPressable>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Integritetspolicy</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowPrivacyModal(false)}
              activeOpacity={0.8}
            >
              <X size={20} color={PALETTE.textDark} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>{PRIVACY_POLICY_TEXT}</Text>
            <TouchableOpacity
              style={styles.externalLinkBtn}
              onPress={() => openExternalLink(PRIVACY_URL)}
              activeOpacity={0.8}
            >
              <ExternalLink size={16} color={PALETTE.indigo} />
              <Text style={styles.externalLinkText}>Öppna i webbläsare</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Användarvillkor</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTermsModal(false)}
              activeOpacity={0.8}
            >
              <X size={20} color={PALETTE.textDark} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              ANVÄNDARVILLKOR - STUDIESTUGAN{'\n\n'}
              Senast uppdaterad: Januari 2025{'\n\n'}
              1. GODKÄNNANDE AV VILLKOR{'\n'}
              Genom att skapa ett konto och använda Studiestugan godkänner du dessa användarvillkor. Om du inte godkänner villkoren ska du inte använda tjänsten.{'\n\n'}
              2. TJÄNSTEBESKRIVNING{'\n'}
              Studiestugan är en mobilapplikation för studieplanering, tidsuppföljning och kunskapsutveckling. Tjänsten erbjuds i både gratis och premium-versioner.{'\n\n'}
              3. KONTO OCH REGISTRERING{'\n'}
              • Du måste vara minst 13 år gammal{'\n'}
              • Du ansvarar för ditt kontos säkerhet{'\n'}
              • Ett konto per person{'\n'}
              • Vi förbehåller rätten att stänga konton vid missbruk{'\n\n'}
              4. PRENUMERATIONER OCH BETALNING{'\n'}
              • Premium-prenumeration ger tillgång till extra funktioner{'\n'}
              • Priser visas i appen innan köp{'\n'}
              • Prenumerationer förnyas automatiskt{'\n'}
              • Avsluta via App Store/Google Play{'\n'}
              • Ingen återbetalning för oanvända perioder{'\n'}
              • Vi kan ändra priser med 30 dagars varsel{'\n\n'}
              5. ANVÄNDNING AV TJÄNSTEN{'\n'}
              Du får INTE:{'\n'}
              • Dela ditt konto med andra{'\n'}
              • Använda tjänsten för olagliga ändamål{'\n'}
              • Försöka kringgå säkerhetsåtgärder{'\n'}
              • Missbruka eller överbelasta systemet{'\n\n'}
              6. IMMATERIELLA RÄTTIGHETER{'\n'}
              Allt innehåll (text, grafik, logotyper) ägs av Studiestugan. Du får en begränsad licens att använda tjänsten för personligt bruk.{'\n\n'}
              7. INNEHÅLLSANSVAR{'\n'}
              Vi strävar efter korrekt innehåll men garanterar inte riktighet. Använd på egen risk.{'\n\n'}
              8. ANSVARSBEGRÄNSNING{'\n'}
              Tjänsten tillhandahålls som den är. Vi ansvarar inte för indirekta skador.{'\n\n'}
              9. ÄNDRINGAR{'\n'}
              Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelas via appen. Fortsatt användning innebär godkännande.{'\n\n'}
              10. UPPSÄGNING{'\n'}
              Du kan avsluta ditt konto när som helst via inställningar. Vi kan stänga konton vid brott mot villkoren.{'\n\n'}
              11. TILLÄMPLIG LAG{'\n'}
              Svensk lag gäller. Tvister avgörs i svensk domstol.{'\n\n'}
              12. KONTAKT{'\n'}
              Frågor om villkoren? Kontakta: support@studiestugan.se{'\n\n'}
              För fullständiga villkor, besök: studiestugan.se/terms
            </Text>
            <TouchableOpacity
              style={styles.externalLinkBtn}
              onPress={() => openExternalLink(TERMS_URL)}
              activeOpacity={0.8}
            >
              <ExternalLink size={16} color={PALETTE.indigo} />
              <Text style={styles.externalLinkText}>Öppna i webbläsare</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgWarm,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ---- Floating header ----
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderLight,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.3,
  },

  // ---- Hero ----
  heroSection: {
    minHeight: SCREEN_WIDTH * 1.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.25,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: PALETTE.indigo,
    top: 60,
    right: -40,
    blurRadius: 40,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: PALETTE.purple,
    top: 200,
    left: -50,
    opacity: 0.18,
  },
  orb3: {
    width: 150,
    height: 150,
    backgroundColor: PALETTE.cyan,
    bottom: 80,
    right: 20,
    opacity: 0.15,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  premiumBadge: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumBadgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderRadius: 20,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: PALETTE.indigo,
    letterSpacing: 1.5,
  },
  heroCrownWrap: {
    marginBottom: 28,
  },
  heroCrownCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    textAlign: 'center',
    letterSpacing: -1.2,
    lineHeight: 42,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 17,
    color: PALETTE.textMid,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 36,
  },
  heroSubtext: {
    fontSize: 13,
    color: PALETTE.textLight,
    textAlign: 'center',
    marginTop: 14,
  },

  // ---- Primary CTA ----
  primaryCTABtn: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: PALETTE.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGradientFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryCTAText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  secondaryCTABtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  secondaryCTAText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PALETTE.indigo,
  },

  // ---- Notice ----
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: PALETTE.amber + '15',
    gap: 10,
    flexWrap: 'wrap',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: PALETTE.textMid,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PALETTE.indigo,
  },

  // ---- Section wrappers ----
  sectionWrap: {
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  sectionHeading: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  sectionSubheading: {
    fontSize: 15,
    color: PALETTE.textLight,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },

  // ---- Value proposition ----
  valueGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  glassCardCentered: {
    flex: 1,
    backgroundColor: PALETTE.glassBg,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  valueIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueNumber: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  valueLabel: {
    fontSize: 11,
    color: PALETTE.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ---- Features grid ----
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.glassBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIconCircleLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  featureCardBody: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.3,
  },
  featureBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureBadgeSmallText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  featureCardDesc: {
    fontSize: 13,
    color: PALETTE.textLight,
    lineHeight: 19,
  },
  checkCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.emerald + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Comparison ----
  comparisonContainer: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  comparisonHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: PALETTE.borderLight,
    paddingBottom: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  comparisonLabelCol: {
    flex: 1.5,
  },
  comparisonCol: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonColFeatured: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  comparisonColTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PALETTE.textLight,
    letterSpacing: 0.3,
  },
  comparisonFeaturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  comparisonFeaturedBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  comparisonRowLabel: {
    fontSize: 13,
    color: PALETTE.textMid,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  comparisonRowValueFree: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontWeight: '600' as const,
  },
  comparisonRowValuePremium: {
    fontSize: 12,
    color: PALETTE.indigo,
    fontWeight: '700' as const,
  },

  // ---- Statistics ----
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: PALETTE.glassBg,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: PALETTE.textLight,
    textAlign: 'center',
  },

  // ---- Testimonials ----
  testimonialsContainer: {
    gap: 14,
  },
  testimonialCard: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  testimonialQuoteIcon: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 15,
    color: PALETTE.textMid,
    lineHeight: 23,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
  },
  testimonialRole: {
    fontSize: 12,
    color: PALETTE.textLight,
  },

  // ---- Pricing ----
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: PALETTE.textLight,
  },
  errorPricingCard: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
  },
  errorPricingTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  errorPricingDesc: {
    fontSize: 14,
    color: PALETTE.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.indigo,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  errorRetryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  pricingContainer: {
    gap: 14,
    marginBottom: 20,
  },
  pricingCard: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: PALETTE.borderGlass,
    position: 'relative',
    overflow: 'hidden',
  },
  pricingCardFeatured: {
    borderColor: PALETTE.indigo + '40',
    borderWidth: 2,
    shadowColor: PALETTE.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  pricingCardSelectedFeatured: {
    borderColor: PALETTE.indigo,
    borderWidth: 2.5,
  },
  pricingCardSelected: {
    borderColor: PALETTE.indigo + '60',
    borderWidth: 2,
  },
  pricingGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PALETTE.indigo,
    borderRadius: 22,
  },
  pricingBadgeWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  pricingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    gap: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pricingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  mostPopularTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.indigo + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  mostPopularText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: PALETTE.indigo,
    letterSpacing: 0.5,
  },
  pricingCardBody: {
    alignItems: 'center',
    marginTop: 16,
  },
  pricingPlanTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.textLight,
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  pricingPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pricingPrice: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    letterSpacing: -1,
  },
  pricingPeriod: {
    fontSize: 15,
    color: PALETTE.textLight,
  },
  pricingSubtext: {
    fontSize: 13,
    color: PALETTE.emerald,
    fontWeight: '700' as const,
    marginTop: 6,
  },
  pricingSelectedDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Free trial clarity ----
  trialClarityCard: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  trialTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  trialItems: {
    gap: 16,
  },
  trialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trialCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.emerald + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialItemText: {
    fontSize: 15,
    color: PALETTE.textMid,
    fontWeight: '500' as const,
    flex: 1,
  },

  // ---- FAQ ----
  faqContainer: {
    gap: 10,
  },
  faqItem: {
    backgroundColor: PALETTE.glassBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    flex: 1,
    letterSpacing: -0.2,
  },
  faqAnswer: {
    fontSize: 14,
    color: PALETTE.textMid,
    lineHeight: 22,
    marginTop: 12,
  },

  // ---- Final CTA ----
  finalCTASection: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: PALETTE.indigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  finalCTABg: {
    padding: 36,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  finalOrb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.15,
  },
  finalOrb1: {
    width: 180,
    height: 180,
    backgroundColor: PALETTE.white,
    top: -40,
    right: -40,
  },
  finalOrb2: {
    width: 140,
    height: 140,
    backgroundColor: PALETTE.purpleLight,
    bottom: -30,
    left: -20,
    opacity: 0.2,
  },
  finalCTAHeading: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 12,
  },
  finalCTASubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  finalCTABtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 22,
    paddingVertical: 17,
    paddingHorizontal: 28,
    gap: 10,
    width: '100%',
  },
  finalCTABtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PALETTE.indigo,
    letterSpacing: -0.3,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustBadgeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500' as const,
  },

  // ---- Footer ----
  footerSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.indigo,
  },
  termsCard: {
    backgroundColor: PALETTE.glassBgLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
  },
  termsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  termsHeaderText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PALETTE.textLight,
  },
  termsBodyText: {
    fontSize: 11,
    color: PALETTE.textMid,
    lineHeight: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  footerLink: {
    fontSize: 13,
    color: PALETTE.indigo,
    fontWeight: '600' as const,
  },
  footerDivider: {
    fontSize: 13,
    color: PALETTE.textMuted,
  },
  debugBox: {
    backgroundColor: PALETTE.amber + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: PALETTE.amber,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: PALETTE.textMid,
  },

  // ---- Sticky CTA ----
  stickyCTAWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  stickyCTABlur: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.borderGlass,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  stickyCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  stickyCTAInfo: {
    flex: 1,
  },
  stickyCTATitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    letterSpacing: -0.3,
  },
  stickyCTASub: {
    fontSize: 12,
    color: PALETTE.textLight,
    marginTop: 2,
  },
  stickyCTABtn: {
    backgroundColor: PALETTE.indigo,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  stickyCTABtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },

  // ---- Premium user view ----
  premiumUserScroll: {
    paddingBottom: 40,
  },
  premiumUserHeader: {
    paddingVertical: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  premiumCrownWrap: {
    marginBottom: 20,
  },
  premiumCrownCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumUserTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  premiumUserSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  premiumUserBenefits: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  premiumUserBenefitsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PALETTE.textDark,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // ---- Glass card (shared) ----
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.glassBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PALETTE.borderGlass,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitleText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
    marginBottom: 3,
  },
  featureDescText: {
    fontSize: 13,
    color: PALETTE.textLight,
    lineHeight: 19,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.emerald + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Modals ----
  modalContainer: {
    flex: 1,
    backgroundColor: PALETTE.bgWarm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderLight,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: PALETTE.textDark,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    color: PALETTE.textMid,
    lineHeight: 22,
    marginBottom: 24,
  },
  externalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: PALETTE.indigo + '20',
    borderRadius: 14,
    gap: 8,
    marginBottom: 40,
  },
  externalLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PALETTE.indigo,
  },
});
