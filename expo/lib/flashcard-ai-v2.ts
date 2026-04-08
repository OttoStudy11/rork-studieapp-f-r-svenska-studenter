import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

const MAX_FLASHCARDS = 30 as const;

export interface FlashcardGenerationRequest {
  courseName: string;
  courseDescription?: string;
  subject?: string;
  targetCount: number;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  topics?: string[];
  language?: 'sv' | 'en';
  images?: Array<{ base64: string; mimeType: string }>;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: 1 | 2 | 3;
  explanation?: string;
  context?: string;
  tags?: string[];
}

export interface FlashcardGenerationResult {
  success: boolean;
  flashcards: GeneratedFlashcard[];
  error?: string;
  metadata?: {
    requestedCount: number;
    generatedCount: number;
    timestamp: string;
  };
}

const flashcardSchema = z.object({
  question: z.string().min(5).describe('Clear, specific question in the target language'),
  answer: z.string().min(3).describe('Concise, accurate answer'),
  difficulty: z.number().min(1).max(3).describe('1 = easy, 2 = medium, 3 = hard'),
  explanation: z.string().optional().describe('Additional context or explanation'),
  context: z.string().optional().describe('Where this concept appears in the curriculum'),
  tags: z.array(z.string()).optional().describe('Related topics or concepts'),
});

const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1),
});

export async function generateFlashcardsWithAI(
  request: FlashcardGenerationRequest,
  onProgress?: (progress: number) => void
): Promise<FlashcardGenerationResult> {
  const startTime = Date.now();
  
  try {
    const targetCount = Math.min(request.targetCount, MAX_FLASHCARDS);
    console.log('🎯 [AI Flashcards] Starting generation:', {
      course: request.courseName,
      description: request.courseDescription?.substring(0, 100),
      count: targetCount,
      requestedCount: request.targetCount,
      difficulty: request.difficulty,
    });

    const language = request.language || 'sv';
    
    console.log(`🚀 [AI Flashcards] Generating ${targetCount} cards in a single optimized request`);
    onProgress?.(10);
    
    const difficultyDistribution = getDifficultyDistribution(
      targetCount,
      request.difficulty
    );

    const systemPrompt = buildSystemPrompt(language);
    const userPrompt = buildUserPrompt(
      request,
      difficultyDistribution,
      language
    );
    
    console.log(`📡 [AI Flashcards] Requesting ${targetCount} cards from AI...`);
    console.log(`📡 [AI Flashcards] Prompt preview:`, userPrompt.substring(0, 200));
    const hasImages = request.images && request.images.length > 0;
    console.log(`📸 [AI Flashcards] Images attached: ${hasImages ? request.images!.length : 0}`);
    onProgress?.(20);
    
    let response: any;
    try {
      const messageContent: Array<{ type: string; text?: string; image?: string }> = [];

      if (hasImages) {
        for (const img of request.images!) {
          messageContent.push({
            type: 'image',
            image: `data:${img.mimeType};base64,${img.base64}`,
          });
        }
      }

      messageContent.push({
        type: 'text',
        text: hasImages
          ? `${systemPrompt}\n\n${userPrompt}\n\nANALYSERA BILDERNA OVAN noggrant. Extrahera allt innehåll, text, formler, diagram och koncept från bilderna. Skapa sedan flashcards baserat på bildinnehållet.`
          : `${systemPrompt}\n\n${userPrompt}`,
      });

      response = await generateObject({
        schema: flashcardsResponseSchema,
        messages: [
          {
            role: 'user',
            content: hasImages ? messageContent : `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      });
    } catch (aiError: any) {
      console.error('❌ [AI Flashcards] AI API call failed:', {
        message: aiError?.message,
        name: aiError?.name,
      });
      throw new Error(`AI-tjänsten är tillfälligt otillgänglig. Försök igen om en stund. (${aiError?.message || 'Unknown error'})`);
    }
    
    const result = response as { flashcards: any[] };
    
    console.log(`✅ [AI Flashcards] Generation complete:`, {
      received: result?.flashcards?.length || 0,
      target: targetCount,
      sampleQuestion: result?.flashcards?.[0]?.question?.substring(0, 50),
    });
    
    onProgress?.(80);

    if (!result?.flashcards || result.flashcards.length === 0) {
      console.error('❌ [AI Flashcards] AI returned empty or invalid response:', JSON.stringify(result).substring(0, 500));
      throw new Error('AI kunde inte generera flashcards för denna kurs. Försök med en annan kurs eller lägg till egen text.');
    }

    const validatedFlashcards = validateAndNormalizeFlashcards(result.flashcards);
    
    if (validatedFlashcards.length === 0) {
      console.error('❌ [AI Flashcards] All flashcards failed validation');
      throw new Error('Genererade flashcards var inte giltiga. Försök igen.');
    }
    
    onProgress?.(100);
    
    const duration = Date.now() - startTime;
    console.log(`✅ [AI Flashcards] Generated ${validatedFlashcards.length} flashcards in ${duration}ms`);

    return {
      success: true,
      flashcards: validatedFlashcards,
      metadata: {
        requestedCount: targetCount,
        generatedCount: validatedFlashcards.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('❌ [AI Flashcards] Generation failed:', {
      message: error?.message,
      stack: error?.stack?.substring(0, 300),
    });

    // Return user-friendly error message
    let errorMessage = error?.message || 'Ett oväntat fel uppstod';
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
      errorMessage = 'Nätverksfel. Kontrollera din internetanslutning och försök igen.';
    }

    return {
      success: false,
      flashcards: [],
      error: errorMessage,
      metadata: {
        requestedCount: Math.min(request.targetCount, MAX_FLASHCARDS),
        generatedCount: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

function getDifficultyDistribution(
  total: number,
  difficulty?: 'all' | 'easy' | 'medium' | 'hard'
): { easy: number; medium: number; hard: number } {
  if (difficulty === 'easy') {
    return { easy: total, medium: 0, hard: 0 };
  }
  if (difficulty === 'medium') {
    return { easy: 0, medium: total, hard: 0 };
  }
  if (difficulty === 'hard') {
    return { easy: 0, medium: 0, hard: total };
  }

  const easy = Math.ceil(total * 0.4);
  const hard = Math.ceil(total * 0.2);
  const medium = total - easy - hard;

  return { easy, medium, hard };
}

function buildSystemPrompt(language: 'sv' | 'en'): string {
  if (language === 'sv') {
    return `Du är en expert på att skapa pedagogiska flashcards för svenska gymnasieelever.

🎯 DITT UPPDRAG:
Skapa högkvalitativa flashcards som hjälper elever att lära sig och förbereda sig för prov.

📋 REGLER FÖR FRÅGOR:
- Tydliga och konkreta (undvik vaga formuleringar)
- Fokusera på viktiga koncept, definitioner och samband
- Variera frågetyper: "Vad är...?", "Förklara...", "Varför..?", "Hur..?", "Jämför..."
- Undvik ja/nej-frågor
- Använd korrekt svensk grammatik och stavning

📋 REGLER FÖR SVAR:
- Koncisa men kompletta (2-4 meningar)
- Pedagogiska och lätta att komma ihåg
- Inkludera konkreta exempel där relevant
- Korrekt terminologi
- Undvik alltför tekniskt språk om inte nödvändigt

📋 SVÅRIGHETSGRAD:
- 1 (Lätt): Grundläggande fakta och definitioner
- 2 (Medel): Förståelse och samband mellan koncept
- 3 (Svår): Analys, tillämpning och komplexa samband

📋 FÖRKLARINGAR (explanation):
- Lägg till fördjupande förklaringar för svårare koncept
- Använd analogier och exempel
- Hjälp eleven att förstå "varför" inte bara "vad"

📋 KONTEXT (context):
- Ange vilket område eller tema konceptet tillhör
- Exempel: "Världsreligioner", "Etik", "Samhällsfrågor"

📋 TAGGAR (tags):
- Lägg till 2-4 relevanta nyckelord per flashcard
- Exempel: ["Islam", "Fem pelare", "Grundbegrepp"]

✅ KVALITETSKRAV:
- Alla flashcards måste vara korrekta och faktabaserade
- Täck olika teman och områden inom kursen
- Blanda olika typer av frågor
- Ge en bred täckning av kursens innehåll`;
  }

  return `You are an expert at creating educational flashcards for high school students.

🎯 YOUR MISSION:
Create high-quality flashcards that help students learn and prepare for exams.

📋 QUESTION RULES:
- Clear and specific (avoid vague formulations)
- Focus on important concepts, definitions, and relationships
- Vary question types: "What is...?", "Explain...", "Why..?", "How..?", "Compare..."
- Avoid yes/no questions
- Use correct grammar and spelling

📋 ANSWER RULES:
- Concise but complete (2-4 sentences)
- Educational and easy to remember
- Include concrete examples where relevant
- Correct terminology
- Avoid overly technical language unless necessary

📋 DIFFICULTY LEVELS:
- 1 (Easy): Basic facts and definitions
- 2 (Medium): Understanding and relationships between concepts
- 3 (Hard): Analysis, application, and complex relationships

📋 EXPLANATIONS:
- Add in-depth explanations for more difficult concepts
- Use analogies and examples
- Help students understand "why" not just "what"

📋 CONTEXT:
- Specify which area or theme the concept belongs to
- Example: "World Religions", "Ethics", "Social Issues"

📋 TAGS:
- Add 2-4 relevant keywords per flashcard
- Example: ["Islam", "Five Pillars", "Core Concepts"]

✅ QUALITY REQUIREMENTS:
- All flashcards must be correct and fact-based
- Cover different themes and areas within the course
- Mix different types of questions
- Provide broad coverage of course content`;
}

function buildUserPrompt(
  request: FlashcardGenerationRequest,
  distribution: { easy: number; medium: number; hard: number },
  language: 'sv' | 'en'
): string {
  const { courseName, courseDescription, subject, targetCount, topics } = request;

  if (language === 'sv') {
    let prompt = `Skapa ${targetCount} flashcards för kursen "${courseName}".`;

    if (courseDescription) {
      prompt += `\n\n📚 KURSBESKRIVNING:\n${courseDescription}`;
    }

    if (subject) {
      prompt += `\n\n🎓 ÄMNE: ${subject}`;
    }

    if (topics && topics.length > 0) {
      prompt += `\n\n📌 FOKUSERA PÅ DESSA OMRÅDEN:\n${topics.map((t) => `- ${t}`).join('\n')}`;
    }

    prompt += `\n\n📊 SVÅRIGHETSFÖRDELNING:`;
    if (distribution.easy > 0) prompt += `\n- ${distribution.easy} lätta flashcards (svårighetsgrad 1)`;
    if (distribution.medium > 0) prompt += `\n- ${distribution.medium} medelsvåra flashcards (svårighetsgrad 2)`;
    if (distribution.hard > 0) prompt += `\n- ${distribution.hard} svåra flashcards (svårighetsgrad 3)`;

    prompt += `\n\n✅ SKAPA NU ${targetCount} HÖGKVALITATIVA FLASHCARDS.`;

    return prompt;
  }

  let prompt = `Create ${targetCount} flashcards for the course "${courseName}".`;

  if (courseDescription) {
    prompt += `\n\n📚 COURSE DESCRIPTION:\n${courseDescription}`;
  }

  if (subject) {
    prompt += `\n\n🎓 SUBJECT: ${subject}`;
  }

  if (topics && topics.length > 0) {
    prompt += `\n\n📌 FOCUS ON THESE AREAS:\n${topics.map((t) => `- ${t}`).join('\n')}`;
  }

  prompt += `\n\n📊 DIFFICULTY DISTRIBUTION:`;
  if (distribution.easy > 0) prompt += `\n- ${distribution.easy} easy flashcards (difficulty 1)`;
  if (distribution.medium > 0) prompt += `\n- ${distribution.medium} medium flashcards (difficulty 2)`;
  if (distribution.hard > 0) prompt += `\n- ${distribution.hard} hard flashcards (difficulty 3)`;

  prompt += `\n\n✅ CREATE ${targetCount} HIGH-QUALITY FLASHCARDS NOW.`;

  return prompt;
}

function validateAndNormalizeFlashcards(
  flashcards: any[]
): GeneratedFlashcard[] {
  return flashcards
    .filter((card) => {
      if (!card.question || typeof card.question !== 'string') return false;
      if (!card.answer || typeof card.answer !== 'string') return false;
      if (!card.difficulty || ![1, 2, 3].includes(card.difficulty)) return false;
      return true;
    })
    .map((card) => ({
      question: card.question.trim(),
      answer: card.answer.trim(),
      difficulty: card.difficulty as 1 | 2 | 3,
      explanation: card.explanation?.trim() || undefined,
      context: card.context?.trim() || undefined,
      tags: Array.isArray(card.tags)
        ? card.tags.filter((t: any) => typeof t === 'string').map((t: any) => t.trim())
        : undefined,
    }));
}

export async function generateSingleFlashcard(
  question: string,
  answer: string,
  targetDifficulty: 1 | 2 | 3,
  language: 'sv' | 'en' = 'sv'
): Promise<GeneratedFlashcard | null> {
  try {
    const prompt =
      language === 'sv'
        ? `Skapa en förbättrad version av denna flashcard:

ORIGINAL FRÅGA: ${question}
ORIGINAL SVAR: ${answer}

Svårighetsgrad: ${targetDifficulty}

Förbättra formulering, tydlighet och pedagogiskt värde. Behåll samma koncept men gör det bättre.`
        : `Create an improved version of this flashcard:

ORIGINAL QUESTION: ${question}
ORIGINAL ANSWER: ${answer}

Difficulty: ${targetDifficulty}

Improve wording, clarity, and educational value. Keep the same concept but make it better.`;

    const result = await generateObject({
      schema: z.object({
        question: z.string(),
        answer: z.string(),
        difficulty: z.number().min(1).max(3),
        explanation: z.string().optional(),
      }) as any,
      messages: [{ role: 'user', content: prompt }],
    }) as any;

    if (!result || !result.question || !result.answer) {
      return null;
    }

    return {
      question: result.question,
      answer: result.answer,
      difficulty: result.difficulty as 1 | 2 | 3,
      explanation: result.explanation,
    };
  } catch (error) {
    console.error('❌ [AI Flashcards] Failed to regenerate card:', error);
    return null;
  }
}
