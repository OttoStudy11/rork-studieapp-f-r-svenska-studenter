import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';

interface LoadingScreenProps {
  message?: string;
}

const StudieStuganLogo: React.FC<{ size?: number; animated?: boolean }> = ({ 
  size = 120, 
  animated = true 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const flameAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Logo entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Flame flickering animation
      const flameAnimation = () => {
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => flameAnimation());
      };

      setTimeout(flameAnimation, 500);
    }
  }, [animated, fadeAnim, scaleAnim, flameAnim]);

  const animatedStyle = animated ? {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  } : {};

  const flameStyle = animated ? {
    opacity: flameAnim,
  } : {};

  return (
    <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
      <View style={{ position: 'relative' }}>
        <Svg width={size} height={size * 0.8} viewBox="0 0 120 96">
          {/* House structure */}
          <G>
            {/* House base */}
            <Path
              d="M20 50 L100 50 L100 85 L20 85 Z"
              fill="#1B5E20"
              stroke="#0D4F17"
              strokeWidth="2"
            />
            
            {/* Roof */}
            <Path
              d="M15 50 L60 20 L105 50 Z"
              fill="#2E7D32"
              stroke="#1B5E20"
              strokeWidth="2"
            />
            
            {/* Door */}
            <Path
              d="M45 85 L45 65 L55 65 L55 85 Z"
              fill="#4A4A4A"
              stroke="#333"
              strokeWidth="1"
            />
            
            {/* Window (book icon) */}
            <Path
              d="M70 60 L85 60 L85 75 L70 75 Z"
              fill="#E8F5E8"
              stroke="#1B5E20"
              strokeWidth="1.5"
            />
            
            {/* Book pages inside window */}
            <Path
              d="M72 62 L83 62 L83 73 L77.5 73 L77.5 62 Z"
              fill="#FFF"
              stroke="#1B5E20"
              strokeWidth="0.5"
            />
            <Path
              d="M77.5 62 L83 62 L83 73 L77.5 73 Z"
              fill="#F0F0F0"
              stroke="#1B5E20"
              strokeWidth="0.5"
            />
          </G>
        </Svg>
        
        {/* Animated flame */}
        <Animated.View 
          style={[
            {
              position: 'absolute',
              top: -size * 0.15,
              left: size * 0.45,
              width: size * 0.1,
              height: size * 0.2,
            },
            flameStyle
          ]}
        >
          <Svg width={size * 0.1} height={size * 0.2} viewBox="0 0 12 24">
            <Path
              d="M6 2 C8 4, 10 8, 8 12 C9 10, 8 14, 6 16 C4 14, 3 10, 4 12 C2 8, 4 4, 6 2 Z"
              fill="#FF6B35"
            />
            <Path
              d="M6 4 C7 5, 8 7, 7 10 C7.5 9, 7 11, 6 12 C5 11, 4.5 9, 5 10 C4 7, 5 5, 6 4 Z"
              fill="#FFB74D"
            />
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Laddar Studie Stugan..." 
}) => {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation for loading dots
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };

    // Text fade in
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 600,
      useNativeDriver: true,
    }).start();

    pulseAnimation();
  }, [pulseAnim, textFadeAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      <View style={styles.content}>
        {/* Logo */}
        <StudieStuganLogo size={140} animated={true} />
        
        {/* App name */}
        <Animated.View style={[styles.titleContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.title}>Studie Stugan</Text>
          <Text style={styles.subtitle}>Din plats för fokus och framgång.</Text>
        </Animated.View>
        
        {/* Loading message */}
        <Animated.View style={[styles.loadingContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.loadingText}>{message}</Text>
          <Animated.View style={[styles.dotsContainer, { opacity: pulseAnim }]}>
            <View style={styles.dot} />
            <View style={[styles.dot, { marginLeft: 8 }]} />
            <View style={[styles.dot, { marginLeft: 8 }]} />
          </Animated.View>
        </Animated.View>
      </View>
      
      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorationLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 16,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  decorationLine: {
    width: 60,
    height: 3,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
    opacity: 0.3,
  },
});

export default LoadingScreen;