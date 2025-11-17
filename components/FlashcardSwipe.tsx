import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Flashcard } from '@/contexts/FlashcardContext';
import { BlurView } from 'expo-blur';
import { hapticsManager } from '@/lib/haptics-manager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface FlashcardSwipeProps {
  flashcard: Flashcard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onExplain?: () => void;
  isExplaining?: boolean;
  explanation?: string;
}

export function FlashcardSwipe({
  flashcard,
  onSwipeLeft,
  onSwipeRight,
  onExplain,
  isExplaining,
  explanation,
}: FlashcardSwipeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        rotate.setValue(gesture.dx / 10);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipeRight = () => {
    hapticsManager.triggerHaptic('success');
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onSwipeRight();
      resetCard();
    });
  };

  const forceSwipeLeft = () => {
    hapticsManager.triggerHaptic('warning');
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onSwipeLeft();
      resetCard();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    Animated.spring(rotate, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const flipCard = () => {
    hapticsManager.selectionChanged();
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: false,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const cardRotation = rotate.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return '#4ADE80';
      case 2:
        return '#FBBF24';
      case 3:
        return '#F87171';
      default:
        return '#94A3B8';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Lätt';
      case 2:
        return 'Medel';
      case 3:
        return 'Svår';
      default:
        return 'Okänd';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate: cardRotation },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={flipCard}
          style={styles.cardContent}
        >
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              {
                transform: [{ rotateY: frontInterpolate }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(flashcard.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>
                  {getDifficultyLabel(flashcard.difficulty)}
                </Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.questionLabel}>Fråga</Text>
              <Text style={styles.questionText}>{flashcard.question}</Text>
            </View>

            <Text style={styles.tapToFlip}>Tryck för att vända</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                transform: [{ rotateY: backInterpolate }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(flashcard.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>
                  {getDifficultyLabel(flashcard.difficulty)}
                </Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.answerLabel}>Svar</Text>
              <Text style={styles.answerText}>{flashcard.answer}</Text>

              {flashcard.explanation && (
                <View style={styles.explanationContainer}>
                  <Text style={styles.explanationLabel}>Förklaring</Text>
                  <Text style={styles.explanationText}>{flashcard.explanation}</Text>
                </View>
              )}

              {explanation && (
                <View style={styles.aiExplanationContainer}>
                  <Text style={styles.aiExplanationLabel}>AI Förklaring</Text>
                  <Text style={styles.aiExplanationText}>{explanation}</Text>
                </View>
              )}

              {onExplain && (
                <TouchableOpacity
                  style={styles.explainButton}
                  onPress={onExplain}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.explainButtonText}>Be AI förklara</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>

        <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
          <BlurView intensity={80} style={styles.labelBlur}>
            <Text style={styles.likeLabelText}>JAG KUNDE DET!</Text>
          </BlurView>
        </Animated.View>

        <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
          <BlurView intensity={80} style={styles.labelBlur}>
            <Text style={styles.nopeLabelText}>VISA IGEN</Text>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65,
    position: 'absolute',
  },
  cardContent: {
    flex: 1,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardFront: {
    position: 'absolute',
  },
  cardBack: {
    position: 'absolute',
    transform: [{ rotateY: '180deg' }],
  },
  cardHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    lineHeight: 34,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1F5F9',
    lineHeight: 30,
    marginBottom: 20,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  aiExplanationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#312E81',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  aiExplanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C7D2FE',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiExplanationText: {
    fontSize: 15,
    color: '#E0E7FF',
    lineHeight: 22,
  },
  explainButton: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  explainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tapToFlip: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1000,
  },
  labelBlur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  likeLabelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4ADE80',
    letterSpacing: 2,
  },
  nopeLabelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: 2,
  },
});
