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
    title: 'Läsförståelse och textanalys',
    description: 'Utveckla förmågan att läsa och tolka olika typer av texter',
    emoji: '📖',
    sections: [
      {
        title: 'Skönlitterära texter',
        content: 'Skönlitteratur omfattar romaner, noveller, dikter och dramatik. Att kunna läsa och analysera skönlitteratur utvecklar din språkliga medvetenhet och förståelse för människan och samhället.',
        keyPoints: [
          'Roman: längre berättande text med komplexa karaktärer',
          'Novell: kortare berättelse med fokus på en händelse',
          'Dikt: koncentrerat språk med rytm och bildspråk',
          'Drama: text skriven för att framföras på scen',
          'Identifiera tema, budskap och författarens syfte',
          'Analysera berättarperspektiv och karaktärsutveckling'
        ]
      },
      {
        title: 'Sakprosa och faktatext',
        content: 'Sakprosa är texter som förmedlar information och kunskap om verkligheten. Det kan vara artiklar, utredningar, rapporter och debattinlägg.',
        keyPoints: [
          'Syfte: informera, övertyga, förklara eller instruera',
          'Huvudtanke och stödargument',
          'Källkritik: värdera trovärdighet och källhänvisningar',
          'Textstruktur: inledning, huvuddel, avslutning',
          'Faktapåståenden kontra åsikter',
          'Språkliga verkningsmedel i argumenterande texter'
        ]
      },
      {
        title: 'Läsförståelsestrategier',
        content: 'Effektiv läsning kräver medvetenhet om olika strategier. Att aktivt arbeta med texten hjälper dig att förstå och komma ihåg innehållet bättre.',
        keyPoints: [
          'Överblicksläsning: få en snabb uppfattning om innehållet',
          'Detaljläsning: fokusera på viktiga detaljer',
          'Kritisk läsning: ifrågasätt och analysera',
          'Anteckna nyckelord och viktiga begrepp',
          'Ställ frågor till texten under läsningen',
          'Sammanfatta texten med egna ord'
        ]
      }
    ],
    examples: [
      'Analysera en novell: tema, berättarperspektiv, karaktärer',
      'Kritisk granskning av en debattartikel',
      'Jämför hur samma händelse beskrivs i olika tidningar',
      'Skriva en läslogg för en roman'
    ],
    reflectionQuestions: [
      'Hur påverkar berättarperspektivet din upplevelse av en text?',
      'Vilka strategier hjälper dig att förstå svåra texter?',
      'Hur kan man skilja fakta från åsikter i en text?',
      'Varför är källkritik viktigt när du läser på internet?'
    ]
  },
  {
    id: 2,
    title: 'Skrivande och textproduktion',
    description: 'Lär dig att skriva olika typer av texter med korrekt struktur och språk',
    emoji: '✍️',
    sections: [
      {
        title: 'Skrivprocessen',
        content: 'Bra skrivande är en process som omfattar flera steg. Genom att arbeta strukturerat kan du utveckla dina texter från idé till färdig produkt.',
        keyPoints: [
          'Planering: brainstorming, mind-map, disposition',
          'Första utkast: få ner tankar utan att vara perfektionistisk',
          'Revidering: omstrukturera och utveckla innehållet',
          'Språkgranskning: rätta grammatik, stavning och interpunktion',
          'Kamratrespons: få feedback från andra',
          'Slutlig bearbetning: finslipa texten'
        ]
      },
      {
        title: 'Texttyper och genrer',
        content: 'Olika texttyper har olika syften och konventioner. Att känna till dessa hjälper dig att anpassa ditt skrivande efter situation och målgrupp.',
        keyPoints: [
          'Berättande text: personlig berättelse, kreativt skrivande',
          'Beskrivande text: detaljerad beskrivning av person, plats eller händelse',
          'Argumenterande text: debattartikel, insändare, krönika',
          'Utredande text: rapport, PM, artikel',
          'Instruerande text: manual, recept, anvisningar',
          'Anpassa språk och struktur efter texttyp'
        ]
      },
      {
        title: 'Språkriktighet',
        content: 'Korrekt språk är viktigt för att ditt budskap ska komma fram tydligt. Det handlar om stavning, grammatik, meningsbyggnad och ordval.',
        keyPoints: [
          'Stavning: använd rättstavningsprogram och ordlistor',
          'Grammatik: subjekt, verb, objekt - grundläggande meningsbyggnad',
          'Interpunktion: punkt, komma, kolon, semikolon',
          'Ordval: variera och använd precisa ord',
          'Meningsbyggnad: variera meningslängd och struktur',
          'Styckeindelning: ett stycke = en huvudtanke'
        ]
      }
    ],
    examples: [
      'Skriva en debattartikel om ett aktuellt ämne',
      'Kreativt skrivande: fortsätt på en given inledning',
      'Skriva ett formellt brev eller mejl',
      'Peer-review: ge och ta emot konstruktiv feedback'
    ],
    reflectionQuestions: [
      'Vilken del av skrivprocessen är svårast för dig?',
      'Hur kan du förbättra ditt ordval och varierat språk?',
      'Varför är det viktigt att anpassa språket efter målgruppen?',
      'Hur kan kamratrespons hjälpa dig utveckla ditt skrivande?'
    ]
  },
  {
    id: 3,
    title: 'Muntlig kommunikation',
    description: 'Utveckla din förmåga att tala och kommunicera effektivt',
    emoji: '🎤',
    sections: [
      {
        title: 'Presentationsteknik',
        content: 'Att hålla en presentation innebär att förmedla information muntligt till en grupp. Bra presentationer kräver förberedelse, struktur och självförtroende.',
        keyPoints: [
          'Förberedelse: researcha, strukturera, öva',
          'Struktur: inledning, huvuddel, avslutning',
          'Visuellt stöd: PowerPoint, Prezi, bilder',
          'Kroppsspråk: ögonkontakt, gester, hållning',
          'Röstanvändning: tydlighet, tempo, betoning',
          'Hantera nervositet: andningsteknik, positiv inställning'
        ]
      },
      {
        title: 'Samtal och diskussion',
        content: 'Att delta i samtal och diskussioner kräver lyssnandeförmåga, respekt och förmåga att uttrycka sina åsikter tydligt.',
        keyPoints: [
          'Aktivt lyssnande: fokusera på talaren',
          'Turtagning: vänta på din tur att tala',
          'Argumentera: stöd dina åsikter med exempel',
          'Respektera olika åsikter',
          'Ställa relevanta frågor',
          'Sammanfatta och reflektera'
        ]
      },
      {
        title: 'Formellt och informellt tal',
        content: 'Beroende på situation och publik anpassar vi vårt sätt att tala. Att känna till skillnaden mellan formellt och informellt språk är viktigt.',
        keyPoints: [
          'Formellt tal: presentationer, möten, intervjuer',
          'Informellt tal: samtal med vänner, vardagssituationer',
          'Register: anpassa språkstil efter situation',
          'Högtidstal och ceremonier',
          'Slang och talspråk vs standardspråk',
          'Professionell kommunikation'
        ]
      }
    ],
    examples: [
      'Håll en presentation på 5 minuter om ett intresseområde',
      'Klassrumsdebatt: argumentera för eller emot ett påstående',
      'Intervjuövning: rollspela arbetsintervju',
      'Storytelling: berätta en personlig anekdot'
    ],
    reflectionQuestions: [
      'Vad gör en presentation engagerande och intressant?',
      'Hur kan du bli bättre på att lyssna aktivt?',
      'När är det lämpligt att använda formellt respektive informellt språk?',
      'Hur kan du hantera nervositet inför muntliga framträdanden?'
    ]
  },
  {
    id: 4,
    title: 'Språkets struktur',
    description: 'Grammatik, ordbildning och språklig variation',
    emoji: '🔤',
    sections: [
      {
        title: 'Ordklasser och satsdelar',
        content: 'Att förstå språkets uppbyggnad hjälper dig att skriva och tala mer korrekt och varierat.',
        keyPoints: [
          'Ordklasser: substantiv, verb, adjektiv, adverb',
          'Pronomen, prepositioner, konjunktioner',
          'Satsdelar: subjekt, predikat, objekt',
          'Huvudsats och bisats',
          'Verb i olika tempus: presens, preteritum, perfekt',
          'Kongruens: samstämmighet mellan ord'
        ]
      },
      {
        title: 'Ordbildning och ordförråd',
        content: 'Svenska språket har olika sätt att bilda nya ord. Ett rikt ordförråd gör ditt språk mer nyanserat och precist.',
        keyPoints: [
          'Sammansättningar: storstad, skolbarn',
          'Avledningar: läs-are, skriv-ning',
          'Lånord: från andra språk',
          'Synonymer: ord med liknande betydelse',
          'Antonomer: ord med motsatt betydelse',
          'Bygga ordförråd genom läsning'
        ]
      },
      {
        title: 'Språklig variation',
        content: 'Svenska språket varierar beroende på region, situation och talare. Denna variation berikar språket.',
        keyPoints: [
          'Dialekter: regionala språkvarianter',
          'Sociolekter: sociala gruppers språk',
          'Fackspråk: yrkesspecifika termer',
          'Ungdomsspråk och slang',
          'Flerspråkighet i Sverige',
          'Språklig tolerans och respekt'
        ]
      }
    ],
    examples: [
      'Identifiera ordklasser i en mening',
      'Analysera hur ord bildas: samling av exempel',
      'Jämföra olika dialekter: lyssna på inspelningar',
      'Skapa en ordlista med nya ord och deras betydelser'
    ],
    reflectionQuestions: [
      'Hur hjälper grammatikkunskaper dig i ditt skrivande?',
      'Vilka strategier kan du använda för att bygga ditt ordförråd?',
      'Varför är språklig variation något positivt?',
      'Hur påverkar flerspråkighet samhället?'
    ]
  },
  {
    id: 5,
    title: 'Berättande texter och film',
    description: 'Analys av berättande i olika medier',
    emoji: '🎬',
    sections: [
      {
        title: 'Narrativ struktur',
        content: 'Berättelser följer ofta liknande mönster oavsett om de berättas i text eller film. Att förstå denna struktur hjälper dig att analysera och skapa berättelser.',
        keyPoints: [
          'Dramatisk kurva: introduktion, stigande handling, klimax, avslutning',
          'Berättarperspektiv: första person, tredje person',
          'Karaktärsutveckling: hur karaktärer förändras',
          'Tid och plats: när och var händer berättelsen?',
          'Konflikt och lösning',
          'Flashback och framåtblick'
        ]
      },
      {
        title: 'Litterära verkningsmedel',
        content: 'Författare använder olika tekniker för att skapa stämning, förmedla budskap och engagera läsaren.',
        keyPoints: [
          'Bildspråk: metaforer, liknelser, personifikation',
          'Symbolik: saker som representerar något annat',
          'Ironi och humor',
          'Dialog: hur karaktärer pratar',
          'Miljöbeskrivningar som speglar känslor',
          'Tema och motiv'
        ]
      },
      {
        title: 'Film som berättande medium',
        content: 'Film använder både visuella och auditiva element för att berätta. Filmanalys kräver förståelse för filmspråk.',
        keyPoints: [
          'Kameraarbete: vinklar, rörelser, närbilder',
          'Klippning: hur scener sätts samman',
          'Ljud: musik, ljudeffekter, dialog',
          'Ljus och färg: skapar stämning',
          'Skådespeleri och kroppsspråk',
          'Jämföra bok och filmatisering'
        ]
      }
    ],
    examples: [
      'Analysera en kortfilm: struktur, tema, verkningsmedel',
      'Skriva en kreativ berättelse med medveten användning av verkningsmedel',
      'Jämför en bok med dess filmatisering',
      'Skapa en storyboard för en kort filmscen'
    ],
    reflectionQuestions: [
      'Hur skapar författare spänning i en berättelse?',
      'Vilka likheter och skillnader finns mellan bok och film som berättande medier?',
      'Hur påverkar berättarperspektivet din upplevelse av en historia?',
      'Ge exempel på en berättelse som har ett starkt budskap'
    ]
  },
  {
    id: 6,
    title: 'Informationssökning och källkritik',
    description: 'Hitta, värdera och använda information på ett kritiskt sätt',
    emoji: '🔍',
    sections: [
      {
        title: 'Informationssökning',
        content: 'I dagens informationssamhälle är det viktigt att kunna hitta relevant och trovärdig information effektivt.',
        keyPoints: [
          'Sökmotorer: Google, databaser, bibliotekskataloger',
          'Sökord och sökfraser: hur du formulerar din sökning',
          'Avgränsa och bredda sökningar',
          'Olika typer av källor: böcker, artiklar, webbsidor',
          'Primära och sekundära källor',
          'Källhänvisning och referenser'
        ]
      },
      {
        title: 'Källkritisk granskning',
        content: 'Inte all information är lika trovärdig. Källkritik hjälper dig att värdera och bedöma information.',
        keyPoints: [
          'Äkthet: är källan vad den utger sig för att vara?',
          'Tidskriterium: när publicerades informationen?',
          'Oberoende: har författaren något egenintresse?',
          'Samtidighet: var källan samtidig med händelsen?',
          'Tendensfrihet: är informationen objektiv?',
          'Korsreferera: jämför flera källor'
        ]
      },
      {
        title: 'Mediekritik och desinformation',
        content: 'I en digital värld är det viktigt att kunna skilja på fakta och desinformation samt förstå hur medier påverkar oss.',
        keyPoints: [
          'Källkritik på sociala medier',
          'Falska nyheter och faktakoll',
          'Algoritmer och filterbubblor',
          'Reklam och påverkan',
          'Personlig integritet online',
          'Ansvar som innehållsskapare och deltagare'
        ]
      }
    ],
    examples: [
      'Utför en källkritisk granskning av en webbsida',
      'Jämför hur en nyhet rapporteras i olika medier',
      'Skriva en PM med korrekta källhänvisningar',
      'Identifiera desinformation och förklara varför'
    ],
    reflectionQuestions: [
      'Hur avgör du om en källa är trovärdig?',
      'Varför är det viktigt att ange källor i dina texter?',
      'Hur kan sociala medier sprida desinformation?',
      'Vad kan du göra för att bli en kritisk mediekonsument?'
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
});
