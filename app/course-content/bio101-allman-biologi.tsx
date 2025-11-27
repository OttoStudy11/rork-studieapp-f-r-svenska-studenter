import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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
  Award,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import { FadeInView } from '@/components/Animations';
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
}

const courseModules: Module[] = [
  {
    id: 1,
    title: 'Cellens struktur och funktion',
    description: 'Grundläggande cellbiologi',
    emoji: '🔬',
    sections: [
      {
        title: 'Prokaryota vs eukaryota celler',
        content: 'Prokaryota celler (bakterier) saknar cellkärna och membranomslutna organeller, medan eukaryota celler (djur, växter, svampar) har komplexare struktur med organeller. Eukaryota celler är betydligt större och har kompartmentalisering.',
        keyPoints: [
          'Prokaryoter: bakterier och arkéer, enklare struktur',
          'Eukaryoter: djur, växter, svampar, protister',
          'Cellkärna innehåller DNA organiserat i kromosomer',
          'Endosymbios-teorin: mitokondrier och kloroplaster från bakterier'
        ]
      },
      {
        title: 'Cellorganeller',
        content: 'Mitokondrier producerar ATP genom aerob respiration. Endoplasmatiskt retikulum (ER) transporterar proteiner: rått ER syntetiserar proteiner, slätt ER lipider. Golgiapparaten modifierar och sorterar proteiner. Lysosomer bryter ner avfall.',
        keyPoints: [
          'Mitokondrier: cellens kraftverk',
          'Ribosomer: proteinsyntes',
          'ER och Golgi: proteintransport och modifiering',
          'Cytoskelettet: cellens struktur och rörelse'
        ]
      }
    ],
    examples: [
      'Muskelceller har många mitokondrier för energikrävande kontraktioner',
      'Bukspottkörtelceller har mycket rått ER för enzymsproduktion',
      'Spermier använder flageller (cytoskelett) för rörelse'
    ],
    reflectionQuestions: [
      'Varför behöver eukaryota celler organeller?',
      'Hur stöder endosymbios-teorin evolutionen?',
      'Hur påverkar cellens form dess funktion?'
    ]
  },
  {
    id: 2,
    title: 'DNA, RNA och proteinsyntes',
    description: 'Genetisk information och expression',
    emoji: '🧬',
    sections: [
      {
        title: 'DNA-struktur och replikation',
        content: 'DNA består av dubbelhelix med baspar: adenin-tymin (A-T) och guanin-cytosin (G-C). DNA-replikation är semikonservativ: varje ny helix innehåller en gammal och en ny sträng. DNA-polymeras katalyserar syntesen.',
        keyPoints: [
          'DNA: deoxiribonukleinsyra, genetiskt material',
          'Baspar: A-T och G-C koppling via vätebindningar',
          'Semikonservativ replikation under celldeln ing',
          'DNA-polymeras och helikas är viktiga enzym'
        ]
      },
      {
        title: 'Transkription och translation',
        content: 'Transkription: DNA kopieras till mRNA i cellkärnan. mRNA transporteras till ribosom. Translation: mRNA läses av, tRNA levererar aminosyror, och polypeptidkedja bildas. Genetiska koden är universell.',
        keyPoints: [
          'Transkription: DNA → mRNA i cellkärnan',
          'Translation: mRNA → protein vid ribosomer',
          'Kodon: tre baser kodar för en aminosyra',
          'Central dogma: DNA → RNA → Protein'
        ]
      }
    ],
    examples: [
      'Mutation i DNA kan ändra proteinfunktion (t.ex. sickle cell)',
      'Antibiotika hämmar bakteriell translation',
      'Genuttryck regleras för att producera rätt protein vid rätt tidpunkt'
    ],
    reflectionQuestions: [
      'Varför är DNA-replikation så noggrann?',
      'Hur kan en cell ha olika funktioner med samma DNA?',
      'Vad händer om det blir fel i proteinsyntes?'
    ]
  },
  {
    id: 3,
    title: 'Cellandning och energimetabolism',
    description: 'ATP-produktion och metabolism',
    emoji: '⚡',
    sections: [
      {
        title: 'Glykolys och Krebs cykel',
        content: 'Glykolys bryter ner glukos till pyruvat i cytoplasman, ger lite ATP och NADH. Krebs cykel (citronsyracykeln) i mitokondrier oxiderar pyruvat helt, producerar NADH och FADH2 som bär elektroner till elektrontransportkedjan.',
        keyPoints: [
          'Glykolys: glukos → 2 pyruvat + 2 ATP + 2 NADH',
          'Krebs cykel: oxiderar acetyl-CoA, producerar NADH och FADH2',
          'Substratnivå fosforylering ger lite ATP direkt',
          'Totalt kan en glukos ge ~30-32 ATP'
        ]
      },
      {
        title: 'Elektrontransportkedjan och oxidativ fosforylering',
        content: 'NADH och FADH2 från Krebs cykel donerar elektroner till elektrontransportkedjan i inre mitokondriemembranet. Protongradient skapas och driver ATP-syntas som producerar ATP. Syre är slutlig elektronacceptor.',
        keyPoints: [
          'Elektrontransportkedja: proteinkomplex I-IV',
          'Protonpumpning skapar gradient',
          'ATP-syntas driver ATP-produktion',
          'Anaerob respiration: mjölksyrafermentation utan syre'
        ]
      }
    ],
    examples: [
      'Muskler övergår till mjölksyrafermentation vid hårt arbete',
      'Cyanid blockerar elektrontransportkedjan, dödligt',
      'Jäst använder alkoholfermentation för att producera etanol'
    ],
    reflectionQuestions: [
      'Varför är aerob respiration så mycket effektivare än anaerob?',
      'Hur påverkar diet energimetabolismen?',
      'Vad händer vid brist på syre i vävnader?'
    ]
  },
  {
    id: 4,
    title: 'Fotosyntes',
    description: 'Ljusberoende och ljusoberoende reaktioner',
    emoji: '🌱',
    sections: [
      {
        title: 'Ljusreaktioner',
        content: 'Fotosyntes sker i kloroplaster. Ljusreaktioner i tylakoidmembran: ljusenergi fångas av klorofyll, elektroner exciteras, vatten spjälkas (fotolyss) och syre frigörs. ATP och NADPH produceras för ljusoberoende reaktioner.',
        keyPoints: [
          'Fotosystem II och I fångar ljusenergi',
          'Vatten spjälkas: 2H₂O → O₂ + 4H⁺ + 4e⁻',
          'Elektrontransport genererar ATP och NADPH',
          'Ljusreaktioner sker i tylakoidmembranet'
        ]
      },
      {
        title: 'Calvin-cykeln (ljusoberoende reaktioner)',
        content: 'Calvin-cykeln i kloroplasternas stroma fixerar CO₂ till organiska molekyler. Enzym RuBisCO katalyserar kolfixering. ATP och NADPH från ljusreaktioner driver syntesen av glukos från CO₂.',
        keyPoints: [
          'Kolfixering: CO₂ + RuBP → 2 x 3-fosfoglycerat',
          'Reduktion: ATP och NADPH används',
          'Regenerering av RuBP',
          'Nettoreaktion: 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O'
        ]
      }
    ],
    examples: [
      'C4 och CAM-växter har anpassningar för torra klimat',
      'Skuggväxter har mer klorofyll för att fånga svagare ljus',
      'Global uppvärmning påverkar fotosynteshastighet'
    ],
    reflectionQuestions: [
      'Hur bidrar fotosyntes till livets energiflöde?',
      'Varför är fotosyntesen viktig för atmosfären?',
      'Hur kan växter anpassa fotosyntes till olika miljöer?'
    ]
  },
  {
    id: 5,
    title: 'Celldeln ing: mitos och meios',
    description: 'Somatisk delning och könscellsbildning',
    emoji: '🔄',
    sections: [
      {
        title: 'Mitos',
        content: 'Mitos är somatisk celldelning: en diploid cell delar sig till två genetiskt identiska diploida dotterceller. Faser: profas (kromosomer kondenserar), metafas (kromosomer vid ekvatorialplanet), anafas (kromatider separeras), telofas och cytokines (celldelning).',
        keyPoints: [
          'Diploid (2n): två uppsättningar kromosomer',
          'Systerkamatider separeras vid anafas',
          'Mitotisk spindel drar isär kromosomer',
          'Resulterar i genetiskt identiska celler'
        ]
      },
      {
        title: 'Meios',
        content: 'Meios producerar haploida könsceller (gameter) från diploida celler. Två delningar: meios I separerar homologa kromosompar, meios II separerar systerkriomatider. Crossing-over skapar genetisk variation.',
        keyPoints: [
          'Meios I: homologa par separeras, reduktion till haploid',
          'Meios II: liknar mitos, systerkriomatider separeras',
          'Crossing-over: genetiskt material byts mellan homologa kromosomer',
          'Resulterar i fyra haploida celler med genetisk variation'
        ]
      }
    ],
    examples: [
      'Fel i mitos kan leda till cancer',
      'Non-disjunction i meios ger kromosomavvikelser (t.ex. Downs syndrom)',
      'Genetisk variation från meios är grunden för evolution'
    ],
    reflectionQuestions: [
      'Varför är meios viktigt för sexuell reproduktion?',
      'Hur skapar crossing-over genetisk variation?',
      'Vad skiljer mitos från meios?'
    ]
  },
  {
    id: 6,
    title: 'Genetik och arv',
    description: 'Mendels lagar och modern genetik',
    emoji: '🧪',
    sections: [
      {
        title: 'Mendels lagar',
        content: 'Mendels första lag (segregation): alleler separeras vid gametbildning. Andra lagen (oberoende fördelning): gener på olika kromosomer ärv s oberoende. Dominant vs recessiv: dominant allel maskerar recessiv.',
        keyPoints: [
          'Homozygot: två lika alleler (AA eller aa)',
          'Heterozygot: två olika alleler (Aa)',
          'Fenotyp: observerbara egenskaper',
          'Genotyp: genetisk sammansättning'
        ]
      },
      {
        title: 'Modern genetik',
        content: 'Ofullständig dominans: intermediär fenotyp. Multipla alleler: mer än två alleler i populationen (t.ex. ABO-blodgrupp). Könskromosomalt arv: gener på X eller Y kromosomen. Polygent arv: många gener påverkar en egenskap.',
        keyPoints: [
          'Könskromosomer: XX (kvinna), XY (man)',
          'X-bundna sjukdomar: oftare hos män',
          'Epigenetik: genuttryck påverkas utan DNA-sekvensändring',
          'Geninteraktion: epistasi och pleiotropi'
        ]
      }
    ],
    examples: [
      'Ärtsplantor: långa vs korta (Mendels experiment)',
      'Hemofili: X-bunden recessiv sjukdom',
      'Hudfärg: polygent arv med många gener'
    ],
    reflectionQuestions: [
      'Hur kan recessiva sjukdomar bevaras i populationer?',
      'Varför är X-bundna sjukdomar vanligare hos män?',
      'Hur påverkar miljön genuttryck?'
    ]
  },
  {
    id: 7,
    title: 'Evolution och naturligt urval',
    description: 'Mekanismer för evolution',
    emoji: '🦎',
    sections: [
      {
        title: 'Darwins evolutionsteori',
        content: 'Naturligt urval: individer med fördelaktiga egenskaper överlever och reproducerar sig mer. Över tid leder detta till evolution. Variation, arvbarhet och differentiell reproduktion är nyckelkomponenter.',
        keyPoints: [
          'Variation i populationer från mutationer och sexuell reproduktion',
          'Överproduktion av avkomma leder till konkurrens',
          'Individer med fördelaktiga egenskaper överlever',
          'Adaptation: egenskaper som ökar fitness'
        ]
      },
      {
        title: 'Evolutionsmekanismer',
        content: 'Mutation: slumpmässiga DNA-förändringar, råmaterial för evolution. Genflöde: gener flyttas mellan populationer. Genetisk drift: slumpmässiga förändringar i allelfrekvenser, större effekt i små populationer. Sexuellt urval: val av partner påverkar evolution.',
        keyPoints: [
          'Mutation skapar nya alleler',
          'Genflöde minskar genetiska skillnader mellan populationer',
          'Genetisk drift: founder effect och bottleneck effect',
          'Sexuellt urval kan leda till extravaganta drag'
        ]
      }
    ],
    examples: [
      'Antibiotika resistens hos bakterier',
      'Darwins finkar: olika näbbformer för olika föda',
      'Industriell melanism hos björkfly'
    ],
    reflectionQuestions: [
      'Hur skiljer sig naturligt urval från genetisk drift?',
      'Kan evolution förutsägas?',
      'Hur påverkar människan evolution hos andra arter?'
    ]
  },
  {
    id: 8,
    title: 'Ekologi och ekosystem',
    description: 'Organismers samspel med miljön',
    emoji: '🌍',
    sections: [
      {
        title: 'Ekosystemens struktur',
        content: 'Ekosystem består av biotiska (levande) och abiotiska (icke-levande) faktorer. Näringskedjor: producenter (fotosyntetiserande organismer), konsumenter (herbivorer, karnivorer), nedbrytare. Energiflöde är unidirektionellt, näringsämnen cirkulerar.',
        keyPoints: [
          'Producenter: växter och fotosyntetiserande bakterier',
          'Primära konsumenter: herbivorer',
          'Sekundära/tertiära konsumenter: karnivorer',
          'Nedbrytare: återvinner näringsämnen'
        ]
      },
      {
        title: 'Populationsdynamik',
        content: 'Populationstillväxt: exponentiell vs logistisk. Bärkapacitet: max population miljön kan stödja. Täthetsberoende faktorer: konkurrens, predation. Täthetsoberoende faktorer: naturkatastrofer.',
        keyPoints: [
          'Exponentiell tillväxt: obegränsade resurser',
          'Logistisk tillväxt: närmar sig bärkapacitet',
          'Intra- och interspecifik konkurrens',
          'Predator-bytesrelationer skapar populationscykler'
        ]
      }
    ],
    examples: [
      'Algblomning vid övergödning',
      'Lo-hare cykler i nordliga skogar',
      'Invasiva arter påverkar ekosystem negativt'
    ],
    reflectionQuestions: [
      'Hur påverkar människan näringskedjor?',
      'Varför är biologisk mångfald viktig för ekosystem?',
      'Hur kan ekosystem återhämta sig efter störningar?'
    ]
  }
];

export default function BIO101AllmanBiologi() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgressData>({
    completedModules: [],
    targetGrade: 'VG',
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const COURSE_KEY = 'bio101_progress';

  useEffect(() => {
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
    loadProgress();
  }, [user]);

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

  const progressPercent = (progress.completedModules.length / courseModules.length) * 100;

  const renderModuleCard = (module: Module) => {
    const isCompleted = progress.completedModules.includes(module.id);

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
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#d1fae5', '#a7f3d0']}
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
                  <Target size={20} color="#10b981" />
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
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#d1fae5', '#a7f3d0']}
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
              BIO101
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Allmän Biologi I
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
    color: '#10b981',
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
    color: '#10b981',
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
});
