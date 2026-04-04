import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const messages = [
  'Letar efter uppdateringar...',
  'Laddar ner ny version...',
  'Förbereder uppdatering...',
];

interface UpdateScreenProps {
  statusMessage: string;
}

export function UpdateScreen({ statusMessage }: UpdateScreenProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [spinAnim, fadeAnim]);

  useEffect(() => {
    if (statusMessage) return;

    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [statusMessage]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayMessage = statusMessage || messages[messageIndex];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerArc} />
        </Animated.View>
        <Text style={styles.title}>Uppdatering tillgänglig</Text>
        <Text style={styles.message}>{displayMessage}</Text>
        <Text style={styles.subtitle}>Vänta medan vi fixar det åt dig</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F1117',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  spinner: {
    width: 56,
    height: 56,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#4F8EF7',
    borderRightColor: '#4F8EF7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    color: '#A0A8C0',
    textAlign: 'center' as const,
    marginBottom: 8,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6178',
    textAlign: 'center' as const,
    marginTop: 4,
  },
});
