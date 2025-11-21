import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, BookOpen, Edit3, X as CloseIcon, Award, TrendingUp, CheckCircle, Sparkles, Lightbulb, Target, Circle } from 'lucide-react-native';
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
    title: 'Cellens struktur och funktion',
    description: 'Utforska cellens uppbyggnad och livsviktiga processer',
    emoji: '🔬',
    sections: [
      {
        title: 'Cellens delar',
        content: 'Cellen är livets grundenhet. Alla levande organismer består av en eller flera celler. Varje cell innehåller strukturer som arbetar tillsammans för att hålla organismen vid liv.',
        keyPoints: [
          'Cellmembran - styr vad som går in och ut ur cellen',
          'Cytoplasma - vätska där cellens processer sker',
          'Cellkärna - innehåller DNA och styr cellens aktiviteter',
          'Mitokondrier - cellens kraftverk som producerar energi',
          'Ribosomer - tillverkar proteiner',
          'Skillnader mellan växt- och djurceller'
        ]
      },
      {
        title: 'Cellprocesser',
        content: 'Cellen utför ständigt olika processer för att överleva. Transport av ämnen, energiproduktion och proteinsyntes är några av de viktigaste.',
        keyPoints: [
          'Diffusion - ämnen sprider sig från hög till låg koncentration',
          'Osmos - vattnets rörelse genom cellmembran',
          'Aktiv transport - kräver energi för att flytta molekyler',
          'Cellulär andning - skapar energi från glukos',
          'Proteinsyntes - bygger proteiner från DNA:s instruktioner',
          'Cellandning och fotosyntes samverkar i ekosystem'
        ]
      },
      {
        title: 'Fotosyntes',
        content: 'Fotosyntesen är grunden för nästan allt liv på jorden. Växter och vissa bakterier omvandlar solljus till kemisk energi som lagras i socker.',
        keyPoints: [
          'Klorofyll i kloroplaster fångar solljus',
          'Koldioxid + vatten → glukos + syre',
          'Ljusreaktioner och mörkerreaktioner',
          'Faktorer som påverkar fotosyntesen',
          'Fotosyntesens betydelse för ekosystem',
          'Människans beroende av fotosyntesen'
        ]
      }
    ],
    examples: [
      'Mikroskopera olika celler och identifiera celldelar',
      'Utför experiment med osmos med potatisbitar',
      'Undersök fotosyntesens hastighet under olika förhållanden',
      'Jämför växt- och djurceller visuellt'
    ],
    reflectionQuestions: [
      'Varför kallas cellen för livets grundenhet?',
      'Hur samverkar cellens olika delar?',
      'Vad skulle hända om fotosyntesen upphörde?',
      'Hur påverkar cellprocesser din egen kropp dagligen?'
    ]
  },
  {
    id: 2,
    title: 'DNA, gener och nedärvning',
    description: 'Förstå genetikens grunder och hur egenskaper ärvs',
    emoji: '🧬',
    sections: [
      {
        title: 'DNA och gener',
        content: 'DNA är molekylen som innehåller all genetisk information. Gener är avsnitt av DNA som kodar för specifika egenskaper.',
        keyPoints: [
          'DNA:s dubbelhelixstruktur',
          'Baser: adenin, tymin, cytosin, guanin',
          'Gener som instruktioner för proteiner',
          'Kromosomer - organiserat DNA i cellkärnan',
          'Människan har 46 kromosomer (23 par)',
          'DNA-replikation vid celldelning'
        ]
      },
      {
        title: 'Mendels lagar',
        content: 'Gregor Mendel upptäckte grunderna för hur egenskaper ärvs från föräldrar till avkomma. Hans lagar hjälper oss förstå genetisk variation.',
        keyPoints: [
          'Dominanta och recessiva gener',
          'Homozygot och heterozygot',
          'Fenotyp (yttre egenskaper) och genotyp (genetisk sammansättning)',
          'Mendels första lag - uniformitetslag',
          'Mendels andra lag - uppspaltningslag',
          'Punnett-rutor för att förutsäga nedärvning'
        ]
      },
      {
        title: 'Genetisk variation',
        content: 'Variation i gener skapar mångfald inom arter. Mutationer, sexuell fortplantning och genetisk rekombination bidrar alla till variation.',
        keyPoints: [
          'Mutationer - förändringar i DNA',
          'Könsceller - ägg och spermier med halva kromosomantalet',
          'Befruktning skapar ny genetisk kombination',
          'Meios - celldelning som skapar könsceller',
          'Genetisk mångfald gynnar överlevnad',
          'Ärftliga sjukdomar och genetisk rådgivning'
        ]
      }
    ],
    examples: [
      'Använd Punnett-rutor för att beräkna nedärvning',
      'Undersök ärftliga egenskaper i familjen',
      'Bygg DNA-modell med olika material',
      'Analysera stamträd för genetiska sjukdomar'
    ],
    reflectionQuestions: [
      'Varför ser syskon olika ut trots samma föräldrar?',
      'Hur påverkar mutationer evolutionen?',
      'Vad innebär det att vara bärare av en recessiv gen?',
      'Hur kan genetisk kunskap användas i medicin?'
    ]
  },
  {
    id: 3,
    title: 'Evolution och naturligt urval',
    description: 'Lär dig om arternas utveckling och anpassning',
    emoji: '🦎',
    sections: [
      {
        title: 'Evolutionsteorin',
        content: 'Charles Darwin formulerade teorin om evolution genom naturligt urval. Arter förändras över tid genom att individer med gynnsamma egenskaper överlever och får fler avkommor.',
        keyPoints: [
          'Alla organismer härstammar från gemensamma förfäder',
          'Naturligt urval - "survival of the fittest"',
          'Anpassning till miljön',
          'Variation inom arter',
          'Fossiler som bevis för evolution',
          'Jämförande anatomi visar släktskap'
        ]
      },
      {
        title: 'Naturligt urval',
        content: 'Naturligt urval är mekanismen bakom evolution. Individer med fördelaktiga egenskaper överlever bättre, reproducerar sig mer och för vidare sina gener.',
        keyPoints: [
          'Variation i egenskaper inom populationer',
          'Konkurrens om resurser',
          'Överproduktion av avkommor',
          'Differentiell överlevnad och reproduktion',
          'Ackumulering av gynnsamma egenskaper',
          'Exempel: mölarnas färganpassning'
        ]
      },
      {
        title: 'Artbildning',
        content: 'Nya arter uppstår när populationer isoleras och utvecklas olika anpassningar. Detta sker över långa tidsperioder.',
        keyPoints: [
          'Geografisk isolering av populationer',
          'Olika selektionstryck i olika miljöer',
          'Genetisk drift i små populationer',
          'Reproduktiv isolering - kan inte längre para sig',
          'Darwins finkar som exempel',
          'Tidsaspekten i evolution'
        ]
      }
    ],
    examples: [
      'Studera fossiler och evolutionär utveckling',
      'Analysera homologa strukturer hos olika djur',
      'Simulera naturligt urval med bönor i olika färger',
      'Undersök antibiotikaresistens som exempel på evolution'
    ],
    reflectionQuestions: [
      'Vilka bevis finns för evolutionsteorin?',
      'Hur kan bakterier utveckla resistens så snabbt?',
      'Vad är skillnaden mellan naturligt och konstgjort urval?',
      'Hur påverkar människan andra arters evolution?'
    ]
  },
  {
    id: 4,
    title: 'Ekologi och ekosystem',
    description: 'Utforska samspel mellan organismer och deras miljö',
    emoji: '🌳',
    sections: [
      {
        title: 'Ekosystemens struktur',
        content: 'Ett ekosystem består av alla levande organismer i ett område samt deras fysiska miljö. Energi och materia flödar genom ekosystemet.',
        keyPoints: [
          'Biotiska faktorer - levande organismer',
          'Abiotiska faktorer - ljus, temperatur, vatten',
          'Producenter, konsumenter, nedbrytare',
          'Näringskedjor och näringsnät',
          'Energipyramider visar energiflödet',
          'Materians kretslopp'
        ]
      },
      {
        title: 'Populationer och samhällen',
        content: 'Organismer av samma art bildar populationer. Olika populationer interagerar i biologiska samhällen.',
        keyPoints: [
          'Populationstillväxt och bärförmåga',
          'Konkurrens om resurser',
          'Predation - rovdjur och bytesdjur',
          'Symbios - samlevnad mellan arter',
          'Mutualism, kommensalism, parasitism',
          'Ekologiska nischer'
        ]
      },
      {
        title: 'Kretslopp',
        content: 'Materia återanvänds i ekosystem genom olika kretslopp. Kol, kväve och vatten cirkulerar mellan organismer och miljö.',
        keyPoints: [
          'Kolkretslopp - fotosyntes och cellandning',
          'Kvävekretslopp - bakteriers viktiga roll',
          'Vattnets kretslopp - avdunstning och nederbörd',
          'Fosforkretslopp i mark och vatten',
          'Nedbrytarnas roll i kretslopp',
          'Människans påverkan på kretsloppen'
        ]
      }
    ],
    examples: [
      'Rita näringskedjor och näringsnät för lokala ekosystem',
      'Undersök olika biomer och deras anpassningar',
      'Följ ett kretslopp från början till slut',
      'Analysera hur invasiva arter påverkar ekosystem'
    ],
    reflectionQuestions: [
      'Vad händer om ett led i näringskedjan försvinner?',
      'Hur påverkar klimatförändringar ekosystem?',
      'Varför är biologisk mångfald viktig?',
      'Hur kan vi skydda hotade ekosystem?'
    ]
  },
  {
    id: 5,
    title: 'Människokroppen och hälsa',
    description: 'Förstå kroppens organsystem och hur man håller sig frisk',
    emoji: '🫀',
    sections: [
      {
        title: 'Organsystem',
        content: 'Människokroppen består av olika organsystem som samarbetar för att hålla oss vid liv. Varje system har specifika funktioner.',
        keyPoints: [
          'Cirkulationssystemet - hjärta och blodkärl',
          'Andningssystemet - lungor och gasutbyte',
          'Matsmältningssystemet - näringsupptag',
          'Nervsystemet - signaler och koordinering',
          'Immunförsvaret - skydd mot sjukdomar',
          'Hormonella systemet - kemisk kommunikation'
        ]
      },
      {
        title: 'Immunförsvaret',
        content: 'Immunförsvaret skyddar kroppen mot sjukdomar. Det består av medfött och förvärvat immunförsvar.',
        keyPoints: [
          'Första försvarslinjen - hud och slemhinnor',
          'Vita blodkroppar bekämpar inkräktare',
          'Antikroppar känner igen specifika patogener',
          'Immunologiskt minne efter infektion',
          'Vaccination och hur det fungerar',
          'Allergi och autoimmuna sjukdomar'
        ]
      },
      {
        title: 'Hälsa och livsstil',
        content: 'Våra levnadsvanor påverkar hälsan. Kost, motion, sömn och stress är viktiga faktorer för välbefinnande.',
        keyPoints: [
          'Balanserad kost och näringsämnen',
          'Fysisk aktivitet stärker kroppen',
          'Sömnens betydelse för återhämtning',
          'Stress och dess effekter på kroppen',
          'Risker med tobak, alkohol och droger',
          'Preventiva åtgärder för god hälsa'
        ]
      }
    ],
    examples: [
      'Undersök puls och andning före och efter träning',
      'Analysera näringsinnehåll i olika livsmedel',
      'Jämför olika bakteriers påverkan på kroppen',
      'Studera vaccinationsprogram och deras effekt'
    ],
    reflectionQuestions: [
      'Hur samverkar olika organsystem?',
      'Varför blir man inte sjuk i samma sjukdom två gånger?',
      'Hur påverkar livsstil risk för sjukdomar?',
      'Vilka etiska frågor finns kring vaccination?'
    ]
  }
];

export default function Biologi1() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [modules, setModules] = useState<Module[]>(modulesData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');

  const storageKey = `@biologi1_progress_${user?.id}`;

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SlideInView direction="up" delay={100}>
          <View>
            <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>🧬</Text>
                <Text style={styles.heroTitle}>Biologi 1</Text>
                <Text style={styles.heroDescription}>Celler, evolution och ekologi</Text>
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
              <Edit3 size={20} color="#22C55E" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/BIOBIO01')} activeOpacity={0.7}>
            <Sparkles size={24} color="#22C55E" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Biologi 1 ger dig grundläggande kunskaper om levande organismer, celler, evolution och ekologiska samband. Du lär dig förstå biologiska processer och livets mångfald.
            </Text>
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
                      <CheckCircle size={24} color="#22C55E" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle,
                      { color: theme.colors.text },
                      module.completed && { color: '#22C55E' }
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
                          <BookOpen size={20} color="#22C55E" />
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
                              <View style={[styles.bullet, { backgroundColor: '#22C55E' }]} />
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
                          Exempel på aktiviteter
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
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#22C55E', borderColor: '#22C55E' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
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
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#22C55E' }]} onPress={handleSaveManualProgress}>
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
  moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxContainer: { padding: 4 },
  moduleCardCompleted: { borderColor: '#22C55E', borderWidth: 2, borderLeftWidth: 4 },
  moduleEmoji: { fontSize: 40 },
  moduleTitleContainer: { flex: 1 },
  moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  moduleDescription: { fontSize: 14, lineHeight: 20 },
  moduleContent: { marginTop: 20, gap: 16 },
  sectionCard: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(34, 197, 94, 0.1)' },
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
