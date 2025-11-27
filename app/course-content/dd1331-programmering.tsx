import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Lightbulb, 
  CheckCircle, 
  Target,
  Circle,
  Edit3,
  X as CloseIcon,
  Award,
  TrendingUp,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Module {
  id: number;
  title: string;
  description: string;
  emoji: string;
  sections: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  examples: string[];
  reflectionQuestions: string[];
}

interface CourseProgressData {
  manualProgress: number;
  targetGrade: string;
  completedModules: number[];
}

const COURSE_ID = 'DD1331';

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Grundläggande Programmering',
    description: 'Introduktion till programmeringskoncept och syntax',
    emoji: '💻',
    sections: [
      {
        title: 'Programmeringens grunder',
        content: 'Programmering handlar om att ge instruktioner till en dator för att lösa problem. Vi börjar med grundläggande koncept som variabler, datatyper och kontrollstrukturer.',
        keyPoints: [
          'Variabler och datatyper (int, float, string, boolean)',
          'Operatorer (aritmetiska, logiska, jämförelse)',
          'Input och output',
          'Kommentarer och kodstruktur',
          'Felsökning och debugging',
          'Utvecklingsmiljö och IDE'
        ]
      },
      {
        title: 'Kontrollstrukturer',
        content: 'Kontrollstrukturer styr programmets flöde och gör det möjligt att fatta beslut och upprepa kod.',
        keyPoints: [
          'If-satser och villkor',
          'Else och elif',
          'Loopar: while och for',
          'Break och continue',
          'Nästlade kontrollstrukturer',
          'Logiska uttryck'
        ]
      }
    ],
    examples: [
      'Skriva ett program som läser input från användaren',
      'Beräkna fakultet med en loop',
      'Validera användarinput med if-satser',
      'Skapa ett enkelt menyprogram'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan while och for?',
      'När ska man använda break vs continue?',
      'Hur kan man göra kod mer läsbar?',
      'Varför är indentation viktigt i Python?'
    ]
  },
  {
    id: 2,
    title: 'Funktioner och Moduler',
    description: 'Strukturera kod med funktioner och återanvändbara moduler',
    emoji: '⚙️',
    sections: [
      {
        title: 'Funktioner',
        content: 'Funktioner är återanvändbara kodblock som utför specifika uppgifter och gör programmet mer strukturerat.',
        keyPoints: [
          'Definiera och anropa funktioner',
          'Parametrar och returvärden',
          'Scope och variabelns livslängd',
          'Default-parametrar',
          'Dokumentation med docstrings',
          'Lambda-funktioner'
        ]
      },
      {
        title: 'Moduler och paket',
        content: 'Moduler låter dig organisera kod i separata filer och återanvända kod mellan projekt.',
        keyPoints: [
          'Importera moduler',
          'Skapa egna moduler',
          'Standardbiblioteket',
          'Tredjepartsbibliotek med pip',
          '__name__ och __main__',
          'Paketstruktur'
        ]
      }
    ],
    examples: [
      'Skapa en funktion för att beräkna medelvärde',
      'Bygga en matematikmodul med olika funktioner',
      'Använda random-modulen för att skapa spel',
      'Importera och använda externa bibliotek'
    ],
    reflectionQuestions: [
      'Varför är funktioner viktiga för kodstruktur?',
      'Vad är skillnaden mellan lokala och globala variabler?',
      'När ska man dela upp kod i flera moduler?',
      'Hur dokumenterar man funktioner effektivt?'
    ]
  },
  {
    id: 3,
    title: 'Datastrukturer',
    description: 'Arbeta med listor, tupler, dictionaries och sets',
    emoji: '📦',
    sections: [
      {
        title: 'Listor och tupler',
        content: 'Listor och tupler är sekvenser som kan lagra flera värden. Listor är muterbara medan tupler är immuterbara.',
        keyPoints: [
          'Skapa och indexera listor',
          'List comprehensions',
          'Vanliga listmetoder (append, extend, sort)',
          'Slicing och iteration',
          'Tupler och tuple unpacking',
          'Skillnader mellan listor och tupler'
        ]
      },
      {
        title: 'Dictionaries och sets',
        content: 'Dictionaries lagrar nyckel-värde-par medan sets lagrar unika element.',
        keyPoints: [
          'Skapa och använda dictionaries',
          'Dictionary comprehensions',
          'Iterera över nycklar och värden',
          'Sets och mängdoperationer',
          'Hashbara objekt',
          'Användningsfall för olika strukturer'
        ]
      }
    ],
    examples: [
      'Skapa en telefonbok med dictionary',
      'Filtrera och transformera listor',
      'Räkna förekomster av ord i en text',
      'Hitta gemensamma element med sets'
    ],
    reflectionQuestions: [
      'När ska man välja lista vs tuple?',
      'Vilka fördelar har dictionaries över listor?',
      'Hur fungerar hashing i sets och dictionaries?',
      'Vad är tidskomplexiteten för olika operationer?'
    ]
  },
  {
    id: 4,
    title: 'Objektorienterad Programmering (OOP)',
    description: 'Skapa klasser och objekt för strukturerad kod',
    emoji: '🎯',
    sections: [
      {
        title: 'Klasser och objekt',
        content: 'Objektorienterad programmering organiserar kod kring objekt som har egenskaper (attribut) och beteenden (metoder).',
        keyPoints: [
          'Definiera klasser',
          'Konstruktor (__init__)',
          'Instansvariabler och klassvariabler',
          'Metoder och self',
          'Inkapsling',
          'Properties och getters/setters'
        ]
      },
      {
        title: 'Arv och polymorfism',
        content: 'Arv låter klasser ärva funktionalitet från andra klasser, vilket främjar kodåteranvändning.',
        keyPoints: [
          'Basklasser och subklasser',
          'super() och metodöverlagring',
          'Multipelt arv',
          'Polymorfism',
          'Abstrakta klasser',
          'Duck typing'
        ]
      }
    ],
    examples: [
      'Skapa en klass för bankkonton',
      'Bygga ett djursystem med arv',
      'Implementera en spelkaraktär med olika egenskaper',
      'Skapa ett enkelt bibliotekssystem'
    ],
    reflectionQuestions: [
      'När är OOP fördelaktigt?',
      'Vad är skillnaden mellan arv och komposition?',
      'Hur förbättrar inkapsling kodkvalitet?',
      'När ska man använda klassmetoder vs instansmetoder?'
    ]
  },
  {
    id: 5,
    title: 'Filhantering och Felhantering',
    description: 'Arbeta med filer och hantera fel gracefully',
    emoji: '📁',
    sections: [
      {
        title: 'Filhantering',
        content: 'Att läsa från och skriva till filer är grundläggande för många program.',
        keyPoints: [
          'Öppna och stänga filer',
          'Läsa filer (read, readline, readlines)',
          'Skriva till filer',
          'Context managers (with-satsen)',
          'Olika filformat (text, CSV, JSON)',
          'Binära filer'
        ]
      },
      {
        title: 'Felhantering',
        content: 'Felhantering gör program robusta och förhindrar krasch vid oväntade situationer.',
        keyPoints: [
          'Try-except-block',
          'Olika typer av exceptions',
          'Finally och else',
          'Skapa egna exceptions',
          'Raising exceptions',
          'Best practices för felhantering'
        ]
      }
    ],
    examples: [
      'Läsa och skriva textfiler',
      'Parsa CSV-data',
      'Hantera JSON för konfiguration',
      'Robust input-validering med exceptions'
    ],
    reflectionQuestions: [
      'Varför ska man alltid använda context managers?',
      'När ska man fånga exceptions vs låta dem propagera?',
      'Hur väljer man rätt exception-typ?',
      'Vad är skillnaden mellan syntaxfel och runtime-fel?'
    ]
  }
];

export default function DD1331() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [progress, setProgress] = useState<CourseProgressData>({
    manualProgress: 0,
    targetGrade: '',
    completedModules: []
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');

  const storageKey = `@course_progress_${COURSE_ID}_${user?.id}`;

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadProgress = async () => {
    if (!user?.id) return;
    
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setProgress(data);
        setEditTargetGrade(data.targetGrade || '');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (newProgress: CourseProgressData) => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleAdjustProgress = async (adjustment: number) => {
    const newValue = Math.max(0, Math.min(100, progress.manualProgress + adjustment));
    await saveProgress({ ...progress, manualProgress: newValue });
  };

  const handleToggleModule = async (moduleId: number) => {
    const isCompleted = progress.completedModules.includes(moduleId);
    const newCompletedModules = isCompleted
      ? progress.completedModules.filter(id => id !== moduleId)
      : [...progress.completedModules, moduleId];
    
    await saveProgress({ ...progress, completedModules: newCompletedModules });
  };

  const handleSaveTargetGrade = async () => {
    try {
      await saveProgress({ ...progress, targetGrade: editTargetGrade });
      Alert.alert('Framgång! ✅', 'Målbetyg har uppdaterats');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving target grade:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
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
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SlideInView direction="up" delay={100}>
          <View>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>💻</Text>
                <Text style={styles.heroTitle}>Grundläggande programmering</Text>
                <Text style={styles.heroSubtitle}>DD1331</Text>
                <Text style={styles.heroDescription}>
                  Introduktion till programmering med Python - 7.5 HP
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Kursframsteg</Text>
                  <Text style={styles.progressPercent}>{progress.manualProgress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${progress.manualProgress}%` }]} 
                  />
                </View>
                <View style={styles.progressControls}>
                  <TouchableOpacity
                    style={[styles.progressButton, progress.manualProgress <= 0 && styles.progressButtonDisabled]}
                    onPress={() => handleAdjustProgress(-10)}
                    disabled={progress.manualProgress <= 0}
                  >
                    <Minus size={16} color="white" strokeWidth={3} />
                    <Text style={styles.progressButtonText}>10%</Text>
                  </TouchableOpacity>
                  <Text style={styles.progressText}>
                    {progress.completedModules.length} av {modulesData.length} moduler slutförda
                  </Text>
                  <TouchableOpacity
                    style={[styles.progressButton, progress.manualProgress >= 100 && styles.progressButtonDisabled]}
                    onPress={() => handleAdjustProgress(10)}
                    disabled={progress.manualProgress >= 100}
                  >
                    <Plus size={16} color="white" strokeWidth={3} />
                    <Text style={styles.progressButtonText}>10%</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.quickStatText}>
                    {progress.manualProgress}% klar
                  </Text>
                </View>
                {progress.completedModules.length > 0 && (
                  <View style={styles.quickStatItem}>
                    <CheckCircle size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>
                      {progress.completedModules.length} slutförda
                    </Text>
                  </View>
                )}
                {progress.targetGrade && (
                  <View style={styles.quickStatItem}>
                    <Award size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>
                      Mål: {progress.targetGrade}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
              onPress={() => setShowEditModal(true)}
            >
              <Edit3 size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity
            style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/flashcards/DD1331' as any)}
            activeOpacity={0.7}
          >
            <Sparkles size={24} color="#10B981" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>
              Öva med Flashcards
            </Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              DD1331 Grundläggande programmering introducerar dig till programmeringens värld genom Python. 
              Kursen täcker grundläggande koncept som variabler, kontrollstrukturer, funktioner, datastrukturer och objektorienterad programmering. 
              Detta är grunden för alla fortsatta studier inom datavetenskap och teknik.
            </Text>
            
            <View style={styles.courseGoals}>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>🎯</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Lära dig grunderna i Python-programmering
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>💡</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Förstå algoritmer och problemlösning
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Bygga egna program och applikationer
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          
          {modulesData.map((module, index) => {
            const isCompleted = progress.completedModules.includes(module.id);
            
            return (
              <FadeInView key={module.id} delay={300 + index * 100}>
                <TouchableOpacity
                  style={[
                    styles.moduleCard, 
                    { backgroundColor: theme.colors.card },
                    isCompleted && styles.moduleCardCompleted
                  ]}
                  onPress={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.moduleHeader}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleModule(module.id);
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : (
                        <Circle size={24} color={theme.colors.textMuted} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                    <View style={styles.moduleTitleContainer}>
                      <Text style={[
                        styles.moduleTitle, 
                        { color: theme.colors.text },
                        isCompleted && { color: '#10B981' }
                      ]}>
                        Modul {module.id}: {module.title}
                      </Text>
                      <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                        {module.description}
                      </Text>
                    </View>
                  </View>

                  {expandedModule === module.id && (
                    <View style={styles.moduleContent}>
                      {module.sections.map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.sectionCard}>
                          <View style={styles.sectionHeader}>
                            <BookOpen size={20} color="#10B981" />
                            <Text style={[styles.sectionTitle2, { color: theme.colors.text }]}>
                              {section.title}
                            </Text>
                          </View>
                          <Text style={[styles.sectionContent, { color: theme.colors.textSecondary }]}>
                            {section.content}
                          </Text>
                          
                          <View style={styles.keyPointsContainer}>
                            <Text style={[styles.keyPointsTitle, { color: theme.colors.text }]}>
                              Viktiga punkter:
                            </Text>
                            {section.keyPoints.map((point, pointIndex) => (
                              <View key={pointIndex} style={styles.keyPointItem}>
                                <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
                                <Text style={[styles.keyPointText, { color: theme.colors.textSecondary }]}>
                                  {point}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}

                      <View style={[styles.examplesSection, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.examplesHeader}>
                          <Target size={20} color="#22C55E" />
                          <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
                            Exempel på tillämpningar
                          </Text>
                        </View>
                        {module.examples.map((example, exampleIndex) => (
                          <View key={exampleIndex} style={styles.exampleItem}>
                            <CheckCircle size={16} color="#22C55E" />
                            <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                              {example}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={[styles.reflectionSection, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.reflectionHeader}>
                          <Lightbulb size={20} color="#F59E0B" />
                          <Text style={[styles.reflectionTitle, { color: theme.colors.text }]}>
                            Reflektionsfrågor
                          </Text>
                        </View>
                        {module.reflectionQuestions.map((question, questionIndex) => (
                          <View key={questionIndex} style={styles.questionItem}>
                            <Text style={[styles.questionNumber, { color: '#F59E0B' }]}>
                              {questionIndex + 1}.
                            </Text>
                            <Text style={[styles.questionText, { color: theme.colors.textSecondary }]}>
                              {question}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </FadeInView>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera målbetyg</Text>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <CloseIcon size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Målbetyg</Text>
                  <View style={styles.gradeButtons}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.gradeButton,
                          { borderColor: theme.colors.border },
                          editTargetGrade === grade && {
                            backgroundColor: '#10B981',
                            borderColor: '#10B981'
                          }
                        ]}
                        onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}
                      >
                        <Text
                          style={[
                            styles.gradeButtonText,
                            { color: theme.colors.text },
                            editTargetGrade === grade && { color: 'white' }
                          ]}
                        >
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#10B981' }]}
                  onPress={handleSaveTargetGrade}
                >
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Spara</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  scrollContent: { paddingBottom: 100 },
  heroCard: { marginHorizontal: 24, borderRadius: 24, padding: 32, marginBottom: 24 },
  heroContent: { alignItems: 'center' },
  heroIcon: { fontSize: 64, marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '700' as const, color: 'white', textAlign: 'center', marginBottom: 4 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginBottom: 8 },
  heroDescription: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24 },
  introSection: { marginHorizontal: 24, marginBottom: 24, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  introTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },
  introText: { fontSize: 16, lineHeight: 24 },
  modulesSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 16 },
  moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxContainer: { padding: 4 },
  moduleCardCompleted: { borderColor: '#10B981', borderWidth: 2, borderLeftWidth: 4 },
  moduleEmoji: { fontSize: 40 },
  moduleTitleContainer: { flex: 1 },
  moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  moduleDescription: { fontSize: 14, lineHeight: 20 },
  moduleContent: { marginTop: 20, gap: 16 },
  progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginTop: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' as const },
  progressPercent: { fontSize: 18, color: 'white', fontWeight: 'bold' as const },
  progressBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 },
  progressText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', flex: 1, textAlign: 'center' },
  progressControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  progressButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 70, alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'center' },
  progressButtonDisabled: { opacity: 0.3 },
  progressButtonText: { color: 'white', fontSize: 13, fontWeight: '700' as const },
  quickStats: { flexDirection: 'row', gap: 16, marginTop: 12, flexWrap: 'wrap' },
  quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickStatText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' as const },
  editButton: { position: 'absolute', top: 20, right: 44, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxWidth: 400 },
  modalContent: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' as const, flex: 1 },
  modalCloseButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600' as const, marginBottom: 8 },
  gradeButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  gradeButton: { flex: 1, minWidth: 50, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  gradeButtonText: { fontSize: 16, fontWeight: 'bold' as const },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelButton: { borderWidth: 2 },
  modalSaveButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  modalButtonText: { fontSize: 16, fontWeight: '600' as const },
  flashcardsButton: { marginHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  flashcardsButtonText: { fontSize: 16, fontWeight: '700' as const },
  courseGoals: { gap: 12, marginTop: 20 },
  goalItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalText: { fontSize: 15, flex: 1, lineHeight: 22 },
  sectionCard: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(16, 185, 129, 0.1)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle2: { fontSize: 16, fontWeight: '600' as const },
  sectionContent: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  keyPointsContainer: { marginTop: 8 },
  keyPointsTitle: { fontSize: 15, fontWeight: '600' as const, marginBottom: 8 },
  keyPointItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  keyPointText: { fontSize: 14, lineHeight: 20, flex: 1 },
  examplesSection: { borderRadius: 12, padding: 16, marginTop: 8 },
  examplesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  examplesTitle: { fontSize: 16, fontWeight: '600' as const },
  exampleItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  exampleText: { fontSize: 14, lineHeight: 20, flex: 1 },
  reflectionSection: { borderRadius: 12, padding: 16, marginTop: 8 },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  reflectionTitle: { fontSize: 16, fontWeight: '600' as const },
  questionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  questionNumber: { fontSize: 15, fontWeight: '700' as const, minWidth: 20 },
  questionText: { fontSize: 14, lineHeight: 20, flex: 1 },
});
