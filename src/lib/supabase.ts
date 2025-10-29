import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Liability = Database['public']['Tables']['liabilities']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
export type Card = Database['public']['Tables']['cards']['Row'];
export type IncomeStream = Database['public']['Tables']['income_streams']['Row'];

export { supabase };
