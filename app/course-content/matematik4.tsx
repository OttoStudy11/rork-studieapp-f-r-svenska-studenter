import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Edit3, X as CloseIcon, Award, TrendingUp, Sparkles } from 'lucide-react-native';
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
    title: 'Komplexa tal',
    description: 'Rektangulär och polär form, operationer med komplexa tal',
    emoji: '🔢',
    sections: [
      {
        title: 'Komplexa talets uppbyggnad',
        content: 'Ett komplext tal är ett tal som kan skrivas på formen z = a + bi där a och b är reella tal och i är den imaginära enheten med egenskapen i² = -1.',
        keyPoints: [
          'z = a + bi där a är realdel och b är imaginärdel',
          'i² = -1 (imaginära enheten)',
          'Re(z) = a (realdelen)',
          'Im(z) = b (imaginärdelen)',
          'Komplexa talplanet: Re-axel (horisontell), Im-axel (vertikal)',
          'Varje komplext tal motsvarar en punkt i planet'
        ]
      },
      {
        title: 'Räkning med komplexa tal',
        content: 'Komplexa tal adderas, subtraheras, multipliceras och divideras enligt algebraiska regler med hänsyn till att i² = -1.',
        keyPoints: [
          'Addition: (a + bi) + (c + di) = (a+c) + (b+d)i',
          'Multiplikation: (a + bi)(c + di) = (ac - bd) + (ad + bc)i',
          'Konjugatet: z̄ = a - bi',
          'Absolutbelopp: |z| = √(a² + b²)',
          'Division: dela med konjugatet i nämnaren',
          'z · z̄ = |z|²'
        ]
      },
      {
        title: 'Polär form',
        content: 'Ett komplext tal kan också skrivas på polär form med hjälp av absolutbelopp och argument.',
        keyPoints: [
          'z = r(cos θ + i sin θ) = r·cis θ',
          'r = |z| = √(a² + b²) (absolutbeloppet)',
          'θ = arg(z) (argumentet, vinkeln)',
          'tan θ = b/a',
          'Konvertering mellan rektangulär och polär form',
          'Polär form underlättar multiplikation och division'
        ]
      }
    ],
    examples: [
      'Beräkna (3 + 2i) + (1 - 4i)',
      'Beräkna (2 + i)(3 - 2i)',
      'Skriv z = 1 + i på polär form',
      'Beräkna |3 + 4i|'
    ],
    reflectionQuestions: [
      'Varför introducerades komplexa tal?',
      'Vad är skillnaden mellan rektangulär och polär form?',
      'När är polär form mer användbar?',
      'Vad representerar absolutbeloppet geometriskt?'
    ]
  },
  {
    id: 2,
    title: 'Polynom och polynomekvationer',
    description: 'Faktorisering, polynomdivision och nollställen',
    emoji: '🎯',
    sections: [
      {
        title: 'Polynom',
        content: 'Ett polynom är ett uttryck av formen P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Graden av polynomet är högsta exponenten.',
        keyPoints: [
          'P(x) = aₙxⁿ + ... + a₁x + a₀',
          'Grad n: högsta exponenten',
          'Koefficienter: a₀, a₁, ..., aₙ',
          'Ett polynom av grad n har högst n nollställen',
          'Nollställe: P(x) = 0',
          'Faktorisering: skriva som produkt av faktorer'
        ]
      },
      {
        title: 'Polynomdivision',
        content: 'Polynomdivision används för att dela ett polynom med ett annat. Restteoremet säger att resten vid division med (x - a) är P(a).',
        keyPoints: [
          'P(x) = Q(x) · D(x) + R(x)',
          'Q(x) är kvoten, R(x) är resten',
          'Restteoremet: P(x) = (x - a)Q(x) + P(a)',
          'Om P(a) = 0 så är (x - a) en faktor',
          'Faktorsatsen: (x - a) är faktor ⟺ P(a) = 0',
          'Syntetisk division för (x - a)'
        ]
      },
      {
        title: 'Polynomekvationer',
        content: 'Att lösa polynomekvationer innebär att hitta alla nollställen. För grad ≤ 2 finns formler, för högre grader används faktorisering.',
        keyPoints: [
          'Andragradsekvation: pq-formeln eller kvadratkomplettering',
          'Tredjegradsekvation: prova rationella rötter',
          'Fundamentalsatsen: polynom av grad n har n komplexa rötter',
          'Konjugatrotsatsen: komplexa rötter kommer i par',
          'Om z är rot så är z̄ också rot (reella koefficienter)',
          'Faktorisering ger alla rötter'
        ]
      }
    ],
    examples: [
      'Faktorisera P(x) = x³ - 2x² - 5x + 6',
      'Lös ekvationen x³ - 6x² + 11x - 6 = 0',
      'Utför polynomdivision: (x³ + 2x² - x - 2) / (x - 1)',
      'Bestäm alla nollställen för P(x) = x⁴ - 1'
    ],
    reflectionQuestions: [
      'Varför har ett polynom av grad n exakt n komplexa rötter?',
      'När kommer komplexa rötter i konjugatpar?',
      'Hur kan man använda restteoremet för att hitta faktorer?',
      'Ge exempel på tillämpningar av polynomekvationer'
    ]
  },
  {
    id: 3,
    title: 'Trigonometriska funktioner och formler',
    description: 'Fördjupning i trigonometri, formler och identiteter',
    emoji: '📐',
    sections: [
      {
        title: 'Trigonometriska identiteter',
        content: 'Trigonometriska identiteter är ekvationer som gäller för alla värden på variabeln. De används för att förenkla uttryck och lösa ekvationer.',
        keyPoints: [
          'sin²v + cos²v = 1 (trigonometriska ettan)',
          'tan v = sin v / cos v',
          '1 + tan²v = 1/cos²v',
          'sin(-v) = -sin v (udda funktion)',
          'cos(-v) = cos v (jämn funktion)',
          'sin(π/2 - v) = cos v'
        ]
      },
      {
        title: 'Additions- och subtraktionsformler',
        content: 'Additionsformlerna används för att beräkna trigonometriska funktioner av summor och differenser av vinklar.',
        keyPoints: [
          'sin(u ± v) = sin u cos v ± cos u sin v',
          'cos(u ± v) = cos u cos v ∓ sin u sin v',
          'tan(u ± v) = (tan u ± tan v) / (1 ∓ tan u tan v)',
          'Dubbelvinkelformler: sin 2v = 2 sin v cos v',
          'cos 2v = cos²v - sin²v = 2cos²v - 1 = 1 - 2sin²v',
          'Halvvinkelformler kan härledas från dubbelvinkelformler'
        ]
      },
      {
        title: 'Trigonometriska ekvationer',
        content: 'Komplexa trigonometriska ekvationer löses med hjälp av identiteter och substitution.',
        keyPoints: [
          'Använd trigonometriska identiteter',
          'Substitution: sätt t = sin v eller t = cos v',
          'Enhetscirkeln för att hitta alla lösningar',
          'Periodicitet: lägg till 360° · n eller 2π · n',
          'Kontrollera alla lösningar i intervallet',
          'Använd additionsformler vid behov'
        ]
      }
    ],
    examples: [
      'Förenkla sin²v + cos²v + tan²v',
      'Bevisa att sin 2v = 2 sin v cos v',
      'Lös ekvationen 2sin²x - 3sin x + 1 = 0 för 0° ≤ x ≤ 360°',
      'Beräkna sin 75° med hjälp av additionsformeln'
    ],
    reflectionQuestions: [
      'Varför är trigonometriska identiteter användbara?',
      'Hur kan man härleda dubbelvinkelformler från additionsformler?',
      'När bör man använda substitution vid lösning av ekvationer?',
      'Ge exempel på tillämpningar av trigonometri i verkligheten'
    ]
  },
  {
    id: 4,
    title: 'Exponential- och logaritmfunktioner',
    description: 'Fördjupning i exponential- och logaritmfunktioner',
    emoji: '📈',
    sections: [
      {
        title: 'Naturliga logaritmen',
        content: 'Den naturliga logaritmen ln har basen e ≈ 2.718. Den är den omvända funktionen till eˣ.',
        keyPoints: [
          'ln(eˣ) = x och e^(ln x) = x',
          'e ≈ 2.71828... (Eulers tal)',
          'ln(ab) = ln a + ln b',
          'ln(a/b) = ln a - ln b',
          'ln(aⁿ) = n ln a',
          'Derivata: (ln x)\' = 1/x'
        ]
      },
      {
        title: 'Exponentialfunktionen eˣ',
        content: 'Exponentialfunktionen eˣ är den unika funktionen som är sin egen derivata. Den har viktiga tillämpningar i matematik och naturvetenskap.',
        keyPoints: [
          '(eˣ)\' = eˣ',
          'e⁰ = 1',
          'eᵃ · eᵇ = eᵃ⁺ᵇ',
          'eᵃ / eᵇ = eᵃ⁻ᵇ',
          '(eᵃ)ⁿ = eᵃⁿ',
          'Används i tillväxtmodeller och differentialekvationer'
        ]
      },
      {
        title: 'Logaritmekvationer och exponentialekvationer',
        content: 'Komplexa ekvationer med logaritmer och exponenter löses genom att använda logaritmlagarna och ta logaritmer.',
        keyPoints: [
          'Ta logaritmen av båda sidor',
          'Använd logaritmlagarna för att förenkla',
          'Basbyte: logₐ b = ln b / ln a',
          'Exponentialekvationer: ta ln av båda sidor',
          'Logaritmekvationer: använd logaritmlagarna',
          'Kontrollera definitionsmängd (ln x kräver x > 0)'
        ]
      }
    ],
    examples: [
      'Lös ekvationen eˣ = 5',
      'Lös ekvationen ln(x + 1) + ln(x - 1) = ln 8',
      'Förenkla: ln(e³) + ln(1/e²)',
      'Lös 2ˣ = 10 (tips: använd ln)'
    ],
    reflectionQuestions: [
      'Varför är e så viktigt i matematiken?',
      'Vad är skillnaden mellan ln och log?',
      'När ska man ta logaritmen av båda sidor?',
      'Ge exempel på exponentiell tillväxt i naturen'
    ]
  },
  {
    id: 5,
    title: 'Derivata - Fördjupning',
    description: 'Kedjeregeln, produktregeln och kvotregeln',
    emoji: '∂',
    sections: [
      {
        title: 'Deriveringsregler för sammansatta funktioner',
        content: 'För att derivera mer komplexa funktioner behöver vi kedjeregeln, produktregeln och kvotregeln.',
        keyPoints: [
          'Kedjeregeln: (f(g(x)))\' = f\'(g(x)) · g\'(x)',
          'Produktregeln: (u · v)\' = u\' · v + u · v\'',
          'Kvotregeln: (u/v)\' = (u\' · v - u · v\') / v²',
          'Används för sammansatta funktioner',
          'Inre och yttre derivata vid kedjeregeln',
          'Kombinera regler för komplexa funktioner'
        ]
      },
      {
        title: 'Derivering av elementära funktioner',
        content: 'Derivator av trigonometriska, exponentiella och logaritmfunktioner.',
        keyPoints: [
          '(sin x)\' = cos x',
          '(cos x)\' = -sin x',
          '(tan x)\' = 1/cos²x',
          '(eˣ)\' = eˣ',
          '(ln x)\' = 1/x',
          '(aˣ)\' = aˣ · ln a'
        ]
      },
      {
        title: 'Implicit derivering',
        content: 'När funktionen inte är given på formen y = f(x) kan vi använda implicit derivering.',
        keyPoints: [
          'Derivera båda sidor med avseende på x',
          'Använd kedjeregeln för termer med y',
          'dy/dx behandlas som en faktor',
          'Lös ut dy/dx ur ekvationen',
          'Används för ekvationer som är svåra att lösa ut y',
          'Exempel: cirklar, ellipser'
        ]
      }
    ],
    examples: [
      'Derivera f(x) = (2x + 1)³',
      'Derivera f(x) = x² · sin x',
      'Derivera f(x) = (x + 1)/(x - 1)',
      'Bestäm dy/dx om x² + y² = 25'
    ],
    reflectionQuestions: [
      'När använder man kedjeregeln?',
      'Hur kan man komma ihåg produktregeln?',
      'Varför behövs implicit derivering?',
      'Ge exempel på när man behöver kombinera flera deriveringsregler'
    ]
  },
  {
    id: 6,
    title: 'Integraler - Fördjupning',
    description: 'Partiell integration och substitution',
    emoji: '∫∫',
    sections: [
      {
        title: 'Variabelsubstitution',
        content: 'Variabelsubstitution (u-substitution) används för att förenkla integraler genom att införa en ny variabel.',
        keyPoints: [
          'Sätt u = g(x) där g(x) är en inre funktion',
          'Beräkna du = g\'(x) dx',
          'Byt ut x-uttryck mot u-uttryck',
          'Integrera med avseende på u',
          'Byt tillbaka u mot x',
          'För bestämda integraler: byt även integrationsgränser'
        ]
      },
      {
        title: 'Partiell integration',
        content: 'Partiell integration är motsvarigheten till produktregeln för derivering. Den används när integranden är en produkt.',
        keyPoints: [
          '∫ u dv = uv - ∫ v du',
          'Välj u och dv klokt (LIATE-regeln)',
          'LIATE: Logaritm, Invers trig, Algebraisk, Trig, Exponentiell',
          'Ibland behövs upprepade tillämpningar',
          'Används för produkter av olika funktionstyper',
          'Kontrollera genom att derivera resultatet'
        ]
      },
      {
        title: 'Tillämpningar',
        content: 'Integraler används för att beräkna areor, volymer, medelv ärden och i fysikaliska tillämpningar.',
        keyPoints: [
          'Area under kurva: ∫ₐᵇ f(x) dx',
          'Volym av rotationskropp: V = π ∫ₐᵇ [f(x)]² dx',
          'Båglängd: L = ∫ₐᵇ √(1 + [f\'(x)]²) dx',
          'Arbete: W = ∫ F dx',
          'Medelværde: f̄ = (1/(b-a)) ∫ₐᵇ f(x) dx',
          'Många fysikaliska storheter definieras med integraler'
        ]
      }
    ],
    examples: [
      'Beräkna ∫ 2x · e^(x²) dx med substitution',
      'Beräkna ∫ x · sin x dx med partiell integration',
      'Beräkna ∫ x · eˣ dx',
      'Beräkna volymen då y = √x roteras kring x-axeln från x = 0 till x = 4'
    ],
    reflectionQuestions: [
      'Hur vet man när man ska använda substitution?',
      'Hur väljer man u och dv i partiell integration?',
      'Vad är sambandet mellan partiell integration och produktregeln?',
      'Ge exempel på fysikaliska tillämpningar av integraler'
    ]
  }
];

export default function Matematik4() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);
  const storageKey = `@matematik4_progress_${user?.id}`;

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const progress = JSON.parse(stored);
          setCourseProgress(progress);
          setEditProgress(progress.progress.toString());
          setEditTargetGrade(progress.targetGrade);
          const updatedModules = modulesData.map(module => ({ ...module, completed: progress.completedModules.includes(module.id) }));
          setModules(updatedModules);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };
    loadProgress();
  }, [user?.id, storageKey]);

  const saveProgress = async (progress: CourseProgress) => {
    if (!user?.id) return;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(progress));
      setCourseProgress(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleSaveManualProgress = async () => {
    try {
      const progressValue = parseInt(editProgress, 10);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        Alert.alert('Fel', 'Progress måste vara ett tal mellan 0 och 100');
        return;
      }
      const newProgress = { ...courseProgress, progress: progressValue, targetGrade: editTargetGrade };
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
                <Text style={styles.heroIcon}>🎓</Text>
                <Text style={styles.heroTitle}>Matematik 4</Text>
                <Text style={styles.heroDescription}>Avancerad matematik och komplexa tal</Text>
              </View>
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Kursframsteg</Text>
                  <Text style={styles.progressPercent}>{courseProgress.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${courseProgress.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{courseProgress.completedModules.length} av {modulesData.length} moduler slutförda</Text>
              </View>
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}><TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" /><Text style={styles.quickStatText}>{courseProgress.progress}% klar</Text></View>
                {courseProgress.targetGrade && (<View style={styles.quickStatItem}><Award size={16} color="#FCD34D" /><Text style={styles.quickStatText}>Mål: {courseProgress.targetGrade}</Text></View>)}
              </View>
            </LinearGradient>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} onPress={() => setShowEditModal(true)}><Edit3 size={20} color="#8B5CF6" /></TouchableOpacity>
          </View>
        </SlideInView>
        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/MATMAT04')} activeOpacity={0.7}>
            <Sparkles size={24} color="#8B5CF6" /><Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>
        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>Matematik 4 är en fördjupningskurs som behandlar komplexa tal, polynomekvationer, avancerad trigonometri och fördjupade deriveringstekniker.</Text>
          </View>
        </FadeInView>
        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          {modules.map((module, index) => (
            <FadeInView key={module.id} delay={300 + index * 100}>
              <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
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
      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera kursinformation</Text>
                <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => setShowEditModal(false)}><CloseIcon size={20} color={theme.colors.textMuted} /></TouchableOpacity>
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
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]} onPress={() => setShowEditModal(false)}><Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#8B5CF6' }]} onPress={handleSaveManualProgress}><Text style={[styles.modalButtonText, { color: 'white' }]}>Spara</Text></TouchableOpacity>
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
  flashcardsButton: { marginHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  flashcardsButtonText: { fontSize: 16, fontWeight: '700' as const },
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
});
