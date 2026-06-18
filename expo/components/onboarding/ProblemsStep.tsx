import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, PROBLEMS } from './shared';

export default function ProblemsStep({ data, setData }: StepProps): React.ReactElement {
  const toggle = (id: string) => {
    const np = data.problems.includes(id)
      ? data.problems.filter((x) => x !== id)
      : [...data.problems, id];
    setData({ ...data, problems: np });
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vad är ditt största problem med studierna?</Text>
      <Text style={styles.pageSubtitle}>Du kan välja flera</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {PROBLEMS.map((p) => {
          const sel = data.problems.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.optionCard, sel && styles.optionCardSel]}
              onPress={() => toggle(p.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.optionEmoji}>{p.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>{p.label}</Text>
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
