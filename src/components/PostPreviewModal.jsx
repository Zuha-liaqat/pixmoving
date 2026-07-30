import { useState } from 'react'

function getInitials(title) {
  const letters = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
  return letters.join('') || '?'
}

const HeartIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

const CommentIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M21 12c0 4.418-4.03 8-9 8-1.18 0-2.304-.203-3.328-.568L3 21l1.395-4.185C3.512 15.629 3 13.87 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const ShareIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
    />
  </svg>
)

const BookmarkIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
)

function LinkedInPreview({ item, initials }) {
  return (
    <div>
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-xs font-bold text-white">
          PM
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-black">PIX Moving</p>
          <p className="text-[10px] text-neutral-400">12,481 followers · 2h</p>
        </div>
      </div>
      <p className="whitespace-pre-line px-3 text-xs leading-relaxed text-neutral-800">{item.caption}</p>
      <p className="mt-1 px-3 pb-3 text-xs text-sky-700">{item.hashtags.join(' ')}</p>
      <div className={`flex h-48 items-center justify-center text-3xl font-bold text-white/80 ${item.thumbClass}`}>
        {initials}
      </div>
      <div className="flex items-center justify-around border-t border-neutral-100 px-2 py-2 text-[10px] font-medium text-neutral-500">
        <span className="flex items-center gap-1">
          <HeartIcon className="h-4 w-4" /> Like
        </span>
        <span className="flex items-center gap-1">
          <CommentIcon className="h-4 w-4" /> Comment
        </span>
        <span className="flex items-center gap-1">
          <ShareIcon className="h-4 w-4" /> Share
        </span>
      </div>
    </div>
  )
}

function InstagramPreview({ item, initials }) {
  return (
    <div>
      <div className="flex items-center gap-2 p-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-[10px] font-bold text-white">
          PM
        </div>
        <p className="text-xs font-semibold text-black">pixmoving</p>
        <svg className="ml-auto h-4 w-4 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
      <div className={`flex aspect-square items-center justify-center text-4xl font-bold text-white/80 ${item.thumbClass}`}>
        {initials}
      </div>
      <div className="flex items-center gap-3 px-2.5 pt-2">
        <HeartIcon className="h-5 w-5 text-black" />
        <CommentIcon className="h-5 w-5 text-black" />
        <ShareIcon className="h-5 w-5 text-black" />
        <BookmarkIcon className="ml-auto h-5 w-5 text-black" />
      </div>
      <p className="px-2.5 py-2 text-xs text-neutral-800">
        <span className="font-semibold">pixmoving</span> {item.caption}{' '}
        <span className="text-sky-700">{item.hashtags.join(' ')}</span>
      </p>
    </div>
  )
}

function TwitterPreview({ item, initials }) {
  return (
    <div className="flex gap-2 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
        PM
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-black">
          <span className="font-bold">PIX Moving</span>{' '}
          <span className="text-neutral-400">@pixmoving · 2h</span>
        </p>
        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-neutral-800">
          {item.caption} <span className="text-sky-600">{item.hashtags.join(' ')}</span>
        </p>
        <div className={`mt-2 flex h-36 items-center justify-center rounded-xl text-2xl font-bold text-white/80 ${item.thumbClass}`}>
          {initials}
        </div>
        <div className="mt-2 flex max-w-[220px] items-center justify-between text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <CommentIcon className="h-3.5 w-3.5" /> 12
          </span>
          <span className="flex items-center gap-1">
            <ShareIcon className="h-3.5 w-3.5" /> 34
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon className="h-3.5 w-3.5" /> 210
          </span>
        </div>
      </div>
    </div>
  )
}

const platforms = [
  { key: 'LinkedIn', label: 'LinkedIn', Component: LinkedInPreview },
  { key: 'Instagram', label: 'Instagram', Component: InstagramPreview },
  { key: 'Twitter', label: 'X / Twitter', Component: TwitterPreview },
]

export default function PostPreviewModal({ item, onClose }) {
  const defaultTab = platforms.some((p) => p.key === item.platform) ? item.platform : 'LinkedIn'
  const [tab, setTab] = useState(defaultTab)
  const [device, setDevice] = useState('mobile')
  const initials = getInitials(item.title)
  const Active = platforms.find((p) => p.key === tab).Component

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full rounded-xl bg-white p-4 shadow-2xl transition-all ${device === 'web' ? 'max-w-lg' : 'max-w-sm'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-black">Preview</h3>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-black">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-3 flex items-center gap-1 rounded-md bg-neutral-100 p-1">
          {platforms.map((p) => (
            <button
              key={p.key}
              onClick={() => setTab(p.key)}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                tab === p.key ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-center gap-1 rounded-md bg-neutral-100 p-1">
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
              device === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3"
              />
            </svg>
            Mobile
          </button>
          <button
            onClick={() => setDevice('web')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
              device === 'web' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
            Web
          </button>
        </div>

        {device === 'mobile' ? (
          <div className="mx-auto w-64 rounded-[1.75rem] border-4 border-black bg-black shadow-xl">
            <div className="relative h-72 overflow-y-auto rounded-[1.2rem] bg-white">
              <div className="sticky top-0 z-10 flex justify-center bg-white pb-1 pt-1.5">
                <div className="h-4 w-20 rounded-full bg-black" />
              </div>
              <Active item={item} initials={initials} />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full overflow-hidden rounded-lg border border-neutral-200 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="ml-3 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-neutral-400">
                {tab === 'Twitter' ? 'x.com' : `${tab.toLowerCase()}.com`}/pixmoving
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto bg-white">
              <Active item={item} initials={initials} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
