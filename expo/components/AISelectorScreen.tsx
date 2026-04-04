import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Calculator, Sparkles, ChevronRight, Camera, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AISelectorScreenProps {
  onSelectMath: () => void;
  onSelectGeneral: () => void;
}

export default function AISelectorScreen({ onSelectMath, onSelectGeneral }: AISelectorScreenProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(40)).current;
  const slideAnim2 = useRef(new Animated.Value(40)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim1, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim2, {
        toValue: 0,
        duration: 500,
        delay: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim1, slideAnim2]);

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.96,
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>AI Assistent</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Välj vilken AI du vill använda</Text>
        </Animated.View>
      </View>

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
            <LinearGradient
              colors={isDark ? ['#1a3a5c', '#0d2137', '#091a2e'] : ['#e8f4fd', '#d1eaf8', '#bde0f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.12)' }]}
            >
              <View style={styles.cardIconRow}>
                <View style={[styles.mathIconContainer, { backgroundColor: isDark ? 'rgba(94,184,255,0.12)' : 'rgba(37,99,235,0.12)' }]}>
                  <Calculator size={28} color={isDark ? '#5eb8ff' : '#2563eb'} />
                </View>
                <View style={[styles.cameraTag, { backgroundColor: isDark ? 'rgba(94,184,255,0.1)' : 'rgba(37,99,235,0.08)' }]}>
                  <Camera size={12} color={isDark ? '#5eb8ff' : '#2563eb'} />
                  <Text style={[styles.cameraTagText, { color: isDark ? '#5eb8ff' : '#2563eb' }]}>Kamera</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1a1a2e' }]}>Matematik AI</Text>
              <Text style={[styles.cardDescription, { color: isDark ? '#8ab4d4' : '#4a7a9b' }]}>
                Fota uppgifter & få steg-för-steg-lösningar. Analyserar bilder, grafer och ekvationer.
              </Text>

              <View style={styles.featuresRow}>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(94,184,255,0.08)' : 'rgba(37,99,235,0.06)', borderColor: isDark ? 'rgba(94,184,255,0.15)' : 'rgba(37,99,235,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: isDark ? '#5eb8ff' : '#2563eb' }]}>Steg-för-steg</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(94,184,255,0.08)' : 'rgba(37,99,235,0.06)', borderColor: isDark ? 'rgba(94,184,255,0.15)' : 'rgba(37,99,235,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: isDark ? '#5eb8ff' : '#2563eb' }]}>Bildanalys</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(94,184,255,0.08)' : 'rgba(37,99,235,0.06)', borderColor: isDark ? 'rgba(94,184,255,0.15)' : 'rgba(37,99,235,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: isDark ? '#5eb8ff' : '#2563eb' }]}>Grafer</Text>
                </View>
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: isDark ? '#5eb8ff' : '#2563eb' }]}>Öppna Mattechatten</Text>
                <ChevronRight size={18} color={isDark ? '#5eb8ff' : '#2563eb'} />
              </View>
            </LinearGradient>
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
            <LinearGradient
              colors={isDark ? ['#1a4a3a', '#0d2e22', '#091f18'] : ['#e8f8f5', '#d1f0eb', '#bde8e2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(78,205,196,0.12)' }]}
            >
              <View style={styles.cardIconRow}>
                <View style={[styles.generalIconContainer, { backgroundColor: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(78,205,196,0.12)' }]}>
                  <Sparkles size={28} color="#4ECDC4" />
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1a2e28' }]}>Generell AI</Text>
              <Text style={[styles.cardDescription, { color: isDark ? '#7fbfb8' : '#4a8a80' }]}>
                Fråga om vad som helst. Studietips, sammanfattningar, förklaringar och mer.
              </Text>

              <View style={styles.featuresRow}>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(78,205,196,0.08)' : 'rgba(78,205,196,0.06)', borderColor: isDark ? 'rgba(78,205,196,0.15)' : 'rgba(78,205,196,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: '#4ECDC4' }]}>Studietips</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(78,205,196,0.08)' : 'rgba(78,205,196,0.06)', borderColor: isDark ? 'rgba(78,205,196,0.15)' : 'rgba(78,205,196,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: '#4ECDC4' }]}>Förklaringar</Text>
                </View>
                <View style={[styles.featureChip, { backgroundColor: isDark ? 'rgba(78,205,196,0.08)' : 'rgba(78,205,196,0.06)', borderColor: isDark ? 'rgba(78,205,196,0.15)' : 'rgba(78,205,196,0.12)' }]}>
                  <Text style={[styles.featureChipText, { color: '#4ECDC4' }]}>Allt</Text>
                </View>
              </View>

              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#4ECDC4' }]}>Öppna Chatten</Text>
                <ChevronRight size={18} color="#4ECDC4" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim, paddingBottom: insets.bottom + 70 }]}>
        <MessageSquare size={14} color={theme.colors.textMuted} />
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Dina chattar sparas under sessionen</Text>
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
  header: {},
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  cardWrapper: {},
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 190,
    borderWidth: 1,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mathIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  cameraTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  featureChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 13,
  },
});
