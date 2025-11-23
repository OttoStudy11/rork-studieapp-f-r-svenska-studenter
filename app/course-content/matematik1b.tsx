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
    title: 'Aritmetik och taluppfattning',
    description: 'Tallinjen, tal i olika former och räkning med tal',
    emoji: '🔢',
    sections: [
      {
        title: 'Reella tal',
        content: 'De reella talen omfattar alla tal på tallinjen: naturliga tal, heltal, rationella tal och irrationella tal. Varje punkt på tallinjen motsvarar ett reellt tal.',
        keyPoints: [
          'Naturliga tal: 1, 2, 3, 4, ...',
          'Heltal: ..., -2, -1, 0, 1, 2, ...',
          'Rationella tal: kan skrivas som bråk p/q där q ≠ 0',
          'Irrationella tal: kan inte skrivas som bråk (t.ex. √2, π)',
          'Reella tal: alla tal på tallinjen',
          'Tallinjen är en visuell representation av talsystemet'
        ]
      },
      {
        title: 'Grundläggande räknelagar',
        content: 'För att effektivt lösa matematiska problem behöver du känna till och kunna tillämpa grundläggande räknelagar som gäller för addition och multiplikation.',
        keyPoints: [
          'Kommutativa lagen: a + b = b + a och a · b = b · a',
          'Associativa lagen: (a + b) + c = a + (b + c)',
          'Distributiva lagen: a · (b + c) = a · b + a · c',
          'Identitetselement: a + 0 = a och a · 1 = a',
          'Inversa element: a + (-a) = 0 och a · (1/a) = 1',
          'Prioriteringsregler: Parenteser → Potenser → Multiplikation/Division → Addition/Subtraktion'
        ]
      },
      {
        title: 'Procent och proportionalitet',
        content: 'Procent är en viktig del av vardagsmatematiken och används för att beskriva andelar och förändringar. Proportionalitet beskriver samband mellan storheter.',
        keyPoints: [
          'Procent betyder "per hundra" (1% = 1/100)',
          'Procentuell förändring: (nytt värde - gammalt värde) / gammalt värde × 100%',
          'Förändringsfaktor: nytt värde / gammalt värde',
          'Räta proportionalitet: y = kx (k = proportionalitetskonstant)',
          'Omvänd proportionalitet: y = k/x',
          'Tillämpningar: rabatter, räntor, skalor, recept'
        ]
      }
    ],
    examples: [
      'Beräkna 15% av 2400 kr',
      'En vara kostar 800 kr och får 25% rabatt. Vad blir det nya priset?',
      'Om 3 liter färg räcker till 45 m², hur mycket färg behövs för 120 m²?',
      'Rita tallinjen och placera ut √2, -3/4, π och 2,5'
    ],
    reflectionQuestions: [
      'Varför kan inte alla tal skrivas som bråk?',
      'Ge exempel på när du använder procent i vardagen',
      'Hur skiljer sig räta proportionalitet från omvänd proportionalitet?',
      'Varför är det viktigt att följa prioriteringsreglerna när man räknar?'
    ]
  },
  {
    id: 2,
    title: 'Algebra',
    description: 'Algebraiska uttryck, ekvationer och formelhantering',
    emoji: '📝',
    sections: [
      {
        title: 'Algebraiska uttryck',
        content: 'I algebra använder vi bokstäver (variabler) för att representera okända tal eller tal som kan variera. Detta gör att vi kan beskriva generella samband och lösa problem.',
        keyPoints: [
          'Variabel: en bokstav som representerar ett tal',
          'Uttryck: kombination av tal, variabler och räknesätt',
          'Koefficient: talet framför variabeln (i 3x är 3 koefficienten)',
          'Term: del av ett uttryck som adderas eller subtraheras',
          'Lika termer: termer med samma variabler och exponenter',
          'Förenkla uttryck genom att samla lika termer'
        ]
      },
      {
        title: 'Ekvationer',
        content: 'En ekvation är en matematisk utsaga om att två uttryck är lika. Att lösa en ekvation innebär att hitta värdet på variabeln som gör ekvationen sann.',
        keyPoints: [
          'Likhet: vänsterled = högerled',
          'Lösning: det värde på x som gör ekvationen sann',
          'Ekvivalenta ekvationer: har samma lösning',
          'Addera/subtrahera samma tal på båda sidor',
          'Multiplicera/dividera med samma tal (≠0) på båda sidor',
          'Kontrollera alltid lösningen genom att sätta in den i ursprungsekvationen'
        ]
      },
      {
        title: 'Formler och omskrivning',
        content: 'Formler beskriver samband mellan olika storheter. Att kunna bryta ut en variabel ur en formel är en viktig färdighet.',
        keyPoints: [
          'Formel: ett algebraiskt uttryck som beskriver ett samband',
          'Exempel på formler: A = l · b, v = s/t, C = 2πr',
          'Bryt ut variabel: isolera önskad variabel på ena sidan',
          'Använd samma operationer på båda sidor',
          'Kontrollera genom att sätta in kända värden',
          'Tänk på enheter när du räknar med formler'
        ]
      }
    ],
    examples: [
      'Förenkla uttrycket: 3x + 2y - x + 5y',
      'Lös ekvationen: 2x + 5 = 13',
      'Lös ekvationen: 3(x - 2) = 15',
      'Bryt ut h ur formeln A = ½ · b · h'
    ],
    reflectionQuestions: [
      'Varför är algebra användbart i praktiska situationer?',
      'Hur vet du att du har löst en ekvation korrekt?',
      'Ge exempel på formler du använder i andra ämnen',
      'Vad innebär det att två ekvationer är ekvivalenta?'
    ]
  },
  {
    id: 3,
    title: 'Geometri',
    description: 'Geometriska figurer, mätning och pythagoras sats',
    emoji: '📐',
    sections: [
      {
        title: 'Tvådimensionella figurer',
        content: 'Geometri handlar om former, storlekar och deras egenskaper. Tvådimensionella figurer är plana figurer med area men ingen volym.',
        keyPoints: [
          'Triangel: tre sidor, summan av vinklarna är 180°',
          'Kvadrat: fyra lika långa sidor, fyra räta vinklar',
          'Rektangel: två par parallella sidor, fyra räta vinklar',
          'Cirkel: alla punkter lika långt från mittpunkten',
          'Area: ytinnehåll mätt i kvadratenheter (t.ex. m²)',
          'Omkrets: längden runt en figur'
        ]
      },
      {
        title: 'Pythagoras sats',
        content: 'Pythagoras sats är en av matematikens mest kända satser och beskriver sambandet mellan sidorna i en rätvinklig triangel.',
        keyPoints: [
          'Gäller endast för rätvinkliga trianglar',
          'a² + b² = c² där c är hypotenusan',
          'Hypotenusan är sidan mittemot den räta vinkeln',
          'Katetrar är de två kortare sidorna',
          'Används för att beräkna avstånd och längder',
          'Tillämpningar: byggteknik, navigation, koordinatgeometri'
        ]
      },
      {
        title: 'Tredimensionella kroppar',
        content: 'Tredimensionella kroppar har volym och ytarea. De vanligaste är prisma, cylinder, pyramid, kon och klot.',
        keyPoints: [
          'Volym: rymdinnehåll mätt i kubikenheter (t.ex. m³)',
          'Ytarea: sammanlagda arean av alla ytor',
          'Prisma: har två kongruenta basområden',
          'Cylinder: cirkulärt basområde, V = πr²h',
          'Pyramid: spetsig form, V = ⅓ · basarea · höjd',
          'Klot: perfekt rund kropp, V = 4/3 · πr³'
        ]
      }
    ],
    examples: [
      'Beräkna arean av en rektangel med sidorna 8 cm och 12 cm',
      'Beräkna hypotenusan i en rätvinklig triangel med katetrarna 3 cm och 4 cm',
      'Beräkna volymen av en cylinder med radie 5 cm och höjd 10 cm',
      'Hitta omkretsen av en cirkel med diameter 14 cm'
    ],
    reflectionQuestions: [
      'Varför är Pythagoras sats så användbar?',
      'Ge exempel på när du behöver beräkna area i vardagen',
      'Hur skiljer sig volym från area?',
      'Varför använder man π när man räknar med cirklar?'
    ]
  },
  {
    id: 4,
    title: 'Funktioner',
    description: 'Grundläggande funktionslära och linjära funktioner',
    emoji: '📈',
    sections: [
      {
        title: 'Funktionsbegreppet',
        content: 'En funktion är en regel som till varje ingångsvärde (x) kopplar exakt ett utgångsvärde (y). Funktioner används för att beskriva samband mellan storheter.',
        keyPoints: [
          'Funktion: varje x-värde ger exakt ett y-värde',
          'Definitionsmängd: alla tillåtna x-värden',
          'Värdemängd: alla möjliga y-värden',
          'Funktionsuttryck: t.ex. f(x) = 2x + 3',
          'Graf: visuell representation av funktionen',
          'Koordinatsystem: x-axel (horisontell) och y-axel (vertikal)'
        ]
      },
      {
        title: 'Linjära funktioner',
        content: 'En linjär funktion har formen f(x) = kx + m och representeras grafiskt av en rät linje. Linjära funktioner beskriver konstant förändring.',
        keyPoints: [
          'Allmän form: y = kx + m',
          'k = lutning (riktningskoefficient, förändring)',
          'm = y-intercept (skärning med y-axeln)',
          'Positiv k: linjen lutar uppåt',
          'Negativ k: linjen lutar nedåt',
          'k = 0: horisontell linje (konstant funktion)'
        ]
      },
      {
        title: 'Rita och tolka grafer',
        content: 'Att kunna rita och tolka grafer är centralt i matematiken. Grafer ger en visuell bild av sambandet mellan variabler.',
        keyPoints: [
          'Välj lämplig skala på axlarna',
          'Markera och namnge axlarna',
          'Rita punkter noggrant',
          'För linjära funktioner: behövs minst två punkter',
          'Lutning: Δy/Δx = förändring i y / förändring i x',
          'Tolka grafen: vad säger den om sambandet?'
        ]
      }
    ],
    examples: [
      'Rita grafen för f(x) = 2x - 1',
      'Bestäm k och m för linjen som går genom punkterna (0, 3) och (2, 7)',
      'Tolka grafen: en bil färdas enligt s(t) = 80t. Vad betyder k = 80?',
      'Vilket är funktionsvärdet för f(x) = 3x + 2 när x = 5?'
    ],
    reflectionQuestions: [
      'Vad betyder det att en funktion är linjär?',
      'Hur påverkar k och m linjens utseende?',
      'Ge exempel på linjära samband i verkligheten',
      'Varför är grafer användbara för att förstå samband?'
    ]
  },
  {
    id: 5,
    title: 'Statistik och sannolikhet',
    description: 'Datahantering, statistiska mått och grundläggande sannolikhet',
    emoji: '📊',
    sections: [
      {
        title: 'Datahantering',
        content: 'Statistik handlar om att samla in, organisera, analysera och presentera data för att kunna dra slutsatser om en population.',
        keyPoints: [
          'Population: hela den grupp man vill studera',
          'Urval: en del av populationen som undersöks',
          'Kvalitativa variabler: beskrivande (t.ex. färg, kön)',
          'Kvantitativa variabler: numeriska (t.ex. längd, ålder)',
          'Frekvens: antal gånger ett värde förekommer',
          'Diagramtyper: stapeldiagram, cirkeldiagram, linjediagram'
        ]
      },
      {
        title: 'Lägesmått och spridningsmått',
        content: 'För att beskriva och jämföra datamängder använder vi olika statistiska mått som beskriver var data ligger och hur spridd den är.',
        keyPoints: [
          'Medelvärde: summan av alla värden / antal värden',
          'Median: det mittersta värdet när data är sorterad',
          'Typvärde: det värde som förekommer flest gånger',
          'Variationsbredd: största värdet - minsta värdet',
          'Medelvärdet påverkas av extremvärden',
          'Medianen är mer robust mot extremvärden'
        ]
      },
      {
        title: 'Grundläggande sannolikhet',
        content: 'Sannolikhet beskriver hur troligt det är att en viss händelse inträffar. Sannolikhet anges som ett tal mellan 0 och 1 (eller 0% till 100%).',
        keyPoints: [
          'P(A) = antal gynnsamma utfall / antal möjliga utfall',
          'Sannolikhet är alltid mellan 0 och 1',
          'P = 0: omöjlig händelse',
          'P = 1: säker händelse',
          'P = 0,5: lika troligt som otroligt',
          'Komplementhändelse: P(ej A) = 1 - P(A)'
        ]
      }
    ],
    examples: [
      'Beräkna medelvärde, median och typvärde för datasetet: 3, 5, 5, 7, 8, 9, 12',
      'Tolka ett stapeldiagram över favoritfärger i en klass',
      'Vad är sannolikheten att få en sexa vid ett tärningskast?',
      'Vad är sannolikheten att dra ett hjärter från en kortlek med 52 kort?'
    ],
    reflectionQuestions: [
      'När är medelvärdet ett bättre mått än medianen?',
      'Hur kan statistik användas för att vilseleda?',
      'Ge exempel på situationer där du behöver beräkna sannolikhet',
      'Varför är det viktigt att ha ett representativt urval?'
    ]
  },
  {
    id: 6,
    title: 'Problemlösning',
    description: 'Strategier för att lösa matematiska problem',
    emoji: '💡',
    sections: [
      {
        title: 'Problemlösningsstrategier',
        content: 'Att lösa matematiska problem kräver strategiskt tänkande och systematiskt arbete. Det finns flera användbara strategier att tillämpa.',
        keyPoints: [
          'Förstå problemet: vad är givet? vad ska du hitta?',
          'Gör en plan: vilken strategi ska du använda?',
          'Utför planen: genomför beräkningarna',
          'Kontrollera svaret: är det rimligt?',
          'Reflektera: hur kunde du tänka annorlunda?',
          'Olika strategier: rita bild, gör tabell, gissa och kontrollera'
        ]
      },
      {
        title: 'Uppskattning och rimlighetsbedömning',
        content: 'Att kunna uppskatta svar och bedöma om ett resultat är rimligt är viktiga färdigheter som hjälper dig att undvika fel.',
        keyPoints: [
          'Avrundning: förenkla tal för snabbare uppskattning',
          'Storleksordning: är svaret för stort eller för litet?',
          'Enhetskontroll: stämmer enheterna i svaret?',
          'Jämförelse: kan du jämföra med något känt?',
          'Överlägsen uppskattning: större än verkligt värde',
          'Underlägsen uppskattning: mindre än verkligt värde'
        ]
      },
      {
        title: 'Matematisk kommunikation',
        content: 'Att kunna förklara sitt matematiska tänkande och resonemang är en viktig del av matematiken.',
        keyPoints: [
          'Skriv tydligt och strukturerat',
          'Använd matematiska symboler korrekt',
          'Förklara dina steg och resonemang',
          'Rita bilder och diagram när det hjälper',
          'Definiera variabler och begrepp',
          'Skriv en slutsats som svarar på frågan'
        ]
      }
    ],
    examples: [
      'Uppskatta produkten 48 × 52 genom att avrunda till 50 × 50',
      'En bil tankas med 47 liter bensin à 18,90 kr/liter. Uppskatta kostnaden',
      'Lös problemet: En rektangel har omkretsen 30 cm och ena sidan är 8 cm. Hur lång är den andra?',
      'Förklara varför 0,1 × 0,1 = 0,01'
    ],
    reflectionQuestions: [
      'Vilken problemlösningsstrategi använder du oftast?',
      'Hur vet du om ditt svar är rimligt?',
      'Varför är det viktigt att visa sina beräkningar?',
      'När är uppskattning tillräckligt och när behövs exakt svar?'
    ]
  }
];

export default function Matematik1b() {
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

  const storageKey = `@matematik1b_progress_${user?.id}`;

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
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📐</Text>
                <Text style={styles.heroTitle}>Matematik 1b</Text>
                <Text style={styles.heroDescription}>
                  Högskoleförberedande matematik
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
              <Edit3 size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity
            style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/flashcards/MATMAT01b')}
            activeOpacity={0.7}
          >
            <Sparkles size={24} color="#3B82F6" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>
              Öva med Flashcards
            </Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Matematik 1b är en högskoleförberedande kurs som ger dig grundläggande kunskaper i algebra, geometri och statistik. Kursen är obligatorisk för alla högskoleförberedande program.
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
                      <CheckCircle size={24} color="#3B82F6" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle, 
                      { color: theme.colors.text },
                      module.completed && { color: '#3B82F6' }
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
                            backgroundColor: '#3B82F6',
                            borderColor: '#3B82F6'
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
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#3B82F6' }]}
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
  moduleCardCompleted: { borderColor: '#3B82F6', borderWidth: 2, borderLeftWidth: 4 },
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
