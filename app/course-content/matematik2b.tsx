import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Edit3, X as CloseIcon, Award, TrendingUp, Sparkles } from 'lucide-react-native';
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
interface CourseProgress { progress: number; targetGrade: string; completedModules: number[] }

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Exponential- och potensekvationer',
    description: 'Potensregler och lösning av exponentialekvationer',
    emoji: '⚡',
    sections: [
      {
        title: 'Potenser och potensregler',
        content: 'Potenser är ett sätt att skriva upprepad multiplikation. När vi arbetar med potenser finns det flera viktiga regler som gör beräkningar enklare.',
        keyPoints: [
          'aⁿ = a · a · a · ... (n gånger)',
          'aᵐ · aⁿ = aᵐ⁺ⁿ',
          'aᵐ / aⁿ = aᵐ⁻ⁿ',
          '(aᵐ)ⁿ = aᵐⁿ',
          'a⁰ = 1 (om a ≠ 0)',
          'a⁻ⁿ = 1/aⁿ'
        ]
      },
      {
        title: 'Exponentialfunktioner',
        content: 'En exponentialfunktion har formen f(x) = C · aˣ där a > 0 och a ≠ 1. Dessa funktioner beskriver många naturliga processer som tillväxt och avtagande.',
        keyPoints: [
          'f(x) = C · aˣ där C är startvärde och a är bas',
          'Om a > 1: exponentiell tillväxt',
          'Om 0 < a < 1: exponentiell avtagande',
          'Grafen går alltid genom punkten (0, C)',
          'Tillväxtfaktor per enhet är konstant',
          'Används för befolkningstillväxt, radioaktivt sönderfall, ränta'
        ]
      },
      {
        title: 'Exponentialekvationer',
        content: 'För att lösa exponentialekvationer använder vi logaritmer eller försöker skriva båda sidor med samma bas.',
        keyPoints: [
          'Försök skriva båda sidor med samma bas',
          'Om aˣ = aʸ så är x = y',
          'Använd logaritmer för mer komplexa ekvationer',
          'log(aˣ) = x · log(a)',
          'Kontrollera alltid lösningen',
          'Exempel: 2ˣ = 8 ⟹ 2ˣ = 2³ ⟹ x = 3'
        ]
      }
    ],
    examples: [
      'Förenkla: 2³ · 2⁴',
      'Lös ekvationen: 3ˣ = 27',
      'Lös ekvationen: 2ˣ⁺¹ = 16',
      'En bakteriekultur fördubblas varje timme. Skriv en formel för antalet bakterier'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan exponentiell och linjär tillväxt?',
      'Varför är a⁰ = 1?',
      'Ge exempel på exponentiell tillväxt i verkligheten',
      'Hur kan man lösa exponentialekvationer när man inte kan hitta samma bas?'
    ]
  },
  {
    id: 2,
    title: 'Logaritmer',
    description: 'Logaritmer och logaritmekvationer',
    emoji: '📈',
    sections: [
      {
        title: 'Logaritmbegreppet',
        content: 'Logaritmen är den omvända operationen till exponentiering. Om aˣ = b så är log_a(b) = x.',
        keyPoints: [
          'log_a(b) = x betyder att aˣ = b',
          'log_a(a) = 1',
          'log_a(1) = 0',
          'log(10ˣ) = x (tiologaritm, lg)',
          'ln(eˣ) = x (naturlig logaritm)',
          'Logaritmen är bara definierad för positiva tal'
        ]
      },
      {
        title: 'Logaritmekvationer',
        content: 'Logaritmekvationer löses genom att använda logaritmernas egenskaper och relationen mellan logaritmer och exponenter.',
        keyPoints: [
          'log_a(x · y) = log_a(x) + log_a(y)',
          'log_a(x / y) = log_a(x) - log_a(y)',
          'log_a(xⁿ) = n · log_a(x)',
          'Basbyte: log_a(b) = lg(b) / lg(a)',
          'Om log(x) = log(y) så är x = y',
          'Kontrollera att lösningen ger positiva argument'
        ]
      },
      {
        title: 'Tillämpningar',
        content: 'Logaritmer används i många praktiska sammanhang såsom ljudnivå (decibel), jordbävningsstyrka (Richterskalan) och pH-värde.',
        keyPoints: [
          'Decibel: dB = 10 · log(I/I₀)',
          'Richterskalan: logaritmisk skala för jordbävningar',
          'pH-värde: pH = -log[H⁺]',
          'Förenkling av exponentiella samband',
          'Linjärisering av exponentiell data',
          'Finansmatematik: ränta och avbetalning'
        ]
      }
    ],
    examples: [
      'Lös ekvationen: log(x) = 2',
      'Lös ekvationen: log(x + 1) + log(x - 1) = log(8)',
      'Skriv om: log(x³) - log(y)',
      'En ljudnivå på 60 dB ökar till 80 dB. Hur mycket starkare är ljudet?'
    ],
    reflectionQuestions: [
      'Varför kan man inte ta logaritmen av negativa tal?',
      'Vad är skillnaden mellan lg och ln?',
      'Hur kan logaritmer användas för att lösa exponentialekvationer?',
      'Varför är logaritmiska skalor användbara?'
    ]
  },
  {
    id: 3,
    title: 'Trigonometri',
    description: 'Trigonometriska funktioner och trigonometriska ekvationer',
    emoji: '📐',
    sections: [
      {
        title: 'Enhetscirkeln',
        content: 'Enhetscirkeln är en cirkel med radie 1 centrerad i origo. Den används för att definiera trigonometriska funktioner för alla vinklar.',
        keyPoints: [
          'Radie = 1, centrum i origo',
          'Vinkel mäts från positiva x-axeln moturs',
          'cos(v) = x-koordinat',
          'sin(v) = y-koordinat',
          'tan(v) = sin(v) / cos(v) = y / x',
          'Viktiga vinklar: 0°, 30°, 45°, 60°, 90°'
        ]
      },
      {
        title: 'Trigonometriska funktioner',
        content: 'De trigonometriska funktionerna sin, cos och tan beskriver sambandet mellan vinklar och sidor i trianglar samt periodiska fenomen.',
        keyPoints: [
          'sin(v) och cos(v) har period 360° (2π radianer)',
          'tan(v) har period 180° (π radianer)',
          '-1 ≤ sin(v) ≤ 1 och -1 ≤ cos(v) ≤ 1',
          'tan(v) är odefinierad för v = 90° + n · 180°',
          'sin²(v) + cos²(v) = 1 (trigonometriska ettan)',
          'Används för att beskriva vågor, svängningar, pendlar'
        ]
      },
      {
        title: 'Trigonometriska ekvationer',
        content: 'Att lösa trigonometriska ekvationer innebär att hitta alla vinklar som uppfyller ekvationen inom ett givet intervall.',
        keyPoints: [
          'Använd enhetscirkeln för att hitta lösningar',
          'Tänk på periodicitet: lösningar upprepas',
          'Ange lösningar inom angivet intervall',
          'Använd miniräknare för att hitta grundlösning',
          'Hitta alla lösningar med hjälp av symmetri',
          'Exempel: sin(v) = 0.5 har lösningar v = 30° och v = 150°'
        ]
      }
    ],
    examples: [
      'Beräkna sin(30°), cos(60°) och tan(45°)',
      'Lös ekvationen: sin(x) = 0.5 för 0° ≤ x ≤ 360°',
      'Lös ekvationen: 2cos(x) = 1 för 0° ≤ x ≤ 360°',
      'En pendel svänger enligt y = 10·sin(2t). Vad är amplitud och period?'
    ],
    reflectionQuestions: [
      'Varför är sin(30°) = 0.5?',
      'Vad innebär det att trigonometriska funktioner är periodiska?',
      'Hur kan man använda enhetscirkeln för att lösa trigonometriska ekvationer?',
      'Ge exempel på periodiska fenomen som kan beskrivas med trigonometri'
    ]
  },
  {
    id: 4,
    title: 'Funktioner och grafer',
    description: 'Fördjupning i funktionslära, derivata och extrempunkter',
    emoji: '📊',
    sections: [
      {
        title: 'Funktionsanalys',
        content: 'Att analysera en funktion innebär att undersöka dess egenskaper: definitionsmängd, nollställen, extrempunkter och asympt oter.',
        keyPoints: [
          'Definitionsmängd: alla x-värden funktionen är definierad för',
          'Värdemängd: alla y-värden funktionen kan anta',
          'Nollställen: x-värden där f(x) = 0',
          'Extrempunkter: lokala maximi och minimi',
          'Asymptoter: linjer som grafen närmar sig',
          'Symmetri: jämn funktion (f(-x) = f(x)) eller udda (f(-x) = -f(x))'
        ]
      },
      {
        title: 'Derivata (introduktion)',
        content: 'Derivatan beskriver hur snabbt en funktion förändras. Den är lutningen på tangenten till funktionens graf.',
        keyPoints: [
          'f\'(x) = derivatan av f(x)',
          'Derivatan är lutningen på tangenten',
          'f\'(x) > 0: funktionen växer',
          'f\'(x) < 0: funktionen avtar',
          'f\'(x) = 0: möjlig extrempunkt',
          'Potensregeln: (xⁿ)\' = n · xⁿ⁻¹'
        ]
      },
      {
        title: 'Andragradsfunktioner',
        content: 'Andragradsfunktioner har formen f(x) = ax² + bx + c och beskriver parabelformade grafer.',
        keyPoints: [
          'Allmän form: f(x) = ax² + bx + c',
          'Parabel: om a > 0 öppnar den uppåt, om a < 0 nedåt',
          'Vertex (extrempunkt): x = -b/(2a)',
          'Nollställen: pq-formeln eller kvadratkomplettering',
          'Symmetrilinje: x = -b/(2a)',
          'Används för att beskriva kastbanor, optimering'
        ]
      }
    ],
    examples: [
      'Bestäm nollställen för f(x) = x² - 5x + 6',
      'Hitta extrempunkt för f(x) = -2x² + 8x + 3',
      'Skissa grafen för f(x) = (x - 2)² - 1',
      'En boll kastas uppåt. Höjden ges av h(t) = -5t² + 20t + 1. När når den max höjd?'
    ],
    reflectionQuestions: [
      'Vad säger derivatan om en funktions beteende?',
      'Hur hittar man extrempunkter för en funktion?',
      'Varför är andragradsfunktioner viktiga för att beskriva verkligheten?',
      'Vad är skillnaden mellan globala och lokala extrempunkter?'
    ]
  },
  {
    id: 5,
    title: 'Sannolikhet och kombinatorik',
    description: 'Sannolikhetsberäkning, kombinatorik och binomialfördelning',
    emoji: '🎲',
    sections: [
      {
        title: 'Kombinatorik',
        content: 'Kombinatorik handlar om att räkna antalet möjligheter på ett systematiskt sätt. Ordning och upprepning spelar roll.',
        keyPoints: [
          'Multiplikationsprincipen: totalt antal = sätt₁ · sätt₂ · ... · sättₙ',
          'Permutation: ordningen spelar roll',
          'n! = n · (n-1) · (n-2) · ... · 2 · 1 (n-fakultet)',
          'Permutationer av n element: n!',
          'Kombination: ordningen spelar inte roll',
          'nCr = n! / (r! · (n-r)!) antal sätt att välja r element ur n'
        ]
      },
      {
        title: 'Sannolikhetsregler',
        content: 'När man beräknar sannolikheter för sammansatta händelser behöver man kunna använda additions- och multiplikationsreglerna.',
        keyPoints: [
          'P(A eller B) = P(A) + P(B) - P(A och B)',
          'Om A och B är oförenliga: P(A eller B) = P(A) + P(B)',
          'P(A och B) = P(A) · P(B|A) (betingad sannolikhet)',
          'Om A och B är oberoende: P(A och B) = P(A) · P(B)',
          'P(A̅) = 1 - P(A) (komplementhändelse)',
          'Träddiagram är användbara för att visualisera'
        ]
      },
      {
        title: 'Binomialfördelning',
        content: 'Binomialfördelningen beskriver sannolikheten för ett visst antal framgångar i ett bestämt antal oberoende försök.',
        keyPoints: [
          'Upprepade oberoende försök med två utfall',
          'P(X = k) = nCk · pᵏ · (1-p)ⁿ⁻ᵏ',
          'n = antal försök',
          'k = antal framgångar',
          'p = sannolikhet för framgång i ett försök',
          'Väntevärde: E(X) = n · p'
        ]
      }
    ],
    examples: [
      'På hur många sätt kan 5 personer sitta i rad?',
      'På hur många sätt kan man välja 3 personer ur 10?',
      'Två tärningar kastas. Vad är sannolikheten att få summan 7?',
      'En mynt kastas 10 gånger. Vad är sannolikheten för exakt 6 krona?'
    ],
    reflectionQuestions: [
      'När använder man permutationer och när använder man kombinationer?',
      'Vad är skillnaden mellan oberoende och oförenliga händelser?',
      'När kan man använda binomialfördelningen?',
      'Hur kan träddiagram hjälpa vid sannolikhetsberäkningar?'
    ]
  },
  {
    id: 6,
    title: 'Räta linjen och ekvationssystem',
    description: 'Linjens ekvation och lösning av ekvationssystem',
    emoji: '📏',
    sections: [
      {
        title: 'Linjens ekvation',
        content: 'En rät linje kan beskrivas på flera olika sätt med ekvationer. Varje form har sina fördelar beroende på situationen.',
        keyPoints: [
          'y = kx + m (k-form: k = lutning, m = skärning med y-axeln)',
          'y - y₁ = k(x - x₁) (punkt-riktningsform)',
          'ax + by + c = 0 (allmän form)',
          'Lutning k = Δy/Δx = (y₂ - y₁)/(x₂ - x₁)',
          'Parallella linjer: samma lutning',
          'Vinkelräta linjer: k₁ · k₂ = -1'
        ]
      },
      {
        title: 'Ekvationssystem',
        content: 'Ett ekvationssystem består av flera ekvationer som ska gälla samtidigt. Lösningen är de värden på variablerna som uppfyller alla ekvationer.',
        keyPoints: [
          'Grafisk metod: hitta skärningspunkt mellan linjer',
          'Substitutionsmetoden: lös ut en variabel',
          'Additionsmetoden: addera/subtrahera ekvationer',
          'Ett system kan ha: en lösning, ingen lösning eller oändligt många',
          'Två parallella linjer: ingen lösning',
          'Samma linje: oändligt många lösningar'
        ]
      },
      {
        title: 'Tillämpningar',
        content: 'Ekvationssystem används för att lösa praktiska problem där flera villkor ska uppfyllas samtidigt.',
        keyPoints: [
          'Blandningsproblem: blanda olika koncentrationer',
          'Rörelseproblem: hastighet, tid och sträcka',
          'Ekonomiska problem: pris och kvantitet',
          'Geometriska problem: skärningspunkter',
          'Optimering: hitta bästa lösningen',
          'Modellering av verkliga situationer'
        ]
      }
    ],
    examples: [
      'Bestäm ekvationen för linjen genom (2, 3) med lutning k = 2',
      'Lös systemet: x + y = 5 och 2x - y = 1',
      'Hitta skärningspunkten mellan y = 2x + 1 och y = -x + 4',
      'Två cyklister startar samtidigt. Den ena cyklar 15 km/h, den andra 20 km/h. När möts de?'
    ],
    reflectionQuestions: [
      'När är det lämpligt att använda respektive lösningsmetod?',
      'Vad innebär det geometriskt när ett ekvationssystem saknar lösning?',
      'Hur kan man kontrollera att en lösning är korrekt?',
      'Ge exempel på när ekvationssystem används i praktiken'
    ]
  }
];

export default function Matematik2b() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);
  const storageKey = `@matematik2b_progress_${user?.id}`;

  useEffect(() => { loadProgress(); }, [user?.id]);

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
      await saveProgress({ ...courseProgress, progress: progressValue, targetGrade: editTargetGrade });
      Alert.alert('Framgång! ✅', 'Kursinformation har uppdaterats');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SlideInView direction="up" delay={100}>
          <View>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📊</Text>
                <Text style={styles.heroTitle}>Matematik 2b</Text>
                <Text style={styles.heroDescription}>Fördjupning i algebra och funktioner</Text>
              </View>
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Kursframsteg</Text>
                  <Text style={styles.progressPercent}>{courseProgress.progress}%</Text>
                </View>
                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${courseProgress.progress}%` }]} /></View>
                <Text style={styles.progressText}>{courseProgress.completedModules.length} av {modulesData.length} moduler slutförda</Text>
              </View>
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.quickStatText}>{courseProgress.progress}% klar</Text>
                </View>
                {courseProgress.completedModules.length > 0 && (
                  <View style={styles.quickStatItem}>
                    <CheckCircle size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>{courseProgress.completedModules.length} slutförda</Text>
                  </View>
                )}
                {courseProgress.targetGrade && (
                  <View style={styles.quickStatItem}>
                    <Award size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>Mål: {courseProgress.targetGrade}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} onPress={() => setShowEditModal(true)}>
              <Edit3 size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </SlideInView>
        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/MATMAT02b')} activeOpacity={0.7}>
            <Sparkles size={24} color="#8B5CF6" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>
        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>Matematik 2b bygger vidare på Matematik 1b med fokus på funktioner, trigonometri och sannolikhet. Kursen förbereder för vidare studier inom matematik och naturvetenskap.</Text>
          </View>
        </FadeInView>
        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          {modules.map((module, index) => (
            <FadeInView key={module.id} delay={300 + index * 100}>
              <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: theme.colors.card }, module.completed && styles.moduleCardCompleted]}
                onPress={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <TouchableOpacity style={styles.checkboxContainer} onPress={(e) => { e.stopPropagation(); toggleModuleCompletion(module.id); }}>
                    {module.completed ? <CheckCircle size={24} color="#8B5CF6" /> : <Circle size={24} color={theme.colors.textMuted} />}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[styles.moduleTitle, { color: theme.colors.text }, module.completed && { color: '#8B5CF6' }]}>
                      Modul {module.id}: {module.title}
                    </Text>
                    <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>{module.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </ScrollView>
      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera kursinformation</Text>
                <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => setShowEditModal(false)}>
                  <CloseIcon size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Framsteg (%)</Text>
                  <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} value={editProgress} onChangeText={setEditProgress} keyboardType="numeric" placeholder="0-100" placeholderTextColor={theme.colors.textMuted} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Målbetyg</Text>
                  <View style={styles.gradeButtons}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
                        <Text style={[styles.gradeButtonText, { color: theme.colors.text }, editTargetGrade === grade && { color: 'white' }]}>{grade}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]} onPress={() => setShowEditModal(false)}>
                  <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#8B5CF6' }]} onPress={handleSaveManualProgress}>
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
  container: { flex: 1 }, header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }, backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }, scrollContent: { paddingBottom: 100 }, heroCard: { marginHorizontal: 24, borderRadius: 24, padding: 32, marginBottom: 24 }, heroContent: { alignItems: 'center' }, heroIcon: { fontSize: 64, marginBottom: 16 }, heroTitle: { fontSize: 28, fontWeight: '700' as const, color: 'white', textAlign: 'center', marginBottom: 8 }, heroDescription: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24 }, introSection: { marginHorizontal: 24, marginBottom: 24, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, introTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 }, introText: { fontSize: 16, lineHeight: 24 }, modulesSection: { paddingHorizontal: 24, marginBottom: 24 }, sectionTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 16 }, moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 }, checkboxContainer: { padding: 4 }, moduleCardCompleted: { borderColor: '#8B5CF6', borderWidth: 2, borderLeftWidth: 4 }, moduleEmoji: { fontSize: 40 }, moduleTitleContainer: { flex: 1 }, moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 }, moduleDescription: { fontSize: 14, lineHeight: 20 }, progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginTop: 16 }, progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, progressLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' as const }, progressPercent: { fontSize: 18, color: 'white', fontWeight: 'bold' as const }, progressBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, marginBottom: 8 }, progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 }, progressText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }, quickStats: { flexDirection: 'row', gap: 16, marginTop: 12 }, quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 }, quickStatText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' as const }, editButton: { position: 'absolute', top: 20, right: 44, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }, modalContainer: { width: '90%', maxWidth: 400 }, modalContent: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' }, modalTitle: { fontSize: 20, fontWeight: 'bold' as const, flex: 1 }, modalCloseButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, modalBody: { padding: 20 }, inputGroup: { marginBottom: 20 }, inputLabel: { fontSize: 16, fontWeight: '600' as const, marginBottom: 8 }, input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 }, gradeButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, gradeButton: { flex: 1, minWidth: 50, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' }, gradeButtonText: { fontSize: 16, fontWeight: 'bold' as const }, modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' }, modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, modalCancelButton: { borderWidth: 2 }, modalSaveButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }, modalButtonText: { fontSize: 16, fontWeight: '600' as const }, flashcardsButton: { marginHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, flashcardsButtonText: { fontSize: 16, fontWeight: '700' as const }
});
