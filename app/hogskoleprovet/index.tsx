import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { BookOpen, Award, TrendingUp, Clock, ChevronRight, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HogskoleprovetScreen() {
  const { theme, isDark } = useTheme();
  const { sections, isLoadingSections, getUserStats } = useHogskoleprovet();
  const [stats, setStats] = useState<{ totalAttempts: number; averageScore: number; strongSections: string[]; weakSections: string[] }>({ totalAttempts: 0, averageScore: 0, strongSections: [], weakSections: [] });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const navigateToSection = (sectionId: string) => {
    router.push(`/hogskoleprovet/${sectionId}` as any);
  };

  if (isLoadingSections) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ title: 'Högskoleprovet', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          title: 'Högskoleprovet',
          headerShown: true,
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Öva Högskoleprovet</Text>
          <Text style={styles.heroSubtitle}>
            Träna på alla delar av högskoleprovet med riktiga frågor från tidigare prov
          </Text>
        </LinearGradient>

        {stats.totalAttempts > 0 && !isLoadingStats && (
          <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Din statistik</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Target size={24} color="#3B82F6" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalAttempts}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Försök</Text>
              </View>
              <View style={styles.statItem}>
                <Award size={24} color="#10B981" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{Math.round(stats.averageScore)}%</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Medel</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={24} color="#F59E0B" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.strongSections.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Starka</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🎯 Välj del att öva på</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Högskoleprovet består av 8 delar. Välj en del för att börja öva.
          </Text>
        </View>

        {sections.map((section, index) => {
          const sectionColors = [
            { primary: '#3B82F6', light: '#DBEAFE' },
            { primary: '#10B981', light: '#D1FAE5' },
            { primary: '#F59E0B', light: '#FEF3C7' },
            { primary: '#EF4444', light: '#FEE2E2' },
            { primary: '#8B5CF6', light: '#EDE9FE' },
            { primary: '#EC4899', light: '#FCE7F3' },
            { primary: '#06B6D4', light: '#CFFAFE' },
            { primary: '#F97316', light: '#FFEDD5' },
          ];
          
          const colors = sectionColors[index % sectionColors.length];
          
          return (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigateToSection(section.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionIcon, { backgroundColor: colors.light }]}>
                <Text style={styles.sectionEmoji}>{section.section_code}</Text>
              </View>
              <View style={styles.sectionInfo}>
                <Text style={[styles.sectionName, { color: theme.colors.text }]}>{section.section_name}</Text>
                <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                  {section.description}
                </Text>
                <View style={styles.sectionMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                      {section.time_limit_minutes} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Target size={14} color={theme.colors.textMuted} />
                    <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                      {section.max_score} poäng
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={24} color={colors.primary} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <BookOpen size={32} color="#3B82F6" />
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Om Högskoleprovet</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Högskoleprovet mäter din studieförmåga inom verbal och kvantitativ förmåga. 
            Provet består av 8 delar och tar cirka 5 timmar att genomföra. 
            Träna regelbundet för att förbättra ditt resultat!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionEmoji: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  sectionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  infoCard: {
    margin: 16,
    marginTop: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
