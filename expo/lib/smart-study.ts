import { supabase } from './supabase';

export interface StudyPattern {
  bestTimeOfDay: string;
  averageSessionMinutes: number;
  optimalSessionMinutes: number;
  sessionsPerDay: number;
  mostProductiveDay: string;
  totalMinutesThisWeek: number;
  fatigueRisk: 'low' | 'medium' | 'high';
  consistencyScore: number;
}

export interface SmartRecommendation {
  type: 'duration' | 'break' | 'warmup' | 'focus' | 'schedule';
  title: string;
  description: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionRoute?: string;
}

export interface SessionAnalysis {
  patterns: StudyPattern;
  recommendations: SmartRecommendation[];
  warmupQuestions: WarmupQuestion[];
}

export interface WarmupQuestion {
  question: string;
  answer: string;
  hint: string;
}

const DAY_NAMES_SV = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

export async function analyzeStudyPatterns(userId: string): Promise<StudyPattern> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', thirtyDaysAgo.toISOString())
      .order('start_time', { ascending: false });

    const allSessions = (sessions || []) as any[];

    if (allSessions.length === 0) {
      return getDefaultPattern();
    }

    const hourCounts = new Map<number, number>();
    const dayCounts = new Map<number, number>();
    const durations: number[] = [];
    const sessionsByDate = new Map<string, number>();

    for (const session of allSessions) {
      const startDate = new Date(session.start_time);
      const hour = startDate.getHours();
      const day = startDate.getDay();
      const dateStr = startDate.toISOString().split('T')[0];
      const duration = session.duration || 25;

      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      durations.push(duration);
      sessionsByDate.set(dateStr, (sessionsByDate.get(dateStr) || 0) + duration);
    }

    let bestHour = 9;
    let maxHourCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        bestHour = hour;
      }
    });

    let bestDay = 1;
    let maxDayCount = 0;
    dayCounts.forEach((count, day) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        bestDay = day;
      }
    });

    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 25;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let weeklyMinutes = 0;
    sessionsByDate.forEach((minutes, dateStr) => {
      if (new Date(dateStr) >= sevenDaysAgo) {
        weeklyMinutes += minutes;
      }
    });

    const datesWithStudy = Array.from(sessionsByDate.keys()).filter(d => new Date(d) >= sevenDaysAgo).length;
    const consistencyScore = Math.min(100, Math.round((datesWithStudy / 7) * 100));

    const recentSessions = allSessions.slice(0, 5);
    const recentAvg = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.duration || 25), 0) / recentSessions.length
      : 25;

    let fatigueRisk: 'low' | 'medium' | 'high' = 'low';
    if (recentAvg < avgDuration * 0.7) fatigueRisk = 'high';
    else if (recentAvg < avgDuration * 0.85) fatigueRisk = 'medium';

    let optimalMinutes = avgDuration;
    if (fatigueRisk === 'high') optimalMinutes = Math.max(15, avgDuration - 10);
    else if (fatigueRisk === 'low') optimalMinutes = Math.min(60, avgDuration + 5);

    const sessionsPerDay = allSessions.length > 0
      ? Math.round((allSessions.length / 30) * 10) / 10
      : 0;

    const bestTimeLabel = bestHour < 12 ? 'Förmiddag' : bestHour < 17 ? 'Eftermiddag' : 'Kväll';

    return {
      bestTimeOfDay: bestTimeLabel,
      averageSessionMinutes: avgDuration,
      optimalSessionMinutes: optimalMinutes,
      sessionsPerDay,
      mostProductiveDay: DAY_NAMES_SV[bestDay],
      totalMinutesThisWeek: weeklyMinutes,
      fatigueRisk,
      consistencyScore,
    };
  } catch (error) {
    console.error('Error analyzing study patterns:', error);
    return getDefaultPattern();
  }
}

function getDefaultPattern(): StudyPattern {
  return {
    bestTimeOfDay: 'Förmiddag',
    averageSessionMinutes: 25,
    optimalSessionMinutes: 25,
    sessionsPerDay: 0,
    mostProductiveDay: 'Måndag',
    totalMinutesThisWeek: 0,
    fatigueRisk: 'low',
    consistencyScore: 0,
  };
}

export function generateRecommendations(patterns: StudyPattern): SmartRecommendation[] {
  const recs: SmartRecommendation[] = [];

  if (patterns.fatigueRisk === 'high') {
    recs.push({
      type: 'break',
      title: 'Ta en paus',
      description: 'Dina senaste sessioner visar tecken på trötthet. Prova kortare pass med längre pauser.',
      emoji: '😴',
      priority: 'high',
    });
  }

  if (patterns.consistencyScore < 50) {
    recs.push({
      type: 'schedule',
      title: 'Bygg en rutin',
      description: `Du studerar i genomsnitt ${patterns.sessionsPerDay} pass/dag. Försök studera minst 1 pass varje dag för bättre resultat.`,
      emoji: '📅',
      priority: 'high',
      actionLabel: 'Starta session',
      actionRoute: '/timer',
    });
  }

  recs.push({
    type: 'duration',
    title: `Optimal tid: ${patterns.optimalSessionMinutes} min`,
    description: `Baserat på din historik presterar du bäst med ${patterns.optimalSessionMinutes}-minuters sessioner. Din mest produktiva tid är ${patterns.bestTimeOfDay.toLowerCase()}.`,
    emoji: '⏱️',
    priority: 'medium',
  });

  if (patterns.totalMinutesThisWeek > 0) {
    const hoursThisWeek = Math.round(patterns.totalMinutesThisWeek / 60 * 10) / 10;
    recs.push({
      type: 'focus',
      title: `${hoursThisWeek}h denna vecka`,
      description: `Du har studerat ${hoursThisWeek} timmar denna vecka. ${patterns.mostProductiveDay} är din mest produktiva dag!`,
      emoji: '📊',
      priority: 'low',
    });
  }

  recs.push({
    type: 'warmup',
    title: 'Uppvärmningsfrågor',
    description: 'Starta varje session med snabba repetitionsfrågor för att aktivera ditt minne.',
    emoji: '🧠',
    priority: 'medium',
    actionLabel: 'Repetera nu',
    actionRoute: undefined,
  });

  return recs;
}

export async function generateWarmupQuestions(
  userId: string,
  courseId?: string
): Promise<WarmupQuestion[]> {
  try {
    let query = supabase
      .from('flashcards')
      .select('question, answer')
      .limit(50);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: flashcards } = await query;

    if (!flashcards || flashcards.length === 0) {
      return getDefaultWarmupQuestions();
    }

    const { data: progress } = await supabase
      .from('user_flashcard_progress')
      .select('flashcard_id, correct_reviews, total_reviews')
      .eq('user_id', userId);

    const progressMap = new Map<string, any>();
    (progress || []).forEach(p => progressMap.set(p.flashcard_id, p));

    const weakCards = flashcards
      .filter(fc => {
        const prog = progressMap.get((fc as any).id);
        if (!prog) return true;
        const rate = prog.total_reviews > 0 ? prog.correct_reviews / prog.total_reviews : 0;
        return rate < 0.7;
      })
      .slice(0, 5);

    const cardsToUse = weakCards.length >= 3 ? weakCards : flashcards.slice(0, 5);

    return cardsToUse.map(fc => ({
      question: fc.question,
      answer: fc.answer,
      hint: fc.answer.substring(0, Math.min(20, fc.answer.length)) + '...',
    }));
  } catch (error) {
    console.error('Error generating warmup questions:', error);
    return getDefaultWarmupQuestions();
  }
}

function getDefaultWarmupQuestions(): WarmupQuestion[] {
  return [
    {
      question: 'Vad innebär spaced repetition?',
      answer: 'En inlärningsteknik där du repeterar material med ökande intervaller för att stärka långtidsminnet.',
      hint: 'En inlärningsteknik...',
    },
    {
      question: 'Varför är aktiv återhämtning effektivare än passiv läsning?',
      answer: 'Aktiv återhämtning tvingar hjärnan att hämta information från minnet, vilket stärker minnesbanorna mer än att bara läsa om samma text.',
      hint: 'Aktiv återhämtning tvingar...',
    },
    {
      question: 'Vad är Feynman-tekniken?',
      answer: 'En studieteknik där du förklarar ett koncept med enkla ord som om du lärde ut det till någon annan, för att identifiera kunskapsluckor.',
      hint: 'En studieteknik där du...',
    },
  ];
}

export async function getFullSessionAnalysis(
  userId: string,
  courseId?: string
): Promise<SessionAnalysis> {
  const patterns = await analyzeStudyPatterns(userId);
  const recommendations = generateRecommendations(patterns);
  const warmupQuestions = await generateWarmupQuestions(userId, courseId);

  return { patterns, recommendations, warmupQuestions };
}
