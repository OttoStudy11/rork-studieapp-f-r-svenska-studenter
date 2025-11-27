# Högskoleprovet Practice Feature - Setup Guide

## Overview
A comprehensive högskoleprovet (Swedish University Entrance Exam) practice feature has been implemented. Students can now practice all 8 sections of the test with real questions, track their progress, and get detailed statistics.

## 🗄️ Database Setup

### 1. Run the SQL files in order:
```bash
# 1. Create the database schema
Run: create-hogskoleprovet-system.sql

# 2. Populate with sample questions
Run: populate-hogskoleprovet-questions.sql
```

### Tables Created:
- `hp_tests` - Test instances from specific dates
- `hp_sections` - The 8 sections (ORD, LÄS, MEK, NOG, ELF, KVA, XYZ, DTK)
- `hp_questions` - Individual questions with answers and explanations
- `user_hp_question_answers` - User's answers to questions
- `user_hp_test_attempts` - Complete test/section attempts

## 📁 Files Created

### Context
- `contexts/HogskoleprovetContext.tsx` - State management for högskoleprovet

### Routes
- `app/hogskoleprovet/index.tsx` - Main hub showing all 8 sections
- `app/hogskoleprovet/[sectionId].tsx` - Practice screen for each section

### Database
- `lib/database.types.ts` - Updated with högskoleprovet types

## 🔧 Integration Steps

### 1. Wrap Root Layout with Provider

Add the Högskoleprovet provider to `app/_layout.tsx`:

```tsx
import { HogskoleprovetProvider } from '@/contexts/HogskoleprovetContext';

// In your root layout, wrap with the provider:
<HogskoleprovetProvider>
  {/* Your existing providers and components */}
</HogskoleprovetProvider>
```

### 2. Add Link to Course Pages

In `app/course/[id].tsx` (or course content pages), add this in the "Snabbåtkomst" section:

```tsx
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
  onPress={() => router.push('/hogskoleprovet' as any)}
>
  <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
    <BookOpen size={24} color="#3B82F6" />
  </View>
  <View style={styles.actionInfo}>
    <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Högskoleprovet</Text>
    <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>Öva på högskoleprovet</Text>
  </View>
  <ChevronRight size={20} color={theme.colors.textMuted} />
</TouchableOpacity>
```

## 🎯 Features

### 1. Section Practice
- **8 Sections**: ORD, LÄS, MEK, NOG, ELF, KVA, XYZ, DTK
- **Real Questions**: From actual högskoleprovet tests
- **Instant Feedback**: See if your answer is correct immediately
- **Explanations**: Detailed explanations for each question
- **Progress Tracking**: Track questions answered correctly

### 2. Question Types
- Multiple choice
- Reading comprehension (with passages)
- Quantitative comparison
- Verbal reasoning

### 3. Statistics
- Total attempts
- Average score
- Strong sections
- Weak sections
- Time spent

### 4. Points System
- Earn 10 points per correct answer
- Points are added to user's total_points in user_progress table
- Integrates with existing achievement system

## 📊 Sample Data Included

The `populate-hogskoleprovet-questions.sql` includes sample questions for:
- **ORD** (Vocabulary): 10 questions
- **MEK** (Sentence completion): 5 questions
- **LÄS** (Reading comprehension): 2 questions with passages
- **NOG** (Quantitative comparison): 5 questions
- **ELF** (Equations): 5 questions
- **KVA** (Quantitative analysis): 5 questions
- **XYZ** (Diagrams and tables): 2 questions
- **DTK** (Technical reading): 2 questions

### Add More Questions
To add more questions, insert into the `hp_questions` table:

```sql
INSERT INTO hp_questions (
  test_id, section_id, question_number, question_text, question_type, 
  options, correct_answer, explanation, difficulty_level
) VALUES (
  'test-id',
  'section-id',
  1,
  'Question text here',
  'multiple_choice',
  '["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]'::jsonb,
  'A',
  'Explanation here',
  'medium'
);
```

## 🎨 UI Features

- **Modern Design**: Clean, mobile-optimized interface
- **Color-Coded Sections**: Each section has its own color
- **Progress Indicators**: Visual progress bars
- **Difficulty Badges**: Easy, Medium, Hard
- **Results Screen**: Beautiful results with emojis and stats
- **Responsive**: Works on all screen sizes

## 🔐 Security

- RLS (Row Level Security) enabled on all tables
- Users can only see their own answers and attempts
- Questions and sections are publicly readable

## 🚀 Next Steps

1. Run the SQL files to create tables
2. Wrap app with HogskoleprovetProvider
3. Add navigation link from course pages
4. Test the feature
5. Add more questions for each section (aim for 20+ per section)

## 💡 Future Enhancements

- Full test mode (all 8 sections)
- Timed mode (with section time limits)
- Historical test selection (choose specific test dates)
- Detailed analytics and weak area identification
- AI-powered question generation
- Mock test simulator with real test conditions
