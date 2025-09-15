import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Timer, BookOpen, Trophy, Users, ChevronRight, ArrowRight } from 'lucide-react-native';
import { useWelcomeStorage } from '../hooks/useWelcomeStorage';
import React from "react";



interface WelcomeSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string[];
}

const welcomeSlides: WelcomeSlide[] = [
  {
    id: 1,
    title: 'Plugga smartare 📚',
    subtitle: 'Timer och fokusläge',
    description: 'Använd Pomodoro-tekniken och fokusläge för att maximera din studietid och hålla koncentrationen uppe.',
    icon: Timer,
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D']
  },
  {
    id: 2,
    title: 'Personliga kurser 🎯',
    subtitle: 'Välj program och kurser',
    description: 'Anpassa din studieupplevelse efter ditt gymnasieprogram och välj de kurser som passar dig bäst.',
    icon: BookOpen,
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E53']
  },
  {
    id: 3,
    title: 'Motivera dig 🔥',
    subtitle: 'Achievements och leaderboard',
    description: 'Lås upp achievements, tävla med vänner och klättra på topplistan för att hålla motivationen uppe.',
    icon: Trophy,
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FF9500']
  },
  {
    id: 4,
    title: 'Studera tillsammans 👥',
    subtitle: 'Vänner och community',
    description: 'Lägg till vänner, dela framsteg och stötta varandra på vägen mot era studiemål.',
    icon: Users,
    color: '#6C5CE7',
    gradient: ['#6C5CE7', '#A29BFE']
  }
];

export default function Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { markWelcomeAsSeen } = useWelcomeStorage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in the first slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  const handleGetStarted = () => {
    markWelcomeAsSeen();
    router.replace('/auth');
  };

  const renderSlide = (slide: WelcomeSlide, index: number) => {
    const IconComponent = slide.icon;
    const isActive = currentSlide === index;
    
    return (
      <View key={slide.id} style={[styles.slide, { width }]}>
        <Animated.View 
          style={[
            styles.slideContent,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
            <IconComponent size={48} color="#fff" />
          </View>
          
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={[styles.slideSubtitle, { color: slide.color }]}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
          
          {/* Decorative elements */}
          <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: slide.color + '20' }]} />
          <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: slide.color + '15' }]} />
          <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: slide.color + '10' }]} />
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Text style={styles.logo}>StudieStugan</Text>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.skipText}>Hoppa över</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {welcomeSlides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Page indicators */}
        <View style={styles.pagination}>
          {welcomeSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive,
                { backgroundColor: currentSlide === index ? welcomeSlides[currentSlide].color : '#E0E0E0' }
              ]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentSlide < welcomeSlides.length - 1 ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => goToSlide(currentSlide + 1)}
              >
                <Text style={styles.nextButtonText}>Nästa</Text>
                <ArrowRight size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: welcomeSlides[currentSlide].color }]}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Kom igång</Text>
              <ChevronRight size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#4ECDC4',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -20,
    right: -30,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: 20,
    left: -20,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 100,
    left: -40,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    width: 32,
    height: 12,
    borderRadius: 6,
  },
  navigationContainer: {
    minHeight: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600' as const,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700' as const,
  },
});