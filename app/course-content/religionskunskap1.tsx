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
  Lightbulb, 
  CheckCircle, 
  Target,
  Users,
  Globe,
  Heart,
  Brain,
  Circle,
  Edit3,
  Save,
  X as CloseIcon,
  Award,
  TrendingUp,
  Star,
  FileText,
  Sparkles
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
    title: 'Världsreligionernas ursprung och utveckling',
    description: 'Lär dig om de fem världsreligionerna och deras historia',
    emoji: '🕌',
    sections: [
      {
        title: 'Judendom',
        content: 'Judendomen är en av världens äldsta monoteistiska religioner, grundad för över 3000 år sedan. Religionen har sitt ursprung i det antika Israel och bygger på Torans läror och berättelser om det judiska folkets förbund med Gud.',
        keyPoints: [
          'Monoteistisk religion - tro på en Gud (JHWH)',
          'Heliga skrifter: Tanakh (inklusive Toran)',
          'Viktiga profeter: Moses, Abraham, Isak, Jakob',
          'Sabbaten (lördagen) är helig vilodag',
          'Synagogan är den judiska gudstjänstlokalen',
          'Bar/Bat Mitzvah markerar religiös vuxenblivning'
        ]
      },
      {
        title: 'Kristendom',
        content: 'Kristendomen växte fram ur judendomen för cirka 2000 år sedan och är världens största religion. Den bygger på tron på Jesus Kristus som Guds son och mänsklighetens frälsare.',
        keyPoints: [
          'Tro på treenigheten: Fader, Son och Helig Ande',
          'Heliga skrifter: Bibeln (Gamla och Nya testamentet)',
          'Jesus Kristus som central figur',
          'Söndagen som vilodag och gudstjänstdag',
          'Kyrkan som gudstjänstlokal',
          'Sakrament: dop och nattvard'
        ]
      },
      {
        title: 'Islam',
        content: 'Islam grundades av profeten Muhammad på 600-talet i Arabien. Det är världens näst största religion och bygger på tron på en Gud (Allah) och Muhammads budskap.',
        keyPoints: [
          'Fem pelare: Trosbekännelse, bön, allmosor, fasta, pilgrimsfärd',
          'Heliga skrifter: Koranen och Hadith',
          'Muhammad som den siste profeten',
          'Fredagen som böndag',
          'Moskén som gudstjänstlokal',
          'Ramadan som fastemånad'
        ]
      },
      {
        title: 'Hinduism',
        content: 'Hinduismen är en av världens äldsta religioner utan en specifik grundare. Den utvecklades gradvis i Indien över tusentals år och har många olika uttryck och tolkningar.',
        keyPoints: [
          'Många gudar och gudinnor (polyteism)',
          'Heliga skrifter: Vedaskrifterna och Bhagavad Gita',
          'Tro på reinkarnation och karma',
          'Kastsystemet (historiskt)',
          'Templet som central gudstjänstplats',
          'Yoga och meditation som andliga praktiker'
        ]
      },
      {
        title: 'Buddhism',
        content: 'Buddhism grundades av Siddhartha Gautama (Buddha) för cirka 2500 år sedan i Indien. Religionen fokuserar på att nå upplysning och befrielse från lidande.',
        keyPoints: [
          'Fyra ädla sanningar om lidandets natur',
          'Den åttafaldiga vägen som väg till upplysning',
          'Buddha som lärare och förebild',
          'Meditation som central praktik',
          'Nirvan som slutmål',
          'Kloster och tempel som andliga centra'
        ]
      }
    ],
    examples: [
      'Besök i olika religiösa lokaler: synagoga, kyrka, moské, tempel',
      'Jämförelse av religiösa högtider: Pesach, Påsk, Ramadan, Diwali',
      'Studier av religiösa symboler och deras betydelser',
      'Intervjuer med troende från olika religioner'
    ],
    reflectionQuestions: [
      'Vilka likheter och skillnader finns mellan de abrahamitiska religionerna?',
      'Hur påverkar religiös tro människors dagliga liv?',
      'Varför är religionskunskap viktigt i ett mångkulturellt samhälle?',
      'Hur har världsreligionerna påverkat historien och kulturen?'
    ]
  },
  {
    id: 2,
    title: 'Religiösa ritualer och högtider',
    description: 'Utforska olika religiösa firanden och deras betydelse',
    emoji: '🎊',
    sections: [
      {
        title: 'Livscykelritualer',
        content: 'Alla religioner har ritualer som markerar viktiga händelser i livet. Dessa ritualer hjälper människor att hantera övergångar och ge mening åt livets olika faser.',
        keyPoints: [
          'Födelse: Dop (kristendom), Brit Milah (judendom), Aqiqah (islam)',
          'Vuxenblivning: Konfirmation, Bar/Bat Mitzvah',
          'Äktenskap: Bröllopsritualer i olika religioner',
          'Död: Begravningsritualer och sorgepraktiker',
          'Ritualer skapar sammanhang och gemenskap',
          'Symboliska handlingar förstärker religiös identitet'
        ]
      },
      {
        title: 'Årliga högtider',
        content: 'Religiösa högtider följer ofta årstidernas växlingar och historiska händelser. De erbjuder tid för reflektion, glädje och gemenskap.',
        keyPoints: [
          'Judendom: Pesach (påsken), Jom Kippur, Chanukka',
          'Kristendom: Jul, Påsk, Pingst',
          'Islam: Eid al-Fitr, Eid al-Adha',
          'Hinduism: Diwali, Holi',
          'Buddhism: Vesak, Ullambana',
          'Högtider stärker religiös identitet och gemenskap'
        ]
      },
      {
        title: 'Dagliga ritualer',
        content: 'Många religioner har dagliga praktiker som hjälper troende att hålla kontakt med det heliga och leva enligt sin tros principer.',
        keyPoints: [
          'Bön som daglig praktik i många religioner',
          'Matregler: Kosher (judendom), Halal (islam)',
          'Klädtraditioner och religiösa symboler',
          'Meditation och kontemplation',
          'Läsning av heliga skrifter',
          'Ritualer strukturerar vardagen och skapar mening'
        ]
      }
    ],
    examples: [
      'Dokumentation av en religiös högtid',
      'Jämförelse av äktenskapsceremonier i olika religioner',
      'Studier av matregler och deras ursprung',
      'Intervju med någon om deras religiösa vardagspraktiker'
    ],
    reflectionQuestions: [
      'Varför är ritualer viktiga för människor?',
      'Hur kan religiösa högtider bidra till sammanhållning?',
      'Vilken roll spelar symboler i religiösa ritualer?',
      'Hur påverkar sekularisering religiösa traditioner?'
    ]
  },
  {
    id: 3,
    title: 'Religion och etik',
    description: 'Undersök hur religion påverkar moraliska värderingar',
    emoji: '⚖️',
    sections: [
      {
        title: 'Etiska grundprinciper',
        content: 'Alla världsreligioner innehåller etiska läror om hur människor bör leva och behandla varandra. Dessa principer formar moraliska värderingar i samhällen världen över.',
        keyPoints: [
          'Den gyllene regeln finns i olika former i alla religioner',
          'Rättvisa och medkänsla som centrala värden',
          'Ansvar för de svaga och utsatta',
          'Ärlighet och trovärdighet',
          'Respekt för livet',
          'Balans mellan individuella och kollektiva rättigheter'
        ]
      },
      {
        title: 'Etiska dilemman',
        content: 'Moderna samhällen står inför komplexa etiska frågor där religiösa perspektiv ofta spelar en viktig roll i debatten.',
        keyPoints: [
          'Bioetik: Abort, stamcellsforskning, eutanasi',
          'Miljöetik: Människans ansvar för skapelsen',
          'Social rättvisa: Ojämlikhet och fattigdom',
          'Sexualitet och familj: Äktenskap, samlevnad',
          'Krig och fred: Rättfärdigt krig, pacifism',
          'Olika religiösa perspektiv på samma frågor'
        ]
      },
      {
        title: 'Religion och samhälle',
        content: 'Religiösa värderingar påverkar samhällsstrukturer, lagar och sociala normer. I sekulära samhällen möts religiösa och icke-religiösa perspektiv.',
        keyPoints: [
          'Religionsfrihet som mänsklig rättighet',
          'Separation mellan religion och stat',
          'Religiösa minoriteters rättigheter',
          'Religion i offentlig debatt',
          'Tolerans och respekt i mångkulturella samhällen',
          'Sekularisering och dess effekter'
        ]
      }
    ],
    examples: [
      'Analys av ett aktuellt etiskt dilemma ur religiöst perspektiv',
      'Debatt om religionens roll i samhället',
      'Studier av religiösa ledares uttalanden om etiska frågor',
      'Jämförelse av religiösa och sekulära etiska resonemang'
    ],
    reflectionQuestions: [
      'Kan moral existera utan religion?',
      'Hur kan vi hantera konflikter mellan religiösa och sekulära värderingar?',
      'Vilken roll bör religion spela i politiska beslut?',
      'Hur kan olika religiösa grupper samexistera i fred?'
    ]
  },
  {
    id: 4,
    title: 'Livsåskådningar och existentiella frågor',
    description: 'Reflektera över livets stora frågor och olika perspektiv',
    emoji: '🤔',
    sections: [
      {
        title: 'Existentiella frågor',
        content: 'Alla människor ställer sig frågor om livets mening, lidandets problem och vad som händer efter döden. Religioner och livsåskådningar erbjuder olika svar.',
        keyPoints: [
          'Livets mening och syfte',
          'Lidandets och ondskans problem',
          'Döden och livet efter detta',
          'Människans natur och värde',
          'Relationen mellan kropp och själ',
          'Frihet och determinism'
        ]
      },
      {
        title: 'Religiösa perspektiv',
        content: 'Olika religioner har olika sätt att förstå och svara på existentiella frågor. Dessa perspektiv påverkar hur troende ser på sig själva och världen.',
        keyPoints: [
          'Monoteistiska perspektiv: Guds plan och vilja',
          'Reinkarnation och karma i österländska religioner',
          'Teodicéproblemet: Varför finns ondska?',
          'Bön och meditation som sätt att söka svar',
          'Religiösa berättelser och symboler',
          'Mystik och andliga upplevelser'
        ]
      },
      {
        title: 'Sekulära livsåskådningar',
        content: 'Många människor i dagens samhälle lever utan religiös tro. Humanism, existentialism och andra sekulära perspektiv erbjuder alternativa sätt att förstå tillvaron.',
        keyPoints: [
          'Humanism: Människan som måttstock',
          'Existentialism: Frihet och ansvar',
          'Naturalism: Vetenskaplig världsbild',
          'Agnosticism och ateism',
          'Etik utan religiös grund',
          'Mening skapas av människan själv'
        ]
      }
    ],
    examples: [
      'Analys av religiösa texter om livets mening',
      'Jämförelse av religiösa och sekulära svar på existentiella frågor',
      'Personlig reflektion över egen livsåskådning',
      'Studier av konstnärliga verk med religiösa eller existentiella tema'
    ],
    reflectionQuestions: [
      'Vad ger mitt liv mening?',
      'Hur påverkar min livsåskådning mina val?',
      'Kan man leva ett meningsfullt liv utan religiös tro?',
      'Hur hanterar olika människor dödsångest och existentiell oro?'
    ]
  },
  {
    id: 5,
    title: 'Religion och samhällsfrågor',
    description: 'Undersök religionens roll i moderna samhällsdebatter',
    emoji: '🌍',
    sections: [
      {
        title: 'Religion och jämställdhet',
        content: 'Synen på kvinnors och mäns roller varierar mellan och inom religioner. Frågor om jämställdhet är ofta omdebatterade.',
        keyPoints: [
          'Olika tolkningar av religiösa texter om kön',
          'Kvinnors roller i religiösa samfund',
          'Kvinnliga religiösa ledare och präster',
          'Klädkoder och deras betydelse',
          'Progressiva och konservativa rörelser',
          'Feministisk teologi'
        ]
      },
      {
        title: 'Religion och mänskliga rättigheter',
        content: 'Relationen mellan religiösa värderingar och universella mänskliga rättigheter kan ibland vara spänningsfylld.',
        keyPoints: [
          'Religionsfrihet som mänsklig rättighet',
          'HBTQ+-rättigheter ur olika religiösa perspektiv',
          'Barnets rättigheter och religiös uppfostran',
          'Yttrandefrihet vs. respekt för religioner',
          'Religiösa minoriteters rättigheter',
          'Dialog mellan tradition och moderna värderingar'
        ]
      },
      {
        title: 'Religion i konflikt och fred',
        content: 'Religion kan både vara en källa till konflikt och ett verktyg för fred och försoning.',
        keyPoints: [
          'Religiösa konflikter i historia och nutid',
          'Fundamentalism och extremism',
          'Interreligiös dialog och samarbete',
          'Religionens roll i fredsprocesser',
          'Religiösa ledares ansvar',
          'Religion som källa till medkänsla och försoning'
        ]
      }
    ],
    examples: [
      'Analys av en aktuell samhällsdebatt med religiös dimension',
      'Studier av interreligiösa fredsinitiativ',
      'Intervjuer med personer från olika religiösa traditioner om samtida frågor',
      'Projekt om religiösa organisationers sociala arbete'
    ],
    reflectionQuestions: [
      'Hur kan religioner bidra till en bättre värld?',
      'När blir religion en källa till konflikt?',
      'Hur kan vi främja dialog mellan olika religiösa grupper?',
      'Vilken roll bör religion ha i ett modernt, mångkulturellt samhälle?'
    ]
  }
];

export default function Religionskunskap1() {
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
  const [showGradeCriteria, setShowGradeCriteria] = useState(false);

  const storageKey = `@religionskunskap1_progress_${user?.id}`;

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
              colors={['#A855F7', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <TouchableOpacity
                style={styles.flashcardsButton}
                onPress={() => router.push('/flashcards/RELREL01')}
              >
                <Sparkles size={20} color="white" />
                <Text style={styles.flashcardsButtonText}>Flashcards</Text>
              </TouchableOpacity>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>🕊️</Text>
                <Text style={styles.heroTitle}>Religionskunskap 1</Text>
                <Text style={styles.heroDescription}>
                  Utforska världsreligioner, etik och existentiella frågor
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
              <Edit3 size={20} color="#A855F7" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Religionskunskap 1 ger dig grundläggande kunskaper om världsreligionerna, religiösa 
              traditioner och olika livsåskådningar. Du kommer att utveckla förmåga att analysera 
              hur religion påverkar individer och samhällen, samt reflektera över etiska och 
              existentiella frågor.
            </Text>
            
            <View style={styles.courseGoals}>
              <View style={styles.goalItem}>
                <Globe size={20} color="#A855F7" />
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Förstå världsreligionernas ursprung och läror
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Heart size={20} color="#A855F7" />
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Utveckla etiskt tänkande och empati
                </Text>
              </View>
              <View style={styles.goalItem}>
                <Brain size={20} color="#A855F7" />
                <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                  Reflektera över existentiella frågor
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={250}>
          <View style={[styles.gradeCriteriaCard, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.gradeCriteriaHeader}
              onPress={() => setShowGradeCriteria(!showGradeCriteria)}
              activeOpacity={0.7}
            >
              <View style={styles.gradeCriteriaHeaderLeft}>
                <Award size={24} color="#A855F7" />
                <Text style={[styles.gradeCriteriaTitle, { color: theme.colors.text }]}>
                  Betygskriterier
                </Text>
              </View>
              <View style={{ transform: [{ rotate: showGradeCriteria ? '180deg' : '0deg' }] }}>
                <Text style={{ fontSize: 20, color: theme.colors.text }}>▼</Text>
              </View>
            </TouchableOpacity>

            {showGradeCriteria && (
              <View style={styles.gradeCriteriaContent}>
                <Text style={[styles.gradeCriteriaIntro, { color: theme.colors.textSecondary }]}>
                  För att lyckas i Religionskunskap 1 behöver du visa kunskap om världsreligioner, 
                  förmåga att analysera religiösa uttryck och reflektera över etiska och existentiella frågor.
                </Text>

                <View style={styles.gradeLevel}>
                  <View style={[styles.gradeLevelHeader, { backgroundColor: '#22C55E' }]}>
                    <Star size={18} color="white" />
                    <Text style={styles.gradeLevelTitle}>E - Godkänd nivå</Text>
                  </View>
                  <View style={styles.gradeLevelContent}>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#22C55E" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Grundläggande kunskaper om de fem världsreligionerna
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#22C55E" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Beskriva centrala religiösa begrepp och traditioner
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#22C55E" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Diskutera enkla etiska frågeställningar
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#22C55E" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Reflektera över existentiella frågor på ett enkelt sätt
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.gradeLevel}>
                  <View style={[styles.gradeLevelHeader, { backgroundColor: '#3B82F6' }]}>
                    <Star size={18} color="white" />
                    <Text style={styles.gradeLevelTitle}>C - God nivå</Text>
                  </View>
                  <View style={styles.gradeLevelContent}>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#3B82F6" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Utvecklade kunskaper om världsreligioner och deras utveckling
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#3B82F6" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Förklara samband mellan religion och samhälle
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#3B82F6" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Resonera välgrundat om etiska dilemman
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#3B82F6" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Analysera religiösa uttryck med användning av begrepp
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.gradeLevel}>
                  <View style={[styles.gradeLevelHeader, { backgroundColor: '#A855F7' }]}>
                    <Star size={18} color="white" />
                    <Text style={styles.gradeLevelTitle}>A - Mycket god nivå</Text>
                  </View>
                  <View style={styles.gradeLevelContent}>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#A855F7" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Fördjupade kunskaper om religioner i olika kontexter
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#A855F7" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Resonera nyanserat om komplexa religiösa och etiska frågor
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#A855F7" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Kritiskt granska och värdera olika perspektiv
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <FileText size={16} color="#A855F7" />
                      <Text style={[styles.criteriaText, { color: theme.colors.textSecondary }]}>
                        Dra välgrundade slutsatser med teoretiskt stöd
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.tipsForSuccess, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.tipsForSuccessTitle, { color: theme.colors.text }]}>
                    💡 Tips för att lyckas
                  </Text>
                  <Text style={[styles.tipsForSuccessText, { color: theme.colors.textSecondary }]}>
                    • Läs noga och strukturera din kunskap
                  </Text>
                  <Text style={[styles.tipsForSuccessText, { color: theme.colors.textSecondary }]}>
                    • Använd facktermer och begrepp korrekt
                  </Text>
                  <Text style={[styles.tipsForSuccessText, { color: theme.colors.textSecondary }]}>
                    • Koppla teori till konkreta exempel
                  </Text>
                  <Text style={[styles.tipsForSuccessText, { color: theme.colors.textSecondary }]}>
                    • Reflektera djupt och visa olika perspektiv
                  </Text>
                  <Text style={[styles.tipsForSuccessText, { color: theme.colors.textSecondary }]}>
                    • Öva på att argumentera och motivera dina åsikter
                  </Text>
                </View>
              </View>
            )}
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          
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
                      <CheckCircle size={24} color="#A855F7" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle, 
                      { color: theme.colors.text },
                      module.completed && { color: '#A855F7' }
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
                          <BookOpen size={20} color="#A855F7" />
                          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
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
                              <View style={[styles.bullet, { backgroundColor: '#A855F7' }]} />
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
          ))}
        </View>

        <FadeInView delay={800}>
          <View style={[styles.tipsSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              💡 Studietips för Religionskunskap
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Users size={18} color="#A855F7" />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Var öppen och respektfull när du lär dig om olika religioner
                </Text>
              </View>
              <View style={styles.tipItem}>
                <BookOpen size={18} color="#A855F7" />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Läs religiösa texter för att förstå trosuppfattningar på djupet
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Brain size={18} color="#A855F7" />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Reflektera över dina egna värderingar och jämför med andras
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Globe size={18} color="#A855F7" />
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Följ aktuella händelser där religion spelar en roll
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>
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
                  <Text style={[styles.inputHint, { color: theme.colors.textMuted }]}>
                    Moduler sätter automatiskt framsteg när du bockar av dem
                  </Text>
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
                            backgroundColor: '#A855F7',
                            borderColor: '#A855F7'
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
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#A855F7' }]}
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
    marginBottom: 20,
  },
  courseGoals: {
    gap: 12,
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
    borderColor: '#A855F7',
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
  sectionCard: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
  tipsSection: {
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
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
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
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic' as const,
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
  gradeCriteriaCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  gradeCriteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  gradeCriteriaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeCriteriaTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  gradeCriteriaContent: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  gradeCriteriaIntro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  gradeLevel: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gradeLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  gradeLevelTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'white',
  },
  gradeLevelContent: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 12,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  criteriaText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tipsForSuccess: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsForSuccessTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  tipsForSuccessText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  flashcardsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  flashcardsButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: 'white',
  },
});