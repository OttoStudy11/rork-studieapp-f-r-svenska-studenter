import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps } from './shared';

export default function SocialProofStep(_props: StepProps): React.ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigTitle}>Betrodd av tusentals svenska studenter</Text>

      <View style={styles.statsRow}>
        {[
          { value: '4.8 ⭐', label: 'Betyg' },
          { value: 'Tusentals', label: 'Studenter' },
          { value: '92%', label: 'Nöjda' },
        ].map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bigBody}>
        StudieStugan har hjälpt tusentals svenska studenter nå sina mål – från gymnasiet till universitetet.
      </Text>

      <View style={styles.featureList}>
        {[
          '🤖 Personlig AI-studiecoach',
          '🎴 Smart flashcard-system',
          '📊 Djupgående statistik',
          '⚔️ Plugga mot kompisar',
          '🎯 Högskoleprovet-träning',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
