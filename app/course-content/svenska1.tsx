import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Circle,
  Edit3,
  X as CloseIcon,
  Award,
  TrendingUp,
  Sparkles,
  Target,
  Lightbulb
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
    title: 'Läsförståelse och textanalys',
    description: 'Utveckla din förmåga att läsa och förstå olika texttyper',
    emoji: '📖',
    sections: [
      {
        title: 'Läsning av olika texttyper',
        content: 'Att kunna läsa och förstå olika typer av texter är grundläggande för framgång i både studier och arbetsliv. Olika texttyper kräver olika lässtrategier.',
        keyPoints: [
          'Skönlitteratur: romaner, noveller, dikter',
          'Sakprosa: artiklar, rapporter, faktatexter',
          'Digitala texter: webbsidor, bloggar, sociala medier',
          'Multimodala texter: text kombinerad med bild och ljud',
          'Läsning med olika syften: studier, nöje, information',
          'Anpassa läshastighet efter texttyp och syfte'
        ]
      },
      {
        title: 'Textanalys',
        content: 'Att analysera texter handlar om att förstå hur texten är uppbyggd, vad författaren vill säga och vilka verkningsmedel som används.',
        keyPoints: [
          'Tema och budskap i texten',
          'Berättarperspektiv och berättarteknik',
          'Språkliga verkningsmedel: metaforer, symboler',
          'Textens struktur och uppbyggnad',
          'Kontext: tid, plats, författarbakgrund',
          'Tolkning och argumentation'
        ]
      },
      {
        title: 'Källkritik och faktakontroll',
        content: 'I dagens informationssamhälle är det viktigt att kunna värdera och kritiskt granska information från olika källor.',
        keyPoints: [
          'Källkritiska frågor: äkthet, tid, tendens',
          'Skilja på fakta och åsikter',
          'Identifiera vinklade och osanna påståenden',
          'Värdera olika källors tillförlitlighet',
          'Faktakontroll av nyheter och information',
          'Medvetenhet om egen förförståelse'
        ]
      }
    ],
    examples: [
      'Analysera en skönlitterär text med fokus på tema',
      'Jämför hur samma händelse beskrivs i olika medier',
      'Öva källkritik genom att granska artiklar',
      'Läsa och diskutera aktuella samhällsfrågor'
    ],
    reflectionQuestions: [
      'Hur påverkar texttypen hur du läser?',
      'Vad skiljer en objektiv text från en subjektiv?',
      'Varför är källkritik viktigt i dagens samhälle?',
      'Hur kan samma text tolkas på olika sätt?'
    ]
  },
  {
    id: 2,
    title: 'Skrivande och textproduktion',
    description: 'Lär dig skriva olika typer av texter för olika syften',
    emoji: '✍️',
    sections: [
      {
        title: 'Skrivprocessen',
        content: 'Bra texter skapas genom en process med flera steg. Från idé till färdig text krävs planering, skrivande och bearbetning.',
        keyPoints: [
          'Planering: syfte, målgrupp, texttyp',
          'Idégenerering och research',
          'Disposition och struktur',
          'Skriva utkast',
          'Bearbetning och revidering',
          'Slutgiltig redigering och korrekturläsning'
        ]
      },
      {
        title: 'Olika texttyper',
        content: 'Olika situationer kräver olika typer av texter. Att behärska flera texttyper gör dig till en flexibel skribent.',
        keyPoints: [
          'Berättande texter: noveller, personliga berättelser',
          'Beskrivande texter: reportage, reseskildring',
          'Argumenterande texter: debattartikel, insändare',
          'Utredande texter: PM, rapporter',
          'Instruerande texter: manual, guide',
          'Formella texter: brev, mail, ansökningar'
        ]
      },
      {
        title: 'Språk och stil',
        content: 'Ett gott språk är anpassat till syfte, målgrupp och texttyp. Variation och precision i språket gör texten levande.',
        keyPoints: [
          'Ordval och uttryckssätt',
          'Meningsbyggnad och variation',
          'Formellt vs. informellt språk',
          'Bildspråk och stilfigurer',
          'Tydlighet och precision',
          'Språkriktighet: grammatik och stavning'
        ]
      }
    ],
    examples: [
      'Skriva en argumenterande text om aktuell samhällsfråga',
      'Författa en personlig berättelse med fokus på språk',
      'Producera en formell ansökan eller mail',
      'Öva på att bearbeta och förbättra texter'
    ],
    reflectionQuestions: [
      'Hur skiljer sig skrivande för olika syften?',
      'Vad gör en text övertygande?',
      'Hur kan du utveckla ditt eget skrivande?',
      'Varför är det viktigt att kunna anpassa språket?'
    ]
  },
  {
    id: 3,
    title: 'Muntlig kommunikation',
    description: 'Utveckla din förmåga att kommunicera muntligt',
    emoji: '🗣️',
    sections: [
      {
        title: 'Samtalsförmåga',
        content: 'Att kommunicera muntligt är en viktig färdighet i både privata och professionella sammanhang.',
        keyPoints: [
          'Aktivt lyssnande',
          'Turtagning i samtal',
          'Ställa frågor och förtydliga',
          'Ge och ta feedback',
          'Argumentera och bemöta argument',
          'Anpassa språk till situation'
        ]
      },
      {
        title: 'Presentation och föredrag',
        content: 'Att hålla presentationer kräver både förberedelse och träning. En bra presentation är väl strukturerad och engagerande.',
        keyPoints: [
          'Planering av presentation',
          'Disposition: inledning, innehåll, avslutning',
          'Tydligt och engagerande tal',
          'Kroppsspråk och röstanvändning',
          'Stödmaterial: PowerPoint, bilder',
          'Hantera nervositet'
        ]
      },
      {
        title: 'Diskussion och debatt',
        content: 'I diskussioner och debatter tränar du på att formulera och försvara åsikter samt att lyssna på och bemöta andras argument.',
        keyPoints: [
          'Sakliga argument',
          'Lyssna aktivt på andra',
          'Respektera olika åsikter',
          'Retoriska grepp',
          'Källhänvisningar',
          'Etik i kommunikation'
        ]
      }
    ],
    examples: [
      'Hålla en presentation för klassen',
      'Delta i klassrumsdiskussioner',
      'Genomföra en debatt i grupp',
      'Öva på samtalsteknik i parövningar'
    ],
    reflectionQuestions: [
      'Vad gör en presentation engagerande?',
      'Hur kan du bli tryggare i att tala inför andra?',
      'Varför är det viktigt att lyssna aktivt?',
      'Hur skiljer sig muntlig och skriftlig kommunikation?'
    ]
  },
  {
    id: 4,
    title: 'Svenska språket',
    description: 'Utforska det svenska språkets struktur och utveckling',
    emoji: '🔤',
    sections: [
      {
        title: 'Grammatik',
        content: 'Grammatiken är språkets byggstenar. Att förstå grammatik hjälper dig att använda språket korrekt och effektivt.',
        keyPoints: [
          'Ordklasser: substantiv, verb, adjektiv',
          'Satsdelsanalys',
          'Tempus och aspekt',
          'Presens, preteritum, perfekt',
          'Ord och ordbildning',
          'Skiljetecken och interpunktion'
        ]
      },
      {
        title: 'Språkhistoria',
        content: 'Svenska språket har utvecklats över århundraden. Att känna till språkets historia ger perspektiv på dagens språk.',
        keyPoints: [
          'Fornsvenska och medeltiden',
          'Nysvenska från 1500-talet',
          'Påverkan från andra språk',
          'Dialekter och sociolekter',
          'Standardsvenska och variationer',
          'Språkförändring pågår ständigt'
        ]
      },
      {
        title: 'Flerspråkighet',
        content: 'Sverige är idag ett mångspråkigt samhälle. Flerspråkighet är en resurs både för individen och samhället.',
        keyPoints: [
          'Modersmål och andraspråk',
          'Minoritetsspråk i Sverige',
          'Code-switching',
          'Flerspråkighetens fördelar',
          'Språklig identitet',
          'Språkpolitik'
        ]
      }
    ],
    examples: [
      'Analysera grammatiska strukturer i texter',
      'Jämföra modern svenska med äldre texter',
      'Undersöka lånord från olika språk',
      'Diskutera språklig variation och normer'
    ],
    reflectionQuestions: [
      'Varför är grammatik viktig?',
      'Hur har svenskan påverkats av andra språk?',
      'Vad betyder det att behärska flera språk?',
      'Hur förändras språket idag?'
    ]
  },
  {
    id: 5,
    title: 'Litteratur och kultur',
    description: 'Upptäck litteraturens värld och dess betydelse',
    emoji: '📚',
    sections: [
      {
        title: 'Skönlitteratur',
        content: 'Skönlitteratur speglar människans villkor genom berättelser, dikter och dramatik. Att läsa litteratur utvecklar både språk och empati.',
        keyPoints: [
          'Romaner och noveller',
          'Poesi och lyrik',
          'Drama och teater',
          'Litterära genrer',
          'Teman i litteraturen',
          'Karaktärer och miljöskildring'
        ]
      },
      {
        title: 'Litteraturhistoria',
        content: 'Litteraturen har utvecklats genom tiderna och speglar sin tids samhälle, värderingar och tankesätt.',
        keyPoints: [
          'Från medeltid till nutid',
          'Viktiga författare och verk',
          'Litterära epoker',
          'Nordisk litteratur',
          'Världslitteratur',
          'Modern och samtida litteratur'
        ]
      },
      {
        title: 'Litteratur och samhälle',
        content: 'Litteraturen påverkar och påverkas av samhället. Genom litteraturen kan vi förstå både vår egen tid och historien.',
        keyPoints: [
          'Litteratur som spegling av samhället',
          'Samhällskritik i litteraturen',
          'Litteratur och identitet',
          'Representation och mångfald',
          'Kanon och värdering',
          'Läsarens tolkning'
        ]
      }
    ],
    examples: [
      'Läsa och analysera en roman',
      'Studera dikter från olika tidsperioder',
      'Jämföra klassisk och modern litteratur',
      'Diskutera litteraturens roll i samhället'
    ],
    reflectionQuestions: [
      'Vad kan vi lära oss av litteraturen?',
      'Hur speglar litteraturen sin tid?',
      'Varför är det viktigt att läsa skönlitteratur?',
      'Hur påverkar din bakgrund din tolkning av en text?'
    ]
  }
];

export default function Svenska1() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    progress: 0,
    targetGrade: '',
    completedModules: [],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);

  const storageKey = `@svenska1_progress_${user?.id}`;

  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  const loadProgress = async () => {
    if (!user?.id) return;
    
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const progress = JSON.parse(stored);
        setCourseProgress(progress);
        setEditProgress(progress.progress.toString());
        setEditTargetGrade(progress.targetGrade);
        
        const updatedModules = modulesData.map(module => ({
          ...module,
          completed: progress.completedModules.includes(module.id),
        }));
        setModules(updatedModules);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (progress: CourseProgress) => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(progress));
      setCourseProgress(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleModuleCompletion = (moduleId: number) => {
    const updatedModules = modules.map(m => 
      m.id === moduleId ? { ...m, completed: !m.completed } : m
    );
    setModules(updatedModules);

    const completedIds = updatedModules.filter(m => m.completed).map(m => m.id);
    const autoProgress = Math.round((completedIds.length / modulesData.length) * 100);
    
    const newProgress = {
      ...courseProgress,
      completedModules: completedIds,
      progress: autoProgress,
    };
    
    saveProgress(newProgress);
    setEditProgress(autoProgress.toString());
  };

  const handleSaveManualProgress = async () => {
    try {
      const progressValue = parseInt(editProgress, 10);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        Alert.alert('Fel', 'Progress måste vara ett tal mellan 0 och 100');
        return;
      }

      const newProgress = {
        ...courseProgress,
        progress: progressValue,
        targetGrade: editTargetGrade,
      };
      
      await saveProgress(newProgress);
      Alert.alert('Framgång! ✅', 'Kursinformation har uppdaterats');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving progress:', error);
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
              colors={['#EC4899', '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📚</Text>
                <Text style={styles.heroTitle}>Svenska 1</Text>
                <Text style={styles.heroDescription}>
                  Grundläggande svenska med fokus på läsförståelse, skrivande och språkutveckling
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Kursframsteg</Text>
                  <Text style={styles.progressPercent}>{courseProgress.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${courseProgress.progress}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {courseProgress.completedModules.length} av {modulesData.length} moduler slutförda
                </Text>
              </View>

              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.quickStatText}>
                    {courseProgress.progress}% klar
                  </Text>
                </View>
                {courseProgress.completedModules.length > 0 && (
                  <View style={styles.quickStatItem}>
                    <CheckCircle size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>
                      {courseProgress.completedModules.length} slutförda
                    </Text>
                  </View>
                )}
                {courseProgress.targetGrade && (
                  <View style={styles.quickStatItem}>
                    <Award size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>
                      Mål: {courseProgress.targetGrade}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
              onPress={() => setShowEditModal(true)}
            >
              <Edit3 size={20} color="#EC4899" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity
            style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/flashcards/SVESVE01')}
            activeOpacity={0.7}
          >
            <Sparkles size={24} color="#EC4899" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>
              Öva med Flashcards
            </Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Svenska 1 ger dig grundläggande färdigheter i att läsa, skriva och tala svenska. Du utvecklar din förmåga att kommunicera i olika sammanhang och analysera texter.
            </Text>
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          
          {modules.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <BookOpen size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Inget innehåll än
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Kursinnehåll kommer att läggas till snart
              </Text>
            </View>
          )}

          {modules.map((module, index) => (
            <FadeInView key={module.id} delay={300 + index * 100}>
              <TouchableOpacity
                style={[
                  styles.moduleCard, 
                  { backgroundColor: theme.colors.card },
                  module.completed && styles.moduleCardCompleted
                ]}
                onPress={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleModuleCompletion(module.id);
                    }}
                  >
                    {module.completed ? (
                      <CheckCircle size={24} color="#EC4899" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle, 
                      { color: theme.colors.text },
                      module.completed && { color: '#EC4899' }
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
                        <View style={styles.sectionHeader2}>
                          <BookOpen size={20} color="#EC4899" />
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
                              <View style={[styles.bullet, { backgroundColor: '#EC4899' }]} />
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
                          Exempel på arbetsområden
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
                        <Lightbulb size={20} color="#EC4899" />
                        <Text style={[styles.reflectionTitle, { color: theme.colors.text }]}>
                          Reflektionsfrågor
                        </Text>
                      </View>
                      {module.reflectionQuestions.map((question, questionIndex) => (
                        <View key={questionIndex} style={styles.questionItem}>
                          <Text style={[styles.questionNumber, { color: '#EC4899' }]}>
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
          ))}
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
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera kursinformation</Text>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <CloseIcon size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Framsteg (%)</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.surface, 
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }]}
                    value={editProgress}
                    onChangeText={setEditProgress}
                    keyboardType="numeric"
                    placeholder="0-100"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

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
                            backgroundColor: '#EC4899',
                            borderColor: '#EC4899'
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
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#EC4899' }]}
                  onPress={handleSaveManualProgress}
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
  heroTitle: { fontSize: 28, fontWeight: '700' as const, color: 'white', textAlign: 'center', marginBottom: 8 },
  heroDescription: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24 },
  introSection: { marginHorizontal: 24, marginBottom: 24, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  introTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },
  introText: { fontSize: 16, lineHeight: 24 },
  modulesSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 16 },
  moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxContainer: { padding: 4 },
  moduleCardCompleted: { borderColor: '#EC4899', borderWidth: 2, borderLeftWidth: 4 },
  moduleEmoji: { fontSize: 40 },
  moduleTitleContainer: { flex: 1 },
  moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  moduleDescription: { fontSize: 14, lineHeight: 20 },
  progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginTop: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' as const },
  progressPercent: { fontSize: 18, color: 'white', fontWeight: 'bold' as const },
  progressBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 },
  progressText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  quickStats: { flexDirection: 'row', gap: 16, marginTop: 12 },
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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
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
  emptyState: { alignItems: 'center', padding: 40, borderRadius: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  moduleContent: { marginTop: 20, gap: 16 },
  sectionCard: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(236, 72, 153, 0.1)' },
  sectionHeader2: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
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
