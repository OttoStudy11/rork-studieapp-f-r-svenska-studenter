import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps } from './shared';

export default function NotAloneStep({ data }: StepProps): React.ReactElement {
  const pct = Math.max(10, Math.min(90, data.stressLevel * 10));
  const totalDots = 100;
  const stressedDots = Math.round((pct / 100) * totalDots);

  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <View style={styles.dotGrid}>
        {Array.from({ length: totalDots }).map((_, i) => (
          <Text key={i} style={[styles.dot, i < stressedDots ? styles.dotStressed : styles.dotGrey]}>
            {i < stressedDots ? '●' : '○'}
          </Text>
        ))}
      </View>
      <Text style={styles.bigTitle}>Du är inte ensam 💙</Text>
      <Text style={styles.bigBody}>
        <Text style={styles.bold}>{pct}%</Text> av svenska studenter känner samma stress inför prov.
      </Text>
      <Text style={[styles.bigBody, { marginTop: 12 }]}>
        68% kämpar med <Text style={styles.bold}>motivationen</Text>.{'\n'}
        81% vill ha bättre <Text style={styles.bold}>studierutiner</Text>.{'\n\n'}
        Vi är här för att hjälpa 🙏
      </Text>
    </ScrollView>
  );
}
