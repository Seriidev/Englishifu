ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS specializations JSONB NOT NULL DEFAULT '[]'::jsonb;
