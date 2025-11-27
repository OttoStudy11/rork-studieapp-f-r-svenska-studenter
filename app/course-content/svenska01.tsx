import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Edit3, X as CloseIcon, Award, TrendingUp, Sparkles, Lightbulb, Target } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Module {
  id: number;
  title: string;
  description: string;
  emoji: string;
  completed?: boolean;
  sections: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  examples: string[];
  reflectionQuestions: string[];
}

interface CourseProgress {
  progress: number;
  targetGrade: string;
  completedModules: number[];
}

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Skrivande och berättande',
    description: 'Utveckla din förmåga att skriva olika texttyper',
    emoji: '✍️',
    sections: [
      {
        title: 'Narrativa texter',
        content: 'Lär dig att skriva berättande texter med tydlig handling och engagerande beskrivningar.',
        keyPoints: [
          'Berättarstruktur och uppbyggnad',
          'Karaktärsutveckling och dialog',
          'Beskrivande språk och stilfigurer',
          'Handling och spänningskurva',
          'Olika perspektiv och berättarröster',
          'Kreativt skrivande'
        ]
      },
      {
        title: 'Sakprosatexter',
        content: 'Skriv informerande och argumenterande texter med tydlig struktur och övertygande innehåll.',
        keyPoints: [
          'Textuppbyggnad: inledning, avhandling, avslutning',
          'Argumentationsteknik och källkritik',
          'Källhänvisning och referenser',
          'Disposition och disposition',
          'Sakligt och formellt språk',
          'Debattartiklar och krönikor'
        ]
      },
      {
        title: 'Skrivprocess',
        content: 'Utveckla en effektiv skrivprocess från idé till färdig text.',
        keyPoints: [
          'Brainstorming och idégenering',
          'Planering och dispositionen',
          'Första utkast och revidering',
          'Textbearbetning och redigering',
          'Språkgranskning och korrekturläsning',
          'Feedback och självvärdering'
        ]
      }
    ],
    examples: [
      'Skriv dagbok för att träna på narrativt berättande',
      'Analysera och imitera olika textstilar',
      'Skriv debattartiklar om aktuella ämnen',
      'Delta i skrivarcirklar och ge kamratrespons'
    ],
    reflectionQuestions: [
      'Vilka texttyper känner du dig säkrast på att skriva?',
      'Hur kan du utveckla ditt skrivande?',
      'Vad är viktigt för att en text ska engagera läsaren?',
      'Hur påverkar målgruppen ditt sätt att skriva?'
    ]
  },
  {
    id: 2,
    title: 'Läsning och textanalys',
    description: 'Utveckla din läsförståelse och analytiska förmåga',
    emoji: '📚',
    sections: [
      {
        title: 'Läsförståelse',
        content: 'Förbättra din förmåga att läsa och förstå olika typer av texter.',
        keyPoints: [
          'Läsning mellan raderna: implicit och explicit betydelse',
          'Att förstå sammanhang och kontext',
          'Textstruktur och organisation',
          'Ordförståelse och vokabulär',
          'Att dra slutsatser och göra kopplingar',
          'Kritiskt läsande'
        ]
      },
      {
        title: 'Litterär analys',
        content: 'Lär dig att analysera och tolka skönlitterära texter.',
        keyPoints: [
          'Handling, miljö och karaktärer',
          'Teman och budskap',
          'Berättarperspektiv och synvinkel',
          'Litterära verkningsmedel: metaforer, symbolik',
          'Historiskt och kulturellt sammanhang',
          'Författarens syfte och avsikt'
        ]
      },
      {
        title: 'Sakprosanalys',
        content: 'Analysera och värdera argumenterande och informerande texter.',
        keyPoints: [
          'Textens syfte och målgrupp',
          'Argumentation och retorik',
          'Källkritik och trovärdighet',
          'Språkliga drag och stilnivå',
          'Textbindning och sammanhang',
          'Jämförande textanalys'
        ]
      }
    ],
    examples: [
      'Läs och analysera svenska romaner och noveller',
      'Studera tidningsartiklar och jämför olika källor',
      'Analysera reklam och dess retoriska strategier',
      'Läs svensk lyrik och tolkningsvingar'
    ],
    reflectionQuestions: [
      'Hur skiljer sig skönlitterära och sakprosatexter åt?',
      'Vad gör en text övertygande?',
      'Hur kan man läsa kritiskt och källkritiskt?',
      'På vilket sätt påverkar läsning ditt skrivande?'
    ]
  },
  {
    id: 3,
    title: 'Muntlig kommunikation',
    description: 'Utveckla din förmåga att tala och kommunicera på svenska',
    emoji: '🗣️',
    sections: [
      {
        title: 'Presentationsteknik',
        content: 'Lär dig att hålla engagerande presentationer och föredrag.',
        keyPoints: [
          'Planering och struktur av presentation',
          'Användning av visuella hjälpmedel',
          'Kroppsspråk och röstanvändning',
          'Ögonkontakt och publikkontakt',
          'Att hantera nervositet',
          'Frågestunder och diskussioner'
        ]
      },
      {
        title: 'Samtal och diskussion',
        content: 'Utveckla din förmåga att delta i samtal och diskussioner.',
        keyPoints: [
          'Aktiv lyssning och turtagning',
          'Att argumentera och motivera',
          'Respektfull debatt och kritik',
          'Att ställa relevanta frågor',
          'Anpassning till samtalspartnern',
          'Formellt och informellt språk'
        ]
      },
      {
        title: 'Retorik',
        content: 'Lär dig grundläggande retorik för övertygande kommunikation.',
        keyPoints: [
          'Ethos, pathos och logos',
          'Retoriska stilfigurer',
          'Argumentation och bevisföring',
          'Disposition och disponering',
          'Språkliga verkningsmedel',
          'Talespråk vs. skriftspråk'
        ]
      }
    ],
    examples: [
      'Håll korta presentationer om olika ämnen',
      'Delta i klassrumsdebatter',
      'Öva på att ge och ta emot feedback',
      'Analysera politikers tal och retorik'
    ],
    reflectionQuestions: [
      'Vad kännetecknar effektiv muntlig kommunikation?',
      'Hur kan du förbättra din presentationsteknik?',
      'Vad är viktigt att tänka på i olika kommunikationssituationer?',
      'Hur skiljer sig muntlig och skriftlig kommunikation åt?'
    ]
  },
  {
    id: 4,
    title: 'Språk och språkutveckling',
    description: 'Förstå det svenska språkets uppbyggnad och utveckling',
    emoji: '🔤',
    sections: [
      {
        title: 'Grammatik',
        content: 'Grundläggande grammatik för korrekt språkanvändning.',
        keyPoints: [
          'Ordklasser och deras funktioner',
          'Satsdelar och satsbyggnad',
          'Tempus, modus och aspekt',
          'Substantiv: genus, numerus, bestämdhet',
          'Verb: konjugation och tempusbildning',
          'Interpunktion och meningsbyggnad'
        ]
      },
      {
        title: 'Språkhistoria',
        content: 'Det svenska språkets historia och utveckling.',
        keyPoints: [
          'Fornsvenska, medeltidssvenska och nusvenska',
          'Språkförändringar över tid',
          'Påverkan från andra språk',
          'Dialekter och regionala variationer',
          'Svenskans ställning i världen',
          'Nordiska språk och språkgemenskap'
        ]
      },
      {
        title: 'Stilistik och språkvård',
        content: 'Medveten språkanvändning och språkvård.',
        keyPoints: [
          'Formellt och informellt språk',
          'Stilnivåer och stilmedel',
          'Språkriktighet och språkvård',
          'Vanliga språkfel och hur man undviker dem',
          'Språkliga normer och variation',
          'Språkets påverkan och makt'
        ]
      }
    ],
    examples: [
      'Analysera språkliga drag i olika texttyper',
      'Studera språkförändringar genom att läsa äldre texter',
      'Undersök dialekter och sociolekter',
      'Diskutera språknormer och språkvård'
    ],
    reflectionQuestions: [
      'Hur har svenskan förändrats genom historien?',
      'Varför är det viktigt att kunna anpassa sitt språk?',
      'Vad är språkvård och varför behövs det?',
      'Hur påverkar digitalisering språket?'
    ]
  },
  {
    id: 5,
    title: 'Litteratur och kultur',
    description: 'Utforska svensk och internationell litteratur',
    emoji: '📖',
    sections: [
      {
        title: 'Svensk litteratur',
        content: 'Läs och analysera betydelsefulla svenska författare och verk.',
        keyPoints: [
          'Litterära epoker i Sverige',
          'Klassiska svenska författare',
          'Modern svensk litteratur',
          'Nordisk litteratur',
          'Barn- och ungdomslitteratur',
          'Populärlitteratur och genrer'
        ]
      },
      {
        title: 'Världslitteratur',
        content: 'Utforska litteratur från olika kulturer och tidsepoker.',
        keyPoints: [
          'Antikens litteratur och mytologi',
          'Europeisk litteraturhistoria',
          'Världslitterära verk och författare',
          'Översättningens betydelse',
          'Kulturella perspektiv i litteraturen',
          'Postkolonial litteratur'
        ]
      },
      {
        title: 'Litterära genrer',
        content: 'Förstå olika litterära genrer och deras särskiljande drag.',
        keyPoints: [
          'Roman: olika typer och utveckling',
          'Novell och kortprosa',
          'Lyrik: form och innehåll',
          'Drama: teater och scenkonst',
          'Fantasy, science fiction och andra genrer',
          'Grafiska romaner och multimodala texter'
        ]
      }
    ],
    examples: [
      'Läs och diskutera klassiska svenska romaner',
      'Analysera dikter från olika tidsepoker',
      'Se teaterföreställningar och filmadaptioner',
      'Jämför olika genrer och deras konventioner'
    ],
    reflectionQuestions: [
      'Vad kännetecknar svensk litteratur?',
      'Hur speglar litteraturen samhället och tiden?',
      'Varför är det viktigt att läsa klassiker?',
      'Hur påverkar litteratur vår världsbild?'
    ]
  }
];

export default function Svenska1Course() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    progress: 0,
    targetGrade: 'E',
    completedModules: []
  });
  const [targetGradeModalVisible, setTargetGradeModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('E');

  const storageKey = `svenska1_progress_${user?.id || 'guest'}`;

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const progress = JSON.parse(stored);
        setCourseProgress(progress);
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async (newProgress: CourseProgress) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newProgress));
      setCourseProgress(newProgress);
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const toggleModuleCompletion = (moduleId: number) => {
    const isCompleted = courseProgress.completedModules.includes(moduleId);
    const newCompletedModules = isCompleted
      ? courseProgress.completedModules.filter(id => id !== moduleId)
      : [...courseProgress.completedModules, moduleId];
    
    const newProgress = (newCompletedModules.length / modulesData.length) * 100;
    
    saveProgress({
      ...courseProgress,
      completedModules: newCompletedModules,
      progress: newProgress
    });
  };

  const updateTargetGrade = () => {
    saveProgress({
      ...courseProgress,
      targetGrade: selectedGrade
    });
    setTargetGradeModalVisible(false);
  };

  const gradientColors = ['#EC4899', '#DB2777'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.courseTitle}>📚 Svenska 1</Text>
            <Text style={styles.courseSubtitle}>100 poäng • Gymnasiegemensam</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={100}>
          <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
            <View style={styles.heroBadge}>
              <Sparkles size={16} color="#EC4899" />
              <Text style={[styles.heroBadgeText, { color: '#EC4899' }]}>GRUNDKURS</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Svenska språket och litteratur</Text>
            <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
              Utveckla din läs- och skrivförmåga, analysera texter och litteratur, och kommunicera effektivt på svenska.
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <BookOpen size={20} color="#EC4899" />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Moduler</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{modulesData.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={20} color="#EC4899" />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Målbetyg</Text>
                <TouchableOpacity onPress={() => {
                  setSelectedGrade(courseProgress.targetGrade);
                  setTargetGradeModalVisible(true);
                }}>
                  <Text style={[styles.statValue, { color: '#EC4899' }]}>{courseProgress.targetGrade}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={20} color="#EC4899" />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Framsteg</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{Math.round(courseProgress.progress)}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                <View style={[styles.progressBarFill, { width: `${courseProgress.progress}%`, backgroundColor: '#EC4899' }]} />
              </View>
            </View>
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Kursinnehåll</Text>
          
          {modulesData.map((module, index) => {
            const isCompleted = courseProgress.completedModules.includes(module.id);
            const isExpanded = expandedModule === module.id;
            
            return (
              <SlideInView key={module.id} delay={index * 100}>
                <View style={[styles.moduleCard, { backgroundColor: theme.card }]}>
                  <TouchableOpacity
                    onPress={() => setExpandedModule(isExpanded ? null : module.id)}
                    style={styles.moduleHeader}
                  >
                    <View style={styles.moduleIcon}>
                      <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={[styles.moduleTitle, { color: theme.text }]}>{module.title}</Text>
                      <Text style={[styles.moduleDescription, { color: theme.textSecondary }]}>
                        {module.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleModuleCompletion(module.id);
                      }}
                      style={styles.checkButton}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} color="#EC4899" />
                      ) : (
                        <Circle size={24} color={theme.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.moduleContent}>
                      {module.sections.map((section, idx) => (
                        <View key={idx} style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <Lightbulb size={18} color="#EC4899" />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                          </View>
                          <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                            {section.content}
                          </Text>
                          <View style={styles.keyPoints}>
                            {section.keyPoints.map((point, pidx) => (
                              <View key={pidx} style={styles.keyPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={[styles.keyPointText, { color: theme.textSecondary }]}>{point}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}

                      <View style={styles.examplesSection}>
                        <Text style={[styles.examplesTitle, { color: theme.text }]}>📝 Praktiska övningar</Text>
                        {module.examples.map((example, idx) => (
                          <Text key={idx} style={[styles.example, { color: theme.textSecondary }]}>
                            • {example}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.reflectionSection}>
                        <Text style={[styles.reflectionTitle, { color: theme.text }]}>💭 Reflektionsfrågor</Text>
                        {module.reflectionQuestions.map((question, idx) => (
                          <Text key={idx} style={[styles.reflectionQuestion, { color: theme.textSecondary }]}>
                            {idx + 1}. {question}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </SlideInView>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={targetGradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTargetGradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Välj målbetyg</Text>
              <TouchableOpacity onPress={() => setTargetGradeModalVisible(false)}>
                <CloseIcon size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gradeOptions}>
              {['A', 'B', 'C', 'D', 'E'].map((grade) => (
                <TouchableOpacity
                  key={grade}
                  onPress={() => setSelectedGrade(grade)}
                  style={[
                    styles.gradeOption,
                    selectedGrade === grade && styles.gradeOptionSelected,
                    { borderColor: theme.border }
                  ]}
                >
                  <Text style={[
                    styles.gradeText,
                    { color: selectedGrade === grade ? '#FFF' : theme.text }
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={updateTargetGrade}
              style={[styles.saveButton, { backgroundColor: '#EC4899' }]}
            >
              <Text style={styles.saveButtonText}>Spara målbetyg</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  courseSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroCard: {
    marginTop: -20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  modulesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleEmoji: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
  },
  checkButton: {
    padding: 8,
  },
  moduleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  keyPoints: {
    marginLeft: 8,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    color: '#EC4899',
    marginRight: 8,
    fontWeight: '700',
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  examplesSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderRadius: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  reflectionSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderRadius: 12,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reflectionQuestion: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  gradeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gradeOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeOptionSelected: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  gradeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
