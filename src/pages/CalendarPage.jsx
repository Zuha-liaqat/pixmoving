import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calendarEvents } from '../data/calendarEvents'

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const typeBadgeColor = {
  REEL: 'bg-fuchsia-100 text-fuchsia-700',
  MOTION: 'bg-black text-white',
  INTERIOR: 'bg-neutral-800 text-white',
  API: 'bg-emerald-100 text-emerald-700',
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function buildGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startWeekday = (first.getDay() + 6) % 7 // Monday = 0
  const gridStart = addDays(first, -startWeekday)
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
  return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i))
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const today = useMemo(() => new Date(), [])
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const eventsByDate = useMemo(
    () => calendarEvents.map((ev) => ({ ...ev, date: addDays(today, ev.dayOffset) })),
    [today],
  )

  const todaysEvent = eventsByDate.find((ev) => isSameDay(ev.date, today))
  const [selected, setSelected] = useState(todaysEvent ?? null)

  const grid = useMemo(() => buildGrid(monthDate), [monthDate])
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-black">{monthLabel}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              Today
            </button>
            <button
              onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold tracking-widest text-neutral-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((date) => {
              const inMonth = date.getMonth() === monthDate.getMonth()
              const isToday = isSameDay(date, today)
              const dayEvents = eventsByDate.filter((ev) => isSameDay(ev.date, date))

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-24 border-b border-r border-neutral-100 p-1.5 ${
                    inMonth ? 'bg-white' : 'bg-neutral-50/60'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? 'bg-black font-semibold text-white'
                          : inMonth
                            ? 'text-neutral-700'
                            : 'text-neutral-300'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && <span className="h-1 w-1 rounded-full bg-black" />}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-1 text-left text-[10px] font-medium transition ${
                          selected?.id === ev.id
                            ? 'ring-1 ring-black'
                            : 'hover:opacity-80'
                        } ${typeBadgeColor[ev.type] ?? 'bg-neutral-100 text-neutral-700'}`}
                      >
                        <span className="truncate">{ev.type}</span>
                        <span className="ml-auto shrink-0 opacity-80">{ev.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="w-full space-y-4 rounded-lg border border-neutral-200 bg-white p-4 lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-black">Post Details</h3>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="text-neutral-400 hover:text-black"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={`relative flex h-36 items-center justify-center overflow-hidden rounded-lg ${selected.thumbClass}`}>
            <span className="select-none text-5xl font-bold text-white/70">
              {selected.title?.charAt(0).toUpperCase()}
            </span>
            <span
              className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                typeBadgeColor[selected.type] ?? 'bg-black/70 text-white'
              }`}
            >
              {selected.type}
            </span>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              </svg>
              {selected.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} @ {selected.time}
            </p>
            <p className="mt-1 text-sm font-semibold text-black">{selected.title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-neutral-500">{selected.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.hashtags.map((tag) => (
                <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-neutral-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 13.5l3-3 3 2 4-5 4 3M3 19.5h18"
                />
              </svg>
              PREDICTIVE ENGAGEMENT
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">EXPECTED REACH</p>
                <p className="mt-1 text-lg font-bold text-black">{selected.expectedReach}</p>
                <p className="text-xs font-medium text-emerald-600">{selected.reachDelta}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">BEST PLATFORM</p>
                <p className="mt-1 text-lg font-bold text-black">{selected.bestPlatform}</p>
                <p className="text-xs text-neutral-500">{selected.matchScore}% Match Score</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                AUDIENCE SENTIMENT FORECAST
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                {selected.sentimentLabel}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${selected.audiencePercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              {selected.audienceLabel} {selected.audiencePercent}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/approval-queue/${selected.relatedId}/edit`)}
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              Edit Content
            </button>
            <button className="flex-1 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Reschedule
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
