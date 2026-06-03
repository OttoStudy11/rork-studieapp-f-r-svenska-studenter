import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Calculator, Sparkles, ChevronRight, MessageCircle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface CourseAIChatProps {
  courseTitle: string;
  accentColor: string;
  compact?: boolean;
}

export default function CourseAIChat({ courseTitle, accentColor, compact = false }: CourseAIChatProps) {
  const { isPremium } = usePremium();
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const scaleMath = useRef(new Animated.Value(1)).current;
  const scaleGeneral = useRef(new Animated.Value(1)).current;

  const toggleExpand = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(expandAnim, {
      toValue: expanded ? 0 : 1,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const handlePressAI = (type: 'math' | 'general') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPremium) {
      router.push('/premium' as any);
      return;
    }
    const screen = type === 'math' ? '/math-chat' : '/general-chat';
    router.push(`${screen}?course=${encodeURIComponent(courseTitle)}` as any);
  };

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const rotateChevron = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)' }]}>
        <TouchableOpacity
          style={styles.compactRow}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View style={styles.compactLeft}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.compactIconBg}
            >
              <Sparkles size={16} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.compactTitle, { color: theme.colors.text }]}>AI-studiehjälp</Text>
              <Text style={[styles.compactSub, { color: theme.colors.textSecondary }]}>Mattehjälp & studiefrågor för {courseTitle}</Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View style={[styles.compactExpand, { maxHeight, opacity: expandAnim }]}>
          <View style={styles.aiButtonRow}>
            <TouchableOpacity
              style={[styles.aiBtn, { borderColor: isDark ? 'rgba(14,165,233,0.25)' : 'rgba(14,165,233,0.15)' }]}
              onPress={() => handlePressAI('math')}
              onPressIn={() => handlePressIn(scaleMath)}
              onPressOut={() => handlePressOut(scaleMath)}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ scale: scaleMath }] }}>
                <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.aiBtnIcon}>
                  <Calculator size={20} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <View style={styles.aiBtnTextWrap}>
                <Text style={[styles.aiBtnTitle, { color: theme.colors.text }]}>Matematik AI</Text>
                <Text style={[styles.aiBtnDesc, { color: theme.colors.textSecondary }]}>Steg-för-steg-lösningar</Text>
              </View>
              {!isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aiBtn, { borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.15)' }]}
              onPress={() => handlePressAI('general')}
              onPressIn={() => handlePressIn(scaleGeneral)}
              onPressOut={() => handlePressOut(scaleGeneral)}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ scale: scaleGeneral }] }}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.aiBtnIcon}>
                  <Sparkles size={20} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <View style={styles.aiBtnTextWrap}>
                <Text style={[styles.aiBtnTitle, { color: theme.colors.text }]}>Generell AI</Text>
                <Text style={[styles.aiBtnDesc, { color: theme.colors.textSecondary }]}>Studietips & förklaringar</Text>
              </View>
              {!isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.fullCard, { borderColor: accentColor + '30' }]}
      onPress={toggleExpand}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={isDark
          ? ['rgba(99,102,241,0.15)', 'rgba(139,92,246,0.08)']
          : ['rgba(99,102,241,0.08)', 'rgba(139,92,246,0.04)']
        }
        style={styles.fullCardGradient}
      >
        <View style={styles.fullCardHeader}>
          <View style={styles.fullCardLeft}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fullCardIcon}>
              <MessageCircle size={20} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.fullCardTitle, { color: theme.colors.text }]}>AI-studiehjälp</Text>
              <Text style={[styles.fullCardSub, { color: theme.colors.textSecondary }]}>
                Få hjälp med {courseTitle}
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.fullCardExpand, { maxHeight, opacity: expandAnim }]}>
          <View style={styles.aiButtonRow}>
            <TouchableOpacity
              style={[styles.aiBtn, { borderColor: isDark ? 'rgba(14,165,233,0.25)' : 'rgba(14,165,233,0.15)' }]}
              onPress={() => handlePressAI('math')}
              onPressIn={() => handlePressIn(scaleMath)}
              onPressOut={() => handlePressOut(scaleMath)}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ scale: scaleMath }] }}>
                <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.aiBtnIcon}>
                  <Calculator size={22} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.aiBtnTitle, { color: theme.colors.text }]}>Matematik AI</Text>
              {!isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aiBtn, { borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.15)' }]}
              onPress={() => handlePressAI('general')}
              onPressIn={() => handlePressIn(scaleGeneral)}
              onPressOut={() => handlePressOut(scaleGeneral)}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ scale: scaleGeneral }] }}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.aiBtnIcon}>
                  <Sparkles size={22} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.aiBtnTitle, { color: theme.colors.text }]}>Generell AI</Text>
              {!isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  compactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  compactSub: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  compactExpand: {
    overflow: 'hidden',
    paddingHorizontal: 14,
  },

  // Full card
  fullCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fullCardGradient: {
    padding: 20,
  },
  fullCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  fullCardSub: {
    fontSize: 13,
  },
  fullCardExpand: {
    overflow: 'hidden',
    marginTop: 14,
  },

  // Shared
  aiButtonRow: {
    gap: 10,
    paddingBottom: 8,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  aiBtnIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBtnTextWrap: {
    flex: 1,
  },
  aiBtnTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  aiBtnDesc: {
    fontSize: 12,
  },
  lockBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000',
  },
});
