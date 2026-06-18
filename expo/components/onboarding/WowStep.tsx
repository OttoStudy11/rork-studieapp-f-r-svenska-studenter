import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps } from './shared';

export default function WowStep({ data }: StepProps): React.ReactElement {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Animated.Text
        style={[
          styles.wowEmoji,
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.bigTitle}>Från och med nu blir allt kristallklart</Text>
        <Text style={styles.bigBody}>
          Vi har skapat din personliga studieplan baserat på:
        </Text>
        <View style={styles.checkList}>
          {[
            `Din stressnivå (${data.stressLevel}/10)`,
            `Dina ${data.goals.length || 1} studiemål`,
            `${data.dailyGoalMinutes} minuter per dag`,
            `Dina utmaningar`,
          ].map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <View style={styles.checkBubble}>
                <Check size={14} color="#fff" />
              </View>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}
