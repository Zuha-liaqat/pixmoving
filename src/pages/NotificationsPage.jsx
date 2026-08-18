import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, CheckCircle, Clock, FileText, CheckCheck } from 'lucide-react'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../data/notifications'

const platformColors = {
  LinkedIn: 'bg-[#0A66C2]',
  Instagram: 'bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976]',
  Twitter: 'bg-black',
  'Multi-platform': 'bg-brand-500',
  Library: 'bg-violet-500',
  System: 'bg-neutral-500',
}

const platformIcons = {
  LinkedIn: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2" />
    </svg>
  ),
  Twitter: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

const typeConfig = {
  approval: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  schedule: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  creation: { icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'approval', label: 'Approvals' },
  { key: 'schedule', label: 'Schedules' },
  { key: 'creation', label: 'Created' },
]

function NotificationCard({ n, onRead, onClick }) {
  const cfg = typeConfig[n.type]
  const Icon = cfg.icon

  return (
    <button
      onClick={() => {
        if (!n.read) onRead(n.id)
        if (n.platform !== 'Library' && n.platform !== 'System') onClick(n)
      }}
      className={`relative flex w-full items-start gap-3 rounded-xl border p-3 sm:p-4 text-left transition hover:shadow-md ${
        n.read
          ? 'border-neutral-200 bg-white'
          : 'border-brand-200 bg-brand-50/30 shadow-sm'
      }`}
    >
      {!n.read && (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-brand-500 sm:right-4 sm:top-4" />
      )}

      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${cfg.bg}`}>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${cfg.color}`} />
      </div>

      <div className="min-w-0 flex-1">
        <span className={`text-sm font-semibold ${n.read ? 'text-neutral-700' : 'text-black'}`}>
          {n.title}
        </span>
        <p className={`mt-0.5 text-xs leading-relaxed sm:mt-1 sm:text-sm ${n.read ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {n.description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2 sm:gap-3">
          <span className="text-[10px] font-medium text-neutral-400 sm:text-[11px]">{n.time}</span>
          {n.author && (
            <span className="text-[10px] font-medium text-neutral-400 sm:text-[11px]">by {n.author}</span>
          )}
          <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white sm:px-2 sm:text-[10px] ${
            platformColors[n.platform] ?? 'bg-neutral-500'
          }`}>
            {platformIcons[n.platform] ?? null}
            {n.platform}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getNotifications())
  const [activeFilter, setActiveFilter] = useState('all')

  const unreadCount = items.filter((n) => !n.read).length

  const filtered = items.filter((n) => {
    if (activeFilter === 'unread') return !n.read
    if (activeFilter === 'all') return true
    return n.type === activeFilter
  })

  function markRead(id) {
    setItems(markNotificationRead(id))
  }

  function markAllRead() {
    setItems(markAllNotificationsRead())
  }

  function handleClick(n) {
    if (n.platform === 'LinkedIn' || n.platform === 'Instagram' || n.platform === 'Twitter') {
      navigate('/calendar')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header with back arrow */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-500 sm:text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up — no unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50 sm:px-3 sm:text-sm"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Read all</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3.5 sm:py-1.5 sm:text-xs ${
              activeFilter === f.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/20 px-1 text-[9px] font-bold sm:text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2 sm:space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-white py-12 text-neutral-400 sm:py-16">
            <Bell className="h-8 w-8 sm:h-10 sm:w-10" />
            <p className="text-xs font-medium sm:text-sm">No notifications to show</p>
          </div>
        )}
        {filtered.map((n) => (
          <NotificationCard
            key={n.id}
            n={n}
            onRead={markRead}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  )
}
