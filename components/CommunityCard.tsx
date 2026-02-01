import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Users, Lock, Globe, GraduationCap, BookOpen, UsersRound, Sparkles, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Community, CommunityType } from '@/contexts/CommunityContext';

interface CommunityCardProps {
  community: Community;
  onPress: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isJoining?: boolean;
  compact?: boolean;
}

const getCommunityIcon = (type: CommunityType) => {
  switch (type) {
    case 'school':
      return GraduationCap;
    case 'program':
      return BookOpen;
    case 'study-group':
      return UsersRound;
    default:
      return Sparkles;
  }
};

const getCommunityTypeLabel = (type: CommunityType): string => {
  switch (type) {
    case 'school':
      return 'Skola';
    case 'program':
      return 'Program';
    case 'study-group':
      return 'Studiegrupp';
    default:
      return 'Övrigt';
  }
};

const getCommunityColor = (type: CommunityType): { bg: string; accent: string } => {
  switch (type) {
    case 'school':
      return { bg: '#6366F115', accent: '#6366F1' };
    case 'program':
      return { bg: '#10B98115', accent: '#10B981' };
    case 'study-group':
      return { bg: '#F59E0B15', accent: '#F59E0B' };
    default:
      return { bg: '#EC489915', accent: '#EC4899' };
  }
};

export default function CommunityCard({
  community,
  onPress,
  onJoin,
  onLeave,
  isJoining,
  compact = false,
}: CommunityCardProps) {
  const { theme } = useTheme();
  const IconComponent = getCommunityIcon(community.type);
  const colors = getCommunityColor(community.type);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: theme.colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactIconContainer, { backgroundColor: colors.bg }]}>
          <IconComponent size={20} color={colors.accent} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: theme.colors.text }]} numberOfLines={1}>
            {community.name}
          </Text>
          <View style={styles.compactMeta}>
            <Users size={12} color={theme.colors.textMuted} />
            <Text style={[styles.compactMetaText, { color: theme.colors.textMuted }]}>
              {community.memberCount}
            </Text>
            {community.visibility === 'closed' && (
              <Lock size={12} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>
        <ChevronRight size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
          <IconComponent size={24} color={colors.accent} />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {community.name}
            </Text>
            {community.visibility === 'closed' && (
              <View style={[styles.visibilityBadge, { backgroundColor: theme.colors.border }]}>
                <Lock size={10} color={theme.colors.textSecondary} />
              </View>
            )}
          </View>
          <View style={styles.tagRow}>
            <View style={[styles.typeBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.typeText, { color: colors.accent }]}>
                {getCommunityTypeLabel(community.type)}
              </Text>
            </View>
            {community.schoolName && (
              <Text style={[styles.schoolText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {community.schoolName}
              </Text>
            )}
          </View>
        </View>
      </View>

      {community.description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {community.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Users size={14} color={theme.colors.textMuted} />
            <Text style={[styles.statText, { color: theme.colors.textMuted }]}>
              {community.memberCount} {community.memberCount === 1 ? 'medlem' : 'medlemmar'}
            </Text>
          </View>
        </View>

        {community.isMember ? (
          <View style={styles.actionRow}>
            {community.isAdmin && (
              <View style={[styles.adminBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.adminText, { color: colors.accent }]}>Admin</Text>
              </View>
            )}
            {onLeave && (
              <TouchableOpacity
                style={[styles.leaveButton, { borderColor: theme.colors.error }]}
                onPress={onLeave}
                disabled={isJoining}
              >
                <Text style={[styles.leaveButtonText, { color: theme.colors.error }]}>
                  Lämna
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : community.hasPendingRequest ? (
          <View style={[styles.pendingBadge, { backgroundColor: theme.colors.warning + '20' }]}>
            <Clock size={12} color={theme.colors.warning} />
            <Text style={[styles.pendingText, { color: theme.colors.warning }]}>
              Väntar på godkännande
            </Text>
          </View>
        ) : onJoin ? (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
            onPress={onJoin}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.joinButtonText}>
                {community.visibility === 'closed' ? 'Ansök' : 'Gå med'}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  visibilityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  schoolText: {
    fontSize: 13,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '700',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  leaveButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMetaText: {
    fontSize: 12,
  },
});
