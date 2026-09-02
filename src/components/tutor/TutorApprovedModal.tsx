import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { fetchTutorMe } from '../../utils/adminApi'
import {
  ensureApiSession,
  fetchNotifications,
  markNotificationsRead,
} from '../../utils/platformApi'
import VerifiedBadge from '../profile/VerifiedBadge'

export default function TutorApprovedModal() {
  const { user, refreshUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [notificationId, setNotificationId] = useState<number | null>(null)
  const userRef = useRef(user)
  userRef.current = user
  const openRef = useRef(open)
  openRef.current = open

  const tutorId = user?.role === 'tutor' ? user.id : null

  const checkApproval = useCallback(async () => {
    const current = userRef.current
    if (!tutorId || !current || current.role !== 'tutor' || openRef.current) return
    try {
      await ensureApiSession(current)

      const data = await fetchNotifications()
      const congrats = data.notifications.find(
        (n) => n.type === 'tutor_approved' && !n.is_read,
      )
      if (congrats) {
        if (current.status !== 'approved') await refreshUser()
        setNotificationId(congrats.id)
        setOpen(true)
        return
      }

      const me = await fetchTutorMe()
      if (me?.status === 'approved' && current.status !== 'approved') {
        await refreshUser()
        setOpen(true)
      }
    } catch {
      /* API may be offline */
    }
  }, [refreshUser, tutorId])

  useEffect(() => {
    if (!tutorId) return
    void checkApproval()
    const id = window.setInterval(() => void checkApproval(), 15_000)
    return () => window.clearInterval(id)
  }, [checkApproval, tutorId])

  const close = useCallback(async () => {
    setOpen(false)
    if (user && notificationId != null) {
      try {
        await ensureApiSession(user)
        await markNotificationsRead(notificationId)
      } catch {
        /* ignore */
      }
    }
  }, [notificationId, user])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void close()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [close, open])

  if (!open || user?.role !== 'tutor') return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-approved-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close congratulations"
        onClick={() => void close()}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
        <button
          type="button"
          onClick={() => void close()}
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="mx-auto flex justify-center">
          <VerifiedBadge size="lg" className="scale-150 text-[#4f7cff]" title="Verified teacher" />
        </div>
        <h2
          id="tutor-approved-title"
          className="mt-5 text-2xl font-bold tracking-tight text-slate-900"
        >
          Congratulations!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Your teacher profile has been approved. You now have a verified blue
          check and students can book lessons with you.
        </p>
        <button
          type="button"
          onClick={() => void close()}
          className="mt-6 inline-flex rounded-lg bg-[#4f7cff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d66e8]"
        >
          Start teaching
        </button>
      </div>
    </div>
  )
}
