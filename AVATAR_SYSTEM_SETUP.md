# Avatar System Implementation Guide

## Completed
✅ Created avatar configuration types and constants (`constants/avatar-config.ts`)
✅ Built SVG-based avatar rendering component (`components/CharacterAvatar.tsx`)  
✅ Created full-featured avatar builder UI (`components/AvatarBuilder.tsx`)
✅ Created database migration script (`add-avatar-config-column.sql`)
✅ Updated database types to include avatar_config field

## To Complete

### 1. Run Database Migration
Execute the SQL file to add the avatar_config column:
```bash
# In Supabase Dashboard > SQL Editor, run:
add-avatar-config-column.sql
```

### 2. Add Avatar Builder to Settings/Profile

Update `app/profile.tsx` or create a dedicated avatar editing page:
- Replace the old AvatarCustomizer modal with the new AvatarBuilder
- Import CharacterAvatar and AvatarBuilder
- Save avatar config to Supabase profiles table

Example:
```typescript
import AvatarBuilder from '@/components/AvatarBuilder';
import CharacterAvatar from '@/components/CharacterAvatar';
import { DEFAULT_AVATAR_CONFIG } from '@/constants/avatar-config';

// In your modal/screen
<AvatarBuilder
  initialConfig={userProfile?.avatar_config || DEFAULT_AVATAR_CONFIG}
  onSave={async (config) => {
    await supabase
      .from('profiles')
      .update({ avatar_config: config })
      .eq('id', user.id);
  }}
  onCancel={() => setShowModal(false)}
/>
```

### 3. Update Profile Displays

Replace all instances of emoji/simple avatars with CharacterAvatar:

**Files to update:**
- `app/(tabs)/home.tsx` - Home screen user avatar
- `app/(tabs)/friends.tsx` - Friend list avatars  
- `app/profile.tsx` - Profile screen
- `components/FriendSearch.tsx` - Search results
- Any leaderboard or user list components

Example replacement:
```typescript
// OLD:
<Avatar config={{ emoji: user.avatar?.emoji }} size={60} />

// NEW:
<CharacterAvatar 
  config={user.avatar_config || DEFAULT_AVATAR_CONFIG} 
  size={60} 
  showBorder 
/>
```

### 4. Optional: Add to Onboarding

To add avatar creation as an onboarding step, update `app/onboarding.tsx`:

1. Add avatarConfig to OnboardingData state initialization:
```typescript
const [data, setData] = useState<OnboardingData>({
  // ... existing fields
  avatarConfig: DEFAULT_AVATAR_CONFIG
});
```

2. Add a new step (e.g., step 4 for gymnasie users, step 2 for högskola):
```typescript
case 4: // Or appropriate step number
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Skapa din avatar</Text>
      <AvatarBuilder
        initialConfig={data.avatarConfig}
        onSave={(config) => {
          setData({ ...data, avatarConfig: config });
          handleNext();
        }}
      />
    </View>
  );
```

3. Update progress calculation to include the avatar step
4. Pass avatarConfig to completeOnboarding

### 5. Update StudyContext or Profile Management

Ensure the context that manages user profiles can handle avatar_config:
- Load avatar_config from Supabase when fetching profile
- Save avatar_config when updating profile
- Provide default if user hasn't customized yet

## Testing Checklist

- [ ] Database column added successfully
- [ ] Avatar builder opens and all customization options work
- [ ] Saving avatar persists to database
- [ ] Avatar displays correctly in all sizes (small, medium, large)
- [ ] Avatars show in friend lists and leaderboards
- [ ] Default avatar shows for new users
- [ ] Gradient backgrounds render correctly
- [ ] All accessories and styles render properly

## Features Implemented

### Avatar Customization Options
- 6 skin tones
- 8 hairstyles with 8 colors
- 5 eye shapes with 5 colors
- 5 mouth expressions
- 5 clothing styles with 9 colors
- 7 accessories (glasses, cap, headphones, etc.)
- 8 background colors including gradients

### UI Features
- Category-based customization with icons
- Real-time preview
- Navigation between categories
- Color grids for easy selection
- Mobile-optimized interface
- Save/Cancel functionality

## Notes

- The avatar system uses SVG for rendering, ensuring crisp display at any size
- Gradient backgrounds use LinearGradient from expo-linear-gradient
- All avatars are stored as JSON configuration, not rendered images
- The system is fully extensible - new styles/colors can be added easily
- Backward compatible - existing emoji avatars can coexist during migration
