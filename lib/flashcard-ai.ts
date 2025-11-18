import { generateObject, generateText } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { supabase } from './supabase';

export interface GenerateFlashcardsOptions {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  count?: number;
}

const hardcodedCourseContent: Record<string, string> = {
  'RELREL01': `Kurs: Religionskunskap 1
Utforska världsreligioner, etik och existentiella frågor

Modul 1: Världsreligionernas ursprung och utveckling
Lär dig om de fem världsreligionerna och deras historia

Judendom:
- Monoteistisk religion - tro på en Gud (JHWH)
- Heliga skrifter: Tanakh (inklusive Toran)
- Viktiga profeter: Moses, Abraham, Isak, Jakob
- Sabbaten (lördagen) är helig vilodag
- Synagogan är den judiska gudstjänstlokalen
- Bar/Bat Mitzvah markerar religiös vuxenblivning

Kristendom:
- Tro på treenigheten: Fader, Son och Helig Ande
- Heliga skrifter: Bibeln (Gamla och Nya testamentet)
- Jesus Kristus som central figur
- Söndagen som vilodag och gudstjänstdag
- Kyrkan som gudstjänstlokal
- Sakrament: dop och nattvard

Islam:
- Fem pelare: Trosbekännelse, bön, allmosor, fasta, pilgrimsfärd
- Heliga skrifter: Koranen och Hadith
- Muhammad som den siste profeten
- Fredagen som böndag
- Moskén som gudstjänstlokal
- Ramadan som fastemånad

Hinduism:
- Många gudar och gudinnor (polyteism)
- Heliga skrifter: Vedaskrifterna och Bhagavad Gita
- Tro på reinkarnation och karma
- Kastsystemet (historiskt)
- Templet som central gudstjänstplats
- Yoga och meditation som andliga praktiker

Buddhism:
- Fyra ädla sanningar om lidandets natur
- Den åttafaldiga vägen som väg till upplysning
- Buddha som lärare och förebild
- Meditation som central praktik
- Nirvan som slutmål
- Kloster och tempel som andliga centra

Modul 2: Religiösa ritualer och högtider
Utforska olika religiösa firanden och deras betydelse

Livscykelritualer:
- Födelse: Dop (kristendom), Brit Milah (judendom), Aqiqah (islam)
- Vuxenblivning: Konfirmation, Bar/Bat Mitzvah
- Äktenskap: Bröllopsritualer i olika religioner
- Död: Begravningsritualer och sorgepraktiker
- Ritualer skapar sammanhang och gemenskap

Årliga högtider:
- Judendom: Pesach (påsken), Jom Kippur, Chanukka
- Kristendom: Jul, Påsk, Pingst
- Islam: Eid al-Fitr, Eid al-Adha
- Hinduism: Diwali, Holi
- Buddhism: Vesak, Ullambana

Modul 3: Religion och etik
Undersök hur religion påverkar moraliska värderingar

Etiska grundprinciper:
- Den gyllene regeln finns i olika former i alla religioner
- Rättvisa och medkänsla som centrala värden
- Ansvar för de svaga och utsatta
- Ärlighet och trovärdighet
- Respekt för livet

Etiska dilemman:
- Bioetik: Abort, stamcellsforskning, eutanasi
- Miljöetik: Människans ansvar för skapelsen
- Social rättvisa: Ojämlikhet och fattigdom
- Sexualitet och familj: Äktenskap, samlevnad
- Krig och fred: Rättfärdigt krig, pacifism

Modul 4: Livsåskådningar och existentiella frågor
Reflektera över livets stora frågor och olika perspektiv

Existentiella frågor:
- Livets mening och syfte
- Lidandets och ondskans problem
- Döden och livet efter detta
- Människans natur och värde

Religiösa perspektiv:
- Monoteistiska perspektiv: Guds plan och vilja
- Reinkarnation och karma i österländska religioner
- Teodicéproblemet: Varför finns ondska?
- Bön och meditation som sätt att söka svar

Sekulära livsåskådningar:
- Humanism: Människan som måttstock
- Existentialism: Frihet och ansvar
- Naturalism: Vetenskaplig världsbild
- Agnosticism och ateism

Modul 5: Religion och samhällsfrågor
Undersök religionens roll i moderna samhällsdebatter

Religion och jämställdhet:
- Olika tolkningar av religiösa texter om kön
- Kvinnors roller i religiösa samfund
- Kvinnliga religiösa ledare och präster
- Klädkoder och deras betydelse
- Progressiva och konservativa rörelser

Religion och mänskliga rättigheter:
- Religionsfrihet som mänsklig rättighet
- HBTQ+-rättigheter ur olika religiösa perspektiv
- Barnets rättigheter och religiös uppfostran
- Yttrandefrihet vs. respekt för religioner

Religion i konflikt och fred:
- Religiösa konflikter i historia och nutid
- Fundamentalism och extremism
- Interreligiös dialog och samarbete
- Religionens roll i fredsprocesser`
};

export async function generateFlashcardsFromContent(
  options: GenerateFlashcardsOptions
): Promise<void> {
  try {
    const { courseId, moduleId, lessonId, count = 20 } = options;

    console.log('🎯 Starting flashcard generation with options:', options);

    let courseName = '';
    let courseDescription = '';

    if (hardcodedCourseContent[courseId]) {
      console.log('📖 Using hardcoded course content for:', courseId);
      courseName = courseId === 'RELREL01' ? 'Religionskunskap 1' : 'Hardcoded Course';
      courseDescription = 'Utforska världsreligioner, etik och existentiella frågor';
    } else {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('title, description')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('❌ Error fetching course:', courseError);
        throw new Error(`Kunde inte hämta kursdata: ${courseError.message}`);
      }
      
      if (!courseData) {
        throw new Error('Kursen hittades inte');
      }
      
      courseName = courseData.title;
      courseDescription = courseData.description || '';
      console.log('✅ Course data fetched:', courseName);
    }

    console.log('🤖 Generating flashcards with AI based on course name and subject...');
    const result = await generateObject({
    schema: z.object({
      flashcards: z.array(
        z.object({
          question: z.string().describe('Clear, specific question in Swedish'),
          answer: z.string().describe('Concise, accurate answer in Swedish'),
          difficulty: z.number().min(1).max(3).describe('1 = easy, 2 = medium, 3 = hard'),
          explanation: z.string().optional().describe('Additional context or explanation in Swedish'),
          context: z.string().optional().describe('Where this concept appears in the curriculum'),
          tags: z.array(z.string()).optional().describe('Related topics or concepts'),
        })
      ),
    }),
    messages: [
      {
        role: 'user',
        content: `Du är en expert på att skapa pedagogiska flashcards för svenska gymnasieelever som förbereder sig för prov och inlärning.

🎯 DITT MÅL:
Skapa ${count} flashcards för kursen "${courseName}" baserat på kursens innehåll och nationella kursplan.

📚 KURS:
${courseName}
${courseDescription}

📋 INSTRUKTIONER:

1. ANVÄND DIN KUNSKAP:
   - Du har tillgång till Sveriges nationella kursplaner och läroplan
   - Basera flashcards på typiskt kursinnehåll för denna kurs
   - Täck viktiga koncept, teorier, definitioner och samband
   - Anpassa till gymnasienivå

2. FRÅGOR:
   - Tydliga och konkreta (undvik vaga formuleringar)
   - Täcker viktiga koncept, definitioner, begrepp och samband
   - Varierar mellan faktafrågor, förståelsefrågor och tillämpningsfrågor
   - Använder olika frågetyper: "Vad är...?", "Förklara...", "Varför..?", "Hur..?", "Jämför..."
   - Undvik ja/nej-frågor

3. SVAR:
   - Koncisa men kompletta (2-4 meningar)
   - Pedagogiska och lätta att komma ihåg
   - Inkluderar konkreta exempel där relevant
   - Korrekt svenska och facktermer

4. SVÅRIGHETSGRAD:
   - 1 (Lätt): Grundläggande fakta och definitioner - ~40%
   - 2 (Medel): Förståelse och samband mellan koncept - ~40%
   - 3 (Svår): Analys, tillämpning och komplexa samband - ~20%

5. FÖRKLARINGAR (explanation):
   - Lägg till fördjupande förklaringar för svårare koncept
   - Använd analogier och exempel
   - Hjälp eleven att förstå "varför" inte bara "vad"

6. KONTEXT (context):
   - Ange vilket område eller tema konceptet tillhör
   - Exempel: "Världsreligionernas ursprung", "Etiska dilemman", "Religion i samhället"

7. TAGGAR (tags):
   - Lägg till 2-4 relevanta nyckelord per flashcard
   - Exempel: ["Islam", "Fem pelare", "Grundbegrepp"]

8. VARIATION:
   - Täck olika teman och områden inom kursen
   - Blanda olika typer av frågor (definitioner, förklaringar, jämförelser, tillämpningar)
   - Se till att flashcards ger en bred täckning av kursens innehåll

✅ SKAPA NU ${count} HÖGKVALITATIVA FLASHCARDS:
Fokusera på att täcka hela kursens centrala innehåll jämnt, med betoning på de viktigaste koncepten som eleverna behöver kunna för att klara kursen.`,
      },
    ],
  });

    console.log(`✅ AI generated ${result.flashcards.length} flashcards`);

    const flashcardsToInsert = result.flashcards.map((fc) => ({
      course_id: courseId,
      module_id: moduleId || null,
      lesson_id: lessonId || null,
      question: fc.question,
      answer: fc.answer,
      difficulty: fc.difficulty,
      explanation: fc.explanation || null,
      context: fc.context || null,
      tags: fc.tags || null,
    }));

    console.log('💾 Inserting flashcards to database...');
    const { error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert);

    if (insertError) {
      console.error('❌ Error inserting flashcards:', insertError);
      throw new Error(`Kunde inte spara flashcards: ${insertError.message}`);
    }

    console.log(`✅ Successfully generated ${flashcardsToInsert.length} flashcards for ${courseName}`);
  } catch (error: any) {
    console.error('❌ Error in generateFlashcardsFromContent:', error);
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Ett oväntat fel uppstod när flashcards skulle genereras. Försök igen.');
  }
}

export async function generateAIExplanation(
  question: string,
  answer: string,
  userConfusion?: string
): Promise<string> {
  const messages = [
    {
      role: 'user' as const,
      content: `Du är en tålmodig och pedagogisk lärare för svenska gymnasieelever.

Fråga: ${question}
Svar: ${answer}
${userConfusion ? `Eleven undrar: ${userConfusion}` : ''}

Ge en tydlig, steg-för-steg förklaring på svenska som hjälper eleven att förstå svaret bättre.
Använd exempel och analogier där det är relevant.
Håll förklaringen koncis men grundlig (max 200 ord).`,
    },
  ];

  const textResult = await generateText({ messages });
  return textResult;
}
