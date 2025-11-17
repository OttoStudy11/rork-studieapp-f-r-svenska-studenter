import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { supabase } from './supabase';

const flashcardSchema = z.object({
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
});

export interface GenerateFlashcardsOptions {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  count?: number;
}

export async function generateFlashcardsFromContent(
  options: GenerateFlashcardsOptions
): Promise<void> {
  try {
    const { courseId, moduleId, lessonId, count = 20 } = options;

    console.log('🎯 Starting flashcard generation with options:', options);

    let content = '';
    let courseName = '';

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
    content += `Kurs: ${courseData.title}\n${courseData.description || ''}\n\n`;
    console.log('✅ Course data fetched:', courseName);

    if (lessonId) {
      const { data: lessonData, error: lessonError } = await supabase
        .from('course_lessons')
        .select('title, content')
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('❌ Error fetching lesson:', lessonError);
        throw new Error(`Kunde inte hämta lektion: ${lessonError.message}`);
      }
      
      if (lessonData) {
        content += `Lektion: ${lessonData.title}\n${lessonData.content}\n`;
        console.log('✅ Lesson data added');
      }
    } else if (moduleId) {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('title, content')
        .eq('module_id', moduleId)
        .limit(5);

      if (lessonsError) {
        console.error('❌ Error fetching lessons:', lessonsError);
        throw new Error(`Kunde inte hämta lektioner: ${lessonsError.message}`);
      }
      
      if (lessonsData && lessonsData.length > 0) {
        lessonsData.forEach((lesson) => {
          content += `Lektion: ${lesson.title}\n${lesson.content}\n\n`;
        });
        console.log(`✅ ${lessonsData.length} lessons added`);
      }
    } else {
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          title,
          course_lessons (title, content)
        `)
        .eq('course_id', courseId)
        .limit(3);

      if (modulesError) {
        console.error('❌ Error fetching modules:', modulesError);
        throw new Error(`Kunde inte hämta moduler: ${modulesError.message}`);
      }
      
      if (modulesData && modulesData.length > 0) {
        modulesData.forEach((module: any) => {
          content += `Modul: ${module.title}\n`;
          module.course_lessons?.slice(0, 3).forEach((lesson: any) => {
            content += `  Lektion: ${lesson.title}\n${lesson.content}\n`;
          });
          content += '\n';
        });
        console.log(`✅ ${modulesData.length} modules added`);
      }
    }

    if (!content.trim() || content.length < 100) {
      console.error('❌ Not enough content to generate flashcards');
      throw new Error('Det finns inte tillräckligt med innehåll i kursen för att generera flashcards. Kontakta support.');
    }

    console.log('🤖 Generating flashcards with AI...');
    const result = await generateObject({
    schema: flashcardSchema,
    messages: [
      {
        role: 'user',
        content: `Du är en expert på att skapa pedagogiska flashcards för svenska gymnasieelever som förbereder sig för prov och inlärning.

🎯 DITT MÅL:
Skapa ${count} flashcards som effektivt hjälper elever att lära sig och komma ihåg kursinnehållet.

📋 KRAV PÅ FLASHCARDS:

1. FRÅGOR:
   - Tydliga och konkreta (undvik vaga formuleringar)
   - Täcker viktiga koncept, definitioner, begrepp och samband
   - Varierar mellan faktafrågor, förståelsefrågor och tillämpningsfrågor
   - Använder olika frågetyper: "Vad är...?", "Förklara...", "Varför..?", "Hur..?", "Jämför..."
   - Undvik ja/nej-frågor

2. SVAR:
   - Koncisa men kompletta (2-4 meningar)
   - Pedagogiska och lätta att komma ihåg
   - Inkluderar konkreta exempel där relevant
   - Korrekt svenska och facktermer

3. SVÅRIGHETSGRAD:
   - 1 (Lätt): Grundläggande fakta och definitioner
   - 2 (Medel): Förståelse och samband mellan koncept
   - 3 (Svår): Analys, tillämpning och komplexa samband
   - Fördela jämnt: ~40% lätt, ~40% medel, ~20% svår

4. FÖRKLARINGAR (explanation):
   - Lägg till fördjupande förklaringar för svårare koncept
   - Använd analogier och exempel
   - Hjälp eleven att förstå "varför" inte bara "vad"

5. KONTEXT (context):
   - Ange var i kursen konceptet dyker upp
   - Exempel: "Modul 1: Världsreligionernas ursprung"

6. TAGGAR (tags):
   - Lägg till relevanta nyckelord för kategorisering
   - Exempel: ["Islam", "Fem pelare", "Grundbegrepp"]

📚 KURSINNEHÅLL:
${content}

✅ SKAPA NU ${count} FLASHCARDS:
Fokusera på att täcka hela kursinnehållet jämnt, med betoning på de viktigaste koncepten som eleverna behöver kunna för att klara kursen.`,
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

  const explanation = await generateObject({
    schema: z.object({
      explanation: z.string(),
    }),
    messages,
  });

  return explanation.explanation;
}
