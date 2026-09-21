-- Students following tutors. Safe to re-run.

CREATE TABLE IF NOT EXISTS tutor_follows (
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tutor_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_follows_tutor
  ON tutor_follows (tutor_id);
