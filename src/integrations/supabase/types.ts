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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessment_exports: {
        Row: {
          assessor_id: string
          completed_at: string | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          export_type: string
          file_url: string | null
          grade_range: string[] | null
          id: string
          jurisdiction: string | null
          property_types: string[] | null
          status: string | null
          total_records: number | null
        }
        Insert: {
          assessor_id: string
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_type: string
          file_url?: string | null
          grade_range?: string[] | null
          id?: string
          jurisdiction?: string | null
          property_types?: string[] | null
          status?: string | null
          total_records?: number | null
        }
        Update: {
          assessor_id?: string
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_type?: string
          file_url?: string | null
          grade_range?: string[] | null
          id?: string
          jurisdiction?: string | null
          property_types?: string[] | null
          status?: string | null
          total_records?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string
          created_at: string | null
          defect_description: string | null
          id: string
          inspection_id: string
          item_name: string
          item_type: string
          notes: string | null
          rating: string | null
          selected_values: Json | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          defect_description?: string | null
          id?: string
          inspection_id: string
          item_name: string
          item_type: string
          notes?: string | null
          rating?: string | null
          selected_values?: Json | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          defect_description?: string | null
          id?: string
          inspection_id?: string
          item_name?: string
          item_type?: string
          notes?: string | null
          rating?: string | null
          selected_values?: Json | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          inspector_id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          inspector_id: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          inspector_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      inspection_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assigned_to: string
          completed_at: string | null
          id: string
          inspection_id: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assigned_to: string
          completed_at?: string | null
          id?: string
          inspection_id: string
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assigned_to?: string
          completed_at?: string | null
          id?: string
          inspection_id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_assignments_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          caption: string | null
          category: string | null
          checklist_item_id: string | null
          created_at: string | null
          id: string
          inspection_id: string
          photo_url: string
          tag: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          checklist_item_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id: string
          photo_url: string
          tag?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          checklist_item_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string
          photo_url?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_shares: {
        Row: {
          access_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          inspection_id: string
          is_active: boolean | null
          last_accessed_at: string | null
          notes: string | null
          recipient_email: string
          recipient_name: string | null
          share_token: string
          shared_by: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          inspection_id: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          notes?: string | null
          recipient_email: string
          recipient_name?: string | null
          share_token?: string
          shared_by: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          inspection_id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          notes?: string | null
          recipient_email?: string
          recipient_name?: string | null
          share_token?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_shares_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          building_type: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          building_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
          updated_at?: string | null
        }
        Update: {
          building_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          attendance: string[] | null
          building_types: string[] | null
          category_scores: Json | null
          checklist_data: Json | null
          checklist_notes: Json | null
          checklist_ratings: Json | null
          created_at: string | null
          defect_severities: Json | null
          excellent_count: number | null
          final_grade_letter: string | null
          final_grade_numeric: number | null
          good_count: number | null
          grade_calculated_at: string | null
          green_features: Json | null
          id: string
          inspection_date: string
          inspection_time: string | null
          inspector_id: string
          not_inspected_count: number | null
          notes: string | null
          occupancy: string | null
          partial_inspected_count: number | null
          photos: string[] | null
          poor_count: number | null
          property_id: string
          replace_count: number | null
          selected_defects: Json | null
          status: string | null
          temperature: number | null
          total_items_rated: number | null
          total_points_earned: number | null
          total_points_possible: number | null
          updated_at: string | null
          very_good_count: number | null
          weather_conditions: string[] | null
        }
        Insert: {
          attendance?: string[] | null
          building_types?: string[] | null
          category_scores?: Json | null
          checklist_data?: Json | null
          checklist_notes?: Json | null
          checklist_ratings?: Json | null
          created_at?: string | null
          defect_severities?: Json | null
          excellent_count?: number | null
          final_grade_letter?: string | null
          final_grade_numeric?: number | null
          good_count?: number | null
          grade_calculated_at?: string | null
          green_features?: Json | null
          id?: string
          inspection_date: string
          inspection_time?: string | null
          inspector_id: string
          not_inspected_count?: number | null
          notes?: string | null
          occupancy?: string | null
          partial_inspected_count?: number | null
          photos?: string[] | null
          poor_count?: number | null
          property_id: string
          replace_count?: number | null
          selected_defects?: Json | null
          status?: string | null
          temperature?: number | null
          total_items_rated?: number | null
          total_points_earned?: number | null
          total_points_possible?: number | null
          updated_at?: string | null
          very_good_count?: number | null
          weather_conditions?: string[] | null
        }
        Update: {
          attendance?: string[] | null
          building_types?: string[] | null
          category_scores?: Json | null
          checklist_data?: Json | null
          checklist_notes?: Json | null
          checklist_ratings?: Json | null
          created_at?: string | null
          defect_severities?: Json | null
          excellent_count?: number | null
          final_grade_letter?: string | null
          final_grade_numeric?: number | null
          good_count?: number | null
          grade_calculated_at?: string | null
          green_features?: Json | null
          id?: string
          inspection_date?: string
          inspection_time?: string | null
          inspector_id?: string
          not_inspected_count?: number | null
          notes?: string | null
          occupancy?: string | null
          partial_inspected_count?: number | null
          photos?: string[] | null
          poor_count?: number | null
          property_id?: string
          replace_count?: number | null
          selected_defects?: Json | null
          status?: string | null
          temperature?: number | null
          total_items_rated?: number | null
          total_points_earned?: number | null
          total_points_possible?: number | null
          updated_at?: string | null
          very_good_count?: number | null
          weather_conditions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string
          due_date: string
          id: string
          inspection_id: string | null
          inspector_id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          due_date: string
          id?: string
          inspection_id?: string | null
          inspector_id: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          due_date?: string
          id?: string
          inspection_id?: string | null
          inspector_id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          inspection_reminders: boolean | null
          reminder_days_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          inspection_reminders?: boolean | null
          reminder_days_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          inspection_reminders?: boolean | null
          reminder_days_before?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          scheduled_for?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_email: string | null
          company_name: string | null
          created_at: string | null
          credentials_verified: boolean | null
          email: string
          full_name: string
          id: string
          license_number: string | null
          license_state: string | null
          phone: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          credentials_verified?: boolean | null
          email: string
          full_name: string
          id: string
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          credentials_verified?: boolean | null
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string
          created_at: string | null
          created_by: string
          id: string
          is_public: boolean | null
          lot_size: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          property_type: string
          square_footage: number | null
          state: string
          updated_at: string | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          created_by: string
          id?: string
          is_public?: boolean | null
          lot_size?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          property_type: string
          square_footage?: number | null
          state: string
          updated_at?: string | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_public?: boolean | null
          lot_size?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          property_type?: string
          square_footage?: number | null
          state?: string
          updated_at?: string | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: []
      }
      risk_analyses: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decision: string | null
          decision_notes: string | null
          defects_risk_factor: number | null
          flagged_categories: string[] | null
          grade_risk_factor: number | null
          id: string
          inspection_id: string
          requires_additional_inspection: boolean | null
          risk_level: string | null
          risk_score: number | null
          underwriter_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decision?: string | null
          decision_notes?: string | null
          defects_risk_factor?: number | null
          flagged_categories?: string[] | null
          grade_risk_factor?: number | null
          id?: string
          inspection_id: string
          requires_additional_inspection?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          underwriter_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decision?: string | null
          decision_notes?: string | null
          defects_risk_factor?: number | null
          flagged_categories?: string[] | null
          grade_risk_factor?: number | null
          id?: string
          inspection_id?: string
          requires_additional_inspection?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          underwriter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_analyses_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valuations: {
        Row: {
          appraiser_id: string
          comparable_properties: Json | null
          created_at: string | null
          estimated_value: number
          grade_adjustment_factor: number | null
          id: string
          inspection_id: string
          market_value: number | null
          notes: string | null
          property_id: string
          status: string | null
          updated_at: string | null
          valuation_report_url: string | null
        }
        Insert: {
          appraiser_id: string
          comparable_properties?: Json | null
          created_at?: string | null
          estimated_value: number
          grade_adjustment_factor?: number | null
          id?: string
          inspection_id: string
          market_value?: number | null
          notes?: string | null
          property_id: string
          status?: string | null
          updated_at?: string | null
          valuation_report_url?: string | null
        }
        Update: {
          appraiser_id?: string
          comparable_properties?: Json | null
          created_at?: string | null
          estimated_value?: number
          grade_adjustment_factor?: number | null
          id?: string
          inspection_id?: string
          market_value?: number | null
          notes?: string | null
          property_id?: string
          status?: string | null
          updated_at?: string | null
          valuation_report_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valuations_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_inspection_grade: {
        Args: { _inspection_id: string }
        Returns: {
          grade_letter: string
          grade_numeric: number
        }[]
      }
      calculate_inspection_grade_v2: {
        Args: { _inspection_id: string }
        Returns: {
          grade_letter: string
          grade_numeric: number
        }[]
      }
      get_inspector_stats: {
        Args: { _inspector_id: string }
        Returns: {
          average_grade: number
          completed_this_month: number
          grade_distribution: Json
          pending_submissions: number
          total_inspections: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inspector_has_property_access: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      migrate_checklist_data: { Args: never; Returns: undefined }
      user_owns_inspection_property: {
        Args: { _inspection_id: string; _user_id: string }
        Returns: boolean
      }
      user_owns_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "inspector"
        | "appraiser"
        | "real_estate_agent"
        | "assessor"
        | "underwriter"
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
      app_role: [
        "admin",
        "inspector",
        "appraiser",
        "real_estate_agent",
        "assessor",
        "underwriter",
      ],
    },
  },
} as const
