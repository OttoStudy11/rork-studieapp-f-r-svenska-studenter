import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  status: 'online' | 'offline' | 'studying';
  studyHours: number;
  streak: number;
  lastActive?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
  searchUsers: (query: string) => Promise<any[]>;
  sendFriendRequest: (userId: string) => Promise<{ error?: any }>;
  acceptFriendRequest: (requestId: string) => Promise<{ error?: any }>;
  rejectFriendRequest: (requestId: string) => Promise<{ error?: any }>;
  removeFriend: (friendId: string) => Promise<{ error?: any }>;
  refreshFriends: () => Promise<void>;
}

export const [FriendsProvider, useFriends] = createContextHook(() => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading friends for user:', user.id);

      // Get accepted friendships
      const { data: friendships, error: friendshipsError } = await (supabase as any)
        .from('friendships')
        .select('id, user1_id, user2_id, status, created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) {
        console.error('Error loading friendships:', friendshipsError);
        const errorMsg = friendshipsError.message || friendshipsError.details || 'Unknown database error';
        alert(`Error loading friends: ${errorMsg}`);
        return;
      }

      if (!friendships || friendships.length === 0) {
        console.log('No friendships found');
        setFriends([]);
        return;
      }

      // Extract friend IDs
      const friendIds: string[] = friendships.map((friendship: any) => {
        return friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id;
      });

      console.log('Friend IDs:', friendIds);

      // Get friend profiles
      const { data: friendProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error loading friend profiles:', profilesError);
        const errorMsg = profilesError.message || profilesError.details || 'Unknown database error';
        alert(`Error loading friend profiles: ${errorMsg}`);
        return;
      }

      if (!friendProfiles || friendProfiles.length === 0) {
        console.log('No friend profiles found');
        setFriends([]);
        return;
      }

      // Get friend progress data from user_progress table
      const { data: progressData, error: progressError } = await (supabase as any)
        .from('user_progress')
        .select('user_id, total_study_time, current_streak, last_study_date')
        .in('user_id', friendIds);

      if (progressError) {
        console.warn('Error loading friend progress (non-critical):', progressError.message || progressError);
      }

      // Combine data into Friend objects
      const friendsData: Friend[] = (friendProfiles || []).map((profile: any) => {
        const progress = progressData?.find((p: any) => p.user_id === profile.id);
        const lastStudyDate = progress?.last_study_date ? new Date(progress.last_study_date) : null;
        const now = new Date();
        const hoursSinceLastStudy = lastStudyDate ? 
          (now.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60) : null;

        // Determine status based on last study activity
        let status: 'online' | 'offline' | 'studying' = 'offline';
        if (hoursSinceLastStudy !== null) {
          if (hoursSinceLastStudy < 1) {
            status = 'studying';
          } else if (hoursSinceLastStudy < 24) {
            status = 'online';
          }
        }

        return {
          id: profile.id,
          username: profile.username || 'Unknown',
          displayName: profile.display_name || profile.username || 'Unknown User',
          avatarUrl: profile.avatar_url,
          status,
          studyHours: Math.floor((progress?.total_study_time || 0) / 60), // Convert minutes to hours
          streak: progress?.current_streak || 0,
          lastActive: lastStudyDate?.toISOString()
        };
      });

      console.log('Loaded friends:', friendsData);
      setFriends(friendsData);
    } catch (error: any) {
      console.error('Error in loadFriends:', error?.message || error);
      alert(`Error loading friends: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadFriendRequests = useCallback(async () => {
    if (!user) {
      setFriendRequests([]);
      setSentRequests([]);
      return;
    }

    try {
      // Get incoming friend requests
      const { data: incoming, error: incomingError } = await (supabase as any)
        .from('friendships')
        .select('id, user1_id, user2_id, status, created_at')
        .eq('user2_id', user.id)
        .eq('status', 'pending');

      if (incomingError) {
        console.error('Error loading incoming requests:', incomingError);
        const errorMsg = incomingError.message || incomingError.details || 'Unknown database error';
        alert(`Error loading friend requests: ${errorMsg}`);
        return;
      }

      if (incoming && incoming.length > 0) {
        const senderIds = incoming.map((req: any) => req.user1_id);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', senderIds);

        const incomingRequests: FriendRequest[] = incoming.map((req: any) => {
          const profile = senderProfiles?.find((p: any) => p.id === req.user1_id);
          return {
            id: req.id,
            fromUserId: req.user1_id,
            toUserId: req.user2_id,
            fromUser: {
              id: profile?.id || req.user1_id,
              username: profile?.username || 'Unknown',
              displayName: profile?.display_name || profile?.username || 'Unknown User',
              avatarUrl: profile?.avatar_url || undefined
            },
            status: req.status as 'pending',
            createdAt: req.created_at
          };
        });
        
        setFriendRequests(incomingRequests);
      } else {
        setFriendRequests([]);
      }

      // Get sent friend requests
      const { data: sent, error: sentError } = await (supabase as any)
        .from('friendships')
        .select('id, user1_id, user2_id, status, created_at')
        .eq('user1_id', user.id)
        .eq('status', 'pending');

      if (sentError) {
        console.error('Error loading sent requests:', sentError);
        const errorMsg = sentError.message || sentError.details || 'Unknown database error';
        console.warn('Could not load sent requests:', errorMsg);
      }

      if (sent && sent.length > 0) {
        const recipientIds = sent.map((req: any) => req.user2_id);
        const { data: recipientProfiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', recipientIds);

        const sentRequestsData: FriendRequest[] = sent.map((req: any) => {
          const profile = recipientProfiles?.find((p: any) => p.id === req.user2_id);
          return {
            id: req.id,
            fromUserId: req.user1_id,
            toUserId: req.user2_id,
            fromUser: {
              id: profile?.id || req.user2_id,
              username: profile?.username || 'Unknown',
              displayName: profile?.display_name || profile?.username || 'Unknown User',
              avatarUrl: profile?.avatar_url || undefined
            },
            status: req.status as 'pending',
            createdAt: req.created_at
          };
        });
        
        setSentRequests(sentRequestsData);
      } else {
        setSentRequests([]);
      }
    } catch (error: any) {
      console.error('Error loading friend requests:', error?.message || error);
      alert(`Error loading friend requests: ${error?.message || 'Unknown error'}`);
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query?.trim() || query.length < 2) {
      return [];
    }

    try {
      console.log('Searching users with query:', query);
      
      const { data, error } = await supabase
        .rpc('search_users_by_username', { search_term: query.trim() });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      // Filter out current user and existing friends
      const filteredResults = data?.filter((searchUser: any) => {
        if (searchUser.id === user?.id) return false;
        if (friends.some(friend => friend.id === searchUser.id)) return false;
        return true;
      }) || [];

      console.log('Search results:', filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }, [user, friends]);

  const sendFriendRequest = useCallback(async (userId: string) => {
    if (!user) {
      return { error: { message: 'Inte inloggad' } };
    }

    try {
      console.log('Sending friend request to:', userId);
      
      // Check if friendship already exists
      const { data: existing } = await (supabase as any)
        .from('friendships')
        .select('id, status')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return { error: { message: 'Ni är redan vänner' } };
        } else if (existing.status === 'pending') {
          return { error: { message: 'Vänförfrågan redan skickad' } };
        }
      }

      const { error } = await (supabase as any)
        .from('friendships')
        .insert({
          user1_id: user.id,
          user2_id: userId,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending friend request:', error);
        return { error: { message: 'Kunde inte skicka vänförfrågan' } };
      }

      console.log('Friend request sent successfully');
      await loadFriendRequests();
      return { error: null };
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      return { error: { message: 'Ett oväntat fel inträffade' } };
    }
  }, [user, loadFriendRequests]);

  const acceptFriendRequest = useCallback(async (requestId: string) => {
    if (!user) {
      return { error: { message: 'Inte inloggad' } };
    }

    try {
      console.log('Accepting friend request:', requestId);
      
      const { error } = await (supabase as any)
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('user2_id', user.id); // Only the recipient can accept

      if (error) {
        console.error('Error accepting friend request:', error);
        return { error: { message: 'Kunde inte acceptera vänförfrågan' } };
      }

      console.log('Friend request accepted successfully');
      await Promise.all([loadFriends(), loadFriendRequests()]);
      return { error: null };
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return { error: { message: 'Ett oväntat fel inträffade' } };
    }
  }, [user, loadFriends, loadFriendRequests]);

  const rejectFriendRequest = useCallback(async (requestId: string) => {
    if (!user) {
      return { error: { message: 'Inte inloggad' } };
    }

    try {
      console.log('Rejecting friend request:', requestId);
      
      const { error } = await (supabase as any)
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('user2_id', user.id); // Only the recipient can reject

      if (error) {
        console.error('Error rejecting friend request:', error);
        return { error: { message: 'Kunde inte avvisa vänförfrågan' } };
      }

      console.log('Friend request rejected successfully');
      await loadFriendRequests();
      return { error: null };
    } catch (error) {
      console.error('Error in rejectFriendRequest:', error);
      return { error: { message: 'Ett oväntat fel inträffade' } };
    }
  }, [user, loadFriendRequests]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!user) {
      return { error: { message: 'Inte inloggad' } };
    }

    try {
      console.log('Removing friend:', friendId);
      
      const { error } = await (supabase as any)
        .from('friendships')
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`);

      if (error) {
        console.error('Error removing friend:', error);
        return { error: { message: 'Kunde inte ta bort vän' } };
      }

      console.log('Friend removed successfully');
      await loadFriends();
      return { error: null };
    } catch (error) {
      console.error('Error in removeFriend:', error);
      return { error: { message: 'Ett oväntat fel inträffade' } };
    }
  }, [user, loadFriends]);

  const refreshFriends = useCallback(async () => {
    await Promise.all([loadFriends(), loadFriendRequests()]);
  }, [loadFriends, loadFriendRequests]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    } else {
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
    }
  }, [user, loadFriends, loadFriendRequests]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions for friendships');
    
    const subscription = supabase
      .channel('friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('Friendship change detected:', payload);
          refreshFriends();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up friendship subscriptions');
      subscription.unsubscribe();
    };
  }, [user, refreshFriends]);

  return useMemo(() => ({
    friends,
    friendRequests,
    sentRequests,
    isLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends
  }), [
    friends,
    friendRequests,
    sentRequests,
    isLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends
  ]);
});