import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { pollWhenVisible } from '../../utils/pollWhenVisible'
import type { AppNotification } from '../../types/notifications'
import {
  ensureApiSession,
  fetchNotifications,
  markNotificationsRead,
} from '../../utils/platformApi'

interface NotificationBellProps {
  className?: string
  buttonClassName?: string
}

type NoticeTab = 'all' | 'admin' | 'system'

const ADMIN_TYPES = new Set(['admin_message', 'admin_task', 'tutor_rejected'])
const SYSTEM_TYPES = new Set([
  'referral_reward',
  'tutor_approved',
  'speaking_club_reminder',
  'booking_reminder',
])

const TABS: { id: NoticeTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'admin', label: 'Admin' },
  { id: 'system', label: 'System' },
]

function noticeTab(item: AppNotification): NoticeTab {
  if (ADMIN_TYPES.has(item.type)) return 'admin'
  if (item.type === 'xp_boost' && !item.actor_id) return 'system'
  if (SYSTEM_TYPES.has(item.type)) return 'system'
  return 'all'
}

function senderName(item: AppNotification): string {
  if (item.actor_name) return item.actor_name
  if (noticeTab(item) === 'admin') return 'Admin'
  if (noticeTab(item) === 'system') return 'Englishcore'
  return item.title
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return letters || 'E'
}

function noticeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SenderMark({ item }: { item: AppNotification }) {
  const name = senderName(item)
  if (item.actor_avatar) {
    return (
      <img
        src={item.actor_avatar}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    )
  }
  const system = noticeTab(item) !== 'all' && !item.actor_name
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        system ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {initials(name)}
    </span>
  )
}

export default function NotificationBell({
  className = '',
  buttonClassName,
}: NotificationBellProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<NoticeTab>('all')
  const [opened, setOpened] = useState<AppNotification | null>(null)
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
    return pollWhenVisible(() => void load(), 60_000)
  }, [load])

  useEffect(() => {
    if (!isOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
        setOpened(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen])

  const handleOpen = async () => {
    const next = !isOpen
    setIsOpen(next)
    setOpened(null)
    if (next && unreadCount > 0 && user) {
      try {
        await ensureApiSession(user)
        await markNotificationsRead()
        setUnreadCount(0)
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      } catch {
        /* ignore */
      }
    }
  }

  if (!user) return null

  const hasUnread = unreadCount > 0
  const visible = notifications.filter((item) => noticeTab(item) === tab)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => void handleOpen()}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-500/15 hover:text-indigo-400 ${buttonClassName ?? ''}`}
        aria-label={
          hasUnread ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" strokeWidth={2.4} aria-hidden />
        {unreadCount > 0 ? (
          <span
            className="absolute right-1 bottom-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-slate-50"
            aria-hidden
          />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute top-full right-0 z-50 mt-2 flex max-h-[min(28rem,calc(100vh-5.5rem))] w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
          {opened ? (
            <div className="overflow-y-auto p-3">
              <button
                type="button"
                onClick={() => setOpened(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
              <div className="mt-3 flex items-center gap-3">
                <SenderMark item={opened} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {senderName(opened)}
                  </p>
                  <p className="text-xs text-slate-400">{noticeTime(opened.created_at)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-900">{opened.title}</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                {opened.message}
              </p>
              {opened.link_path && opened.link_path !== '#' ? (
                <Link
                  to={opened.link_path}
                  onClick={() => setIsOpen(false)}
                  className="mt-4 inline-flex rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                >
                  Open
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex border-b border-slate-100 px-2">
                {TABS.map((item) => {
                  const active = tab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`px-3 py-3 text-sm font-semibold ${
                        active
                          ? 'border-b-2 border-indigo-500 text-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {visible.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">
                    No notifications yet.
                  </p>
                ) : (
                  visible.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOpened(item)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left hover:bg-slate-50"
                    >
                      <SenderMark item={item} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {senderName(item)}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {item.message}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {noticeTime(item.created_at)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
