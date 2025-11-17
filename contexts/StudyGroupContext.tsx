import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
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
  participants?: SessionParticipant[];
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

export const [StudyGroupProvider, useStudyGroups] = createContextHook(() => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [availableGroups, setAvailableGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGroups = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching my groups...');

      const { data, error: fetchError } = await supabase
        .from('study_group_members')
        .select(`
          group_id,
          study_groups (
            id,
            name,
            description,
            course_id,
            created_by,
            max_members,
            is_private,
            invite_code,
            created_at,
            updated_at,
            courses (
              name
            ),
            profiles!study_groups_created_by_fkey (
              display_name,
              username
            )
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching my groups:', fetchError);
        setError(fetchError.message);
        return;
      }

      const groups = data
        .map((item: any) => {
          if (!item.study_groups) return null;
          return {
            ...item.study_groups,
            course: item.study_groups.courses,
            creator: item.study_groups.profiles
          };
        })
        .filter(Boolean) as StudyGroup[];

      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      console.log('My groups fetched:', groupsWithCounts.length);
      setMyGroups(groupsWithCounts);
    } catch (err: any) {
      console.error('Exception fetching my groups:', err);
      setError(err.message || 'Kunde inte hämta dina grupper');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAvailableGroups = useCallback(async (courseId?: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching available groups...');

      let query = supabase
        .from('study_groups')
        .select(`
          *,
          courses (
            name
          ),
          profiles!study_groups_created_by_fkey (
            display_name,
            username
          )
        `)
        .eq('is_private', false);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching available groups:', fetchError);
        setError(fetchError.message);
        return;
      }

      const groupsWithCounts = await Promise.all(
        data.map(async (group: any) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          const { data: memberData } = await supabase
            .from('study_group_members')
            .select('group_id')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .single();
          
          return {
            ...group,
            course: group.courses,
            creator: group.profiles,
            member_count: count || 0,
            is_member: !!memberData
          };
        })
      );

      const notMyGroups = groupsWithCounts.filter((g: any) => !g.is_member);

      console.log('Available groups fetched:', notMyGroups.length);
      setAvailableGroups(notMyGroups);
    } catch (err: any) {
      console.error('Exception fetching available groups:', err);
      setError(err.message || 'Kunde inte hämta tillgängliga grupper');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createGroup = useCallback(async (
    name: string,
    description: string | null,
    courseId: string | null,
    isPrivate: boolean,
    maxMembers: number = 20
  ): Promise<{ group?: StudyGroup; error?: string }> => {
    if (!user) {
      return { error: 'Du måste vara inloggad' };
    }

    try {
      console.log('Creating group:', name);

      const inviteCode = isPrivate ? await generateInviteCode() : null;

      const { data, error: createError } = await supabase
        .from('study_groups')
        .insert({
          name,
          description,
          course_id: courseId,
          created_by: user.id,
          max_members: maxMembers,
          is_private: isPrivate,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating group:', createError);
        return { error: createError.message };
      }

      console.log('Group created:', data.id);
      await fetchMyGroups();
      return { group: data };
    } catch (err: any) {
      console.error('Exception creating group:', err);
      return { error: err.message || 'Kunde inte skapa grupp' };
    }
  }, [user, fetchMyGroups]);

  const joinGroup = useCallback(async (groupId: string, inviteCode?: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'Du måste vara inloggad' };
    }

    try {
      console.log('Joining group:', groupId);

      const { data: group } = await supabase
        .from('study_groups')
        .select('is_private, invite_code, max_members')
        .eq('id', groupId)
        .single();

      if (!group) {
        return { error: 'Gruppen hittades inte' };
      }

      if (group.is_private && group.invite_code !== inviteCode) {
        return { error: 'Felaktig inbjudningskod' };
      }

      const { count } = await supabase
        .from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (count && count >= group.max_members) {
        return { error: 'Gruppen är full' };
      }

      const { error: joinError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) {
        console.error('Error joining group:', joinError);
        return { error: joinError.message };
      }

      console.log('Joined group successfully');
      await fetchMyGroups();
      await fetchAvailableGroups();
      return {};
    } catch (err: any) {
      console.error('Exception joining group:', err);
      return { error: err.message || 'Kunde inte gå med i grupp' };
    }
  }, [user, fetchMyGroups, fetchAvailableGroups]);

  const leaveGroup = useCallback(async (groupId: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'Du måste vara inloggad' };
    }

    try {
      console.log('Leaving group:', groupId);

      const { error: leaveError } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (leaveError) {
        console.error('Error leaving group:', leaveError);
        return { error: leaveError.message };
      }

      console.log('Left group successfully');
      await fetchMyGroups();
      await fetchAvailableGroups();
      return {};
    } catch (err: any) {
      console.error('Exception leaving group:', err);
      return { error: err.message || 'Kunde inte lämna grupp' };
    }
  }, [user, fetchMyGroups, fetchAvailableGroups]);

  const deleteGroup = useCallback(async (groupId: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'Du måste vara inloggad' };
    }

    try {
      console.log('Deleting group:', groupId);

      const { error: deleteError } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (deleteError) {
        console.error('Error deleting group:', deleteError);
        return { error: deleteError.message };
      }

      console.log('Deleted group successfully');
      await fetchMyGroups();
      return {};
    } catch (err: any) {
      console.error('Exception deleting group:', err);
      return { error: err.message || 'Kunde inte ta bort grupp' };
    }
  }, [user, fetchMyGroups]);

  useEffect(() => {
    if (user) {
      fetchMyGroups();
      fetchAvailableGroups();
    }
  }, [user, fetchMyGroups, fetchAvailableGroups]);

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    const groupsChannel = supabase
      .channel('study_groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups'
        },
        () => {
          console.log('Study groups changed, refreshing...');
          fetchMyGroups();
          fetchAvailableGroups();
        }
      )
      .subscribe();

    const membersChannel = supabase
      .channel('study_group_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_group_members'
        },
        () => {
          console.log('Group members changed, refreshing...');
          fetchMyGroups();
          fetchAvailableGroups();
        }
      )
      .subscribe();

    channels.push(groupsChannel, membersChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, fetchMyGroups, fetchAvailableGroups]);

  return {
    myGroups,
    availableGroups,
    isLoading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    fetchMyGroups,
    fetchAvailableGroups
  };
});

async function generateInviteCode(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_invite_code');
  if (error || !data) {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  return data;
}
