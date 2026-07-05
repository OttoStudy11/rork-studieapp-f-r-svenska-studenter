// RatingModal — premium glassmorphism rating prompt
// Phases: celebrating → rating → feedback → thanks
// 5★ routes to native store review via expo-store-review (handled in context).
// 1–4★ routes to internal feedback so we never send unhappy users to the store.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, X, Sparkles, Bug, Lightbulb, MessageSquare, Check, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRating } from '@/contexts/RatingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PALETTE = {
  offWhite: '#FAFAF8',
  softWhite: '#F7F7F5',
  ink: '#1A1D2E',
  inkSoft: '#3A3F5C',
  muted: '#7A8099',
  border: 'rgba(255,255,255,0.65)',
  borderSoft: 'rgba(20,20,40,0.06)',
  emerald: '#10B981',
  emeraldDeep: '#059669',
  indigo: '#6366F1',
  rose: '#F43F5E',
  amber: '#F59E0B',
};

interface StarButtonProps {
  index: number;
  selected: number;
  onPress: (i: number) => void;
}

const StarButton: React.FC<StarButtonProps> = ({ index, selected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isFilled = index <= selected;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.82,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 220,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(index)}
      style={styles.starButton}
      accessibilityLabel={`${index} stjärnor`}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Star
          size={40}
          color={isFilled ? PALETTE.amber : '#D1D5DB'}
          fill={isFilled ? PALETTE.amber : 'transparent'}
          strokeWidth={isFilled ? 0 : 1.5}
        />
      </Animated.View>
    </Pressable>
  );
};

const RatingModal: React.FC = () => {
  const {
    isModalVisible,
    modalPhase,
    pendingPrompt,
    selectedRating,
    onRatingSelected,
    onDismiss,
    onSubmitFeedback,
    onCloseThanks,
  } = useRating();

  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [slideAnim] = useState(new Animated.Value(40));
  const [feedbackKind, setFeedbackKind] = useState<'bug' | 'feature' | 'general' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [celebrateAnim] = useState(new Animated.Value(0));

  // Animate in when modal becomes visible
  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 120 }),
        Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(40);
      setFeedbackKind(null);
      setFeedbackText('');
    }
  }, [isModalVisible, fadeAnim, scaleAnim, slideAnim]);

  // Celebration → rating transition
  useEffect(() => {
    if (modalPhase === 'celebrating') {
      Animated.timing(celebrateAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }).start(() => {
        setModalPhaseLocal('rating');
      });
    }
  }, [modalPhase, celebrateAnim]);

  // Local phase mirror so we can advance celebration → rating without context churn
  const [modalPhaseLocal, setModalPhaseLocal] = useState(modalPhase);
  useEffect(() => {
    setModalPhaseLocal(modalPhase);
  }, [modalPhase]);

  const handleStarPress = async (i: number) => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    await onRatingSelected(i);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackKind) return;
    await onSubmitFeedback(feedbackKind, feedbackText.trim());
  };

  if (!isModalVisible) return null;

  const phase = modalPhaseLocal;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlayWrap}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centerWrap}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                opacity: fadeAnim,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <View style={styles.glassCard}>
                {/* Decorative gradient glow */}
                <LinearGradient
                  colors={[PALETTE.indigo, PALETTE.emerald]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGlow}
                  pointerEvents="none"
                />

                {/* Close */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onDismiss}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  accessibilityLabel="Stäng"
                >
                  <X size={20} color={PALETTE.muted} />
                </TouchableOpacity>

                {/* ====== CELEBRATION PHASE ====== */}
                {phase === 'celebrating' && (
                  <View style={styles.phaseWrap}>
                    <View style={styles.celebrateIconWrap}>
                      <LinearGradient
                        colors={[PALETTE.emerald, PALETTE.emeraldDeep]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.celebrateIconCircle}
                      >
                        <Sparkles size={34} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.celebrateTitle}>
                      {pendingPrompt?.celebrationTitle ?? 'Grattis!'}
                    </Text>
                    <Text style={styles.celebrateMessage}>
                      {pendingPrompt?.celebrationMessage ?? ''}
                    </Text>
                  </View>
                )}

                {/* ====== RATING PHASE ====== */}
                {phase === 'rating' && (
                  <View style={styles.phaseWrap}>
                    <View style={styles.heroIconWrap}>
                      <LinearGradient
                        colors={[PALETTE.indigo, '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroIconCircle}
                      >
                        <Star size={30} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.headline}>Gillar du Studiestugan?</Text>
                    <Text style={styles.subtitle}>
                      Vi bygger Sveriges bästa plattform för studier —{'\n'}
                      och vi skulle älska din feedback.
                    </Text>

                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarButton
                          key={i}
                          index={i}
                          selected={selectedRating}
                          onPress={handleStarPress}
                        />
                      ))}
                    </View>

                    <Text style={styles.starsHint}>
                      Hur skulle du betygsätta din upplevelse?
                    </Text>
                  </View>
                )}

                {/* ====== FEEDBACK PHASE (low rating) ====== */}
                {phase === 'feedback' && (
                  <View style={styles.phaseWrap}>
                    <View style={styles.heroIconWrap}>
                      <LinearGradient
                        colors={['#F59E0B', PALETTE.rose]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroIconCircle}
                      >
                        <MessageSquare size={28} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.headline}>Tack för att du hjälper oss bli bättre</Text>
                    <Text style={styles.subtitle}>
                      Berätta för oss hur vi kan förbättra din upplevelse.
                    </Text>

                    <View style={styles.feedbackKinds}>
                      <FeedbackKindChip
                        label="Rapportera fel"
                        icon={<Bug size={16} color={feedbackKind === 'bug' ? '#FFFFFF' : PALETTE.muted} />}
                        active={feedbackKind === 'bug'}
                        onPress={() => setFeedbackKind('bug')}
                      />
                      <FeedbackKindChip
                        label="Föreslå funktion"
                        icon={<Lightbulb size={16} color={feedbackKind === 'feature' ? '#FFFFFF' : PALETTE.muted} />}
                        active={feedbackKind === 'feature'}
                        onPress={() => setFeedbackKind('feature')}
                      />
                      <FeedbackKindChip
                        label="Övrig feedback"
                        icon={<MessageSquare size={16} color={feedbackKind === 'general' ? '#FFFFFF' : PALETTE.muted} />}
                        active={feedbackKind === 'general'}
                        onPress={() => setFeedbackKind('general')}
                      />
                    </View>

                    <TextInput
                      style={styles.feedbackInput}
                      placeholder="Skriv din feedback här…"
                      placeholderTextColor={PALETTE.muted}
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                      multiline
                      maxLength={1000}
                      textAlignVertical="top"
                    />

                    <TouchableOpacity
                      style={[styles.submitBtn, !feedbackKind && styles.submitBtnDisabled]}
                      onPress={handleSubmitFeedback}
                      disabled={!feedbackKind}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitBtnText}>Skicka feedback</Text>
                      <Send size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* ====== THANKS PHASE ====== */}
                {phase === 'thanks' && (
                  <View style={styles.phaseWrap}>
                    <View style={styles.thanksIconWrap}>
                      <LinearGradient
                        colors={[PALETTE.emerald, PALETTE.emeraldDeep]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroIconCircle}
                      >
                        <Check size={32} color="#FFFFFF" strokeWidth={3} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.headline}>Tack för din feedback!</Text>
                    <Text style={styles.subtitle}>
                      Vi läser varje meddelande och jobbar hårt på att{'\n'}
                      göra Studiestugan bättre för dig.
                    </Text>
                    <TouchableOpacity
                      style={styles.thanksBtn}
                      onPress={onCloseThanks}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.thanksBtnText}>Klar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Dismiss hint under the card */}
              {(phase === 'rating' || phase === 'celebrating') && (
                <TouchableOpacity onPress={onDismiss} style={styles.dismissHint}>
                  <Text style={styles.dismissHintText}>Kanske senare</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// FeedbackKindChip
// ---------------------------------------------------------------------------
interface FeedbackKindChipProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}

const FeedbackKindChip: React.FC<FeedbackKindChipProps> = ({ label, icon, active, onPress }) => (
  <TouchableOpacity
    style={[styles.kindChip, active && styles.kindChipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon}
    <Text style={[styles.kindChipText, active && styles.kindChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  overlayWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,18,32,0.45)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  glassCard: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    padding: 28,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1A1D2E',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.22,
        shadowRadius: 36,
      },
      android: { elevation: 18 },
    }),
  },
  cardGlow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.18,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20,20,40,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  phaseWrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  // Celebration
  celebrateIconWrap: { marginBottom: 18 },
  celebrateIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PALETTE.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  celebrateMessage: {
    fontSize: 15,
    color: PALETTE.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  // Hero icon
  heroIconWrap: { marginBottom: 18 },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 23,
    fontWeight: '800',
    color: PALETTE.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: PALETTE.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  // Stars
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  starButton: {
    padding: 6,
  },
  starsHint: {
    fontSize: 13,
    color: PALETTE.muted,
    textAlign: 'center',
  },
  // Feedback
  feedbackKinds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(20,20,40,0.05)',
    borderWidth: 1,
    borderColor: PALETTE.borderSoft,
  },
  kindChipActive: {
    backgroundColor: PALETTE.indigo,
    borderColor: PALETTE.indigo,
  },
  kindChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.inkSoft,
  },
  kindChipTextActive: {
    color: '#FFFFFF',
  },
  feedbackInput: {
    width: '100%',
    minHeight: 110,
    backgroundColor: 'rgba(20,20,40,0.04)',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: PALETTE.ink,
    borderWidth: 1,
    borderColor: PALETTE.borderSoft,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: PALETTE.indigo,
  },
  submitBtnDisabled: {
    backgroundColor: '#C7CADD',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Thanks
  thanksIconWrap: { marginBottom: 18 },
  thanksBtn: {
    marginTop: 18,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: PALETTE.emerald,
    alignItems: 'center',
  },
  thanksBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dismissHint: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissHintText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
});

export default RatingModal;
