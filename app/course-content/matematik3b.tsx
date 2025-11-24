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

interface CourseProgress { 
  progress: number; 
  targetGrade: string; 
  completedModules: number[]; 
}

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Derivata - Introduktion',
    description: 'Derivatans definition och grundläggande deriveringsregler',
    emoji: '📉',
    sections: [
      {
        title: 'Derivatans definition',
        content: 'Derivatan mäter hur snabbt en funktion förändras. Den är lutningen på tangenten till funktionens graf i en viss punkt.',
        keyPoints: [
          'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h',
          'Derivatan är lutningen på tangenten',
          'f\'(a) är förändringshastigheten i punkten x = a',
          'Grafiskt: tangentens riktningskoefficient',
          'Fysiskt: hastighet är derivatan av sträckan',
          'Acceleration är derivatan av hastigheten'
        ]
      },
      {
        title: 'Grundläggande deriveringsregler',
        content: 'För att derivera funktioner effektivt använder vi deriveringsregler istället för att använda definitionen varje gång.',
        keyPoints: [
          'Potensregeln: (xⁿ)\' = n · xⁿ⁻¹',
          'Konstantregeln: (c)\' = 0',
          'Konstant faktor: (c · f(x))\' = c · f\'(x)',
          'Summaregeln: (f + g)\' = f\' + g\'',
          'Exponentialfunktion: (eˣ)\' = eˣ',
          'Logaritm: (ln x)\' = 1/x'
        ]
      },
      {
        title: 'Tangentens ekvation',
        content: 'Tangenten till en funktions graf i en punkt är en rät linje som vidrör grafen i just den punkten.',
        keyPoints: [
          'Tangentens lutning = f\'(a)',
          'Punkten på kurvan: (a, f(a))',
          'Ekvation: y - f(a) = f\'(a)(x - a)',
          'Omskrivet: y = f\'(a) · x + [f(a) - a · f\'(a)]',
          'Använd punkt-riktningsformen',
          'Kontrollera att punkten ligger på både kurvan och tangenten'
        ]
      }
    ],
    examples: [
      'Derivera f(x) = x³ + 2x² - 5x + 1',
      'Derivera f(x) = 4x⁵ - 3x + 7',
      'Bestäm tangentens ekvation till f(x) = x² i punkten x = 2',
      'Bestäm f\'(3) om f(x) = 2x³ - 4x'
    ],
    reflectionQuestions: [
      'Vad betyder derivatan fysiskt och geometriskt?',
      'Varför är derivatan av en konstant alltid noll?',
      'Hur kan man använda derivatan för att hitta tangenten?',
      'Ge exempel på när derivator används i verkliga situationer'
    ]
  },
  {
    id: 2,
    title: 'Derivata - Tillämpningar',
    description: 'Monotonitet, extremvärden och optimering',
    emoji: '📊',
    sections: [
      {
        title: 'Monotonitet och extrempunkter',
        content: 'Derivatan ger information om en funktions beteende: var den växer, avtar och har extrempunkter.',
        keyPoints: [
          'f\'(x) > 0: funktionen växer (stigande)',
          'f\'(x) < 0: funktionen avtar (fallande)',
          'f\'(x) = 0: möjlig extrempunkt (stationär punkt)',
          'Maximum: derivatan byter tecken från + till -',
          'Minimum: derivatan byter tecken från - till +',
          'Terrasspunkt: derivatan byter inte tecken'
        ]
      },
      {
        title: 'Andraderivatan',
        content: 'Andraderivatan är derivatan av derivatan. Den ger information om kurvans krökning.',
        keyPoints: [
          'f\'\'(x) = (f\'(x))\'',
          'f\'\'(x) > 0: konvex (kurvan öppnar uppåt)',
          'f\'\'(x) < 0: konkav (kurvan öppnar nedåt)',
          'Inflektionspunkt: f\'\'(x) = 0 och byter tecken',
          'Användning: klassificera extrempunkter',
          'Om f\'(a) = 0 och f\'\'(a) > 0: lokalt minimum'
        ]
      },
      {
        title: 'Optimering',
        content: 'Optimering innebär att hitta det bästa värdet (maximum eller minimum) av en storhet inom givna begränsningar.',
        keyPoints: [
          'Identifiera variabeln att optimera',
          'Uttryck som funktion av en variabel',
          'Derivera och sätt derivatan = 0',
          'Kontrollera att det är max/min (teckentabell eller andraderivata)',
          'Glöm inte kontrollera randpunkter',
          'Tillämpningar: största area, kortaste väg, minimal kostnad'
        ]
      }
    ],
    examples: [
      'Bestäm extrempunkter för f(x) = x³ - 3x² - 9x + 5',
      'Undersök monotonitet för f(x) = 2x³ - 3x²',
      'En rektangel har omkretsen 40 cm. Vilket är största möjliga area?',
      'Bestäm inflektionspunkt för f(x) = x³ - 6x²'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan lokala och globala extrempunkter?',
      'Hur avgör man om en stationär punkt är max eller min?',
      'Varför är optimering viktigt i praktiska situationer?',
      'Vad betyder det att en funktion är konvex?'
    ]
  },
  {
    id: 3,
    title: 'Integraler - Introduktion',
    description: 'Primitiv funktion och bestämda integraler',
    emoji: '∫',
    sections: [
      {
        title: 'Primitiv funktion',
        content: 'En primitiv funktion F(x) till f(x) är en funktion vars derivata är f(x). Integration är den omvända operationen till derivering.',
        keyPoints: [
          'F\'(x) = f(x) betyder att F är primitiv till f',
          '∫ f(x) dx = F(x) + C',
          'C är integrationskonstanten (godtycklig konstant)',
          '∫ xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)',
          '∫ eˣ dx = eˣ + C',
          '∫ 1/x dx = ln|x| + C'
        ]
      },
      {
        title: 'Integrationstekniker',
        content: 'För att beräkna integraler använder vi olika tekniker och regler som gör beräkningarna enklare.',
        keyPoints: [
          'Konstantregeln: ∫ c · f(x) dx = c · ∫ f(x) dx',
          'Summaregeln: ∫ [f(x) + g(x)] dx = ∫ f(x) dx + ∫ g(x) dx',
          'Enkel substitution för sammansatta funktioner',
          'Tänk baklänges från deriveringsregler',
          'Kontrollera genom att derivera svaret',
          'Glöm inte integrationskonstanten C'
        ]
      },
      {
        title: 'Bestämd integral',
        content: 'Den bestämda integralen beräknar arean under en kurva mellan två gränser.',
        keyPoints: [
          '∫ₐᵇ f(x) dx = F(b) - F(a)',
          'F är primitiv funktion till f',
          'Geometrisk tolkning: area under kurvan',
          'Area under x-axeln räknas negativt',
          'Analysens huvudsats kopplar derivata och integral',
          'Används för att beräkna areor, volymer, medelvärden'
        ]
      }
    ],
    examples: [
      'Beräkna ∫ (3x² + 2x - 1) dx',
      'Beräkna ∫₁³ x² dx',
      'Beräkna ∫ 2eˣ dx',
      'Bestäm arean mellan f(x) = x² och x-axeln från x = 0 till x = 2'
    ],
    reflectionQuestions: [
      'Varför behövs integrationskonstanten C?',
      'Vad är skillnaden mellan bestämd och obestämd integral?',
      'Hur är integration och derivering relaterade?',
      'Varför kan area under x-axeln bli negativ?'
    ]
  },
  {
    id: 4,
    title: 'Integraler - Tillämpningar',
    description: 'Areor, volymer och medelvärden',
    emoji: '📐',
    sections: [
      {
        title: 'Area mellan kurvor',
        content: 'För att beräkna arean mellan två kurvor integrerar vi skillnaden mellan funktionerna.',
        keyPoints: [
          'Area = ∫ₐᵇ [f(x) - g(x)] dx där f(x) ≥ g(x)',
          'Hitta skärningspunkter för att bestämma gränser',
          'Rita alltid en skiss',
          'Dela upp i delområden om kurvorna korsar varandra',
          'Area är alltid positiv (ta absolutbelopp vid behov)',
          'Används i fysik, ekonomi och statistik'
        ]
      },
      {
        title: 'Volym av rotationskroppar',
        content: 'När en kurva roteras kring x-axeln bildas en rotationskropp. Volymen beräknas med integraler.',
        keyPoints: [
          'V = π ∫ₐᵇ [f(x)]² dx',
          'Rotation kring x-axeln',
          'Tänk på volymen som summan av många tunna skivor',
          'Varje skiva har volym π · [f(x)]² · dx',
          'Radien av skivan är f(x)',
          'Tillämpningar: kärl, behållare, geometriska kroppar'
        ]
      },
      {
        title: 'Medelvärden',
        content: 'Medelvärdet av en funktion över ett intervall beräknas med hjälp av integraler.',
        keyPoints: [
          'Medelvärde = (1/(b-a)) · ∫ₐᵇ f(x) dx',
          'Dividera integralen med intervallets längd',
          'Fysisk tolkning: genomsnittlig höjd',
          'Jämför med aritmetiskt medelvärde för diskreta värden',
          'Används för genomsnittlig temperatur, hastighet, etc.',
          'Kontinuerligt motsvarighet till summa/n'
        ]
      }
    ],
    examples: [
      'Beräkna arean mellan y = x² och y = x från x = 0 till x = 1',
      'Beräkna volymen då y = x roteras kring x-axeln mellan x = 0 och x = 2',
      'Bestäm medelvärdet av f(x) = x² på intervallet [0, 3]',
      'Beräkna arean mellan y = sin(x) och x-axeln från 0 till π'
    ],
    reflectionQuestions: [
      'Varför behöver man rita en skiss vid areaberäkning?',
      'Hur fungerar skivmetoden för volymberäkning?',
      'Vad är skillnaden mellan medelvärde och integral?',
      'Ge exempel på praktiska tillämpningar av integraler'
    ]
  },
  {
    id: 5,
    title: 'Funktioner och gränsvärden',
    description: 'Gränsvärden, kontinuitet och asymptoter',
    emoji: '∞',
    sections: [
      {
        title: 'Gränsvärden',
        content: 'Ett gränsvärde beskriver vad som händer med funktionsvärdet när x närmar sig ett visst värde.',
        keyPoints: [
          'lim(x→a) f(x) = L betyder att f(x) → L när x → a',
          'Vänster- och högergränsvärde kan vara olika',
          'Gränsvärde kan existera även om f(a) är odefinierad',
          'Räkneregler: lim(f + g) = lim f + lim g',
          'lim(x→∞) beskriver beteende för stora x',
          'Används för att studera funktioners beteende'
        ]
      },
      {
        title: 'Kontinuitet',
        content: 'En funktion är kontinuerlig i en punkt om det inte finns något "hopp" eller "hål" i grafen.',
        keyPoints: [
          'f kontinuerlig i a om: lim(x→a) f(x) = f(a)',
          'Tre villkor: f(a) definierad, gränsvärde existerar, de är lika',
          'Polynomfunktioner är kontinuerliga överallt',
          'Rationella funktioner kontinuerliga där nämnare ≠ 0',
          'Exponential- och logaritmfunktioner är kontinuerliga',
          'Kontinuitet är viktigt för satser som bisektionssatsen'
        ]
      },
      {
        title: 'Asymptoter',
        content: 'Asymptoter är linjer som funktionens graf närmar sig utan att någonsin nå dem.',
        keyPoints: [
          'Vertikal asymptot: x = a om lim(x→a) f(x) = ±∞',
          'Horisontell asymptot: y = b om lim(x→±∞) f(x) = b',
          'Sned asymptot: y = kx + m för rationella funktioner',
          'Rationella funktioner kan ha vertikala asymptoter där nämnare = 0',
          'Horisontell asymptot beskriver långsiktigt beteende',
          'Funktionen kan korsa horisontell/sned asymptot'
        ]
      }
    ],
    examples: [
      'Beräkna lim(x→2) (x² - 4)/(x - 2)',
      'Undersök kontinuitet för f(x) = { x² om x ≤ 1, 2x om x > 1 }',
      'Bestäm asymptoter för f(x) = (x² + 1)/(x - 2)',
      'Beräkna lim(x→∞) (3x² + 2x)/(x² - 1)'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan gränsvärde och funktionsvärde?',
      'Varför är kontinuitet viktigt?',
      'Hur hittar man asymptoter för en funktion?',
      'Kan en funktion korsa sin asymptot?'
    ]
  },
  {
    id: 6,
    title: 'Differentialekvationer',
    description: 'Enkla differentialekvationer och tillväxtmodeller',
    emoji: '🔄',
    sections: [
      {
        title: 'Introduktion till differentialekvationer',
        content: 'En differentialekvation är en ekvation som innehåller en funktion och dess derivata. De beskriver förändring.',
        keyPoints: [
          'Innehåller både f(x) och f\'(x)',
          'Lösningen är en funktion, inte ett tal',
          'Allmän lösning innehåller godtycklig konstant',
          'Partikulär lösning: bestämd genom begynnelsevillkor',
          'Används för att modellera dynamiska processer',
          'Exempel: f\'(x) = kf(x) ger exponentiell förändring'
        ]
      },
      {
        title: 'Separabla differentialekvationer',
        content: 'En separabel differentialekvation kan skrivas så att alla y på en sida och alla x på andra sidan.',
        keyPoints: [
          'Form: dy/dx = g(x)h(y)',
          'Separera variablerna: dy/h(y) = g(x)dx',
          'Integrera båda sidor',
          'Lös ut y om möjligt',
          'Använd begynnelsevillkor för att bestämma C',
          'Lösningsmetod: separation av variabler'
        ]
      },
      {
        title: 'Tillväxtmodeller',
        content: 'Differentialekvationer används för att modellera tillväxt och avklingning i naturen.',
        keyPoints: [
          'Exponentiell tillväxt: dy/dt = ky (k > 0)',
          'Exponentiell avklingning: dy/dt = -ky (k > 0)',
          'Lösning: y(t) = y₀ · eᵏᵗ',
          'Logistisk tillväxt: dy/dt = ky(1 - y/M)',
          'Tillämpningar: befolkning, bakterier, radioaktivitet',
          'Halveringstid och fördubblingstid'
        ]
      }
    ],
    examples: [
      'Lös differentialekvationen dy/dx = 2x med y(0) = 3',
      'Lös dy/dx = y/x med y(1) = 2',
      'En bakteriekultur växer enligt dy/dt = 0.3y. Om y(0) = 1000, vad är y(5)?',
      'Bestäm halveringstiden för ämne som sönderfaller enligt dy/dt = -0.1y'
    ],
    reflectionQuestions: [
      'Varför är lösningen till en differentialekvation en funktion?',
      'När används exponentiella tillväxtmodeller?',
      'Vad är skillnaden mellan allmän och partikulär lösning?',
      'Ge exempel på fenomen som beskrivs av differentialekvationer'
    ]
  }
];

export default function Matematik3b() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);
  const storageKey = `@matematik3b_progress_${user?.id}`;

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
            <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📈</Text>
                <Text style={styles.heroTitle}>Matematik 3b</Text>
                <Text style={styles.heroDescription}>Derivata och integraler</Text>
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
                {courseProgress.completedModules.length > 0 && (<View style={styles.quickStatItem}><CheckCircle size={16} color="#FCD34D" /><Text style={styles.quickStatText}>{courseProgress.completedModules.length} slutförda</Text></View>)}
                {courseProgress.targetGrade && (<View style={styles.quickStatItem}><Award size={16} color="#FCD34D" /><Text style={styles.quickStatText}>Mål: {courseProgress.targetGrade}</Text></View>)}
              </View>
            </LinearGradient>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} onPress={() => setShowEditModal(true)}><Edit3 size={20} color="#3B82F6" /></TouchableOpacity>
          </View>
        </SlideInView>
        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/MATMAT03b')} activeOpacity={0.7}>
            <Sparkles size={24} color="#3B82F6" /><Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>
        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>Matematik 3b behandlar derivata, integraler och differentialekvationer. Kursen ger dig verktyg för att analysera funktioner och modellera förändring.</Text>
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
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
                        <Text style={[styles.gradeButtonText, { color: theme.colors.text }, editTargetGrade === grade && { color: 'white' }]}>{grade}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]} onPress={() => setShowEditModal(false)}><Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#3B82F6' }]} onPress={handleSaveManualProgress}><Text style={[styles.modalButtonText, { color: 'white' }]}>Spara</Text></TouchableOpacity>
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
