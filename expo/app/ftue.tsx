import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, {
  Circle,
  Rect,
  Path,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg';
import {
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Layers,
  Brain,
  ChartBar,
  Palette,
} from 'lucide-react-native';
import { ROUTES } from '@/utils/typedRoutes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FTUE_COMPLETED_KEY = 'ftue_completed_v2';

// ── Screen definitions ──────────────────────────────────────────────

interface FTUEScreen {
  id: number;
  icon: React.ReactNode;
  gradientIcon: React.ReactNode;
  title: string;
  subtitle: string;
  gradientColors: readonly [string, string, ...string[]];
  accentColor: string;
  Illustration: React.FC<{ progress: Animated.AnimatedInterpolation<number> }>;
}

// ── SVG Illustrations ───────────────────────────────────────────────

const StructuredLearningIllustration: React.FC<{
  progress: Animated.AnimatedInterpolation<number>;
}> = React.memo(({ progress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={illusStyles.container}>
      <Svg width={240} height={200} viewBox="0 0 240 200">
        <Defs>
          <SvgLinearGradient id="nodeGrad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.25)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.08)" />
          </SvgLinearGradient>
          <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
            <Stop offset="0.5" stopColor="rgba(255,255,255,0.15)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.4)" />
          </SvgLinearGradient>
        </Defs>

        {/* Connecting lines */}
        <Line x1={70} y1={55} x2={160} y2={50} stroke="url(#lineGrad)" strokeWidth={2} strokeDasharray="6,4" />
        <Line x1={160} y1={65} x2={70} y2={130} stroke="url(#lineGrad)" strokeWidth={2} strokeDasharray="6,4" />

        {/* Node 1 — Kurs */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <G>
            <Rect
              x={30}
              y={30}
              width={80}
              height={44}
              rx={14}
              fill="url(#nodeGrad1)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1.5}
            />
          </G>
        </Animated.View>
        {/* Node 2 — Modul */}
        <G>
          <Rect
            x={130}
            y={30}
            width={80}
            height={44}
            rx={14}
            fill="url(#nodeGrad1)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
          />
        </G>

        {/* Node 3 — Lektion */}
        <G>
          <Rect
            x={30}
            y={108}
            width={80}
            height={44}
            rx={14}
            fill="url(#nodeGrad1)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
          />
        </G>

        {/* Progress indicator dots */}
        <Circle cx={200} cy={52} r={5} fill="rgba(255,255,255,0.5)" />
        <Circle cx={200} cy={130} r={5} fill="rgba(255,255,255,0.2)" />
      </Svg>
    </View>
  );
});

const DeepUnderstandingIllustration: React.FC<{
  progress: Animated.AnimatedInterpolation<number>;
}> = React.memo(() => {
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rippleAnim]);

  return (
    <View style={illusStyles.container}>
      <Svg width={220} height={200} viewBox="0 0 220 200">
        <Defs>
          <SvgLinearGradient id="circleGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.3)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.05)" />
          </SvgLinearGradient>
        </Defs>

        {/* Outermost ring */}
        <Circle cx={110} cy={100} r={90} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
        {/* Ring 2 */}
        <Circle cx={110} cy={100} r={68} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        {/* Ring 3 */}
        <Circle cx={110} cy={100} r={48} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        {/* Inner glow */}
        <Circle cx={110} cy={100} r={30} fill="url(#circleGrad)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        {/* Core */}
        <Circle cx={110} cy={100} r={14} fill="rgba(255,255,255,0.25)" />

        {/* Animated ripple */}
        <AnimatedCircle
          cx={110}
          cy={100}
          r={rippleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [14, 50, 14],
          })}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />

        {/* Target crosshair */}
        <Line x1={110} y1={82} x2={110} y2={118} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <Line x1={92} y1={100} x2={128} y2={100} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
      </Svg>
    </View>
  );
});

const ProgressIllustration: React.FC<{
  progress: Animated.AnimatedInterpolation<number>;
}> = React.memo(() => {
  return (
    <View style={illusStyles.container}>
      <Svg width={220} height={200} viewBox="0 0 220 200">
        <Defs>
          <SvgLinearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.5)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.15)" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid lines */}
        <Line x1={40} y1={160} x2={200} y2={160} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <Line x1={40} y1={120} x2={200} y2={120} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <Line x1={40} y1={80} x2={200} y2={80} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

        {/* Bars */}
        <Rect x={50} y={110} width={28} height={50} rx={6} fill="url(#barGrad1)" />
        <Rect x={88} y={85} width={28} height={75} rx={6} fill="url(#barGrad1)" />
        <Rect x={126} y={60} width={28} height={100} rx={6} fill="url(#barGrad1)" />
        <Rect x={164} y={35} width={28} height={125} rx={6} fill="url(#barGrad1)" />

        {/* Trend line */}
        <Path
          d="M 64 105 Q 102 100 140 55 T 178 30"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Endpoint dot */}
        <Circle cx={178} cy={30} r={6} fill="white" opacity={0.8} />
        <Circle cx={178} cy={30} r={10} fill="white" opacity={0.15} />
      </Svg>
    </View>
  );
});

const PersonalizedIllustration: React.FC<{
  progress: Animated.AnimatedInterpolation<number>;
}> = React.memo(() => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  return (
    <View style={illusStyles.container}>
      <Svg width={240} height={200} viewBox="0 0 240 200">
        <Defs>
          <SvgLinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.25)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.06)" />
          </SvgLinearGradient>
        </Defs>

        {/* Decorative orbit rings */}
        <Ellipse cx={120} cy={100} rx={110} ry={80} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <Ellipse cx={120} cy={100} rx={80} ry={55} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Branching paths */}
        <Line x1={60} y1={60} x2={90} y2={120} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        <Line x1={180} y1={60} x2={150} y2={120} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        <Line x1={40} y1={55} x2={200} y2={55} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

        {/* Small orbiting nodes */}
        <AnimatedCircle
          cx={60}
          cy={60}
          r={8}
          fill="url(#cardGrad)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
        />
        <AnimatedCircle
          cx={180}
          cy={60}
          r={8}
          fill="url(#cardGrad)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
        />

        {/* Central card */}
        <G>
          <Rect
            x={80}
            y={100}
            width={80}
            height={56}
            rx={16}
            fill="url(#cardGrad)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1.5}
          />
        </G>

        {/* Sparkle dots */}
        <Circle cx={50} cy={45} r={2.5} fill="rgba(255,255,255,0.5)" />
        <Circle cx={190} cy={45} r={2.5} fill="rgba(255,255,255,0.5)" />
        <Circle cx={120} cy={25} r={3} fill="rgba(255,255,255,0.6)" />
        <Circle cx={85} cy={70} r={2} fill="rgba(255,255,255,0.4)" />
        <Circle cx={155} cy={70} r={2} fill="rgba(255,255,255,0.4)" />
      </Svg>

      {/* Central label */}
      <IllusLabel left={92} top={116} text="Din plan" />
    </View>
  );
});

// ── Animated SVG Circle helper ──────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── SVG text label rendered as RN Text overlay ──────────────────────

const IllusLabel: React.FC<{
  left: number;
  top: number;
  text: string;
}> = React.memo(({ left, top, text }) => (
  <View style={{ position: 'absolute' as const, left, top }}>
    <Text style={illusStyles.label}>{text}</Text>
  </View>
));

// ── Decorative background elements ──────────────────────────────────

const BackgroundDecoration: React.FC<{ accentColor: string }> = React.memo(
  ({ accentColor }) => {
    return (
      <View style={bgDecoStyles.container} pointerEvents="none">
        <View
          style={[
            bgDecoStyles.orb,
            {
              backgroundColor: accentColor,
              opacity: 0.06,
              top: -60,
              right: -40,
              width: 200,
              height: 200,
            },
          ]}
        />
        <View
          style={[
            bgDecoStyles.orb,
            {
              backgroundColor: accentColor,
              opacity: 0.04,
              bottom: -80,
              left: -60,
              width: 240,
              height: 240,
            },
          ]}
        />
        <View
          style={[
            bgDecoStyles.orb,
            {
              backgroundColor: '#FFFFFF',
              opacity: 0.03,
              top: '40%' as any,
              right: '10%' as any,
              width: 100,
              height: 100,
            },
          ]}
        />
      </View>
    );
  },
);

// ── Screens configuration ───────────────────────────────────────────

const SCREENS: FTUEScreen[] = [
  {
    id: 0,
    icon: <Layers size={44} color="#FFFFFF" strokeWidth={1.5} />,
    gradientIcon: <BookOpen size={44} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Strukturerat lärande',
    subtitle:
      'Kurser, moduler och lektioner — allt organiserat så att du enkelt kan följa din studieplan steg för steg.',
    gradientColors: ['#0F1B3D', '#162452', '#1A3A6B', '#0EA5E9'],
    accentColor: '#0EA5E9',
    Illustration: StructuredLearningIllustration,
  },
  {
    id: 1,
    icon: <Brain size={44} color="#FFFFFF" strokeWidth={1.5} />,
    gradientIcon: <Target size={44} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Förstå på djupet',
    subtitle:
      'Fokuserade studiepass med tydliga förklaringar. Lär dig på riktigt — inte bara för stunden, utan för livet.',
    gradientColors: ['#0A2E1F', '#0D3D2A', '#0F5C3B', '#10B981'],
    accentColor: '#10B981',
    Illustration: DeepUnderstandingIllustration,
  },
  {
    id: 2,
    icon: <ChartBar size={44} color="#FFFFFF" strokeWidth={1.5} />,
    gradientIcon: <TrendingUp size={44} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Se dina framsteg',
    subtitle:
      'Varje studiepass räknas. Följ din utveckling, lås upp achievements och bygg upp motivation över tid.',
    gradientColors: ['#2D1A0A', '#3D2410', '#5C3818', '#F59E0B'],
    accentColor: '#F59E0B',
    Illustration: ProgressIllustration,
  },
  {
    id: 3,
    icon: <Palette size={44} color="#FFFFFF" strokeWidth={1.5} />,
    gradientIcon: <Sparkles size={44} color="#FFFFFF" strokeWidth={1.5} />,
    title: 'Anpassat för dig',
    subtitle:
      'Välj ditt program och dina kurser. Appen anpassar innehåll, rekommendationer och studietekniker efter just dig.',
    gradientColors: ['#1A0A2E', '#2D1050', '#4C1D8A', '#8B5CF6'],
    accentColor: '#8B5CF6',
    Illustration: PersonalizedIllustration,
  },
];

// ── Main FTUE Component ─────────────────────────────────────────────

export default function FTUEScreen() {
  const insets = useSafeAreaInsets();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const current = SCREENS[currentIdx];
  const isLast = currentIdx === SCREENS.length - 1;

  // Progress bar animation
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: (currentIdx + 1) / SCREENS.length,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [currentIdx, progressAnim]);

  // Button press animation
  const onPressIn = useCallback(() => {
    Animated.spring(btnScale, {
      toValue: 0.96,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [btnScale]);

  const onPressOut = useCallback(() => {
    Animated.spring(btnScale, {
      toValue: 1,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [btnScale]);

  // Transition between screens
  const animateTransition = useCallback(
    (nextIdx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -40,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIdx(nextIdx);
        slideAnim.setValue(40);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    },
    [fadeAnim, slideAnim, isTransitioning],
  );

  const handleNext = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIdx < SCREENS.length - 1) {
      animateTransition(currentIdx + 1);
    } else {
      await completeFTUE();
    }
  }, [currentIdx, animateTransition]);

  const handleSkip = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeFTUE();
  }, []);

  const handleDotPress = useCallback(
    (index: number) => {
      if (index !== currentIdx && !isTransitioning) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animateTransition(index);
      }
    },
    [currentIdx, isTransitioning, animateTransition],
  );

  const completeFTUE = async () => {
    try {
      await AsyncStorage.setItem(FTUE_COMPLETED_KEY, 'true');
    } catch {
      // Silently continue
    }
    router.replace(ROUTES.auth as any);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={current.gradientColors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decoration */}
        <BackgroundDecoration accentColor={current.accentColor} />

        {/* Safe area wrapper */}
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {/* ── Header: Progress + Skip ── */}
          <View style={styles.header}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: 'rgba(255,255,255,0.85)',
                  },
                ]}
              />
            </View>

            {!isLast && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Hoppa över</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Main Content ── */}
          <Animated.View
            style={[
              styles.main,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Illustration */}
            <View style={styles.illustrationArea}>
              <current.Illustration progress={progressAnim} />
            </View>

            {/* Glass icon container */}
            <BlurView intensity={20} tint="light" style={styles.iconWrap}>
              {current.icon}
            </BlurView>

            {/* Title */}
            <Text style={styles.title}>{current.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </Animated.View>

          {/* ── Footer: Dots + Button ── */}
          <View style={styles.footer}>
            {/* Dot indicators */}
            <View style={styles.dotsRow}>
              {SCREENS.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleDotPress(idx)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Animated.View
                    style={[
                      styles.dot,
                      idx === currentIdx && styles.dotActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA Button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={styles.cta}
                onPress={handleNext}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.9}
              >
                <BlurView intensity={30} tint="light" style={styles.ctaInner}>
                  <Text style={styles.ctaText}>
                    {isLast ? 'Kom igång' : 'Fortsätt'}
                  </Text>
                  <ArrowRight
                    size={20}
                    color={current.accentColor}
                    strokeWidth={2.5}
                  />
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },

  // Main content
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Illustration
  illustrationArea: {
    width: SCREEN_WIDTH - 80,
    height: 210,
    marginBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Glass icon
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Typography
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },

  // Footer
  footer: {
    paddingBottom: Platform.OS === 'android' ? 12 : 0,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  // CTA
  cta: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

// ── Background Decoration Styles ─────────────────────────────────────

const bgDecoStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute' as const,
    borderRadius: 999,
  },
});

// ── Illustration container styles ────────────────────────────────────

const illusStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
});
