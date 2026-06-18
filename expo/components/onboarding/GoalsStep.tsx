import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, GOALS } from './shared';

export default function GoalsStep({ data, setData }: StepProps): React.ReactElement {
  const toggle = (id: string) => {
    const ng = data.goals.includes(id)
      ? data.goals.filter((x) => x !== id)
      : [...data.goals, id];
    setData({ ...data, goals: ng });
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vad vill du uppnå med StudieStugan?</Text>
      <Text style={styles.pageSubtitle}>Välj allt som stämmer</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {GOALS.map((g) => {
          const sel = data.goals.includes(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.optionCard, sel && styles.optionCardSel]}
              onPress={() => toggle(g.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.optionEmoji}>{g.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{g.label}</Text>
              {sel && (
                <View style={styles.optionCheck}>
                  <Check size={13} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
