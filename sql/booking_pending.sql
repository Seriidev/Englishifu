-- Student requests stay pending until the tutor accepts them.
-- Safe to re-run: constraints are dropped and recreated.

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'public.bookings'::regclass
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%status%'
      AND pg_get_constraintdef(con.oid) NOT ILIKE '%start_at%'
  LOOP
    EXECUTE format('ALTER TABLE bookings DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'pending_payment'));

ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    tutor_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed'));
