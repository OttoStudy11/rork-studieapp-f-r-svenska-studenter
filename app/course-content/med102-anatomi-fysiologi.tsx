import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
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
  Circle,
  Edit3,
  X as CloseIcon,
  Award,
  TrendingUp,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Module {
  id: number;
  title: string;
  description: string;
  emoji: string;
  sections: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  examples: string[];
  reflectionQuestions: string[];
}

interface CourseProgressData {
  completedModules: number[];
  targetGrade: string;
  userNotes: { [key: number]: string };
}

const courseModules: Module[] = [
  {
    id: 1,
    title: 'Cellbiologi och vävnadslära',
    description: 'Introduktion till cellens uppbyggnad och vävnadstyper',
    emoji: '🔬',
    sections: [
      {
        title: 'Cellens struktur',
        content: 'Cellen är kroppens grundläggande byggsten. Varje cell innehåller organeller med specifika funktioner: cellkärnan med DNA, mitokondrier för energiproduktion, ribosomer för proteinsyntes, och cellmembranet som reglerar transport.',
        keyPoints: [
          'Cellkärnan innehåller genetiskt material (DNA)',
          'Mitokondrier producerar ATP (cellens energi)',
          'Ribosomer syntetiserar proteiner',
          'Endoplasmatiskt retikulum transporterar ämnen'
        ]
      },
      {
        title: 'Vävnadstyper',
        content: 'Kroppen består av fyra huvudsakliga vävnadstyper: epitel (täcker ytor), bindväv (stödjer och förbinder), muskelväv (möjliggör rörelse), och nervväv (överför signaler).',
        keyPoints: [
          'Epitelväv täcker kroppsytor och slemhinnor',
          'Bindväv ger stöd och struktur',
          'Muskelväv finns i tre former: skelettmuskel, hjärtmuskel och glatt muskel',
          'Nervväv består av neuroner och gliaceller'
        ]
      }
    ],
    examples: [
      'Hudceller (epitelvävnad) skyddar kroppen mot infektioner',
      'Benceller (bindväv) ger stöd och skydd för organ',
      'Hjärtmuskelceller (muskelväv) pumpar blod genom kroppen'
    ],
    reflectionQuestions: [
      'Hur skiljer sig olika celltyper från varandra?',
      'Varför är mitokondrier särskilt viktiga för muskelceller?',
      'Hur hänger cellens struktur samman med dess funktion?'
    ]
  },
  {
    id: 2,
    title: 'Skelett- och muskelsystemet',
    description: 'Kroppens stöd- och rörelsesystem',
    emoji: '🦴',
    sections: [
      {
        title: 'Skelettet',
        content: 'Det mänskliga skelettet består av 206 ben som ger stöd, skydd för vitala organ, möjliggör rörelse, producerar blodceller och lagrar mineraler. Skelettet delas in i axiellt (huvud och bål) och appendikulärt (extremiteter) skelett.',
        keyPoints: [
          'Kompakt ben (cortex) ger styrka',
          'Trabekulärt ben (spongiosa) är lättare och innehåller benmärg',
          'Leder möjliggör rörelse mellan ben',
          'Ledbrosk minskar friktion i leder'
        ]
      },
      {
        title: 'Muskelsystemet',
        content: 'Skelettmuskler fäster på ben via senor och möjliggör viljestyrda rörelser. Muskelkontraktion sker genom samspelet mellan aktin och myosin filament, drivet av ATP och reglerat av kalciumjoner.',
        keyPoints: [
          'Muskelfibrer innehåller myofibriller med kontraktila proteiner',
          'Motorenheter består av en motorisk neuron och muskelfibrer',
          'Isometrisk kontraktion: spänning utan rörelse',
          'Isotonisk kontraktion: muskel förkortas eller förlängs'
        ]
      }
    ],
    examples: [
      'Biceps och triceps arbetar antagonistiskt för att böja och sträcka armen',
      'Femur (lårbenet) är kroppens starkaste ben',
      'Kotpelare skyddar ryggmärgen och ger stöd'
    ],
    reflectionQuestions: [
      'Hur samverkar skelett och muskler för att skapa rörelse?',
      'Varför är träning viktigt för både ben och muskler?',
      'Vad händer vid muskelkontraktion på cellnivå?'
    ]
  },
  {
    id: 3,
    title: 'Hjärta och cirkulationssystemet',
    description: 'Kroppens transportsystem för blod och näringsämnen',
    emoji: '❤️',
    sections: [
      {
        title: 'Hjärtats anatomi',
        content: 'Hjärtat är en muskulär pump uppdelad i fyra kammare: höger och vänster förmak samt höger och vänster kammare. Hjärtklaffar förhindrar att blod strömmar bakåt. Hjärtat pumpas genom elektriska impulser från sinusknutan.',
        keyPoints: [
          'Höger sida pumpar syrefattigt blod till lungorna',
          'Vänster sida pumpar syrerikt blod till kroppen',
          'Sinusknutan är hjärtats naturliga pacemaker',
          'Koronarkärl förser hjärtmuskeln med syre'
        ]
      },
      {
        title: 'Blodcirkulationen',
        content: 'Cirkulationssystemet består av två kretslopp: lilla kretsloppet (hjärta-lungor-hjärta) och stora kretsloppet (hjärta-kropp-hjärta). Artärer transporterar blod från hjärtat, vener till hjärtat, och kapillärer möjliggör ämnesomsättning.',
        keyPoints: [
          'Artärer har tjocka elastiska väggar för högt tryck',
          'Vener har klaffar som förhindrar backflöde',
          'Kapillärer har tunna väggar för diffusion',
          'Blodtryck: systoliskt (under kontraktion) och diastoliskt (under avslappning)'
        ]
      }
    ],
    examples: [
      'Aorta är kroppens största artär som förgrenar sig till alla organ',
      'Vena cava samlar syrefattigt blod från kroppen till höger förmak',
      'Lungkapillärer möjliggör gasutbyte mellan luft och blod'
    ],
    reflectionQuestions: [
      'Varför har vänster kammare tjockare vägg än höger?',
      'Hur regleras hjärtfrekvensen vid träning?',
      'Vad händer vid hjärtinfarkt och varför är det livshotande?'
    ]
  },
  {
    id: 4,
    title: 'Andningssystemet',
    description: 'Gasutbyte och syreupptagning',
    emoji: '🫁',
    sections: [
      {
        title: 'Andningsorganens anatomi',
        content: 'Andningssystemet består av övre (näsa, svalg, strupe) och nedre (luftstrupe, bronker, lungor) luftvägar. Lungorna innehåller miljontals alveolerna där gasutbyte sker mellan luft och blod.',
        keyPoints: [
          'Näsan värmer, fuktar och renar inandningsluften',
          'Luftstrupen förstärks av brosk för att hållas öppen',
          'Bronkträdet förgrenar sig ner till små bronkioler',
          'Alveolerna omges av kapillärer för gasutbyte'
        ]
      },
      {
        title: 'Andningsmekanik och gasutbyte',
        content: 'Inandning sker när mellangärdet och interkostalmusklerna drar ut bröstkorgen, vilket skapar undertryck. Gasutbyte i alveoler sker genom diffusion: syre in i blodet, koldioxid ut ur blodet.',
        keyPoints: [
          'Mellangärdet är huvudmuskeln för andning',
          'Ytspänning i alveolerna minskas av surfaktant',
          'Hemoglobin i röda blodkroppar transporterar syre',
          'Andningscentrum i hjärnstammen reglerar andningen'
        ]
      }
    ],
    examples: [
      'Vid fysisk aktivitet ökar andningsfrekvensen för att tillgodose syrebehov',
      'Höjdsjuka uppstår vid lågt syretryck på hög höjd',
      'Astma orsakar sammandragning av bronkiolerna'
    ],
    reflectionQuestions: [
      'Hur påverkar rökrökning lungfunktionen?',
      'Varför andas man tyngre efter hårt arbete?',
      'Hur fungerar syretransport från lungor till vävnader?'
    ]
  },
  {
    id: 5,
    title: 'Matsmältningssystemet',
    description: 'Nedbrytning och upptag av näringsämnen',
    emoji: '🔄',
    sections: [
      {
        title: 'Matsmältningskanalen',
        content: 'Matsmältningssystemet inkluderar munhåla, svalg, matstrupe, magsäck, tunntarm och tjocktarm. Varje del har specifika funktioner för att bryta ner mat mekaniskt och kemiskt samt absorbera näringsämnen.',
        keyPoints: [
          'Munnen: mekanisk nedbrytning och start av kolhydratsmältning',
          'Magsäcken: kemisk nedbrytning med saltsyra och pepsin',
          'Tunntarmen: huvudsakligt ställe för absorption',
          'Tjocktarmen: vattenabsorption och avföringbildning'
        ]
      },
      {
        title: 'Accessoriska organ och enzymer',
        content: 'Lever, gallblåsa och bukspottkörtel stödjer matsmältningen. Levern producerar galla för fettsmältning, bukspottkörteln utsöndrar enzymer och buffrar, och olika enzymer bryter ner proteiner, kolhydrater och fetter.',
        keyPoints: [
          'Lever: producerar galla, omvandlar och lagrar näringsämnen',
          'Bukspottkörtel: enzymer (amylas, lipas, proteas) och insulin',
          'Tunntarmsvilli ökar absorptionsytan dramatiskt',
          'Tarmflora hjälper till att bryta ner fiberämnen'
        ]
      }
    ],
    examples: [
      'Pepsin i magsäcken bryter ner proteiner i surt pH',
      'Galla emulgerar fetter till mindre droppar för enklare nedbrytning',
      'Vitamin B12 absorberas i slutet av tunntarmen'
    ],
    reflectionQuestions: [
      'Varför är pH-balansen viktig i olika delar av matsmältningskanalen?',
      'Hur påverkar tarmflora vår hälsa?',
      'Vad händer vid laktos- eller glutenintolerans?'
    ]
  },
  {
    id: 6,
    title: 'Njurar och utsöndringssystemet',
    description: 'Reglering av vätske- och saltbalans',
    emoji: '💧',
    sections: [
      {
        title: 'Njurarnas struktur och funktion',
        content: 'Njurarna reglerar vätske- och elektrolytbalans, utfiltrerar avfallsprodukter, och styr blodtryck. Varje njure innehåller miljoner nefroner som filtrerar blod och producerar urin.',
        keyPoints: [
          'Glomerulus: filtreringskapillärer i Bowmans kapsel',
          'Tubuli: reabsorberar vatten, glukos och salter',
          'Henles slynga: skapar koncentrationsgradient',
          'ADH och aldosteron reglerar vatten- och saltbalans'
        ]
      },
      {
        title: 'Urinvägarna',
        content: 'Urin transporteras från njurarna via urinledare till urinblåsan där den lagras. Vid urladdning passerar urinen genom urinröret ut ur kroppen. Sfinktermuskler kontrollerar urladdning.',
        keyPoints: [
          'Cirka 180 liter blod filtreras dagligen',
          'Endast 1-2 liter urin produceras per dag',
          'Urin består av vatten, urea, kreatinin och salter',
          'Färg och sammansättning indikerar hälsostatus'
        ]
      }
    ],
    examples: [
      'Dehydrering leder till mörk koncentrerad urin',
      'Diabetes kan orsaka socker i urinen',
      'Njursten bildas vid för hög koncentration av mineraler'
    ],
    reflectionQuestions: [
      'Hur balanserar njurarna kroppens vätskenivå?',
      'Varför är protein i urinen ett tecken på njurskada?',
      'Hur påverkar kost njurarnas arbetsbelastning?'
    ]
  },
  {
    id: 7,
    title: 'Nervsystemet',
    description: 'Kroppens kommunikations- och kontrollsystem',
    emoji: '🧠',
    sections: [
      {
        title: 'Nervsystemets organisation',
        content: 'Nervsystemet delas in i centrala nervsystemet (CNS: hjärna och ryggmärg) och perifera nervsystemet (PNS: nerver i kroppen). PNS inkluderar somatiska (viljestyrda) och autonoma (ofrivilliga) systemet.',
        keyPoints: [
          'CNS processar information och sänder ut kommandon',
          'PNS samlar sensorisk info och utför motoriska kommandon',
          'Autonoma systemet: sympatiskt (fight-or-flight) och parasympatiskt (vila och matsmältning)',
          'Reflexer är snabba omedvetna reaktioner'
        ]
      },
      {
        title: 'Neuroner och signalöverföring',
        content: 'Neuroner är nervceller som överför elektriska impulser (aktionspotentialer). Synaps är kontaktpunkter mellan neuroner där kemiska signaler (neurotransmittorer) överför information.',
        keyPoints: [
          'Aktionspotential: elektriskt impulser längs axon',
          'Myelin ökar signalöverföringshastigheten',
          'Neurotransmittorer: acetylkolin, dopamin, serotonin, noradrenalin',
          'Receptorer på postsynaptisk neuron tar emot signaler'
        ]
      }
    ],
    examples: [
      'Reflexen att dra bort handen från hett föremål',
      'Dopaminbrist i Parkinsons sjukdom påverkar motorik',
      'Serotonin påverkar humör och sömnmönster'
    ],
    reflectionQuestions: [
      'Hur skiljer sig sympatiska och parasympatiska systemet?',
      'Varför är myelinisering viktig för nervfunktion?',
      'Hur påverkar stress nervsystemet?'
    ]
  },
  {
    id: 8,
    title: 'Endokrina systemet',
    description: 'Hormonell reglering och kommunikation',
    emoji: '⚗️',
    sections: [
      {
        title: 'Hormonkörtlar och deras hormoner',
        content: 'Endokrina systemet består av körtlar som utsöndrar hormoner direkt i blodet. Viktiga körtlar inkluderar hypofysen, tyreoida, binjurar, bukspottkörtel och könkörtlar.',
        keyPoints: [
          'Hypofysen: masterkörteln som styr andra körtlar',
          'Tyreoida: tyrosin reglerar metabolism',
          'Binjurar: kortisol (stress) och adrenalin',
          'Bukspottkörtel: insulin och glukagon (blodsockerkontroll)'
        ]
      },
      {
        title: 'Hormonell reglering',
        content: 'Hormoner regleras genom negativ feedback, där höga nivåer av ett hormon hämmar dess produktion. Hormoner påverkar målceller med specifika receptorer och reglerar tillväxt, metabolism, reproduktion och stressvar.',
        keyPoints: [
          'Peptid hormoner: snabbverkande, vattenlösliga',
          'Steroidhormoner: långsammare, fettlösliga',
          'Hypothalamus-hypofys-axel styr många hormonsystem',
          'Diabetes typ 1 och 2 involverar insulinproblematik'
        ]
      }
    ],
    examples: [
      'Adrenalin ökar hjärtfrekvens och energitillgång vid stress',
      'Insulin sänker blodsockernivån efter måltid',
      'Tillväxthormon stimulerar skelett- och muskeltillväxt'
    ],
    reflectionQuestions: [
      'Hur skiljer sig hormonell och nervös kommunikation?',
      'Varför är negativ feedback viktigt för homeostas?',
      'Hur påverkar sköldkörtelproblem kroppens metabolism?'
    ]
  }
];

export default function MED102AnatomiFysiologi() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgressData>({
    completedModules: [],
    targetGrade: 'VG',
    userNotes: {}
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);

  const COURSE_KEY = 'med102_progress';

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      if (!user) return;
      const key = `${COURSE_KEY}_${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async (newProgress: CourseProgressData) => {
    try {
      if (!user) return;
      const key = `${COURSE_KEY}_${user.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const toggleModuleComplete = (moduleId: number) => {
    const newCompleted = progress.completedModules.includes(moduleId)
      ? progress.completedModules.filter(id => id !== moduleId)
      : [...progress.completedModules, moduleId];
    
    saveProgress({ ...progress, completedModules: newCompleted });
  };

  const openNoteModal = (moduleId: number) => {
    setEditingModuleId(moduleId);
    setCurrentNote(progress.userNotes[moduleId] || '');
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (editingModuleId === null) return;
    
    const newNotes = { ...progress.userNotes };
    if (currentNote.trim()) {
      newNotes[editingModuleId] = currentNote;
    } else {
      delete newNotes[editingModuleId];
    }
    
    saveProgress({ ...progress, userNotes: newNotes });
    setNoteModalVisible(false);
    setCurrentNote('');
    setEditingModuleId(null);
  };

  const progressPercent = (progress.completedModules.length / courseModules.length) * 100;

  const renderModuleCard = (module: Module) => {
    const isCompleted = progress.completedModules.includes(module.id);
    const hasNote = !!progress.userNotes[module.id];

    return (
      <FadeInView key={module.id} delay={module.id * 100}>
        <TouchableOpacity
          style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => setSelectedModule(module)}
          activeOpacity={0.7}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIconContainer}>
              <Text style={styles.moduleEmoji}>{module.emoji}</Text>
            </View>
            <View style={styles.moduleTitleContainer}>
              <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
                {module.title}
              </Text>
              <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                {module.description}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleModuleComplete(module.id)}
              style={styles.checkButton}
            >
              {isCompleted ? (
                <CheckCircle size={28} color="#10b981" strokeWidth={2} />
              ) : (
                <Circle size={28} color={theme.colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.moduleFooter}>
            <View style={styles.moduleStats}>
              <BookOpen size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {module.sections.length} avsnitt
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.noteButton, hasNote && styles.noteButtonActive]}
              onPress={() => openNoteModal(module.id)}
            >
              <Edit3 size={16} color={hasNote ? '#3b82f6' : theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </FadeInView>
    );
  };

  if (selectedModule) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#e0f2fe', '#bae6fd']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => setSelectedModule(null)}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {selectedModule.title}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.moduleDetailContainer}>
            <Text style={styles.moduleDetailEmoji}>{selectedModule.emoji}</Text>
            <Text style={[styles.moduleDetailDescription, { color: theme.colors.textSecondary }]}>
              {selectedModule.description}
            </Text>

            {selectedModule.sections.map((section, index) => (
              <View key={index} style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionContent, { color: theme.colors.textSecondary }]}>
                  {section.content}
                </Text>
                
                <View style={styles.keyPointsContainer}>
                  <View style={styles.keyPointsHeader}>
                    <Lightbulb size={18} color="#f59e0b" />
                    <Text style={[styles.keyPointsTitle, { color: theme.colors.text }]}>
                      Viktiga punkter
                    </Text>
                  </View>
                  {section.keyPoints.map((point, idx) => (
                    <View key={idx} style={styles.keyPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={[styles.keyPointText, { color: theme.colors.textSecondary }]}>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {selectedModule.examples.length > 0 && (
              <View style={[styles.examplesCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.examplesHeader}>
                  <Target size={20} color="#8b5cf6" />
                  <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
                    Exempel
                  </Text>
                </View>
                {selectedModule.examples.map((example, idx) => (
                  <View key={idx} style={styles.example}>
                    <Text style={styles.exampleBullet}>→</Text>
                    <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                      {example}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {selectedModule.reflectionQuestions.length > 0 && (
              <View style={[styles.reflectionCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.reflectionHeader}>
                  <Sparkles size={20} color="#ec4899" />
                  <Text style={[styles.reflectionTitle, { color: theme.colors.text }]}>
                    Reflektionsfrågor
                  </Text>
                </View>
                {selectedModule.reflectionQuestions.map((question, idx) => (
                  <View key={idx} style={styles.question}>
                    <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                      {idx + 1}.
                    </Text>
                    <Text style={[styles.questionText, { color: theme.colors.textSecondary }]}>
                      {question}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#e0f2fe', '#bae6fd']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              MED102
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Anatomi och Fysiologi I
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.progressCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Award size={20} color="#fbbf24" />
              <Text style={[styles.progressTitle, { color: '#fff' }]}>
                Ditt framsteg
              </Text>
            </View>
            <Text style={[styles.progressPercent, { color: '#fff' }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: 'rgba(255,255,255,0.8)' }]}>
            {progress.completedModules.length} av {courseModules.length} moduler klara
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.modulesContainer}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Kursmoduler
            </Text>
          </View>
          {courseModules.map(renderModuleCard)}
        </View>
      </ScrollView>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Anteckningar
              </Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <CloseIcon size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  modulesContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  moduleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleEmoji: {
    fontSize: 24,
  },
  moduleTitleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
  },
  checkButton: {
    padding: 4,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },
  noteButton: {
    padding: 8,
    borderRadius: 8,
  },
  noteButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  moduleDetailContainer: {
    padding: 20,
  },
  moduleDetailEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  moduleDetailDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  keyPointsContainer: {
    marginTop: 8,
  },
  keyPointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  keyPointsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 20,
    marginRight: 8,
    color: '#3b82f6',
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  examplesCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  example: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  exampleBullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  reflectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  question: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
