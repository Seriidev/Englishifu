-- Notifications + Reviews + Speaking Club
-- Run after sql/bookings.sql in Vercel Postgres / Neon SQL editor.

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_path TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_tutor
  ON reviews (tutor_id, created_at DESC);

-- Profile reviews (no lesson) — one star rating per student per tutor
ALTER TABLE reviews
  ALTER COLUMN booking_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_one_profile_per_student
  ON reviews (student_id, tutor_id)
  WHERE booking_id IS NULL;

CREATE TABLE IF NOT EXISTS speaking_club_sessions (
  id SERIAL PRIMARY KEY,
  host_tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic_tags TEXT[] NOT NULL DEFAULT '{}',
  level_tag TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60
    CHECK (duration_minutes > 0 AND duration_minutes <= 240),
  max_participants INTEGER NOT NULL DEFAULT 8
    CHECK (max_participants > 0 AND max_participants <= 50),
  meeting_link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_club_starts
  ON speaking_club_sessions (starts_at);

CREATE TABLE IF NOT EXISTS speaking_club_participants (
  session_id INTEGER NOT NULL REFERENCES speaking_club_sessions (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, student_id)
);
