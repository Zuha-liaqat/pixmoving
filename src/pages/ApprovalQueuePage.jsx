import { useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { queueItems as initialQueueItems } from '../data/queueItems'
import PostPreviewModal from '../components/PostPreviewModal'

const platformIcons = {
  Twitter: (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-[11px] font-bold text-white">
      X
    </div>
  ),
  'Web App': (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-sky-500 text-white">
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
    <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-700 text-white">
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
    <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
        <circle cx="12" cy="12" r="3.2" strokeWidth={2} />
        <circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    </div>
  ),
  LinkedIn: (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-bold text-white">
      in
    </div>
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

function ActionButtons({ compact, onPreview, onEdit, onDelete }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'justify-end'}`}>
      <button
        onClick={onPreview}
        aria-label="Preview"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
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
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100"
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

function ListView({ items, onPreview, onEdit, onDelete, selectedIds, onToggle, onToggleAll }) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id))

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
                  onChange={() => onToggleAll(items.map((item) => item.id))}
                  className="h-4 w-4 rounded border-neutral-300 accent-black"
                />
              </th>
              <th className="px-3 py-3.5">POST PREVIEW</th>
              <th className="px-3 py-3.5">PLATFORM</th>
              <th className="px-3 py-3.5">AI SAFETY SCORE</th>
              <th className="px-3 py-3.5">BATCH STATUS</th>
              <th className="px-3 py-3.5">TIMESTAMP</th>
              <th className="px-3 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const checked = selectedIds.has(item.id)
              return (
                <tr
                  key={item.id}
                  className={`border-b border-neutral-100 last:border-0 transition ${
                    checked ? 'bg-blue-50/50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(item.id)}
                      className="h-4 w-4 rounded border-neutral-300 accent-black"
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white/90 shadow-sm ${item.thumbClass}`}
                      >
                        {getInitials(item.title)}
                      </div>
                      <div>
                        <p className="font-medium text-black">{item.title}</p>
                        <p className="text-xs text-neutral-400">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      {platformIcons[item.platform]}
                      <span className="text-neutral-600">{item.platform}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <ScoreBar score={item.score} />
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{item.timestamp}</td>
                  <td className="px-3 py-3.5">
                    <ActionButtons
                      onPreview={() => onPreview(item)}
                      onEdit={() => onEdit(item.id)}
                      onDelete={() => onDelete(item.id)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getMeta(item) {
  if (item.platform === 'Instagram') return `Carousel (${item.hashtags.length + 1})`
  if (item.platform === 'Twitter') return `${item.caption.length} Characters`
  return `${item.caption.trim().split(/\s+/).length} Words`
}

function GridView({ items, onPreview, onEdit, onApprove }) {
  const approvedCount = items.filter((item) => item.status === 'PRODUCTION').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const approved = item.status === 'PRODUCTION'
          return (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {platformIcons[item.platform]}
                  <span className="text-sm font-semibold text-black">{item.platform} Draft</span>
                </div>
                <span className="text-xs text-neutral-400">{getMeta(item)}</span>
              </div>

              <div
                className={`flex h-40 items-center justify-center text-3xl font-bold text-white/80 ${item.thumbClass}`}
              >
                {getInitials(item.title)}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="text-sm font-bold text-black">{item.title}</p>
                <p className="flex-1 text-sm text-neutral-600">{item.caption}</p>
                <p className="text-sm text-sky-600">{item.hashtags.join(' ')}</p>
              </div>

              <div className="grid grid-cols-3 border-t border-neutral-200">
                <button
                  onClick={() => onPreview(item)}
                  className="flex items-center justify-center gap-1.5 border-r border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="flex items-center justify-center gap-1.5 border-r border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition ${
                    approved ? 'bg-emerald-600 text-white' : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12.75l2.25 2.25 4.5-6.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                className="h-full rounded-full bg-black transition-all"
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
          <button className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50">
            Re-Generate All
          </button>
          <button className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            Finalize &amp; Queue
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalQueuePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'list'
  const newPost = location.state?.newPost
  const [items, setItems] = useState(() => {
    if (newPost) {
      return [newPost, ...initialQueueItems]
    }
    return initialQueueItems
  })
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [previewItem, setPreviewItem] = useState(null)

  function setView(next) {
    setSearchParams(next === 'list' ? {} : { view: next })
  }

  function handleEdit(id) {
    navigate(`/approval-queue/${id}/edit?view=${view}`)
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleToggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleToggleAll(ids) {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      return allSelected ? new Set() : new Set(ids)
    })
  }

  function handleBatchApprove() {
    setItems((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, status: 'PRODUCTION' } : item,
      ),
    )
    setSelectedIds(new Set())
  }

  function handleApprove(id) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'PRODUCTION' } : item)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Approval Queue</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              24 Ready for Review
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              12 Flagged
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                view === 'list' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'
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
                view === 'grid' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'
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
            disabled={selectedIds.size === 0}
            className="flex items-center gap-1.5 rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Batch Approve{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <ListView
          items={items}
          onPreview={setPreviewItem}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      ) : (
        <GridView items={items} onPreview={setPreviewItem} onEdit={handleEdit} onApprove={handleApprove} />
      )}

      {previewItem && (
        <PostPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  )
}
