// Course Content Data Models and Example Data
// All IDs follow the format: course_<kortnamn>_<nummer>_mod_<modulnummer>_lesson_<lektionnummer>

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'quiz';
  durationMinutes?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseContent {
  id: string;
  title: string;
  description: string;
  image?: string;
  premiumRequired: boolean;
  modules: Module[];
}

// Example Course 1: Studieteknik – Lär dig plugga smartare
const studieteknikCourse: CourseContent = {
  id: 'course_studieteknik_01',
  title: 'Studieteknik – Lär dig plugga smartare',
  description: 'Lär dig effektiva metoder för att studera smartare, inte hårdare. Kursen går igenom beprövade tekniker som hjälper dig att minnas bättre, förstå djupare och prestera på topp.',
  image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
  premiumRequired: false,
  modules: [
    {
      id: 'course_studieteknik_01_mod_01',
      title: 'Grunderna i effektiv inlärning',
      description: 'Förstå hur hjärnan lär sig och vilka faktorer som påverkar inlärningen.',
      lessons: [
        {
          id: 'course_studieteknik_01_mod_01_lesson_01',
          title: 'Hur hjärnan lär sig nya saker',
          type: 'text',
          durationMinutes: 15,
          content: `Hjärnan är ett fantastiskt organ som ständigt anpassar sig och lär sig nya saker. För att förstå hur vi kan studera mer effektivt behöver vi först förstå grunderna i hur inlärning fungerar.

**Neuroplasticitet**
Hjärnan har förmågan att förändras genom hela livet. När vi lär oss något nytt bildas nya kopplingar mellan nervceller (synapser). Ju mer vi övar och repeterar, desto starkare blir dessa kopplingar.

**Arbetsminne vs långtidsminne**
Arbetsminnet är begränsat och kan bara hålla cirka 4-7 saker åt gången. Långtidsminnet däremot har i princip obegränsad kapacitet. Målet med effektiv studieteknik är att flytta information från arbetsminnet till långtidsminnet.

**Konsolideringsprocessen**
När vi sover bearbetar hjärnan dagens intryck och befäster viktiga minnen. Därför är god sömn avgörande för inlärning. Forskning visar att studenter som sover tillräckligt presterar betydligt bättre på prov.

**Praktiska tips:**
- Studera nya ämnen när du är pigg och utvilad
- Ta regelbundna pauser för att låta hjärnan bearbeta
- Undvik att studera för sent på kvällen
- Se till att få minst 7-8 timmars sömn, särskilt inför prov`
        },
        {
          id: 'course_studieteknik_01_mod_01_lesson_02',
          title: 'Aktiv vs passiv inlärning',
          type: 'text',
          durationMinutes: 12,
          content: `En av de viktigaste insikterna inom studieteknik är skillnaden mellan aktiv och passiv inlärning. Forskning visar tydligt att aktiva metoder är betydligt mer effektiva.

**Passiv inlärning (mindre effektivt)**
- Att bara läsa igenom texten
- Att lyssna på föreläsningar utan anteckningar
- Att markera text med överstrykningspenna
- Att kopiera anteckningar ordagrant

**Aktiv inlärning (mer effektivt)**
- Ställa frågor till dig själv om materialet
- Förklara innehållet för någon annan
- Göra övningsuppgifter och problem
- Skapa egna sammanfattningar med egna ord
- Använda flashcards för att testa dig själv

**Varför fungerar aktiv inlärning bättre?**
När du aktivt bearbetar information tvingas hjärnan att engagera sig djupare. Du måste hämta information från minnet, organisera den och använda den på nya sätt. Detta skapar starkare och mer tillgängliga minnesbanor.

**Retrieval practice**
En särskilt effektiv teknik är "retrieval practice" – att aktivt försöka minnas information utan att titta på materialet. Varje gång du framgångsrikt hämtar ett minne förstärks det. Använd denna teknik genom att:
- Stänga boken och skriva ner vad du kommer ihåg
- Använda flashcards
- Göra övningsprov utan hjälp`
        },
        {
          id: 'course_studieteknik_01_mod_01_lesson_03',
          title: 'Betydelsen av motivation och mindset',
          type: 'text',
          durationMinutes: 10,
          content: `Din inställning till lärande har enorm betydelse för hur väl du kommer att lyckas. Forskaren Carol Dweck har identifierat två olika typer av mindset som påverkar prestationer.

**Fixed mindset**
Personer med fixed mindset tror att intelligens och förmågor är medfödda och oföränderliga. De undviker utmaningar, ger upp lätt vid motgångar och ser ansträngning som fruktlöst.

**Growth mindset**
Personer med growth mindset tror att förmågor kan utvecklas genom ansträngning och övning. De omfamnar utmaningar, ser misslyckanden som lärotillfällen och förstår att ansträngning leder till framgång.

**Hur utvecklar du growth mindset?**
1. Byt ut "jag kan inte" mot "jag kan inte ännu"
2. Se misstag som en naturlig del av lärprocessen
3. Fokusera på processen, inte bara resultatet
4. Fira ansträngning och förbättring
5. Sök utmaningar istället för att undvika dem

**Motivation och mål**
Sätt upp både kortsiktiga och långsiktiga mål för dina studier. Kortsiktiga mål ger snabb belöning och håller motivationen uppe. Långsiktiga mål ger riktning och mening.

**SMART-mål:**
- Specifika: "Jag ska läsa kapitel 3" istället för "Jag ska plugga"
- Mätbara: Du ska kunna avgöra om du uppnått målet
- Accepterade: Du ska verkligen vilja uppnå målet
- Realistiska: Målet ska vara genomförbart
- Tidsbestämda: Sätt en deadline`
        },
        {
          id: 'course_studieteknik_01_mod_01_lesson_04',
          title: 'Planering och tidshantering',
          type: 'text',
          durationMinutes: 14,
          content: `God planering är grunden för framgångsrika studier. Utan struktur är det lätt att skjuta upp saker eller lägga för mycket tid på fel områden.

**Varför planera?**
- Minskar stress och ångest
- Hjälper dig att prioritera
- Ger kontroll över din tid
- Förhindrar prokrastinering
- Skapar balans mellan studier och fritid

**Verktyg för planering**
1. **Kalender** – Skriv in alla deadlines, prov och inlämningar
2. **Veckoplanering** – Planera vad du ska göra varje dag
3. **Daglig att-göra-lista** – Konkreta uppgifter för dagen
4. **Studiejournal** – Reflektera över vad du lärt dig

**80/20-regeln (Pareto-principen)**
Cirka 20% av din insats ger 80% av resultatet. Identifiera vilka studieaktiviteter som ger mest utdelning och prioritera dessa.

**Time blocking**
Avsätt specifika tidsblock för olika aktiviteter:
- Morgon: Svåra ämnen som kräver koncentration
- Eftermiddag: Repetition och övningsuppgifter
- Kväll: Lättare läsning och planering för nästa dag

**Hantera prokrastinering**
- Bryt ner stora uppgifter i mindre delar
- Börja med den svåraste uppgiften först (eat the frog)
- Använd tvåminutersregeln: om något tar under 2 minuter, gör det direkt
- Skapa en studievänlig miljö utan distraktioner`
        },
        {
          id: 'course_studieteknik_01_mod_01_lesson_05',
          title: 'Optimal studiemiljö',
          type: 'text',
          durationMinutes: 8,
          content: `Din studiemiljö påverkar koncentration och produktivitet mer än du tror. Genom att optimera din miljö kan du studera mer effektivt.

**Fysisk miljö**
- **Belysning:** Naturligt ljus är bäst, annars vit/neutral belysning
- **Temperatur:** Lagom, inte för varmt (tröttande) eller kallt
- **Ljudnivå:** Tyst eller lagom bakgrundsljud (lo-fi musik, white noise)
- **Ergonomi:** Bekväm stol, skärm i ögonhöjd, fötterna i golvet

**Digital miljö**
- Stäng av notifikationer på telefon och dator
- Använd webbplatsblockare för sociala medier
- Ha bara nödvändiga program och flikar öppna
- Lägg telefonen i ett annat rum eller i flygplansläge

**Studieplats**
- Välj en plats du associerar med studier
- Undvik att studera i sängen (hjärnan associerar med sömn)
- Ha allt material tillgängligt innan du börjar
- Experimentera: bibliotek, café, hemma – vad funkar för dig?

**Rutiner och ritualer**
Skapa en "studiestart-ritual" som signalerar till hjärnan att det är dags att fokusera:
- Gör en kopp te eller kaffe
- Sätt på en specifik spellista
- Rensa skrivbordet
- Gå igenom dagens mål`
        }
      ]
    },
    {
      id: 'course_studieteknik_01_mod_02',
      title: 'Minnestekniker och repetition',
      description: 'Lär dig kraftfulla metoder för att minnas information bättre och längre.',
      lessons: [
        {
          id: 'course_studieteknik_01_mod_02_lesson_01',
          title: 'Spaced repetition – Repetera smart',
          type: 'text',
          durationMinutes: 12,
          content: `Spaced repetition är en av de mest vetenskapligt beprövade metoderna för långsiktig inlärning. Istället för att repetera allt på en gång, sprider du ut repetitionerna över tid.

**Glömskekurvan**
Psykologen Hermann Ebbinghaus upptäckte att vi glömmer information exponentiellt snabbt efter att vi lärt oss den. Efter 24 timmar har vi glömt cirka 70% av nyinlärd information.

**Hur fungerar spaced repetition?**
Genom att repetera precis innan du håller på att glömma, förstärker du minnesbanorna och "nollställer" glömskekurvan. Varje repetition gör att du kommer ihåg längre:
- Första repetitionen: efter 1 dag
- Andra repetitionen: efter 3 dagar
- Tredje repetitionen: efter 1 vecka
- Fjärde repetitionen: efter 2 veckor
- Och så vidare...

**Verktyg för spaced repetition**
- **Anki** – Populärt program med automatiskt schemaläggning
- **Quizlet** – Webbaserat med sociala funktioner
- **Fysiska flashcards** – Använd Leitner-systemet med flera högar

**Leitner-systemet**
1. Börja med alla kort i hög 1
2. Kort du svarar rätt på flyttas till nästa hög
3. Kort du svarar fel på går tillbaka till hög 1
4. Repetera hög 1 varje dag, hög 2 varannan dag, osv.

**Praktiska tips:**
- Skapa flashcards direkt när du lär dig nytt material
- Håll frågorna korta och specifika
- En fråga per kort för bäst effekt
- Var konsekvent – repetera varje dag`
        },
        {
          id: 'course_studieteknik_01_mod_02_lesson_02',
          title: 'Minnespalats och associationstekniker',
          type: 'text',
          durationMinutes: 15,
          content: `Minnespalats (method of loci) är en urgammal teknik som använts sedan antikens Grekland. Den utnyttjar hjärnans naturliga förmåga att minnas platser och rumsliga relationer.

**Hur fungerar minnespalats?**
1. Välj en plats du känner väl (ditt hem, vägen till skolan)
2. Identifiera distinkta platser längs en rutt
3. Associera information du vill minnas med varje plats
4. "Gå" mentalt genom palatset för att hämta informationen

**Exempel:**
Du vill minnas solsystemets planeter (Merkurius, Venus, Jorden, Mars...):
- Vid ytterdörren: En termometer (Merkurius) som visar extrema temperaturer
- I hallen: Venus i ett spegelbord (Venus = skönhet)
- I köket: En jordglob på köksbordet (Jorden)
- I vardagsrummet: En Mars-bar på soffan

**Gör bilderna minnesvärda**
- Överdrivna proportioner
- Starka känslor (roligt, äckligt, chockerande)
- Rörelse och handling
- Personliga kopplingar

**Akronymer och ramsor**
- ROY G BIV för regnbågens färger
- "Kungen Fyller År I Juli, Alla Kommer" för kontinenterna
- Skapa egna ramsor som passar dig

**Chunking**
Gruppera information i meningsfulla enheter. Telefonnummer är lättare att minnas som 070-123-4567 än som 0701234567.

**Storytelling**
Skapa en historia som binder ihop information. Hjärnan älskar berättelser och minns dem lättare än lösa fakta.`
        },
        {
          id: 'course_studieteknik_01_mod_02_lesson_03',
          title: 'Elaboration – Djupare förståelse',
          type: 'text',
          durationMinutes: 11,
          content: `Elaboration innebär att du aktivt bearbetar och utvecklar informationen du lär dig. Istället för att bara memorera, skapar du djupare förståelse.

**Varför fungerar elaboration?**
När du elaborerar kopplar du ny information till saker du redan vet. Detta skapar ett nätverk av associationer som gör kunskapen lättare att hämta och använda.

**Tekniker för elaboration**

**1. Ställ frågor**
- Varför är detta sant?
- Hur hänger detta ihop med det jag redan vet?
- Vilka är de underliggande principerna?
- När kan jag använda denna kunskap?

**2. Feynman-tekniken**
Förklara konceptet som om du lärde ut det till en nybörjare:
1. Skriv ner konceptet med enkla ord
2. Identifiera luckor i din förklaring
3. Gå tillbaka och lär dig mer
4. Förenkla och använd analogier

**3. Skapa kopplingar**
- Hur liknar detta något annat jag lärt mig?
- Vilka är skillnaderna jämfört med liknande koncept?
- Kan jag hitta exempel från verkliga livet?

**4. Visualisera**
- Rita diagram och mind maps
- Skapa flödesscheman
- Gör skisser och illustrationer

**Praktisk övning**
Efter varje studiepass, skriv en kort sammanfattning med egna ord. Inkludera:
- Huvudpoänger
- Kopplingar till annat du lärt dig
- Frågor som du fortfarande har
- Konkreta exempel`
        },
        {
          id: 'course_studieteknik_01_mod_02_lesson_04',
          title: 'Interleaving – Blanda ämnen',
          type: 'text',
          durationMinutes: 10,
          content: `Interleaving är en studieteknik som går emot vår intuition, men som forskning visar är mycket effektiv.

**Vad är interleaving?**
Istället för att studera ett ämne i taget tills du behärskar det (blocked practice), blandar du olika ämnen eller problemtyper under samma studiepass.

**Exempel:**
- Blocked: AAA BBB CCC
- Interleaved: ABC ABC ABC

**Varför fungerar det?**
1. **Diskriminering:** Du lär dig skilja mellan olika typer av problem
2. **Variation:** Hjärnan engageras mer när den möter variation
3. **Retrieval:** Du tvingas hämta olika strategier från minnet
4. **Överföring:** Kunskapen blir mer flexibel och användbar

**Varning: Det känns svårare!**
Interleaving känns ofta svårare och mer frustrerande än blocked practice. Du gör fler misstag under träningen. Men denna "önskvärda svårighet" leder till bättre långsiktig inlärning.

**Hur tillämpar du interleaving?**
- Studera matematik och fysik under samma pass
- Blanda grammatikregler när du övar språk
- Växla mellan olika typer av matteproblem
- Inkludera gamla ämnen i din repetition

**Kombinera med spaced repetition**
Den ultimata kombinationen är att använda interleaving tillsammans med spaced repetition. Blanda ämnen OCH sprid ut repetitionerna över tid.

**Praktiskt schema:**
- Måndag: Matematik + Kemi
- Tisdag: Svenska + Historia
- Onsdag: Engelska + Matematik
- etc.`
        }
      ]
    },
    {
      id: 'course_studieteknik_01_mod_03',
      title: 'Strategier för prov och examination',
      description: 'Förbered dig optimalt för prov och lär dig hantera prestationsångest.',
      lessons: [
        {
          id: 'course_studieteknik_01_mod_03_lesson_01',
          title: 'Effektiv provförberedelse',
          type: 'text',
          durationMinutes: 14,
          content: `Framgångsrik provförberedelse börjar långt innan provet. Med rätt strategi kan du prestera på topp utan att stressa.

**Veckan innan provet**

**Inventera materialet**
- Gå igenom all kurslitteratur och anteckningar
- Identifiera vad du kan bra och vad som behöver mer arbete
- Prioritera svaga områden

**Skapa en repetitionsplan**
- Fördela materialet över dagarna
- Planera in pauser och vila
- Sätt av extra tid för svåra områden

**Under veckan**

**Dag 1-3: Aktiv genomgång**
- Läs igenom materialet aktivt
- Skapa sammanfattningar
- Gör flashcards för viktiga begrepp

**Dag 4-5: Övningsprov och retrieval**
- Gör tidigare prov och övningsfrågor
- Testa dig själv utan att titta på svaren
- Identifiera kunskapsluckor

**Dag 6: Finjustering**
- Fokusera på svaga områden
- Gå igenom flashcards
- Repetera sammanfattningar

**Kvällen innan provet**
- Lätt repetition, inte intensiva studier
- Gå igenom huvudpunkterna
- Förbered allt praktiskt (material, väckarklocka)
- Lägg dig i tid och sov ordentligt

**Provdagen**
- Ät en ordentlig frukost
- Gå igenom nyckelbegrepp snabbt
- Kom i god tid
- Ta med det du behöver`
        },
        {
          id: 'course_studieteknik_01_mod_03_lesson_02',
          title: 'Hantera prestationsångest',
          type: 'text',
          durationMinutes: 12,
          content: `Nervositet inför prov är normalt och kan faktiskt förbättra prestationen. Men för mycket ångest kan blockera dig. Här är strategier för att hantera det.

**Förstå ångest**
Ångest är kroppens sätt att förbereda sig för utmaningar. Adrenalin och kortisol gör oss mer alerta. Problemet uppstår när ångesten blir för stark.

**Fysiska strategier**

**Andningsövningar**
4-7-8 tekniken:
1. Andas in genom näsan i 4 sekunder
2. Håll andan i 7 sekunder
3. Andas ut genom munnen i 8 sekunder
4. Upprepa 3-4 gånger

**Muskelavslappning**
Spänn och slappna av olika muskelgrupper systematiskt. Börja med fötterna och arbeta dig uppåt.

**Fysisk aktivitet**
Träning minskar ångest. Ta en promenad morgonen innan provet.

**Mentala strategier**

**Kognitiv omstrukturering**
Byt negativa tankar mot realistiska:
- "Jag kommer att misslyckas" → "Jag har förberett mig väl och vet mycket"
- "Alla andra är smartare" → "Jag har min egen kunskap och förmåga"

**Visualisering**
Föreställ dig själv göra provet lugnt och framgångsrikt. Se dig själv svara på frågorna med tillförsikt.

**Perspektiv**
Ett prov är inte livets undergång. Påminn dig om vad som verkligen spelar roll i livet.

**Under provet**
- Börja med att läsa igenom hela provet
- Besvara frågor du kan först
- Hoppa över svåra frågor och återkom senare
- Andas djupt om du känner panik`
        },
        {
          id: 'course_studieteknik_01_mod_03_lesson_03',
          title: 'Provstrategier som fungerar',
          type: 'text',
          durationMinutes: 11,
          content: `Med rätt strategi under provet maximerar du dina poäng. Här är beprövade tekniker.

**I början av provet**

**1. Lugna dig**
Ta några djupa andetag. Du är förberedd.

**2. Läs instruktionerna noga**
Förstå exakt vad som förväntas. Hur många frågor? Hur fördelas poängen?

**3. Planera din tid**
- Fördela tiden baserat på poäng
- Sätt av tid för genomgång i slutet
- Ha koll på klockan regelbundet

**4. Gör en första genomgång**
Läs snabbt igenom alla frågor. Identifiera:
- Lätta frågor du kan besvara direkt
- Svåra frågor som behöver mer tid
- Frågor som ger mest poäng

**Strategier för olika frågetyper**

**Flervalsfrågor**
- Läs frågan noga
- Försök svara innan du tittar på alternativen
- Eliminera uppenbart fel alternativ
- Om osäker, gå med första instinkten

**Essäfrågor**
- Planera svaret innan du skriver
- Gör en kort disposition
- Besvara alla delar av frågan
- Använd ämnesspecifika termer

**Matematiska problem**
- Visa alla uträkningar
- Kontrollera enheter
- Dubbelkolla svaret genom att räkna baklänges
- Rita figurer om det hjälper

**I slutet av provet**

**Gå igenom svaren**
- Kontrollera att du besvarat alla frågor
- Läs igenom essäsvar för stavfel
- Dubbelkolla beräkningar
- Ändra bara svar om du är säker`
        }
      ]
    }
  ]
};

// Example Course 2: Stresshantering för studenter
const stresshanteringCourse: CourseContent = {
  id: 'course_stress_01',
  title: 'Stresshantering för studenter',
  description: 'Lär dig förstå och hantera stress för att må bättre och prestera bättre i skolan. Praktiska verktyg som du kan använda direkt.',
  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  premiumRequired: false,
  modules: [
    {
      id: 'course_stress_01_mod_01',
      title: 'Förstå stress',
      description: 'Lär dig vad stress är, varför vi blir stressade och hur det påverkar oss.',
      lessons: [
        {
          id: 'course_stress_01_mod_01_lesson_01',
          title: 'Vad är stress och varför finns det?',
          type: 'text',
          durationMinutes: 10,
          content: `Stress är kroppens naturliga reaktion på utmaningar och hot. Det är faktiskt en överlevnadsmekanism som har hjälpt människor genom årtusenden.

**Fight-or-flight-reaktionen**
När hjärnan uppfattar fara aktiveras det sympatiska nervsystemet. Kroppen förbereder sig för att kämpa eller fly:
- Hjärtat slår snabbare
- Andningen ökar
- Musklerna spänns
- Blodsockret stiger
- Sinnen skärps

**Varför blir vi stressade idag?**
Problemet är att denna urgamla reaktion nu aktiveras av moderna "hot":
- Prov och deadlines
- Sociala medier och jämförelser
- Framtidsoro
- Relationer och konflikter
- Ekonomi och jobb

Hjärnan skiljer inte på verkliga fysiska hot och psykologisk press. Samma stressreaktioner aktiveras.

**Eustress vs distress**
All stress är inte dålig:
- **Eustress (positiv stress):** Motiverar och hjälper dig prestera. Du känner dig utmanad men kapabel.
- **Distress (negativ stress):** Överväldigande och skadlig. Du känner dig maktlös och utmattad.

**Stress-prestationskurvan**
Viss stress förbättrar faktiskt prestationen. Men för lite eller för mycket stress försämrar den. Målet är att hitta din optimala nivå.

**Känna igen din stress**
Lär dig identifiera vad som triggar din stress och hur den yttrar sig. Alla reagerar olika.`
        },
        {
          id: 'course_stress_01_mod_01_lesson_02',
          title: 'Symtom på stress',
          type: 'text',
          durationMinutes: 8,
          content: `Stress påverkar hela kroppen och sinnet. Att känna igen symtomen tidigt hjälper dig att agera innan det går för långt.

**Fysiska symtom**
- Huvudvärk och spänningar i nacke/axlar
- Magproblem (illamående, IBS)
- Hjärtklappning
- Svettningar
- Sömnproblem
- Trötthet och energibrist
- Försvagat immunförsvar (blir sjuk ofta)

**Emotionella symtom**
- Ångest och oro
- Irritation och ilska
- Nedstämdhet
- Känslomässig instabilitet
- Överväldigande känsla
- Hopplöshet

**Kognitiva symtom**
- Koncentrationssvårigheter
- Minnesproblem
- Beslutsångest
- Negativa tankar
- Grubblande
- Svårt att släppa problem

**Beteendemässiga symtom**
- Prokrastinering
- Social isolering
- Ändrade matvanor
- Ökat användande av alkohol/droger
- Nervösa vanor (nagelbiting)
- Konflikter med andra

**Varningssignaler för utbrändhet**
Om flera av dessa symtom ��r ihållande och påverkar din vardag, kan du vara på väg mot utbrändhet:
- Kronisk trötthet
- Cynism och distans
- Känsla av ineffektivitet
- Fysiska symtom utan medicinsk förklaring

Sök hjälp om du känner igen dig i detta.`
        },
        {
          id: 'course_stress_01_mod_01_lesson_03',
          title: 'Vanliga stressorer för studenter',
          type: 'text',
          durationMinutes: 9,
          content: `Som student möter du unika utmaningar som kan skapa stress. Att identifiera dina specifika stressorer är första steget mot att hantera dem.

**Akademisk stress**
- Höga krav och prestationspress
- Deadlines och tentaperioder
- Stora arbetsmängder
- Svåra ämnen och kurser
- Betygsångest
- Framtidsplaner (högskola, jobb)

**Social stress**
- Grupptryck och anpassning
- Konflikter med vänner
- Romantiska relationer
- Mobbning eller utanförskap
- Jämförelser med andra
- FOMO (fear of missing out)

**Digital stress**
- Ständig tillgänglighet
- Sociala medier och likes
- Cybermobbing
- Information overload
- Skärmtrötthet

**Familjestress**
- Förväntningar från föräldrar
- Konflikter hemma
- Ekonomiska bekymmer
- Flytt hemifrån
- Skilsmässa eller sjukdom i familjen

**Livsstilsstress**
- Sömnbrist
- Ohälsosam kost
- Brist på motion
- Tidsbrist och kaos
- Arbete vid sidan av studierna

**Övning: Identifiera dina stressorer**
Skriv en lista över allt som stressar dig just nu. Rangordna dem efter hur mycket de påverkar dig. Fokusera på de viktigaste först.`
        },
        {
          id: 'course_stress_01_mod_01_lesson_04',
          title: 'Hur stress påverkar inlärning',
          type: 'text',
          durationMinutes: 11,
          content: `Stress har direkta effekter på hjärnan och vår förmåga att lära oss. Att förstå detta kan motivera dig att ta stresshantering på allvar.

**Kortisol och hjärnan**
Vid kronisk stress utsätts hjärnan för höga nivåer av stresshormonet kortisol. Detta påverkar särskilt:

**Hippocampus (minnet)**
- Försämrad förmåga att skapa nya minnen
- Svårare att hämta lagrad information
- Kan faktiskt krympa vid långvarig stress

**Prefrontala cortex (exekutiva funktioner)**
- Sämre koncentration och fokus
- Försämrat arbetsminne
- Svårt att planera och organisera
- Nedsatt impulskontroll

**Amygdala (känslor)**
- Blir överaktiv
- Överkänslighet för hot
- Svårt att reglera känslor
- Mer ångest och oro

**Stress och prestationer**
Ironiskt nog kan just stressen över att prestera bra försämra dina prestationer:
- Provsångest blockerar minnesåtkomst
- Deadline-panik leder till sämre kvalitet
- Sömnbrist försämrar konsolidering av minnen

**Den onda cirkeln**
Stress → Sämre studieresultat → Mer stress → Ännu sämre resultat...

**Den goda cirkeln**
Stresshantering → Bättre fokus → Bättre resultat → Minskad stress...

**Budskapet**
Att investera tid i stresshantering är inte bortkastad tid från studierna – det förbättrar faktiskt din studieförmåga.`
        }
      ]
    },
    {
      id: 'course_stress_01_mod_02',
      title: 'Praktiska verktyg mot stress',
      description: 'Konkreta tekniker och övningar för att minska och hantera stress i vardagen.',
      lessons: [
        {
          id: 'course_stress_01_mod_02_lesson_01',
          title: 'Andningstekniker',
          type: 'text',
          durationMinutes: 10,
          content: `Andningen är det snabbaste och mest tillgängliga verktyget för att lugna nervsystemet. Du har den alltid med dig.

**Varför fungerar det?**
Djup, långsam andning aktiverar det parasympatiska nervsystemet (vila och återhämtning). Detta motverkar stressreaktionen direkt.

**Teknik 1: Djup diafragmaandning**
1. Sätt dig bekvämt eller ligg ner
2. Lägg en hand på bröstet, en på magen
3. Andas in genom näsan så magen höjs (bröstet stilla)
4. Andas ut långsamt genom munnen
5. Upprepa 5-10 minuter

**Teknik 2: 4-7-8 metoden**
1. Andas in genom näsan i 4 sekunder
2. Håll andan i 7 sekunder
3. Andas ut genom munnen i 8 sekunder
4. Upprepa 4 cykler

**Teknik 3: Box breathing (fyrkants-andning)**
1. Andas in i 4 sekunder
2. Håll i 4 sekunder
3. Andas ut i 4 sekunder
4. Håll i 4 sekunder
5. Upprepa 4-5 cykler

**Teknik 4: Snabb lugning (akut stress)**
När du behöver lugna dig snabbt:
1. Gör ett långt utandning
2. Låt inandningen komma naturligt
3. Upprepa 3 gånger

**Praktiska tips**
- Öva när du är lugn först
- Sätt påminnelser att andas under dagen
- Använd före prov och svåra situationer
- Tänk på att förlänga utandningen (aktiverar vila-systemet)`
        },
        {
          id: 'course_stress_01_mod_02_lesson_02',
          title: 'Mindfulness och meditation',
          type: 'text',
          durationMinutes: 14,
          content: `Mindfulness handlar om att vara närvarande i nuet utan att döma. Regelbunden övning förändrar faktiskt hjärnans struktur och minskar stress.

**Forskning visar att mindfulness:**
- Minskar kortisolnivåer
- Minskar amygdalas reaktivitet
- Ökar grå substans i prefrontala cortex
- Förbättrar fokus och koncentration
- Minskar ångest och depression

**Grundläggande mindfulness-meditation**
1. Sätt dig bekvämt med rak rygg
2. Blunda eller fäst blicken mjukt
3. Fokusera på din andning
4. När tankar dyker upp, märk dem och återvänd till andningen
5. Döm inte dig själv för vandrande tankar
6. Börja med 5 minuter, öka gradvis

**Body scan**
1. Ligg bekvämt på rygg
2. Rikta uppmärksamheten till fötterna
3. Känn förnimmelser utan att döma
4. Flytta fokus uppåt genom kroppen
5. Avsluta med hela kroppen

**Mindfulness i vardagen**
- Ät en måltid utan distraktioner
- Lyssna aktivt i samtal
- Känn hur vattnet känns i duschen
- Gå uppmärksamt och känn varje steg

**Appar för meditation**
- Headspace
- Calm
- Insight Timer
- Waking Up

**Starta enkelt**
Du behöver inte meditera en timme. Även 5 minuter om dagen gör skillnad. Nyckeln är regelbundenhet, inte längd.`
        },
        {
          id: 'course_stress_01_mod_02_lesson_03',
          title: 'Motion och fysisk aktivitet',
          type: 'text',
          durationMinutes: 10,
          content: `Motion är ett av de mest effektiva "medicin" mot stress. Det påverkar både kropp och hjärna positivt.

**Varför fungerar motion?**
- Frisätter endorfiner (naturliga må-bra-kemikalier)
- Minskar stresshormoner (kortisol, adrenalin)
- Förbättrar sömnen
- Ökar självförtroende och self-efficacy
- Ger mental paus från oro

**Vad räknas som motion?**
All rörelse är bra! Du behöver inte träna hårt för att få effekt:
- Promenader
- Cykling
- Simning
- Yoga
- Styrketräning
- Dans
- Lagsporter

**Rekommendationer**
- 150 minuter måttlig aktivitet per vecka
- Eller 75 minuter intensiv aktivitet
- Plus muskelstärkande 2 gånger per vecka
- Varje minut räknas – dela upp om det behövs

**Motion som stressavbrott**
När du känner dig stressad:
- Ta en snabb 10-minuters promenad
- Gör 20 jumping jacks
- Stretcha i 5 minuter
- Gå upp och ner för trappor

**Integrera rörelse i vardagen**
- Gå eller cykla till skolan
- Ta trapporna istället för hissen
- Stå upp och sträck på dig varje timme
- Ha walking meetings/samtal

**Yoga för stress**
Yoga kombinerar rörelse, andning och mindfulness. Särskilt effektivt för stress:
- Lugna positioner (forward folds)
- Andningsfokus
- Meditation i slutet

Hitta något du tycker om – det ökar chansen att du fortsätter!`
        },
        {
          id: 'course_stress_01_mod_02_lesson_04',
          title: 'Sömnhygien och återhämtning',
          type: 'text',
          durationMinutes: 12,
          content: `Sömn är kroppens viktigaste återhämtning. Utan tillräcklig sömn fungerar inget annat – varken stresshantering eller studier.

**Vad händer under sömn?**
- Hjärnan rensar ut skadliga proteiner
- Minnen konsolideras och lagras
- Kroppen reparerar och återhämtar sig
- Hormonsystem balanseras
- Immunförsvaret stärks

**Sömnbrist ökar stress**
- Högre kortisolnivåer
- Sämre emotionell reglering
- Försämrad kognitiv förmåga
- Lägre stresstolerans

**Hur mycket sömn behöver du?**
Tonåringar: 8-10 timmar
Unga vuxna: 7-9 timmar

**Sömnhygien-tips**

**Rutiner**
- Gå och lägg dig samma tid varje dag
- Vakna samma tid även på helger
- Ha en lugn kvällsrutin

**Miljö**
- Svalt, mörkt och tyst sovrum
- Bekväm säng och kudde
- Inga elektroniska apparater

**Före sömn**
- Undvik koffein efter kl 14
- Sluta med skärmar 1 timme innan
- Undvik tunga måltider sent
- Lugna aktiviteter: läs, meditera, bad

**Om du inte kan somna**
- Gå upp och gör något lugnt
- Återvänd till sängen när du är trött
- Undvik att titta på klockan
- Prova avslappningsövningar

**Power nap**
En kort tupplur (20-30 min) kan öka alerthet, men undvik att sova för sent på dagen.`
        }
      ]
    }
  ]
};

// Export all course content
export const allCourseContent: CourseContent[] = [
  studieteknikCourse,
  stresshanteringCourse
];

// Helper function to get course by ID
export function getCourseContentById(id: string): CourseContent | undefined {
  return allCourseContent.find(course => course.id === id);
}

// Helper function to get module by ID
export function getModuleById(courseId: string, moduleId: string): Module | undefined {
  const course = getCourseContentById(courseId);
  return course?.modules.find(module => module.id === moduleId);
}

// Helper function to get lesson by ID
export function getLessonById(courseId: string, moduleId: string, lessonId: string): Lesson | undefined {
  const module = getModuleById(courseId, moduleId);
  return module?.lessons.find(lesson => lesson.id === lessonId);
}

// Helper to find lesson across all courses
export function findLessonById(lessonId: string): { course: CourseContent; module: Module; lesson: Lesson } | undefined {
  for (const course of allCourseContent) {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return { course, module, lesson };
      }
    }
  }
  return undefined;
}

// Helper to find module across all courses
export function findModuleById(moduleId: string): { course: CourseContent; module: Module } | undefined {
  for (const course of allCourseContent) {
    const module = course.modules.find(m => m.id === moduleId);
    if (module) {
      return { course, module };
    }
  }
  return undefined;
}

// Calculate total course duration in minutes
export function getCourseDuration(course: CourseContent): number {
  return course.modules.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => 
      moduleTotal + (lesson.durationMinutes || 0), 0), 0);
}

// Get total lessons count
export function getTotalLessons(course: CourseContent): number {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}
