-- Auth migration on top of existing app_users / booking schema.
-- Order for a fresh DB:
--   1) sql/bookings.sql
--   2) sql/notifications_reviews_speaking.sql
--   3) sql/admin_moderation.sql
--   4) sql/auth_migration.sql
--   5) sql/admin_panel.sql
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- ===== Password + profile fields on app_users =====
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE,
  ADD COLUMN IF NOT EXISTS placement_completed_at TIMESTAMPTZ;

-- Ensure student/tutor public flags exist even if older rows were inserted without them
UPDATE app_users
SET is_public_profile = true
WHERE is_public_profile IS NULL;

-- ===== Optional: normalized certifications (UI still uses certifications JSONB as source of truth) =====
CREATE TABLE IF NOT EXISTS tutor_certifications (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_certifications_tutor
  ON tutor_certifications (tutor_id);

-- ===== Landing consultation form =====
CREATE TABLE IF NOT EXISTS consultation_requests (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  toefl_score TEXT,
  learning_goal TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status
  ON consultation_requests (status, created_at DESC);
