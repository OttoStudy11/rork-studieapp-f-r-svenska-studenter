import React, { useState, useRef, useEffect } from 'react';
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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Target, TrendingUp, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FTUE_COMPLETED_KEY = 'ftue_completed_v1';

interface FTUEScreen {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradientColors: readonly [string, string, string];
  illustrationElements: React.ReactNode;
}

export default function FTUEScreen() {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const illustrationAnim = useRef(new Animated.Value(0)).current;

  const screens: FTUEScreen[] = [
    {
      id: 0,
      icon: <BookOpen size={48} color="#FFFFFF" strokeWidth={1.5} />,
      title: 'Strukturerat lärande',
      subtitle: 'Kurser, moduler och lektioner – organiserat för att göra inlärning enklare.',
      gradientColors: ['#0EA5E9', '#0284C7', '#0369A1'] as const,
      illustrationElements: (
        <View style={styles.illustrationContainer}>
          <Animated.View style={[styles.pathLine, { opacity: illustrationAnim }]} />
          <Animated.View style={[styles.pathNode, styles.pathNode1, { 
            transform: [{ scale: Animated.add(0.8, Animated.multiply(illustrationAnim, 0.2)) }],
            opacity: illustrationAnim 
          }]}>
            <Text style={styles.nodeText}>Kurs</Text>
          </Animated.View>
          <Animated.View style={[styles.pathNode, styles.pathNode2, { 
            transform: [{ scale: Animated.add(0.8, Animated.multiply(illustrationAnim, 0.2)) }],
            opacity: illustrationAnim 
          }]}>
            <Text style={styles.nodeText}>Modul</Text>
          </Animated.View>
          <Animated.View style={[styles.pathNode, styles.pathNode3, { 
            transform: [{ scale: Animated.add(0.8, Animated.multiply(illustrationAnim, 0.2)) }],
            opacity: illustrationAnim 
          }]}>
            <Text style={styles.nodeText}>Lektion</Text>
          </Animated.View>
        </View>
      ),
    },
    {
      id: 1,
      icon: <Target size={48} color="#FFFFFF" strokeWidth={1.5} />,
      title: 'Förstå på djupet',
      subtitle: 'Fokuserade studiepass och tydliga förklaringar – lär dig på riktigt, inte bara utantill.',
      gradientColors: ['#10B981', '#059669', '#047857'] as const,
      illustrationElements: (
        <View style={styles.illustrationContainer}>
          <Animated.View style={[styles.focusCircle, styles.focusCircle1, { opacity: Animated.multiply(illustrationAnim, 0.3) }]} />
          <Animated.View style={[styles.focusCircle, styles.focusCircle2, { opacity: Animated.multiply(illustrationAnim, 0.5) }]} />
          <Animated.View style={[styles.focusCircle, styles.focusCircle3, { opacity: illustrationAnim }]}>
            <Target size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </Animated.View>
        </View>
      ),
    },
    {
      id: 2,
      icon: <TrendingUp size={48} color="#FFFFFF" strokeWidth={1.5} />,
      title: 'Se dina framsteg',
      subtitle: 'Varje studiepass räknas. Följ din utveckling och bygg upp motivation över tid.',
      gradientColors: ['#F59E0B', '#D97706', '#B45309'] as const,
      illustrationElements: (
        <View style={styles.illustrationContainer}>
          <View style={styles.progressBarsContainer}>
            <Animated.View style={[styles.progressBar, { width: Animated.multiply(illustrationAnim, 60) }]} />
            <Animated.View style={[styles.progressBar, { width: Animated.multiply(illustrationAnim, 100) }]} />
            <Animated.View style={[styles.progressBar, { width: Animated.multiply(illustrationAnim, 80) }]} />
            <Animated.View style={[styles.progressBar, { width: Animated.multiply(illustrationAnim, 120) }]} />
          </View>
          <Animated.View style={[styles.trendArrow, { 
            transform: [
              { translateY: Animated.multiply(illustrationAnim, -20) },
              { rotate: '-45deg' }
            ],
            opacity: illustrationAnim 
          }]}>
            <TrendingUp size={28} color="rgba(255,255,255,0.9)" strokeWidth={2} />
          </Animated.View>
        </View>
      ),
    },
    {
      id: 3,
      icon: <Sparkles size={48} color="#FFFFFF" strokeWidth={1.5} />,
      title: 'Anpassat för dig',
      subtitle: 'Välj ditt program och dina kurser – appen formar sig efter dina studier.',
      gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
      illustrationElements: (
        <View style={styles.illustrationContainer}>
          <Animated.View style={[styles.sparkleContainer, { opacity: illustrationAnim }]}>
            <View style={[styles.sparkle, styles.sparkle1]} />
            <View style={[styles.sparkle, styles.sparkle2]} />
            <View style={[styles.sparkle, styles.sparkle3]} />
            <View style={[styles.sparkle, styles.sparkle4]} />
          </Animated.View>
          <Animated.View style={[styles.personalizationCard, { 
            transform: [{ scale: Animated.add(0.9, Animated.multiply(illustrationAnim, 0.1)) }],
            opacity: illustrationAnim 
          }]}>
            <Text style={styles.personalizationText}>Din studieplan</Text>
          </Animated.View>
        </View>
      ),
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(illustrationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentScreen + 1) / screens.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentScreen]);

  const animateTransition = (nextScreen: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(illustrationAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentScreen(nextScreen);
      slideAnim.setValue(30);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(illustrationAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (currentScreen < screens.length - 1) {
      animateTransition(currentScreen + 1);
    } else {
      await completeFTUE();
    }
  };

  const handleSkip = async () => {
    await completeFTUE();
  };

  const completeFTUE = async () => {
    try {
      await AsyncStorage.setItem(FTUE_COMPLETED_KEY, 'true');
      console.log('FTUE completed, navigating to auth');
      router.replace('/auth');
    } catch (error) {
      console.error('Error saving FTUE completion:', error);
      router.replace('/auth');
    }
  };

  const handleDotPress = (index: number) => {
    if (index !== currentScreen) {
      animateTransition(index);
    }
  };

  const currentScreenData = screens[currentScreen];
  const isLastScreen = currentScreen === screens.length - 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentScreenData.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }) 
                  }
                ]} 
              />
            </View>
            
            {!isLastScreen && (
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Hoppa över</Text>
              </TouchableOpacity>
            )}
          </View>

          <Animated.View 
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <View style={styles.illustrationArea}>
              {currentScreenData.illustrationElements}
            </View>

            <View style={styles.iconContainer}>
              {currentScreenData.icon}
            </View>

            <Text style={styles.title}>{currentScreenData.title}</Text>
            <Text style={styles.subtitle}>{currentScreenData.subtitle}</Text>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.dotsContainer}>
              {screens.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotPress(index)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.dot,
                      index === currentScreen && styles.dotActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {isLastScreen ? 'Kom igång' : 'Fortsätt'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '500' as const,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  illustrationArea: {
    width: SCREEN_WIDTH - 80,
    height: 180,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  pathLine: {
    position: 'absolute' as const,
    width: 200,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  pathNode: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pathNode1: {
    left: 20,
    top: 30,
  },
  pathNode2: {
    left: 100,
    top: 80,
  },
  pathNode3: {
    left: 180,
    top: 130,
  },
  nodeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  focusCircle: {
    position: 'absolute' as const,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCircle1: {
    width: 160,
    height: 160,
  },
  focusCircle2: {
    width: 100,
    height: 100,
  },
  focusCircle3: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarsContainer: {
    gap: 12,
    alignItems: 'flex-start',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
  },
  trendArrow: {
    position: 'absolute' as const,
    right: 60,
    bottom: 40,
  },
  sparkleContainer: {
    width: 160,
    height: 160,
    position: 'relative' as const,
  },
  sparkle: {
    position: 'absolute' as const,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
  },
  sparkle1: {
    top: 20,
    left: 40,
  },
  sparkle2: {
    top: 60,
    right: 30,
  },
  sparkle3: {
    bottom: 40,
    left: 50,
  },
  sparkle4: {
    bottom: 20,
    right: 60,
  },
  personalizationCard: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  personalizationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '400' as const,
  },
  footer: {
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: 'white',
  },
  nextButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1E293B',
    letterSpacing: 0.3,
  },
});
