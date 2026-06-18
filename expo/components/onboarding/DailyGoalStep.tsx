import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, DAILY_MINS } from './shared';

export default function DailyGoalStep({ data, setData }: StepProps): React.ReactElement {
  const problem = data.problems[0];
  const motivText =
    problem === 'motivation'
      ? 'Det känns som att du ibland saknar motivation. Låt oss ändra på det!'
      : problem === 'time'
        ? 'Med en daglig plan blir tidshanteringen mycket enklare.'
        : 'Konsistens är nyckeln – välj en tid du kan hålla varje dag.';

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Hur många minuter vill du plugga per dag?</Text>
      <Text style={styles.pageSubtitle}>{motivText}</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {DAILY_MINS.map((opt) => {
          const sel = data.dailyGoalMinutes === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionCard, sel && styles.optionCardSel]}
              onPress={() => setData({ ...data, dailyGoalMinutes: opt.value })}
              activeOpacity={0.75}
            >
              <Text style={styles.optionEmoji}>⏱️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>
                  {opt.label}
                </Text>
                {opt.note ? <Text style={styles.recommendedTag}>{opt.note}</Text> : null}
              </View>
              {sel && (
                <View style={styles.optionCheck}>
                  <Check size={13} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hintTxt}>Vi rekommenderar att börja med 30 minuter</Text>
    </ScrollView>
  );
}
