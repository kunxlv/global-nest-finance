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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      transaction_type: ["INCOME", "EXPENSE"],
    },
  },
} as const
