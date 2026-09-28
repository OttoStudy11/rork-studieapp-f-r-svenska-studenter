import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, GraduationCap, Timer, Users, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// ── One-time flag ───────────────────────────────────────────────────────
// The walkthrough shows once per device on first entry into the tabs area
// (which is right after account creation / completed onboarding). Once
// WALKTHROUGH_SEEN_KEY is written it never shows again.
export const WALKTHROUGH_SEEN_KEY = 'studiestugan_walkthrough_seen';

// ── Palette (matches onboarding-v2 / premium gate) ─────────────────────
const BG_TOP = '#FCFCFA';
const BG_MID = '#F7F7F5';
const BG_BOT = '#EFF6F1';
const GREEN = '#10B981';
const GREEN_DARK = '#059669';
const ON_GREEN = '#FFFFFF';
const TITLE = '#1A2E25';
const SUB = '#6A7A72';
const DOT_IDLE = 'rgba(26,46,37,0.14)';

interface Slide {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    iconColor: GREEN_DARK,
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Välkommen till StudieStugan!',
    body: 'Ditt konto är klart — nu tar vi en snabb titt runt appen så du kommer igång direkt.',
  },
  {
    icon: BookOpen,
    iconColor: GREEN_DARK,
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Dina kurser',
    body: 'Allt du pluggar samlas under Kurser — lektioner, quiz och flashcards, med AI-hjälp när du kör fast.',
  },
  {
    icon: Timer,
    iconColor: GREEN_DARK,
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Fokus-timern',
    body: 'Plugga i koncentrerade pass och bygg din streak — små dagliga vanor ger stora resultat.',
  },
  {
    icon: GraduationCap,
    iconColor: '#B45309',
    iconBg: 'rgba(245,158,11,0.14)',
    title: 'Högskoleprovet',
    body: 'Går du HP? Där tränar du alla delprov — ORD, KVA, NOG, ELF, LÄS, MEK, DTK och XYZ.',
  },
  {
    icon: Users,
    iconColor: GREEN_DARK,
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Plugga med vänner',
    body: 'Lägg till vänner, jämför statistik och håll varandra motiverade — hårdare tillsammans.',
  },
];

interface WalkthroughProps {
  visible: boolean;
  onFinish: () => void;
}

/** One-time post-signup walkthrough. Render nothing when not visible. */
export default function Walkthrough({ visible, onFinish }: WalkthroughProps): React.ReactElement | null {
  const [slide, setSlide] = useState(0);
  const enter = useRef(new Animated.Value(0)).current;
  const isLast = slide === SLIDES.length - 1;

  useEffect(() => {
    if (!visible) return;
    enter.setValue(0);
    Animated.parallel([
      Animated.spring(enter, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.timing(enter, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [visible, slide, enter]);

  if (!visible) return null;

  const next = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      onFinish();
      return;
    }
    setSlide((s) => s + 1);
  };

  const current = SLIDES[slide];
  const Icon = current.icon;
  const iconScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const iconRotate = enter.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '0deg'],
  });
  const textTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={[BG_TOP, BG_MID, BG_BOT]}
        style={styles.fill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      >
        {/* Decorative glow */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: enter.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
          pointerEvents="none"
        />

        <TouchableOpacity
          style={styles.skipBtn}
          activeOpacity={0.7}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onFinish();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Hoppa över</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconWrap,
              { backgroundColor: current.iconBg, transform: [{ scale: iconScale }, { rotate: iconRotate }] },
            ]}
          >
            <Icon size={54} color={current.iconColor} strokeWidth={1.8} />
          </Animated.View>

          <Animated.View style={{ opacity: enter, transform: [{ translateY: textTranslate }] }}>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, i === slide && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cta, isLast && styles.ctaLast]}
            activeOpacity={0.85}
            onPress={next}
          >
            <LinearGradient
              colors={[GREEN, GREEN_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={[styles.ctaText, isLast && { color: ON_GREEN }]}>{isLast ? 'Kom igång!' : 'Vidare'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  fill: { flex: 1 },
  glow: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  skipBtn: {
    position: 'absolute',
    top: 64,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(26,46,37,0.08)',
  },
  skipText: { fontSize: 13, fontWeight: '600', color: SUB },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: TITLE,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 24,
    color: SUB,
    textAlign: 'center',
    maxWidth: width - 80,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DOT_IDLE,
  },
  dotActive: {
    width: 22,
    backgroundColor: GREEN,
  },
  cta: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaLast: {
    shadowColor: GREEN_DARK,
  },
  ctaText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: ON_GREEN,
    letterSpacing: 0.2,
  },
});
