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
          achievement_key: string | null
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement: number
          requirement_target: number | null
          requirement_timeframe: string | null
          requirement_type: string | null
          reward_badge: string | null
          reward_points: number | null
          title: string | null
          type: string
        }
        Insert: {
          achievement_key?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id: string
          name: string
          requirement?: number
          requirement_target?: number | null
          requirement_timeframe?: string | null
          requirement_type?: string | null
          reward_badge?: string | null
          reward_points?: number | null
          title?: string | null
          type: string
        }
        Update: {
          achievement_key?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement?: number
          requirement_target?: number | null
          requirement_timeframe?: string | null
          requirement_type?: string | null
          reward_badge?: string | null
          reward_points?: number | null
          title?: string | null
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
          user1?: {
            id: string
            username: string
            display_name: string
            avatar_url: string | null
          }
          user2?: {
            id: string
            username: string
            display_name: string
            avatar_url: string | null
          }
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
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          estimated_hours: number | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          estimated_hours?: number | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          estimated_hours?: number | null
          is_published?: boolean | null
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
          },
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
          lesson_type: string | null
          order_index: number
          estimated_minutes: number | null
          difficulty_level: string | null
          prerequisites: string[] | null
          learning_objectives: string[] | null
          is_published: boolean | null
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
          lesson_type?: string | null
          order_index?: number
          estimated_minutes?: number | null
          difficulty_level?: string | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean | null
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
          lesson_type?: string | null
          order_index?: number
          estimated_minutes?: number | null
          difficulty_level?: string | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean | null
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
          },
        ]
      }
      lesson_materials: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          material_type: string
          url: string | null
          content: string | null
          file_size: number | null
          duration_minutes: number | null
          is_required: boolean | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          material_type: string
          url?: string | null
          content?: string | null
          file_size?: number | null
          duration_minutes?: number | null
          is_required?: boolean | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          material_type?: string
          url?: string | null
          content?: string | null
          file_size?: number | null
          duration_minutes?: number | null
          is_required?: boolean | null
          order_index?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
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
          exercise_type: string
          questions: Json | null
          correct_answers: Json | null
          points: number | null
          time_limit_minutes: number | null
          difficulty_level: string | null
          hints: string[] | null
          is_published: boolean | null
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
          exercise_type: string
          questions?: Json | null
          correct_answers?: Json | null
          points?: number | null
          time_limit_minutes?: number | null
          difficulty_level?: string | null
          hints?: string[] | null
          is_published?: boolean | null
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
          exercise_type?: string
          questions?: Json | null
          correct_answers?: Json | null
          points?: number | null
          time_limit_minutes?: number | null
          difficulty_level?: string | null
          hints?: string[] | null
          is_published?: boolean | null
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
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          status: string | null
          progress_percentage: number | null
          time_spent_minutes: number | null
          started_at: string | null
          completed_at: string | null
          last_accessed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          status?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          status?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string | null
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
          },
        ]
      }
      user_exercise_attempts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          course_id: string
          answers: Json
          score: number | null
          max_score: number
          percentage: number | null
          time_taken_minutes: number | null
          is_completed: boolean | null
          feedback: string | null
          attempt_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          course_id: string
          answers: Json
          score?: number | null
          max_score: number
          percentage?: number | null
          time_taken_minutes?: number | null
          is_completed?: boolean | null
          feedback?: string | null
          attempt_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          course_id?: string
          answers?: Json
          score?: number | null
          max_score?: number
          percentage?: number | null
          time_taken_minutes?: number | null
          is_completed?: boolean | null
          feedback?: string | null
          attempt_number?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "course_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_content_tags: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lesson_tags: {
        Row: {
          lesson_id: string
          tag_id: string
        }
        Insert: {
          lesson_id: string
          tag_id: string
        }
        Update: {
          lesson_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_tags_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "course_content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      study_guides: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: string
          guide_type: string | null
          difficulty_level: string | null
          estimated_read_time: number | null
          is_published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content: string
          guide_type?: string | null
          difficulty_level?: string | null
          estimated_read_time?: number | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string
          guide_type?: string | null
          difficulty_level?: string | null
          estimated_read_time?: number | null
          is_published?: boolean | null
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
          },
        ]
      }
      course_assessments: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          assessment_type: string
          total_points: number
          passing_score: number | null
          time_limit_minutes: number | null
          attempts_allowed: number | null
          is_published: boolean | null
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
          assessment_type: string
          total_points?: number
          passing_score?: number | null
          time_limit_minutes?: number | null
          attempts_allowed?: number | null
          is_published?: boolean | null
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
          assessment_type?: string
          total_points?: number
          passing_score?: number | null
          time_limit_minutes?: number | null
          attempts_allowed?: number | null
          is_published?: boolean | null
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
          },
        ]
      }
      user_assessment_results: {
        Row: {
          id: string
          user_id: string
          assessment_id: string
          course_id: string
          score: number
          max_score: number
          percentage: number
          passed: boolean | null
          time_taken_minutes: number | null
          attempt_number: number | null
          feedback: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id: string
          course_id: string
          score?: number
          max_score: number
          percentage?: number
          passed?: boolean | null
          time_taken_minutes?: number | null
          attempt_number?: number | null
          feedback?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string
          course_id?: string
          score?: number
          max_score?: number
          percentage?: number
          passed?: boolean | null
          time_taken_minutes?: number | null
          attempt_number?: number | null
          feedback?: string | null
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assessment_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "course_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_assessment_results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
          progress: number | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
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
          id?: string
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
      programs: {
        Row: {
          id: string
          name: string
          description: string | null
          gymnasium: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          gymnasium: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          gymnasium?: string
          created_at?: string
        }
        Relationships: []
      }
      program_courses: {
        Row: {
          id: string
          program_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          program_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          course_id?: string
          created_at?: string
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
          },
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
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
          },
        ]
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          questions: Json
          score: number | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title: string
          questions: Json
          score?: number | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
          questions?: Json
          score?: number | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          duration_minutes: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          duration_minutes: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          duration_minutes?: number
          completed?: boolean
          created_at?: string
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
          },
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
          },
        ]
      }
      settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean | null
          theme: string | null
          language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean | null
          theme?: string | null
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
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