import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Calculator, Sparkles, ChevronRight, MessageSquare, Brain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

interface AISelectorScreenProps {
  onSelectMath: () => void;
  onSelectGeneral: () => void;
}

export default function AISelectorScreen({ onSelectMath, onSelectGeneral }: AISelectorScreenProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(50)).current;
  const slideAnim2 = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim1, {
        toValue: 0,
        tension: 50,
        friction: 9,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim2, {
        toValue: 0,
        tension: 50,
        friction: 9,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim1, slideAnim2, headerFade, headerSlide]);

  const handlePressIn = (anim: Animated.Value) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0F1C' : '#F5F7FA' }]}>
      <Animated.View style={[styles.headerArea, { paddingTop: insets.top + 16, opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerBadge, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)' }]}>
            <Brain size={16} color="#6366F1" />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>AI Assistent ✨</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#64748B' : '#94A3B8' }]}>Välj din smarta studiekompis</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.cardsContainer}>
        <Animated.View style={[
          styles.cardWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim1 },
              { scale: scaleAnim1 },
            ],
          },
        ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => handlePressIn(scaleAnim1)}
            onPressOut={() => handlePressOut(scaleAnim1)}
            onPress={onSelectMath}
            testID="math-ai-card"
          >
            <View style={[styles.card, {
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderColor: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(14,165,233,0.1)',
              shadowColor: '#0EA5E9',
              shadowOpacity: isDark ? 0.15 : 0.08,
            }]}>
              <View style={styles.cardTopRow}>
                <LinearGradient
                  colors={['#0EA5E9', '#0284C7', '#0369A1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Calculator size={24} color="#fff" />
                </LinearGradient>
                <View style={[styles.liveTag, { backgroundColor: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)' }]}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTagText}>Online</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>📐 Matematik AI</Text>
              <Text style={[styles.cardDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Fota uppgifter, skriv ekvationer & få steg-för-steg-lösningar direkt
              </Text>

              <View style={styles.featuresRow}>
                {['📸 Fotolösning', '📊 Grafanalys', '🧮 Steg-för-steg'].map((feat, i) => (
                  <View key={i} style={[styles.featureChip, {
                    backgroundColor: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(14,165,233,0.05)',
                    borderColor: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(14,165,233,0.1)',
                  }]}>
                    <Text style={[styles.featureChipText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#0EA5E9' }]}>Öppna Mattechatten</Text>
                <View style={[styles.arrowCircle, { backgroundColor: 'rgba(14,165,233,0.1)' }]}>
                  <ChevronRight size={16} color="#0EA5E9" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.cardWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim2 },
              { scale: scaleAnim2 },
            ],
          },
        ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => handlePressIn(scaleAnim2)}
            onPressOut={() => handlePressOut(scaleAnim2)}
            onPress={onSelectGeneral}
            testID="general-ai-card"
          >
            <View style={[styles.card, {
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderColor: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(16,185,129,0.1)',
              shadowColor: '#10B981',
              shadowOpacity: isDark ? 0.15 : 0.08,
            }]}>
              <View style={styles.cardTopRow}>
                <LinearGradient
                  colors={['#10B981', '#059669', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Sparkles size={24} color="#fff" />
                </LinearGradient>
                <View style={[styles.liveTag, { backgroundColor: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)' }]}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTagText}>Online</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>💬 Generell AI</Text>
              <Text style={[styles.cardDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Studietips, sammanfattningar, förklaringar & allt du behöver hjälp med
              </Text>

              <View style={styles.featuresRow}>
                {['💡 Studietips', '📝 Förklaringar', '🎯 Allt möjligt'].map((feat, i) => (
                  <View key={i} style={[styles.featureChip, {
                    backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
                    borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                  }]}>
                    <Text style={[styles.featureChipText, { color: isDark ? '#34D399' : '#059669' }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#10B981' }]}>Öppna Chatten</Text>
                <View style={[styles.arrowCircle, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                  <ChevronRight size={16} color="#10B981" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim, paddingBottom: insets.bottom + 90 }]}>
        <View style={[styles.footerPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <MessageSquare size={12} color={isDark ? '#64748B' : '#94A3B8'} />
          <Text style={[styles.footerText, { color: isDark ? '#64748B' : '#94A3B8' }]}>Dina chattar sparas under sessionen</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '400' as const,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  cardWrapper: {},
  card: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#22C55E',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
    fontWeight: '400' as const,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  featureChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  featureChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardActionText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
