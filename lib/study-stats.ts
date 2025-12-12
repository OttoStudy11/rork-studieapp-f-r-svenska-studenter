import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];

export type PublicUserProfile = Pick<
  ProfileRow,
  'id' | 'username' | 'display_name' | 'avatar_url' | 'program' | 'level'
>;

export interface UserTotalStudy {
  userId: string;
  totalMinutes: number;
  profile?: PublicUserProfile;
}

export async function fetchTotalStudyMinutesForUser(userId: string): Promise<number> {
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('total_study_time')
    .eq('user_id', userId)
    .maybeSingle();

  if (!progressError && progress?.total_study_time != null) {
    const minutes = Number(progress.total_study_time);
    return Number.isFinite(minutes) ? minutes : 0;
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('study_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (sessionsError) {
    throw sessionsError;
  }

  const total = (sessions ?? []).reduce((acc, s) => {
    const v = Number(s.duration_minutes);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);

  return total;
}

export interface GlobalLeaderboardEntry {
  userId: string;
  rank: number;
  username: string;
  displayName: string;
  program: string;
  level: string;
  avatarUrl: string | null;
  totalMinutes: number;
  totalSessions: number;
}

export async function fetchGlobalLeaderboardTop15(): Promise<GlobalLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select(
      'user_id, total_study_time, total_sessions, profiles(id, username, display_name, program, level, avatar_url)',
    )
    .order('total_study_time', { ascending: false })
    .limit(15);

  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    user_id: string;
    total_study_time: number | null;
    total_sessions: number | null;
    profiles: {
      id: string;
      username: string;
      display_name: string;
      program: string;
      level: string;
      avatar_url: string | null;
    } | null;
  }[];

  return rows.map((r, idx) => {
    const total = Number(r.total_study_time ?? 0);
    const safeTotal = Number.isFinite(total) ? total : 0;
    const p = r.profiles;

    return {
      userId: r.user_id,
      rank: idx + 1,
      username: p?.username ?? 'unknown',
      displayName: p?.display_name ?? 'Okänd användare',
      program: p?.program ?? '',
      level: p?.level ?? '',
      avatarUrl: p?.avatar_url ?? null,
      totalMinutes: safeTotal,
      totalSessions: Number(r.total_sessions ?? 0),
    };
  });
}
