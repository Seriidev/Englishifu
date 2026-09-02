-- Teacher to student XP boosts (daily + after each completed lesson).
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS student_boosts (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('daily', 'lesson')),
  booking_id INTEGER REFERENCES bookings (id) ON DELETE SET NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 30,
  boost_day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_daily_once
  ON student_boosts (tutor_id, student_id, boost_day)
  WHERE kind = 'daily';

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_boosts_lesson_once
  ON student_boosts (booking_id)
  WHERE kind = 'lesson' AND booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_boosts_student_day
  ON student_boosts (student_id, boost_day DESC);
