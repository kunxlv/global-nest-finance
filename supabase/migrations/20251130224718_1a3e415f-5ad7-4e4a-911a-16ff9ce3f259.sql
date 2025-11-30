-- Add unique constraint to enforce one asset per goal
ALTER TABLE goal_assets ADD CONSTRAINT unique_asset_one_goal UNIQUE (asset_id);