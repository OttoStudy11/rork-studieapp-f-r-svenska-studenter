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
    title: 'Industrialiseringen och dess samhällsomvandlande konsekvenser',
    description: 'Utforska industrialiseringens effekter på samhälle och ekonomi',
    emoji: '🏭',
    sections: [
      {
        title: 'Den industriella revolutionen',
        content: 'Industrialiseringen startade i Storbritannien under 1700-talet och förändrade världen på djupet. Nya maskiner, teknologier och produktionsmetoder skapade en ekonomisk och social omvandling utan motstycke.',
        keyPoints: [
          'Uppfinningar: ångmaskinen, mekaniserad textilproduktion',
          'Övergång från jordbruk till industri',
          'Urbanisering och flyttströmmar till städer',
          'Födseln av arbetarklassen',
          'Nya transportmedel: järnvägar och ångfartyg',
          'Kapitalism och marknadsekonomins framväxt'
        ]
      },
      {
        title: 'Sociala förändringar',
        content: 'Industrialiseringen skapade nya samhällsklasser och förändrade människors levnadsvillkor dramatiskt. Arbetare levde under svåra förhållanden medan en ny borgerlig klass växte fram.',
        keyPoints: [
          'Arbetarklassens uppkomst och levnadsvillkor',
          'Barnarbete och långa arbetsdagar',
          'Borgarklassens framväxt',
          'Bostadsbrist och sl um i städerna',
          'Fackföreningsrörelsens början',
          'Kamp för bättre arbetsvillkor'
        ]
      },
      {
        title: 'Ekonomiska system',
        content: 'Nya ekonomiska idéer och system utvecklades som svar på industrialiseringen. Kapitalism, socialism och kommunism blev viktiga politiska ideologier.',
        keyPoints: [
          'Liberalism och fri marknadsekonomi',
          'Socialism som alternativ till kapitalismen',
          'Karl Marx och kommunistiska manifestet',
          'Staten gentemot marknaden',
          'Sociala reformer och arbetarskydd',
          'Ekonomiska kriser och konjunktursvängningar'
        ]
      }
    ],
    examples: [
      'Analysera bilder från fabriker under 1800-talet',
      'Jämför levnadsvillkor före och efter industrialisering',
      'Studera Karl Marx texter om kapitalism',
      'Undersök hur järnvägar förändrade samhället'
    ],
    reflectionQuestions: [
      'Hur förändrade industrialiseringen vardagslivet för vanliga människor?',
      'Vilka var för- och nackdelar med den snabba industrialiseringen?',
      'Hur påverkade nya ekonomiska idéer politiken?',
      'Vilka spår av industrialiseringen ser vi idag?'
    ]
  },
  {
    id: 2,
    title: 'Imperialism och kolonialism',
    description: 'Studera europeisk expansion och dess globala konsekvenser',
    emoji: '🌍',
    sections: [
      {
        title: 'Europeisk expansion',
        content: 'Under 1800-talet expanderade europeiska makter världen över. Nya kolonier etablerades i Afrika, Asien och Oceanien, driven av ekonomiska, politiska och kulturella motiv.',
        keyPoints: [
          'Kapplöpningen om Afrika',
          'Brittiska imperiet - "solen går aldrig ner"',
          'Franska, tyska och belgiska kolonier',
          'Ekonomiska motiv: råvaror och marknader',
          'Civilisationsmissionen och rasideologier',
          'Teknologisk överlägsenhet'
        ]
      },
      {
        title: 'Koloniala system',
        content: 'Kolonialismen innebar exploatering av resurser och befolkning. Kolonialmakterna styrde med olika metoder och skapade strukturer som påverkade kolonierna långt efter självständigheten.',
        keyPoints: [
          'Direkt och indirekt styrning',
          'Plantageekonomier och slavarbete',
          'Kulturell påverkan och missionärsverksamhet',
          'Utbildningssystem och språkspridning',
          'Rasskillnader och segregation',
          'Motstånd och uppror'
        ]
      },
      {
        title: 'Konsekvenser',
        content: 'Kolonialismen fick djupgående konsekvenser för både kolonialmakter och koloniserade områden. Många problem i världen idag har sina rötter i kolonialismen.',
        keyPoints: [
          'Ekonomiskt beroende och underutveckling',
          'Gränser utan hänsyn till etniska grupper',
          'Kulturell imperialism',
          'Språklig påverkan',
          'Avkolonisering under 1900-talet',
          'Postkolonial teori och kritik'
        ]
      }
    ],
    examples: [
      'Analysera koloniala kartor och gränsdragningar',
      'Studera koloniala propaganda och konst',
      'Jämför olika koloniala system',
      'Undersök motståndsrörelser i kolonier'
    ],
    reflectionQuestions: [
      'Hur rättfärdigade kolonialmakter sin expansion?',
      'Vilka långsiktiga effekter har kolonialismen haft?',
      'Hur påverkade imperialismen relationerna mellan länder idag?',
      'Vad betyder postkolonialism?'
    ]
  },
  {
    id: 3,
    title: 'Första världskriget och mellankrigstiden',
    description: 'Förstå orsakerna till och konsekvenserna av första världskriget',
    emoji: '⚔️',
    sections: [
      {
        title: 'Vägen till krig',
        content: 'Första världskriget bröt ut 1914 efter decennier av spänningar. Nationalism, imperialism, militarism och allianssystem skapade en explosiv situation.',
        keyPoints: [
          'Spänningar mellan stormakter',
          'Allianssystem: trippelallians och trippelentent',
          'Kapprustning och militarism',
          'Nationalism och minoritetsfrågor',
          'Mordet i Sarajevo 1914',
          'Krigsförklaringar och mobilisering'
        ]
      },
      {
        title: 'Kriget',
        content: 'Första världskriget var ett totalt krig med nya vapen och strategier. Miljontals dog i skyttegravskriget och på hemmafroten.',
        keyPoints: [
          'Skyttegravskrig och stillastånd',
          'Nya vapen: giftgas, tanks, flygplan',
          'Totalt krig - hela samhället mobiliseras',
          'Hemmafroten och kvinnors nya roller',
          'Ryska revolutionen 1917',
          'USA:s intrde och krigets slut 1918'
        ]
      },
      {
        title: 'Efterkrigstidens Europa',
        content: 'Versaillesfreden och mellankrigstiden präglades av ekonomiska problem, politisk instabilitet och nya ideologier. Detta lade grunden för andra världskriget.',
        keyPoints: [
          'Versaillesfreden och dess konsekvenser',
          'Nationernas förbund',
          'Ekonomisk kris och inflation',
          'Totalitära regimer: kommunism och fascism',
          'Demokratins kris',
          'Vägen till andra världskriget'
        ]
      }
    ],
    examples: [
      'Analysera krigspropaganda från olika länder',
      'Studera soldatbrev från fronten',
      'Jämför kartor före och efter kriget',
      'Undersök Versaillesfredens villkor'
    ],
    reflectionQuestions: [
      'Varför kunde inte kriget förhindras?',
      'Hur förändrade kriget samhället?',
      'Var Versaillesfreden rättvis?',
      'Hur ledde första världskriget till andra världskriget?'
    ]
  },
  {
    id: 4,
    title: 'Källkritik och historisk metod',
    description: 'Utveckla färdigheter i att analysera och värdera historiska källor',
    emoji: '🔍',
    sections: [
      {
        title: 'Olika typer av källor',
        content: 'Historiker arbetar med olika typer av källor för att förstå det förflutna. Primärkällor är från tiden själv medan sekundärkällor är senare tolkningar.',
        keyPoints: [
          'Primärkällor: dokument, brev, fotografier',
          'Sekundärkällor: läroböcker, forskningsartiklar',
          'Materiella källor: föremål, byggnader',
          'Muntliga källor: intervjuer, vittnesmål',
          'Digitala källor: webbplatser, sociala medier',
          'Källors tillförlitlighet varierar'
        ]
      },
      {
        title: 'Källkritiska frågor',
        content: 'För att värdera en källa måste man ställa kritiska frågor. Källkritik hjälper oss att skilja på fakta och åsikter samt upptäcka partiskhet.',
        keyPoints: [
          'Äkthet: Är källan vad den påstås vara?',
          'Tidssamband: När skapades källan?',
          'Oberoende: Är källan självständig?',
          'Tendens: Har upphovsmannen ett intresse?',
          'Närhet till händelsen',
          'Källornas samstämmighet'
        ]
      },
      {
        title: 'Historisk analys',
        content: 'Att tolka historia kräver mer än att läsa källor. Historiker måste förstå sammanhang, orsaker och konsekvenser.',
        keyPoints: [
          'Orsak och verkan',
          'Kontinuitet och förändringar',
          'Aktörer och strukturer',
          'Olika perspektiv och tolkningar',
          'Historiebruk - hur historia används',
          'Vetenskapligt arbetssätt'
        ]
      }
    ],
    examples: [
      'Analysera en historisk källa steg för steg',
      'Jämför olika tolkningar av samma händelse',
      'Granska propagandamaterial källkritiskt',
      'Skriv en källkritisk analys'
    ],
    reflectionQuestions: [
      'Varför är källkritik viktigt?',
      'Hur kan samma händelse tolkas olika?',
      'Vad gör en källa tillförlitlig?',
      'Hur använder man källor för att skriva historia?'
    ]
  },
  {
    id: 5,
    title: 'Historiska perspektiv och historieskrivning',
    description: 'Förstå hur historia tolkas och används',
    emoji: '📚',
    sections: [
      {
        title: 'Olika perspektiv',
        content: 'Historia kan berättas ur många perspektiv. Vems historia som berättas och hur den berättas påverkar vår förståelse av det förflutna.',
        keyPoints: [
          'Makthavares perspektiv vs. vanligt folk',
          'Köns- och genusperspektiv',
          'Postkoloniala perspektiv',
          'Klassperspektiv och social historia',
          'Marginaliserade grupper i historien',
          'Global historia vs. nationell historia'
        ]
      },
      {
        title: 'Historiebruk',
        content: 'Historia används för olika syften i samhället. Att förstå historiebruk hjälper oss att kritiskt granska hur historia presenteras.',
        keyPoints: [
          'Politiskt historiebruk',
          'Identitetsskapande historia',
          'Kommersiellt historiebruk',
          'Vetenskapligt historiebruk',
          'Historiemedvetande',
          'Propaganda och manipulation'
        ]
      },
      {
        title: 'Historieskrivningens förändringar',
        content: 'Hur historia skrivs har förändrats över tid. Nya metoder och perspektiv har berikat vår förståelse av det förflutna.',
        keyPoints: [
          'Från kungar och hjältar till vanligt folk',
          'Oral history och minnesforskningar',
          'Digital historia och nya källor',
          'Mikrohistoria och vardagshistoria',
          'Komparativ historia',
          'Historiografi - historieskrivningens historia'
        ]
      }
    ],
    examples: [
      'Analysera hur en händelse framställs i olika läroböcker',
      'Undersök hur historia används i politiska tal',
      'Jämför traditionell och ny historisk forskning',
      'Studera hur minnesmärken formar historiebilden'
    ],
    reflectionQuestions: [
      'Vems historia är det som berättas?',
      'Hur använder politiker historia?',
      'Varför förändras historieskrivningen?',
      'Vad betyder historia för din egen identitet?'
    ]
  }
];

export default function Historia1b() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({ progress: 0, targetGrade: '', completedModules: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');  
  const [modules, setModules] = useState<Module[]>(modulesData);

  const storageKey = `@historia1b_progress_${user?.id}`;

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
            <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>🏛️</Text>
                <Text style={styles.heroTitle}>Historia 1b</Text>
                <Text style={styles.heroDescription}>Historiska perspektiv och källkritik</Text>
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
              <Edit3 size={20} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/HISHIS01b')} activeOpacity={0.7}>
            <Sparkles size={24} color="#F59E0B" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Historia 1b ger dig kunskaper om historiska skeenden, perspektiv och källkritik. Du lär dig att analysera historiska händelser och förstå hur de påverkat världen idag.
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
                      <CheckCircle size={24} color="#F59E0B" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle,
                      { color: theme.colors.text },
                      module.completed && { color: '#F59E0B' }
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
                          <BookOpen size={20} color="#F59E0B" />
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
                              <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
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
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
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
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#F59E0B' }]} onPress={handleSaveManualProgress}>
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
  moduleCardCompleted: { borderColor: '#F59E0B', borderWidth: 2, borderLeftWidth: 4 },
  moduleEmoji: { fontSize: 40 },
  moduleTitleContainer: { flex: 1 },
  moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  moduleDescription: { fontSize: 14, lineHeight: 20 },
  moduleContent: { marginTop: 20, gap: 16 },
  sectionCard: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(245, 158, 11, 0.1)' },
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
