export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easeFactor: Number(newEaseFactor.toFixed(2)),
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}

export function getQualityFromSwipe(correct: boolean): number {
  return correct ? 4 : 2;
}
