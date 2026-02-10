import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { supabase } from './supabase';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GeneratedQuiz {
  questions: QuizQuestion[];
  title: string;
  courseId: string;
}

export interface GenerateQuizOptions {
  courseId: string;
  moduleId?: string;
  count?: number;
}

export interface GenerateQuizFromTextOptions {
  text: string;
  courseId: string;
  count?: number;
}

const MAX_QUESTIONS = 15 as const;

async function resolveCourseId(courseId: string): Promise<{ id: string; title: string; description: string }> {
  const { data: courseById } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('id', courseId)
    .maybeSingle();

  if (courseById) {
    return { id: courseById.id, title: courseById.title, description: courseById.description || '' };
  }

  const { data: courseByCode } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('course_code', courseId)
    .maybeSingle();

  if (courseByCode) {
    return { id: courseByCode.id, title: courseByCode.title, description: courseByCode.description || '' };
  }

  const { data: uniById } = await supabase
    .from('university_courses')
    .select('id, title, description')
    .eq('id', courseId)
    .maybeSingle();

  if (uniById) {
    return { id: uniById.id, title: uniById.title, description: uniById.description || '' };
  }

  const { data: uniByCode } = await supabase
    .from('university_courses')
    .select('id, title, description')
    .eq('course_code', courseId)
    .maybeSingle();

  if (uniByCode) {
    return { id: uniByCode.id, title: uniByCode.title, description: uniByCode.description || '' };
  }

  throw new Error('Kursen hittades inte.');
}

export async function generateQuizFromCourse(options: GenerateQuizOptions): Promise<GeneratedQuiz> {
  const { courseId, count: requestedCount = 10 } = options;
  const count = Math.min(requestedCount, MAX_QUESTIONS);

  console.log('🧠 Starting quiz generation for course:', courseId);

  const course = await resolveCourseId(courseId);
  console.log('✅ Resolved course:', course.title);

  const quizSchema = z.object({
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })),
  });

  const result = await generateObject({
    schema: quizSchema as any,
    messages: [
      {
        role: 'user',
        content: `Du är en expert på att skapa quiz-frågor för svenska gymnasie- och högskolestudenter.

🎯 SKAPA ${count} FLERVALSFRÅGOR för kursen "${course.title}".

📚 KURSBESKRIVNING:
${course.description}

📋 REGLER:
1. Alla frågor på SVENSKA
2. Exakt 4 svarsalternativ per fråga
3. Exakt 1 korrekt svar (correctIndex = index 0-3)
4. Tydlig förklaring varför rätt svar är korrekt
5. Svårighetsfördelning: ~40% easy, ~40% medium, ~20% hard
6. Täck olika ämnesområden inom kursen
7. Undvik ja/nej-frågor
8. Svarsalternativen ska vara rimliga och inte uppenbart felaktiga
9. Förklaringen ska vara pedagogisk och hjälpa studenten förstå

SKAPA ${count} UNIKA, HÖGKVALITATIVA FLERVALSFRÅGOR NU.`,
      },
    ],
  });

  if (!result || !result.questions || !Array.isArray(result.questions)) {
    throw new Error('AI-generering misslyckades: Inget resultat returnerades');
  }

  console.log(`✅ AI generated ${result.questions.length} quiz questions`);

  const questions: QuizQuestion[] = result.questions.map((q: any, index: number) => {
    const correctAnswer = q.options[q.correctIndex];
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      id: `quiz-${course.id}-${Date.now()}-${index}`,
      question: q.question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    };
  });

  return {
    questions,
    title: course.title,
    courseId: course.id,
  };
}

export async function generateQuizFromText(options: GenerateQuizFromTextOptions): Promise<GeneratedQuiz> {
  const { text, courseId, count: requestedCount = 10 } = options;
  const count = Math.min(requestedCount, MAX_QUESTIONS);

  if (text.trim().length < 50) {
    throw new Error('Texten är för kort. Ange minst 50 tecken.');
  }

  console.log('🧠 Generating quiz from user text, length:', text.length);

  let resolvedCourseId = courseId;
  try {
    const course = await resolveCourseId(courseId);
    resolvedCourseId = course.id;
  } catch {
    console.log('Could not resolve course, using provided ID');
  }

  const quizSchema = z.object({
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })),
  });

  const result = await generateObject({
    schema: quizSchema as any,
    messages: [
      {
        role: 'user',
        content: `Du är en expert på att skapa quiz-frågor för svenska studenter.

🎯 SKAPA ${count} FLERVALSFRÅGOR baserat på texten nedan.

📝 TEXT:
${text}

📋 REGLER:
1. Alla frågor på SVENSKA
2. Exakt 4 svarsalternativ per fråga
3. Exakt 1 korrekt svar (correctIndex = index 0-3)
4. Tydlig förklaring varför rätt svar är korrekt
5. Svårighetsfördelning: ~40% easy, ~40% medium, ~20% hard
6. Basera alla frågor på textens innehåll
7. Svarsalternativen ska vara rimliga distraktorer
8. Förklaringen ska vara pedagogisk

SKAPA ${count} UNIKA FLERVALSFRÅGOR NU.`,
      },
    ],
  });

  if (!result || !result.questions || !Array.isArray(result.questions)) {
    throw new Error('AI-generering misslyckades: Inget resultat returnerades');
  }

  console.log(`✅ AI generated ${result.questions.length} quiz questions from text`);

  const questions: QuizQuestion[] = result.questions.map((q: any, index: number) => {
    const correctAnswer = q.options[q.correctIndex];
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      id: `quiz-text-${Date.now()}-${index}`,
      question: q.question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    };
  });

  return {
    questions,
    title: 'Quiz från text',
    courseId: resolvedCourseId,
  };
}
