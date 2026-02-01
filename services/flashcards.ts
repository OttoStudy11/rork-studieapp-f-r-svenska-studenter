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

    // First try to fetch by course_id directly
    let { data, error } = await supabase
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

    // If no flashcards found, try to find the actual course id
    if (!data || data.length === 0) {
      console.log(`🔍 [Flashcards Service] No flashcards found by id, checking course tables...`);
      
      // Try courses table (gymnasium)
      const { data: courseData } = await supabase
        .from('courses')
        .select('id')
        .or(`id.eq.${courseId},course_code.ilike.${courseId}`)
        .maybeSingle();

      if (courseData && courseData.id !== courseId) {
        console.log(`🔍 [Flashcards Service] Found course in courses table: ${courseData.id}`);
        const result = await supabase
          .from('flashcards')
          .select('*')
          .eq('course_id', courseData.id)
          .order('created_at', { ascending: false });
        
        if (!result.error) {
          data = result.data;
        }
      } else {
        // Try university_courses table
        const { data: uniCourseData } = await supabase
          .from('university_courses')
          .select('id')
          .or(`id.eq.${courseId},course_code.ilike.${courseId}`)
          .maybeSingle();

        if (uniCourseData && uniCourseData.id !== courseId) {
          console.log(`🔍 [Flashcards Service] Found course in university_courses table: ${uniCourseData.id}`);
          const result = await supabase
            .from('flashcards')
            .select('*')
            .eq('course_id', uniCourseData.id)
            .order('created_at', { ascending: false });
          
          if (!result.error) {
            data = result.data;
          }
        }
      }
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

    let effectiveCourseId = courseId;
    let courseTitle = formatCourseName(courseId);
    let courseSubject = guessSubjectFromCode(courseId);

    // IMPORTANT: The flashcards table has a foreign key to 'courses' table ONLY
    // So we MUST ensure the course exists in 'courses' table, even for university courses
    
    // First, check if course exists in courses table
    console.log(`🔍 [Flashcards Service] Checking if course ${courseId} exists in courses table...`);
    const { data: courseById, error: courseByIdError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .maybeSingle();

    if (courseByIdError) {
      console.warn(`⚠️ [Flashcards Service] Error checking course by id:`, courseByIdError.message);
    }

    if (courseById) {
      console.log(`✅ [Flashcards Service] Course found in courses table: ${courseById.id} (${courseById.title})`);
      effectiveCourseId = courseById.id;
    } else {
      // Try to find by course_code in courses table
      console.log(`🔍 [Flashcards Service] Course not found by id, trying course_code: ${courseId}`);
      const { data: courseByCode } = await supabase
        .from('courses')
        .select('id, title')
        .eq('course_code', courseId.toUpperCase())
        .maybeSingle();

      if (courseByCode) {
        effectiveCourseId = courseByCode.id;
        console.log(`✅ [Flashcards Service] Found course by code in courses: ${effectiveCourseId} (${courseByCode.title})`);
      } else {
        // Check if it exists in university_courses to get proper title/subject
        console.log(`🔍 [Flashcards Service] Checking university_courses table for metadata...`);
        const { data: uniCourse } = await supabase
          .from('university_courses')
          .select('id, title, course_code, subject_area, credits')
          .or(`id.eq.${courseId},course_code.eq.${courseId.toUpperCase()}`)
          .maybeSingle();

        if (uniCourse) {
          console.log(`📚 [Flashcards Service] Found university course: ${uniCourse.title}`);
          courseTitle = uniCourse.title;
          courseSubject = uniCourse.subject_area || courseSubject;
          effectiveCourseId = uniCourse.id;
        }
        
        // Create in courses table (flashcards FK requires this)
        console.log(`📝 [Flashcards Service] Creating course in courses table: ${effectiveCourseId}`);
        const cleanId = effectiveCourseId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        
        const { data: newCourse, error: createError } = await supabase
          .from('courses')
          .insert({
            id: cleanId,
            title: courseTitle,
            course_code: courseId.toUpperCase(),
            subject: courseSubject,
            description: `${courseTitle}. Flashcards genererade av AI.`,
            level: 'hogskola',
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ [Flashcards Service] Failed to create course:', {
            message: createError.message,
            code: createError.code,
          });
          
          // If duplicate, try to find existing
          if (createError.code === '23505') {
            const { data: anyMatch } = await supabase
              .from('courses')
              .select('id')
              .or(`id.eq.${cleanId},course_code.eq.${courseId.toUpperCase()}`)
              .limit(1)
              .maybeSingle();
            
            if (anyMatch) {
              effectiveCourseId = anyMatch.id;
              console.log(`✅ [Flashcards Service] Found existing course: ${effectiveCourseId}`);
            } else {
              return {
                success: false,
                savedCount: 0,
                error: `Kursen "${courseId}" kunde inte hittas eller skapas. Försök igen.`
              };
            }
          } else {
            return { success: false, savedCount: 0, error: `Kunde inte skapa kursen: ${createError.message}` };
          }
        } else if (newCourse) {
          effectiveCourseId = newCourse.id;
          console.log(`✅ [Flashcards Service] Created course: ${effectiveCourseId}`);
        }
      }
    }

    const flashcardsToInsert = flashcards.map((fc) => ({
      course_id: effectiveCourseId,
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
    console.log(`📤 [Flashcards Service] Sample flashcard:`, JSON.stringify(flashcardsToInsert[0], null, 2));

    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      console.error('❌ [Flashcards Service] Database error saving flashcards:', {
        message: error.message,
        code: error.code,
        details: JSON.stringify(error.details),
        hint: error.hint,
      });
      
      if (error.code === '42501' || error.message?.includes('policy')) {
        return { 
          success: false, 
          savedCount: 0, 
          error: 'Behörighetsproblem med databasen. Kör SQL-filen fix-flashcards-rls-policies.sql i Supabase.' 
        };
      }
      if (error.code === '23503') {
        return { 
          success: false, 
          savedCount: 0, 
          error: `Kursen "${effectiveCourseId}" kunde inte hittas. Kurs-ID: ${courseId}. Kontakta supporten om problemet kvarstår.` 
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

// Helper function to format course name from code
function formatCourseName(courseCode: string): string {
  const code = courseCode.toUpperCase();
  
  // Common Swedish course mappings
  const courseNames: Record<string, string> = {
    'MA01A': 'Matematik 1a',
    'MA01B': 'Matematik 1b',
    'MA01C': 'Matematik 1c',
    'MA02A': 'Matematik 2a',
    'MA02B': 'Matematik 2b',
    'MA02C': 'Matematik 2c',
    'MA03B': 'Matematik 3b',
    'MA03C': 'Matematik 3c',
    'MA04': 'Matematik 4',
    'MA05': 'Matematik 5',
    'SV01': 'Svenska 1',
    'SV02': 'Svenska 2',
    'SV03': 'Svenska 3',
    'EN05': 'Engelska 5',
    'EN06': 'Engelska 6',
    'EN07': 'Engelska 7',
    'FY01': 'Fysik 1',
    'FY02': 'Fysik 2',
    'KE01': 'Kemi 1',
    'KE02': 'Kemi 2',
    'BI01': 'Biologi 1',
    'BI02': 'Biologi 2',
    'HI01A': 'Historia 1a',
    'HI01B': 'Historia 1b',
    'HI02A': 'Historia 2a',
    'HI02B': 'Historia 2b',
    'SH01A': 'Samhällskunskap 1a1',
    'SH01B': 'Samhällskunskap 1b',
    'SH02': 'Samhällskunskap 2',
    'RE01': 'Religionskunskap 1',
    'RE02': 'Religionskunskap 2',
    'GE01': 'Geografi 1',
    'PS01': 'Psykologi 1',
    'PS02': 'Psykologi 2',
    'FI01': 'Filosofi 1',
  };
  
  if (courseNames[code]) {
    return courseNames[code];
  }
  
  // Try to parse the code pattern (e.g., MA01A -> Matematik 1a)
  const match = code.match(/^([A-Z]{2})(\d{1,2})([A-Z])?$/i);
  if (match) {
    const [, subjectCode, level, variant] = match;
    const subjectNames: Record<string, string> = {
      'MA': 'Matematik',
      'SV': 'Svenska',
      'EN': 'Engelska',
      'FY': 'Fysik',
      'KE': 'Kemi',
      'BI': 'Biologi',
      'HI': 'Historia',
      'SH': 'Samhällskunskap',
      'RE': 'Religionskunskap',
      'GE': 'Geografi',
      'PS': 'Psykologi',
      'FI': 'Filosofi',
      'NA': 'Naturkunskap',
      'TK': 'Teknik',
      'PR': 'Programmering',
    };
    
    const subject = subjectNames[subjectCode.toUpperCase()] || subjectCode;
    return `${subject} ${level}${variant ? variant.toLowerCase() : ''}`;
  }
  
  return courseCode;
}

// Helper function to guess subject from course code
function guessSubjectFromCode(courseCode: string): string {
  const code = courseCode.toUpperCase();
  
  if (code.startsWith('MA')) return 'Matematik';
  if (code.startsWith('SV')) return 'Svenska';
  if (code.startsWith('EN')) return 'Engelska';
  if (code.startsWith('FY')) return 'Fysik';
  if (code.startsWith('KE')) return 'Kemi';
  if (code.startsWith('BI')) return 'Biologi';
  if (code.startsWith('HI')) return 'Historia';
  if (code.startsWith('SH')) return 'Samhällskunskap';
  if (code.startsWith('RE')) return 'Religionskunskap';
  if (code.startsWith('GE')) return 'Geografi';
  if (code.startsWith('PS')) return 'Psykologi';
  if (code.startsWith('FI')) return 'Filosofi';
  if (code.startsWith('NA')) return 'Naturkunskap';
  if (code.startsWith('TK')) return 'Teknik';
  if (code.startsWith('PR')) return 'Programmering';
  
  return 'Övrigt';
}
