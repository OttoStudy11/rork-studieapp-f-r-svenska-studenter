import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,

} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
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
  Brain,
  Leaf,
  Globe2,
  Microscope
} from 'lucide-react-native';
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
    title: 'Ekologi och ekosystem',
    description: 'Förstå samspelet mellan organismer och deras miljö',
    emoji: '🌲',
    sections: [
      {
        title: 'Ekosystemets delar',
        content: 'Ett ekosystem består av alla levande organismer (biotiska faktorer) och deras livlösa omgivning (abiotiska faktorer) i ett område. Organismerna samverkar med varandra och med sin miljö genom energiflöden och kretslopp.',
        keyPoints: [
          'Biotiska faktorer: växter, djur, mikroorganismer',
          'Abiotiska faktorer: ljus, temperatur, vatten, mineraler',
          'Producenter: organismer som kan fotosyntetisera',
          'Konsumenter: organismer som äter andra organismer',
          'Nedbrytare: organismer som bryter ner dött material',
          'Näringskedjor och näringsvävar visar energiflöden'
        ]
      },
      {
        title: 'Kretslopp i naturen',
        content: 'Grundämnen och föreningar cirkulerar mellan levande organismer och den livlösa miljön i biogeokemiska kretslopp. De viktigaste kretsl oppen för livet är vatten-, kol-, kväve- och fosforkretsloppet.',
        keyPoints: [
          'Vattenkretsloppet: avdunstning, kondensation, nederbörd',
          'Kolkretsloppet: fotosyntes, respiration, förbränning',
          'Kvävekretsloppet: kvävefixering, nitrifikation, denitrifikation',
          'Fosforkretsloppet: vittring, upptag, nedbrytning',
          'Människans påverkan på kretsloppen',
          'Övergödning och dess konsekvenser'
        ]
      },
      {
        title: 'Populationer och samhällen',
        content: 'En population är alla individer av samma art på en plats. Ett samhälle är alla populationer som lever tillsammans. Populationer påverkas av födotillgång, konkurrens, predation och andra faktorer.',
        keyPoints: [
          'Populationstillväxt och bärförmåga',
          'Inomartskoncurrens och mellanartskoncurrens',
          'Predator-bytesrelationer',
          'Symbios: mutualism, kommensalism, parasitism',
          'Succession: hur ekosystem förändras över tid',
          'Biologisk mångfald och artrikedom'
        ]
      }
    ],
    examples: [
      'Undersöka näringskedjor i en sjö eller skog',
      'Studera en kompost och identifiera nedbrytare',
      'Kartlägga kretsloppet av kol från atmosfär till organism',
      'Observera konkurrens mellan växter i ett fält'
    ],
    reflectionQuestions: [
      'Varför är nedbrytare så viktiga för ekosystemet?',
      'Hur påverkar människan naturliga kretslopp?',
      'Vad händer när en art försvinner från ett ekosystem?',
      'Hur kan vi skydda biologisk mångfald?'
    ]
  },
  {
    id: 2,
    title: 'Hållbar utveckling och miljöfrågor',
    description: 'Utforska miljöproblem och vägar till hållbarhet',
    emoji: '♻️',
    sections: [
      {
        title: 'Klimatförändringar',
        content: 'Jordens klimat förändras på grund av ökade utsläpp av växthusgaser, främst koldioxid från förbränning av fossila bränslen. Detta leder till global uppvärmning med allvarliga konsekvenser för ekosystem och samhällen.',
        keyPoints: [
          'Växthuseffekten: naturlig och förstärkt',
          'Växthusgaser: koldioxid, metan, lustgas',
          'Konsekvenser: stigande havsnivåer, extremväder, artutrotning',
          'IPCC:s klimatrapporter och scenarier',
          'Åtgärder: minska utsläpp, anpassa samhällen',
          'Parisavtalet och klimatmål'
        ]
      },
      {
        title: 'Biologisk mångfald och artutrotning',
        content: 'Vi befinner oss i en massutrotning där arter försvinner i en alarmerande takt, främst på grund av mänsklig aktivitet. Biologisk mångfald är avgörande för ekosystemens funktion och vår egen överlevnad.',
        keyPoints: [
          'Orsaker: habitatförlust, överexploatering, invasiva arter, föroreningar',
          'Hotade arter och rödlistor',
          'Ekosystemtjänster: pollinering, vattenrening, klimatreglering',
          'Skyddade områden och naturreservat',
          'Bevarandestrategier och artskydd',
          'Konventionen om biologisk mångfald'
        ]
      },
      {
        title: 'Hållbar resursanvändning',
        content: 'För att möta nuvarande och framtida generationers behov måste vi använda naturresurser på ett hållbart sätt. Detta innebär att balansera ekonomisk utveckling, social välfärd och miljöhänsyn.',
        keyPoints: [
          'Förnybara och icke-förnybara resurser',
          'Cirkulär ekonomi: minska, återanvända, återvinna',
          'Hållbart jordbruk och fiske',
          'Förnybar energi: sol, vind, vatten, biomassa',
          'Ekologiskt fotavtryck och resursförbrukning',
          'Agenda 2030 och de globala målen'
        ]
      }
    ],
    examples: [
      'Beräkna ditt eget ekologiska fotavtryck',
      'Undersöka lokala miljöproblem och lösningar',
      'Jämföra olika energikällors miljöpåverkan',
      'Designa en hållbar stad eller samhälle'
    ],
    reflectionQuestions: [
      'Vilka livsstilsval kan minska klimatpåverkan?',
      'Hur påverkar konsumtion biologisk mångfald?',
      'Vad innebär hållbar utveckling i praktiken?',
      'Vilken roll har teknologi i miljölösningar?'
    ]
  },
  {
    id: 3,
    title: 'Naturvetenskaplig metod och granskning',
    description: 'Lär dig arbeta vetenskapligt och värdera information',
    emoji: '🔬',
    sections: [
      {
        title: 'Vetenskapligt arbetssätt',
        content: 'Naturvetenskap bygger på systematisk observation, experiment och analys. Den vetenskapliga metoden hjälper oss att förstå naturen och testa hypoteser på ett objektivt sätt.',
        keyPoints: [
          'Observationer och frågeställningar',
          'Hypoteser och förutsägelser',
          'Planering och genomförande av experiment',
          'Variabler: oberoende, beroende, kontrollerade',
          'Dokumentation och dataanalys',
          'Slutsatser och vetenskaplig kommunikation'
        ]
      },
      {
        title: 'Källkritik och informationsgranskning',
        content: 'I informationssamhället är det viktigt att kunna bedöma trovärdighet och kvalitet hos naturvetenskaplig information. Källkritik hjälper oss skilja vetenskap från pseudovetenskap.',
        keyPoints: [
          'Primärkällor vs sekundärkällor',
          'Peer review och vetenskaplig publicering',
          'Källans syfte, aktualitet och ursprung',
          'Vetenskaplig konsensus och oenighet',
          'Pseudovetenskap: varningssignaler',
          'Medias rapportering av vetenskap'
        ]
      },
      {
        title: 'Etik i naturvetenskap',
        content: 'Naturvetenskaplig forskning och tillämpning väcker etiska frågor om ansvar, rättvisa och konsekvenser. Vetenskaplig kunskap måste användas ansvarsfullt.',
        keyPoints: [
          'Etiska principer i forskning',
          'Djurförsök och djurskydd',
          'Genteknik och GMO: möjligheter och risker',
          'Miljöetik och framtida generationer',
          'Forskarens ansvar och forskningsfusk',
          'Samhällets värderingar och vetenskaplig utveckling'
        ]
      }
    ],
    examples: [
      'Planera och genomföra ett eget experiment',
      'Granska en vetenskaplig artikel eller nyhet',
      'Diskutera ett aktuellt etiskt dilemma',
      'Jämföra vetenskapliga och pseudovetenskapliga påståenden'
    ],
    reflectionQuestions: [
      'Hur skiljer sig vetenskap från andra kunskapskällor?',
      'Varför är oberoende granskning viktig?',
      'När bör ny teknik användas och när inte?',
      'Hur balanserar man vetenskaplig utveckling och etik?'
    ]
  },
  {
    id: 4,
    title: 'Energi och energiomvandling',
    description: 'Förstå energins roll i naturen och samhället',
    emoji: '⚡',
    sections: [
      {
        title: 'Energiformer och omvandling',
        content: 'Energi kan inte skapas eller förstöras, bara omvandlas från en form till en annan. Alla processer i naturen och samhället involverar energiomvandlingar.',
        keyPoints: [
          'Energiformer: rörelse, lägesenergi, värme, ljus, kemisk, elektrisk',
          'Termodynamikens lagar',
          'Effektivitet och energiförluster',
          'Energiflöden i ekosystem',
          'Fotosyntes: från ljus till kemisk energi',
          'Respiration: från kemisk energi till användbar energi'
        ]
      },
      {
        title: 'Energikällor och energianvändning',
        content: 'Samhället är beroende av energi för transport, uppvärmning, industri och elektronik. Vårt val av energikällor påverkar miljö och klimat.',
        keyPoints: [
          'Fossila bränslen: kol, olja, naturgas',
          'Kärnkraft: fission och fusion',
          'Förnybar energi: sol, vind, vatten, biomassa',
          'Energieffektivisering och energibesparing',
          'Energisystem och infrastruktur',
          'Framtidens energiförsörjning'
        ]
      },
      {
        title: 'Energi och hållbarhet',
        content: 'Övergången till förnybara energikällor är avgörande för att bekämpa klimatförändringar och skapa ett hållbart samhälle. Detta kräver teknisk utveckling och samhällsförändringar.',
        keyPoints: [
          'Koldioxidneutralitet och netto-noll-utsläpp',
          'Sol- och vindkraft: potential och utmaningar',
          'Energilagring: batterier och vätgas',
          'Smart elnät och effektiv distribution',
          'Transportsektor ns elektrifiering',
          'Hushållens energianvändning'
        ]
      }
    ],
    examples: [
      'Beräkna energieffektivitet i olika processer',
      'Undersöka hemmets energianvändning',
      'Jämföra olika energikällors klimatpåverkan',
      'Designa ett energieffektivt hus'
    ],
    reflectionQuestions: [
      'Hur kan vi minska energianvändningen?',
      'Vilka är för- och nackdelar med olika energikällor?',
      'Vad krävs för en hållbar energiomställning?',
      'Hur påverkar energival framtida generationer?'
    ]
  }
];

const courseGoals = [
  { icon: Leaf, text: 'Förstå ekologiska samband och kretslopp' },
  { icon: Globe2, text: 'Analysera miljöproblem och hållbarhet' },
  { icon: Microscope, text: 'Tillämpa naturvetenskaplig metod' },
  { icon: Sparkles, text: 'Värdera naturvetenskaplig information' },
];

const studyTips = [
  { icon: BookOpen, text: 'Följ miljönyheter och klimatforskning' },
  { icon: Lightbulb, text: 'Koppla teori till verkligheten omkring dig' },
  { icon: Target, text: 'Delta i fältstudier och observationer' },
  { icon: Brain, text: 'Diskutera etiska dilemman och hållbarhet' },
];

export default function Naturkunskap1bScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>(modulesData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    progress: 0,
    targetGrade: 'C',
    completedModules: [],
  });
  const [tempProgress, setTempProgress] = useState('0');
  const [tempTargetGrade, setTempTargetGrade] = useState('C');

  const loadProgress = useCallback(async () => {
    if (!user?.id) return;
    try {
      const stored = await AsyncStorage.getItem(`course_naturkunskap1b_${user.id}`);
      if (stored) {
        const progress = JSON.parse(stored);
        setCourseProgress(progress);
        setTempProgress(progress.progress.toString());
        setTempTargetGrade(progress.targetGrade);
        
        const updatedModules = modulesData.map(mod => ({
          ...mod,
          completed: progress.completedModules.includes(mod.id)
        }));
        setModules(updatedModules);
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const saveProgress = async (newProgress: CourseProgress) => {
    if (!user?.id) return;
    try {
      await AsyncStorage.setItem(
        `course_naturkunskap1b_${user.id}`,
        JSON.stringify(newProgress)
      );
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

    const newProgress = {
      ...courseProgress,
      completedModules: newCompletedModules,
      progress: Math.round((newCompletedModules.length / modulesData.length) * 100),
    };

    saveProgress(newProgress);

    const updatedModules = modules.map(mod =>
      mod.id === moduleId ? { ...mod, completed: !isCompleted } : mod
    );
    setModules(updatedModules);
  };

  const handleSaveProgress = () => {
    const progressNum = parseInt(tempProgress) || 0;
    const clampedProgress = Math.max(0, Math.min(100, progressNum));

    const newProgress = {
      ...courseProgress,
      progress: clampedProgress,
      targetGrade: tempTargetGrade,
    };

    saveProgress(newProgress);
    setShowEditModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Naturkunskap 1b',
          headerStyle: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.header}>
          <FadeInView duration={600}>
            <View style={styles.headerContent}>
              <Text style={styles.headerEmoji}>🌿</Text>
              <Text style={styles.headerTitle}>Naturkunskap 1b</Text>
              <Text style={styles.headerSubtitle}>
                Utforska naturens samband och hållbar utveckling
              </Text>
            </View>
          </FadeInView>

          <SlideInView direction="up" delay={200} duration={600}>
            <View style={styles.statsContainer}>
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => {
                  setShowEditModal(true);
                }}
              >
                <TrendingUp size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{courseProgress.progress}%</Text>
                <Text style={styles.statLabel}>Framsteg</Text>
                <Edit3 size={16} color="#FFFFFF" style={styles.editIcon} />
              </TouchableOpacity>

              <View style={styles.statBox}>
                <Award size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{courseProgress.targetGrade}</Text>
                <Text style={styles.statLabel}>Målbetyg</Text>
              </View>

              <View style={styles.statBox}>
                <CheckCircle size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>
                  {courseProgress.completedModules.length}/{modulesData.length}
                </Text>
                <Text style={styles.statLabel}>Moduler</Text>
              </View>
            </View>
          </SlideInView>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📚 Kursmål
          </Text>
          <View style={styles.goalsContainer}>
            {courseGoals.map((goal, index) => (
              <SlideInView key={index} direction="left" delay={index * 100} duration={500}>
                <View style={[styles.goalItem, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <View style={[styles.goalIcon, { backgroundColor: '#22C55E20' }]}>
                    <goal.icon size={20} color="#22C55E" />
                  </View>
                  <Text style={[styles.goalText, { color: theme.colors.text }]}>{goal.text}</Text>
                </View>
              </SlideInView>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📖 Moduler
          </Text>
          {modules.map((module, index) => (
            <SlideInView key={module.id} direction="up" delay={index * 100} duration={500}>
              <View
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    borderColor: module.completed ? '#22C55E' : (isDark ? '#4B5563' : '#E5E7EB'),
                  },
                ]}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                    <View style={styles.moduleTitleContent}>
                      <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
                        {module.title}
                      </Text>
                      <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                        {module.description}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleModuleCompletion(module.id)}
                    style={styles.checkboxContainer}
                  >
                    {module.completed ? (
                      <CheckCircle size={28} color="#22C55E" />
                    ) : (
                      <Circle size={28} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                {module.sections.map((section, sIndex) => (
                  <View key={sIndex} style={styles.sectionContent}>
                    <Text style={[styles.sectionContentTitle, { color: theme.colors.text }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.sectionContentText, { color: theme.colors.textSecondary }]}>
                      {section.content}
                    </Text>
                    <View style={styles.keyPoints}>
                      {section.keyPoints.map((point, pIndex) => (
                        <View key={pIndex} style={styles.keyPointItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={[styles.keyPointText, { color: theme.colors.text }]}>
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {module.examples.length > 0 && (
                  <View style={styles.examples}>
                    <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
                      💡 Exempel
                    </Text>
                    {module.examples.map((example, eIndex) => (
                      <Text key={eIndex} style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                        • {example}
                      </Text>
                    ))}
                  </View>
                )}

                {module.reflectionQuestions.length > 0 && (
                  <View style={styles.reflection}>
                    <Text style={[styles.reflectionTitle, { color: theme.colors.text }]}>
                      🤔 Reflektionsfrågor
                    </Text>
                    {module.reflectionQuestions.map((question, qIndex) => (
                      <Text key={qIndex} style={[styles.reflectionText, { color: theme.colors.textSecondary }]}>
                        • {question}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </SlideInView>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💡 Studietips
          </Text>
          <View style={styles.tipsContainer}>
            {studyTips.map((tip, index) => (
              <SlideInView key={index} direction="right" delay={index * 100} duration={500}>
                <View style={[styles.tipItem, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <View style={[styles.tipIcon, { backgroundColor: '#22C55E20' }]}>
                    <tip.icon size={20} color="#22C55E" />
                  </View>
                  <Text style={[styles.tipText, { color: theme.colors.text }]}>{tip.text}</Text>
                </View>
              </SlideInView>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Redigera framsteg
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <CloseIcon size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Framsteg (%)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    color: theme.colors.text,
                  },
                ]}
                value={tempProgress}
                onChangeText={setTempProgress}
                keyboardType="number-pad"
                placeholder="0-100"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Målbetyg
              </Text>
              <View style={styles.gradeButtons}>
                {['E', 'D', 'C', 'B', 'A'].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      {
                        backgroundColor:
                          tempTargetGrade === grade
                            ? '#22C55E'
                            : isDark
                            ? '#374151'
                            : '#F3F4F6',
                      },
                    ]}
                    onPress={() => setTempTargetGrade(grade)}
                  >
                    <Text
                      style={[
                        styles.gradeButtonText,
                        {
                          color:
                            tempTargetGrade === grade
                              ? '#FFFFFF'
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProgress}
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Spara</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  editIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  moduleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  moduleEmoji: {
    fontSize: 32,
  },
  moduleTitleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
  },
  checkboxContainer: {
    padding: 4,
  },
  sectionContent: {
    marginBottom: 16,
  },
  sectionContentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContentText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  keyPoints: {
    gap: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '700',
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  examples: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  reflection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
