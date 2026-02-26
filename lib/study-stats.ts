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
    if (Number.isFinite(minutes) && minutes > 0) {
      return minutes;
    }
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('pomodoro_sessions')
    .select('duration')
    .eq('user_id', userId);

  if (sessionsError) {
    console.error('Error fetching pomodoro sessions:', sessionsError);
    return 0;
  }

  const total = (sessions ?? []).reduce((acc, s) => {
    const v = Number(s.duration);
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
  console.log('Fetching global leaderboard...');

  try {
    // Primary: try user_progress with profiles join
    const { data, error } = await supabase
      .from('user_progress')
      .select(
        'user_id, total_study_time, total_sessions, profiles!inner(id, username, display_name, program, level, avatar_url)',
      )
      .not('total_study_time', 'is', null)
      .gt('total_study_time', 0)
      .order('total_study_time', { ascending: false })
      .limit(15);

    if (!error && data && data.length > 0) {
      console.log('Leaderboard from user_progress:', data.length, 'rows');

      const rows = data as unknown as {
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

      const mapped = rows
        .filter(r => r.profiles !== null)
        .map((r, idx) => {
          const total = Number(r.total_study_time ?? 0);
          const p = r.profiles!;
          return {
            userId: r.user_id,
            rank: idx + 1,
            username: p.username ?? 'unknown',
            displayName: p.display_name ?? 'Okänd användare',
            program: p.program ?? '',
            level: p.level ?? '',
            avatarUrl: p.avatar_url ?? null,
            totalMinutes: Number.isFinite(total) ? total : 0,
            totalSessions: Number(r.total_sessions ?? 0),
          };
        });

      if (mapped.length > 0) {
        return mapped;
      }
    }

    if (error) {
      console.warn('user_progress query failed, falling back to sessions:', error.message);
    } else {
      console.log('user_progress empty, falling back to pomodoro_sessions aggregation');
    }

    // Fallback: aggregate directly from pomodoro_sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('pomodoro_sessions')
      .select('user_id, duration');

    if (sessionsError) {
      console.error('Error fetching sessions for leaderboard:', sessionsError);
      return [];
    }

    if (!sessions || sessions.length === 0) {
      console.log('No sessions found for leaderboard');
      return [];
    }

    // Aggregate by user
    const userTotals: Record<string, { minutes: number; sessions: number }> = {};
    (sessions as { user_id: string; duration: number | null }[]).forEach(s => {
      if (!s.user_id) return;
      const dur = Number(s.duration) || 0;
      if (!userTotals[s.user_id]) {
        userTotals[s.user_id] = { minutes: 0, sessions: 0 };
      }
      userTotals[s.user_id].minutes += dur;
      userTotals[s.user_id].sessions += 1;
    });

    const top15 = Object.entries(userTotals)
      .filter(([, v]) => v.minutes > 0)
      .sort((a, b) => b[1].minutes - a[1].minutes)
      .slice(0, 15);

    if (top15.length === 0) return [];

    const userIds = top15.map(([id]) => id);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, program, level, avatar_url')
      .in('id', userIds);

    if (profilesError || !profiles) {
      console.error('Error fetching profiles for leaderboard:', profilesError);
      return [];
    }

    const profileMap: Record<string, {
      username: string;
      display_name: string;
      program: string;
      level: string;
      avatar_url: string | null;
    }> = {};
    (profiles as any[]).forEach(p => { profileMap[p.id] = p; });

    const result: GlobalLeaderboardEntry[] = top15
      .map(([userId, stats], idx) => {
        const p = profileMap[userId];
        if (!p) return null;
        return {
          userId,
          rank: idx + 1,
          username: p.username ?? 'unknown',
          displayName: p.display_name ?? 'Okänd användare',
          program: p.program ?? '',
          level: p.level ?? '',
          avatarUrl: p.avatar_url ?? null,
          totalMinutes: stats.minutes,
          totalSessions: stats.sessions,
        };
      })
      .filter(Boolean) as GlobalLeaderboardEntry[];

    console.log('Leaderboard from sessions fallback:', result.length, 'entries');
    return result;
  } catch (error) {
    console.error('Exception in fetchGlobalLeaderboardTop15:', error);
    throw error;
  }
}
