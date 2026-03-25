# AI Flashcards System - Complete Guide

## Overview
The AI Flashcards feature generates intelligent, context-aware flashcards using the Rork AI Toolkit. Students can generate flashcards automatically from course content or from their own text input.

## Features

### ✅ Implemented
- **Automatic Generation**: Generate flashcards based on course content
- **Custom Text Input**: Paste notes, textbook excerpts, or summaries to generate flashcards
- **Spaced Repetition**: SM-2 algorithm for optimal learning intervals
- **Progress Tracking**: Track mastered, reviewed, and due flashcards
- **Swipe Interface**: Intuitive swipe-based review system
- **Database Integration**: All flashcards saved to Supabase
- **Error Handling**: Comprehensive error messages and retry logic

### 🎯 How It Works

#### 1. **AI Generation Process**
```typescript
// The AI uses generateObject from @rork-ai/toolkit-sdk
const result = await generateFlashcardsWithAI({
  courseName: 'Matematik 1a',
  courseDescription: 'Course description or custom text',
  subject: 'Mathematics',
  targetCount: 20,
  difficulty: 'all',
  language: 'sv',
});
```

#### 2. **Flashcard Structure**
Each generated flashcard contains:
- **question**: Clear, specific question
- **answer**: Concise, accurate answer (2-4 sentences)
- **difficulty**: 1 (easy), 2 (medium), or 3 (hard)
- **explanation** (optional): Additional context
- **context** (optional): Which topic/area it belongs to
- **tags** (optional): Keywords for organization

#### 3. **Storage**
Flashcards are saved to Supabase:
```sql
flashcards (
  id UUID,
  course_id TEXT,
  question TEXT,
  answer TEXT,
  difficulty INTEGER,
  explanation TEXT,
  context TEXT,
  tags TEXT[]
)
```

#### 4. **Progress Tracking**
User progress uses the SM-2 spaced repetition algorithm:
```sql
user_flashcard_progress (
  id UUID,
  user_id UUID,
  flashcard_id UUID,
  ease_factor DECIMAL,
  interval INTEGER,
  repetitions INTEGER,
  next_review_at TIMESTAMP,
  total_reviews INTEGER,
  correct_reviews INTEGER
)
```

## Usage

### For Students

#### Access Flashcards
1. Open any course in the app
2. Tap the **"AI Flashcards"** button (lightning icon)
3. Choose generation method:
   - **Auto-generate**: Generate from course content
   - **Custom text**: Paste your own notes

#### Generate from Course Content
1. Select number of flashcards (10, 20, 30, or 50)
2. Tap **"Generera Flashcards"**
3. Wait for AI to generate and save (~5-10 seconds for 20 cards)
4. Start studying!

#### Generate from Custom Text
1. Tap **"Generera från egen text"**
2. Paste text (minimum 20 characters)
3. Tap **"Generera"**
4. AI creates flashcards based on your text

#### Study Flashcards
- **Swipe Right**: Mark as correct (increases review interval)
- **Swipe Left**: Mark as incorrect (shows card again sooner)
- Progress automatically saved

### Example Custom Text Input
```
Fotosyntesen är processen där växter använder solenergi för att omvandla 
koldioxid och vatten till glukos och syrgas. Klorofyll är det gröna pigmentet 
som absorberar ljusenergi. Processen sker i kloroplasterna och består av två 
faser: ljusreaktionen och mörkereaktionen.
```

This generates flashcards like:
- Q: "Vad är fotosyntesen?" A: "Processen där växter använder solenergi..."
- Q: "Vilken roll spelar klorofyll?" A: "Klorofyll är det gröna pigmentet som..."
- Q: "Var sker fotosyntesen?" A: "I kloroplasterna i växtcellerna..."

## Technical Details

### Files Structure
```
app/
  flashcards-v2/[courseId].tsx    - Main flashcard screen
  content-course/[id].tsx          - Course page with flashcard button
lib/
  flashcard-ai-v2.ts               - AI generation logic
  sm2-algorithm.ts                 - Spaced repetition algorithm
services/
  flashcards.ts                    - Database operations
components/
  FlashcardSwipe.tsx               - Swipe component
create-flashcards-system.sql       - Database schema
```

### Key Functions

#### Generate Flashcards
```typescript
import { generateFlashcardsWithAI } from '@/lib/flashcard-ai-v2';

const result = await generateFlashcardsWithAI({
  courseName: course.title,
  courseDescription: course.description,
  targetCount: 20,
  difficulty: 'all',
  language: 'sv',
});

if (result.success) {
  // Save to database
  await saveFlashcardBatch(result.flashcards, courseId);
}
```

#### Fetch Flashcards
```typescript
import { getCourseFlashcards } from '@/services/flashcards';

const { flashcards, error } = await getCourseFlashcards(courseId);
```

#### Track Progress
```typescript
import { updateFlashcardProgress } from '@/services/flashcards';
import { calculateSM2 } from '@/lib/sm2-algorithm';

const sm2Result = calculateSM2(quality, repetitions, easeFactor, interval);

await updateFlashcardProgress(userId, flashcardId, {
  easeFactor: sm2Result.easeFactor,
  interval: sm2Result.interval,
  repetitions: sm2Result.repetitions,
  nextReview: sm2Result.nextReview,
  quality,
  correct,
});
```

## Error Handling

### Common Issues

#### 1. "AI kunde inte generera flashcards"
**Causes:**
- Toolkit not configured (`EXPO_PUBLIC_TOOLKIT_URL` missing)
- Network issues
- Invalid course data

**Solution:**
- Verify environment variables are set
- Check console for detailed error logs
- Ensure AI chat is working (test in AI Chat tab)

#### 2. "Kunde inte spara flashcards"
**Causes:**
- Database connection issues
- Invalid flashcard format
- RLS policies blocking insert

**Solution:**
- Check Supabase connection
- Verify user is authenticated
- Check RLS policies allow insert

#### 3. Generation Button Does Nothing
**Causes:**
- Missing `generateObject` function from toolkit
- Network request blocked
- Console errors

**Solution:**
- Check browser/app console for errors
- Verify toolkit SDK is imported correctly
- Test with simpler text input

### Debug Mode
Enable detailed logging by checking console:
```typescript
console.log('🚀 [Flashcards] Starting generation...');
console.log('✅ [Flashcards] Generated X flashcards');
console.log('❌ [Flashcards] Generation failed:', error);
```

## Database Setup

### Required Tables
Run `create-flashcards-system.sql` to create:
1. **flashcards** - Stores all flashcards
2. **user_flashcard_progress** - Tracks user progress
3. **flashcard_decks** - Optional deck organization

### RLS Policies
```sql
-- All users can view flashcards
CREATE POLICY "Anyone can view flashcards" ON flashcards
  FOR SELECT TO authenticated USING (true);

-- Users can only manage their own progress
CREATE POLICY "Users can view their own progress" 
  ON user_flashcard_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

## Performance Optimization

### Generation Speed
- 10 flashcards: ~3-5 seconds
- 20 flashcards: ~5-10 seconds
- 50 flashcards: ~15-20 seconds

### Caching
React Query caches flashcards:
```typescript
useQuery({
  queryKey: ['flashcards-v2', courseId],
  queryFn: () => getCourseFlashcards(courseId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Database Indexes
Indexes on:
- `flashcards.course_id`
- `user_flashcard_progress.user_id`
- `user_flashcard_progress.next_review_at`

## Future Enhancements

### Planned Features
- [ ] AI explanations for incorrect answers
- [ ] Custom difficulty selection
- [ ] Topic-specific generation
- [ ] Export/import flashcards
- [ ] Shared flashcard decks
- [ ] Audio pronunciation
- [ ] Image flashcards

### Potential Improvements
- Bulk generation for all courses
- Schedule generation jobs
- Collaborative flashcard creation
- Gamification (streaks, achievements)

## Troubleshooting Checklist

### Before Reporting Issues
- [ ] Verify AI Chat tab works (same AI engine)
- [ ] Check console for error messages
- [ ] Test with simple text input
- [ ] Verify user is authenticated
- [ ] Check network connection
- [ ] Confirm Supabase tables exist
- [ ] Test with different course

### Support
If issues persist:
1. Check console logs
2. Copy full error message
3. Note which course/text was used
4. Contact support with details

## Best Practices

### For Best Results
1. **Use descriptive course names** - Better context for AI
2. **Provide clear text** - At least 50 words for quality
3. **Review generated cards** - Edit if needed
4. **Study consistently** - Spaced repetition works best with regular use
5. **Mix difficulties** - Challenge yourself with harder cards

### Text Input Tips
✅ **Good:**
```
Första världskriget började 1914 och slutade 1918. Orsaker inkluderade 
nationalism, imperialism och militarism. Kriget utlöstes av mordet på 
ärkehertig Franz Ferdinand i Sarajevo.
```

❌ **Too short:**
```
WW1 was 1914-1918.
```

## API Reference

### generateFlashcardsWithAI
```typescript
interface FlashcardGenerationRequest {
  courseName: string;
  courseDescription?: string;
  subject?: string;
  targetCount: number;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  topics?: string[];
  language?: 'sv' | 'en';
}

interface FlashcardGenerationResult {
  success: boolean;
  flashcards: GeneratedFlashcard[];
  error?: string;
  metadata?: {
    requestedCount: number;
    generatedCount: number;
    timestamp: string;
  };
}
```

### saveFlashcardBatch
```typescript
async function saveFlashcardBatch(
  flashcards: GeneratedFlashcard[],
  courseId: string,
  moduleId?: string,
  lessonId?: string
): Promise<{
  success: boolean;
  savedCount: number;
  error?: string;
}>;
```

### getCourseFlashcards
```typescript
async function getCourseFlashcards(
  courseId: string
): Promise<{
  flashcards: Flashcard[];
  error?: string;
}>;
```

### updateFlashcardProgress
```typescript
async function updateFlashcardProgress(
  userId: string,
  flashcardId: string,
  progressData: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
    quality: number;
    correct: boolean;
  },
  existingProgress?: UserFlashcardProgress
): Promise<{
  success: boolean;
  error?: string;
}>;
```

## Summary

The AI Flashcards system is now **fully functional** with:
- ✅ AI generation using working toolkit
- ✅ Custom text input support
- ✅ Database integration
- ✅ Progress tracking
- ✅ Error handling
- ✅ User-friendly interface
- ✅ Course integration

Students can now generate and study flashcards effortlessly, directly from course pages or using their own study materials.
