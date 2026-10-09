import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calculator, MessageCircle } from 'lucide-react-native';
import { ROUTES } from '@/utils/typedRoutes';
import { useTheme } from '@/contexts/ThemeContext';

const TOOLS = [
  {
    key: 'math',
    title: 'Matte AI',
    subtitle: 'Få hjälp med matte',
    icon: Calculator,
    gradient: ['#6366F1', '#8B5CF6'] as const,
    lightBg: '#EEF2FF',
    darkBg: '#1E1B4B',
    route: ROUTES.mathChat,
  },
  {
    key: 'chat',
    title: 'AI',
    subtitle: 'Ställ frågor',
    icon: MessageCircle,
    gradient: ['#10B981', '#059669'] as const,
    lightBg: '#ECFDF5',
    darkBg: '#1A2E1A',
    route: ROUTES.generalChat,
  },
];

/** Snabbverktyg på kurssidan — snabb åtkomst till appens AI-verktyg. */
export default function CourseAISection() {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Snabbverktyg</Text>
      <View style={styles.grid}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              key={tool.key}
              style={[styles.card, { backgroundColor: isDark ? tool.darkBg : tool.lightBg }]}
              onPress={() => router.push(tool.route)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tool.title}
            >
              <LinearGradient colors={tool.gradient as unknown as [string, string]} style={styles.icon}>
                <Icon size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.textBlock}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                  {tool.title}
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {tool.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
});
