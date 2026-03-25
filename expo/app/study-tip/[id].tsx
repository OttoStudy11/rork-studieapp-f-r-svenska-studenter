import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Clock, Users, Target, BookOpen, Lightbulb, CheckCircle } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';

const { width } = Dimensions.get('window');

interface StudyTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  detailedDescription: string;
  benefits: string[];
  howToUse: string[];
  tips: string[];
  timeRequired: string;
  bestFor: string[];
}

const studyTipsData: StudyTip[] = [
  {
    id: 1,
    title: 'Pomodoro-tekniken',
    description: 'Studera i 25-minuters intervaller med 5 minuters pauser',
    icon: '🍅',
    category: 'Tidshantering',
    difficulty: 'Nybörjare',
    detailedDescription: 'Pomodoro-tekniken är en tidshanteringsmetod utvecklad av Francesco Cirillo på slutet av 1980-talet. Tekniken använder en timer för att dela upp arbetet i intervaller, traditionellt 25 minuter långa, åtskilda av korta pauser.',
    benefits: [
      'Förbättrar fokus och koncentration',
      'Minskar mental trötthet',
      'Hjälper att övervinna prokrastination',
      'Ger känsla av framsteg och prestation',
      'Förbättrar tidsuppskattning'
    ],
    howToUse: [
      'Välj en uppgift att fokusera på',
      'Ställ in en timer på 25 minuter',
      'Arbeta med uppgiften tills timern ringer',
      'Ta en kort paus på 5 minuter',
      'Upprepa processen',
      'Ta en längre paus (15-30 min) efter 4 pomodoros'
    ],
    tips: [
      'Stäng av alla distraktioner under pomodoro-sessionen',
      'Skriv ner vad du ska göra innan du startar',
      'Använd pausen för att vila, inte för att kolla sociala medier',
      'Anpassa tiderna efter dina behov (t.ex. 45 min arbete, 10 min paus)'
    ],
    timeRequired: '25 minuter + 5 minuters paus',
    bestFor: ['Prokrastinatörer', 'Personer med koncentrationssvårigheter', 'Stora projekt']
  },
  {
    id: 2,
    title: 'Aktiv repetition',
    description: 'Testa dig själv istället för att bara läsa om materialet',
    icon: '🧠',
    category: 'Minnestekniker',
    difficulty: 'Medel',
    detailedDescription: 'Aktiv repetition innebär att aktivt testa din kunskap istället för att passivt läsa eller lyssna. Det är en av de mest effektiva inlärningsmetoderna enligt forskning.',
    benefits: [
      'Stärker långtidsminnet',
      'Identifierar kunskapsluckor',
      'Förbättrar återkallningsförmågan',
      'Gör inlärningen mer effektiv',
      'Bygger självförtroende'
    ],
    howToUse: [
      'Läs materialet först',
      'Stäng boken/anteckningarna',
      'Försök återge informationen från minnet',
      'Kontrollera vad du missade',
      'Fokusera extra på det du glömde',
      'Upprepa processen'
    ],
    tips: [
      'Använd flashcards för faktakunskap',
      'Förklara koncept högt för dig själv',
      'Skriv sammanfattningar från minnet',
      'Testa dig själv regelbundet, inte bara innan prov'
    ],
    timeRequired: '15-30 minuter per session',
    bestFor: ['Faktakunskap', 'Språkinlärning', 'Förberedelse inför prov']
  },
  {
    id: 3,
    title: 'Spaced repetition',
    description: 'Repetera material med ökande intervaller för bättre minne',
    icon: '📅',
    category: 'Minnestekniker',
    difficulty: 'Avancerad',
    detailedDescription: 'Spaced repetition är en inlärningsteknik som innebär att man ökar intervallen mellan repetitionstillfällena. Denna metod utnyttjar den psykologiska effekten av att glömma för att stärka minnet.',
    benefits: [
      'Maximerar långtidsretention',
      'Minskar tiden som behövs för inlärning',
      'Förhindrar att kunskap glöms bort',
      'Optimerar repetitionsschema',
      'Bygger robust kunskap'
    ],
    howToUse: [
      'Lär dig nytt material',
      'Repetera efter 1 dag',
      'Repetera efter 3 dagar',
      'Repetera efter 1 vecka',
      'Repetera efter 2 veckor',
      'Repetera efter 1 månad'
    ],
    tips: [
      'Använd appar som Anki eller Quizlet',
      'Håll koll på vad du behöver repetera',
      'Fokusera mer på svårt material',
      'Var konsekvent med schemat'
    ],
    timeRequired: '10-20 minuter per dag',
    bestFor: ['Språkinlärning', 'Medicinska termer', 'Långsiktig kunskapsretention']
  },
  {
    id: 4,
    title: 'Feynman-tekniken',
    description: 'Förklara komplexa koncept med enkla ord',
    icon: '👨‍🏫',
    category: 'Förståelse',
    difficulty: 'Medel',
    detailedDescription: 'Feynman-tekniken är namngiven efter fysikern Richard Feynman och går ut på att förklara komplexa koncept i enkla termer. Om du inte kan förklara något enkelt, förstår du det inte tillräckligt bra.',
    benefits: [
      'Fördjupar förståelsen',
      'Identifierar kunskapsluckor',
      'Förbättrar kommunikationsförmågan',
      'Gör komplexa ämnen lättare',
      'Stärker självförtroendet'
    ],
    howToUse: [
      'Välj ett koncept att lära dig',
      'Förklara det som om du undervisar ett barn',
      'Identifiera var förklaringen blir otydlig',
      'Gå tillbaka till källmaterialet',
      'Förenkla språket och använd analogier',
      'Upprepa tills förklaringen är kristallklar'
    ],
    tips: [
      'Använd analogier och exempel',
      'Undvik jargong och tekniska termer',
      'Rita diagram om det hjälper',
      'Testa på en vän eller familjemedlem'
    ],
    timeRequired: '20-45 minuter per koncept',
    bestFor: ['Komplexa teorier', 'Vetenskapliga koncept', 'Förberedelse för undervisning']
  },
  {
    id: 5,
    title: 'Mind mapping',
    description: 'Skapa visuella kartor för att organisera information',
    icon: '🗺️',
    category: 'Organisation',
    difficulty: 'Nybörjare',
    detailedDescription: 'Mind mapping är en visuell teknik för att organisera information. Det hjälper hjärnan att se samband och strukturer på ett naturligt sätt genom att använda färger, bilder och förgreningar.',
    benefits: [
      'Förbättrar kreativitet',
      'Hjälper att se helhetsbilden',
      'Gör information mer minnesvärd',
      'Organiserar tankar effektivt',
      'Stimulerar båda hjärnhalvorna'
    ],
    howToUse: [
      'Skriv huvudämnet i mitten',
      'Skapa grenar för huvudkategorier',
      'Lägg till undergrenar för detaljer',
      'Använd färger och symboler',
      'Håll det visuellt och enkelt',
      'Lägg till bilder när det är möjligt'
    ],
    tips: [
      'Använd olika färger för olika ämnen',
      'Håll texten kort - använd nyckelord',
      'Gör det personligt och kreativt',
      'Använd digitala verktyg som MindMeister eller XMind'
    ],
    timeRequired: '15-30 minuter',
    bestFor: ['Brainstorming', 'Projektplanering', 'Sammanfattningar']
  },
  {
    id: 6,
    title: 'Miljöbyte',
    description: 'Byt studiemiljö för att förbättra inlärningen',
    icon: '🏠',
    category: 'Miljö',
    difficulty: 'Nybörjare',
    detailedDescription: 'Forskning visar att att variera studiemiljön kan förbättra inlärningen och minnesfunktionen. Olika miljöer skapar olika kontextuella ledtrådar som hjälper hjärnan att komma ihåg information.',
    benefits: [
      'Förbättrar minnesretention',
      'Minskar tristess och monotoni',
      'Skapar nya associationer',
      'Förhindrar miljöberoende',
      'Ökar motivation'
    ],
    howToUse: [
      'Identifiera olika studiemiljöer',
      'Rotera mellan 2-3 olika platser',
      'Anpassa miljön efter uppgiften',
      'Se till att alla miljöer är lämpliga för studier',
      'Experimentera med olika tider på dagen',
      'Dokumentera vilka miljöer som fungerar bäst'
    ],
    tips: [
      'Bibliotek för djup koncentration',
      'Kafé för kreativa uppgifter',
      'Hemma för bekväma repetitioner',
      'Utomhus för reflektion och genomgång'
    ],
    timeRequired: 'Ingen extra tid krävs',
    bestFor: ['Alla typer av studier', 'Långsiktiga projekt', 'Motivation']
  },
  {
    id: 7,
    title: 'Chunking',
    description: 'Dela upp information i mindre, hanterbara delar',
    icon: '🧩',
    category: 'Minnestekniker',
    difficulty: 'Nybörjare',
    detailedDescription: 'Chunking är en kognitiv strategi som innebär att gruppera enskilda informationsbitar till större, meningsfulla enheter. Hjärnan kan bara hålla cirka 7 ± 2 objekt i arbetsminnet, men genom chunking kan du utöka denna kapacitet avsevärt.',
    benefits: [
      'Förbättrar arbetsminneskapaciteten',
      'Gör komplex information lättare att förstå',
      'Underlättar återkallning av information',
      'Minskar kognitiv belastning',
      'Hjälper vid memorering av sekvenser'
    ],
    howToUse: [
      'Identifiera informationen som ska läras',
      'Leta efter naturliga grupperingar eller mönster',
      'Skapa meningsfulla kategorier',
      'Begränsa varje grupp till 3-5 objekt',
      'Använd akronymer eller minnesramsor',
      'Repetera grupperna som enheter'
    ],
    tips: [
      'Telefonnummer är ett klassiskt exempel: 070-123-4567',
      'Gruppera historiska datum efter årtionde',
      'Dela upp långa listor i tematiska kategorier',
      'Använd visuella grupperingar i anteckningar'
    ],
    timeRequired: '10-20 minuter',
    bestFor: ['Memorering av fakta', 'Telefonnummer och koder', 'Komplexa processer']
  },
  {
    id: 8,
    title: 'Interleaving',
    description: 'Variera mellan olika ämnen för effektivare inlärning',
    icon: '🔀',
    category: 'Inlärning',
    difficulty: 'Medel',
    detailedDescription: 'Interleaving innebär att blanda olika ämnen eller problemtyper under en studiesession istället för att fokusera på en sak i taget (blockerad övning). Forskning visar att detta förbättrar långsiktig retention och problemlösningsförmåga.',
    benefits: [
      'Förbättrar diskrimineringförmåga mellan koncept',
      'Stärker långtidsminnet',
      'Förbereder för obekanta problem',
      'Ökar flexibilitet i tänkandet',
      'Förbättrar transfer av kunskap'
    ],
    howToUse: [
      'Välj 2-3 relaterade ämnen att studera',
      'Studera ämne A i 15-20 minuter',
      'Byt till ämne B',
      'Byt till ämne C',
      'Återvänd till ämne A',
      'Fortsätt rotera mellan ämnena'
    ],
    tips: [
      'Känns svårare men ger bättre resultat',
      'Perfekt för matematik och naturvetenskap',
      'Blanda liknande men olika problem',
      'Kombinera med spaced repetition för maximal effekt'
    ],
    timeRequired: '45-60 minuter per session',
    bestFor: ['Matematik', 'Naturvetenskap', 'Språkinlärning']
  },
  {
    id: 9,
    title: 'Sömn & vila',
    description: 'Optimera din sömn för bättre minneskonsolidering',
    icon: '😴',
    category: 'Hälsa',
    difficulty: 'Nybörjare',
    detailedDescription: 'Sömn är avgörande för inlärning och minne. Under sömnen konsoliderar hjärnan nya minnen, stärker neuronala kopplingar och rensar ut toxiner. Utan tillräcklig sömn försämras både inlärningsförmåga och minnesretention dramatiskt.',
    benefits: [
      'Konsoliderar daglig inlärning till långtidsminne',
      'Förbättrar koncentration och fokus',
      'Ökar kreativitet och problemlösning',
      'Stärker immunförsvaret',
      'Förbättrar emotionell stabilitet'
    ],
    howToUse: [
      'Sikta på 7-9 timmars sömn per natt',
      'Håll regelbundna sömn- och uppvakningstider',
      'Undvik skärmar 1 timme före läggdags',
      'Repetera viktig information innan du somnar',
      'Ta korta tupplurer (20-30 min) vid behov',
      'Skapa en mörk, sval sovmiljö'
    ],
    tips: [
      'Studera svårt material på kvällen - det konsolideras under natten',
      'En tupplur efter lunch kan öka eftermiddagens produktivitet',
      'Koffein tar 6 timmar att lämna kroppen - undvik sent på dagen',
      'Motion förbättrar sömnkvaliteten men inte nära läggdags'
    ],
    timeRequired: '7-9 timmar per natt',
    bestFor: ['Alla typer av studier', 'Tentamensperioder', 'Långsiktig hälsa']
  }
];

export default function StudyTipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  
  const tip = studyTipsData.find(t => t.id === parseInt(id || '1'));
  
  if (!tip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Studietips hittades inte</Text>
      </View>
    );
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nybörjare': return theme.colors.success;
      case 'Medel': return theme.colors.warning;
      case 'Avancerad': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
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
        {/* Hero Section */}
        <SlideInView direction="up" delay={100}>
          <LinearGradient
            colors={[getDifficultyColor(tip.difficulty) + '20', getDifficultyColor(tip.difficulty) + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroIcon}>{tip.icon}</Text>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{tip.title}</Text>
              <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>{tip.description}</Text>
              
              <View style={styles.heroTags}>
                <View style={[styles.categoryTag, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.categoryText, { color: theme.colors.primary }]}>{tip.category}</Text>
                </View>
                <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(tip.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(tip.difficulty) }]}>{tip.difficulty}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </SlideInView>
        
        {/* Quick Info */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.quickInfoGrid}>
            <View style={[styles.quickInfoCard, { backgroundColor: theme.colors.card }]}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Tid</Text>
              <Text style={[styles.quickInfoValue, { color: theme.colors.text }]}>{tip.timeRequired}</Text>
            </View>
            <View style={[styles.quickInfoCard, { backgroundColor: theme.colors.card }]}>
              <Target size={20} color={theme.colors.secondary} />
              <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Bäst för</Text>
              <Text style={[styles.quickInfoValue, { color: theme.colors.text }]}>{tip.bestFor[0]}</Text>
            </View>
          </View>
        </SlideInView>
        
        {/* Detailed Description */}
        <FadeInView delay={300}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <BookOpen size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Om tekniken</Text>
            </View>
            <Text style={[styles.sectionContent, { color: theme.colors.textSecondary }]}>{tip.detailedDescription}</Text>
          </View>
        </FadeInView>
        
        {/* Benefits */}
        <FadeInView delay={400}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={24} color={theme.colors.success} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fördelar</Text>
            </View>
            {tip.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
        
        {/* How to Use */}
        <FadeInView delay={500}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={24} color={theme.colors.warning} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Så här gör du</Text>
            </View>
            {tip.howToUse.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>{step}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
        
        {/* Tips */}
        <FadeInView delay={600}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Users size={24} color={theme.colors.info} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Praktiska tips</Text>
            </View>
            {tip.tips.map((tipText, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.info }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{tipText}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickInfoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  quickInfoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});