-- Student requests for speaking clubs that do not exist yet.

CREATE TABLE IF NOT EXISTS speaking_club_requests (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  preferred_time TEXT,
  level_tag TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_club_requests_student
  ON speaking_club_requests (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_speaking_club_requests_status
  ON speaking_club_requests (status, created_at DESC);
