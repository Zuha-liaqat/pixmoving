import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { curationInsights } from '../data/queueItems'
import { getQueueItemById, updateGeneratedPost } from '../data/posts'

const channelMeta = {
  Instagram: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
      <circle cx="12" cy="12" r="3.2" strokeWidth={2} />
      <circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  LinkedIn: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16.5 8.25a4.5 4.5 0 014.5 4.5V19h-3.75v-5.25a1.75 1.75 0 00-3.5 0V19H10V8.75h3.75v1.153A4.478 4.478 0 0116.5 8.25zM6.75 19H3V8.75h3.75V19zM4.875 6.75a1.875 1.875 0 110-3.75 1.875 1.875 0 010 3.75z"
      />
    </svg>
  ),
}

export default function EditContentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const backTo = searchParams.get('view') === 'grid' ? '/approval-queue?view=grid' : '/approval-queue'
  const item = getQueueItemById(id)

  const [caption, setCaption] = useState(item?.caption ?? '')
  const [hashtags, setHashtags] = useState(item?.hashtags ?? [])
  const [channels, setChannels] = useState(item?.channels ?? [])
  const [newTag, setNewTag] = useState('')

  if (!item) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-sm text-neutral-500">Post not found.</p>
        <button
          onClick={() => navigate(backTo)}
          className="mt-3 text-sm font-medium text-black hover:underline"
        >
          Back to Approval Queue
        </button>
      </div>
    )
  }

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, '#')
    if (clean.length > 1 && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean])
    }
  }

  function toggleChannel(name) {
    setChannels((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    )
  }

  const scoreDeg = curationInsights.score * 3.6

  function handleSave() {
    updateGeneratedPost(id, { caption, hashtags, channels })
    navigate(backTo)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Approval Queue
        </button>
        <button
          onClick={handleSave}
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: editor */}
        <div className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">Edit Content</h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-500">
              DRAFT
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              PRIMARY MEDIA
            </p>
            <div className={`relative flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 ${item.thumbClass}`}>
              <span className="select-none text-6xl font-bold text-white/70">
                {item.title?.charAt(0).toUpperCase()}
              </span>
              <button
                aria-label="Change media"
                className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-neutral-600 shadow-sm hover:text-black"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              CAPTION
            </p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-neutral-400">
                HASHTAGS
              </p>
              <span className="text-xs text-neutral-400">{hashtags.length}/30 used</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
                >
                  {tag}
                  <button
                    onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                    aria-label={`Remove ${tag}`}
                    className="text-neutral-400 hover:text-black"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addTag(newTag)
                  setNewTag('')
                }}
                className="flex items-center"
              >
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="w-20 rounded-full border border-dashed border-neutral-300 px-2 py-1 text-xs outline-none focus:border-black"
                />
                <button
                  type="submit"
                  aria-label="Add hashtag"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              CHANNELS
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(channelMeta).map((name) => {
                const active = channels.includes(name)
                return (
                  <button
                    key={name}
                    onClick={() => toggleChannel(name)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {channelMeta[name]}
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: curation + suggestions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 text-center">
            <p className="mb-4 text-xs font-semibold tracking-widest text-neutral-400">
              CURATION SCORE
            </p>
            <div
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#000 ${scoreDeg}deg, #e5e5e5 ${scoreDeg}deg)`,
              }}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl font-bold text-black">
                {curationInsights.score}
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-black">{curationInsights.label}</p>
            <p className="mt-1 text-xs text-neutral-400">{curationInsights.note}</p>
          </div>

          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-neutral-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
              AI SUGGESTIONS
            </p>

            <div className="rounded-lg bg-neutral-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                  HOOK OPTIMIZATION
                </p>
                <button
                  onClick={() => setCaption(`${curationInsights.hookSuggestion} ${caption}`)}
                  aria-label="Use suggestion"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
              <p className="text-sm italic text-neutral-600">
                "{curationInsights.hookSuggestion}"
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                  RELEVANT TAGS
                </p>
                <button
                  onClick={() => curationInsights.relevantTags.forEach(addTag)}
                  aria-label="Add suggested tags"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {curationInsights.relevantTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs text-neutral-600 ring-1 ring-neutral-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="mb-1 text-[10px] font-semibold tracking-widest text-neutral-400">
                TIME OPTIMIZATION
              </p>
              <p className="text-sm text-sky-600">
                Optimal posting time: {curationInsights.optimalTime}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-black p-5 text-white">
            <p className="text-sm font-semibold">Boost Strategy</p>
            <p className="mt-1 text-xs text-neutral-300">
              This content is eligible for a $50 promotion trial.
            </p>
            <button className="mt-3 w-full rounded-md border border-white/30 py-2 text-xs font-semibold tracking-wide hover:bg-white/10">
              CONFIGURE AD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
