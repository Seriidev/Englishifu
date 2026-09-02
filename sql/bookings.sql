-- Englishcore booking schema
-- Run in Vercel Postgres / Neon SQL editor BEFORE deploying booking APIs.
-- Order matters: extension -> users -> availability -> bookings (EXCLUDE needs btree_gist).

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Bridge table: IDs match localStorage auth user.id until full backend auth lands.
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'tutor')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_handle_lower_idx
  ON app_users (lower(handle));

CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_lower_idx
  ON app_users (lower(email));

-- Weekly repeating availability template
CREATE TABLE IF NOT EXISTS tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60
    CHECK (slot_duration_minutes > 0 AND slot_duration_minutes <= 240),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_start_before_end CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS tutor_availability_tutor_idx
  ON tutor_availability (tutor_id)
  WHERE is_active = true;

-- Concrete bookings (UTC)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending_payment')),
  subject TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_start_before_end CHECK (start_at < end_at),
  -- DB-level race protection: no two confirmed bookings may overlap for one tutor
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    tutor_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX IF NOT EXISTS bookings_tutor_start_idx
  ON bookings (tutor_id, start_at)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS bookings_student_start_idx
  ON bookings (student_id, start_at)
  WHERE status = 'confirmed';
