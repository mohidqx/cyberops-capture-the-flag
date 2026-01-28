export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["challenge_category"]
          created_at: string | null
          description: string
          difficulty: Database["public"]["Enums"]["challenge_difficulty"]
          files: string[] | null
          flag: string
          hint_costs: number[] | null
          hints: string[] | null
          id: string
          is_active: boolean | null
          points: number
          solves: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["challenge_difficulty"]
          files?: string[] | null
          flag: string
          hint_costs?: number[] | null
          hints?: string[] | null
          id?: string
          is_active?: boolean | null
          points?: number
          solves?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["challenge_difficulty"]
          files?: string[] | null
          flag?: string
          hint_costs?: number[] | null
          hints?: string[] | null
          id?: string
          is_active?: boolean | null
          points?: number
          solves?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_settings: {
        Row: {
          created_at: string | null
          decay_enabled: boolean | null
          decay_minimum: number | null
          end_time: string | null
          freeze_time: string | null
          id: string
          is_active: boolean | null
          name: string
          start_time: string | null
          team_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decay_enabled?: boolean | null
          decay_minimum?: number | null
          end_time?: string | null
          freeze_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_time?: string | null
          team_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decay_enabled?: boolean | null
          decay_minimum?: number | null
          end_time?: string | null
          freeze_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_time?: string | null
          team_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_resolved: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_resolved?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      hint_unlocks: {
        Row: {
          challenge_id: string
          created_at: string | null
          hint_index: number
          id: string
          points_spent: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          hint_index: number
          id?: string
          points_spent?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          hint_index?: number
          id?: string
          points_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hint_unlocks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hint_unlocks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bio: string | null
          challenges_solved: number | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_banned: boolean
          notifications_enabled: boolean | null
          rank: number | null
          team_id: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          challenges_solved?: number | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_banned?: boolean
          notifications_enabled?: boolean | null
          rank?: number | null
          team_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          challenges_solved?: number | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_banned?: boolean
          notifications_enabled?: boolean | null
          rank?: number | null
          team_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          logo_url: string
          name: string
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      submission_rate_limits: {
        Row: {
          attempt_count: number
          challenge_id: string
          created_at: string | null
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          attempt_count?: number
          challenge_id: string
          created_at?: string | null
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          attempt_count?: number
          challenge_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_rate_limits_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_rate_limits_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          is_correct: boolean
          is_first_blood: boolean | null
          points_awarded: number | null
          submitted_flag: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          is_correct: boolean
          is_first_blood?: boolean | null
          points_awarded?: number | null
          submitted_flag: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean
          is_first_blood?: boolean | null
          points_awarded?: number | null
          submitted_flag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avatar_url: string | null
          captain_id: string | null
          created_at: string | null
          description: string | null
          id: string
          invite_code: string | null
          name: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      writeups: {
        Row: {
          author_id: string
          challenge_id: string
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          challenge_id: string
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          challenge_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "writeups_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writeups_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writeups_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      challenges_public: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["challenge_category"] | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["challenge_difficulty"] | null
          files: string[] | null
          hint_costs: number[] | null
          hints: string[] | null
          id: string | null
          is_active: boolean | null
          points: number | null
          solves: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["challenge_category"] | null
          created_at?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["challenge_difficulty"]
            | null
          files?: string[] | null
          hint_costs?: number[] | null
          hints?: string[] | null
          id?: string | null
          is_active?: boolean | null
          points?: number | null
          solves?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["challenge_category"] | null
          created_at?: string | null
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["challenge_difficulty"]
            | null
          files?: string[] | null
          hint_costs?: number[] | null
          hints?: string[] | null
          id?: string | null
          is_active?: boolean | null
          points?: number | null
          solves?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams_public: {
        Row: {
          avatar_url: string | null
          captain_id: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_ban_user: {
        Args: { _reason?: string; _username: string }
        Returns: Json
      }
      admin_reset_user_scores: { Args: { _username: string }; Returns: Json }
      admin_unban_user: { Args: { _username: string }; Returns: Json }
      get_my_team_invite_code: { Args: { _team_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _challenge_id?: string
          _details?: Json
          _event_type: string
          _target_user_id?: string
          _user_id?: string
        }
        Returns: undefined
      }
      submit_flag: {
        Args: { _challenge_id: string; _submitted_flag: string }
        Returns: Json
      }
      unlock_hint: {
        Args: {
          _challenge_id: string
          _cost: number
          _hint_index: number
          _user_id: string
        }
        Returns: Json
      }
      validate_challenge_flag: {
        Args: { _challenge_id: string; _submitted_flag: string }
        Returns: boolean
      }
      validate_team_invite_code: {
        Args: { _code: string }
        Returns: {
          team_id: string
          team_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      challenge_category:
        | "web"
        | "crypto"
        | "reverse"
        | "forensics"
        | "pwn"
        | "scripting"
        | "misc"
      challenge_difficulty: "easy" | "medium" | "hard" | "insane"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      challenge_category: [
        "web",
        "crypto",
        "reverse",
        "forensics",
        "pwn",
        "scripting",
        "misc",
      ],
      challenge_difficulty: ["easy", "medium", "hard", "insane"],
    },
  },
} as const
