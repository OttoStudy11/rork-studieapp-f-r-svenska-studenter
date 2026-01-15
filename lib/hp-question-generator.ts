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
      return {
        text: `Låt x = ${x} och y = ${y}. Jämför A = x² och B = x·y.`,
        correct,
        explanation: `A = ${x}² = ${a} och B = ${x}·${y} = ${b}.`,
      };
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
      return {
        text: `En aritmetisk talföljd har första talet ${a0} och differensen ${d}. Jämför A = summan av de första ${n} talen och B = ${n}·(${a0 + d}).`,
        correct,
        explanation: `A = ${sum}. B = ${alt}.`,
      };
    },
  },
  {
    prompt: (rng) => {
      const p = rng.int(5, 35);
      const q = rng.int(5, 35);
      const A = p / 100;
      const B = q / 200;
      const correct: ComparisonChoice = A > B ? 'A' : A < B ? 'B' : 'C';
      return {
        text: `Jämför A = ${p}% och B = ${q}‰ (promille).`,
        correct,
        explanation: `A = ${p}/100 = ${A}. B = ${q}/1000 = ${q / 1000}.`,
      };
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
      const correct = diff >= 0 ? `${diff}` : `${diff}`;
      return {
        text: `Ett företag redovisar omsättning (i miljoner kr):\n${year1}: ${a}\n${year2}: ${b}\nHur stor är förändringen (i miljoner kr) från ${year1} till ${year2}?`,
        options: makeOptions(correct, [`${diff + 10}`, `${diff - 10}`, `${Math.abs(diff)}`], rng),
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
        explanation: `Medelvärdet är (${v1} + ${v2} + ${v3})/3 ≈ ${(v1 + v2 + v3) / 3}.`,
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
  const seedStr = `${args.seed ?? ''}|${section}|${args.testVersion ?? ''}|${count}|v1`;
  const rng = createRng(hashStringToUint32(seedStr));

  const out: HPQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const qn = i + 1;
    const difficulty = difficultyByIndex(i, count);
    const id = `gen-${section}-${hashStringToUint32(seedStr)}-${qn}`;

    if (section === 'ORD') {
      const base = rng.pick(ORD_PAIRS);
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
      const base = rng.pick(MEK_TEMPLATES);
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
      const p = rng.pick(LÄS_PASSAGES);
      const qa = rng.pick(p.qa);
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
        explanation: qa.difficulty ? qa.correct : `Svaret stöds av uppgifterna i texten.`,
        difficulty: qa.difficulty ?? difficulty,
        readingPassage: `${p.title}\n\n${p.passage}`,
      });
      continue;
    }

    if (section === 'KVA') {
      const rule = rng.pick(KVA_RULES);
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
      const rule = rng.pick(XYZ_RULES);
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

    const rule = rng.pick(DTK_RULES);
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
