export const platformLabels = { linkedin: 'LinkedIn', instagram: 'Instagram' }

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
  const platform = platformLabels[raw.platform] ?? raw.platform ?? 'LinkedIn'
  const hashtags =
    typeof raw.hashtags === 'string'
      ? raw.hashtags.split(/\s+/).filter(Boolean)
      : Array.isArray(raw.hashtags)
        ? raw.hashtags
        : []
  const score = raw.ai_safety_score ?? 0

  return {
    id: raw.id,
    title: raw.title || raw.headline || raw.prompt || 'Untitled post',
    headline: raw.headline,
    subtitle: raw.subtitle,
    platform,
    thumbClass: fallbackThumbClasses[index % fallbackThumbClasses.length],
    score,
    status: score < 60 ? 'FLAGGED' : 'STAGING',
    timestamp: formatTimestamp(raw.created_at),
    language: raw.language ?? '',
    caption: raw.caption ?? '',
    hashtags,
    channels: [platform],
    images: raw.image_url ? [{ name: raw.title || 'image', dataUri: raw.image_url }] : [],
  }
}
