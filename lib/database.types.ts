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
          email: string | null
          avatar_url: string | null
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
          email?: string | null
          avatar_url?: string | null
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
          email?: string | null
          avatar_url?: string | null
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
          title: string
          description: string
          subject: string
          level: string
          resources: Json
          tips: Json
          progress: number
          related_courses: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          subject: string
          level: string
          resources?: Json
          tips?: Json
          progress?: number
          related_courses?: Json
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          subject?: string
          level?: string
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
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress?: number
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
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: string
          created_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}