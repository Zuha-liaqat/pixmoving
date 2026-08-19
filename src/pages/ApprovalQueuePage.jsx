import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { addNotification } from '../data/notifications'
import PostPreviewModal from '../components/PostPreviewModal'
import { approveGeneratedPosts, deleteGeneratedPost, fetchGeneratedPosts } from '../lib/api'
import { mapApiPost } from '../lib/postMapper'

const platformIcons = {
  Twitter: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="black" aria-label="X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  'Web App': (
    <div className="flex h-5 w-5 items-center justify-center rounded bg-sky-500 text-white">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 013 9 14.5 14.5 0 01-3 9 14.5 14.5 0 01-3-9 14.5 14.5 0 013-9z"
        />
      </svg>
    </div>
  ),
  API: (
    <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-700 text-white">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
        />
      </svg>
    </div>
  ),
  Instagram: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Instagram">
      <defs>
        <linearGradient id="aq-ig" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#aq-ig)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" stroke="url(#aq-ig)" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="url(#aq-ig)" />
    </svg>
  ),
  LinkedIn: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2" aria-label="LinkedIn">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
}

const statusStyles = {
  PRODUCTION: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  STAGING: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  FLAGGED: 'bg-red-50 text-red-600 ring-1 ring-red-200',
}

const scoreBarColor = (score) =>
  score >= 90 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'

function getInitials(title) {
  const letters = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
  return letters.join('') || '?'
}

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-600">{score}%</span>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

function ActionButtons({ compact, onEdit, onDelete, onApprove, approved, approving, deleting }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'justify-end'}`}>
      {onApprove && (
        <button
          onClick={onApprove}
          disabled={approved || approving}
          aria-label={approved ? 'Approved' : 'Approve'}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition disabled:cursor-not-allowed ${
            approved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
              : 'cursor-pointer border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50'
          }`}
        >
          {approving ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          )}
        </button>
      )}
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </button>
      <button
        onClick={onDelete}
        disabled={deleting}
        aria-label="Delete"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79c1.121.113 2.235.256 3.34.428m-3.34-.428L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c1.105-.172 2.219-.315 3.34-.428m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </div>
  )
}

function ListView({ items, onPreview, onEdit, onDelete, onApprove, selectedIds, onToggle, onToggleAll, deletingId, approvingIds }) {
  const selectableIds = items.filter((item) => item.status !== 'PRODUCTION').map((item) => item.id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id))

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={selectableIds.length === 0}
                  onChange={() => onToggleAll(selectableIds)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </th>
              <th className="px-3 py-3.5">POST PREVIEW</th>
              <th className="px-3 py-3.5">PLATFORM</th>
              <th className="px-3 py-3.5">AI SAFETY SCORE</th>
              <th className="px-3 py-3.5">LANGUAGE</th>
              <th className="px-3 py-3.5">TIMESTAMP</th>
              <th className="px-3 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.flatMap((item) =>
              item.platforms.map((platform) => {
                const checked = selectedIds.has(item.id)
                const approved = item.status === 'PRODUCTION'
                return (
                  <tr
                    key={`${item.id}-${platform}`}
                    onClick={() => onPreview(item)}
                    className={`cursor-pointer border-b border-neutral-100 last:border-0 transition ${
                      checked ? 'bg-brand-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={approved}
                        onChange={() => onToggle(item.id)}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white text-[10px] font-bold text-white/90 shadow-sm ${
                            item.images && item.images.length > 0 ? '' : item.thumbClass
                          }`}
                        >
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].dataUri}
                              alt={item.images[0].name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.thumbLabel?.slice(0, 4) || getInitials(item.title)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-black">{item.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {platformIcons[platform]}
                        <span className="text-neutral-600">{platform}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <ScoreBar score={item.score} />
                    </td>
                    <td className="px-3 py-3.5 text-neutral-600">{item.language || '—'}</td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{item.timestamp}</td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionButtons
                        onEdit={() => onEdit(item.id)}
                        onDelete={() => onDelete(item.id)}
                        onApprove={() => onApprove(item.id)}
                        approved={approved}
                        approving={approvingIds.has(item.id)}
                        deleting={deletingId === item.id}
                      />
                    </td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TruncatedText({ text, limit = 140 }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > limit
  const shown = expanded || !isLong ? text : `${text.slice(0, limit).trimEnd()}...`

  return (
    <>
      {shown}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 font-medium text-brand-600 hover:underline"
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </>
  )
}

function getMeta(item) {
  if (item.platform === 'Instagram') return `Carousel (${item.hashtags.length + 1})`
  if (item.platform === 'Twitter') return `${item.caption.length} Characters`
  return `${item.caption.trim().split(/\s+/).length} Words`
}

function GridView({ items, onPreview, onEdit, onApprove, onDelete, deletingId, approvingIds, selectedIds, onToggle }) {
  const approvedCount = items.filter((item) => item.status === 'PRODUCTION').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const approved = item.status === 'PRODUCTION'
          const approving = approvingIds.has(item.id)
          const checked = selectedIds.has(item.id)
          return (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition ${
                checked ? 'border-brand-400 ring-2 ring-brand-100' : 'border-neutral-200'
              }`}
            >
              <div className="flex flex-col gap-1.5 border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={approved}
                    onChange={() => onToggle(item.id)}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-neutral-400">{getMeta(item)}</span>
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Delete"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79c1.121.113 2.235.256 3.34.428m-3.34-.428L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c1.105-.172 2.219-.315 3.34-.428m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {item.platforms.map((p) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {platformIcons[p]}
                      <span className="text-sm font-semibold text-black">{p}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div
                className={`flex h-40 flex-col items-center justify-center gap-1 overflow-hidden bg-white text-white ${
                  item.images && item.images.length > 0 ? '' : item.thumbClass
                }`}
              >
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0].dataUri}
                    alt={item.images[0].name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-2xl font-bold tracking-wider opacity-90">{item.thumbLabel || getInitials(item.title)}</span>
                    <span className="text-[10px] font-medium tracking-widest text-white/60">{item.id}</span>
                  </>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="text-sm font-bold text-black">{item.title}</p>
                <p className="flex-1 text-sm text-neutral-600">
                  <TruncatedText text={item.caption} limit={280} />
                </p>
                <p className="text-sm text-sky-600">{item.hashtags.join(' ')}</p>
              </div>

              <div className="flex flex-wrap border-t border-neutral-200">
                <button
                  onClick={() => onPreview(item)}
                  className="flex min-w-[96px] flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-xs font-medium whitespace-nowrap text-neutral-600 transition hover:bg-neutral-50"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview
                </button>
                <button
                  onClick={() => onEdit(item.id)}
                  className="flex min-w-[96px] flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-xs font-medium whitespace-nowrap text-neutral-600 transition hover:bg-neutral-50"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  disabled={approved || approving}
                  className={`flex min-w-[104px] flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium whitespace-nowrap transition disabled:cursor-not-allowed ${
                    approved ? 'bg-emerald-600 text-white' : 'cursor-pointer bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60'
                  }`}
                >
                  {approving ? (
                    <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12.75l2.25 2.25 4.5-6.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {approved ? 'Approved' : 'Approve'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap mt-7 items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-neutral-400">APPROVAL PROGRESS</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${items.length ? (approvedCount / items.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-500">
              {approvedCount}/{items.length}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-widest text-neutral-400">SCHEDULED FOR</p>
            <p className="text-sm font-medium text-black">Oct 24, 09:00 AM (UTC)</p>
          </div>
          <button className="rounded-md px-3 py-2 text-sm font-medium text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50">
            Re-Generate All
          </button>
          <button className="rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
            Finalize &amp; Queue
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalQueuePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'list'
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [previewItem, setPreviewItem] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [approvingIds, setApprovingIds] = useState(new Set())

  const loadItems = useCallback(() => {
    setStatus((prev) => (prev === 'ready' ? 'ready' : 'loading'))
    return fetchGeneratedPosts()
      .then((data) => {
        const posts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : []
        setItems(posts.map(mapApiPost))
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  function setView(next) {
    setSearchParams(next === 'list' ? {} : { view: next })
  }

  function handleEdit(id) {
    navigate(`/approval-queue/${id}/edit?view=${view}`)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteGeneratedPost(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  function handleToggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleToggleAll(ids) {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      return allSelected ? new Set() : new Set(ids)
    })
  }

  async function handleBatchApprove() {
    const ids = [...selectedIds]
    const count = ids.length
    if (count === 0) return

    setApprovingIds((prev) => new Set([...prev, ...ids]))
    try {
      await approveGeneratedPosts(ids)
      setItems((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, status: 'PRODUCTION' } : item)),
      )
      addNotification({
        type: 'approval',
        title: `${count} post${count > 1 ? 's' : ''} approved`,
        description: `${count} post${count > 1 ? 's have' : ' has'} been approved and queued for publishing.`,
        platform: 'Multi-platform',
        author: 'Alex Martinez',
      })
      setSelectedIds(new Set())
    } catch (err) {
      window.alert(err.message)
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    }
  }

  async function handleApprove(id) {
    setApprovingIds((prev) => new Set(prev).add(id))
    try {
      await approveGeneratedPosts([id])
      setItems((prev) => {
        const item = prev.find((i) => i.id === id)
        if (item) {
          addNotification({
            type: 'approval',
            title: `"${item.title}" approved`,
            description: `Your ${item.platform} post has been approved and moved to production.`,
            platform: item.platform,
            author: 'Alex Martinez',
          })
        }
        return prev.map((i) => (i.id === id ? { ...i, status: 'PRODUCTION' } : i))
      })
    } catch (err) {
      window.alert(err.message)
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {items.filter((i) => i.status !== 'FLAGGED').length} Ready for Review
            </span>
            <span className="flex items-center gap-1.5 rounded-sm bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {items.filter((i) => i.status === 'FLAGGED').length} Flagged
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                view === 'list' ? 'bg-brand-500 text-white' : 'text-neutral-400 hover:text-black'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                view === 'grid' ? 'bg-brand-500 text-white' : 'text-neutral-400 hover:text-black'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </button>
          </div>
         
          <button
            onClick={handleBatchApprove}
            disabled={selectedIds.size === 0 || approvingIds.size > 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {approvingIds.size > 0 ? 'Approving…' : `Batch Approve${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-600">
          Couldn't load posts. Please try again later.
        </div>
      )}

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200">
            <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px]">
              ✨
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-black">Nothing waiting for review yet</p>
            <p className="text-sm text-neutral-400">
              Generate a post and it'll land here for approval.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-post')}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate a post
          </button>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        view === 'list' ? (
          <ListView
            items={items}
            onPreview={setPreviewItem}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            deletingId={deletingId}
            approvingIds={approvingIds}
          />
        ) : (
          <GridView
            items={items}
            onPreview={setPreviewItem}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onDelete={handleDelete}
            deletingId={deletingId}
            approvingIds={approvingIds}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        )
      )}

      {previewItem && (
        <PostPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  )
}
