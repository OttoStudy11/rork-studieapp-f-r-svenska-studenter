# Högskoleprov Trial System Setup Guide

## Overview
This guide explains how to set up and use the free trial system for Högskoleprov content.

## Database Setup

### 1. Run the SQL Migration
Execute the SQL file to create the necessary database tables and functions:

```bash
# Run this SQL file in your Supabase SQL editor
sql-templates/create-hp-trial-system.sql
```

This creates:
- `user_hp_trial` table to track trial usage
- Functions for checking, starting, and completing trials
- RLS policies for security

### 2. Verify Database Setup
After running the migration, verify the setup:

```sql
-- Check if table exists
SELECT * FROM user_hp_trial LIMIT 1;

-- Test trial availability function
SELECT check_hp_trial_available('user-id-here');

-- Test trial status function
SELECT get_hp_trial_status('user-id-here');
```

## How It Works

### Trial Eligibility
- Free users can try ONE of:
  - Full Högskoleprov test (all 6 sections)
  - OR one single delprov (section)
- Trial state is stored server-side and persists across app reinstalls
- Premium users automatically have full access

### User Flow

#### 1. Free User Without Trial
When a free user tries to access HP content:
1. Shows informational paywall
2. "Try Free First" button opens trial selection modal
3. User chooses: Full test OR one section
4. Trial is marked as used in database
5. Content unlocks for that specific choice

#### 2. During Trial
- User completes the test/section normally
- All features work as expected
- Results are saved and shown

#### 3. After Trial Completion
- Shows conversion-focused paywall
- Displays their trial results
- Encourages upgrade to Premium
- All other HP content remains locked

#### 4. Free User After Trial Used
- Shows upgrade paywall immediately
- No option to retry trial
- Must upgrade to Premium for access

## Implementation Details

### Context & State Management
The system uses `HPTrialContext` which provides:

```typescript
interface HPTrialContextType {
  trialStatus: HPTrialStatus | null;
  isLoading: boolean;
  isTrialAvailable: boolean;
  canAccessContent: (contentType, contentId?) => boolean;
  startTrial: (trialType, trialContent) => Promise<boolean>;
  completeTrial: (...) => Promise<boolean>;
  refreshTrialStatus: () => Promise<void>;
  showTrialModal: boolean;
  setShowTrialModal: (show: boolean) => void;
}
```

### Access Control Logic

```typescript
// Check if user can access specific content
const canAccess = canAccessContent('full_test'); // for full test
const canAccess = canAccessContent('delprov', 'ORD'); // for specific section
```

### Starting a Trial

```typescript
// User selects full test trial
const success = await startTrial('full_test', 'full');

// User selects section trial (e.g., ORD)
const success = await startTrial('delprov', 'ORD');
```

### Completing a Trial

```typescript
// After test completion
await completeTrial(
  trialId,
  totalQuestions,
  correctAnswers,
  scorePercentage,
  estimatedScore,
  timeSpent
);
```

## Components

### HPTrialSelectionModal
Modal for selecting trial content:
- Shows full test option with benefits
- Lists all 6 sections (verbal + quantitative)
- Handles trial initialization
- Integrates with toast notifications

### HPPaywallModal
Contextual paywall with two modes:

**before_trial mode:**
- Shows premium features
- "Try Free First" button → Opens trial selection
- "See Premium Plans" button → Opens premium page

**after_trial mode:**
- Congratulates user on completing trial
- Shows their score
- Emphasizes continued improvement with Premium
- Direct "Upgrade to Premium" CTA

## Integration with Existing HP System

### HogskoleprovetContext
The trial system integrates seamlessly with existing HP session management:

```typescript
// Start session with trial flag
await startPracticeSession(
  sectionCode,
  testVersionId,
  isTrialMode,  // true for trial
  trialId       // from trial context
);

await startFullTest(
  isTrialMode,  // true for trial
  trialId       // from trial context
);
```

### Session State
Trial information is stored in session state:
```typescript
interface HPSessionState {
  // ... other fields
  isTrialMode?: boolean;
  trialId?: string;
}
```

## Testing Checklist

### Free User - No Trial Used
- [ ] Can see locked HP content
- [ ] Clicking locked content shows before_trial paywall
- [ ] "Try Free First" opens trial selection modal
- [ ] Can select full test
- [ ] Can select any section
- [ ] Selected content unlocks and works
- [ ] Trial marked as used in database

### Free User - Trial In Progress
- [ ] Selected content works normally
- [ ] Timer functions correctly
- [ ] Can answer questions
- [ ] Can complete test/section
- [ ] Results save correctly

### Free User - Trial Completed
- [ ] Results screen shows
- [ ] after_trial paywall appears
- [ ] Other HP content remains locked
- [ ] Clicking other content shows after_trial paywall
- [ ] Can view stats page
- [ ] Cannot start new tests

### Premium User
- [ ] No trial system shown
- [ ] All content accessible
- [ ] No paywalls appear
- [ ] Everything works normally

### Edge Cases
- [ ] App reinstall doesn't reset trial
- [ ] Multiple devices sync trial status
- [ ] Offline mode handles gracefully
- [ ] Network errors don't break flow
- [ ] Database errors are logged properly

## Troubleshooting

### Trial Not Marking as Used
Check the database function:
```sql
SELECT start_hp_trial('user-id', 'full_test', 'full');
```

### User Can't Access Trial Content
Verify the access control:
```sql
SELECT * FROM user_hp_trial WHERE user_id = 'user-id';
```

### Trial Status Not Loading
Check RLS policies:
```sql
SELECT * FROM user_hp_trial WHERE auth.uid() = user_id;
```

### Premium User Seeing Trial UI
Verify subscription status in profiles table:
```sql
SELECT subscription_type FROM profiles WHERE id = 'user-id';
```

## Production Deployment

### Pre-deployment
1. Test all flows on staging
2. Verify database migration works
3. Check RLS policies are correct
4. Test with real user accounts

### Deployment Steps
1. Run database migration during maintenance window
2. Deploy app code update
3. Monitor error logs
4. Check trial conversion metrics

### Post-deployment
1. Monitor trial usage analytics
2. Track conversion rates
3. Gather user feedback
4. Iterate on paywall messaging

## Analytics to Track

### Key Metrics
- Trial start rate (% of free users who start trial)
- Trial completion rate (% who finish their trial)
- Trial-to-premium conversion rate
- Time between trial completion and conversion
- Popular trial choices (full test vs sections)
- Which sections are most popular

### Implementation
Add analytics events:
- `hp_trial_shown` - User saw trial option
- `hp_trial_selected` - User selected trial type
- `hp_trial_started` - Trial session began
- `hp_trial_completed` - Trial finished
- `hp_trial_converted` - User upgraded after trial

## Future Enhancements

### Potential Improvements
1. Allow trial reset after X months for good users
2. A/B test different paywall messaging
3. Add "limited time" urgency to trial offer
4. Send reminder notification to complete trial
5. Offer second trial for different content type
6. Email follow-up after trial completion
7. In-app messages to trial users

### Data-Driven Optimization
- Track which paywall messages convert best
- Analyze drop-off points in trial flow
- Test different trial durations
- Experiment with trial content limitations

## Support

For issues or questions about the trial system:
1. Check database logs for errors
2. Review HPTrialContext console logs
3. Verify RLS policies in Supabase
4. Check user's subscription_type in profiles table
