export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      university_course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          duration_minutes: number | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          duration_minutes?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          duration_minutes?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "university_courses"
            referencedColumns: ["id"]
          }
        ]
      }
      university_course_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string
          order_index: number
          duration_minutes: number | null
          lesson_type: string
          resources: Json
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          module_id: string
          title: string
          content: string
          order_index: number
          duration_minutes?: number | null
          lesson_type?: string
          resources?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string
          order_index?: number
          duration_minutes?: number | null
          lesson_type?: string
          resources?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "university_course_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      university_course_exercises: {
        Row: {
          id: string
          lesson_id: string
          question: string
          question_type: string
          options: Json | null
          correct_answer: string
          explanation: string | null
          difficulty: string
          order_index: number
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          lesson_id: string
          question: string
          question_type: string
          options?: Json | null
          correct_answer: string
          explanation?: string | null
          difficulty?: string
          order_index: number
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          question?: string
          question_type?: string
          options?: Json | null
          correct_answer?: string
          explanation?: string | null
          difficulty?: string
          order_index?: number
          points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_course_exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "university_course_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      user_university_module_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          progress: number
          completed_lessons: number
          total_lessons: number
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          module_id: string
          progress?: number
          completed_lessons?: number
          total_lessons?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          progress?: number
          completed_lessons?: number
          total_lessons?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_university_module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_university_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "university_course_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      user_university_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          time_spent_minutes: number
          last_accessed_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          lesson_id: string
          completed?: boolean
          time_spent_minutes?: number
          last_accessed_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          time_spent_minutes?: number
          last_accessed_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_university_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_university_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "university_course_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      user_university_exercise_attempts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          user_answer: string
          is_correct: boolean
          points_earned: number
          time_spent_seconds: number | null
          attempted_at: string
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          exercise_id: string
          user_answer: string
          is_correct: boolean
          points_earned?: number
          time_spent_seconds?: number | null
          attempted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          user_answer?: string
          is_correct?: boolean
          points_earned?: number
          time_spent_seconds?: number | null
          attempted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_university_exercise_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_university_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "university_course_exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string
          username: string
          display_name: string
          email: string | null
          avatar_url: string | null
          avatar_config: Json | null
          level: string
          program: string
          purpose: string
          subscription_type: 'free' | 'premium'
          subscription_expires_at: string | null
          program_id: string | null
          gymnasium_id: string | null
          gymnasium_name: string | null
          gymnasium_grade: string | null
          daily_goal_hours: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          username: string
          display_name: string
          email?: string | null
          avatar_url?: string | null
          avatar_config?: Json | null
          level: string
          program: string
          purpose: string
          subscription_type?: 'free' | 'premium'
          subscription_expires_at?: string | null
          program_id?: string | null
          gymnasium_id?: string | null
          gymnasium_name?: string | null
          gymnasium_grade?: string | null
          daily_goal_hours?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          display_name?: string
          email?: string | null
          avatar_url?: string | null
          avatar_config?: Json | null
          level?: string
          program?: string
          purpose?: string
          subscription_type?: 'free' | 'premium'
          subscription_expires_at?: string | null
          program_id?: string | null
          gymnasium_id?: string | null
          gymnasium_name?: string | null
          gymnasium_grade?: string | null
          daily_goal_hours?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }
      programs: {
        Row: {
          id: string
          name: string
          level: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          level: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: string
          created_at?: string
        }
        Relationships: []
      }
      program_courses: {
        Row: {
          program_id: string
          course_id: string
        }
        Insert: {
          program_id: string
          course_id: string
        }
        Update: {
          program_id?: string
          course_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          course_code: string | null
          title: string
          description: string
          subject: string
          level: string
          points: number | null
          resources: Json
          tips: Json
          progress: number
          related_courses: Json
          created_at: string
          education_level: string | null
          education_year: number | null
          program_id: string | null
          semester: number | null
          credits: number | null
          is_mandatory: boolean | null
          field: string | null
          school_id: string | null
        }
        Insert: {
          id?: string
          course_code?: string | null
          title: string
          description: string
          subject: string
          level: string
          points?: number | null
          resources?: Json
          tips?: Json
          progress?: number
          related_courses?: Json
          created_at?: string
          education_level?: string | null
          education_year?: number | null
          program_id?: string | null
          semester?: number | null
          credits?: number | null
          is_mandatory?: boolean | null
          field?: string | null
          school_id?: string | null
        }
        Update: {
          id?: string
          course_code?: string | null
          title?: string
          description?: string
          subject?: string
          level?: string
          points?: number | null
          resources?: Json
          tips?: Json
          progress?: number
          related_courses?: Json
          created_at?: string
          education_level?: string | null
          education_year?: number | null
          program_id?: string | null
          semester?: number | null
          credits?: number | null
          is_mandatory?: boolean | null
          field?: string | null
          school_id?: string | null
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          id: string
          user_id: string
          course_id: string
          progress: number
          target_grade: string | null
          is_active: boolean
          manual_progress: number
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress?: number
          target_grade?: string | null
          is_active?: boolean
          manual_progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress?: number
          target_grade?: string | null
          is_active?: boolean
          manual_progress?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          question: string
          options: Json
          answer: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          question: string
          options: Json
          answer: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          question?: string
          options?: Json
          answer?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          start_time: string
          end_time: string
          duration: number
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          start_time: string
          end_time: string
          duration: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          start_time?: string
          end_time?: string
          duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pomodoro_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          user_id: string
          total_study_time: number
          total_sessions: number
          current_streak: number
          longest_streak: number
          last_study_date: string | null
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_study_time?: number
          total_sessions?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_study_time?: number
          total_sessions?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          notes: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number
          status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          completed: boolean
          technique: 'pomodoro' | 'deep_work' | 'active_recall' | 'spaced_repetition' | 'other' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title?: string
          notes?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes: number
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          completed?: boolean
          technique?: 'pomodoro' | 'deep_work' | 'active_recall' | 'spaced_repetition' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
          notes?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          completed?: boolean
          technique?: 'pomodoro' | 'deep_work' | 'active_recall' | 'spaced_repetition' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          user_id: string
          dark_mode: boolean
          timer_focus: number
          timer_break: number
          notifications: boolean
          language: string
        }
        Insert: {
          id?: string
          user_id: string
          dark_mode?: boolean
          timer_focus?: number
          timer_break?: number
          notifications?: boolean
          language?: string
        }
        Update: {
          id?: string
          user_id?: string
          dark_mode?: boolean
          timer_focus?: number
          timer_break?: number
          notifications?: boolean
          language?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          achievement_key: string
          title: string
          description: string
          icon: string
          category: 'study' | 'social' | 'streak' | 'milestone'
          requirement_type: 'study_time' | 'sessions' | 'courses' | 'notes' | 'streak' | 'friends'
          requirement_target: number
          requirement_timeframe: 'day' | 'week' | 'month' | 'total' | null
          reward_points: number
          reward_badge: string | null
          created_at: string
        }
        Insert: {
          id?: string
          achievement_key: string
          title: string
          description: string
          icon: string
          category: 'study' | 'social' | 'streak' | 'milestone'
          requirement_type: 'study_time' | 'sessions' | 'courses' | 'notes' | 'streak' | 'friends'
          requirement_target: number
          requirement_timeframe?: 'day' | 'week' | 'month' | 'total' | null
          reward_points?: number
          reward_badge?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          achievement_key?: string
          title?: string
          description?: string
          icon?: string
          category?: 'study' | 'social' | 'streak' | 'milestone'
          requirement_type?: 'study_time' | 'sessions' | 'courses' | 'notes' | 'streak' | 'friends'
          requirement_target?: number
          requirement_timeframe?: 'day' | 'week' | 'month' | 'total' | null
          reward_points?: number
          reward_badge?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      remember_me_sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          device_info: Json
          expires_at: string
          last_used_at: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          device_info?: Json
          expires_at: string
          last_used_at?: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          device_info?: Json
          expires_at?: string
          last_used_at?: string
          created_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "remember_me_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          estimated_hours: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          estimated_hours?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          estimated_hours?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      course_lessons: {
        Row: {
          id: string
          module_id: string
          course_id: string
          title: string
          description: string | null
          content: string | null
          lesson_type: 'theory' | 'practical' | 'exercise' | 'quiz' | 'video' | 'reading'
          order_index: number
          estimated_minutes: number
          difficulty_level: 'easy' | 'medium' | 'hard'
          prerequisites: string[] | null
          learning_objectives: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          course_id: string
          title: string
          description?: string | null
          content?: string | null
          lesson_type?: 'theory' | 'practical' | 'exercise' | 'quiz' | 'video' | 'reading'
          order_index?: number
          estimated_minutes?: number
          difficulty_level?: 'easy' | 'medium' | 'hard'
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string | null
          lesson_type?: 'theory' | 'practical' | 'exercise' | 'quiz' | 'video' | 'reading'
          order_index?: number
          estimated_minutes?: number
          difficulty_level?: 'easy' | 'medium' | 'hard'
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      course_exercises: {
        Row: {
          id: string
          lesson_id: string | null
          course_id: string
          title: string
          description: string | null
          instructions: string
          exercise_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'coding' | 'math' | 'practical'
          questions: Json
          correct_answers: Json
          points: number
          time_limit_minutes: number | null
          difficulty_level: 'easy' | 'medium' | 'hard'
          hints: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          course_id: string
          title: string
          description?: string | null
          instructions: string
          exercise_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'coding' | 'math' | 'practical'
          questions: Json
          correct_answers: Json
          points?: number
          time_limit_minutes?: number | null
          difficulty_level?: 'easy' | 'medium' | 'hard'
          hints?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          course_id?: string
          title?: string
          description?: string | null
          instructions?: string
          exercise_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'coding' | 'math' | 'practical'
          questions?: Json
          correct_answers?: Json
          points?: number
          time_limit_minutes?: number | null
          difficulty_level?: 'easy' | 'medium' | 'hard'
          hints?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_exercises_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          progress_percentage: number
          time_spent_minutes: number
          started_at: string | null
          completed_at: string | null
          last_accessed_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          progress_percentage?: number
          time_spent_minutes?: number
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          progress_percentage?: number
          time_spent_minutes?: number
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      study_guides: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: string
          guide_type: 'summary' | 'cheat_sheet' | 'formula_sheet' | 'vocabulary' | 'timeline'
          difficulty_level: 'easy' | 'medium' | 'hard'
          estimated_read_time: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content: string
          guide_type?: 'summary' | 'cheat_sheet' | 'formula_sheet' | 'vocabulary' | 'timeline'
          difficulty_level?: 'easy' | 'medium' | 'hard'
          estimated_read_time?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string
          guide_type?: 'summary' | 'cheat_sheet' | 'formula_sheet' | 'vocabulary' | 'timeline'
          difficulty_level?: 'easy' | 'medium' | 'hard'
          estimated_read_time?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_guides_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      course_assessments: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          assessment_type: 'quiz' | 'test' | 'exam' | 'project' | 'assignment'
          total_points: number
          passing_score: number
          time_limit_minutes: number | null
          attempts_allowed: number
          is_published: boolean
          available_from: string | null
          available_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          assessment_type: 'quiz' | 'test' | 'exam' | 'project' | 'assignment'
          total_points?: number
          passing_score?: number
          time_limit_minutes?: number | null
          attempts_allowed?: number
          is_published?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          assessment_type?: 'quiz' | 'test' | 'exam' | 'project' | 'assignment'
          total_points?: number
          passing_score?: number
          time_limit_minutes?: number | null
          attempts_allowed?: number
          is_published?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          timer_sound_enabled: boolean
          timer_haptics_enabled: boolean
          timer_notifications_enabled: boolean
          timer_background_enabled: boolean
          timer_focus_duration: number
          timer_break_duration: number
          dark_mode: boolean
          theme_color: string
          language: string
          achievements_notifications: boolean
          friend_request_notifications: boolean
          study_reminder_notifications: boolean
          profile_visible: boolean
          show_study_stats: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timer_sound_enabled?: boolean
          timer_haptics_enabled?: boolean
          timer_notifications_enabled?: boolean
          timer_background_enabled?: boolean
          timer_focus_duration?: number
          timer_break_duration?: number
          dark_mode?: boolean
          theme_color?: string
          language?: string
          achievements_notifications?: boolean
          friend_request_notifications?: boolean
          study_reminder_notifications?: boolean
          profile_visible?: boolean
          show_study_stats?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timer_sound_enabled?: boolean
          timer_haptics_enabled?: boolean
          timer_notifications_enabled?: boolean
          timer_background_enabled?: boolean
          timer_focus_duration?: number
          timer_break_duration?: number
          dark_mode?: boolean
          theme_color?: string
          language?: string
          achievements_notifications?: boolean
          friend_request_notifications?: boolean
          study_reminder_notifications?: boolean
          profile_visible?: boolean
          show_study_stats?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      active_timer_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: 'focus' | 'break'
          status: 'idle' | 'running' | 'paused'
          course_id: string | null
          course_name: string
          total_duration: number
          remaining_time: number
          start_timestamp: number
          paused_at: number | null
          device_id: string | null
          device_platform: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: 'focus' | 'break'
          status: 'idle' | 'running' | 'paused'
          course_id?: string | null
          course_name: string
          total_duration: number
          remaining_time: number
          start_timestamp: number
          paused_at?: number | null
          device_id?: string | null
          device_platform?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: 'focus' | 'break'
          status?: 'idle' | 'running' | 'paused'
          course_id?: string | null
          course_name?: string
          total_duration?: number
          remaining_time?: number
          start_timestamp?: number
          paused_at?: number | null
          device_id?: string | null
          device_platform?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timer_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timer_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      user_onboarding: {
        Row: {
          id: string
          user_id: string
          completed: boolean
          current_step: string | null
          steps_completed: string[]
          selected_courses: string[]
          selected_gymnasium_id: string | null
          selected_gymnasium_grade: string | null
          selected_program: string | null
          selected_purpose: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed?: boolean
          current_step?: string | null
          steps_completed?: string[]
          selected_courses?: string[]
          selected_gymnasium_id?: string | null
          selected_gymnasium_grade?: string | null
          selected_program?: string | null
          selected_purpose?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed?: boolean
          current_step?: string | null
          steps_completed?: string[]
          selected_courses?: string[]
          selected_gymnasium_id?: string | null
          selected_gymnasium_grade?: string | null
          selected_program?: string | null
          selected_purpose?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          course_id: string
          module_id: string | null
          lesson_id: string | null
          question: string
          answer: string
          difficulty: number
          explanation: string | null
          context: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          module_id?: string | null
          lesson_id?: string | null
          question: string
          answer: string
          difficulty?: number
          explanation?: string | null
          context?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          module_id?: string | null
          lesson_id?: string | null
          question?: string
          answer?: string
          difficulty?: number
          explanation?: string | null
          context?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      user_flashcard_progress: {
        Row: {
          id: string
          user_id: string
          flashcard_id: string
          ease_factor: number
          interval: number
          repetitions: number
          last_reviewed_at: string | null
          next_review_at: string
          quality: number | null
          total_reviews: number
          correct_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flashcard_id: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed_at?: string | null
          next_review_at: string
          quality?: number | null
          total_reviews?: number
          correct_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flashcard_id?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          quality?: number | null
          total_reviews?: number
          correct_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          }
        ]
      }
      user_module_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          course_id: string
          is_completed: boolean
          completed_at: string | null
          completed_lessons: number
          total_lessons: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          course_id: string
          is_completed?: boolean
          completed_at?: string | null
          completed_lessons?: number
          total_lessons?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          course_id?: string
          is_completed?: boolean
          completed_at?: string | null
          completed_lessons?: number
          total_lessons?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_module_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcard_decks: {
        Row: {
          id: string
          user_id: string
          course_id: string
          name: string
          description: string | null
          total_cards: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          name: string
          description?: string | null
          total_cards?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          name?: string
          description?: string | null
          total_cards?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_decks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      exams: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          description: string | null
          exam_date: string
          duration_minutes: number | null
          location: string | null
          exam_type: string
          status: string
          grade: string | null
          notes: string | null
          notification_enabled: boolean
          notification_time_before_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title: string
          description?: string | null
          exam_date: string
          duration_minutes?: number | null
          location?: string | null
          exam_type?: string
          status?: string
          grade?: string | null
          notes?: string | null
          notification_enabled?: boolean
          notification_time_before_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
          description?: string | null
          exam_date?: string
          duration_minutes?: number | null
          location?: string | null
          exam_type?: string
          status?: string
          grade?: string | null
          notes?: string | null
          notification_enabled?: boolean
          notification_time_before_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      universities: {
        Row: {
          id: string
          name: string
          city: string
          type: string
          category: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          city: string
          type: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          type?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      university_programs: {
        Row: {
          id: string
          university_id: string | null
          name: string
          abbreviation: string | null
          degree_type: string
          field: string
          credits: number
          duration_years: number
          created_at: string
        }
        Insert: {
          id: string
          university_id?: string | null
          name: string
          abbreviation?: string | null
          degree_type: string
          field: string
          credits: number
          duration_years: number
          created_at?: string
        }
        Update: {
          id?: string
          university_id?: string | null
          name?: string
          abbreviation?: string | null
          degree_type?: string
          field?: string
          credits?: number
          duration_years?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          }
        ]
      }
      university_courses: {
        Row: {
          id: string
          course_code: string
          title: string
          description: string | null
          credits: number
          level: string
          subject_area: string
          prerequisites: string | null
          learning_outcomes: string | null
          created_at: string
        }
        Insert: {
          id: string
          course_code: string
          title: string
          description?: string | null
          credits?: number
          level: string
          subject_area: string
          prerequisites?: string | null
          learning_outcomes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_code?: string
          title?: string
          description?: string | null
          credits?: number
          level?: string
          subject_area?: string
          prerequisites?: string | null
          learning_outcomes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      university_program_courses: {
        Row: {
          id: string
          program_id: string
          course_id: string
          semester: number
          is_mandatory: boolean
        }
        Insert: {
          id: string
          program_id: string
          course_id: string
          semester?: number
          is_mandatory?: boolean
        }
        Update: {
          id?: string
          program_id?: string
          course_id?: string
          semester?: number
          is_mandatory?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "university_program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "university_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_program_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "university_courses"
            referencedColumns: ["id"]
          }
        ]
      }
      user_university_courses: {
        Row: {
          id: string
          user_id: string
          program_id: string | null
          course_id: string
          progress: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          program_id?: string | null
          course_id: string
          progress?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string | null
          course_id?: string
          progress?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_university_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_university_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "university_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_university_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "university_programs"
            referencedColumns: ["id"]
          }
        ]
      }
      // ── HP Schema V2 ──────────────────────────────────────────
      hp_exam_sets: {
        Row: {
          id: string
          year: number
          season: 'vår' | 'höst'
          title: string
          source: 'official' | 'generated'
          is_published: boolean
          duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          season: 'vår' | 'höst'
          title: string
          source?: 'official' | 'generated'
          is_published?: boolean
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          season?: 'vår' | 'höst'
          title?: string
          source?: 'official' | 'generated'
          is_published?: boolean
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      hp_sections: {
        Row: {
          id: string
          exam_set_id: string
          type: 'ORD' | 'LÄS' | 'MEK' | 'ELF' | 'XYZ' | 'KVA' | 'NOG' | 'DTK'
          part: 'verbal' | 'kvantitativ'
          order_index: number
          time_limit_minutes: number | null
          question_count: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_set_id: string
          type: 'ORD' | 'LÄS' | 'MEK' | 'ELF' | 'XYZ' | 'KVA' | 'NOG' | 'DTK'
          part: 'verbal' | 'kvantitativ'
          order_index: number
          time_limit_minutes?: number | null
          question_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_set_id?: string
          type?: 'ORD' | 'LÄS' | 'MEK' | 'ELF' | 'XYZ' | 'KVA' | 'NOG' | 'DTK'
          part?: 'verbal' | 'kvantitativ'
          order_index?: number
          time_limit_minutes?: number | null
          question_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_sections_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "hp_exam_sets"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_questions: {
        Row: {
          id: string
          section_id: string
          question_number: number
          question_text: string
          question_type: 'multiple_choice' | 'reading_comprehension' | 'comparison' | 'diagram' | 'nog'
          reading_passage: string | null
          image_url: string | null
          needs_image: boolean
          difficulty: 'easy' | 'medium' | 'hard' | null
          topic: string | null
          correct_answer: string
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          question_number: number
          question_text: string
          question_type?: 'multiple_choice' | 'reading_comprehension' | 'comparison' | 'diagram' | 'nog'
          reading_passage?: string | null
          image_url?: string | null
          needs_image?: boolean
          difficulty?: 'easy' | 'medium' | 'hard' | null
          topic?: string | null
          correct_answer: string
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          question_number?: number
          question_text?: string
          question_type?: 'multiple_choice' | 'reading_comprehension' | 'comparison' | 'diagram' | 'nog'
          reading_passage?: string | null
          image_url?: string | null
          needs_image?: boolean
          difficulty?: 'easy' | 'medium' | 'hard' | null
          topic?: string | null
          correct_answer?: string
          explanation?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "hp_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_answer_options: {
        Row: {
          id: string
          question_id: string
          letter: 'A' | 'B' | 'C' | 'D' | 'E'
          text: string
          is_correct: boolean
        }
        Insert: {
          id?: string
          question_id: string
          letter: 'A' | 'B' | 'C' | 'D' | 'E'
          text: string
          is_correct?: boolean
        }
        Update: {
          id?: string
          question_id?: string
          letter?: 'A' | 'B' | 'C' | 'D' | 'E'
          text?: string
          is_correct?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hp_answer_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "hp_questions"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_words: {
        Row: {
          id: string
          word: string
          definition: string
          synonyms: string[]
          antonyms: string[]
          example: string | null
          etymology: string | null
          memory_tip: string | null
          category: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          frequency: number
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          definition: string
          synonyms?: string[]
          antonyms?: string[]
          example?: string | null
          etymology?: string | null
          memory_tip?: string | null
          category?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          frequency?: number
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          definition?: string
          synonyms?: string[]
          antonyms?: string[]
          example?: string | null
          etymology?: string | null
          memory_tip?: string | null
          category?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          frequency?: number
          created_at?: string
        }
        Relationships: []
      }
      hp_word_exam_refs: {
        Row: {
          word_id: string
          exam_set_id: string
        }
        Insert: {
          word_id: string
          exam_set_id: string
        }
        Update: {
          word_id?: string
          exam_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_word_exam_refs_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "hp_words"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_word_exam_refs_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "hp_exam_sets"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_norming_tables: {
        Row: {
          id: string
          exam_set_id: string | null
          raw_score: number
          normed_score: number
          part: 'verbal' | 'kvantitativ' | 'total' | null
        }
        Insert: {
          id?: string
          exam_set_id?: string | null
          raw_score: number
          normed_score: number
          part?: 'verbal' | 'kvantitativ' | 'total' | null
        }
        Update: {
          id?: string
          exam_set_id?: string | null
          raw_score?: number
          normed_score?: number
          part?: 'verbal' | 'kvantitativ' | 'total' | null
        }
        Relationships: [
          {
            foreignKeyName: "hp_norming_tables_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "hp_exam_sets"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_user_exam_attempts: {
        Row: {
          id: string
          user_id: string
          exam_set_id: string | null
          section_id: string | null
          attempt_type: 'full_test' | 'section_practice'
          status: 'in_progress' | 'completed' | 'abandoned'
          total_questions: number
          correct_answers: number
          raw_score: number | null
          normed_score: number | null
          time_spent_seconds: number
          section_scores: Json
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_set_id?: string | null
          section_id?: string | null
          attempt_type: 'full_test' | 'section_practice'
          status?: 'in_progress' | 'completed' | 'abandoned'
          total_questions?: number
          correct_answers?: number
          raw_score?: number | null
          normed_score?: number | null
          time_spent_seconds?: number
          section_scores?: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exam_set_id?: string | null
          section_id?: string | null
          attempt_type?: 'full_test' | 'section_practice'
          status?: 'in_progress' | 'completed' | 'abandoned'
          total_questions?: number
          correct_answers?: number
          raw_score?: number | null
          normed_score?: number | null
          time_spent_seconds?: number
          section_scores?: Json
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_user_exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_exam_attempts_exam_set_id_fkey"
            columns: ["exam_set_id"]
            isOneToOne: false
            referencedRelation: "hp_exam_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_exam_attempts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "hp_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_user_attempt_answers: {
        Row: {
          id: string
          attempt_id: string
          user_id: string
          question_id: string
          selected_letter: 'A' | 'B' | 'C' | 'D' | 'E' | null
          is_correct: boolean
          time_seconds: number | null
          answered_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          user_id: string
          question_id: string
          selected_letter?: 'A' | 'B' | 'C' | 'D' | 'E' | null
          is_correct?: boolean
          time_seconds?: number | null
          answered_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          user_id?: string
          question_id?: string
          selected_letter?: 'A' | 'B' | 'C' | 'D' | 'E' | null
          is_correct?: boolean
          time_seconds?: number | null
          answered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_user_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "hp_user_exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_attempt_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "hp_questions"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_user_question_progress: {
        Row: {
          user_id: string
          question_id: string
          correct_count: number
          incorrect_count: number
          total_attempts: number
          last_correct: boolean | null
          avg_time_seconds: number | null
          last_seen_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          question_id: string
          correct_count?: number
          incorrect_count?: number
          total_attempts?: number
          last_correct?: boolean | null
          avg_time_seconds?: number | null
          last_seen_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          question_id?: string
          correct_count?: number
          incorrect_count?: number
          total_attempts?: number
          last_correct?: boolean | null
          avg_time_seconds?: number | null
          last_seen_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_user_question_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "hp_questions"
            referencedColumns: ["id"]
          }
        ]
      }
      hp_user_word_progress: {
        Row: {
          user_id: string
          word_id: string
          mastery: number
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_at: string
          streak: number
          last_reviewed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          word_id: string
          mastery?: number
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          streak?: number
          last_reviewed_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          word_id?: string
          mastery?: number
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          streak?: number
          last_reviewed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_user_word_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hp_user_word_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "hp_words"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_available: {
        Args: {
          username_to_check: string
        }
        Returns: boolean
      }
      search_users_by_username: {
        Args: {
          search_term: string
        }
        Returns: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
        }[]
      }
      hp_create_exam_with_sections: {
        Args: {
          p_year: number
          p_season: string
          p_title: string
        }
        Returns: string
      }
      hp_record_answer: {
        Args: {
          p_attempt_id: string
          p_question_id: string
          p_selected_letter: string | null
          p_time_seconds: number | null
        }
        Returns: boolean
      }
      hp_finalize_attempt: {
        Args: {
          p_attempt_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}