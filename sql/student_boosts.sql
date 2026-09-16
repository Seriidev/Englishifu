-- Teacher/admin boosts (once per day, 0 XP) and automatic lesson XP (+10).
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS student_boosts (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT REFERENCES app_users (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('daily', 'lesson', 'speaking_club', 'admin')),
  booking_id INTEGER REFERENCES bookings (id) ON DELETE SET NULL,
  session_id INTEGER REFERENCES speaking_club_sessions (id) ON DELETE SET NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  boost_day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_boosts
  ALTER COLUMN tutor_id DROP NOT NULL;

ALTER TABLE student_boosts
  ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES speaking_club_sessions (id) ON DELETE SET NULL;

ALTER TABLE student_boosts
  DROP CONSTRAINT IF EXISTS student_boosts_kind_check;

ALTER TABLE student_boosts
  ADD CONSTRAINT student_boosts_kind_check
  CHECK (kind IN ('daily', 'lesson', 'speaking_club', 'admin'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_daily_once
  ON student_boosts (tutor_id, student_id, boost_day)
  WHERE kind = 'daily' AND tutor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_lesson_once
  ON student_boosts (booking_id)
  WHERE kind = 'lesson' AND booking_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_club_once
  ON student_boosts (session_id, student_id)
  WHERE kind = 'speaking_club' AND session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_admin_once
  ON student_boosts (student_id, boost_day)
  WHERE kind = 'admin';

DROP INDEX IF EXISTS idx_student_boosts_tutor_student_once;

ALTER TABLE student_boosts
  ALTER COLUMN xp_awarded SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_student_boosts_student_day
  ON student_boosts (student_id, boost_day DESC);
