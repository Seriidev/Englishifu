-- Tasks (admin → tutor) and homework (tutor → student). Safe to re-run.

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('task', 'homework')),
  creator_id TEXT REFERENCES app_users (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_assignees (
  assignment_id INTEGER NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'completed')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_assignees_user
  ON assignment_assignees (user_id, status);

CREATE INDEX IF NOT EXISTS idx_assignments_creator
  ON assignments (creator_id, created_at DESC);
