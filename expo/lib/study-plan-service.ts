import { supabase } from './supabase';

export interface StudyPlanRow {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function fetchStudyPlan(
  userId: string,
  courseId: string
): Promise<StudyPlanRow | null> {
  try {
    console.log('[StudyPlanService] Fetching plan for user:', userId, 'course:', courseId);
    const { data, error } = await (supabase as any)
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {
        console.warn('[StudyPlanService] study_plans table does not exist yet');
        return null;
      }
      console.error('[StudyPlanService] Error fetching plan:', error.message);
      return null;
    }

    console.log('[StudyPlanService] Fetched plan:', data ? 'found' : 'not found');
    return data as StudyPlanRow | null;
  } catch (err) {
    console.error('[StudyPlanService] Exception fetching plan:', err);
    return null;
  }
}

export async function upsertStudyPlan(
  userId: string,
  courseId: string,
  title: string,
  content: Record<string, unknown>
): Promise<StudyPlanRow | null> {
  try {
    console.log('[StudyPlanService] Upserting plan for user:', userId, 'course:', courseId);
    const { data, error } = await (supabase as any)
      .from('study_plans')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          title,
          content,
        },
        { onConflict: 'user_id,course_id' }
      )
      .select('*')
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.warn('[StudyPlanService] study_plans table does not exist yet, falling back to local');
        return null;
      }
      console.error('[StudyPlanService] Error upserting plan:', error.message);
      return null;
    }

    console.log('[StudyPlanService] Plan upserted successfully, id:', data?.id);
    return data as StudyPlanRow;
  } catch (err) {
    console.error('[StudyPlanService] Exception upserting plan:', err);
    return null;
  }
}
