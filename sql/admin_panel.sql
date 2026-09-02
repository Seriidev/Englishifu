-- Admin panel: banners, referrals/rewards, news, test results, resume, suspend.
-- Run after sql/auth_migration.sql. Safe to re-run.

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_credits INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS app_users_referral_code_idx
  ON app_users (referral_code)
  WHERE referral_code IS NOT NULL;

-- Tutors may also have a city (students already do via auth_migration).
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS city TEXT;

-- ===== Unified discount / reward ledger (XP + future-discount credits) =====
CREATE TABLE IF NOT EXISTS reward_ledger (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'credit'
    CHECK (unit IN ('xp', 'credit')),
  description TEXT,
  related_referral_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_ledger_user
  ON reward_ledger (user_id, created_at DESC);

-- Personal invite rows. referral_code is NOT unique here — the student's
-- personal code lives on app_users.referral_code and is copied onto each row.
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  invited_email TEXT,
  invited_user_id TEXT REFERENCES app_users (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed')),
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS referrals_one_invite_per_user
  ON referrals (referrer_id, invited_user_id)
  WHERE invited_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_referrals_code
  ON referrals (referral_code);

CREATE INDEX IF NOT EXISTS idx_referrals_status
  ON referrals (status, created_at DESC);

-- ===== Marketing banners (Study Place carousel) =====
CREATE TABLE IF NOT EXISTS marketing_banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_link TEXT,
  background_color TEXT DEFAULT '#38BDF8',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_banners_order
  ON marketing_banners (display_order, id);

-- ===== News / announcements CMS =====
CREATE TABLE IF NOT EXISTS news_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_posts_published
  ON news_posts (is_published, published_at DESC);

-- ===== Saved test results (admin leaderboard / consultation) =====
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  overall_band_score NUMERIC(3, 1),
  section_scores JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_results_student
  ON test_results (student_id, overall_band_score DESC);
