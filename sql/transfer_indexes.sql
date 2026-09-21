-- Extra indexes for list/filter/order paths. Safe to re-run.

CREATE INDEX IF NOT EXISTS idx_app_users_approved_tutors
  ON app_users (full_name)
  WHERE role = 'tutor'
    AND status = 'approved'
    AND COALESCE(is_suspended, false) = false;

CREATE INDEX IF NOT EXISTS idx_app_users_students_xp
  ON app_users (xp DESC, created_at ASC)
  WHERE role = 'student'
    AND COALESCE(is_suspended, false) = false;

CREATE INDEX IF NOT EXISTS idx_bookings_tutor_status_end
  ON bookings (tutor_id, status, end_at);

CREATE INDEX IF NOT EXISTS idx_bookings_student_status_end
  ON bookings (student_id, status, end_at);

CREATE INDEX IF NOT EXISTS idx_student_boosts_student_kind
  ON student_boosts (student_id, kind);
