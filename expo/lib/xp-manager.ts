import { supabase } from './supabase';
import { XP_VALUES, XPType, calculateLevel } from '@/constants/xp-system';

export interface XPSourceData {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  exerciseId?: string;
  metadata?: Record<string, any>;
}

export interface XPAwardResult {
  xpAwarded: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel?: number;
  previousLevel?: number;
  achievementUnlocked?: string;
}

export async function awardXP(
  userId: string,
  xpType: XPType,
  sourceData: XPSourceData
): Promise<XPAwardResult> {
  try {
    const xpAmount = XP_VALUES[xpType];
    
    if (!xpAmount) {
      console.error('Invalid XP type:', xpType);
      throw new Error(`Invalid XP type: ${xpType}`);
    }

    const sourceCategory = getSourceCategory(xpType);
    const sourceId = getSourceId(sourceData);

    const alreadyAwarded = await (supabase as any)
      .from('user_points')
      .select('id')
      .eq('user_id', userId)
      .eq('source_type', xpType)
      .eq('source_id', sourceId)
      .maybeSingle();

    if (alreadyAwarded.data) {
      console.log('XP already awarded for this action');
      return {
        xpAwarded: 0,
        newTotal: 0,
        leveledUp: false,
      };
    }

    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('total_points, level')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const currentTotalXP = (profile?.total_points as number) || 0;
    const currentLevel = typeof profile?.level === 'number' ? profile.level : 1;
    
    const newTotalXP = currentTotalXP + xpAmount;
    const newLevelData = calculateLevel(newTotalXP);
    const leveledUp = newLevelData.level > currentLevel;

    const { error: pointsError } = await (supabase as any)
      .from('user_points')
      .insert({
        user_id: userId,
        points: xpAmount,
        source_category: sourceCategory,
        source_id: sourceId,
        source_type: xpType,
        course_id: sourceData.courseId || null,
        metadata: sourceData.metadata || {},
        awarded_at: new Date().toISOString(),
      });

    if (pointsError) {
      console.error('Error inserting user points:', pointsError);
      throw pointsError;
    }

    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        total_points: newTotalXP,
        level: newLevelData.level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    if (leveledUp) {
      const { error: historyError } = await (supabase as any)
        .from('user_level_history')
        .insert({
          user_id: userId,
          level: newLevelData.level,
          total_points: newTotalXP,
          achieved_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error('Error inserting level history:', historyError);
      }
    }

    console.log(`✅ Awarded ${xpAmount} XP (${xpType}) to user ${userId}. New total: ${newTotalXP}`);

    return {
      xpAwarded: xpAmount,
      newTotal: newTotalXP,
      leveledUp,
      newLevel: leveledUp ? newLevelData.level : undefined,
      previousLevel: leveledUp ? currentLevel : undefined,
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
}

function getSourceCategory(xpType: XPType): string {
  if (xpType.includes('LESSON')) return 'lesson';
  if (xpType.includes('EXERCISE') || xpType.includes('QUIZ')) return 'exercise';
  if (xpType.includes('STREAK')) return 'streak';
  if (xpType.includes('ACHIEVEMENT')) return 'achievement';
  if (xpType.includes('CHALLENGE')) return 'challenge';
  if (xpType.includes('MODULE')) return 'module';
  if (xpType.includes('COURSE')) return 'course';
  return 'bonus';
}

function getSourceId(sourceData: XPSourceData): string {
  return (
    sourceData.lessonId ||
    sourceData.exerciseId ||
    sourceData.moduleId ||
    sourceData.courseId ||
    'unknown'
  );
}

export async function getUserXPStats(userId: string): Promise<{
  totalXP: number;
  level: number;
  tier: string;
  color: string;
  xpToNext: number;
  progress: number;
}> {
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('total_points, level')
    .eq('id', userId)
    .single();

  const totalXP = (profile?.total_points as number) || 0;
  const levelData = calculateLevel(totalXP);
  
  const progress = ((totalXP - levelData.currentLevelXP) / (levelData.nextLevelXP - levelData.currentLevelXP)) * 100;

  return {
    totalXP,
    level: levelData.level,
    tier: levelData.tier,
    color: levelData.color,
    xpToNext: levelData.xpToNext,
    progress: Math.min(100, Math.max(0, progress)),
  };
}
