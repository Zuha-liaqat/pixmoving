export const platformLabels = { linkedin: 'LinkedIn', instagram: 'Instagram', twitter: 'Twitter' }

export const fallbackThumbClasses = [
  'bg-gradient-to-br from-violet-200 to-fuchsia-400',
  'bg-gradient-to-br from-sky-200 to-slate-400',
  'bg-gradient-to-br from-emerald-200 to-teal-400',
  'bg-gradient-to-br from-amber-200 to-orange-400',
]

export function formatTimestamp(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mapApiPost(raw, index = 0) {
  const platforms = String(raw.platform ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => platformLabels[p] ?? p)
  const platform = platforms[0] ?? 'LinkedIn'
  const hashtags =
    typeof raw.hashtags === 'string'
      ? raw.hashtags.split(/\s+/).filter(Boolean)
      : Array.isArray(raw.hashtags)
        ? raw.hashtags
        : []
  const score = raw.ai_safety_score ?? 0
  const status = raw.is_approved ? 'PRODUCTION' : score < 60 ? 'FLAGGED' : 'STAGING'

  return {
    id: raw.id,
    title: raw.title || raw.headline || raw.prompt || 'Untitled post',
    headline: raw.headline,
    subtitle: raw.subtitle,
    platform,
    platforms: platforms.length ? platforms : [platform],
    thumbClass: fallbackThumbClasses[index % fallbackThumbClasses.length],
    score,
    status,
    isApproved: Boolean(raw.is_approved),
    isPosted: Boolean(raw.is_posted),
    timestamp: formatTimestamp(raw.created_at),
    language: raw.language ?? '',
    tone: raw.tone ?? '',
    date: raw.date ?? '',
    startTime: raw.start_time ?? '',
    endTime: raw.end_time ?? '',
    caption: raw.caption ?? '',
    hashtags,
    channels: platforms.length ? platforms : [platform],
    images: raw.image_url ? [{ name: raw.title || 'image', dataUri: raw.image_url }] : [],
  }
}
