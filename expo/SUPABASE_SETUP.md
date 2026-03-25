# Supabase Setup Instructions

## 🚨 IMPORTANT: Fix Database Errors

To fix the current errors, you need to set up the database tables:

## Quick Setup for Demo

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard/project/ekeebrhdpjtbooaiggbw

2. **Navigate to SQL Editor** in the left sidebar

3. **Copy and paste the entire content** from `supabase-schema.sql` into the SQL editor

4. **Click "Run"** to execute the SQL script

This will create all the necessary tables and insert sample data for both gymnasie and högskola courses.

## What the script does:

- Creates all database tables (users, courses, notes, etc.)
- Adds indexes for better performance
- Inserts sample courses for both gymnasie and högskola
- Disables RLS (Row Level Security) for demo purposes
- Grants necessary permissions for the app to work

## Important Notes:

- **This setup is for DEMO purposes only**
- RLS is disabled for simplicity
- In production, you should enable RLS and create proper security policies
- The app will work with local data if the database is not set up

## Troubleshooting:

If you get errors:
1. Make sure you're in the correct Supabase project
2. Try running the script in smaller chunks if it fails
3. Check the Supabase logs for detailed error messages

## After Setup:

Once the database is set up, the app will:
- Save user data to Supabase
- Load courses from the database
- Persist notes and pomodoro sessions
- Enable all social features

---

# Original Setup Documentation

## 📊 Database Schema Overview

### Core Tables

- **users** - User profiles and onboarding data
- **courses** - Available courses with resources and tips
- **user_courses** - User-course relationships with progress tracking
- **notes** - User notes (linked to courses or standalone)
- **quizzes** - Course-specific quiz questions
- **pomodoro_sessions** - Study session tracking
- **friends** - Social connections between users
- **settings** - User preferences and app settings

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Sample Data** - Pre-populated courses for both gymnasie and högskola levels
- **Optimized Indexes** - Fast queries for common operations
- **Foreign Key Relationships** - Data integrity and consistency

## 🔧 Available Functions

The `lib/database.ts` file provides comprehensive functions for:

### User Management
- `createUser()` - Create new user profile
- `getUser()` - Get user by ID
- `updateUser()` - Update user information

### Course Management
- `getCourses()` - Get all available courses
- `getUserCourses()` - Get user's enrolled courses
- `addUserToCourse()` - Enroll user in course
- `updateUserCourseProgress()` - Update course progress
- `setActiveCourse()` - Mark course as active

### Notes Management
- `getUserNotes()` - Get user's notes
- `createNote()` - Create new note
- `updateNote()` - Update existing note
- `deleteNote()` - Delete note

### Pomodoro Sessions
- `getUserPomodoroSessions()` - Get user's study sessions
- `createPomodoroSession()` - Log new study session
- `getPomodoroStats()` - Get study statistics

### Social Features
- `getUserFriends()` - Get user's friends
- `sendFriendRequest()` - Send friend request
- `acceptFriendRequest()` - Accept friend request
- `getFriendRequests()` - Get pending requests

### Settings
- `getUserSettings()` - Get user preferences
- `createOrUpdateSettings()` - Update user settings

### Search
- `searchCourses()` - Search available courses
- `searchUsers()` - Find other users

## 🔐 Authentication

The app uses Supabase Auth with anonymous sign-in for demo purposes. In production, you might want to implement:

- Email/password authentication
- Social login (Google, Apple, etc.)
- Magic link authentication

## 📱 Context Integration

The `StudyContext` automatically:

- Handles authentication on app startup
- Loads user data from Supabase
- Provides real-time data synchronization
- Manages offline/online state
- Converts between database and app data formats

## 🎯 Sample Data

The schema includes sample courses for both education levels:

### Gymnasie Courses
- Matematik 3c
- Fysik 2
- Svenska 3
- Engelska 7
- Kemi 2

### Högskola Courses
- Linjär Algebra
- Programmering Grundkurs
- Mikroekonomi
- Organisk Kemi
- Psykologi Grundkurs

Each course includes:
- Detailed descriptions
- Study resources
- Learning tips
- Related course connections

## 🚨 Important Notes

1. **Replace Credentials**: Don't forget to update the Supabase URL and anon key in `lib/supabase.ts`
2. **RLS Policies**: The database has Row Level Security enabled - users can only access their own data
3. **Anonymous Auth**: Currently using anonymous authentication for demo purposes
4. **Sample Data**: The schema includes pre-populated courses and will create sample user-course relationships during onboarding

## 🔄 Data Flow

1. User opens app → Anonymous authentication
2. If no user profile → Show onboarding
3. Complete onboarding → Create user in database + enroll in sample courses
4. App loads user data → Courses, notes, sessions, friends
5. All user actions → Real-time sync with Supabase

## 🛠 Development Tips

- Use the Supabase dashboard to monitor database activity
- Check the logs for any RLS policy issues
- Use the API docs in Supabase for testing queries
- The `Database` type provides full TypeScript support

Your advanced study app is now ready with a robust, scalable backend! 🎉