import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineBell } from 'react-icons/hi2'
import { useAuth } from '../../auth/AuthContext'
import type { AppNotification } from '../../types/notifications'
import {
  ensureApiSession,
  fetchNotifications,
  formatRelativeTime,
  markNotificationsRead,
} from '../../utils/platformApi'

interface NotificationBellProps {
  className?: string
  buttonClassName?: string
}

export default function NotificationBell({
  className = '',
  buttonClassName,
}: NotificationBellProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    try {
      await ensureApiSession(user)
      const data = await fetchNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // API may be offline in plain Vite — keep UI quiet
    }
  }, [user])

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(), 8_000)
    return () => window.clearInterval(interval)
  }, [load])

  useEffect(() => {
    if (!isOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen])

  const handleOpen = async () => {
    const next = !isOpen
    setIsOpen(next)
    if (next && unreadCount > 0 && user) {
      try {
        await ensureApiSession(user)
        await markNotificationsRead()
        setUnreadCount(0)
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true })),
        )
      } catch {
        /* ignore */
      }
    }
  }

  if (!user) return null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => void handleOpen()}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
          buttonClassName
            ? buttonClassName
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <HiOutlineBell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-slate-100 bg-white px-3 py-2">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Notifications
            </p>
          </div>
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.link_path || '#'}
                onClick={() => setIsOpen(false)}
                className={`block border-b border-slate-50 p-3 hover:bg-slate-50 ${
                  !n.is_read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <p className="text-sm font-medium text-slate-900">
                  {n.title}
                </p>
                <p className="text-xs text-slate-500">
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {formatRelativeTime(n.created_at)}
                </p>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
