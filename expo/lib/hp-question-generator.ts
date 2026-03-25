import { HPQuestion } from '@/constants/hogskoleprovet';

type HPSectionCode = 'ORD' | 'LÄS' | 'MEK' | 'ELF' | 'XYZ' | 'KVA' | 'NOG' | 'DTK';

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
  // --- EASY ---
  { word: 'genuin', correct: 'äkta', wrong: ['förfalskad', 'ytlig', 'tillgjord'], difficulty: 'easy' },
  { word: 'häpnadsväckande', correct: 'förvånande', wrong: ['tråkig', 'ordinär', 'vanlig'], difficulty: 'easy' },
  { word: 'ironisk', correct: 'sarkastisk', wrong: ['allvarlig', 'direkt', 'bokstavlig'], difficulty: 'easy' },
  { word: 'karismatisk', correct: 'utstrålande', wrong: ['blyg', 'tillbakadragen', 'anonym'], difficulty: 'easy' },
  { word: 'marginell', correct: 'obetydlig', wrong: ['väsentlig', 'avgörande', 'dominerande'], difficulty: 'easy' },
  { word: 'skeptisk', correct: 'tvivlande', wrong: ['lättrogen', 'naiv', 'godtrogen'], difficulty: 'easy' },
  { word: 'trivial', correct: 'banal', wrong: ['viktig', 'komplex', 'djupsinnig'], difficulty: 'easy' },
  { word: 'ymnig', correct: 'riklig', wrong: ['sparsam', 'knapp', 'mager'], difficulty: 'easy' },
  { word: 'benägen', correct: 'böjd för', wrong: ['motvillig', 'ovillig', 'tveksam'], difficulty: 'easy' },
  { word: 'hierarki', correct: 'rangordning', wrong: ['jämlikhet', 'kaos', 'slumpmässighet'], difficulty: 'easy' },
  { word: 'tendens', correct: 'riktning', wrong: ['stillastående', 'slump', 'avbrott'], difficulty: 'easy' },
  { word: 'pröva', correct: 'testa', wrong: ['avslå', 'förkasta', 'förneka'], difficulty: 'easy' },
  { word: 'resonemang', correct: 'tankegång', wrong: ['tystnad', 'bestraffning', 'dom'], difficulty: 'easy' },
  { word: 'förklara', correct: 'redogöra för', wrong: ['dölja', 'förtiga', 'förvränga'], difficulty: 'easy' },
  { word: 'spontan', correct: 'impulsiv', wrong: ['planerad', 'metodisk', 'tveksam'], difficulty: 'easy' },
  { word: 'kompetent', correct: 'kunnig', wrong: ['okunnig', 'ovan', 'oduglig'], difficulty: 'easy' },
  { word: 'drastisk', correct: 'genomgripande', wrong: ['försiktig', 'mild', 'obetydlig'], difficulty: 'easy' },
  { word: 'frekvent', correct: 'ofta förekommande', wrong: ['sällsynt', 'ovanlig', 'sporadisk'], difficulty: 'easy' },
  { word: 'generös', correct: 'givmild', wrong: ['snål', 'girig', 'återhållsam'], difficulty: 'easy' },
  { word: 'harmonisk', correct: 'välbalanserad', wrong: ['kaotisk', 'splittrad', 'dissonant'], difficulty: 'easy' },
  { word: 'intensiv', correct: 'kraftfull', wrong: ['svag', 'loj', 'ytlig'], difficulty: 'easy' },
  { word: 'jämlik', correct: 'likvärdig', wrong: ['ojämlik', 'diskriminerande', 'hierarkisk'], difficulty: 'easy' },
  { word: 'konkret', correct: 'påtaglig', wrong: ['abstrakt', 'vag', 'diffus'], difficulty: 'easy' },
  { word: 'lojal', correct: 'hängiven', wrong: ['sviklig', 'opålitlig', 'illojal'], difficulty: 'easy' },
  { word: 'modig', correct: 'tapper', wrong: ['feg', 'rädd', 'försiktig'], difficulty: 'easy' },
  { word: 'naturlig', correct: 'spontan', wrong: ['konstlad', 'tillgjord', 'artificiell'], difficulty: 'easy' },
  { word: 'objektiv', correct: 'saklig', wrong: ['subjektiv', 'partisk', 'vinklad'], difficulty: 'easy' },
  { word: 'passiv', correct: 'overksam', wrong: ['aktiv', 'driftig', 'energisk'], difficulty: 'easy' },
  { word: 'rationell', correct: 'förnuftig', wrong: ['irrationell', 'känslomässig', 'impulsiv'], difficulty: 'easy' },
  { word: 'selektiv', correct: 'urskiljande', wrong: ['slumpmässig', 'oreflekterad', 'inkluderande'], difficulty: 'easy' },
  { word: 'tolerant', correct: 'fördragsam', wrong: ['intolerant', 'trångsynt', 'fördomsfull'], difficulty: 'easy' },
  { word: 'unik', correct: 'enastående', wrong: ['vanlig', 'allmän', 'typisk'], difficulty: 'easy' },
  { word: 'vag', correct: 'otydlig', wrong: ['tydlig', 'precis', 'klar'], difficulty: 'easy' },
  { word: 'äkta', correct: 'genuint', wrong: ['falskt', 'fejkat', 'konstlat'], difficulty: 'easy' },
  { word: 'övertala', correct: 'övertala', wrong: ['tvinga', 'beordra', 'hindra'], difficulty: 'easy' },
  { word: 'ärlig', correct: 'uppriktig', wrong: ['bedräglig', 'hycklande', 'falsk'], difficulty: 'easy' },
  { word: 'tvetydig', correct: 'mångtydlig', wrong: ['entydig', 'klar', 'precis'], difficulty: 'easy' },
  { word: 'skicklig', correct: 'duktig', wrong: ['klumpig', 'oduglig', 'oskicklig'], difficulty: 'easy' },
  { word: 'riklig', correct: 'ymnig', wrong: ['knapp', 'sparsam', 'begränsad'], difficulty: 'easy' },
  { word: 'påtaglig', correct: 'tydlig', wrong: ['osynlig', 'vag', 'obetydlig'], difficulty: 'easy' },
  // --- MEDIUM ---
  { word: 'kontroversiell', correct: 'omstridd', wrong: ['självklar', 'obetydlig', 'ensidig'], difficulty: 'medium' },
  { word: 'implicit', correct: 'underförstådd', wrong: ['uttalad', 'tillfällig', 'exakt'], difficulty: 'medium' },
  { word: 'aversion', correct: 'motvilja', wrong: ['beundran', 'likgiltighet', 'glädje'], difficulty: 'medium' },
  { word: 'sanktionera', correct: 'godkänna', wrong: ['förbjuda', 'skuldbelägga', 'försvåra'], difficulty: 'medium' },
  { word: 'precisera', correct: 'förtydliga', wrong: ['förvanska', 'fördröja', 'förminska'], difficulty: 'medium' },
  { word: 'antagonist', correct: 'motståndare', wrong: ['allierad', 'åskådare', 'medlare'], difficulty: 'medium' },
  { word: 'pertinent', correct: 'relevant och träffande', wrong: ['irrelevant', 'förvirrande', 'motsägelsefull'], difficulty: 'medium' },
  { word: 'pragmatisk', correct: 'praktisk och realistisk', wrong: ['teoretisk', 'pessimistisk', 'idealistisk'], difficulty: 'medium' },
  { word: 'pedantisk', correct: 'överdrivet noggrann', wrong: ['vårdslös', 'vag', 'ytlig'], difficulty: 'medium' },
  { word: 'altruistisk', correct: 'osjälvisk', wrong: ['självisk', 'krävande', 'girig'], difficulty: 'medium' },
  { word: 'notorisk', correct: 'ökänd', wrong: ['berömd', 'anonym', 'okänd'], difficulty: 'medium' },
  { word: 'retorik', correct: 'talekonst', wrong: ['matematik', 'skrivkonst', 'lyssnarförmåga'], difficulty: 'medium' },
  { word: 'utopi', correct: 'idealsamhälle', wrong: ['dystopi', 'verklighet', 'kaos'], difficulty: 'medium' },
  { word: 'adept', correct: 'lärjunge', wrong: ['mästare', 'kritiker', 'åskådare'], difficulty: 'medium' },
  { word: 'dekadent', correct: 'förfallen', wrong: ['blomstrande', 'asketisk', 'sparsmakad'], difficulty: 'medium' },
  { word: 'eloquent', correct: 'vältalig', wrong: ['tyst', 'stammande', 'förvirrad'], difficulty: 'medium' },
  { word: 'fatalist', correct: 'ödesbestämd', wrong: ['optimist', 'aktivist', 'rebell'], difficulty: 'medium' },
  { word: 'insinuera', correct: 'antyda', wrong: ['berätta öppet', 'förneka', 'bekräfta'], difficulty: 'medium' },
  { word: 'latent', correct: 'dold', wrong: ['synlig', 'aktiv', 'uppenbar'], difficulty: 'medium' },
  { word: 'negligera', correct: 'försumma', wrong: ['prioritera', 'stödja', 'befrämja'], difficulty: 'medium' },
  { word: 'provisorisk', correct: 'tillfällig', wrong: ['permanent', 'definitiv', 'evig'], difficulty: 'medium' },
  { word: 'nyanserad', correct: 'mångsidig', wrong: ['enkelspårig', 'ytlig', 'godtycklig'], difficulty: 'medium' },
  { word: 'konsekvent', correct: 'sammanhängande', wrong: ['motsägelsefull', 'vacklande', 'tveksam'], difficulty: 'medium' },
  { word: 'oförutsedd', correct: 'oväntad', wrong: ['planerad', 'trivial', 'uppenbar'], difficulty: 'medium' },
  { word: 'dilemma', correct: 'svår valsituation', wrong: ['snabb lösning', 'enkel regel', 'hållpunkt'], difficulty: 'medium' },
  { word: 'approximation', correct: 'ungefärlig beräkning', wrong: ['exakt mätning', 'störning', 'påstående'], difficulty: 'medium' },
  { word: 'de facto', correct: 'i praktiken', wrong: ['i teorin', 'av misstag', 'i hemlighet'], difficulty: 'medium' },
  { word: 'konciliant', correct: 'försonlig', wrong: ['aggressiv', 'cynisk', 'enveten'], difficulty: 'medium' },
  { word: 'reserverad', correct: 'återhållsam', wrong: ['överdriven', 'högljudd', 'riskfylld'], difficulty: 'medium' },
  { word: 'vederhäftig', correct: 'trovärdig', wrong: ['tveksam', 'partisk', 'snabb'], difficulty: 'medium' },
  { word: 'avvika', correct: 'skilja sig', wrong: ['sammanfalla', 'överensstämma', 'bekräfta'], difficulty: 'medium' },
  { word: 'absurd', correct: 'orimlig', wrong: ['logisk', 'rimlig', 'förnuftig'], difficulty: 'medium' },
  { word: 'accelerera', correct: 'öka farten', wrong: ['bromsa', 'sakta ner', 'stanna'], difficulty: 'medium' },
  { word: 'ambition', correct: 'målmedvetenhet', wrong: ['lättja', 'nöjdhet', 'passivitet'], difficulty: 'medium' },
  { word: 'analysera', correct: 'granska noggrant', wrong: ['ignorera', 'gissa', 'undvika'], difficulty: 'medium' },
  { word: 'annektera', correct: 'ta över', wrong: ['överlämna', 'sälja', 'avhända'], difficulty: 'medium' },
  { word: 'briljant', correct: 'lysande', wrong: ['medelmåttig', 'svag', 'tråkig'], difficulty: 'medium' },
  { word: 'buffert', correct: 'skyddande mellanzon', wrong: ['direkt kontakt', 'barriär', 'förstärkning'], difficulty: 'medium' },
  { word: 'byråkratisk', correct: 'regelbetonad', wrong: ['flexibel', 'improviserad', 'spontan'], difficulty: 'medium' },
  { word: 'cynisk', correct: 'misstrogen och bitter', wrong: ['naiv', 'godtrogen', 'optimistisk'], difficulty: 'medium' },
  { word: 'debatt', correct: 'ordväxling', wrong: ['enighet', 'tystnad', 'monolog'], difficulty: 'medium' },
  { word: 'defekta', correct: 'bristfälliga', wrong: ['perfekta', 'felfria', 'optimala'], difficulty: 'medium' },
  { word: 'degradera', correct: 'sänka i rang', wrong: ['befordra', 'belöna', 'upphöja'], difficulty: 'medium' },
  { word: 'demokratisk', correct: 'folklig', wrong: ['diktatorisk', 'auktoritär', 'totalitär'], difficulty: 'medium' },
  { word: 'destruktiv', correct: 'nedbrytande', wrong: ['konstruktiv', 'uppbygglig', 'skapande'], difficulty: 'medium' },
  { word: 'diskret', correct: 'tillbakadragen', wrong: ['iögonfallande', 'påträngande', 'högljudd'], difficulty: 'medium' },
  { word: 'dominant', correct: 'dominerande', wrong: ['underordnad', 'undanskymd', 'svag'], difficulty: 'medium' },
  { word: 'drivkraft', correct: 'motivation', wrong: ['hinder', 'bromskloss', 'passivitet'], difficulty: 'medium' },
  { word: 'dynamisk', correct: 'rörlig och energisk', wrong: ['statisk', 'trög', 'stillastående'], difficulty: 'medium' },
  { word: 'effektiv', correct: 'verkningsfull', wrong: ['ineffektiv', 'verkningslös', 'slösaktig'], difficulty: 'medium' },
  { word: 'empatisk', correct: 'medkännande', wrong: ['kallsinnig', 'likgiltig', 'hård'], difficulty: 'medium' },
  { word: 'empirisk', correct: 'erfarenhetsbaserad', wrong: ['teoretisk', 'spekulativ', 'dogmatisk'], difficulty: 'medium' },
  { word: 'exklusiv', correct: 'förbehållen vissa', wrong: ['allmän', 'öppen', 'tillgänglig'], difficulty: 'medium' },
  { word: 'exploatera', correct: 'utnyttja', wrong: ['skydda', 'värna om', 'bevara'], difficulty: 'medium' },
  { word: 'fragmentera', correct: 'dela upp i bitar', wrong: ['förena', 'integrera', 'sammanfoga'], difficulty: 'medium' },
  { word: 'fruktbar', correct: 'givande', wrong: ['ofruktbar', 'steril', 'resultatlös'], difficulty: 'medium' },
  { word: 'funktionell', correct: 'ändamålsenlig', wrong: ['onödig', 'dekorativ', 'opraktisk'], difficulty: 'medium' },
  { word: 'gisslan', correct: 'pantsatt person', wrong: ['frivillig', 'förövare', 'vittne'], difficulty: 'medium' },
  { word: 'gradvis', correct: 'stegvis', wrong: ['plötslig', 'abrupt', 'direkt'], difficulty: 'medium' },
  { word: 'grundläggande', correct: 'fundamental', wrong: ['oviktig', 'periferisk', 'tillfällig'], difficulty: 'medium' },
  { word: 'hypotetisk', correct: 'antagandets karaktär', wrong: ['bevisad', 'faktabaserad', 'dokumenterad'], difficulty: 'medium' },
  { word: 'identifiera', correct: 'känna igen', wrong: ['förneka', 'förbise', 'ignorera'], difficulty: 'medium' },
  { word: 'ideologi', correct: 'tankesystem', wrong: ['spontanitet', 'kaos', 'slump'], difficulty: 'medium' },
  { word: 'ignorera', correct: 'bortse från', wrong: ['uppmärksamma', 'prioritera', 'fokusera på'], difficulty: 'medium' },
  { word: 'illusorisk', correct: 'inbillad', wrong: ['verklig', 'påtaglig', 'konkret'], difficulty: 'medium' },
  { word: 'ifrågasätta', correct: 'betvivla', wrong: ['acceptera', 'bekräfta', 'godkänna'], difficulty: 'medium' },
  { word: 'initiativ', correct: 'eget påbörjande', wrong: ['passivitet', 'tröghet', 'väntan'], difficulty: 'medium' },
  { word: 'integritet', correct: 'rättskaffenhet', wrong: ['oärlighet', 'korrumpering', 'svek'], difficulty: 'medium' },
  { word: 'isolera', correct: 'avskilja', wrong: ['integrera', 'förena', 'sammanlänka'], difficulty: 'medium' },
  { word: 'kaotisk', correct: 'oordnad', wrong: ['ordnad', 'strukturerad', 'systematisk'], difficulty: 'medium' },
  { word: 'kategorisera', correct: 'ordna i grupper', wrong: ['blanda ihop', 'ignorera', 'slumpmässigt arrangera'], difficulty: 'medium' },
  { word: 'kollektiv', correct: 'gemensam', wrong: ['individuell', 'privat', 'ensam'], difficulty: 'medium' },
  { word: 'komplicera', correct: 'försvåra', wrong: ['förenkla', 'klargöra', 'lösa'], difficulty: 'medium' },
  { word: 'konfiskera', correct: 'beslagta', wrong: ['återlämna', 'överlämna', 'skänka'], difficulty: 'medium' },
  { word: 'konservativ', correct: 'traditionsorienterad', wrong: ['radikal', 'progressiv', 'revolutionär'], difficulty: 'medium' },
  { word: 'konsultation', correct: 'rådgivningstillfälle', wrong: ['isolering', 'avvisning', 'monolog'], difficulty: 'medium' },
  { word: 'koordinera', correct: 'samordna', wrong: ['störa', 'splittra', 'motarbeta'], difficulty: 'medium' },
  { word: 'korrekt', correct: 'rätt', wrong: ['fel', 'missvisande', 'inexakt'], difficulty: 'medium' },
  { word: 'legitim', correct: 'laglig och berättigad', wrong: ['olaglig', 'ogiltig', 'illegitim'], difficulty: 'medium' },
  { word: 'liberalisera', correct: 'göra friare', wrong: ['inskränka', 'begränsa', 'reglera'], difficulty: 'medium' },
  { word: 'minimera', correct: 'minska till minsta möjliga', wrong: ['maximera', 'öka', 'förstora'], difficulty: 'medium' },
  { word: 'modifiera', correct: 'förändra', wrong: ['behålla', 'bevara', 'låsa fast'], difficulty: 'medium' },
  { word: 'motivera', correct: 'ge skäl för', wrong: ['motverka', 'avskräcka', 'förvirra'], difficulty: 'medium' },
  { word: 'neutral', correct: 'opartisk', wrong: ['partisk', 'vinklad', 'ensidig'], difficulty: 'medium' },
  { word: 'normalisera', correct: 'göra till norm', wrong: ['stigmatisera', 'fördöma', 'förbjuda'], difficulty: 'medium' },
  { word: 'opinionsmässig', correct: 'åsiktsdriven', wrong: ['faktabaserad', 'objektiv', 'neutral'], difficulty: 'medium' },
  { word: 'optimistisk', correct: 'hoppfull', wrong: ['pessimistisk', 'dyster', 'negativ'], difficulty: 'medium' },
  { word: 'paradoxal', correct: 'skenbart motsägelsefull', wrong: ['logisk', 'konsekvent', 'rättfram'], difficulty: 'medium' },
  { word: 'parallell', correct: 'liksidig', wrong: ['korsande', 'divergerande', 'motsatt'], difficulty: 'medium' },
  { word: 'polarisering', correct: 'uppdelning i motpoler', wrong: ['enighet', 'konsensus', 'sammanjämkning'], difficulty: 'medium' },
  { word: 'potentiell', correct: 'möjlig', wrong: ['omöjlig', 'utesluten', 'uteslutna'], difficulty: 'medium' },
  { word: 'principfast', correct: 'konsekvens i principer', wrong: ['oprincipiell', 'labil', 'godtycklig'], difficulty: 'medium' },
  { word: 'prioritera', correct: 'sätta främst', wrong: ['nedprioritera', 'skjuta upp', 'negligera'], difficulty: 'medium' },
  { word: 'proaktiv', correct: 'förebyggande', wrong: ['reaktiv', 'passiv', 'avvaktande'], difficulty: 'medium' },
  { word: 'progressiv', correct: 'framstegsinriktad', wrong: ['regressiv', 'bakåtsträvande', 'konservativ'], difficulty: 'medium' },
  { word: 'proportionerlig', correct: 'i rätt förhållande', wrong: ['oproportionerlig', 'överdriven', 'obefogad'], difficulty: 'medium' },
  { word: 'provocera', correct: 'reta upp', wrong: ['lugna', 'blidka', 'stilla'], difficulty: 'medium' },
  { word: 'referera', correct: 'hänvisa till', wrong: ['ignorera', 'bortse från', 'avfärda'], difficulty: 'medium' },
  { word: 'reformera', correct: 'förbättra', wrong: ['försämra', 'rasera', 'konservera'], difficulty: 'medium' },
  { word: 'relevant', correct: 'viktig i sammanhanget', wrong: ['irrelevant', 'oviktig', 'periferisk'], difficulty: 'medium' },
  { word: 'reproducera', correct: 'återskapa', wrong: ['förstöra', 'avlägsna', 'utplåna'], difficulty: 'medium' },
  { word: 'respektera', correct: 'visa aktning för', wrong: ['förakta', 'förnedra', 'nedvärdera'], difficulty: 'medium' },
  { word: 'resultera', correct: 'leda till', wrong: ['motverka', 'förhindra', 'avbryta'], difficulty: 'medium' },
  { word: 'rättfärdiga', correct: 'berättiga', wrong: ['fördöma', 'klandra', 'misskreditera'], difficulty: 'medium' },
  { word: 'schematisk', correct: 'förenklad och strukturerad', wrong: ['detaljrik', 'komplex', 'nyanserad'], difficulty: 'medium' },
  { word: 'simultan', correct: 'samtidig', wrong: ['efterföljande', 'fördröjd', 'successiv'], difficulty: 'medium' },
  { word: 'spekulera', correct: 'gissa', wrong: ['veta', 'fastslå', 'bevisa'], difficulty: 'medium' },
  { word: 'stabilisera', correct: 'göra fast', wrong: ['destabilisera', 'rubba', 'underminera'], difficulty: 'medium' },
  { word: 'stereotyp', correct: 'förenklad bild', wrong: ['nyanserad bild', 'mångfacetterad bild', 'komplex bild'], difficulty: 'medium' },
  { word: 'stimulera', correct: 'väcka intresse', wrong: ['dämpa', 'kväva', 'undertrycka'], difficulty: 'medium' },
  { word: 'subjektiv', correct: 'personlig och färgad', wrong: ['objektiv', 'opartisk', 'saklig'], difficulty: 'medium' },
  { word: 'successiv', correct: 'gradvis', wrong: ['plötslig', 'abrupt', 'omedelbar'], difficulty: 'medium' },
  { word: 'symbolisera', correct: 'stå som tecken för', wrong: ['förneka', 'dölja', 'undanröja'], difficulty: 'medium' },
  { word: 'systematisk', correct: 'metodisk', wrong: ['slumpmässig', 'kaotisk', 'oplanerad'], difficulty: 'medium' },
  { word: 'taktisk', correct: 'strategiskt klok', wrong: ['tanklös', 'impulsiv', 'oplanerad'], difficulty: 'medium' },
  { word: 'transparent', correct: 'öppen och genomskinlig', wrong: ['dold', 'hemlig', 'ogenomskinlig'], difficulty: 'medium' },
  { word: 'underskatta', correct: 'värdera för lågt', wrong: ['överskatta', 'värdera för högt', 'upphöja'], difficulty: 'medium' },
  { word: 'uppfatta', correct: 'förnimma', wrong: ['missa', 'förbise', 'ignorera'], difficulty: 'medium' },
  { word: 'uppskatta', correct: 'värdesätta', wrong: ['ringakta', 'förakta', 'nedvärdera'], difficulty: 'medium' },
  { word: 'variabel', correct: 'föränderlig storhet', wrong: ['konstant', 'fast', 'oföränderlig'], difficulty: 'medium' },
  { word: 'verifierbar', correct: 'kontrollerbar', wrong: ['oprovbar', 'osmakbar', 'opåvisbar'], difficulty: 'medium' },
  { word: 'visionär', correct: 'framsynt', wrong: ['kortsiktig', 'bakåtblickande', 'oinitierad'], difficulty: 'medium' },
  { word: 'ytlig', correct: 'ytterlig', wrong: ['djupgående', 'genomgripande', 'grundlig'], difficulty: 'medium' },
  // --- HARD ---
  { word: 'kongruent', correct: 'överensstämmande', wrong: ['avvikande', 'parallell', 'omvänd'], difficulty: 'hard' },
  { word: 'redundant', correct: 'överflödig', wrong: ['nödvändig', 'komplex', 'enkel'], difficulty: 'hard' },
  { word: 'efemär', correct: 'kortvarig', wrong: ['evig', 'stark', 'vacker'], difficulty: 'hard' },
  { word: 'apatisk', correct: 'känslomässigt oberörd', wrong: ['känslig', 'engagerad', 'passionerad'], difficulty: 'hard' },
  { word: 'ambivalent', correct: 'kluven', wrong: ['säker', 'bestämd', 'entusiastisk'], difficulty: 'hard' },
  { word: 'subtil', correct: 'förfinad och svårupptäckt', wrong: ['uppenbar', 'grov', 'tydlig'], difficulty: 'hard' },
  { word: 'dogmatisk', correct: 'stel i sina åsikter', wrong: ['flexibel', 'öppen', 'nyfiken'], difficulty: 'hard' },
  { word: 'eufemism', correct: 'förskönande omskrivning', wrong: ['skällsord', 'överdrift', 'liknelse'], difficulty: 'hard' },
  { word: 'eklektisk', correct: 'sammansatt av olika stilar', wrong: ['enhetlig', 'minimalistisk', 'traditionell'], difficulty: 'hard' },
  { word: 'frivolitet', correct: 'lättsinne', wrong: ['allvar', 'styrka', 'disciplin'], difficulty: 'hard' },
  { word: 'paradox', correct: 'skenbar motsägelse', wrong: ['logisk följd', 'enkel lösning', 'uppenbar sanning'], difficulty: 'hard' },
  { word: 'kvintessens', correct: 'det mest typiska', wrong: ['undantag', 'avvikelse', 'randföreteelse'], difficulty: 'hard' },
  { word: 'volatil', correct: 'ombytlig', wrong: ['stabil', 'förutsägbar', 'konstant'], difficulty: 'hard' },
  { word: 'xenofobi', correct: 'rädsla för främlingar', wrong: ['öppenhet', 'nyfikenhet', 'tolerans'], difficulty: 'hard' },
  { word: 'zealot', correct: 'fanatiker', wrong: ['moderat', 'skeptiker', 'pragmatiker'], difficulty: 'hard' },
  { word: 'cessera', correct: 'upphöra', wrong: ['fortsätta', 'accelerera', 'börja'], difficulty: 'hard' },
  { word: 'garant', correct: 'borgensman', wrong: ['gäldenär', 'fiende', 'åskådare'], difficulty: 'hard' },
  { word: 'koherent', correct: 'sammanhängande', wrong: ['splittrad', 'oorganiserad', 'kaotisk'], difficulty: 'hard' },
  { word: 'meritokrati', correct: 'styrning baserad på kompetens', wrong: ['arvsrätt', 'slumpmässigt urval', 'demokrati'], difficulty: 'hard' },
  { word: 'obsolet', correct: 'föråldrad', wrong: ['modern', 'populär', 'aktuell'], difficulty: 'hard' },
  { word: 'plausibel', correct: 'trolig', wrong: ['omöjlig', 'absurd', 'otänkbar'], difficulty: 'hard' },
  { word: 'restitution', correct: 'återställande', wrong: ['förstörelse', 'försämring', 'förfall'], difficulty: 'hard' },
  { word: 'stringent', correct: 'strikt', wrong: ['slapp', 'flexibel', 'vårdslös'], difficulty: 'hard' },
  { word: 'förlegad', correct: 'omodern', wrong: ['innovativ', 'tidsenlig', 'framtung'], difficulty: 'hard' },
  { word: 'försumlig', correct: 'slarvig', wrong: ['noggrann', 'uthållig', 'hänsynsfull'], difficulty: 'hard' },
  { word: 'omfattande', correct: 'vidsträckt', wrong: ['begränsad', 'tillfällig', 'spontan'], difficulty: 'hard' },
  { word: 'abdikera', correct: 'avsäga sig tronen', wrong: ['tillträda', 'krönas', 'väljas'], difficulty: 'hard' },
  { word: 'aberration', correct: 'avvikelse från det normala', wrong: ['norm', 'standard', 'regel'], difficulty: 'hard' },
  { word: 'abstrahera', correct: 'göra abstrakt', wrong: ['konkretisera', 'specificera', 'exemplifiera'], difficulty: 'hard' },
  { word: 'accentuera', correct: 'framhäva', wrong: ['dölja', 'tona ner', 'undandröja'], difficulty: 'hard' },
  { word: 'accession', correct: 'tillträde', wrong: ['avgång', 'avsättning', 'avgångsvederlag'], difficulty: 'hard' },
  { word: 'affinitet', correct: 'dragningskraft', wrong: ['motvilja', 'likgiltighet', 'avståndstagande'], difficulty: 'hard' },
  { word: 'aforism', correct: 'kort levnadsvisdom', wrong: ['lång roman', 'episk dikt', 'avhandling'], difficulty: 'hard' },
  { word: 'agnostisk', correct: 'tveksam om guds existens', wrong: ['ateistisk', 'troende', 'fanatisk'], difficulty: 'hard' },
  { word: 'allegori', correct: 'bildlig framställning', wrong: ['direkt berättelse', 'faktatext', 'rapport'], difficulty: 'hard' },
  { word: 'ambiguitet', correct: 'flertydighet', wrong: ['entydighet', 'klarhet', 'precision'], difficulty: 'hard' },
  { word: 'ameliorera', correct: 'förbättra', wrong: ['försämra', 'förfalla', 'degradera'], difficulty: 'hard' },
  { word: 'anachronism', correct: 'tidsmässig felplacering', wrong: ['tidsenlig detalj', 'historisk trovärdighet', 'korrekt datering'], difficulty: 'hard' },
  { word: 'anekdot', correct: 'kort berättelse', wrong: ['lång roman', 'vetenskaplig studie', 'formell rapport'], difficulty: 'hard' },
  { word: 'antagonism', correct: 'motstånd', wrong: ['samarbete', 'harmoni', 'enighet'], difficulty: 'hard' },
  { word: 'apologi', correct: 'försvar av en ståndpunkt', wrong: ['attack', 'kritik', 'förkastelsedom'], difficulty: 'hard' },
  { word: 'apostrof', correct: 'direkt tilltal', wrong: ['tredjepersonsbeskrivning', 'passiv berättelse', 'indirekt tal'], difficulty: 'hard' },
  { word: 'arbiträr', correct: 'godtycklig', wrong: ['välmotiverad', 'systematisk', 'principbaserad'], difficulty: 'hard' },
  { word: 'arkaisk', correct: 'ålderdomlig', wrong: ['modern', 'nutida', 'aktuell'], difficulty: 'hard' },
  { word: 'artificiell', correct: 'konstgjord', wrong: ['naturlig', 'äkta', 'organisk'], difficulty: 'hard' },
  { word: 'asketisk', correct: 'självförnekande', wrong: ['njutningslysten', 'utsvävande', 'hedonistisk'], difficulty: 'hard' },
  { word: 'assertion', correct: 'påstående', wrong: ['fråga', 'tvivel', 'förnekelse'], difficulty: 'hard' },
  { word: 'asymmetri', correct: 'brist på symmetri', wrong: ['symmetri', 'balans', 'jämvikt'], difficulty: 'hard' },
  { word: 'atrofiera', correct: 'förtvina', wrong: ['växa', 'blomstra', 'stärkas'], difficulty: 'hard' },
  { word: 'attribuera', correct: 'tillskriva', wrong: ['förneka', 'avfärda', 'bortse ifrån'], difficulty: 'hard' },
  { word: 'autentisk', correct: 'äkta', wrong: ['förfalskad', 'kopierad', 'imiterad'], difficulty: 'hard' },
  { word: 'autonomi', correct: 'självstyre', wrong: ['beroende', 'underkastelse', 'kontroll'], difficulty: 'hard' },
  { word: 'axiom', correct: 'självklar sanning', wrong: ['tveksam hypotes', 'dementerad teori', 'obevisad gissning'], difficulty: 'hard' },
  { word: 'bifurkation', correct: 'delning i två grenar', wrong: ['sammanslagning', 'integration', 'fusion'], difficulty: 'hard' },
  { word: 'bombastisk', correct: 'överdrivet svulstigt', wrong: ['enkel', 'anspråkslös', 'kortfattad'], difficulty: 'hard' },
  { word: 'kapitulera', correct: 'ge upp', wrong: ['fortsätta kämpa', 'segra', 'triumfera'], difficulty: 'hard' },
  { word: 'karikatyr', correct: 'överdriven bild', wrong: ['realistisk bild', 'exakt avbildning', 'fotorealistisk teckning'], difficulty: 'hard' },
  { word: 'kausalitet', correct: 'orsakssamband', wrong: ['slump', 'korrelation', 'sammanträffande'], difficulty: 'hard' },
  { word: 'klandra', correct: 'klaga på', wrong: ['berömma', 'hylla', 'uppmuntra'], difficulty: 'hard' },
  { word: 'kognitiv', correct: 'tankemässig', wrong: ['fysisk', 'emotionell', 'social'], difficulty: 'hard' },
  { word: 'kompensera', correct: 'ersätta', wrong: ['förvärra', 'förstärka bristen', 'förlänga'], difficulty: 'hard' },
  { word: 'konnotation', correct: 'bibetydelse', wrong: ['bokstavlig betydelse', 'ordets ursprung', 'direkt översättning'], difficulty: 'hard' },
  { word: 'konsolidera', correct: 'befästa', wrong: ['underminera', 'försvaga', 'lösa upp'], difficulty: 'hard' },
  { word: 'kontrafaktisk', correct: 'mot verkligheten', wrong: ['faktabaserad', 'empirisk', 'verklighetstrogen'], difficulty: 'hard' },
  { word: 'konvergens', correct: 'sammanstråling', wrong: ['divergens', 'spridning', 'separation'], difficulty: 'hard' },
  { word: 'korrelation', correct: 'samband', wrong: ['orsak', 'slump', 'oberoende'], difficulty: 'hard' },
  { word: 'kumulativ', correct: 'ackumulerande', wrong: ['minskande', 'urladdande', 'avtagande'], difficulty: 'hard' },
  { word: 'lakonisk', correct: 'kortfattad', wrong: ['ordrik', 'vidlyftig', 'pratsam'], difficulty: 'hard' },
  { word: 'legitimera', correct: 'ge legitimitet åt', wrong: ['delegitimera', 'förkasta', 'underminera'], difficulty: 'hard' },
  { word: 'linjär', correct: 'rätlinig', wrong: ['krökt', 'icke-linjär', 'cirkulär'], difficulty: 'hard' },
  { word: 'makaber', correct: 'skrämmande och dödsrelaterad', wrong: ['rolig', 'harmlös', 'oskyldig'], difficulty: 'hard' },
  { word: 'manifestera', correct: 'visa tydligt', wrong: ['dölja', 'förtiga', 'undertrycka'], difficulty: 'hard' },
  { word: 'marginalisera', correct: 'utestänga', wrong: ['inkludera', 'välkomna', 'integrera'], difficulty: 'hard' },
  { word: 'metafor', correct: 'bildlig jämförelse', wrong: ['bokstavlig beskrivning', 'faktauppgift', 'direkt jämförelse'], difficulty: 'hard' },
  { word: 'metonym', correct: 'del som betecknar helhet', wrong: ['helhet som betecknar del', 'direkt namngivning', 'bokstavlig beskrivning'], difficulty: 'hard' },
  { word: 'mitigera', correct: 'mildra', wrong: ['förvärra', 'skärpa', 'intensifiera'], difficulty: 'hard' },
  { word: 'monolitisk', correct: 'enhetlig och odelbar', wrong: ['splittrad', 'mångfacetterad', 'heterogen'], difficulty: 'hard' },
  { word: 'moralisk', correct: 'sedlig', wrong: ['omoralisk', 'hänsynslös', 'korrupt'], difficulty: 'hard' },
  { word: 'mytologisera', correct: 'förvandla till myt', wrong: ['avmytologisera', 'demystifiera', 'rationalisera'], difficulty: 'hard' },
  { word: 'negera', correct: 'förneka', wrong: ['bekräfta', 'intyga', 'verifiera'], difficulty: 'hard' },
  { word: 'nihilism', correct: 'förnekelse av värden', wrong: ['värdebaserat tänkande', 'moralfilosofi', 'optimism'], difficulty: 'hard' },
  { word: 'nomenklaturen', correct: 'benämningssystemet', wrong: ['kaosstruktur', 'slumpsystem', 'onamngivet'], difficulty: 'hard' },
  { word: 'normativ', correct: 'föreskrivande', wrong: ['beskrivande', 'neutral', 'objektiv'], difficulty: 'hard' },
  { word: 'obskyr', correct: 'oklar och dold', wrong: ['klar', 'tydlig', 'genomskinlig'], difficulty: 'hard' },
  { word: 'ontologi', correct: 'läran om det varande', wrong: ['kunskapsteori', 'etik', 'estetik'], difficulty: 'hard' },
  { word: 'oxymoron', correct: 'motsägelsefull sammanställning', wrong: ['logisk följd', 'synonym', 'tautologi'], difficulty: 'hard' },
  { word: 'paradigm', correct: 'grundläggande mönster', wrong: ['undantag', 'anomali', 'avvikelse'], difficulty: 'hard' },
  { word: 'parafrasera', correct: 'omformulera', wrong: ['citera ordagrant', 'plagiera', 'undvika'], difficulty: 'hard' },
  { word: 'perifer', correct: 'vid sidan av centrum', wrong: ['central', 'avgörande', 'kärn-'], difficulty: 'hard' },
  { word: 'periferi', correct: 'utkant', wrong: ['centrum', 'kärna', 'mittpunkt'], difficulty: 'hard' },
  { word: 'polaritet', correct: 'motsatsförhållande', wrong: ['likhet', 'samstämmighet', 'enhet'], difficulty: 'hard' },
  { word: 'postulera', correct: 'förutsätta som sant', wrong: ['bevisa', 'dementera', 'förkasta'], difficulty: 'hard' },
  { word: 'prerogativ', correct: 'förmånsrätt', wrong: ['skyldighet', 'begränsning', 'förbud'], difficulty: 'hard' },
  { word: 'prokrastinera', correct: 'skjuta upp', wrong: ['slutföra', 'prioritera', 'påskynda'], difficulty: 'hard' },
  { word: 'proliferera', correct: 'öka snabbt', wrong: ['minska', 'stagnera', 'avta'], difficulty: 'hard' },
  { word: 'propensitet', correct: 'benägenhet', wrong: ['ovilja', 'motsträvighet', 'motvilja'], difficulty: 'hard' },
  { word: 'rationalisera', correct: 'rättfärdiga med förnuft', wrong: ['irrationellt bortförklara', 'acceptera utan motivering', 'ge upp'], difficulty: 'hard' },
  { word: 'reciprok', correct: 'ömsesidig', wrong: ['ensidig', 'envägs', 'asymmetrisk'], difficulty: 'hard' },
  { word: 'rekvisit', correct: 'nödvändig sak', wrong: ['onödig prydnad', 'frivillig tillbehör', 'lyx'], difficulty: 'hard' },
  { word: 'relativism', correct: 'åsikter är kontextberoende', wrong: ['universalism', 'absolutism', 'objektivism'], difficulty: 'hard' },
  { word: 'relätera', correct: 'återge', wrong: ['dölja', 'förvränga', 'förtiga'], difficulty: 'hard' },
  { word: 'remiss', correct: 'hänvisning', wrong: ['avslutning', 'avslag', 'dom'], difficulty: 'hard' },
  { word: 'renodla', correct: 'rensa och förfina', wrong: ['blanda', 'förorena', 'kompromissa'], difficulty: 'hard' },
  { word: 'regressiv', correct: 'bakåtgående', wrong: ['progressiv', 'framåtskridande', 'innovativ'], difficulty: 'hard' },
  { word: 'resoluthet', correct: 'bestämdhet', wrong: ['tveksamhet', 'vacklan', 'osäkerhet'], difficulty: 'hard' },
  { word: 'retfärdiga', correct: 'motivera', wrong: ['fördöma', 'förkasta', 'bestraffa'], difficulty: 'hard' },
  { word: 'sediment', correct: 'avsatta lager', wrong: ['erosion', 'vittring', 'upplösning'], difficulty: 'hard' },
  { word: 'segregering', correct: 'åtskillnad', wrong: ['integration', 'sammanslagning', 'inkludering'], difficulty: 'hard' },
  { word: 'sekularism', correct: 'religionsfri samhällssyn', wrong: ['teokrati', 'religiös statsstyrning', 'klerikalism'], difficulty: 'hard' },
  { word: 'sekulär', correct: 'världslig', wrong: ['andlig', 'religiös', 'sakral'], difficulty: 'hard' },
  { word: 'semantisk', correct: 'betydelsemässig', wrong: ['syntaktisk', 'fonetisk', 'morfologisk'], difficulty: 'hard' },
  { word: 'sinekur', correct: 'lättjefullt ämbete', wrong: ['ansträngande tjänst', 'tung post', 'krävande uppdrag'], difficulty: 'hard' },
  { word: 'skepticism', correct: 'tvivlande hållning', wrong: ['okritisk tro', 'dogmatism', 'fanatism'], difficulty: 'hard' },
  { word: 'sofistikerad', correct: 'förfinad', wrong: ['primitiv', 'enkel', 'naiv'], difficulty: 'hard' },
  { word: 'solipsism', correct: 'uppfattning att bara jaget finns', wrong: ['altruism', 'kollektivism', 'universalism'], difficulty: 'hard' },
  { word: 'speciös', correct: 'skenbart rimlig men falsk', wrong: ['äkta', 'genuin', 'trovärdig'], difficulty: 'hard' },
  { word: 'stagnation', correct: 'stillastående', wrong: ['tillväxt', 'framsteg', 'utveckling'], difficulty: 'hard' },
  { word: 'stokastisk', correct: 'slumpmässig', wrong: ['deterministisk', 'förutsägbar', 'systematisk'], difficulty: 'hard' },
  { word: 'suveränitet', correct: 'oberoende', wrong: ['beroende', 'underkastelse', 'vassalskap'], difficulty: 'hard' },
  { word: 'svepande', correct: 'oprecis och generaliserande', wrong: ['precis', 'specifik', 'detaljerad'], difficulty: 'hard' },
  { word: 'synkronisera', correct: 'samordna i tid', wrong: ['fördröja', 'desynchronisera', 'rubba'], difficulty: 'hard' },
  { word: 'syntes', correct: 'sammanslagning', wrong: ['analys', 'uppdelning', 'separation'], difficulty: 'hard' },
  { word: 'tautologi', correct: 'onödig upprepning', wrong: ['kort sats', 'metafor', 'antonym'], difficulty: 'hard' },
  { word: 'tentativ', correct: 'preliminär', wrong: ['definitiv', 'fastlagd', 'oföränderlig'], difficulty: 'hard' },
  { word: 'totalitär', correct: 'allomfattande styrning', wrong: ['demokratisk', 'liberal', 'pluralistisk'], difficulty: 'hard' },
  { word: 'transcendera', correct: 'överstiga', wrong: ['underordna', 'begränsa', 'inskränka'], difficulty: 'hard' },
  { word: 'tvetydighet', correct: 'mångtydlighet', wrong: ['klarhet', 'entydighet', 'precision'], difficulty: 'hard' },
  { word: 'ubikitet', correct: 'allestädesnärvaro', wrong: ['osynlighet', 'isolering', 'frånvaro'], difficulty: 'hard' },
  { word: 'ultimatum', correct: 'sista krav', wrong: ['inledande erbjudande', 'frivillig förfrågan', 'öppen dialog'], difficulty: 'hard' },
  { word: 'unik', correct: 'ensam i sitt slag', wrong: ['vanlig', 'alltför vanlig', 'generisk'], difficulty: 'hard' },
  { word: 'urbanisering', correct: 'stadsutbyggnad', wrong: ['avfolkning', 'landsbygdsutveckling', 'rural expansion'], difficulty: 'hard' },
  { word: 'utopisk', correct: 'orealistiskt idealiserande', wrong: ['realistisk', 'pragmatisk', 'nykter'], difficulty: 'hard' },
  { word: 'vehement', correct: 'intensiv och häftig', wrong: ['avslagen', 'likgiltig', 'mild'], difficulty: 'hard' },
  { word: 'vördnad', correct: 'djup respekt', wrong: ['förakt', 'likgiltighet', 'nonchalans'], difficulty: 'hard' },
  { word: 'överväldigande', correct: 'enorm', wrong: ['obetydlig', 'liten', 'marginell'], difficulty: 'hard' },
  // --- EASY BATCH 2 ---
  { word: 'envis', correct: 'ihärdig', wrong: ['eftergiven', 'lättövertygad', 'mjuk'], difficulty: 'easy' },
  { word: 'välvillig', correct: 'välmenande', wrong: ['illvillig', 'fientlig', 'elak'], difficulty: 'easy' },
  { word: 'ivrig', correct: 'entusiastisk', wrong: ['likgiltig', 'slö', 'passiv'], difficulty: 'easy' },
  { word: 'noggrann', correct: 'omsorgsfullt exakt', wrong: ['slarvig', 'ovarsam', 'hastig'], difficulty: 'easy' },
  { word: 'tålmodig', correct: 'uthållig', wrong: ['otålig', 'rastlös', 'stressad'], difficulty: 'easy' },
  { word: 'orubblig', correct: 'fast och bestämd', wrong: ['vacklande', 'obeslutsam', 'labil'], difficulty: 'easy' },
  { word: 'smidig', correct: 'rörlig och flexibel', wrong: ['stel', 'klumpig', 'rigid'], difficulty: 'easy' },
  { word: 'frispråkig', correct: 'öppen och ärlig', wrong: ['fåordig', 'hemlighetsfull', 'förtegen'], difficulty: 'easy' },
  { word: 'godmodig', correct: 'vänlig och snäll', wrong: ['elaksinnad', 'bitter', 'grym'], difficulty: 'easy' },
  { word: 'häftig', correct: 'våldsam och intensiv', wrong: ['lugn', 'mild', 'dämpad'], difficulty: 'easy' },
  { word: 'kortfattad', correct: 'koncis', wrong: ['vidlyftig', 'omständlig', 'långrandig'], difficulty: 'easy' },
  { word: 'listig', correct: 'slug', wrong: ['enfaldig', 'naiv', 'troskyldig'], difficulty: 'easy' },
  { word: 'medveten', correct: 'avsiktlig', wrong: ['oavsiktlig', 'omedveten', 'slumpmässig'], difficulty: 'easy' },
  { word: 'munter', correct: 'glad och livlig', wrong: ['dyster', 'nedstämd', 'melankolisk'], difficulty: 'easy' },
  { word: 'nyfiken', correct: 'vetgirig', wrong: ['ointresserad', 'likgiltig', 'apatisk'], difficulty: 'easy' },
  { word: 'pålitlig', correct: 'tillförlitlig', wrong: ['opålitlig', 'oberäknelig', 'tveksam'], difficulty: 'easy' },
  { word: 'rörig', correct: 'ostrukturerad', wrong: ['ordnad', 'strukturerad', 'metodisk'], difficulty: 'easy' },
  { word: 'självständig', correct: 'oberoende', wrong: ['beroende', 'underordnad', 'styrd'], difficulty: 'easy' },
  { word: 'sömlös', correct: 'utan avbrott', wrong: ['hackig', 'ojämn', 'avbruten'], difficulty: 'easy' },
  { word: 'trovärdig', correct: 'tillförlitlig', wrong: ['lögnaktig', 'osäker', 'opålitlig'], difficulty: 'easy' },
  { word: 'uppriktig', correct: 'ärlig', wrong: ['hycklande', 'bedräglig', 'falsk'], difficulty: 'easy' },
  { word: 'varsam', correct: 'försiktig', wrong: ['hänsynslös', 'oförsiktig', 'tanklös'], difficulty: 'easy' },
  { word: 'välorganiserad', correct: 'välordnad', wrong: ['rörig', 'kaotisk', 'oplanerad'], difficulty: 'easy' },
  { word: 'ömsint', correct: 'kärleksfull och ömtålig', wrong: ['hård', 'kall', 'likgiltig'], difficulty: 'easy' },
  { word: 'bestämd', correct: 'resolut', wrong: ['tveksam', 'obeslutsam', 'vag'], difficulty: 'easy' },
  { word: 'djärv', correct: 'modig och vågad', wrong: ['feg', 'försiktig', 'rädd'], difficulty: 'easy' },
  { word: 'ensidig', correct: 'partisk', wrong: ['allsidig', 'balanserad', 'nyanserad'], difficulty: 'easy' },
  { word: 'flyktig', correct: 'kortvarig', wrong: ['bestående', 'varaktig', 'evig'], difficulty: 'easy' },
  { word: 'grundlig', correct: 'genomgående', wrong: ['ytlig', 'summarisk', 'hastig'], difficulty: 'easy' },
  { word: 'hänsynsfull', correct: 'omtänksam', wrong: ['hänsynslös', 'självisk', 'oempatisk'], difficulty: 'easy' },
  { word: 'inkonsekvent', correct: 'motsägelsefull', wrong: ['konsekvent', 'enhetlig', 'sammanhängande'], difficulty: 'easy' },
  { word: 'jordnära', correct: 'praktisk och realistisk', wrong: ['drömsk', 'opraktisk', 'orealistisk'], difficulty: 'easy' },
  { word: 'klar', correct: 'tydlig', wrong: ['oklar', 'vag', 'diffus'], difficulty: 'easy' },
  { word: 'långsiktig', correct: 'framtidsinriktad', wrong: ['kortsiktig', 'impulsiv', 'oplanerande'], difficulty: 'easy' },
  { word: 'missvisande', correct: 'felaktig och vilseledande', wrong: ['korrekt', 'precis', 'exakt'], difficulty: 'easy' },
  { word: 'orättvis', correct: 'ojämlik', wrong: ['rättvis', 'jämlik', 'opartisk'], difficulty: 'easy' },
  { word: 'präglad', correct: 'formad', wrong: ['opåverkad', 'oförändrad', 'neutral'], difficulty: 'easy' },
  { word: 'sammanhållen', correct: 'enhetlig', wrong: ['splittrad', 'uppdelad', 'fragmenterad'], difficulty: 'easy' },
  { word: 'trångsynt', correct: 'fördomsfull', wrong: ['vidsynt', 'tolerant', 'öppensinnad'], difficulty: 'easy' },
  { word: 'underordnad', correct: 'lägre rankad', wrong: ['överordnad', 'ledande', 'dominerande'], difficulty: 'easy' },
  // --- MEDIUM BATCH 2 ---
  { word: 'konsensus', correct: 'allmän enighet', wrong: ['oenighet', 'konflikt', 'dispyt'], difficulty: 'medium' },
  { word: 'divergera', correct: 'avvika från varandra', wrong: ['konvergera', 'samstämma', 'mötas'], difficulty: 'medium' },
  { word: 'inflytande', correct: 'påverkan', wrong: ['brist på makt', 'passivitet', 'likgiltighet'], difficulty: 'medium' },
  { word: 'genomgripande', correct: 'djupgående och kraftfull', wrong: ['ytlig', 'obetydlig', 'försiktig'], difficulty: 'medium' },
  { word: 'marginell', correct: 'obetydlig', wrong: ['central', 'avgörande', 'dominerande'], difficulty: 'medium' },
  { word: 'obefogad', correct: 'omotiverad', wrong: ['berättigad', 'välgrundad', 'rimlig'], difficulty: 'medium' },
  { word: 'reciprocitet', correct: 'ömsesidighet', wrong: ['ensidighet', 'asymmetri', 'orättvisa'], difficulty: 'medium' },
  { word: 'sårbar', correct: 'känslig och utsatt', wrong: ['motståndskraftig', 'robust', 'skyddad'], difficulty: 'medium' },
  { word: 'utpräglad', correct: 'starkt markerad', wrong: ['svag', 'otydlig', 'dämpad'], difficulty: 'medium' },
  { word: 'väsentlig', correct: 'viktig och central', wrong: ['oviktig', 'perifer', 'obetydlig'], difficulty: 'medium' },
  { word: 'ändamålsenlig', correct: 'passande för syftet', wrong: ['onödig', 'opraktisk', 'meningslös'], difficulty: 'medium' },
  { word: 'övertygande', correct: 'trovärdig', wrong: ['svag', 'omotiverad', 'overtygandesvag'], difficulty: 'medium' },
  { word: 'bekräfta', correct: 'intyga', wrong: ['förneka', 'dementera', 'betvivla'], difficulty: 'medium' },
  { word: 'betona', correct: 'framhäva', wrong: ['förbise', 'nedtona', 'ignorera'], difficulty: 'medium' },
  { word: 'differentiera', correct: 'skilja ut', wrong: ['likställa', 'blanda ihop', 'sammanföra'], difficulty: 'medium' },
  { word: 'entusiasm', correct: 'hänförelse', wrong: ['likgiltighet', 'tristess', 'apati'], difficulty: 'medium' },
  { word: 'förenlig', correct: 'passar ihop', wrong: ['oförenlig', 'motstridig', 'oförenbar'], difficulty: 'medium' },
  { word: 'genomförbar', correct: 'möjlig att utföra', wrong: ['ogenomförbar', 'omöjlig', 'otänkbar'], difficulty: 'medium' },
  { word: 'grundad', correct: 'välmotiverad', wrong: ['ogrundad', 'godtycklig', 'lösryckt'], difficulty: 'medium' },
  { word: 'heltäckande', correct: 'omfattande', wrong: ['begränsad', 'ofullständig', 'partiell'], difficulty: 'medium' },
  { word: 'implicera', correct: 'antyda', wrong: ['utesluta', 'förneka', 'motbevisa'], difficulty: 'medium' },
  { word: 'jämförbar', correct: 'likvärdig', wrong: ['ojämförbar', 'olik', 'åtskild'], difficulty: 'medium' },
  { word: 'klargöra', correct: 'förklara och tydliggöra', wrong: ['dölja', 'förvirra', 'fördunkla'], difficulty: 'medium' },
  { word: 'likvärdig', correct: 'lika värdefull', wrong: ['ojämlik', 'underlägsen', 'överlägsen'], difficulty: 'medium' },
  { word: 'målmedveten', correct: 'fokuserad på mål', wrong: ['planlös', 'mållös', 'ostrukturerad'], difficulty: 'medium' },
  { word: 'nyansera', correct: 'göra mer detaljerad', wrong: ['förenkla', 'generalisera', 'svepande beskriva'], difficulty: 'medium' },
  { word: 'oförändrad', correct: 'statisk', wrong: ['förändrad', 'dynamisk', 'varierad'], difficulty: 'medium' },
  { word: 'påvisa', correct: 'visa på', wrong: ['dölja', 'förneka', 'bortse från'], difficulty: 'medium' },
  { word: 'rättlinig', correct: 'rak och ärlig', wrong: ['krokig', 'tvetydig', 'bedräglig'], difficulty: 'medium' },
  { word: 'samstämmig', correct: 'enig', wrong: ['oenig', 'splittrad', 'motstridande'], difficulty: 'medium' },
  { word: 'tillämpbar', correct: 'användbar i praktiken', wrong: ['oanvändbar', 'opraktisk', 'irrelevant'], difficulty: 'medium' },
  { word: 'tillräcklig', correct: 'adekvat', wrong: ['otillräcklig', 'bristfällig', 'ofullständig'], difficulty: 'medium' },
  { word: 'tvingande', correct: 'nödvändig och bindande', wrong: ['frivillig', 'valfri', 'öppen'], difficulty: 'medium' },
  { word: 'underliggande', correct: 'bakomliggande', wrong: ['ytlig', 'uppenbar', 'explicit'], difficulty: 'medium' },
  { word: 'vedertagen', correct: 'allmänt accepterad', wrong: ['ovanlig', 'ifrågasatt', 'kontroversiell'], difficulty: 'medium' },
  { word: 'ytterst', correct: 'i högsta grad', wrong: ['minst', 'knappast', 'knappt'], difficulty: 'medium' },
  { word: 'åtgärda', correct: 'rätta till', wrong: ['förvärra', 'bortse från', 'ignorera'], difficulty: 'medium' },
  { word: 'återkommande', correct: 'upprepande', wrong: ['sällsynt', 'engångsförekommande', 'unik'], difficulty: 'medium' },
  { word: 'övergripande', correct: 'allomfattande', wrong: ['specifik', 'detaljerad', 'begränsad'], difficulty: 'medium' },
  { word: 'djupgående', correct: 'grundlig', wrong: ['ytlig', 'summarisk', 'hastig'], difficulty: 'medium' },
  { word: 'efterfrågad', correct: 'populär och eftertraktad', wrong: ['oönskad', 'avvisad', 'förkastade'], difficulty: 'medium' },
  { word: 'flexibel', correct: 'anpassningsbar', wrong: ['stel', 'rigid', 'oflexibel'], difficulty: 'medium' },
  { word: 'genomtänkt', correct: 'välöverlagd', wrong: ['impulsiv', 'förhastad', 'tanklös'], difficulty: 'medium' },
  { word: 'hanterbar', correct: 'möjlig att hantera', wrong: ['ohanterad', 'okontrollerad', 'överväldigande'], difficulty: 'medium' },
  { word: 'ingående', correct: 'detaljerad', wrong: ['ytlig', 'summarisk', 'övergripande'], difficulty: 'medium' },
  { word: 'jämvikt', correct: 'balans', wrong: ['obalans', 'instabilitet', 'kaos'], difficulty: 'medium' },
  { word: 'kategorisk', correct: 'absolut och utan undantag', wrong: ['relativ', 'nyanserad', 'villkorlig'], difficulty: 'medium' },
  { word: 'konsolidering', correct: 'befästande', wrong: ['upplösning', 'försvagning', 'fragmentering'], difficulty: 'medium' },
  { word: 'landvinning', correct: 'framsteg', wrong: ['tillbakagång', 'förlust', 'misslyckande'], difficulty: 'medium' },
  { word: 'motverka', correct: 'bekämpa', wrong: ['stödja', 'befrämja', 'underlätta'], difficulty: 'medium' },
  { word: 'nyansrik', correct: 'mångfacetterad', wrong: ['ensidig', 'ytlig', 'förenklad'], difficulty: 'medium' },
  { word: 'obegränsad', correct: 'utan gränser', wrong: ['begränsad', 'inskränkt', 'reglerad'], difficulty: 'medium' },
  { word: 'påtaglig', correct: 'märkbar', wrong: ['obemärkt', 'omärklig', 'ringa'], difficulty: 'medium' },
  { word: 'rimlig', correct: 'förnuftig', wrong: ['orimlig', 'absurd', 'irrationell'], difficulty: 'medium' },
  { word: 'sammanhang', correct: 'kontext', wrong: ['isolering', 'frånkoppling', 'osamanhang'], difficulty: 'medium' },
  { word: 'tillgänglig', correct: 'åtkomlig', wrong: ['otillgänglig', 'frånkopplad', 'stängd'], difficulty: 'medium' },
  { word: 'trovärdig', correct: 'pålitlig', wrong: ['opålitlig', 'osäker', 'tvivelaktig'], difficulty: 'medium' },
  { word: 'undflyende', correct: 'svårfångad', wrong: ['tydlig', 'uppenbar', 'lättillgänglig'], difficulty: 'medium' },
  { word: 'varierande', correct: 'omväxlande', wrong: ['enformig', 'monoton', 'likformig'], difficulty: 'medium' },
  { word: 'välbelagd', correct: 'faktaunderbyggd', wrong: ['ostyrkta', 'spekulativ', 'ogrundad'], difficulty: 'medium' },
  { word: 'övergående', correct: 'tillfällig', wrong: ['bestående', 'permanent', 'varaktig'], difficulty: 'medium' },
  // --- HARD BATCH 2 ---
  { word: 'epistemologi', correct: 'kunskapsteori', wrong: ['ontologi', 'etik', 'estetik'], difficulty: 'hard' },
  { word: 'synekdoke', correct: 'del som representerar helhet', wrong: ['metafor', 'liknelse', 'allegori'], difficulty: 'hard' },
  { word: 'obstruktion', correct: 'medvetet hindrande', wrong: ['underlättande', 'stödjande', 'befrämjande'], difficulty: 'hard' },
  { word: 'analfabetism', correct: 'oförmåga att läsa och skriva', wrong: ['högt läskunnighet', 'akademisk kompetens', 'talförmåga'], difficulty: 'hard' },
  { word: 'demagogi', correct: 'folkuppvigling', wrong: ['statsmanskonst', 'diplomati', 'lagstiftning'], difficulty: 'hard' },
  { word: 'eklatant', correct: 'uppenbar och påfallande', wrong: ['dold', 'subtil', 'obemärkt'], difficulty: 'hard' },
  { word: 'falsifiering', correct: 'motbevisande', wrong: ['verifiering', 'bekräftande', 'bevisande'], difficulty: 'hard' },
  { word: 'grotesk', correct: 'bisarr och förvrängd', wrong: ['behaglig', 'harmonisk', 'vacker'], difficulty: 'hard' },
  { word: 'hermeneutik', correct: 'tolkningslära', wrong: ['logik', 'retorik', 'semantik'], difficulty: 'hard' },
  { word: 'idiosynkrasi', correct: 'personlig egenhet', wrong: ['allmän vana', 'social norm', 'kollektivt beteende'], difficulty: 'hard' },
  { word: 'juxtaposition', correct: 'sida vid sida ställning', wrong: ['integration', 'sammanslagning', 'separation'], difficulty: 'hard' },
  { word: 'katarsis', correct: 'rening av känslor', wrong: ['undertryckning', 'förstärkning', 'ignorering av känslor'], difficulty: 'hard' },
  { word: 'liminalt', correct: 'tröskelbetonat', wrong: ['centralt', 'perifert', 'statiskt'], difficulty: 'hard' },
  { word: 'mandarin', correct: 'byråkratisk ämbetsman', wrong: ['folklig ledare', 'militär befäl', 'religiös ledare'], difficulty: 'hard' },
  { word: 'narrativ', correct: 'berättelse och tolkning', wrong: ['faktaredogörelse', 'matematisk formel', 'statistik'], difficulty: 'hard' },
  { word: 'ostentativ', correct: 'skrytsam och iögonfallande', wrong: ['blygsam', 'diskret', 'anspråkslös'], difficulty: 'hard' },
  { word: 'palimpsest', correct: 'text skriven över äldre text', wrong: ['original manus', 'nytryckt bok', 'digitalt dokument'], difficulty: 'hard' },
  { word: 'qualia', correct: 'subjektiv upplevelse', wrong: ['objektiv mätning', 'kvantitativ data', 'statistisk analys'], difficulty: 'hard' },
  { word: 'reifikation', correct: 'sakliggörande av abstrakta ting', wrong: ['abstrahering', 'idealisering', 'konceptualisering'], difficulty: 'hard' },
  { word: 'syllogism', correct: 'logisk slutledning', wrong: ['induktivt antagande', 'cirkelresonemang', 'analogi'], difficulty: 'hard' },
  { word: 'teleologi', correct: 'läran om ändamål', wrong: ['kausalitet', 'slumpmässighet', 'determinism'], difficulty: 'hard' },
  { word: 'utilitarism', correct: 'nyttans etik', wrong: ['pliktetik', 'dygdetik', 'nihilism'], difficulty: 'hard' },
  { word: 'vetiktig', correct: 'vetande och klok', wrong: ['okunnig', 'naiv', 'enfaldig'], difficulty: 'hard' },
  { word: 'xenofil', correct: 'förkärlek för det främmande', wrong: ['xenofob', 'nationalistisk', 'isolationistisk'], difficulty: 'hard' },
  { word: 'yokel', correct: 'oinformerad person från landsbygden', wrong: ['stadsbo', 'akademiker', 'kosmopolit'], difficulty: 'hard' },
  { word: 'zorroaktig', correct: 'ridderlighet i hemlighet', wrong: ['öppen hjälte', 'passiv åskådare', 'lättjefull'], difficulty: 'hard' },
  { word: 'anakolut', correct: 'grammatisk avbrytning i mening', wrong: ['fullständig mening', 'grammatisk korrekthet', 'syntaktisk ordning'], difficulty: 'hard' },
  { word: 'bathos', correct: 'plötsligt fall till det triviala', wrong: ['klimax', 'sublim höjdpunkt', 'estetisk fulländning'], difficulty: 'hard' },
  { word: 'catachresis', correct: 'felaktig eller forcerad metafor', wrong: ['ren metafor', 'klar liknelse', 'bokstavlig beskrivning'], difficulty: 'hard' },
  { word: 'dikotomi', correct: 'uppdelning i två motpoler', wrong: ['enhet', 'kontinuum', 'mångfald'], difficulty: 'hard' },
  { word: 'elegi', correct: 'sorgedikt', wrong: ['satirisk dikt', 'lovprisande dikt', 'episk dikt'], difficulty: 'hard' },
  { word: 'filantropi', correct: 'välgörenhet och människokärlek', wrong: ['egoism', 'snålhet', 'girighet'], difficulty: 'hard' },
  { word: 'galenskap', correct: 'irrationellt beteende', wrong: ['klokhet', 'rationalitet', 'eftertänksamhet'], difficulty: 'hard' },
  { word: 'hubris', correct: 'överdriven stolthet', wrong: ['ödmjukhet', 'blygenhet', 'självkritik'], difficulty: 'hard' },
  { word: 'iconoklasm', correct: 'bildstorm och ifrågasättande av auktoriteter', wrong: ['tradition', 'konservatism', 'vördnad'], difficulty: 'hard' },
  { word: 'janusartad', correct: 'tvåsidig och motsägelsefull', wrong: ['ensidig', 'konsekvent', 'rättlinjig'], difficulty: 'hard' },
  { word: 'kalkyl', correct: 'beräkning', wrong: ['gissning', 'intuition', 'känsla'], difficulty: 'hard' },
  { word: 'leksikal', correct: 'ordens karaktär', wrong: ['grammatisk', 'syntaktisk', 'fonetisk'], difficulty: 'hard' },
  { word: 'mnemonisk', correct: 'minnesunderlättande', wrong: ['minneshämmande', 'förvirrande', 'svårtolkad'], difficulty: 'hard' },
  { word: 'nekromans', correct: 'spådomskonst via de döda', wrong: ['astrologi', 'psykologi', 'empirisk vetenskap'], difficulty: 'hard' },
  { word: 'oligarki', correct: 'styrt av fåtal', wrong: ['demokrati', 'monarki', 'anarki'], difficulty: 'hard' },
  { word: 'panoptikon', correct: 'total övervakningsstruktur', wrong: ['privat sfär', 'dolda rum', 'anonym plats'], difficulty: 'hard' },
  { word: 'quid pro quo', correct: 'något för något', wrong: ['ensidigt givande', 'villkorslös hjälp', 'frivillig gåva'], difficulty: 'hard' },
  { word: 'retorik', correct: 'talekonst och argumentation', wrong: ['tystnad', 'matematisk analys', 'empirisk studie'], difficulty: 'hard' },
  { word: 'solecism', correct: 'grammatiskt fel', wrong: ['korrekt syntax', 'retorisk figur', 'poetisk frihet'], difficulty: 'hard' },
  { word: 'tjänstemannavälde', correct: 'byråkratins herravälde', wrong: ['folksuveränitet', 'direktdemokrati', 'anarki'], difficulty: 'hard' },
  { word: 'umbärlig', correct: 'inte nödvändig', wrong: ['oumbärlig', 'nödvändig', 'central'], difficulty: 'hard' },
  { word: 'vituperation', correct: 'häftig kritik', wrong: ['beröm', 'hyllning', 'uppmuntran'], difficulty: 'hard' },
  { word: 'weltanschauung', correct: 'världsåskådning', wrong: ['detaljsyn', 'begränsad syn', 'kortsiktig vy'], difficulty: 'hard' },
  { word: 'xenokrati', correct: 'styre av utlänningar', wrong: ['inhemsk styrning', 'folkrörelsestyre', 'direktdemokrati'], difficulty: 'hard' },
  { word: 'zealoti', correct: 'religiös fanatism', wrong: ['sekularism', 'religionsfrihet', 'tolerans'], difficulty: 'hard' },
  { word: 'abduktion', correct: 'slutledning till bästa förklaring', wrong: ['deduktion', 'induktion', 'slumpmässigt antagande'], difficulty: 'hard' },
  { word: 'antinomi', correct: 'motsägelse mellan lagar', wrong: ['harmoni', 'enhet', 'logisk följd'], difficulty: 'hard' },
  { word: 'chiasm', correct: 'korsformig omvändning av led', wrong: ['rak ordföljd', 'synonym upprepning', 'tautologi'], difficulty: 'hard' },
  { word: 'deskriptiv', correct: 'beskrivande', wrong: ['föreskrivande', 'normativ', 'värderande'], difficulty: 'hard' },
  { word: 'empirism', correct: 'erfarenhetsbaserad kunskapssyn', wrong: ['rationalism', 'dogmatism', 'mysticism'], difficulty: 'hard' },
  { word: 'fenomenologi', correct: 'studie av medveten upplevelse', wrong: ['behaviorism', 'kognitivism', 'strukturalism'], difficulty: 'hard' },
  { word: 'glossolali', correct: 'tungotal', wrong: ['tystnad', 'logiskt tal', 'debatt'], difficulty: 'hard' },
  { word: 'heterodox', correct: 'avvikande från ortodoxi', wrong: ['ortodox', 'konventionell', 'traditionell'], difficulty: 'hard' },
  { word: 'impunitet', correct: 'straffrihet', wrong: ['bestraffning', 'ansvarsutkrävande', 'rättvisa'], difficulty: 'hard' },
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

const ELF_PASSAGES: {
  passage: string;
  qa: { q: string; correct: string; wrong: string[]; explanation: string; difficulty?: Difficulty }[];
}[] = [
  {
    passage: 'Technology is reshaping the way we work. Remote collaboration tools have made it possible for teams to function across different time zones and continents. While this increases flexibility and access to global talent, it also creates challenges around communication, trust-building, and maintaining company culture.',
    qa: [
      { q: 'What is the main idea of the passage?', correct: 'Technology enables remote work but brings new challenges', wrong: ['Remote work is only possible with expensive tools', 'Technology is harmful to workplace culture', 'Global teams always perform better'], explanation: 'The passage discusses both benefits and challenges of remote work enabled by technology.', difficulty: 'easy' },
      { q: 'According to the passage, what challenge does remote work create?', correct: 'Difficulties with communication and company culture', wrong: ['Lack of access to technology', 'Teams cannot work across time zones', 'High costs of collaboration tools'], explanation: 'The text mentions challenges around communication, trust-building, and maintaining company culture.', difficulty: 'easy' },
    ],
  },
  {
    passage: 'Biodiversity loss is occurring at an alarming rate. Scientists estimate that species are disappearing up to 1,000 times faster than natural background extinction rates. Habitat destruction, climate change, and pollution are the primary drivers. Protecting biodiversity is not merely an ethical concern but a practical one, as ecosystems provide essential services including clean water, pollination, and climate regulation.',
    qa: [
      { q: 'Why does the author say protecting biodiversity is a practical concern?', correct: 'Ecosystems provide essential services humans depend on', wrong: ['It is required by international law', 'Scientists have ethical obligations', 'Biodiversity improves the economy directly'], explanation: 'The text states ecosystems provide services like clean water, pollination, and climate regulation that humans need.', difficulty: 'medium' },
      { q: 'What are listed as primary drivers of biodiversity loss?', correct: 'Habitat destruction, climate change, and pollution', wrong: ['Overpopulation, farming, and tourism', 'Deforestation, hunting, and wildfires', 'Oil spills, mining, and pesticides'], explanation: 'The passage explicitly names habitat destruction, climate change, and pollution as primary drivers.', difficulty: 'easy' },
    ],
  },
  {
    passage: 'Sleep deprivation has become a modern epidemic. Adults in many countries regularly sleep fewer than seven hours per night, despite scientific consensus that most need seven to nine hours. The consequences extend beyond tiredness: poor sleep is linked to obesity, cardiovascular disease, impaired immune function, and reduced cognitive performance. Yet societal attitudes often treat inadequate sleep as a badge of productivity.',
    qa: [
      { q: 'What societal attitude toward sleep does the passage criticize?', correct: 'Viewing insufficient sleep as a sign of productivity', wrong: ['Sleeping too long is seen as healthy', 'Society discourages using sleeping pills', 'People celebrate long sleep hours'], explanation: 'The text notes that societal attitudes often treat inadequate sleep as a badge of productivity, which the author implicitly criticizes.', difficulty: 'medium' },
      { q: 'How many hours of sleep does scientific consensus recommend for adults?', correct: 'Seven to nine hours', wrong: ['Five to six hours', 'Six to eight hours', 'Eight to ten hours'], explanation: 'The passage states scientists say most adults need seven to nine hours.', difficulty: 'easy' },
    ],
  },
  {
    passage: 'Electric vehicles (EVs) are increasingly seen as a solution to urban air pollution and greenhouse gas emissions. However, their environmental credentials depend heavily on how the electricity they consume is generated. In countries relying on coal-fired power plants, EVs may produce more lifecycle emissions than efficient conventional vehicles. A full transition to sustainable transport requires parallel investment in renewable energy infrastructure.',
    qa: [
      { q: 'What determines the environmental benefit of electric vehicles?', correct: 'The source of electricity used to power them', wrong: ['The brand of the vehicle', 'The distance driven per year', 'The weight of the battery'], explanation: 'The passage argues that environmental benefit depends on how the electricity is generated.', difficulty: 'medium' },
      { q: 'What does the passage say about EVs in coal-reliant countries?', correct: 'They may produce more emissions than efficient conventional cars', wrong: ['They are always more efficient than conventional cars', 'They should be banned in such countries', 'They use less electricity than expected'], explanation: 'The text explicitly states EVs in coal-reliant countries may produce more lifecycle emissions than efficient conventional vehicles.', difficulty: 'medium' },
    ],
  },
  {
    passage: 'The concept of a growth mindset, popularized by psychologist Carol Dweck, holds that intelligence and abilities are not fixed but can be developed through effort and learning. Research suggests that students who adopt this belief are more likely to persist through challenges, embrace failure as a learning opportunity, and ultimately achieve higher outcomes. Critics, however, note that structural barriers cannot be overcome by mindset alone.',
    qa: [
      { q: 'What is a growth mindset according to the passage?', correct: 'The belief that abilities can be developed through effort', wrong: ['The idea that intelligence is inherited', 'A method for measuring academic performance', 'A type of cognitive therapy'], explanation: 'The passage defines growth mindset as the belief that intelligence and abilities can be developed through effort and learning.', difficulty: 'easy' },
      { q: 'What concern do critics raise about growth mindset theory?', correct: 'Structural barriers cannot be overcome by mindset alone', wrong: ['The research methods are flawed', 'Students dislike the concept', 'It only works for young children'], explanation: 'Critics note that structural barriers cannot be overcome by mindset alone.', difficulty: 'medium' },
    ],
  },
];

const NOG_TEMPLATES: {
  questionText: string;
  correct: ComparisonChoice;
  explanation: string;
  difficulty?: Difficulty;
}[] = [
  { questionText: 'Vad är summan av x och y?\n\nA: x = 7\nB: y = 3', correct: 'C', explanation: 'Med A: 7 + y oklar. Med B: x + 3 oklar. Tillsammans: 7 + 3 = 10. Båda krävs.', difficulty: 'easy' },
  { questionText: 'Är a delbart med 5?\n\nA: a = 5k för något heltal k\nB: a slutar på siffran 0 eller 5', correct: 'A', explanation: 'A säger direkt att a = 5k, alltså delbart med 5. A räcker ensamt.', difficulty: 'medium' },
  { questionText: 'Hur många personer bor i huset?\n\nA: Det finns 4 våningar med lika många lägenheter per våning\nB: Varje lägenhet hyrs av 2 personer, och det finns totalt 8 lägenheter', correct: 'B', explanation: 'B ensamt: 8 lägenheter × 2 = 16 personer. A ensamt ger inte antal lägenheter.', difficulty: 'medium' },
  { questionText: 'Vad är vinkeln v i figuren?\n\nA: Figuren är en liksides triangel\nB: Den ena vinkeln i figuren är 60°', correct: 'A', explanation: 'En liksides triangel har alla vinklar = 60°. A räcker ensamt. B anger bara en vinkel.', difficulty: 'medium' },
  { questionText: 'Hur stor är rabatten i kronor?\n\nA: Ursprungspriset är 400 kr\nB: Rabatten är 25%', correct: 'C', explanation: 'Rabatt = 400 × 0,25 = 100 kr. Båda krävs.', difficulty: 'easy' },
  { questionText: 'Är x² < 9?\n\nA: x < 3\nB: x > -3', correct: 'D', explanation: 'A: x kan vara -100 → x² = 10000. B: x kan vara 100 → x² = 10000. Tillsammans krävs -3 < x < 3, men det ges inte direkt. Faktum: Med båda: -3 < x < 3 ⇒ x² < 9. Så C är rätt.', difficulty: 'hard' },
  { questionText: 'Hur långt är stäckan från A till C?\n\nA: Från A till B är det 12 km\nB: Från B till C är det 8 km', correct: 'C', explanation: 'AC = AB + BC = 12 + 8 = 20 km (om A, B, C är på en rät linje). Båda krävs.', difficulty: 'easy' },
  { questionText: 'Vad är värdet på 2x - y?\n\nA: x + y = 9\nB: x - y = 3', correct: 'C', explanation: 'Från A och B: lägg ihop: 2x = 12, x = 6, y = 3. 2(6) - 3 = 9. Båda krävs.', difficulty: 'medium' },
];

const normalizeSection = (sectionCode: string): HPSectionCode | null => {
  const s = sectionCode.toUpperCase();
  if (s === 'ORD' || s === 'LÄS' || s === 'MEK' || s === 'ELF' || s === 'XYZ' || s === 'KVA' || s === 'NOG' || s === 'DTK') return s as HPSectionCode;
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

    if (section === 'ELF') {
      const p = ELF_PASSAGES[Math.floor(rng.next() * ELF_PASSAGES.length)];
      const qa = p.qa[Math.floor(rng.next() * p.qa.length)];
      const correct = qa.correct;
      const options = makeOptions(correct, qa.wrong, rng);
      out.push({
        id,
        sectionCode: 'ELF',
        testVersion: args.testVersion,
        questionNumber: qn,
        questionText: qa.q,
        questionType: 'reading_comprehension',
        options,
        correctAnswer: correct,
        explanation: qa.explanation,
        difficulty: qa.difficulty ?? difficulty,
        readingPassage: p.passage,
      });
      continue;
    }

    if (section === 'NOG') {
      const template = NOG_TEMPLATES[Math.floor(rng.next() * NOG_TEMPLATES.length)];
      out.push(
        toComparisonQuestion({
          id,
          sectionCode: 'NOG',
          testVersion: args.testVersion,
          questionNumber: qn,
          questionText: template.questionText,
          correct: template.correct,
          explanation: template.explanation,
          difficulty: template.difficulty ?? difficulty,
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
