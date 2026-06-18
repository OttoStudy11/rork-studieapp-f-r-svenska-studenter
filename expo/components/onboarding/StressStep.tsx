import React, { useRef } from 'react';
import { View, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, getStressEmoji, getStressLabel } from './shared';

const { width: SW } = Dimensions.get('window');

export default function StressStep({ data, setData }: StepProps): React.ReactElement {
  const sliderWidth = SW - 48;
  const thumbSize = 28;
  const trackWidth = sliderWidth - thumbSize;
  const thumbX = useRef(
    new Animated.Value((data.stressLevel / 10) * trackWidth)
  ).current;
  const currentVal = useRef(data.stressLevel);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gs) => {
        const currentThumbX = (currentVal.current / 10) * trackWidth;
        const newX = Math.max(0, Math.min(trackWidth, currentThumbX + gs.dx));
        thumbX.setValue(newX);
        const newVal = Math.round((newX / trackWidth) * 10);
        if (newVal !== currentVal.current) {
          currentVal.current = newVal;
          setData({ ...data, stressLevel: newVal });
        }
      },
      onPanResponderRelease: (_, gs) => {
        const currentThumbX = (currentVal.current / 10) * trackWidth;
        const newX = Math.max(0, Math.min(trackWidth, currentThumbX + gs.dx));
        const snappedVal = Math.round((newX / trackWidth) * 10);
        const snappedX = (snappedVal / 10) * trackWidth;
        Animated.spring(thumbX, {
          toValue: snappedX,
          tension: 80,
          friction: 8,
          useNativeDriver: false,
        }).start();
        currentVal.current = snappedVal;
        setData({ ...data, stressLevel: snappedVal });
      },
    })
  ).current;

  const fillWidth = thumbX.interpolate({
    inputRange: [0, trackWidth],
    outputRange: [thumbSize / 2, trackWidth + thumbSize / 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.page}>
      <Text style={styles.questionTitle}>
        Hur stressad brukar du vara inför prov?
      </Text>

      <View style={styles.stressCenter}>
        <Text style={styles.stressEmoji}>{getStressEmoji(data.stressLevel)}</Text>
        <Text style={styles.stressLabel}>{getStressLabel(data.stressLevel)}</Text>

        <View
          style={[styles.sliderTrack, { width: sliderWidth }]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.sliderFill, { width: fillWidth }]} />
          <Animated.View
            style={[
              styles.sliderThumb,
              { transform: [{ translateX: thumbX }] },
            ]}
          />
        </View>

        <View style={[styles.sliderLabels, { width: sliderWidth }]}>
          <Text style={styles.sliderLabelText}>😌 Lugn</Text>
          <Text style={styles.sliderLabelText}>😰 Extremt stressad</Text>
        </View>
      </View>
    </View>
  );
}
