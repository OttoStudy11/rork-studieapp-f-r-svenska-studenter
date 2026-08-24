import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Star, Shield, RefreshCw, Crown } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, TESTIMONIALS, ACCENT } from './shared';

/** Horizontal padding of the step page — must match styles.bigPage */
const PAGE_PADDING = 28;

export default function TestimonialsStep({
  testimonialDisplay,
  setTestimonialDisplay,
}: StepProps): React.ReactElement {
  const { width: screenWidth } = useWindowDimensions();
  const pageWidth = Math.max(screenWidth - PAGE_PADDING * 2, 0);
  const scrollRef = useRef<ScrollView>(null);

  const handleIndexChange = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TESTIMONIALS.length - 1, index));
      if (clamped !== testimonialDisplay) setTestimonialDisplay(clamped);
    },
    [testimonialDisplay, setTestimonialDisplay],
  );

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth > 0) {
        handleIndexChange(Math.round(e.nativeEvent.contentOffset.x / pageWidth));
      }
    },
    [handleIndexChange, pageWidth],
  );

  const goTo = useCallback(
    (index: number) => {
      setTestimonialDisplay(index);
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    },
    [setTestimonialDisplay, pageWidth],
  );

  return (
    <ScrollView contentContainerStyle={styles.bigPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigTitle}>Vad andra studenter säger</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {TESTIMONIALS.map((t, i) => (
          <View key={i} style={{ width: pageWidth }}>
            <View style={styles.testimonialCard}>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={18} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
              <Text style={styles.testimonialAuthor}>
                — {t.name}, {t.age}, {t.city}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {TESTIMONIALS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => goTo(i)}
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
