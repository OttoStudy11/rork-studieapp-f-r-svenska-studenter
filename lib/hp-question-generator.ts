import { HPQuestion } from '@/constants/hogskoleprovet';

type HPSectionCode = 'ORD' | 'LÄS' | 'MEK' | 'XYZ' | 'KVA' | 'DTK';

type Difficulty = HPQuestion['difficulty'];

type GenerateArgs = {
  sectionCode: HPSectionCode | string;
  count: number;
  testVersion?: string;
  seed?: string;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const hashStringToUint32 = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const createRng = (seed: number) => {
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return {
    next,
    int: (min: number, max: number) => {
      const a = Math.ceil(min);
      const b = Math.floor(max);
      const r = next();
      return Math.floor(r * (b - a + 1)) + a;
    },
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)] as T,
    shuffle: <T,>(arr: readonly T[]) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
  };
};

const difficultyByIndex = (i: number, total: number): Difficulty => {
  if (total <= 0) return 'medium';
  const t = i / total;
  if (t < 0.35) return 'easy';
  if (t < 0.8) return 'medium';
  return 'hard';
};

const uniq = (arr: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
};

const makeOptions = (correct: string, wrong: string[], rng: ReturnType<typeof createRng>): string[] => {
  const cleanedWrong = uniq(wrong.filter(w => w.trim().length > 0 && w !== correct));
  const pickedWrong = rng.shuffle(cleanedWrong).slice(0, 3);
  const options = uniq([correct, ...pickedWrong]);
  while (options.length < 4) {
    options.push(rng.pick(['Ingen av ovanstående', 'Samtliga ovanstående', 'Kan inte avgöras', 'Okänt']));
  }
  return rng.shuffle(options.slice(0, 4));
};

const ORD_PAIRS: { word: string; correct: string; wrong: string[]; difficulty?: Difficulty }[] = [
  { word: 'kontroversiell', correct: 'omstridd', wrong: ['självklar', 'obetydlig', 'ensidig'] },
  { word: 'omfattande', correct: 'vidsträckt', wrong: ['begränsad', 'tillfällig', 'spontan'] },
  { word: 'försumlig', correct: 'slarvig', wrong: ['noggrann', 'uthållig', 'hänsynsfull'] },
  { word: 'förlegad', correct: 'omodern', wrong: ['innovativ', 'tidsenlig', 'framtung'] },
  { word: 'nyanserad', correct: 'mångsidig', wrong: ['enkelspårig', 'ytlig', 'godtycklig'] },
  { word: 'konsekvent', correct: 'sammanhängande', wrong: ['motsägelsefull', 'vacklande', 'tveksam'] },
  { word: 'implicit', correct: 'underförstådd', wrong: ['uttalad', 'tillfällig', 'exakt'] },
  { word: 'oförutsedd', correct: 'oväntad', wrong: ['planerad', 'trivial', 'uppenbar'] },
  { word: 'pröva', correct: 'testa', wrong: ['avslå', 'förkasta', 'förneka'] },
  { word: 'resonemang', correct: 'tankegång', wrong: ['tystnad', 'bestraffning', 'förklaring'] },
  { word: 'aversion', correct: 'motvilja', wrong: ['beundran', 'likgiltighet', 'glädje'] },
  { word: 'approximation', correct: 'ungefärlig beräkning', wrong: ['exakt mätning', 'störning', 'påstående'] },
  { word: 'de facto', correct: 'i praktiken', wrong: ['i teorin', 'av misstag', 'i hemlighet'] },
  { word: 'sanktionera', correct: 'godkänna', wrong: ['förbjuda', 'skuldbelägga', 'försvåra'] },
  { word: 'konciliant', correct: 'försonlig', wrong: ['aggressiv', 'cynisk', 'enveten'] },
  { word: 'precisera', correct: 'förtydliga', wrong: ['förvanska', 'fördröja', 'förminska'] },
  { word: 'reserverad', correct: 'återhållsam', wrong: ['överdriven', 'högljudd', 'riskfylld'] },
  { word: 'vederhäftig', correct: 'trovärdig', wrong: ['tveksam', 'partisk', 'snabb'] },
  { word: 'avvika', correct: 'skilja sig', wrong: ['sammanfalla', 'överensstämma', 'bekräfta'] },
  { word: 'dilemma', correct: 'svår valsituation', wrong: ['snabb lösning', 'enkel regel', 'hållpunkt'] },
  { word: 'antagonist', correct: 'motståndare', wrong: ['allierad', 'åskådare', 'medlare'], difficulty: 'medium' },
  { word: 'kongruent', correct: 'överensstämmande', wrong: ['avvikande', 'parallell', 'omvänd'], difficulty: 'hard' },
  { word: 'redundant', correct: 'överflödig', wrong: ['nödvändig', 'komplex', 'enkel'], difficulty: 'hard' },
  { word: 'pertinent', correct: 'relevant och träffande', wrong: ['irrelevant', 'förvirrande', 'motsägelsefull'], difficulty: 'medium' },
  { word: 'efemär', correct: 'kortvarig', wrong: ['evig', 'stark', 'vacker'], difficulty: 'hard' },
  { word: 'pragmatisk', correct: 'praktisk och realistisk', wrong: ['teoretisk', 'pessimistisk', 'idealistisk'], difficulty: 'medium' },
  { word: 'pedantisk', correct: 'överdrivet noggrann', wrong: ['vårdslös', 'vag', 'ytlig'], difficulty: 'medium' },
  { word: 'altruistisk', correct: 'osjälvisk', wrong: ['självisk', 'krävande', 'girig'], difficulty: 'medium' },
  { word: 'provisorisk', correct: 'tillfällig', wrong: ['permanent', 'definitiv', 'evig'], difficulty: 'medium' },
  { word: 'apatisk', correct: 'känslomässigt oberörd', wrong: ['känslig', 'engagerad', 'passionerad'], difficulty: 'hard' },
  { word: 'ambivalent', correct: 'kluven', wrong: ['säker', 'bestämd', 'entusiastisk'], difficulty: 'hard' },
  { word: 'subtil', correct: 'förfinad och svårupptäckt', wrong: ['uppenbar', 'grov', 'tydlig'], difficulty: 'hard' },
  { word: 'dogmatisk', correct: 'stel i sina åsikter', wrong: ['flexibel', 'öppen', 'nyfiken'], difficulty: 'hard' },
  { word: 'eufemism', correct: 'förskönande omskrivning', wrong: ['skällsord', 'överdrift', 'liknelse'], difficulty: 'hard' },
  { word: 'eklektisk', correct: 'sammansatt av olika stilar', wrong: ['enhetlig', 'minimalistisk', 'traditionell'], difficulty: 'hard' },
  { word: 'frivolitet', correct: 'lättsinne', wrong: ['allvar', 'styrka', 'disciplin'], difficulty: 'hard' },
  { word: 'genuin', correct: 'äkta', wrong: ['förfalskad', 'ytlig', 'tillgjord'], difficulty: 'easy' },
  { word: 'häpnadsväckande', correct: 'förvånande', wrong: ['tråkig', 'ordinär', 'vanlig'], difficulty: 'easy' },
  { word: 'ironisk', correct: 'sarkastisk', wrong: ['allvarlig', 'direkt', 'bokstavlig'], difficulty: 'easy' },
  { word: 'karismatisk', correct: 'utstrålande', wrong: ['blyg', 'tillbakadragen', 'anonym'], difficulty: 'easy' },
  { word: 'luktsinne', correct: 'förmåga att känna dofter', wrong: ['hörsel', 'smak', 'känsel'], difficulty: 'easy' },
  { word: 'marginell', correct: 'obetydlig', wrong: ['väsentlig', 'avgörande', 'dominerande'], difficulty: 'medium' },
  { word: 'notorisk', correct: 'ökänd', wrong: ['berömd', 'anonym', 'okänd'], difficulty: 'medium' },
  { word: 'paradox', correct: 'skenbar motsägelse', wrong: ['logisk följd', 'enkel lösning', 'uppenbar sanning'], difficulty: 'hard' },
  { word: 'kvintessens', correct: 'det mest typiska', wrong: ['undantag', 'avvikelse', 'randföreteelse'], difficulty: 'hard' },
  { word: 'retorik', correct: 'talekonst', wrong: ['matematik', 'skrivkonst', 'lyssnarförmåga'], difficulty: 'medium' },
  { word: 'skeptisk', correct: 'tvivlande', wrong: ['lättrogen', 'naiv', 'godtrogen'], difficulty: 'easy' },
  { word: 'trivial', correct: 'banal', wrong: ['viktig', 'komplex', 'djupsinnig'], difficulty: 'easy' },
  { word: 'utopi', correct: 'idealsamhälle', wrong: ['dystopi', 'verklighet', 'kaos'], difficulty: 'medium' },
  { word: 'volatil', correct: 'ombytlig', wrong: ['stabil', 'förutsägbar', 'konstant'], difficulty: 'hard' },
  { word: 'xenofobi', correct: 'rädsla för främlingar', wrong: ['öppenhet', 'nyfikenhet', 'tolerans'], difficulty: 'hard' },
  { word: 'ymnig', correct: 'riklig', wrong: ['sparsam', 'knapp', 'mager'], difficulty: 'easy' },
  { word: 'zealot', correct: 'fanatiker', wrong: ['moderat', 'skeptiker', 'pragmatiker'], difficulty: 'hard' },
  { word: 'adept', correct: 'lärjunge', wrong: ['mästare', 'kritiker', 'åskådare'], difficulty: 'medium' },
  { word: 'benägen', correct: 'böjd för', wrong: ['motvillig', 'ovillig', 'tveksam'], difficulty: 'easy' },
  { word: 'cessera', correct: 'upphöra', wrong: ['fortsätta', 'accelerera', 'börja'], difficulty: 'hard' },
  { word: 'dekadent', correct: 'förfallen', wrong: ['blomstrande', 'asketisk', 'sparsmakad'], difficulty: 'medium' },
  { word: 'eloquent', correct: 'vältalig', wrong: ['tyst', 'stammande', 'förvirrad'], difficulty: 'medium' },
  { word: 'fatalist', correct: 'ödesbestämd', wrong: ['optimist', 'aktivist', 'rebell'], difficulty: 'medium' },
  { word: 'garant', correct: 'borgensman', wrong: ['gäldenär', 'fiende', 'åskådare'], difficulty: 'hard' },
  { word: 'hierarki', correct: 'rangordning', wrong: ['jämlikhet', 'kaos', 'slumpmässighet'], difficulty: 'easy' },
  { word: 'insinuera', correct: 'antyda', wrong: ['berätta öppet', 'förneka', 'bekräfta'], difficulty: 'medium' },
  { word: 'koherent', correct: 'sammanhängande', wrong: ['splittrad', 'oorganiserad', 'kaotisk'], difficulty: 'hard' },
  { word: 'latent', correct: 'dold', wrong: ['synlig', 'aktiv', 'uppenbar'], difficulty: 'medium' },
  { word: 'meritokrati', correct: 'styrning baserad på kompetens', wrong: ['arvsrätt', 'slumpmässigt urval', 'demokrati'], difficulty: 'hard' },
  { word: 'negligera', correct: 'försumma', wrong: ['prioritera', 'stödja', 'befrämja'], difficulty: 'medium' },
  { word: 'obsolet', correct: 'föråldrad', wrong: ['modern', 'populär', 'aktuell'], difficulty: 'hard' },
  { word: 'plausibel', correct: 'trolig', wrong: ['omöjlig', 'absurd', 'otänkbar'], difficulty: 'hard' },
  { word: 'restitution', correct: 'återställande', wrong: ['förstörelse', 'försämring', 'förfall'], difficulty: 'hard' },
  { word: 'stringent', correct: 'strikt', wrong: ['slapp', 'flexibel', 'vårdslös'], difficulty: 'hard' },
  { word: 'tendens', correct: 'riktning', wrong: ['stillastående', 'slump', 'avbrott'], difficulty: 'easy' },
];

const MEK_TEMPLATES: { sentence: string; correct: string; wrong: string[]; difficulty?: Difficulty }[] = [
  {
    sentence: 'Det var svårt att ____ vilka konsekvenser beslutet skulle få, eftersom underlaget var bristfälligt.',
    correct: 'förutse',
    wrong: ['förneka', 'förklara', 'förminska'],
  },
  {
    sentence: 'Efter flera missförstånd lyckades de till slut ____ sin relation och gå vidare.',
    correct: 'reparera',
    wrong: ['förskjuta', 'överdriva', 'försvaga'],
  },
  {
    sentence: 'Forskaren var noga med att ____ sina slutsatser med data från flera källor.',
    correct: 'underbygga',
    wrong: ['underminera', 'förbise', 'förvirra'],
  },
  {
    sentence: 'Trots kritik valde företaget att ____ sin strategi och inte göra några större ändringar.',
    correct: 'bibehålla',
    wrong: ['förkasta', 'försumma', 'förvränga'],
  },
  {
    sentence: 'För att undvika fel behövde hon ____ instruktionerna noggrant innan hon började.',
    correct: 'tolka',
    wrong: ['bortse från', 'fördöma', 'förkorta'],
  },
  {
    sentence: 'Läraren försökte ____ elevernas intresse genom att variera undervisningsmetoderna.',
    correct: 'väcka',
    wrong: ['dämpa', 'ignorera', 'undertrycka'],
    difficulty: 'easy',
  },
  {
    sentence: 'Det krävdes stor ____ för att genomföra projektet inom utsatt tid.',
    correct: 'uthållighet',
    wrong: ['likgiltighet', 'oförmåga', 'tvekan'],
    difficulty: 'easy',
  },
  {
    sentence: 'Journalisten ifrågasatte om ministern medvetet hade försökt ____ fakta för allmänheten.',
    correct: 'undanhålla',
    wrong: ['framhäva', 'sprida', 'publicera'],
    difficulty: 'medium',
  },
  {
    sentence: 'Den ekonomiska krisen ____ behovet av nya reformer inom välfärdssystemet.',
    correct: 'understryker',
    wrong: ['motbevisar', 'försvagar', 'eliminerar'],
    difficulty: 'medium',
  },
  {
    sentence: 'Han försökte ____ konflikten genom att bjuda in parterna till samtal.',
    correct: 'medla i',
    wrong: ['förvärra', 'undvika', 'provocera'],
    difficulty: 'medium',
  },
  {
    sentence: 'Trots att hon var ____ för förslaget, valde hon att inte rösta.',
    correct: 'positiv',
    wrong: ['oberörd', 'okunnig', 'likgiltig'],
    difficulty: 'easy',
  },
  {
    sentence: 'De nya reglerna syftar till att ____ diskriminering på arbetsmarknaden.',
    correct: 'motverka',
    wrong: ['befrämja', 'ignorera', 'förstärka'],
    difficulty: 'easy',
  },
  {
    sentence: 'Hennes argumentation var så ____ att motståndarna inte kunde hitta en svag punkt.',
    correct: 'övertygande',
    wrong: ['förvirrande', 'irrelevant', 'vag'],
    difficulty: 'medium',
  },
  {
    sentence: 'Studien visar att brist på sömn kan ____ kognitiva funktioner negativt.',
    correct: 'påverka',
    wrong: ['förbättra', 'ignorera', 'befrämja'],
    difficulty: 'easy',
  },
  {
    sentence: 'Utan tillräcklig ____ riskerade hela experimentet att misslyckas.',
    correct: 'finansiering',
    wrong: ['publicitet', 'kritik', 'motstånd'],
    difficulty: 'medium',
  },
  {
    sentence: 'Det var nödvändigt att ____ de befintliga rutinerna för att anpassa sig till nya krav.',
    correct: 'revidera',
    wrong: ['behålla', 'ignorera', 'försvara'],
    difficulty: 'medium',
  },
  {
    sentence: 'Rapporten ____ att den globala uppvärmningen accelererar snabbare än förväntat.',
    correct: 'konstaterar',
    wrong: ['förnekar', 'ifrågasätter', 'bortförklarar'],
    difficulty: 'easy',
  },
  {
    sentence: 'Kommunen valde att ____ investeringar i kollektivtrafiken för att minska utsläppen.',
    correct: 'prioritera',
    wrong: ['skjuta upp', 'avbryta', 'ångra'],
    difficulty: 'easy',
  },
  {
    sentence: 'Den nya lagen förbjuder att ____ personlig information utan samtycke.',
    correct: 'sprida',
    wrong: ['skydda', 'kryptera', 'radera'],
    difficulty: 'medium',
  },
  {
    sentence: 'Forskarna kunde inte ____ om resultaten berodde på slumpen eller verkliga samband.',
    correct: 'avgöra',
    wrong: ['ignorera', 'undvika', 'förutspå'],
    difficulty: 'medium',
  },
  {
    sentence: 'Det var tydligt att hon försökte ____ sin egentliga åsikt bakom artiga formuleringar.',
    correct: 'dölja',
    wrong: ['framhäva', 'betona', 'förklara'],
    difficulty: 'medium',
  },
  {
    sentence: 'Organisationen arbetar för att ____ medvetenheten om psykisk ohälsa bland unga.',
    correct: 'öka',
    wrong: ['minska', 'undertrycka', 'förneka'],
    difficulty: 'easy',
  },
  {
    sentence: 'Beslutet att ____ de gamla byggnaderna mötte starkt motstånd från kulturminnesföreningen.',
    correct: 'riva',
    wrong: ['renovera', 'bevara', 'restaurera'],
    difficulty: 'easy',
  },
  {
    sentence: 'Enligt experterna behöver vi ____ nya metoder för att hantera klimatförändringarna.',
    correct: 'utveckla',
    wrong: ['överge', 'förneka', 'undvika'],
    difficulty: 'easy',
  },
  {
    sentence: 'Det visade sig att den påstådda fördelen var ____ och inte stöddes av evidens.',
    correct: 'illusorisk',
    wrong: ['konkret', 'bevisad', 'övertygande'],
    difficulty: 'hard',
  },
  {
    sentence: 'Utredningen visar att problemen till stor del kan ____ bristande kommunikation.',
    correct: 'tillskrivas',
    wrong: ['lösa', 'maskera', 'kompensera'],
    difficulty: 'hard',
  },
  {
    sentence: 'Trots de goda intentionerna lyckades inte åtgärderna ____ ojämlikheten.',
    correct: 'reducera',
    wrong: ['öka', 'bevara', 'uppmuntra'],
    difficulty: 'medium',
  },
  {
    sentence: 'Den nya tekniken gör det möjligt att ____ processer som tidigare krävde manuellt arbete.',
    correct: 'automatisera',
    wrong: ['komplicera', 'sakta ner', 'avbryta'],
    difficulty: 'medium',
  },
  {
    sentence: 'Historikern menade att händelsen bäst kan ____ i ljuset av de rådande politiska spänningarna.',
    correct: 'förstås',
    wrong: ['glömmas', 'förenklas', 'förkastas'],
    difficulty: 'hard',
  },
  {
    sentence: 'Det är viktigt att ____ mellan korrelation och kausalitet i vetenskaplig forskning.',
    correct: 'skilja',
    wrong: ['blanda ihop', 'ignorera', 'eliminera'],
    difficulty: 'hard',
  },
];

const LÄS_PASSAGES: { title: string; passage: string; qa: { q: string; correct: string; wrong: string[]; difficulty?: Difficulty }[] }[] = [
  {
    title: 'Stadsgrönska och hälsa',
    passage:
      'Flera studier har visat att närhet till grönområden kan påverka människors välbefinnande. Effekten verkar inte bara bero på möjligheten till motion, utan även på att miljöer med växtlighet minskar stress och kan förbättra koncentrationen. Samtidigt varierar nyttan mellan olika grupper: barn och äldre tycks ofta gynnas särskilt, medan effekten för andra delvis beror på hur grönområdena används. Forskare betonar därför vikten av både tillgänglighet och kvalitet, exempelvis trygghet, belysning och variation i vegetation.',
    qa: [
      {
        q: 'Vilken är textens huvudsakliga poäng?',
        correct: 'Grönområden kan förbättra välbefinnandet genom flera mekanismer och deras utformning spelar roll.',
        wrong: [
          'Motion är den enda förklaringen till varför grönområden påverkar hälsa.',
          'Grönområden gynnar alla grupper på exakt samma sätt.',
          'Trygghet och belysning är oviktiga i stadsgrönska.',
        ],
      },
      {
        q: 'Vilken slutsats stöds mest av texten?',
        correct: 'Tillgänglighet räcker inte; kvaliteten på grönområden påverkar hur mycket de används och uppskattas.',
        wrong: [
          'Ju fler träd, desto bättre effekt oavsett sammanhang.',
          'Barn gynnas aldrig av grönområden eftersom de inte motionerar.',
          'Stress påverkas inte av miljöer utan enbart av arbetstid.',
        ],
      },
    ],
  },
  {
    title: 'Teknik och utbildning',
    passage:
      'Digitala verktyg har blivit en självklar del av skolan, men deras effekt beror ofta på hur de används. När tekniken stödjer tydliga mål och kompletterar undervisningen kan den stärka lärandet. Om verktygen däremot introduceras utan plan eller kopplas till otydliga förväntningar kan de skapa splittrad uppmärksamhet. Lärare lyfter också att fortbildning är avgörande: verktyg som känns intuitiva för vissa elever kan vara hinder för andra om stödet saknas.',
    qa: [
      {
        q: 'Vad betonar texten som avgörande för teknikens effekt i skolan?',
        correct: 'Att tekniken används med tydliga mål och att lärare får stöd och fortbildning.',
        wrong: [
          'Att alla elever använder samma app oavsett behov.',
          'Att teknik alltid försämrar koncentrationen.',
          'Att verktyg bör undvikas för att inte skapa ojämlikhet.',
        ],
      },
      {
        q: 'Vad är ett exempel på en risk enligt texten?',
        correct: 'Att verktyg införs utan plan och leder till splittrad uppmärksamhet.',
        wrong: [
          'Att fortbildning gör att elever blir mindre självständiga.',
          'Att tydliga mål leder till sämre lärande.',
          'Att intuitiva verktyg alltid fungerar sämre.',
        ],
      },
    ],
  },
  {
    title: 'Språklig förändring',
    passage:
      'Alla levande språk förändras över tid. Förändringar kan ske i uttal, grammatik och ordförråd. Nya ord uppstår genom lån från andra språk, genom sammansättningar eller genom att befintliga ord får ny betydelse. Språkvetare ser ofta förändring som ett naturligt fenomen snarare än som förfall. Samtidigt pågår ständigt en debatt om vad som ska räknas som "korrekt" svenska: medan den deskriptiva hållningen beskriver hur språket faktiskt används, förespråkar den preskriptiva att normer ska upprätthållas.',
    qa: [
      {
        q: 'Vilken av följande påståenden överensstämmer bäst med texten?',
        correct: 'Språkförändring är ett naturligt fenomen som sker i alla levande språk.',
        wrong: [
          'Språkförändringar beror enbart på lånord.',
          'Deskriptiva lingvister vill alltid styra språket.',
          'Grammatikförändringar sker aldrig i svenska.',
        ],
        difficulty: 'medium',
      },
      {
        q: 'Vad är skillnaden mellan deskriptiv och preskriptiv hållning enligt texten?',
        correct: 'Deskriptiv beskriver hur språket faktiskt används; preskriptiv förespråkar att normer upprätthålls.',
        wrong: [
          'Deskriptiv och preskriptiv är samma sak.',
          'Deskriptiv handlar om uttal och preskriptiv om grammatik.',
          'Preskriptiv hållning avvisar alla språknormer.',
        ],
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Demokrati och deltagande',
    passage:
      'I en demokrati förväntas medborgare delta i den politiska processen, men formerna varierar. Utöver att rösta i val kan man engagera sig genom partier, föreningar, demonstrationer eller opinionsbildning i media. Forskning visar att det politiska deltagandet varierar kraftigt mellan olika samhällsgrupper: högutbildade och ekonomiskt privilegierade tenderar att delta i högre grad. Denna snedfördelning riskerar att förstärka befintliga ojämlikheter, eftersom beslutsfattare kan bli mer lyhörda för de grupper som gör sin röst hörd.',
    qa: [
      {
        q: 'Vad är ett centralt problem som texten lyfter fram?',
        correct: 'Ojämlikt deltagande kan förstärka befintliga ojämlikheter i samhället.',
        wrong: [
          'Att rösta i val är det enda sättet att påverka politiken.',
          'Alla samhällsgrupper deltar lika mycket politiskt.',
          'Demonstrationer har ingen politisk betydelse.',
        ],
        difficulty: 'medium',
      },
      {
        q: 'Varför kan ojämlikt deltagande vara ett demokratiskt problem?',
        correct: 'Beslutsfattare kan bli mer lyhörda för grupper som deltar aktivt, på bekostnad av andra.',
        wrong: [
          'Fler röster leder alltid till bättre beslut.',
          'Ekonomiskt privilegierade har alltid rätt i politiska frågor.',
          'Politiskt deltagande minskar ojämlikhet automatiskt.',
        ],
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Antibiotikaresistens',
    passage:
      'Antibiotikaresistens är ett växande globalt hot mot folkhälsan. Bakterier som utvecklar resistens mot antibiotika gör att tidigare behandlingsbara infektioner blir svårare att bota. Överanvändning av antibiotika, både inom sjukvård och djurhållning, anses vara en huvudorsak. Världshälsoorganisationen har lyft frågan som en av de tio största hoten mot global hälsa. Åtgärder som diskuteras inkluderar striktare förskrivningsregler, utveckling av nya antibiotika och investeringar i alternativa behandlingsmetoder.',
    qa: [
      {
        q: 'Vad är den huvudsakliga orsaken till antibiotikaresistens enligt texten?',
        correct: 'Överanvändning av antibiotika inom både sjukvård och djurhållning.',
        wrong: [
          'Brist på forskning om bakterier.',
          'Att människor inte tar sina mediciner klart.',
          'Att antibiotika är för dyrt.',
        ],
        difficulty: 'easy',
      },
      {
        q: 'Vilken åtgärd nämns INTE i texten?',
        correct: 'Vaccinering mot alla bakterieinfektioner.',
        wrong: [
          'Striktare förskrivningsregler.',
          'Utveckling av nya antibiotika.',
          'Investeringar i alternativa behandlingsmetoder.',
        ],
        difficulty: 'medium',
      },
    ],
  },
  {
    title: 'Artificiell intelligens och arbetsmarknaden',
    passage:
      'AI-teknikens framväxt väcker frågor om framtidens arbetsmarknad. Medan vissa bedömare varnar för massarbetslöshet, menar andra att tekniken snarare kommer att förändra arbetsuppgifter än att eliminera jobb. Historiskt har nya teknologier skapat fler jobb än de tagit bort, men omställningen har inte alltid varit smärtfri. Utbildning och vidareutbildning pekas ut som nyckelstrategier för att hantera omställningen. Särskilt oroande är den potentiella effekten på yrken med rutinmässiga uppgifter.',
    qa: [
      {
        q: 'Vilken syn på AI och arbetsmarknaden presenteras i texten?',
        correct: 'Olika bedömare har skilda uppfattningar, från massarbetslöshet till omformning av arbetsuppgifter.',
        wrong: [
          'AI kommer definitivt att leda till massarbetslöshet.',
          'Teknik har aldrig förändrat arbetsmarknaden historiskt.',
          'Alla yrken påverkas lika mycket av AI.',
        ],
        difficulty: 'medium',
      },
      {
        q: 'Vilka jobb befaras drabbas mest?',
        correct: 'Yrken med rutinmässiga uppgifter.',
        wrong: [
          'Kreativa yrken.',
          'Sjukvårdsyrken.',
          'Forskaryrken.',
        ],
        difficulty: 'easy',
      },
    ],
  },
  {
    title: 'Urbanisering och stadsplanering',
    passage:
      'En majoritet av världens befolkning bor i dag i städer, och urbaniseringen förväntas fortsätta. Stadsplanering står därför inför stora utmaningar: att skapa boende, infrastruktur och grönområden som möter invånarnas behov utan att miljön tar skada. Täta städer kan minska transportbehov och energiförbrukning, men riskerar samtidigt att leda till trängsel och sämre livskvalitet. En balanserad stadsutveckling kräver samarbete mellan politiker, planerare och medborgare.',
    qa: [
      {
        q: 'Vad är en fördel med tät stadsbyggnad enligt texten?',
        correct: 'Minskade transportbehov och lägre energiförbrukning.',
        wrong: [
          'Fler grönområden per invånare.',
          'Lägre boendepriser.',
          'Bättre luftkvalitet.',
        ],
        difficulty: 'easy',
      },
      {
        q: 'Vilken utmaning identifieras?',
        correct: 'Att skapa stadsplanering som tillgodoser behov utan miljöskada.',
        wrong: [
          'Att minska befolkningen i städer.',
          'Att förbjuda bilkörning.',
          'Att privatisera all stadsplanering.',
        ],
        difficulty: 'medium',
      },
    ],
  },
  {
    title: 'Vetenskaplig metod',
    passage:
      'Den vetenskapliga metoden bygger på systematisk observation, hypotesbildning och testning. Ett centralt krav är reproducerbarhet: andra forskare ska kunna upprepa ett experiment och nå liknande resultat. Peer review, där kollegor granskar forskningsresultat innan publicering, är ytterligare ett kvalitetssäkringssteg. Trots dessa kontrollmekanismer förekommer problem som publiceringsbias – tendensen att publicera positiva resultat oftare – och replikationskriser inom flera forskningsområden.',
    qa: [
      {
        q: 'Vad innebär reproducerbarhet enligt texten?',
        correct: 'Att andra forskare kan upprepa ett experiment med liknande resultat.',
        wrong: [
          'Att bara en forskare behöver bekräfta resultaten.',
          'Att resultaten alltid är exakt likadana.',
          'Att forskning inte behöver granskas.',
        ],
        difficulty: 'easy',
      },
      {
        q: 'Vad är publiceringsbias?',
        correct: 'Tendensen att positiva resultat publiceras oftare.',
        wrong: [
          'Att forskning inte publiceras alls.',
          'Att negativa resultat publiceras oftare.',
          'Att peer review alltid fungerar perfekt.',
        ],
        difficulty: 'medium',
      },
    ],
  },
  {
    title: 'Migration och integration',
    passage:
      'Migration har alltid varit en del av mänsklig historia. I dag sker migration av många skäl: konflikter, ekonomiska möjligheter, familjeåterförening och klimatförändringar. Integration i mottagarlandet är en komplex process som involverar språkinlärning, arbetsmarknadsetablering och sociala nätverk. Forskning visar att integrationen underlättas av tidig tillgång till arbete och utbildning, men att strukturella hinder som diskriminering kan försvåra processen avsevärt.',
    qa: [
      {
        q: 'Vilka faktorer underlättar integration enligt texten?',
        correct: 'Tidig tillgång till arbete och utbildning.',
        wrong: [
          'Isolering från det nya samhället.',
          'Att undvika att lära sig språket.',
          'Att ha hög inkomst vid ankomst.',
        ],
        difficulty: 'easy',
      },
      {
        q: 'Vad kan försvåra integrationsprocessen?',
        correct: 'Strukturella hinder som diskriminering.',
        wrong: [
          'Att ha familj i mottagarlandet.',
          'Att delta i utbildning.',
          'Att lära sig det nya språket.',
        ],
        difficulty: 'medium',
      },
    ],
  },
  {
    title: 'Kognitionsvetenskap och beslutsfattande',
    passage:
      'Forskning inom kognitionsvetenskap har avslöjat att människor sällan fattar helt rationella beslut. Istället använder vi mentala genvägar, så kallade heuristiker, som ofta fungerar väl men ibland leder till systematiska felslut (bias). Bekräftelsebias – tendensen att söka information som bekräftar det vi redan tror – är ett välkänt exempel. Förankringseffekten, där ett initialt värde påverkar efterföljande bedömningar, är en annan. Medvetenheten om dessa mekanismer kan hjälpa oss att fatta bättre beslut.',
    qa: [
      {
        q: 'Vad är en heuristik enligt texten?',
        correct: 'En mental genväg som ofta fungerar men ibland leder till felslut.',
        wrong: [
          'En perfekt beslutsmetod.',
          'En form av datoralgoritm.',
          'En vetenskaplig teori om minne.',
        ],
        difficulty: 'medium',
      },
      {
        q: 'Vad innebär bekräftelsebias?',
        correct: 'Tendensen att söka information som stödjer det man redan tror.',
        wrong: [
          'Tendensen att alltid ifrågasätta sina egna åsikter.',
          'Att man aldrig ändrar uppfattning.',
          'Att man alltid väljer det första alternativet.',
        ],
        difficulty: 'medium',
      },
    ],
  },
];

type ComparisonChoice = 'A' | 'B' | 'C' | 'D';

const KVA_RULES: {
  prompt: (rng: ReturnType<typeof createRng>) => { text: string; correct: ComparisonChoice; explanation: string; difficulty?: Difficulty };
}[] = [
  {
    prompt: (rng) => {
      const x = rng.int(2, 12);
      const y = rng.int(2, 12);
      const a = x * x;
      const b = x * y;
      const correct: ComparisonChoice = a > b ? 'A' : a < b ? 'B' : 'C';
      return { text: `Låt x = ${x} och y = ${y}. Jämför A = x² och B = x·y.`, correct, explanation: `A = ${x}² = ${a} och B = ${x}·${y} = ${b}.` };
    },
  },
  {
    prompt: (rng) => {
      const a0 = rng.int(1, 9);
      const d = rng.int(1, 6);
      const n = rng.int(3, 8);
      const sum = (n * (2 * a0 + (n - 1) * d)) / 2;
      const alt = n * (a0 + d);
      const correct: ComparisonChoice = sum > alt ? 'A' : sum < alt ? 'B' : 'C';
      return { text: `En aritmetisk talföljd har första talet ${a0} och differensen ${d}. Jämför A = summan av de första ${n} talen och B = ${n}·(${a0 + d}).`, correct, explanation: `A = ${sum}. B = ${alt}.` };
    },
  },
  {
    prompt: (rng) => {
      const p = rng.int(5, 35);
      const q = rng.int(5, 35);
      const A = p / 100;
      const B = q / 1000;
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = ${p}% och B = ${q}‰ (promille).`, correct, explanation: `A = ${p}/100 = ${A}. B = ${q}/1000 = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const a = rng.int(2, 15);
      const b = rng.int(2, 15);
      const A = a * a + b * b;
      const B = (a + b) * (a + b);
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = a² + b² och B = (a+b)² när a = ${a} och b = ${b}.`, correct, explanation: `A = ${a}² + ${b}² = ${A}. B = (${a}+${b})² = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const r = rng.int(2, 10);
      const A = Math.round(Math.PI * r * r * 100) / 100;
      const B = 4 * r * r;
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `En cirkel har radie ${r}. Jämför A = cirkelns area (π·r²) och B = arean av en kvadrat med sida 2r.`, correct, explanation: `A = π·${r}² ≈ ${A}. B = (2·${r})² = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const n = rng.int(2, 8);
      const A = Math.pow(2, n);
      const B = n * n;
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = 2^${n} och B = ${n}².`, correct, explanation: `A = 2^${n} = ${A}. B = ${n}² = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const a = rng.int(3, 12);
      const b = rng.int(3, 12);
      const A = a * b;
      const B = Math.round((a + b) * (a + b) / 4);
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = ${a}·${b} och B = ((${a}+${b})/2)².`, correct, explanation: `A = ${A}. B = ((${a}+${b})/2)² = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const x = rng.int(1, 20);
      const A = x * (x + 1);
      const B = x * x + x;
      const correct: ComparisonChoice = 'C';
      return { text: `Jämför A = x(x+1) och B = x² + x, där x = ${x}.`, correct, explanation: `A = ${x}·${x + 1} = ${A}. B = ${x}² + ${x} = ${B}. De är alltid lika.` };
    },
  },
  {
    prompt: (rng) => {
      const a = rng.int(10, 50);
      const b = rng.int(10, 50);
      const A = Math.abs(a - b);
      const B = Math.round(Math.sqrt(a * a + b * b));
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = |${a} - ${b}| och B = √(${a}² + ${b}²).`, correct, explanation: `A = |${a} - ${b}| = ${A}. B = √(${a * a + b * b}) ≈ ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const n1 = rng.int(2, 6);
      const n2 = rng.int(2, 6);
      const A = n1 * n1 * n1;
      const B = n2 * n2 * n2;
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = ${n1}³ och B = ${n2}³.`, correct, explanation: `A = ${n1}³ = ${A}. B = ${n2}³ = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const base = rng.int(100, 500);
      const pct1 = rng.int(5, 30);
      const pct2 = rng.int(5, 30);
      const A = Math.round(base * (1 + pct1 / 100) * (1 - pct1 / 100));
      const B = Math.round(base * (1 + pct2 / 100) * (1 - pct2 / 100));
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Ett pris på ${base} kr höjs ${pct1}% sedan sänks ${pct1}% (A). Jämför med höjning ${pct2}% och sänkning ${pct2}% (B).`, correct, explanation: `A ≈ ${A}. B ≈ ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const t = rng.int(2, 8);
      const A = t * (t - 1) / 2;
      const B = rng.int(1, 25);
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `${t} personer ska hälsa på varandra. Jämför A = antal handskakningar och B = ${B}.`, correct, explanation: `A = ${t}·(${t}-1)/2 = ${A}. B = ${B}.` };
    },
  },
  {
    prompt: (rng) => {
      const a = rng.int(2, 10);
      const b = rng.int(2, 10);
      const A = (a + b) / 2;
      const B = Math.sqrt(a * b);
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return { text: `Jämför A = aritmetiskt medelvärde av ${a} och ${b} och B = geometriskt medelvärde.`, correct, explanation: `A = (${a}+${b})/2 = ${A}. B = √(${a}·${b}) ≈ ${Math.round(B * 100) / 100}.` };
    },
  },
];

const XYZ_RULES: {
  prompt: (rng: ReturnType<typeof createRng>) => { text: string; options: string[]; correctAnswer: string; explanation: string; difficulty?: Difficulty };
}[] = [
  {
    prompt: (rng) => {
      const year1 = rng.int(2018, 2022);
      const year2 = year1 + 1;
      const a = rng.int(80, 160);
      const b = clamp(a + rng.int(-30, 45), 50, 200);
      const diff = b - a;
      const correct = `${diff}`;
      return {
        text: `Ett företag redovisar omsättning (i miljoner kr):\n${year1}: ${a}\n${year2}: ${b}\nHur stor är förändringen (i miljoner kr) från ${year1} till ${year2}?`,
        options: makeOptions(correct, [`${diff + 10}`, `${diff - 10}`, `${Math.abs(diff) + 5}`], rng),
        correctAnswer: correct,
        explanation: `Förändringen är ${b} − ${a} = ${diff} miljoner kr.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const total = rng.int(400, 1200);
      const part = rng.int(50, total - 50);
      const pct = Math.round((part / total) * 100);
      const correct = `${pct}%`;
      return {
        text: `I en undersökning deltog ${total} personer. Av dessa svarade ${part} "Ja". Hur stor andel (avrundat till närmaste heltal) svarade "Ja"?`,
        options: makeOptions(correct, [`${pct + 7}%`, `${pct - 6}%`, `${clamp(pct + 12, 0, 100)}%`], rng),
        correctAnswer: correct,
        explanation: `Andelen är ${part}/${total} ≈ ${(part / total).toFixed(3)} vilket motsvarar cirka ${pct}%.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'];
      const vals = months.map(() => rng.int(20, 150));
      const maxIdx = vals.indexOf(Math.max(...vals));
      const correct = months[maxIdx];
      const wrongMonths = months.filter((_, i) => i !== maxIdx);
      return {
        text: `Försäljningsdata (tkr):\n${months.map((m, i) => `${m}: ${vals[i]}`).join('\n')}\nVilken månad hade högst försäljning?`,
        options: makeOptions(correct, rng.shuffle(wrongMonths).slice(0, 3), rng),
        correctAnswer: correct,
        explanation: `${correct} hade högst försäljning med ${vals[maxIdx]} tkr.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const a = rng.int(200, 600);
      const b = rng.int(200, 600);
      const c = rng.int(200, 600);
      const total = a + b + c;
      const pctA = Math.round((a / total) * 100);
      const correct = `${pctA}%`;
      return {
        text: `En budget fördelas: Personal ${a} tkr, Material ${b} tkr, Övrigt ${c} tkr. Hur stor andel går till personal?`,
        options: makeOptions(correct, [`${pctA + 8}%`, `${pctA - 5}%`, `${Math.round((b / total) * 100)}%`], rng),
        correctAnswer: correct,
        explanation: `Total = ${total}. Personal = ${a}/${total} ≈ ${pctA}%.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const pop1 = rng.int(5000, 50000);
      const growth = rng.int(2, 12);
      const pop2 = Math.round(pop1 * (1 + growth / 100));
      const correct = `${growth}%`;
      return {
        text: `En stads befolkning ökade från ${pop1} till ${pop2} invånare. Hur stor var den procentuella ökningen?`,
        options: makeOptions(correct, [`${growth + 3}%`, `${growth - 2}%`, `${growth * 2}%`], rng),
        correctAnswer: correct,
        explanation: `Ökning: (${pop2} - ${pop1})/${pop1} = ${growth}%.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const cats = ['Livsmedel', 'Transport', 'Boende', 'Nöje', 'Kläder'];
      const vals = cats.map(() => rng.int(500, 5000));
      const total = vals.reduce((s, v) => s + v, 0);
      const correct = `${total} kr`;
      return {
        text: `Månadsutgifter:\n${cats.map((c, i) => `${c}: ${vals[i]} kr`).join('\n')}\nVad är de totala utgifterna?`,
        options: makeOptions(correct, [`${total + 500} kr`, `${total - 300} kr`, `${total + 1200} kr`], rng),
        correctAnswer: correct,
        explanation: `Summan av alla kategorier = ${total} kr.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const base = rng.int(1000, 5000);
      const rate = rng.int(3, 10);
      const years = rng.int(1, 5);
      const result = Math.round(base * Math.pow(1 + rate / 100, years));
      const correct = `${result} kr`;
      return {
        text: `En investering på ${base} kr ger ${rate}% ränta per år. Vad är värdet efter ${years} år (ränta på ränta)?`,
        options: makeOptions(correct, [`${result + 100} kr`, `${base + base * rate * years / 100} kr`, `${result - 150} kr`], rng),
        correctAnswer: correct,
        explanation: `${base} × (1 + ${rate}/100)^${years} ≈ ${result} kr.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const speeds = [rng.int(60, 120), rng.int(60, 120), rng.int(60, 120)];
      const avg = Math.round(speeds.reduce((s, v) => s + v, 0) / speeds.length);
      const correct = `${avg} km/h`;
      return {
        text: `Tre mätningar av hastighet: ${speeds[0]}, ${speeds[1]} och ${speeds[2]} km/h. Vad är medelhastigheten?`,
        options: makeOptions(correct, [`${avg + 5} km/h`, `${avg - 3} km/h`, `${Math.max(...speeds)} km/h`], rng),
        correctAnswer: correct,
        explanation: `Medelvärde = (${speeds.join(' + ')}) / 3 ≈ ${avg} km/h.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const men = rng.int(100, 500);
      const women = rng.int(100, 500);
      const total = men + women;
      const ratio = Math.round((men / total) * 100);
      const correct = `${ratio}%`;
      return {
        text: `I en grupp finns ${men} män och ${women} kvinnor. Hur stor andel är män?`,
        options: makeOptions(correct, [`${ratio + 5}%`, `${100 - ratio}%`, `${ratio - 7}%`], rng),
        correctAnswer: correct,
        explanation: `Andel män = ${men}/${total} ≈ ${ratio}%.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const dist = rng.int(50, 300);
      const speed = rng.int(40, 120);
      const hours = Math.round((dist / speed) * 10) / 10;
      const correct = `${hours} timmar`;
      return {
        text: `En bil kör ${dist} km med hastigheten ${speed} km/h. Hur lång tid tar resan?`,
        options: makeOptions(correct, [`${hours + 0.5} timmar`, `${hours - 0.3} timmar`, `${Math.ceil(hours)} timmar`], rng),
        correctAnswer: correct,
        explanation: `Tid = ${dist}/${speed} = ${hours} timmar.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const items = rng.int(3, 8);
      const prices = Array.from({ length: items }, () => rng.int(15, 200));
      const total = prices.reduce((s, v) => s + v, 0);
      const discount = rng.int(10, 30);
      const after = Math.round(total * (1 - discount / 100));
      const correct = `${after} kr`;
      return {
        text: `Varor kostar totalt ${total} kr. Med ${discount}% rabatt, vad blir priset?`,
        options: makeOptions(correct, [`${after + 20} kr`, `${total - discount} kr`, `${after - 15} kr`], rng),
        correctAnswer: correct,
        explanation: `${total} × (1 - ${discount}/100) = ${after} kr.`,
      };
    },
  },
];

const DTK_RULES: {
  prompt: (rng: ReturnType<typeof createRng>) => { text: string; options: string[]; correctAnswer: string; explanation: string; difficulty?: Difficulty };
}[] = [
  {
    prompt: (rng) => {
      const v1 = rng.int(20, 90);
      const v2 = clamp(v1 + rng.int(-25, 40), 5, 130);
      const v3 = clamp(v2 + rng.int(-25, 40), 5, 160);
      const avg = Math.round((v1 + v2 + v3) / 3);
      const correct = `${avg}`;
      return {
        text: `Tre mätningar av samma storhet gav värdena ${v1}, ${v2} och ${v3}. Vad är medelvärdet (avrundat till heltal)?`,
        options: makeOptions(correct, [`${avg + 4}`, `${avg - 5}`, `${Math.round((v1 + v2) / 2)}`], rng),
        correctAnswer: correct,
        explanation: `Medelvärdet är (${v1} + ${v2} + ${v3})/3 ≈ ${avg}.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const base = rng.int(50, 200);
      const inc = rng.int(5, 35);
      const months = rng.int(2, 8);
      const result = base + inc * months;
      const correct = `${result}`;
      return {
        text: `En kostnad är ${base} kr och ökar med ${inc} kr per månad. Vad är kostnaden efter ${months} månader?`,
        options: makeOptions(correct, [`${result + inc}`, `${result - inc}`, `${base + inc}`], rng),
        correctAnswer: correct,
        explanation: `${base} + ${months}·${inc} = ${result}.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const init = rng.int(1000, 5000);
      const decay = rng.int(5, 20);
      const years = rng.int(2, 6);
      const result = Math.round(init * Math.pow(1 - decay / 100, years));
      const correct = `${result}`;
      return {
        text: `En maskin köps för ${init} kr och tappar ${decay}% av sitt värde varje år. Vad är värdet efter ${years} år?`,
        options: makeOptions(correct, [`${result + 200}`, `${init - decay * years}`, `${result - 150}`], rng),
        correctAnswer: correct,
        explanation: `${init} × (1 - ${decay}/100)^${years} ≈ ${result}.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const co2 = rng.int(50, 200);
      const reduction = rng.int(20, 60);
      const target = Math.round(co2 * (1 - reduction / 100));
      const correct = `${target} Mton`;
      return {
        text: `CO2-utsläpp är ${co2} Mton. Målet är att minska med ${reduction}%. Vad är målnivån?`,
        options: makeOptions(correct, [`${target + 10} Mton`, `${co2 - reduction} Mton`, `${target - 8} Mton`], rng),
        correctAnswer: correct,
        explanation: `${co2} × (1 - ${reduction}/100) = ${target} Mton.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const flow = rng.int(10, 80);
      const hours = rng.int(2, 12);
      const total = flow * hours;
      const correct = `${total} liter`;
      return {
        text: `En kran flödar ${flow} liter per timme. Hur mycket vatten rinner ut på ${hours} timmar?`,
        options: makeOptions(correct, [`${total + flow} liter`, `${total - flow} liter`, `${flow + hours} liter`], rng),
        correctAnswer: correct,
        explanation: `${flow} × ${hours} = ${total} liter.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const eff = rng.int(60, 95);
      const input = rng.int(200, 1000);
      const output = Math.round(input * eff / 100);
      const correct = `${output}`;
      return {
        text: `En motor har verkningsgrad ${eff}%. Om tillförd energi är ${input} kJ, hur mycket nyttig energi produceras?`,
        options: makeOptions(correct, [`${output + 30}`, `${input - eff}`, `${output - 25}`], rng),
        correctAnswer: correct,
        explanation: `${input} × ${eff}/100 = ${output} kJ.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const weight = rng.int(50, 200);
      const gravity = 9.82;
      const force = Math.round(weight * gravity);
      const correct = `${force} N`;
      return {
        text: `Ett föremål väger ${weight} kg. Hur stor är tyngdkraften (g ≈ 9,82 m/s²)?`,
        options: makeOptions(correct, [`${force + 50} N`, `${weight} N`, `${force - 40} N`], rng),
        correctAnswer: correct,
        explanation: `F = m·g = ${weight} × 9,82 ≈ ${force} N.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const power = rng.int(500, 3000);
      const hours = rng.int(1, 10);
      const kwh = Math.round(power * hours / 1000 * 10) / 10;
      const price = rng.int(1, 3);
      const cost = Math.round(kwh * price * 10) / 10;
      const correct = `${cost} kr`;
      return {
        text: `En apparat drar ${power} W och körs i ${hours} timmar. Elpriset är ${price} kr/kWh. Vad blir kostnaden?`,
        options: makeOptions(correct, [`${cost + 2} kr`, `${cost - 1} kr`, `${Math.round(power * hours / 100) / 10} kr`], rng),
        correctAnswer: correct,
        explanation: `Energi = ${power}W × ${hours}h / 1000 = ${kwh} kWh. Kostnad = ${kwh} × ${price} = ${cost} kr.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const concentration = rng.int(2, 15);
      const volume = rng.int(100, 500);
      const amount = Math.round(concentration * volume / 100);
      const correct = `${amount} g`;
      return {
        text: `En lösning har ${concentration}% koncentration. Om volymen är ${volume} ml, hur mycket ämne finns?`,
        options: makeOptions(correct, [`${amount + 5} g`, `${concentration + volume} g`, `${amount - 3} g`], rng),
        correctAnswer: correct,
        explanation: `${concentration}% av ${volume} = ${amount} g.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const area = rng.int(20, 200);
      const people = rng.int(50, 5000);
      const density = Math.round(people / area);
      const correct = `${density} inv/km²`;
      return {
        text: `En region har ${people} invånare på ${area} km². Vad är befolkningstätheten?`,
        options: makeOptions(correct, [`${density + 10} inv/km²`, `${density - 8} inv/km²`, `${Math.round(area / people)} inv/km²`], rng),
        correctAnswer: correct,
        explanation: `${people}/${area} ≈ ${density} invånare per km².`,
      };
    },
  },
  {
    prompt: (rng) => {
      const temp1 = rng.int(-10, 30);
      const temp2 = rng.int(-10, 30);
      const temp3 = rng.int(-10, 30);
      const temp4 = rng.int(-10, 30);
      const avg = Math.round((temp1 + temp2 + temp3 + temp4) / 4 * 10) / 10;
      const correct = `${avg}°C`;
      return {
        text: `Temperaturer under fyra dagar: ${temp1}°C, ${temp2}°C, ${temp3}°C, ${temp4}°C. Medeltemperaturen?`,
        options: makeOptions(correct, [`${avg + 2}°C`, `${avg - 1.5}°C`, `${Math.max(temp1, temp2, temp3, temp4)}°C`], rng),
        correctAnswer: correct,
        explanation: `(${temp1} + ${temp2} + ${temp3} + ${temp4})/4 = ${avg}°C.`,
      };
    },
  },
];

const toComparisonQuestion = (base: {
  id: string;
  sectionCode: HPSectionCode;
  testVersion?: string;
  questionNumber: number;
  questionText: string;
  correct: ComparisonChoice;
  explanation: string;
  difficulty: Difficulty;
}): HPQuestion => {
  const options = ['A', 'B', 'C', 'D'] as const;
  const correctAnswer = base.correct;
  const explanation = `${base.explanation} (A: A > B, B: A < B, C: A = B, D: Kan ej avgöras).`;

  return {
    id: base.id,
    sectionCode: base.sectionCode,
    testVersion: base.testVersion,
    questionNumber: base.questionNumber,
    questionText: `${base.questionText}\n\nVälj:\nA: A > B\nB: A < B\nC: A = B\nD: Kan ej avgöras`,
    questionType: 'comparison',
    options: [...options],
    correctAnswer,
    explanation,
    difficulty: base.difficulty,
  };
};

const normalizeSection = (sectionCode: string): HPSectionCode | null => {
  const s = sectionCode.toUpperCase();
  if (s === 'ORD' || s === 'LÄS' || s === 'MEK' || s === 'XYZ' || s === 'KVA' || s === 'DTK') return s;
  return null;
};

export function generateHPQuestionBank(args: GenerateArgs): HPQuestion[] {
  const section = normalizeSection(args.sectionCode);
  if (!section) return [];

  const count = clamp(Math.floor(args.count), 0, 5000);
  const seedStr = `${args.seed ?? ''}|${section}|${args.testVersion ?? ''}|${count}|v2`;
  const rng = createRng(hashStringToUint32(seedStr));

  const out: HPQuestion[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const qn = i + 1;
    const difficulty = difficultyByIndex(i, count);
    const id = `gen-${section}-${args.testVersion ?? 'all'}-${qn}-${hashStringToUint32(seedStr + i)}`;

    if (usedIds.has(id)) continue;
    usedIds.add(id);

    if (section === 'ORD') {
      const base = ORD_PAIRS[Math.floor(rng.next() * ORD_PAIRS.length)];
      const correct = base.correct;
      const options = makeOptions(correct, base.wrong, rng);
      out.push({
        id,
        sectionCode: 'ORD',
        testVersion: args.testVersion,
        questionNumber: qn,
        questionText: `Vad betyder ordet "${base.word}"?`,
        questionType: 'multiple_choice',
        options,
        correctAnswer: correct,
        explanation: `"${base.word}" betyder ungefär ${correct}.`,
        difficulty: base.difficulty ?? difficulty,
      });
      continue;
    }

    if (section === 'MEK') {
      const base = MEK_TEMPLATES[Math.floor(rng.next() * MEK_TEMPLATES.length)];
      const correct = base.correct;
      const options = makeOptions(correct, base.wrong, rng);
      out.push({
        id,
        sectionCode: 'MEK',
        testVersion: args.testVersion,
        questionNumber: qn,
        questionText: base.sentence,
        questionType: 'multiple_choice',
        options,
        correctAnswer: correct,
        explanation: `Det ord som passar bäst i meningen är "${correct}".`,
        difficulty: base.difficulty ?? difficulty,
      });
      continue;
    }

    if (section === 'LÄS') {
      const p = LÄS_PASSAGES[Math.floor(rng.next() * LÄS_PASSAGES.length)];
      const qa = p.qa[Math.floor(rng.next() * p.qa.length)];
      const correct = qa.correct;
      const options = makeOptions(correct, qa.wrong, rng);
      out.push({
        id,
        sectionCode: 'LÄS',
        testVersion: args.testVersion,
        questionNumber: qn,
        questionText: qa.q,
        questionType: 'reading_comprehension',
        options,
        correctAnswer: correct,
        explanation: `Svaret stöds av uppgifterna i texten.`,
        difficulty: qa.difficulty ?? difficulty,
        readingPassage: `${p.title}\n\n${p.passage}`,
      });
      continue;
    }

    if (section === 'KVA') {
      const rule = KVA_RULES[Math.floor(rng.next() * KVA_RULES.length)];
      const res = rule.prompt(rng);
      out.push(
        toComparisonQuestion({
          id,
          sectionCode: 'KVA',
          testVersion: args.testVersion,
          questionNumber: qn,
          questionText: res.text,
          correct: res.correct,
          explanation: res.explanation,
          difficulty: res.difficulty ?? difficulty,
        })
      );
      continue;
    }

    if (section === 'XYZ') {
      const rule = XYZ_RULES[Math.floor(rng.next() * XYZ_RULES.length)];
      const res = rule.prompt(rng);
      out.push({
        id,
        sectionCode: 'XYZ',
        testVersion: args.testVersion,
        questionNumber: qn,
        questionText: res.text,
        questionType: 'multiple_choice',
        options: res.options,
        correctAnswer: res.correctAnswer,
        explanation: res.explanation,
        difficulty: res.difficulty ?? difficulty,
      });
      continue;
    }

    const rule = DTK_RULES[Math.floor(rng.next() * DTK_RULES.length)];
    const res = rule.prompt(rng);
    out.push({
      id,
      sectionCode: 'DTK',
      testVersion: args.testVersion,
      questionNumber: qn,
      questionText: res.text,
      questionType: 'multiple_choice',
      options: res.options,
      correctAnswer: res.correctAnswer,
      explanation: res.explanation,
      difficulty: res.difficulty ?? difficulty,
    });
  }

  console.log('[HP Generator] generateHPQuestionBank', {
    sectionCode: section,
    count: out.length,
    testVersion: args.testVersion,
    seed: seedStr,
  });

  return out;
}
