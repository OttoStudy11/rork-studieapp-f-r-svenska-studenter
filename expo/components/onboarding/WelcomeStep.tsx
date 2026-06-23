import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import { StepProps, ACCENT } from './shared';
import { onboardingStyles as styles } from './styles';

export default function WelcomeStep(_props: StepProps): React.ReactElement {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim, alignItems: 'center' }}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm' }}
            style={styles.logoImg}
            contentFit="contain"
          />
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.welcomeTitle}>
          Du behöver inte plugga hårdare.{'\n'}Du behöver plugga <Text style={{ color: ACCENT }}>smartare.</Text>
        </Text>
        <Text style={styles.welcomeBody}>
          Allt du behöver är <Text style={styles.bold}>rätt verktyg</Text> och{' '}
          <Text style={styles.bold}>en personlig plan</Text> som funkar för dig.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
