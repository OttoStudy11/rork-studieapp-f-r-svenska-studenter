import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useStudy } from './StudyContext';

export type CommunityType = 'school' | 'program' | 'study-group' | 'other';
export type CommunityVisibility = 'open' | 'closed';
export type MemberRole = 'admin' | 'member';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    program?: string;
    level?: string;
  };
}

export interface CommunityRequest {
  id: string;
  communityId: string;
  userId: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    program?: string;
  };
}

export interface CommunityInvite {
  id: string;
  communityId: string;
  inviterId: string;
  inviteeId: string;
  status: RequestStatus;
  createdAt: string;
  community?: Community;
  inviter?: {
    username: string;
    displayName: string;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  schoolId?: string;
  schoolName?: string;
  programId?: string;
  programName?: string;
  imageUrl?: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  isMember?: boolean;
  isAdmin?: boolean;
  hasPendingRequest?: boolean;
}

interface CommunityContextType {
  communities: Community[];
  myCommunities: Community[];
  suggestedCommunities: Community[];
  pendingInvites: CommunityInvite[];
  isLoading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
  loadMyCommunities: () => Promise<void>;
  loadSuggestedCommunities: () => Promise<void>;
  loadPendingInvites: () => Promise<void>;
  createCommunity: (data: CreateCommunityData) => Promise<{ community?: Community; error?: string }>;
  joinCommunity: (communityId: string, message?: string) => Promise<{ error?: string }>;
  leaveCommunity: (communityId: string) => Promise<{ error?: string }>;
  getCommunityDetails: (communityId: string) => Promise<{ community?: Community; members?: CommunityMember[]; requests?: CommunityRequest[]; error?: string }>;
  handleRequest: (requestId: string, accept: boolean) => Promise<{ error?: string }>;
  inviteUser: (communityId: string, userId: string) => Promise<{ error?: string }>;
  handleInvite: (inviteId: string, accept: boolean) => Promise<{ error?: string }>;
  removeMember: (communityId: string, userId: string) => Promise<{ error?: string }>;
  updateMemberRole: (communityId: string, userId: string, role: MemberRole) => Promise<{ error?: string }>;
  deleteCommunity: (communityId: string) => Promise<{ error?: string }>;
  searchCommunities: (query: string) => Promise<Community[]>;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  schoolId?: string;
  schoolName?: string;
  programId?: string;
  programName?: string;
  imageUrl?: string;
}

export const [CommunityProvider, useCommunity] = createContextHook((): CommunityContextType => {
  const { user } = useAuth();
  const { user: studyUser } = useStudy();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CommunityInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommunities = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Communities] Loading all communities...');
      
      const { data, error: fetchError } = await (supabase as any)
        .from('communities')
        .select(`
          *,
          community_members!inner(count)
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('[Communities] Error loading communities:', fetchError);
        setError('Kunde inte ladda communities');
        return;
      }
      
      const { data: myMemberships } = await (supabase as any)
        .from('community_members')
        .select('community_id, role')
        .eq('user_id', user.id);
      
      const { data: myRequests } = await (supabase as any)
        .from('community_requests')
        .select('community_id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      const membershipMap = new Map(myMemberships?.map((m: any) => [m.community_id, m.role]) || []);
      const requestSet = new Set(myRequests?.map((r: any) => r.community_id) || []);
      
      const mappedCommunities: Community[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        type: c.type as CommunityType,
        visibility: c.visibility as CommunityVisibility,
        schoolId: c.school_id,
        schoolName: c.school_name,
        programId: c.program_id,
        programName: c.program_name,
        imageUrl: c.image_url,
        createdBy: c.created_by,
        memberCount: c.member_count || 0,
        createdAt: c.created_at,
        isMember: membershipMap.has(c.id),
        isAdmin: membershipMap.get(c.id) === 'admin',
        hasPendingRequest: requestSet.has(c.id),
      }));
      
      setCommunities(mappedCommunities);
      console.log('[Communities] Loaded', mappedCommunities.length, 'communities');
    } catch (err: any) {
      console.error('[Communities] Exception loading communities:', err);
      setError(err?.message || 'Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadMyCommunities = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('[Communities] Loading my communities...');
      
      const { data, error: fetchError } = await (supabase as any)
        .from('community_members')
        .select(`
          role,
          community:communities(*)
        `)
        .eq('user_id', user.id);
      
      if (fetchError) {
        console.error('[Communities] Error loading my communities:', fetchError);
        return;
      }
      
      const mapped: Community[] = (data || [])
        .filter((d: any) => d.community)
        .map((d: any) => ({
          id: d.community.id,
          name: d.community.name,
          description: d.community.description || '',
          type: d.community.type as CommunityType,
          visibility: d.community.visibility as CommunityVisibility,
          schoolId: d.community.school_id,
          schoolName: d.community.school_name,
          programId: d.community.program_id,
          programName: d.community.program_name,
          imageUrl: d.community.image_url,
          createdBy: d.community.created_by,
          memberCount: d.community.member_count || 0,
          createdAt: d.community.created_at,
          isMember: true,
          isAdmin: d.role === 'admin',
          hasPendingRequest: false,
        }));
      
      setMyCommunities(mapped);
      console.log('[Communities] Loaded', mapped.length, 'of my communities');
    } catch (err: any) {
      console.error('[Communities] Exception loading my communities:', err);
    }
  }, [user]);

  const loadSuggestedCommunities = useCallback(async () => {
    if (!user || !studyUser) return;
    
    try {
      console.log('[Communities] Loading suggested communities...');
      
      let query = (supabase as any)
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false })
        .limit(10);
      
      if (studyUser.gymnasium?.name) {
        query = query.or(`school_name.ilike.%${studyUser.gymnasium.name}%`);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error('[Communities] Error loading suggested:', fetchError);
        return;
      }
      
      const { data: myMemberships } = await (supabase as any)
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);
      
      const memberSet = new Set(myMemberships?.map((m: any) => m.community_id) || []);
      
      const suggested = (data || [])
        .filter((c: any) => !memberSet.has(c.id))
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          type: c.type as CommunityType,
          visibility: c.visibility as CommunityVisibility,
          schoolId: c.school_id,
          schoolName: c.school_name,
          programId: c.program_id,
          programName: c.program_name,
          imageUrl: c.image_url,
          createdBy: c.created_by,
          memberCount: c.member_count || 0,
          createdAt: c.created_at,
          isMember: false,
          isAdmin: false,
          hasPendingRequest: false,
        }));
      
      setSuggestedCommunities(suggested);
      console.log('[Communities] Loaded', suggested.length, 'suggested communities');
    } catch (err: any) {
      console.error('[Communities] Exception loading suggested:', err);
    }
  }, [user, studyUser]);

  const loadPendingInvites = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('[Communities] Loading pending invites...');
      
      const { data: inviteData, error: fetchError } = await (supabase as any)
        .from('community_invites')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending');
      
      if (fetchError) {
        console.error('[Communities] Error loading invites:', fetchError.message || fetchError);
        return;
      }
      
      if (!inviteData || inviteData.length === 0) {
        setPendingInvites([]);
        console.log('[Communities] No pending invites');
        return;
      }
      
      const communityIds = [...new Set(inviteData.map((i: any) => i.community_id))];
      const inviterIds = [...new Set(inviteData.map((i: any) => i.inviter_id))];
      
      const { data: communitiesData } = await (supabase as any)
        .from('communities')
        .select('*')
        .in('id', communityIds);
      
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('id, username, display_name')
        .in('id', inviterIds);
      
      const communitiesMap = new Map((communitiesData || []).map((c: any) => [c.id, c]));
      const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
      
      const mapped: CommunityInvite[] = inviteData.map((i: any) => {
        const community = communitiesMap.get(i.community_id) as any;
        const inviter = profilesMap.get(i.inviter_id) as any;
        
        return {
          id: i.id,
          communityId: i.community_id,
          inviterId: i.inviter_id,
          inviteeId: i.invitee_id,
          status: i.status,
          createdAt: i.created_at,
          community: community ? {
            id: community.id,
            name: community.name,
            description: community.description || '',
            type: community.type,
            visibility: community.visibility,
            createdBy: community.created_by,
            memberCount: community.member_count || 0,
            createdAt: community.created_at,
          } : undefined,
          inviter: inviter ? {
            username: inviter.username,
            displayName: inviter.display_name,
          } : undefined,
        };
      });
      
      setPendingInvites(mapped);
      console.log('[Communities] Loaded', mapped.length, 'pending invites');
    } catch (err: any) {
      console.error('[Communities] Exception loading invites:', err);
    }
  }, [user]);

  const createCommunity = useCallback(async (data: CreateCommunityData): Promise<{ community?: Community; error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Creating community:', data.name);
      
      const { data: newCommunity, error: createError } = await (supabase as any)
        .from('communities')
        .insert({
          name: data.name,
          description: data.description,
          type: data.type,
          visibility: data.visibility,
          school_id: data.schoolId,
          school_name: data.schoolName,
          program_id: data.programId,
          program_name: data.programName,
          image_url: data.imageUrl,
          created_by: user.id,
          member_count: 1,
        })
        .select()
        .single();
      
      if (createError) {
        console.error('[Communities] Error creating community:', createError);
        return { error: 'Kunde inte skapa community' };
      }
      
      const { error: memberError } = await (supabase as any)
        .from('community_members')
        .insert({
          community_id: newCommunity.id,
          user_id: user.id,
          role: 'admin',
        });
      
      if (memberError) {
        console.error('[Communities] Error adding creator as member:', memberError);
      }
      
      const community: Community = {
        id: newCommunity.id,
        name: newCommunity.name,
        description: newCommunity.description || '',
        type: newCommunity.type as CommunityType,
        visibility: newCommunity.visibility as CommunityVisibility,
        schoolId: newCommunity.school_id,
        schoolName: newCommunity.school_name,
        programId: newCommunity.program_id,
        programName: newCommunity.program_name,
        imageUrl: newCommunity.image_url,
        createdBy: newCommunity.created_by,
        memberCount: 1,
        createdAt: newCommunity.created_at,
        isMember: true,
        isAdmin: true,
        hasPendingRequest: false,
      };
      
      setMyCommunities(prev => [community, ...prev]);
      setCommunities(prev => [community, ...prev]);
      
      console.log('[Communities] Community created successfully:', community.id);
      return { community };
    } catch (err: any) {
      console.error('[Communities] Exception creating community:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const joinCommunity = useCallback(async (communityId: string, message?: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Joining community:', communityId);
      
      const { data: community } = await (supabase as any)
        .from('communities')
        .select('visibility, member_count')
        .eq('id', communityId)
        .single();
      
      if (!community) {
        return { error: 'Community hittades inte' };
      }
      
      if (community.visibility === 'closed') {
        const { error: requestError } = await (supabase as any)
          .from('community_requests')
          .insert({
            community_id: communityId,
            user_id: user.id,
            message: message || null,
            status: 'pending',
          });
        
        if (requestError) {
          if (requestError.code === '23505') {
            return { error: 'Du har redan en väntande ansökan' };
          }
          console.error('[Communities] Error creating request:', requestError);
          return { error: 'Kunde inte skicka ansökan' };
        }
        
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { ...c, hasPendingRequest: true } : c
        ));
        
        console.log('[Communities] Request sent for closed community');
        return {};
      }
      
      const { error: memberError } = await (supabase as any)
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
        });
      
      if (memberError) {
        if (memberError.code === '23505') {
          return { error: 'Du är redan medlem' };
        }
        console.error('[Communities] Error joining community:', memberError);
        return { error: 'Kunde inte gå med i community' };
      }
      
      await (supabase as any)
        .from('communities')
        .update({ member_count: (community.member_count || 0) + 1 })
        .eq('id', communityId);
      
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
      ));
      
      await loadMyCommunities();
      
      console.log('[Communities] Joined community successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception joining community:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user, loadMyCommunities]);

  const leaveCommunity = useCallback(async (communityId: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Leaving community:', communityId);
      
      const { data: membership } = await (supabase as any)
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();
      
      if (membership?.role === 'admin') {
        const { data: otherAdmins } = await (supabase as any)
          .from('community_members')
          .select('user_id')
          .eq('community_id', communityId)
          .eq('role', 'admin')
          .neq('user_id', user.id);
        
        if (!otherAdmins || otherAdmins.length === 0) {
          return { error: 'Du måste utse en annan admin innan du kan lämna' };
        }
      }
      
      const { error: deleteError } = await (supabase as any)
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('[Communities] Error leaving community:', deleteError);
        return { error: 'Kunde inte lämna community' };
      }
      
      const { data: community } = await (supabase as any)
        .from('communities')
        .select('member_count')
        .eq('id', communityId)
        .single();
      
      if (community) {
        await (supabase as any)
          .from('communities')
          .update({ member_count: Math.max(0, (community.member_count || 1) - 1) })
          .eq('id', communityId);
      }
      
      setMyCommunities(prev => prev.filter(c => c.id !== communityId));
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, isMember: false, isAdmin: false, memberCount: Math.max(0, c.memberCount - 1) } : c
      ));
      
      console.log('[Communities] Left community successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception leaving community:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const getCommunityDetails = useCallback(async (communityId: string): Promise<{ community?: Community; members?: CommunityMember[]; requests?: CommunityRequest[]; error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Getting community details:', communityId);
      
      const { data: communityData, error: communityError } = await (supabase as any)
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      
      if (communityError || !communityData) {
        return { error: 'Community hittades inte' };
      }
      
      const { data: memberData } = await (supabase as any)
        .from('community_members')
        .select(`
          *,
          user:profiles(id, username, display_name, avatar_url, program, level)
        `)
        .eq('community_id', communityId)
        .order('role', { ascending: true });
      
      const { data: myMembership } = await (supabase as any)
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();
      
      let requests: CommunityRequest[] = [];
      if (myMembership?.role === 'admin') {
        const { data: requestData } = await (supabase as any)
          .from('community_requests')
          .select(`
            *,
            user:profiles(id, username, display_name, avatar_url, program)
          `)
          .eq('community_id', communityId)
          .eq('status', 'pending');
        
        requests = (requestData || []).map((r: any) => ({
          id: r.id,
          communityId: r.community_id,
          userId: r.user_id,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
          user: r.user ? {
            id: r.user.id,
            username: r.user.username,
            displayName: r.user.display_name,
            avatarUrl: r.user.avatar_url,
            program: r.user.program,
          } : undefined,
        }));
      }
      
      const community: Community = {
        id: communityData.id,
        name: communityData.name,
        description: communityData.description || '',
        type: communityData.type as CommunityType,
        visibility: communityData.visibility as CommunityVisibility,
        schoolId: communityData.school_id,
        schoolName: communityData.school_name,
        programId: communityData.program_id,
        programName: communityData.program_name,
        imageUrl: communityData.image_url,
        createdBy: communityData.created_by,
        memberCount: communityData.member_count || 0,
        createdAt: communityData.created_at,
        isMember: !!myMembership,
        isAdmin: myMembership?.role === 'admin',
        hasPendingRequest: false,
      };
      
      const members: CommunityMember[] = (memberData || []).map((m: any) => ({
        id: m.id,
        communityId: m.community_id,
        userId: m.user_id,
        role: m.role as MemberRole,
        joinedAt: m.joined_at || m.created_at,
        user: m.user ? {
          id: m.user.id,
          username: m.user.username,
          displayName: m.user.display_name,
          avatarUrl: m.user.avatar_url,
          program: m.user.program,
          level: m.user.level,
        } : undefined,
      }));
      
      return { community, members, requests };
    } catch (err: any) {
      console.error('[Communities] Exception getting details:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const handleRequest = useCallback(async (requestId: string, accept: boolean): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Handling request:', requestId, accept ? 'accept' : 'reject');
      
      const { data: request } = await (supabase as any)
        .from('community_requests')
        .select('community_id, user_id')
        .eq('id', requestId)
        .single();
      
      if (!request) {
        return { error: 'Ansökan hittades inte' };
      }
      
      const { data: membership } = await (supabase as any)
        .from('community_members')
        .select('role')
        .eq('community_id', request.community_id)
        .eq('user_id', user.id)
        .single();
      
      if (membership?.role !== 'admin') {
        return { error: 'Endast admins kan hantera ansökningar' };
      }
      
      if (accept) {
        const { error: memberError } = await (supabase as any)
          .from('community_members')
          .insert({
            community_id: request.community_id,
            user_id: request.user_id,
            role: 'member',
          });
        
        if (memberError) {
          console.error('[Communities] Error adding member:', memberError);
          return { error: 'Kunde inte lägga till medlem' };
        }
        
        const { data: community } = await (supabase as any)
          .from('communities')
          .select('member_count')
          .eq('id', request.community_id)
          .single();
        
        if (community) {
          await (supabase as any)
            .from('communities')
            .update({ member_count: (community.member_count || 0) + 1 })
            .eq('id', request.community_id);
        }
      }
      
      await (supabase as any)
        .from('community_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId);
      
      console.log('[Communities] Request handled successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception handling request:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const inviteUser = useCallback(async (communityId: string, userId: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Inviting user:', userId, 'to community:', communityId);
      
      const { data: existingMember } = await (supabase as any)
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();
      
      if (existingMember) {
        return { error: 'Användaren är redan medlem' };
      }
      
      const { error: inviteError } = await (supabase as any)
        .from('community_invites')
        .insert({
          community_id: communityId,
          inviter_id: user.id,
          invitee_id: userId,
          status: 'pending',
        });
      
      if (inviteError) {
        if (inviteError.code === '23505') {
          return { error: 'Inbjudan har redan skickats' };
        }
        console.error('[Communities] Error creating invite:', inviteError);
        return { error: 'Kunde inte skicka inbjudan' };
      }
      
      console.log('[Communities] Invite sent successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception inviting user:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const handleInvite = useCallback(async (inviteId: string, accept: boolean): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Handling invite:', inviteId, accept ? 'accept' : 'reject');
      
      const { data: invite } = await (supabase as any)
        .from('community_invites')
        .select('community_id')
        .eq('id', inviteId)
        .eq('invitee_id', user.id)
        .single();
      
      if (!invite) {
        return { error: 'Inbjudan hittades inte' };
      }
      
      if (accept) {
        const { error: memberError } = await (supabase as any)
          .from('community_members')
          .insert({
            community_id: invite.community_id,
            user_id: user.id,
            role: 'member',
          });
        
        if (memberError && memberError.code !== '23505') {
          console.error('[Communities] Error adding member:', memberError);
          return { error: 'Kunde inte gå med i community' };
        }
        
        const { data: community } = await (supabase as any)
          .from('communities')
          .select('member_count')
          .eq('id', invite.community_id)
          .single();
        
        if (community) {
          await (supabase as any)
            .from('communities')
            .update({ member_count: (community.member_count || 0) + 1 })
            .eq('id', invite.community_id);
        }
        
        await loadMyCommunities();
      }
      
      await (supabase as any)
        .from('community_invites')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', inviteId);
      
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
      
      console.log('[Communities] Invite handled successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception handling invite:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user, loadMyCommunities]);

  const removeMember = useCallback(async (communityId: string, userId: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Removing member:', userId, 'from community:', communityId);
      
      const { data: membership } = await (supabase as any)
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();
      
      if (membership?.role !== 'admin') {
        return { error: 'Endast admins kan ta bort medlemmar' };
      }
      
      const { error: deleteError } = await (supabase as any)
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('[Communities] Error removing member:', deleteError);
        return { error: 'Kunde inte ta bort medlem' };
      }
      
      const { data: community } = await (supabase as any)
        .from('communities')
        .select('member_count')
        .eq('id', communityId)
        .single();
      
      if (community) {
        await (supabase as any)
          .from('communities')
          .update({ member_count: Math.max(0, (community.member_count || 1) - 1) })
          .eq('id', communityId);
      }
      
      console.log('[Communities] Member removed successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception removing member:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const updateMemberRole = useCallback(async (communityId: string, userId: string, role: MemberRole): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Updating role for:', userId, 'to:', role);
      
      const { data: membership } = await (supabase as any)
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();
      
      if (membership?.role !== 'admin') {
        return { error: 'Endast admins kan ändra roller' };
      }
      
      const { error: updateError } = await (supabase as any)
        .from('community_members')
        .update({ role })
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('[Communities] Error updating role:', updateError);
        return { error: 'Kunde inte ändra roll' };
      }
      
      console.log('[Communities] Role updated successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception updating role:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const deleteCommunity = useCallback(async (communityId: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Du måste vara inloggad' };
    
    try {
      console.log('[Communities] Deleting community:', communityId);
      
      const { data: community } = await (supabase as any)
        .from('communities')
        .select('created_by')
        .eq('id', communityId)
        .single();
      
      if (community?.created_by !== user.id) {
        return { error: 'Endast skaparen kan ta bort communityn' };
      }
      
      await (supabase as any).from('community_members').delete().eq('community_id', communityId);
      await (supabase as any).from('community_requests').delete().eq('community_id', communityId);
      await (supabase as any).from('community_invites').delete().eq('community_id', communityId);
      
      const { error: deleteError } = await (supabase as any)
        .from('communities')
        .delete()
        .eq('id', communityId);
      
      if (deleteError) {
        console.error('[Communities] Error deleting community:', deleteError);
        return { error: 'Kunde inte ta bort community' };
      }
      
      setMyCommunities(prev => prev.filter(c => c.id !== communityId));
      setCommunities(prev => prev.filter(c => c.id !== communityId));
      
      console.log('[Communities] Community deleted successfully');
      return {};
    } catch (err: any) {
      console.error('[Communities] Exception deleting community:', err);
      return { error: err?.message || 'Ett fel uppstod' };
    }
  }, [user]);

  const searchCommunities = useCallback(async (query: string): Promise<Community[]> => {
    if (!query.trim()) return [];
    
    try {
      console.log('[Communities] Searching for:', query);
      
      const { data, error: searchError } = await (supabase as any)
        .from('communities')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,school_name.ilike.%${query}%,program_name.ilike.%${query}%`)
        .limit(20);
      
      if (searchError) {
        console.error('[Communities] Error searching:', searchError);
        return [];
      }
      
      return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        type: c.type as CommunityType,
        visibility: c.visibility as CommunityVisibility,
        schoolId: c.school_id,
        schoolName: c.school_name,
        programId: c.program_id,
        programName: c.program_name,
        imageUrl: c.image_url,
        createdBy: c.created_by,
        memberCount: c.member_count || 0,
        createdAt: c.created_at,
      }));
    } catch (err: any) {
      console.error('[Communities] Exception searching:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadMyCommunities();
      loadPendingInvites();
    }
  }, [user, loadMyCommunities, loadPendingInvites]);

  return useMemo(() => ({
    communities,
    myCommunities,
    suggestedCommunities,
    pendingInvites,
    isLoading,
    error,
    loadCommunities,
    loadMyCommunities,
    loadSuggestedCommunities,
    loadPendingInvites,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunityDetails,
    handleRequest,
    inviteUser,
    handleInvite,
    removeMember,
    updateMemberRole,
    deleteCommunity,
    searchCommunities,
  }), [
    communities,
    myCommunities,
    suggestedCommunities,
    pendingInvites,
    isLoading,
    error,
    loadCommunities,
    loadMyCommunities,
    loadSuggestedCommunities,
    loadPendingInvites,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunityDetails,
    handleRequest,
    inviteUser,
    handleInvite,
    removeMember,
    updateMemberRole,
    deleteCommunity,
    searchCommunities,
  ]);
});
