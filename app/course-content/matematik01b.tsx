import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, BookOpen, CheckCircle, Circle, X as CloseIcon, TrendingUp, Sparkles, Lightbulb, Target } from 'lucide-react-native';
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

interface CourseProgress {
  progress: number;
  targetGrade: string;
  completedModules: number[];
}

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Algebra och ekvationer',
    description: 'Lär dig lösa ekvationer och system av ekvationer',
    emoji: '🔢',
    sections: [
      {
        title: 'Ekvationssystem',
        content: 'Lös system av ekvationer med flera variabler genom substitutions- och additionsmetoden.',
        keyPoints: [
          'Substitutionsmetoden',
          'Additionsmetoden',
          'Grafisk lösning',
          'Antal lösningar: en, ingen eller oändligt många',
          'Tillämpningar av ekvationssystem',
          'Praktiska problem'
        ]
      },
      {
        title: 'Andragradsekvationer',
        content: 'Lös kvadratiska ekvationer med olika metoder.',
        keyPoints: [
          'Faktorisering',
          'Kvadratkomplettering',
          'pq-formeln',
          'Grafisk tolkning',
          'Antal lösningar och diskriminanten',
          'Tillämpningar'
        ]
      }
    ],
    examples: [
      'Lösa x + y = 5 och 2x - y = 1',
      'Faktorisera x² - 5x + 6 = 0',
      'Använda pq-formeln på x² + 4x + 3 = 0',
      'Problemlösning med kvadratiska ekvationer'
    ],
    reflectionQuestions: [
      'Vilken metod passar bäst för olika ekvationssystem?',
      'När använder man pq-formeln?',
      'Vad betyder diskriminanten?',
      'Hur kan man kontrollera sina lösningar?'
    ]
  },
  {
    id: 2,
    title: 'Funktioner',
    description: 'Förstå och arbeta med olika typer av funktioner',
    emoji: '📈',
    sections: [
      {
        title: 'Linjära funktioner',
        content: 'Lär dig om räta linjens ekvation och hur man arbetar med linjära funktioner.',
        keyPoints: [
          'y = kx + m',
          'Riktningskoefficient och skärningspunkt',
          'Rita grafer från ekvationer',
          'Ta fram ekvation från graf',
          'Parallella och vinkelräta linjer',
          'Tillämpningar'
        ]
      },
      {
        title: 'Andragradsfunktioner',
        content: 'Utforska parablens egenskaper och kvadratiska funktioner.',
        keyPoints: [
          'y = ax² + bx + c',
          'Symmetrilinje och vertex',
          'Nollställen',
          'Rita parabelgrafer',
          'Max- och minimipunkter',
          'Tillämpningar i verkligheten'
        ]
      }
    ],
    examples: [
      'Rita y = 2x + 3',
      'Bestäm ekvationen för en linje genom två punkter',
      'Hitta vertex för y = x² - 4x + 3',
      'Modellera kastbana med andragradsfunktion'
    ],
    reflectionQuestions: [
      'Hur påverkar k och m grafens utseende?',
      'Vad betyder vertex för en parabelfunktion?',
      'När används funktioner i vardagen?',
      'Hur kan man se samband mellan ekvation och graf?'
    ]
  },
  {
    id: 3,
    title: 'Geometri',
    description: 'Räkna med geometriska figurer och satser',
    emoji: '📐',
    sections: [
      {
        title: 'Geometriska figurer',
        content: 'Lär dig beräkna area, omkrets och volym för olika geometriska former.',
        keyPoints: [
          'Trianglar, rektanglar och cirklar',
          'Pythagoras sats',
          'Area- och omkrettsberäkning',
          'Volym av prisma och cylinder',
          'Likformighet',
          'Skalfaktor'
        ]
      },
      {
        title: 'Trigonometri',
        content: 'Grundläggande trigonometri i rätvinkliga trianglar.',
        keyPoints: [
          'Sinus, cosinus och tangens',
          'Räkna ut sidor och vinklar',
          'Trigonometriska samband',
          'Tillämpningar',
          'Enhets cirkeln (intro)',
          'Praktiska problem'
        ]
      }
    ],
    examples: [
      'Använd Pythagoras sats för att beräkna hypotenusan',
      'Beräkna volymen av en cylinder',
      'Använd sin, cos och tan för att lösa triangelproblem',
      'Beräkna höjden på ett träd med trigonometri'
    ],
    reflectionQuestions: [
      'När är Pythagoras sats användbar?',
      'Hur används trigonometri i praktiken?',
      'Vad är skillnaden mellan area och volym?',
      'Hur kan man kontrollera sina geometriska beräkningar?'
    ]
  },
  {
    id: 4,
    title: 'Statistik och sannolikhet',
    description: 'Analysera data och beräkna sannolikheter',
    emoji: '📊',
    sections: [
      {
        title: 'Statistik',
        content: 'Lär dig samla in, presentera och analysera statistiska data.',
        keyPoints: [
          'Medelvärde, median och typvärde',
          'Spridningsmått',
          'Diagram: stapel-, cirkel- och linjediagram',
          'Tolka statistik',
          'Kritiskt granska statistik',
          'Missvisande statistik'
        ]
      },
      {
        title: 'Sannolikhet',
        content: 'Beräkna sannolikheter för olika händelser.',
        keyPoints: [
          'Sannolikhetsbegreppet',
          'Teoretisk och empirisk sannolikhet',
          'Oberoende händelser',
          'Komplementhändelse',
          'Träd diagram',
          'Praktiska tillämpningar'
        ]
      }
    ],
    examples: [
      'Beräkna medelvärde och median för en dataserie',
      'Rita ett cirkeldiagram',
      'Beräkna sannolikheten att slå 6 på en tärning',
      'Analysera statistik från en undersökning'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan medelvärde och median?',
      'Hur kan statistik vara missvisande?',
      'När används sannolikhet i vardagen?',
      'Hur påverkar urvalsstorlek resultatet?'
    ]
  }
];

export default function Matematik1bCourse() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    progress: 0,
    targetGrade: 'E',
    completedModules: []
  });
  const [targetGradeModalVisible, setTargetGradeModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('E');

  const storageKey = `matematik1b_progress_${user?.id || 'guest'}`;

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setCourseProgress(JSON.parse(stored));
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

  const gradientColors = ['#3B82F6', '#2563EB'] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.courseTitle}>📐 Matematik 1b</Text>
            <Text style={styles.courseSubtitle}>100 poäng • Gymnasiegemensam</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={100}>
          <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
            <View style={styles.heroBadge}>
              <Sparkles size={16} color="#3B82F6" />
              <Text style={[styles.heroBadgeText, { color: '#3B82F6' }]}>HÖGSKOLEFÖRBEREDANDE</Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Matematik för högskoleförberedande program</Text>
            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
              Fördjupa dina kunskaper i algebra, funktioner, geometri och sannolikhet. Kursen ger en solid grund för vidare studier.
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <BookOpen size={20} color="#3B82F6" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Moduler</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{modulesData.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={20} color="#3B82F6" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Målbetyg</Text>
                <TouchableOpacity onPress={() => {
                  setSelectedGrade(courseProgress.targetGrade);
                  setTargetGradeModalVisible(true);
                }}>
                  <Text style={[styles.statValue, { color: '#3B82F6' }]}>{courseProgress.targetGrade}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={20} color="#3B82F6" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Framsteg</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(courseProgress.progress)}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { width: `${courseProgress.progress}%`, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kursinnehåll</Text>
          
          {modulesData.map((module, index) => {
            const isCompleted = courseProgress.completedModules.includes(module.id);
            const isExpanded = expandedModule === module.id;
            
            return (
              <SlideInView key={module.id} delay={index * 100}>
                <View style={[styles.moduleCard, { backgroundColor: colors.card }]}>
                  <TouchableOpacity
                    onPress={() => setExpandedModule(isExpanded ? null : module.id)}
                    style={styles.moduleHeader}
                  >
                    <View style={styles.moduleIcon}>
                      <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
                      <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>
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
                        <CheckCircle size={24} color="#3B82F6" />
                      ) : (
                        <Circle size={24} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.moduleContent}>
                      {module.sections.map((section, idx) => (
                        <View key={idx} style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <Lightbulb size={18} color="#3B82F6" />
                            <Text style={[styles.sectionTitleText, { color: colors.text }]}>{section.title}</Text>
                          </View>
                          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                            {section.content}
                          </Text>
                          <View style={styles.keyPoints}>
                            {section.keyPoints.map((point, pidx) => (
                              <View key={pidx} style={styles.keyPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>{point}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}

                      <View style={styles.examplesSection}>
                        <Text style={[styles.examplesTitle, { color: colors.text }]}>📝 Praktiska övningar</Text>
                        {module.examples.map((example, idx) => (
                          <Text key={idx} style={[styles.example, { color: colors.textSecondary }]}>
                            • {example}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.reflectionSection}>
                        <Text style={[styles.reflectionTitle, { color: colors.text }]}>💭 Reflektionsfrågor</Text>
                        {module.reflectionQuestions.map((question, idx) => (
                          <Text key={idx} style={[styles.reflectionQuestion, { color: colors.textSecondary }]}>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Välj målbetyg</Text>
              <TouchableOpacity onPress={() => setTargetGradeModalVisible(false)}>
                <CloseIcon size={24} color={colors.textSecondary} />
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
                    { borderColor: colors.border }
                  ]}
                >
                  <Text style={[
                    styles.gradeText,
                    { color: selectedGrade === grade ? '#FFF' : colors.text }
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={updateTargetGrade}
              style={[styles.saveButton, { backgroundColor: '#3B82F6' }]}
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    color: '#3B82F6',
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
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
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
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
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
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
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
