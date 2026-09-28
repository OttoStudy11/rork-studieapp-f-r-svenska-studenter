import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// ── One-time flag ───────────────────────────────────────────────────────
// The walkthrough shows once per device on first entry into the tabs area
// (right after account creation / completed onboarding). Once the seen key
// is written it never shows again.
export const WALKTHROUGH_SEEN_KEY = 'studiestugan_walkthrough_seen';

// ── Palette (matches onboarding-v2 / premium gate) ─────────────────────
const GREEN = '#10B981';
const GREEN_DARK = '#059669';
const TITLE = '#1A2E25';
const SUB = '#5F6F66';

// ── Anchor registry ─────────────────────────────────────────────────────
// Screens register the real UI elements the spotlight should point at; the
// overlay measures them in window coordinates when its step becomes active.
const anchors = new Map<string, View>();

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WalkthroughAnchorProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Wraps a real UI element and registers it as a walkthrough spotlight target. */
export function WalkthroughAnchor({ id, style, children }: WalkthroughAnchorProps): React.ReactElement {
  return (
    <View
      style={style}
      collapsable={false}
      ref={(v) => {
        if (v) anchors.set(id, v);
        else anchors.delete(id);
      }}
    >
      {children}
    </View>
  );
}

// Tab bar geometry mirrors the constants in (tabs)/_layout.tsx.
function getTabBarRect(): Rect {
  const { width, height } = Dimensions.get('window');
  const h = 64;
  const bottom = Platform.OS === 'ios' ? 24 : 16;
  return { x: 20, y: height - bottom - h, width: width - 40, height: h };
}

// Measures a registered anchor, retrying briefly while entrance animations
// (SlideInView etc.) settle and views reach their final position.
function measureAnchor(id: string): Promise<Rect | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const attempt = () => {
      const view = anchors.get(id);
      if (!view) return retry();
      view.measureInWindow((x, y, w, h) => {
        if (w > 0 && h > 0) resolve({ x, y, width: w, height: h });
        else retry();
      });
    };
    const retry = () => {
      if (attempts++ >= 15) return resolve(null);
      setTimeout(attempt, 150);
    };
    attempt();
  });
}

// ── Steps (max 4, pointing at real UI) ──────────────────────────────────
interface Step {
  anchor: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    anchor: 'home-hero',
    title: 'Din streak & dina poäng',
    body: 'Här följer du din streak, dagens pass och dina poäng — plugga varje dag för att hålla flammorna vid liv.',
  },
  {
    anchor: 'home-focus',
    title: 'Starta fokus',
    body: 'Ett tryck här startar fokus-timern — så bygger du streak och poäng.',
  },
  {
    anchor: 'home-profile',
    title: 'Din profil',
    body: 'Tryck på din avatar för att anpassa den och hitta dina inställningar.',
  },
  {
    anchor: 'tabbar',
    title: 'Allt på ett ställe',
    body: 'Växla mellan Hem, Kurser, Timer, Vänner och HP här nere.',
  },
];

const HOLE_PAD = 10;
const DIM = 'rgba(12,20,16,0.78)';

interface WalkthroughProps {
  visible: boolean;
  onFinish: () => void;
}

/** One-time in-app coach-mark walkthrough: dimmed screen with a spotlight
 *  hole around each real element and a short tooltip pointing at it. */
export default function Walkthrough({ visible, onFinish }: WalkthroughProps): React.ReactElement | null {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [win, setWin] = useState(() => Dimensions.get('window'));
  const fade = useRef(new Animated.Value(0)).current;

  // Reset when shown.
  useEffect(() => {
    if (visible) {
      setStep(0);
      setWin(Dimensions.get('window'));
    }
  }, [visible]);

  // Measure the current step's target whenever the step changes.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setRect(null);
    fade.setValue(0);
    (async () => {
      const s = STEPS[step];
      const r = s.anchor === 'tabbar' ? getTabBarRect() : await measureAnchor(s.anchor);
      if (cancelled) return;
      if (!r) {
        // Target never appeared (e.g. premium badge layout change) — skip it.
        advance();
        return;
      }
      setRect(r);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step]);

  if (!visible) return null;

  const advance = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step >= STEPS.length - 1) {
      onFinish();
      return;
    }
    setStep((s) => s + 1);
  };

  // Spotlight geometry (hole slightly larger than the target).
  const hole = rect
    ? {
        x: Math.max(0, rect.x - HOLE_PAD),
        y: Math.max(0, rect.y - HOLE_PAD),
        w: Math.min(win.width, rect.width + HOLE_PAD * 2),
        h: rect.height + HOLE_PAD * 2,
      }
    : null;

  // Tooltip above the hole when there is room, otherwise below it.
  const tooltipWidth = Math.min(win.width - 48, 300);
  const tooltipX = hole
    ? Math.min(Math.max(24, hole.x + hole.w / 2 - tooltipWidth / 2), win.width - 24 - tooltipWidth)
    : 24;
  const tooltipAbove = hole ? hole.y > 170 : true;
  const arrowX = hole
    ? Math.min(Math.max(tooltipX + 18, hole.x + hole.w / 2 - 9), tooltipX + tooltipWidth - 36)
    : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.fill}>
        {/* Tap-anywhere-to-advance surface */}
        <Pressable style={StyleSheet.absoluteFill} onPress={advance} />

        {/* Dimmed cut-out: four rects around the hole */}
        {hole && (
          <>
            <View style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} pointerEvents="none" />
            <View
              style={[styles.dim, { top: hole.y + hole.h, left: 0, right: 0, bottom: 0 }]}
              pointerEvents="none"
            />
            <View style={[styles.dim, { top: hole.y, height: hole.h, left: 0, width: hole.x }]} pointerEvents="none" />
            <View
              style={[styles.dim, { top: hole.y, height: hole.h, left: hole.x + hole.w, right: 0 }]}
              pointerEvents="none"
            />
          </>
        )}

        {/* Spotlight ring */}
        {hole && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              { left: hole.x, top: hole.y, width: hole.w, height: hole.h, opacity: fade },
            ]}
          />
        )}

        {/* Tooltip */}
        {hole && (
          <Animated.View
            style={[
              styles.tooltip,
              tooltipAbove
                ? { bottom: win.height - hole.y + 10, left: tooltipX, width: tooltipWidth }
                : { top: hole.y + hole.h + 10, left: tooltipX, width: tooltipWidth },
              { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
            ]}
          >
            <View
              style={[
                styles.arrow,
                tooltipAbove
                  ? { bottom: -7, left: arrowX - tooltipX }
                  : { top: -7, left: arrowX - tooltipX },
              ]}
            />
            <Text style={styles.title}>{STEPS[step].title}</Text>
            <Text style={styles.body}>{STEPS[step].body}</Text>
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Skip */}
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
          <X size={14} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  dim: { position: 'absolute', backgroundColor: DIM },
  ring: {
    position: 'absolute',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 0,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  arrow: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: TITLE,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: SUB,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(26,46,37,0.14)',
  },
  dotActive: {
    width: 18,
    backgroundColor: GREEN_DARK,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  skipText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
