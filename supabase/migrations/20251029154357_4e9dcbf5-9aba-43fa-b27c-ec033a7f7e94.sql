-- Create enum types for better data consistency
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD');
CREATE TYPE asset_type AS ENUM ('CASH', 'EQUITY', 'CRYPTO', 'GOLD', 'REAL_ESTATE', 'OTHER');
CREATE TYPE liability_type AS ENUM ('LOAN', 'MORTGAGE', 'CREDIT_CARD', 'OTHER');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Create profiles table with user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_currency currency_code DEFAULT 'USD',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valuation DECIMAL(15, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  type asset_type NOT NULL,
  description TEXT NOT NULL,
  country TEXT,
  holder TEXT,
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

-- Create liabilities table
CREATE TABLE public.liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valuation DECIMAL(15, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  type liability_type NOT NULL,
  description TEXT NOT NULL,
  country TEXT,
  holder TEXT,
  start_date DATE,
  interest_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liabilities"
  ON public.liabilities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own liabilities"
  ON public.liabilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities"
  ON public.liabilities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities"
  ON public.liabilities FOR DELETE
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  currency currency_code NOT NULL DEFAULT 'USD',
  timeframe TEXT,
  is_long_term BOOLEAN DEFAULT false,
  asset_linked BOOLEAN DEFAULT false,
  linked_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency currency_code NOT NULL DEFAULT 'USD',
  color_variant TEXT DEFAULT 'purple',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank accounts"
  ON public.bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts"
  ON public.bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
  ON public.bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
  ON public.bank_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  last_four TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  expiry TEXT NOT NULL,
  color_variant TEXT DEFAULT 'purple',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards"
  ON public.cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
  ON public.cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON public.cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON public.cards FOR DELETE
  USING (auth.uid() = user_id);

-- Create income_streams table
CREATE TABLE public.income_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  frequency TEXT DEFAULT 'monthly',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.income_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income streams"
  ON public.income_streams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income streams"
  ON public.income_streams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income streams"
  ON public.income_streams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income streams"
  ON public.income_streams FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_income_streams_updated_at BEFORE UPDATE ON public.income_streams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();