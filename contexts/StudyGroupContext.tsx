import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as GroupsService from '@/services/groups';

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
    title: string;
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
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const fetchMyGroups = useCallback(async () => {
    if (!user) {
      setMyGroups([]);
      return;
    }

    try {
      console.log('[StudyGroups] Fetching my groups...');

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
              title
            ),
            profiles!study_groups_created_by_fkey (
              display_name,
              username
            )
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('[StudyGroups] Error fetching my groups:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
          error: fetchError
        });
        setError(fetchError.message || 'Failed to fetch groups');
        return;
      }

      const groups = (data || [])
        .map((item: any) => {
          if (!item.study_groups) return null;
          return {
            ...item.study_groups,
            course: item.study_groups.courses || null,
            creator: item.study_groups.profiles || null
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

      console.log('[StudyGroups] My groups fetched:', groupsWithCounts.length);
      setMyGroups(groupsWithCounts);
      setError(null);
    } catch (err: any) {
      console.error('[StudyGroups] Exception fetching my groups:', {
        message: err?.message,
        stack: err?.stack,
        error: err
      });
      setError(err?.message || 'Failed to fetch groups');
    }
  }, [user]);

  const fetchAvailableGroups = useCallback(async (courseId?: string) => {
    if (!user) {
      setAvailableGroups([]);
      return;
    }

    try {
      console.log('[StudyGroups] Fetching available groups...');

      let query = supabase
        .from('study_groups')
        .select(`
          *,
          courses (
            title
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
        console.error('[StudyGroups] Error fetching available groups:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
          error: fetchError
        });
        setError(fetchError.message || 'Failed to fetch available groups');
        return;
      }

      const groupsWithCounts = await Promise.all(
        (data || []).map(async (group: any) => {
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
            course: group.courses || null,
            creator: group.profiles || null,
            member_count: count || 0,
            is_member: !!memberData
          };
        })
      );

      const notMyGroups = groupsWithCounts.filter((g: any) => !g.is_member);

      console.log('[StudyGroups] Available groups fetched:', notMyGroups.length);
      setAvailableGroups(notMyGroups);
      setError(null);
    } catch (err: any) {
      console.error('[StudyGroups] Exception fetching available groups:', {
        message: err?.message,
        stack: err?.stack,
        error: err
      });
      setError(err?.message || 'Failed to fetch available groups');
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
      return { error: 'You must be logged in' };
    }

    if (!name.trim()) {
      return { error: 'Group name is required' };
    }

    if (maxMembers < 2) {
      return { error: 'Max members must be at least 2' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const group = await GroupsService.createGroup(
        user.id,
        name,
        description,
        courseId,
        isPrivate,
        maxMembers
      );

      await fetchMyGroups();
      setIsLoading(false);
      return { group };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create group';
      console.error('[StudyGroups] Create group error:', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return { error: errorMsg };
    }
  }, [user, fetchMyGroups]);

  const joinGroup = useCallback(async (groupId: string, inviteCode?: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'You must be logged in' };
    }

    setIsLoading(true);
    setError(null);

    const tempGroup = availableGroups.find(g => g.id === groupId);
    if (tempGroup) {
      setMyGroups(prev => [...prev, { ...tempGroup, member_count: (tempGroup.member_count || 0) + 1 }]);
      setAvailableGroups(prev => prev.filter(g => g.id !== groupId));
    }

    try {
      await GroupsService.joinGroup(user.id, groupId, inviteCode);
      await fetchMyGroups();
      await fetchAvailableGroups();
      setIsLoading(false);
      return {};
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to join group';
      console.error('[StudyGroups] Join group error:', errorMsg);
      
      if (tempGroup) {
        setMyGroups(prev => prev.filter(g => g.id !== groupId));
        setAvailableGroups(prev => [...prev, tempGroup]);
      }

      setError(errorMsg);
      setIsLoading(false);
      return { error: errorMsg };
    }
  }, [user, availableGroups, fetchMyGroups, fetchAvailableGroups]);

  const leaveGroup = useCallback(async (groupId: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'You must be logged in' };
    }

    setIsLoading(true);
    setError(null);

    const tempGroup = myGroups.find(g => g.id === groupId);
    setMyGroups(prev => prev.filter(g => g.id !== groupId));

    try {
      await GroupsService.leaveGroup(user.id, groupId);
      await fetchMyGroups();
      await fetchAvailableGroups();
      setIsLoading(false);
      return {};
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to leave group';
      console.error('[StudyGroups] Leave group error:', errorMsg);
      
      if (tempGroup) {
        setMyGroups(prev => [...prev, tempGroup]);
      }

      setError(errorMsg);
      setIsLoading(false);
      return { error: errorMsg };
    }
  }, [user, myGroups, fetchMyGroups, fetchAvailableGroups]);

  const deleteGroup = useCallback(async (groupId: string): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'You must be logged in' };
    }

    setIsLoading(true);
    setError(null);

    const tempGroup = myGroups.find(g => g.id === groupId);
    setMyGroups(prev => prev.filter(g => g.id !== groupId));

    try {
      const { error: deleteError } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (deleteError) throw deleteError;

      await fetchMyGroups();
      setIsLoading(false);
      return {};
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete group';
      console.error('[StudyGroups] Delete group error:', errorMsg);
      
      if (tempGroup) {
        setMyGroups(prev => [...prev, tempGroup]);
      }

      setError(errorMsg);
      setIsLoading(false);
      return { error: errorMsg };
    }
  }, [user, myGroups, fetchMyGroups]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchMyGroups(), fetchAvailableGroups()]).finally(() => {
        setIsLoading(false);
      });
    } else {
      setMyGroups([]);
      setAvailableGroups([]);
    }
  }, [user, fetchMyGroups, fetchAvailableGroups]);

  useEffect(() => {
    if (!user) {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      return;
    }

    console.log('[StudyGroups] Setting up real-time subscriptions');

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
          console.log('[StudyGroups] Groups changed, refreshing...');
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
          console.log('[StudyGroups] Members changed, refreshing...');
          fetchMyGroups();
          fetchAvailableGroups();
        }
      )
      .subscribe();

    channelsRef.current = [groupsChannel, membersChannel];

    return () => {
      console.log('[StudyGroups] Cleaning up real-time subscriptions');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
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
