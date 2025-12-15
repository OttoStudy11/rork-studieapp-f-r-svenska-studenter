import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

const { width } = Dimensions.get('window');

const studyTips = [
  {
    id: 1,
    title: 'Pomodoro-tekniken',
    description: 'Studera i 25-minuters intervaller med 5 minuters pauser',
    icon: '🍅',
    category: 'Tidshantering',
    difficulty: 'Nybörjare'
  },
  {
    id: 2,
    title: 'Aktiv repetition',
    description: 'Testa dig själv istället för att bara läsa om materialet',
    icon: '🧠',
    category: 'Minnestekniker',
    difficulty: 'Medel'
  },
  {
    id: 3,
    title: 'Spaced repetition',
    description: 'Repetera material med ökande intervaller för bättre minne',
    icon: '📅',
    category: 'Minnestekniker',
    difficulty: 'Avancerad'
  },
  {
    id: 4,
    title: 'Feynman-tekniken',
    description: 'Förklara komplexa koncept med enkla ord',
    icon: '👨‍🏫',
    category: 'Förståelse',
    difficulty: 'Medel'
  },
  {
    id: 5,
    title: 'Mind mapping',
    description: 'Skapa visuella kartor för att organisera information',
    icon: '🗺️',
    category: 'Organisation',
    difficulty: 'Nybörjare'
  },
  {
    id: 6,
    title: 'Miljöbyte',
    description: 'Byt studiemiljö för att förbättra inlärningen',
    icon: '🏠',
    category: 'Miljö',
    difficulty: 'Nybörjare'
  },
  {
    id: 7,
    title: 'Chunking',
    description: 'Dela upp information i mindre, hanterbara delar',
    icon: '🧩',
    category: 'Minnestekniker',
    difficulty: 'Nybörjare'
  },
  {
    id: 8,
    title: 'Interleaving',
    description: 'Variera mellan olika ämnen för effektivare inlärning',
    icon: '🔀',
    category: 'Inlärning',
    difficulty: 'Medel'
  },
  {
    id: 9,
    title: 'Sömn & vila',
    description: 'Optimera din sömn för bättre minneskonsolidering',
    icon: '😴',
    category: 'Hälsa',
    difficulty: 'Nybörjare'
  }
];

export default function StudyTipsScreen() {
  const { theme, isDark } = useTheme();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nybörjare': return theme.colors.success;
      case 'Medel': return theme.colors.warning;
      case 'Avancerad': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Alla studietips</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SlideInView direction="up" delay={100}>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {studyTips.length} tips för att förbättra ditt lärande
          </Text>
        </SlideInView>

        <View style={styles.tipsGrid}>
          {studyTips.map((tip, index) => (
            <FadeInView key={tip.id} delay={150 + index * 50}>
              <TouchableOpacity 
                style={[styles.tipCard, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(`/study-tip/${tip.id}`)}
              >
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {tip.description}
                </Text>
                <View style={styles.tipMeta}>
                  <View style={[styles.categoryTag, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.categoryText, { color: theme.colors.primary }]}>{tip.category}</Text>
                  </View>
                  <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(tip.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(tip.difficulty) }]}>
                      {tip.difficulty}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tipCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
