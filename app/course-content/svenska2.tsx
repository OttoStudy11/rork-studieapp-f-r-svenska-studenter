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
    title: 'Litteraturhistoria och epoker',
    description: 'Från medeltiden till modern tid',
    emoji: '📜',
    sections: [
      {
        title: 'Medeltiden och reformationen',
        content: 'Litteraturen under medeltiden präglades av religiösa texter, riddarsagor och folksagor. Efter reformationen ökade användningen av svenska språket i skrift.',
        keyPoints: [
          'Religiösa texter dominerade: psalmböcker, bibeln',
          'Muntlig tradition: folkvisor och sagor',
          'Latin som bokspråk, svenska som talspråk',
          'Reformationen 1527: bibelöversättning till svenska',
          'Gustav Vasas bibel 1541',
          'Ökad läskunnighet och bokproduktion'
        ]
      },
      {
        title: 'Upplysningstiden och romantiken',
        content: 'Under 1700-talet kom upplysningstidens rationella ideal, följt av romantikens känslor och nationalism under tidigt 1800-tal.',
        keyPoints: [
          'Upplysningen: förnuft, vetenskap, bildning',
          'Svenska akademien grundades 1786',
          'Romantiken: känslor, natur, nationalism',
          'Esaias Tegnér: "Frithiofs saga"',
          'Erik Gustaf Geijer: historiska verk',
          'Folkbildning och nationellt uppvaknande'
        ]
      },
      {
        title: 'Modern tid: 1900-talet och framåt',
        content: 'Det 20:e århundradet förde med sig modernism, arbetarlitteratur och postmodernism. Idag präglas litteraturen av mångfald.',
        keyPoints: [
          'Modernism: experimentellt, fragmenterat',
          'Arbetarlitteratur: Vilhelm Moberg, Ivar Lo-Johansson',
          'Efterkrigslitteratur: existentialism',
          'Postmodernism: lek med former',
          'Samtida litteratur: mångkulturell, digital',
          'Nobelpriset i litteratur: svenska författare'
        ]
      }
    ],
    examples: [
      'Läs och analysera ett diktverk från romantiken',
      'Jämför en medeltida saga med en modern tolkning',
      'Tidslinje över svensk litteraturhistoria',
      'Analys av modernistisk poesi'
    ],
    reflectionQuestions: [
      'Hur speglar litteraturen samhällets utveckling?',
      'Vad kännetecknar respektive epok?',
      'Hur har synen på kvinnor i litteraturen förändrats över tid?',
      'Vilka samhällsfrågor belyser modern litteratur?'
    ]
  },
  {
    id: 2,
    title: 'Fördjupad textanalys',
    description: 'Analysera skönlitteratur på djupet',
    emoji: '🔍',
    sections: [
      {
        title: 'Narratologi och berättarteknik',
        content: 'Narratologi är läran om berättande. Att förstå berättartekniker hjälper dig att analysera hur en text är konstruerad.',
        keyPoints: [
          'Berättarperspektiv: jagberättare, allvetande, begränsad',
          'Berättarnivåer: extradiegetisk, intradiegetisk',
          'Fokalisering: vem ser vi händelserna genom?',
          'Berättartid vs berättad tid',
          'Analepsis (flashback) och prolepsis (framåtblick)',
          'Pålitlig vs opålitlig berättare'
        ]
      },
      {
        title: 'Tematisk analys',
        content: 'Teman är de underliggande idéer och budskap som genomsyrar en text. En text kan ha flera teman som samverkar.',
        keyPoints: [
          'Huvudtema vs biteman',
          'Universella teman: kärlek, död, makt, frihet',
          'Samhällskritiska teman',
          'Symbolik och motiv',
          'Hur teman utvecklas genom texten',
          'Författarens budskap och syfte'
        ]
      },
      {
        title: 'Stilanalys och språk',
        content: 'Författarens språkval skapar stil och stämning. Stilanalys undersöker ordval, meningsbyggnad och retoriska grepp.',
        keyPoints: [
          'Stilnivå: hög, neutral, låg',
          'Bildspråk: metaforer, liknelser, symboler',
          'Rytm och klang i prosa och poesi',
          'Syntax: meningsbyggnad och ordföljd',
          'Retoriska figurer: upprepning, parallelism',
          'Dialekt och sociolekt'
        ]
      }
    ],
    examples: [
      'Djupanalys av en roman: tema, stil, berättarteknik',
      'Jämförande analys av två dikter',
      'Identifiera opålitlig berättare i en novell',
      'Stilanalys: jämför två författares språk'
    ],
    reflectionQuestions: [
      'Hur påverkar berättarperspektivet din tolkning?',
      'Vilka teman är viktiga i vår samtid?',
      'Hur skapar författaren stämning med språket?',
      'Varför använder författare symbolik?'
    ]
  },
  {
    id: 3,
    title: 'Genrer och texttyper',
    description: 'Olika typer av texter och deras särdrag',
    emoji: '📚',
    sections: [
      {
        title: 'Romangenrer',
        content: 'Romanen som genre har många undergenrer, var och en med sina egna konventioner och kännetecken.',
        keyPoints: [
          'Bildningsroman: huvudpersonens utveckling',
          'Historisk roman: förankrad i historisk tid',
          'Deckare och thriller: spänning och mysterium',
          'Science fiction och fantasy: spekulativa världar',
          'Kärleksroman: relationer i centrum',
          'Experimentell roman: bryter konventioner'
        ]
      },
      {
        title: 'Lyrik och dramatik',
        content: 'Lyrik (poesi) och dramatik (teater) är två stora litterära genrer med unika uttrycksformer.',
        keyPoints: [
          'Lyrik: koncentrerat språk, rytm, rim',
          'Olika poesiformer: sonett, haiku, fri vers',
          'Dramatik: skriven för att spelas',
          'Tragedi och komedi',
          'Dialogens betydelse i drama',
          'Scenanvisningar och scenbild'
        ]
      },
      {
        title: 'Sakprosa och essä',
        content: 'Sakprosa omfattar faktabaserade texter. Essän är en fri, reflekterande sakprosaform.',
        keyPoints: [
          'Essä: personlig, reflekterande',
          'Biografi och självbiografi',
          'Reportage och journalistik',
          'Vetenskapliga texter',
          'Krönika och ledare',
          'Debattinlägg och åsiktstext'
        ]
      }
    ],
    examples: [
      'Läs och jämför två romaner från olika genrer',
      'Analysera en diktsamling',
      'Läs en pjäs och se en teaterföreställning',
      'Skriv en egen essä om ett aktuellt ämne'
    ],
    reflectionQuestions: [
      'Vilka genrer föredrar du och varför?',
      'Hur skiljer sig lyrik från prosa?',
      'Vad kännetecknar en bra dramatisk konflikt?',
      'Hur skiljer sig essä från andra sakprosatexter?'
    ]
  },
  {
    id: 4,
    title: 'Språkets utveckling',
    description: 'Svensk språkhistoria från forntid till nutid',
    emoji: '🗣️',
    sections: [
      {
        title: 'Fornsvenska och medeltidens svenska',
        content: 'Svenska språket har utvecklats från fornsvenska via medeltidens svenska till nutidens språk.',
        keyPoints: [
          'Urnordiska: gemensamt nordiskt språk',
          'Vikingatidens runstenar',
          'Fornsvenska: ca 800-1225',
          'Medeltidens svenska: ca 1225-1526',
          'Påverkan från latinet och tyskan',
          'Första svenska författarna'
        ]
      },
      {
        title: 'Nysvenska och språknormer',
        content: 'Nysvenskan börjar efter reformationen. Språket standardiserades och normer växte fram.',
        keyPoints: [
          'Nysvenska: från 1526 och framåt',
          'Bibelöversättningens betydelse',
          'Svenska akademiens ordbok (SAOB)',
          'Rättstavningsreformer',
          'Du-reformen 1967',
          'Språkvård och språkrådet'
        ]
      },
      {
        title: 'Moderna språkförändringar',
        content: 'Språket förändras ständigt påverkat av teknologi, globalisering och sociala förändringar.',
        keyPoints: [
          'Engelska lånord och influenser',
          'Digitalt språk: SMS, sociala medier',
          'Ungdomsspråk och slang',
          'Invandring och flerspråkighet',
          'Genusneutrala pronomen',
          'Språklig ekonomi och förkortningar'
        ]
      }
    ],
    examples: [
      'Läs och tolka en runsten',
      'Jämför en medeltida text med modern översättning',
      'Undersök engelska lånord i svenskan',
      'Analys av språkförändring i sociala medier'
    ],
    reflectionQuestions: [
      'Varför förändras språk över tid?',
      'Hur påverkar digitalisering vårt språk?',
      'Är språkförändringar positiva eller negativa?',
      'Hur kan vi bevara språkets rikedom?'
    ]
  },
  {
    id: 5,
    title: 'Retorik och argumentation',
    description: 'Konsten att övertyga med språket',
    emoji: '🎭',
    sections: [
      {
        title: 'Retoriska grundbegrepp',
        content: 'Retorik är konsten att övertyga. Klassisk retorik bygger på ethos, pathos och logos.',
        keyPoints: [
          'Ethos: talarens trovärdighet',
          'Pathos: känslomässig påverkan',
          'Logos: logiska argument',
          'De fem arbetsfaserna: inventio, dispositio, elocutio, memoria, actio',
          'Dispositio: exordium, narratio, argumentatio, peroratio',
          'Anpassning till publik och syfte'
        ]
      },
      {
        title: 'Argumentationstekniker',
        content: 'Att bygga starka argument kräver logik, bevis och strukturerat resonemang.',
        keyPoints: [
          'Tes: påstående som ska bevisas',
          'Argument: skäl som stöder tesen',
          'Bevis: exempel, fakta, statistik',
          'Motargument och bemötande',
          'Induktion: från exempel till slutsats',
          'Deduktion: från princip till slutsats'
        ]
      },
      {
        title: 'Retoriska figurer och stilgrepp',
        content: 'Retoriska figurer är språkliga verkningsmedel som förstärker budskapet.',
        keyPoints: [
          'Metafor: bildlig överföring',
          'Upprepping: förstärker budskap',
          'Tretal: tre är ett magiskt antal',
          'Retorisk fråga: fråga som inte kräver svar',
          'Ironi: säga motsatsen',
          'Parallellism: likartad struktur'
        ]
      }
    ],
    examples: [
      'Analysera ett politiskt tal retoriskt',
      'Skriv ett övertygande debattinlägg',
      'Identifiera retoriska grepp i reklam',
      'Håll ett övertygande tal'
    ],
    reflectionQuestions: [
      'Vilka retoriska grepp är mest effektiva?',
      'Hur kan retorik missbrukas?',
      'Vad gör ett argument starkt?',
      'Hur påverkas vi av retorik i vardagen?'
    ]
  },
  {
    id: 6,
    title: 'Kreativt skrivande',
    description: 'Utveckla din förmåga att skriva kreativt',
    emoji: '✨',
    sections: [
      {
        title: 'Berättartekniker',
        content: 'Att skriva berättelser kräver behärskning av olika tekniker för att engagera läsaren.',
        keyPoints: [
          'Show, don\'t tell: visa istället för att berätta',
          'Dialog: realistisk och framåtdrivande',
          'Beskrivning: sinnliga detaljer',
          'Karaktärsutveckling: trovärdiga personer',
          'Konflikt: drivkraft i berättelsen',
          'Spänn bågen: bygga upp mot klimax'
        ]
      },
      {
        title: 'Att skriva poesi',
        content: 'Poesi är koncentrerat språk där varje ord räknas. Både form och innehåll är viktiga.',
        keyPoints: [
          'Bildspråk: metaforer och liknelser',
          'Rytm: betoning och tempo',
          'Rim: slutrim, binnenrim, halvrim',
          'Fria verser: utan fast form',
          'Konkreta bilder framför abstrakta ord',
          'Revision: finslipa varje rad'
        ]
      },
      {
        title: 'Inspiration och process',
        content: 'Kreativt skrivande kräver både inspiration och disciplin. Processen är lika viktig som produkten.',
        keyPoints: [
          'Freewriting: skriv utan att censusera',
          'Skrivarblockering: strategier att komma vidare',
          'Läsa för att utvecklas som skribent',
          'Feedback: ge och ta emot konstruktivt',
          'Revidera: omarbeta texten flera gånger',
          'Hitta din röst: unikt skrivande'
        ]
      }
    ],
    examples: [
      'Skriv en novell på max 2000 ord',
      'Skriv en diktsamling med 10 dikter',
      'Övning: skriv om samma händelse från två perspektiv',
      'Kreativ skrivarklubb: dela och ge feedback'
    ],
    reflectionQuestions: [
      'Vad inspirerar dig att skriva?',
      'Hur utvecklar du dina karaktärer?',
      'Vad är svårast med kreativt skrivande?',
      'Hur hittar du din unika röst som författare?'
    ]
  }
];

export default function Svenska2() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);
  const storageKey = `@svenska2_progress_${user?.id}`;

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
        const updatedModules = modulesData.map(module => ({ ...module, completed: progress.completedModules.includes(module.id) }));
        setModules(updatedModules);
      }
    } catch (error) { console.error('Error loading progress:', error); }
  };

  const saveProgress = async (progress: CourseProgress) => {
    if (!user?.id) return;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(progress));
      setCourseProgress(progress);
    } catch (error) { console.error('Error saving progress:', error); }
  };

  const toggleModuleCompletion = (moduleId: number) => {
    const updatedModules = modules.map(m => m.id === moduleId ? { ...m, completed: !m.completed } : m);
    setModules(updatedModules);
    const completedIds = updatedModules.filter(m => m.completed).map(m => m.id);
    const autoProgress = Math.round((completedIds.length / modulesData.length) * 100);
    const newProgress = { ...courseProgress, completedModules: completedIds, progress: autoProgress };
    saveProgress(newProgress);
    setEditProgress(autoProgress.toString());
  };

  const handleSaveManualProgress = async () => {
    const progressValue = parseInt(editProgress, 10);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      Alert.alert('Fel', 'Progress måste vara ett tal mellan 0 och 100');
      return;
    }
    await saveProgress({ ...courseProgress, progress: progressValue, targetGrade: editTargetGrade });
    Alert.alert('Framgång! ✅', 'Kursinformation har uppdaterats');
    setShowEditModal(false);
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
            <LinearGradient colors={['#EC4899', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>📚</Text>
                <Text style={styles.heroTitle}>Svenska 2</Text>
                <Text style={styles.heroDescription}>Litteratur och språkutveckling</Text>
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
              <Edit3 size={20} color="#EC4899" />
            </TouchableOpacity>
          </View>
        </SlideInView>
        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/SVESVE02')} activeOpacity={0.7}>
            <Sparkles size={24} color="#EC4899" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>
        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>Svenska 2 bygger vidare på Svenska 1 med fokus på litteraturanalys, texttyper och språklig medvetenhet. Du fördjupar dig i svensk litteraturhistoria och utvecklar ditt kreativa skrivande.</Text>
          </View>
        </FadeInView>
        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          {modules.map((module, index) => (
            <FadeInView key={module.id} delay={300 + index * 100}>
              <TouchableOpacity style={[styles.moduleCard, { backgroundColor: theme.colors.card }, module.completed && styles.moduleCardCompleted]} onPress={() => setExpandedModule(expandedModule === module.id ? null : module.id)} activeOpacity={0.7}>
                <View style={styles.moduleHeader}>
                  <TouchableOpacity style={styles.checkboxContainer} onPress={(e) => { e.stopPropagation(); toggleModuleCompletion(module.id); }}>
                    {module.completed ? <CheckCircle size={24} color="#EC4899" /> : <Circle size={24} color={theme.colors.textMuted} />}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[styles.moduleTitle, { color: theme.colors.text }, module.completed && { color: '#EC4899' }]}>Modul {module.id}: {module.title}</Text>
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
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#EC4899', borderColor: '#EC4899' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
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
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#EC4899' }]} onPress={handleSaveManualProgress}>
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
  container: { flex: 1 }, header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }, backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }, scrollContent: { paddingBottom: 100 }, heroCard: { marginHorizontal: 24, borderRadius: 24, padding: 32, marginBottom: 24 }, heroContent: { alignItems: 'center' }, heroIcon: { fontSize: 64, marginBottom: 16 }, heroTitle: { fontSize: 28, fontWeight: '700' as const, color: 'white', textAlign: 'center', marginBottom: 8 }, heroDescription: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24 }, introSection: { marginHorizontal: 24, marginBottom: 24, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, introTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 }, introText: { fontSize: 16, lineHeight: 24 }, modulesSection: { paddingHorizontal: 24, marginBottom: 24 }, sectionTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 16 }, moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 }, checkboxContainer: { padding: 4 }, moduleCardCompleted: { borderColor: '#EC4899', borderWidth: 2, borderLeftWidth: 4 }, moduleEmoji: { fontSize: 40 }, moduleTitleContainer: { flex: 1 }, moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 }, moduleDescription: { fontSize: 14, lineHeight: 20 }, progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginTop: 16 }, progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, progressLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' as const }, progressPercent: { fontSize: 18, color: 'white', fontWeight: 'bold' as const }, progressBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, marginBottom: 8 }, progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 }, progressText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }, quickStats: { flexDirection: 'row', gap: 16, marginTop: 12 }, quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 }, quickStatText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' as const }, editButton: { position: 'absolute', top: 20, right: 44, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }, modalContainer: { width: '90%', maxWidth: 400 }, modalContent: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' }, modalTitle: { fontSize: 20, fontWeight: 'bold' as const, flex: 1 }, modalCloseButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, modalBody: { padding: 20 }, inputGroup: { marginBottom: 20 }, inputLabel: { fontSize: 16, fontWeight: '600' as const, marginBottom: 8 }, input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 }, gradeButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, gradeButton: { flex: 1, minWidth: 50, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' }, gradeButtonText: { fontSize: 16, fontWeight: 'bold' as const }, modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' }, modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, modalCancelButton: { borderWidth: 2 }, modalSaveButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }, modalButtonText: { fontSize: 16, fontWeight: '600' as const }, flashcardsButton: { marginHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }, flashcardsButtonText: { fontSize: 16, fontWeight: '700' as const }
});
