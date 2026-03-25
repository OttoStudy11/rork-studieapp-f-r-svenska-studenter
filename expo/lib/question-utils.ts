import { HPQuestion } from '@/constants/hogskoleprovet';

export function shuffleAnswerOptions(question: HPQuestion): HPQuestion {
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
