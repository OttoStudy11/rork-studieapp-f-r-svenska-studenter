import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

const studyTechniques = [
  {
    id: 1,
    title: 'SQ3R-metoden',
    description: 'Survey, Question, Read, Recite, Review - systematisk läsning',
    steps: ['Överblicka', 'Fråga', 'Läs', 'Återge', 'Repetera'],
    icon: '📖',
    timeNeeded: '30-60 min',
    category: 'Läsning'
  },
  {
    id: 2,
    title: 'Cornell-anteckningar',
    description: 'Strukturerad anteckningsmetod med tre sektioner',
    steps: ['Anteckningar', 'Ledtrådar', 'Sammanfattning'],
    icon: '📝',
    timeNeeded: '15-30 min',
    category: 'Anteckningar'
  },
  {
    id: 3,
    title: 'Elaborativ förfrågan',
    description: 'Ställ "varför" och "hur" frågor för djupare förståelse',
    steps: ['Läs fakta', 'Fråga varför', 'Förklara samband', 'Koppla till tidigare kunskap'],
    icon: '❓',
    timeNeeded: '20-40 min',
    category: 'Förståelse'
  },
  {
    id: 4,
    title: 'Leitner-systemet',
    description: 'Flashcard-system med repetitionsintervaller baserat på prestation',
    steps: ['Skapa kort', 'Sortera i lådor', 'Repetera', 'Flytta kort'],
    icon: '📦',
    timeNeeded: '15-25 min',
    category: 'Flashcards'
  },
  {
    id: 5,
    title: 'Retrieval Practice',
    description: 'Träna på att hämta information från minnet aktivt',
    steps: ['Studera material', 'Stäng allt', 'Skriv ner allt', 'Kontrollera'],
    icon: '🔄',
    timeNeeded: '20-30 min',
    category: 'Minne'
  },
  {
    id: 6,
    title: 'Dual Coding',
    description: 'Kombinera text med visuella element för bättre inlärning',
    steps: ['Läs text', 'Skapa bilder', 'Koppla samman', 'Repetera båda'],
    icon: '🎨',
    timeNeeded: '25-45 min',
    category: 'Visuellt'
  }
];

export default function StudyTechniquesScreen() {
  const { theme, isDark } = useTheme();

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Alla studietekniker</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SlideInView direction="up" delay={100}>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {studyTechniques.length} effektiva tekniker för bättre studieresultat
          </Text>
        </SlideInView>

        <View style={styles.techniquesList}>
          {studyTechniques.map((technique, index) => (
            <FadeInView key={technique.id} delay={150 + index * 50}>
              <TouchableOpacity 
                style={[styles.techniqueCard, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(`/study-technique/${technique.id}` as never)}
              >
                <View style={styles.techniqueHeader}>
                  <Text style={styles.techniqueIcon}>{technique.icon}</Text>
                  <View style={styles.techniqueInfo}>
                    <Text style={[styles.techniqueTitle, { color: theme.colors.text }]}>{technique.title}</Text>
                    <Text style={[styles.techniqueDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {technique.description}
                    </Text>
                  </View>
                  <ArrowRight size={20} color={theme.colors.textMuted} />
                </View>
                
                <View style={styles.techniqueMeta}>
                  <View style={[styles.timeTag, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Clock size={12} color={theme.colors.primary} />
                    <Text style={[styles.timeText, { color: theme.colors.primary }]}>{technique.timeNeeded}</Text>
                  </View>
                  <View style={[styles.categoryTag, { backgroundColor: theme.colors.secondary + '15' }]}>
                    <Text style={[styles.categoryText, { color: theme.colors.secondary }]}>{technique.category}</Text>
                  </View>
                </View>

                <View style={styles.stepsContainer}>
                  {technique.steps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.stepItem}>
                      <View style={[styles.stepDot, { backgroundColor: theme.colors.primary }]} />
                      <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>{step}</Text>
                    </View>
                  ))}
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
  techniquesList: {
    gap: 16,
  },
  techniqueCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  techniqueIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  techniqueMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
