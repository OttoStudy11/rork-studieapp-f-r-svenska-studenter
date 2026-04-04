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

interface AISelectorScreenProps {
  onSelectMath: () => void;
  onSelectGeneral: () => void;
}

export default function AISelectorScreen({ onSelectMath, onSelectGeneral }: AISelectorScreenProps) {
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
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>AI Assistent</Text>
        <Text style={styles.subtitle}>Välj vilken AI du vill använda</Text>
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
            <LinearGradient
              colors={['#1a3a5c', '#0d2137', '#091a2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardIconRow}>
                <View style={styles.mathIconContainer}>
                  <Calculator size={28} color="#5eb8ff" />
                </View>
                <View style={styles.cameraTag}>
                  <Camera size={12} color="#5eb8ff" />
                  <Text style={styles.cameraTagText}>Kamera</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>Matematik AI</Text>
              <Text style={styles.mathCardDescription}>
                Fota uppgifter & få steg-för-steg-lösningar. Analyserar bilder, grafer och ekvationer.
              </Text>

              <View style={styles.mathFeatures}>
                <View style={styles.featureChip}>
                  <Text style={styles.featureChipText}>Steg-för-steg</Text>
                </View>
                <View style={styles.featureChip}>
                  <Text style={styles.featureChipText}>Bildanalys</Text>
                </View>
                <View style={styles.featureChip}>
                  <Text style={styles.featureChipText}>Grafer</Text>
                </View>
              </View>

              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>Öppna Mattechatten</Text>
                <ChevronRight size={18} color="#5eb8ff" />
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
              colors={['#1a4a3a', '#0d2e22', '#091f18']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardIconRow}>
                <View style={styles.generalIconContainer}>
                  <Sparkles size={28} color="#4ECDC4" />
                </View>
              </View>

              <Text style={styles.cardTitle}>Generell AI</Text>
              <Text style={styles.generalCardDescription}>
                Fråga om vad som helst. Studietips, sammanfattningar, förklaringar och mer.
              </Text>

              <View style={styles.generalFeatures}>
                <View style={styles.generalFeatureChip}>
                  <Text style={styles.generalFeatureChipText}>Studietips</Text>
                </View>
                <View style={styles.generalFeatureChip}>
                  <Text style={styles.generalFeatureChipText}>Förklaringar</Text>
                </View>
                <View style={styles.generalFeatureChip}>
                  <Text style={styles.generalFeatureChipText}>Allt</Text>
                </View>
              </View>

              <View style={styles.cardAction}>
                <Text style={styles.generalCardActionText}>Öppna Chatten</Text>
                <ChevronRight size={18} color="#4ECDC4" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <MessageSquare size={14} color="#888" />
        <Text style={styles.footerText}>Dina chattar sparas under sessionen</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8899aa',
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
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    backgroundColor: 'rgba(94,184,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(78,205,196,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94,184,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  cameraTagText: {
    fontSize: 12,
    color: '#5eb8ff',
    fontWeight: '600' as const,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  mathCardDescription: {
    fontSize: 14,
    color: '#8ab4d4',
    lineHeight: 20,
    marginBottom: 16,
  },
  generalCardDescription: {
    fontSize: 14,
    color: '#7fbfb8',
    lineHeight: 20,
    marginBottom: 16,
  },
  mathFeatures: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: 'rgba(94,184,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(94,184,255,0.15)',
  },
  featureChipText: {
    fontSize: 12,
    color: '#5eb8ff',
    fontWeight: '500' as const,
  },
  generalFeatures: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  generalFeatureChip: {
    backgroundColor: 'rgba(78,205,196,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.15)',
  },
  generalFeatureChipText: {
    fontSize: 12,
    color: '#4ECDC4',
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
    color: '#5eb8ff',
  },
  generalCardActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 20,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#556',
  },
});
