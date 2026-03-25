// Studietips och insikter för Högskoleprov

export interface HPStudyTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'general' | 'section' | 'strategy' | 'mindset';
  sectionCode?: string;
}

export const HP_STUDY_TIPS: HPStudyTip[] = [
  // Allmänna tips
  {
    id: 'tip-1',
    title: 'Regelbunden övning',
    description: 'Öva minst 30-45 minuter dagligen för bästa resultat. Konsistens är viktigare än långa sessioner.',
    icon: '📚',
    color: '#6366F1',
    category: 'general',
  },
  {
    id: 'tip-2',
    title: 'Tidshantering',
    description: 'Öva på att svara under tidspress. På riktiga provet har du ca 2-3 minuter per fråga beroende på delprov.',
    icon: '⏱️',
    color: '#10B981',
    category: 'general',
  },
  {
    id: 'tip-3',
    title: 'Fokusera på svaga områden',
    description: 'Identifiera dina svagaste delprov och lägg 60% av din studietid där. Undvik att bara öva på det du redan kan.',
    icon: '🎯',
    color: '#F59E0B',
    category: 'general',
  },
  {
    id: 'tip-4',
    title: 'Vila är viktigt',
    description: 'Få minst 7-8 timmars sömn natten innan provet. En utvilad hjärna presterar 20-30% bättre.',
    icon: '😴',
    color: '#8B5CF6',
    category: 'mindset',
  },
  {
    id: 'tip-5',
    title: 'Läs mycket',
    description: 'Läs dagstidningar, böcker och artiklar dagligen. Detta förbättrar både ordförråd och läsförståelse.',
    icon: '📖',
    color: '#EC4899',
    category: 'general',
  },
  
  // ORD - Ordförståelse
  {
    id: 'tip-ord-1',
    title: 'Bygg ordförråd systematiskt',
    description: 'Lär dig 10 nya ord om dagen. Efter 3 månader har du lärt dig 900 ord - en enorm fördel!',
    icon: '📚',
    color: '#6366F1',
    category: 'section',
    sectionCode: 'ORD',
  },
  {
    id: 'tip-ord-2',
    title: 'Studera ordstammar',
    description: 'Lär dig vanliga prefix (för-, av-, be-) och suffix (-het, -ism, -tion). Detta hjälper dig gissa okända ord.',
    icon: '🔤',
    color: '#6366F1',
    category: 'section',
    sectionCode: 'ORD',
  },
  {
    id: 'tip-ord-3',
    title: 'Använd kontextledtrådar',
    description: 'Om du är osäker, prova sätta in varje alternativ i en mening. Det rätta ordet känns oftast naturligt.',
    icon: '💡',
    color: '#6366F1',
    category: 'section',
    sectionCode: 'ORD',
  },

  // LÄS - Läsförståelse
  {
    id: 'tip-las-1',
    title: 'Läs frågan först',
    description: 'Läs alltid frågan innan texten. Då vet du vad du ska leta efter och läser mer effektivt.',
    icon: '👁️',
    color: '#10B981',
    category: 'section',
    sectionCode: 'LÄS',
  },
  {
    id: 'tip-las-2',
    title: 'Markera nyckelord',
    description: 'Stryk under viktiga ord och fraser i texten. Detta hjälper dig hitta tillbaka när du ska svara.',
    icon: '✏️',
    color: '#10B981',
    category: 'section',
    sectionCode: 'LÄS',
  },
  {
    id: 'tip-las-3',
    title: 'Läs aktivt',
    description: 'Ställ dig frågor medan du läser: Vad är huvudtanken? Vad är författarens ton? Vilka argument presenteras?',
    icon: '🤔',
    color: '#10B981',
    category: 'section',
    sectionCode: 'LÄS',
  },

  // MEK - Meningskomplettering
  {
    id: 'tip-mek-1',
    title: 'Leta efter signalord',
    description: 'Ord som "men", "trots", "därför" och "eftersom" ger ledtrådar om meningens logik.',
    icon: '🔍',
    color: '#F59E0B',
    category: 'section',
    sectionCode: 'MEK',
  },
  {
    id: 'tip-mek-2',
    title: 'Eliminera omöjliga alternativ',
    description: 'Stryk mentalt bort uppenbart felaktiga svar. Ofta kan du eliminera 2-3 alternativ direkt.',
    icon: '❌',
    color: '#F59E0B',
    category: 'section',
    sectionCode: 'MEK',
  },
  {
    id: 'tip-mek-3',
    title: 'Tänk på grammatik',
    description: 'Kontrollera att din mening blir grammatiskt korrekt. Fel böjning eller genus är ofta ledtrådar.',
    icon: '📝',
    color: '#F59E0B',
    category: 'section',
    sectionCode: 'MEK',
  },

  // XYZ & DTK - Diagram och data
  {
    id: 'tip-xyz-1',
    title: 'Läs rubriker noggrant',
    description: 'Kontrollera alltid diagram- och axelrubriker, enheter och skalor innan du svarar.',
    icon: '📊',
    color: '#EC4899',
    category: 'section',
    sectionCode: 'XYZ',
  },
  {
    id: 'tip-xyz-2',
    title: 'Dubbelkolla enheter',
    description: 'Är det miljoner eller miljarder? Procent eller procentenheter? Detta är vanliga misstag.',
    icon: '🔢',
    color: '#EC4899',
    category: 'section',
    sectionCode: 'XYZ',
  },
  {
    id: 'tip-xyz-3',
    title: 'Använd tumregler',
    description: 'Gör snabba uppskattningar för att eliminera orimliga svar. Din intuition är ofta rätt.',
    icon: '👍',
    color: '#EC4899',
    category: 'section',
    sectionCode: 'XYZ',
  },

  // KVA - Kvantitativ analys
  {
    id: 'tip-kva-1',
    title: 'Testa med enkla tal',
    description: 'Sätt in enkla värden som 0, 1, eller -1 för att jämföra kvantiteterna. Detta ger ofta svaret snabbt.',
    icon: '🔢',
    color: '#06B6D4',
    category: 'section',
    sectionCode: 'KVA',
  },
  {
    id: 'tip-kva-2',
    title: 'Leta efter specialfall',
    description: 'Tänk på extremvärden, noll, negativa tal och bråk. Kan dessa förändra jämförelsen?',
    icon: '⚠️',
    color: '#06B6D4',
    category: 'section',
    sectionCode: 'KVA',
  },
  {
    id: 'tip-kva-3',
    title: 'Var metodisk',
    description: 'Jämför systematiskt - förenkla först kvantitet I, sedan kvantitet II, därefter jämför.',
    icon: '📐',
    color: '#06B6D4',
    category: 'section',
    sectionCode: 'KVA',
  },

  // DTK - Data och teknisk förståelse
  {
    id: 'tip-dtk-1',
    title: 'Ta god tid på dig',
    description: 'DTK-frågor är ofta komplexa. Läs noga och planera ditt svar innan du börjar räkna.',
    icon: '⏳',
    color: '#EF4444',
    category: 'section',
    sectionCode: 'DTK',
  },
  {
    id: 'tip-dtk-2',
    title: 'Bryt ner problem',
    description: 'Dela upp komplexa frågor i mindre steg. Lös ett steg i taget för att undvika misstag.',
    icon: '🧩',
    color: '#EF4444',
    category: 'section',
    sectionCode: 'DTK',
  },

  // Strategiska tips
  {
    id: 'tip-strategy-1',
    title: 'Gissa smart',
    description: 'Det finns inget avdrag för fel svar. Gissa alltid om du är osäker - chansen är 25% rätt!',
    icon: '🎲',
    color: '#8B5CF6',
    category: 'strategy',
  },
  {
    id: 'tip-strategy-2',
    title: 'Hoppa över svåra frågor',
    description: 'Om en fråga tar för lång tid, markera den och gå vidare. Kom tillbaka om du har tid över.',
    icon: '⏭️',
    color: '#8B5CF6',
    category: 'strategy',
  },
  {
    id: 'tip-strategy-3',
    title: 'Fördela tiden rätt',
    description: 'Alla frågor är lika värda. Spendera inte 10 minuter på en fråga när du kan få 5 rätt på samma tid.',
    icon: '⏰',
    color: '#8B5CF6',
    category: 'strategy',
  },
  {
    id: 'tip-strategy-4',
    title: 'Första intrycket räknar',
    description: 'Din första instinkt är ofta rätt. Ändra inte ditt svar om du inte är säker på att det är fel.',
    icon: '💭',
    color: '#8B5CF6',
    category: 'strategy',
  },

  // Mindset
  {
    id: 'tip-mindset-1',
    title: 'Håll dig lugn',
    description: 'Stress försämrar prestationen. Ta djupa andetag och kom ihåg att du är väl förberedd.',
    icon: '🧘',
    color: '#10B981',
    category: 'mindset',
  },
  {
    id: 'tip-mindset-2',
    title: 'Positiv inställning',
    description: 'Tro på dig själv! Självförtroende kan höja ditt resultat med 0.1-0.2 poäng.',
    icon: '💪',
    color: '#10B981',
    category: 'mindset',
  },
  {
    id: 'tip-mindset-3',
    title: 'Fira framsteg',
    description: 'Varje övningstillfälle gör dig bättre. Fira små framsteg och håll motivationen uppe!',
    icon: '🎉',
    color: '#10B981',
    category: 'mindset',
  },
];

export interface HPInsight {
  id: string;
  title: string;
  content: string;
  icon: string;
  color: string;
  importance: 'high' | 'medium' | 'low';
}

export const HP_INSIGHTS: HPInsight[] = [
  {
    id: 'insight-1',
    title: 'Förberedelse är nyckeln',
    content: 'Studier visar att de som övar regelbundet i 3 månader förbättrar sitt resultat med i genomsnitt 0.3-0.5 poäng. Börja i god tid!',
    icon: '📈',
    color: '#6366F1',
    importance: 'high',
  },
  {
    id: 'insight-2',
    title: 'Verbala vs kvantitativa delen',
    content: 'De flesta är starkare på antingen verbala (ORD, LÄS, MEK) eller kvantitativa (XYZ, KVA, DTK) delprov. Identifiera din styrka och utmana din svaghet.',
    icon: '⚖️',
    color: '#10B981',
    importance: 'high',
  },
  {
    id: 'insight-3',
    title: 'Timing är allt',
    content: 'De flesta hoppar av högskoleprov för att de inte hinner klart. Öva på att hålla tempot - det är viktigare än att få allt rätt.',
    icon: '⏱️',
    color: '#F59E0B',
    importance: 'high',
  },
  {
    id: 'insight-4',
    title: 'Ordförråd tar tid',
    content: 'Det tar 3-6 månader att bygga ett starkt ordförråd. Börja tidigt med att läsa och lära dig nya ord dagligen.',
    icon: '📚',
    color: '#EC4899',
    importance: 'medium',
  },
  {
    id: 'insight-5',
    title: 'Matte är träningsbart',
    content: 'De kvantitativa delproven (XYZ, KVA, DTK) är mest träningsbara. Med rätt övning kan de flesta nå toppresultat här.',
    icon: '🔢',
    color: '#06B6D4',
    importance: 'medium',
  },
  {
    id: 'insight-6',
    title: 'Provdagen',
    content: 'Ät en lätt frukost, ta med vatten och snacks. Kom i god tid. Nervositet är normalt - använd den som energi!',
    icon: '☀️',
    color: '#8B5CF6',
    importance: 'high',
  },
  {
    id: 'insight-7',
    title: 'Simulera provmiljön',
    content: 'Gör fullständiga provpass i lugn miljö. Detta tränar uthållighet och koncentration under 4 timmar.',
    icon: '🎯',
    color: '#EF4444',
    importance: 'medium',
  },
  {
    id: 'insight-8',
    title: 'Analysera dina misstag',
    content: 'Efter varje övning, gå igenom vad du svarade fel på och förstå varför. Detta är när du verkligen lär dig.',
    icon: '🔍',
    color: '#10B981',
    importance: 'high',
  },
];

export const getRandomTips = (count: number = 3): HPStudyTip[] => {
  const shuffled = [...HP_STUDY_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getTipsBySection = (sectionCode: string): HPStudyTip[] => {
  return HP_STUDY_TIPS.filter(tip => tip.sectionCode === sectionCode);
};

export const getTipsByCategory = (category: HPStudyTip['category']): HPStudyTip[] => {
  return HP_STUDY_TIPS.filter(tip => tip.category === category);
};
