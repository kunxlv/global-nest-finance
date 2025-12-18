-- Create asset_valuations table for historical tracking
CREATE TABLE public.asset_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  valuation NUMERIC NOT NULL,
  currency currency_code NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_valuations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own asset valuations"
ON public.asset_valuations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own asset valuations"
ON public.asset_valuations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asset valuations"
ON public.asset_valuations
FOR DELETE
USING (auth.uid() = user_id);

-- Index for efficient time-series queries
CREATE INDEX idx_asset_valuations_asset_time ON public.asset_valuations(asset_id, recorded_at DESC);
CREATE INDEX idx_asset_valuations_user_time ON public.asset_valuations(user_id, recorded_at DESC);