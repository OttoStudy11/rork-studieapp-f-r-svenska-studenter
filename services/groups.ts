import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  course_id: string | null;
  created_by: string;
  max_members: number;
  is_private: boolean;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  course?: {
    name: string;
  };
  creator?: {
    display_name: string;
    username: string;
  };
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_config: any;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_config: any;
  };
}

export interface GroupSession {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number;
  created_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_config: any;
  };
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  avatar_config: any;
  total_minutes: number;
  session_count: number;
  current_streak: number;
}

async function handleError(error: any, context: string): Promise<never> {
  console.error(`[Groups Service] ${context}:`, error);
  throw new Error(error?.message || `${context} failed`);
}

export async function createGroup(
  userId: string,
  name: string,
  description: string | null,
  courseId: string | null,
  isPrivate: boolean,
  maxMembers: number = 20
): Promise<StudyGroup> {
  try {
    console.log('[Groups] Creating group:', name);
    
    const inviteCode = isPrivate ? await generateInviteCode() : null;

    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        course_id: courseId,
        created_by: userId,
        max_members: maxMembers,
        is_private: isPrivate,
        invite_code: inviteCode
      })
      .select()
      .single();

    if (error) await handleError(error, 'Create group');
    
    console.log('[Groups] Group created successfully:', data.id);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function joinGroup(
  userId: string,
  groupId: string,
  inviteCode?: string
): Promise<void> {
  try {
    console.log('[Groups] Joining group:', groupId);

    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('is_private, invite_code, max_members')
      .eq('id', groupId)
      .single();

    if (groupError) await handleError(groupError, 'Fetch group for join');
    if (!group) throw new Error('Group not found');

    if (group.is_private && group.invite_code !== inviteCode) {
      throw new Error('Invalid invite code');
    }

    const { count } = await supabase
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (count && count >= group.max_members) {
      throw new Error('Group is full');
    }

    const { error: joinError } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member'
      });

    if (joinError) {
      if (joinError.code === '23505') {
        throw new Error('You are already a member of this group');
      }
      await handleError(joinError, 'Join group');
    }

    console.log('[Groups] Joined group successfully');
  } catch (error) {
    throw error;
  }
}

export async function leaveGroup(
  userId: string,
  groupId: string
): Promise<void> {
  try {
    console.log('[Groups] Leaving group:', groupId);

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) await handleError(error, 'Leave group');
    
    console.log('[Groups] Left group successfully');
  } catch (error) {
    throw error;
  }
}

export async function getGroup(groupId: string): Promise<StudyGroup | null> {
  try {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        courses (name),
        profiles!study_groups_created_by_fkey (display_name, username)
      `)
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      await handleError(error, 'Get group');
    }

    const { count } = await supabase
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    return {
      ...data,
      course: data.courses || null,
      creator: data.profiles || null,
      member_count: count || 0
    };
  } catch (error) {
    throw error;
  }
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  try {
    const { data, error } = await supabase
      .from('study_group_members')
      .select(`
        *,
        profiles (display_name, username, avatar_config)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) await handleError(error, 'Get group members');

    return (data || []).map(m => ({
      ...m,
      profile: m.profiles || undefined
    }));
  } catch (error) {
    throw error;
  }
}

export async function getGroupLeaderboard(
  groupId: string,
  timeFilter: 'week' | 'month' | 'all' = 'week'
): Promise<LeaderboardEntry[]> {
  try {
    const { data: members } = await supabase
      .from('study_group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (!members || members.length === 0) return [];

    const memberIds = members.map(m => m.user_id);

    let query = supabase
      .from('study_sessions')
      .select('user_id, duration_minutes, created_at')
      .in('user_id', memberIds)
      .eq('status', 'completed');

    const now = new Date();
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data: sessions } = await query;

    const userStats = new Map<string, { totalMinutes: number; sessionCount: number }>();
    
    (sessions || []).forEach(session => {
      const current = userStats.get(session.user_id) || { totalMinutes: 0, sessionCount: 0 };
      userStats.set(session.user_id, {
        totalMinutes: current.totalMinutes + (session.duration_minutes || 0),
        sessionCount: current.sessionCount + 1
      });
    });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_config')
      .in('id', memberIds);

    const leaderboardData: LeaderboardEntry[] = [];

    for (const profile of profiles || []) {
      const stats = userStats.get(profile.id) || { totalMinutes: 0, sessionCount: 0 };
      
      const { count: streakCount } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

      leaderboardData.push({
        user_id: profile.id,
        display_name: profile.display_name || 'User',
        username: profile.username || 'user',
        avatar_config: profile.avatar_config,
        total_minutes: stats.totalMinutes,
        session_count: stats.sessionCount,
        current_streak: streakCount || 0
      });
    }

    return leaderboardData.sort((a, b) => b.total_minutes - a.total_minutes);
  } catch (error) {
    throw error;
  }
}

export async function getGroupMessages(
  groupId: string,
  limit: number = 100
): Promise<GroupMessage[]> {
  try {
    const { data, error } = await supabase
      .from('study_group_messages')
      .select(`
        *,
        profiles (display_name, username, avatar_config)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) await handleError(error, 'Get group messages');

    return (data || []).map(m => ({
      ...m,
      profile: m.profiles || undefined
    }));
  } catch (error) {
    throw error;
  }
}

export async function sendGroupMessage(
  userId: string,
  groupId: string,
  message: string,
  replyTo?: string
): Promise<void> {
  try {
    console.log('[Groups] Sending message to group:', groupId);

    const { error } = await supabase
      .from('study_group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        message: message.trim(),
        reply_to: replyTo || null
      });

    if (error) await handleError(error, 'Send message');
    
    console.log('[Groups] Message sent successfully');
  } catch (error) {
    throw error;
  }
}

export async function getGroupSessions(groupId: string): Promise<GroupSession[]> {
  try {
    const { data, error } = await supabase
      .from('study_group_sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('scheduled_start', { ascending: true });

    if (error) await handleError(error, 'Get group sessions');

    const sessionsWithCounts = await Promise.all(
      (data || []).map(async (session) => {
        const { count } = await supabase
          .from('study_group_session_participants')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        return {
          ...session,
          participant_count: count || 0
        };
      })
    );

    return sessionsWithCounts;
  } catch (error) {
    throw error;
  }
}

export async function createGroupSession(
  userId: string,
  groupId: string,
  title: string,
  description: string | null,
  scheduledStart: string,
  scheduledEnd: string
): Promise<GroupSession> {
  try {
    console.log('[Groups] Creating session for group:', groupId);

    const { data, error } = await supabase
      .from('study_group_sessions')
      .insert({
        group_id: groupId,
        title: title.trim(),
        description: description?.trim() || null,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        created_by: userId
      })
      .select()
      .single();

    if (error) await handleError(error, 'Create session');

    await supabase
      .from('study_group_session_participants')
      .insert({
        session_id: data.id,
        user_id: userId,
        status: 'accepted'
      });

    console.log('[Groups] Session created successfully');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function joinSession(
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('study_group_session_participants')
      .upsert({
        session_id: sessionId,
        user_id: userId,
        status: 'accepted'
      }, {
        onConflict: 'session_id,user_id'
      });

    if (error) await handleError(error, 'Join session');
  } catch (error) {
    throw error;
  }
}

export async function leaveSession(
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('study_group_session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) await handleError(error, 'Leave session');
  } catch (error) {
    throw error;
  }
}

export function subscribeToGroupMembers(
  groupId: string,
  callback: (members: GroupMember[]) => void
): RealtimeChannel {
  console.log('[Groups] Subscribing to members for group:', groupId);
  
  const channel = supabase
    .channel(`group_members:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'study_group_members',
        filter: `group_id=eq.${groupId}`
      },
      async () => {
        console.log('[Groups] Members changed, fetching updated list');
        const members = await getGroupMembers(groupId);
        callback(members);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToMessages(
  groupId: string,
  callback: (message: GroupMessage) => void
): RealtimeChannel {
  console.log('[Groups] Subscribing to messages for group:', groupId);
  
  const channel = supabase
    .channel(`group_messages:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'study_group_messages',
        filter: `group_id=eq.${groupId}`
      },
      async (payload) => {
        console.log('[Groups] New message received');
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_config')
          .eq('id', payload.new.user_id)
          .single();

        const newMsg: GroupMessage = {
          ...payload.new,
          profile: profileData || undefined
        } as GroupMessage;

        callback(newMsg);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToLeaderboard(
  groupId: string,
  callback: () => void
): RealtimeChannel {
  console.log('[Groups] Subscribing to leaderboard updates for group:', groupId);
  
  const channel = supabase
    .channel(`group_leaderboard:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'study_sessions'
      },
      () => {
        console.log('[Groups] Study sessions changed, refreshing leaderboard');
        callback();
      }
    )
    .subscribe();

  return channel;
}

async function generateInviteCode(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_invite_code');
  if (error || !data) {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  return data;
}
