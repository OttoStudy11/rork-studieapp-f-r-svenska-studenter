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
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Clock, Users, Target, BookOpen, Lightbulb, CheckCircle, PlayCircle } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

interface StudyTechnique {
  id: number;
  title: string;
  description: string;
  steps: string[];
  icon: string;
  timeNeeded: string;
  detailedDescription: string;
  benefits: string[];
  detailedSteps: { title: string; description: string; tips: string[] }[];
  examples: string[];
  bestFor: string[];
}

const studyTechniquesData: StudyTechnique[] = [
  {
    id: 1,
    title: 'SQ3R-metoden',
    description: 'Survey, Question, Read, Recite, Review - systematisk läsning',
    steps: ['Överblicka', 'Fråga', 'Läs', 'Återge', 'Repetera'],
    icon: '📖',
    timeNeeded: '30-60 min',
    detailedDescription: 'SQ3R är en beprövad läsmetod som hjälper dig att läsa mer effektivt och komma ihåg mer av det du läser. Metoden utvecklades av Francis P. Robinson på 1940-talet och används fortfarande av studenter världen över.',
    benefits: [
      'Förbättrar läsförståelsen markant',
      'Ökar retention av information',
      'Gör läsningen mer aktiv och engagerande',
      'Hjälper att identifiera viktiga koncept',
      'Sparar tid i längden genom bättre förståelse'
    ],
    detailedSteps: [
      {
        title: 'Survey (Överblicka)',
        description: 'Få en överblick av materialet innan du börjar läsa i detalj',
        tips: [
          'Läs rubriker och underrubriker',
          'Titta på bilder, diagram och tabeller',
          'Läs sammanfattningar och slutsatser',
          'Notera nyckelord och begrepp'
        ]
      },
      {
        title: 'Question (Fråga)',
        description: 'Formulera frågor baserat på din överblick',
        tips: [
          'Gör om rubriker till frågor',
          'Ställ frågor som "Vad?", "Varför?", "Hur?"',
          'Tänk på vad du redan vet om ämnet',
          'Skriv ner dina frågor'
        ]
      },
      {
        title: 'Read (Läs)',
        description: 'Läs aktivt med dina frågor i åtanke',
        tips: [
          'Läs för att hitta svar på dina frågor',
          'Ta anteckningar medan du läser',
          'Markera viktiga passager',
          'Läs i lagom tempo - inte för fort'
        ]
      },
      {
        title: 'Recite (Återge)',
        description: 'Återge informationen med egna ord',
        tips: [
          'Stäng boken och försök förklara vad du läst',
          'Besvara dina ursprungliga frågor',
          'Diskutera med någon annan',
          'Skriv en kort sammanfattning'
        ]
      },
      {
        title: 'Review (Repetera)',
        description: 'Gå igenom materialet igen för att befästa kunskapen',
        tips: [
          'Läs dina anteckningar',
          'Gå igenom viktiga koncept',
          'Testa dig själv på nyckelfakta',
          'Koppla samman med tidigare kunskap'
        ]
      }
    ],
    examples: [
      'Läsa en kursbok i historia',
      'Studera vetenskapliga artiklar',
      'Förbereda sig för tentamen',
      'Lära sig nytt ämnesområde'
    ],
    bestFor: ['Textintensiva ämnen', 'Akademisk litteratur', 'Förberedelse inför prov']
  },
  {
    id: 2,
    title: 'Cornell-anteckningar',
    description: 'Strukturerad anteckningsmetod med tre sektioner',
    steps: ['Anteckningar', 'Ledtrådar', 'Sammanfattning'],
    icon: '📝',
    timeNeeded: '15-30 min',
    detailedDescription: 'Cornell-systemet utvecklades av Walter Pauk vid Cornell University. Det delar upp papperet i tre sektioner för att skapa mer organiserade och användbara anteckningar.',
    benefits: [
      'Organiserar anteckningar systematiskt',
      'Underlättar repetition och granskning',
      'Förbättrar aktiv lyssning',
      'Skapar tydlig struktur',
      'Hjälper vid tentamensförberedelser'
    ],
    detailedSteps: [
      {
        title: 'Förberedelse',
        description: 'Dela upp papperet i tre sektioner',
        tips: [
          'Dra en vertikal linje 6 cm från vänster kant',
          'Dra en horisontell linje 5 cm från botten',
          'Märk sektionerna: Ledtrådar, Anteckningar, Sammanfattning',
          'Skriv datum och ämne överst'
        ]
      },
      {
        title: 'Anteckningar (Under föreläsning)',
        description: 'Skriv huvudanteckningar i den stora högra sektionen',
        tips: [
          'Fokusera på huvudidéer och viktiga detaljer',
          'Använd förkortningar och symboler',
          'Lämna utrymme för senare tillägg',
          'Skriv tydligt och strukturerat'
        ]
      },
      {
        title: 'Ledtrådar (Efter föreläsning)',
        description: 'Skriv nyckelord och frågor i vänstra kolumnen',
        tips: [
          'Identifiera huvudkoncept',
          'Skriv frågor som kan besvaras av anteckningarna',
          'Använd nyckelord för snabb repetition',
          'Markera viktiga områden'
        ]
      },
      {
        title: 'Sammanfattning',
        description: 'Skriv en kort sammanfattning i botten-sektionen',
        tips: [
          'Sammanfatta huvudpunkterna i 2-3 meningar',
          'Fokusera på de viktigaste lärdomarna',
          'Använd egna ord',
          'Koppla till tidigare kunskap'
        ]
      }
    ],
    examples: [
      'Föreläsningsanteckningar',
      'Boksammanfattningar',
      'Mötesprotokoll',
      'Forskningsanteckningar'
    ],
    bestFor: ['Föreläsningar', 'Seminarier', 'Bokstudier']
  },
  {
    id: 3,
    title: 'Elaborativ förfrågan',
    description: 'Ställ "varför" och "hur" frågor för djupare förståelse',
    steps: ['Läs fakta', 'Fråga varför', 'Förklara samband', 'Koppla till tidigare kunskap'],
    icon: '❓',
    timeNeeded: '20-40 min',
    detailedDescription: 'Elaborativ förfrågan är en teknik som går ut på att ställa fördjupande frågor om det material du studerar. Genom att fråga "varför" och "hur" skapar du djupare förståelse och bättre minnesbilder.',
    benefits: [
      'Skapar djupare förståelse',
      'Förbättrar kritiskt tänkande',
      'Stärker långtidsminnet',
      'Hjälper att se samband',
      'Gör lärandet mer meningsfullt'
    ],
    detailedSteps: [
      {
        title: 'Identifiera fakta',
        description: 'Börja med att identifiera viktiga fakta och påståenden',
        tips: [
          'Läs materialet grundligt först',
          'Markera viktiga fakta och påståenden',
          'Fokusera på en sak i taget',
          'Skriv ner faktan tydligt'
        ]
      },
      {
        title: 'Ställ varför-frågor',
        description: 'Fråga varför varje faktum är sant eller viktigt',
        tips: [
          'Varför är detta sant?',
          'Varför händer detta?',
          'Varför är detta viktigt?',
          'Varför fungerar det på detta sätt?'
        ]
      },
      {
        title: 'Förklara mekanismer',
        description: 'Förklara hur och varför saker fungerar som de gör',
        tips: [
          'Beskriv orsak-och-verkan samband',
          'Förklara underliggande processer',
          'Identifiera mönster och principer',
          'Använd analogier och exempel'
        ]
      },
      {
        title: 'Koppla samman',
        description: 'Koppla ny information till det du redan vet',
        tips: [
          'Hur relaterar detta till tidigare kunskap?',
          'Vilka likheter och skillnader finns?',
          'Hur passar detta in i helhetsbilden?',
          'Vilka implikationer har detta?'
        ]
      }
    ],
    examples: [
      'Studera historiska händelser',
      'Förstå vetenskapliga processer',
      'Analysera litterära verk',
      'Lära sig matematiska koncept'
    ],
    bestFor: ['Komplexa ämnen', 'Konceptuell förståelse', 'Kritisk analys']
  }
];

export default function StudyTechniqueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  
  const technique = studyTechniquesData.find(t => t.id === parseInt(id || '1'));
  
  if (!technique) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Studieteknik hittades inte</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <SlideInView direction="up" delay={100}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.primary + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroIcon}>{technique.icon}</Text>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{technique.title}</Text>
              <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>{technique.description}</Text>
              
              <View style={styles.heroTags}>
                <View style={[styles.timeTag, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={[styles.timeText, { color: theme.colors.primary }]}>{technique.timeNeeded}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </SlideInView>
        
        {/* Quick Overview */}
        <SlideInView direction="up" delay={200}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <PlayCircle size={24} color={theme.colors.secondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Snabb översikt</Text>
            </View>
            <View style={styles.stepsOverview}>
              {technique.steps.map((step, index) => (
                <View key={index} style={styles.stepOverviewItem}>
                  <View style={[styles.stepOverviewNumber, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.stepOverviewNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepOverviewText, { color: theme.colors.text }]}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </SlideInView>
        
        {/* Detailed Description */}
        <FadeInView delay={300}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <BookOpen size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Om tekniken</Text>
            </View>
            <Text style={[styles.sectionContent, { color: theme.colors.textSecondary }]}>{technique.detailedDescription}</Text>
          </View>
        </FadeInView>
        
        {/* Benefits */}
        <FadeInView delay={400}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={24} color={theme.colors.success} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fördelar</Text>
            </View>
            {technique.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
        
        {/* Detailed Steps */}
        <FadeInView delay={500}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={24} color={theme.colors.warning} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Detaljerade steg</Text>
            </View>
            {technique.detailedSteps.map((step, index) => (
              <View key={index} style={styles.detailedStepItem}>
                <View style={styles.detailedStepHeader}>
                  <View style={[styles.detailedStepNumber, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.detailedStepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.detailedStepInfo}>
                    <Text style={[styles.detailedStepTitle, { color: theme.colors.text }]}>{step.title}</Text>
                    <Text style={[styles.detailedStepDescription, { color: theme.colors.textSecondary }]}>{step.description}</Text>
                  </View>
                </View>
                <View style={styles.detailedStepTips}>
                  {step.tips.map((tip, tipIndex) => (
                    <View key={tipIndex} style={styles.tipItem}>
                      <View style={[styles.tipBullet, { backgroundColor: theme.colors.info }]} />
                      <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </FadeInView>
        
        {/* Examples */}
        <FadeInView delay={600}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={theme.colors.secondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exempel på användning</Text>
            </View>
            {technique.examples.map((example, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.secondary }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{example}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
        
        {/* Best For */}
        <FadeInView delay={700}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Users size={24} color={theme.colors.info} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bäst för</Text>
            </View>
            <View style={styles.bestForGrid}>
              {technique.bestFor.map((item, index) => (
                <View key={index} style={[styles.bestForTag, { backgroundColor: theme.colors.info + '20' }]}>
                  <Text style={[styles.bestForText, { color: theme.colors.info }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  scrollContent: {
    paddingBottom: 100,
  },
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 12,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepsOverview: {
    gap: 12,
  },
  stepOverviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepOverviewNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepOverviewNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepOverviewText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  detailedStepItem: {
    marginBottom: 24,
  },
  detailedStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 16,
  },
  detailedStepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailedStepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  detailedStepInfo: {
    flex: 1,
  },
  detailedStepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailedStepDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailedStepTips: {
    marginLeft: 52,
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bestForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bestForTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestForText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});