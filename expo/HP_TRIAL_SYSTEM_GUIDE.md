# Högskoleprovet Free Trial System

## Overview
The free trial system allows non-premium users to try one complete Högskoleprov test OR one selected section (delprov) before requiring a premium subscription.

## Features Implemented

### 1. Server-Side Trial Tracking
- **SQL Schema** (`sql-templates/create-hp-trial-system.sql`)
  - `hp_trial_usage` table tracks trial attempts
  - Functions for checking eligibility, starting, and completing trials
  - RLS policies for security
  - Prevents trial exploitation (one trial per user)

### 2. Trial Context (`contexts/HPTrialContext.tsx`)
- Manages trial state and eligibility
- Checks if user has available trial
- Starts and completes trial sessions
- Persists trial data to prevent reinstall bypass
- Integrates with premium status

### 3. UI Components
- **HPTrialSelectionModal** (`components/hogskoleprovet/HPTrialSelectionModal.tsx`)
  - Allows users to choose between full test or section
  - Shows verbal and quantitative sections
  - Clear information about trial limits

- **HPPaywallModal** (`components/hogskoleprovet/HPPaywallModal.tsx`)
  - Two variants: before_trial and after_trial
  - Before trial: Informational, encourages trying trial first
  - After trial: Conversion-focused with user's score
  - Lists all premium benefits

### 4. Integration
- **HogskoleprovetContext** updated to support trial mode
- **hogskoleprovet.tsx** screen integrated with trial system
- **hp-results.tsx** shows results and paywall after trial
- **app/_layout.tsx** includes HPTrialProvider

## User Flow

### Free User - First Time
1. User opens Högskoleprovet
2. Clicks on "Start Full Test" or any section
3. Sees paywall modal with option to "Try free first"
4. Clicks "Try free first" → Opens trial selection modal
5. Selects either full test or one section
6. Completes the trial with full timing and scoring
7. Sees results with trial completion badge
8. Automatically shown conversion paywall
9. Can upgrade to Premium or return to home

### Free User - After Trial Used
1. User opens Högskoleprovet
2. Clicks on any content
3. Immediately redirected to Premium page
4. Cannot access any more HP content without Premium

### Premium User
1. Full unrestricted access
2. No trial system interference
3. All features unlocked

## Database Setup

Run the SQL schema:
```bash
# Execute in Supabase SQL editor or via CLI
psql -d your_database -f sql-templates/create-hp-trial-system.sql
```

## Key Functions

### Check Eligibility
```typescript
const hasTrialAvailable = await checkTrialEligibility();
```

### Start Trial
```typescript
const trialId = await startTrial('full_test', 'full_test');
// OR
const trialId = await startTrial('section', 'ORD');
```

### Complete Trial
```typescript
await completeTrial(trialId, totalQuestions, correctAnswers, scorePercentage, estimatedHPScore, timeSpentMinutes);
```

## Security Features

1. **Server-side tracking**: Trial usage stored in database, not just local storage
2. **User-specific**: Tied to authenticated user ID
3. **Cannot be reset**: Even if app is reinstalled
4. **RLS policies**: Users can only access their own trial data
5. **Premium check**: Premium users bypass trial system entirely

## Testing Checklist

- [ ] Free user can see trial option
- [ ] Free user can select full test trial
- [ ] Free user can select section trial
- [ ] Trial completes correctly with results
- [ ] Paywall shows after trial
- [ ] Cannot start second trial after completion
- [ ] Premium users unaffected
- [ ] Trial persists across app restarts
- [ ] Trial cannot be reset by reinstalling

## Benefits

- **Fair**: One complete trial per user
- **Clean**: Separate from premium system
- **Conversion-focused**: Shows value before asking for payment
- **Complete**: Full featured trial experience
- **Secure**: Cannot be exploited

## Premium Conversion Points

1. **Before trial**: Informational paywall
2. **After trial completion**: Results + upgrade prompt
3. **Trying to access more content**: Direct to premium page
4. **Locked sections on main screen**: Visual lock indicators
