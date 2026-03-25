import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
}

const LOADING_TIPS = [
  "Förbereder din studieupplevelse...",
  "Laddar dina kurser...",
  "Synkroniserar dina framsteg...",
  "Hämtar dina prestationer...",
  "Redo att studera snart...",
  "Organiserar ditt innehåll...",
];

const FloatingParticle: React.FC<{ delay: number; size: number; startX: number }> = ({ 
  delay, 
  size, 
  startX 
}) => {
  const translateY = useRef(new Animated.Value(height + 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 50);
      opacity.setValue(0);
      translateX.setValue(startX + (Math.random() - 0.5) * 100);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 4000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [delay, startX, translateY, opacity, translateX]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
};

const StudyCharacter: React.FC<{ size: number }> = ({ size }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();
    rotateAnimation.start();
    scaleAnimation.start();

    return () => {
      bounceAnimation.stop();
      rotateAnimation.stop();
      scaleAnimation.stop();
    };
  }, [bounceAnim, rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: bounceAnim },
          { rotate },
          { scale: scaleAnim },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <SvgLinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4F46E5" />
            <Stop offset="100%" stopColor="#7C3AED" />
          </SvgLinearGradient>
          <SvgLinearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F5F5F5" />
            <Stop offset="100%" stopColor="#E8E8E8" />
          </SvgLinearGradient>
        </Defs>
        
        <Circle cx="60" cy="60" r="56" fill="url(#bgGrad)" />
        <Circle cx="60" cy="60" r="50" fill="#1E1B4B" opacity="0.1" />
        
        <G>
          <Circle cx="60" cy="52" r="28" fill="url(#bodyGrad)" />
          <Circle cx="60" cy="54" r="26" fill="white" opacity="0.4" />
          
          <Circle cx="50" cy="48" r="4" fill="#1A1A1A" />
          <Circle cx="70" cy="48" r="4" fill="#1A1A1A" />
          <Circle cx="51" cy="47" r="1.5" fill="white" />
          <Circle cx="71" cy="47" r="1.5" fill="white" />
          
          <Path
            d="M52 58 Q60 64, 68 58"
            stroke="#1A1A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          <Circle cx="42" cy="52" r="5" fill="#FFB6C1" opacity="0.5" />
          <Circle cx="78" cy="52" r="5" fill="#FFB6C1" opacity="0.5" />
        </G>
        
        <G>
          <Path
            d="M35 75 L35 95 L50 95 L50 80 Q42.5 78, 35 75"
            fill="#4F46E5"
          />
          <Path
            d="M85 75 L85 95 L70 95 L70 80 Q77.5 78, 85 75"
            fill="#4F46E5"
          />
        </G>
        
        <G>
          <Circle cx="32" cy="32" r="8" fill="#FFD700" />
          <Path
            d="M32 26 L33 30 L37 30 L34 33 L35 37 L32 35 L29 37 L30 33 L27 30 L31 30 Z"
            fill="#FFF"
          />
        </G>
        
        <G>
          <Path
            d="M78 20 L82 28 L90 28 L84 33 L86 41 L78 36 L70 41 L72 33 L66 28 L74 28 Z"
            fill="#10B981"
            opacity="0.8"
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

const ProgressRing: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ position: 'absolute', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message 
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 95 ? 95 : next;
      });
    }, 300);

    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [fadeAnim, slideAnim, textFadeAnim]);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 400,
    size: 6 + Math.random() * 8,
    startX: Math.random() * width,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A1F', '#1A1035', '#251749']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.starsContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.6,
                width: 2 + Math.random() * 2,
                height: 2 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.5,
              },
            ]}
          />
        ))}
      </View>

      {particles.map(particle => (
        <FloatingParticle
          key={particle.id}
          delay={particle.delay}
          size={particle.size}
          startX={particle.startX}
        />
      ))}

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Animated.View
          style={[
            styles.characterContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.glowEffect} />
          <ProgressRing progress={progress} size={180} />
          <StudyCharacter size={160} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>StudieStugan</Text>
          <Text style={styles.subtitle}>Din personliga studiekamrat</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.loadingSection,
            { opacity: textFadeAnim },
          ]}
        >
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              {message || LOADING_TIPS[currentTip]}
            </Text>
          </View>

          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <PulsingDot key={i} delay={i * 200} />
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={[styles.bottomDecoration, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.decorativeLine} />
        <Text style={styles.versionText}>Version 2.0</Text>
      </View>
    </View>
  );
};

const PulsingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1F',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#7C3AED',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#7C3AED',
    opacity: 0.15,
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
      default: {},
    }),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  tipContainer: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  bottomDecoration: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  decorativeLine: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    borderRadius: 2,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '500',
  },
});

export default LoadingScreen;
