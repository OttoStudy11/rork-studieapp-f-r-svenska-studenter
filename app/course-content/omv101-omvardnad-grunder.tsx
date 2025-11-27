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
    title: 'Omvårdnadens historia och utveckling',
    description: 'Från tidig vård till modern omvårdnad',
    emoji: '📚',
    sections: [
      {
        title: 'Florence Nightingale och pionjärer',
        content: 'Florence Nightingale grundade modern omvårdnad på 1800-talet. Hon betonade hygien, miljöns betydelse och vetenskaplig observation. Hennes arbete under Krimkriget visade hur vård kunde rädda liv.',
        keyPoints: [
          'Nightingale-modellen: miljö, observation, hygien',
          'Evidensbaserad vård började med statistisk analys',
          'Professionalisering av omvårdnad',
          'Utveckling från religiös kallelse till akademisk disciplin'
        ]
      },
      {
        title: 'Modern omvårdnadsteori',
        content: 'Moderna omvårdnadsteorier utvecklades av Virginia Henderson, Dorothea Orem, och Katie Eriksson. De betonar patientens grundläggande behov, självvård och vårdande som etisk handling.',
        keyPoints: [
          'Henderson: 14 grundläggande behov',
          'Orem: Självvårdsteori',
          'Eriksson: Vårdvetenskaplig teori med fokus på lidande',
          'Holistiskt synsätt: människa som helhet'
        ]
      }
    ],
    examples: [
      'Nightingales hygienprinciper minskade dödligheten dramatiskt',
      'Självvårdsteorin används vid diabetes och kroniska sjukdomar',
      'Vårdande samtal lindrar existentiellt lidande'
    ],
    reflectionQuestions: [
      'Hur har omvårdnaden förändrats från Nightingales tid?',
      'Varför är teoretisk grund viktig för modern omvårdnad?',
      'Hur balanserar man medicinsk teknik med vårdande relation?'
    ]
  },
  {
    id: 2,
    title: 'Etik och juridik i omvårdnad',
    description: 'Etiska principer och rättsliga ramar',
    emoji: '⚖️',
    sections: [
      {
        title: 'Etiska principer',
        content: 'Omvårdnadsetik bygger på fyra grundprinciper: autonomi (självbestämmande), beneficens (göra gott), non-maleficens (inte skada), och rättvisa. Dessa styr vårdpersonalens beslut och handlingar.',
        keyPoints: [
          'Autonomi: respektera patientens val och integritet',
          'Beneficens: agera i patientens bästa intresse',
          'Non-maleficens: undvik att skada',
          'Rättvisa: lika vård oavsett bakgrund'
        ]
      },
      {
        title: 'Juridiska aspekter',
        content: 'Hälso- och sjukvårdslagen (HSL) och patientlag reglerar vård i Sverige. Vårdpersonal har skyldigheter kring dokumentation, tystnadsplikt och informerat samtycke.',
        keyPoints: [
          'HSL: säker, kunskapsbaserad vård av god kvalitet',
          'Patientlagen: information, delaktighet, samtycke',
          'Tystnadsplikt och sekretess',
          'Dokumentationsskyldighet för patientsäkerhet'
        ]
      }
    ],
    examples: [
      'Dilemma: Patient vägrar livsnödvändig behandling',
      'Hantering av misstänkt misshandel med tystnadsplikt',
      'Etiskt beslut vid begränsade resurser'
    ],
    reflectionQuestions: [
      'Hur löser man konflikter mellan autonomi och beneficens?',
      'Varför är dokumentation både juridiskt och etiskt viktigt?',
      'Hur säkerställer man informerat samtycke i praktiken?'
    ]
  },
  {
    id: 3,
    title: 'Kommunikation och bemötande',
    description: 'Vårdande kommunikation och relation',
    emoji: '💬',
    sections: [
      {
        title: 'Terapeutisk kommunikation',
        content: 'Effektiv kommunikation i vården kräver aktivt lyssnande, empati, och klarhet. Verbal och icke-verbal kommunikation påverkar vårdrelationen och patientens tillit.',
        keyPoints: [
          'Aktivt lyssnande utan avbrott',
          'Öppna frågor för djupare förståelse',
          'Empati och validering av känslor',
          'Kroppsspråk och tonfall är lika viktigt som ord'
        ]
      },
      {
        title: 'Kulturell kompetens',
        content: 'Kulturell kompetens innebär att förstå och respektera olika kulturers syn på hälsa, sjukdom och vård. Tolk används vid språkbarriärer, och kulturella traditioner respekteras.',
        keyPoints: [
          'Kulturell medvetenhet om egna fördomar',
          'Respekt för olika värderingar kring sjukdom',
          'Professionell tolk vid behov',
          'Individanpassad vård trots kulturella skillnader'
        ]
      }
    ],
    examples: [
      'Använd reflektion: "Det låter som att du känner oro"',
      'Vid smärtbedömning: kulturella uttryck kan variera',
      'Respektera religiösa behov kring mat och bön'
    ],
    reflectionQuestions: [
      'Hur påverkar din egen kommunikationsstil vårdrelationen?',
      'Vilka utmaningar finns vid kommunikation med anhöriga?',
      'Hur hanterar man språkbarriärer effektivt?'
    ]
  },
  {
    id: 4,
    title: 'Hygien och infektionsprevention',
    description: 'Förebygga vårdrelaterade infektioner',
    emoji: '🧼',
    sections: [
      {
        title: 'Basala hygienrutiner',
        content: 'Handhygien är den viktigaste åtgärden för att förhindra smittspridning. Kompletterande rutiner inkluderar skyddsutrustning, rena arbetskläder och korrekt avfallshantering.',
        keyPoints: [
          'Handhygien före och efter patientkontakt',
          'Handsprit eller tvål och vatten beroende på situation',
          'Skyddsutrustning: handskar, förkläde, munskydd',
          'Aseptisk teknik vid invasiva procedurer'
        ]
      },
      {
        title: 'Smittvägar och isolering',
        content: 'Smittämnen sprids via kontakt, droppar, luftburen smitta eller genom föremål. Isolering används för att skydda patient och andra från spridning av multiresistenta bakterier eller smittsamma sjukdomar.',
        keyPoints: [
          'Kontaktsmitta: MRSA, VRE',
          'Droppsamitta: influensa, covid-19',
          'Luftburen smitta: tuberkulos',
          'Vårdrelaterade infektioner: urinvägsinfektioner, postoperativa sårinfektioner'
        ]
      }
    ],
    examples: [
      'Handhygien med alkohol efter hantering av inkontinent patient',
      'Kontaktisolering vid MRSA-kolonisation',
      'Kirurgisk aseptik vid kateterläggning'
    ],
    reflectionQuestions: [
      'Varför är följsamhet till hygienrutiner ibland låg?',
      'Hur påverkar isolering patientens psykiska hälsa?',
      'Vad är skillnaden mellan kolonisering och infektion?'
    ]
  },
  {
    id: 5,
    title: 'Nutrition och vätskebalans',
    description: 'Näringsintag och hydreringsstatus',
    emoji: '🍽️',
    sections: [
      {
        title: 'Nutritionsbedömning',
        content: 'Nutritionsstatus bedöms genom BMI, vikt förändring, matintag och laboratorievärden. Undernäring är vanligt bland äldre och sjuka patienter och försenar tillfrisknande.',
        keyPoints: [
          'BMI, vikt, midjemått',
          'Matdagbok och intag bedömning',
          'Albumin och Pre-albumin som markörer',
          'Risk för undernäring: äldre, cancerpatienter, postoperativt'
        ]
      },
      {
        title: 'Vätskebalans',
        content: 'Kropppen består av cirka 60% vatten. Vätskebalans regleras av intag, förluster (urin, svett, andning) och njurarnas funktion. Dehydrering och övervätskning är vanliga problem.',
        keyPoints: [
          'Intag via mat, dryck och infusion',
          'Förluster: urin, avföring, svett, andning, dränage',
          'Tecken på dehydrering: torr hud, minskad hudturgor, mörk urin',
          'Tecken på övervätskning: ödem, andnöd, viktökning'
        ]
      }
    ],
    examples: [
      'Hjälp patient med måltid för att öka intag',
      'Dokumentera in- och utvätskning noggrant',
      'Identifiera risk för malnutrition vid inskrivning'
    ],
    reflectionQuestions: [
      'Hur påverkar nutrition sårläkning?',
      'Vilka patienter har högst risk för vätskerubbningar?',
      'Hur stödjer man patienter med ätstörning?'
    ]
  },
  {
    id: 6,
    title: 'Smärta och smärtlindring',
    description: 'Bedömning och behandling av smärta',
    emoji: '💊',
    sections: [
      {
        title: 'Smärtfysiologi och typer',
        content: 'Smärta är en subjektiv upplevelse med sensorisk och emotionell komponent. Akut smärta varnar för skada, kronisk smärta varar längre än 3 månader. Nociceptiv, neuropatisk och psykogen smärta kräver olika strategier.',
        keyPoints: [
          'Nociceptiv: vävnadsskada (postoperativ, trauma)',
          'Neuropatisk: nervskada (diabetes, ryggmärgsskada)',
          'Gate-control teori: smärtsignaler moduleras',
          'Smärtan är vad patienten säger att den är'
        ]
      },
      {
        title: 'Smärtbedömning och behandling',
        content: 'Smärta bedöms med VAS (visuell analog skala) eller NRS (numerisk skala 0-10). Behandling inkluderar farmakologiska (NSAID, opioider) och icke-farmakologiska metoder (TENS, avslappning, positionering).',
        keyPoints: [
          'Regelbunden smärtskattning med validerade instrument',
          'WHO smärtstege: paracetamol, NSAID, svaga/starka opioider',
          'Icke-farmakologisk: värme/kyla, massage, distraktion',
          'Multimodal smärtlindring kombinerar metoder'
        ]
      }
    ],
    examples: [
      'Postoperativ smärta: kombinera opioider med paracetamol',
      'Neuropatisk smärta vid diabetes: gabapentin eller pregabalin',
      'TENS vid muskuloskeletal smärta'
    ],
    reflectionQuestions: [
      'Varför underbehandlas smärta ibland?',
      'Hur skiljer man mellan smärta och drogberoende beteende?',
      'Vilken roll har anhöriga i smärtbedömning?'
    ]
  },
  {
    id: 7,
    title: 'Mobilisering och förflyttning',
    description: 'Förebygga immobilitet och fallskador',
    emoji: '🚶',
    sections: [
      {
        title: 'Konsekvenser av immobilitet',
        content: 'Långvarig sängläge leder till muskel atrofi, trycksår, pneumoni, trombos och funktionsnedsättning. Tidig mobilisering efter operation eller sjukdom förbättrar återhämtning.',
        keyPoints: [
          'Muskelatrofi: styrkeförlust efter få dagar',
          'Trycksår: riskområden sakrum, hälar, höfter',
          'Pneumoni och atelektaser vid stillaliggande',
          'Trombosprofylax och tidig mobilisering'
        ]
      },
      {
        title: 'Ergonomi och förflytningsteknik',
        content: 'Korrekt lyftteknik skyddar både patient och vårdare. Använd hjälpmedel som glidlakan, liftar och höj-/sänkbara sängar. Bedöm patientens förmåga och involvera patienten aktivt.',
        keyPoints: [
          'Bred ställning, böj i knäna, håll rygg rak',
          'Använd mekaniska hjälpmedel vid behov',
          'Kommunicera och samarbeta med patienten',
          'Fallprevention: bedöm riskfaktorer, säkra miljö'
        ]
      }
    ],
    examples: [
      'Mobilisera postoperativa patienter samma dag om möjligt',
      'Använd lyftar för omflyttning av ej självgående',
      'Bedöm fallrisk med validerat instrument (Downton)'
    ],
    reflectionQuestions: [
      'Hur balanserar man patientsäkerhet med tidig mobilisering?',
      'Varför är arbetsmiljöskador vanliga inom vård?',
      'Hur motiverar man patienter att mobilisera trots smärta?'
    ]
  },
  {
    id: 8,
    title: 'Dokumentation och journalföring',
    description: 'Patientsäker och juridiskt korrekt dokumentation',
    emoji: '📝',
    sections: [
      {
        title: 'Dokumentationens syfte',
        content: 'Dokumentation säkerställer kontinuitet, kommunikation mellan vårdpersonal, juridisk säkerhet och kvalitetsutveckling. Journalen är ett rättsligt dokument och ska vara tydlig och objektiv.',
        keyPoints: [
          'VIPS-modellen: Välbefinnande, Integritet, Preventation, Säkerhet',
          'SBAR för strukturerad kommunikation: Situation, Bakgrund, Aktuellt läge, Rekommendation',
          'Objektiv beskrivning utan värderingar',
          'Dokumentera i nära anslutning till händelsen'
        ]
      },
      {
        title: 'Elektronisk journalhantering',
        content: 'Elektroniska journalsystem förbättrar tillgänglighet och säkerhet men kräver datorsäkerhet. Loggning av åtkomst, starka lösenord och avidentifiering vid forskning är viktigt.',
        keyPoints: [
          'Elektronisk signatur med BankID eller liknande',
          'Loggkontroller upptäcker obehörig åtkomst',
          'Patienters rätt att läsa sin journal',
          'GDPR och dataskydd'
        ]
      }
    ],
    examples: [
      'Dokumentera mätbara observationer: "Puls 120, andningsfrekvens 28"',
      'Använd SBAR vid akut situation eller överrapportering',
      'Journalföring är inte fullständig förrän det är dokumenterat'
    ],
    reflectionQuestions: [
      'Vad är skillnaden mellan fakta och tolkning i dokumentation?',
      'Hur säkerställer man konfidentialitet i elektroniska system?',
      'Varför är korrekt dokumentation viktig för patientsäkerhet?'
    ]
  }
];

export default function OMV101OmvardnadGrunder() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgressData>({
    completedModules: [],
    targetGrade: 'VG',
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const COURSE_KEY = 'omv101_progress';

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
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#fce7f3', '#fbcfe8']}
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
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#fce7f3', '#fbcfe8']}
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
              OMV101
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Omvårdnad - Grunder
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
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
    color: '#ec4899',
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
});
