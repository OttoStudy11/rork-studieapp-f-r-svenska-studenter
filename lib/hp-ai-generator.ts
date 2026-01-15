import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { HPQuestion, HP_SECTIONS, HPSectionConfig } from '@/constants/hogskoleprovet';

const MAX_QUESTIONS_PER_REQUEST = 10;

export interface HPQuestionGenerationRequest {
  sectionCode: string;
  targetCount: number;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  topics?: string[];
  includeReadingPassages?: boolean;
}

export interface HPFullTestGenerationRequest {
  testName?: string;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  customSections?: string[];
}

export interface GeneratedHPQuestion {
  id: string;
  sectionCode: string;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'comparison' | 'reading_comprehension';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  readingPassage?: string;
  tags?: string[];
}

export interface HPGenerationResult {
  success: boolean;
  questions: GeneratedHPQuestion[];
  error?: string;
  metadata?: {
    requestedCount: number;
    generatedCount: number;
    sectionCode: string;
    timestamp: string;
    generationTimeMs: number;
  };
}

export interface HPFullTestResult {
  success: boolean;
  testId: string;
  testName: string;
  sections: {
    sectionCode: string;
    sectionName: string;
    questions: GeneratedHPQuestion[];
  }[];
  totalQuestions: number;
  error?: string;
  metadata?: {
    timestamp: string;
    generationTimeMs: number;
  };
}

const questionSchema = z.object({
  questionText: z.string().min(10).describe('The question text in Swedish'),
  questionType: z.enum(['multiple_choice', 'comparison', 'reading_comprehension']),
  options: z.array(z.string()).length(4).describe('Exactly 4 answer options'),
  correctAnswer: z.string().describe('The correct answer (must match one of the options exactly)'),
  explanation: z.string().describe('Explanation of why this answer is correct'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  readingPassage: z.string().optional().describe('Reading passage for LÄS section questions'),
  tags: z.array(z.string()).optional().describe('Related topics'),
});

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

function getSectionPromptDetails(section: HPSectionConfig): string {
  switch (section.code) {
    case 'ORD':
      return `
ORDFÖRSTÅELSE (ORD) - Vocabulary Understanding
- Create questions testing understanding of Swedish words and expressions
- Focus on: synonyms, antonyms, word meanings, contextual usage
- Include academic vocabulary, formal expressions, and nuanced words
- Question format: "Vad betyder ordet X?" or "Vilket ord är synonym till X?"
- Options should include plausible distractors with similar meanings or sounds
- Cover different word categories: nouns, verbs, adjectives, adverbs
- Include both common and advanced vocabulary from Swedish academic contexts`;

    case 'LÄS':
      return `
LÄSFÖRSTÅELSE (LÄS) - Reading Comprehension
- Create questions based on short reading passages (150-300 words)
- IMPORTANT: Always include a "readingPassage" field with the Swedish text
- Passage topics: science, culture, society, history, philosophy, environment
- Question types: main idea, inference, author's purpose, detail questions
- Test ability to understand explicit and implicit information
- Include questions about tone, argument structure, and conclusions
- Passages should be well-written Swedish prose suitable for academic assessment`;

    case 'MEK':
      return `
MENINGSKOMPLETTERING (MEK) - Sentence Completion
- Create sentence completion questions with blanks to fill
- Format: "Trots att hon var ____ lyckades hon ____ alla hinder."
- Focus on: logical relationships, grammar, vocabulary in context
- Test understanding of Swedish sentence structure and coherence
- Include connectors: trots, eftersom, därför, dock, emellertid
- Options should test both vocabulary and grammatical understanding
- One or two blanks per sentence`;

    case 'XYZ':
      return `
DIAGRAM, TABELLER & KARTOR (XYZ) - Data Interpretation
- Create questions about interpreting data (describe the data in text)
- Types: bar charts, line graphs, pie charts, tables, maps
- Include numerical data interpretation and percentage calculations
- Format: "Ett stapeldiagram visar försäljning: Jan: 100, Feb: 150..."
- Test: reading data, calculating percentages, comparing values, trends
- Questions should require mathematical reasoning with the data
- Always describe the data clearly in the question text`;

    case 'KVA':
      return `
KVANTITATIV ANALYS (KVA) - Quantitative Comparison
- Create comparison questions between two quantities
- Format: "Jämför: Kvantitet I: X | Kvantitet II: Y"
- Options must be exactly: ["Kvantitet I är större", "Kvantitet II är större", "Kvantiteterna är lika", "Informationen är otillräcklig"]
- Cover: algebra, geometry, percentages, ratios, statistics
- Include questions where the answer depends on unknown variables
- Test mathematical reasoning and problem-solving skills`;

    case 'DTK':
      return `
DATA OCH TEKNISK FÖRSTÅELSE (DTK) - Technical Data Analysis
- Create advanced data analysis questions
- Include: compound interest, growth rates, efficiency calculations
- Format: "En databas växer med 15% per månad. Om startdata är 10 TB..."
- Cover: technology, science, business scenarios
- Test: multi-step calculations, percentage changes, projections
- More complex than XYZ - requires deeper analysis`;

    default:
      return '';
  }
}

function buildSystemPrompt(section: HPSectionConfig): string {
  const sectionDetails = getSectionPromptDetails(section);
  
  return `Du är en expert på att skapa högskoleprovsliknande frågor för svenska studenter.
Du skapar frågor som liknar de officiella högskoleprovfrågorna från Skolverket.

🎯 DITT UPPDRAG:
Skapa autentiska högskoleprovsfrågor för delprovet ${section.name} (${section.fullName}).

${sectionDetails}

📋 GENERELLA REGLER:
1. Alla frågor och svar MÅSTE vara på svenska
2. Använd korrekt svensk grammatik och stavning
3. Svårighetsgrader:
   - easy: Grundläggande, direkta frågor
   - medium: Kräver viss analys eller koppling
   - hard: Komplexa frågor som kräver djupare förståelse
4. Varje fråga ska ha EXAKT 4 svarsalternativ
5. correctAnswer MÅSTE matcha ett av alternativen exakt
6. Förklaringen ska vara pedagogisk och hjälpa eleven förstå

📋 KVALITETSKRAV:
- Frågorna ska efterlikna riktiga högskoleprovsfrågor
- Distraktorer (felaktiga alternativ) ska vara trovärdiga
- Undvik uppenbara eller löjliga felaktiga alternativ
- Täck olika ämnesområden och svårighetsgrader
- Var konsekvent med format och stil`;
}

function buildUserPrompt(
  section: HPSectionConfig,
  count: number,
  difficulty?: 'all' | 'easy' | 'medium' | 'hard',
  topics?: string[]
): string {
  let prompt = `Skapa ${count} autentiska högskoleprovsfrågor för ${section.name} (${section.fullName}).`;

  if (difficulty && difficulty !== 'all') {
    const difficultyMap = {
      easy: 'lätta',
      medium: 'medelsvåra',
      hard: 'svåra',
    };
    prompt += `\n\nSvårighetsgrad: Alla frågor ska vara ${difficultyMap[difficulty]}.`;
  } else {
    prompt += `\n\nSvårighetsfördelning:
- ${Math.ceil(count * 0.3)} lätta frågor (easy)
- ${Math.ceil(count * 0.5)} medelsvåra frågor (medium)
- ${Math.floor(count * 0.2)} svåra frågor (hard)`;
  }

  if (topics && topics.length > 0) {
    prompt += `\n\nFokusera på dessa områden:\n${topics.map(t => `- ${t}`).join('\n')}`;
  }

  if (section.code === 'LÄS') {
    prompt += `\n\n⚠️ VIKTIGT: Inkludera ALLTID ett readingPassage-fält med läspassagen för varje fråga.`;
  }

  if (section.code === 'KVA') {
    prompt += `\n\n⚠️ VIKTIGT: Alternativen MÅSTE vara exakt:
["Kvantitet I är större", "Kvantitet II är större", "Kvantiteterna är lika", "Informationen är otillräcklig"]`;
  }

  prompt += `\n\n✅ Skapa nu ${count} högkvalitativa frågor.`;

  return prompt;
}

export async function generateHPQuestionsWithAI(
  request: HPQuestionGenerationRequest
): Promise<HPGenerationResult> {
  const startTime = Date.now();
  
  try {
    const section = HP_SECTIONS.find(s => s.code === request.sectionCode);
    if (!section) {
      return {
        success: false,
        questions: [],
        error: `Ogiltigt delprov: ${request.sectionCode}`,
      };
    }

    const targetCount = Math.min(request.targetCount, MAX_QUESTIONS_PER_REQUEST);
    console.log('🎯 [HP AI Generator] Starting generation:', {
      section: request.sectionCode,
      count: targetCount,
      difficulty: request.difficulty,
    });

    const systemPrompt = buildSystemPrompt(section);
    const userPrompt = buildUserPrompt(section, targetCount, request.difficulty, request.topics);

    console.log('📝 [HP AI Generator] Calling AI...');

    const response = await generateObject({
      schema: questionsResponseSchema,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`,
        },
      ],
    });

    const result = response as { questions: any[] };

    if (!result || !result.questions || !Array.isArray(result.questions)) {
      console.error('❌ [HP AI Generator] Invalid response structure:', result);
      throw new Error('AI returnerade ogiltigt svar');
    }

    if (result.questions.length === 0) {
      throw new Error('AI genererade 0 frågor');
    }

    const validatedQuestions = validateAndNormalizeQuestions(
      result.questions,
      request.sectionCode
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [HP AI Generator] Generated ${validatedQuestions.length} questions in ${duration}ms`);

    return {
      success: true,
      questions: validatedQuestions,
      metadata: {
        requestedCount: targetCount,
        generatedCount: validatedQuestions.length,
        sectionCode: request.sectionCode,
        timestamp: new Date().toISOString(),
        generationTimeMs: duration,
      },
    };
  } catch (error: any) {
    console.error('❌ [HP AI Generator] Generation failed:', error);

    let errorMessage = error?.message || 'Okänt fel';
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'AI-tjänsten svarade inte i tid. Försök igen.';
    } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
      errorMessage = 'För många förfrågningar. Vänta en stund och försök igen.';
    } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      errorMessage = 'Nätverksfel. Kontrollera din internetanslutning.';
    }

    return {
      success: false,
      questions: [],
      error: errorMessage,
      metadata: {
        requestedCount: request.targetCount,
        generatedCount: 0,
        sectionCode: request.sectionCode,
        timestamp: new Date().toISOString(),
        generationTimeMs: Date.now() - startTime,
      },
    };
  }
}

export async function generateFullHPTestWithAI(
  request: HPFullTestGenerationRequest = {}
): Promise<HPFullTestResult> {
  const startTime = Date.now();
  const testId = `ai-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const testName = request.testName || `AI-genererat prov ${new Date().toLocaleDateString('sv-SE')}`;

  const sectionsToGenerate = request.customSections 
    ? HP_SECTIONS.filter(s => request.customSections?.includes(s.code))
    : HP_SECTIONS;

  const results: { sectionCode: string; sectionName: string; questions: GeneratedHPQuestion[] }[] = [];
  let totalQuestions = 0;

  console.log('🎯 [HP AI Generator] Starting full test generation:', {
    testId,
    sections: sectionsToGenerate.map(s => s.code),
  });

  for (const section of sectionsToGenerate) {
    try {
      console.log(`📝 [HP AI Generator] Generating section: ${section.code}`);
      
      const result = await generateHPQuestionsWithAI({
        sectionCode: section.code,
        targetCount: Math.min(section.questionCount, MAX_QUESTIONS_PER_REQUEST),
        difficulty: request.difficulty,
      });

      if (result.success && result.questions.length > 0) {
        results.push({
          sectionCode: section.code,
          sectionName: section.fullName,
          questions: result.questions,
        });
        totalQuestions += result.questions.length;
      } else {
        console.warn(`⚠️ [HP AI Generator] Section ${section.code} failed:`, result.error);
      }
    } catch (error) {
      console.error(`❌ [HP AI Generator] Error generating section ${section.code}:`, error);
    }
  }

  const duration = Date.now() - startTime;

  if (totalQuestions === 0) {
    return {
      success: false,
      testId,
      testName,
      sections: [],
      totalQuestions: 0,
      error: 'Kunde inte generera några frågor',
      metadata: {
        timestamp: new Date().toISOString(),
        generationTimeMs: duration,
      },
    };
  }

  console.log(`✅ [HP AI Generator] Full test generated in ${duration}ms:`, {
    testId,
    totalQuestions,
    sectionsGenerated: results.length,
  });

  return {
    success: true,
    testId,
    testName,
    sections: results,
    totalQuestions,
    metadata: {
      timestamp: new Date().toISOString(),
      generationTimeMs: duration,
    },
  };
}

function validateAndNormalizeQuestions(
  questions: any[],
  sectionCode: string
): GeneratedHPQuestion[] {
  return questions
    .filter((q, index) => {
      if (!q.questionText || typeof q.questionText !== 'string') {
        console.warn(`[HP AI] Question ${index} missing questionText`);
        return false;
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        console.warn(`[HP AI] Question ${index} invalid options`);
        return false;
      }
      if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        console.warn(`[HP AI] Question ${index} correctAnswer not in options`);
        return false;
      }
      if (!q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty)) {
        console.warn(`[HP AI] Question ${index} invalid difficulty`);
        return false;
      }
      return true;
    })
    .map((q, index) => ({
      id: `ai-${sectionCode}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
      sectionCode,
      questionNumber: index + 1,
      questionText: q.questionText.trim(),
      questionType: q.questionType || 'multiple_choice',
      options: q.options.map((opt: string) => opt.trim()),
      correctAnswer: q.correctAnswer.trim(),
      explanation: q.explanation?.trim() || 'Ingen förklaring tillgänglig.',
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      readingPassage: q.readingPassage?.trim(),
      tags: Array.isArray(q.tags) ? q.tags : undefined,
    }));
}

export function convertToHPQuestion(generated: GeneratedHPQuestion): HPQuestion {
  return {
    id: generated.id,
    sectionCode: generated.sectionCode,
    questionNumber: generated.questionNumber,
    questionText: generated.questionText,
    questionType: generated.questionType,
    options: generated.options,
    correctAnswer: generated.correctAnswer,
    explanation: generated.explanation,
    difficulty: generated.difficulty,
    readingPassage: generated.readingPassage,
  };
}

export function convertMultipleToHPQuestions(generated: GeneratedHPQuestion[]): HPQuestion[] {
  return generated.map(convertToHPQuestion);
}
