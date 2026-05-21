import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  Heart,
  BookOpen,
  Brain,
  Zap,
  Timer,
  Star,
  CheckCircle,
  Lightbulb,
  Target,
  Wind,
  Layers,
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Shield,
  MessageCircle,
  Focus,
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { DIAGNOSES, type DiagnosisInfo } from '../diagnosstod';

const { width } = Dimensions.get('window');

// ─── Full content database ──────────────────────────────────────────────────

interface DiagnosisContent {
  id: string;
  description: string;
  challenges: string[];
  techniques: { title: string; description: string; icon: string }[];
  focusTips: string[];
  motivation: string[];
  appRecommendations: { feature: string; why: string; icon: string }[];
  quickTips: string[];
  routineTemplate: { time: string; activity: string; duration: string }[];
}

const CONTENT: Record<string, DiagnosisContent> = {
  adhd: {
    id: 'adhd',
    description:
      'ADHD (Attention Deficit Hyperactivity Disorder) påverkar hjärnans förmåga att reglera uppmärksamhet, impulskontroll och aktivitetsnivå. Det är en styrka lika mycket som en utmaning — många med ADHD är kreativa, energiska och kan hyperfokusera på saker de brinner för.',
    challenges: [
      'Svårt att komma igång med uppgifter',
      'Tappar tråden mitt i studiepass',
      'Prokrastinering och undvikande',
      'Svårt att sitta still länge',
      'Impulsivt byte av uppgifter',
      'Glömmer deadlines och material',
    ],
    techniques: [
      {
        title: 'Body Doubling',
        description: 'Studera tillsammans med någon annan — även via video. Närvaron av en annan person hjälper hjärnan att hålla fokus.',
        icon: '👥',
      },
      {
        title: '5-minuters-regeln',
        description: 'Bestäm dig för att bara börja i 5 minuter. Det startar momentum och hjärnan vill ofta fortsätta.',
        icon: '⏱️',
      },
      {
        title: 'Kortare Pomodoro (10 min)',
        description: 'Vanlig Pomodoro är 25 min — för ADHD är 10–15 minuters pass med 5 min paus ofta effektivare.',
        icon: '🍅',
      },
      {
        title: 'Rörelsepaus',
        description: 'Ta en kort promenad eller gör några hoppande jacks mellan studiepass. Fysisk aktivitet ökar dopamin.',
        icon: '🚶',
      },
      {
        title: 'Chunking av uppgifter',
        description: 'Dela upp stora uppgifter i mikrosteg på max 10 minuter. Kryssa av varje steg.',
        icon: '🧩',
      },
    ],
    focusTips: [
      'Använd hörlurar med vitt brus eller lo-fi musik',
      'Stäng av alla notifikationer under studiepass',
      'Håll skrivbordet rent — minimera distraktioner',
      'Sätt en timer som visar ned till noll (time timer)',
      'Var aktiv — läs högt, rita, anteckna',
      'Välj en specifik studieplats som bara används för studier',
    ],
    motivation: [
      'ADHD-hjärnan är byggd för kreativitet och innovation — det är en superkraft, inte en defekt.',
      'Många framgångsrika personer har ADHD: Richard Branson, Emma Watson, Justin Timberlake.',
      'Varje litet steg räknas — du behöver inte göra allt på en gång.',
      'Det är okej att ta pauser. Din hjärna behöver dem för att prestera.',
    ],
    appRecommendations: [
      { feature: 'Pomodoro-timern', why: 'Ställ in kortare pass (10–15 min) med ljud-alerts för att hålla fokus utan att bli överväldigad.', icon: '⏱️' },
      { feature: 'Flashcards', why: 'Snabba, interaktiva kort är perfekta för ADHD — håller hjärnan aktiv och ger omedelbar feedback.', icon: '🃏' },
      { feature: 'Studieplan', why: 'Skapa mikrosteg-planer för varje prov — bryt ner i 10-minuters uppgifter.', icon: '📋' },
      { feature: 'AI-coach', why: 'Fråga AI:n om hur du ska prioritera idag — få en kort, konkret att-göra-lista.', icon: '🤖' },
    ],
    quickTips: [
      'Ta en kort paus INNAN du tröttnar',
      'Belöna dig direkt efter varje studiepass',
      'Skriv ner distraktioner istf att följa dem',
      'Håll vatten och snacks nära för att slippa resaavbryta',
    ],
    routineTemplate: [
      { time: '08:00', activity: 'Morgonrutine (10 min)', duration: '10 min' },
      { time: '08:10', activity: 'Studiepass 1 — svårast ämne', duration: '15 min' },
      { time: '08:25', activity: 'Rörelsepaus', duration: '5 min' },
      { time: '08:30', activity: 'Studiepass 2', duration: '15 min' },
      { time: '08:45', activity: 'Fri paus (ingen skärm)', duration: '10 min' },
      { time: '08:55', activity: 'Repetition / flashcards', duration: '10 min' },
    ],
  },

  autism: {
    id: 'autism',
    description:
      'Autism (ASD — Autismspektrumsyndrom) innebär en annorlunda hjärnorganisation som påverkar social kommunikation, sensorisk bearbetning och informationsprocessning. Många autister är extremt analytiska, detaljfokuserade och har djup expertis inom sina intresseområden.',
    challenges: [
      'Sensorisk överstimulering i skolmiljön',
      'Övergångar och förändringar av planer',
      'Implicit socialt innehåll i texter',
      'Svårt med tidsbedömning och planering',
      'Utmattning efter sociala situationer',
      'Svårt att prioritera mellan uppgifter',
    ],
    techniques: [
      {
        title: 'Tydliga strukturer & scheman',
        description: 'Skapa ett detaljerat schema för varje studiedag. Känd struktur minskar kognitiv last.',
        icon: '📅',
      },
      {
        title: 'Intressebaserat lärande',
        description: 'Koppla skolmaterial till dina specialintressen. Hjärnan lär sig bäst när ämnet är meningsfullt.',
        icon: '⭐',
      },
      {
        title: 'Skriftliga instruktioner',
        description: 'Begär alltid skriftliga uppgiftsbeskrivningar och anteckna muntliga instruktioner.',
        icon: '📝',
      },
      {
        title: 'Sensorisk förberedelse',
        description: 'Identifiera din optimala studiemiljö — hörlurar, belysning, temperatur — och håll den konsekvent.',
        icon: '🎧',
      },
      {
        title: 'Mind maps & visuellt tänkande',
        description: 'Visualisera samband med mind maps. Autistiska hjärnor är ofta starka visuellt-spatialt.',
        icon: '🗺️',
      },
    ],
    focusTips: [
      'Använd alltid samma plats och tid för studier (rutinen hjälper)',
      'Minska sensoriska störningar — brusreducerande hörlurar',
      'Förbered övergångar: 5 minuter innan byte av aktivitet',
      'Dela upp komplexa uppgifter i tydliga, numrerade steg',
      'Ta planerade vilopauser — inte bara när du är trött',
      'Ha en klar slutpunkt: "Jag är klar kl 15:00"',
    ],
    motivation: [
      'Din förmåga att gå djupt in i ett ämne är exceptionell — det kallas hyperfokus och är en enorm fördel.',
      'Autister bidrar med unik problemlösning och kreativitet som neurotypiska saknar.',
      'Detaljorientering och systematiskt tänkande är värdefullt i akademin och arbetslivet.',
      'Att förstå hur din hjärna fungerar är det första steget mot att använda den optimalt.',
    ],
    appRecommendations: [
      { feature: 'Studieplan', why: 'Skapa ett detaljerat schema med exakta tider och tydliga mål — inga vaga uppgifter.', icon: '📋' },
      { feature: 'Flashcards', why: 'Systematisk och strukturerad repetition utan social interaktion — perfekt passform.', icon: '🃏' },
      { feature: 'Studietimer', why: 'Visuell timer hjälper med tidsuppfattning och minskar oro för "hur länge är kvar".', icon: '⏱️' },
      { feature: 'AI-coach', why: 'Skriv exakt vad du behöver hjälp med — AI ger tydliga, strukturerade svar utan social tvetydighet.', icon: '🤖' },
    ],
    quickTips: [
      'Skriv ned planen INNAN du börjar studera',
      'Använd alltid checklistor för uppgifter',
      'Planera återhämtningstid efter krävande dagar',
      'Kommunicera dina behov till lärare skriftligen',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Läs dagens schema (förbereda)', duration: '5 min' },
      { time: '09:05', activity: 'Studiepass 1 — fokuserat arbete', duration: '25 min' },
      { time: '09:30', activity: 'Planerad paus (stilla aktivitet)', duration: '10 min' },
      { time: '09:40', activity: 'Studiepass 2 — annat ämne', duration: '25 min' },
      { time: '10:05', activity: 'Avslutningskontroll — checklist', duration: '5 min' },
      { time: '10:10', activity: 'Fri återhämtning', duration: '20 min' },
    ],
  },

  dyslexia: {
    id: 'dyslexia',
    description:
      'Dyslexi är en neurologisk variation som påverkar läsning, stavning och skriftlig bearbetning. Dyslektiker har ofta starka muntliga förmågor, kreativt tänkande och spatial intelligens. Med rätt verktyg och strategier presterar många dyslektiker utmärkt i skolan.',
    challenges: [
      'Långsammare läsning och avkodning',
      'Stavning och skrivning tar mer energi',
      'Svårt att hålla text i korttidsminnet',
      'Tröttnar snabbt på texttunga uppgifter',
      'Svårt med grammatiska regler',
      'Provtid räcker inte alltid till',
    ],
    techniques: [
      {
        title: 'Text-till-tal (TTS)',
        description: 'Lyssna på texter istället för att läsa. Hjärnan processar ljud effektivare vid dyslexi.',
        icon: '🔊',
      },
      {
        title: 'Färgade underlägg',
        description: 'Prova att läsa med färgade folier eller aktivera "reading mode" på skärmar för att minska visuellt brus.',
        icon: '🎨',
      },
      {
        title: 'Mind maps istf löpande text',
        description: 'Anteckna i bilder och nyckelord snarare än hela meningar. Organiserar information icke-linjärt.',
        icon: '🗺️',
      },
      {
        title: 'Tala in dina svar',
        description: 'Använd röstigenkänning för anteckningar och svar — kringgår stavningsbarriären.',
        icon: '🎤',
      },
      {
        title: 'Chunking av läsning',
        description: 'Läs i korta block om 2–3 meningar, pausa och sammanfatta muntligt.',
        icon: '📦',
      },
    ],
    focusTips: [
      'Ökad textstorlek och extra radavstånd (minst 1.5)',
      'Serif-fria teckensnitt som Arial eller OpenDyslexic',
      'Undvik långa pass med skrivarbete — ta pauser',
      'Använd linjal eller penna för att hålla koll på raden',
      'Lyssna på läroboken som ljudfil när möjligt',
      'Be om extra provtid via elevhälsa — du har rätt till det',
    ],
    motivation: [
      'Dyslexi är kopplat till starka visuell-spatiala förmågor — många arkitekter, designers och uppfinnare är dyslektiker.',
      'Albert Einstein, Agatha Christie och Steven Spielberg har alla dyslexi.',
      'Din hjärna tänker i helheter och samband snarare än bokstäver — det är ett superkraft för kreativa lösningar.',
      'Med rätt verktyg finns inga gränser för vad du kan uppnå.',
    ],
    appRecommendations: [
      { feature: 'Flashcards', why: 'Korta textstycken med bilder — perfekt för dyslektiker som processar visuellt.', icon: '🃏' },
      { feature: 'AI-coach', why: 'Diktera dina frågor muntligt, få tydliga och korta skriftliga svar.', icon: '🤖' },
      { feature: 'Studietimer', why: 'Ta regelbundna pauser för att undvika läströthet — timern håller reda på det.', icon: '⏱️' },
      { feature: 'Anteckningar', why: 'Skriv korta bullet-points och nyckelord — inte långa meningar.', icon: '📝' },
    ],
    quickTips: [
      'Spela in lärares genomgångar om möjligt',
      'Be om uppgifter digitalt — lättare att använda TTS',
      'Studera med en studiecompis som läser högt',
      'Fira varje steg — framsteg märks kanske inte direkt',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Lyssna på dagens kapitel (TTS)', duration: '15 min' },
      { time: '09:15', activity: 'Skapa mind map av innehållet', duration: '10 min' },
      { time: '09:25', activity: 'Paus — rörelse', duration: '5 min' },
      { time: '09:30', activity: 'Flashcards — nyckelbegrepp', duration: '15 min' },
      { time: '09:45', activity: 'Diktera sammanfattning (röst)', duration: '10 min' },
      { time: '09:55', activity: 'Paus och belöning', duration: '10 min' },
    ],
  },

  add: {
    id: 'add',
    description:
      'ADD (Attention Deficit Disorder) liknar ADHD men utan hyperaktivitet. Drabbade tenderar att vara dagdrömmare, inåtvända och har svårt att hålla kvar uppmärksamheten utan yttre stimulans. ADD är ofta underdiagnostiserat eftersom symptomen är mer subtila.',
    challenges: [
      'Lätt att "zoona ut" mitt i uppgifter',
      'Svårt att komma igång utan deadline-press',
      'Tappar detaljer och instruktioner',
      'Verkar frånvarande eller ouppmärksam',
      'Bearbetar information långsammare',
      'Svårt med långa texter utan bilder',
    ],
    techniques: [
      {
        title: 'Aktiv läsning',
        description: 'Markera, anteckna marginaler och ställ frågor medan du läser för att hålla hjärnan engagerad.',
        icon: '📖',
      },
      {
        title: 'Intentionsformulering',
        description: 'Skriv ner exakt vad du ska göra INNAN du börjar: "Jag ska nu läsa kapitel 4 och skriva 3 nyckelord per sida."',
        icon: '🎯',
      },
      {
        title: 'External accountability',
        description: 'Berätta för någon vad du ska göra — socialt åtagande aktiverar extra motivation.',
        icon: '👥',
      },
      {
        title: 'Variation i inlärning',
        description: 'Byt metod var 20:e minut: läs → lyssna → skriv → förklara. Förhindrar mental drift.',
        icon: '🔄',
      },
    ],
    focusTips: [
      'Eliminera bakgrundsstimuli — tyst rum eller vitt brus',
      'Sätt tydliga startpunkter: "Kl 10:00 börjar jag"',
      'Håll mobiltelefon i ett annat rum',
      'Skriv upp ditt fokusord för passet på en lapp',
      'Drick vatten — dehydrering förvärrar ADD-symptom',
    ],
    motivation: [
      'ADD-hjärnor är ofta empatiska, kreativa och intuitivt intelligenta.',
      'Lugnet och det reflektiva sättet att tänka är en styrka i rätt sammanhang.',
      'Du är inte lat — du har en annorlunda hjärna som behöver rätt stöd.',
      'Gradvis förbättring är verklig framgång.',
    ],
    appRecommendations: [
      { feature: 'Pomodoro-timern', why: 'Yttre struktur håller dig på spåret när intern motivation sviktar.', icon: '⏱️' },
      { feature: 'Studieplan', why: 'Detaljerade planer med tydliga startpunkter minskar beslutsparalys.', icon: '📋' },
      { feature: 'AI-coach', why: 'Fråga "vad ska jag fokusera på idag?" för en tydlig prioritering.', icon: '🤖' },
    ],
    quickTips: [
      'Börja alltid med den viktigaste uppgiften',
      'Sätt alarmet 5 min INNAN du ska börja',
      'Håll anteckningsblock nära för tankar som dyker upp',
      'Belöna dig DIREKT efter varje avklarat block',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Skriv dagens intention (3 mål)', duration: '5 min' },
      { time: '09:05', activity: 'Fokuspass 1', duration: '20 min' },
      { time: '09:25', activity: 'Kort paus', duration: '5 min' },
      { time: '09:30', activity: 'Fokuspass 2 (annan metod)', duration: '20 min' },
      { time: '09:50', activity: 'Reflektera: vad lärde jag mig?', duration: '5 min' },
      { time: '09:55', activity: 'Fri tid', duration: '15 min' },
    ],
  },

  anxiety: {
    id: 'anxiety',
    description:
      'Ångest och studiestress är extremt vanligt bland studenter och påverkar förmågan att läsa, ta prov och prestera. Det handlar inte om svaghet — det är kroppens larmsystem som överreagerar. Med rätt verktyg kan du lugna nervsystemet och prestera på din fulla potential.',
    challenges: [
      'Svårt att koncentrera sig när oron är stark',
      'Prestationsångest inför prov',
      'Prokrastinering drivet av rädsla för misslyckande',
      'Fysiska symptom (hjärtklappning, ont i magen)',
      'Negativa tankespiraler',
      'Utmattning efter stressiga perioder',
    ],
    techniques: [
      {
        title: 'Box Breathing',
        description: 'Andas in 4 sek → håll 4 sek → andas ut 4 sek → håll 4 sek. Aktiverar lugn-och-ro-systemet på 2 minuter.',
        icon: '💨',
      },
      {
        title: '5-4-3-2-1 Grounding',
        description: 'Nämn 5 saker du ser, 4 du hör, 3 du kan ta på, 2 du känner lukten av, 1 du smakar. Bryter tankespiraler.',
        icon: '🌿',
      },
      {
        title: 'Planerad ororitid',
        description: 'Sätt av 10 min per dag för att oroa dig — utanför den tiden, skjut upp oro. Tränar hjärnan att inte sprida ångesten.',
        icon: '📅',
      },
      {
        title: 'Omformulera prestationspress',
        description: '"Jag måste klara detta" → "Jag gör mitt bästa och det är nog." Minskar aktivering av stressaxeln.',
        icon: '💬',
      },
      {
        title: 'Progressiv muskelavslappning',
        description: 'Spänn och slappna av varje muskelgrupp. Tar 10 minuter och ger djup fysisk avspänning.',
        icon: '🧘',
      },
    ],
    focusTips: [
      'Ta alltid 3 djupa andetag INNAN du börjar studera',
      'Skriv ner dina orostankar på ett papper — "parkera" dem',
      'Bryt ner till minsta möjliga steg',
      'Undvik koffein vid hög ångest',
      'Rörelse och natur minskar kortisolnivåer',
      'Sov tillräckligt — sömnbrist förvärrar ångest kraftigt',
    ],
    motivation: [
      'Ångest och intelligens är ofta kopplade — du bryr dig djupt om att göra bra ifrån dig.',
      'Varje gång du studerar trots ångesten stärker du din mentala motståndskraft.',
      'Det är modigt att fortsätta när det känns svårt.',
      'Framgång handlar inte om perfektion — det handlar om progression.',
    ],
    appRecommendations: [
      { feature: 'Pomodoro-timern', why: 'Kortare, avgränsade pass minskar "överväldigande" känslan av hela uppgiften.', icon: '⏱️' },
      { feature: 'Studieplan', why: 'Att se allt nedskrivet minskar mental belastning och oro för att glömma.', icon: '📋' },
      { feature: 'AI-coach', why: 'Prata ut om vad du oroar dig för — AI kan hjälpa dig perspektivera och prioritera.', icon: '🤖' },
    ],
    quickTips: [
      'Box breathing 2 min innan svåra uppgifter',
      'Skriv ner vad som är "gott nog" idag',
      'Stäng av alla sociala jämförelser under studieperioden',
      'Fira processer, inte bara resultat',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Morgon-andning & grounding', duration: '5 min' },
      { time: '09:05', activity: 'Skriv 3 saker du tackar dig för', duration: '3 min' },
      { time: '09:08', activity: 'Läs igenom dagens plan', duration: '2 min' },
      { time: '09:10', activity: 'Studiepass (utan perfektion)', duration: '25 min' },
      { time: '09:35', activity: 'Rörelse-paus ute om möjligt', duration: '10 min' },
      { time: '09:45', activity: 'Studiepass 2', duration: '20 min' },
    ],
  },

  dyscalculia: {
    id: 'dyscalculia',
    description:
      'Dyskalkyli är en specifik inlärningssvårighet som påverkar förståelsen av siffror och matematiska begrepp. Det är inte kopplat till allmän intelligens — många med dyskalkyli är starka på språk, kreativitet och sociala förmågor. Med konkreta och visuella metoder kan matematik bli hanterbart.',
    challenges: [
      'Svårt att förstå symboliska talvärden',
      'Räknar fel trots att man vet metoden',
      'Tidsuppfattning och sekvenser',
      'Svårt att läsa diagram och grafer',
      'Oro inför matematik-situationer',
      'Svårt att minnas formler',
    ],
    techniques: [
      {
        title: 'Konkreta manipulativ',
        description: 'Använd fysiska föremål, räknestavar eller appens tallinje för att förstå tal i konkret form.',
        icon: '🧮',
      },
      {
        title: 'Visuell matematikvärld',
        description: 'Rita alltid upp matematikproblem. Transformera abstrakta tal till bilder och diagram.',
        icon: '🖼️',
      },
      {
        title: 'Steg-för-steg-checklistor',
        description: 'Skapa en exakt checklista för varje problemtyp och följ den varje gång. Eliminerar minnesbördan.',
        icon: '✅',
      },
      {
        title: 'Uppräkning med rytm',
        description: 'Räkna med klappar, trampa eller annan rytm. Kroppslig förankring stärker taluppfattning.',
        icon: '🎵',
      },
    ],
    focusTips: [
      'Ta alltid ett papper och rita upp problemet',
      'Använd kalkylator för rutinberäkningar, fokusera på förståelsen',
      'Kontrollera alltid svar med rimlighetstest ("känns det rätt?")',
      'Be om extra tid — det är vanligare med matematiksvårigheter än många tror',
      'Spjälka formler i delar och lär dem separat',
    ],
    motivation: [
      'Matematik är INTE ett mått på intelligens — det är ett mått på hur din hjärna processar symboler.',
      'Med rätt verktyg och strategier kan du nå dina mål trots dyskalkyli.',
      'Fokusera på vad du kan göra, inte vad som är svårt.',
    ],
    appRecommendations: [
      { feature: 'AI-coach', why: 'Be AI:n förklara matematikproblem steg för steg med enkla, konkreta ord.', icon: '🤖' },
      { feature: 'Flashcards', why: 'Skapa kort med visuella representationer av formler och matematiska begrepp.', icon: '🃏' },
      { feature: 'Studieplan', why: 'Planera matematik-pass med kortare block och mer frekventa pauser.', icon: '📋' },
    ],
    quickTips: [
      'Rita ALLTID upp problemet — aldrig bara i huvudet',
      'Starta med enkel problemlösning för att bygga självförtroende',
      'Arbeta med lärare eller studiecoach för matematik',
      'Använd referensmaterial fritt',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Visualisera gårdagens material (rita)', duration: '5 min' },
      { time: '09:05', activity: 'Gå igenom ett exempelproblem noga', duration: '10 min' },
      { time: '09:15', activity: 'Lösa 3 liknande problem', duration: '15 min' },
      { time: '09:30', activity: 'Paus', duration: '5 min' },
      { time: '09:35', activity: 'Skriva förklaringen med egna ord', duration: '10 min' },
      { time: '09:45', activity: 'Testa med ett nytt problem', duration: '10 min' },
    ],
  },

  concentration: {
    id: 'concentration',
    description:
      'Koncentrationssvårigheter utan specifik diagnos är mycket vanliga bland studenter och kan orsakas av stress, sömnbrist, digital överstimulering eller kognitiv utmattning. De goda nyheterna: med rätt miljö och vanor kan koncentrationsförmågan tränas upp markant.',
    challenges: [
      'Lätt distraherad av omgivningen',
      'Svårt att komma igång och bibehålla fokus',
      'Tankarna vandrar under läsning',
      'Digital distrahering (notifikationer, sociala medier)',
      'Tröttar ut snabbt vid monotona uppgifter',
      'Svårt att prioritera vad som är viktigt',
    ],
    techniques: [
      {
        title: 'Deep Work-block',
        description: 'Avsätt 60–90 minuter för en enda uppgift utan avbrott. Stäng allt, fokusera på ett mål.',
        icon: '🎯',
      },
      {
        title: 'Digitalt sabbat',
        description: 'Studera utan telefon i ett annat rum i minst 45 minuter. Synligheten av telefonen ensam minskar kognitiv kapacitet med 10%.',
        icon: '📵',
      },
      {
        title: 'Single-tasking',
        description: 'Gör en sak i taget — multitasking minskar effektiviteten med upp till 40%.',
        icon: '1️⃣',
      },
      {
        title: 'Attention training',
        description: 'Träna koncentration som en muskel: börja med 5 min fokus, öka med 5 min per vecka.',
        icon: '💪',
      },
    ],
    focusTips: [
      'Stäng av alla notifikationer under studiepass',
      'Arbeta i 45–90 minuter, sedan 15 min paus',
      'Skapa en pre-studie-ritual (te, djupandning, klar skrivbord)',
      'Lyssna på instrumentalmusik utan text',
      'Sätt ett tydligt mål för varje studiepass',
      'Prioritera sömn — sömnbrist halverar koncentrationsförmågan',
    ],
    motivation: [
      'Koncentration är en förmåga som kan tränas upp — du är inte dömd att alltid vara distraherad.',
      'Varje gång du motstår en distraktion stärker du din mentala styrka.',
      'Framsteg sker gradvist men märkbart — fortsätt.',
    ],
    appRecommendations: [
      { feature: 'Pomodoro-timern', why: 'Strukturerade fokuspass med inbyggda pauser optimerar uppmärksamhetsintervaller.', icon: '⏱️' },
      { feature: 'Studieplan', why: 'Klara mål för varje dag minskar mentalt brus och beslutströthet.', icon: '📋' },
      { feature: 'AI-coach', why: 'Fråga om tips för att hålla fokus i just din situation.', icon: '🤖' },
    ],
    quickTips: [
      'Lägg undan telefonen i ett annat rum',
      'Börja ALLTID med det svåraste',
      'Skriv ner vandrade tankar utan att följa dem',
      'Håll dig hydratiserad och välmådd',
    ],
    routineTemplate: [
      { time: '09:00', activity: 'Förbered miljö & stäng allt', duration: '5 min' },
      { time: '09:05', activity: 'Fokuspass (single task)', duration: '45 min' },
      { time: '09:50', activity: 'Rörelse-paus', duration: '10 min' },
      { time: '10:00', activity: 'Fokuspass 2', duration: '45 min' },
      { time: '10:45', activity: 'Länre vila', duration: '15 min' },
    ],
  },
};

// ─── Focus Timer Component ─────────────────────────────────────────────────

function FocusTimer({ accentColor }: { accentColor: string }) {
  const { theme } = useTheme();
  const [minutes, setMinutes] = useState<number>(15);
  const [seconds, setSeconds] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const PRESETS = [5, 10, 15, 25];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            setMinutes((m) => {
              if (m === 0) {
                setRunning(false);
                setCompleted(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = useCallback((min: number) => {
    setRunning(false);
    setCompleted(false);
    setMinutes(min);
    setSeconds(0);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={[timerStyles.container, { backgroundColor: accentColor + '12' }]}>
      <View style={timerStyles.header}>
        <Timer size={18} color={accentColor} />
        <Text style={[timerStyles.title, { color: accentColor }]}>Fokustimer</Text>
      </View>

      <View style={timerStyles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[timerStyles.preset, minutes === p && seconds === 0 && !running && { backgroundColor: accentColor }]}
            onPress={() => reset(p)}
          >
            <Text
              style={[
                timerStyles.presetText,
                { color: minutes === p && seconds === 0 && !running ? '#FFF' : accentColor },
              ]}
            >
              {p} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={timerStyles.display}>
        <Text style={[timerStyles.time, { color: completed ? '#10B981' : accentColor }]}>
          {completed ? '🎉 Klart!' : `${pad(minutes)}:${pad(seconds)}`}
        </Text>
      </View>

      <View style={timerStyles.controls}>
        <TouchableOpacity
          style={[timerStyles.btn, { backgroundColor: accentColor }]}
          onPress={() => setRunning((r) => !r)}
        >
          {running ? (
            <Pause size={20} color="#FFF" />
          ) : (
            <Play size={20} color="#FFF" />
          )}
          <Text style={timerStyles.btnText}>{running ? 'Pausa' : 'Starta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[timerStyles.btnOutline, { borderColor: accentColor }]}
          onPress={() => reset(minutes)}
        >
          <RotateCcw size={18} color={accentColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  container: { borderRadius: 20, padding: 20, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontSize: 15, fontWeight: '700' },
  presets: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetText: { fontSize: 12, fontWeight: '600' },
  display: { alignItems: 'center', marginBottom: 16 },
  time: { fontSize: 48, fontWeight: '800', letterSpacing: -2 },
  controls: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  btnOutline: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Section Card Component ────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor: string;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState<boolean>(true);
  const rotateAnim = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen((o) => !o);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[sectionStyles.card, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity style={sectionStyles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={[sectionStyles.iconWrap, { backgroundColor: accentColor + '18' }]}>
          {icon}
        </View>
        <Text style={[sectionStyles.title, { color: theme.colors.text }]}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={18} color={theme.colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>
      {open && <View style={sectionStyles.content}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function DiagnosDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const diagnosis = DIAGNOSES.find((d) => d.id === id);
  const content = id ? CONTENT[id] : undefined;

  if (!diagnosis || !content) {
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Diagnos hittades inte</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#6366F1' }}>Gå tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = diagnosis.color;

  return (
    <View style={[{ flex: 1 }, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <LinearGradient
          colors={[...diagnosis.gradientColors, isDark ? '#1A1A2E' : '#F8F7FF'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={heroStyles.hero}
        >
          <TouchableOpacity
            style={heroStyles.back}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={heroStyles.emojiWrap}>
            <Text style={heroStyles.emoji}>{diagnosis.emoji}</Text>
          </View>

          <Text style={heroStyles.name}>{diagnosis.name}</Text>
          <Text style={heroStyles.tagline}>{diagnosis.tagline}</Text>

          <View style={heroStyles.tagRow}>
            {diagnosis.tags.map((t) => (
              <View key={t} style={heroStyles.chip}>
                <Text style={heroStyles.chipText}>{t}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* About */}
          <FadeInView delay={50}>
            <Section
              title="Om diagnosen"
              icon={<BookOpen size={18} color={accent} />}
              accentColor={accent}
            >
              <Text style={[{ fontSize: 15, lineHeight: 24, color: theme.colors.textSecondary }]}>
                {content.description}
              </Text>
            </Section>
          </FadeInView>

          {/* Quick Tips */}
          <FadeInView delay={80}>
            <Section
              title="Snabbtips"
              icon={<Zap size={18} color={accent} />}
              accentColor={accent}
            >
              {content.quickTips.map((tip, i) => (
                <View key={i} style={quickStyles.tipRow}>
                  <View style={[quickStyles.dot, { backgroundColor: accent }]} />
                  <Text style={[quickStyles.tipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Challenges */}
          <FadeInView delay={110}>
            <Section
              title="Vanliga utmaningar i skolan"
              icon={<Target size={18} color={accent} />}
              accentColor={accent}
            >
              {content.challenges.map((c, i) => (
                <View key={i} style={quickStyles.challengeRow}>
                  <View style={[quickStyles.challengeNum, { backgroundColor: accent + '20' }]}>
                    <Text style={[quickStyles.challengeNumText, { color: accent }]}>{i + 1}</Text>
                  </View>
                  <Text style={[quickStyles.tipText, { color: theme.colors.textSecondary }]}>{c}</Text>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Study Techniques */}
          <FadeInView delay={140}>
            <Section
              title="Effektiva studietekniker"
              icon={<Brain size={18} color={accent} />}
              accentColor={accent}
            >
              {content.techniques.map((tech, i) => (
                <View
                  key={i}
                  style={[techStyles.card, { backgroundColor: accent + '08', borderColor: accent + '20' }]}
                >
                  <View style={techStyles.cardHeader}>
                    <Text style={techStyles.cardEmoji}>{tech.icon}</Text>
                    <Text style={[techStyles.cardTitle, { color: theme.colors.text }]}>{tech.title}</Text>
                  </View>
                  <Text style={[techStyles.cardDesc, { color: theme.colors.textSecondary }]}>{tech.description}</Text>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Focus Tips */}
          <FadeInView delay={170}>
            <Section
              title="Fokus & produktivitetstips"
              icon={<Focus size={18} color={accent} />}
              accentColor={accent}
            >
              {content.focusTips.map((tip, i) => (
                <View key={i} style={quickStyles.tipRow}>
                  <CheckCircle size={14} color={accent} />
                  <Text style={[quickStyles.tipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Focus Timer */}
          <FadeInView delay={200}>
            <FocusTimer accentColor={accent} />
          </FadeInView>

          {/* Motivation */}
          <FadeInView delay={230}>
            <Section
              title="Motivation & styrka"
              icon={<Heart size={18} color={accent} />}
              accentColor={accent}
            >
              {content.motivation.map((m, i) => (
                <View key={i} style={[motivStyles.card, { backgroundColor: accent + '10' }]}>
                  <Star size={14} color={accent} fill={accent} />
                  <Text style={[motivStyles.text, { color: theme.colors.text }]}>{m}</Text>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* App Recommendations */}
          <FadeInView delay={260}>
            <Section
              title="Rekommenderade Studiestugan-funktioner"
              icon={<Sparkles size={18} color={accent} />}
              accentColor={accent}
            >
              {content.appRecommendations.map((rec, i) => (
                <View key={i} style={[appRecStyles.row, { borderColor: theme.colors.border }]}>
                  <View style={[appRecStyles.iconWrap, { backgroundColor: accent + '15' }]}>
                    <Text style={appRecStyles.icon}>{rec.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[appRecStyles.feature, { color: theme.colors.text }]}>{rec.feature}</Text>
                    <Text style={[appRecStyles.why, { color: theme.colors.textSecondary }]}>{rec.why}</Text>
                  </View>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Routine Template */}
          <FadeInView delay={290}>
            <Section
              title="Strukturerad studierutin"
              icon={<Layers size={18} color={accent} />}
              accentColor={accent}
            >
              <Text style={[{ fontSize: 12, color: theme.colors.textMuted, marginBottom: 14 }]}>
                Mallrutin — anpassa tider efter ditt schema
              </Text>
              {content.routineTemplate.map((item, i) => (
                <View key={i} style={routineStyles.row}>
                  <View style={[routineStyles.timeBadge, { backgroundColor: accent + '15' }]}>
                    <Text style={[routineStyles.time, { color: accent }]}>{item.time}</Text>
                  </View>
                  <View style={routineStyles.lineWrap}>
                    {i < content.routineTemplate.length - 1 && (
                      <View style={[routineStyles.line, { backgroundColor: accent + '30' }]} />
                    )}
                    <View style={[routineStyles.dot, { backgroundColor: accent }]} />
                  </View>
                  <View style={routineStyles.activityBlock}>
                    <Text style={[routineStyles.activity, { color: theme.colors.text }]}>{item.activity}</Text>
                    <Text style={[routineStyles.duration, { color: theme.colors.textMuted }]}>{item.duration}</Text>
                  </View>
                </View>
              ))}
            </Section>
          </FadeInView>

          {/* Support note */}
          <FadeInView delay={320}>
            <View style={[supportStyles.card, { backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF' }]}>
              <Shield size={18} color="#6366F1" />
              <Text style={[supportStyles.text, { color: isDark ? '#A5B4FC' : '#4338CA' }]}>
                Kom ihåg att prata med din skolas elevhälsa eller en specialpedagog. Du förtjänar rätt stöd.
              </Text>
            </View>
          </FadeInView>

        </View>
      </ScrollView>
    </View>
  );
}

const quickStyles = StyleSheet.create({
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 21 },
  challengeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  challengeNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  challengeNumText: { fontSize: 11, fontWeight: '700' },
});

const techStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardEmoji: { fontSize: 20 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardDesc: { fontSize: 13, lineHeight: 20 },
});

const motivStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
});

const appRecStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 18 },
  feature: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  why: { fontSize: 13, lineHeight: 19 },
});

const routineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    width: 60,
    alignItems: 'center',
  },
  time: { fontSize: 11, fontWeight: '700' },
  lineWrap: {
    alignItems: 'center',
    width: 16,
    paddingTop: 4,
  },
  line: { position: 'absolute', top: 12, width: 2, height: 40 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  activityBlock: { flex: 1, paddingTop: 2 },
  activity: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  duration: { fontSize: 12 },
});

const heroStyles = StyleSheet.create({
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: { fontSize: 40 },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
});

const supportStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  text: { flex: 1, fontSize: 13, lineHeight: 20 },
});
