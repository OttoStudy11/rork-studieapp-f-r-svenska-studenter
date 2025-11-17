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
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress?: number
          target_grade?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress?: number
          target_grade?: string | null
          is_active?: boolean
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}