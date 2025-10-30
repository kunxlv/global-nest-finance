import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Liability = Database['public']['Tables']['liabilities']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
export type Card = Database['public']['Tables']['cards']['Row'];
export type IncomeStream = Database['public']['Tables']['income_streams']['Row'];
export type RecurringPayment = Database['public']['Tables']['recurring_payments']['Row'];
export type PaymentHistory = Database['public']['Tables']['payment_history']['Row'];
export type DashboardWidget = Database['public']['Tables']['dashboard_widgets']['Row'];
export type PaymentCategory = Database['public']['Enums']['payment_category'];
export type RecurrenceFrequency = Database['public']['Enums']['recurrence_frequency'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

export { supabase };
