export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: string
          progress: number | null
          related_courses: Json | null
          resources: Json | null
          subject: string
          tips: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          level: string
          progress?: number | null
          related_courses?: Json | null
          resources?: Json | null
          subject: string
          tips?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          progress?: number | null
          related_courses?: Json | null
          resources?: Json | null
          subject?: string
          tips?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          status: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          friends: Json | null
          gymnasium: string | null
          id: string
          level: string | null
          name: string | null
          premium_status: boolean | null
          program: string | null
          selected_courses: Json | null
          updated_at: string
          username: string | null
          year: number | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          friends?: Json | null
          gymnasium?: string | null
          id: string
          level?: string | null
          name?: string | null
          premium_status?: boolean | null
          program?: string | null
          selected_courses?: Json | null
          updated_at?: string
          username?: string | null
          year?: number | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          friends?: Json | null
          gymnasium?: string | null
          id?: string
          level?: string | null
          name?: string | null
          premium_status?: boolean | null
          program?: string | null
          selected_courses?: Json | null
          updated_at?: string
          username?: string | null
          year?: number | null
        }
        Relationships: []
      }
      remember_me_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remember_me_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          technique: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string
          duration_minutes: number
          id: string
          notes?: string | null
          technique?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          technique?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      study_techniques: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          title?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_active: boolean | null
          progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id: string
          is_active?: boolean | null
          progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          achievements_unlocked: number | null
          courses_completed: number | null
          current_streak: number | null
          last_study_date: string | null
          level: number | null
          longest_streak: number | null
          total_sessions: number | null
          total_study_time: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          achievements_unlocked?: number | null
          courses_completed?: number | null
          current_streak?: number | null
          last_study_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_sessions?: number | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          achievements_unlocked?: number | null
          courses_completed?: number | null
          current_streak?: number | null
          last_study_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_sessions?: number | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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