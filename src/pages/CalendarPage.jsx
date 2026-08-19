import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { getQueueItemById } from '../data/posts'
import { fetchCalendarPosts } from '../lib/api'
import { mapApiPost } from '../lib/postMapper'

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const tagColors = [
  'bg-brand-100 text-brand-800',
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
]

const eventColorPalette = [
  'bg-brand-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-indigo-500',
]

function pickEventColor(id) {
  let hash = 0
  const str = String(id)
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return eventColorPalette[Math.abs(hash) % eventColorPalette.length]
}

const platformLogos = {
  LinkedIn: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </span>
  ),
  Instagram: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] via-[#D62976] to-[#4F5BD5]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
      </svg>
    </span>
  ),
  Twitter: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>
  ),
}

const HOUR_HEIGHT = 80
const START_HOUR = 0
const END_HOUR = 24
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

function parseTimeToHour(t) {
  if (!t) return 9
  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return 9
  let hour = parseInt(match[1], 10)
  const min = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  return hour + min / 60
}

function formatHourLabel(h) {
  if (h === 0 || h === 24) return '12 AM'
  if (h === 12) return '12 PM'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function parseApiDate(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  // API sends DD-MM-YYYY; fall back to YYYY-MM-DD if the first segment is the year.
  const [a, b, c] = parts
  const [year, month, day] = a > 31 ? [a, b, c] : [c, b, a]
  const d = new Date(year, month - 1, day)
  return Number.isNaN(d.getTime()) ? null : d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (d.getDay() + 6) % 7
  return addDays(d, -offset)
}

function formatTime(t) {
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${m} ${ampm}`
}

function formatTime24(t) {
  if (!t) return '09:00 AM'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

function normalizeTimeLabel(raw) {
  if (!raw) return '09:00 AM'
  const trimmed = raw.trim()
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase().replace(/\s+/, ' ')
  }
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    return formatTime24(trimmed)
  }
  return trimmed
}

function truncateTitle(title, wordLimit = 2) {
  if (!title) return ''
  const words = title.trim().split(/\s+/)
  if (words.length <= wordLimit) return title
  return `${words.slice(0, wordLimit).join(' ')}...`
}

function ScheduleModal({ date, onClose, onSave }) {
  const fileInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Professional')
  const [language, setLanguage] = useState('EN-US')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [scheduleEndTime, setScheduleEndTime] = useState('09:30')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [tags, setTags] = useState(['#PIXMoving', '#RoboBus'])
  const [newTag, setNewTag] = useState('')
  const [showToneDropdown, setShowToneDropdown] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowToneDropdown(false)
        setShowLanguageDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, '#')
    if (clean.length > 1 && !tags.includes(clean)) setTags((p) => [...p, clean])
  }
  function removeTag(tag) { setTags((p) => p.filter((t) => t !== tag)) }

  function addFiles(files) {
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    setUploadedFiles((p) => [...p, ...valid.map((f) => ({ id: Date.now() + Math.random(), name: f.name, file: f, preview: URL.createObjectURL(f) }))])
  }
  function removeFile(id) {
    setUploadedFiles((p) => { const f = p.find((x) => x.id === id); if (f) URL.revokeObjectURL(f.preview); return p.filter((x) => x.id !== id) })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim() || !selectedPlatform) return
    const dateStr = date.toISOString().slice(0, 10)
    onSave({
      title: prompt.trim().slice(0, 60),
      platform: selectedPlatform,
      time: formatTime(scheduleTime),
      endTime: formatTime(scheduleEndTime),
      hashtags: tags,
      description: prompt.trim(),
      caption: prompt.trim(),
      additionalDetails,
      referenceUrl,
      tone,
      language,
      date: dateStr,
    })
  }

  const inputClass = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-10 sm:items-start sm:pt-16 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl mb-10"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-black">Create Post</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700">
          <CalendarDays className="h-4 w-4 shrink-0" />
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.prompt} chip={cpSectionChips.prompt} title="PROMPT CONSOLE" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the post in detail..."
                rows={8}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <div ref={dropdownRef} className="mt-3 flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button type="button" onClick={() => { setShowToneDropdown(!showToneDropdown); setShowLanguageDropdown(false) }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                    Tone: {tone}
                    <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {showToneDropdown && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      {toneOptions.map((o) => (
                        <button key={o} type="button" onClick={() => { setTone(o); setShowToneDropdown(false) }}
                          className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${tone === o ? 'bg-brand-50 font-medium text-brand-700' : 'text-neutral-600'}`}>{o}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button type="button" onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowToneDropdown(false) }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                    {language}
                    <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      {languageOptions.map((o) => (
                        <button key={o} type="button" onClick={() => { setLanguage(o); setShowLanguageDropdown(false) }}
                          className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${language === o ? 'bg-brand-50 font-medium text-brand-700' : 'text-neutral-600'}`}>{o}</button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="ml-auto text-xs text-neutral-400">{prompt.length} / 2000 chars</span>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.schedule} chip={cpSectionChips.schedule} title="SCHEDULE" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Start Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">End Time</label>
                  <input type="time" value={scheduleEndTime} onChange={(e) => setScheduleEndTime(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.link} chip={cpSectionChips.link} title="REFERENCE URL" />
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                </div>
                <input type="url" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://example.com/inspiration"
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.media} chip={cpSectionChips.media} title="MEDIA ASSETS" />
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(Array.from(e.target.files))} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }} onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false) }}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); addFiles(Array.from(e.dataTransfer.files)) }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${isDragOver ? 'border-brand-500 bg-brand-100' : 'border-brand-300 bg-white hover:border-brand-400 hover:bg-brand-100/60'}`}>
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                </span>
                <p className="text-sm font-medium text-neutral-600">Drag & drop images here</p>
                <p className="mt-1 text-xs text-neutral-400">Optional — or click to browse (Max 5MB)</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <img src={file.preview} alt={file.name} className="h-24 w-full rounded-lg object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <p className="mt-1 truncate text-xs text-neutral-500">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.details} chip={cpSectionChips.details} title="ADDITIONAL DETAILS" />
              <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Specific instructions, platform notes..." rows={3}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tags.map((tag, i) => (
                  <span key={tag} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cpTagColors[i % cpTagColors.length]}`}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="opacity-60 transition hover:opacity-100">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); addTag(newTag); setNewTag('') }} className="flex items-center">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="+ Tag"
                    className="w-20 rounded-full border border-dashed border-brand-300 bg-white px-3 py-1 text-xs outline-none focus:border-brand-500" />
                </form>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <CpSectionLabel icon={cpSectionIcons.target} chip={cpSectionChips.target} title="PLATFORM TARGET" />
              <div className="space-y-3">
                {Object.entries(cpPlatformIcons).map(([platform, icon]) => (
                  <label key={platform} className="flex cursor-pointer select-none items-center gap-3 rounded-lg bg-white p-2.5 transition hover:bg-neutral-50">
                    <input type="checkbox" checked={selectedPlatform === platform}
                      onChange={() => setSelectedPlatform((prev) => (prev === platform ? null : platform))}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500" />
                    <span className="flex items-center gap-2.5">
                      {icon}
                      <span className="text-sm font-medium text-neutral-700">{platform}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50">
            Cancel
          </button>
          <button type="submit" disabled={!prompt.trim() || !selectedPlatform}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" /> Schedule
          </button>
        </div>
      </form>
    </div>
  )
}

function TimeGrid({ days, eventsByDate, today, selected, onSelect, multiDay = false }) {
  const gridRef = useRef(null)

  useEffect(() => {
    if (gridRef.current) {
      const currentHour = new Date().getHours()
      const scrollTo = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_HEIGHT)
      gridRef.current.scrollTop = scrollTo
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {/* Day headers */}
      <div className={`grid border-b border-neutral-200 bg-neutral-50 ${multiDay ? 'grid-cols-[4rem_repeat(7,1fr)]' : 'grid-cols-[4rem_1fr]'}`}>
        <div className="border-r border-neutral-200" />
        {days.map((d) => {
          const isToday = isSameDay(d, today)
          return (
            <div
              key={d.toISOString()}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 border-r border-neutral-100 last:border-r-0 ${
                isToday ? 'bg-brand-50' : ''
              }`}
            >
              <span className="text-[10px] font-semibold tracking-widest text-neutral-400">
                {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? 'bg-brand-500 text-white' : 'text-neutral-700'
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div ref={gridRef} className="relative max-h-[720px] overflow-y-auto">
        <div className={`grid ${multiDay ? 'grid-cols-[4rem_repeat(7,1fr)]' : 'grid-cols-[4rem_1fr]'}`}>
          {/* Hour labels column */}
          <div className="relative border-r border-neutral-200">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-neutral-100"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-2.5 pl-2 text-[10px] font-medium text-neutral-400">
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const dayEvents = eventsByDate.filter((ev) => isSameDay(ev.date, d))
            const isToday = isSameDay(d, today)
            const now = new Date()
            const currentHourDecimal = now.getHours() + now.getMinutes() / 60

            return (
              <div
                key={d.toISOString()}
                className="relative border-r border-neutral-100 last:border-r-0"
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b border-neutral-100"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && currentHourDecimal >= START_HOUR && currentHourDecimal < END_HOUR && (
                  <div
                    className="absolute left-0 z-10 flex items-center"
                    style={{ top: (currentHourDecimal - START_HOUR) * HOUR_HEIGHT }}
                  >
                    <div className="h-2.5 w-2.5 -ml-1.5 rounded-full bg-red-500" />
                    <div className="h-[2px] w-full bg-red-500" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((ev) => {
                  const startHour = parseTimeToHour(ev.time)
                  const endHour = parseTimeToHour(ev.endTime) || startHour + 0.5
                  const top = (startHour - START_HOUR) * HOUR_HEIGHT
                  const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 28)

                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(ev)
                      }}
                      className={`absolute left-0.5 right-0.5 z-20 flex flex-col justify-center overflow-hidden rounded px-1.5 py-1 text-left text-white transition hover:opacity-90 ${
                        selected?.id === ev.id ? 'ring-2 ring-brand-500 ring-offset-1' : ''
                       } ${ev.bannerColor ?? pickEventColor(ev.id)}`}
                      style={{ top, height: Math.min(height, (END_HOUR - startHour) * HOUR_HEIGHT) }}
                    >
                      <span className="truncate text-[11px] font-semibold leading-tight">{truncateTitle(ev.title)}</span>
                      <span className="truncate text-[9px] opacity-90">{ev.time}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EventPlatformBadges({ event }) {
  const platforms = []
  if (event.bestPlatform) platforms.push(event.bestPlatform)
  if (event.platforms) platforms.push(...event.platforms)
  const unique = [...new Set(platforms)].slice(0, 3)
  if (unique.length === 0) return null
  return (
    <span className="ml-1 inline-flex items-center gap-1">
      {unique.map((p) => (
        <span key={p}>
          {platformLogos[p] ?? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300" />}
        </span>
      ))}
    </span>
  )
}

function MonthView({ grid, monthDate, today, eventsByDate, selected, onSelect, onDayClick }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-[10px] font-semibold tracking-widest text-neutral-400"
          >
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
              onClick={() => onDayClick(date)}
              className={`flex min-h-[7rem] flex-col border-b border-r border-neutral-100 p-1.5 transition hover:bg-neutral-50/70 ${
                inMonth ? 'bg-white' : 'bg-neutral-50/60'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? 'bg-brand-500 font-semibold text-white'
                      : inMonth
                        ? 'text-neutral-700'
                        : 'text-neutral-300'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEvents.map((ev) => {
                  const count = dayEvents.length
                  const single = count === 1
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(ev)
                      }}
                      className={`flex w-full cursor-pointer flex-col gap-0.5 text-left font-medium text-white transition hover:opacity-90 ${
                        single
                          ? 'rounded pl-1 pr-1.5 py-2 text-[11px]'
                          : 'rounded pl-0.5 pr-1 py-0.5 text-[10px]'
                      } ${selected?.id === ev.id ? 'ring-2 ring-brand-500' : ''} ${
                        ev.bannerColor ?? pickEventColor(ev.id)
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <EventPlatformBadges event={ev} />
                        <span className={`whitespace-normal leading-snug ${single ? 'line-clamp-2' : 'line-clamp-1'}`}>{truncateTitle(ev.title)}</span>
                      </span>
                      <span className={single ? 'text-[9px] opacity-80 ml-4' : 'text-[8px] opacity-80 ml-3'}>{ev.time}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])
  const [view, setView] = useState('month')
  const [anchor, setAnchor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [extraEvents, setExtraEvents] = useState([])
  const [approvedPosts, setApprovedPosts] = useState([])
  const [calendarError, setCalendarError] = useState(null)

  useEffect(() => {
    fetchCalendarPosts()
      .then((data) => {
        const posts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : []
        setApprovedPosts(posts.map(mapApiPost))
      })
      .catch((err) => setCalendarError(err.message))
  }, [])

  const eventsByDate = useMemo(() => {
    const scheduledPosts = approvedPosts
      .map((p) => ({ ...p, parsedDate: parseApiDate(p.date) }))
      .filter((p) => p.parsedDate)
      .map((p) => {
        const diffMs = p.parsedDate.getTime() - today.getTime()
        const dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24))
        return {
          id: p.id,
          relatedId: p.id,
          dayOffset,
          type: 'MOTION',
          title: p.title,
          time: p.startTime ? normalizeTimeLabel(p.startTime) : null,
          endTime: p.endTime ? normalizeTimeLabel(p.endTime) : null,
          thumbClass: p.thumbClass || 'bg-gradient-to-br from-brand-200 to-brand-400',
          description: p.caption,
          hashtags: p.hashtags || [],
          expectedReach: '—',
          reachDelta: '',
          bestPlatform: p.platform,
          platforms: p.platforms,
          matchScore: p.score || 85,
          sentimentLabel: 'OPTIMISTIC',
          audienceLabel: 'Scheduled',
          audiencePercent: 70,
          images: p.images || [],
          bannerColor: pickEventColor(p.id),
        }
      })
    return [...extraEvents, ...scheduledPosts].map((ev) => ({
      ...ev,
      date: addDays(today, ev.dayOffset ?? 0),
    }))
  }, [today, extraEvents, approvedPosts])

  const todaysEvent = eventsByDate.find((ev) => isSameDay(ev.date, today))
  const [selected, setSelected] = useState(todaysEvent ?? null)
  const [scheduleDate, setScheduleDate] = useState(null)

  const selectedWithImages = useMemo(() => {
    if (!selected) return null
    if (selected.images && selected.images.length > 0) return selected
    if (selected.relatedId) {
      const linkedPost = getQueueItemById(selected.relatedId)
      if (linkedPost?.images?.length > 0) {
        return { ...selected, images: linkedPost.images }
      }
    }
    return selected
  }, [selected])

  const grid = useMemo(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const startWeekday = (first.getDay() + 6) % 7
    const gridStart = addDays(first, -startWeekday)
    const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i))
  }, [anchor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [anchor])

  let label
  if (view === 'month') {
    label = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } else if (view === 'week') {
    const start = weekDays[0]
    const end = weekDays[6]
    label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else {
    label = anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  function step(direction) {
    if (view === 'day') {
      setAnchor((d) => addDays(d, direction))
    } else if (view === 'week') {
      setAnchor((d) => addDays(d, direction * 7))
    } else {
      setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + direction, 1))
    }
  }

  function goToday() {
    if (view === 'month') {
      setAnchor(new Date(today.getFullYear(), today.getMonth(), 1))
    } else if (view === 'week') {
      setAnchor(startOfWeek(today))
    } else {
      setAnchor(today)
    }
  }

  function handleViewChange(next) {
    const target = selected ? selected.date : today
    setView(next)
    if (next === 'day') {
      setAnchor(target)
    } else if (next === 'week') {
      setAnchor(startOfWeek(target))
    } else {
      setAnchor(new Date(target.getFullYear(), target.getMonth(), 1))
    }
  }

  function handleScheduleSave(ev) {
    const newEvent = {
      id: `cal-new-${Date.now()}`,
      dayOffset: Math.round((scheduleDate - today) / (1000 * 60 * 60 * 24)),
      type: 'MOTION',
      title: ev.title,
      time: ev.time,
      endTime: ev.endTime,
      thumbClass: 'bg-gradient-to-br from-brand-200 to-brand-400',
      bannerColor: pickEventColor(`cal-new-${Date.now()}`),
      description: ev.description,
      hashtags: ev.hashtags,
      expectedReach: '—',
      reachDelta: '',
      bestPlatform: ev.platform,
      matchScore: 90,
      sentimentLabel: 'OPTIMISTIC',
      audienceLabel: 'Scheduled',
      audiencePercent: 70,
    }
    setExtraEvents((prev) => [...prev, newEvent])
    setScheduleDate(null)
    setSelected(newEvent)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        {calendarError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            Couldn't load approved posts for the calendar: {calendarError}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => step(-1)}
                aria-label="Previous"
                className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next"
                className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h2 className="ml-1 text-xl font-bold text-black">{label}</h2>
          </div>

          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-32 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setScheduleDate(today)}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
        </div>

        {view === 'month' && (
          <MonthView
            grid={grid}
            monthDate={anchor}
            today={today}
            eventsByDate={eventsByDate}
            selected={selected}
            onSelect={setSelected}
            onDayClick={setScheduleDate}
          />
        )}
        {view === 'week' && (
          <TimeGrid
            days={weekDays}
            eventsByDate={eventsByDate}
            today={today}
            selected={selected}
            onSelect={setSelected}
            multiDay
          />
        )}
        {view === 'day' && (
          <TimeGrid
            days={[anchor]}
            eventsByDate={eventsByDate}
            today={today}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      {selectedWithImages && (
        <div className="flex w-full flex-col gap-7 rounded-lg border border-neutral-200 bg-white p-4 lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-black">Post Details</h3>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="text-neutral-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className={`relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-white ${
            selectedWithImages.images && selectedWithImages.images.length > 0 ? '' : selectedWithImages.thumbClass
          }`}>
            {selectedWithImages.images && selectedWithImages.images.length > 0 ? (
              <img
                src={selectedWithImages.images[0].dataUri}
                alt={selectedWithImages.images[0].name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="select-none text-5xl font-bold text-white/70">
                {selectedWithImages.title?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-black">{selectedWithImages.title}</p>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-neutral-400">
              <CalendarDays className="mt-px h-3 w-3 shrink-0" />
              <span className="leading-relaxed">
                {selectedWithImages.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {selectedWithImages.time && selectedWithImages.endTime
                  ? `, ${selectedWithImages.time} – ${selectedWithImages.endTime}`
                  : ''}
              </span>
            </p>
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-neutral-500">{selectedWithImages.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedWithImages.hashtags.map((tag, i) => (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-neutral-400">
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
                <p className="mt-1 text-lg font-bold text-black">{selectedWithImages.expectedReach}</p>
                <p className="text-xs font-medium text-emerald-600">{selectedWithImages.reachDelta}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">BEST PLATFORM</p>
                <p className="mt-1 text-lg font-bold text-black">{selectedWithImages.bestPlatform}</p>
                <p className="text-xs text-neutral-500">{selectedWithImages.matchScore}% Match Score</p>
              </div>
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-neutral-50 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                AUDIENCE SENTIMENT FORECAST
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                {selectedWithImages.sentimentLabel}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${selectedWithImages.audiencePercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              {selectedWithImages.audienceLabel} {selectedWithImages.audiencePercent}%
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-2">
            <button
              onClick={() => selectedWithImages.relatedId && navigate(`/approval-queue/${selectedWithImages.relatedId}/edit`)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ring-1 ring-neutral-200 hover:bg-neutral-50 ${
                selectedWithImages.relatedId ? 'text-neutral-600' : 'cursor-not-allowed text-neutral-300'
              }`}
            >
              Edit Content
            </button>
            <button className="flex-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
              Reschedule
            </button>
          </div>
        </div>
      )}

      {scheduleDate && (
        <ScheduleModal
          date={scheduleDate}
          onClose={() => setScheduleDate(null)}
          onSave={handleScheduleSave}
        />
      )}
    </div>
  )
}
