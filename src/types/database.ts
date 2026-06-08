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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allies: {
        Row: {
          additional_certifications: string | null
          admin_notes: string | null
          age_groups: string[] | null
          approach_style: string | null
          availability: Json | null
          bio: string | null
          buffer_minutes: number | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          doc_agreement_status: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          gender_preferences: string[] | null
          highest_qualification: string | null
          id: string
          intro_price: number | null
          is_active: boolean | null
          languages_spoken: string | null
          languages_therapy: string | null
          license_number: string | null
          location: string | null
          manual_priority_score: number | null
          match_weights: Json | null
          max_clients_per_week: number | null
          modalities: string[] | null
          onboarding_status: string | null
          onboarding_step: number | null
          phone: string | null
          photo_storage_path: string | null
          photo_url: string | null
          primary_role: string | null
          pronouns: string | null
          quote: string | null
          session_durations: string[] | null
          session_formats: string[] | null
          session_price: number | null
          session_tones: string[] | null
          sort_priority: string | null
          user_vibes: string[] | null
          specialties: string[] | null
          tagline: string | null
          updated_at: string | null
          user_id: string | null
          visibility_bookings: boolean | null
          visibility_featured: boolean | null
          visibility_matching: boolean | null
          visibility_search: boolean | null
          whatsapp: string | null
          years_experience: number | null
          zoho_service_ids: Json | null
          zoho_staff_id: string | null
        }
        Insert: {
          additional_certifications?: string | null
          admin_notes?: string | null
          age_groups?: string[] | null
          approach_style?: string | null
          availability?: Json | null
          bio?: string | null
          buffer_minutes?: number | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          doc_agreement_status?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender_preferences?: string[] | null
          highest_qualification?: string | null
          id?: string
          intro_price?: number | null
          is_active?: boolean | null
          languages_spoken?: string | null
          languages_therapy?: string | null
          license_number?: string | null
          location?: string | null
          manual_priority_score?: number | null
          match_weights?: Json | null
          max_clients_per_week?: number | null
          modalities?: string[] | null
          onboarding_status?: string | null
          onboarding_step?: number | null
          phone?: string | null
          photo_storage_path?: string | null
          photo_url?: string | null
          primary_role?: string | null
          pronouns?: string | null
          quote?: string | null
          session_durations?: string[] | null
          session_formats?: string[] | null
          session_price?: number | null
          session_tones?: string[] | null
          sort_priority?: string | null
          specialties?: string[] | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_vibes?: string[] | null
          visibility_bookings?: boolean | null
          visibility_featured?: boolean | null
          visibility_matching?: boolean | null
          visibility_search?: boolean | null
          whatsapp?: string | null
          years_experience?: number | null
          zoho_service_ids?: Json | null
          zoho_staff_id?: string | null
        }
        Update: {
          additional_certifications?: string | null
          admin_notes?: string | null
          age_groups?: string[] | null
          approach_style?: string | null
          availability?: Json | null
          bio?: string | null
          buffer_minutes?: number | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          doc_agreement_status?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender_preferences?: string[] | null
          highest_qualification?: string | null
          id?: string
          intro_price?: number | null
          is_active?: boolean | null
          languages_spoken?: string | null
          languages_therapy?: string | null
          license_number?: string | null
          location?: string | null
          manual_priority_score?: number | null
          match_weights?: Json | null
          max_clients_per_week?: number | null
          modalities?: string[] | null
          onboarding_status?: string | null
          onboarding_step?: number | null
          phone?: string | null
          photo_storage_path?: string | null
          photo_url?: string | null
          primary_role?: string | null
          pronouns?: string | null
          quote?: string | null
          session_durations?: string[] | null
          session_formats?: string[] | null
          session_price?: number | null
          session_tones?: string[] | null
          sort_priority?: string | null
          specialties?: string[] | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_vibes?: string[] | null
          visibility_bookings?: boolean | null
          visibility_featured?: boolean | null
          visibility_matching?: boolean | null
          visibility_search?: boolean | null
          whatsapp?: string | null
          years_experience?: number | null
          zoho_service_ids?: Json | null
          zoho_staff_id?: string | null
        }
        Relationships: []
      }
      ally_documents: {
        Row: {
          ally_id: string
          created_at: string | null
          doc_type: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_required: boolean | null
          mime_type: string | null
          status: string | null
          storage_path: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ally_id: string
          created_at?: string | null
          doc_type: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_required?: boolean | null
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ally_id?: string
          created_at?: string | null
          doc_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_required?: boolean | null
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ally_documents_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "allies"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          answers: Json
          branch: string | null
          created_at: string
          crisis_flag: boolean
          id: string
          result: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          branch?: string | null
          created_at?: string
          crisis_flag?: boolean
          id?: string
          result?: Json | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          branch?: string | null
          created_at?: string
          crisis_flag?: boolean
          id?: string
          result?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_label: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      nila_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          last_mode: string
          message_count: number
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          last_mode?: string
          message_count?: number
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          last_mode?: string
          message_count?: number
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nila_messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          is_mode_opening: boolean
          mode: string
          role: string
          sent_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          is_mode_opening?: boolean
          mode?: string
          role: string
          sent_at?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          is_mode_opening?: boolean
          mode?: string
          role?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nila_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "nila_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: number
          display_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          last_active_at: string | null
          nila_message_count: number
          nila_onboarded: boolean
          onboarding_completed: boolean
          phone: string | null
          phone_country_code: string | null
          plan: string | null
          preferred_language: string | null
          primary_concern: string | null
          profile_completed: boolean
          safety_flag: boolean
          safety_flag_reason: string | null
          subscription_status: string | null
          terms_accepted_at: string | null
          updated_at: string
          whatsapp_opt_in: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          nila_message_count?: number
          nila_onboarded?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          phone_country_code?: string | null
          plan?: string | null
          preferred_language?: string | null
          primary_concern?: string | null
          profile_completed?: boolean
          safety_flag?: boolean
          safety_flag_reason?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          whatsapp_opt_in?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          nila_message_count?: number
          nila_onboarded?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          phone_country_code?: string | null
          plan?: string | null
          preferred_language?: string | null
          primary_concern?: string | null
          profile_completed?: boolean
          safety_flag?: boolean
          safety_flag_reason?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          whatsapp_opt_in?: boolean | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          ally_id: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string | null
          user_id: string | null
          zoho_appointment_id: string | null
          zoho_booking_id: string | null
        }
        Insert: {
          ally_id?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          zoho_appointment_id?: string | null
          zoho_booking_id?: string | null
        }
        Update: {
          ally_id?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          zoho_appointment_id?: string | null
          zoho_booking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "allies"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_credentials: {
        Row: {
          access_token: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
          workspace_id: string | null
          workspace_name: string | null
          zoho_org_id: string | null
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
          zoho_org_id?: string | null
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
          zoho_org_id?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
