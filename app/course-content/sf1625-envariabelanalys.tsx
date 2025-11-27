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

const COURSE_ID = 'SF1625';

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Gränsvärden och Kontinuitet',
    description: 'Fundamentala koncept för analys av funktioner',
    emoji: '📈',
    sections: [
      {
        title: 'Gränsvärden',
        content: 'Gränsvärden är centrala i analysen och beskriver funktioners beteende när variabeln närmar sig ett visst värde.',
        keyPoints: [
          'Definition av gränsvärde',
          'Ensidiga gränsvärden',
          'Räkneregler för gränsvärden',
          'L\'Hôpitals regel',
          'Gränsvärden mot oändligheten',
          'Asymptotiskt beteende'
        ]
      },
      {
        title: 'Kontinuitet',
        content: 'En funktion är kontinuerlig om den inte har några hopp eller språng. Kontinuitet är grundläggande för differentialkalkyl.',
        keyPoints: [
          'Definition av kontinuitet',
          'Diskontinuitetspunkter',
          'Satsningar om kontinuerliga funktioner',
          'Satsen om mellanliggande värde',
          'Kontinuitet och gränsvärden'
        ]
      }
    ],
    examples: [
      'Beräkna gränsvärden med L\'Hôpitals regel',
      'Bestämma kontinuitetspunkter',
      'Hitta vertikala och horisontella asymptoter',
      'Använda gränsvärden för att analysera funktioner'
    ],
    reflectionQuestions: [
      'Varför är gränsvärden viktiga i matematiken?',
      'Vad är skillnaden mellan kontinuitet och deriverbarhet?',
      'När kan vi använda L\'Hôpitals regel?',
      'Hur hänger gränsvärden samman med asymptoter?'
    ]
  },
  {
    id: 2,
    title: 'Derivata och Differentiation',
    description: 'Analysera förändringshastighet och funktioners lutning',
    emoji: '📊',
    sections: [
      {
        title: 'Derivatans definition',
        content: 'Derivatan mäter hur snabbt en funktion förändras och är fundamentalt för att förstå rörelse, optimering och många tekniska problem.',
        keyPoints: [
          'Derivatans definition som gränsvärde',
          'Geometrisk tolkning (tangentlutning)',
          'Fysikalisk tolkning (hastighet)',
          'Deriverbarhet och kontinuitet',
          'Derivata från höger och vänster'
        ]
      },
      {
        title: 'Deriveringsregler',
        content: 'Systematiska metoder för att beräkna derivator av komplexa funktioner.',
        keyPoints: [
          'Potensregel, produkt- och kvotregel',
          'Kedjeregeln',
          'Derivata av elementära funktioner',
          'Implicit derivering',
          'Logaritmisk derivering',
          'Högre ordningens derivator'
        ]
      },
      {
        title: 'Tillämpningar',
        content: 'Derivatan används för att lösa praktiska problem inom optimering, rörelse och approximationer.',
        keyPoints: [
          'Extremvärdesproblem',
          'Kurvskissning',
          'Konvexitet och konkavitet',
          'Newtons metod',
          'Linjär approximation',
          'Differentier'
        ]
      }
    ],
    examples: [
      'Hitta maximi- och minimipunkter',
      'Optimera volymer och ytor',
      'Skissa grafer med hjälp av derivatan',
      'Använd Newtons metod för att lösa ekvationer'
    ],
    reflectionQuestions: [
      'Vad betyder det geometriskt när derivatan är noll?',
      'Hur kan derivatan användas i praktiska problem?',
      'Varför är kedjeregeln så viktig?',
      'Vad är sambandet mellan första och andra derivatan?'
    ]
  },
  {
    id: 3,
    title: 'Integraler och Integration',
    description: 'Beräkna areor, volymer och ackumulerade storheter',
    emoji: '∫',
    sections: [
      {
        title: 'Riemannintegralen',
        content: 'Integralen definieras som gränsvärdet av Riemannsummor och mäter areor under kurvor.',
        keyPoints: [
          'Riemannsummor',
          'Bestämd integral',
          'Analysens fundamentalsats',
          'Primitiv funktion',
          'Obestämd integral',
          'Integrabilitet'
        ]
      },
      {
        title: 'Integrationstekniker',
        content: 'Metoder för att beräkna integraler av komplexa funktioner.',
        keyPoints: [
          'Partiell integration',
          'Variabelbyte',
          'Partialbråksuppdelning',
          'Trigonometriska substitutioner',
          'Integration av rationella funktioner',
          'Numerisk integration'
        ]
      },
      {
        title: 'Tillämpningar',
        content: 'Integraler används för att beräkna areor, volymer, längder och många andra storheter.',
        keyPoints: [
          'Area mellan kurvor',
          'Volym av rotationskroppar',
          'Båglängd',
          'Rotationsytor',
          'Medelvärdessatsen',
          'Fysikaliska tillämpningar (arbete, massa, tyngdpunkt)'
        ]
      }
    ],
    examples: [
      'Beräkna area under en kurva',
      'Hitta volymen av en rotationskropp',
      'Använd partiell integration',
      'Beräkna arbete med hjälp av integraler'
    ],
    reflectionQuestions: [
      'Vad är sambandet mellan derivering och integration?',
      'Varför är analysens fundamentalsats så viktig?',
      'När använder man partiell integration?',
      'Hur kan integraler tolkas fysikaliskt?'
    ]
  },
  {
    id: 4,
    title: 'Differentialekvationer',
    description: 'Lösa ekvationer som beskriver dynamiska system',
    emoji: '🔄',
    sections: [
      {
        title: 'Första ordningens differentialekvationer',
        content: 'Differentialekvationer beskriver hur storheter förändras över tid och är centrala i alla naturvetenskaper.',
        keyPoints: [
          'Separabla differentialekvationer',
          'Linjära första ordningens ekvationer',
          'Exakta differentialekvationer',
          'Homogena ekvationer',
          'Riktningsfält',
          'Existens och entydighet'
        ]
      },
      {
        title: 'Andra ordningens linjära ekvationer',
        content: 'Dessa ekvationer beskriver oscillationer, vågrörelser och många andra fysikaliska fenomen.',
        keyPoints: [
          'Homogena ekvationer med konstanta koefficienter',
          'Karakteristiska ekvationen',
          'Inhomogena ekvationer',
          'Partikulärlösningar',
          'Variabla koefficienter',
          'Fysikaliska tillämpningar'
        ]
      }
    ],
    examples: [
      'Lösa exponentiell tillväxt och avtagande',
      'Modellera temperaturer och koncentrationer',
      'Analysera mekaniska oscillationer',
      'Lösa differentialekvationer numeriskt'
    ],
    reflectionQuestions: [
      'Varför är differentialekvationer så viktiga i naturvetenskapen?',
      'Vad betyder det att en lösning är entydig?',
      'Hur kan man visualisera lösningar med riktningsfält?',
      'Vilka typer av problem leder till differentialekvationer?'
    ]
  },
  {
    id: 5,
    title: 'Serier och Taylorutveckling',
    description: 'Approximera funktioner med polynom',
    emoji: '∞',
    sections: [
      {
        title: 'Talföljder och serier',
        content: 'Serier är summor av oändligt många termer och används för att representera funktioner.',
        keyPoints: [
          'Konvergens och divergens',
          'Geometriska serier',
          'Konvergenstester',
          'Absolutkonvergens',
          'Alternerande serier',
          'Teleskopserier'
        ]
      },
      {
        title: 'Potensserier och Taylorutveckling',
        content: 'Taylorserier ger exakta polynomapproximationer av funktioner.',
        keyPoints: [
          'Potensserier och konvergensradie',
          'Taylorpolynom',
          'Maclaurinserier',
          'Resttermen och feluppskattning',
          'Tillämpningar av Taylorserier',
          'Utveckling av elementära funktioner'
        ]
      }
    ],
    examples: [
      'Testa konvergens av serier',
      'Utveckla funktioner i Taylorserie',
      'Approximera funktioner numeriskt',
      'Uppskatta fel i approximationer'
    ],
    reflectionQuestions: [
      'När konvergerar en serie?',
      'Vad är skillnaden mellan Taylorpolynom och Taylorserie?',
      'Hur kan Taylorserier användas för beräkningar?',
      'Varför är konvergensradien viktig?'
    ]
  }
];

export default function SF1625() {
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
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📈</Text>
                <Text style={styles.heroTitle}>Envariabelanalys</Text>
                <Text style={styles.heroSubtitle}>SF1625</Text>
                <Text style={styles.heroDescription}>
                  Grundläggande envariabelanalys för ingenjörer - 7.5 HP
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
              <Edit3 size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity
            style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/flashcards/SF1625' as any)}
            activeOpacity={0.7}
          >
            <Sparkles size={24} color="#8B5CF6" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>
              Öva med Flashcards
            </Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              SF1625 Envariabelanalys är en grundläggande kurs i matematisk analys. 
              Kursen behandlar gränsvärden, derivator, integraler, differentialekvationer och serier. 
              Detta är fundamentala verktyg för ingenjörer och används i allt från optimering till modellering av fysikaliska system.
            </Text>
            
            <View style={styles.courseGoals}>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>🎯</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Behärska derivator och integraler
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>📐</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Lösa differentialekvationer
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Tillämpa analys i tekniska problem
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
                        <CheckCircle size={24} color="#8B5CF6" />
                      ) : (
                        <Circle size={24} color={theme.colors.textMuted} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                    <View style={styles.moduleTitleContainer}>
                      <Text style={[
                        styles.moduleTitle, 
                        { color: theme.colors.text },
                        isCompleted && { color: '#8B5CF6' }
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
                            <BookOpen size={20} color="#8B5CF6" />
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
                                <View style={[styles.bullet, { backgroundColor: '#8B5CF6' }]} />
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
                            backgroundColor: '#8B5CF6',
                            borderColor: '#8B5CF6'
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
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#8B5CF6' }]}
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
    fontWeight: '700' as const,
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  introSection: {
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
  introTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modulesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxContainer: {
    padding: 4,
  },
  moduleCardCompleted: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  moduleEmoji: {
    fontSize: 40,
  },
  moduleTitleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  moduleContent: {
    marginTop: 20,
    gap: 16,
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500' as const,
  },
  progressPercent: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    textAlign: 'center',
  },
  progressControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  progressButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  progressButtonDisabled: {
    opacity: 0.3,
  },
  progressButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gradeButton: {
    flex: 1,
    minWidth: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    borderWidth: 2,
  },
  modalSaveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  flashcardsButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flashcardsButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  courseGoals: {
    gap: 12,
    marginTop: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  sectionCard: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle2: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  keyPointsContainer: {
    marginTop: 8,
  },
  keyPointsTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  keyPointText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  examplesSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  reflectionSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '700' as const,
    minWidth: 20,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
