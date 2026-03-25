// Script to generate hardcoded course content files
// This matches the structure of religionskunskap1.tsx

interface CourseTemplate {
  fileName: string;
  courseCode: string;
  title: string;
  emoji: string;
  description: string;
  gradientColors: [string, string];
  modules: {
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
  }[];
  goals: {
    icon: string;
    text: string;
  }[];
  studyTips: {
    icon: string;
    text: string;
  }[];
}

export const coursesToGenerate: CourseTemplate[] = [
  // MATEMATIK
  {
    fileName: 'matematik1a',
    courseCode: 'MATMAT01a',
    title: 'Matematik 1a',
    emoji: '📐',
    description: 'Grundläggande matematik för vardagsliv och arbete',
    gradientColors: ['#EC4899', '#DB2777'],
    modules: [
      {
        id: 1,
        title: 'Algebra och ekvationer',
        description: 'Lär dig lösa ekvationer och förenkla algebraiska uttryck',
        emoji: '🔢',
        sections: [
          {
            title: 'Grundläggande algebra',
            content: 'Algebra handlar om att arbeta med bokstäver och symboler för att representera tal och samband. Det är ett kraftfullt verktyg för problemlösning.',
            keyPoints: [
              'Förenkla algebraiska uttryck',
              'Lösa enkla ekvationer',
              'Använda parenteser korrekt',
              'Hantera negativa tal',
              'Lösa ut variabler',
            ]
          }
        ],
        examples: ['Lösa x + 5 = 12', 'Förenkla 2(x + 3) = 2x + 6'],
        reflectionQuestions: ['Varför är algebra användbart?', 'Hur kan algebra användas i vardagen?']
      },
      {
        id: 2,
        title: 'Procent och förändring',
        description: 'Beräkna procentuella förändringar och tillämpningar',
        emoji: '%',
        sections: [
          {
            title: 'Procent i vardagen',
            content: 'Procent används överallt - från rabatter i butiker till räntor på bankkonton. Att förstå procent är avgörande för ekonomiska beslut.',
            keyPoints: [
              'Räkna ut procentuell ökning och minskning',
              'Förstå räntor och amortering',
              'Jämföra priser och erbjudanden',
              'Läsa statistik och diagram',
            ]
          }
        ],
        examples: ['En vara kostar 200 kr och ökar med 25%', 'Beräkna rabatt på 30%'],
        reflectionQuestions: ['Varför är procenträkning viktigt?']
      }
    ],
    goals: [
      { icon: 'Calculator', text: 'Lösa vardagliga matematiska problem' },
      { icon: 'TrendingUp', text: 'Förstå och tillämpa procent' },
      { icon: 'Brain', text: 'Utveckla logiskt tänkande' },
    ],
    studyTips: [
      { icon: 'Repeat', text: 'Öva regelbundet på olika typer av problem' },
      { icon: 'BookOpen', text: 'Använd formelblad och anteckningar' },
      { icon: 'Users', text: 'Studera tillsammans och förklara för varandra' },
    ]
  },
  
  // SVENSKA
  {
    fileName: 'svenska1',
    courseCode: 'SVESVE01',
    title: 'Svenska 1',
    emoji: '📚',
    description: 'Utveckla din förmåga att läsa, skriva och kommunicera på svenska',
    gradientColors: ['#3B82F6', '#2563EB'],
    modules: [
      {
        id: 1,
        title: 'Textanalys och läsförståelse',
        description: 'Lär dig analysera och förstå olika texttyper',
        emoji: '📖',
        sections: [
          {
            title: 'Skönlitterära texter',
            content: 'Skönlitteratur inkluderar romaner, noveller, lyrik och dramatik. Genom att läsa skönlitteratur utvecklar du din språkkänsla och förståelse för olika perspektiv.',
            keyPoints: [
              'Identifiera tema och budskap',
              'Analysera karaktärer och deras utveckling',
              'Förstå olika berättarperspektiv',
              'Tolka symbolik och stilgrepp',
              'Sätta in texten i sitt sammanhang',
            ]
          },
          {
            title: 'Sakprosa och faktatext',
            content: 'Sakprosa är texter som syftar till att informera, argumentera eller instruera. Det är viktigt att kunna läsa kritiskt och bedöma källors trovärdighet.',
            keyPoints: [
              'Urskilja fakta från åsikter',
              'Bedöma källkritiskt',
              'Identifiera argumentationsstrategier',
              'Förstå textstruktur och disposition',
            ]
          }
        ],
        examples: ['Analysera en roman', 'Granska en debattartikel', 'Tolka en dikt'],
        reflectionQuestions: ['Vad gör en text trovärdig?', 'Hur påverkar berättarperspektivet din upplevelse?']
      }
    ],
    goals: [
      { icon: 'BookOpen', text: 'Läsa och förstå olika texttyper' },
      { icon: 'Edit3', text: 'Skriva olika genres och texttyper' },
      { icon: 'MessageSquare', text: 'Kommunicera klart och tydligt' },
    ],
    studyTips: [
      { icon: 'Book', text: 'Läs regelbundet - både skönlitteratur och sakprosa' },
      { icon: 'Pen', text: 'Skriv ofta och be om feedback' },
      { icon: 'Highlighter', text: 'Gör anteckningar när du läser' },
    ]
  },

  // ENGELSKA
  {
    fileName: 'engelska5',
    courseCode: 'ENGENG05',
    title: 'Engelska 5',
    emoji: '🇬🇧',
    description: 'Utveckla din engelska för studier, arbete och internationell kommunikation',
    gradientColors: ['#10B981', '#059669'],
    modules: [
      {
        id: 1,
        title: 'Reading Comprehension',
        description: 'Improve your ability to understand English texts',
        emoji: '📰',
        sections: [
          {
            title: 'Different Text Types',
            content: 'English texts come in many forms - from novels and news articles to academic papers and social media posts. Each requires different reading strategies.',
            keyPoints: [
              'Understand main ideas and details',
              'Identify text structure and purpose',
              'Analyze vocabulary in context',
              'Make inferences and draw conclusions',
              'Distinguish fact from opinion',
            ]
          }
        ],
        examples: ['Read news articles', 'Analyze fiction excerpts', 'Study academic texts'],
        reflectionQuestions: ['How do you approach reading difficult texts?', 'What strategies help comprehension?']
      }
    ],
    goals: [
      { icon: 'Globe', text: 'Kommunicera på engelska i olika situationer' },
      { icon: 'BookOpen', text: 'Förstå autentiska engelska texter' },
      { icon: 'Mic', text: 'Tala och diskutera på engelska' },
    ],
    studyTips: [
      { icon: 'Headphones', text: 'Lyssna på engelsk media dagligen' },
      { icon: 'MessageCircle', text: 'Prata engelska så ofta du kan' },
      { icon: 'Book', text: 'Läs engelska böcker och artiklar' },
    ]
  },

  // HISTORIA
  {
    fileName: 'historia1b',
    courseCode: 'HISHIS01b',
    title: 'Historia 1b',
    emoji: '⏳',
    description: 'Utforska historiska händelser och deras betydelse för samtiden',
    gradientColors: ['#F59E0B', '#D97706'],
    modules: [
      {
        id: 1,
        title: 'Den industriella revolutionen',
        description: 'Lär dig om industrialismens genombrott och konsekvenser',
        emoji: '🏭',
        sections: [
          {
            title: 'Från jordbruk till industri',
            content: 'Den industriella revolutionen började i Storbritannien på 1700-talet och förändrade samhället i grunden. Nya uppfinningar och produktionsmetoder ledde till urbanisering och nya samhällsklasser.',
            keyPoints: [
              'Ångmaskinens betydelse',
              'Fabrikssystemets uppkomst',
              'Urbanisering och flyttströmmar',
              'Arbetarklassens framväxt',
              'Tekniska innovationer',
            ]
          }
        ],
        examples: ['Studera textilindustrin', 'Järnvägens betydelse', 'Arbetsvillkor i fabriker'],
        reflectionQuestions: ['Hur påverkade industrialiseringen människors liv?', 'Vilka likheter finns med dagens tekniska revolution?']
      }
    ],
    goals: [
      { icon: 'Clock', text: 'Förstå historiska processer och sammanhang' },
      { icon: 'Search', text: 'Använda källkritik på historiskt material' },
      { icon: 'Lightbulb', text: 'Koppla historia till nutid' },
    ],
    studyTips: [
      { icon: 'Calendar', text: 'Skapa tidslinjer för att visualisera händelser' },
      { icon: 'FileText', text: 'Analysera primärkällor och sekundärkällor' },
      { icon: 'Users', text: 'Diskutera historiska tolkningar med andra' },
    ]
  },

  // BIOLOGI
  {
    fileName: 'biologi1',
    courseCode: 'BIOBIO01',
    title: 'Biologi 1',
    emoji: '🧬',
    description: 'Upptäck livets mångfald och de processer som styr levande organismer',
    gradientColors: ['#22C55E', '#16A34A'],
    modules: [
      {
        id: 1,
        title: 'Cellen - livets minsta enhet',
        description: 'Utforska cellens uppbyggnad och funktioner',
        emoji: '🔬',
        sections: [
          {
            title: 'Cellens delar',
            content: 'Cellen är den minsta levande enheten. Alla levande organismer består av en eller flera celler. Prokaryota celler saknar cellkärna medan eukaryota celler har en tydlig kärna.',
            keyPoints: [
              'Cellmembranets funktion',
              'Cellkärnan och DNA',
              'Mitokondrier - cellens kraftverk',
              'Kloroplaster i växtceller',
              'Skillnader mellan djur- och växtceller',
            ]
          }
        ],
        examples: ['Mikroskopera celler', 'Jämföra cell-typer', 'Studera celldelning'],
        reflectionQuestions: ['Varför är cellen livets grundenhet?', 'Hur samarbetar cellens delar?']
      }
    ],
    goals: [
      { icon: 'Microscope', text: 'Förstå biologiska processer' },
      { icon: 'Leaf', text: 'Utforska ekosystem och biodiversitet' },
      { icon: 'Dna', text: 'Lära om genetik och evolution' },
    ],
    studyTips: [
      { icon: 'Eye', text: 'Observera naturen och levande organismer' },
      { icon: 'FlaskConical', text: 'Delta aktivt i laborationer' },
      { icon: 'Image', text: 'Rita diagram och illustrationer' },
    ]
  },

  // KEMI
  {
    fileName: 'kemi1',
    courseCode: 'KEMKEM01',
    title: 'Kemi 1',
    emoji: '⚗️',
    description: 'Utforska ämnenas värld och kemiska reaktioner',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    modules: [
      {
        id: 1,
        title: 'Atomer och grundämnen',
        description: 'Lär dig om materians byggstenar',
        emoji: '⚛️',
        sections: [
          {
            title: 'Atomens uppbyggnad',
            content: 'Atomer består av en kärna med protoner och neutroner, samt elektroner som rör sig i skal runt kärnan. Grundämnena i det periodiska systemet har olika antal protoner.',
            keyPoints: [
              'Protoner, neutroner och elektroner',
              'Atommassa och atomnummer',
              'Det periodiska systemet',
              'Elektronskal och valenselektroner',
              'Isotoper',
            ]
          }
        ],
        examples: ['Studera periodiska systemet', 'Räkna partiklar i atomer', 'Förstå isotoper'],
        reflectionQuestions: ['Varför är det periodiska systemet organiserat som det är?']
      }
    ],
    goals: [
      { icon: 'Atom', text: 'Förstå kemiska reaktioner' },
      { icon: 'FlaskConical', text: 'Arbeta säkert i labbet' },
      { icon: 'Calculator', text: 'Utföra kemiska beräkningar' },
    ],
    studyTips: [
      { icon: 'Table', text: 'Lär dig periodiska systemet' },
      { icon: 'Notebook', text: 'Skriv reaktionsekvationer regelbundet' },
      { icon: 'Beaker', text: 'Förbered och reflektera över laborationer' },
    ]
  },

  // FYSIK
  {
    fileName: 'fysik1a',
    courseCode: 'FYSFYS01a',
    title: 'Fysik 1a',
    emoji: '🔭',
    description: 'Utforska naturens lagar och fysikaliska fenomen',
    gradientColors: ['#06B6D4', '#0891B2'],
    modules: [
      {
        id: 1,
        title: 'Rörelse och kraft',
        description: 'Studera hur föremål rör sig och påverkas av krafter',
        emoji: '🚀',
        sections: [
          {
            title: 'Newtons lagar',
            content: 'Isaac Newtons tre lagar beskriver hur föremål rör sig och hur krafter påverkar rörelsen. Dessa lagar är grundläggande för all mekanik.',
            keyPoints: [
              '1:a lagen - Tröghetslagen',
              '2:a lagen - F = m × a',
              '3:a lagen - Verkans lag',
              'Hastighet och acceleration',
              'Friktion och luftmotstånd',
            ]
          }
        ],
        examples: ['Beräkna acceleration', 'Analysera kollisioner', 'Studera fallande föremål'],
        reflectionQuestions: ['Hur påverkar krafter vår vardag?', 'Varför är Newtons lagar universella?']
      }
    ],
    goals: [
      { icon: 'Rocket', text: 'Förstå rörelse och krafter' },
      { icon: 'Zap', text: 'Lära om energi och energiomvandling' },
      { icon: 'Waves', text: 'Utforska vågor och ljud' },
    ],
    studyTips: [
      { icon: 'Calculator', text: 'Öva på problemlösning med formler' },
      { icon: 'Ruler', text: 'Arbeta med enheter och storheter' },
      { icon: 'Flask', text: 'Koppla teori till laborationer' },
    ]
  },

  // SAMHÄLLSKUNSKAP
  {
    fileName: 'samhallskunskap1b',
    courseCode: 'SAMSAM01b',
    title: 'Samhällskunskap 1b',
    emoji: '🏛️',
    description: 'Förstå samhället, politik och ekonomi',
    gradientColors: ['#EF4444', '#DC2626'],
    modules: [
      {
        id: 1,
        title: 'Demokrati och politiska system',
        description: 'Lär dig om demokratins principer och funktion',
        emoji: '🗳️',
        sections: [
          {
            title: 'Den svenska demokratin',
            content: 'Sverige är en parlamentarisk demokrati med maktdelning mellan lagstiftande, verkställande och dömande makt. Riksdagen är Sveriges parlament.',
            keyPoints: [
              'Maktdelningsprincipen',
              'Valsystemet i Sverige',
              'Riksdagens roll och uppgifter',
              'Regeringen och ministrar',
              'Grundlagarna',
            ]
          }
        ],
        examples: ['Analysera ett val', 'Följa en riksdagsdebatt', 'Jämföra politiska system'],
        reflectionQuestions: ['Varför är demokrati viktig?', 'Hur kan medborgare påverka politiken?']
      }
    ],
    goals: [
      { icon: 'Building', text: 'Förstå politiska beslutsprocesser' },
      { icon: 'DollarSign', text: 'Lära om ekonomiska system' },
      { icon: 'Globe', text: 'Analysera globala utmaningar' },
    ],
    studyTips: [
      { icon: 'Newspaper', text: 'Följ nyheter och samhällsdebatt' },
      { icon: 'Users', text: 'Diskutera aktuella frågor' },
      { icon: 'BarChart', text: 'Tolka statistik och diagram' },
    ]
  },

  // FILOSOFI
  {
    fileName: 'filosofi1',
    courseCode: 'FILFIL01',
    title: 'Filosofi 1',
    emoji: '🤔',
    description: 'Utforska filosofins stora frågor om kunskap, moral och existens',
    gradientColors: ['#6366F1', '#4F46E5'],
    modules: [
      {
        id: 1,
        title: 'Kunskapsteori',
        description: 'Vad är kunskap och hur kan vi veta något?',
        emoji: '💡',
        sections: [
          {
            title: 'Vad är kunskap?',
            content: 'Kunskapsteori (epistemologi) undersöker kunskapens natur. Vad betyder det att veta något? Skillnaden mellan kunskap och åsikt är central.',
            keyPoints: [
              'Kunskap som sann, berättigad tro',
              'Olika kunskapskällor',
              'Skepticism och dess utmaningar',
              'Rationalism vs empirism',
              'Vetenskaplig metod',
            ]
          }
        ],
        examples: ['Descartes cogito', 'Platons kunskapslära', 'Empiristernas kritik'],
        reflectionQuestions: ['Hur vet du att du vet något?', 'Kan vi vara säkra på någonting?']
      }
    ],
    goals: [
      { icon: 'Brain', text: 'Utveckla kritiskt tänkande' },
      { icon: 'MessageCircle', text: 'Argumentera logiskt och tydligt' },
      { icon: 'Book', text: 'Förstå filosofiska traditioner' },
    ],
    studyTips: [
      { icon: 'Lightbulb', text: 'Ställ frågor och ifrågasätt antaganden' },
      { icon: 'Pen', text: 'Skriv ner dina tankar och argument' },
      { icon: 'Users', text: 'Diskutera filosofiska frågor med andra' },
    ]
  },

  // PSYKOLOGI
  {
    fileName: 'psykologi1',
    courseCode: 'PSKPSY01',
    title: 'Psykologi 1',
    emoji: '🧠',
    description: 'Utforska människans tankar, känslor och beteenden',
    gradientColors: ['#EC4899', '#D946EF'],
    modules: [
      {
        id: 1,
        title: 'Psykologins grunder',
        description: 'Introduktion till psykologiska perspektiv och metoder',
        emoji: '👁️',
        sections: [
          {
            title: 'Psykologiska perspektiv',
            content: 'Psykologi studerar människans tankar, känslor och beteenden. Olika psykologiska perspektiv belyser olika aspekter av den mänskliga upplevelsen.',
            keyPoints: [
              'Biologiskt perspektiv - hjärnan och nervsystemet',
              'Behavioristiskt perspektiv - inlärning och beteende',
              'Kognitivt perspektiv - tankar och informationsbearbetning',
              'Psykodynamiskt perspektiv - det omedvetna',
              'Humanistiskt perspektiv - självförverkligande',
            ]
          }
        ],
        examples: ['Studier av inlärning', 'Minnesexperiment', 'Observera beteenden'],
        reflectionQuestions: ['Vad påverkar våra beteenden?', 'Hur formas vår personlighet?']
      }
    ],
    goals: [
      { icon: 'Brain', text: 'Förstå mänskligt beteende' },
      { icon: 'Heart', text: 'Lära om känslor och motivation' },
      { icon: 'Users', text: 'Utforska social påverkan' },
    ],
    studyTips: [
      { icon: 'Eye', text: 'Observera beteenden i vardagen' },
      { icon: 'Notebook', text: 'För dagbok över egna tankar och känslor' },
      { icon: 'BookOpen', text: 'Läs om psykologiska experiment' },
    ]
  },

  // PROGRAMMERING
  {
    fileName: 'programmering1',
    courseCode: 'PRRPRR01',
    title: 'Programmering 1',
    emoji: '💻',
    description: 'Lär dig grunderna i programmering och problemlösning',
    gradientColors: ['#14B8A6', '#0D9488'],
    modules: [
      {
        id: 1,
        title: 'Grundläggande programmering',
        description: 'Variabler, loopar och villkorssatser',
        emoji: '⚙️',
        sections: [
          {
            title: 'Introduktion till programmering',
            content: 'Programmering handlar om att ge instruktioner till datorn. Du lär dig skriva kod som löser problem och automatiserar uppgifter.',
            keyPoints: [
              'Variabler och datatyper',
              'If-satser och villkor',
              'Loopar (for, while)',
              'Funktioner och återanvändbar kod',
              'Felsökning och testning',
            ]
          }
        ],
        examples: ['Skriva enkla program', 'Skapa funktioner', 'Lösa programmeringsuppgifter'],
        reflectionQuestions: ['Hur löser man problem systematiskt?', 'Vad kännetecknar bra kod?']
      }
    ],
    goals: [
      { icon: 'Code', text: 'Skriva funktionell kod' },
      { icon: 'Bug', text: 'Felsöka och testa program' },
      { icon: 'Puzzle', text: 'Lösa problem algoritmiskt' },
    ],
    studyTips: [
      { icon: 'Laptop', text: 'Koda varje dag, även små program' },
      { icon: 'Lightbulb', text: 'Tänk igenom problemet före du kodar' },
      { icon: 'Users', text: 'Läs andras kod och få feedback' },
    ]
  },

  // GEOGRAFI
  {
    fileName: 'geografi1',
    courseCode: 'GEOGEO01',
    title: 'Geografi 1',
    emoji: '🌍',
    description: 'Utforska jordens landskap, klimat och hållbar utveckling',
    gradientColors: ['#10B981', '#059669'],
    modules: [
      {
        id: 1,
        title: 'Jordens klimatzoner',
        description: 'Studera klimat och väder runt om i världen',
        emoji: '🌡️',
        sections: [
          {
            title: 'Klimatsystem',
            content: 'Jordens klimat varierar beroende på latitud, höjd över havet och närhet till vatten. Klimatzoner påverkar vegetation, djurliv och mänskliga bosättningar.',
            keyPoints: [
              'Tropiskt klimat',
              'Tempererat klimat',
              'Polart klimat',
              'Växthusgaser och klimatförändringar',
              'Vädersystem och vindar',
            ]
          }
        ],
        examples: ['Jämföra klimatzoner', 'Analysera väderdata', 'Studera klimatförändringens effekter'],
        reflectionQuestions: ['Hur påverkar klimatet samhällen?', 'Vad kan vi göra åt klimatförändringar?']
      }
    ],
    goals: [
      { icon: 'Map', text: 'Förstå geografiska mönster' },
      { icon: 'Cloud', text: 'Lära om klimat och väder' },
      { icon: 'Leaf', text: 'Analysera hållbarhetsfrågor' },
    ],
    studyTips: [
      { icon: 'Globe', text: 'Använd kartor och atlaser regelbundet' },
      { icon: 'Newspaper', text: 'Följ internationella nyheter' },
      { icon: 'Camera', text: 'Studera satellit- och flygbilder' },
    ]
  }
];

console.log(`Ready to generate ${coursesToGenerate.length} course files`);
