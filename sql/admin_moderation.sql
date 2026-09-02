-- Admin moderation + tutor profile fields on app_users
-- Run after sql/bookings.sql and sql/notifications_reviews_speaking.sql

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
  ADD COLUMN IF NOT EXISTS about_me TEXT,
  ADD COLUMN IF NOT EXISTS hourly_rate_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cefr_level TEXT;

CREATE TABLE IF NOT EXISTS tutor_moderation_log (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  admin_id TEXT NOT NULL DEFAULT 'admin',
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_tutor_pending
  ON app_users (role, status)
  WHERE role = 'tutor';
