import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StepProps } from './shared';

export default function IntroStep(_props: StepProps): React.ReactElement {
  const styles = React.useMemo(() => require('../onboardingStyles'), []);
  return (
    <ScrollView contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 24 }}>🎓</Text>
      <Text style={styles.pageTitle}>För att hjälpa dig bäst behöver vi förstå din situation</Text>
      <Text style={styles.pageBody}>Några snabba frågor – tar bara 60 sekunder.</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardText}>✓ Dina svar används för att personalisera din studieplan</Text>
        <Text style={styles.infoCardText}>✓ Du kan hoppa över frågor du inte vill svara på</Text>
        <Text style={styles.infoCardText}>✓ Du kan ändra allt i inställningarna senare</Text>
      </View>
    </ScrollView>
  );
}
