-- Create payment category enum
CREATE TYPE payment_category AS ENUM (
  'SIP',
  'CREDIT_CARD_BILL',
  'LOAN_INSTALLMENT',
  'SUBSCRIPTION',
  'INSURANCE',
  'UTILITY',
  'RENT',
  'OTHER'
);

-- Create recurrence frequency enum
CREATE TYPE recurrence_frequency AS ENUM (
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'YEARLY'
);

-- Create payment status enum
CREATE TYPE payment_status AS ENUM (
  'UPCOMING',
  'OVERDUE',
  'PAID',
  'SKIPPED'
);

-- Create recurring_payments table
CREATE TABLE public.recurring_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'USD',
  category payment_category NOT NULL,
  
  frequency recurrence_frequency NOT NULL DEFAULT 'MONTHLY',
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE NOT NULL,
  last_paid_date DATE,
  
  linked_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  linked_liability_id UUID REFERENCES public.liabilities(id) ON DELETE SET NULL,
  linked_card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  linked_bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  
  auto_pay_enabled BOOLEAN DEFAULT false,
  notify_days_before INTEGER DEFAULT 3,
  notification_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring payments"
  ON public.recurring_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring payments"
  ON public.recurring_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring payments"
  ON public.recurring_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring payments"
  ON public.recurring_payments FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_recurring_payments_updated_at 
  BEFORE UPDATE ON public.recurring_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurring_payment_id UUID NOT NULL REFERENCES public.recurring_payments(id) ON DELETE CASCADE,
  
  due_date DATE NOT NULL,
  paid_date DATE,
  amount NUMERIC(15, 2) NOT NULL,
  currency currency_code NOT NULL,
  status payment_status NOT NULL DEFAULT 'UPCOMING',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment history"
  ON public.payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment history"
  ON public.payment_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment history"
  ON public.payment_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_payment_history_updated_at 
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_recurring_payments_user_id ON public.recurring_payments(user_id);
CREATE INDEX idx_recurring_payments_next_due_date ON public.recurring_payments(next_due_date);
CREATE INDEX idx_recurring_payments_is_active ON public.recurring_payments(is_active);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_recurring_payment_id ON public.payment_history(recurring_payment_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
CREATE INDEX idx_payment_history_due_date ON public.payment_history(due_date);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_history;

-- Function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_current_date DATE,
  p_frequency recurrence_frequency,
  p_day_of_month INTEGER DEFAULT NULL,
  p_day_of_week INTEGER DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_date DATE;
BEGIN
  CASE p_frequency
    WHEN 'DAILY' THEN
      v_next_date := p_current_date + INTERVAL '1 day';
    
    WHEN 'WEEKLY' THEN
      v_next_date := p_current_date + (
        (7 + COALESCE(p_day_of_week, 1) - EXTRACT(DOW FROM p_current_date)::INTEGER) % 7
      ) * INTERVAL '1 day';
      IF v_next_date = p_current_date THEN
        v_next_date := v_next_date + INTERVAL '7 days';
      END IF;
    
    WHEN 'BIWEEKLY' THEN
      v_next_date := p_current_date + INTERVAL '14 days';
    
    WHEN 'MONTHLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '1 month';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
      
      IF EXTRACT(MONTH FROM v_next_date) != EXTRACT(MONTH FROM (DATE_TRUNC('month', p_current_date) + INTERVAL '1 month')) THEN
        v_next_date := DATE_TRUNC('month', DATE_TRUNC('month', p_current_date) + INTERVAL '1 month') + INTERVAL '1 month' - INTERVAL '1 day';
      END IF;
    
    WHEN 'QUARTERLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '3 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    WHEN 'HALF_YEARLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '6 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    WHEN 'YEARLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '12 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    ELSE
      v_next_date := p_current_date + INTERVAL '1 month';
  END CASE;
  
  RETURN v_next_date;
END;
$$;