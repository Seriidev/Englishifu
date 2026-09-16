-- Student <-> teacher messages, unlocked after a teacher boost.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS teacher_messages (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'tutor')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_messages_thread
  ON teacher_messages (student_id, tutor_id, created_at DESC);
