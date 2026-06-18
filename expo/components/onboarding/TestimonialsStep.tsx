import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Star, Shield, RefreshCw, Crown } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, TESTIMONIALS, ACCENT } from './shared';

export default function TestimonialsStep({
  testimonialDisplay,
  setTestimonialDisplay,
}: StepProps): React.ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigTitle}>Vad andra studenter säger</Text>

      <View style={styles.testimonialCard}>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} color="#F59E0B" fill="#F59E0B" />
          ))}
        </View>
        <Text style={styles.testimonialText}>
          "{TESTIMONIALS[testimonialDisplay].text}"
        </Text>
        <Text style={styles.testimonialAuthor}>
          — {TESTIMONIALS[testimonialDisplay].name}, {TESTIMONIALS[testimonialDisplay].age},{' '}
          {TESTIMONIALS[testimonialDisplay].city}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {TESTIMONIALS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setTestimonialDisplay(i)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={[
                styles.testimonialDot,
                i === testimonialDisplay && styles.testimonialDotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Shield size={16} color={ACCENT} />
          <Text style={styles.trustText}>Säkra betalningar</Text>
        </View>
        <View style={styles.trustItem}>
          <RefreshCw size={16} color={ACCENT} />
          <Text style={styles.trustText}>Avsluta när du vill</Text>
        </View>
        <View style={styles.trustItem}>
          <Crown size={16} color={ACCENT} />
          <Text style={styles.trustText}>7 dagars gratis</Text>
        </View>
      </View>
    </ScrollView>
  );
}
