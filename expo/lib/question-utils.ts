import { HPQuestion } from '@/constants/hogskoleprovet';

/**
 * Sections with fixed answer options (KVA: kvantitativa jämförelser,
 * NOG: kvantitativa resonemang). Their options follow a strict order on the
 * real exam (A–D) and must never be shuffled.
 */
const FIXED_OPTION_SECTIONS = new Set(['KVA', 'NOG']);

export function shuffleAnswerOptions(question: HPQuestion): HPQuestion {
  // KVA and NOG have fixed options in a defined order — show them as-is.
  if (FIXED_OPTION_SECTIONS.has(question.sectionCode)) {
    return question;
  }

  const { options, correctAnswer } = question;
  
  const shuffledOptions = [...options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer,
  };
}

export function shuffleQuestions<T>(questions: T[]): T[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
