import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  PanResponder,
  BackHandler,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  Repeat,
  GraduationCap,
  Flame,
  TrendingUp,
} from 'lucide-react-native';
import { ROUTES } from '@/utils/typedRoutes';

const { width: SW, height: SH } = Dimensions.get('window');
const FTUE_SEEN_KEY = 'ftue_intro_seen_v3';

// Brand palette — identical to the onboarding design system.
const BG = '#FFFFFF';
const BG2 = '#F2F2F7';
const TEXT1 = '#1C1C1E';
const TEXT2 = '#636366';
const TEXT3 = '#AEAEB2';
const ACCENT = '#10B981';
const ACCENT_TINT = 'rgba(16,185,129,0.10)';
const DARK_BTN = '#1C1C1E';
const BORDER = '#E5E5EA';

const LOGO_URI =
  'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm';

const STEP_COUNT = 3;

// ── Step 1 — mini UI mock (real StudieStugan moments) ─────────────────

const MiniCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  meta: string;
  progress?: number;
  delay?: number;
  style?: object;
}> = React.memo(({ icon, title, meta, progress, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    });
    t.start();
    return () => t.stop();
  }, [anim, delay]);

  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View style={[mockStyles.card, { opacity, transform: [{ translateY }] }, style]}>
      <View style={mockStyles.iconWrap}>{icon}</View>
      <View style={mockStyles.cardBody}>
        <Text style={mockStyles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={mockStyles.cardMeta} numberOfLines={1}>
          {meta}
        </Text>
        {progress !== undefined && (
          <View style={mockStyles.barTrack}>
            <View style={[mockStyles.barFill, { width: `${progress}%` }]} />
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const HeroMock: React.FC = React.memo(() => (
  <View style={mockStyles.stack}>
    <MiniCard
      icon={<GraduationCap size={18} color={ACCENT} strokeWidth={2.2} />}
      title="Matematik 3c"
      meta="Kapitel 4 · 68% klart"
      progress={68}
      delay={150}
    />
    <MiniCard
      icon={<Target size={18} color={ACCENT} strokeWidth={2.2} />}
      title="Högskoleprovet"
      meta="Dagens träning · 12 frågor"
      delay={300}
      style={{ marginLeft: 18 }}
    />
    <MiniCard
      icon={<Sparkles size={18} color={ACCENT} strokeWidth={2.2} />}
      title="AI-studieassistent"
      meta="Hittade 3 svaga områden"
      delay={450}
      style={{ marginLeft: 36 }}
    />
  </View>
));

// ── Step 2 — capability rows, staggered ───────────────────────────────

const CAPABILITIES: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <BookOpen size={20} color={ACCENT} strokeWidth={2.1} />,
    title: 'Kurser',
    desc: 'Håll koll på allt du läser',
  },
  {
    icon: <Target size={20} color={ACCENT} strokeWidth={2.1} />,
    title: 'Högskoleprovet',
    desc: 'Träna inför provet',
  },
  {
    icon: <Brain size={20} color={ACCENT} strokeWidth={2.1} />,
    title: 'Quiz',
    desc: 'Testa vad du kan',
  },
  {
    icon: <Repeat size={20} color={ACCENT} strokeWidth={2.1} />,
    title: 'Repetition',
    desc: 'Repetera det du behöver',
  },
  {
    icon: <Sparkles size={20} color={ACCENT} strokeWidth={2.1} />,
    title: 'AI-hjälp',
    desc: 'Personlig hjälp när du fastnar',
  },
];

const CapabilityRow: React.FC<{ item: (typeof CAPABILITIES)[number]; index: number; shown: boolean }> =
  React.memo(({ item, index, shown }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      anim.setValue(0);
      if (!shown) return;
      const t = Animated.timing(anim, {
        toValue: 1,
        duration: 420,
        delay: 120 + index * 90,
        useNativeDriver: true,
      });
      t.start();
      return () => t.stop();
    }, [anim, shown, index]);

    const opacity = anim;
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

    return (
      <Animated.View style={[capStyles.row, { opacity, transform: [{ translateY }, { scale }] }]}>
        <View style={capStyles.iconWrap}>{item.icon}</View>
        <View style={capStyles.body}>
          <Text style={capStyles.title}>{item.title}</Text>
          <Text style={capStyles.desc} numberOfLines={1}>
            {item.desc}
          </Text>
        </View>
      </Animated.View>
    );
  });

// ── Step 3 — outcome chips ────────────────────────────────────────────

const OUTCOMES = [
  { icon: <Flame size={18} color={ACCENT} strokeWidth={2.2} />, label: 'Streak' },
  { icon: <TrendingUp size={18} color={ACCENT} strokeWidth={2.2} />, label: 'Framsteg' },
  { icon: <Target size={18} color={ACCENT} strokeWidth={2.2} />, label: 'Fokus' },
];

// ── Main component ────────────────────────────────────────────────────

export default function FTUEScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Entrance: popup fades + scales in.
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryScale = useRef(new Animated.Value(0.96)).current;

  // Per-step slide/fade transition.
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // CTA microinteraction.
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(entryScale, {
        toValue: 1,
        tension: 90,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacity, entryScale]);

  // Hardware back: step back between steps, never skip the flow silently.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0 && !isTransitioning) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animateTransition(step - 1, -1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  });

  // Staggered capability cards replay when entering step 2.
  const [capShown, setCapShown] = useState(false);
  useEffect(() => {
    if (step === 1) {
      setCapShown(false);
      const t = setTimeout(() => setCapShown(true), 60);
      return () => clearTimeout(t);
    }
  }, [step]);

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

  const animateTransition = useCallback(
    (nextIdx: number, dir: 1 | -1) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideAnim, {
          toValue: -24 * dir,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(nextIdx);
        slideAnim.setValue(28 * dir);

        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 90,
            friction: 11,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    },
    [fadeAnim, slideAnim, isTransitioning],
  );

  const goNext = useCallback(() => {
    if (step < STEP_COUNT - 1) animateTransition(step + 1, 1);
  }, [step, animateTransition]);

  const completeFTUE = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FTUE_SEEN_KEY, 'true');
    } catch {
      // Fails safe: worst case the intro is shown again on next launch.
    }
    router.replace(ROUTES.auth as any);
  }, []);

  const handleCta = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEP_COUNT - 1) {
      goNext();
    } else {
      await completeFTUE();
    }
  }, [step, goNext, completeFTUE]);

  // Horizontal swipe between steps.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 24 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -40 && step < STEP_COUNT - 1 && !isTransitioning) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animateTransition(step + 1, 1);
        } else if (g.dx > 40 && step > 0 && !isTransitioning) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animateTransition(step - 1, -1);
        }
      },
    }),
  ).current;

  const ctaLabel = step === 0 ? 'Visa mig' : step === 1 ? 'Nästa' : 'Kom igång';

  return (
    <Animated.View
      style={[
        styles.root,
        { opacity: entryOpacity, transform: [{ scale: entryScale }] },
      ]}
    >
      {/* Subtle atmospheric background */}
      <LinearGradient
        colors={['#FFFFFF', '#F6FBF9', '#F2F2F7']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* ── Header: progress dots + skip ── */}
        <View style={styles.header}>
          <View style={styles.dotsRow}>
            {Array.from({ length: STEP_COUNT }).map((_, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  idx === step && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {step < STEP_COUNT - 1 && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                void completeFTUE();
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.skipText} maxFontSizeMultiplier={1.3}>Hoppa över</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Steps (swipeable) ── */}
        <View style={styles.main} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.stepWrap,
              { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
            ]}
            pointerEvents={isTransitioning ? 'none' : 'auto'}
          >
            {step === 0 && (
              <View style={styles.stepInner}>
                <View style={styles.logoWrap}>
                  <Image source={{ uri: LOGO_URI }} style={styles.logoImg} contentFit="contain" />
                </View>
                <Text style={styles.title} maxFontSizeMultiplier={1.15}>
                  Plugga <Text style={styles.titleAccent}>smartare.</Text>{'\n'}Inte mer.
                </Text>
                <Text style={styles.body} maxFontSizeMultiplier={1.25}>
                  StudieStugan samlar ditt plugg på ett ställe och hjälper dig ta reda på
                  vad du faktiskt behöver fokusera på.
                </Text>
                <HeroMock />
              </View>
            )}

            {step === 1 && (
              <View style={styles.stepInner}>
                <Text style={styles.title} maxFontSizeMultiplier={1.15}>
                  Allt ditt plugg.{'\n'}
                  <Text style={styles.titleAccent}>På ett ställe.</Text>
                </Text>
                <View style={styles.capList}>
                  {CAPABILITIES.map((item, idx) => (
                    <CapabilityRow key={item.title} item={item} index={idx} shown={capShown} />
                  ))}
                </View>
                <Text style={styles.body} maxFontSizeMultiplier={1.25}>
                  Från vanliga skolkurser till Högskoleprovet — StudieStugan hjälper dig
                  hela vägen.
                </Text>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepInner}>
                <Text style={styles.title} maxFontSizeMultiplier={1.15}>
                  Redo att <Text style={styles.titleAccent}>börja?</Text>
                </Text>
                <Text style={styles.body} maxFontSizeMultiplier={1.25}>
                  Vi hjälper dig hålla koll på vad du ska plugga, vad du behöver träna på
                  och hur du faktiskt utvecklas.
                </Text>
                <View style={styles.outcomeRow}>
                  {OUTCOMES.map((o) => (
                    <View key={o.label} style={styles.outcomeChip}>
                      {o.icon}
                      <Text style={styles.outcomeLabel}>{o.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.footer}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => {
                void handleCta();
              }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.9}
            >
              <Text
                style={styles.ctaText}
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1.15}
              >
                {ctaLabel}
              </Text>
              {step === STEP_COUNT - 1 ? (
                <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} />
              ) : (
                <ArrowRight size={19} color="rgba(255,255,255,0.85)" strokeWidth={2.6} />
              )}
            </TouchableOpacity>
          </Animated.View>
          {step === 0 && (
            <Text style={styles.footerHint} maxFontSizeMultiplier={1.3}>Tar mindre än en minut</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  orbTop: {
    position: 'absolute' as const,
    top: -SH * 0.12,
    right: -SW * 0.22,
    width: SH * 0.34,
    height: SH * 0.34,
    borderRadius: 999,
    backgroundColor: ACCENT,
    opacity: 0.07,
  },
  orbBottom: {
    position: 'absolute' as const,
    bottom: -SH * 0.14,
    left: -SW * 0.24,
    width: SH * 0.36,
    height: SH * 0.36,
    borderRadius: 999,
    backgroundColor: ACCENT,
    opacity: 0.05,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BORDER,
  },
  dotActive: {
    width: 24,
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    color: TEXT3,
    fontSize: 14,
    fontWeight: '500' as const,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },
  stepWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  logoImg: {
    width: 46,
    height: 46,
  },

  title: {
    fontSize: Math.min(SW * 0.088, 33),
    fontWeight: '800' as const,
    color: TEXT1,
    textAlign: 'center',
    letterSpacing: -0.9,
    lineHeight: Math.min(SW * 0.11, 41),
  },
  titleAccent: {
    color: ACCENT,
  },
  body: {
    fontSize: 15.5,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 14,
    paddingHorizontal: 10,
    maxWidth: 320,
  },

  capList: {
    marginTop: 26,
    marginBottom: 20,
    alignSelf: 'stretch' as const,
    gap: 9,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 30,
  },
  outcomeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outcomeLabel: {
    fontSize: 13.5,
    fontWeight: '600' as const,
    color: TEXT1,
  },

  footer: {
    alignItems: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DARK_BTN,
    borderRadius: 18,
    height: 56,
    alignSelf: 'stretch' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
  },
  footerHint: {
    marginTop: 12,
    fontSize: 12.5,
    color: TEXT3,
    fontWeight: '500' as const,
  },
});

// ── Hero mock styles (step 1) ─────────────────────────────────────────

const mockStyles = StyleSheet.create({
  stack: {
    marginTop: 30,
    alignSelf: 'stretch' as const,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignSelf: 'stretch' as const,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ACCENT_TINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700' as const,
    color: TEXT1,
  },
  cardMeta: {
    fontSize: 12,
    color: TEXT2,
    marginTop: 2,
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: BG2,
    marginTop: 8,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
});

// ── Capability row styles (step 2) ────────────────────────────────────

const capStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: ACCENT_TINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: TEXT1,
  },
  desc: {
    fontSize: 12.5,
    color: TEXT2,
    marginTop: 1,
  },
});
