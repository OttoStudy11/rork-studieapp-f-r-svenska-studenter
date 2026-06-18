import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, EDUCATION_PATHS } from './shared';

export default function LevelStep({ data, setData }: StepProps): React.ReactElement {
  const entryAnims = useRef(EDUCATION_PATHS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    EDUCATION_PATHS.forEach((_, i) => {
      Animated.timing(entryAnims[i], {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Var pluggar du?</Text>
      <Text style={styles.pageSubtitle}>Välj din utbildningsnivå så anpassar vi appen för dig.</Text>
      <View style={{ gap: 14, marginTop: 12 }}>
        {EDUCATION_PATHS.map((opt, i) => {
          const sel = data.studyLevel === opt.id;
          return (
            <Animated.View
              key={opt.id}
              style={{
                opacity: entryAnims[i],
                transform: [
                  {
                    translateY: entryAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.eduCard,
                  sel && { borderColor: opt.color, borderWidth: 2.5, backgroundColor: opt.bgColor },
                  !sel && { borderColor: '#E5E5EA', borderWidth: 1.5 },
                ]}
                onPress={() =>
                  setData({
                    ...data,
                    studyLevel: opt.id as 'gymnasie' | 'högskola' | 'komvux',
                    selectedCourses: new Set(),
                  })
                }
                activeOpacity={0.8}
              >
                <View style={[styles.eduCardIconWrap, sel && { backgroundColor: opt.color }]}>
                  <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eduCardTitle, sel && { color: opt.color }]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.eduCardSub}>{opt.description}</Text>
                </View>
                <View
                  style={[
                    styles.optionCheck,
                    sel
                      ? { backgroundColor: opt.color }
                      : {
                          backgroundColor: 'transparent',
                          borderWidth: 1.5,
                          borderColor: '#E5E5EA',
                        },
                  ]}
                >
                  {sel && <Check size={13} color="#fff" />}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.levelHintCard}>
        <Text style={styles.levelHintText}>
          💡 Du kan alltid byta utbildningstyp i inställningarna senare
        </Text>
      </View>
    </ScrollView>
  );
}
