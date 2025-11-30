-- Create goal_assets junction table for many-to-many relationship
CREATE TABLE public.goal_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  allocation_percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, asset_id)
);

-- Enable Row Level Security
ALTER TABLE public.goal_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_assets
CREATE POLICY "Users can view their own goal-asset links"
  ON public.goal_assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal-asset links"
  ON public.goal_assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal-asset links"
  ON public.goal_assets
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal-asset links"
  ON public.goal_assets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_goal_assets_goal_id ON public.goal_assets(goal_id);
CREATE INDEX idx_goal_assets_asset_id ON public.goal_assets(asset_id);
CREATE INDEX idx_goal_assets_user_id ON public.goal_assets(user_id);