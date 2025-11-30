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
      assets: {
        Row: {
          country: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          holder: string | null
          id: string
          purchase_date: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string | null
          user_id: string
          valuation: number
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description: string
          holder?: string | null
          id?: string
          purchase_date?: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id: string
          valuation: number
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          holder?: string | null
          id?: string
          purchase_date?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id?: string
          valuation?: number
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          balance: number
          color_variant: string | null
          country: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          is_primary: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          color_variant?: string | null
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_primary?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          color_variant?: string | null
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_primary?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          bank_name: string
          color_variant: string | null
          created_at: string | null
          expiry: string
          holder_name: string
          id: string
          last_four: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_name: string
          color_variant?: string | null
          created_at?: string | null
          expiry: string
          holder_name: string
          id?: string
          last_four: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_name?: string
          color_variant?: string | null
          created_at?: string | null
          expiry?: string
          holder_name?: string
          id?: string
          last_four?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          created_at: string | null
          height: number
          id: string
          is_visible: boolean
          position_x: number
          position_y: number
          updated_at: string | null
          user_id: string
          widget_type: string
          width: number
        }
        Insert: {
          created_at?: string | null
          height?: number
          id?: string
          is_visible?: boolean
          position_x?: number
          position_y?: number
          updated_at?: string | null
          user_id: string
          widget_type: string
          width?: number
        }
        Update: {
          created_at?: string | null
          height?: number
          id?: string
          is_visible?: boolean
          position_x?: number
          position_y?: number
          updated_at?: string | null
          user_id?: string
          widget_type?: string
          width?: number
        }
        Relationships: []
      }
      goal_assets: {
        Row: {
          allocation_percentage: number | null
          asset_id: string
          created_at: string
          goal_id: string
          id: string
          user_id: string
        }
        Insert: {
          allocation_percentage?: number | null
          asset_id: string
          created_at?: string
          goal_id: string
          id?: string
          user_id: string
        }
        Update: {
          allocation_percentage?: number | null
          asset_id?: string
          created_at?: string
          goal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_assets_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          asset_linked: boolean | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          current_amount: number | null
          id: string
          is_long_term: boolean | null
          linked_asset_id: string | null
          target_amount: number
          timeframe: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_linked?: boolean | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          current_amount?: number | null
          id?: string
          is_long_term?: boolean | null
          linked_asset_id?: string | null
          target_amount: number
          timeframe?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_linked?: boolean | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          current_amount?: number | null
          id?: string
          is_long_term?: boolean | null
          linked_asset_id?: string | null
          target_amount?: number
          timeframe?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      income_streams: {
        Row: {
          amount: number
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          frequency: string | null
          id: string
          is_primary: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          frequency?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          frequency?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      liabilities: {
        Row: {
          country: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          holder: string | null
          id: string
          interest_rate: number | null
          start_date: string | null
          type: Database["public"]["Enums"]["liability_type"]
          updated_at: string | null
          user_id: string
          valuation: number
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description: string
          holder?: string | null
          id?: string
          interest_rate?: number | null
          start_date?: string | null
          type: Database["public"]["Enums"]["liability_type"]
          updated_at?: string | null
          user_id: string
          valuation: number
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          holder?: string | null
          id?: string
          interest_rate?: number | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["liability_type"]
          updated_at?: string | null
          user_id?: string
          valuation?: number
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          due_date: string
          id: string
          notes: string | null
          paid_date: string | null
          recurring_payment_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          due_date: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          recurring_payment_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          due_date?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          recurring_payment_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_recurring_payment_id_fkey"
            columns: ["recurring_payment_id"]
            isOneToOne: false
            referencedRelation: "recurring_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferred_currency:
            | Database["public"]["Enums"]["currency_code"]
            | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferred_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_payments: {
        Row: {
          amount: number
          auto_pay_enabled: boolean | null
          category: Database["public"]["Enums"]["payment_category"]
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          is_active: boolean | null
          last_paid_date: string | null
          linked_asset_id: string | null
          linked_bank_account_id: string | null
          linked_card_id: string | null
          linked_liability_id: string | null
          name: string
          next_due_date: string
          notification_enabled: boolean | null
          notify_days_before: number | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_pay_enabled?: boolean | null
          category: Database["public"]["Enums"]["payment_category"]
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          is_active?: boolean | null
          last_paid_date?: string | null
          linked_asset_id?: string | null
          linked_bank_account_id?: string | null
          linked_card_id?: string | null
          linked_liability_id?: string | null
          name: string
          next_due_date: string
          notification_enabled?: boolean | null
          notify_days_before?: number | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay_enabled?: boolean | null
          category?: Database["public"]["Enums"]["payment_category"]
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          is_active?: boolean | null
          last_paid_date?: string | null
          linked_asset_id?: string | null
          linked_bank_account_id?: string | null
          linked_card_id?: string | null
          linked_liability_id?: string | null
          name?: string
          next_due_date?: string
          notification_enabled?: boolean | null
          notify_days_before?: number | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_linked_bank_account_id_fkey"
            columns: ["linked_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_linked_card_id_fkey"
            columns: ["linked_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_linked_liability_id_fkey"
            columns: ["linked_liability_id"]
            isOneToOne: false
            referencedRelation: "liabilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_due_date: {
        Args: {
          p_current_date: string
          p_day_of_month?: number
          p_day_of_week?: number
          p_frequency: Database["public"]["Enums"]["recurrence_frequency"]
        }
        Returns: string
      }
    }
    Enums: {
      asset_type:
        | "CASH"
        | "EQUITY"
        | "CRYPTO"
        | "GOLD"
        | "REAL_ESTATE"
        | "OTHER"
      currency_code: "USD" | "EUR" | "INR" | "GBP" | "JPY" | "AUD" | "CAD"
      liability_type: "LOAN" | "MORTGAGE" | "CREDIT_CARD" | "OTHER"
      payment_category:
        | "SIP"
        | "CREDIT_CARD_BILL"
        | "LOAN_INSTALLMENT"
        | "SUBSCRIPTION"
        | "INSURANCE"
        | "UTILITY"
        | "RENT"
        | "OTHER"
      payment_status: "UPCOMING" | "OVERDUE" | "PAID" | "SKIPPED"
      recurrence_frequency:
        | "DAILY"
        | "WEEKLY"
        | "BIWEEKLY"
        | "MONTHLY"
        | "QUARTERLY"
        | "HALF_YEARLY"
        | "YEARLY"
      transaction_type: "INCOME" | "EXPENSE"
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
      asset_type: ["CASH", "EQUITY", "CRYPTO", "GOLD", "REAL_ESTATE", "OTHER"],
      currency_code: ["USD", "EUR", "INR", "GBP", "JPY", "AUD", "CAD"],
      liability_type: ["LOAN", "MORTGAGE", "CREDIT_CARD", "OTHER"],
      payment_category: [
        "SIP",
        "CREDIT_CARD_BILL",
        "LOAN_INSTALLMENT",
        "SUBSCRIPTION",
        "INSURANCE",
        "UTILITY",
        "RENT",
        "OTHER",
      ],
      payment_status: ["UPCOMING", "OVERDUE", "PAID", "SKIPPED"],
      recurrence_frequency: [
        "DAILY",
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "QUARTERLY",
        "HALF_YEARLY",
        "YEARLY",
      ],
      transaction_type: ["INCOME", "EXPENSE"],
    },
  },
} as const
