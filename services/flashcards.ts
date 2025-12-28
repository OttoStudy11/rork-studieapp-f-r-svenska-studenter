import { supabase } from '@/lib/supabase';
import { GeneratedFlashcard } from '@/lib/flashcard-ai-v2';

export interface Flashcard {
  id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
  context?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  last_reviewed_at?: string;
  next_review_at: string;
  quality?: number;
  total_reviews: number;
  correct_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  description?: string;
  total_cards: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFlashcardSetParams {
  userId: string;
  courseId: string;
  name: string;
  description?: string;
}

export interface SaveFlashcardParams {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
  context?: string;
  tags?: string[];
}

export async function getCourseFlashcards(courseId: string): Promise<{
  flashcards: Flashcard[];
  error?: string;
}> {
  try {
    console.log(`📖 [Flashcards Service] Fetching flashcards for course: ${courseId}`);

    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Flashcards Service] Error fetching flashcards:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return { flashcards: [], error: error.message };
    }

    console.log(`✅ [Flashcards Service] Fetched ${data?.length || 0} flashcards`);
    return { flashcards: (data || []) as Flashcard[] };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception fetching flashcards:', err);
    return { flashcards: [], error: err?.message || 'Unknown error' };
  }
}

export async function getUserFlashcardProgress(
  userId: string,
  courseId: string
): Promise<{
  progress: UserFlashcardProgress[];
  error?: string;
}> {
  try {
    console.log(
      `📊 [Flashcards Service] Fetching progress for user ${userId}, course ${courseId}`
    );

    const { data: flashcardsData } = await supabase
      .from('flashcards')
      .select('id')
      .eq('course_id', courseId);

    if (!flashcardsData || flashcardsData.length === 0) {
      return { progress: [] };
    }

    const flashcardIds = flashcardsData.map((f) => f.id);

    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .in('flashcard_id', flashcardIds);

    if (error) {
      console.error('❌ [Flashcards Service] Error fetching progress:', {
        message: error.message,
        code: error.code,
      });
      return { progress: [], error: error.message };
    }

    console.log(`✅ [Flashcards Service] Fetched progress for ${data?.length || 0} cards`);
    return { progress: (data || []) as UserFlashcardProgress[] };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception fetching progress:', err);
    return { progress: [], error: err?.message || 'Unknown error' };
  }
}

export async function saveFlashcardBatch(
  flashcards: GeneratedFlashcard[],
  courseId: string,
  moduleId?: string,
  lessonId?: string
): Promise<{
  success: boolean;
  savedCount: number;
  error?: string;
}> {
  try {
    console.log(`💾 [Flashcards Service] Saving ${flashcards.length} flashcards for course ${courseId}...`);

    if (!flashcards || flashcards.length === 0) {
      console.warn('⚠️ [Flashcards Service] No flashcards to save');
      return { success: false, savedCount: 0, error: 'Inga flashcards att spara' };
    }

    if (!courseId) {
      console.error('❌ [Flashcards Service] Missing courseId');
      return { success: false, savedCount: 0, error: 'Kurs-ID saknas' };
    }

    const flashcardsToInsert = flashcards.map((fc) => ({
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

    console.log(`📤 [Flashcards Service] Inserting ${flashcardsToInsert.length} flashcards to database...`);

    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      console.error('❌ [Flashcards Service] Database error saving flashcards:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      if (error.code === '42501' || error.message?.includes('policy')) {
        return { 
          success: false, 
          savedCount: 0, 
          error: 'Behörighetsproblem med databasen. Kontakta support.' 
        };
      }
      if (error.code === '23503') {
        return { 
          success: false, 
          savedCount: 0, 
          error: 'Kursen finns inte i databasen.' 
        };
      }
      
      return { success: false, savedCount: 0, error: `Databasfel: ${error.message}` };
    }

    const savedCount = data?.length || 0;
    console.log(`✅ [Flashcards Service] Successfully saved ${savedCount} flashcards`);

    return { success: true, savedCount };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception saving flashcards:', {
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.substring(0, 200),
    });
    return { success: false, savedCount: 0, error: err?.message || 'Ett oväntat fel uppstod' };
  }
}

export async function updateFlashcardProgress(
  userId: string,
  flashcardId: string,
  progressData: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
    quality: number;
    correct: boolean;
  },
  existingProgress?: UserFlashcardProgress
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`📝 [Flashcards Service] Updating progress for flashcard ${flashcardId}`);

    const dataToUpsert = {
      user_id: userId,
      flashcard_id: flashcardId,
      ease_factor: progressData.easeFactor,
      interval: progressData.interval,
      repetitions: progressData.repetitions,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: progressData.nextReview.toISOString(),
      quality: progressData.quality,
      total_reviews: (existingProgress?.total_reviews || 0) + 1,
      correct_reviews:
        (existingProgress?.correct_reviews || 0) + (progressData.correct ? 1 : 0),
    };

    const { error } = await supabase
      .from('user_flashcard_progress')
      .upsert(dataToUpsert, {
        onConflict: 'user_id,flashcard_id',
      });

    if (error) {
      console.error('❌ [Flashcards Service] Error updating progress:', {
        message: error.message,
        code: error.code,
      });
      return { success: false, error: error.message };
    }

    console.log('✅ [Flashcards Service] Progress updated successfully');
    return { success: true };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception updating progress:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function deleteFlashcard(flashcardId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`🗑️ [Flashcards Service] Deleting flashcard ${flashcardId}`);

    const { error } = await supabase.from('flashcards').delete().eq('id', flashcardId);

    if (error) {
      console.error('❌ [Flashcards Service] Error deleting flashcard:', {
        message: error.message,
        code: error.code,
      });
      return { success: false, error: error.message };
    }

    console.log('✅ [Flashcards Service] Flashcard deleted successfully');
    return { success: true };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception deleting flashcard:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function getFlashcardSets(courseId: string): Promise<{
  sets: FlashcardSet[];
  error?: string;
}> {
  try {
    console.log(`📚 [Flashcards Service] Fetching flashcard sets for course ${courseId}`);

    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Flashcards Service] Error fetching sets:', {
        message: error.message,
        code: error.code,
      });
      return { sets: [], error: error.message };
    }

    console.log(`✅ [Flashcards Service] Fetched ${data?.length || 0} sets`);
    return { sets: (data || []) as FlashcardSet[] };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception fetching sets:', err);
    return { sets: [], error: err?.message || 'Unknown error' };
  }
}

export async function createFlashcardSet(
  params: CreateFlashcardSetParams
): Promise<{
  set?: FlashcardSet;
  error?: string;
}> {
  try {
    console.log(`✨ [Flashcards Service] Creating flashcard set for course ${params.courseId}`);

    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert([{
        user_id: params.userId,
        course_id: params.courseId,
        name: params.name,
        description: params.description || null,
        total_cards: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ [Flashcards Service] Error creating set:', {
        message: error.message,
        code: error.code,
      });
      return { error: error.message };
    }

    console.log('✅ [Flashcards Service] Flashcard set created successfully');
    return { set: data as FlashcardSet };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception creating set:', err);
    return { error: err?.message || 'Unknown error' };
  }
}

export async function getDueFlashcards(
  userId: string,
  courseId: string
): Promise<{
  dueCards: Flashcard[];
  error?: string;
}> {
  try {
    console.log(`⏰ [Flashcards Service] Fetching due flashcards for user ${userId}`);

    const { flashcards } = await getCourseFlashcards(courseId);
    const { progress } = await getUserFlashcardProgress(userId, courseId);

    const progressMap = new Map<string, UserFlashcardProgress>();
    progress.forEach((p) => progressMap.set(p.flashcard_id, p));

    const now = new Date();
    const dueCards = flashcards.filter((card) => {
      const cardProgress = progressMap.get(card.id);
      if (!cardProgress) return true;
      return new Date(cardProgress.next_review_at) <= now;
    });

    console.log(`✅ [Flashcards Service] Found ${dueCards.length} due flashcards`);
    return { dueCards };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception fetching due flashcards:', err);
    return { dueCards: [], error: err?.message || 'Unknown error' };
  }
}

export async function getFlashcardStats(
  userId: string,
  courseId: string
): Promise<{
  total: number;
  reviewed: number;
  mastered: number;
  due: number;
  error?: string;
}> {
  try {
    const { flashcards } = await getCourseFlashcards(courseId);
    const { progress } = await getUserFlashcardProgress(userId, courseId);
    const { dueCards } = await getDueFlashcards(userId, courseId);

    const mastered = progress.filter((p) => p.repetitions >= 3).length;

    return {
      total: flashcards.length,
      reviewed: progress.length,
      mastered,
      due: dueCards.length,
    };
  } catch (err: any) {
    console.error('❌ [Flashcards Service] Exception fetching stats:', err);
    return {
      total: 0,
      reviewed: 0,
      mastered: 0,
      due: 0,
      error: err?.message || 'Unknown error',
    };
  }
}
