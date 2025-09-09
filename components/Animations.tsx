import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle, TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';

interface AnimatedPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number;
  style?: ViewStyle;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  scaleValue = 0.96,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    onPressOut?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  duration = 500,
  delay = 0,
  distance = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseViewProps {
  children: React.ReactNode;
  pulseScale?: number;
  duration?: number;
  style?: ViewStyle;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  pulseScale = 1.05,
  duration = 1000,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: pulseScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulseAnim, pulseScale, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ShakeViewProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  style?: ViewStyle;
  trigger?: boolean;
}

export const ShakeView: React.FC<ShakeViewProps> = ({
  children,
  intensity = 10,
  duration = 500,
  style,
  trigger = false,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      const animation = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);

      animation.start();
    }
  }, [trigger, shakeAnim, intensity]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface BounceViewProps {
  children: React.ReactNode;
  bounceScale?: number;
  duration?: number;
  style?: ViewStyle;
  trigger?: boolean;
}

export const BounceView: React.FC<BounceViewProps> = ({
  children,
  bounceScale = 1.1,
  duration = 200,
  style,
  trigger = false,
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      const animation = Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: bounceScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]);

      animation.start();
    }
  }, [trigger, bounceAnim, bounceScale, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: bounceAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PressableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pressedScale?: number;
  shadowIntensity?: number;
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  style,
  pressedScale = 0.98,
  shadowIntensity = 0.15,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressedScale,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: shadowIntensity,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      })
    ]).start();
    onPressOut?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          {
            shadowOpacity: shadowAnim,
            shadowRadius: Animated.multiply(shadowAnim, 4),
            shadowOffset: {
              width: 0,
              height: Animated.multiply(shadowAnim, 2),
            },
            elevation: Animated.multiply(shadowAnim, 3),
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface RippleButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  rippleColor?: string;
  rippleOpacity?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  style,
  rippleColor = '#FFFFFF',
  rippleOpacity = 0.3,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: rippleOpacity,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      })
    ]).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      })
    ]).start(() => {
      rippleAnim.setValue(0);
    });
    onPressOut?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[{ overflow: 'hidden' }, style]}
    >
      <Animated.View
        style={[
          animationStyles.rippleContainer,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {children}
        <Animated.View
          style={[
            animationStyles.rippleOverlay,
            {
              backgroundColor: rippleColor,
              opacity: opacityAnim,
              transform: [
                {
                  scale: Animated.multiply(
                    rippleAnim,
                    2
                  ),
                },
              ],
            }
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const animationStyles = StyleSheet.create({
  rippleContainer: {
    flex: 1,
  },
  rippleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});