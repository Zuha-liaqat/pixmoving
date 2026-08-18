const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchLibraryItems() {
  const res = await fetch(`${API_BASE_URL}/library/`, {
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Failed to load library items (${res.status})`)
  }

  return res.json()
}

async function extractErrorMessage(res, fallback) {
  try {
    const data = await res.json()
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).join(', ') || fallback
    }
    if (typeof data?.detail === 'string') return data.detail
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return fallback
}

export async function createLibraryItem({ name, type, mediaType, media }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('type', type)
  formData.append('media_type', mediaType)
  formData.append('media', media)

  const res = await fetch(`${API_BASE_URL}/library/`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to upload asset (${res.status})`),
    )
  }

  return res.json()
}

export async function updateLibraryItem(libraryId, { name, type, mediaType, media }) {
  const formData = new FormData()
  if (name !== undefined) formData.append('name', name)
  if (type !== undefined) formData.append('type', type)
  if (media) {
    formData.append('media_type', mediaType)
    formData.append('media', media)
  }

  const res = await fetch(`${API_BASE_URL}/library/${libraryId}`, {
    method: 'PUT',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to update asset (${res.status})`),
    )
  }

  return res.json()
}

export async function generatePost({
  prompt,
  type,
  language,
  tone,
  date,
  startTime,
  endTime,
  files,
}) {
  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('type', type)
  formData.append('language', language)
  formData.append('tone', tone)
  if (date) formData.append('date', date)
  if (startTime) formData.append('start_time', startTime)
  if (endTime) formData.append('end_time', endTime)
  formData.append('auto_publish', 'false')
  ;(files ?? []).forEach((file) => formData.append('files', file))

  const res = await fetch(`${API_BASE_URL}/generate-post`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to generate post (${res.status})`),
    )
  }

  return res.json()
}

export async function fetchGeneratedPosts() {
  const res = await fetch(`${API_BASE_URL}/generate-post`, {
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Failed to load posts (${res.status})`)
  }

  return res.json()
}

export async function fetchGeneratedPost(postId) {
  const res = await fetch(`${API_BASE_URL}/generate-post/${postId}`, {
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to load post (${res.status})`),
    )
  }

  return res.json()
}

export async function updateGeneratedPost(postId, updates) {
  const res = await fetch(`${API_BASE_URL}/generate-post/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to update post (${res.status})`),
    )
  }

  return res.json()
}

export async function deleteGeneratedPost(postId) {
  const res = await fetch(`${API_BASE_URL}/generate-post/${postId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to delete post (${res.status})`),
    )
  }

  return res.json()
}

export async function deleteLibraryItem(libraryId) {
  const res = await fetch(`${API_BASE_URL}/library/${libraryId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to delete asset (${res.status})`),
    )
  }

  return res.json()
}
