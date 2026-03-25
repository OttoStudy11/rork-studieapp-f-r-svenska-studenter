import { supabase } from './supabase';

export interface TopicMastery {
  topic: string;
  courseId: string;
  courseTitle: string;
  totalAttempts: number;
  correctAttempts: number;
  masteryPercent: number;
  trend: 'improving' | 'stable' | 'declining';
  lastPracticed: string | null;
  color: string;
}

export interface WeakPoint {
  topic: string;
  courseId: string;
  courseTitle: string;
  masteryPercent: number;
  mistakeCount: number;
  suggestion: string;
}

export interface MasteryHeatmapData {
  courses: CourseHeatmap[];
  overallMastery: number;
  strongestArea: string;
  weakestArea: string;
}

export interface CourseHeatmap {
  courseId: string;
  courseTitle: string;
  topics: TopicMastery[];
  averageMastery: number;
}

export async function getWeakPoints(userId: string): Promise<WeakPoint[]> {
  try {
    console.log('🔍 Analyzing weak points for user:', userId);

    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('id, course_id, tags, context, difficulty');

    if (!flashcards || flashcards.length === 0) return [];

    const { data: progress } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId);

    const courseIds = [...new Set(flashcards.map(f => f.course_id))];

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    const courseMap = new Map<string, string>();
    (courses || []).forEach(c => courseMap.set(c.id, c.title));

    const progressMap = new Map<string, any>();
    (progress || []).forEach(p => progressMap.set(p.flashcard_id, p));

    const topicStats = new Map<string, {
      courseId: string;
      total: number;
      correct: number;
      mistakes: number;
    }>();

    for (const fc of flashcards) {
      const prog = progressMap.get(fc.id);
      const topicName = fc.context || (fc.tags as string[] | null)?.[0] || 'Allmänt';
      const key = `${fc.course_id}::${topicName}`;

      if (!topicStats.has(key)) {
        topicStats.set(key, {
          courseId: fc.course_id,
          total: 0,
          correct: 0,
          mistakes: 0,
        });
      }

      const stats = topicStats.get(key)!;
      if (prog) {
        stats.total += prog.total_reviews || 0;
        stats.correct += prog.correct_reviews || 0;
        stats.mistakes += (prog.total_reviews || 0) - (prog.correct_reviews || 0);
      } else {
        stats.total += 1;
        stats.mistakes += 1;
      }
    }

    const weakPoints: WeakPoint[] = [];

    topicStats.forEach((stats, key) => {
      const [courseId, topic] = key.split('::');
      const masteryPercent = stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0;

      if (masteryPercent < 70 && stats.total >= 1) {
        let suggestion = '';
        if (masteryPercent < 30) {
          suggestion = 'Gå igenom grunderna igen och använd flashcards dagligen.';
        } else if (masteryPercent < 50) {
          suggestion = 'Fokusera på detta ämne med extra repetitioner.';
        } else {
          suggestion = 'Nästan där! Några fler repetitioner borde räcka.';
        }

        weakPoints.push({
          topic,
          courseId,
          courseTitle: courseMap.get(courseId) || 'Okänd kurs',
          masteryPercent,
          mistakeCount: stats.mistakes,
          suggestion,
        });
      }
    });

    weakPoints.sort((a, b) => a.masteryPercent - b.masteryPercent);

    console.log(`🔍 Found ${weakPoints.length} weak points`);
    return weakPoints.slice(0, 15);
  } catch (error) {
    console.error('Error analyzing weak points:', error);
    return [];
  }
}

export async function getMasteryHeatmap(userId: string): Promise<MasteryHeatmapData> {
  try {
    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('id, course_id, tags, context, difficulty');

    if (!flashcards || flashcards.length === 0) {
      return { courses: [], overallMastery: 0, strongestArea: '-', weakestArea: '-' };
    }

    const { data: progress } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId);

    const courseIds = [...new Set(flashcards.map(f => f.course_id))];

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    const courseMap = new Map<string, string>();
    (courses || []).forEach(c => courseMap.set(c.id, c.title));

    const progressMap = new Map<string, any>();
    (progress || []).forEach(p => progressMap.set(p.flashcard_id, p));

    const courseTopics = new Map<string, Map<string, { total: number; correct: number; lastReviewed: string | null }>>();

    for (const fc of flashcards) {
      if (!courseTopics.has(fc.course_id)) {
        courseTopics.set(fc.course_id, new Map());
      }

      const topicName = fc.context || (fc.tags as string[] | null)?.[0] || 'Allmänt';
      const topics = courseTopics.get(fc.course_id)!;

      if (!topics.has(topicName)) {
        topics.set(topicName, { total: 0, correct: 0, lastReviewed: null });
      }

      const topicData = topics.get(topicName)!;
      const prog = progressMap.get(fc.id);

      if (prog) {
        topicData.total += prog.total_reviews || 0;
        topicData.correct += prog.correct_reviews || 0;
        if (prog.last_reviewed_at && (!topicData.lastReviewed || prog.last_reviewed_at > topicData.lastReviewed)) {
          topicData.lastReviewed = prog.last_reviewed_at;
        }
      } else {
        topicData.total += 1;
      }
    }

    const courseHeatmaps: CourseHeatmap[] = [];
    let allTopics: TopicMastery[] = [];

    courseTopics.forEach((topics, courseId) => {
      const topicList: TopicMastery[] = [];

      topics.forEach((data, topicName) => {
        const mastery = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

        const topic: TopicMastery = {
          topic: topicName,
          courseId,
          courseTitle: courseMap.get(courseId) || 'Okänd kurs',
          totalAttempts: data.total,
          correctAttempts: data.correct,
          masteryPercent: mastery,
          trend: 'stable' as const,
          lastPracticed: data.lastReviewed,
          color: getMasteryColor(mastery),
        };

        topicList.push(topic);
        allTopics.push(topic);
      });

      topicList.sort((a, b) => b.masteryPercent - a.masteryPercent);

      const avgMastery = topicList.length > 0
        ? Math.round(topicList.reduce((sum, t) => sum + t.masteryPercent, 0) / topicList.length)
        : 0;

      courseHeatmaps.push({
        courseId,
        courseTitle: courseMap.get(courseId) || 'Okänd kurs',
        topics: topicList,
        averageMastery: avgMastery,
      });
    });

    courseHeatmaps.sort((a, b) => b.averageMastery - a.averageMastery);

    const overallMastery = allTopics.length > 0
      ? Math.round(allTopics.reduce((sum, t) => sum + t.masteryPercent, 0) / allTopics.length)
      : 0;

    const strongest = allTopics.length > 0
      ? allTopics.reduce((best, t) => t.masteryPercent > best.masteryPercent ? t : best, allTopics[0])
      : null;

    const weakest = allTopics.length > 0
      ? allTopics.reduce((worst, t) => t.masteryPercent < worst.masteryPercent ? t : worst, allTopics[0])
      : null;

    return {
      courses: courseHeatmaps,
      overallMastery,
      strongestArea: strongest ? strongest.topic : '-',
      weakestArea: weakest ? weakest.topic : '-',
    };
  } catch (error) {
    console.error('Error generating mastery heatmap:', error);
    return { courses: [], overallMastery: 0, strongestArea: '-', weakestArea: '-' };
  }
}

export function getMasteryColor(percent: number): string {
  if (percent >= 90) return '#059669';
  if (percent >= 75) return '#10B981';
  if (percent >= 60) return '#84CC16';
  if (percent >= 45) return '#F59E0B';
  if (percent >= 30) return '#F97316';
  if (percent >= 15) return '#EF4444';
  return '#DC2626';
}

export function getMasteryLabel(percent: number): string {
  if (percent >= 90) return 'Behärskad';
  if (percent >= 75) return 'Stark';
  if (percent >= 60) return 'Bra';
  if (percent >= 45) return 'Medel';
  if (percent >= 30) return 'Svag';
  if (percent >= 15) return 'Mycket svag';
  return 'Ej påbörjad';
}
